import * as z from "zod";

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

export const FacilitySchema = z
  .object({
    name: z.string().min(1, "name of facility is invalid"),
    type: z.enum(["basketball", "badminton", "tennis", "football_pitch"], {
      message: "invalid facility type",
    }),
    description: z.string().optional(),
    opensAt: z.string().regex(timeRegex, "opens_at must be in HH:MM format"),
    closesAt: z.string().regex(timeRegex, "closes_at must be in HH:MM format"),
  })
  .refine((data) => data.closesAt > data.opensAt, {
    message: "closesAt must be after opensAt",
    path: ["closesAt"],
  });

export type FacilityInput = z.infer<typeof FacilitySchema>;


