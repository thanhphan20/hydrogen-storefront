import * as serverBuild from 'virtual:react-router/server-build';
import {createRequestHandler, storefrontRedirect} from '@shopify/hydrogen';
import {waitUntil as vercelWaitUntil} from '@vercel/functions';
import {createHydrogenRouterContext} from '~/lib/context';

/**
 * Maps process.env to the Env object expected by Hydrogen.
 * Used on Vercel where env vars come from process.env instead of Workers bindings.
 */
function getEnv(env?: Env): Env {
  if (env?.SESSION_SECRET) return env;
  return process.env as unknown as Env;
}

/**
 * Creates an ExecutionContext for Vercel environments.
 * Uses @vercel/functions waitUntil for background tasks.
 */
function getExecutionContext(ctx?: ExecutionContext): ExecutionContext {
  if (ctx?.waitUntil) return ctx;
  return {
    waitUntil: (p: Promise<unknown>) => vercelWaitUntil(p),
    passThroughOnException: () => {},
  } as ExecutionContext;
}

/**
 * Export a fetch handler in module format.
 */
export default {
  async fetch(
    request: Request,
    env?: Env,
    executionContext?: ExecutionContext,
  ): Promise<Response> {
    try {
      const resolvedEnv = getEnv(env);
      const resolvedContext = getExecutionContext(executionContext);

      const hydrogenContext = await createHydrogenRouterContext(
        request,
        resolvedEnv,
        resolvedContext,
      );

      /**
       * Create a Hydrogen request handler that internally
       * delegates to React Router for routing and rendering.
       */
      const handleRequest = createRequestHandler({
        build: serverBuild,
        mode: process.env.NODE_ENV,
        getLoadContext: () => hydrogenContext,
      });

      const response = await handleRequest(request);

      if (hydrogenContext.session.isPending) {
        response.headers.set(
          'Set-Cookie',
          await hydrogenContext.session.commit(),
        );
      }

      if (response.status === 404) {
        /**
         * Check for redirects only when there's a 404 from the app.
         * If the redirect doesn't exist, then `storefrontRedirect`
         * will pass through the 404 response.
         */
        return storefrontRedirect({
          request,
          response,
          storefront: hydrogenContext.storefront,
        });
      }

      return response;
    } catch (error) {
      console.error(error);
      return new Response('An unexpected error occurred', {status: 500});
    }
  },
};
