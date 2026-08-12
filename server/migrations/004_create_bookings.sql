CREATE TABLE IF NOT EXISTS bookings(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_payment' 
        CHECK(status IN ( 'pending_payment', 'cancelled', 'confirmed', 'expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,

    facility_id UUID NOT NULL REFERENCES facilities(id),
    user_id UUID NOT NULL REFERENCES users(id),

    CHECK (end_time > start_time)
);