import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict, Field


class ThreatReportBase(BaseModel):
    source: str = Field(..., max_length=100, examples=["AlienVault"])
    title: str = Field(..., max_length=255, examples=["Malicious IP Cluster Active"])
    description: Optional[str] = Field(None, examples=["Cluster of IPs active in port scanning activity"])
    severity: str = Field("MEDIUM", max_length=15, examples=["HIGH"]) # LOW, MEDIUM, HIGH, CRITICAL
    indicators_json: Dict[str, Any] = Field(default_factory=dict, examples=[{"ips": ["192.168.1.99"], "domains": []}])


class ThreatReportCreate(ThreatReportBase):
    pass


class ThreatReport(ThreatReportBase):
    id: int
    timestamp: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
