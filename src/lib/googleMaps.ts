const GOOGLE_MAPS_SCRIPT_ID = "google-maps-places-script";
let googleMapsScriptPromise: Promise<void> | null = null;

// google.maps.importLibrary is wired up asynchronously by the bootstrap script
// a beat after its "load" event fires, so poll briefly instead of assuming
// it's ready the instant the <script> tag reports loaded.
function waitForImportLibrary(timeoutMs = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (typeof window.google?.maps?.importLibrary === "function") {
        resolve();
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error("Google Maps loaded but importLibrary never became available."));
        return;
      }
      setTimeout(check, 50);
    };
    check();
  });
}

export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Google Maps is unavailable."));
  if (typeof window.google?.maps?.importLibrary === "function") return Promise.resolve();

  if (!googleMapsScriptPromise) {
    googleMapsScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;

      if (existingScript) {
        existingScript.addEventListener("load", () => waitForImportLibrary().then(resolve, reject), { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Google Maps failed to load.")), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.id = GOOGLE_MAPS_SCRIPT_ID;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => waitForImportLibrary().then(resolve, reject);
      script.onerror = () => {
        googleMapsScriptPromise = null;
        reject(new Error("Google Maps failed to load."));
      };
      document.head.appendChild(script);
    });
  }

  return googleMapsScriptPromise;
}

export interface ParsedAddress {
  address_line_1: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
}

export function parsePlaceAddress(place: google.maps.places.Place): ParsedAddress {
  const components = place.addressComponents ?? [];

  const get = (type: string, useShortText = false): string => {
    const match = components.find((component) => component.types.includes(type));
    if (!match) return "";
    return (useShortText ? match.shortText : match.longText) ?? "";
  };

  const streetNumber = get("street_number");
  const route = get("route");

  return {
    address_line_1: [streetNumber, route].filter(Boolean).join(" "),
    city: get("locality") || get("postal_town") || get("sublocality"),
    state_province: get("administrative_area_level_1"),
    postal_code: get("postal_code"),
    country: get("country", true),
  };
}
