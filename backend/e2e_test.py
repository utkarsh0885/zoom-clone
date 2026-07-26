import requests
import time

BASE_URL = "http://localhost:8000"

print("1. Creating Instant Meeting...")
res = requests.post(f"{BASE_URL}/meetings/instant")
data = res.json()
meeting_id = data["data"]["meeting_id"]
print(f"Created meeting: {meeting_id}")

print("2. Joining Meeting...")
res = requests.post(f"{BASE_URL}/meetings/join", json={"meeting_id": meeting_id, "name": "Host"})
print(f"Joined meeting.")

print("3. Leaving/Ending Meeting...")
res = requests.post(f"{BASE_URL}/meetings/{meeting_id}/end")
print(f"Ended meeting.")

print("4. Fetching Recent Meetings...")
res = requests.get(f"{BASE_URL}/meetings/recent")
recent_meetings = res.json()["data"]
found = any(m["meeting_id"] == meeting_id for m in recent_meetings)

if found:
    print(f"SUCCESS: Meeting {meeting_id} found in Recent Meetings!")
else:
    print(f"FAILED: Meeting {meeting_id} NOT found in Recent Meetings!")
