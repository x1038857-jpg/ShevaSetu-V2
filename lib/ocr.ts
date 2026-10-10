import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export async function extractTextFromDocument(file: File): Promise<{
  text: string;
  warnings: string[];
  confidence: number;
}> {
  try {
    if (file.type === 'application/pdf') {
      const pdfText = await extractPdfText(file);
      if (pdfText && pdfText.trim().length > 0) {
        return { text: pdfText, warnings: [], confidence: 0.9 };
      }
    }

    if (file.type.startsWith('image/')) {
      const result = await Tesseract.recognize(file, 'eng+hin', {
        logger: () => undefined,
      });

      const text = result.data?.text?.trim() ?? '';
      if (text.length > 0) {
        const confidence = Number(result.data?.confidence ?? 0);
        return {
          text,
          warnings:
            confidence < 70
              ? ['OCR confidence is below 70%. Manual review is recommended.']
              : [],
          confidence,
        };
      }
    }

    return {
      text: '',
      warnings: ['OCR failed to extract readable text from the uploaded document.'],
      confidence: 0,
    };
  } catch {
    return {
      text: '',
      warnings: ['OCR processing failed due to an unhandled read error.'],
      confidence: 0,
    };
  }
}

async function extractPdfText(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

  const pages: string[] = [];
  for (let page = 1; page <= pdf.numPages; page += 1) {
    const currentPage = await pdf.getPage(page);
    const content = await currentPage.getTextContent();
    pages.push(
      content.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ')
    );
  }

  return pages.join('\n');
}
