# Las de Caro

Tienda + panel de administración de Las de Caro, en React + Vite, con
Supabase como backend (catálogo + fotos).

## Desarrollo local

1. `npm install`
2. Copiá `.env.example` a `.env.local` y completá con los datos de tu
   proyecto de Supabase (Settings → API → Project URL / anon public key).
3. `npm run dev`

## Compilar para producción

```bash
npm run build
npm run preview   # para probar el build localmente
```

## Configurar Supabase (una sola vez)

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. Andá a **SQL Editor**, pegá el contenido de `supabase/schema.sql` y
   tocá **Run**. Esto crea la tabla del catálogo y el bucket de fotos,
   con los permisos necesarios.
3. Andá a **Settings → API** y copiá el **Project URL** y la
   **anon public key**. Esos dos valores son los que van en `.env.local`
   (local) y en los secrets de GitHub (producción).

## Publicar en GitHub Pages

El workflow `.github/workflows/deploy.yml` compila y publica solo en cada
`push` a `main`. Antes de que funcione:

1. **Settings → Pages → Source → "GitHub Actions"**.
2. **Settings → Secrets and variables → Actions → New repository secret**,
   agregá dos:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

La URL final va a ser `https://<tu-usuario>.github.io/las-de-caro/`.

## ⚠️ Nota de seguridad importante

Este proyecto no tiene backend propio — es un sitio estático que habla
directo con Supabase usando la clave pública (`anon key`). Esa clave es
segura de exponer *tal cual está pensada por Supabase*, pero las políticas
de la base de datos (`supabase/schema.sql`) están configuradas para que
**cualquiera pueda leer y escribir** en la tabla del catálogo y subir fotos
— no solo desde el panel de admin de la web.

En la práctica esto significa que la clave del panel (protección solo a
nivel de interfaz) no es seguridad real: alguien con conocimientos
técnicos que consiga tu `anon key` (que viaja pública en el código del
sitio, es inevitable) podría escribir directamente contra la base de datos
sin pasar por el panel.

Para un catálogo de decoración esto suele ser un riesgo bajo, pero si en
algún momento te preocupa, el siguiente paso es agregar **Supabase Auth**
(usuario y contraseña reales para el admin) y restringir las políticas de
escritura a usuarios autenticados. Avisame cuando quieras dar ese paso.
