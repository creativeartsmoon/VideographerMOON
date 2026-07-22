import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

// Vite plugin to execute Netlify Functions directly in dev server
function netlifyFunctionsDevPlugin(): Plugin {
  return {
    name: 'netlify-functions-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/.netlify/functions/')) {
          return next();
        }

        const urlParts = req.url.split('?');
        const functionName = urlParts[0].replace('/.netlify/functions/', '');
        const queryString = urlParts[1] || '';

        // Parse query params
        const queryStringParameters: Record<string, string> = {};
        if (queryString) {
          const searchParams = new URLSearchParams(queryString);
          searchParams.forEach((value, key) => {
            queryStringParameters[key] = value;
          });
        }

        // Read request body
        let body = '';
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
          body = await new Promise<string>((resolve) => {
            let data = '';
            req.on('data', (chunk) => { data += chunk; });
            req.on('end', () => { resolve(data); });
          });
        }

        try {
          let module: any;
          if (functionName === 'portfolio') {
            module = await server.ssrLoadModule('./netlify/functions/portfolio.ts');
          } else if (functionName === 'settings') {
            module = await server.ssrLoadModule('./netlify/functions/settings.ts');
          } else if (functionName === 'inquiries') {
            module = await server.ssrLoadModule('./netlify/functions/inquiries.ts');
          }

          if (module && module.handler) {
            const event = {
              httpMethod: req.method || 'GET',
              queryStringParameters,
              body,
              headers: req.headers,
            };

            const response = await module.handler(event, {});
            res.statusCode = response.statusCode || 200;

            if (response.headers) {
              Object.entries(response.headers).forEach(([key, value]) => {
                res.setHeader(key, value as string);
              });
            }

            res.end(response.body || '');
            return;
          }
        } catch (err: any) {
          console.error('Error invoking Netlify function in dev server:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), netlifyFunctionsDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
