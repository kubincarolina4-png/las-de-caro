/**
 * Reemplazo de la API window.storage que provee Claude Artifacts,
 * ahora respaldado por Supabase, para que LasDeCaro.jsx funcione
 * SIN CAMBIOS fuera de ese entorno, con datos de verdad compartidos
 * entre todos los visitantes.
 *
 * - Los datos "de texto" (catálogo, ajustes, newsletter) viven en la
 *   tabla store_kv (ver supabase/schema.sql).
 * - Las imágenes (claves que empiezan con "img_") se suben de verdad
 *   al bucket de Storage "product-images", y lo que se guarda en
 *   store_kv es la URL pública resultante.
 */

import { supabase } from "./supabaseClient.js";

const TABLE = "store_kv";
const BUCKET = "product-images";

function isImageKey(key) {
  return key.startsWith("img_");
}

function dataUrlToBlob(dataUrl) {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!match) return null;
  const [, mime, base64] = match;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

async function uploadImage(key, dataUrl) {
  const blob = dataUrlToBlob(dataUrl);
  if (!blob) throw new Error("La imagen no tiene el formato esperado (data URL).");
  const path = `${key}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { upsert: true, contentType: blob.type || "image/jpeg" });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function removeImage(key) {
  await supabase.storage.from(BUCKET).remove([`${key}.jpg`]);
}

async function get(key, shared = true) {
  try {
    const { data, error } = await supabase.from(TABLE).select("value").eq("key", key).maybeSingle();
    if (error || !data) return null;
    return { key, value: data.value, shared };
  } catch (err) {
    console.warn("[storage] get falló:", err);
    return null;
  }
}

async function set(key, value, shared = true) {
  try {
    let finalValue = value;
    // Si es una foto recién subida (viene como data URL en base64), la
    // subimos de verdad al bucket y guardamos la URL pública en la tabla.
    if (isImageKey(key) && typeof value === "string" && value.startsWith("data:")) {
      finalValue = await uploadImage(key, value);
    }
    const { error } = await supabase.from(TABLE).upsert({ key, value: finalValue });
    if (error) throw error;
    return { key, value: finalValue, shared };
  } catch (err) {
    console.warn("[storage] set falló:", err);
    return null;
  }
}

async function del(key, shared = true) {
  try {
    if (isImageKey(key)) await removeImage(key);
    const { error } = await supabase.from(TABLE).delete().eq("key", key);
    if (error) throw error;
    return { key, deleted: true, shared };
  } catch (err) {
    console.warn("[storage] delete falló:", err);
    return null;
  }
}

async function list(prefix = "", shared = true) {
  try {
    const { data, error } = await supabase.from(TABLE).select("key").like("key", `${prefix}%`);
    if (error) return null;
    return { keys: (data || []).map((r) => r.key), prefix, shared };
  } catch (err) {
    console.warn("[storage] list falló:", err);
    return null;
  }
}

if (typeof window !== "undefined") {
  window.storage = { get, set, delete: del, list };
}

export default typeof window !== "undefined" ? window.storage : null;
