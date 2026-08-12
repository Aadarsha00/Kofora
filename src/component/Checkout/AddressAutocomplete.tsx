"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMapsScript, parsePlaceAddress, ParsedAddress } from "@/lib/googleMaps";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: ParsedAddress) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Address line 1",
  className = "",
  required = false,
}: AddressAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState("");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || !containerRef.current) return;

    let cancelled = false;
    const container = containerRef.current;

    loadGoogleMapsScript(apiKey)
      .then(async () => {
        if (cancelled || typeof window.google?.maps?.importLibrary !== "function") return;

        const { PlaceAutocompleteElement } = await window.google.maps.importLibrary("places");
        if (cancelled || !container) return;

        setLoadError("");
        // Restrict to real addresses. Without this, landmark/business predictions
        // (e.g. "Apple Park") can get selected and lack street_number/route
        // components entirely, so parsePlaceAddress has nothing to extract.
        const element = new PlaceAutocompleteElement({
          includedPrimaryTypes: ["street_address", "premise", "subpremise"],
        });
        // The element declares color-scheme: light dark on its own host, which
        // wins over anything set on ancestors. Overriding it here directly (inline
        // style beats the component's internal rule) forces it - and its shadow
        // tree, including the suggestions dropdown - to render light regardless
        // of the browser/OS dark-mode preference.
        element.style.setProperty("color-scheme", "light");
        element.placeholder = placeholder;
        if (required) element.setAttribute("required", "");
        if (value) element.value = value;

        element.addEventListener("input", (event) => {
          onChange((event.target as HTMLInputElement).value ?? element.value);
        });

        element.addEventListener("gmp-select", async (event) => {
          const place = event.placePrediction.toPlace();
          await place.fetchFields({ fields: ["addressComponents"] });
          if (!place.addressComponents) return;
          onAddressSelect(parsePlaceAddress(place));
        });

        container.innerHTML = "";
        container.appendChild(element);
      })
      .catch((error: Error) => {
        if (!cancelled) setLoadError(error.message);
      });

    return () => {
      cancelled = true;
      container.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  return (
    <>
      <div ref={containerRef} className={className} />
      {loadError && <p className="col-span-full text-xs text-red-600">{loadError}</p>}
    </>
  );
}
