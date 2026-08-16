import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "../lib/api";
import type {
  Facility,
  FacilityInput,
  FacilityResponse,
  GeneralResponse,
  ListFacilitiesResponse,
} from "../types";
import { Spinner } from "../components/Spinner";
import { ErrorState } from "../components/ErrorState";
import { facilityTypeLabel, formatHHMM } from "../lib/format";

const PAGE_SIZE = 100;

const emptyForm: FacilityInput = {
  name: "",
  type: "basketball",
  description: "",
  opensAt: "06:00",
  closesAt: "22:00",
};

export function AdminFacilitiesPage() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-facilities"],
    queryFn: async () => {
      const { data } = await api.get<ListFacilitiesResponse>("/facilities", {
        params: { page: 1, limit: PAGE_SIZE },
      });
      return data.facilities;
    },
  });

  const [form, setForm] = useState<FacilityInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-facilities"] });
    queryClient.invalidateQueries({ queryKey: ["facilities"] });
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        description: form.description?.trim() || undefined,
      };
      if (editingId) {
        const { data } = await api.put<FacilityResponse>(
          `/facilities/${editingId}`,
          payload,
        );
        return data;
      }
      const { data } = await api.post<FacilityResponse>("/facilities", payload);
      return data;
    },
    onSuccess: () => {
      setForm(emptyForm);
      setEditingId(null);
      setError(null);
      invalidate();
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<GeneralResponse>(`/facilities/${id}`);
      return data;
    },
    onSuccess: invalidate,
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  const startEdit = (facility: Facility) => {
    setEditingId(facility.id);
    setForm({
      name: facility.name,
      type: facility.type,
      description: facility.description ?? "",
      opensAt: facility.opens_at,
      closesAt: facility.closes_at,
    });
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    save.mutate();
  };

  const handleDelete = (facility: Facility) => {
    if (
      window.confirm(
        `Delete "${facility.name}"? This removes its bookings too.`,
      )
    ) {
      remove.mutate(facility.id);
    }
  };

  const inputClass =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none";

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Manage facilities</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          {editingId ? "Edit facility" : "Create facility"}
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Name
            </span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Type
            </span>
            <select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as FacilityInput["type"],
                })
              }
              className={inputClass}
            >
              <option value="basketball">Basketball</option>
              <option value="badminton">Badminton</option>
              <option value="tennis">Tennis</option>
              <option value="football_pitch">Football pitch</option>
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Description
            </span>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Opens at
            </span>
            <input
              required
              type="time"
              value={form.opensAt}
              onChange={(e) => setForm({ ...form, opensAt: e.target.value })}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Closes at
            </span>
            <input
              required
              type="time"
              value={form.closesAt}
              onChange={(e) => setForm({ ...form, closesAt: e.target.value })}
              className={inputClass}
            />
          </label>
        </div>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-5 flex gap-3">
          <button
            type="submit"
            disabled={save.isPending}
            className="rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {save.isPending
              ? "Saving…"
              : editingId
                ? "Save changes"
                : "Create facility"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-6">
        {query.isLoading ? (
          <Spinner />
        ) : query.isError ? (
          <ErrorState
            message={getErrorMessage(query.error)}
            onRetry={() => query.refetch()}
          />
        ) : (query.data ?? []).length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            No facilities yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Hours</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(query.data ?? []).map((facility) => (
                  <tr key={facility.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {facility.name}
                    </td>
                    <td className="px-4 py-3">
                      {facilityTypeLabel(facility.type)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatHHMM(facility.opens_at)} –{" "}
                      {formatHHMM(facility.closes_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(facility)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={remove.isPending}
                          onClick={() => handleDelete(facility)}
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}