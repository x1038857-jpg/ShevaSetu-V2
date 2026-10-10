import { createClient } from '@supabase/supabase-js';

export async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '').trim()
    : null;

  if (!token) {
    throw new Error('Authentication required.');
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  );

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new Error('Invalid or expired session.');
  }

  return data.user;
}

export function ensureOfficerRole(user: { app_metadata?: { role?: string } }) {
  if (user.app_metadata?.role !== 'GOVERNMENT') {
    throw new Error('Forbidden. Officer access required.');
  }
}
