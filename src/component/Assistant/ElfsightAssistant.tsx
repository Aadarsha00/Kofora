import Script from "next/script";

const ELFSIGHT_APP_ID = "f118e17a-3617-4a1f-9ad4-716c2dec2776";

export default function ElfsightAssistant() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <>
      <Script src="https://elfsightcdn.com/platform.js" strategy="afterInteractive" />
      <div className={`elfsight-app-${ELFSIGHT_APP_ID}`} data-elfsight-app-lazy />
    </>
  );
}
