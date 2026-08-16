import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "../lib/api";
import type {
  CreateBookingResponse,
  Facility,
} from "../types";
import {
  buildEndTime,
  formatDateTime,
  toMinutes,
  todayInputValue,
} from "../lib/format";

const MAX_HOURS = 8;

export function BookingForm({ facility }: { facility: Facility }) {
  const queryClient = useQueryClient();

  const [date, setDate] = useState(todayInputValue());
  const [time, setTime] = useState("");
  const [hours, setHours] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<CreateBookingResponse | null>(null);

  const validation = useMemo(() => {
    if (!date || !time) {
      return { ok: false, message: "Pick a date and time." };
    }

    const start = new Date(`${date}T${time}`);
    if (start <= new Date()) {
      return { ok: false, message: "Start time must be in the future." };
    }

    const opens = toMinutes(facility.opens_at);
    const closes = toMinutes(facility.closes_at);
    const startMin = toMinutes(time);
    const endMin = toMinutes(buildEndTime(date, time, hours));

    if (startMin < opens) {
      return {
        ok: false,
        message: `Facility opens at ${facility.opens_at}.`,
      };
    }
    if (endMin > closes) {
      return {
        ok: false,
        message: `Booking must end by ${facility.closes_at}.`,
      };
    }

    return { ok: true, message: "" };
  }, [date, time, hours, facility]);

  const endTime = useMemo(
    () => (date && time ? buildEndTime(date, time, hours) : ""),
    [date, time, hours],
  );

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<CreateBookingResponse>("/bookings", {
        startTime: new Date(`${date}T${time}`).toISOString(),
        hours,
        facilityId: facility.id,
      });
      return data;
    },
    onSuccess: (data) => {
      setError(null);
      setSuccess(data);
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validation.ok) {
      setError(validation.message);
      return;
    }
    mutation.mutate();
  };

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <h3 className="text-lg font-semibold text-emerald-800">
          Booking confirmed
        </h3>
        <p className="mt-1 text-emerald-700">
          {success.facility.name} —{" "}
          {formatDateTime(success.booking.start_time)} to{" "}
          {formatDateTime(success.booking.end_time)}
        </p>
        <button
          type="button"
          onClick={() => setSuccess(null)}
          className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Book another slot
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="mb-4 text-lg font-semibold text-slate-900">
        Book this facility
      </h3>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Date
          </span>
          <input
            type="date"
            required
            min={todayInputValue()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Start time
          </span>
          <input
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Duration (hours)
          </span>
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            {Array.from({ length: MAX_HOURS }, (_, i) => i + 1).map((h) => (
              <option key={h} value={h}>
                {h} hour{h === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-4 text-sm text-slate-600">
        {date && time
          ? `${time} – ${endTime} (${hours} hour${hours === 1 ? "" : "s"})`
          : "Select a date and time to see the slot preview."}
      </p>

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="mt-4 w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {mutation.isPending ? "Booking…" : "Book now"}
      </button>
    </form>
  );
}