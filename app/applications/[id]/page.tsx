'use client';

import Link from 'next/link';

export default function ApplicationPage() {
  return (
    <main>
      <nav className="nav">
        <div><strong>ShevaSetu</strong></div>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>
      </nav>

      <div className="container">
        <div className="card p-16" style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 className="title">Application Summary</h1>
          <p className="muted">Application status, documents and final authority decision.</p>

          <div className="card p-16 mt-24">
            <p><strong>Status:</strong> Submitted</p>
            <p><strong>Service:</strong> Residence Proof</p>
            <p><strong>Document:</strong> Proof of Residence.pdf</p>
            <p><strong>Reviewed:</strong> Yes</p>
          </div>
        </div>
      </div>
    </main>
  );
}
