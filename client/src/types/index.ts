export interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  is_email_verified?: boolean;
  created_at?: string;
}

export type FacilityType = "basketball" | "badminton" | "tennis" | "football_pitch";

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  description: string | null;
  opens_at: string;
  closes_at: string;
  created_at: string;
}

export interface FacilityInput {
  name: string;
  type: FacilityType;
  description?: string;
  opensAt: string;
  closesAt: string;
}

export interface FacilityAvailability {
  start_time: string;
  end_time: string;
  facility_id: string;
}

export interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  created_at: string;
  facility_id: string;
  user_id: string;
}

export interface MyBooking {
  name: string;
  start_time: string;
  end_time: string;
}

export interface CreateBookingInput {
  startTime: string;
  hours: number;
  facilityId: string;
}

// Response shapes
export interface LoginResponse {
  message: string;
  accessToken: string;
  user: User;
}

export interface SignupResponse {
  message: string;
  user: Pick<User, "id" | "username" | "email" | "role" | "created_at">;
}

export interface MeResponse {
  message: string;
  user: Pick<User, "id" | "username" | "email" | "role">;
}

export interface ListFacilitiesResponse {
  message: string;
  page: number;
  totalPages: number;
  facilities: Facility[];
}

export interface FacilityResponse {
  message: string;
  facility: Facility;
}

export interface AvailabilityResponse {
  message: string;
  bookings: FacilityAvailability[];
}

export interface CreateBookingResponse {
  message: string;
  booking: Booking;
  facility: { name: string };
}

export interface MyBookingsResponse {
  message: string;
  bookings: MyBooking[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminBooking extends Booking {
  facility_name: string;
  facility_type: FacilityType;
  username: string;
  email: string;
}

export interface ListAllBookingsResponse {
  message: string;
  bookings: AdminBooking[];
  pagination: PaginationInfo;
}

export interface GeneralResponse {
  message: string;
}

export interface ApiErrorBody {
  error: { code: string; message: string };
}