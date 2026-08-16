import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { api, getErrorMessage } from "../lib/api";
import type { ListAllBookingsResponse } from "../types";
import { Spinner } from "../components/Spinner";
import { ErrorState } from "../components/ErrorState";
import { Pagination } from "../components/Pagination";
import { formatDateTime, facilityTypeLabel } from "../lib/format";

const PAGE_SIZE = 15;

export function AdminBookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") ?? "";
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);

  const query = useQuery({
    queryKey: ["admin-bookings", status, page],
    queryFn: async () => {
      const { data } = await api.get<ListAllBookingsResponse>("/bookings", {
        params: {
          page,
          limit: PAGE_SIZE,
          ...(status ? { status } : {}),
        },
      });
      return data;
    },
  });

  const updateParams = (patch: { status?: string; page?: number }) => {
    setSearchParams({
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.page !== undefined ? { page: String(patch.page) } : {}),
    });
  };

  const filterClass = (active: boolean) =>
    `rounded-md px-4 py-2 text-sm font-medium transition ${
      active
        ? "bg-emerald-600 text-white"
        : "text-slate-700 hover:bg-slate-100"
    }`;

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">All bookings</h1>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => updateParams({ status: "", page: 1 })}
          className={filterClass(status === "")}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => updateParams({ status: "upcoming", page: 1 })}
          className={filterClass(status === "upcoming")}
        >
          Upcoming
        </button>
        <button
          type="button"
          onClick={() => updateParams({ status: "history", page: 1 })}
          className={filterClass(status === "history")}
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
        ) : (query.data?.bookings ?? []).length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            No bookings{status ? ` (${status})` : ""}.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Facility</th>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Start</th>
                    <th className="px-4 py-3 font-medium">End</th>
                    <th className="px-4 py-3 font-medium">Booked at</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(query.data?.bookings ?? []).map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">
                          {booking.facility_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {facilityTypeLabel(booking.facility_type)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-800">{booking.username}</div>
                        <div className="text-xs text-slate-500">
                          {booking.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatDateTime(booking.start_time)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatDateTime(booking.end_time)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDateTime(booking.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              totalPages={query.data?.pagination.totalPages ?? 1}
              onPage={(next) => updateParams({ page: next })}
            />
          </>
        )}
      </div>
    </div>
  );
}