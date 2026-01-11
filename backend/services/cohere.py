"""
Cohere AI client for chatbot reasoning loop.

Implements the core AI reasoning loop that:
1. Calls Cohere API with user message and context
2. Parses tool calls from AI response
3. Executes tools and feeds results back to AI
4. Returns final natural language response
"""

import json
import os
from typing import Any, Dict, List, Optional

import cohere
from dotenv import load_dotenv

load_dotenv()

COHERE_API_KEY = os.getenv("COHERE_API_KEY")

# Warn but don't crash if API key is missing - allow app to start
if not COHERE_API_KEY or COHERE_API_KEY == "your-cohere-api-key-here":
    print("WARNING: COHERE_API_KEY not set. Chatbot will not function until API key is configured.")
    COHERE_API_KEY = None


class CohereClient:
    """
    Cohere AI client with tool-calling reasoning loop.

    Handles natural language understanding and tool execution for
    conversational task management.
    """

    def __init__(self):
        """Initialize Cohere client."""
        if not COHERE_API_KEY:
            # API key not set, client won't work but app can still start
            self.client = None
            self.tools = []
            return
            
        self.client = cohere.Client(COHERE_API_KEY)
        # Convert OpenAI-format tools to Cohere format
        openai_tools = self._get_tool_schemas()
        self.tools = []
        
        for tool in openai_tools:
            func = tool["function"]
            params = func.get("parameters", {})
            properties = params.get("properties", {})
            required = params.get("required", [])
            
            # Map OpenAI types to Cohere types
            type_map = {
                "string": "str",
                "number": "float",
                "integer": "int",
                "boolean": "bool",
                "array": "list",
                "object": "dict"
            }
            
            parameter_definitions = {}
            for param_name, param_info in properties.items():
                parameter_definitions[param_name] = {
                    "description": param_info.get("description", ""),
                    "type": type_map.get(param_info.get("type", "string"), "str"),
                    "required": param_name in required
                }
            
            self.tools.append({
                "name": func["name"],
                "description": func["description"],
                "parameter_definitions": parameter_definitions
            })

    def _get_tool_schemas(self) -> List[Dict[str, Any]]:
        """
        Get tool schemas in OpenAI-compatible format.

        These schemas describe available tools to the AI.
        """
        return [
            {
                "type": "function",
                "function": {
                    "name": "list_tasks",
                    "description": "List all tasks for the user with optional filtering",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "status": {
                                "type": "string",
                                "enum": ["pending", "completed"],
                                "description": "Filter by task status (optional)",
                            },
                            "tag": {
                                "type": "string",
                                "description": "Filter by tag name (optional)",
                            },
                        },
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "add_task",
                    "description": "Create a new task for the user",
                    "parameters": {
                        "type": "object",
                        "required": ["title"],
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "Task title (required)",
                            },
                            "description": {
                                "type": "string",
                                "description": "Optional task description",
                            },
                            "priority": {
                                "type": "string",
                                "enum": ["HIGH", "MEDIUM", "LOW"],
                                "description": "Task priority level",
                            },
                            "due_date": {
                                "type": "string",
                                "description": "Due date in YYYY-MM-DD format",
                            },
                            "tags": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "List of tag names to assign",
                            },
                        },
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "complete_task",
                    "description": "Mark a task as completed",
                    "parameters": {
                        "type": "object",
                        "required": ["task_id"],
                        "properties": {
                            "task_id": {
                                "type": "string",
                                "description": "Task ID (UUID) or title to complete",
                            },
                        },
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_task",
                    "description": "Delete a task",
                    "parameters": {
                        "type": "object",
                        "required": ["task_id"],
                        "properties": {
                            "task_id": {
                                "type": "string",
                                "description": "Task ID (UUID) or title to delete",
                            },
                        },
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "update_task",
                    "description": "Update task details",
                    "parameters": {
                        "type": "object",
                        "required": ["task_id"],
                        "properties": {
                            "task_id": {
                                "type": "string",
                                "description": "Task ID (UUID) or title to update",
                            },
                            "title": {
                                "type": "string",
                                "description": "New task title",
                            },
                            "description": {
                                "type": "string",
                                "description": "New task description",
                            },
                            "priority": {
                                "type": "string",
                                "enum": ["HIGH", "MEDIUM", "LOW"],
                                "description": "New task priority",
                            },
                            "due_date": {
                                "type": "string",
                                "description": "New due date in YYYY-MM-DD format",
                            },
                            "completed": {
                                "type": "boolean",
                                "description": "Set task completion status",
                            },
                        },
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "get_current_user",
                    "description": "Get current user identity information",
                    "parameters": {
                        "type": "object",
                        "required": [],
                        "properties": {},
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "find_task_by_title",
                    "description": "Find a task by title (for natural language task references)",
                    "parameters": {
                        "type": "object",
                        "required": ["title"],
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "Task title to search for",
                            },
                        },
                    },
                },
            },
        ]

    def _build_system_prompt(self) -> str:
        """
        Build system prompt with tool descriptions and instructions.

        The system prompt sets the AI's behavior and describes available tools.
        """
        return """You are a helpful AI assistant for a todo application. You help users manage their tasks through natural language conversation.

Available tools:
- list_tasks: List all user tasks with optional filters (status, tag)
- add_task: Create a new task with title, description, priority, due_date, tags
- complete_task: Mark a task as completed
- delete_task: Delete a task
- update_task: Update task details (title, description, priority, due_date, completed status)
- get_current_user: Get user's identity information
- find_task_by_title: Find a task by title for natural language references

Task priority levels: HIGH, MEDIUM, LOW

IMPORTANT RULES:
1. When users refer to a task by name (e.g., "complete buy groceries"), use find_task_by_title to locate it first
2. Always confirm successful operations to the user (e.g., "I've added [task name] to your list")
3. When listing tasks, show them clearly with their status
4. If an operation fails, explain why in a friendly way
5. For ambiguous inputs, ask for clarification politely
6. Be concise and friendly in your responses
7. When users ask "Who am I?" or "What is my email?", use get_current_user tool

User context:
- User ID: {user_id}
- User email: {email}

You can use tools by calling them with the appropriate parameters. Each tool call returns results that you can use to craft your response."""

    def _extract_json_tool_calls(self, response_text: str) -> Optional[List[Dict[str, Any]]]:
        """
        Extract tool calls from AI response text.

        Looks for JSON blocks in the response that contain tool calls.

        Args:
            response_text: AI response text

        Returns:
            List of tool call dicts, or None if no tool calls found
        """
        # Look for ```json``` blocks
        if "```json" in response_text:
            # Extract JSON block
            start = response_text.find("```json") + 7
            end = response_text.find("```", start)
            if end != -1:
                json_text = response_text[start:end].strip()
                try:
                    data = json.loads(json_text)
                    if isinstance(data, list):
                        return data
                    elif isinstance(data, dict) and "tool_calls" in data:
                        return data["tool_calls"]
                except json.JSONDecodeError:
                    pass

        # Look for plain JSON objects with tool_calls
        try:
            data = json.loads(response_text.strip())
            if "tool_calls" in data:
                return data["tool_calls"]
        except json.JSONDecodeError:
            pass

        return None

    def _build_conversation_history(
        self, messages: List[Dict[str, str]]
    ) -> List[Dict[str, str]]:
        """
        Build conversation history for Cohere API.

        Args:
            messages: List of message dicts with role and content

        Returns:
            Formatted message list for Cohere
        """
        history = []
        for msg in messages:
            # Map roles to Cohere's expected format: User, Chatbot, System, Tool
            role = msg["role"].lower()
            if role == "user":
                cohere_role = "User"
            elif role == "assistant":
                cohere_role = "Chatbot"
            else:
                cohere_role = "User"  # Default to User for unknown roles
            
            history.append({
                "role": cohere_role,
                "message": msg["content"],
            })
        return history

    def chat(
        self,
        user_message: str,
        history: List[Dict[str, str]] = None,
        user_id: str = None,
        email: str = None,
        tool_executor: callable = None,
        max_iterations: int = 5,
    ) -> tuple[str, List[Dict[str, Any]]]:
        """
        Main reasoning loop for chatbot.

        Processes user message, calls tools as needed, returns final response.

        Args:
            user_message: User's input message
            history: Conversation history (list of {role, content} dicts)
            user_id: User ID for context
            email: User email for context
            tool_executor: Function to execute tools (receives tool_name, params)
            max_iterations: Max tool-calling iterations to prevent infinite loops

        Returns:
            Tuple of (final_response_text, tool_calls_executed)
        """
        if history is None:
            history = []

        # Check if API key was configured
        if not self.client:
            return ("Sorry, the chatbot is not configured. The administrator needs to add a COHERE_API_KEY to the environment variables.", [])

        all_tool_calls = []
        current_message = user_message
        current_history = self._build_conversation_history(history)

        # Build system prompt with user context
        system_prompt = self._build_system_prompt().format(
            user_id=user_id or "unknown",
            email=email or "unknown"
        )

        for iteration in range(max_iterations):
            # Call Cohere API
            try:
                response = self.client.chat(
                    message=current_message,
                    chat_history=current_history,
                    preamble=system_prompt,
                    tools=self.tools,
                )

                response_text = response.text
                print(f"Iteration {iteration + 1} - AI Response: {response_text[:200]}...")

                # Check for tool calls
                # Prefer native tool calls from SDK, fall back to parsing text if needed
                tool_calls = []
                if hasattr(response, "tool_calls") and response.tool_calls:
                    for tc in response.tool_calls:
                        tool_calls.append({
                            "name": tc.name,
                            "parameters": tc.parameters
                        })
                
                if not tool_calls:
                    tool_calls = self._extract_json_tool_calls(response_text)

                if not tool_calls:
                    # No tool calls, return final response
                    return response_text, all_tool_calls

                # Execute tools
                tool_results = []
                for tool_call in tool_calls:
                    tool_name = tool_call.get("name")
                    tool_params = tool_call.get("parameters", {})

                    if tool_executor:
                        result = tool_executor(tool_name, tool_params)
                        tool_results.append(result)
                        
                        # Also keep track for our internal history
                        all_tool_calls.append({
                            "name": tool_name,
                            "params": tool_params,
                            "result": result,
                        })
                    else:
                        tool_results.append({"error": "No tool executor provided"})

                # Feed results back to AI for next iteration
                current_message = f"""Tool results: {json.dumps(tool_results, indent=2)}

Please analyze these results and provide your final response to the user."""
                current_history.append({"role": "Chatbot", "message": response_text})

            except Exception as e:
                # Error calling Cohere, return friendly message
                print(f"Cohere API error: {str(e)}")
                return f"I encountered an error processing your request: {str(e)}. Please try again.", all_tool_calls

        # Max iterations reached, return best effort response
        return "I'm having trouble completing this request. Could you rephrase or try again?", all_tool_calls

    def simple_chat(self, user_message: str, history: List[Dict[str, str]] = None) -> str:
        """
        Simple chat without tool calling (fallback mode).

        Args:
            user_message: User's input message
            history: Conversation history

        Returns:
            AI response text
        """
        if history is None:
            history = []

        system_prompt = """You are a helpful AI assistant for a todo application.
You help users manage their tasks through natural language conversation."""

        current_history = self._build_conversation_history(history)

        try:
            response = self.client.chat(
                message=user_message,
                chat_history=current_history,
                preamble=system_prompt,
            )
            return response.text
        except Exception as e:
            return f"I encountered an error: {str(e)}. Please try again."
