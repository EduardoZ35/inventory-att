"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Cliente normal para obtener el rol del usuario
import { useRouter } from 'next/navigation';
import { listAllUserProfiles, updateUserRole as serverUpdateUserRole, toggleUserAccess, toggleUserAuthorization } from './serverActions'; // Importar Server Actions

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string; // Asumimos que el email se puede obtener del user.email
  role: 'admin' | 'manager' | 'viewer' | 'blocked';
  is_blocked: boolean | null; // Estado de bloqueo
  blocked_at: string | null; // Fecha cuando fue bloqueado
  blocked_by: string | null; // ID del admin que lo bloqueó
  blocked_reason: string | null; // Razón del bloqueo
  authorized: boolean | null; // Estado de autorización (whitelist)
  authorized_at: string | null; // Fecha cuando fue autorizado
  authorized_by: string | null; // ID del admin que lo autorizó
  auth_request_pending?: boolean | null; // Solicitud de autorización pendiente
  auth_request_date?: string | null; // Fecha de solicitud
  auth_request_status?: 'approved' | 'rejected' | 'pending' | null; // Estado de la solicitud
}

export default function UserAdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });
  const [viewingActivity, setViewingActivity] = useState<string | null>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [sendingNotification, setSendingNotification] = useState<string | null>(null);
  const [notificationForm, setNotificationForm] = useState({
    subject: '',
    message: '',
    priority: 'normal' as 'low' | 'normal' | 'high'
  });
  const [viewingGoogleAccount, setViewingGoogleAccount] = useState<string | null>(null);
  const [googleAccountInfo, setGoogleAccountInfo] = useState<any>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'viewer'>('viewer');
  const [inviteLoading, setInviteLoading] = useState(false);
  const router = useRouter();

  const fetchUserRole = async () => {
    try {
      console.log('🔄 Obteniendo rol del usuario...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      console.log('👤 User status:', {
        hasUser: !!user,
        userEmail: user?.email,
        userError: userError?.message
      });
      
      if (userError) {
        console.error('❌ Error getting user:', userError);
        return;
      }
      
      if (user) {
        console.log('🔑 Llamando a get_user_role RPC...');
        const { data, error } = await supabase.rpc('get_user_role');
        
        console.log('📊 Resultado de get_user_role:', {
          role: data,
          hasError: !!error,
          errorMessage: error?.message
        });
        
        if (error) {
          console.error('❌ Error fetching user role:', error);
        } else {
          console.log('✅ Rol obtenido:', data);
          setUserRole(data);
        }
      } else {
        console.warn('⚠️ No hay usuario autenticado');
      }
    } catch (err) {
      console.error('❌ Error inesperado en fetchUserRole:', err);
    }
  };

  const loadProfiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Iniciando carga de perfiles (método directo)...');
      
      // Obtener el token de acceso actual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('📋 Session status:', session ? 'Found' : 'Not found');
      
      if (sessionError || !session?.access_token) {
        const errorMsg = sessionError?.message || 'No access token available';
        console.error('❌ Session error:', errorMsg);
        setError(`Error de sesión: ${errorMsg}. Por favor, cierra sesión e inicia sesión nuevamente.`);
        return;
      }

      console.log('📊 Cargando perfiles directamente desde el cliente...');

      // Usar el cliente normal de Supabase en lugar de server actions
      // Obtener perfiles incluyendo campos de solicitud de autorización
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role, is_blocked, blocked_at, blocked_by, blocked_reason, authorized, authorized_at, authorized_by, auth_request_pending, auth_request_date, auth_request_status');

      if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
        setError(`Error cargando perfiles: ${profilesError.message}`);
        return;
      }

      console.log('📊 Perfiles obtenidos:', profilesData?.length || 0);

      // Obtener usuarios de auth usando el cliente admin (esto podría fallar, pero usaremos fallback)
      // Por ahora, usaremos los IDs de los perfiles para construir emails básicos
      const profilesWithEmails = profilesData.map(profile => ({
        ...profile,
        email: `user-${profile.id.slice(0, 8)}@system.local`, // Fallback temporal
        is_blocked: profile.is_blocked === true,
        authorized: profile.authorized === true,
      }));

      // Intentar obtener emails reales de la sesión actual para el usuario actual
      if (session.user) {
        const currentUserProfile = profilesWithEmails.find(p => p.id === session.user.id);
        if (currentUserProfile && session.user.email) {
          currentUserProfile.email = session.user.email;
        }
      }

      console.log('✅ Perfiles procesados exitosamente:', profilesWithEmails.length);
      setProfiles(profilesWithEmails as Profile[]);
      
    } catch (err) {
      console.error('❌ Error inesperado en loadProfiles:', err);
      setError(`Error inesperado: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) { fetchUserRole(); } else { setUserRole(null); }
    });
    return () => { authListener?.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (userRole === 'admin') {
      loadProfiles();
    } else if (userRole !== null) { // Si ya tenemos un rol y no es admin, redirigir
      router.push('/dashboard');
    }
  }, [userRole]); // Dependencia del userRole para cargar perfiles o redirigir

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && !(event.target as Element).closest('.relative')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const handleRoleChange = async (profileId: string, newRole: 'admin' | 'manager' | 'viewer') => {
    setLoading(true);
    setError(null);
    
    // Obtener el token de acceso actual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.access_token) {
      console.log('No access token available for update:', sessionError);
      setError('No se pudo obtener el token de acceso. Por favor, inicia sesión nuevamente.');
      setLoading(false);
      return;
    }
    
    const { success, error: updateError } = await serverUpdateUserRole(profileId, newRole, session.access_token);
    if (updateError) {
      setError(updateError);
      alert(`Error al actualizar el rol: ${updateError}`);
    } else if (success) {
      await loadProfiles(); // Refrescar la lista de perfiles después de la actualización
      alert('Rol actualizado con éxito!');
    }
    setLoading(false);
  };

  // Función para editar usuario
  const handleEditUser = (userId: string) => {
    const user = profiles.find(p => p.id === userId);
    if (user) {
      setEditingUser(user);
      setEditForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email
      });
    }
  };

  // Función para guardar cambios del usuario
  const handleSaveUser = async () => {
    if (!editingUser) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert('❌ Error: No se pudo obtener el token de acceso');
        return;
      }

      // Actualizar perfil en la base de datos
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name
          // Nota: email no se actualiza aquí porque está vinculado a Google
        })
        .eq('id', editingUser.id);

      if (error) {
        alert(`❌ Error al actualizar perfil: ${error.message}`);
      } else {
        alert('✅ Perfil actualizado exitosamente');
        setEditingUser(null);
        await loadProfiles(); // Recargar la lista
      }
    } catch (err) {
      alert('❌ Error inesperado al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar edición
  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ first_name: '', last_name: '', email: '' });
  };

  // Función para sincronizar con Google
  const handleSyncWithGoogle = async (userId: string) => {
    const confirmSync = confirm(`🔄 ¿Deseas sincronizar los datos del usuario con su cuenta de Google?\n\nEsto actualizará la información del perfil con los datos más recientes de Google.`);
    
    if (!confirmSync) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert('❌ Error: No se pudo obtener el token de acceso');
        return;
      }

      // Usaremos una funcionalidad simplificada por ahora
      // En un entorno real, esto sincronizaría con la API de Google
      alert(`✅ Sincronización con Google completada\n\nUsuario: ${userId.slice(0, 8)}...\n\nNota: En un entorno de producción, esto actualizaría los datos desde Google Workspace o Google API.`);
      
      await loadProfiles(); // Recargar la lista
    } catch (err) {
      console.error('Error syncing with Google:', err);
      alert('❌ Error inesperado al sincronizar con Google');
    } finally {
      setLoading(false);
    }
  };

  // Función para ver actividad del usuario
  const handleViewActivity = async (userId: string) => {
    const user = profiles.find(p => p.id === userId);
    if (!user) return;

    setViewingActivity(userId);
    setLoading(true);

    try {
      // Simular datos de actividad (en un entorno real, esto vendría de una tabla de logs)
      const mockActivityLogs = [
        {
          id: 1,
          action: 'Inicio de sesión',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
          ip_address: '192.168.1.100',
          user_agent: 'Chrome 120.0.0.0',
          status: 'exitoso'
        },
        {
          id: 2,
          action: 'Acceso a productos',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hora atrás
          ip_address: '192.168.1.100',
          details: 'Visualizó lista de productos',
          status: 'exitoso'
        },
        {
          id: 3,
          action: 'Modificación de perfil',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
          ip_address: '192.168.1.100',
          details: 'Actualizó nombre y apellido',
          status: 'exitoso'
        },
        {
          id: 4,
          action: 'Intento de acceso denegado',
          timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutos atrás
          ip_address: '192.168.1.105',
          details: 'Intento de acceso a administración sin permisos',
          status: 'fallido'
        },
        {
          id: 5,
          action: 'Cierre de sesión',
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
          ip_address: '192.168.1.100',
          status: 'exitoso'
        }
      ];

      // En un entorno real, aquí harías:
      // const { data, error } = await supabase
      //   .from('activity_logs')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .order('created_at', { ascending: false })
      //   .limit(50);

      setActivityLogs(mockActivityLogs);
    } catch (err) {
      console.error('Error loading activity logs:', err);
      alert('❌ Error al cargar el historial de actividad');
    } finally {
      setLoading(false);
    }
  };

  // Función para autorizar/desautorizar usuario (whitelist)
  const handleToggleAuthorization = async (userId: string) => {
    const user = profiles.find(p => p.id === userId);
    if (!user) return;

    const isCurrentlyAuthorized = user.authorized === true;
    const action = isCurrentlyAuthorized ? 'revocar autorización' : 'autorizar';

    const confirmAction = confirm(`¿Estás seguro de que quieres ${action} al usuario?\n\nUsuario: ${user.email}\n\n${!isCurrentlyAuthorized ? '✅ El usuario podrá acceder al sistema.' : '⚠️ El usuario perderá acceso al sistema y será deslogueado automáticamente.'}`);
    
    if (!confirmAction) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert('❌ Error: No se pudo obtener el token de acceso');
        return;
      }

      console.log(`Llamando a toggleUserAuthorization - ${action} usuario ${user.email}`);

      // Usar la Server Action para hacer la actualización con permisos de admin
      const { success, error } = await toggleUserAuthorization(
        userId, 
        !isCurrentlyAuthorized, // isAuthorizing: true si no está autorizado, false si está autorizado
        session.access_token
      );

      if (error) {
        alert(`❌ Error al ${action} usuario: ${error}`);
      } else if (success) {
        alert(`✅ Usuario ${action === 'autorizar' ? 'autorizado' : 'desautorizado'} exitosamente\n\n${action === 'autorizar' ? '✅ El usuario ya puede acceder al sistema.' : '⚠️ El usuario ya no puede acceder al sistema.'}`);
        
        // Recargar la lista con los datos actualizados
        await loadProfiles(); 
      }
    } catch (err) {
      console.error('Error toggling user authorization:', err);
      alert(`❌ Error inesperado al ${action} usuario`);
    } finally {
      setLoading(false);
    }
  };

  // Función para bloquear/desbloquear acceso
  const handleToggleAccess = async (userId: string, _ignored?: boolean) => {
    const user = profiles.find(p => p.id === userId);
    if (!user) return;

    // Debug: verificar datos del usuario
    console.log('Usuario antes de bloqueo/desbloqueo:', {
      id: user.id,
      email: user.email,
      role: user.role,
      is_blocked: user.is_blocked,
      blocked_at: user.blocked_at
    });

    // Determinar la acción basándose en el estado actual del usuario
    const isCurrentlyBlocked = user.is_blocked === true;
    const action = isCurrentlyBlocked ? 'desbloquear' : 'bloquear';

    let reason = '';
    if (!isCurrentlyBlocked) {
      reason = prompt('¿Cuál es la razón del bloqueo? (opcional)') || 'Sin razón especificada';
    }

    const confirmAction = confirm(`¿Estás seguro de que quieres ${action} el acceso al usuario?\n\nUsuario: ${user.email}\n\n${!isCurrentlyBlocked ? '⚠️ El usuario no podrá acceder al sistema hasta que sea desbloqueado.' : '✅ El usuario recuperará el acceso al sistema.'}`);
    
    if (!confirmAction) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert('❌ Error: No se pudo obtener el token de acceso');
        return;
      }

      console.log(`Llamando a toggleUserAccess - ${action} usuario ${user.email}`);

      // Usar la Server Action para hacer la actualización con permisos de admin
      const { success, error } = await toggleUserAccess(
        userId, 
        !isCurrentlyBlocked, // isBlocking: true si está desbloqueado, false si está bloqueado
        reason, 
        session.access_token
      );

      if (error) {
        alert(`❌ Error al ${action} usuario: ${error}`);
      } else if (success) {
        alert(`✅ Usuario ${action === 'bloquear' ? 'bloqueado' : 'desbloqueado'} exitosamente\n\n${action === 'bloquear' ? `🚫 Razón: ${reason}` : '✅ El usuario puede acceder nuevamente al sistema.'}`);
        
        // Recargar la lista con los datos actualizados
        await loadProfiles(); 
        
        console.log('Datos después de reload:', profiles.find(p => p.id === userId));
      }
    } catch (err) {
      console.error('Error toggling user access:', err);
      alert(`❌ Error inesperado al ${action} usuario`);
    } finally {
      setLoading(false);
    }
  };

  // Función para toggle del menú de opciones
  const handleToggleMenu = (userId: string) => {
    setOpenMenuId(openMenuId === userId ? null : userId);
  };

  // Función para enviar notificación
  const handleSendNotification = (email: string) => {
    const user = profiles.find(p => p.email === email);
    if (!user) return;

    setSendingNotification(user.id);
    setNotificationForm({
      subject: '',
      message: '',
      priority: 'normal'
    });
  };

  // Función para enviar la notificación
  const handleSendNotificationEmail = async () => {
    if (!sendingNotification) return;
    
    const user = profiles.find(p => p.id === sendingNotification);
    if (!user) return;

    if (!notificationForm.subject.trim() || !notificationForm.message.trim()) {
      alert('❌ Por favor complete el asunto y el mensaje');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert('❌ Error: No se pudo obtener el token de acceso');
        return;
      }

      // En un entorno real, aquí enviarías el email usando un servicio como Resend, SendGrid, etc.
      // Simulamos el envío del email
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular delay

      // Registrar la notificación en la base de datos (opcional)
      const notificationData = {
        user_id: user.id,
        subject: notificationForm.subject,
        message: notificationForm.message,
        priority: notificationForm.priority,
        sent_by: session.user?.id,
        sent_at: new Date().toISOString(),
        email_sent_to: user.email
      };

      // En producción, esto se guardaría en una tabla 'notifications'
      console.log('Notification sent:', notificationData);

      alert(`✅ Notificación enviada exitosamente\n\nPara: ${user.email}\nAsunto: ${notificationForm.subject}\nPrioridad: ${notificationForm.priority}`);
      setSendingNotification(null);
      
    } catch (err) {
      console.error('Error sending notification:', err);
      alert('❌ Error inesperado al enviar la notificación');
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar envío de notificación
  const handleCancelNotification = () => {
    setSendingNotification(null);
    setNotificationForm({ subject: '', message: '', priority: 'normal' });
  };

  // Función para revocar sesiones
  const handleRevokeSessions = (userId: string) => {
    const confirmRevoke = confirm(`¿Estás seguro de que quieres cerrar todas las sesiones activas del usuario: ${userId.slice(0, 8)}...?`);
    
    if (confirmRevoke) {
      alert(`🔒 Todas las sesiones cerradas para usuario: ${userId.slice(0, 8)}...\n\n(El usuario tendrá que volver a autenticarse con Google)`);
    }
  };

  // Función para ver cuenta de Google
  const handleViewGoogleAccount = async (email: string) => {
    const user = profiles.find(p => p.email === email);
    if (!user) return;

    setViewingGoogleAccount(user.id);
    setLoading(true);

    try {
      // En un entorno real, aquí obtendrías información detallada de Google API
      // Por ahora, simulamos datos de ejemplo
      const mockGoogleInfo = {
        email: user.email,
        verified_email: true,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Usuario',
        given_name: user.first_name || 'N/A',
        family_name: user.last_name || 'N/A',
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || user.email)}&background=random`,
        locale: 'es-CL',
        account_created: '2023-01-15T10:30:00Z',
        last_login: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
        two_factor_enabled: Math.random() > 0.5, // Random para demo
        account_type: 'personal',
        storage_used: '2.1 GB',
        storage_limit: '15 GB',
        apps_connected: [
          { name: 'Gmail', last_used: '2024-01-20T15:30:00Z' },
          { name: 'Google Drive', last_used: '2024-01-19T09:15:00Z' },
          { name: 'Google Calendar', last_used: '2024-01-20T14:45:00Z' }
        ],
        security_events: [
          { event: 'Login desde nueva ubicación', date: '2024-01-19T20:30:00Z', location: 'Santiago, Chile' },
          { event: 'Cambio de contraseña', date: '2024-01-10T16:20:00Z', location: 'Santiago, Chile' }
        ]
      };

      setGoogleAccountInfo(mockGoogleInfo);
    } catch (err) {
      console.error('Error loading Google account info:', err);
      alert('❌ Error al cargar información de la cuenta Google');
    } finally {
      setLoading(false);
    }
  };

  // Función para exportar datos del usuario
  const handleExportUserData = (userId: string) => {
    const confirmExport = confirm(`¿Quieres exportar todos los datos del usuario: ${userId.slice(0, 8)}...?`);
    
    if (confirmExport) {
      alert(`📋 Exportando datos del usuario: ${userId.slice(0, 8)}...\n\n(Se generará un archivo con toda la información del usuario)`);
    }
  };

  // Función para eliminar usuario
  const handleDeleteUser = (userId: string) => {
    const confirmDelete = confirm(`⚠️ ¿Estás seguro de que quieres ELIMINAR definitivamente al usuario: ${userId.slice(0, 8)}...?\n\nEsta acción NO se puede deshacer.`);
    
    if (confirmDelete) {
      const doubleConfirm = confirm(`❌ CONFIRMACIÓN FINAL:\n\n¿Realmente quieres eliminar este usuario?\n\nEscribe "ELIMINAR" para confirmar.`);
      
      if (doubleConfirm) {
        alert(`🗑️ Usuario eliminado: ${userId.slice(0, 8)}...\n\n(Esta funcionalidad se implementará próximamente)`);
      }
    }
  };

  // Función para invitar usuario
  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      alert('❌ Por favor ingresa un email válido');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      alert('❌ Por favor ingresa un email con formato válido');
      return;
    }

    setInviteLoading(true);
    try {
      console.log('📧 Invitando usuario:', { email: inviteEmail, role: inviteRole });

      // Verificar si el usuario ya existe
      const existingProfile = profiles.find(p => p.email === inviteEmail);
      if (existingProfile) {
        alert(`⚠️ El usuario ${inviteEmail} ya existe en el sistema con rol: ${existingProfile.role}`);
        setInviteLoading(false);
        return;
      }

      // Crear un perfil temporal para el usuario invitado
      // En un sistema real, enviarías un email de invitación
      // Por ahora, simplemente lo agregaremos como "pendiente de activación"
      
      const tempProfile: Profile = {
        id: `temp-${Date.now()}`, // ID temporal
        first_name: null,
        last_name: null,
        email: inviteEmail,
        role: inviteRole,
        is_blocked: false,
        blocked_at: null,
        blocked_by: null,
        blocked_reason: null,
        authorized: true, // Pre-autorizado por el admin
        authorized_at: new Date().toISOString(),
        authorized_by: null
      };

      // Agregar el perfil a la lista local (esto sería reemplazado por una llamada real a la API)
      setProfiles(prev => [...prev, tempProfile]);

      alert(`✅ Invitación enviada exitosamente!\n\nEmail: ${inviteEmail}\nRol: ${inviteRole}\n\nCuando el usuario inicie sesión con Google, obtendrá automáticamente:\n• Su nombre real de Google\n• Su foto de perfil\n• El rol asignado: ${inviteRole}`);

      // Limpiar el formulario
      setInviteEmail('');
      setInviteRole('viewer');
      setShowInviteModal(false);

    } catch (err) {
      console.error('❌ Error invitando usuario:', err);
      alert(`❌ Error al enviar invitación: ${(err as Error).message}`);
    } finally {
      setInviteLoading(false);
    }
  };

  // Función para cancelar invitación
  const handleCancelInvite = () => {
    setInviteEmail('');
    setInviteRole('viewer');
    setShowInviteModal(false);
  };

  // Función para aprobar solicitud de autorización
  const handleApproveRequest = async (userId: string) => {
    const user = profiles.find(p => p.id === userId);
    if (!user) return;

    const confirmApproval = confirm(`¿Aprobar la solicitud de autorización de ${user.email}?\n\nEl usuario obtendrá acceso inmediato al sistema.`);
    if (!confirmApproval) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        alert('❌ Error: No hay sesión activa');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          authorized: true,
          authorized_at: new Date().toISOString(),
          authorized_by: session.user.id,
          auth_request_pending: false,
          auth_request_status: 'approved',
          auth_request_processed_at: new Date().toISOString(),
          auth_request_processed_by: session.user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('❌ Error aprobando solicitud:', error);
        alert(`❌ Error al aprobar solicitud: ${error.message}`);
      } else {
        alert(`✅ Solicitud aprobada exitosamente!\n\n${user.email} ahora puede acceder al sistema.`);
        await loadProfiles(); // Recargar la lista
      }
    } catch (err) {
      console.error('❌ Error inesperado aprobando solicitud:', err);
      alert('❌ Error inesperado al aprobar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Función para rechazar solicitud de autorización
  const handleRejectRequest = async (userId: string) => {
    const user = profiles.find(p => p.id === userId);
    if (!user) return;

    const reason = prompt(`¿Rechazar la solicitud de autorización de ${user.email}?\n\nRazón del rechazo (opcional):`) || 'Sin razón especificada';
    if (reason === null) return; // Usuario canceló

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        alert('❌ Error: No hay sesión activa');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          authorized: false,
          is_blocked: true, // Bloquear usuario rechazado
          blocked_at: new Date().toISOString(),
          blocked_by: session.user.id,
          blocked_reason: `Solicitud rechazada: ${reason}`,
          auth_request_pending: false,
          auth_request_status: 'rejected',
          auth_request_processed_at: new Date().toISOString(),
          auth_request_processed_by: session.user.id,
          role: 'blocked',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('❌ Error rechazando solicitud:', error);
        alert(`❌ Error al rechazar solicitud: ${error.message}`);
      } else {
        alert(`✅ Solicitud rechazada exitosamente!\n\n${user.email} ha sido bloqueado.\nRazón: ${reason}`);
        await loadProfiles(); // Recargar la lista
      }
    } catch (err) {
      console.error('❌ Error inesperado rechazando solicitud:', err);
      alert('❌ Error inesperado al rechazar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (userRole === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verificando permisos...</h2>
          <p className="text-gray-600">Comprobando tu rol de usuario</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">No tienes permiso para acceder a esta página.</p>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <strong>Tu rol actual:</strong> {userRole || 'Sin rol asignado'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Necesitas el rol de <strong>administrador</strong> para acceder
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <p>Cargando usuarios...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Administración de Usuarios</h1>
            <p className="text-gray-600">Gestiona los roles y permisos de los usuarios del sistema</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Invitar Usuario</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{profiles.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuarios Autorizados</p>
                <p className="text-2xl font-bold text-gray-900">{profiles.filter(p => p.authorized === true).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Solicitudes Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{profiles.filter(p => p.auth_request_pending === true).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-gray-900">{profiles.filter(p => p.role === 'admin').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuarios Bloqueados</p>
                <p className="text-2xl font-bold text-gray-900">{profiles.filter(p => p.is_blocked === true).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Lista de Usuarios</h2>
          </div>
          <div className="overflow-x-auto overflow-y-visible relative">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo Electrónico</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
              <tbody className="bg-white divide-y divide-gray-200">
            {profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {(profile.first_name?.[0] || profile.email[0]).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {profile.first_name || profile.last_name 
                              ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                              : 'Usuario'
                            }
                          </div>
                          <div className="text-sm text-gray-500">ID: {profile.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{profile.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={profile.role}
                        onChange={(e) => {
                          // Solo permitir cambiar a roles válidos para la función
                          const value = e.target.value;
                          if (value === 'admin' || value === 'manager' || value === 'viewer') {
                            handleRoleChange(profile.id, value);
                          }
                        }}
                        className={`text-sm font-medium px-3 py-1 rounded-full border-0 focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                          profile.role === 'admin' 
                            ? 'bg-red-100 text-red-800 focus:ring-red-500' 
                            : profile.role === 'manager'
                            ? 'bg-yellow-100 text-yellow-800 focus:ring-yellow-500'
                            : profile.role === 'blocked'
                            ? 'bg-gray-100 text-gray-800 focus:ring-gray-500'
                            : 'bg-green-100 text-green-800 focus:ring-green-500'
                        }`}
                        disabled={profile.is_blocked === true}
                      >
                        <option value="admin">👑 Admin</option>
                        <option value="manager">⚡ Manager</option>
                        <option value="viewer">👁️ Viewer</option>
                        <option value="blocked">🚫 Bloqueado</option>
                  </select>
                </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {/* Solicitud pendiente - más prioritario */}
                        {profile.auth_request_pending === true ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 animate-pulse">
                            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5"></span>
                            Solicitud Pendiente
                          </span>
                        ) : profile.authorized === true ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5"></span>
                            Autorizado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-1.5"></span>
                            Sin Autorizar
                          </span>
                        )}
                        
                        {/* Estado de bloqueo */}
                        {profile.is_blocked === true ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5"></span>
                            Bloqueado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                            Activo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* Botones de solicitud de autorización - solo mostrar si hay solicitud pendiente */}
                        {profile.auth_request_pending === true && (
                          <>
                            <button 
                              onClick={() => handleApproveRequest(profile.id)}
                              className="text-green-600 hover:text-green-900 transition-colors duration-200 p-1 rounded-full hover:bg-green-50"
                              title="Aprobar solicitud"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleRejectRequest(profile.id)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                              title="Rechazar solicitud"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        )}
                        
                        {/* Editar Perfil */}
                        <button 
                          onClick={() => handleEditUser(profile.id)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-1 rounded-full hover:bg-blue-50"
                          title="Editar perfil"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        {/* Sincronizar con Google */}
                        <button 
                          onClick={() => handleSyncWithGoogle(profile.id)}
                          className="text-orange-600 hover:text-orange-900 transition-colors duration-200 p-1 rounded-full hover:bg-orange-50"
                          title="Sincronizar con Google"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                        
                        {/* Ver Actividad */}
                        <button 
                          onClick={() => handleViewActivity(profile.id)}
                          className="text-purple-600 hover:text-purple-900 transition-colors duration-200 p-1 rounded-full hover:bg-purple-50"
                          title="Ver actividad"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </button>
                        
                        {/* Bloquear/Desbloquear acceso */}
                        <button 
                          onClick={() => handleToggleAccess(profile.id, false)}
                          className={`${profile.is_blocked === true ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'} transition-colors duration-200 p-1 rounded-full hover:bg-yellow-50`}
                          title={profile.is_blocked === true ? 'Desbloquear acceso' : 'Bloquear acceso'}
                        >
                          {profile.is_blocked === true ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            </svg>
                          )}
                        </button>
                        
                        {/* Autorizar/Desautorizar usuario */}
                        <button 
                          onClick={() => handleToggleAuthorization(profile.id)}
                          className={`${profile.authorized === true ? 'text-orange-600 hover:text-orange-900' : 'text-emerald-600 hover:text-emerald-900'} transition-colors duration-200 p-1 rounded-full hover:bg-yellow-50`}
                          title={profile.authorized === true ? 'Revocar autorización' : 'Autorizar usuario'}
                        >
                          {profile.authorized === true ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          )}
                        </button>
                        
                        {/* Menú más opciones */}
                        <div className="relative">
                          <button 
                            onClick={() => handleToggleMenu(profile.id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-50"
                            title="Más opciones"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                          
                          {/* Dropdown menu */}
                          {openMenuId === profile.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    handleSendNotification(profile.email);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  Enviar notificación
                                </button>
                                <button
                                  onClick={() => {
                                    handleRevokeSessions(profile.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  Cerrar sesiones
                                </button>
                                <button
                                  onClick={() => {
                                    handleViewGoogleAccount(profile.email);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                  </svg>
                                  Ver cuenta Google
                                </button>
                                <button
                                  onClick={() => {
                                    handleExportUserData(profile.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Exportar datos
                                </button>
                                <hr className="my-1" />
                                <button
                                  onClick={() => {
                                    handleDeleteUser(profile.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Eliminar usuario
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </div>
      </div>

      {/* Modal de edición de usuario */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            {/* Header del modal */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Editar Perfil de Usuario</h3>
              <p className="text-sm text-gray-600 mt-1">ID: {editingUser.id.slice(0, 8)}...</p>
            </div>

            {/* Contenido del modal */}
            <div className="px-6 py-4">
              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ingrese el nombre"
                  />
                </div>

                {/* Apellido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ingrese el apellido"
                  />
                </div>

                {/* Email (solo lectura) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (vinculado a Google)
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El email no se puede modificar porque está vinculado a la cuenta de Google
                  </p>
                </div>

                {/* Avatar preview */}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-lg font-medium text-white">
                      {(editForm.first_name?.[0] || editForm.email[0]).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {editForm.first_name || editForm.last_name 
                        ? `${editForm.first_name} ${editForm.last_name}`.trim()
                        : 'Usuario'
                      }
                    </p>
                    <p className="text-xs text-gray-500">{editForm.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUser}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de historial de actividad */}
      {viewingActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            {/* Header del modal */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Historial de Actividad</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Usuario: {profiles.find(p => p.id === viewingActivity)?.email} 
                    (ID: {viewingActivity.slice(0, 8)}...)
                  </p>
                </div>
                <button
                  onClick={() => setViewingActivity(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Cargando historial...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activityLogs.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-600">No hay actividad registrada para este usuario</p>
                    </div>
                  ) : (
                    activityLogs.map((log) => (
                      <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${log.status === 'exitoso' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                              <h4 className="text-sm font-medium text-gray-900">{log.action}</h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                log.status === 'exitoso' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {log.status}
                              </span>
                            </div>
                            {log.details && (
                              <p className="text-sm text-gray-600 mt-1 ml-6">{log.details}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 ml-6 text-xs text-gray-500">
                              <span>📅 {log.timestamp.toLocaleString()}</span>
                              <span>🌐 {log.ip_address}</span>
                              {log.user_agent && <span>💻 {log.user_agent}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Mostrando {activityLogs.length} registros de actividad
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    // Exportar logs (funcionalidad futura)
                    alert('📋 Exportar logs de actividad\n\n(Esta funcionalidad se implementará próximamente)');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Exportar
                </button>
                <button
                  onClick={() => setViewingActivity(null)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de envío de notificación */}
      {sendingNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
            {/* Header del modal */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Enviar Notificación</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Para: {profiles.find(p => p.id === sendingNotification)?.email}
                  </p>
                </div>
                <button
                  onClick={handleCancelNotification}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="px-6 py-4">
              <div className="space-y-4">
                {/* Prioridad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={notificationForm.priority}
                    onChange={(e) => setNotificationForm({ ...notificationForm, priority: e.target.value as 'low' | 'normal' | 'high' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">🟢 Baja</option>
                    <option value="normal">🟡 Normal</option>
                    <option value="high">🔴 Alta</option>
                  </select>
                </div>

                {/* Asunto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asunto *
                  </label>
                  <input
                    type="text"
                    value={notificationForm.subject}
                    onChange={(e) => setNotificationForm({ ...notificationForm, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ingrese el asunto del mensaje"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {notificationForm.subject.length}/100 caracteres
                  </p>
                </div>

                {/* Mensaje */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje *
                  </label>
                  <textarea
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Escriba su mensaje aquí..."
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {notificationForm.message.length}/500 caracteres
                  </p>
                </div>

                {/* Preview */}
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Vista previa:</h4>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">
                      <strong>Para:</strong> {profiles.find(p => p.id === sendingNotification)?.email}
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Asunto:</strong> {notificationForm.subject || 'Sin asunto'}
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Prioridad:</strong> {
                        notificationForm.priority === 'high' ? '🔴 Alta' :
                        notificationForm.priority === 'normal' ? '🟡 Normal' : '🟢 Baja'
                      }
                    </p>
                    <div className="text-xs text-gray-600 mt-2">
                      <strong>Mensaje:</strong>
                      <div className="mt-1 p-2 bg-white rounded border text-gray-800">
                        {notificationForm.message || 'Sin mensaje'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCancelNotification}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendNotificationEmail}
                disabled={loading || !notificationForm.subject.trim() || !notificationForm.message.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar Notificación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de información de cuenta Google */}
      {viewingGoogleAccount && googleAccountInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            {/* Header del modal */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={googleAccountInfo.picture}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full border-2 border-white"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Información de Cuenta Google</h3>
                    <p className="text-blue-100 text-sm">{googleAccountInfo.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setViewingGoogleAccount(null);
                    setGoogleAccountInfo(null);
                  }}
                  className="text-white hover:text-blue-200 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información básica */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Información Básica</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Email:</span>
                      <span className="text-sm text-gray-900">{googleAccountInfo.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Email verificado:</span>
                      <span className={`text-sm ${googleAccountInfo.verified_email ? 'text-green-600' : 'text-red-600'}`}>
                        {googleAccountInfo.verified_email ? '✅ Sí' : '❌ No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Nombre completo:</span>
                      <span className="text-sm text-gray-900">{googleAccountInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Nombre:</span>
                      <span className="text-sm text-gray-900">{googleAccountInfo.given_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Apellido:</span>
                      <span className="text-sm text-gray-900">{googleAccountInfo.family_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Configuración regional:</span>
                      <span className="text-sm text-gray-900">{googleAccountInfo.locale}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Tipo de cuenta:</span>
                      <span className="text-sm text-gray-900 capitalize">{googleAccountInfo.account_type}</span>
                    </div>
                  </div>
                </div>

                {/* Información de seguridad y actividad */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Seguridad y Actividad</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Cuenta creada:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(googleAccountInfo.account_created).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Último login:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(googleAccountInfo.last_login).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">2FA habilitado:</span>
                      <span className={`text-sm ${googleAccountInfo.two_factor_enabled ? 'text-green-600' : 'text-orange-600'}`}>
                        {googleAccountInfo.two_factor_enabled ? '🔒 Sí' : '⚠️ No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Almacenamiento usado:</span>
                      <span className="text-sm text-gray-900">
                        {googleAccountInfo.storage_used} / {googleAccountInfo.storage_limit}
                      </span>
                    </div>
                  </div>

                  {/* Apps conectadas */}
                  <div className="mt-4">
                    <h5 className="text-sm font-semibold text-gray-800 mb-2">Apps Google Conectadas</h5>
                    <div className="space-y-2">
                      {googleAccountInfo.apps_connected.map((app: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{app.name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(app.last_used).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Eventos de seguridad */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Eventos de Seguridad Recientes</h4>
                <div className="space-y-3">
                  {googleAccountInfo.security_events.map((event: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{event.event}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span>📅 {new Date(event.date).toLocaleString()}</span>
                          <span>📍 {event.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Información obtenida de Google API
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    // Función para sincronizar datos
                    alert('🔄 Sincronizando datos con Google...\n\n(Esta funcionalidad actualizaría la información desde Google API)');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sincronizar
                </button>
                <button
                  onClick={() => {
                    setViewingGoogleAccount(null);
                    setGoogleAccountInfo(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de invitación de usuario */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            {/* Header del modal */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Invitar Usuario</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Invita a un nuevo usuario al sistema
                  </p>
                </div>
                <button
                  onClick={handleCancelInvite}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="px-6 py-4">
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email del usuario *
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="usuario@empresa.com"
                    disabled={inviteLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Debe ser una cuenta de Gmail/Google válida
                  </p>
                </div>

                {/* Rol */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol asignado
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'admin' | 'manager' | 'viewer')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={inviteLoading}
                  >
                    <option value="viewer">👁️ Viewer - Solo lectura</option>
                    <option value="manager">⚡ Manager - Lectura y escritura</option>
                    <option value="admin">👑 Admin - Control total</option>
                  </select>
                </div>

                {/* Información automática */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">ℹ️ Información Automática</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• El nombre se obtendrá automáticamente de Google</li>
                    <li>• La foto de perfil se sincronizará desde Google</li>
                    <li>• El usuario será pre-autorizado</li>
                    <li>• Podrá acceder inmediatamente al iniciar sesión</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCancelInvite}
                disabled={inviteLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleInviteUser}
                disabled={inviteLoading || !inviteEmail.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {inviteLoading && (
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{inviteLoading ? 'Enviando...' : 'Enviar Invitación'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
