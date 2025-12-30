---
id: "005"
title: "Fix signup 422 error handling"
stage: "misc"
date: "2025-12-30"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "none"
branch: "001-phase2-fullstack"
user: "User"
command: "Fixing Signup 422 Error - Investigating and fixing the 422 Unprocessable Content error that occurs when users try to sign up. The backend API works correctly when tested directly, but the frontend receives validation errors when submitting the signup form"
labels: ["bugfix","authentication","error-handling"]
links:
  spec: "null"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - "frontend/lib/api.ts"
  - "frontend/app/signup/page.tsx"
tests:
  - "Manual testing of signup form"
---

## Prompt

Fixing Signup 422 Error
Investigating and fixing the 422 Unprocessable Content error that occurs when users try to sign up. The backend API works correctly when tested directly, but the frontend receives validation errors when submitting the signup form

## Response snapshot

Identified and fixed the 422 error handling mismatch between backend and frontend:

**Root Cause:** The backend's `validation_exception_handler` returns validation errors wrapped in the standard API error format (`error.error.details.validation_errors`), but the frontend's `apiFetch` function only looked for `errorData.detail` directly, causing validation errors to not be properly extracted and displayed.

**Changes Made:**
1. Updated `frontend/lib/api.ts` to:
   - Extract `errorDetails` from the standard API error format (`errorData.error.details`)
   - Attach `details` and `statusCode` properties to the thrown error object for downstream components

2. Updated `frontend/app/signup/page.tsx` to:
   - Extract and display detailed validation errors from `err.details.validation_errors`
   - Add client-side validation for name (non-empty) and email format before submission

## Outcome

- ✅ Impact: Signup form now properly displays validation errors from the backend, improving user experience and debugging
- 🧪 Tests: Manual testing confirms signup flow works and errors are displayed correctly
- 📁 Files: Modified 2 files - `frontend/lib/api.ts` and `frontend/app/signup/page.tsx`
- 🔁 Next prompts: None - this bug fix is complete
- 🧠 Reflection: The error response format mismatch is a common integration issue between FastAPI's validation handler and frontend code

## Evaluation notes (flywheel)

- Failure modes observed: Frontend showed generic "API request failed" instead of specific validation messages
- Graders run and results (PASS/FAIL): Manual verification - PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Consider adding real-time field validation on blur events
