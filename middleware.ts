import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient({ req, res })

  await supabase.auth.getSession()

  return res
}
