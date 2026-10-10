import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { extractTextFromDocument } from '@/lib/ocr';
import { extractStructuredDocument } from '@/lib/openai-extraction';

const extractSchema = z.object({
  serviceType: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json().catch(() => ({}));
    const parsed = extractSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid service type.' }, { status: 400 });
    }

    const document = await prisma.document.findUnique({
      where: { id: params.id },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    if (document.userId !== user.id) {
      return NextResponse.json({ error: 'You do not own this document.' }, { status: 403 });
    }

    await prisma.document.update({
      where: { id: document.id },
      data: { status: 'processing', errorMessage: null },
    });

    const downloadResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/documents/${document.id}/download`, {
      headers: {
        authorization: request.headers.get('authorization') ?? '',
      },
    });

    if (!downloadResponse.ok) {
      throw new Error('Unable to fetch uploaded document for OCR.');
    }

    const fileBlob = await downloadResponse.blob();
    const file = new File([fileBlob], document.fileName, { type: document.mimeType });
    const ocr = await extractTextFromDocument(file);

    if (!ocr.text || ocr.text.trim().length < 10) {
      await prisma.document.update({
        where: { id: document.id },
        data: {
          status: 'failed',
          errorMessage: 'OCR did not extract enough readable text.',
        },
      });

      return NextResponse.json(
        {
          error: 'OCR failed to extract enough text for AI processing.',
          warnings: ocr.warnings,
        },
        { status: 422 }
      );
    }

    const extracted = await extractStructuredDocument({
      text: ocr.text,
      serviceType: parsed.data.serviceType,
    });

    await prisma.extractionResult.upsert({
      where: { documentId: document.id },
      update: {
        serviceType: parsed.data.serviceType,
        extractedData: extracted,
        warnings: extracted.warnings,
        reviewRequired: extracted.reviewRequired,
      },
      create: {
        documentId: document.id,
        serviceType: parsed.data.serviceType,
        extractedData: extracted,
        warnings: extracted.warnings,
        reviewRequired: extracted.reviewRequired,
      },
    });

    await prisma.document.update({
      where: { id: document.id },
      data: {
        status: 'needs_review',
        ocrText: ocr.text,
        ocrWarnings: ocr.warnings,
        extractionJson: extracted,
      },
    });

    return NextResponse.json({
      documentId: document.id,
      status: 'needs_review',
      extraction: extracted,
      warnings: ocr.warnings,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Extraction failed.' }, { status: 500 });
  }
}
