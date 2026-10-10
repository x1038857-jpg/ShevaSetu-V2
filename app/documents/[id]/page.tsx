'use client';

import { useState } from 'react';
import Link from 'next/link';

const initialData = {
  applicantName: 'Amit Kumar',
  dateOfBirth: '1990-01-01',
  address: '12 Green Park, New Delhi',
  documentType: 'Residence Proof',
  issueDate: '2024-01-12',
  documentNumber: 'DL-2024-888',
};

export default function DocumentDetailPage() {
  const [data, setData] = useState(initialData);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (key: keyof typeof initialData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleExtract = async () => {
    setIsSubmitting(true);
    setStatus('Extracting document fields...');

    try {
      const response = await fetch('/api/documents/placeholder/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType: 'government_document' }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Extraction failed.');
      }

      setStatus('Extraction completed. Review the fields and confirm.');
    } catch (error: any) {
      setStatus(error.message || 'Extraction failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmit = async () => {
    setStatus('Saving review and consent...');

    try {
      const response = await fetch('/api/documents/placeholder/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewedData: data,
          consentGiven: true,
          purpose: 'Government service processing',
          retentionPolicy: '90 days private retention',
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Review failed.');
      }

      setStatus('Data saved and consent recorded.');
    } catch (error: any) {
      setStatus(error.message || 'Review failed.');
    }
  };

  return (
    <main>
      <nav className="nav">
        <div><strong>ShevaSetu</strong></div>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/documents/upload">Upload</Link>
        </div>
      </nav>

      <div className="container">
        <div className="card p-16" style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 className="title">Review Extracted Details</h1>
          <p className="muted">AI output is advisory and must be reviewed before submission.</p>

          <div className="grid grid-2">
            {Object.entries(data).map(([key, value]) => (
              <div className="field" key={key}>
                <label>{key}</label>
                <input
                  value={value}
                  onChange={(e) => updateField(key as keyof typeof initialData, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="row" style={{ marginTop: 20 }}>
            <button className="button primary" onClick={handleExtract} disabled={isSubmitting}>
              {isSubmitting ? 'Extracting...' : 'Run Extraction'}
            </button>
            <button className="button secondary" onClick={handleReviewSubmit}>
              Confirm & Save
            </button>
          </div>

          {status && <p className="muted" style={{ marginTop: 20 }}>{status}</p>}
        </div>
      </div>
    </main>
  );
}
