const GA_ID = window.NEXT_PUBLIC_GA_ID || window.NEXT_PUBLIC_GTAG_ID || window.NEXT_PUBLIC_GOOGLE_TAG_ID || "G-7MCRTLTXHS";

function initAnalytics() {
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
