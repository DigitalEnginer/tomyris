import time
from datetime import datetime

# Importing your ready-made functions from adjacent files
from upload_to_crm import upload_orders
from sync_to_supabase import sync_orders
from telegram_alert import check_large_orders


def start_system():
    print("🚀 Initializing Tomyris AI system...")

    # PHASE 1: One-time execution
    print("\n📦 PHASE 1: Uploading initial orders to CRM (runs once)...")
    try:
        upload_orders()
        print("✅ Phase 1 completed.")
    except Exception as e:
        print(f"❌ Error during initial upload: {e}")
        print("⚠️ Continuing execution (orders might have been uploaded already)...")

    # PHASE 2: Background worker loop
    print("\n🔄 PHASE 2: Starting background worker (Sync + Notifications)...")
    while True:
        print("-" * 40)
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ⏳ Starting update check...")

        try:
            # 1. Fetch data from CRM and push to database for the dashboard
            sync_orders()

            # 2. Check for new high-value orders (> 50,000) for Telegram alerts
            check_large_orders()

        except Exception as e:
            print(f"❌ Error during background update: {e}")

        # Pause before the next check. 60 seconds is optimal for testing.
        print(f"[{datetime.now().strftime('%H:%M:%S')}] 💤 Update finished. Waiting for 60 seconds...")
        time.sleep(60)


if __name__ == "__main__":
    start_system()