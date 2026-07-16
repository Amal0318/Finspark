import asyncio
from app.core.database import AsyncSessionLocal
from app.services.prediction_service import PredictionService

async def seed_data():
    async with AsyncSessionLocal() as session:
        for i in range(15):
            await PredictionService.classify_transaction(
                db=session,
                transaction={"amount": 15.0 + i, "transaction_id": f"TX-NORMAL-{i}", "customer_id": f"CUST-00{i}"},
                concurrent_logs=[{"event_type": "LOGIN_SUCCESS"}]
            )
            
        for i in range(10):
            await PredictionService.classify_transaction(
                db=session,
                transaction={"amount": 5000.0 + (i * 100), "transaction_id": f"TX-HIGH-{i}", "device_changed": 1, "vpn_detected": 1},
                concurrent_logs=[{"event_type": "LOGIN_FAIL"}, {"event_type": "LOGIN_FAIL"}, {"event_type": "LOGIN_FAIL"}]
            )
        
        print("Mock predictions and incidents seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
