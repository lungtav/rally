ALTER TABLE bookings ADD CONSTRAINT no_overlapping_bookings
EXCLUDE USING gist (
    facility_id WITH =,
    tstzrange(start_time, end_time) WITH &&
) WHERE (status IN ('pending_payment', 'confirmed'));