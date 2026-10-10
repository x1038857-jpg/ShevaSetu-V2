'use client';

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main>
      <nav className="nav">
        <div><strong>ShevaSetu</strong></div>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/documents/upload">Upload</Link>
          <Link href="/officer">Officer</Link>
        </div>
      </nav>

      <div className="container">
        <h1 className="title">Citizen Dashboard</h1>
        <p className="muted">Track your applications, uploaded documents, and review status.</p>

        <div className="row mt-24">
          <Link href="/documents/upload" className="button primary">
            New Upload
          </Link>
        </div>

        <div className="grid grid-3 mt-24">
          <div className="card p-16">
            <h3 className="section-title">Pending</h3>
            <p style={{ fontSize: '2rem', margin: 0 }}>2</p>
          </div>
          <div className="card p-16">
            <h3 className="section-title">In Review</h3>
            <p style={{ fontSize: '2rem', margin: 0 }}>1</p>
          </div>
          <div className="card p-16">
            <h3 className="section-title">Approved</h3>
            <p style={{ fontSize: '2rem', margin: 0 }}>5</p>
          </div>
        </div>

        <div className="card p-16 mt-24">
          <h3 className="section-title">Recent Documents</h3>
          <ul className="muted">
            <li>Proof of Residence — Uploaded</li>
            <li>Income Certificate — Needs Review</li>
            <li>Photo ID — Approved</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
