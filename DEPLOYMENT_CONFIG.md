# Configuración de Despliegue - Supabase & Google OAuth

## 🚨 Problema Actual
El login con Google redirecciona a `http://localhost:3000/dashboard` en lugar de la URL de Vercel.

## 🔧 Solución Requerida

### 1. Configurar URLs en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** > **Credentials**
4. Encuentra tu **OAuth 2.0 Client ID**
5. En **Authorized redirect URIs**, agrega:
   ```
   https://inventory-att.vercel.app/auth/callback
   ```
6. **¡IMPORTANTE!** Elimina o comenta la URL de localhost si existe:
   ```
   http://localhost:3000/auth/callback  ← REMOVER ESTA
   ```

### 2. Configurar URLs en Supabase Dashboard

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Authentication** > **URL Configuration**
4. En **Site URL**, configura:
   ```
   https://inventory-att.vercel.app
   ```
5. En **Redirect URLs**, agrega:
   ```
   https://inventory-att.vercel.app/auth/callback
   https://inventory-att.vercel.app/dashboard
   https://inventory-att.vercel.app/**
   ```

### 3. Variables de Entorno en Vercel

1. Ve a tu [dashboard de Vercel](https://vercel.com/dashboard)
2. Selecciona el proyecto `inventory-att`
3. Ve a **Settings** > **Environment Variables**
4. Agrega o verifica estas variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-supabase-anon-key
   NEXT_PUBLIC_BASE_URL=https://inventory-att.vercel.app
   ```

### 4. Re-desplegar

Después de configurar todo, re-despliega la aplicación:
```bash
git add .
git commit -m "Fix: OAuth redirect URLs configuration"
git push
```

## 🔍 Debug

Para verificar que funciona correctamente:

1. Abre las **Developer Tools** (F12)
2. Ve a la **Console**
3. Inicia el proceso de login
4. Deberías ver logs como:
   ```
   🚀 Vercel detected, using redirect URL: https://inventory-att.vercel.app/auth/callback
   🔄 Starting Google OAuth with redirect URL: https://inventory-att.vercel.app/auth/callback
   ```

## ⚠️ Nota Importante

El problema NO se puede resolver solo con código. Las URLs de redirección deben estar configuradas correctamente en:
- Google Cloud Console (lado de Google)
- Supabase Dashboard (lado de Supabase)

Sin esta configuración, Google siempre redirigirá a localhost o dará error.
