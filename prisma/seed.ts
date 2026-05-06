import { PrismaClient, UserRole, BeatStatus, LicenseType, SubscriptionPlan, PaymentStatus, PaymentMethod } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Audio publics pour les previews (test uniquement) ────────────────────────
const SAMPLE_AUDIOS = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
];

const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const pickAudio = () => pick(SAMPLE_AUDIOS);

async function main() {
  console.log("🌱 Nettoyage de la base...");
  // Ordre de suppression respectant les FK
  await prisma.forumComment.deleteMany();
  await prisma.forumPost.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.license.deleteMany();
  await prisma.beat.deleteMany();
  await prisma.service.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.message.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 Création des utilisateurs...");

  const PASSWORD = await bcrypt.hash("Sumvibes2025!", 10);

  // ─── ADMIN ────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: "admin@sumvibes.fr",
      username: "admin",
      passwordHash: PASSWORD,
      role: UserRole.ADMIN,
      displayName: "Admin SUMVIBES",
      firstName: "Admin",
      lastName: "Sumvibes",
      emailVerified: true,
      gdprConsent: true,
    },
  });

  // ─── SELLERS ──────────────────────────────────────────────────────────────
  const sellersData = [
    {
      email: "djkruger@sumvibes.fr",
      username: "djkruger",
      displayName: "DJ Krüger",
      firstName: "Kevin",
      lastName: "Rüger",
      bio: "Producteur Trap & Afro basé en Guadeloupe. 10 ans de studio, des sons pour les grands.",
      instagram: "@djkruger_gwada",
      artistName: "DJ Krüger",
      description: "Producteur certifié avec plus de 500 beats vendus. Spécialiste Trap et Afrobeat depuis 2014.",
      genres: ["Trap", "Afrobeat", "Drill"],
      totalSales: 142,
      totalBeats: 38,
      totalRevenue: 4850.0,
      verified: true,
    },
    {
      email: "beatsbywilo@sumvibes.fr",
      username: "beatsbywilo",
      displayName: "Wilo Beats",
      firstName: "William",
      lastName: "Orcel",
      bio: "Beatmaker Bouyon & Dancehall depuis 2018. Gwada represent.",
      instagram: "@beatsbywilo",
      artistName: "Wilo Beats",
      description: "Le son des Antilles modernisé. Bouyon, Shatta, Dancehall — tout y passe.",
      genres: ["Bouyon", "Shatta", "Dancehall", "Afrobeat"],
      totalSales: 89,
      totalBeats: 24,
      totalRevenue: 2340.0,
      verified: true,
    },
    {
      email: "solange.prod@sumvibes.fr",
      username: "solangeprod",
      displayName: "Solange Prod",
      firstName: "Solange",
      lastName: "Farel",
      bio: "R&B, Soul & K-Pop influencée. Compositrice & beatmaker.",
      instagram: "@solange.prod",
      artistName: "Solange Prod",
      description: "Des mélodies qui font vibrer. R&B, Soul et touches K-Pop pour artistes modernes.",
      genres: ["R&B", "Soul", "K-Pop", "Pop"],
      totalSales: 67,
      totalBeats: 19,
      totalRevenue: 1890.0,
      verified: false,
    },
    {
      email: "dembow_reyes@sumvibes.fr",
      username: "dembowreyes",
      displayName: "Reyes El Productor",
      firstName: "Carlos",
      lastName: "Reyes",
      bio: "Dembow et Reggaeton authentique. Miami-Caraïbes.",
      instagram: "@reyes_prod",
      artistName: "Reyes El Productor",
      description: "La rythmique caribéenne au service de vos projets. Dembow, Reggaeton, Latin Trap.",
      genres: ["Dembow", "Reggaeton", "Trap"],
      totalSales: 53,
      totalBeats: 16,
      totalRevenue: 1420.0,
      verified: false,
    },
    {
      email: "lofi_manon@sumvibes.fr",
      username: "lofimanon",
      displayName: "Manon Lofi",
      firstName: "Manon",
      lastName: "Dubois",
      bio: "Lo-Fi, Jazz & chill vibes. Pour les sessions créatives.",
      instagram: "@manon.lofi",
      artistName: "Manon Lofi",
      description: "Ambiances Lo-Fi & Jazz pour vos moments créatifs. Chill garanti.",
      genres: ["Lo-Fi", "Jazz", "Soul"],
      totalSales: 31,
      totalBeats: 12,
      totalRevenue: 720.0,
      verified: false,
    },
  ];

  const sellers: any[] = [];
  for (const s of sellersData) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        username: s.username,
        passwordHash: PASSWORD,
        role: UserRole.SELLER,
        displayName: s.displayName,
        firstName: s.firstName,
        lastName: s.lastName,
        bio: s.bio,
        instagram: s.instagram,
        emailVerified: true,
        gdprConsent: true,
        sellerProfile: {
          create: {
            artistName: s.artistName,
            description: s.description,
            genres: s.genres,
            totalSales: s.totalSales,
            totalBeats: s.totalBeats,
            totalRevenue: s.totalRevenue,
            verified: s.verified,
            averageRating: +(3.5 + Math.random() * 1.5).toFixed(2),
            totalReviews: Math.floor(s.totalSales * 0.3),
            commissionRate: 15,
          },
        },
      },
      include: { sellerProfile: true },
    });
    sellers.push(user);
  }

  // ─── BUYERS ───────────────────────────────────────────────────────────────
  const buyersData = [
    {
      email: "artiste@sumvibes.fr",
      username: "artiste_demo",
      displayName: "Artiste Demo",
      firstName: "Jean",
      lastName: "Martin",
      plan: SubscriptionPlan.FREEMIUM,
    },
    {
      email: "premium@sumvibes.fr",
      username: "buyer_premium",
      displayName: "Maya Premium",
      firstName: "Maya",
      lastName: "Laurent",
      plan: SubscriptionPlan.PREMIUM_MONTHLY,
    },
    {
      email: "standard@sumvibes.fr",
      username: "buyer_standard",
      displayName: "Lucas Standard",
      firstName: "Lucas",
      lastName: "Bernard",
      plan: SubscriptionPlan.STANDARD_MONTHLY,
    },
  ];

  const buyers: any[] = [];
  for (const b of buyersData) {
    const user = await prisma.user.create({
      data: {
        email: b.email,
        username: b.username,
        passwordHash: PASSWORD,
        role: UserRole.BUYER,
        displayName: b.displayName,
        firstName: b.firstName,
        lastName: b.lastName,
        emailVerified: true,
        gdprConsent: true,
        subscription: {
          create: {
            plan: b.plan,
            status: "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
    });
    buyers.push(user);
  }

  console.log("🎵 Création des beats...");

  // ─── BEATS ────────────────────────────────────────────────────────────────
  const beatsData = [
    // DJ Krüger (sellers[0])
    { seller: sellers[0], title: "Nuit Tropicale", genre: ["Trap", "Afrobeat"], mood: ["Dark", "Energetic"], bpm: 140, key: "Am", basicPrice: 29.99, premiumPrice: 59.99, exclusivePrice: 299.99, plays: 1240, featured: true },
    { seller: sellers[0], title: "Gwada Drill", genre: ["Drill"], mood: ["Aggressive", "Dark"], bpm: 145, key: "F#m", basicPrice: 24.99, premiumPrice: 49.99, exclusivePrice: 249.99, plays: 876 },
    { seller: sellers[0], title: "Lagos Nights", genre: ["Afrobeat"], mood: ["Uplifting", "Energetic"], bpm: 105, key: "C", basicPrice: 34.99, premiumPrice: 69.99, exclusivePrice: 349.99, plays: 2100, featured: true },
    { seller: sellers[0], title: "Basse Terre Anthem", genre: ["Trap"], mood: ["Aggressive"], bpm: 138, key: "Gm", basicPrice: 19.99, premiumPrice: 39.99, exclusivePrice: 199.99, plays: 543 },
    { seller: sellers[0], title: "Karukera Drill", genre: ["Drill", "Trap"], mood: ["Dark", "Aggressive"], bpm: 150, key: "Dm", basicPrice: 29.99, premiumPrice: 59.99, exclusivePrice: 299.99, plays: 421 },

    // Wilo Beats (sellers[1])
    { seller: sellers[1], title: "Zouk Trap Fusion", genre: ["Bouyon", "Trap"], mood: ["Energetic", "Uplifting"], bpm: 120, key: "Eb", basicPrice: 24.99, premiumPrice: 49.99, exclusivePrice: 249.99, plays: 3200, featured: true },
    { seller: sellers[1], title: "Shatta Vibes 2025", genre: ["Shatta"], mood: ["Energetic"], bpm: 115, key: "G", basicPrice: 19.99, premiumPrice: 39.99, exclusivePrice: 199.99, plays: 1890 },
    { seller: sellers[1], title: "Dancehall Queen", genre: ["Dancehall"], mood: ["Uplifting", "Romantic"], bpm: 100, key: "D", basicPrice: 29.99, premiumPrice: 59.99, exclusivePrice: 299.99, plays: 2340 },
    { seller: sellers[1], title: "Bouyon Riddim Classic", genre: ["Bouyon"], mood: ["Energetic"], bpm: 118, key: "A", basicPrice: 22.99, premiumPrice: 44.99, exclusivePrice: 229.99, plays: 987 },
    { seller: sellers[1], title: "Point a Pitre Flow", genre: ["Shatta", "Afrobeat"], mood: ["Uplifting"], bpm: 112, key: "F", basicPrice: 27.99, premiumPrice: 54.99, exclusivePrice: 279.99, plays: 754 },

    // Solange Prod (sellers[2])
    { seller: sellers[2], title: "Seoul Dreams", genre: ["K-Pop"], mood: ["Uplifting", "Romantic"], bpm: 128, key: "B", basicPrice: 34.99, premiumPrice: 69.99, exclusivePrice: 349.99, plays: 4500, featured: true },
    { seller: sellers[2], title: "Midnight R&B", genre: ["R&B"], mood: ["Romantic", "Melancholic"], bpm: 85, key: "Cm", basicPrice: 29.99, premiumPrice: 59.99, exclusivePrice: 299.99, plays: 2800 },
    { seller: sellers[2], title: "Ame Soul", genre: ["Soul"], mood: ["Melancholic", "Romantic"], bpm: 78, key: "Fm", basicPrice: 24.99, premiumPrice: 49.99, exclusivePrice: 249.99, plays: 1650 },
    { seller: sellers[2], title: "K-Pop Banger", genre: ["K-Pop", "Pop"], mood: ["Energetic", "Uplifting"], bpm: 130, key: "E", basicPrice: 39.99, premiumPrice: 79.99, exclusivePrice: 399.99, plays: 5100 },

    // Reyes El Productor (sellers[3])
    { seller: sellers[3], title: "Dembow Caliente", genre: ["Dembow"], mood: ["Energetic", "Aggressive"], bpm: 120, key: "Am", basicPrice: 22.99, premiumPrice: 44.99, exclusivePrice: 229.99, plays: 1320, featured: true },
    { seller: sellers[3], title: "Reggaeton Nights", genre: ["Reggaeton"], mood: ["Romantic", "Energetic"], bpm: 95, key: "Dm", basicPrice: 27.99, premiumPrice: 54.99, exclusivePrice: 279.99, plays: 1780 },
    { seller: sellers[3], title: "Latin Trap Miami", genre: ["Trap", "Dembow"], mood: ["Aggressive"], bpm: 135, key: "Gm", basicPrice: 24.99, premiumPrice: 49.99, exclusivePrice: 249.99, plays: 890 },

    // Manon Lofi (sellers[4])
    { seller: sellers[4], title: "Café du Matin", genre: ["Lo-Fi"], mood: ["Chill"], bpm: 72, key: "C", basicPrice: 14.99, premiumPrice: 29.99, exclusivePrice: 149.99, plays: 6700, featured: true },
    { seller: sellers[4], title: "Jazz Late Night", genre: ["Jazz"], mood: ["Melancholic", "Chill"], bpm: 68, key: "Bb", basicPrice: 19.99, premiumPrice: 39.99, exclusivePrice: 199.99, plays: 3200 },
    { seller: sellers[4], title: "Study Session Lo-Fi", genre: ["Lo-Fi"], mood: ["Chill"], bpm: 75, key: "F", basicPrice: 12.99, premiumPrice: 24.99, exclusivePrice: 129.99, plays: 8900 },
  ];

  const beats: any[] = [];
  for (let i = 0; i < beatsData.length; i++) {
    const d = beatsData[i];
    const slug = d.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + d.seller.id.slice(0, 6);
    const beat = await prisma.beat.create({
      data: {
        sellerId: d.seller.id,
        title: d.title,
        slug,
        description: `Production ${d.genre[0]} de haute qualité. BPM: ${d.bpm}, Tonalité: ${d.key}.`,
        previewUrl: SAMPLE_AUDIOS[i % SAMPLE_AUDIOS.length],
        mp3FileUrl: SAMPLE_AUDIOS[i % SAMPLE_AUDIOS.length],
        bpm: d.bpm,
        key: d.key,
        genre: d.genre,
        mood: d.mood,
        duration: 180 + Math.floor(Math.random() * 120),
        basicPrice: d.basicPrice,
        premiumPrice: d.premiumPrice,
        exclusivePrice: d.exclusivePrice,
        plays: d.plays,
        status: BeatStatus.PUBLISHED,
        featured: d.featured ?? false,
        hasBeenPublished: true,
        publishedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        licenses: {
          create: [
            {
              type: LicenseType.BASIC,
              name: "Licence Basic",
              price: d.basicPrice,
              description: "Usage commercial limité · 5 000 streams · Distribution: 2 500 copies",
              streamingPlays: 5000,
              distributionCopies: 2500,
              musicVideos: 1,
            },
            {
              type: LicenseType.PREMIUM,
              name: "Licence Premium",
              price: d.premiumPrice,
              description: "Usage commercial étendu · 250 000 streams · Durée illimitée",
              streamingPlays: 250000,
              distributionCopies: 50000,
              musicVideos: 2,
              profitRadio: true,
            },
            {
              type: LicenseType.EXCLUSIVE,
              name: "Licence Exclusive",
              price: d.exclusivePrice,
              description: "Droits exclusifs · Usage illimité · Trackout inclus · Beat retiré du catalogue",
              streamingPlays: null,
              distributionCopies: null,
              musicVideos: null,
              profitRadio: true,
            },
          ],
        },
      },
      include: { licenses: true },
    });
    beats.push(beat);
  }

  console.log("⭐ Création des avis...");

  // Avis sur quelques beats
  const reviewsData = [
    { beatIdx: 0, buyerIdx: 0, rating: 5, comment: "Incroyable ! Ce son est exactement ce que je cherchais pour mon projet." },
    { beatIdx: 0, buyerIdx: 1, rating: 4, comment: "Très bonne qualité, production propre. Recommandé !" },
    { beatIdx: 2, buyerIdx: 2, rating: 5, comment: "Le beat Lagos Nights est un chef-d'œuvre. Merci DJ Krüger !" },
    { beatIdx: 5, buyerIdx: 0, rating: 5, comment: "Parfait pour ma musique antillaise. Wilo sait ce qu'il fait." },
    { beatIdx: 10, buyerIdx: 1, rating: 5, comment: "Seoul Dreams m'a inspiré toute une mixtape K-Pop. Feu !" },
    { beatIdx: 18, buyerIdx: 2, rating: 4, comment: "Lo-Fi parfait pour les sessions study. Très relaxant." },
    { beatIdx: 7, buyerIdx: 0, rating: 5, comment: "Dancehall Queen est une banger ! Super prod." },
    { beatIdx: 13, buyerIdx: 1, rating: 4, comment: "K-Pop Banger — exactement l'énergie dont j'avais besoin." },
  ];

  for (const r of reviewsData) {
    if (!beats[r.beatIdx] || !buyers[r.buyerIdx]) continue;
    await prisma.review.create({
      data: {
        beatId: beats[r.beatIdx].id,
        userId: buyers[r.buyerIdx].id,
        rating: r.rating,
        comment: r.comment,
      },
    });
  }

  console.log("💰 Création des achats...");

  // Quelques achats pour simuler les stats
  const purchasesData = [
    { buyerIdx: 1, beatIdx: 0, licenseType: LicenseType.PREMIUM, amount: 59.99 },
    { buyerIdx: 2, beatIdx: 2, licenseType: LicenseType.BASIC, amount: 34.99 },
    { buyerIdx: 0, beatIdx: 5, licenseType: LicenseType.BASIC, amount: 24.99 },
    { buyerIdx: 1, beatIdx: 10, licenseType: LicenseType.EXCLUSIVE, amount: 349.99 },
    { buyerIdx: 2, beatIdx: 18, licenseType: LicenseType.BASIC, amount: 14.99 },
    { buyerIdx: 0, beatIdx: 7, licenseType: LicenseType.PREMIUM, amount: 59.99 },
  ];

  for (let i = 0; i < purchasesData.length; i++) {
    const p = purchasesData[i];
    if (!beats[p.beatIdx] || !buyers[p.buyerIdx]) continue;
    const license = beats[p.beatIdx].licenses.find((l: any) => l.type === p.licenseType);
    if (!license) continue;
    const fee = +(p.amount * 0.15).toFixed(2);
    await prisma.purchase.create({
      data: {
        buyerId: buyers[p.buyerIdx].id,
        beatId: beats[p.beatIdx].id,
        licenseId: license.id,
        amount: p.amount,
        platformFee: fee,
        sellerEarnings: +(p.amount - fee).toFixed(2),
        paymentMethod: PaymentMethod.STRIPE,
        paymentStatus: PaymentStatus.COMPLETED,
        invoiceNumber: `INV-2025-${String(i + 1).padStart(4, "0")}`,
        completedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log("🛠️ Création des services...");

  const servicesData = [
    { sellerIdx: 0, title: "Mix & Master professionnel", category: "MIXING", price: 149.99, desc: "Mix et mastering complet de votre titre. Livraison sous 5 jours.", featured: true },
    { sellerIdx: 0, title: "Beat sur mesure Trap/Afro", category: "RECORDING", price: 299.99, desc: "Production exclusive adaptée à votre univers artistique.", featured: false },
    { sellerIdx: 1, title: "Production Bouyon personnalisée", category: "RECORDING", price: 199.99, desc: "Je crée votre riddim Bouyon de A à Z. Délai 7 jours.", featured: true },
    { sellerIdx: 2, title: "Écriture de paroles R&B", category: "WRITING", price: 89.99, desc: "Texte accrocheur pour votre prochain hit R&B ou Soul.", featured: false },
    { sellerIdx: 2, title: "Coaching vocal en ligne", category: "COACHING", price: 59.99, desc: "Session d'1h pour améliorer votre technique vocale.", featured: false },
    { sellerIdx: 4, title: "Jingle Lo-Fi pour podcast/stream", category: "RECORDING", price: 49.99, desc: "Jingle ou habillage sonore Lo-Fi sur mesure.", featured: true },
  ];

  for (const s of servicesData) {
    if (!sellers[s.sellerIdx]) continue;
    await prisma.service.create({
      data: {
        sellerId: sellers[s.sellerIdx].id,
        title: s.title,
        category: s.category,
        price: s.price,
        description: s.desc,
        deliveryTime: "5-7 jours",
        featured: s.featured,
        rating: +(3.8 + Math.random() * 1.2).toFixed(2),
        reviewsCount: Math.floor(Math.random() * 20 + 3),
      },
    });
  }

  console.log("💬 Création des posts forum...");

  const forumPostsData = [
    {
      authorIdx: 0,
      title: "Comment choisir sa licence Basic vs Premium ?",
      content: "Bonjour à tous, je débute sur SUMVIBES et je me demande quand il vaut mieux prendre une licence Basic plutôt que Premium. Quelqu'un peut m'expliquer les différences concrètes pour une utilisation sur YouTube ?",
      category: "Questions",
      slug: "comment-choisir-licence-basic-vs-premium",
      replies: [
        { authorIdx: 1, content: "La Basic c'est bien pour les clips perso avec moins de 5000 streams. Si tu prévois de grossir, prends directement la Premium !" },
        { authorIdx: 2, content: "Exactement, et la Premium te couvre aussi pour la radio. Très utile si tu as un réseau." },
      ],
    },
    {
      authorIdx: 1,
      title: "Le Bouyon moderne — retour aux sources ou évolution ?",
      content: "En tant que producteur Bouyon, je me pose la question : doit-on rester fidèles aux sonorités traditionnelles ou fusionner avec les tendances actuelles (Trap, Afro) ? Vos avis ?",
      category: "Production",
      slug: "bouyon-moderne-retour-sources-evolution",
      replies: [
        { authorIdx: 0, content: "Fusion totale pour moi ! Le Zouk Trap ça déchire, ça ouvre de nouveaux marchés." },
        { authorIdx: 3, content: "Les deux peuvent coexister. L'important c'est l'authenticité dans ce qu'on fait." },
      ],
    },
    {
      authorIdx: 2,
      title: "Tips pour les artistes K-Pop indépendants en France",
      content: "Je produis des sons K-Pop pour des artistes européens. Voici ce que j'ai appris : les BPM entre 120-130, les harmonies vocales à 3 voix, et surtout les breakdowns chorégraphiques. Qui d'autre travaille dans ce registre ?",
      category: "Production",
      slug: "tips-kpop-independants-france",
      replies: [
        { authorIdx: 0, content: "Super tips ! J'ai essayé de fusionner K-Pop et Afrobeat, résultat surprenant." },
      ],
    },
    {
      authorIdx: 3,
      title: "Dembow vs Reggaeton — quelle différence pour les beatmakers ?",
      content: "Beaucoup de gens confondent Dembow et Reggaeton. Techniquement, le Dembow c'est le schéma rythmique (le 'dem-bow' sur le and-3), tandis que le Reggaeton est le genre global. En tant que producteur, comment vous différenciez-vous ?",
      category: "Théorie",
      slug: "dembow-vs-reggaeton-differences-beatmakers",
      replies: [
        { authorIdx: 1, content: "Excellent point ! Le pattern Dembow est reconnaissable à la caisse claire déplacée." },
        { authorIdx: 2, content: "J'intègre souvent des éléments de Dembow dans mes productions R&B pour l'énergie." },
      ],
    },
    {
      authorIdx: 1,
      title: "Retour d'expérience : vendre des beats en ligne depuis les DOM",
      content: "Cela fait 2 ans que je vends mes productions en ligne depuis la Guadeloupe. La distance n'est plus un frein. SUMVIBES m'a permis de toucher des artistes de Paris, Lyon et même du Maroc. Partagez vos expériences !",
      category: "Business",
      slug: "retour-experience-vendre-beats-dom",
      replies: [
        { authorIdx: 0, content: "Pareil pour moi ! J'ai eu des demandes du Canada grâce à la plateforme." },
        { authorIdx: 2, content: "La messagerie intégrée est vraiment pratique pour négocier à distance." },
        { authorIdx: 3, content: "J'ai vendu une exclusive à un label parisien. Impossible sans une plateforme comme ça." },
      ],
    },
  ];

  for (const post of forumPostsData) {
    const author = post.authorIdx < sellers.length ? sellers[post.authorIdx] : buyers[post.authorIdx - sellers.length];
    if (!author) continue;
    const created = await prisma.forumPost.create({
      data: {
        authorId: author.id,
        title: post.title,
        content: post.content,
        category: post.category,
        slug: post.slug,
        status: "PUBLISHED",
        views: Math.floor(Math.random() * 500 + 50),
        likes: Math.floor(Math.random() * 30),
      },
    });
    for (const reply of post.replies) {
      const replyAuthor = reply.authorIdx < sellers.length ? sellers[reply.authorIdx] : buyers[reply.authorIdx - sellers.length];
      if (!replyAuthor) continue;
      await prisma.forumComment.create({
        data: {
          postId: created.id,
          authorId: replyAuthor.id,
          content: reply.content,
          likes: Math.floor(Math.random() * 10),
        },
      });
    }
  }

  console.log("❤️ Création des favoris...");

  const favData = [
    { buyerIdx: 0, beatIdx: 0 },
    { buyerIdx: 0, beatIdx: 5 },
    { buyerIdx: 0, beatIdx: 10 },
    { buyerIdx: 1, beatIdx: 2 },
    { buyerIdx: 1, beatIdx: 7 },
    { buyerIdx: 2, beatIdx: 18 },
    { buyerIdx: 2, beatIdx: 13 },
  ];

  for (const f of favData) {
    if (!beats[f.beatIdx] || !buyers[f.buyerIdx]) continue;
    await prisma.favorite.create({
      data: { userId: buyers[f.buyerIdx].id, beatId: beats[f.beatIdx].id },
    });
  }

  // ─── Résumé ───────────────────────────────────────────────────────────────
  console.log("\n✅ Seed terminé !\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  COMPTES DE TEST (mot de passe: Sumvibes2025!)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  ADMIN   : admin@sumvibes.fr");
  console.log("  SELLER  : djkruger@sumvibes.fr        (DJ Krüger, vérifié)");
  console.log("  SELLER  : beatsbywilo@sumvibes.fr     (Wilo Beats, vérifié)");
  console.log("  SELLER  : solange.prod@sumvibes.fr    (Solange Prod)");
  console.log("  SELLER  : dembow_reyes@sumvibes.fr    (Reyes El Productor)");
  console.log("  SELLER  : lofi_manon@sumvibes.fr      (Manon Lofi)");
  console.log("  BUYER   : artiste@sumvibes.fr         (Freemium)");
  console.log("  BUYER   : premium@sumvibes.fr         (Premium)");
  console.log("  BUYER   : standard@sumvibes.fr        (Standard)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  ${beats.length} beats · ${servicesData.length} services · ${forumPostsData.length} posts`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
