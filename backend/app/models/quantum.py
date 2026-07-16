from sqlalchemy import Column, String, Integer, Float
from app.core.database import Base

class QuantumConfig(Base):
    __tablename__ = "quantum_config"

    id = Column(Integer, primary_key=True, index=True)
    overall_readiness = Column(Integer)
    migration_progress = Column(Integer)
    legacy_algorithms = Column(Integer)
    compliance_score = Column(Integer)
    risk_score = Column(Float)
