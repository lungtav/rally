CREATE TABLE IF NOT EXISTS refresh_tokens(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    token_hash TEXT NOT NULL,
    session_information TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,

    user_id UUID NOT NULL REFERENCES users(id),
    replaced_by_token_id UUID REFERENCES refresh_tokens(id) ON DELETE SET NULL
);