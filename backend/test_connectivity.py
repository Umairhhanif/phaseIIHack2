import requests
import uuid
import json

# User ID from previous logs
USER_ID = "a5cf5b9a-6bac-4c2f-94f1-cbce63732e02"
# Mock JWT token (backend only checks for presence/decoding for now, using the get_jwt_payload dependency)
# Wait, get_jwt_payload verifies content. I need a valid token or I need to bypassauth for testing?
# Actually, looking at chat.py, it uses `get_jwt_payload` which might just decode.
# Let's import the token generation if possible, or just generate a valid-looking one if the backend allows invalid sigs (it likely verifies).
# 
# Actually, better approach: The user is logged in on frontend.
# I can temporarily disable auth in chat.py for testing OR 
# I can try to generate a token using the key.

# Let's try to just hit the endpoint and see if we get a 401 or something, at least that would show in logs!
# If we don't even see the request in logs, that's the info we need.

url = f"http://localhost:8000/api/{USER_ID}/chat"
headers = {
    "Authorization": "Bearer mock-token-for-connectivity-test",
    "Content-Type": "application/json"
}
data = {
    "message": "Add a task called TestingBackend",
    "conversation_id": None
}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, json=data, headers=headers, timeout=5)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
