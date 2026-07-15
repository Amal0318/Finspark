import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta


def make_sample_datasets():
    # Setup directories
    output_dir = os.path.join(os.path.dirname(__file__), "samples")
    os.makedirs(output_dir, exist_ok=True)
    
    # Set seed for repeatability
    np.random.seed(42)
    
    base_time = datetime.now() - timedelta(hours=24)
    ips = ["192.168.1.99", "192.168.1.100", "10.0.0.5", "10.0.0.6", "172.16.0.4"]
    users = ["usr_admin", "usr_analyst1", "usr_dev", "usr_ops"]
    accounts = ["ACC-887766", "ACC-112233", "ACC-554433", "ACC-990011"]
    
    # 1. IEEE-CIS Fraud Detection Sample
    ieee_data = {
        "TransactionID": range(1000, 1030),
        "TransactionDT": [int((base_time + timedelta(minutes=i*15)).timestamp()) for i in range(30)],
        "TransactionAmt": np.round(np.random.exponential(scale=200, size=30) + 10.0, 2),
        "ProductCD": np.random.choice(["W", "H", "C", "S"], size=30),
        "card1": np.random.randint(1000, 9999, size=30),
        "card4": np.random.choice(["visa", "mastercard", "discover"], size=30),
        "card6": np.random.choice(["credit", "debit"], size=30),
        "addr1": np.random.randint(100, 499, size=30),
        "P_emaildomain": np.random.choice(["gmail.com", "yahoo.com", "anonymous.com"], size=30),
        "ip_address": np.random.choice(ips, size=30),
        "sender_account": np.random.choice(accounts, size=30),
        "receiver_account": [f"ACC-{np.random.randint(100000, 999999)}" for _ in range(30)]
    }
    df_ieee = pd.DataFrame(ieee_data)
    # Inject some missing values (common in IEEE-CIS)
    df_ieee.loc[df_ieee["TransactionAmt"] > 400, "addr1"] = np.nan
    df_ieee.loc[df_ieee["ProductCD"] == "C", "P_emaildomain"] = np.nan
    
    df_ieee.to_csv(os.path.join(output_dir, "ieee_cis_sample.csv"), index=False)
    
    # 2. CERT Insider Threat Dataset Sample
    cert_data = {
        "id": [f"CERT-{i}" for i in range(1, 31)],
        "date": [(base_time + timedelta(minutes=i*12)).strftime("%m/%d/%Y %H:%M:%S") for i in range(30)],
        "user": np.random.choice(users, size=30),
        "pc": np.random.choice(["PC-101", "PC-202", "PC-303"], size=30),
        "ip": np.random.choice(ips, size=30),
        "activity": np.random.choice(["Logon", "Logoff", "File Copy", "Email", "HTTP"], size=30)
    }
    df_cert = pd.DataFrame(cert_data)
    df_cert.to_csv(os.path.join(output_dir, "cert_insider_sample.csv"), index=False)
    
    # 3. CICIDS2017 Netflow Traffic Sample
    cicids_data = {
        "FlowID": [f"FLOW-{i}" for i in range(1, 31)],
        "Source_IP": np.random.choice(ips, size=30),
        "Source_Port": np.random.randint(1024, 65535, size=30),
        "Destination_IP": ["10.0.0.1" for _ in range(30)],
        "Destination_Port": np.random.choice([80, 443, 8080, 22], size=30),
        "Protocol": np.random.choice([6, 17], size=30), # TCP or UDP
        "Timestamp": [(base_time + timedelta(minutes=i*10)).strftime("%d/%m/%Y %H:%M") for i in range(30)],
        "Flow_Duration": np.random.randint(1000, 1000000, size=30),
        "Total_Fwd_Packets": np.random.randint(1, 50, size=30),
        "Total_Backward_Packets": np.random.randint(1, 50, size=30),
        "Label": np.random.choice(["BENIGN", "DDoS", "PortScan", "SQL Injection"], size=30, p=[0.7, 0.1, 0.1, 0.1])
    }
    df_cicids = pd.DataFrame(cicids_data)
    df_cicids.to_csv(os.path.join(output_dir, "cicids2017_sample.csv"), index=False)
    
    # 4. Authentication Logs Sample
    auth_data = {
        "LogID": range(5000, 5030),
        "Timestamp": [(base_time + timedelta(minutes=i*14)).strftime("%Y-%m-%d %H:%M:%S") for i in range(30)],
        "Username": np.random.choice(users, size=30),
        "IP_Address": np.random.choice(ips, size=30),
        "Status": np.random.choice(["Success", "Failure"], size=30, p=[0.8, 0.2]),
        "User_Agent": np.random.choice(["Mozilla/5.0 Chrome", "Mozilla/5.0 Firefox", "curl/7.68.0"], size=30)
    }
    df_auth = pd.DataFrame(auth_data)
    df_auth.to_csv(os.path.join(output_dir, "auth_logs_sample.csv"), index=False)
    
    print(f"Generated sample datasets successfully in {output_dir}")


if __name__ == "__main__":
    make_sample_datasets()
