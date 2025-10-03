/**
 * @fileoverview This file is the entry point for the Genkit development server.
 *
 * It is not part of the Next.js application and is only used for local
 * development of Genkit flows.
 *
 * To run the Genkit development server, run `npm run genkit:watch`.
 */
import {getFlows} from '@genkit-ai/next';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// This is the entry point for the Genkit development server.
//
// It is not part of the Next.js application and is only used for local
// development of Genkit flows.
export default genkit({
  plugins: [googleAI(), getFlows()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
