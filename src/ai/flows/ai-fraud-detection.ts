'use server';

/**
 * @fileOverview Implements an AI-powered fraud detection system for AgriChain.
 *
 * - detectFraud - Detects suspicious transactions and alerts admins.
 * - DetectFraudInput - Input type for the detectFraud function.
 * - DetectFraudOutput - Return type for the detectFraud function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectFraudInputSchema = z.object({
  transactionData: z.string().describe('JSON string of transaction data to analyze.'),
});
export type DetectFraudInput = z.infer<typeof DetectFraudInputSchema>;

const DetectFraudOutputSchema = z.object({
  isFraudulent: z.boolean().describe('Whether the transaction is likely fraudulent.'),
  fraudExplanation: z.string().describe('Explanation of why the transaction is considered fraudulent.'),
});
export type DetectFraudOutput = z.infer<typeof DetectFraudOutputSchema>;

export async function detectFraud(input: DetectFraudInput): Promise<DetectFraudOutput> {
  return detectFraudFlow(input);
}

const detectFraudPrompt = ai.definePrompt({
  name: 'detectFraudPrompt',
  input: {schema: DetectFraudInputSchema},
  output: {schema: DetectFraudOutputSchema},
  prompt: `You are an AI fraud detection expert analyzing financial transactions for AgriChain.  Based on the provided transaction data, determine if the transaction is fraudulent.  Provide a detailed explanation for your determination.

Transaction Data: {{{transactionData}}}

Consider factors such as transaction amount, frequency, user history, and any other relevant information to assess the likelihood of fraud. Return the reason for the assessment in the explanation.
`,
});

const detectFraudFlow = ai.defineFlow(
  {
    name: 'detectFraudFlow',
    inputSchema: DetectFraudInputSchema,
    outputSchema: DetectFraudOutputSchema,
  },
  async input => {
    const {output} = await detectFraudPrompt(input);
    return output!;
  }
);
