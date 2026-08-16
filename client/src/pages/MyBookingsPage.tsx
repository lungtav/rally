import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, getErrorMessage } from "../lib/api";
import type { MyBookingsResponse } from "../types";
import { Spinner } from "../components/Spinner";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import { formatStartEnd } from "../lib/format";

type Status = "upcoming" | "history";

export function MyBookingsPage() {
  const [status, setStatus] = useState<Status>("upcoming");

  const query = useQuery({
    queryKey: ["my-bookings", status],
    queryFn: async () => {
      const { data } = await api.get<MyBookingsResponse>("/bookings/me", {
        params: { status },
      });
      return data.bookings;
    },
  });

  const tabClass = (active: boolean) =>
    `rounded-md px-4 py-2 text-sm font-medium transition ${
      active
        ? "bg-emerald-600 text-white"
        : "text-slate-700 hover:bg-slate-100"
    }`;

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">My bookings</h1>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setStatus("upcoming")}
          className={tabClass(status === "upcoming")}
        >
          Upcoming
        </button>
        <button
          type="button"
          onClick={() => setStatus("history")}
          className={tabClass(status === "history")}
        >
          History
        </button>
      </div>

      <div className="mt-6">
        {query.isLoading ? (
          <Spinner />
        ) : query.isError ? (
          <ErrorState
            message={getErrorMessage(query.error)}
            onRetry={() => query.refetch()}
          />
        ) : (query.data ?? []).length === 0 ? (
          <EmptyState
            message={
              status === "upcoming"
                ? "No upcoming bookings. Find a facility to book."
                : "No past bookings yet."
            }
          />
        ) : (
          <ul className="space-y-3">
            {(query.data ?? []).map((booking, index) => (
              <li
                key={index}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {booking.name}
                  </p>
                  <p className="text-sm text-slate-600">
                    {formatStartEnd(booking.start_time, booking.end_time)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    status === "upcoming"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {status === "upcoming" ? "Upcoming" : "Completed"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}