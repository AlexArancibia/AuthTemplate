import { object, string, boolean, z } from "zod";

const addressTypeEnum = z.enum(["shipping", "billing", "both"]);

/** Allowlist para crear dirección. Excluye: id, userId, createdAt, updatedAt. */
export const addressCreateSchema = object({
  addressType: addressTypeEnum.default("both"),
  address1: string().min(1, "La dirección es requerida").max(300),
  address2: string().max(300).optional().nullable(),
  city: string().min(1, "La ciudad es requerida").max(100),
  province: string().max(100).optional().nullable(),
  zip: string().min(1, "El código postal es requerido").max(20),
  country: string().min(1, "El país es requerido").max(100),
  phone: string().max(30).optional().nullable(),
  company: string().max(100).optional().nullable(),
  isDefault: boolean().optional(),
}).strict();

/** Allowlist para actualizar dirección. Excluye: id, userId, createdAt, updatedAt. */
export const addressPatchSchema = object({
  address1: string().min(1).max(300).optional(),
  address2: string().max(300).optional().nullable(),
  city: string().min(1).max(100).optional(),
  province: string().max(100).optional().nullable(),
  zip: string().min(1).max(20).optional(),
  country: string().min(1).max(100).optional(),
  phone: string().max(30).optional().nullable(),
  company: string().max(100).optional().nullable(),
  isDefault: boolean().optional(),
  addressType: addressTypeEnum.optional(),
}).strict();

/** Allowlist of fields a user can update on their own profile. Excludes: id, email (ignored), password, emailVerified, role, createdAt, updatedAt. */
export const userPatchSchema = object({
  name: string().max(100).optional().nullable(),
  firstName: string().max(100).optional().nullable(),
  lastName: string().max(100).optional().nullable(),
  email: string().email().optional(), // accepted from form but never applied (read-only)
  phone: string().max(30).optional().nullable(),
  company: string().max(100).optional().nullable(),
  taxId: string().max(30).optional().nullable(),
  image: string().url().max(500).optional().nullable(),
  acceptsMarketing: boolean().optional(),
}).strict(); // reject unknown keys (e.g. role, password)

export const loginSchema = object({
  email: string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(6, "Password must be more than 6 characters")
    .max(32, "Password must be less than 32 characters"),
});

export const registerSchema = object({
  email: string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(6, "Password must be more than 6 characters")
    .max(32, "Password must be less than 32 characters"),
  name: string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(32, "Name must be less than 32 characters"),
});
