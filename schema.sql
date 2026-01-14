-- NextAuth.js PostgreSQL Schema
-- This schema is compatible with @auth/pg-adapter

-- Users table - stores user information
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    "emailVerified" TIMESTAMPTZ,
    image TEXT, -- Legacy field, kept for backward compatibility
    image_original TEXT, -- Original uploaded image URL
    image_cropped TEXT, -- 250x250 cropped image URL
    image_preview TEXT, -- 50x50 preview image URL
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accounts table - stores OAuth account connections
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    "providerAccountId" VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    id_token TEXT,
    scope TEXT,
    session_state TEXT,
    token_type TEXT,
    UNIQUE(provider, "providerAccountId")
);

-- Sessions table - stores active user sessions
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "sessionToken" VARCHAR(255) UNIQUE NOT NULL,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL
);

-- Verification tokens table - stores email verification tokens
CREATE TABLE IF NOT EXISTS verification_token (
    identifier VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- User edges table - stores relationships between users (followers, friends, friend requests)
CREATE TABLE IF NOT EXISTS user_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- User who initiated the request/action
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- User receiving the request
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending' (follower), 'approved' (friend), 'rejected', 'blocked'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(requester_id, receiver_id), -- Prevent duplicate relationships
    CONSTRAINT no_self_relationship CHECK (requester_id != receiver_id)
);

-- Conversations table - stores chat conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- e.g., 'direct', 'group', 'event'
    title VARCHAR(255),
    event_id UUID, -- Optional reference to events table (if exists)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table - stores individual messages within conversations
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User events table - stores notifications/events for users
CREATE TABLE IF NOT EXISTS user_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- e.g., 'friend.request', 'friend.approved'
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL, -- User who triggered the event
    related_id UUID, -- ID of the related user_edge or other entity
    data JSONB, -- Additional event data
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions("sessionToken");
CREATE INDEX IF NOT EXISTS idx_verification_token_token ON verification_token(token);
CREATE INDEX IF NOT EXISTS idx_user_edges_requester_id ON user_edges(requester_id);
CREATE INDEX IF NOT EXISTS idx_user_edges_receiver_id ON user_edges(receiver_id);
CREATE INDEX IF NOT EXISTS idx_user_edges_status ON user_edges(status);
CREATE INDEX IF NOT EXISTS idx_user_edges_requester_receiver ON user_edges(requester_id, receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_event_id ON conversations(event_id);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_user_id_is_read ON user_events(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_user_events_created_at ON user_events(created_at DESC);

-- Optional: Add a trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_edges_updated_at BEFORE UPDATE ON user_edges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();