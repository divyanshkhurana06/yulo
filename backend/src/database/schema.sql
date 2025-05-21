-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    profile_image_url TEXT,
    bio TEXT,
    twitter_handle TEXT,
    discord_handle TEXT
);

-- Vaults table
CREATE TABLE vaults (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    creator_id UUID REFERENCES users(id),
    is_public BOOLEAN DEFAULT true,
    apy DECIMAL,
    total_value_locked DECIMAL,
    strategy_type TEXT,
    risk_level TEXT
);

-- User vault positions
CREATE TABLE user_vault_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    vault_id UUID REFERENCES vaults(id),
    amount DECIMAL NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, vault_id)
);

-- Vault performance history
CREATE TABLE vault_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id UUID REFERENCES vaults(id),
    timestamp TIMESTAMPTZ NOT NULL,
    apy DECIMAL,
    total_value_locked DECIMAL,
    price_data JSONB,
    transaction_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price data
CREATE TABLE price_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feed_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    price DECIMAL NOT NULL,
    confidence DECIMAL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User activity log
CREATE TABLE user_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    activity_type TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_vaults_address ON vaults(address);
CREATE INDEX idx_vault_performance_vault_id ON vault_performance(vault_id);
CREATE INDEX idx_user_vault_positions_user_id ON user_vault_positions(user_id);
CREATE INDEX idx_price_data_feed_id ON price_data(feed_id);
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaults_updated_at
    BEFORE UPDATE ON vaults
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_vault_positions_updated_at
    BEFORE UPDATE ON user_vault_positions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 