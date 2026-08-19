import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ShoppingBag, Plus, Minus, Trash2, X, Search, ChevronRight, Loader2,
  Package, Instagram, Menu, Lock, LockOpen, Upload, Check, Settings2, ImageOff,
  Pencil, Eye, EyeOff, ArrowUp, ArrowDown,
} from "lucide-react";

/* ============================ Datos y helpers ============================ */

const FONT_IMPORT_URL =
  "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500;1,9..144,600&family=Work+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap";

const CATEGORIES = [
  "Platos de sitio", "Cestas organizadoras", "Porta aromatizantes", "Flores aromatizantes",
  "Hueveras", "Paneras", "Porta vasos", "Servilleteros", "Otros",
];
const COLORES = ["Marrón", "Crudo", "Combinado"];
const MAX_IMAGES = 4;
const MAX_FILE_MB = 8;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const RINCONES = [
  { label: "Cocina", cat: "Paneras" },
  { label: "Mesa", cat: "Platos de sitio" },
  { label: "Organización", cat: "Cestas organizadoras" },
  { label: "Decoración", cat: "Porta aromatizantes" },
  { label: "Textiles", cat: "Servilleteros" },
  { label: "Regalos", cat: "Otros" },
];

const ARTICULOS = [
  { title: "Cómo armar una mesa cálida", teaser: "Individuales, servilleteros y pequeños gestos que cambian todo." },
  { title: "5 ideas para organizar tu cocina", teaser: "Cestas y paneras que ordenan sin perder calidez." },
  { title: "Flores y objetos que transforman un rincón", teaser: "Un porta aromatizante y una flor seca alcanzan." },
  { title: "Cómo combinar fibras naturales", teaser: "Yute, símil yute y madera: texturas que conviven bien." },
  { title: "Pequeños detalles para recibir amigos", teaser: "Lo que sumamos a la mesa cuando viene gente a casa." },
];

const DEFAULT_SETTINGS = {
  storeName: "Las de Caro",
  tagline: "Trabajitos hechos con amor",
  whatsapp: "5493743481709",
  adminPassword: "",
  instagram: "lasdecaro1",
};

const DEMO_PRODUCTS = [
  { id: "demo-1", name: "Set de platos de sitio tejidos", price: 8500, category: "Platos de sitio", color: "Crudo", description: "Individuales tejidos en yute, base plana. Se venden por unidad o en set.", images: [], visible: true },
  { id: "demo-2", name: "Cesta organizadora redonda", price: 12300, category: "Cestas organizadoras", color: "Marrón", description: "Cesta tejida a mano con detalle de cuero, ideal para guardar cositas.", images: [], visible: true },
  { id: "demo-3", name: "Porta aromatizante con flores secas", price: 6400, category: "Porta aromatizantes", color: "Crudo", description: "Base tejida con aromatizante y flores secas, para mesa o repisa.", images: [], visible: true },
  { id: "demo-4", name: "Huevera tejida", price: 5200, category: "Hueveras", color: "Crudo", description: "Huevera artesanal tejida en yute, detalle de cuero.", images: [], visible: true },
  { id: "demo-5", name: "Panera ovalada", price: 9800, category: "Paneras", color: "Combinado", description: "Panera tejida en yute y símil yute, base reforzada.", images: [], visible: true },
  { id: "demo-6", name: "Set de servilleteros x4", price: 4900, category: "Servilleteros", color: "Marrón", description: "Servilleteros tejidos a juego con los individuales.", images: [], visible: true },
];

function formatARS(value) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value || 0);
}
function slugPad(n) { return String(n).padStart(2, "0"); }

/* Redimensiona y comprime la imagen en el navegador antes de guardarla como base64 */
function resizeImageFile(file, maxWidth = 1000, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = Math.round(h * (maxWidth / w)); w = maxWidth; }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("No se pudo leer la imagen."));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}

/* ============================ Motivo botánico (único, restringido) ============================ */
function Sprig({ className = "" }) {
  return (
    <svg viewBox="0 0 60 90" fill="none" className={className}>
      <path d="M30 88V22" stroke="#74795B" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M30 54c-7-4-13-2-16 2 2 5 10 6 16 2M30 40c7-4 13-2 16 2-2 5-10 6-16 2" stroke="#74795B" strokeWidth="1" fill="none" opacity="0.75" />
      <circle cx="30" cy="12" r="8" fill="#C98868" opacity="0.28" />
      <circle cx="30" cy="12" r="8" stroke="#C98868" strokeWidth="1" fill="none" />
      <circle cx="15" cy="28" r="4.5" fill="#C7A79E" opacity="0.35" />
      <circle cx="15" cy="28" r="4.5" stroke="#C7A79E" strokeWidth="0.8" fill="none" />
    </svg>
  );
}

function PaperTexture() {
  return (
    <svg className="pointer-events-none fixed inset-0 w-full h-full" style={{ opacity: 0.035, zIndex: 0 }} preserveAspectRatio="none">
      <filter id="paper-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#paper-grain)" />
    </svg>
  );
}

function ProductPlaceholder({ name = "", className = "" }) {
  const hues = ["#74795B", "#C98868", "#8B6F52", "#8FA0A6", "#C7A79E"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % hues.length;
  const color = hues[Math.abs(h) % hues.length];
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ background: `${color}1c` }}>
      <span className="font-display italic" style={{ color, fontSize: "2rem" }}>{initial}</span>
    </div>
  );
}

function PhotoPlaceholder({ label = "", tone = "#EDE0C8", className = "" }) {
  return (
    <div className={`flex items-end p-3 ${className}`} style={{ background: tone }}>
      <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "#6B6155" }}>{label}</span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs" style={{ color: "#6B6155" }}>{label}</span>
      {children}
    </label>
  );
}

/* ============================ Tarjeta de producto (tienda) ============================ */
function ProductCard({ product, index, imageCache, onAdd, ink }) {
  const [active, setActive] = useState(0);
  const imgs = (product.images || []).map((k) => imageCache[k]).filter(Boolean);

  return (
    <div className="flex flex-col rounded-xl overflow-hidden" style={{ background: "#FBF7EF", border: "1px solid #E6D9C2" }}>
      <div className="aspect-square relative">
        {imgs.length > 0 ? (
          <img src={imgs[active]} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <ProductPlaceholder name={product.name} className="w-full h-full" />
        )}
        <span className="absolute top-2 left-2 font-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: "#3A312899", color: "#F7F2E7" }}>
          N.{slugPad(index + 1)}
        </span>
        {imgs.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {imgs.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className="w-1.5 h-1.5 rounded-full" style={{ background: i === active ? "#3A3128" : "#3A312855" }} aria-label={`Ver foto ${i + 1}`} />
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col p-3 gap-1">
        <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider" style={{ color: "#C98868" }}>
          <span>{product.category}</span>
          {product.color && <span style={{ color: "#8C7F6A" }}>· {product.color}</span>}
        </div>
        <div className="text-sm leading-snug font-medium">{product.name}</div>
        {product.description && <div className="text-xs leading-snug" style={{ color: "#8C7F6A" }}>{product.description}</div>}
        <div className="h-px my-1" style={{ background: "#E6D9C2" }} />
        <div className="flex items-center justify-between">
          <span className="font-display italic text-lg">{formatARS(product.price)}</span>
          <button
            onClick={() => onAdd(product.id)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90"
            style={{ background: ink, color: "#F7F2E7" }}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================ Cargador de imágenes (admin) ============================ */
function ImageUploader({ draftId, images, onChange }) {
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  async function handleFiles(fileList) {
    setError("");
    const files = Array.from(fileList || []);
    if (!files.length) return;
    if (images.length + files.length > MAX_IMAGES) {
      setError(`Máximo ${MAX_IMAGES} fotos por producto.`);
      return;
    }
    setUploading(true);
    const next = [...images];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Formato no permitido. Usá JPG, PNG o WEBP.");
        continue;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setError(`La imagen pesa demasiado (máximo ${MAX_FILE_MB}MB).`);
        continue;
      }
      try {
        const dataUrl = await resizeImageFile(file);
        const key = `img_${draftId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const saved = await window.storage.set(key, dataUrl, true);
        if (!saved) throw new Error("no guardado");
        next.push({ key, dataUrl });
      } catch {
        setError("Hubo un error al subir una de las imágenes. Probá de nuevo.");
      }
    }
    onChange(next);
    setUploading(false);
  }

  async function removeImage(idx) {
    const img = images[idx];
    const next = images.filter((_, i) => i !== idx);
    onChange(next);
    try {
      if (img?.key) await window.storage.delete(img.key, true);
    } catch {
      // si falla el borrado remoto, igual la sacamos de la lista
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs" style={{ color: "#6B6155" }}>Fotos del producto (hasta {MAX_IMAGES})</span>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, idx) => (
            <div key={img.key} className="relative w-16 h-16 rounded-md overflow-hidden shrink-0" style={{ border: "1px solid #D8CDBB" }}>
              <img src={img.dataUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: "#2A2521cc", color: "#fff" }}
                aria-label="Quitar imagen"
              >
                <X size={10} />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-0 left-0 right-0 text-center font-mono text-[8px] py-0.5" style={{ background: "#2A2521cc", color: "#EAE3D6" }}>
                  Portada
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length < MAX_IMAGES && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          className="flex flex-col items-center justify-center gap-1.5 py-5 rounded-md cursor-pointer text-center transition-colors"
          style={{ border: `1.5px dashed ${dragOver ? "#2F5D57" : "#D8CDBB"}`, background: dragOver ? "#2F5D5711" : "#FFFFFF" }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {uploading ? <Loader2 size={18} className="animate-spin" style={{ color: "#8C7F6A" }} /> : <Upload size={18} style={{ color: "#8C7F6A" }} />}
          <span className="text-xs" style={{ color: "#6B6155" }}>{uploading ? "Subiendo…" : "Subir imagen o arrastrá acá"}</span>
          <span className="font-mono text-[10px]" style={{ color: "#A99D86" }}>JPG · PNG · WEBP · hasta {MAX_FILE_MB}MB</span>
        </div>
      )}

      {error && <div className="text-xs" style={{ color: "#A34632" }}>{error}</div>}
      {images.length > 0 && !error && (
        <div className="flex items-center gap-1 text-xs" style={{ color: "#2F5D57" }}>
          <Check size={12} /> {images.length} imagen{images.length !== 1 ? "es" : ""} cargada{images.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

/* ============================ Puerta de acceso admin ============================ */
function AdminGate({ hasPassword, checkPassword, onSuccess, onResetPassword, onBackToStore }) {
  const [value, setValue] = useState("");
  const [confirmValue, setConfirmValue] = useState("");
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [justReset, setJustReset] = useState(false);

  function trySubmit() {
    try {
      const v = value.trim();
      if (!hasPassword) {
        const c = confirmValue.trim();
        if (v.length < 4) return setError("Usá al menos 4 caracteres.");
        if (v !== c) return setError("Las claves no coinciden. Revisá que no haya espacios de más.");
        onSuccess(v);
      } else {
        if (checkPassword(v)) onSuccess(null);
        else setError("Clave incorrecta. Fijate que no haya un espacio de más al principio o al final.");
      }
    } catch {
      setError("Hubo un error inesperado. Probá tocar el botón de nuevo.");
    }
  }

  function handleReset() {
    onResetPassword();
    setValue(""); setConfirmValue(""); setError(""); setJustReset(true);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") { e.preventDefault(); trySubmit(); }
  }

  return (
    <div className="w-full min-h-[720px] flex items-center justify-center p-5" style={{ background: "#F7F2E7", fontFamily: "'Work Sans', sans-serif" }}>
      <style>{`
        @import url('${FONT_IMPORT_URL}');
        .font-display { font-family: 'Fraunces', serif; }
        input:focus, button:focus { outline: 2px solid #2F5D57; outline-offset: 2px; }
      `}</style>
      <div className="w-full max-w-xs rounded-xl p-6 flex flex-col gap-3" style={{ background: "#FBF7EF", border: "1px solid #E6D9C2" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-display italic text-xl">
            <Lock size={18} color="#3A3128" /> {hasPassword ? "Panel de administración" : "Crear clave de acceso"}
          </div>
          <button type="button" onClick={onBackToStore} className="text-[10px] font-mono uppercase" style={{ color: "#8C7F6A" }}>
            Volver
          </button>
        </div>
        <p className="text-xs" style={{ color: "#8C7F6A" }}>
          {hasPassword
            ? "Ingresá la clave para cargar y editar el catálogo."
            : "Es la primera vez que se abre este panel: elegí una clave para que solo quien la sepa pueda administrar el catálogo."}
        </p>

        {justReset && (
          <div className="text-xs p-2.5 rounded-md" style={{ background: "#74795B22", color: "#4A5340" }}>
            Listo, se borró la clave anterior. Escribí una nueva abajo.
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              placeholder={hasPassword ? "Clave de administrador" : "Nueva clave"}
              className="w-full text-sm pl-3 pr-16 py-2 rounded-md bg-white"
              style={{ border: "1px solid #D8CDBB" }}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-1 rounded"
              style={{ color: "#8C7F6A" }}
            >
              {showPw ? "Ocultar" : "Ver"}
            </button>
          </div>
          {!hasPassword && (
            <input
              type={showPw ? "text" : "password"}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              value={confirmValue}
              onChange={(e) => { setConfirmValue(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              placeholder="Repetí la clave"
              className="w-full text-sm px-3 py-2 rounded-md bg-white"
              style={{ border: "1px solid #D8CDBB" }}
            />
          )}
          {error && <div className="text-xs" style={{ color: "#A34632" }}>{error}</div>}
          <button
            type="button"
            onClick={trySubmit}
            className="mt-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm"
            style={{ background: "#3A3128", color: "#F7F2E7" }}
          >
            {hasPassword ? "Entrar" : "Crear y entrar"}
          </button>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-full text-xs mt-1"
          style={{ border: "1px solid #D8CDBB", color: "#8C7F6A" }}
        >
          Empezar de cero (borrar la clave guardada)
        </button>
      </div>
    </div>
  );
}

/* ============================ Panel de administración ============================ */
function AdminPanelContent({ products, settings, imageCache, savedPing, onLock, onBackToStore, onAddProduct, onUpdateProduct, onDeleteProduct, onToggleVisible, onReorder, onSaveSettings }) {
  const ink = "#3A3128";
  const [draftId, setDraftId] = useState(() => `p-${Date.now()}`);
  const emptyForm = { name: "", price: "", category: CATEGORIES[0], color: COLORES[0], description: "", images: [] };
  const [form, setForm] = useState(emptyForm);
  const [localSettings, setLocalSettings] = useState(settings);
  const [tab, setTab] = useState("productos");
  const [editingId, setEditingId] = useState(null);
  const [productMsg, setProductMsg] = useState("");

  useEffect(() => setLocalSettings(settings), [settings]);

  function resetForm() {
    setForm(emptyForm);
    setDraftId(`p-${Date.now()}`);
    setEditingId(null);
  }

  function startEdit(product) {
    const imgs = (product.images || [])
      .map((key) => ({ key, dataUrl: imageCache[key] }))
      .filter((i) => i.dataUrl);
    setForm({
      name: product.name,
      price: String(product.price),
      category: product.category,
      color: product.color,
      description: product.description || "",
      images: imgs,
    });
    setEditingId(product.id);
    setDraftId(product.id);
    setTab("productos");
    setProductMsg("");
  }

  function cancelEdit() {
    resetForm();
  }

  function handleSubmitForm() {
    if (!form.name.trim() || !form.price) return;
    const productData = {
      id: editingId || draftId,
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category,
      color: form.color,
      description: form.description.trim(),
      images: form.images.map((img) => img.key),
    };
    if (editingId) {
      onUpdateProduct(productData, form.images);
      setProductMsg("Producto actualizado ✓");
    } else {
      onAddProduct(productData, form.images);
      setProductMsg("Producto agregado ✓");
    }
    resetForm();
    setTimeout(() => setProductMsg(""), 2500);
  }

  return (
    <div className="w-full min-h-[720px] flex flex-col" style={{ background: "#F7F2E7", color: ink, fontFamily: "'Work Sans', sans-serif" }}>
      <style>{`
        @import url('${FONT_IMPORT_URL}');
        .font-display { font-family: 'Fraunces', serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        input:focus, button:focus, select:focus, textarea:focus { outline: 2px solid #2F5D57; outline-offset: 2px; }
      `}</style>

      <header className="w-full px-5 sm:px-8 pt-6 pb-4 flex items-center justify-between gap-3" style={{ borderBottom: "1px solid #E6D9C2" }}>
        <div>
          <div className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: "#8C7F6A" }}>Panel privado</div>
          <h1 className="font-display italic text-2xl sm:text-3xl mt-1">{settings.storeName || "Tu tienda"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBackToStore} className="shrink-0 px-3.5 py-2 rounded-full text-xs" style={{ border: "1px solid #D8CDBB", color: "#6B6155" }}>
            Ver tienda
          </button>
          <button type="button" onClick={onLock} className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs" style={{ border: "1px solid #D8CDBB", color: "#6B6155" }}>
            <LockOpen size={13} /> Cerrar sesión
          </button>
        </div>
      </header>

      <main className="flex-1 px-5 sm:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex gap-1.5">
              {[{ id: "productos", label: editingId ? "Editar producto" : "Nuevo producto" }, { id: "ajustes", label: "Ajustes de la tienda" }].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className="px-3 py-1.5 text-xs rounded-full"
                  style={{
                    background: tab === t.id ? ink : "transparent",
                    color: tab === t.id ? "#F7F2E7" : "#6B6155",
                    border: tab === t.id ? "1px solid transparent" : "1px solid #D8CDBB",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "productos" ? (
              <div className="flex flex-col gap-3 p-4 rounded-xl" style={{ background: "#FBF7EF", border: editingId ? "1.5px solid #74795B" : "1px solid #E6D9C2" }}>
                {editingId && (
                  <div className="text-xs px-2.5 py-1.5 rounded-md" style={{ background: "#74795B22", color: "#4A5340" }}>
                    Editando: {form.name || "producto"}
                  </div>
                )}

                <ImageUploader draftId={draftId} images={form.images} onChange={(images) => setForm({ ...form, images })} />

                <Field label="Nombre del producto">
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ej: Cesta organizadora redonda"
                    className="w-full text-sm px-3 py-2 rounded-md bg-white"
                    style={{ border: "1px solid #D8CDBB" }}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Precio (ARS)">
                    <input
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="8500"
                      className="w-full text-sm px-3 py-2 rounded-md bg-white font-mono"
                      style={{ border: "1px solid #D8CDBB" }}
                    />
                  </Field>
                  <Field label="Categoría">
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full text-sm px-3 py-2 rounded-md bg-white"
                      style={{ border: "1px solid #D8CDBB" }}
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Color / material">
                  <select
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-md bg-white"
                    style={{ border: "1px solid #D8CDBB" }}
                  >
                    {COLORES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>

                <Field label="Descripción">
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Materiales, medidas, detalles…"
                    rows={3}
                    className="w-full text-sm px-3 py-2 rounded-md bg-white resize-none"
                    style={{ border: "1px solid #D8CDBB" }}
                  />
                </Field>

                {productMsg && (
                  <div className="text-xs px-2.5 py-1.5 rounded-md text-center" style={{ background: "#74795B22", color: "#4A5340" }}>
                    {productMsg}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSubmitForm}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm"
                    style={{ background: ink, color: "#F7F2E7" }}
                  >
                    {editingId ? "Guardar cambios" : "Agregar al catálogo"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2.5 rounded-full text-sm"
                      style={{ border: "1px solid #D8CDBB", color: "#6B6155" }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 p-4 rounded-xl" style={{ background: "#FBF7EF", border: "1px solid #E6D9C2" }}>
                <Field label="Nombre de la tienda">
                  <input
                    value={localSettings.storeName}
                    onChange={(e) => setLocalSettings({ ...localSettings, storeName: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-md bg-white"
                    style={{ border: "1px solid #D8CDBB" }}
                  />
                </Field>
                <Field label="Bajada / descripción corta">
                  <input
                    value={localSettings.tagline}
                    onChange={(e) => setLocalSettings({ ...localSettings, tagline: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-md bg-white"
                    style={{ border: "1px solid #D8CDBB" }}
                  />
                </Field>
                <Field label="WhatsApp (con código de país, solo números)">
                  <input
                    value={localSettings.whatsapp}
                    onChange={(e) => setLocalSettings({ ...localSettings, whatsapp: e.target.value })}
                    placeholder="Ej: 5493410000000"
                    className="w-full text-sm px-3 py-2 rounded-md bg-white font-mono"
                    style={{ border: "1px solid #D8CDBB" }}
                  />
                </Field>
                <Field label="Usuario de Instagram (sin @)">
                  <input
                    value={localSettings.instagram}
                    onChange={(e) => setLocalSettings({ ...localSettings, instagram: e.target.value })}
                    placeholder="lasdecaro1"
                    className="w-full text-sm px-3 py-2 rounded-md bg-white font-mono"
                    style={{ border: "1px solid #D8CDBB" }}
                  />
                </Field>
                <button
                  type="button"
                  onClick={() => onSaveSettings(localSettings)}
                  className="mt-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm"
                  style={{ background: ink, color: "#F7F2E7" }}
                >
                  {savedPing ? <Check size={14} /> : <Settings2 size={14} />}
                  {savedPing ? "Guardado" : "Guardar ajustes"}
                </button>
              </div>
            )}

            <div className="text-xs leading-relaxed px-1" style={{ color: "#8C7F6A" }}>
              El catálogo que cargués acá aparece automáticamente en la tienda — ambas viven en el mismo lugar.
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: "#8C7F6A" }}>
              {products.length} producto{products.length !== 1 ? "s" : ""} en el catálogo
            </div>
            {products.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-2 text-center text-sm rounded-xl" style={{ color: "#8C7F6A", border: "1px dashed #D8CDBB" }}>
                <Package size={26} />
                Cargá tu primer producto desde el formulario.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {products.map((p, idx) => {
                  const isVisible = p.visible !== false;
                  return (
                    <div
                      key={p.id}
                      className="flex flex-col gap-2.5 p-3 rounded-xl"
                      style={{
                        background: editingId === p.id ? "#74795B14" : "#FBF7EF",
                        border: editingId === p.id ? "1.5px solid #74795B" : "1px solid #E6D9C2",
                        opacity: isVisible ? 1 : 0.65,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md overflow-hidden shrink-0" style={{ border: "1px solid #E6D9C2" }}>
                          {p.images?.[0] && imageCache[p.images[0]] ? (
                            <img src={imageCache[p.images[0]]} alt={p.name} className="w-full h-full object-cover" />
                          ) : p.images?.[0] ? (
                            <div className="w-full h-full flex items-center justify-center" style={{ color: "#C9BBA1" }}><ImageOff size={16} /></div>
                          ) : (
                            <ProductPlaceholder name={p.name} className="w-full h-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{p.name}</div>
                          <div className="font-display italic text-base leading-tight">{formatARS(p.price)}</div>
                          <div className="text-xs font-mono" style={{ color: "#8C7F6A" }}>
                            {p.category}{p.color ? ` · ${p.color}` : ""}
                            {p.images?.length > 1 && ` · ${p.images.length} fotos`}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5 text-xs font-mono" style={{ color: isVisible ? "#74795B" : "#A99D86" }}>
                            {isVisible ? <>✓ Visible</> : <>⚪ OCULTO</>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs"
                          style={{ border: "1px solid #D8CDBB", color: "#3A3128" }}
                        >
                          <Pencil size={12} /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleVisible(p)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs"
                          style={{ border: "1px solid #D8CDBB", color: isVisible ? "#8C7F6A" : "#74795B" }}
                        >
                          {isVisible ? <><EyeOff size={12} /> Ocultar</> : <><Eye size={12} /> Mostrar</>}
                        </button>
                        <button
                          type="button"
                          onClick={() => onReorder(p.id, "up")}
                          disabled={idx === 0}
                          className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30"
                          style={{ border: "1px solid #D8CDBB", color: "#6B6155" }}
                          aria-label="Subir"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onReorder(p.id, "down")}
                          disabled={idx === products.length - 1}
                          className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30"
                          style={{ border: "1px solid #D8CDBB", color: "#6B6155" }}
                          aria-label="Bajar"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteProduct(p)}
                          className="ml-auto w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ color: "#A34632" }}
                          aria-label={`Eliminar ${p.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ============================ App unificada ============================ */
export default function LasDeCaro() {
  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [imageCache, setImageCache] = useState({});
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [query, setQuery] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState("idle");
  const [view, setView] = useState("tienda"); // 'tienda' | 'admin'
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [savedPing, setSavedPing] = useState(false);
  const productsRef = useRef(null);

  useEffect(() => {
    (async () => {
      let list = DEMO_PRODUCTS;
      try {
        const p = await window.storage.get("catalogo-productos", true);
        if (p && p.value) list = JSON.parse(p.value);
        else await window.storage.set("catalogo-productos", JSON.stringify(DEMO_PRODUCTS), true);
      } catch {
        // usamos demo si falla
      }
      // los productos guardados antes de esta versión no tienen "visible": los tratamos como visibles
      list = list.map((p) => ({ ...p, visible: p.visible !== false }));
      setProducts(list);

      try {
        const s = await window.storage.get("configuracion-tienda", true);
        if (s && s.value) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(s.value) });
      } catch {
        // sin configuración guardada todavía
      }

      const keys = Array.from(new Set(list.flatMap((p) => p.images || [])));
      if (keys.length) {
        const entries = await Promise.all(
          keys.map(async (k) => {
            try {
              const r = await window.storage.get(k, true);
              return [k, r?.value || null];
            } catch {
              return [k, null];
            }
          })
        );
        setImageCache(Object.fromEntries(entries.filter(([, v]) => v)));
      }
      setReady(true);
    })();
  }, []);

  async function persistProducts(next) {
    setProducts(next);
    try { await window.storage.set("catalogo-productos", JSON.stringify(next), true); } catch { /* sigue en memoria */ }
  }
  async function persistSettings(next) {
    setSettings(next);
    try { await window.storage.set("configuracion-tienda", JSON.stringify(next), true); } catch { /* idem */ }
  }
  function pingSaved() {
    setSavedPing(true);
    setTimeout(() => setSavedPing(false), 1600);
  }

  function handleAddProduct(product, uploadedImages) {
    persistProducts([...products, { ...product, visible: true }]);
    if (uploadedImages?.length) {
      setImageCache((prev) => {
        const merged = { ...prev };
        uploadedImages.forEach((img) => { merged[img.key] = img.dataUrl; });
        return merged;
      });
    }
    pingSaved();
  }

  function handleUpdateProduct(product, uploadedImages) {
    persistProducts(products.map((p) => (p.id === product.id ? { ...p, ...product } : p)));
    if (uploadedImages?.length) {
      setImageCache((prev) => {
        const merged = { ...prev };
        uploadedImages.forEach((img) => { merged[img.key] = img.dataUrl; });
        return merged;
      });
    }
    pingSaved();
  }

  function handleToggleVisible(product) {
    persistProducts(products.map((p) => (p.id === product.id ? { ...p, visible: !p.visible } : p)));
  }

  function handleReorder(id, direction) {
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return;
    const swapWith = direction === "up" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= products.length) return;
    const next = [...products];
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    persistProducts(next);
  }

  function handleDeleteProduct(product) {
    persistProducts(products.filter((p) => p.id !== product.id));
    (product.images || []).forEach(async (key) => {
      try { await window.storage.delete(key, true); } catch { /* noop */ }
    });
    setImageCache((prev) => {
      const next = { ...prev };
      (product.images || []).forEach((k) => delete next[k]);
      return next;
    });
  }

  function handleSaveSettings(s) {
    persistSettings(s);
    pingSaved();
  }

  function handleGateSuccess(passwordIfNew) {
    setAdminUnlocked(true);
    if (passwordIfNew) persistSettings({ ...settings, adminPassword: passwordIfNew });
  }
  function handleResetPassword() {
    persistSettings({ ...settings, adminPassword: "" });
  }

  /* ---------------------------- carrito ---------------------------- */
  function addToCart(id) { setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 })); setCartOpen(true); }
  function setQty(id, qty) {
    setCart((c) => { const next = { ...c }; if (qty <= 0) delete next[id]; else next[id] = qty; return next; });
  }
  function removeFromCart(id) { setCart((c) => { const next = { ...c }; delete next[id]; return next; }); }

  const cartItems = useMemo(
    () => Object.entries(cart).map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty })).filter((x) => x.product),
    [cart, products]
  );
  const cartCount = cartItems.reduce((a, x) => a + x.qty, 0);
  const cartTotal = cartItems.reduce((a, x) => a + x.qty * x.product.price, 0);

  function buildWhatsAppMessage() {
    const lines = [
      `Hola ${settings.storeName}! Quiero hacer este pedido:`, "",
      ...cartItems.map((x) => `• ${x.qty} x ${x.product.name} — ${formatARS(x.product.price * x.qty)}`),
      "", `Total: ${formatARS(cartTotal)}`,
    ];
    return lines.join("\n");
  }
  function goToWhatsApp() {
    const digits = (settings.whatsapp || "").replace(/[^\d]/g, "");
    const text = encodeURIComponent(buildWhatsAppMessage());
    window.open(digits ? `https://wa.me/${digits}?text=${text}` : `https://wa.me/?text=${text}`, "_blank");
  }

  function goToCategory(cat) {
    setActiveCategory(cat);
    setMenuOpen(false);
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleNewsletterSubmit() {
    const email = newsletterEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setNewsletterState("error"); return; }
    try {
      const r = await window.storage.get("newsletter-emails", true);
      const list = r?.value ? JSON.parse(r.value) : [];
      if (!list.includes(email)) list.push(email);
      await window.storage.set("newsletter-emails", JSON.stringify(list), true);
    } catch {
      // igual mostramos éxito, no es crítico
    }
    setNewsletterState("sent");
    setNewsletterEmail("");
  }

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (p.visible === false) return false;
      const matchCat = activeCategory === "Todos" || p.category === activeCategory;
      const matchQuery = !query.trim() || p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [products, activeCategory, query]);

  const ink = "#3A3128";
  const cats = ["Todos", ...CATEGORIES];
  const instaUrl = `https://www.instagram.com/${settings.instagram || "lasdecaro1"}/`;

  if (!ready) {
    return (
      <div className="w-full min-h-[720px] flex items-center justify-center" style={{ background: "#F7F2E7" }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: "#8C7F6A" }}>
          <Loader2 size={16} className="animate-spin" /> Preparando catálogo…
        </div>
      </div>
    );
  }

  if (view === "admin") {
    if (!adminUnlocked) {
      return (
        <AdminGate
          hasPassword={!!settings.adminPassword}
          checkPassword={(pw) => pw === settings.adminPassword}
          onSuccess={handleGateSuccess}
          onResetPassword={handleResetPassword}
          onBackToStore={() => setView("tienda")}
        />
      );
    }
    return (
      <AdminPanelContent
        products={products}
        settings={settings}
        imageCache={imageCache}
        savedPing={savedPing}
        onLock={() => { setAdminUnlocked(false); setView("tienda"); }}
        onBackToStore={() => setView("tienda")}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onToggleVisible={handleToggleVisible}
        onReorder={handleReorder}
        onSaveSettings={handleSaveSettings}
      />
    );
  }

  /* ---------------------------- Tienda pública ---------------------------- */
  return (
    <div className="w-full min-h-[720px] relative" style={{ background: "#F7F2E7", color: ink, fontFamily: "'Work Sans', sans-serif", scrollBehavior: "smooth" }}>
      <PaperTexture />
      <style>{`
        @import url('${FONT_IMPORT_URL}');
        .font-display { font-family: 'Fraunces', serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        section { scroll-margin-top: 84px; }
        input:focus, button:focus, a:focus { outline: 2px solid #74795B; outline-offset: 2px; }
        ::selection { background: #C988684d; }
      `}</style>

      <div className="relative" style={{ zIndex: 1 }}>
        {/* -------------------------- Header -------------------------- */}
        <header className="sticky top-0 z-40 w-full px-5 sm:px-8 py-4 flex items-center justify-between gap-3" style={{ background: "#F7F2E7ee", backdropFilter: "blur(6px)", borderBottom: "1px solid #E6D9C2" }}>
          <div>
            <div className="font-display italic text-xl sm:text-2xl tracking-wide">{settings.storeName || "Las de Caro"}</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: "#8C7F6A" }}>{settings.tagline}</div>
          </div>

          <nav className="hidden lg:flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.15em]" style={{ color: "#6B6155" }}>
            <a href="#inicio" className="hover:opacity-70">Inicio</a>
            <a href="#productos" className="hover:opacity-70">Productos</a>
            <a href="#sobre" className="hover:opacity-70">Sobre las de Caro</a>
            <a href="#ideas" className="hover:opacity-70">Ideas para tu hogar</a>
            <a href="#contacto" className="hover:opacity-70">Contacto</a>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "#FBF7EF", border: "1px solid #D8CDBB" }}>
              <Search size={13} style={{ color: "#8C7F6A" }} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar…" className="bg-transparent text-xs w-24 outline-none" />
            </div>
            <a href={instaUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full" style={{ border: "1px solid #D8CDBB", color: "#6B6155" }} aria-label="Instagram">
              <Instagram size={15} />
            </a>
            <button type="button" onClick={() => setCartOpen(true)} className="relative flex items-center gap-1.5 px-3 py-2 rounded-full" style={{ background: ink, color: "#F7F2E7" }}>
              <ShoppingBag size={15} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center text-[9px] font-mono" style={{ background: "#C98868", color: "#fff" }}>
                  {cartCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setView("admin")}
              className="p-2 rounded-full opacity-40 hover:opacity-100 transition-opacity"
              style={{ border: "1px solid #D8CDBB", color: "#6B6155" }}
              aria-label="Panel de administración"
              title="Panel de administración"
            >
              <Lock size={14} />
            </button>
            <button type="button" onClick={() => setMenuOpen((v) => !v)} className="lg:hidden p-2 rounded-full" style={{ border: "1px solid #D8CDBB", color: "#6B6155" }} aria-label="Menú">
              <Menu size={16} />
            </button>
          </div>
        </header>

        {menuOpen && (
          <div className="lg:hidden px-5 py-3 flex flex-col gap-2 font-mono text-xs uppercase tracking-wider" style={{ background: "#FBF7EF", borderBottom: "1px solid #E6D9C2" }}>
            <a href="#inicio" onClick={() => setMenuOpen(false)}>Inicio</a>
            <a href="#productos" onClick={() => setMenuOpen(false)}>Productos</a>
            <a href="#sobre" onClick={() => setMenuOpen(false)}>Sobre las de Caro</a>
            <a href="#ideas" onClick={() => setMenuOpen(false)}>Ideas para tu hogar</a>
            <a href="#contacto" onClick={() => setMenuOpen(false)}>Contacto</a>
          </div>
        )}

        {/* -------------------------- Hero -------------------------- */}
        <section id="inicio" className="px-5 sm:px-8 pt-14 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">
          <div className="relative">
            <Sprig className="hidden sm:block absolute -left-10 -top-8 w-14 h-20 opacity-70" />
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: "#8C7F6A" }}>Las de Caro · Decoración artesanal</div>
            <h1 className="font-display italic leading-[1.05] text-4xl sm:text-5xl" style={{ color: ink }}>Pequeños detalles que hacen hogar.</h1>
            <p className="mt-4 text-base leading-relaxed max-w-md" style={{ color: "#6B6155" }}>Objetos hechos con amor para llenar tus espacios de calidez.</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#productos" className="px-5 py-2.5 rounded-full text-sm" style={{ background: ink, color: "#F7F2E7" }}>VER PRODUCTOS</a>
              <a href="#sobre" className="px-5 py-2.5 rounded-full text-sm" style={{ border: "1px solid #D8CDBB", color: "#6B6155" }}>CONOCÉ LAS DE CARO</a>
            </div>
          </div>
          <div className="grid grid-cols-3 grid-rows-2 gap-2.5 h-72 sm:h-80">
            <PhotoPlaceholder label="Mesa tejida" tone="#EDE0C8" className="col-span-2 row-span-2 rounded-xl" />
            <PhotoPlaceholder label="Flores secas" tone="#DDCBA9" className="rounded-xl" />
            <PhotoPlaceholder label="Cestas" tone="#C7A79E55" className="rounded-xl" />
          </div>
        </section>

        {/* -------------------------- Rincones -------------------------- */}
        <section className="px-5 sm:px-8 py-14 max-w-6xl mx-auto">
          <div className="text-center mb-8"><h2 className="font-display italic text-3xl">Para cada rincón de tu casa</h2></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {RINCONES.map((r, i) => (
              <button key={r.label} type="button" onClick={() => goToCategory(r.cat)} className="group flex flex-col rounded-xl overflow-hidden text-left" style={{ border: "1px solid #E6D9C2" }}>
                <PhotoPlaceholder label={r.label} tone={["#EDE0C8", "#DDCBA9", "#C7A79E4d", "#8FA0A633", "#74795B22", "#C988684d"][i % 6]} className="aspect-square" />
                <div className="px-3 py-2 text-sm font-medium group-hover:opacity-70">{r.label}</div>
              </button>
            ))}
          </div>
        </section>

        {/* -------------------------- Productos -------------------------- */}
        <section id="productos" ref={productsRef} className="px-5 sm:px-8 py-14 max-w-6xl mx-auto">
          <div className="text-center mb-8"><h2 className="font-display italic text-3xl">Nuestros favoritos</h2></div>

          <div className="flex flex-wrap gap-1.5 justify-center mb-8">
            {cats.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCategory(c)}
                className="px-3 py-1.5 text-xs rounded-full transition-colors"
                style={{
                  background: activeCategory === c ? ink : "transparent",
                  color: activeCategory === c ? "#F7F2E7" : "#6B6155",
                  border: activeCategory === c ? "1px solid transparent" : "1px solid #D8CDBB",
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-center text-sm" style={{ color: "#8C7F6A" }}>
              <Package size={28} /> No encontramos productos con ese filtro.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} imageCache={imageCache} onAdd={addToCart} ink={ink} />
              ))}
            </div>
          )}
        </section>

        {/* -------------------------- Sección artesanal -------------------------- */}
        <section id="sobre" className="px-5 sm:px-8 py-16" style={{ background: "#EDE0C8" }}>
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 items-center">
            <Sprig className="hidden sm:block w-20 h-32" />
            <div>
              <h2 className="font-display italic text-3xl sm:text-4xl leading-tight">Hecho con amor, pensado para tu casa.</h2>
              <p className="mt-4 text-sm leading-relaxed max-w-lg" style={{ color: "#6B6155" }}>
                Cada objeto tiene algo de nuestras manos, de los materiales que elegimos y de esos pequeños
                detalles que hacen que una casa se sienta propia.
              </p>
              <a href="#ideas" className="inline-block mt-6 px-5 py-2.5 rounded-full text-sm" style={{ background: ink, color: "#F7F2E7" }}>CONOCÉ NUESTRA HISTORIA</a>
            </div>
          </div>
        </section>

        {/* -------------------------- La casa de Caro -------------------------- */}
        <section id="ideas" className="px-5 sm:px-8 py-16 max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display italic text-3xl">La casa de Caro</h2>
            <p className="text-sm mt-2" style={{ color: "#6B6155" }}>Ideas, inspiración y pequeños rituales para disfrutar tu hogar.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ARTICULOS.map((a, i) => (
              <div key={a.title} className="p-5 rounded-xl flex flex-col gap-2" style={{ background: "#FBF7EF", border: "1px solid #E6D9C2" }}>
                <Sprig className="w-6 h-9 opacity-60" />
                <div className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "#C98868" }}>Nota {slugPad(i + 1)}</div>
                <h3 className="font-display italic text-lg leading-snug">{a.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "#8C7F6A" }}>{a.teaser}</p>
              </div>
            ))}
          </div>
        </section>

        {/* -------------------------- Instagram -------------------------- */}
        <section className="px-5 sm:px-8 py-16 max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display italic text-3xl">Un poquito de Las de Caro todos los días</h2>
            <p className="text-sm mt-2 font-mono" style={{ color: "#8C7F6A" }}>@{settings.instagram || "lasdecaro1"}</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {["Telar", "Mesa puesta", "Flores secas", "Entregas", "Detalle cuero", "Taller"].map((label, i) => (
              <PhotoPlaceholder key={label} label={label} tone={["#EDE0C8", "#DDCBA9", "#C7A79E4d", "#8FA0A633", "#74795B22", "#C988684d"][i % 6]} className="aspect-square rounded-lg" />
            ))}
          </div>
          <div className="text-center mt-7">
            <a href={instaUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm" style={{ border: "1px solid #D8CDBB", color: "#6B6155" }}>
              <Instagram size={14} /> SEGUIRNOS EN INSTAGRAM
            </a>
          </div>
        </section>

        {/* -------------------------- Newsletter -------------------------- */}
        <section className="px-5 sm:px-8 py-16" style={{ background: "#EDE0C8" }}>
          <div className="max-w-md mx-auto text-center">
            <h2 className="font-display italic text-2xl">Para tu casa, de vez en cuando.</h2>
            <p className="text-sm mt-3 leading-relaxed" style={{ color: "#6B6155" }}>
              Recibí novedades, ideas e inspiración para hacer de tu casa un lugar todavía más tuyo.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => { setNewsletterEmail(e.target.value); setNewsletterState("idle"); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleNewsletterSubmit(); } }}
                placeholder="Tu email"
                className="flex-1 px-4 py-2.5 rounded-full text-sm bg-white"
                style={{ border: "1px solid #D8CDBB" }}
              />
              <button type="button" onClick={handleNewsletterSubmit} className="px-5 py-2.5 rounded-full text-sm shrink-0" style={{ background: ink, color: "#F7F2E7" }}>
                QUIERO RECIBIRLAS
              </button>
            </div>
            {newsletterState === "sent" && <p className="text-xs mt-2" style={{ color: "#74795B" }}>¡Gracias! Ya estás suscripta/o.</p>}
            {newsletterState === "error" && <p className="text-xs mt-2" style={{ color: "#A34632" }}>Revisá el email, algo no está bien.</p>}
          </div>
        </section>

        {/* -------------------------- Footer -------------------------- */}
        <footer id="contacto" className="px-5 sm:px-8 py-12" style={{ borderTop: "1px solid #E6D9C2" }}>
          <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="font-display italic text-xl">{settings.storeName || "Las de Caro"}</div>
              <p className="text-xs mt-1" style={{ color: "#8C7F6A" }}>{settings.tagline}</p>
            </div>
            <div className="flex flex-col gap-2 text-xs" style={{ color: "#6B6155" }}>
              <span className="font-mono uppercase tracking-wider text-[10px]" style={{ color: "#8C7F6A" }}>Tienda</span>
              <a href="#productos">Productos</a>
              <a href="#sobre">Sobre nosotros</a>
            </div>
            <div className="flex flex-col gap-2 text-xs" style={{ color: "#6B6155" }}>
              <span className="font-mono uppercase tracking-wider text-[10px]" style={{ color: "#8C7F6A" }}>Ayuda</span>
              <span>Preguntas frecuentes</span>
              <span>Envíos</span>
            </div>
            <div className="flex flex-col gap-2 text-xs" style={{ color: "#6B6155" }}>
              <span className="font-mono uppercase tracking-wider text-[10px]" style={{ color: "#8C7F6A" }}>Contacto</span>
              <button type="button" onClick={goToWhatsApp} className="text-left">WhatsApp</button>
              <a href={instaUrl} target="_blank" rel="noopener noreferrer">Instagram</a>
            </div>
          </div>
          <div className="max-w-6xl mx-auto mt-8 pt-6 text-center font-mono text-[10px] uppercase tracking-wider" style={{ borderTop: "1px solid #E6D9C2", color: "#A99D86" }}>
            Hecho con amor desde Argentina.
          </div>
        </footer>
      </div>

      {/* -------------------------- Carrito -------------------------- */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "#3A312866" }}>
          <div className="w-full sm:w-[400px] h-full flex flex-col" style={{ background: "#FBF7EF", borderLeft: "1px solid #E6D9C2" }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #E6D9C2" }}>
              <div className="font-display italic text-xl">Tu pedido</div>
              <button type="button" onClick={() => setCartOpen(false)} className="p-1.5 rounded-full" style={{ color: "#6B6155" }}><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center gap-3 text-sm py-16 text-center" style={{ color: "#8C7F6A" }}>
                  <Package size={28} /> Todavía no agregaste productos.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {cartItems.map(({ product, qty }) => {
                    const imgs = (product.images || []).map((k) => imageCache[k]).filter(Boolean);
                    return (
                      <div key={product.id} className="flex gap-3 items-center py-2 px-3 rounded-lg" style={{ background: "#FFFFFF", border: "1px solid #E6D9C2" }}>
                        <div className="w-12 h-12 rounded-md overflow-hidden shrink-0" style={{ border: "1px solid #E6D9C2" }}>
                          {imgs[0] ? <img src={imgs[0]} alt={product.name} className="w-full h-full object-cover" /> : <ProductPlaceholder name={product.name} className="w-full h-full" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm leading-tight truncate">{product.name}</div>
                          <div className="font-mono text-xs mt-0.5" style={{ color: "#8C7F6A" }}>{formatARS(product.price)}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button type="button" onClick={() => setQty(product.id, qty - 1)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ border: "1px solid #D8CDBB" }}><Minus size={11} /></button>
                          <span className="font-mono text-xs w-4 text-center">{qty}</span>
                          <button type="button" onClick={() => setQty(product.id, qty + 1)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ border: "1px solid #D8CDBB" }}><Plus size={11} /></button>
                        </div>
                        <button type="button" onClick={() => removeFromCart(product.id)} className="p-1 shrink-0" style={{ color: "#A34632" }}><Trash2 size={14} /></button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="px-5 py-4" style={{ borderTop: "1px solid #E6D9C2" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm" style={{ color: "#6B6155" }}>Total</span>
                <span className="font-display italic text-2xl">{formatARS(cartTotal)}</span>
              </div>
              <button
                type="button"
                disabled={cartItems.length === 0}
                onClick={goToWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm transition-opacity disabled:opacity-40"
                style={{ background: "#74795B", color: "#fff" }}
              >
                Finalizar pedido por WhatsApp <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
