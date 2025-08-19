"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Cliente normal para obtener el rol del usuario
import { useRouter } from 'next/navigation';
import { listAllUserProfiles, updateUserRole as serverUpdateUserRole } from './serverActions'; // Importar Server Actions

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string; // Asumimos que el email se puede obtener del user.email
  role: 'admin' | 'manager' | 'viewer';
}

export default function UserAdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  const fetchUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase.rpc('get_user_role');
      if (error) console.error('Error fetching user role:', error);
      else setUserRole(data);
    }
  };

  const loadProfiles = async () => {
    setLoading(true);
    setError(null);
    const { profiles: fetchedProfiles, error: fetchError } = await listAllUserProfiles();
    if (fetchError) {
      setError(fetchError);
    } else if (fetchedProfiles) {
      setProfiles(fetchedProfiles);
    }
    setLoading(false);
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

  const handleRoleChange = async (profileId: string, newRole: 'admin' | 'manager' | 'viewer') => {
    setLoading(true);
    setError(null);
    const { success, error: updateError } = await serverUpdateUserRole(profileId, newRole);
    if (updateError) {
      setError(updateError);
      alert(`Error al actualizar el rol: ${updateError}`);
    } else if (success) {
      await loadProfiles(); // Refrescar la lista de perfiles después de la actualización
      alert('Rol actualizado con éxito!');
    }
    setLoading(false);
  };

  if (userRole === null) {
    return <p>Verificando permisos...</p>;
  }

  if (userRole !== 'admin') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-3xl font-bold mb-6">Acceso Denegado</h1>
        <p>No tienes permiso para acceder a esta página.</p>
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
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Administración de Usuarios</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Nombre</th>
              <th className="py-2 px-4 border-b text-left">Apellido</th>
              <th className="py-2 px-4 border-b text-left">Correo Electrónico</th>
              <th className="py-2 px-4 border-b text-left">Rol</th>
              <th className="py-2 px-4 border-b text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b">{profile.first_name || 'N/A'}</td>
                <td className="py-2 px-4 border-b">{profile.last_name || 'N/A'}</td>
                <td className="py-2 px-4 border-b">{profile.email}</td>
                <td className="py-2 px-4 border-b">
                  <select
                    value={profile.role}
                    onChange={(e) => handleRoleChange(profile.id, e.target.value as 'admin' | 'manager' | 'viewer')}
                    className="shadow appearance-none border rounded py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </td>
                <td className="py-2 px-4 border-b">
                  {/* Futuras acciones como eliminar usuario (soft delete), etc. */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
