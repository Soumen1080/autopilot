# Local Development Setup

## Prerequisites
- Node.js v18+
- Docker (for Redis and Postgres)
- Stellar CLI (optional, for local network)

## 1. Environment Variables
Copy the `.env.example` file in both `frontend` and `backend` directories.

```bash
cd backend
cp .env.example .env
cd ../frontend
cp .env.example .env
```

**Key Variables:**
- `DATABASE_URL`: Postgres connection string (e.g., Neon or local Docker)
- `REDIS_URL`: Redis connection string (e.g., `redis://localhost:6379`)
- `AUTOPILOT_SECRET_KEY`: The engine hot wallet secret key.

## 2. Funding the Engine Account
To run automations on Testnet, your engine account needs XLM.
1. Generate a keypair using `npx tsx src/scripts/genKeypair.ts` in the `backend`.
2. Go to the [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test) and fund the public key.
3. Put the secret key into `AUTOPILOT_SECRET_KEY`.

## 3. Database setup
Run the Prisma migrations to set up your tables:
```bash
cd frontend
npx prisma db push
```

## 4. Run the Apps
Start the backend (runs the API, BullMQ workers, and Horizon SSE stream):
```bash
cd backend
npm install
npm run dev
```

Start the frontend:
```bash
cd frontend
npm install
npm run dev
```

## Troubleshooting
- **Redis not connected?** Ensure Docker is running `redis-server`. The backend will gracefully fall back to direct-processing, but cron jobs and retries will fail.
- **Engine account unfunded?** Transactions will fail with `tx_bad_seq` or `op_underfunded`. Fund the engine via Friendbot.
