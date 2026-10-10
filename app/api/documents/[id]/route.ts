import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    const document = await prisma.document.findUnique({
      where: { id: params.id },
      include: { extractionResult: true, consentRecord: true },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    if (document.userId !== user.id) {
      return NextResponse.json({ error: 'You do not have access to this document.' }, { status: 403 });
    }

    return NextResponse.json({ document });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Unable to fetch document.' }, { status: 500 });
  }
}
