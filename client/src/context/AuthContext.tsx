import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  api,
  getErrorMessage,
  setAccessToken,
} from "../lib/api";
import type { LoginResponse, SignupResponse, User } from "../types";

interface AuthContextValue {
  user: User | null;
  isHydrating: boolean;
  signup: (input: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { data } = await api.get<{ user: User }>("/users/me");
        if (active) {
          setUser(data.user);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setIsHydrating(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const signup = useCallback(
    async (input: {
      username: string;
      email: string;
      password: string;
      confirmPassword: string;
    }) => {
      await api.post<SignupResponse>("/auth/signup", input);
    },
    [],
  );

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const { data } = await api.post<LoginResponse>("/auth/verify-otp", {
      email,
      otp,
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error(getErrorMessage(error));
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isHydrating, signup, verifyOtp, login, logout }),
    [user, isHydrating, signup, verifyOtp, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}