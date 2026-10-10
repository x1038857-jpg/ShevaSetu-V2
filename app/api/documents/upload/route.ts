import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { validateFile, validateFileSignature } from '@/lib/file-validation';

const uploadSchema = z.object({
  serviceType: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const serviceType = String(formData.get('serviceType') ?? '');

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const parsed = uploadSchema.safeParse({ serviceType });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid service type.' }, { status: 400 });
    }

    const { mimeType, extension, size } = validateFile(file);
    await validateFileSignature(file);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    );

    const storagePath = `documents/${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
    const upload = await supabase.storage.from('documents').upload(storagePath, file, {
      upsert: false,
      contentType: mimeType,
      cacheControl: '3600',
    });

    if (upload.error) {
      return NextResponse.json(
        { error: 'Document storage upload failed.', details: upload.error.message },
        { status: 500 }
      );
    }

    const document = await prisma.document.create({
      data: {
        userId: user.id,
        fileName: file.name,
        storagePath,
        mimeType,
        sizeBytes: size,
        status: 'uploaded',
        extractionJson: { serviceType: parsed.data.serviceType },
      },
    });

    return NextResponse.json(
      {
        documentId: document.id,
        status: document.status,
        message: 'Document uploaded successfully.',
        fileType: extension,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Upload failed.' }, { status: 401 });
  }
}
