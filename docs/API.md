# REST API Reference

The AutoPilot backend exposes a REST API for the frontend client. All endpoints require authentication (JWT or session).

## Base URL
`http://localhost:3001/api`

## Endpoints

### Accounts
- `GET /account` - Fetch user details, linked Stellar wallets, and limits.
- `POST /account/limits` - Update daily/weekly spending limits.

### Vaults
- `GET /vault` - List all vaults (Savings, Investment) and balances.
- `POST /vault` - Create a new on-chain vault.
- `POST /vault/withdraw` - Withdraw funds from a vault to a user wallet.

### Rules
- `GET /rules` - List all active and paused automation rules.
- `POST /rules` - Create a new rule.
  - **Body**: `{ trigger, action, amount, isPercentage, memo }`
- `PATCH /rules/:id` - Pause or resume a rule.
- `DELETE /rules/:id` - Delete a rule.

### Transactions
- `GET /transactions` - List recent automated transactions and executions.

### Chat / AI
- `POST /chat` - Send a natural language prompt to the AI coach to generate a rule.
  - **Body**: `{ prompt: string }`
  - **Response**: `{ parsedRule: Rule, explanation: string }`
