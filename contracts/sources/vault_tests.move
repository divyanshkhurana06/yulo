#[test_only]
module yulo::vault_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::test_utils::assert_eq;
    use sui::clock::{Self, Clock};
    use yulo::vault::{Self, Vault, AdminCap};
    use yulo::yulo_token::{Self, YULO};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::object;

    // Test addresses
    const ADMIN: address = @0xAD;
    const USER: address = @0xB0B;
    const STRATEGY: address = @0xCAFE;
    const STRATEGY2: address = @0xDEAD;

    // Test constants
    const INITIAL_DEPOSIT: u64 = 1000;
    const WITHDRAW_AMOUNT: u64 = 500;
    const DEPOSIT_LIMIT: u64 = 2000;
    const WITHDRAW_LIMIT: u64 = 1000;
    const PERFORMANCE_FEE: u64 = 100; // 1%
    const WITHDRAWAL_FEE: u64 = 50;   // 0.5%

    // Test setup
    fun setup_test(scenario: &mut Scenario): (Clock, Coin<SUI>, AdminCap) {
        // Start with admin
        ts::begin(ADMIN, scenario);
        
        // Create clock
        let clock = clock::create_for_testing(ADMIN);
        ts::next_tx(scenario, ADMIN);
        
        // Initialize YULO token
        let (treasury_cap, _) = yulo_token::init(ts::ctx(scenario));
        
        // Initialize vault
        vault::initialize(treasury_cap, DEPOSIT_LIMIT, WITHDRAW_LIMIT, clock, ts::ctx(scenario));
        
        // Get admin cap
        let admin_cap = ts::take_from_sender<AdminCap>(scenario);
        
        // Create test coins
        let coins = coin::mint_for_testing(INITIAL_DEPOSIT);
        
        (clock, coins, admin_cap)
    }

    #[test]
    fun test_deposit() {
        let scenario = ts::begin(ADMIN);
        let (clock, coins, admin_cap) = setup_test(&mut scenario);
        
        // Switch to user
        ts::next_tx(&mut scenario, USER);
        
        // Deposit coins
        vault::deposit(ts::take_from_sender<Coin<SUI>>(&scenario), ts::ctx(&mut scenario));
        
        // Verify vault state
        let vault = ts::take_shared<Vault>(&scenario);
        assert_eq(vault::get_total_assets(&vault), INITIAL_DEPOSIT);
        assert_eq(vault::get_total_supply(&vault), INITIAL_DEPOSIT);
        ts::return_shared(vault);
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = vault::EDepositLimitExceeded)]
    fun test_deposit_limit() {
        let scenario = ts::begin(ADMIN);
        let (clock, coins, admin_cap) = setup_test(&mut scenario);
        
        // Switch to user
        ts::next_tx(&mut scenario, USER);
        
        // Try to deposit more than limit
        let large_deposit = coin::mint_for_testing(DEPOSIT_LIMIT + 1);
        vault::deposit(large_deposit, ts::ctx(&mut scenario));
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = vault::EInvalidAmount)]
    fun test_deposit_zero() {
        let scenario = ts::begin(ADMIN);
        let (clock, coins, admin_cap) = setup_test(&mut scenario);
        
        // Switch to user
        ts::next_tx(&mut scenario, USER);
        
        // Try to deposit zero amount
        let zero_deposit = coin::mint_for_testing(0);
        vault::deposit(zero_deposit, ts::ctx(&mut scenario));
        
        ts::end(scenario);
    }

    #[test]
    fun test_withdraw() {
        let scenario = ts::begin(ADMIN);
        let (clock, coins, admin_cap) = setup_test(&mut scenario);
        
        // Switch to user
        ts::next_tx(&mut scenario, USER);
        
        // Deposit coins
        vault::deposit(ts::take_from_sender<Coin<SUI>>(&scenario), ts::ctx(&mut scenario));
        
        // Get shares
        let shares = ts::take_from_sender<Coin<YULO>>(&scenario);
        
        // Withdraw
        vault::withdraw(shares, ts::ctx(&mut scenario));
        
        // Verify vault state
        let vault = ts::take_shared<Vault>(&scenario);
        assert_eq(vault::get_total_assets(&vault), 0);
        assert_eq(vault::get_total_supply(&vault), 0);
        ts::return_shared(vault);
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = vault::EWithdrawLimitExceeded)]
    fun test_withdraw_limit() {
        let scenario = ts::begin(ADMIN);
        let (clock, coins, admin_cap) = setup_test(&mut scenario);
        
        // Switch to user
        ts::next_tx(&mut scenario, USER);
        
        // Deposit coins
        vault::deposit(ts::take_from_sender<Coin<SUI>>(&scenario), ts::ctx(&mut scenario));
        
        // Get shares
        let shares = ts::take_from_sender<Coin<YULO>>(&scenario);
        
        // Try to withdraw more than limit
        let large_shares = coin::mint_for_testing(WITHDRAW_LIMIT + 1);
        vault::withdraw(large_shares, ts::ctx(&mut scenario));
        
        ts::end(scenario);
    }

    #[test]
    fun test_add_strategy() {
        let scenario = ts::begin(ADMIN);
        let (clock, coins, admin_cap) = setup_test(&mut scenario);
        
        // Add strategy
        vault::add_strategy(&admin_cap, STRATEGY, PERFORMANCE_FEE, WITHDRAWAL_FEE, ts::ctx(&mut scenario));
        
        // Verify strategy was added
        let vault = ts::take_shared<Vault>(&scenario);
        assert_eq(vault::get_strategy_count(&vault), 1);
        ts::return_shared(vault);
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = vault::EMaxStrategiesReached)]
    fun test_max_strategies() {
        let scenario = ts::begin(ADMIN);
        let (clock, coins, admin_cap) = setup_test(&mut scenario);
        
        // Add maximum number of strategies
        let i = 0;
        while (i < 10) {
            vault::add_strategy(&admin_cap, STRATEGY + i, PERFORMANCE_FEE, WITHDRAWAL_FEE, ts::ctx(&mut scenario));
            i = i + 1;
        }
        
        // Try to add one more strategy
        vault::add_strategy(&admin_cap, STRATEGY2, PERFORMANCE_FEE, WITHDRAWAL_FEE, ts::ctx(&mut scenario));
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = vault::EStrategyAlreadyExists)]
    fun test_duplicate_strategy() {
        let scenario = ts::begin(ADMIN);
        let (clock, coins, admin_cap) = setup_test(&mut scenario);
        
        // Add strategy
        vault::add_strategy(&admin_cap, STRATEGY, PERFORMANCE_FEE, WITHDRAWAL_FEE, ts::ctx(&mut scenario));
        
        // Try to add the same strategy again
        vault::add_strategy(&admin_cap, STRATEGY, PERFORMANCE_FEE, WITHDRAWAL_FEE, ts::ctx(&mut scenario));
        
        ts::end(scenario);
    }

    #[test]
    fun test_harvest() {
        let scenario = ts::begin(ADMIN);
        let (clock, coins, admin_cap) = setup_test(&mut scenario);
        
        // Add strategy
        vault::add_strategy(&admin_cap, STRATEGY, PERFORMANCE_FEE, WITHDRAWAL_FEE, ts::ctx(&mut scenario));
        
        // Switch to strategy
        ts::next_tx(&mut scenario, STRATEGY);
        
        // Harvest rewards
        let rewards = coin::mint_for_testing(100);
        vault::harvest(rewards, ts::ctx(&mut scenario));
        
        // Verify vault state
        let vault = ts::take_shared<Vault>(&scenario);
        assert_eq(vault::get_total_assets(&vault), 99); // 100 - 1% performance fee
        ts::return_shared(vault);
        
        ts::end(scenario);
    }

    #[test]
    fun test_pause_unpause() {
        let scenario = ts::begin(ADMIN);
        let (clock, coins, admin_cap) = setup_test(&mut scenario);
        
        // Pause vault
        vault::pause_vault(&admin_cap, ts::ctx(&mut scenario));
        
        // Verify vault is paused
        let vault = ts::take_shared<Vault>(&scenario);
        assert!(vault::is_paused(&vault));
        ts::return_shared(vault);
        
        // Unpause vault
        vault::unpause_vault(&admin_cap, ts::ctx(&mut scenario));
        
        // Verify vault is unpaused
        let vault = ts::take_shared<Vault>(&scenario);
        assert!(!vault::is_paused(&vault));
        ts::return_shared(vault);
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = vault::EVaultPaused)]
    fun test_deposit_when_paused() {
        let scenario = ts::begin(ADMIN);
        let (clock, coins, admin_cap) = setup_test(&mut scenario);
        
        // Pause vault
        vault::pause_vault(&admin_cap, ts::ctx(&mut scenario));
        
        // Switch to user
        ts::next_tx(&mut scenario, USER);
        
        // Try to deposit when paused
        vault::deposit(coins, ts::ctx(&mut scenario));
        
        ts::end(scenario);
    }

    #[test]
    fun test_emergency_withdraw() {
        let scenario = ts::begin(ADMIN);
        let (clock, coins, admin_cap) = setup_test(&mut scenario);
        
        // Switch to user
        ts::next_tx(&mut scenario, USER);
        
        // Deposit coins
        vault::deposit(coins, ts::ctx(&mut scenario));
        
        // Switch to admin
        ts::next_tx(&mut scenario, ADMIN);
        
        // Pause vault
        vault::pause_vault(&admin_cap, ts::ctx(&mut scenario));
        
        // Emergency withdraw
        vault::emergency_withdraw(&admin_cap, ts::ctx(&mut scenario));
        
        // Verify vault state
        let vault = ts::take_shared<Vault>(&scenario);
        assert_eq(vault::get_total_assets(&vault), 0);
        ts::return_shared(vault);
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = vault::EReentrancyGuard)]
    fun test_reentrancy_protection() {
        let scenario = ts::begin(ADMIN);
        let (clock, coins, admin_cap) = setup_test(&mut scenario);
        
        // Switch to user
        ts::next_tx(&mut scenario, USER);
        
        // Try to deposit twice in the same transaction
        let coins1 = ts::take_from_sender<Coin<SUI>>(&scenario);
        let coins2 = ts::take_from_sender<Coin<SUI>>(&scenario);
        
        // First deposit should succeed
        vault::deposit(coins1, ts::ctx(&mut scenario));
        
        // Second deposit should fail
        vault::deposit(coins2, ts::ctx(&mut scenario));
        
        ts::end(scenario);
    }
} 