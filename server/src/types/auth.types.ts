import * as z from "zod";

export const signUpRequestSchema = z
  .object({
    email: z.string().email("invalid email").toLowerCase(),
    password: z.string().min(8, "password must be at least 8 characters"),
    confirmPassword: z.string(),
    username: z.string().min(1, "username is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpRequestBody = z.infer<typeof signUpRequestSchema>;

export interface SignUpInput {
  username: string;
  email: string;
  password: string;
}

export const verifyOtpSchema = z.object({
  email: z.string().email("invalid email").toLowerCase(),
  otp: z.string().length(6, "code must be 6 digits"),
});

export type VerifyOtpRequestBody = z.infer<typeof verifyOtpSchema>;

export interface VerifyOtpArgBody {
  email: string;
  otp: string;
  sessionInformation: string;
}

export const LoginRequestSchema = z.object({
  email: z.string().email("invalid email").toLowerCase(),
  password: z.string(),
});

export type LoginRequestInput = z.infer<typeof LoginRequestSchema>;

export interface LoginInput {
  email: string;
  password: string;
  sessionInformation: string;
}

export type RefreshInput = {
  refreshToken: string;
};

