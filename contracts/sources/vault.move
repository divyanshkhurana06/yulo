module yulo::vault {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::balance::{Self, Balance};
    use sui::event;
    use sui::table::{Self, Table};
    use sui::vec_map::{Self, VecMap};
    use sui::clock::{Self, Clock};

    // ===== Errors =====
    const ENotEnoughBalance: u64 = 0;
    const EInvalidAmount: u64 = 1;
    const ENotAuthorized: u64 = 2;
    const EStrategyNotFound: u64 = 3;
    const EDepositLimitExceeded: u64 = 4;
    const EWithdrawLimitExceeded: u64 = 5;
    const EInvalidToken: u64 = 6;
    const EReentrancyGuard: u64 = 7;

    // ===== Events =====
    struct DepositEvent has copy, drop {
        user: address,
        amount: u64,
        token_type: vector<u8>,
        timestamp: u64,
    }

    struct WithdrawEvent has copy, drop {
        user: address,
        amount: u64,
        token_type: vector<u8>,
        timestamp: u64,
    }

    struct HarvestEvent has copy, drop {
        strategy: address,
        amount: u64,
        timestamp: u64,
    }

    // ===== Structs =====
    struct Vault has key {
        id: UID,
        total_supply: u64,
        total_assets: u64,
        strategies: VecMap<address, Strategy>,
        treasury_cap: TreasuryCap<YULO>,
        fees: Balance<SUI>,
        deposit_limit: u64,
        withdraw_limit: u64,
        last_operation: u64,
        clock: Clock,
    }

    struct Strategy has store {
        address: address,
        total_assets: u64,
        last_harvest: u64,
        performance_fee: u64, // in basis points (1 = 0.01%)
        withdrawal_fee: u64,  // in basis points
    }

    // ===== Functions =====
    public fun initialize(
        treasury_cap: TreasuryCap<YULO>,
        deposit_limit: u64,
        withdraw_limit: u64,
        clock: Clock,
        ctx: &mut TxContext
    ) {
        let vault = Vault {
            id: object::new(ctx),
            total_supply: 0,
            total_assets: 0,
            strategies: vec_map::empty(),
            treasury_cap,
            fees: balance::zero(),
            deposit_limit,
            withdraw_limit,
            last_operation: 0,
            clock,
        };

        transfer::share_object(vault);
    }

    public fun deposit<T>(
        vault: &mut Vault,
        coins: Coin<T>,
        ctx: &mut TxContext
    ) {
        // Reentrancy guard
        let current_time = clock::timestamp_ms(&vault.clock);
        assert!(current_time > vault.last_operation, EReentrancyGuard);
        vault.last_operation = current_time;

        let amount = coin::value(&coins);
        assert!(amount > 0, EInvalidAmount);
        assert!(amount <= vault.deposit_limit, EDepositLimitExceeded);

        // Calculate shares to mint
        let shares = if (vault.total_supply == 0) {
            amount
        } else {
            (amount * vault.total_supply) / vault.total_assets
        };

        // Update vault state
        vault.total_supply = vault.total_supply + shares;
        vault.total_assets = vault.total_assets + amount;

        // Mint shares to user
        let shares_coin = coin::mint(&mut vault.treasury_cap, shares, ctx);
        transfer::public_transfer(shares_coin, tx_context::sender(ctx));

        // Emit deposit event
        event::emit(DepositEvent {
            user: tx_context::sender(ctx),
            amount,
            token_type: b"LP", // or "SUI" based on T
            timestamp: current_time,
        });

        // Add coins to vault
        let coins_balance = coin::into_balance(coins);
        vault.fees = balance::join(vault.fees, coins_balance);
    }

    public fun withdraw(
        vault: &mut Vault,
        shares: Coin<YULO>,
        ctx: &mut TxContext
    ) {
        // Reentrancy guard
        let current_time = clock::timestamp_ms(&vault.clock);
        assert!(current_time > vault.last_operation, EReentrancyGuard);
        vault.last_operation = current_time;

        let share_amount = coin::value(&shares);
        assert!(share_amount > 0, EInvalidAmount);
        assert!(share_amount <= vault.total_supply, ENotEnoughBalance);

        // Calculate withdrawal amount
        let amount = (share_amount * vault.total_assets) / vault.total_supply;
        assert!(amount <= vault.withdraw_limit, EWithdrawLimitExceeded);
        assert!(amount <= balance::value(&vault.fees), ENotEnoughBalance);

        // Update vault state
        vault.total_supply = vault.total_supply - share_amount;
        vault.total_assets = vault.total_assets - amount;

        // Burn shares
        coin::burn(shares);

        // Transfer assets to user
        let coins = coin::from_balance(balance::split(&mut vault.fees, amount), ctx);
        transfer::public_transfer(coins, tx_context::sender(ctx));

        // Emit withdraw event
        event::emit(WithdrawEvent {
            user: tx_context::sender(ctx),
            amount,
            token_type: b"SUI",
            timestamp: current_time,
        });
    }

    public fun add_strategy(
        vault: &mut Vault,
        strategy_address: address,
        performance_fee: u64,
        withdrawal_fee: u64,
        ctx: &TxContext
    ) {
        assert!(tx_context::sender(ctx) == object::id(&vault.id), ENotAuthorized);
        
        let strategy = Strategy {
            address: strategy_address,
            total_assets: 0,
            last_harvest: 0,
            performance_fee,
            withdrawal_fee,
        };

        vec_map::insert(&mut vault.strategies, strategy_address, strategy);
    }

    public fun harvest(
        vault: &mut Vault,
        strategy_address: address,
        rewards: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Reentrancy guard
        let current_time = clock::timestamp_ms(&vault.clock);
        assert!(current_time > vault.last_operation, EReentrancyGuard);
        vault.last_operation = current_time;

        let strategy = vec_map::get_mut(&mut vault.strategies, strategy_address);
        assert!(strategy.address == strategy_address, EStrategyNotFound);

        let amount = coin::value(&rewards);
        let performance_fee = (amount * strategy.performance_fee) / 10000;
        
        // Update strategy state
        strategy.total_assets = strategy.total_assets + amount - performance_fee;
        strategy.last_harvest = current_time;

        // Update vault state
        vault.total_assets = vault.total_assets + amount - performance_fee;

        // Add performance fee to vault fees
        let rewards_balance = coin::into_balance(rewards);
        let (fee_balance, rewards_balance) = balance::split(rewards_balance, performance_fee);
        vault.fees = balance::join(vault.fees, fee_balance);

        // Emit harvest event
        event::emit(HarvestEvent {
            strategy: strategy_address,
            amount: amount - performance_fee,
            timestamp: current_time,
        });
    }

    // ===== View Functions =====
    public fun get_total_assets(vault: &Vault): u64 {
        vault.total_assets
    }

    public fun get_total_supply(vault: &Vault): u64 {
        vault.total_supply
    }

    public fun get_deposit_limit(vault: &Vault): u64 {
        vault.deposit_limit
    }

    public fun get_withdraw_limit(vault: &Vault): u64 {
        vault.withdraw_limit
    }
} 