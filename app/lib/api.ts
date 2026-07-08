import { supabase } from '@/app/lib/supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')
  return {
    'Authorization': `Bearer ${session.access_token}`,
  }
}

export async function uploadFilesToSupabase(files: File[], sessionId: string): Promise<string[]> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const paths: string[] = []

  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${session.user.id}/videos/${sessionId}/${safeName}`

    const { error } = await supabase.storage
      .from('videos')
      .upload(path, file, { contentType: file.type })

    if (error) throw new Error(`Upload failed: ${error.message}`)
    paths.push(path)
  }

  return paths
}

export async function createSession(payload: {
  file_paths: string[]
  email?: string
}) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/sessions/create`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function evaluateReflection(payload: {
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

export async function getSessionStatus(sessionId: string) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/sessions/${sessionId}`, {
    method: 'GET',
    headers,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}