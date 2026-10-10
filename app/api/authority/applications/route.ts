import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, ensureOfficerRole } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    ensureOfficerRole(user);

    const applications = await prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        documents: true,
      },
    });

    return NextResponse.json({ applications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Unable to load authority applications.' }, { status: 500 });
  }
}
