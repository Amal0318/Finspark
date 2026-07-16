import asyncio
import uuid
from app.core.database import AsyncSessionLocal
from app.models.incident import Incident

async def seed_incidents():
    async with AsyncSessionLocal() as session:
        for i in range(5):
            new_incident = Incident(
                incident_id=f"INC-{uuid.uuid4().hex[:8].upper()}",
                user_id=f"CUST-00{i}",
                transaction_id=f"TX-HIGH-{i}",
                source_ip="10.0.0.5",
                destination_ip="Unknown",
                fraud_probability=0.85 + (i * 0.02),
                behaviour_score=0.90 + (i * 0.01),
                threat_score=0.88,
                risk_score=85.0 + i,
                severity="Critical",
                recommendation="Investigate and execute mitigation protocols.",
                status="Open",
                resolved=False
            )
            session.add(new_incident)
        await session.commit()
        print("Mock incidents seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed_incidents())
