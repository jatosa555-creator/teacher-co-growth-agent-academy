import { handleMcp } from '../../lib/server.mjs';
export default handleMcp;
export const config = {
  path:'/mcp',
  rateLimit:{ windowSize:60, windowLimit:120, aggregateBy:['ip','domain'] }
};
