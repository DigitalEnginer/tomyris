import os
import requests
from dotenv import load_dotenv

load_dotenv()

RETAILCRM_URL = os.getenv("RETAILCRM_URL")
RETAILCRM_API_KEY = os.getenv("RETAILCRM_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


def sync_orders():
    print("Fetching orders from RetailCRM...")

    # 1. Fetch orders from RetailCRM
    crm_endpoint = f"{RETAILCRM_URL}/api/v5/orders"
    params = {"apiKey": RETAILCRM_API_KEY}

    try:
        response = requests.get(crm_endpoint, params=params)
        response_data = response.json()

        if not response.ok or not response_data.get("success"):
            print(f"Error fetching CRM orders: {response_data.get('errorMsg')}")
            return

        orders = response_data.get("orders", [])
        print(f"Found {len(orders)} orders in CRM. Syncing to database...")

    except Exception as e:
        print(f"Failed to connect to RetailCRM: {e}")
        return

    # 2. Prepare headers for Supabase API
    supabase_endpoint = f"{SUPABASE_URL}/rest/v1/orders"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"  # This allows updating existing records
    }

    # 3. Process and send each order to Supabase
    for order in orders:
        # Map CRM fields to our database columns
        db_record = {
            "id": order.get("id"),
            "first_name": order.get("firstName", ""),
            "phone": order.get("phone", ""),
            "total_sum": order.get("totalSumm", 0),
            "status": order.get("status", "new")
        }

        try:
            res = requests.post(supabase_endpoint, json=db_record, headers=headers)
            if res.status_code in [200, 201, 204]:
                print(f"Successfully synced order ID {db_record['id']} to Supabase.")
            else:
                print(f"Error syncing order {db_record['id']}: {res.text}")
        except Exception as e:
            print(f"Database connection error: {e}")


if __name__ == "__main__":
    sync_orders()