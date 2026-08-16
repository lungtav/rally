import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../lib/api";
import { useState } from "react";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-emerald-100 text-emerald-800"
      : "text-slate-700 hover:bg-slate-100"
  }`;

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      setLoggingOut(false);
      console.error(getErrorMessage(error));
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-emerald-700"
          >
            Rally
          </Link>
          <nav className="flex flex-1 flex-wrap items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Facilities
            </NavLink>
            <NavLink to="/bookings" className={navLinkClass}>
              My Bookings
            </NavLink>
            {user?.role === "admin" && (
              <>
                <NavLink to="/admin/facilities" className={navLinkClass}>
                  Manage Facilities
                </NavLink>
                <NavLink to="/admin/bookings" className={navLinkClass}>
                  All Bookings
                </NavLink>
              </>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <NavLink
                  to="/profile"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  {user.username}
                </NavLink>
                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={handleLogout}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-sm text-slate-500">
          Rally — book your court.
        </div>
      </footer>
    </div>
  );
}