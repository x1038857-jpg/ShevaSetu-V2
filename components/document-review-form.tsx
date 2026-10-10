'use client';

import { useState } from 'react';

type ReviewFormProps = {
  initialData: Record<string, string | null>;
  onSubmit?: (payload: Record<string, string | null>) => void;
};

export function DocumentReviewForm({ initialData, onSubmit }: ReviewFormProps) {
  const [values, setValues] = useState<Record<string, string | null>>(initialData);

  const handleChange = (field: string, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  return (
    <form
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(values);
      }}
    >
      {Object.entries(values).map(([key, value]) => (
        <label key={key} className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">{key}</span>
          <input
            value={value ?? ''}
            onChange={(event) => handleChange(key, event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
            placeholder={value ?? 'Missing or uncertain'}
          />
        </label>
      ))}

      <div className="mt-4 flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" required />
          <span>I confirm the extracted details and consent to processing.</span>
        </label>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Confirm
        </button>
      </div>
    </form>
  );
}
