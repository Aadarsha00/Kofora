type StripeRedirectResult = {
  error?: {
    message?: string;
  };
};

type StripeBrowserClient = {
  redirectToCheckout: (options: { sessionId: string }) => Promise<StripeRedirectResult>;
};

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => StripeBrowserClient | null;
  }
}

let stripeScriptPromise: Promise<void> | null = null;

function loadStripeScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Stripe checkout can only run in the browser."));
  }

  if (window.Stripe) {
    return Promise.resolve();
  }

  if (!stripeScriptPromise) {
    stripeScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://js.stripe.com/v3/"]');
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Stripe.js failed to load.")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Stripe.js failed to load."));
      document.head.appendChild(script);
    });
  }

  return stripeScriptPromise;
}

export async function redirectToStripeCheckout(sessionId: string, checkoutUrl: string): Promise<void> {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    window.location.assign(checkoutUrl);
    return;
  }

  await loadStripeScript();
  const stripe = window.Stripe?.(publishableKey);

  if (!stripe) {
    window.location.assign(checkoutUrl);
    return;
  }

  const result = await stripe.redirectToCheckout({ sessionId });
  if (result.error?.message) {
    throw new Error(result.error.message);
  }
}
