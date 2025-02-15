// Reverse proxy for Bearblog using Cloudflare Workers. Allows serving a bearblog.dev site on a custom domain without redirection

const API_HOST = "arush.bearblog.dev" // Replace with your bearblog.dev address
const ASSET_HOST = "arush.bearblog.dev" // Replace with your bearblog.dev address, if different for assets

async function handleRequest(request, ctx) {
  const url = new URL(request.url)
  const pathname = url.pathname
  const search = url.search
  const pathWithParams = pathname + search

  if (pathname.startsWith("/static/")) {
      return retrieveStatic(request, pathWithParams, ctx)
  } else {
      return forwardRequest(request, pathWithParams)
  }
}

async function retrieveStatic(request, pathname, ctx) {
  let response = await caches.default.match(request)
  if (!response) {
      response = await fetch(`https://${ASSET_HOST}${pathname}`)
      ctx.waitUntil(caches.default.put(request, response.clone()))
  }
  return response
}

async function forwardRequest(request, pathWithSearch) {
  const originRequest = new Request(request)
  originRequest.headers.delete("cookie")
  return await fetch(`https://${API_HOST}${pathWithSearch}`, originRequest)
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, ctx);
  }
};
