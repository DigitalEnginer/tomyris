import os
import requests
from dotenv import load_dotenv

load_dotenv()

RETAILCRM_URL = os.getenv("RETAILCRM_URL")
RETAILCRM_API_KEY = os.getenv("RETAILCRM_API_KEY")
TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

PROCESSED_ORDERS_FILE = "processed_orders.txt"


def load_processed_orders():
    if not os.path.exists(PROCESSED_ORDERS_FILE):
        return set()
    with open(PROCESSED_ORDERS_FILE, "r") as f:
        return set(line.strip() for line in f)


def save_processed_order(order_id):
    with open(PROCESSED_ORDERS_FILE, "a") as f:
        f.write(f"{order_id}\n")


def send_telegram_message(text):
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": text, "parse_mode": "HTML"}
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            print("✅ SUCCESS: Notification sent to Telegram!")
        else:
            print(f"❌ Send error: {response.text}")
    except Exception as e:
        print(f"❌ Connection error: {e}")


def check_large_orders():
    print("Checking for new VIP orders...")
    crm_endpoint = f"{RETAILCRM_URL}/api/v5/orders"
    # Добавили limit=100, чтобы скрипт видел больше последних заказов
    params = {"apiKey": RETAILCRM_API_KEY, "limit": 100}

    try:
        response = requests.get(crm_endpoint, params=params)
        orders = response.json().get("orders", [])

        large_orders = [o for o in orders if float(o.get("totalSumm", 0)) >= 50000]

        if not large_orders:
            print("No large orders found.")
            return

        processed_orders = load_processed_orders()
        new_notifications_count = 0

        for order in large_orders:
            order_id = str(order.get("id"))

            if order_id in processed_orders:
                continue

            total_sum = order.get("totalSumm", 0)
            first_name = order.get("firstName", "No name")

            message = (
                f"🚨 <b>New VIP Order!</b>\n\n"
                f"📦 <b>Order ID:</b> #{order_id}\n"
                f"👤 <b>Client:</b> {first_name}\n"
                f"💰 <b>Total:</b> {total_sum} ₸"
            )

            send_telegram_message(message)
            save_processed_order(order_id)
            new_notifications_count += 1

        if new_notifications_count == 0:
            print("No NEW large orders to notify about.")

    except Exception as e:
        print(f"Error fetching orders: {e}")


if __name__ == "__main__":
    check_large_orders()