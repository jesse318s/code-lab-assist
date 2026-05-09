/**
 * Load function for /tasks/[id].
 * Passes the raw id param to the page; the page looks up the task from
 * the client-side store so no server data-fetching is needed.
 *
 * entries provides a single placeholder so the prerenderer visits this route
 * exactly once (generating an app-shell HTML file) and does NOT raise the
 * "unseen routes" error.  Because ssr = false the generated file contains
 * no actual task data — the client-side store populates it at runtime.
 * The placeholder entry is never linked from any user-facing page.
 *
 * adapter-static strict mode is satisfied because the route is visited and
 * prerender = true is inherited from the root layout.
 */

/** @type {import('./$types').EntryGenerator} */
export const entries = () => [{ id: '_placeholder' }];

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
  return { taskId: params.id };
}
