"use server";

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers'; // Importar cookies
import { createServerClient, type CookieOptions } from '@supabase/ssr'; // Importar createServerClient y CookieOptions

// Esta función ya no se usa, pero la mantenemos por compatibilidad
async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // En Server Actions read-only, ignoramos errores de escritura
          }
        },
        remove(name: string, options?: CookieOptions) {
          try {
            cookieStore.delete(name);
          } catch {
            // En Server Actions read-only, ignoramos errores de escritura
          }
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
  role: 'admin' | 'tech_support' | 'warehouse_staff' | 'sales' | 'blocked';
  is_blocked: boolean | null;
  blocked_at: string | null;
  blocked_by: string | null;
  blocked_reason: string | null;
  authorized: boolean | null;
  authorized_at: string | null;
  authorized_by: string | null;
}

export async function listAllUserProfiles(accessToken?: string): Promise<{ profiles: Profile[] | null; error: string | null }> {
  console.log('🚀 [SERVER] Iniciando listAllUserProfiles...');
  
  if (!accessToken) {
    console.log('❌ [SERVER] No access token provided');
    return { profiles: null, error: 'Access token required' };
  }

  console.log('🔧 [SERVER] Configurando cliente Supabase...');
  
  // Verificar variables de entorno
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ [SERVER] Missing Supabase environment variables');
    return { profiles: null, error: 'Missing Supabase configuration' };
  }

  // Crear cliente con token de acceso directo
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {},
      },
    }
  );

  console.log('🔑 [SERVER] Cliente creado, verificando usuario...');

  // Verificar el usuario con el token
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('👤 [SERVER] User status:', {
    hasUser: !!user,
    userEmail: user?.email,
    userError: userError?.message
  });
  
  if (userError || !user) {
    console.error('❌ [SERVER] User authentication failed:', userError);
    return { profiles: null, error: `No user authenticated: ${userError?.message}` };
  }

  console.log('🔑 [SERVER] Verificando rol del usuario...');

  // Verificar el rol del usuario autenticado en el servidor
  const { data: roleData, error: roleError } = await supabase.rpc('get_user_role');
  console.log('📊 [SERVER] Role check result:', {
    role: roleData,
    hasError: !!roleError,
    errorMessage: roleError?.message
  });
  
  if (roleError) {
    console.error('❌ [SERVER] Role check failed:', roleError);
    return { profiles: null, error: `Role verification failed: ${roleError.message}` };
  }
  
  if (roleData !== 'admin') {
    console.warn('⚠️ [SERVER] User is not admin:', roleData);
    return { profiles: null, error: `User not authorized. Current role: ${roleData}` };
  }

  try {
    console.log('📊 [SERVER] Obteniendo perfiles de la base de datos...');
    
    // Verificar si supabaseAdmin está configurado
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ [SERVER] Missing SUPABASE_SERVICE_ROLE_KEY');
      return { profiles: null, error: 'Missing admin configuration' };
    }
    
    const { data: profilesData, error: profilesError } = await supabaseAdmin.from('profiles').select('id, first_name, last_name, role, is_blocked, blocked_at, blocked_by, blocked_reason, authorized, authorized_at, authorized_by');

    console.log('📊 [SERVER] Profiles query result:', {
      profilesCount: profilesData?.length || 0,
      hasError: !!profilesError,
      errorMessage: profilesError?.message
    });

    if (profilesError) {
      console.error('❌ [SERVER] Error fetching profiles from DB:', profilesError);
      return { profiles: null, error: `Database error: ${profilesError.message}` };
    }

    console.log('👥 [SERVER] Obteniendo usuarios de auth...');
    const { data: { users }, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();

    console.log('👥 [SERVER] Auth users query result:', {
      usersCount: users?.length || 0,
      hasError: !!authUsersError,
      errorMessage: authUsersError?.message
    });

    if (authUsersError) {
      console.error('❌ [SERVER] Error fetching auth users:', authUsersError);
      return { profiles: null, error: `Auth error: ${authUsersError.message}` };
    }

    console.log('🔄 [SERVER] Mapeando perfiles con emails...');
    const profilesWithEmails = profilesData.map(profile => {
      const authUser = users?.find(u => u.id === profile.id);
      const mappedProfile = {
        ...profile,
        email: authUser?.email || 'N/A',
        // Asegurar que is_blocked y authorized sean boolean
        is_blocked: profile.is_blocked === true,
        authorized: profile.authorized === true,
        // Mantener otros campos como están
        blocked_at: profile.blocked_at || null,
        blocked_by: profile.blocked_by || null,
        blocked_reason: profile.blocked_reason || null,
        authorized_at: profile.authorized_at || null,
        authorized_by: profile.authorized_by || null
      };
      
      // Log para debug
      console.log('🔄 [SERVER] Profile mapeado:', {
        id: mappedProfile.id.slice(0, 8),
        email: mappedProfile.email,
        role: mappedProfile.role,
        is_blocked: mappedProfile.is_blocked,
        authorized: mappedProfile.authorized
      });
      
      return mappedProfile;
    });

    console.log('✅ [SERVER] Perfiles procesados exitosamente:', profilesWithEmails.length);
    return { profiles: profilesWithEmails as Profile[], error: null };
  } catch (err: unknown) {
    console.error('❌ [SERVER] Error inesperado en listAllUserProfiles:', err);
    return { profiles: null, error: `Unexpected server error: ${(err as Error).message}` };
  }
}

export async function toggleUserAccess(
  userId: string, 
  isBlocking: boolean, 
  reason: string, 
  accessToken?: string
): Promise<{ success: boolean; error: string | null }> {
  if (!accessToken) {
    return { success: false, error: 'Access token required' };
  }

  // Crear cliente con token de acceso directo
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {},
      },
    }
  );

  console.log('Usando token de acceso para bloqueo/desbloqueo');

  // Verificar el usuario con el token
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('Usuario en toggleUserAccess:', user ? 'Found' : 'Not found');
  
  if (userError || !user) {
    console.log('User error:', userError);
    return { success: false, error: 'No user authenticated' };
  }

  // Verificar el rol del usuario autenticado
  const { data: roleData, error: roleError } = await supabase.rpc('get_user_role');
  console.log('Rol del admin:', roleData);
  
  if (roleError || roleData !== 'admin') {
    console.log('Role error or not admin:', roleError, 'Role:', roleData);
    return { success: false, error: 'User not authorized' };
  }

  try {
    // Primero obtener el usuario actual para saber su rol original
    const { data: currentUser, error: getUserError } = await supabaseAdmin
      .from('profiles')
      .select('role, is_blocked')
      .eq('id', userId)
      .single();

    if (getUserError) {
      console.error('Error getting current user:', getUserError);
      return { success: false, error: getUserError.message };
    }

    console.log('Usuario actual antes de actualizar:', currentUser);

    // Preparar datos para actualizar
    const updateData = isBlocking ? {
      // Bloquear
      is_blocked: true,
      blocked_at: new Date().toISOString(),
      blocked_by: user.id,
      blocked_reason: reason,
      role: 'blocked'
    } : {
      // Desbloquear
      is_blocked: false,
      blocked_at: null,
      blocked_by: null,
      blocked_reason: null,
      role: currentUser.role === 'blocked' ? 'viewer' : currentUser.role // Restaurar rol si era 'blocked'
    };

    console.log('Datos a actualizar en servidor:', updateData);

    // Actualizar usando supabaseAdmin para tener permisos completos
    const { error: updateError, data } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select();

    console.log('Resultado de actualización en servidor:', { error: updateError, data });

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    console.error('Error in toggleUserAccess server action:', err);
    return { success: false, error: (err as Error).message };
  }
}

export async function toggleUserAuthorization(
  userId: string, 
  isAuthorizing: boolean, 
  accessToken?: string
): Promise<{ success: boolean; error: string | null }> {
  if (!accessToken) {
    return { success: false, error: 'Access token required' };
  }

  // Crear cliente con token de acceso directo
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {},
      },
    }
  );

  console.log('Usando token de acceso para autorización');

  // Verificar el usuario con el token
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('Usuario en toggleUserAuthorization:', user ? 'Found' : 'Not found');
  
  if (userError || !user) {
    console.log('User error:', userError);
    return { success: false, error: 'No user authenticated' };
  }

  // Verificar el rol del usuario autenticado
  const { data: roleData, error: roleError } = await supabase.rpc('get_user_role');
  console.log('Rol del admin:', roleData);
  
  if (roleError || roleData !== 'admin') {
    console.log('Role error or not admin:', roleError, 'Role:', roleData);
    return { success: false, error: 'User not authorized' };
  }

  try {
    // Preparar datos para actualizar
    const updateData = isAuthorizing ? {
      // Autorizar
      authorized: true,
      authorized_at: new Date().toISOString(),
      authorized_by: user.id
    } : {
      // Revocar autorización
      authorized: false,
      authorized_at: null,
      authorized_by: null
    };

    console.log('Datos de autorización a actualizar:', updateData);

    // Actualizar usando supabaseAdmin para tener permisos completos
    const { error: updateError, data } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select();

    console.log('Resultado de autorización en servidor:', { error: updateError, data });

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    console.error('Error in toggleUserAuthorization server action:', err);
    return { success: false, error: (err as Error).message };
  }
}

export async function updateUserRole(profileId: string, newRole: 'admin' | 'tech_support' | 'warehouse_staff' | 'sales', accessToken?: string): Promise<{ success: boolean; error: string | null }> {
  if (!accessToken) {
    return { success: false, error: 'Access token required' };
  }

  // Crear cliente con token de acceso directo
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {},
      },
    }
  );

  console.log('Using access token for authentication in updateUserRole');

  // Verificar el usuario con el token
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('User in updateUserRole:', user ? 'Found' : 'Not found');
  
  if (userError || !user) {
    console.log('User error:', userError);
    return { success: false, error: 'No user authenticated' };
  }

  // Verificar el rol del usuario autenticado en el servidor
  const { data: roleData, error: roleError } = await supabase.rpc('get_user_role');
  console.log('Role data in updateUserRole:', roleData);
  
  if (roleError || roleData !== 'admin') {
    console.log('Role error or not admin:', roleError, 'Role:', roleData);
    return { success: false, error: 'User not authorized' };
  }

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
