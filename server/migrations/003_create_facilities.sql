CREATE TABLE IF NOT EXISTS facilities(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('basketball','badminton','tennis', 'football_pitch')),
    description TEXT,
    opens_at TIME NOT NULL,
    closes_at TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CHECK (closes_at > opens_at)
);