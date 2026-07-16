from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer
from sqlalchemy.sql import func
from app.core.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, unique=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(String, index=True)
    transaction_id = Column(String, index=True)
    source_ip = Column(String)
    destination_ip = Column(String)
    fraud_probability = Column(Float)
    behaviour_score = Column(Float)
    threat_score = Column(Float)
    risk_score = Column(Float)
    severity = Column(String)
    recommendation = Column(String)
    status = Column(String, default="Open")
    resolved = Column(Boolean, default=False)
