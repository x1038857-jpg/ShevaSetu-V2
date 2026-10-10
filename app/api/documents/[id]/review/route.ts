import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

const reviewSchema = z.object({
  reviewedData: z.record(z.any()),
  consentGiven: z.boolean(),
  purpose: z.string().min(1),
  retentionPolicy: z.string().min(1),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid review payload.' }, { status: 400 });
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

    if (!parsed.data.consentGiven) {
      return NextResponse.json(
        { error: 'Informed consent is required before submission.' },
        { status: 400 }
      );
    }

    await prisma.document.update({
      where: { id: document.id },
      data: {
        reviewData: parsed.data.reviewedData,
        status: 'approved',
      },
    });

    await prisma.consentRecord.upsert({
      where: { documentId: document.id },
      update: {
        consentGiven: true,
        purpose: parsed.data.purpose,
        retentionPolicy: parsed.data.retentionPolicy,
      },
      create: {
        documentId: document.id,
        userId: user.id,
        consentGiven: true,
        purpose: parsed.data.purpose,
        retentionPolicy: parsed.data.retentionPolicy,
      },
    });

    return NextResponse.json({
      documentId: document.id,
      status: 'approved',
      message: 'Review confirmed and consent recorded.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Review update failed.' }, { status: 500 });
  }
}
