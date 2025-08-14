import { z } from "zod";

export const slugParams = z.object({
  params: z.object({
    slug: z.string().min(1).max(64).regex(/^[a-z0-9-]+$/),
  }),
});

