import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <nav className="nav">
        <div>
          <strong>ShevaSetu</strong>
        </div>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/documents/upload">Upload</Link>
          <Link href="/officer">Officer</Link>
        </div>
      </nav>

      <div className="container">
        <h1 className="title">Government Document Extraction Workflow</h1>
        <p className="muted">
          Upload a document, extract structured fields, review them, collect consent,
          then hand it to an authority reviewer for approval.
        </p>

        <div className="row mt-24">
          <Link href="/documents/upload" className="button primary">
            Upload Document
          </Link>
          <Link href="/dashboard" className="button secondary">
            Citizen Dashboard
          </Link>
          <Link href="/officer" className="button secondary">
            Officer Dashboard
          </Link>
        </div>

        <div className="grid grid-3 mt-24">
          <div className="card p-16">
            <h3 className="section-title">1. Upload</h3>
            <p className="muted">Validate file type, size, and signature before storage.</p>
          </div>
          <div className="card p-16">
            <h3 className="section-title">2. OCR + AI</h3>
            <p className="muted">Read actual text and extract only required government fields.</p>
          </div>
          <div className="card p-16">
            <h3 className="section-title">3. Review + Verify</h3>
            <p className="muted">Human review and authority approval remain mandatory.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
