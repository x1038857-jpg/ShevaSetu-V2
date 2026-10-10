'use client';

export function AuthorityDecisionPanel() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800">Authority Verification</h3>
      <div className="mt-4 space-y-3">
        <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          AI extraction is advisory only and cannot be treated as proof of authenticity.
        </div>
        <div className="flex gap-3">
          <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
            Approve
          </button>
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
