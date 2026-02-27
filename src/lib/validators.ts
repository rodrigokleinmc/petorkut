import { z } from "zod";

export const Username = z
  .string()
  .min(3, "mínimo 3 caracteres")
  .max(20, "máximo 20 caracteres")
  .regex(/^[a-z0-9_]+$/i, "use apenas letras, números e _");

export const ProfileOnboardingSchema = z.object({
  username: Username,
  display_name: z.string().min(2).max(40),
  bio: z.string().max(280).optional().default(""),
});

export const PetCreateSchema = z.object({
  username: Username,
  display_name: z.string().min(2).max(40),
  species: z.string().min(2).max(30),
  breed: z.string().max(40).optional().default(""),
  bio: z.string().max(280).optional().default(""),
});

export const PostCreateSchema = z.object({
  author_type: z.enum(["profile", "pet"]),
  author_id: z.string().uuid(),
  content: z.string().min(1).max(2000),
  visibility: z.enum(["public", "followers", "friends", "private"]).default("public"),
});

export const ScrapCreateSchema = z.object({
  to_type: z.enum(["profile", "pet"]),
  to_id: z.string().uuid(),
  content: z.string().min(1).max(700),
});
