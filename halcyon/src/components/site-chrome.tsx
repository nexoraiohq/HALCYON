"use client";

import { usePathname } from "next/navigation";

/**
 * Renders the public site chrome (header, footer, cookie consent) around the
 * page — and steps aside entirely on the management console.
 */
export default function SiteChrome({
  children,
  header,
  footer,
  consent,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  consent: React.ReactNode;
}) {
  const pathname = usePathname();
  const isManagement = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isManagement) return <>{children}</>;

  return (
    <>
      {header}
      <main id="main">{children}</main>
      {footer}
      {consent}
    </>
  );
}
