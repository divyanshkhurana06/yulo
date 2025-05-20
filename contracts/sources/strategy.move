module yulo::strategy {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin, Balance};
    use sui::balance;
    use sui::event;
    use sui::vec_map::{Self, VecMap};

    // ===== Errors =====
    const ENotAuthorized: u64 = 0;
    const EInvalidAmount: u64 = 1;
    const ENotEnoughBalance: u64 = 2;

    // ===== Events =====
    struct StrategyInitialized has copy, drop {
        strategy_id: ID,
        name: vector<u8>,
        description: vector<u8>,
    }

    struct StrategyHarvested has copy, drop {
        strategy_id: ID,
        amount: u64,
        timestamp: u64,
    }

    // ===== Structs =====
    struct Strategy has key {
        id: UID,
        name: vector<u8>,
        description: vector<u8>,
        total_assets: u64,
        last_harvest: u64,
        rewards: Balance<SUI>,
        config: StrategyConfig,
    }

    struct StrategyConfig has store {
        min_deposit: u64,
        max_deposit: u64,
        harvest_threshold: u64,
        performance_fee: u64, // in basis points
    }

    // ===== Functions =====
    public fun initialize(
        name: vector<u8>,
        description: vector<u8>,
        config: StrategyConfig,
        ctx: &mut TxContext
    ) {
        let strategy = Strategy {
            id: object::new(ctx),
            name,
            description,
            total_assets: 0,
            last_harvest: 0,
            rewards: balance::zero(),
            config,
        };

        transfer::share_object(strategy);

        event::emit(StrategyInitialized {
            strategy_id: object::id(&strategy.id),
            name: strategy.name,
            description: strategy.description,
        });
    }

    public fun deposit(
        strategy: &mut Strategy,
        coins: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&coins);
        assert!(amount >= strategy.config.min_deposit, EInvalidAmount);
        assert!(amount <= strategy.config.max_deposit, EInvalidAmount);

        strategy.total_assets = strategy.total_assets + amount;
        let coins_balance = coin::into_balance(coins);
        strategy.rewards = balance::join(strategy.rewards, coins_balance);
    }

    public fun withdraw(
        strategy: &mut Strategy,
        amount: u64,
        ctx: &mut TxContext
    ) {
        assert!(amount <= strategy.total_assets, ENotEnoughBalance);
        assert!(amount <= balance::value(&strategy.rewards), ENotEnoughBalance);

        strategy.total_assets = strategy.total_assets - amount;
        let coins = coin::from_balance(balance::split(&mut strategy.rewards, amount), ctx);
        transfer::public_transfer(coins, tx_context::sender(ctx));
    }

    public fun harvest(
        strategy: &mut Strategy,
        rewards: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&rewards);
        let performance_fee = (amount * strategy.config.performance_fee) / 10000;
        
        strategy.total_assets = strategy.total_assets + amount - performance_fee;
        strategy.last_harvest = tx_context::epoch(ctx);

        let rewards_balance = coin::into_balance(rewards);
        let (fee_balance, rewards_balance) = balance::split(rewards_balance, performance_fee);
        strategy.rewards = balance::join(strategy.rewards, rewards_balance);

        event::emit(StrategyHarvested {
            strategy_id: object::id(&strategy.id),
            amount: amount - performance_fee,
            timestamp: tx_context::epoch(ctx),
        });
    }

    // ===== View Functions =====
    public fun get_total_assets(strategy: &Strategy): u64 {
        strategy.total_assets
    }

    public fun get_last_harvest(strategy: &Strategy): u64 {
        strategy.last_harvest
    }

    public fun get_rewards_balance(strategy: &Strategy): u64 {
        balance::value(&strategy.rewards)
    }
} 