"use client";

export default function CookieSettingsButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        try {
          localStorage.removeItem("vensamproperties-consent");
        } catch {
          /* storage unavailable */
        }
        window.dispatchEvent(new Event("vensamproperties:consent-settings"));
      }}
    >
      Cookie settings
    </button>
  );
}
