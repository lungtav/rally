export function Spinner({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div role="status" className="flex w-full justify-center py-10">
      <div
        className={`animate-spin rounded-full border-4 border-emerald-500 border-t-transparent ${className}`}
      />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Spinner className="h-12 w-12" />
    </div>
  );
}