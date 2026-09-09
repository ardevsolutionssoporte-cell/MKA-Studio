'use client';

import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { studioAudio } from '@/lib/audio';
import { 
  Plus, 
  Upload, 
  Check, 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Tag, 
  Trash2, 
  HelpCircle, 
  Layers, 
  Camera, 
  Info,
  Sliders,
  DollarSign
} from 'lucide-react';
import { formatUSD } from '@/lib/quote-utils';

interface TagItem {
  label: string;
  value: string;
  align: 'left' | 'right';
  positionClass: string;
}

export const ProductManager: React.FC = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Cerámica & Menaje');
  const [tagline, setTagline] = useState('');
  const [basePrice, setBasePrice] = useState('15');
  const [bulkPrice, setBulkPrice] = useState('12');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('Personalizado');
  const [dimensions, setDimensions] = useState('95 × 82 mm');
  const [weight, setWeight] = useState('350 g');
  const [leadTime, setLeadTime] = useState('Envío inmediato (24-48h)');
  
  // Gallery Images State
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800&auto=format&fit=crop&q=80',
  ]);
  const [newGalleryInput, setNewGalleryInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // WebM Video State
  const [videoUrl, setVideoUrl] = useState('/assets/Colorful_design_wrapping_plastic_1080p_202608282351.webm');

  // Blueprint Tech Tags State
  const [tags, setTags] = useState<TagItem[]>([
    { label: 'COMPOSICIÓN', value: 'Cerámica Sinterizada 1300°C', align: 'right', positionClass: 'top-[22%] -left-2 sm:left-2' },
    { label: 'CAPACIDAD', value: '350 ml / 12 oz', align: 'left', positionClass: 'top-[48%] -right-2 sm:right-2' },
  ]);
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newTagValue, setNewTagValue] = useState('');
  const [newTagAlign, setNewTagAlign] = useState<'left' | 'right'>('right');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [showTips, setShowTips] = useState(true);

  const [productsList, setProductsList] = useState<any[]>([
    {
      id: 'demo-1',
      name: 'Tazas tradicionales (Edición MKA)',
      category: 'Cerámica & Menaje',
      price: '$6 USD',
      priceRaw: 6,
      bulkPrice: 5,
      imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&auto=format&fit=crop&q=80',
      imagesCount: 4,
      hasVideo: true,
    },
    {
      id: 'demo-2',
      name: 'Termos tipo botella de 600ml',
      category: 'Térmicos & Acero',
      price: '$9 USD',
      priceRaw: 9,
      bulkPrice: 8,
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
      imagesCount: 4,
      hasVideo: true,
    },
  ]);

  // Synchronize with Firestore products collection in real time
  useEffect(() => {
    try {
      const prodCol = collection(db, 'products');
      const unsubscribe = onSnapshot(
        prodCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteDocs = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setProductsList(remoteDocs);
          }
        },
        (error) => {
          console.warn('Products onSnapshot error:', error);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore products listener error:', err);
    }
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setMainImageUrl(url);
      setGalleryUrls((prev) => [url, ...prev.filter((u) => u !== url)]);
    }
  };

  const handleAddGalleryUrl = () => {
    if (!newGalleryInput.trim()) return;
    studioAudio.playClick();
    setGalleryUrls((prev) => [...prev, newGalleryInput.trim()]);
    if (!mainImageUrl) setMainImageUrl(newGalleryInput.trim());
    setNewGalleryInput('');
  };

  const handleRemoveGalleryUrl = (idx: number) => {
    studioAudio.playClick();
    setGalleryUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddTag = () => {
    if (!newTagLabel.trim() || !newTagValue.trim()) return;
    studioAudio.playClick();
    const posClass = newTagAlign === 'right' 
      ? `top-[${20 + tags.length * 25}%] -left-2 sm:left-2`
      : `top-[${30 + tags.length * 25}%] -right-2 sm:right-2`;

    setTags((prev) => [
      ...prev,
      {
        label: newTagLabel.trim().toUpperCase(),
        value: newTagValue.trim(),
        align: newTagAlign,
        positionClass: posClass,
      },
    ]);
    setNewTagLabel('');
    setNewTagValue('');
  };

  const handleRemoveTag = (idx: number) => {
    studioAudio.playClick();
    setTags((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    studioAudio.playClick();
    setIsSubmitting(true);

    try {
      let finalImageUrl = mainImageUrl || galleryUrls[0] || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&auto=format&fit=crop&q=80';

      if (imageFile) {
        try {
          const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
          const snapshot = await uploadBytes(storageRef, imageFile);
          finalImageUrl = await getDownloadURL(snapshot.ref);
        } catch (uploadErr) {
          console.warn('Storage upload fallback to local preview:', uploadErr);
        }
      }

      const numericBase = parseFloat(basePrice) || 10;
      const numericBulk = parseFloat(bulkPrice) || numericBase - 1;

      const finalGallery = galleryUrls.length > 0 ? galleryUrls : [finalImageUrl];

      const newProductPayload = {
        id: `mka-custom-${Date.now()}`,
        code: `MKA // ${Math.floor(100 + Math.random() * 900)}-PRD`,
        name: title,
        category,
        tagline: tagline || 'Artículo personalizado con acabado de alta gama MKA Studio.',
        price: `$${numericBase.toFixed(2)} USD`,
        priceRaw: numericBase,
        bulkPrice: numericBulk,
        description: description || tagline || 'Diseñado y fabricado bajo estrictos estándares de calidad.',
        longDescription: description || 'Pieza exclusiva personalizable con grabado láser y acabados premium.',
        specs: [
          { label: 'Categoría', value: category },
          { label: 'Dimensiones', value: dimensions },
          { label: 'Peso', value: weight },
          { label: 'Precio al Mayor (>=3)', value: `$${numericBulk.toFixed(2)} USD` },
        ],
        features: ['Resistente a rayos UV', 'Personalización láser de alta precisión', 'Garantía MKA Studio'],
        imageUrl: finalImageUrl,
        images: finalGallery,
        videoUrl: videoUrl.trim() || undefined,
        tags: tags.map((t, i) => ({
          id: `custom-tag-${Date.now()}-${i}`,
          label: t.label,
          value: t.value,
          align: t.align,
          positionClass: t.positionClass,
        })),
        fallbackGradient: 'from-cyan-500/30 via-slate-900 to-black',
        colorAccent: '#00f0ff',
        glowRgba: 'rgba(0, 240, 255, 0.45)',
        badge: badge || 'Personalizado',
        dimensions,
        weight,
        leadTime,
        inStock: true,
        createdAt: new Date().toISOString(),
      };

      // Add to Firestore collection 'products'
      await addDoc(collection(db, 'products'), newProductPayload);

      setProductsList((prev) => [newProductPayload, ...prev]);
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 5000);

      // Reset form
      setTitle('');
      setTagline('');
      setBasePrice('15');
      setBulkPrice('12');
      setDescription('');
      setImageFile(null);
      setMainImageUrl('');
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SUTTLE EDITORIAL ADVICE / TECHNICAL SPECIFICATIONS PANEL */}
      <div className="border border-[#00F0FF]/25 bg-[#00F0FF]/[0.03] rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between pb-3 border-b border-[#00F0FF]/15">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-[#00F0FF]" />
            <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-white font-bold">
              Guía de Estándares &amp; Especificaciones Técnicas Recomendadas
            </h4>
          </div>
          <button
            type="button"
            onClick={() => setShowTips(!showTips)}
            className="text-[10px] font-mono text-[#00F0FF] hover:underline flex items-center space-x-1"
          >
            <span>{showTips ? 'Ocultar Consejos' : 'Ver Consejos'}</span>
          </button>
        </div>

        {showTips && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-[11px] font-mono text-white/75 leading-relaxed">
            <div className="p-3.5 border border-white/10 bg-black/40 rounded-xl space-y-1.5">
              <div className="flex items-center space-x-2 text-[#00F0FF] font-bold">
                <Camera className="w-3.5 h-3.5" />
                <span>1. Galería Diapositivas (1:1)</span>
              </div>
              <p className="text-white/60 text-[10px]">
                Sube imágenes en proporción cuadrada <strong className="text-white">1:1 (ej. 1080x1080px o 1200x1200px)</strong> en formato <strong className="text-white">PNG sin fondo</strong> o WebP. Se recomienda subir de 2 a 4 ángulos (Frontal, Lateral, Detalle) para la transición automática de diapositivas.
              </p>
            </div>

            <div className="p-3.5 border border-white/10 bg-black/40 rounded-xl space-y-1.5">
              <div className="flex items-center space-x-2 text-purple-400 font-bold">
                <Video className="w-3.5 h-3.5" />
                <span>2. Video Animado 3D (WebM)</span>
              </div>
              <p className="text-white/60 text-[10px]">
                Video en códec <strong className="text-white">VP9/WebM con canal alfa</strong> o fondo negro (#000000) a 30/60 fps. El motor WebGL eliminará fondos automáticamente para crear el efecto de producto holográfico flotante continuo.
              </p>
            </div>

            <div className="p-3.5 border border-white/10 bg-black/40 rounded-xl space-y-1.5">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <Tag className="w-3.5 h-3.5" />
                <span>3. Tags Blueprint &amp; Escala</span>
              </div>
              <p className="text-white/60 text-[10px]">
                Agrega de 2 a 4 tags concisos (ej. &apos;CAPACIDAD: 350ml&apos;) y el precio al mayor (&ge; 3 unidades). El sistema proyectará las líneas guía y calculará los presupuestos automáticos en WhatsApp.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* NEW PRODUCT FORM */}
        <form
          onSubmit={handleSubmitNewProduct}
          className="lg:col-span-2 p-6 md:p-8 border border-white/15 bg-white/[0.02] rounded-2xl space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h4 className="font-serif italic text-xl text-white">Nuevo Artículo del Catálogo Inmersivo</h4>
              <p className="text-xs text-white/50 font-mono mt-0.5">Configura galería de diapositivas, animación WebM y tags holográficos.</p>
            </div>
            {successMessage && (
              <span className="flex items-center space-x-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/30">
                <Check className="w-4 h-4" />
                <span>¡Publicado en Catálogo!</span>
              </span>
            )}
          </div>

          {/* BASIC INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-mono text-white/50 uppercase tracking-[0.25em] mb-1.5">
                Título del Producto *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Taza Mágica Térmica MKA"
                className="w-full bg-white/[0.03] border border-white/15 px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#00F0FF]"
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono text-white/50 uppercase tracking-[0.25em] mb-1.5">
                Categoría *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#12121A] border border-white/15 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F0FF]"
              >
                <option value="Cerámica & Menaje">Cerámica &amp; Menaje</option>
                <option value="Térmicos & Acero">Térmicos &amp; Acero</option>
                <option value="Spatial Audio">Spatial Audio</option>
                <option value="Horología Digital">Horología Digital</option>
                <option value="Óptica & Visión">Óptica &amp; Visión</option>
                <option value="Personalizados">Personalizados</option>
              </select>
            </div>
          </div>

          {/* PRICES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-mono text-white/50 uppercase tracking-[0.25em] mb-1.5">
                Precio Base Unitario (1-2 unds) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/15 px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00F0FF]"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-mono text-white/40">USD</span>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-mono text-white/50 uppercase tracking-[0.25em] mb-1.5">
                Precio al Mayor (A partir de 3 unds) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/15 px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00F0FF]"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-mono text-emerald-400">USD (Descuento)</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-mono text-white/50 uppercase tracking-[0.25em] mb-1.5">
              Subtítulo / Tagline Descriptivo
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Ej. Reacciona al calor revelando diseño personalizado a full color."
              className="w-full bg-white/[0.03] border border-white/15 px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#00F0FF]"
            />
          </div>

          {/* GALLERY IMAGES SECTION */}
          <div className="p-4 border border-white/10 bg-white/[0.01] rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-[#00F0FF]" />
                <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  Galería de Diapositivas ({galleryUrls.length} Fotos)
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/40">Recomendado: 1:1 Cuadrado</span>
            </div>

            {/* Upload File Box */}
            <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:border-[#00F0FF] transition-colors relative bg-black/40">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="space-y-1">
                <Upload className="w-5 h-5 mx-auto text-white/40" />
                <div className="text-xs text-white/70 font-mono">
                  Sube foto principal PNG sin fondo o <span className="text-[#00F0FF] underline">explorar</span>
                </div>
              </div>
            </div>

            {/* Add Image URL Box */}
            <div className="flex space-x-2">
              <input
                type="url"
                value={newGalleryInput}
                onChange={(e) => setNewGalleryInput(e.target.value)}
                placeholder="https://... URL de foto adicional para diapositiva"
                className="flex-1 bg-white/[0.03] border border-white/15 px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#00F0FF]"
              />
              <button
                type="button"
                onClick={handleAddGalleryUrl}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider transition-all"
              >
                Añadir
              </button>
            </div>

            {/* Gallery Thumbnails */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {galleryUrls.map((url, idx) => (
                <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-white/20 bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryUrl(idx)}
                    className="absolute inset-0 bg-red-900/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-0.5 right-1 text-[8px] font-mono bg-black/70 px-1 text-white">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* WEBM VIDEO 3D SECTION */}
          <div className="p-4 border border-white/10 bg-white/[0.01] rounded-xl space-y-3">
            <div className="flex items-center space-x-2">
              <Video className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                Capa de Video Animado 3D (Formato WebM Transparente)
              </span>
            </div>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Ej. /assets/Colorful_design_wrapping_plastic_1080p_202608282351.webm"
              className="w-full bg-white/[0.03] border border-white/15 px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-400 font-mono"
            />
            <div className="flex flex-wrap gap-2 text-[10px] font-mono text-white/50">
              <span>Presets Rápidos:</span>
              <button
                type="button"
                onClick={() => setVideoUrl('/assets/Colorful_design_wrapping_plastic_1080p_202608282351.webm')}
                className="text-purple-300 hover:underline"
              >
                [3D Wrapping Plastic]
              </button>
              <button
                type="button"
                onClick={() => setVideoUrl('/assets/thermo-animation.webm')}
                className="text-purple-300 hover:underline"
              >
                [Thermo 3D Loop]
              </button>
            </div>
          </div>

          {/* BLUEPRINT TECH TAGS SECTION */}
          <div className="p-4 border border-white/10 bg-white/[0.01] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  Tags Holográficos Blueprint ({tags.length})
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/40">Animación con líneas flotantes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={newTagLabel}
                onChange={(e) => setNewTagLabel(e.target.value)}
                placeholder="Etiqueta (ej. MATERIAL)"
                className="bg-white/[0.03] border border-white/15 px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400"
              />
              <input
                type="text"
                value={newTagValue}
                onChange={(e) => setNewTagValue(e.target.value)}
                placeholder="Valor (ej. Titanio G5)"
                className="bg-white/[0.03] border border-white/15 px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400"
              />
              <div className="flex space-x-2">
                <select
                  value={newTagAlign}
                  onChange={(e) => setNewTagAlign(e.target.value as any)}
                  className="bg-[#12121A] border border-white/15 px-2.5 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="right">Izquierda</option>
                  <option value="left">Derecha</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 font-mono text-xs uppercase tracking-wider transition-all flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tag</span>
                </button>
              </div>
            </div>

            {/* Tags List */}
            <div className="flex flex-wrap gap-2 pt-1">
              {tags.map((t, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 border border-white/15 bg-white/[0.03] rounded-lg flex items-center space-x-2 text-xs font-mono"
                >
                  <span className="text-[#00F0FF] text-[9px] uppercase">{t.label}:</span>
                  <span className="text-white text-[10px]">{t.value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="text-white/40 hover:text-red-400 ml-1"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-[#00F0FF] text-black font-mono font-bold text-[11px] tracking-[0.25em] uppercase hover:bg-white transition-all flex items-center justify-center space-x-2 shadow-[0_0_35px_rgba(0,240,255,0.35)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>PUBLICANDO EN FIRESTORE &amp; CANVAS 3D...</span>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>REGISTRAR PRODUCTO EN EL CATÁLOGO</span>
              </>
            )}
          </button>
        </form>

        {/* PRODUCTS PREVIEW LIST */}
        <div className="space-y-4">
          <h4 className="font-serif italic text-lg text-white">Catálogo Actual ({productsList.length})</h4>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {productsList.map((prod) => (
              <div
                key={prod.id}
                className="p-4 border border-white/15 bg-white/[0.02] rounded-xl flex items-center space-x-4 hover:border-white/30 transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="w-14 h-14 object-cover rounded-lg border border-white/20 bg-black/50 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="font-serif italic text-sm text-white truncate">{prod.name}</h5>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[10px] font-mono text-[#00F0FF] font-bold">
                      {formatUSD(prod.priceRaw)}
                    </span>
                    {prod.bulkPrice && (
                      <span className="text-[9px] font-mono text-emerald-400">
                        (&ge;3: {formatUSD(prod.bulkPrice)})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1 text-[9px] font-mono text-white/40">
                    <span>{prod.category}</span>
                    <span>&bull;</span>
                    <span>{prod.imagesCount || 1} fotos</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
