import { supabase } from '@/app/lib/supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')
  return {
    'Authorization': `Bearer ${session.access_token}`,
  }
}

export async function evaluateReflection(payload: {
  competency: string
  reflection_text: string
  email?: string
  candidate_name?: string
}) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/reflections/evaluate`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function uploadSession(formData: FormData) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/sessions/upload`, {
    method: 'POST',
    headers,
    body: formData,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getSessionStatus(sessionId: string) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/sessions/${sessionId}`, {
    method: 'GET',
    headers,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}