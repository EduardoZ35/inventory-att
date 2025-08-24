import { supabase } from '@/lib/supabaseClient';

interface GoogleUserData {
  id: string;
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email_verified?: boolean;
}

/**
 * Función para crear o actualizar automáticamente el perfil del usuario
 * cuando inicia sesión con Google por primera vez
 */
export async function autoCreateOrUpdateProfile(user: any): Promise<void> {
  try {
    console.log('🔄 Auto-creando/actualizando perfil para:', user.email);

    // Extraer datos de Google
    const googleData: GoogleUserData = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name,
      given_name: user.user_metadata?.given_name || user.user_metadata?.first_name,
      family_name: user.user_metadata?.family_name || user.user_metadata?.last_name,
      picture: user.user_metadata?.picture || user.user_metadata?.avatar_url,
      email_verified: user.email_verified || user.user_metadata?.email_verified
    };

    console.log('📊 Datos de Google extraídos:', {
      email: googleData.email,
      name: googleData.name,
      given_name: googleData.given_name,
      family_name: googleData.family_name,
      has_picture: !!googleData.picture
    });

    // Verificar si ya existe un perfil
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error checking existing profile:', fetchError);
      return;
    }

    if (existingProfile) {
      console.log('✅ Perfil existente encontrado, actualizando datos de Google...');
      
      // Actualizar perfil existente con datos más recientes de Google
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: googleData.given_name || existingProfile.first_name,
          last_name: googleData.family_name || existingProfile.last_name,
          // No sobrescribir el rol si ya existe
          // Solo actualizar información personal
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('❌ Error updating profile:', updateError);
      } else {
        console.log('✅ Perfil actualizado exitosamente');
      }
    } else {
      console.log('🆕 Perfil no existe, verificando si está en lista de invitados...');
      
      // Buscar si el email está en alguna "lista de invitados" (perfiles temporales)
      // En un sistema real, esto sería una tabla separada de invitaciones
      // Por ahora, creamos el perfil con rol viewer por defecto
      
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          first_name: googleData.given_name,
          last_name: googleData.family_name,
          role: 'viewer', // Rol por defecto
          is_blocked: false,
          authorized: false, // NO auto-autorizar - requiere solicitud
          authorized_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createError) {
        console.error('❌ Error creating profile:', createError);
      } else {
        console.log('✅ Nuevo perfil creado exitosamente con datos de Google');
      }
    }

  } catch (err) {
    console.error('❌ Error in autoCreateOrUpdateProfile:', err);
  }
}

/**
 * Hook para ser llamado desde el callback de autenticación
 */
export function useAutoProfileCreation() {
  const handleAuthStateChange = async (event: string, session: any) => {
    if (event === 'SIGNED_IN' && session?.user) {
      await autoCreateOrUpdateProfile(session.user);
    }
  };

  return { handleAuthStateChange };
}
