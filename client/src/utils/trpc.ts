import { createTRPCClient, httpBatchLink, loggerLink } from '@trpc/client';
import type { AppRouter } from '../../../server/src';
import superjson from 'superjson';

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({ url: '/api', transformer: superjson }),
    loggerLink({
          enabled: (opts) =>
            (typeof window !== 'undefined') ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
  ],
});
