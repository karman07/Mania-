export const LANGUAGES = [
  { code: "en", label: "English",  short: "EN" },
  { code: "ja", label: "日本語",   short: "JA" },
  { code: "ko", label: "한국어",   short: "KO" },
  { code: "es", label: "Español",  short: "ES" },
  { code: "fr", label: "Français", short: "FR" },
  { code: "hi", label: "हिंदी",   short: "HI" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

export type T = {
  nav: {
    browse: string; topCharts: string; freeManga: string
    creators: string; startReading: string
  }
  hero: {
    words: string[]; subtitle: string; body: string
    cta1: string; cta2: string
    statManga: string; statCreators: string; statReaders: string; statFree: string
    trending: string; free: string; ratingLabel: string
  }
  free: {
    tag: string; h1: string; h2: string; body: string
    cta1: string; cta2: string
    s1n: string; s1l: string; s2n: string; s2l: string; s3n: string; s3l: string
  }
  feat: {
    eyebrow: string; heading: string; viewAll: string
    filters: string[]; loadMore: string; readNow: string
  }
  chars: {
    eyebrow: string; h1: string; h2: string; sub: string
    mangaLabel: string; readNow: string
    list: Array<{ title: string; desc: string; tag: string }>
  }
  genres: {
    eyebrow: string; h1: string; h2: string; sub: string; names: string[]
  }
  stats: {
    eyebrow: string; h1: string; h2: string
    items: Array<{ label: string; desc: string }>
    ctaH: string; ctaB: string; cta1: string; cta2: string
  }
  footer: {
    tagline: string
    cats: Array<{ label: string; links: string[] }>
    appSoon: string; copy: string; madeWith: string
  }
};

const en: T = {
  nav: {
    browse: "Browse", topCharts: "Top Charts", freeManga: "Free Manga",
    creators: "Creators", startReading: "Start Reading",
  },
  hero: {
    words: ["Epic Adventures", "Global Stories", "World Creators", "Amazing Manga"],
    subtitle: "Manga for Everyone",
    body: "Discover stunning manga from creators around the globe. From legendary epics to heartwarming slice-of-life — your next favourite story awaits.",
    cta1: "Start Reading Free", cta2: "Explore Library",
    statManga: "Manga", statCreators: "Creators", statReaders: "Readers", statFree: "Free",
    trending: "Trending", free: "FREE", ratingLabel: "Rating",
  },
  free: {
    tag: "Free to Read", h1: "100+ Free Manga", h2: "Awaits You!",
    body: "Jump straight in — no subscription, no credit card. Dozens of titles from creators worldwide, completely free.",
    cta1: "Browse Free Manga", cta2: "Watch Trailers",
    s1n: "100+", s1l: "Free titles", s2n: "Daily", s2l: "New chapters", s3n: "HD", s3l: "Quality art",
  },
  feat: {
    eyebrow: "Curated for You", heading: "Featured Manga", viewAll: "View all →",
    filters: ["All", "Action", "Romance", "Fantasy", "Free", "Historical"],
    loadMore: "Load More Manga", readNow: "Read Now",
  },
  chars: {
    eyebrow: "Special Editions", h1: "Iconic Characters,", h2: "Cultural Art",
    sub: "Your favourite manga heroes reimagined through stunning cultural artwork — a celebration of creativity across borders.",
    mangaLabel: "Manga", readNow: "Read Now",
    list: [
      { title: "Thali Edition",    desc: "Channeling strength through tradition. A cultural crossover where power meets flavour.",             tag: "Fan Favourite"   },
      { title: "Namaste Edition",  desc: "The future King of Pirates greets the world in style. Adventure meets cultural elegance.",           tag: "Most Loved"       },
      { title: "Cultural Fusion",  desc: "The demon-slaying duo in stunning traditional attire. Heritage art meets manga action.",             tag: "Cultural Icons"   },
    ],
  },
  genres: {
    eyebrow: "Find Your Vibe", h1: "Explore by", h2: "Genre",
    sub: "From legendary epics to cozy slice-of-life — there is a genre for every mood.",
    names: ["Action", "Romance", "Fantasy", "Horror", "Comedy", "Slice of Life", "Sci-Fi", "Historical"],
  },
  stats: {
    eyebrow: "By the Numbers", h1: "The World's Manga", h2: "Destination",
    items: [
      { label: "Manga Titles",   desc: "From around the globe"   },
      { label: "Creators",       desc: "Artists & storytellers"  },
      { label: "Active Readers", desc: "And growing every day"   },
      { label: "Free Titles",    desc: "Zero cost, all quality"  },
    ],
    ctaH: "Start Your Journey Today",
    ctaB: "Join millions of readers discovering manga from every corner of the world.",
    cta1: "Sign Up Free", cta2: "Browse Manga",
  },
  footer: {
    tagline: "Your global home for manga — from legendary series to the freshest indie titles.",
    cats: [
      { label: "Platform", links: ["Browse Manga","Top Charts","New Releases","Free Manga","All Series"]        },
      { label: "Creators", links: ["Become a Creator","Creator Portal","Guidelines","Revenue Share","Community"] },
      { label: "Company",  links: ["About Us","Careers","Press Kit","Blog","Contact"]                           },
      { label: "Legal",    links: ["Terms of Service","Privacy Policy","Cookie Policy","DMCA","Accessibility"]   },
    ],
    appSoon: "Coming soon", copy: "© 2024 RaManga. All rights reserved.", madeWith: "Made with love for manga",
  },
};

const ja: T = {
  nav: {
    browse: "探索", topCharts: "ランキング", freeManga: "無料マンガ",
    creators: "作者", startReading: "読み始める",
  },
  hero: {
    words: ["壮大な冒険", "世界の物語", "世界のクリエイター", "素晴らしいマンガ"],
    subtitle: "みんなのマンガ",
    body: "世界中のクリエイターによる素晴らしいマンガを発見しよう。伝説的な叙事詩から心温まる日常系まで — あなたの次のお気に入りがここに。",
    cta1: "無料で読み始める", cta2: "ライブラリを探る",
    statManga: "マンガ", statCreators: "作者", statReaders: "読者", statFree: "無料",
    trending: "トレンド", free: "無料", ratingLabel: "評価",
  },
  free: {
    tag: "無料で読む", h1: "100以上の無料マンガが", h2: "待っています！",
    body: "サブスク不要・カード不要。世界中のクリエイターの多くのタイトルが完全無料。",
    cta1: "無料マンガを見る", cta2: "トレーラーを見る",
    s1n: "100+", s1l: "無料タイトル", s2n: "毎日", s2l: "新しいチャプター", s3n: "HD", s3l: "高品質アート",
  },
  feat: {
    eyebrow: "あなたのために厳選", heading: "おすすめマンガ", viewAll: "すべて見る →",
    filters: ["すべて", "アクション", "ロマンス", "ファンタジー", "無料", "歴史"],
    loadMore: "もっと見る", readNow: "今すぐ読む",
  },
  chars: {
    eyebrow: "スペシャルエディション", h1: "人気キャラクター、", h2: "文化アート",
    sub: "お気に入りのマンガヒーローが文化的なアートワークで再解釈。国境を越えた創造性のお祝い。",
    mangaLabel: "マンガ", readNow: "今すぐ読む",
    list: [
      { title: "ターリーエディション", desc: "伝統を通じて強さを発揮。力と美食が交わる文化的クロスオーバー。",     tag: "ファンお気に入り" },
      { title: "ナマステエディション", desc: "未来の海賊王がスタイリッシュに世界に挨拶。冒険と文化の優雅な融合。", tag: "最愛キャラ"       },
      { title: "文化フュージョン",     desc: "鬼殺しコンビが美しい伝統衣装を纏う。伝統芸術とアクションの融合。",   tag: "文化的アイコン"   },
    ],
  },
  genres: {
    eyebrow: "ジャンルを探す", h1: "ジャンル別", h2: "探索",
    sub: "伝説的な叙事詩からのほほんとした日常系まで — どんな気分にも合うジャンルがある。",
    names: ["アクション","ロマンス","ファンタジー","ホラー","コメディ","日常系","SF","歴史"],
  },
  stats: {
    eyebrow: "数字で見る", h1: "世界のマンガの", h2: "目的地",
    items: [
      { label: "マンガタイトル", desc: "世界中から集めた作品"     },
      { label: "クリエイター",   desc: "アーティスト＆物語の語り手" },
      { label: "アクティブ読者", desc: "毎日増え続けている"       },
      { label: "無料タイトル",   desc: "費用ゼロ、最高品質"       },
    ],
    ctaH: "今日から旅を始めよう",
    ctaB: "世界中からマンガを発見している数百万人の読者に参加しよう。",
    cta1: "無料登録", cta2: "マンガを探す",
  },
  footer: {
    tagline: "マンガのグローバルホーム — 伝説のシリーズから最新のインディータイトルまで。",
    cats: [
      { label: "プラットフォーム", links: ["マンガを探す","ランキング","新着","無料マンガ","全シリーズ"]                   },
      { label: "クリエイター",     links: ["クリエイターになる","クリエイターポータル","ガイドライン","収益シェア","コミュニティ"] },
      { label: "会社",             links: ["会社概要","採用","プレスキット","ブログ","お問い合わせ"]                         },
      { label: "法的情報",         links: ["利用規約","プライバシーポリシー","Cookieポリシー","DMCA","アクセシビリティ"]         },
    ],
    appSoon: "近日公開", copy: "© 2024 RaManga. All rights reserved.", madeWith: "マンガへの愛を込めて",
  },
};

const ko: T = {
  nav: {
    browse: "탐색", topCharts: "인기 차트", freeManga: "무료 만화",
    creators: "크리에이터", startReading: "읽기 시작",
  },
  hero: {
    words: ["웅장한 모험", "세계 이야기", "세계 크리에이터", "놀라운 만화"],
    subtitle: "모두를 위한 만화",
    body: "전 세계 크리에이터들의 멋진 만화를 발견하세요. 전설적인 서사시부터 가슴 따뜻한 일상물까지 — 당신의 다음 최애작이 여기 있어요.",
    cta1: "무료로 읽기 시작", cta2: "라이브러리 탐색",
    statManga: "만화", statCreators: "크리에이터", statReaders: "독자", statFree: "무료",
    trending: "트렌딩", free: "무료", ratingLabel: "평점",
  },
  free: {
    tag: "무료로 읽기", h1: "100개 이상의 무료 만화가", h2: "기다리고 있어요!",
    body: "바로 시작하세요 — 구독 없음, 신용카드 없음. 전 세계 크리에이터의 수십 개 타이틀이 완전 무료.",
    cta1: "무료 만화 보기", cta2: "트레일러 보기",
    s1n: "100+", s1l: "무료 타이틀", s2n: "매일", s2l: "새 챕터", s3n: "HD", s3l: "고화질 아트",
  },
  feat: {
    eyebrow: "당신을 위해 엄선", heading: "추천 만화", viewAll: "전체 보기 →",
    filters: ["전체", "액션", "로맨스", "판타지", "무료", "역사"],
    loadMore: "더 보기", readNow: "지금 읽기",
  },
  chars: {
    eyebrow: "스페셜 에디션", h1: "아이코닉 캐릭터,", h2: "문화 아트",
    sub: "좋아하는 만화 영웅들이 멋진 문화 아트워크로 재탄생. 국경을 넘는 창의성의 축제.",
    mangaLabel: "만화", readNow: "지금 읽기",
    list: [
      { title: "탈리 에디션",   desc: "전통을 통해 힘을 발휘하다. 파워와 맛이 만나는 문화적 크로스오버.",             tag: "팬 최애"      },
      { title: "나마스테 에디션", desc: "미래의 해적왕이 스타일리시하게 세상에 인사. 모험과 문화의 우아한 만남.",      tag: "가장 사랑받는" },
      { title: "문화 퓨전",    desc: "귀신 사냥 듀오가 아름다운 전통 의상을 입다. 전통 예술과 액션 만화의 만남.", tag: "문화 아이콘"   },
    ],
  },
  genres: {
    eyebrow: "취향 찾기", h1: "장르별", h2: "탐색",
    sub: "전설적인 서사시부터 아늑한 일상물까지 — 모든 기분에 맞는 장르가 있어요.",
    names: ["액션","로맨스","판타지","공포","코미디","일상","SF","역사"],
  },
  stats: {
    eyebrow: "숫자로 보는", h1: "세계의 만화", h2: "목적지",
    items: [
      { label: "만화 타이틀", desc: "전 세계에서 모은 작품" },
      { label: "크리에이터",  desc: "아티스트 & 스토리텔러" },
      { label: "활성 독자",   desc: "매일 늘어나고 있어요"  },
      { label: "무료 타이틀", desc: "비용 없음, 최고 품질"  },
    ],
    ctaH: "오늘 여행을 시작하세요",
    ctaB: "전 세계에서 만화를 발견하고 있는 수백만 명의 독자와 함께하세요.",
    cta1: "무료 가입", cta2: "만화 탐색",
  },
  footer: {
    tagline: "만화의 글로벌 홈 — 전설적인 시리즈부터 최신 인디 타이틀까지.",
    cats: [
      { label: "플랫폼",     links: ["만화 탐색","인기 차트","새로운 작품","무료 만화","전체 시리즈"]           },
      { label: "크리에이터", links: ["크리에이터 되기","크리에이터 포털","가이드라인","수익 공유","커뮤니티"] },
      { label: "회사",       links: ["회사 소개","채용","프레스 킷","블로그","문의"]                           },
      { label: "법적 정보",  links: ["이용 약관","개인정보 처리방침","쿠키 정책","DMCA","접근성"]             },
    ],
    appSoon: "곧 출시", copy: "© 2024 RaManga. All rights reserved.", madeWith: "만화에 대한 사랑으로 만들었습니다",
  },
};

const es: T = {
  nav: {
    browse: "Explorar", topCharts: "Clasificaciones", freeManga: "Manga Gratis",
    creators: "Creadores", startReading: "Comenzar",
  },
  hero: {
    words: ["Aventuras Épicas", "Historias Globales", "Creadores Mundiales", "Manga Increíble"],
    subtitle: "Manga para Todos",
    body: "Descubre manga impresionante de creadores de todo el mundo. Desde épicas legendarias hasta slice-of-life — tu próxima historia favorita te espera.",
    cta1: "Leer Gratis", cta2: "Explorar Biblioteca",
    statManga: "Manga", statCreators: "Creadores", statReaders: "Lectores", statFree: "Gratis",
    trending: "Tendencia", free: "GRATIS", ratingLabel: "Calificación",
  },
  free: {
    tag: "Lectura Gratuita", h1: "Más de 100 Manga Gratis", h2: "Te Esperan!",
    body: "Empieza de inmediato — sin suscripción, sin tarjeta. Decenas de títulos de creadores de todo el mundo, completamente gratis.",
    cta1: "Ver Manga Gratis", cta2: "Ver Tráilers",
    s1n: "100+", s1l: "Títulos gratis", s2n: "Diario", s2l: "Nuevos capítulos", s3n: "HD", s3l: "Arte de calidad",
  },
  feat: {
    eyebrow: "Seleccionado para Ti", heading: "Manga Destacado", viewAll: "Ver todo →",
    filters: ["Todo", "Acción", "Romance", "Fantasía", "Gratis", "Histórico"],
    loadMore: "Cargar Más", readNow: "Leer Ahora",
  },
  chars: {
    eyebrow: "Ediciones Especiales", h1: "Personajes Icónicos,", h2: "Arte Cultural",
    sub: "Tus héroes de manga favoritos reimaginados a través de arte cultural — una celebración de la creatividad sin fronteras.",
    mangaLabel: "Manga", readNow: "Leer Ahora",
    list: [
      { title: "Edición Thali",   desc: "Canalizando la fuerza a través de la tradición. Un cruce cultural donde el poder se encuentra con el sabor.", tag: "Favorito de Fans"   },
      { title: "Edición Namaste", desc: "El futuro Rey de los Piratas saluda al mundo con estilo. La aventura se encuentra con la elegancia cultural.",  tag: "Más Amado"          },
      { title: "Fusión Cultural", desc: "El dúo cazador de demonios con vestimenta tradicional impresionante. Arte del patrimonio y manga de acción.",   tag: "Íconos Culturales"  },
    ],
  },
  genres: {
    eyebrow: "Encuentra Tu Estilo", h1: "Explorar por", h2: "Género",
    sub: "Desde épicas legendarias hasta slice-of-life tranquilo — hay un género para cada estado de ánimo.",
    names: ["Acción","Romance","Fantasía","Terror","Comedia","Vida Cotidiana","Ciencia Ficción","Histórico"],
  },
  stats: {
    eyebrow: "En Números", h1: "El Destino Mundial", h2: "del Manga",
    items: [
      { label: "Títulos de Manga", desc: "De todo el mundo"        },
      { label: "Creadores",        desc: "Artistas & narradores"   },
      { label: "Lectores Activos", desc: "Y creciendo cada día"    },
      { label: "Títulos Gratis",   desc: "Sin costo, total calidad" },
    ],
    ctaH: "Comienza Tu Viaje Hoy",
    ctaB: "Únete a millones de lectores que descubren manga de cada rincón del mundo.",
    cta1: "Registrarse Gratis", cta2: "Ver Manga",
  },
  footer: {
    tagline: "Tu hogar global para el manga — desde series legendarias hasta los últimos títulos indie.",
    cats: [
      { label: "Plataforma", links: ["Ver Manga","Clasificaciones","Novedades","Manga Gratis","Todas las Series"] },
      { label: "Creadores",  links: ["Ser Creador","Portal de Creadores","Directrices","Reparto de Ingresos","Comunidad"] },
      { label: "Empresa",    links: ["Sobre Nosotros","Carreras","Prensa","Blog","Contacto"] },
      { label: "Legal",      links: ["Términos de Servicio","Política de Privacidad","Política de Cookies","DMCA","Accesibilidad"] },
    ],
    appSoon: "Próximamente", copy: "© 2024 RaManga. Todos los derechos reservados.", madeWith: "Hecho con amor por el manga",
  },
};

const fr: T = {
  nav: {
    browse: "Explorer", topCharts: "Classements", freeManga: "Manga Gratuit",
    creators: "Créateurs", startReading: "Commencer",
  },
  hero: {
    words: ["Aventures Épiques", "Histoires Mondiales", "Créateurs du Monde", "Manga Incroyable"],
    subtitle: "Manga pour Tous",
    body: "Découvrez des mangas époustouflants de créateurs du monde entier. Des épopées légendaires aux tranches de vie — votre prochaine histoire préférée vous attend.",
    cta1: "Lire Gratuitement", cta2: "Explorer la Bibliothèque",
    statManga: "Mangas", statCreators: "Créateurs", statReaders: "Lecteurs", statFree: "Gratuit",
    trending: "Tendance", free: "GRATUIT", ratingLabel: "Note",
  },
  free: {
    tag: "Lecture Gratuite", h1: "Plus de 100 Mangas Gratuits", h2: "Vous Attendent!",
    body: "Commencez directement — sans abonnement, sans carte. Des dizaines de titres de créateurs du monde entier, entièrement gratuits.",
    cta1: "Voir Manga Gratuit", cta2: "Voir Bandes-Annonces",
    s1n: "100+", s1l: "Titres gratuits", s2n: "Quotidien", s2l: "Nouveaux chapitres", s3n: "HD", s3l: "Art de qualité",
  },
  feat: {
    eyebrow: "Sélectionné pour Vous", heading: "Manga en Vedette", viewAll: "Voir tout →",
    filters: ["Tout", "Action", "Romance", "Fantaisie", "Gratuit", "Historique"],
    loadMore: "Charger Plus", readNow: "Lire Maintenant",
  },
  chars: {
    eyebrow: "Éditions Spéciales", h1: "Personnages Iconiques,", h2: "Art Culturel",
    sub: "Vos héros de manga préférés réimaginés à travers un art culturel époustouflant — une célébration de la créativité sans frontières.",
    mangaLabel: "Manga", readNow: "Lire Maintenant",
    list: [
      { title: "Édition Thali",   desc: "Canalisant la force à travers la tradition. Un crossover culturel où la puissance rencontre la saveur.",     tag: "Favori des Fans"   },
      { title: "Édition Namaste", desc: "Le futur Roi des Pirates salue le monde avec style. L'aventure rencontre l'élégance culturelle.",             tag: "Le Plus Aimé"      },
      { title: "Fusion Culturelle", desc: "Le duo chasseur de démons en tenues traditionnelles splendides. Art du patrimoine et manga d'action.",      tag: "Icônes Culturelles" },
    ],
  },
  genres: {
    eyebrow: "Trouvez Votre Vibe", h1: "Explorer par", h2: "Genre",
    sub: "Des épopées légendaires aux tranches de vie douillettes — il y a un genre pour chaque humeur.",
    names: ["Action","Romance","Fantaisie","Horreur","Comédie","Tranche de Vie","Science-Fiction","Historique"],
  },
  stats: {
    eyebrow: "En Chiffres", h1: "La Destination Mondiale", h2: "du Manga",
    items: [
      { label: "Titres de Manga", desc: "Du monde entier"           },
      { label: "Créateurs",       desc: "Artistes & narrateurs"     },
      { label: "Lecteurs Actifs", desc: "Et ça grandit chaque jour" },
      { label: "Titres Gratuits", desc: "Zéro coût, toute qualité"  },
    ],
    ctaH: "Commencez Votre Voyage Aujourd'hui",
    ctaB: "Rejoignez des millions de lecteurs qui découvrent des mangas de chaque coin du monde.",
    cta1: "S'inscrire Gratuitement", cta2: "Voir les Mangas",
  },
  footer: {
    tagline: "Votre maison mondiale pour le manga — des séries légendaires aux derniers titres indés.",
    cats: [
      { label: "Plateforme", links: ["Voir les Mangas","Classements","Nouveautés","Manga Gratuit","Toutes les Séries"] },
      { label: "Créateurs",  links: ["Devenir Créateur","Portail Créateur","Directives","Partage des Revenus","Communauté"] },
      { label: "Entreprise", links: ["À Propos","Carrières","Presse","Blog","Contact"] },
      { label: "Légal",      links: ["Conditions d'Utilisation","Politique de Confidentialité","Politique de Cookies","DMCA","Accessibilité"] },
    ],
    appSoon: "Bientôt disponible", copy: "© 2024 RaManga. Tous droits réservés.", madeWith: "Fait avec amour pour le manga",
  },
};

const hi: T = {
  nav: {
    browse: "ब्राउज़ करें", topCharts: "टॉप चार्ट", freeManga: "फ्री मंगा",
    creators: "क्रिएटर्स", startReading: "पढ़ना शुरू करें",
  },
  hero: {
    words: ["महाकाव्य रोमांच", "वैश्विक कहानियां", "विश्व क्रिएटर्स", "अद्भुत मंगा"],
    subtitle: "सबके लिए मंगा",
    body: "दुनिया भर के क्रिएटर्स द्वारा शानदार मंगा खोजें। पौराणिक महाकाव्यों से लेकर दिल छू लेने वाली स्लाइस-ऑफ-लाइफ तक — आपकी अगली पसंदीदा कहानी यहाँ है।",
    cta1: "फ्री में पढ़ना शुरू करें", cta2: "लाइब्रेरी देखें",
    statManga: "मंगा", statCreators: "क्रिएटर्स", statReaders: "पाठक", statFree: "फ्री",
    trending: "ट्रेंडिंग", free: "फ्री", ratingLabel: "रेटिंग",
  },
  free: {
    tag: "मुफ़्त पढ़ें", h1: "100+ फ्री मंगा", h2: "आपका इंतजार कर रहे हैं!",
    body: "सीधे शुरू करें — कोई सब्सक्रिप्शन नहीं, कोई कार्ड नहीं। दुनिया भर के क्रिएटर्स के दर्जनों टाइटल बिल्कुल फ्री।",
    cta1: "फ्री मंगा देखें", cta2: "ट्रेलर देखें",
    s1n: "100+", s1l: "फ्री टाइटल", s2n: "रोज़", s2l: "नए चैप्टर", s3n: "HD", s3l: "उच्च गुणवत्ता आर्ट",
  },
  feat: {
    eyebrow: "आपके लिए चुने गए", heading: "फीचर्ड मंगा", viewAll: "सब देखें →",
    filters: ["सब", "एक्शन", "रोमांस", "फंतासी", "फ्री", "ऐतिहासिक"],
    loadMore: "और मंगा लोड करें", readNow: "अभी पढ़ें",
  },
  chars: {
    eyebrow: "स्पेशल एडिशन", h1: "आइकोनिक किरदार,", h2: "सांस्कृतिक आर्ट",
    sub: "आपके पसंदीदा मंगा हीरोज को शानदार सांस्कृतिक आर्टवर्क में फिर से कल्पना किया गया — सीमाओं से परे रचनात्मकता का उत्सव।",
    mangaLabel: "मंगा", readNow: "अभी पढ़ें",
    list: [
      { title: "थाली एडिशन",   desc: "परंपरा के ज़रिए ताकत को चैनल करना। एक अनूठा सांस्कृतिक संगम जहां शक्ति और स्वाद मिलते हैं।",  tag: "फैन फेवरेट"      },
      { title: "नमस्ते एडिशन", desc: "भविष्य के पायरेट्स किंग का स्टाइलिश अंदाज़ में दुनिया को अभिवादन। रोमांच और सांस्कृतिक शान।", tag: "सबसे प्रिय"       },
      { title: "सांस्कृतिक फ्यूज़न", desc: "दानव-संहारक जोड़ी खूबसूरत पारंपरिक पोशाक में। विरासत कला और एक्शन मंगा का संगम।",      tag: "सांस्कृतिक आइकन" },
    ],
  },
  genres: {
    eyebrow: "अपनी पसंद खोजें", h1: "जॉनर के अनुसार", h2: "एक्सप्लोर करें",
    sub: "पौराणिक महाकाव्यों से लेकर आरामदेह स्लाइस-ऑफ-लाइफ तक — हर मूड के लिए एक जॉनर है।",
    names: ["एक्शन","रोमांस","फंतासी","हॉरर","कॉमेडी","स्लाइस ऑफ लाइफ","साइ-फाई","ऐतिहासिक"],
  },
  stats: {
    eyebrow: "आंकड़ों में", h1: "दुनिया का मंगा", h2: "डेस्टिनेशन",
    items: [
      { label: "मंगा टाइटल",  desc: "दुनिया भर से"            },
      { label: "क्रिएटर्स",   desc: "आर्टिस्ट और कहानीकार"  },
      { label: "सक्रिय पाठक", desc: "और हर दिन बढ़ रहे हैं"  },
      { label: "फ्री टाइटल",  desc: "शून्य लागत, पूरी गुणवत्ता" },
    ],
    ctaH: "आज अपनी यात्रा शुरू करें",
    ctaB: "दुनिया के हर कोने से मंगा खोज रहे लाखों पाठकों से जुड़ें।",
    cta1: "फ्री साइन अप", cta2: "मंगा देखें",
  },
  footer: {
    tagline: "मंगा का आपका वैश्विक घर — महान सीरीज से लेकर ताज़े इंडी टाइटल तक।",
    cats: [
      { label: "प्लेटफ़ॉर्म", links: ["मंगा ब्राउज़ करें","टॉप चार्ट","नई रिलीज़","फ्री मंगा","सभी सीरीज"] },
      { label: "क्रिएटर",    links: ["क्रिएटर बनें","क्रिएटर पोर्टल","दिशानिर्देश","रेवेन्यू शेयर","कम्युनिटी"] },
      { label: "कंपनी",     links: ["हमारे बारे में","करियर","प्रेस किट","ब्लॉग","संपर्क करें"] },
      { label: "कानूनी",   links: ["सेवा की शर्तें","गोपनीयता नीति","कुकी नीति","DMCA","एक्सेसिबिलिटी"] },
    ],
    appSoon: "जल्द आ रहा है", copy: "© 2024 RaManga. सर्वाधिकार सुरक्षित।", madeWith: "मंगा के प्रति प्रेम से बनाया",
  },
};

export const translations: Record<LangCode, T> = { en, ja, ko, es, fr, hi };
