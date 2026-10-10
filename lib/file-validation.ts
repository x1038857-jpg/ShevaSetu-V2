import { z } from 'zod';

export const MAX_UPLOAD_SIZE_BYTES =
  Number(process.env.MAX_UPLOAD_SIZE_MB ?? 10) * 1024 * 1024;

export const fileValidationSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().positive(),
});

const supportedMimeTypes = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
]);

const allowedExtensions = new Set(['.pdf', '.png', '.jpg', '.jpeg']);

export function validateFile(file: File) {
  const fileName = file.name ?? 'unknown-file';
  const extension = fileName.includes('.')
    ? fileName.slice(fileName.lastIndexOf('.')).toLowerCase()
    : '';

  if (!allowedExtensions.has(extension)) {
    throw new Error('Unsupported file type. Please upload PDF, JPG, or PNG only.');
  }

  if (!supportedMimeTypes.has(file.type)) {
    throw new Error('File MIME type is invalid or unsupported.');
  }

  if (file.size <= 0) {
    throw new Error('Uploaded file is empty.');
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error(`File exceeds the ${Number(process.env.MAX_UPLOAD_SIZE_MB ?? 10)}MB limit.`);
  }

  return {
    mimeType: file.type,
    extension,
    size: file.size,
  };
}

export async function validateFileSignature(file: File) {
  const extension = file.name.includes('.')
    ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    : '';

  if (extension === '.pdf') {
    const header = Array.from(new Uint8Array(await file.slice(0, 5).arrayBuffer()));
    if (
      header[0] !== 0x25 ||
      header[1] !== 0x50 ||
      header[2] !== 0x44 ||
      header[3] !== 0x46 ||
      header[4] !== 0x2d
    ) {
      throw new Error('The uploaded PDF is corrupted or invalid.');
    }
  }

  if (extension === '.png') {
    const header = Array.from(new Uint8Array(await file.slice(0, 8).arrayBuffer()));
    if (
      header[0] !== 0x89 ||
      header[1] !== 0x50 ||
      header[2] !== 0x4e ||
      header[3] !== 0x47 ||
      header[4] !== 0x0d ||
      header[5] !== 0x0a ||
      header[6] !== 0x1a ||
      header[7] !== 0x0a
    ) {
      throw new Error('The uploaded PNG is corrupted or invalid.');
    }
  }

  if (extension === '.jpg' || extension === '.jpeg') {
    const header = Array.from(new Uint8Array(await file.slice(0, 2).arrayBuffer()));
    if (header[0] !== 0xff || header[1] !== 0xd8) {
      throw new Error('The uploaded JPG is corrupted or invalid.');
    }
  }
}
