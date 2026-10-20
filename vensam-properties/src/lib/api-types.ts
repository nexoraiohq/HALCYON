import type { Property, Agent } from "./data";

export type { Property, Agent };

export type PropertyStatus = Property["status"];

export const PROPERTY_STATUSES: PropertyStatus[] = ["For Sale", "For Rent"];

export type JournalPost = {
  slug: string;
  title: string;
  category: string;
  date: string;
  read: string;
  image: string;
  excerpt: string;
};

export type EnquiryStatus = "new" | "read" | "handled";

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  guide: string;
  interest: string;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
};

/** Body of POST /enquiries — status is only meaningful for offline-queued sends. */
export type EnquiryInput = Omit<Enquiry, "id" | "status" | "createdAt"> & {
  status?: EnquiryStatus;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

export type AuthResponse = {
  token: string;
  user: AdminUser;
};

export type HealthResponse = {
  ok?: boolean;
  name?: string;
  version?: string;
  time?: string;
};

export type UploadResponse = {
  url: string;
};

export type ApiErrorCode =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "validation"
  | "server_error"
  | "network"
  | "not_configured";

/**
 * List endpoints may answer either with a bare array or with an envelope —
 * both are accepted by the frontend.
 */
export type ListEnvelope<T> = T[] | { items: T[]; total?: number };

export function unwrapList<T>(payload: ListEnvelope<T> | undefined | null): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}
