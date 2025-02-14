import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status_id: z.number().min(1),
  priority_id: z.number().min(1),
  type_id: z.number().min(1)
}); 