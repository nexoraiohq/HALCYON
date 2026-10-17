import type { Metadata } from "next";
import AdminApp from "@/components/admin/admin-app";

export const metadata: Metadata = {
  title: "Management",
  description: "Halcyon management console — residences, enquiries, journal and people.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin" },
};

export default function AdminPage() {
  return <AdminApp />;
}
