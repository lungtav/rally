import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../lib/api";

export function VerifyOtpPage() {
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(
    searchParams.get("email") ?? "",
  );
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setSubmitting(true);
    try {
      await verifyOtp(email, otp);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Verify your email</h1>
        <p className="mt-1 text-sm text-slate-600">
          We sent a 6-digit code to your inbox. Enter it below to activate your
          account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Verification code
            </span>
            <input
              required
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              className={`${inputClass} text-center text-lg tracking-[0.5em]`}
            />
          </label>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? "Verifying…" : "Verify & continue"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Didn’t get a code? The email is sent once at signup — go back and sign
          up again, or{" "}
          <Link
            to={`/signup${email ? `?email=${encodeURIComponent(email)}` : ""}`}
            className="font-medium text-emerald-700 hover:underline"
          >
            create a new account
          </Link>
          .
        </p>
      </div>
    </div>
  );
}