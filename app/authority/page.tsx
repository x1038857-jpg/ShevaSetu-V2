'use client';

import Link from 'next/link';

export default function AuthorityPage() {
  return (
    <main>
      <nav className="nav">
        <div><strong>Authority Portal</strong></div>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/officer">Officer</Link>
        </div>
      </nav>

      <div className="container">
        <div className="card p-16">
          <h1 className="title">Authority Applications</h1>
          <p className="muted">Officer review queue and decision page.</p>

          <div className="grid grid-3 mt-24">
            <div className="card p-16">
              <h3 className="section-title">Pending</h3>
              <p style={{ fontSize: '2rem', margin: 0 }}>7</p>
            </div>
            <div className="card p-16">
              <h3 className="section-title">In Review</h3>
              <p style={{ fontSize: '2rem', margin: 0 }}>3</p>
            </div>
            <div className="card p-16">
              <h3 className="section-title">Approved</h3>
              <p style={{ fontSize: '2rem', margin: 0 }}>14</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
