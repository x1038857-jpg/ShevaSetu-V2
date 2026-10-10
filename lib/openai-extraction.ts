import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const extractionFieldsSchema = z.object({
  applicantName: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  address: z.string().nullable(),
  documentType: z.string().nullable(),
  issueDate: z.string().nullable(),
  documentNumber: z.string().nullable(),
  serviceType: z.string().nullable(),
  warnings: z.array(z.string()).default([]),
  reviewRequired: z.array(z.string()).default([]),
});

export async function extractStructuredDocument({
  text,
  serviceType,
}: {
  text: string;
  serviceType: string;
}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY. AI extraction is unavailable.');
  }

  if (!text || text.trim().length < 10) {
    throw new Error('No usable document text was extracted for AI processing.');
  }

  const prompt = `
    Extract only the fields required for the selected government service.
    Use null for missing or uncertain values.
    Never invent names, dates, addresses, or identity numbers.
    Return valid JSON only.
    Required service: ${serviceType}
    Source text:
    ${text.slice(0, 25000)}
  `;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are a careful document extraction assistant for government services. Extract only confirmed values. Return null when uncertain and include warnings or reviewRequired fields when needed.',
      },
      { role: 'user', content: prompt },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI returned an empty response.');
  }

  const parsed = JSON.parse(content);
  const validated = extractionFieldsSchema.parse({
    ...parsed,
    serviceType,
    warnings: parsed.warnings ?? [],
    reviewRequired: parsed.reviewRequired ?? [],
  });

  return validated;
}
