import * as z from "zod";

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "current password is required"),
    newPassword: z.string().min(8, "password must be at least 8 characters"),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "new password must be different from current password",
    path: ["newPassword"],
  });

export type ChangePasswordBody = z.infer<typeof ChangePasswordSchema>;

export interface ChangePasswordInput extends ChangePasswordBody {
  userId: string;
}
