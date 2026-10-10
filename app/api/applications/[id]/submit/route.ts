import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

const submitSchema = z.object({
  documentId: z.string().min(1),
  reviewedData: z.record(z.any()).optional(),
  idempotencyKey: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();
    const parsed = submitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid submission payload.' }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id: params.id },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    }

    if (application.userId !== user.id) {
      return NextResponse.json({ error: 'You are not authorized for this application.' }, { status: 403 });
    }

    if (application.idempotencyKey === parsed.data.idempotencyKey) {
      return NextResponse.json(
        {
          message: 'Duplicate submission detected; no new record created.',
          applicationId: application.id,
        },
        { status: 200 }
      );
    }

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: {
        status: 'submitted',
        reviewedData: parsed.data.reviewedData ?? application.reviewedData,
        submittedAt: new Date(),
        idempotencyKey:
          parsed.data.idempotencyKey ?? application.idempotencyKey ?? `${application.id}-${Date.now()}`,
      },
    });

    await prisma.applicationHistory.create({
      data: {
        applicationId: updated.id,
        actorType: 'user',
        actorId: user.id,
        eventType: 'submitted',
        notes: 'Citizen submitted verified application after consent.',
      },
    });

    return NextResponse.json({
      applicationId: updated.id,
      status: updated.status,
      message: 'Application submitted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Application submission failed.' }, { status: 500 });
  }
}
