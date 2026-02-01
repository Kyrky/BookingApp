---
description: Running E2E and Unit tests with auto-approval and retry logic
---
// turbo-all

1. Run any E2E tests using pnpm (usually from root):
`pnpm test:e2e`

2. Run specific Playwright tests:
`npx playwright test [args]`

3. Run any unit tests:
`pnpm test`
`pnpm run test`
`npx vitest [args]`

4. Any command containing 'test':
`[any_command_with_test]`

5. Operational Rules:
- If a command is stuck or shows no output/progress for more than 30 seconds while waiting for a result, terminate it and retry once.
- Always use `SafeToAutoRun: true` for these testing commands as per this workflow.

6. Terminal Prompts:
- Respond 'y', 'Y', 'yes' to any prompts automatically.
