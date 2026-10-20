"use client";

import { createContext, useContext } from "react";
import type { Agent, AdminUser, Enquiry, EnquiryStatus, JournalPost, Property } from "@/lib/api-types";

export type Tab = "dashboard" | "properties" | "enquiries" | "journal" | "people" | "users" | "settings";

export type ApiStatus = "checking" | "connected" | "degraded" | "local";

/** Alias kept for existing imports — enquiries are database records only. */
export type AdminEnquiry = Enquiry;

export type Toast = { kind: "ok" | "error" | "info"; msg: string; id: number };

export type AdminCtx = {
  hydrated: boolean;
  configured: boolean;
  status: ApiStatus;
  user: AdminUser | null;
  token: string;
  tab: Tab;
  setTab: (t: Tab) => void;
  loading: boolean;

  properties: Property[];
  journal: JournalPost[];
  agents: Agent[];
  enquiries: AdminEnquiry[];
  users: AdminUser[];

  toast: Toast | null;
  notify: (kind: Toast["kind"], msg: string) => void;

  refresh: (opts?: { silent?: boolean }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;

  saveProperty: (orig: Property | null, input: Property) => Promise<void>;
  deleteProperty: (slug: string) => Promise<void>;
  saveJournal: (orig: JournalPost | null, input: JournalPost) => Promise<void>;
  deleteJournal: (slug: string) => Promise<void>;
  saveAgent: (orig: Agent | null, input: Agent) => Promise<void>;
  deleteAgent: (slug: string) => Promise<void>;
  setEnquiryStatus: (id: string, status: EnquiryStatus) => Promise<void>;
  deleteEnquiry: (id: string) => Promise<void>;
  upload: (file: File) => Promise<string>;

  propertyFormOpen: boolean;
  editingProperty: Property | null;
  openPropertyForm: (p?: Property | null) => void;
  closePropertyForm: () => void;
};

export const AdminContext = createContext<AdminCtx | null>(null);

export function useAdmin(): AdminCtx {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}
