import * as z from "zod";

export const CreateBookingSchema = z.object({
  startTime: z
    .string()
    .datetime({ offset: true, message: "enter valid ISO time" }),
  hours: z.coerce.number().int().positive(),
  facilityId: z.uuid("invalid faculty id"),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

export interface ListAllBookingsInput {
  status?: "upcoming" | "history";
  page: number;
  limit: number;
}