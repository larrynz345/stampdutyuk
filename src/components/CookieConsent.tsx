"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie-consent")) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-gray-900 border-t border-gray-700 p-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-gray-300 flex-1">
          This website uses cookies (including Google Analytics and Google AdSense) to improve your experience and serve relevant ads. By continuing to use this site, you consent to our use of cookies.{" "}
          <Link href="/privacy" className="underline text-blue-400 hover:text-blue-300">
            Privacy Policy
          </Link>
        </p>
        <button
          onClick={accept}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shrink-0"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
