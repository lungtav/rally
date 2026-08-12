CREATE TABLE IF NOT EXISTS users(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    email TEXT NOT NULL UNIQUE,
    is_email_verified BOOLEAN DEFAULT false,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL default 'user' 
        CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);