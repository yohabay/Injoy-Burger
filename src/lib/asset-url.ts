// Resolves Lovable CDN asset paths to absolute URLs so they load from any
// environment (Lovable preview, published site, local `bun dev` in VS Code,
// or a self-hosted deploy). We always return the same string on server and
// client to avoid React hydration mismatches.

const CDN_FALLBACK_HOST =
  "https://id-preview--9d7b7526-f23f-4792-b648-1fd58ec24bbb.lovable.app";

export function assetUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return pathOrUrl;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (pathOrUrl.startsWith("/__l5e/")) {
    return CDN_FALLBACK_HOST + pathOrUrl;
  }
  if (pathOrUrl.startsWith("/media/")) {
    return pathOrUrl;
  }
  return pathOrUrl;
}
