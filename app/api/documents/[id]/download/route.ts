import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    if (document.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    );

    const file = await supabase.storage.from('documents').download(document.storagePath);
    if (file.error || !file.data) {
      return NextResponse.json({ error: 'Unable to fetch document from private storage.' }, { status: 500 });
    }

    return new NextResponse(file.data, {
      headers: {
        'Content-Type': document.mimeType,
        'Content-Disposition': `attachment; filename="${document.fileName}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Download failed.' }, { status: 500 });
  }
}
