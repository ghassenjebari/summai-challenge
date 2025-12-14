import { z } from "zod"


export const env = z
    .object({
        VITE_ENVIRONMENT: z.enum(["development", "production"]).default("development"),
        VITE_API_URL: z.string().default("ws://localhost:8000"),
    })
    .parse(import.meta.env)

