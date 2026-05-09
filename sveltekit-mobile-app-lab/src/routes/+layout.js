/**
 * Root layout load — disables SSR globally so every page renders
 * client-side only.  This is required for Capacitor: the app always boots
 * from a local file:// origin inside the Android WebView; there is no server
 * to hydrate from.
 *
 * prerender = true satisfies adapter-static's strict mode check for dynamic
 * routes such as /tasks/[id].  In a Capacitor SPA all navigation is client-
 * side so every route is served from the root index.html; no actual HTML
 * files need to be pre-generated for parameterised segments.
 */
export const ssr = false;
export const prerender = true;
