---
id: 001
title: Phase3 Constitution Creation
stage: constitution
date: 2026-01-06
surface: agent
model: claude-sonnet-4-5
feature: none
branch: main
user: User
command: /sp.constitution
labels: ["constitution","phase3","ai-chatbot","cohere-api","mcp-tools"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 -
---

## Prompt

AI Todo Chatbot Integration for The Evolution of Todo - Phase III: Full-Stack Web Application

Target audience: Hackathon judges evaluating cutting-edge agentic AI integrations, developers building intelligent productivity tools, and AI agents (Claude Code) implementing via Spec-Kit Plus in a monorepo.

Focus: Create a comprehensive, authoritative constitution that seamlessly integrates a powerful AI-powered chatbot into the existing Phase II full-stack backend (FastAPI + Neon DB + Better Auth). The chatbot must handle all core task functionalities (add, delete, mark complete, update, list) through natural language, provide user email info from the logged-in session, and offer full conversational control. Replace OpenAI Agents SDK with Cohere's API for AI logic — adapt any agent-like code to use Cohere's chat/completions endpoint for tool calling and reasoning. This document serves as the foundational governance for Phase III, ensuring stateless architecture, MCP tools for task operations, and persistent conversation state in the database.

Success criteria:

•	Defines a chatbot with full functionality: natural language task management (CRUD + complete), user email queries (e.g., "Who am I?" → "Logged in as example@email.com"), confirmations, error handling, and graceful responses.

•	Integrates seamlessly into existing backend: single stateless /api/{user\_id}/chat endpoint, MCP tools exposed, Cohere API for AI reasoning/tool invocation.

•	Adapts OpenAI-style agent behavior to Cohere API: use Cohere's chat endpoint for multi-turn conversations with tool calls.

•	Ensures multi-user security: JWT auth for user\_id, task isolation, conversation persistence per user.

•	Generates a complete Markdown file (constitution.md) version v3.0 placed at repository root — ready to guide all Phase III specs, plans, agents, and implementations.

•	Resulting chatbot feels intelligent, helpful, and production-ready: handles complex queries (e.g., "Add weekly meeting and list pending tasks") by chaining tools.

Constraints:

•	Format: Markdown with deeply structured sections (Project Overview, Core Requirements, Chatbot Functionality \& Natural Language Handling, Authentication \& Security, Non-Functional Requirements, Technology Stack and Tools, Development Workflow, Monorepo Updates, Database Extensions, MCP Tools Specification, Cohere API Adaptation, Guiding Principles, Deliverables and Success Criteria).

•	Version: v3.0 (Phase III), include current date (January 06, 2026).

•	Strictly integrate into existing monorepo: extend /backend with MCP server and chat endpoint; add ChatKit to /frontend if needed.

•	Dependencies limited to: Existing stack (FastAPI, SQLModel, Neon PostgreSQL, Better Auth) + Cohere API (for AI chat/completions), Official MCP SDK (for tools), no additional frameworks.

•	Cohere Adaptation: Use Cohere's API key for all AI calls; simulate agent/tool-calling by structuring prompts to reason step-by-step and output tool invocation JSON.

•	Stateless: No server state — persist conversations/messages in DB.

•	No manual coding: All via Claude Code agents/skills.

•	Keep concise yet exhaustive (under 3000 words).

•	Reference Phase I/II briefly as completed foundation.

Specific Sections Required:

1.	Project Overview – Summarize evolution to AI chatbot, objective: natural language task management with full functionality.

2.	Core Requirements – Conversational interface for 5 basic features, user email queries, stateless endpoint.

3.	Chatbot Functionality \& Natural Language Handling – Detail flows, examples (e.g., "Add task" → add\_task tool), confirmations, errors.

4.	Authentication \& Security – JWT for user\_id/email extraction, isolation in tools/conversations.

5.	Non-Functional Requirements – Clean code, async ops, scalability, graceful errors.

6.	Technology Stack and Tools – Extend Phase II: Cohere API for AI, MCP SDK for tools, ChatKit frontend.

7.	Development Workflow – Agentic: spec → plan → tasks → Claude Code; Cohere API key usage.

8.	Monorepo Updates – Extend structure: add chatbot routes, DB models (Conversation, Message).

9.	Database Extensions – New models: Conversation (user\_id, id), Message (conversation\_id, role, content).

10.	MCP Tools Specification – Exact 5 tools with params/returns, stateless DB interaction.

11.	Cohere API Adaptation – Detail how to adapt agent logic: prompt Cohere for reasoning/tool calls, parse JSON output.

12.	Guiding Principles – AI-first, stateless, security, no manual code, hackathon transparency.

13.	Deliverables and Success Criteria – Working chatbot, repo updates, demo: natural queries handle full features.

Environment Variables:

•	COHERE\_API\_KEY=c4iE4V4fbUHfyq7DrhswUKH96ZhECgS3MdEEEIeO (for AI)

•	Use existing BETTER\_AUTH\_SECRET, DATABASE\_URL.

Generate immediately — this constitution must guarantee a seamless, intelligent, error-free chatbot integration that elevates the full-stack app to flagship AI status. Perfection in every detail.

## Response snapshot

Successfully created Phase III constitution (v3.0.0) with comprehensive AI chatbot integration guidance. The constitution includes:

- 6 core principles (AI-First Architecture, Stateless Design, Multi-User Security, Agentic Development, Cohere API Integration, Conversation Persistence)
- Cohere API integration details replacing OpenAI Agents SDK
- MCP tools specification with 5 core task operations (add_task, list_tasks, complete_task, delete_task, update_task)
- Database extensions (Conversation and Message models)
- Stateless /api/{user_id}/chat endpoint design
- Natural language handling patterns with tool chaining
- Chatbot functionality with confirmations and error handling
- JWT authentication and multi-user security rules
- Performance targets and non-functional requirements
- Deliverables and success criteria for the AI chatbot

The Sync Impact Report documents the version bump from 1.0.0 to 3.0.0 (MAJOR) due to transformative AI capabilities, MCP tools, and new database models.

## Outcome

- ✅ Impact: Established foundational governance for Phase III AI chatbot integration with Cohere API and MCP tools
- 🧪 Tests: No tests included (constitution is governance document)
- 📁 Files: Updated .specify/memory/constitution.md with comprehensive Phase III guidance
- 🔁 Next prompts: /sp.specify for feature specs, /sp.plan for architecture planning
- 🧠 Reflection: Constitution successfully transitions from Phase II to Phase III, providing clear guidance for agentic AI integration while maintaining security and statelessness principles

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A (governance document)
- Prompt variant (if applicable): None
- Next experiment (smallest change to try): Test constitution with actual spec generation for chatbot features
