'use client';

import Link from 'next/link';

export default function OfficerPage() {
  return (
    <main>
      <nav className="nav">
        <div><strong>ShevaSetu Officer Portal</strong></div>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/officer">Officer</Link>
        </div>
      </nav>

      <div className="container">
        <h1 className="title">Authority Review Dashboard</h1>
        <p className="muted">Review uploaded documents and approve or reject applications manually.</p>

        <div className="grid grid-3 mt-24">
          <div className="card p-16">
            <h3 className="section-title">Pending</h3>
            <p style={{ fontSize: '2rem', margin: 0 }}>12</p>
          </div>
          <div className="card p-16">
            <h3 className="section-title">In Review</h3>
            <p style={{ fontSize: '2rem', margin: 0 }}>4</p>
          </div>
          <div className="card p-16">
            <h3 className="section-title">Approved</h3>
            <p style={{ fontSize: '2rem', margin: 0 }}>24</p>
          </div>
        </div>

        <div className="card p-16 mt-24">
          <h3 className="section-title">Applications awaiting decision</h3>
          <ul className="muted">
            <li>Application #1042 — Proof of Residence — Pending</li>
            <li>Application #1043 — Income Certificate — In Review</li>
            <li>Application #1044 — Caste Certificate — Pending</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
