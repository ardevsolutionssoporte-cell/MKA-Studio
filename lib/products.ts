export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductTag {
  id?: string;
  label: string;
  value: string;
  positionClass?: string;
  align?: 'left' | 'right';
  xPercent?: number;
  yPercent?: number;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  tagline: string;
  price: string;
  priceRaw: number;
  bulkPrice?: number;
  description: string;
  longDescription: string;
  specs: ProductSpec[];
  features: string[];
  imageUrl: string;
  images?: string[];
  videoUrl?: string;
  tags?: ProductTag[];
  fallbackGradient: string;
  colorAccent: string;
  glowRgba: string;
  badge: string;
  dimensions: string;
  weight: string;
  leadTime: string;
  inStock: boolean;
  createdAt?: string;
}

export const PRODUCTS_DATA: Product[] = [
  {
    id: "tazas-tradicionales",
    code: "MKA // 000-CER",
    name: "Tazas tradicionales",
    category: "Cerámica & Menaje",
    tagline: "Cerámica esmaltada de alta durabilidad con acabado mate o brillante MKA.",
    price: "$6 USD",
    priceRaw: 6,
    bulkPrice: 5,
    description: "Taza de cerámica clásica con grabado láser de alta precisión. Precio especial de $5 c/u a partir de 3 unidades.",
    longDescription: "Diseñadas para uso diario y coleccionistas exigentes. Resistentes a lavavajillas y microondas con recubrimiento térmico superior.",
    specs: [
      { label: "Capacidad", value: "350 ml / 12 oz" },
      { label: "Material", value: "Cerámica Sinterizada Vitrificada" },
      { label: "Acabado", value: "Mate Absoluto / Blanco Óptico" },
      { label: "Descuento Volumen", value: "$5 c/u desde 3 unidades" }
    ],
    features: ["Apta para lavavajillas", "Grabado láser indeleble", "Aislamiento térmico optimizado"],
    imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80"
    ],
    videoUrl: "/assets/Colorful_design_wrapping_plastic_1080p_202608282351.webm",
    tags: [
      { id: "tag-cer-1", label: "COMPOSICIÓN", value: "Cerámica 1300°C", positionClass: "top-[18%] left-1 sm:left-2 md:left-3", align: "left" },
      { id: "tag-cer-2", label: "CAPACIDAD", value: "350 ml / 12 oz", positionClass: "top-[48%] right-1 sm:right-2 md:right-3", align: "right" },
      { id: "tag-cer-3", label: "ACABADO", value: "Esmalte Antibacteriano", positionClass: "bottom-[18%] left-1 sm:left-2 md:left-3", align: "left" },
    ],
    fallbackGradient: "from-cyan-500/30 via-slate-900 to-black",
    colorAccent: "#00f0ff",
    glowRgba: "rgba(0, 240, 255, 0.45)",
    badge: "Bestseller MKA",
    dimensions: "95 × 82 mm",
    weight: "320 g",
    leadTime: "Envío inmediato (24-48h)",
    inStock: true,
  },
  {
    id: "termos-botella-600ml",
    code: "MKA // 000-TER",
    name: "Termos tipo botella de 600ml",
    category: "Térmicos & Acero",
    tagline: "Acero inoxidable de doble pared con aislamiento al vacío de grado médico.",
    price: "$9 USD",
    priceRaw: 9,
    bulkPrice: 8,
    description: "Mantiene bebidas frías 24h y calientes 12h. Precio al mayor $8 c/u a partir de 3 unidades.",
    longDescription: "Construcción en acero inoxidable 18/8 sin BPA con recubrimiento en polvo texturizado antideslizante.",
    specs: [
      { label: "Capacidad", value: "600 ml" },
      { label: "Aislamiento", value: "Doble Pared al Vacío" },
      { label: "Material", value: "Acero Inoxidable 18/8" },
      { label: "Descuento Volumen", value: "$8 c/u desde 3 unidades" }
    ],
    features: ["Conservación térmica 24h", "Tapa hermética anti-derrames", "Acabado texturizado láser"],
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=800&auto=format&fit=crop&q=80"
    ],
    videoUrl: "/assets/thermo-animation.webm",
    tags: [
      { id: "tag-ter-1", label: "AISLAMIENTO", value: "Doble Vacío 24h", positionClass: "top-[18%] left-1 sm:left-2 md:left-3", align: "left" },
      { id: "tag-ter-2", label: "ALEACIÓN", value: "Acero 18/8 Pro", positionClass: "top-[48%] right-1 sm:right-2 md:right-3", align: "right" },
      { id: "tag-ter-3", label: "RECUBRIMIENTO", value: "Polvo Grip Mate", positionClass: "bottom-[18%] left-1 sm:left-2 md:left-3", align: "left" },
    ],
    fallbackGradient: "from-purple-500/30 via-slate-900 to-black",
    colorAccent: "#a855f7",
    glowRgba: "rgba(168, 85, 247, 0.45)",
    badge: "Térmico Pro",
    dimensions: "260 × 70 mm",
    weight: "380 g",
    leadTime: "Envío inmediato (24-48h)",
    inStock: true,
  },
  {
    id: "mka-alpha-headphones",
    code: "MKA // 001-AUR",
    name: "Aether Pro Spatial Headset",
    category: "Spatial Audio",
    tagline: "Transductores magnéticos planares de 50mm con diafragma de berilio.",
    price: "$1,250 USD",
    priceRaw: 1250,
    bulkPrice: 1100,
    description: "Auriculares circumaurales de referencia acústica forjados en titanio aeroespacial y fibra de carbono prensada.",
    longDescription: "Diseñados para masterización y audiófilos exigentes. La cámara acústica semi-abierta elimina resonancias indeseadas mientras que su DSP integrado calcula la respuesta binaural en tiempo real para una inmersión tridimensional quirúrgica.",
    specs: [
      { label: "Respuesta Frecuencia", value: "5 Hz - 52 kHz" },
      { label: "Impedancia", value: "32 Ω @ 1kHz" },
      { label: "Material Chasis", value: "Titanio Grado 5 & Alcantara" },
      { label: "Conectividad", value: "Dual 4.4mm Balanced / Ultra-Low Latency RF" },
      { label: "Autonomía", value: "48 Horas con Carga Rápida GaN" },
    ],
    features: [
      "Cancelación de Fase Activa Adaptativa",
      "Drivers Planares con Nanofilamento de Plata",
      "Almohadillas Magnéticas Memory Foam con Gel Térmico",
      "Calibración de Sala Automática MKA RoomTune™"
    ],
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80"
    ],
    videoUrl: "/assets/Colorful_design_wrapping_plastic_1080p_202608282351.webm",
    tags: [
      { id: "tag-aur-1", label: "TRANSDUCTOR", value: "Planar 50mm", positionClass: "top-[22%] left-1 sm:left-2 md:left-3", align: "left" },
      { id: "tag-aur-2", label: "DSP BINAURAL", value: "Audio Espacial", positionClass: "top-[52%] right-1 sm:right-2 md:right-3", align: "right" },
    ],
    fallbackGradient: "from-cyan-500/30 via-slate-900 to-black",
    colorAccent: "#00f0ff",
    glowRgba: "rgba(0, 240, 255, 0.45)",
    badge: "Edición Limitada",
    dimensions: "190 × 210 × 85 mm",
    weight: "340 g",
    leadTime: "Envío inmediato (24-48h)",
    inStock: true,
  },
  {
    id: "mka-chrono-matrix",
    code: "MKA // 002-HOR",
    name: "Chronos Obsidian Kinetic",
    category: "Horología Digital",
    tagline: "Calibre híbrido mecánico-óptico con cristal de zafiro antireflejos dual.",
    price: "$2,890 USD",
    priceRaw: 2890,
    bulkPrice: 2600,
    description: "Una escultura de muñeca construida con caja de carbono forjado y rueda de balance expuesta mediante láser de femtosegundo.",
    longDescription: "Combina la precisión atómica de sincronización satelital con un escape mecánico de tourbillon coaxial. Su esfera monocromática responde al ángulo de incidencia de la luz ambiental gracias a su micro-grabado óptico.",
    specs: [
      { label: "Caja", value: "42mm Carbono Forjado + DLC Negro" },
      { label: "Cristal", value: "Zafiro Abombado 9 Mohs con Anti-Reflejos" },
      { label: "Hermeticidad", value: "10 ATM / 100 Metros" },
      { label: "Mecanismo", value: "Calibre MKA-09 Tourbillon 28,800 vph" },
      { label: "Reserva de Marcha", value: "72 Horas" },
    ],
    features: [
      "Tourbillon volante de un minuto visible",
      "Correa de caucho vulcanizado FKM con cierre desplegable",
      "Manecillas de titanio facetadas con Super-LumiNova BGW9",
      "Grabado láser numérico de serie única"
    ],
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&auto=format&fit=crop&q=80"
    ],
    videoUrl: "/assets/thermo_vp9_transparent.webm",
    tags: [
      { id: "tag-hor-1", label: "ESCAPE", value: "Tourbillon Coaxial", positionClass: "top-[25%] left-1 sm:left-2 md:left-3", align: "left" },
      { id: "tag-hor-2", label: "MATERIAL", value: "Carbono Forjado", positionClass: "bottom-[24%] right-1 sm:right-2 md:right-3", align: "right" },
    ],
    fallbackGradient: "from-amber-500/30 via-stone-900 to-black",
    colorAccent: "#e5a93b",
    glowRgba: "rgba(229, 169, 59, 0.45)",
    badge: "Pieza de Colección",
    dimensions: "42 × 49 × 12.5 mm",
    weight: "88 g",
    leadTime: "Producción bajo encargo (10 días)",
    inStock: true,
  },
  {
    id: "mka-lens-monolith",
    code: "MKA // 003-OPT",
    name: "Vortex Optical Aperture 50",
    category: "Óptica & Visión",
    tagline: "Objetivo anamórfico cinematográfico f/0.95 con recubrimiento de nanocristal.",
    price: "$3,450 USD",
    priceRaw: 3450,
    bulkPrice: 3200,
    description: "Elemento de captura visual para directores de fotografía que exigen bokeh ovalado orgánico y destellos tonales fríos.",
    longDescription: "Mecanizado a partir de un solo bloque de latón aeroespacial con anodizado negro mate. Sus 14 láminas de apertura circular producen transiciones de desenfoque sedosas y un micro-contraste insuperable en sensores full-frame.",
    specs: [
      { label: "Distancia Focal", value: "50mm Anamórfico 1.8x" },
      { label: "Apertura Máxima", value: "T1.0 (f/0.95)" },
      { label: "Montura", value: "Intercambiable PL / E / L Mount" },
      { label: "Construcción", value: "16 Elementos en 12 Grupos (ED Glass)" },
      { label: "Rotación de Foco", value: "300° con topes duros" },
    ],
    features: [
      "Engranajes de enfoque estándar 0.8 MOD para Follow-Focus",
      "Control de destello azul cobalto cinemático característico",
      "Tratamiento hidrofóbico y oleofóbico en elemento frontal",
      "Estuche sellado de aluminio fresado CNC incluido"
    ],
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80"
    ],
    tags: [
      { id: "tag-opt-1", label: "ÓPTICA", value: "Anamórfico 1.8x", positionClass: "top-[26%] left-1 sm:left-2 md:left-3", align: "left" },
      { id: "tag-opt-2", label: "RECUBRIMIENTO", value: "Nano-Cristal AR", positionClass: "bottom-[26%] right-1 sm:right-2 md:right-3", align: "right" },
    ],
    fallbackGradient: "from-violet-500/30 via-slate-900 to-black",
    colorAccent: "#a855f7",
    glowRgba: "rgba(168, 85, 247, 0.45)",
    badge: "Grado Cine",
    dimensions: "95 × 140 mm",
    weight: "1,120 g",
    leadTime: "Envío inmediato (24-48h)",
    inStock: true,
  },
  {
    id: "mka-deck-controller",
    code: "MKA // 004-CTL",
    name: "Monolith Synth & Macro Engine",
    category: "Studio Controller",
    tagline: "Superficie de control háptica y secuenciador con potenciómetros rotativos infinitos.",
    price: "$1,680 USD",
    priceRaw: 1680,
    bulkPrice: 1500,
    description: "Consola de modulación para sintetistas y productores con feedback táctil electromagnético y pantallas OLED secundarias.",
    longDescription: "Forjada en aluminio fundido con acabado granallado de microesferas de vidrio. Integra 16 codificadores rotatorios ópticos con inercia configurable por software y 64 pulsadores de perfil bajo con switches mecánicos lubricados.",
    specs: [
      { label: "Codificadores", value: "16x Encoders Ópticos con Fricción Activa" },
      { label: "Pantallas", value: "Pantalla Principal Ultra-Wide OLED + 16 Sub-OLEDs" },
      { label: "Procesador", value: "Dual Cortex-M7 @ 480MHz Real-Time OS" },
      { label: "Entradas / Salidas", value: "USB-C, MIDI DIN 5-pin, 4x CV/Gate 3.5mm" },
      { label: "Latencia USB", value: "< 0.4 ms MIDI 2.0 Nativo" },
    ],
    features: [
      "Modo Standalone con almacenamiento interno NVMe de 64GB",
      "Tiras táctiles Ribbon de grafeno con pitch-bend de alta resolución",
      "Iluminación perimetral RGB sub-difusa programable",
      "Compatibilidad total con Ableton, Logic Pro, Bitwig y ProTools"
    ],
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=80"
    ],
    tags: [
      { id: "tag-ctl-1", label: "CONTROL", value: "16 Encoders Hápticos", positionClass: "top-[25%] left-1 sm:left-2 md:left-3", align: "left" },
      { id: "tag-ctl-2", label: "LATENCIA", value: "< 0.4ms MIDI 2.0", positionClass: "bottom-[25%] right-1 sm:right-2 md:right-3", align: "right" },
    ],
    fallbackGradient: "from-emerald-500/30 via-zinc-900 to-black",
    colorAccent: "#10b981",
    glowRgba: "rgba(168, 85, 129, 0.45)",
    badge: "Nuevo Lanzamiento",
    dimensions: "360 × 220 × 28 mm",
    weight: "1,450 g",
    leadTime: "Envío inmediato (24-48h)",
    inStock: true,
  },
  {
    id: "mka-acoustic-sphere",
    code: "MKA // 005-SPK",
    name: "Levitas Acoustic Monolith",
    category: "Sonido Escultórico",
    tagline: "Sistema de sonido esferoide suspendido con dispersión omnidireccional de 360°.",
    price: "$2,150 USD",
    priceRaw: 2150,
    bulkPrice: 1950,
    description: "Un altavoz que desafía la gravedad mediante una base de levitación magnética activa con carga por inducción resonante.",
    longDescription: "El núcleo acústico flota a 25 mm sobre su base monolítica mientras transmite audio de alta resolución sin pérdidas a través de Wi-Fi 6E y LDAC. La ausencia de contacto físico anula totalmente las vibraciones parásitas hacia la superficie de apoyo.",
    specs: [
      { label: "Potencia Total", value: "180W RMS Clase D Tri-Amplificado" },
      { label: "Transductores", value: "Woofer 4.5\" Neodimio + 2x Tweeters Cerámicos" },
      { label: "Altura Levitación", value: "25 mm Estable mediante Electroimanes Cuánticos" },
      { label: "Resolución DAC", value: "32-bit / 384kHz ESS Sabre ES9038" },
      { label: "Streaming", value: "AirPlay 2, Spotify Connect, Roon Ready, Bluetooth 5.4" },
    ],
    features: [
      "Anillo de luz ambiental respirable con sincronización de graves",
      "Micrófonos MEMS para calibración acústica de sala en tiempo real",
      "Carcasa unibody de cerámica circonio sinterizada a 1500°C",
      "Posibilidad de emparejamiento estéreo True Wireless dual"
    ],
    imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80"
    ],
    tags: [
      { id: "tag-spk-1", label: "LEVITACIÓN", value: "MagLev Cuántico", positionClass: "top-[26%] left-1 sm:left-2 md:left-3", align: "left" },
      { id: "tag-spk-2", label: "ACÚSTICA", value: "180W RMS 360°", positionClass: "bottom-[24%] right-1 sm:right-2 md:right-3", align: "right" },
    ],
    fallbackGradient: "from-rose-500/30 via-stone-900 to-black",
    colorAccent: "#f43f5e",
    glowRgba: "rgba(244, 63, 94, 0.45)",
    badge: "Innovación Acústica",
    dimensions: "Diámetro 200 mm | Base: 240 × 40 mm",
    weight: "2,800 g",
    leadTime: "Envío inmediato (24-48h)",
    inStock: true,
  }
];
