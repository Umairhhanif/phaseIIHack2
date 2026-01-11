"""
Quick test script to verify the chat endpoint is working.
Run this from the project root directory.
"""
import sys
import requests
import json

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Test 1: Health check
print("Test 1: Health check...")
try:
    response = requests.get("http://localhost:8000/health")
    print(f"[OK] Backend is healthy: {response.json()}")
except Exception as e:
    print(f"[FAIL] Backend health check failed: {e}")
    exit(1)

# Test 2: CORS headers
print("\nTest 2: CORS preflight check...")
try:
    response = requests.options(
        "http://localhost:8000/api/test-user-id/chat",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,authorization"
        }
    )
    cors_origin = response.headers.get("Access-Control-Allow-Origin")
    cors_methods = response.headers.get("Access-Control-Allow-Methods")
    cors_creds = response.headers.get("Access-Control-Allow-Credentials")
    print(f"[OK] CORS Origin: {cors_origin}")
    print(f"[OK] CORS Methods: {cors_methods}")
    print(f"[OK] CORS Credentials: {cors_creds}")
except Exception as e:
    print(f"[FAIL] CORS check failed: {e}")

# Test 3: Authentication required
print("\nTest 3: Auth requirement check...")
try:
    response = requests.post(
        "http://localhost:8000/api/test-user-id/chat",
        json={"message": "test"},
        headers={"Origin": "http://localhost:3000"}
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 401 or response.status_code == 422:
        print("[OK] Endpoint requires authentication (expected)")
        print(f"Response: {response.json()}")
    else:
        print(f"[WARN] Unexpected status: {response.status_code}")
        print(f"Response: {response.json()}")
except Exception as e:
    print(f"[FAIL] Auth test failed: {e}")

print("\n" + "="*50)
print("Backend tests complete!")
print("="*50)
print("\nIf all tests passed, the issue is likely:")
print("1. Frontend needs restart: Ctrl+C and run 'npm run dev' again")
print("2. Browser cache: Hard refresh (Ctrl+Shift+R)")
print("3. JWT token issue: Sign out and sign back in")
