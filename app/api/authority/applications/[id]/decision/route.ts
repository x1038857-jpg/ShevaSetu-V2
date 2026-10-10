import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, ensureOfficerRole } from '@/lib/auth';

const decisionSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  notes: z.string().min(1).max(2000),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    ensureOfficerRole(user);

    const body = await request.json();
    const parsed = decisionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid decision payload.' }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id: params.id },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    }

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: {
        decision: parsed.data.decision,
        status: parsed.data.decision === 'approved' ? 'approved' : 'rejected',
        authorityNotes: parsed.data.notes,
      },
    });

    await prisma.applicationHistory.create({
      data: {
        applicationId: updated.id,
        actorType: 'authority',
        actorId: user.id,
        eventType: parsed.data.decision,
        notes: parsed.data.notes,
      },
    });

    return NextResponse.json({
      applicationId: updated.id,
      decision: updated.decision,
      status: updated.status,
      message: 'Authority decision recorded successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Authority decision failed.' }, { status: 500 });
  }
}
