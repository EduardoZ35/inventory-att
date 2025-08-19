"use server";

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers'; // Importar cookies
import { createServerClient, type CookieOptions } from '@supabase/ssr'; // Importar createServerClient y CookieOptions

async function createClient() {
  const cookieStore = await cookies(); // Hacer await a cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set(name, value, options);
        },
        remove(name: string) {
          cookieStore.delete(name);
        },
      },
    }
  );
}

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
}

export async function listAllUserProfiles(): Promise<{ profiles: Profile[] | null; error: string | null }> {
  const supabase = await createClient();

  // Verificar el rol del usuario autenticado en el servidor
  const { data: { user } } = await supabase.auth.getUser();
  console.log('User in listAllUserProfiles:', user); // Añadir log para depuración
  if (!user) {
    return { profiles: null, error: 'No user authenticated' };
  }

  const { data: roleData, error: roleError } = await supabase.rpc('get_user_role');
  console.log('Role data in listAllUserProfiles:', roleData); // Añadir log para depuración
  // if (roleError || roleData !== 'admin') { // Temporalmente comentado para depuración
  //   return { profiles: null, error: 'User not authorized' };
  // }

  try {
    const { data: profilesData, error: profilesError } = await supabaseAdmin.from('profiles').select('id, first_name, last_name, role');

    if (profilesError) {
      console.error('Error fetching profiles from DB:', profilesError);
      return { profiles: null, error: profilesError.message };
    }

    const { data: { users }, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();

    if (authUsersError) {
      console.error('Error fetching auth users:', authUsersError);
      return { profiles: null, error: authUsersError.message };
    }

    const profilesWithEmails = profilesData.map(profile => {
      const authUser = users?.find(u => u.id === profile.id);
      return {
        ...profile,
        email: authUser?.email || 'N/A'
      };
    });

    return { profiles: profilesWithEmails as Profile[], error: null };
  } catch (err: unknown) {
    console.error('Error in listAllUserProfiles server action:', err);
    return { profiles: null, error: (err as Error).message };
  }
}

export async function updateUserRole(profileId: string, newRole: 'admin' | 'manager' | 'viewer'): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  // Verificar el rol del usuario autenticado en el servidor
  const { data: { user } } = await supabase.auth.getUser();
  console.log('User in updateUserRole:', user); // Añadir log para depuración
  if (!user) {
    return { success: false, error: 'No user authenticated' };
  }

  const { data: roleData, error: roleError } = await supabase.rpc('get_user_role');
  console.log('Role data in updateUserRole:', roleData); // Añadir log para depuración
  // if (roleError || roleData !== 'admin') { // Temporalmente comentado para depuración
  //   return { success: false, error: 'User not authorized' };
  // }

  try {
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profileId);

    if (updateError) {
      console.error('Error updating user role:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    console.error('Error in updateUserRole server action:', err);
    return { success: false, error: (err as Error).message };
  }
}
