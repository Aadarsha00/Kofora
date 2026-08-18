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
        // "route" is included even though it lacks a street_number by itself -
        // it's what Google typically suggests while a user is still mid-typing
        // a house number, and excluding it was cutting off most in-progress
        // suggestions, not just landmarks/businesses.
        const element = new PlaceAutocompleteElement({
          includedPrimaryTypes: ["street_address", "premise", "subpremise", "route"],
          // The store only ships to the US (see UPS_SHIPPER_COUNTRY) and Canada -
          // restricting here means Google never returns/bills for predictions
          // outside them in the first place, not just hiding them client-side.
          includedRegionCodes: ["us", "ca"],
        });
        // The element declares color-scheme: light dark on its own host, which
        // wins over anything set on ancestors. Overriding it here directly (inline
        // style beats the component's internal rule) forces it - and its shadow
        // tree, including the suggestions dropdown - to render light regardless
        // of the browser/OS dark-mode preference.
        element.style.setProperty("color-scheme", "light");
        // The element renders its own internal input with no border, so the
        // visible border/padding is supplied by the wrapper div (className)
        // instead - this just makes the element fill that box edge-to-edge so
        // it lines up with sibling <input> fields instead of floating inside.
        element.style.setProperty("width", "100%");
        element.style.setProperty("display", "block");
        // font-size on the wrapper div alone doesn't reach the element's own
        // internal input across the shadow boundary - set directly on the
        // element so it actually matches sibling text-sm inputs (14px) rather
        // than the element's own larger default.
        element.style.setProperty("font-size", "14px");
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
