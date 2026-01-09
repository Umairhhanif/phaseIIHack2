import urllib.request
import json
import uuid
import time

BASE_URL = "http://127.0.0.1:8000"

def run_test():
    print(f"Testing backend at {BASE_URL}...")
    
    # 1. Health Check
    try:
        with urllib.request.urlopen(f"{BASE_URL}/health") as response:
            print(f"Health Check: {response.status} {response.read().decode()}")
    except Exception as e:
        print(f"Health Check Failed: {e}")
        return

    # 2. Signup
    email = f"test_{uuid.uuid4()}@example.com"
    password = "password123"
    name = "Test User"
    
    signup_data = {
        "email": email,
        "password": password,
        "name": name
    }
    
    print(f"\nAttempting Signup with {email}...")
    req = urllib.request.Request(
        f"{BASE_URL}/auth/signup",
        data=json.dumps(signup_data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Signup Status: {response.status}")
            data = json.loads(response.read().decode())
            print(f"Signup Response: {data.keys()}")
    except urllib.request.HTTPError as e:
        print(f"Signup Failed: {e.code} {e.read().decode()}")
        return
    except Exception as e:
        print(f"Signup Error: {e}")
        return

    # 3. Signin
    print(f"\nAttempting Signin with {email}...")
    signin_data = {
        "email": email,
        "password": password
    }
    
    req = urllib.request.Request(
        f"{BASE_URL}/auth/signin",
        data=json.dumps(signin_data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Signin Status: {response.status}")
            data = json.loads(response.read().decode())
            print(f"Signin Response keys: {data.keys()}")
            print("Signin Successful!")
    except urllib.request.HTTPError as e:
        print(f"Signin Failed: {e.code} {e.read().decode()}")
    except Exception as e:
        print(f"Signin Error: {e}")

if __name__ == "__main__":
    run_test()
