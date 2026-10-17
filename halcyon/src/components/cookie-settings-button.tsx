"use client";

export default function CookieSettingsButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        try {
          localStorage.removeItem("halcyon-consent");
        } catch {
          /* storage unavailable */
        }
        window.dispatchEvent(new Event("halcyon:consent-settings"));
      }}
    >
      Cookie settings
    </button>
  );
}
