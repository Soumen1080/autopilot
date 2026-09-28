# Supported Rule Patterns

The AutoPilot engine understands a variety of natural language triggers and actions. Rules are categorized into **Event-driven** (reactions to incoming payments) and **Scheduled** (cron jobs).

## Triggers

1. **Every Payment**
   - Syntax: `every payment`, `payment received`, `incoming deposit`
   - Description: Fires whenever the monitored wallet receives XLM or USDC.
2. **Asset Specific**
   - Syntax: `every USDC payment`, `when I receive XLM`
   - Description: Fires only when the specified asset is received.
3. **Scheduled (Cron)**
   - Syntax: `every week`, `daily`, `every month`
   - Description: Fires at a set time interval, independent of wallet activity.

## Actions

1. **Save**
   - Syntax: `save`, `send to savings vault`
   - Description: Moves the executed amount to the user's Savings vault.
2. **Invest**
   - Syntax: `invest`, `buy assets`
   - Description: Moves the executed amount to the user's Investment vault.

## Examples

| Natural Language Prompt | Parsed Trigger | Parsed Action | Amount |
|---|---|---|---|
| "Save 10% of every payment I receive" | `Every payment` | `Save` | `10%` |
| "Invest 50 USDC every week" | `Every week` | `Invest` | `50` (flat) |
| "Whenever I get a USDC deposit, save 5%" | `USDC payment` | `Save` | `5%` |
