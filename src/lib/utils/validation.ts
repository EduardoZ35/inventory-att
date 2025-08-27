/**
 * Utilidades de validación para el sistema de inventario
 */

/**
 * Validar formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validar contraseña segura
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una letra mayúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una letra minúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Debe contener al menos un carácter especial');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validar número de teléfono chileno
 */
export function isValidChileanPhone(phone: string): boolean {
  // Formato: +56 9 XXXX XXXX o 9 XXXX XXXX
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[()-]/g, '');
  const phoneRegex = /^(\+?56)?9\d{8}$/;
  return phoneRegex.test(cleanPhone);
}

/**
 * Validar RUT chileno
 */
export function validateRUT(rut: string): boolean {
  // Limpiar RUT
  const cleanRUT = rut.replace(/[.-]/g, '').toUpperCase();
  
  if (cleanRUT.length < 2) return false;
  
  const body = cleanRUT.slice(0, -1);
  const dv = cleanRUT.slice(-1);
  
  // Validar que el cuerpo sea numérico
  if (!/^\d+$/.test(body)) return false;
  
  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedDV = 11 - (sum % 11);
  const calculatedDV = expectedDV === 11 ? '0' : expectedDV === 10 ? 'K' : expectedDV.toString();
  
  return calculatedDV === dv;
}

/**
 * Formatear RUT chileno
 */
export function formatRUT(rut: string): string {
  const cleanRUT = rut.replace(/[.-]/g, '').toUpperCase();
  if (cleanRUT.length < 2) return rut;
  
  const body = cleanRUT.slice(0, -1);
  const dv = cleanRUT.slice(-1);
  
  // Formatear con puntos y guión
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedBody}-${dv}`;
}

/**
 * Validar número positivo
 */
export function isPositiveNumber(value: any): boolean {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}

/**
 * Validar rango de precio
 */
export function isValidPriceRange(min: number, max: number): boolean {
  return min >= 0 && max >= 0 && min <= max;
}

/**
 * Sanitizar entrada de texto
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '');
}

/**
 * Validar código de barras
 */
export function isValidBarcode(barcode: string): boolean {
  // EAN-13
  if (barcode.length === 13 && /^\d+$/.test(barcode)) {
    return true;
  }
  
  // EAN-8
  if (barcode.length === 8 && /^\d+$/.test(barcode)) {
    return true;
  }
  
  // UPC-A
  if (barcode.length === 12 && /^\d+$/.test(barcode)) {
    return true;
  }
  
  return false;
}

/**
 * Validar número de serie
 */
export function isValidSerialNumber(serial: string): boolean {
  // Mínimo 4 caracteres, alfanumérico
  return /^[A-Z0-9]{4,}$/i.test(serial);
}

/**
 * Validar fecha
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validar que una fecha sea futura
 */
export function isFutureDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return isValidDate(dateString) && date > now;
}

/**
 * Validar que una fecha sea pasada
 */
export function isPastDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return isValidDate(dateString) && date < now;
}

/**
 * Validar rango de fechas
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return false;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return start <= end;
}

/**
 * Truncar texto con elipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Validar archivo de imagen
 */
export function isValidImageFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!validTypes.includes(file.type)) {
    return { isValid: false, error: 'Tipo de archivo no válido. Use JPG, PNG o WebP.' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'El archivo es demasiado grande. Máximo 5MB.' };
  }
  
  return { isValid: true };
}

/**
 * Generar slug desde texto
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}



