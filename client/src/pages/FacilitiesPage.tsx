import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { api, getErrorMessage } from "../lib/api";
import type { ListFacilitiesResponse } from "../types";
import { FacilityCard } from "../components/FacilityCard";
import { Spinner } from "../components/Spinner";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import { Pagination } from "../components/Pagination";

const PAGE_SIZE = 9;

export function FacilitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);

  const query = useQuery({
    queryKey: ["facilities", page],
    queryFn: async () => {
      const { data } = await api.get<ListFacilitiesResponse>("/facilities", {
        params: { page, limit: PAGE_SIZE },
      });
      return data;
    },
  });

  const setPage = (next: number) => {
    setSearchParams({ page: String(next) });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Facilities</h1>
        <p className="mt-1 text-slate-600">
          Choose a court or pitch and reserve your time.
        </p>
      </div>

      {query.isLoading ? (
        <Spinner />
      ) : query.isError ? (
        <ErrorState
          message={getErrorMessage(query.error)}
          onRetry={() => query.refetch()}
        />
      ) : query.data?.facilities.length === 0 ? (
        <EmptyState message="No facilities available yet." />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {query.data?.facilities.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={query.data?.totalPages ?? 1}
            onPage={setPage}
          />
        </>
      )}
    </div>
  );
}