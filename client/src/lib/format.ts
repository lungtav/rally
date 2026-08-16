const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  const day = days[date.getDay()];
  const month = months[date.getMonth()];
  const time = formatTime(date.getHours(), date.getMinutes());
  return `${day}, ${months[date.getMonth()] !== month ? "" : `${day}, `}${date.getDate()} ${month} · ${time}`;
}

export function formatStartEnd(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const day = days[start.getDay()];
  const month = months[start.getMonth()];
  const startTime = formatTime(start.getHours(), start.getMinutes());
  const endTime = formatTime(end.getHours(), end.getMinutes());
  return `${day}, ${start.getDate()} ${month} · ${startTime} – ${endTime}`;
}

export function formatTime(hours: number, minutes: number): string {
  const period = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 === 0 ? 12 : hours % 12;
  const m = minutes.toString().padStart(2, "0");
  return `${h}:${m} ${period}`;
}

export function formatHHMM(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (h === undefined || m === undefined || Number.isNaN(h) || Number.isNaN(m)) {
    return hhmm;
  }
  return formatTime(h, m);
}

export function facilityTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    basketball: "Basketball",
    badminton: "Badminton",
    tennis: "Tennis",
    football_pitch: "Football Pitch",
  };
  return labels[type] ?? type;
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function todayInputValue(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const d = now.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function buildEndTime(
  date: string,
  time: string,
  hours: number,
): string {
  const start = new Date(`${date}T${time}`);
  const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
  return `${end.getHours().toString().padStart(2, "0")}:${end
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}