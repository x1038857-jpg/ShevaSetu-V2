'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [serviceType, setServiceType] = useState('government_document');
  const [status, setStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      setStatus('Please select a file first.');
      return;
    }

    setIsSubmitting(true);
    setStatus('Uploading...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('serviceType', serviceType);

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed.');
      }

      setStatus(`Upload successful. Document ID: ${result.documentId}`);
      window.location.href = `/documents/${result.documentId}`;
    } catch (error: any) {
      setStatus(error.message || 'Upload failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <nav className="nav">
        <div><strong>ShevaSetu</strong></div>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/officer">Officer</Link>
        </div>
      </nav>

      <div className="container">
        <div className="card p-16" style={{ maxWidth: 760, margin: '0 auto' }}>
          <h1 className="title">Upload Government Document</h1>
          <p className="muted">Accepted: PDF, JPG and PNG. File validation is performed on the server.</p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="serviceType">Service Type</label>
              <select id="serviceType" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                <option value="government_document">Government Document</option>
                <option value="income_certificate">Income Certificate</option>
                <option value="residence_proof">Residence Proof</option>
                <option value="identity_document">Identity Document</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="file">Choose Document</label>
              <input
                id="file"
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <button className="button primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Uploading...' : 'Upload & Process'}
            </button>
          </form>

          {status && <p className="muted" style={{ marginTop: 18 }}>{status}</p>}
        </div>
      </div>
    </main>
  );
}
