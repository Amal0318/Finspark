import os
import json
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
import google.generativeai as genai
from app.models.threat_report import ThreatReport
from app.utils.logger import logger

class LLMService:
    """
    Integrates the Google Gemini API to analyze prediction parameters,
    behavioral anomalies, and cyber alerts to generate natural language explanations.
    """
    
    @classmethod
    def _get_api_key(cls) -> str:
        """Retrieves Gemini API Key from environment or fallback configs."""
        return os.environ.get("GEMINI_API_KEY") or ""

    @classmethod
    async def explain_threat(
        cls, 
        db: AsyncSession,
        prediction_result: Dict[str, Any], 
        features: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Submits threat telemetry and model metrics to Gemini to construct
        an incident report, root cause analysis, and triage actions.
        Saves the threat report inside the PostgreSQL database.
        """
        api_key = cls._get_api_key()
        
        prompt = f"""
        You are an expert Cybersecurity Incident Responder and Bank Fraud Analyst.
        Analyze this security prediction event and feature vector:
        
        Prediction Result: {json.dumps(prediction_result)}
        Active Features: {json.dumps(features)}
        
        Generate a structured threat report. Respond in raw JSON format (no markdown blocks, no leading/trailing text) containing exactly these keys:
        - "executive_summary": A concise summary of the active risk.
        - "root_cause": Identification of how this threat originated (e.g., credential leakage, active scanning).
        - "timeline": Proposed timeline of events.
        - "reason": Why the AI model flagged this.
        - "confidence": Estimated confidence rating (0-100) in this analysis.
        - "mitre_attack_mapping": The relevant MITRE ATT&CK tactic/technique.
        - "recommended_actions": A list of specific security tasks to mitigate this threat.
        - "business_impact": The potential financial or operational impact.
        - "next_steps": Immediate next steps for the SOC team.
        """

        report = None
        if api_key:
            try:
                logger.info("Connecting to Google Gemini API for threat narration...")
                genai.configure(api_key=api_key)
                # Use gemini-1.5-flash as default fast model
                model = genai.GenerativeModel("gemini-1.5-flash")
                response = model.generate_content(prompt)
                
                # Attempt to extract JSON from markdown wrappers if model output contains it
                text = response.text.strip()
                if text.startswith("```json"):
                    text = text.split("```json", 1)[1].rsplit("```", 1)[0].strip()
                elif text.startswith("```"):
                    text = text.split("```", 1)[1].rsplit("```", 1)[0].strip()
                
                report = json.loads(text)
                logger.info("Successfully received narration response from Gemini API.")
            except Exception as e:
                logger.warning(f"Error calling Gemini API: {e}. Falling back to local explainer engine.")
        
        # Local fallback narration engine if API fails or key is missing
        if not report:
            report = cls._generate_fallback_report(prediction_result, features)

        # Severity classification mapping
        risk_level = prediction_result.get("output_label", "MEDIUM").upper()
        if risk_level not in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]:
            risk_level = "MEDIUM"

        # Store report in PostgreSQL
        try:
            logger.info("Persisting threat report to PostgreSQL database...")
            report_log = ThreatReport(
                source="CyberSense_LLM",
                title=report.get("executive_summary", "Threat Alert"),
                description=report.get("reason", ""),
                severity=risk_level,
                indicators_json=report
            )
            db.add(report_log)
            await db.commit()
            await db.refresh(report_log)
            report["report_id"] = report_log.id
            logger.info(f"Threat report successfully persisted with ID: {report_log.id}")
        except Exception as db_err:
            logger.error(f"Failed to persist threat report to database: {db_err}")
            await db.rollback()

        return report

    @classmethod
    def _generate_fallback_report(cls, prediction_result: Dict[str, Any], features: Dict[str, Any]) -> Dict[str, Any]:
        """
        A rule-based backup narration engine that generates structured reports
        when Gemini credentials are not supplied.
        """
        logger.info("Generating security narration via local heuristics...")
        risk_score = prediction_result.get("risk_score", 50.0)
        risk_level = prediction_result.get("output_label", "Medium")
        
        is_attack = features.get("network_attack_detected", 0) == 1
        is_new_device = features.get("is_new_device", 0) == 1
        failed_logins = features.get("failed_login_count", 0)
        vpn = features.get("vpn_detected", 0) == 1
        amount = features.get("transaction_amount", 0.0)

        # Root cause builder
        if is_attack:
            summary = "Active firewall/intrusion exploit logged from client's network gateway."
            root_cause = "Port scanning, brute-forcing, or DDoS telemetry logged at the source IP address."
            actions = ["Block IP", "Notify SOC", "Force MFA"]
        elif amount > 5000.0 and vpn:
            summary = "Outlier transaction processed over an active VPN endpoint."
            root_cause = "Session hijack attempt or geographic location spoofing via proxy tunnels."
            actions = ["Freeze Account", "Force MFA", "Notify SOC"]
        elif failed_logins >= 3:
            summary = "Brute-force credential stuffing attempt followed by account actions."
            root_cause = "Repeated invalid credentials entries, suggesting a dictionary attack."
            actions = ["Terminate Session", "Freeze Account", "Force MFA"]
        else:
            summary = f"Event flagged with {risk_level} threat level (Risk score: {risk_score}%)."
            root_cause = "Slight deviation in normal transaction velocities or workstation hours."
            actions = ["Notify SOC", "Force MFA"]

        report = {
            "executive_summary": summary,
            "root_cause": root_cause,
            "timeline": f"1. Initial deviation detected at {prediction_result.get('timestamp', 'T0')}. 2. Threshold breached.",
            "reason": f"Fraud likelihood estimated at {prediction_result.get('fraud_probability', 0.0)}%. Anomaly checks indicate {prediction_result.get('anomaly_score', 0.0)}% behavioral deviation.",
            "confidence": 85.0 if risk_level in ["Critical", "High"] else 70.0,
            "mitre_attack_mapping": "T1078 Valid Accounts" if failed_logins > 0 else "T1486 Data Encrypted for Impact",
            "recommended_actions": actions,
            "business_impact": f"Potential loss of ${amount:,.2f} and reputational damage.",
            "next_steps": "Investigate logs and confirm with the customer."
        }
        return report
