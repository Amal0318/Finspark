import os
import json
import asyncio
from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
from app.utils.logger import logger
from app.core.database import AsyncSessionLocal
from app.models.transaction import BankingTransaction
from app.models.alert import CorrelatedAlert
from sqlalchemy.future import select
from app.services.telemetry_service import TelemetryService
from app.services.ml_service import MLService

# Global producer and consumer references
_producer = None
_consumer = None
_consumer_running = False

async def get_kafka_producer():
    global _producer
    if _producer is None:
        bootstrap_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
        logger.info(f"Connecting AIOKafkaProducer to: {bootstrap_servers}")
        # Retry loop to support container start lag
        for attempt in range(10):
            try:
                _producer = AIOKafkaProducer(bootstrap_servers=bootstrap_servers)
                await _producer.start()
                logger.info("Kafka Producer started successfully.")
                break
            except Exception as e:
                logger.warning(f"Kafka Producer connection attempt {attempt+1} failed: {e}. Retrying in 3s...")
                await asyncio.sleep(3)
        if _producer is None:
            logger.error("Failed to initialize Kafka Producer after multiple attempts.")
    return _producer

async def send_transaction_event(payload: dict):
    try:
        producer = await get_kafka_producer()
        if producer:
            msg_bytes = json.dumps(payload).encode('utf-8')
            await producer.send_and_wait("banking-transactions", msg_bytes)
            logger.info("[KAFKA PRODUCER] Published transaction event to topic: banking-transactions")
        else:
            logger.error("[KAFKA PRODUCER] Kafka producer is unavailable. Message dropped.")
    except Exception as e:
        logger.error(f"[KAFKA PRODUCER] Error publishing message to topic: {e}")

async def start_kafka_consumer():
    global _consumer, _consumer_running
    bootstrap_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
    logger.info(f"Initializing AIOKafkaConsumer subscribing to: {bootstrap_servers}")
    
    # Retry loop to support broker startup latency
    for attempt in range(15):
        try:
            _consumer = AIOKafkaConsumer(
                "banking-transactions",
                bootstrap_servers=bootstrap_servers,
                group_id="cybersense-group",
                auto_offset_reset="earliest"
            )
            await _consumer.start()
            _consumer_running = True
            logger.info("Kafka Consumer started and subscribed to 'banking-transactions'.")
            break
        except Exception as e:
            logger.warning(f"Kafka Consumer connection attempt {attempt+1} failed: {e}. Retrying in 3s...")
            await asyncio.sleep(3)

    if not _consumer_running:
        logger.error("Kafka Consumer failed to start after multiple attempts. Background worker aborted.")
        return

    try:
        async for msg in _consumer:
            if not _consumer_running:
                break
            try:
                payload = json.loads(msg.value.decode('utf-8'))
                logger.info(f"[KAFKA CONSUMER] Read transaction event payload: {payload}")
                
                # Open an isolated DB session context
                async with AsyncSessionLocal() as db:
                    await process_transaction_event(db, payload)
            except Exception as e:
                logger.error(f"[KAFKA CONSUMER] Error processing message payload: {e}")
    except asyncio.CancelledError:
        logger.info("[KAFKA CONSUMER] Consumer worker loop cancelled.")
    finally:
        await stop_kafka_consumer()

async def stop_kafka_consumer():
    global _consumer, _consumer_running
    _consumer_running = False
    if _consumer:
        try:
            await _consumer.stop()
            logger.info("Kafka Consumer service stopped.")
        except Exception as e:
            logger.error(f"Error shutting down Kafka Consumer: {e}")

async def stop_kafka_producer():
    global _producer
    if _producer:
        try:
            await _producer.stop()
            logger.info("Kafka Producer service stopped.")
        except Exception as e:
            logger.error(f"Error shutting down Kafka Producer: {e}")

async def process_transaction_event(db, payload: dict):
    # 1. Check if transaction already exists in the database
    tx_id = payload.get("id")
    db_obj = None
    if tx_id:
        result = await db.execute(
            select(BankingTransaction).where(BankingTransaction.id == tx_id)
        )
        db_obj = result.scalars().first()
        
    if db_obj is None:
        db_obj = BankingTransaction(
            sender_account=payload.get("sender_account"),
            receiver_account=payload.get("receiver_account"),
            amount=payload.get("amount"),
            currency=payload.get("currency", "USD"),
            transaction_type=payload.get("transaction_type"),
            location=payload.get("location"),
            ip_address=payload.get("ip_address"),
            device_fingerprint=payload.get("device_fingerprint"),
            status=payload.get("status", "SUCCESS"),
            is_flagged=False
        )
        db.add(db_obj)
        await db.flush() # Flush to populate db_obj.id and db_obj.timestamp
    else:
        db_obj.status = payload.get("status", db_obj.status)
    
    # 2. Correlate with telemetry
    concurrent_logs = await TelemetryService.get_concurrent_threats(
        db=db,
        ip_address=db_obj.ip_address,
        tx_time=db_obj.timestamp,
        window_minutes=10
    )
    
    # 3. Request ML risk prediction
    tx_dict = {
        "amount": db_obj.amount,
        "timestamp": db_obj.timestamp.isoformat() if db_obj.timestamp else None
    }
    logs_dicts = [
        {"severity": log.severity, "event_type": log.event_type}
        for log in concurrent_logs
    ]
    
    risk_score = MLService.evaluate_transaction_risk(tx_dict, logs_dicts)
    
    # 4. Save alert if score is abnormal or concurrent threats exist
    if risk_score >= 60.0 or len(concurrent_logs) > 0:
        db_obj.is_flagged = True
        
        highest_sev_log_id = None
        if concurrent_logs:
            sev_order = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}
            sorted_logs = sorted(
                concurrent_logs, 
                key=lambda x: sev_order.get(x.severity.upper(), 0), 
                reverse=True
            )
            highest_sev_log_id = sorted_logs[0].id
            
        reason = ""
        if len(concurrent_logs) > 0:
            reason = f"Correlated cybersecurity threat ({concurrent_logs[0].event_type}) detected from transaction IP. "
        if risk_score >= 60.0:
            reason += f"ML Anomaly Risk: {risk_score}%."
        else:
            reason += "Rules engine flag."
            
        alert_obj = CorrelatedAlert(
            telemetry_log_id=highest_sev_log_id,
            banking_transaction_id=db_obj.id,
            correlation_reason=reason,
            risk_score=risk_score,
            status="OPEN",
            notes=f"Correlated transaction amount ${db_obj.amount:.2f} with concurrent security events."
        )
        db.add(alert_obj)
        
    await db.commit()
    await db.refresh(db_obj)
    logger.info(f"[KAFKA CONSUMER] Successfully processed transaction ID {db_obj.id} (Flagged: {db_obj.is_flagged}, Risk: {risk_score}%)")
