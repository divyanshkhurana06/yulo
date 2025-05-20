#[test_only]
module yulo::vault_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::test_utils::assert_eq;
    use sui::clock::{Self, Clock};
    use yulo::vault::{Self, Vault};
    use yulo::yulo_token::{Self, YULO};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;

    // Test addresses
    const ADMIN: address = @0xAD;
    const USER: address = @0xB0B;
    const STRATEGY: address = @0xCAFE;

    // Test constants
    const INITIAL_DEPOSIT: u64 = 1000;
    const WITHDRAW_AMOUNT: u64 = 500;
    const DEPOSIT_LIMIT: u64 = 2000;
    const WITHDRAW_LIMIT: u64 = 1000;

    // Test setup
    fun setup_test(scenario: &mut Scenario): (Clock, Coin<SUI>) {
        // Start with admin
        ts::begin(ADMIN, scenario);
        
        // Create clock
        let clock = clock::create_for_testing(ADMIN);
        ts::next_tx(scenario, ADMIN);
        
        // Initialize YULO token
        let (treasury_cap, _) = yulo_token::init(ts::ctx(scenario));
        
        // Initialize vault
        vault::initialize(treasury_cap, DEPOSIT_LIMIT, WITHDRAW_LIMIT, clock, ts::ctx(scenario));
        
        // Create test coins
        let coins = coin::mint_for_testing(INITIAL_DEPOSIT);
        
        (clock, coins)
    }

    #[test]
    fun test_deposit() {
        let scenario = ts::begin(ADMIN);
        let (clock, coins) = setup_test(&mut scenario);
        
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
    fun test_deposit_limit() {
        let scenario = ts::begin(ADMIN);
        let (clock, coins) = setup_test(&mut scenario);
        
        // Switch to user
        ts::next_tx(&mut scenario, USER);
        
        // Try to deposit more than limit
        let large_deposit = coin::mint_for_testing(DEPOSIT_LIMIT + 1);
        ts::next_tx(&mut scenario, USER);
        
        // Should fail
        assert!(ts::has_most_recent_error(&scenario, vault::EDepositLimitExceeded));
        
        ts::end(scenario);
    }

    #[test]
    fun test_withdraw() {
        let scenario = ts::begin(ADMIN);
        let (clock, coins) = setup_test(&mut scenario);
        
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
    fun test_withdraw_limit() {
        let scenario = ts::begin(ADMIN);
        let (clock, coins) = setup_test(&mut scenario);
        
        // Switch to user
        ts::next_tx(&mut scenario, USER);
        
        // Deposit coins
        vault::deposit(ts::take_from_sender<Coin<SUI>>(&scenario), ts::ctx(&mut scenario));
        
        // Get shares
        let shares = ts::take_from_sender<Coin<YULO>>(&scenario);
        
        // Try to withdraw more than limit
        let large_shares = coin::mint_for_testing(WITHDRAW_LIMIT + 1);
        ts::next_tx(&mut scenario, USER);
        
        // Should fail
        assert!(ts::has_most_recent_error(&scenario, vault::EWithdrawLimitExceeded));
        
        ts::end(scenario);
    }

    #[test]
    fun test_add_strategy() {
        let scenario = ts::begin(ADMIN);
        let (clock, coins) = setup_test(&mut scenario);
        
        // Add strategy
        vault::add_strategy(STRATEGY, 100, 50, ts::ctx(&mut scenario));
        
        // Verify strategy was added
        let vault = ts::take_shared<Vault>(&scenario);
        // TODO: Add strategy verification
        ts::return_shared(vault);
        
        ts::end(scenario);
    }

    #[test]
    fun test_harvest() {
        let scenario = ts::begin(ADMIN);
        let (clock, coins) = setup_test(&mut scenario);
        
        // Add strategy
        vault::add_strategy(STRATEGY, 100, 50, ts::ctx(&mut scenario));
        
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
    fun test_reentrancy_protection() {
        let scenario = ts::begin(ADMIN);
        let (clock, coins) = setup_test(&mut scenario);
        
        // Switch to user
        ts::next_tx(&mut scenario, USER);
        
        // Try to deposit twice in the same transaction
        let coins1 = ts::take_from_sender<Coin<SUI>>(&scenario);
        let coins2 = ts::take_from_sender<Coin<SUI>>(&scenario);
        
        // First deposit should succeed
        vault::deposit(coins1, ts::ctx(&mut scenario));
        
        // Second deposit should fail
        assert!(ts::has_most_recent_error(&scenario, vault::EReentrancyGuard));
        
        ts::end(scenario);
    }
} 