import './build-catalog.mjs';
import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
await mkdir(new URL('../dist/',import.meta.url),{recursive:true});
await build({ entryPoints:['netlify/functions/mcp.mjs','netlify/functions/health.mjs'],outdir:'dist/functions',bundle:true,platform:'node',target:'node22',format:'esm',outExtension:{'.js':'.mjs'},logLevel:'info' });
console.log('Local function bundles ready. Netlify deployment uses the source functions and config exports.');
