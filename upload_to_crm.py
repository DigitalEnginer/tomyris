import os
import json
import time
import requests
from dotenv import load_dotenv

load_dotenv()

RETAILCRM_URL = os.getenv("RETAILCRM_URL")
RETAILCRM_API_KEY = os.getenv("RETAILCRM_API_KEY")
UPLOAD_FLAG_FILE = ".orders_uploaded"  # Файл-метка


def upload_orders():
    # ПРОВЕРКА: Если файл-метка существует, выходим из функции
    if os.path.exists(UPLOAD_FLAG_FILE):
        print("ℹ️ Orders already uploaded to CRM previously. Skipping Phase 1.")
        return

    print("📦 Starting initial orders upload to RetailCRM...")
    try:
        with open("mock_orders.json", "r", encoding="utf-8") as file:
            orders = json.load(file)
    except FileNotFoundError:
        print("❌ Error: mock_orders.json not found.")
        return

    api_endpoint = f"{RETAILCRM_URL}/api/v5/orders/create"
    success_count = 0

    for order in orders:
        payload = {
            "apiKey": RETAILCRM_API_KEY,
            "order": json.dumps(order)
        }

        try:
            response = requests.post(api_endpoint, data=payload)
            if response.status_code in [200, 201] and response.json().get("success"):
                success_count += 1
            else:
                print(f"❌ Error uploading one of the orders: {response.text}")
        except Exception as e:
            print(f"❌ Request failed: {e}")

        time.sleep(0.2)  # Небольшая пауза, чтобы не спамить API

    # После успешной загрузки всех заказов создаем файл-метку
    if success_count > 0:
        with open(UPLOAD_FLAG_FILE, "w") as f:
            f.write("done")
        print(f"✅ Successfully uploaded {success_count} orders. Flag file created.")


if __name__ == "__main__":
    upload_orders()