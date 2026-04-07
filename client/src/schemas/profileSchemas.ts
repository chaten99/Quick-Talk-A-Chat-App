import { z } from "zod";

export const profileSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be at most 30 characters"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
