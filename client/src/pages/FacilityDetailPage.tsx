import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { api, getErrorMessage } from "../lib/api";
import type {
  AvailabilityResponse,
  FacilityResponse,
} from "../types";
import { Spinner } from "../components/Spinner";
import { ErrorState } from "../components/ErrorState";
import { BookingForm } from "../components/BookingForm";
import {
  facilityTypeLabel,
  formatDateTime,
  formatHHMM,
} from "../lib/format";

export function FacilityDetailPage() {
  const { id } = useParams<{ id: string }>();

  const facilityQuery = useQuery({
    queryKey: ["facility", id],
    queryFn: async () => {
      const { data } = await api.get<FacilityResponse>(`/facilities/${id}`);
      return data.facility;
    },
    enabled: Boolean(id),
  });

  const availabilityQuery = useQuery({
    queryKey: ["availability", id],
    queryFn: async () => {
      const { data } = await api.get<AvailabilityResponse>(
        `/facilities/${id}/availability`,
      );
      return data.bookings;
    },
    enabled: Boolean(id),
  });

  if (facilityQuery.isLoading) {
    return <Spinner />;
  }

  if (facilityQuery.isError || !facilityQuery.data) {
    return (
      <ErrorState
        message={getErrorMessage(facilityQuery.error)}
        onRetry={() => facilityQuery.refetch()}
      />
    );
  }

  const facility = facilityQuery.data;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/"
        className="text-sm font-medium text-emerald-700 hover:underline"
      >
        ← Back to facilities
      </Link>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {facility.name}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {facility.description || "No description provided."}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-800">
            {facilityTypeLabel(facility.type)}
          </span>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-700">
          Open daily {formatHHMM(facility.opens_at)} –{" "}
          {formatHHMM(facility.closes_at)}
        </p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <BookingForm facility={facility} />

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Existing bookings
          </h3>
          {availabilityQuery.isLoading ? (
            <p className="mt-3 text-sm text-slate-500">Loading…</p>
          ) : availabilityQuery.isError ? (
            <p className="mt-3 text-sm text-red-700">
              {getErrorMessage(availabilityQuery.error)}
            </p>
          ) : (availabilityQuery.data ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              No bookings yet — this facility is wide open.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {(availabilityQuery.data ?? []).map((booking, index) => (
                <li
                  key={index}
                  className="rounded-md bg-slate-50 px-3 py-2"
                >
                  {formatDateTime(booking.start_time)} –{" "}
                  {formatDateTime(booking.end_time)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}