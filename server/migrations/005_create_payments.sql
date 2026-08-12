CREATE TABLE IF NOT EXISTS payments(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    bachs_payment_id TEXT,
    amount NUMERIC(10, 2) CHECK(amount > 0),
    currency VARCHAR(3),
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK(status IN ( 'pending', 'succeeded', 'failed', 'underpaid')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    booking_id UUID NOT NULL REFERENCES bookings(id)
);