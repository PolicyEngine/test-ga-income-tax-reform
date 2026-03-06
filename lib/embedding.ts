export function getCountryFromHash(): string {
  if (typeof window === "undefined") return "us";
  const params = new URLSearchParams(window.location.hash.slice(1));
  return params.get("country") || "us";
}

export function isEmbedded(): boolean {
  if (typeof window === "undefined") return false;
  return window.self !== window.top;
}

export function updateHash(params: Record<string, string>, countryId: string) {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => p.set(k, v));
  if (countryId !== "us" && !isEmbedded()) p.set("country", countryId);
  const hash = `#${p.toString()}`;
  window.history.replaceState(null, "", hash);
  if (isEmbedded()) {
    window.parent.postMessage({ type: "hashchange", hash }, "*");
  }
}

export function getShareUrl(countryId: string, slug: string): string {
  const hash = window.location.hash;
  if (isEmbedded()) {
    return `https://policyengine.org/${countryId}/${slug}${hash}`;
  }
  return window.location.href;
}
