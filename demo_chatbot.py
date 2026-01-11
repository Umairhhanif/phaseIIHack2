"""
Demo script to test AI Chatbot functionality.

This script demonstrates the Phase 3 AI chatbot features by:
1. Creating a test user
2. Authenticating and getting a JWT token
3. Testing chat API with various commands
4. Verifying task operations through conversation

Usage:
    python demo_chatbot.py

Requirements:
    - Backend must be running on http://localhost:8000
    - COHERE_API_KEY must be set in backend/.env
"""

import json
import sys
from typing import Dict, Any

try:
    import requests
except ImportError:
    print("Error: requests library not installed. Run: pip install requests")
    sys.exit(1)

BASE_URL = "http://localhost:8000"
TEST_USER = {
    "email": "chatbot_demo@example.com",
    "password": "demo_password_123",
    "name": "Chatbot Demo User"
}


def print_section(title: str):
    """Print a formatted section header."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


def print_response(label: str, response: Dict[str, Any]):
    """Print a formatted API response."""
    print(f"{label}:")
    print(json.dumps(response, indent=2))
    print()


def api_post(endpoint: str, data: Dict[str, Any], token: str = None) -> Dict[str, Any]:
    """Make a POST API request."""
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    response = requests.post(f"{BASE_URL}{endpoint}", json=data, headers=headers)
    response.raise_for_status()
    return response.json()


def api_get(endpoint: str, token: str) -> Dict[str, Any]:
    """Make a GET API request."""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
    response.raise_for_status()
    return response.json()


def cleanup_user(email: str):
    """Attempt to clean up test user if it exists."""
    try:
        # First try to sign in to get token
        signin_response = api_post("/auth/signin", {
            "email": email,
            "password": TEST_USER["password"]
        })
        user_id = signin_response["user"]["id"]
        token = signin_response["token"]

        print(f"Found existing test user: {user_id}")
        print("To clean up, manually delete the user from database")
        print(f"DELETE FROM users WHERE email = '{email}'")

        # Get existing conversations
        convs = api_get(f"/api/{user_id}/conversations", token)
        print(f"Existing conversations: {convs['total']}")

    except Exception:
        pass  # User doesn't exist, that's fine


def main():
    """Run the demo script."""
    print_section("AI Chatbot Demo - Phase 3")
    print("This demo tests the conversational task management features.")
    print("Make sure the backend is running on http://localhost:8000\n")

    # Check if backend is running
    try:
        health = requests.get(f"{BASE_URL}/health", timeout=5)
        if health.status_code != 200:
            raise Exception("Backend health check failed")
        print("Backend is running!")
    except Exception as e:
        print(f"Error: Cannot connect to backend: {e}")
        print("Please start the backend first:")
        print("  cd backend && python main.py")
        sys.exit(1)

    # Clean up existing user
    cleanup_user(TEST_USER["email"])

    # Create test user
    print_section("1. Creating Test User")
    try:
        signup_response = api_post("/auth/signup", TEST_USER)
        token = signup_response["token"]
        user_id = signup_response["user"]["id"]
        print_response("Signup successful", signup_response)
    except Exception as e:
        print(f"Signup failed (user may exist): {e}")
        # Try to sign in instead
        try:
            signin_response = api_post("/auth/signin", {
                "email": TEST_USER["email"],
                "password": TEST_USER["password"]
            })
            token = signin_response["token"]
            user_id = signin_response["user"]["id"]
            print_response("Signin successful", signin_response)
        except Exception as e2:
            print(f"Authentication failed: {e2}")
            sys.exit(1)

    # Test chat commands
    print_section("2. Testing AI Chatbot Commands")

    chat_commands = [
        "Who am I?",
        "Add task buy groceries",
        "Add task pay electricity bill with priority HIGH",
        "Show all my tasks",
        "Complete buy groceries",
        "Add task go to the gym with priority HIGH",
        "Show only pending tasks",
        "Delete pay electricity bill",
        "Show all my tasks",
    ]

    conversation_id = None

    for i, command in enumerate(chat_commands, 1):
        print(f"\n--- Command {i}: {command} ---")

        try:
            chat_response = api_post(
                f"/api/{user_id}/chat",
                {
                    "message": command,
                    "conversation_id": conversation_id
                },
                token
            )

            conversation_id = chat_response["conversation_id"]
            print(f"Conversation ID: {conversation_id}")
            print(f"Assistant: {chat_response['assistant_message']}")
            if chat_response.get("tool_calls"):
                print(f"Tool calls: {len(chat_response['tool_calls'])}")

        except requests.exceptions.HTTPError as e:
            print(f"Error: {e.response.status_code}")
            try:
                error_data = e.response.json()
                print(f"Details: {error_data.get('detail', error_data)}")
            except:
                print(f"Details: {e.response.text}")
        except Exception as e:
            print(f"Error: {e}")

    # Get conversation history
    print_section("3. Retrieving Conversation History")
    try:
        conversations = api_get(f"/api/{user_id}/conversations", token)
        print(f"Total conversations: {conversations['total']}")
        for conv in conversations["conversations"][:3]:
            print(f"  - {conv['id'][:8]}...: {conv['title']}")
    except Exception as e:
        print(f"Error retrieving conversations: {e}")

    # Get messages from the conversation
    if conversation_id:
        print_section("4. Retrieving Messages from Conversation")
        try:
            messages = api_get(f"/api/{user_id}/conversations/{conversation_id}/messages", token)
            print(f"Total messages: {messages['total']}")
            for msg in messages["messages"]:
                role = msg["role"].upper()
                content = msg["content"][:100] + "..." if len(msg["content"]) > 100 else msg["content"]
                print(f"  [{role}] {content}")
        except Exception as e:
            print(f"Error retrieving messages: {e}")

    # Verify tasks via tasks API
    print_section("5. Verifying Tasks via Tasks API")
    try:
        tasks = api_get(f"/api/{user_id}/tasks", token)
        print(f"Total tasks: {tasks['total']}")
        for task in tasks["tasks"]:
            status = "✓" if task["completed"] else "○"
            priority = f" [{task['priority']}]" if task["priority"] else ""
            print(f"  {status} {task['title']}{priority}")
    except Exception as e:
        print(f"Error retrieving tasks: {e}")

    print_section("Demo Complete!")
    print("\nTest user created:")
    print(f"  Email: {TEST_USER['email']}")
    print(f"  Password: {TEST_USER['password']}")
    print(f"  User ID: {user_id}")
    print("\nYou can now log into the frontend and test the chatbot UI.")


if __name__ == "__main__":
    main()
