module yulo::yulo_token {
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin, CoinMetadata, TreasuryCap};
    use sui::event;

    /// The type identifier of YULO
    struct YULO has drop {}

    // ===== Events =====
    struct TokenMinted has copy, drop {
        amount: u64,
        recipient: address,
    }

    struct TokenBurned has copy, drop {
        amount: u64,
        burner: address,
    }

    // ===== Functions =====
    fun init(ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(
            YULO {},
            9, // decimals
            b"YULO", // symbol
            b"Yulo Protocol Token", // name
            b"YULO is the governance token of Yulo Protocol", // description
            url::new_unsafe_from_bytes(b"https://yulo.io"), // url
            ctx
        );

        // Transfer the treasury cap to the module publisher
        transfer::transfer(treasury_cap, tx_context::sender(ctx));
        // Make the metadata immutable and shared
        transfer::share_object(metadata);
    }

    public fun mint(
        treasury_cap: &mut TreasuryCap<YULO>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let coins = coin::mint(treasury_cap, amount, ctx);
        transfer::public_transfer(coins, recipient);

        event::emit(TokenMinted {
            amount,
            recipient,
        });
    }

    public fun burn(coins: Coin<YULO>) {
        let YULO {} = coin::into_balance(coins);
        event::emit(TokenBurned {
            amount: coin::value(&coins),
            burner: @yulo,
        });
    }
} 