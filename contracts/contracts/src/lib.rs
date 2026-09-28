#![allow(deprecated)]
#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, token, Address, Env};

const DAY_IN_LEDGERS: u32 = 17280;
const THIRTY_DAYS_IN_LEDGERS: u32 = 17280 * 30;

#[contract]
pub struct AutopilotVault;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Owner,
    Engine,
    IsInitialized,
    Paused,
    SpendLimit,
}

#[contractimpl]
impl AutopilotVault {
    /// Initialize the vault with owner and engine addresses
    pub fn initialize(env: Env, owner: Address, engine: Address) {
        if env.storage().instance().has(&DataKey::IsInitialized) {
            panic!("Vault already initialized");
        }
        env.storage().instance().set(&DataKey::Owner, &owner);
        env.storage().instance().set(&DataKey::Engine, &engine);
        env.storage().instance().set(&DataKey::Paused, &false);
        env.storage().instance().set(&DataKey::IsInitialized, &true);

        env.storage()
            .instance()
            .extend_ttl(DAY_IN_LEDGERS, THIRTY_DAYS_IN_LEDGERS);

        // Emit an event so initialization is auditable on-chain
        env.events()
            .publish((symbol_short!("init"), owner.clone()), engine.clone());
    }

    /// Get the owner address
    pub fn get_owner(env: Env) -> Address {
        env.storage()
            .instance()
            .extend_ttl(DAY_IN_LEDGERS, THIRTY_DAYS_IN_LEDGERS);
        env.storage().instance().get(&DataKey::Owner).unwrap()
    }

    /// Get the engine address
    pub fn get_engine(env: Env) -> Address {
        env.storage()
            .instance()
            .extend_ttl(DAY_IN_LEDGERS, THIRTY_DAYS_IN_LEDGERS);
        env.storage().instance().get(&DataKey::Engine).unwrap()
    }

    /// Pause the contract (Emergency Stop)
    pub fn pause(env: Env) {
        let owner = Self::get_owner(env.clone());
        owner.require_auth();
        env.storage().instance().set(&DataKey::Paused, &true);
    }

    /// Unpause the contract
    pub fn unpause(env: Env) {
        let owner = Self::get_owner(env.clone());
        owner.require_auth();
        env.storage().instance().set(&DataKey::Paused, &false);
    }

    /// Update the engine address (Key Rotation)
    pub fn update_engine(env: Env, new_engine: Address) {
        let owner = Self::get_owner(env.clone());
        owner.require_auth();
        env.storage().instance().set(&DataKey::Engine, &new_engine);
    }

    /// Set maximum on-chain spend limit per execution
    pub fn set_spend_limit(env: Env, limit: i128) {
        let owner = Self::get_owner(env.clone());
        owner.require_auth();
        env.storage().instance().set(&DataKey::SpendLimit, &limit);
    }

    /// Upgrade the contract WASM
    pub fn upgrade(env: Env, new_wasm_hash: soroban_sdk::BytesN<32>) {
        let owner = Self::get_owner(env.clone());
        owner.require_auth();
        env.deployer().update_current_contract_wasm(new_wasm_hash);
    }

    /// Check if contract is paused
    fn check_not_paused(env: &Env) {
        let is_paused: bool = env.storage().instance().get(&DataKey::Paused).unwrap_or(false);
        if is_paused {
            panic!("Contract is paused");
        }
    }

    /// Withdraw funds - only the owner can withdraw
    pub fn withdraw(env: Env, amount: i128, token_address: Address) {
        Self::check_not_paused(&env);
        env.storage()
            .instance()
            .extend_ttl(DAY_IN_LEDGERS, THIRTY_DAYS_IN_LEDGERS);
        // Retrieve owner
        let owner: Address = env.storage().instance().get(&DataKey::Owner).unwrap();

        // Require the owner's cryptographic signature for this invocation
        owner.require_auth();

        // Transfer funds from contract to owner
        let client = token::Client::new(&env, &token_address);
        client.transfer(&env.current_contract_address(), &owner, &amount);

        // Emit an event so the withdrawal is auditable on-chain
        env.events().publish(
            (symbol_short!("withdraw"), owner.clone()),
            (token_address.clone(), amount),
        );
    }

    /// Engine execute - allow engine to execute rule-based withdrawals
    pub fn engine_execute(env: Env, amount: i128, token_address: Address) {
        Self::check_not_paused(&env);
        env.storage()
            .instance()
            .extend_ttl(DAY_IN_LEDGERS, THIRTY_DAYS_IN_LEDGERS);
        let engine: Address = env.storage().instance().get(&DataKey::Engine).unwrap();
        engine.require_auth();

        // Check spend limits
        if let Some(limit) = env.storage().instance().get::<_, i128>(&DataKey::SpendLimit) {
            if amount > limit {
                panic!("Amount exceeds spend limit");
            }
        }

        let owner: Address = env.storage().instance().get(&DataKey::Owner).unwrap();

        // Transfer funds from contract to owner
        let client = token::Client::new(&env, &token_address);
        client.transfer(&env.current_contract_address(), &owner, &amount);

        // Emit an event so engine-driven transfers are auditable on-chain
        env.events().publish(
            (symbol_short!("exec"), engine.clone()),
            (owner.clone(), token_address.clone(), amount),
        );
    }

    /// Keep alive - permissionless TTL extension
    pub fn extend_ttl(env: Env) {
        env.storage()
            .instance()
            .extend_ttl(DAY_IN_LEDGERS, THIRTY_DAYS_IN_LEDGERS);
    }
}

#[cfg(test)]
mod test;
