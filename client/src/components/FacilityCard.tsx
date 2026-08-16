import { Link } from "react-router-dom";
import type { Facility } from "../types";
import {
  facilityTypeLabel,
  formatHHMM,
} from "../lib/format";

export function FacilityCard({ facility }: { facility: Facility }) {
  return (
    <Link
      to={`/facilities/${facility.id}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-700">
          {facility.name}
        </h3>
        <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-800">
          {facilityTypeLabel(facility.type)}
        </span>
      </div>
      <p className="mb-4 flex-1 text-sm text-slate-600">
        {facility.description || "No description provided."}
      </p>
      <p className="text-sm font-medium text-slate-700">
        {formatHHMM(facility.opens_at)} – {formatHHMM(facility.closes_at)}
      </p>
    </Link>
  );
}