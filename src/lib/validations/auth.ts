import { z } from 'zod';

// Schema para login
export const loginSchema = z.object({
  email: z.string()
    .email('Ingrese un correo electrónico válido')
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

// Schema para registro
export const registerSchema = z.object({
  email: z.string()
    .email('Ingrese un correo electrónico válido')
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[!@#$%^&*]/, 'Debe contener al menos un carácter especial'),
  
  confirmPassword: z.string(),
  
  firstName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras')
    .trim(),
  
  lastName: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras')
    .trim(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// Schema para actualizar perfil
export const updateProfileSchema = z.object({
  firstName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras')
    .trim()
    .optional(),
  
  lastName: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras')
    .trim()
    .optional(),
  
  phone: z.string()
    .regex(/^(\+?56)?9\d{8}$/, 'Ingrese un número de teléfono válido')
    .optional()
    .nullable(),
});

// Schema para cambiar contraseña
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Ingrese su contraseña actual'),
  
  newPassword: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[!@#$%^&*]/, 'Debe contener al menos un carácter especial'),
  
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmNewPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'La nueva contraseña debe ser diferente a la actual',
  path: ['newPassword'],
});

// Schema para invitar usuario
export const inviteUserSchema = z.object({
  email: z.string()
    .email('Ingrese un correo electrónico válido')
    .toLowerCase()
    .trim(),
  
  role: z.enum(['admin', 'manager', 'viewer'], {
    message: 'Debe seleccionar un rol válido (admin, manager, viewer)',
  }),
});

// Tipos inferidos
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;

// Funciones de validación helper
export function validateLogin(data: unknown) {
  return loginSchema.safeParse(data);
}

export function validateRegister(data: unknown) {
  return registerSchema.safeParse(data);
}

export function validateUpdateProfile(data: unknown) {
  return updateProfileSchema.safeParse(data);
}

export function validateChangePassword(data: unknown) {
  return changePasswordSchema.safeParse(data);
}

export function validateInviteUser(data: unknown) {
  return inviteUserSchema.safeParse(data);
}
