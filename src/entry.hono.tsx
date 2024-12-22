/*
 * WHAT IS THIS FILE?
 *
 * It's the entry point for the Hono HTTP server when building for production.
 *
 */
import {
  createQwikCity,
  type PlatformNode,
} from "@builder.io/qwik-city/middleware/node";
import qwikCityPlan from "@qwik-city-plan";
import { manifest } from "@qwik-client-manifest";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import type { HttpBindings } from "@hono/node-server";
import { Hono } from "hono";
import render from "./entry.ssr";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import env from "./env";

declare global {
  interface QwikCityPlatform extends PlatformNode {}
}

// Directories where the static assets are located
const distDir = join(fileURLToPath(import.meta.url), "..", "..", "dist");
const buildDir = join(distDir, "build");

// Allow for dynamic port
const PORT = env.PORT;

// Create the Qwik City Node middleware
const { router, notFound } = createQwikCity({
  render,
  qwikCityPlan,
  manifest,
  // getOrigin(req) {
  //   // If deploying under a proxy, you may need to build the origin from the request headers
  //   // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Proto
  //   const protocol = req.headers["x-forwarded-proto"] ?? "http";
  //   // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Host
  //   const host = req.headers["x-forwarded-host"] ?? req.headers.host;
  //   return `${protocol}://${host}`;
  // }
});

type Bindings = HttpBindings;

// Create the Honojs server
// https://hono.dev/
const app = new Hono<{ Bindings: Bindings }>();

// Static asset handlers
// https://hono.dev/docs/getting-started/nodejs#serve-static-files
app.use(
  `/build`,
  serveStatic({
    path: buildDir,
    onFound(_, ctx) {
      ctx.header("Cache-Control", `public, immutable, max-age=31536000`);
    },
  })
);
app.use(serveStatic({ path: distDir }));

// HOW TO MAKE THIS HANDLER WORK?
// Use Qwik City's page and endpoint request handler
app.use((ctx, next) => router(ctx.req.raw, ctx.res.raw, next));
// Use Qwik City's 404 handler
app.use((ctx, next) => notFound(ctx.req.raw, ctx.res.raw, next));

serve(
  {
    fetch: app.fetch,
    port: PORT!,
  },
  (info) => {
    console.log(`Server started: http://localhost:${info.port}/`);
  }
);
