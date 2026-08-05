import { z } from "zod";
import {
  ASSIGNABLE_STAFF_ROLES,
  CREATE_STAFF_DEPARTMENTS,
  STAFF_DEPARTMENTS,
  STAFF_STATUSES,
} from "@/features/staff/types";

export const staffListFiltersSchema = z.object({
  q: z.string().trim().max(200).optional().default(""),
  role: z.string().trim().max(40).optional().default(""),
  department: z.string().trim().max(40).optional().default(""),
  status: z.string().trim().max(40).optional().default(""),
  sort: z.enum(["newest", "oldest", "name"]).optional().default("newest"),
  page: z.coerce.number().int().min(1).default(1),
});

export const createStaffSchema = z.object({
  email: z.string().trim().email().max(200),
  first_name: z.string().trim().min(1).max(60),
  last_name: z.string().trim().min(1).max(60),
  role: z.enum(ASSIGNABLE_STAFF_ROLES),
  department: z.enum(CREATE_STAFF_DEPARTMENTS),
});

export const updateStaffProfileSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(40).optional().nullable(),
  department: z.enum(STAFF_DEPARTMENTS).nullable().optional(),
  department_custom: z.string().trim().max(120).optional().nullable(),
  timezone: z.string().trim().max(80).optional().nullable(),
  locale: z.string().trim().min(2).max(10).optional().nullable(),
  biography: z.string().trim().max(4000).optional().nullable(),
  notes: z.string().trim().max(8000).optional().nullable(),
  avatar_url: z
    .preprocess(
      (value) => (value === "" || value === undefined ? null : value),
      z.string().trim().url().max(500).nullable(),
    )
    .optional(),
});

export const updateStaffRoleSchema = z.object({
  id: z.string().uuid(),
  role: z.enum([
    "owner",
    "admin",
    "manager",
    "support",
    "moderator",
    "content_manager",
    "finance",
    "viewer",
  ]),
});

export const updateStaffStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(STAFF_STATUSES),
});

export const updateStaffDepartmentSchema = z.object({
  id: z.string().uuid(),
  department: z.enum(STAFF_DEPARTMENTS).nullable(),
  department_custom: z.string().trim().max(120).optional().nullable(),
});

export const assignCreatorSchema = z.object({
  staff_id: z.string().uuid(),
  creator_id: z.string().uuid(),
});

export const assignApplicationSchema = z.object({
  staff_id: z.string().uuid(),
  application_id: z.string().uuid(),
});

export const assignTaskSchema = z.object({
  staff_id: z.string().uuid(),
  task_id: z.string().uuid(),
});

export const transferOwnershipSchema = z.object({
  id: z.string().uuid(),
});
