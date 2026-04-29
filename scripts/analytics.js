function resolveGaId() {
  const source = window.__PREPIFY_PUBLIC_CONFIG__ || window;
  return source.NEXT_PUBLIC_GA_ID || source.NEXT_PUBLIC_GTAG_ID || source.NEXT_PUBLIC_GOOGLE_TAG_ID || source.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "";
}

const GA_ID = resolveGaId();

function initAnalytics() {
  if (!GA_ID) {
    console.warn("[Prepify11Plus] Analytics ID missing. Set NEXT_PUBLIC_GA_ID/NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID.");
    return;
  }
  if (window.__prepifyAnalyticsInit) return;
  window.__prepifyAnalyticsInit = true;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(){window.dataLayer.push(arguments);};
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { anonymize_ip: true });
}

export function trackEvent(eventName, params = {}) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}

export function trackPageView(path = window.location.pathname) {
  trackEvent("page_view", { page_path: path });
}

initAnalytics();
