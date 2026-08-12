"use client";

import { useEffect, useRef, useState } from "react";

const GOOGLE_IDENTITY_SCRIPT = "https://accounts.google.com/gsi/client";
let googleScriptPromise: Promise<void> | null = null;

function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Google sign-in is unavailable."));
  if (window.google?.accounts?.id) return Promise.resolve();

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(
        `script[src="${GOOGLE_IDENTITY_SCRIPT}"]`
      );

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Google sign-in failed to load.")), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = GOOGLE_IDENTITY_SCRIPT;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Google sign-in failed to load."));
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
}

interface GoogleSignInButtonProps {
  disabled?: boolean;
  text?: "continue_with" | "signup_with" | "signin_with";
  onCredential: (credential: string) => void;
  onError?: (message: string) => void;
}

export default function GoogleSignInButton({
  disabled = false,
  text = "continue_with",
  onCredential,
  onError,
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const missingConfigError = clientId ? null : "Google sign-in is not configured.";

  useEffect(() => {
    let cancelled = false;

    if (!clientId) {
      return;
    }

    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !buttonRef.current || !window.google?.accounts?.id) return;

        setSetupError(null);
        buttonRef.current.innerHTML = "";
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              onCredential(response.credential);
              return;
            }
            onError?.("Google did not return a sign-in credential.");
          },
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text,
          shape: "rectangular",
          logo_alignment: "left",
          width: 400,
        });
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setSetupError(error.message);
        onError?.(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, onCredential, onError, text]);

  const visibleError = missingConfigError ?? setupError;

  return (
    <div className={disabled ? "pointer-events-none opacity-60" : undefined}>
      <div ref={buttonRef} className="flex justify-center" />
      {visibleError && <p className="text-red-500 text-xs mt-2 text-center">{visibleError}</p>}
    </div>
  );
}
