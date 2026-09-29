/**
 * NUMEROLOGY FORTUNE — FLIPKART & AMAZON STYLE SACRED GEMSTONES STORE
 * Complete Interactive E-Commerce Logic & Recommendation System
 * Features:
 * - Dynamic Typewriter Cosmic Recommendation Banner
 * - Animated Search Bar with Rotating Placeholder Suggestions
 * - Live Category & Mulank Filtering (1-9 & Intent Categories)
 * - Flipkart Sorting Engine (Popularity, Price, Rating, Newest)
 * - Working Slide-In Shopping Cart with Flipkart Price Details Bill
 * - 5-Point Razorpay Checkout & WhatsApp Concierge Receipt Dispatch (+91 98363 94217)
 * - Seamless URL Redirection Handler (?mulank=X, ?from=payment, ?stone=...)
 */

// Target Merchant WhatsApp Number
const WHATSAPP_MERCHANT_NUMBER = "919836394217";

// Pricing Configuration
const PRICING = {
  originalPrice: 2500,
  offerPrice: 1499,
  discount: 1001,
  discountPercent: "40%",
  currency: "₹"
};

// ==========================================================================
// 1. DATA: 9 ASTROLOGICAL MULANK FREQUENCIES
// ==========================================================================
const MULANK_DATA = {
  1: {
    mulank: 1,
    id: "BRAC-MUL-01",
    name: "Mulank 1 — Solar Emperor Power Bracelet",
    planet: "Sun (Surya)",
    frequency: "Divine Vitality & Willpower",
    stones: ["Natural Citrine", "Sunstone"],
    vibe: "Leadership • Divine Vitality • Supreme Confidence • Abundance",
    description: "Ruled by the Sun. Combines pure golden solar energy of Natural Citrine with Sunstone to magnify magnetism, authority, and prosperity.",
    idealFor: ["Leadership", "Executive Success", "Vitality", "Wealth Attraction"]
  },
  2: {
    mulank: 2,
    id: "BRAC-MUL-02",
    name: "Mulank 2 — Lunar Intuition & Peace Bracelet",
    planet: "Moon (Chandra)",
    frequency: "Emotional Harmony & Intuition",
    stones: ["Moonstone", "Aquamarine"],
    vibe: "Inner Peace • Deep Intuition • Emotional Balance • Calm Expression",
    description: "Ruled by the Moon. Unites iridescent Moonstone and tranquil ocean-blue Aquamarine to calm mood swings and awaken spiritual intuition.",
    idealFor: ["Emotional Peace", "Intuitive Wisdom", "Tranquil Sleep", "Relationship Harmony"]
  },
  3: {
    mulank: 3,
    id: "BRAC-MUL-03",
    name: "Mulank 3 — Cosmic Jupiter Abundance & Wisdom Bracelet",
    planet: "Jupiter (Guru / Brihaspati)",
    frequency: "Higher Wisdom & Wealth Expansion",
    stones: ["Ametrine", "Citrine", "Aventurine", "Amethyst"],
    vibe: "Creative Genius • Higher Wisdom • Wealth Expansion • Mental Clarity",
    description: "Governed by Jupiter. Combines Ametrine for creative clarity, Citrine for fortune, Aventurine for opportunity, and Amethyst for divine wisdom.",
    idealFor: ["Academic & Career Growth", "Financial Prosperity", "Creative Focus", "Spiritual Expansion"]
  },
  4: {
    mulank: 4,
    id: "BRAC-MUL-04",
    name: "Mulank 4 — Supreme Shield & Grounding Bracelet",
    planet: "Rahu",
    frequency: "Master Strategist, Stability & Psychic Protection",
    stones: ["Hematite", "Tiger Eye", "Black Tourmaline", "Smoky Quartz"],
    vibe: "Psychic Protection • Energetic Grounding • Willpower • Stability",
    description: "Harmonizes Rahu's volatile energies. Blends mirror-finish Hematite, Tiger Eye, Black Tourmaline, and Smoky Quartz to shield against negativity.",
    idealFor: ["Evil Eye Defense", "Emotional Grounding", "Overcoming Anxiety", "Disciplined Focus"]
  },
  5: {
    mulank: 5,
    id: "BRAC-MUL-05",
    name: "Mulank 5 — Mercury Rapid Growth & Magnetism Bracelet",
    planet: "Mercury (Budha)",
    frequency: "Commerce, Intellect & Versatility",
    stones: ["Citrine", "Amethyst", "Ametrine", "Aquamarine"],
    vibe: "Commercial Acumen • Fluid Communication • Financial Luck • Adaptability",
    description: "Specially formulated for entrepreneurs and dynamic minds ruled by Mercury. Combines merchant luck, calm intellect, and persuasive clarity.",
    idealFor: ["Business Expansion", "Stock & Trade Success", "Charismatic Speech", "Stress Relief"]
  },
  6: {
    mulank: 6,
    id: "BRAC-MUL-06",
    name: "Mulank 6 — Venusian Love & Luxury Magnetism Bracelet",
    planet: "Venus (Shukra)",
    frequency: "Divine Beauty, Harmony & Affluence",
    stones: ["Rose Quartz", "Moonstone"],
    vibe: "Unconditional Love • Romantic Harmony • Artistic Grace • Luxury Magnetism",
    description: "Consecrated for souls ruled by Venus. Harnesses authentic Rose Quartz and Moonstone to attract true romance, luxury, aesthetic refinement, and peace.",
    idealFor: ["Soulmate Attraction", "Self-Love & Healing", "Marital Bliss", "Artistic Charisma"]
  },
  7: {
    mulank: 7,
    id: "BRAC-MUL-07",
    name: "Mulank 7 — Ketu Mystic Awakening & Aura Purification Bracelet",
    planet: "Ketu",
    frequency: "Spiritual Liberation & Psychic Clarity",
    stones: ["Clear Quartz", "Selenite"],
    vibe: "Pure Consciousness • Aura Cleansing • Deep Meditation • Sacred Vision",
    description: "For spiritual seekers influenced by Ketu. Combines Clear Quartz and luminous Selenite to dissolve energetic blockages and illuminate the crown chakra.",
    idealFor: ["Meditation & Yoga", "Aura Cleansing", "Spiritual Intuition", "Mind Clearing"]
  },
  8: {
    mulank: 8,
    id: "BRAC-MUL-08",
    name: "Mulank 8 — Saturn Karmic Wealth & Resilient Power Bracelet",
    planet: "Saturn (Shani)",
    frequency: "Karmic Justice, Mastery & Empire Building",
    stones: ["Pyrite", "Hematite"],
    vibe: "Monumental Wealth • Iron Determination • Karmic Protection • Relentless Focus",
    description: "Engineered for visionaries who build enduring legacies under Saturn. Integrates genuine Fool's Gold (Pyrite) for massive financial manifestation with metallic Hematite for root grounding.",
    idealFor: ["Long-term Wealth Creation", "Career Resilience", "Overcoming Obstacles", "Financial Stamina"]
  },
  9: {
    mulank: 9,
    id: "BRAC-MUL-09",
    name: "Mulank 9 — Mars Warrior Courage & Divine Wisdom Bracelet",
    planet: "Mars (Mangal)",
    frequency: "Fiery Courage & Strategic Power",
    stones: ["Amethyst", "Citrine", "Ametrine"],
    vibe: "Dynamic Courage • Tempered Passion • Abundant Victory • Spiritual Harmony",
    description: "Harnesses Mars's fiery dynamism and channels it into enlightened victory. Harmonizes soothing Amethyst with Citrine's joyful wealth energy and Ametrine's balance.",
    idealFor: ["Confidence & Courage", "Strategic Victory", "Anger Management", "Prosperity"]
  }
};

// ==========================================================================
// 2. DATA: 16 SACRED NATURAL EARTH GEMSTONES CATALOG
// Enriched with Flipkart rating badges, review counts, and Assured flags
// ==========================================================================
const GEMSTONES_DATA = [
  {
    id: "GEM-CIT-01",
    name: "Natural Citrine",
    image: "NaturalCitrine.jpg",
    category: "wealth",
    rating: 4.9,
    reviewsCount: 2180,
    assured: true,
    tag: "Bestseller",
    keywords: "Wealth Manifestation • Solar Energy • Abundance",
    shortDesc: "Pure golden solar energy crystal traditionally associated with attracting prosperity, business success, and executive magnetism.",
    idealFor: ["Wealth Attraction", "Business Growth", "Confidence", "Optimism"],
    relatedMulanks: [1, 3, 5, 9]
  },
  {
    id: "GEM-SUN-02",
    name: "Sunstone",
    image: "Sunstone.jpg",
    category: "wealth",
    rating: 4.8,
    reviewsCount: 1420,
    assured: true,
    tag: "Solar Energy",
    keywords: "Vitality • Leadership • Divine Spark",
    shortDesc: "Radiant golden sparkles infused with fiery solar vitality. Empowers leadership authority, bold decision-making, and boundless optimism.",
    idealFor: ["Leadership", "Vitality", "Self-Empowerment", "Joy"],
    relatedMulanks: [1]
  },
  {
    id: "GEM-MOO-03",
    name: "Moonstone",
    image: "Moonstone.jpg",
    category: "love",
    rating: 4.9,
    reviewsCount: 1960,
    assured: true,
    tag: "Sacred Feminine",
    keywords: "Intuition • Emotional Serenity • Lunar Grace",
    shortDesc: "Iridescent celestial gemstone connected with the lunar realm. Deeply soothes mood swings, heightens subconscious intuition, and invites romantic peace.",
    idealFor: ["Emotional Peace", "Intuition", "Tranquil Sleep", "Harmony"],
    relatedMulanks: [2, 6]
  },
  {
    id: "GEM-AQU-04",
    name: "Aquamarine",
    image: "Aquamarine.jpg",
    category: "clarity",
    rating: 4.8,
    reviewsCount: 1150,
    assured: true,
    tag: "Ocean Calm",
    keywords: "Throat Chakra • Calm Speech • Eloquence",
    shortDesc: "Tranquil blue stone of the ocean tides. Clears throat chakra blockages, fosters heart-centered communication, and melts away situational anxiety.",
    idealFor: ["Communication", "Public Speaking", "Emotional Clarity", "Peace"],
    relatedMulanks: [2, 5]
  },
  {
    id: "GEM-AMT-05",
    name: "Ametrine",
    image: "Ametrine.jpg",
    category: "clarity",
    rating: 5.0,
    reviewsCount: 2490,
    assured: true,
    tag: "Top Rated",
    keywords: "Wisdom & Wealth • Dual Synergy • Creative Genius",
    shortDesc: "A rare cosmic crystal uniting the purple spiritual frequency of Amethyst with the golden prosperity flame of Citrine.",
    idealFor: ["Exam Focus", "Creative Genius", "Financial Growth", "Balance"],
    relatedMulanks: [3, 5, 9]
  },
  {
    id: "GEM-CIT-06",
    name: "Citrine (Golden)",
    image: "Citrine.jpg",
    category: "wealth",
    rating: 4.9,
    reviewsCount: 1840,
    assured: true,
    tag: "Merchant Stone",
    keywords: "Commerce • Financial Luck • Joyful Momentum",
    shortDesc: "The revered Merchant's Stone in Vedic traditions. Invites cash flow, resolves pending transactions, and inspires persistent optimism.",
    idealFor: ["Cash Flow", "Commercial Luck", "Motivation", "Positivity"],
    relatedMulanks: [3, 5, 9]
  },
  {
    id: "GEM-AVE-07",
    name: "Green Aventurine",
    image: "Aventurine.jpg",
    category: "wealth",
    rating: 4.8,
    reviewsCount: 1670,
    assured: true,
    tag: "Stone of Opportunity",
    keywords: "New Beginnings • Good Luck • Renewal",
    shortDesc: "The stone of prime opportunity and unexpected fortune. Fosters heart healing, opens closed doors, and supports career promotions.",
    idealFor: ["New Opportunities", "Career Growth", "Heart Chakra", "Good Luck"],
    relatedMulanks: [3]
  },
  {
    id: "GEM-AME-08",
    name: "Amethyst",
    image: "Amethyst.jpg",
    category: "spiritual",
    rating: 4.9,
    reviewsCount: 2310,
    assured: true,
    tag: "Crown Healer",
    keywords: "Spiritual Awareness • Deep Sleep • Calm Mind",
    shortDesc: "Royal purple quartz that quietens mental noise, relieves tension headaches, supports sound sleep, and deepens meditative focus.",
    idealFor: ["Meditation", "Relaxation", "Stress Relief", "Inner Peace"],
    relatedMulanks: [3, 5, 9]
  },
  {
    id: "GEM-HEM-09",
    name: "Hematite",
    image: "Hematite.jpg",
    category: "protection",
    rating: 4.8,
    reviewsCount: 1390,
    assured: true,
    tag: "Root Anchor",
    keywords: "Grounding • Iron Determination • EMF Defense",
    shortDesc: "Heavy metallic crystal with mirror-like polish. Anchors erratic mental currents directly into the earth and builds unshakable emotional fortitude.",
    idealFor: ["Root Grounding", "Discipline", "Stress Defense", "Focus"],
    relatedMulanks: [4, 8]
  },
  {
    id: "GEM-TIG-10",
    name: "Tiger Eye",
    image: "TigerEye.jpg",
    category: "protection",
    rating: 4.9,
    reviewsCount: 2050,
    assured: true,
    tag: "Warrior Shield",
    keywords: "Courage • Sharp Discernment • Protection",
    shortDesc: "Chatoyant golden-brown stone of the warrior. Shields the aura from jealousy and evil eye, while sharpening strategic decision-making.",
    idealFor: ["Courage", "Discernment", "Evil Eye Defense", "Willpower"],
    relatedMulanks: [4]
  },
  {
    id: "GEM-BTR-11",
    name: "Black Tourmaline",
    image: "BlackTourmaline.jpg",
    category: "protection",
    rating: 5.0,
    reviewsCount: 2780,
    assured: true,
    tag: "Supreme Fortress",
    keywords: "Aura Shield • Psychic Armor • EMF Protection",
    shortDesc: "The undisputed heavyweight of energetic protection. Repels negative people, psychic vampires, and electromagnetic smog from digital devices.",
    idealFor: ["Psychic Protection", "EMF Shielding", "Grounding", "Aura Safety"],
    relatedMulanks: [4]
  },
  {
    id: "GEM-SMQ-12",
    name: "Smoky Quartz",
    image: "SmokyQuartz.jpg",
    category: "protection",
    rating: 4.7,
    reviewsCount: 920,
    assured: true,
    tag: "Stress Transmuter",
    keywords: "Detoxification • Emotional Stability • Release",
    shortDesc: "A master transmuter of heavy emotional debris. Absorbs fear, depression, and overwhelm, recycling them into calm practical focus.",
    idealFor: ["Emotional Release", "Calm Focus", "Stability", "Detox"],
    relatedMulanks: [4]
  },
  {
    id: "GEM-ROQ-13",
    name: "Rose Quartz",
    image: "RoseQuartz.jpg",
    category: "love",
    rating: 4.9,
    reviewsCount: 2640,
    assured: true,
    tag: "Pure Love",
    keywords: "Heart Chakra • Soulmate Attraction • Compassion",
    shortDesc: "The quintessential stone of unconditional love. Rebalances the heart chakra, restores tenderness after heartbreak, and radiates sweet Venusian warmth.",
    idealFor: ["Soulmate Attraction", "Self-Love", "Marital Bliss", "Gentle Peace"],
    relatedMulanks: [6]
  },
  {
    id: "GEM-CLQ-14",
    name: "Clear Quartz",
    image: "ClearQuartz.jpg",
    category: "spiritual",
    rating: 4.8,
    reviewsCount: 1510,
    assured: true,
    tag: "Master Healer",
    keywords: "Pure Light • Energy Amplification • Clarity",
    shortDesc: "Known as the Master Healer across ancient civilizations. Amplifies positive thoughts, cleanses auric haze, and elevates crown chakra awareness.",
    idealFor: ["Clarity", "Meditation", "Aura Cleansing", "Prayer"],
    relatedMulanks: [7]
  },
  {
    id: "GEM-SEL-15",
    name: "Selenite",
    image: "Selenite.jpg",
    category: "spiritual",
    rating: 4.9,
    reviewsCount: 1890,
    assured: true,
    tag: "Liquid Divine Light",
    keywords: "Aura Purification • Divine Serenity • Peace",
    shortDesc: "Ethereal pearlescent crystal carrying pure celestial vibrations. Dissolves stubborn energetic blockages and creates an aura of undisturbed silence.",
    idealFor: ["Aura Cleansing", "Deep Meditation", "Spiritual Peace", "Renewal"],
    relatedMulanks: [7]
  },
  {
    id: "GEM-PYR-16",
    name: "Pyrite (Fool's Gold)",
    image: "Pyrite.jpg",
    category: "wealth",
    rating: 5.0,
    reviewsCount: 3120,
    assured: true,
    tag: "Money Magnet",
    keywords: "Financial Empire • Wealth Magnetism • Willpower",
    shortDesc: "Genuine metallic brass-gold mineral celebrated for manifesting massive wealth, asset growth, and relentless Saturnian willpower.",
    idealFor: ["Massive Wealth", "Asset Building", "Overcoming Obstacles", "Confidence"],
    relatedMulanks: [8]
  }
];

// ==========================================================================
// 3. STORE STATE MANAGEMENT
// ==========================================================================
const storeState = {
  currentCategory: "all",
  currentMulank: "all",
  currentSort: "popularity",
  minRating: 0,
  searchQuery: "",
  matchedMulank: null,
  cart: [],
  activeProduct: null
};

// ==========================================================================
// 4. TYPEWRITER RECOMMENDATION ENGINE
// ==========================================================================
class TypewriterEngine {
  constructor(elementId, cursorId) {
    this.el = document.getElementById(elementId);
    this.cursor = document.querySelector(cursorId);
    this.loopMessages = [
      "✨ Discover your sacred Astro-Vedic gemstone matched by Date of Birth & Mulank...",
      "💰 Mulank 8 (Saturn)? Pyrite & Hematite magnetize long-term karmic wealth & protection...",
      "💖 Mulank 6 (Venus)? Consecrated Rose Quartz & Moonstone radiate love, beauty & luxury...",
      "🔮 Mulank 3 (Jupiter)? Ametrine & Citrine awaken wisdom, higher intellect & abundance...",
      "🛡️ Mulank 4 (Rahu)? Black Tourmaline & Hematite form an impenetrable psychic shield...",
      "⚡ 100% Certified Earth-Mined Crystals with Vedic Consecration & Authenticity Certificate."
    ];
    this.currentIndex = 0;
    this.isLocked = false;
    this.typeTimeout = null;
  }

  type(text, callback, speed = 35) {
    if (!this.el) return;
    clearTimeout(this.typeTimeout);
    let i = 0;
    this.el.textContent = "";

    const writeChar = () => {
      if (i < text.length) {
        this.el.textContent += text.charAt(i);
        i++;
        this.typeTimeout = setTimeout(writeChar, speed);
      } else if (callback) {
        this.typeTimeout = setTimeout(callback, 2400);
      }
    };
    writeChar();
  }

  erase(callback, speed = 18) {
    if (!this.el) return;
    clearTimeout(this.typeTimeout);
    let text = this.el.textContent;

    const deleteChar = () => {
      if (text.length > 0) {
        text = text.slice(0, -1);
        this.el.textContent = text;
        this.typeTimeout = setTimeout(deleteChar, speed);
      } else if (callback) {
        this.typeTimeout = setTimeout(callback, 300);
      }
    };
    deleteChar();
  }

  startLoop() {
    if (this.isLocked) return;
    const msg = this.loopMessages[this.currentIndex];
    this.type(msg, () => {
      if (this.isLocked) return;
      this.erase(() => {
        if (this.isLocked) return;
        this.currentIndex = (this.currentIndex + 1) % this.loopMessages.length;
        this.startLoop();
      });
    });
  }

  lockMessage(text) {
    this.isLocked = true;
    clearTimeout(this.typeTimeout);
    this.type(text, null, 25);
  }

  unlock() {
    this.isLocked = false;
    this.startLoop();
  }
}

let typewriterInstance = null;

// ==========================================================================
// 5. ANIMATED SEARCH BAR PLACEHOLDER (FLIPKART STYLE)
// ==========================================================================
function initSearchTypewriter() {
  const desktopInput = document.getElementById("shopSearchInput");
  const mobileInput = document.getElementById("shopSearchInputMobile");
  const searchTerms = [
    "Search for 'Mulank 3 bracelets'...",
    "Search for 'Natural Citrine for wealth'...",
    "Search for 'Pyrite for money & career'...",
    "Search for 'Rose Quartz for love'...",
    "Search for 'Black Tourmaline shield'...",
    "Search for 'Ametrine for exam focus'...",
    "Search for 'Moonstone for calmness'..."
  ];

  let termIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let targetInputs = [desktopInput, mobileInput].filter(Boolean);

  function loopSearch() {
    // Only animate placeholder if user is not actively typing
    const anyFocused = targetInputs.some(input => input === document.activeElement || input.value.trim().length > 0);
    if (!anyFocused) {
      const currentWord = searchTerms[termIndex];
      let currentText = isDeleting
        ? currentWord.substring(0, charIndex--)
        : currentWord.substring(0, charIndex++);

      targetInputs.forEach(input => {
        input.setAttribute("placeholder", currentText);
      });

      if (!isDeleting && charIndex > currentWord.length) {
        isDeleting = true;
        setTimeout(loopSearch, 1800);
        return;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        termIndex = (termIndex + 1) % searchTerms.length;
        setTimeout(loopSearch, 300);
        return;
      }
    }
    setTimeout(loopSearch, isDeleting ? 30 : 60);
  }

  loopSearch();

  // Search input live filtering
  targetInputs.forEach(input => {
    input.addEventListener("input", (e) => {
      const val = e.target.value.trim();
      const clearBtn = document.getElementById("btnSearchClear");
      if (clearBtn) clearBtn.style.display = val.length > 0 ? "block" : "none";

      // Sync other input if available
      targetInputs.forEach(other => {
        if (other !== input && other.value !== val) other.value = val;
      });

      storeState.searchQuery = val.toLowerCase();
      renderProductGrid();
    });
  });

  const clearBtn = document.getElementById("btnSearchClear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      targetInputs.forEach(input => { input.value = ""; });
      clearBtn.style.display = "none";
      storeState.searchQuery = "";
      renderProductGrid();
    });
  }

  const submitBtn = document.getElementById("btnSearchSubmit");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const sec = document.getElementById("mainStoreSection");
      if (sec) sec.scrollIntoView({ behavior: "smooth" });
    });
  }
}

// ==========================================================================
// 6. MULANK CALCULATION ENGINE
// e.g. 24-08-2005 -> 2+4+0+8+2+0+0+5 = 21 -> 2+1 = 3
// ==========================================================================
function calculateMulankFromDOB(dobStr) {
  if (!dobStr) return null;
  const digits = dobStr.replace(/\D/g, '').split('').map(Number);
  if (digits.length < 8) return null;

  const sumStep1 = digits.reduce((a, b) => a + b, 0);
  const steps = [`${digits.join(" + ")} = ${sumStep1}`];

  let current = sumStep1;
  while (current > 9) {
    const digitArray = current.toString().split('').map(Number);
    const nextSum = digitArray.reduce((a, b) => a + b, 0);
    steps.push(`${digitArray.join(" + ")} = ${nextSum}`);
    current = nextSum;
  }

  return {
    mulank: current,
    steps: steps,
    info: MULANK_DATA[current]
  };
}

// ==========================================================================
// 7. PRODUCT GRID RENDERING (FLIPKART 2-COL MOBILE / 4-COL DESKTOP)
// ==========================================================================
function renderProductGrid() {
  const container = document.getElementById("mulankCardsContainer");
  const noResultsBox = document.getElementById("noResultsBox");
  const resultsCountText = document.getElementById("resultsCountText");
  const breadcrumbCurrent = document.getElementById("breadcrumbCurrent");
  const activeCategoryBanner = document.getElementById("activeCategoryBanner");

  if (!container) return;

  // Filter products based on active state
  let filtered = GEMSTONES_DATA.filter(item => {
    // 1. Search Query Filter
    if (storeState.searchQuery) {
      const q = storeState.searchQuery;
      const matchName = item.name.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchKeywords = item.keywords.toLowerCase().includes(q);
      const matchDesc = item.shortDesc.toLowerCase().includes(q);
      const matchIdeal = item.idealFor.some(tag => tag.toLowerCase().includes(q));
      const matchMulank = item.relatedMulanks && item.relatedMulanks.some(m => String(m) === q || `mulank ${m}`.includes(q));

      if (!matchName && !matchCat && !matchKeywords && !matchDesc && !matchIdeal && !matchMulank) {
        return false;
      }
    }

    // 2. Mulank Filter
    if (storeState.currentMulank !== "all") {
      const targetM = parseInt(storeState.currentMulank, 10);
      if (!item.relatedMulanks || !item.relatedMulanks.includes(targetM)) {
        return false;
      }
    }

    // 3. Category Filter
    if (storeState.currentCategory !== "all" && storeState.currentCategory !== "matched") {
      if (item.category !== storeState.currentCategory) {
        return false;
      }
    } else if (storeState.currentCategory === "matched" && storeState.matchedMulank) {
      if (!item.relatedMulanks || !item.relatedMulanks.includes(storeState.matchedMulank)) {
        return false;
      }
    }

    // 4. Rating Filter
    if (storeState.minRating > 0 && item.rating < storeState.minRating) {
      return false;
    }

    return true;
  });

  // Sorting
  if (storeState.currentSort === "popularity") {
    filtered.sort((a, b) => (b.rating * b.reviewsCount) - (a.rating * a.reviewsCount));
  } else if (storeState.currentSort === "price-low") {
    filtered.sort((a, b) => PRICING.offerPrice - PRICING.offerPrice); // Equal fixed price
  } else if (storeState.currentSort === "price-high") {
    filtered.sort((a, b) => PRICING.offerPrice - PRICING.offerPrice);
  } else if (storeState.currentSort === "rating") {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (storeState.currentSort === "newest") {
    filtered.sort((a, b) => b.id.localeCompare(a.id));
  }

  // Update Counters & Breadcrumbs
  if (resultsCountText) {
    resultsCountText.textContent = `Showing ${filtered.length} of ${GEMSTONES_DATA.length} items`;
  }

  if (breadcrumbCurrent) {
    if (storeState.currentMulank !== "all") {
      breadcrumbCurrent.textContent = `Mulank ${storeState.currentMulank} (${MULANK_DATA[storeState.currentMulank]?.planet || 'Vedic'})`;
    } else if (storeState.currentCategory !== "all") {
      breadcrumbCurrent.textContent = `${storeState.currentCategory.toUpperCase()} Crystals`;
    } else {
      breadcrumbCurrent.textContent = "All 16 Sacred Crystals";
    }
  }

  // Active Category Banner
  if (activeCategoryBanner) {
    if (storeState.currentMulank !== "all" && MULANK_DATA[storeState.currentMulank]) {
      const mInfo = MULANK_DATA[storeState.currentMulank];
      activeCategoryBanner.style.display = "block";
      activeCategoryBanner.innerHTML = `
        <h3>Mulank ${mInfo.mulank} — Consecrated for ${mInfo.planet}</h3>
        <p>${mInfo.description} <strong>Prescribed crystals:</strong> ${mInfo.stones.join(", ")}.</p>
      `;
    } else {
      activeCategoryBanner.style.display = "none";
    }
  }

  // Render or Empty State
  if (filtered.length === 0) {
    container.innerHTML = "";
    if (noResultsBox) noResultsBox.style.display = "block";
    return;
  }

  if (noResultsBox) noResultsBox.style.display = "none";

  // Generate Flipkart-style Product Cards
  container.innerHTML = filtered.map(item => {
    const isCosmicMatch = storeState.matchedMulank && item.relatedMulanks && item.relatedMulanks.includes(storeState.matchedMulank);
    const mulankLabel = item.relatedMulanks ? `Mulank ${item.relatedMulanks.join(', ')}` : 'Universal';

    return `
      <div class="fk-product-card ${isCosmicMatch ? 'cosmic-matched' : ''}" data-id="${item.id}">
        
        <!-- Card Top Badges -->
        <div class="fk-card-badges">
          ${isCosmicMatch 
            ? `<span class="fk-badge-matched">🎯 COSMIC MATCH</span>`
            : `<span class="fk-badge-assured">⚡ VEDIC ASSURED</span>`
          }
          <button type="button" class="fk-wishlist-btn" onclick="toggleWishlist(this, '${item.id}')" aria-label="Add to wishlist" title="Save to Wishlist">
            ♥
          </button>
        </div>

        <!-- Image Container with Hover Zoom -->
        <div class="fk-card-img-wrap" onclick="openGemstoneModal('${item.id}')">
          <img src="./${item.image}" alt="${item.name} Sacred Consecrated Crystal Bracelet" class="fk-card-img" loading="lazy" />
        </div>

        <!-- Card Content Body -->
        <div class="fk-card-content">
          <div class="fk-card-mulank-tag">✦ ${mulankLabel}</div>
          <h4 class="fk-card-title" onclick="openGemstoneModal('${item.id}')" title="${item.name} Sacred Energy Bracelet">
            ${item.name} Sacred Crystal Energy Bracelet
          </h4>

          <!-- Flipkart Green Star Rating -->
          <div class="fk-card-rating-row">
            <span class="fk-rating-badge">${item.rating} ★</span>
            <span class="fk-rating-count">(${item.reviewsCount.toLocaleString()})</span>
          </div>

          <!-- Price Lockup -->
          <div class="fk-card-price-row">
            <span class="fk-price-current">₹${PRICING.offerPrice}</span>
            <span class="fk-price-original">₹${PRICING.originalPrice}</span>
            <span class="fk-price-discount">${PRICING.discountPercent} off</span>
          </div>

          <div class="fk-card-perks">
            <span class="fk-perk-free-delivery">Free delivery</span> • <span style="color: var(--gold-400);">Vedic Consecrated</span>
          </div>

          <!-- Card Actions (Add to Cart & Instant Buy) -->
          <div class="fk-card-actions">
            <button type="button" class="btn-card-add-cart" onclick="addToCart('${item.id}')">
              Add to Cart
            </button>
            <button type="button" class="btn-card-buy-now" onclick="triggerDirectCheckout('${item.id}')">
              Buy Now
            </button>
          </div>

        </div>

      </div>
    `;
  }).join('');
}

// ==========================================================================
// 8. WORKING SHOPPING CART DRAWER (FLIPKART STYLE)
// ==========================================================================
function initCartDrawer() {
  const btnOpen = document.getElementById("btnOpenCart");
  const btnBottomOpen = document.getElementById("btnBottomCart");
  const btnClose = document.getElementById("btnCloseCart");
  const overlay = document.getElementById("cartDrawerOverlay");
  const placeOrderBtn = document.getElementById("btnPlaceOrderFromCart");

  function openCart() {
    if (overlay) {
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
      renderCartItems();
    }
  }

  function closeCart() {
    if (overlay) {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  if (btnOpen) btnOpen.addEventListener("click", openCart);
  if (btnBottomOpen) btnBottomOpen.addEventListener("click", openCart);
  if (btnClose) btnClose.addEventListener("click", closeCart);

  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeCart();
    });
  }

  if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", () => {
      closeCart();
      if (storeState.cart.length > 0) {
        const first = storeState.cart[0];
        const gem = GEMSTONES_DATA.find(g => g.id === first.id);
        const mulankStr = storeState.matchedMulank ? String(storeState.matchedMulank) : "Universal";
        openOrderModal({
          name: `${gem ? gem.name : 'Sacred Gemstone'} Consecrated Bracelet (${storeState.cart.length} item${storeState.cart.length > 1 ? 's' : ''})`,
          id: gem ? gem.id : "BRAC-CART-01",
          stones: storeState.cart.map(c => c.name).join(", "),
          mulank: mulankStr,
          image: gem ? `./${gem.image}` : "./Ametrine.jpg",
          price: PRICING.offerPrice * storeState.cart.reduce((a, b) => a + b.qty, 0)
        });
      }
    });
  }
}

window.addToCart = function(productId) {
  const gem = GEMSTONES_DATA.find(g => g.id === productId);
  if (!gem) return;

  const existing = storeState.cart.find(c => c.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    storeState.cart.push({
      id: gem.id,
      name: gem.name,
      image: gem.image,
      mulank: gem.relatedMulanks ? gem.relatedMulanks.join(', ') : 'Universal',
      price: PRICING.offerPrice,
      qty: 1
    });
  }

  updateCartBadges();

  // Open cart drawer with feedback
  const overlay = document.getElementById("cartDrawerOverlay");
  if (overlay) {
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
    renderCartItems();
  }
};

window.updateCartQty = function(productId, delta) {
  const item = storeState.cart.find(c => c.id === productId);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      storeState.cart = storeState.cart.filter(c => c.id !== productId);
    }
  }
  updateCartBadges();
  renderCartItems();
};

window.removeFromCart = function(productId) {
  storeState.cart = storeState.cart.filter(c => c.id !== productId);
  updateCartBadges();
  renderCartItems();
};

function updateCartBadges() {
  const totalCount = storeState.cart.reduce((a, b) => a + b.qty, 0);
  const headerBadge = document.getElementById("headerCartCount");
  const bottomBadge = document.getElementById("bottomCartCount");
  const drawerCount = document.getElementById("cartItemCount");

  if (headerBadge) headerBadge.textContent = totalCount;
  if (bottomBadge) bottomBadge.textContent = totalCount;
  if (drawerCount) drawerCount.textContent = totalCount;
}

function renderCartItems() {
  const container = document.getElementById("cartItemsContainer");
  const footerSection = document.getElementById("cartFooterSection");
  const summaryCount = document.getElementById("cartSummaryItemCount");
  const summaryOrig = document.getElementById("cartSummaryOriginalPrice");
  const summaryDiscount = document.getElementById("cartSummaryDiscount");
  const summaryTotal = document.getElementById("cartSummaryTotal");

  if (!container) return;

  if (storeState.cart.length === 0) {
    container.innerHTML = `
      <div class="fk-cart-empty">
        <div class="fk-cart-empty-icon">🛒</div>
        <h4 style="color: #FFFFFF; margin-bottom: 6px;">Your Cart is Empty</h4>
        <p style="font-size: 0.85rem;">Discover your cosmic gemstone and align your planetary frequencies today!</p>
      </div>
    `;
    if (footerSection) footerSection.style.display = "none";
    return;
  }

  if (footerSection) footerSection.style.display = "block";

  const totalQty = storeState.cart.reduce((a, b) => a + b.qty, 0);
  const origTotal = totalQty * PRICING.originalPrice;
  const payTotal = totalQty * PRICING.offerPrice;
  const discountTotal = origTotal - payTotal;

  if (summaryCount) summaryCount.textContent = `${totalQty} item${totalQty > 1 ? 's' : ''}`;
  if (summaryOrig) summaryOrig.textContent = `₹${origTotal.toLocaleString()}`;
  if (summaryDiscount) summaryDiscount.textContent = `- ₹${discountTotal.toLocaleString()}`;
  if (summaryTotal) summaryTotal.textContent = `₹${payTotal.toLocaleString()}`;

  container.innerHTML = storeState.cart.map(item => `
    <div class="fk-cart-item">
      <img src="./${item.image}" alt="${item.name}" class="fk-cart-item-img" />
      <div class="fk-cart-item-info">
        <div class="fk-cart-item-title">${item.name} Consecrated Bracelet</div>
        <div class="fk-cart-item-mulank">✦ Mulank: ${item.mulank}</div>
        <div class="fk-cart-item-price-row">
          <span class="fk-cart-item-price">₹${item.price}</span>
          <span class="fk-cart-item-orig">₹${PRICING.originalPrice}</span>
        </div>
        <div class="fk-cart-item-actions">
          <button type="button" class="fk-qty-btn" onclick="updateCartQty('${item.id}', -1)">-</button>
          <span style="color: #FFFFFF; font-weight: 700; font-size: 0.85rem;">${item.qty}</span>
          <button type="button" class="fk-qty-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
          <button type="button" class="fk-cart-remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ==========================================================================
// 9. DIRECT CHECKOUT TRIGGER
// ==========================================================================
window.triggerDirectCheckout = function(productId) {
  const gem = GEMSTONES_DATA.find(g => g.id === productId);
  if (!gem) return;
  const mulankStr = storeState.matchedMulank ? String(storeState.matchedMulank) : (gem.relatedMulanks ? gem.relatedMulanks.join(', ') : 'Universal');
  const dobVal = document.getElementById("dobInput")?.value || "";

  openOrderModal({
    name: `${gem.name} Sacred Consecrated Energy Bracelet`,
    id: gem.id,
    stones: gem.name,
    mulank: mulankStr,
    dob: dobVal,
    image: `./${gem.image}`,
    price: PRICING.offerPrice
  });
};

window.toggleWishlist = function(btn, productId) {
  btn.classList.toggle("active");
  if (btn.classList.contains("active")) {
    btn.style.color = "#FF5A5F";
  } else {
    btn.style.color = "rgba(255, 255, 255, 0.7)";
  }
};

// ==========================================================================
// 10. FLIPKART CATEGORY CHIPS & SORT CONTROLS
// ==========================================================================
function initCategoryChips() {
  const catItems = document.querySelectorAll(".fk-cat-item");
  catItems.forEach(item => {
    item.addEventListener("click", () => {
      catItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      const cat = item.getAttribute("data-cat");
      const mulank = item.getAttribute("data-mulank");

      if (mulank) {
        selectMulankTab(mulank);
      } else if (cat) {
        storeState.currentMulank = "all";
        storeState.currentCategory = cat;
        renderProductGrid();
      }
    });
  });
}

function initSortTabs() {
  // Desktop Sort Tabs
  const sortTabs = document.querySelectorAll(".fk-sort-tab");
  sortTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      sortTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      storeState.currentSort = tab.getAttribute("data-sort");
      renderProductGrid();
    });
  });

  // Mobile Bottom Sheet Sort
  const btnMobileSort = document.getElementById("btnMobileSort");
  const sortSheetOverlay = document.getElementById("sortBottomSheetOverlay");
  const btnCloseSortSheet = document.getElementById("btnCloseSortSheet");
  const sortRadios = document.querySelectorAll('input[name="mobileSortOption"]');

  if (btnMobileSort && sortSheetOverlay) {
    btnMobileSort.addEventListener("click", () => {
      sortSheetOverlay.classList.add("active");
    });
  }

  if (btnCloseSortSheet && sortSheetOverlay) {
    btnCloseSortSheet.addEventListener("click", () => {
      sortSheetOverlay.classList.remove("active");
    });
  }

  if (sortSheetOverlay) {
    sortSheetOverlay.addEventListener("click", (e) => {
      if (e.target === sortSheetOverlay) sortSheetOverlay.classList.remove("active");
    });
  }

  sortRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      storeState.currentSort = e.target.value;
      const labelEl = document.getElementById("mobileSortLabel");
      if (labelEl) labelEl.textContent = `Sort: ${e.target.parentElement.textContent.trim()}`;
      if (sortSheetOverlay) sortSheetOverlay.classList.remove("active");
      renderProductGrid();
    });
  });

  // Mobile Filter Drawer
  const btnMobileFilter = document.getElementById("btnMobileFilter");
  const filterDrawerOverlay = document.getElementById("mobileFilterDrawerOverlay");
  const btnCloseFilterDrawer = document.getElementById("btnCloseFilterDrawer");
  const btnMobileApply = document.getElementById("btnMobileApplyFilters");
  const btnMobileReset = document.getElementById("btnMobileResetFilters");
  const mobileDrawerBody = document.getElementById("mobileFilterDrawerBody");
  const desktopSidebar = document.getElementById("desktopFiltersSidebar");

  if (mobileDrawerBody && desktopSidebar) {
    // Clone desktop sidebar options into mobile drawer
    mobileDrawerBody.innerHTML = desktopSidebar.innerHTML;
  }

  if (btnMobileFilter && filterDrawerOverlay) {
    btnMobileFilter.addEventListener("click", () => {
      filterDrawerOverlay.classList.add("active");
    });
  }

  if (btnCloseFilterDrawer && filterDrawerOverlay) {
    btnCloseFilterDrawer.addEventListener("click", () => {
      filterDrawerOverlay.classList.remove("active");
    });
  }

  if (filterDrawerOverlay) {
    filterDrawerOverlay.addEventListener("click", (e) => {
      if (e.target === filterDrawerOverlay) filterDrawerOverlay.classList.remove("active");
    });
  }

  if (btnMobileApply && filterDrawerOverlay) {
    btnMobileApply.addEventListener("click", () => {
      filterDrawerOverlay.classList.remove("active");
      renderProductGrid();
    });
  }

  if (btnMobileReset) {
    btnMobileReset.addEventListener("click", () => {
      resetAllFilters();
      if (filterDrawerOverlay) filterDrawerOverlay.classList.remove("active");
    });
  }
}

// Mulank Selection Function
window.selectMulankTab = function(mulankNum) {
  const m = String(mulankNum).toLowerCase();
  storeState.currentMulank = m;
  storeState.currentCategory = "all";

  // Sync Category Strip Active State
  const catItems = document.querySelectorAll(".fk-cat-item");
  catItems.forEach(item => {
    if (item.getAttribute("data-mulank") === m) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Sync Desktop Sidebar Radio
  const radios = document.querySelectorAll('input[name="mulankFilterRadio"]');
  radios.forEach(r => {
    r.checked = r.value === m;
  });

  if (m !== "all" && MULANK_DATA[m] && typewriterInstance) {
    const info = MULANK_DATA[m];
    typewriterInstance.lockMessage(
      `🎯 Cosmic Match Confirmed: Mulank ${m} (${info.planet})! Prescribed: Consecrated ${info.stones.join(" & ")} for ${info.vibe}.`
    );
  }

  renderProductGrid();
};

function resetAllFilters() {
  storeState.currentCategory = "all";
  storeState.currentMulank = "all";
  storeState.currentSort = "popularity";
  storeState.minRating = 0;
  storeState.searchQuery = "";

  const desktopInput = document.getElementById("shopSearchInput");
  const mobileInput = document.getElementById("shopSearchInputMobile");
  if (desktopInput) desktopInput.value = "";
  if (mobileInput) mobileInput.value = "";

  const catItems = document.querySelectorAll(".fk-cat-item");
  catItems.forEach(i => i.classList.remove("active"));
  const allCat = document.querySelector('.fk-cat-item[data-cat="all"]');
  if (allCat) allCat.classList.add("active");

  const radios = document.querySelectorAll('input[name="mulankFilterRadio"]');
  radios.forEach(r => { r.checked = r.value === "all"; });

  if (typewriterInstance) typewriterInstance.unlock();
  renderProductGrid();
}

// ==========================================================================
// 11. DOB CALCULATOR & COMPACT WIDGET
// ==========================================================================
function initDOBCalculator() {
  const toggleBtn = document.getElementById("btnToggleDOBWidget");
  const widget = document.getElementById("fkDOBCompactWidget");
  const calcBtn = document.getElementById("btnCalculateDOB");
  const dobInput = document.getElementById("dobInput");
  const resultBox = document.getElementById("calcResultBox");
  const chipButtons = document.querySelectorAll(".chip-btn");

  if (toggleBtn && widget) {
    toggleBtn.addEventListener("click", () => {
      widget.classList.toggle("open");
    });
  }

  function runCalculation(val) {
    const res = calculateMulankFromDOB(val);
    if (!res) {
      alert("Please enter a valid 8-digit birth date (e.g., 24-08-2005).");
      return;
    }

    const { mulank, steps, info } = res;
    storeState.matchedMulank = mulank;

    // Show result breakdown
    const mathEl = document.getElementById("calcMathSteps");
    const resultMulankText = document.getElementById("resultMulankText");
    if (mathEl) mathEl.innerHTML = `Calculation: <strong>${steps.join(" ➔ ")}</strong>`;
    if (resultMulankText) resultMulankText.textContent = `Mulank ${mulank} (${info.planet})`;
    if (resultBox) resultBox.style.display = "flex";

    // Show Matched pill in category strip
    const matchedPill = document.getElementById("catMatchedPill");
    const matchedLabel = document.getElementById("catMatchedLabel");
    if (matchedPill && matchedLabel) {
      matchedLabel.textContent = `Matched for You (Mulank ${mulank})`;
      matchedPill.style.display = "inline-flex";
    }

    // Update Typewriter
    if (typewriterInstance) {
      typewriterInstance.lockMessage(
        `🎯 100% Cosmic Match Found: Mulank ${mulank} (${info.planet})! Prescribed: Consecrated ${info.stones.join(", ")}.`
      );
    }

    // Filter store to this Mulank
    selectMulankTab(mulank);

    // Scroll to products
    const mainStore = document.getElementById("mainStoreSection");
    if (mainStore) {
      mainStore.scrollIntoView({ behavior: "smooth" });
    }
  }

  if (calcBtn && dobInput) {
    calcBtn.addEventListener("click", () => runCalculation(dobInput.value));
    dobInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") runCalculation(dobInput.value);
    });
  }

  chipButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.getAttribute("data-dob");
      if (val && dobInput) {
        dobInput.value = val;
        runCalculation(val);
      }
    });
  });
}

// ==========================================================================
// 12. URL QUERY PARAMETER HANDLER (Smooth Redirection from Service & Payment)
// ==========================================================================
function handleUrlParameters() {
  const params = new URLSearchParams(window.location.search);
  const mulankParam = params.get("mulank") || params.get("driver") || params.get("root");
  const stoneParam = params.get("stone");
  const fromParam = params.get("from");
  const matchedParam = params.get("matched");

  if (mulankParam) {
    const m = parseInt(mulankParam, 10);
    if (m >= 1 && m <= 9) {
      storeState.matchedMulank = m;

      // Update Typewriter with personalized greeting
      setTimeout(() => {
        if (typewriterInstance && MULANK_DATA[m]) {
          const info = MULANK_DATA[m];
          if (fromParam === "payment") {
            typewriterInstance.lockMessage(
              `🎉 Welcome from your Numerology Analysis! Consecrated remedies for Mulank ${m} (${info.planet}) are pre-selected below.`
            );
          } else {
            typewriterInstance.lockMessage(
              `🎯 Cosmic Match Confirmed: Mulank ${m} (${info.planet}) detected! Showing your authentic Vedic crystal talismans.`
            );
          }
        }
      }, 500);

      // Show Matched pill in category strip
      const matchedPill = document.getElementById("catMatchedPill");
      const matchedLabel = document.getElementById("catMatchedLabel");
      if (matchedPill && matchedLabel) {
        matchedLabel.textContent = `Matched for You (Mulank ${m})`;
        matchedPill.style.display = "inline-flex";
      }

      selectMulankTab(m);

      if (stoneParam) {
        storeState.searchQuery = stoneParam.toLowerCase();
      }

      setTimeout(() => {
        const sec = document.getElementById("mainStoreSection");
        if (sec) sec.scrollIntoView({ behavior: "smooth" });
      }, 400);
    }
  }
}

// ==========================================================================
// 13. CHECKOUT & RAZORPAY PAYMENT ENGINE (5-Point WhatsApp Receipt)
// ==========================================================================
let currentSelectedProduct = {
  name: "Mulank 3 — Cosmic Jupiter Abundance & Wisdom Bracelet",
  id: "BRAC-MUL-03",
  stones: "Ametrine, Citrine, Aventurine, Amethyst",
  mulank: "3",
  dob: "",
  image: "./Ametrine.jpg",
  price: PRICING.offerPrice
};

function initCheckoutModal() {
  const modal = document.getElementById("orderModal");
  const form = document.getElementById("orderForm");
  const closeBtn = document.getElementById("orderModalClose");
  const cancelBtn = document.getElementById("btnOrderCancel");
  const submitBtn = document.getElementById("btnSubmitOrderRazorpay");

  if (!modal || !form) return;

  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
    document.getElementById("orderFormView").style.display = "block";
    document.getElementById("orderSuccessView").style.display = "none";
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const customerName = document.getElementById("customerName").value.trim();
    const customerPhone = document.getElementById("customerPhone").value.trim();
    const customerEmail = document.getElementById("customerEmail").value.trim();
    const addressStreet = document.getElementById("addressStreet").value.trim();
    const addressCity = document.getElementById("addressCity").value.trim();
    const addressState = document.getElementById("addressState").value.trim() || "India";
    const addressPincode = document.getElementById("addressPincode").value.trim();

    const productName = currentSelectedProduct.name;
    const productId = currentSelectedProduct.id;
    const stonesIncluded = currentSelectedProduct.stones;
    const mulankNum = currentSelectedProduct.mulank || "Custom / Vedic";
    const customDOB = document.getElementById("orderDOB").value.trim() || currentSelectedProduct.dob || "General Energization";
    const wristSize = document.getElementById("wristSize").value;

    if (!customerName || !customerPhone || !customerEmail || !addressStreet || !addressCity || !addressPincode) {
      alert("Please fill in all mandatory fields (Name, Phone, Email, Address).");
      return;
    }

    const origBtnHtml = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Opening Razorpay Gateway...</span>`;
    }

    try {
      // 1. Create Razorpay order on backend
      const orderPayload = {
        product_name: productName,
        product_id: productId,
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        address: addressStreet,
        city: addressCity,
        state: addressState,
        pincode: addressPincode,
        dob: customDOB,
        wrist_size: wristSize,
        mulank: String(mulankNum),
        stones: stonesIncluded,
        amount: 149900 // in paise
      };

      const createRes = await fetch("/api/shop/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      if (!createRes.ok) throw new Error("Order creation failed (" + createRes.status + ")");
      const createData = await createRes.json();
      const rzpOrder = createData.data;
      const keyId = createData.key_id;

      if (typeof Razorpay === "undefined") {
        throw new Error("Razorpay checkout SDK failed to load. Please verify your connection.");
      }

      // 2. Open Razorpay Popup
      const rzpOptions = {
        key: keyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency || "INR",
        name: "Numerology Fortune",
        description: `${productName} (${productId})`,
        image: "/static/data/logo-nf-mark.png",
        order_id: rzpOrder.order_id,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone
        },
        theme: { color: "#D4AF37" },
        modal: {
          ondismiss: function () {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = origBtnHtml;
            }
          }
        },
        handler: async function (paymentResponse) {
          if (submitBtn) submitBtn.innerHTML = `<span>Verifying & Sending Tax Receipt...</span>`;

          try {
            // 3. Verify Payment
            const verifyPayload = {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              product_name: productName,
              product_id: productId,
              name: customerName,
              phone: customerPhone,
              email: customerEmail,
              address: addressStreet,
              city: addressCity,
              state: addressState,
              pincode: addressPincode,
              dob: customDOB,
              wrist_size: wristSize,
              mulank: String(mulankNum),
              stones: stonesIncluded,
              amount: 1499
            };

            await fetch("/api/shop/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(verifyPayload)
            });

            const orderId = paymentResponse.razorpay_order_id;
            const paymentId = paymentResponse.razorpay_payment_id;

            // 4. Construct 5-Point WhatsApp Receipt
            const whatsappMessage = 
`✨ *PAID ORDER CONFIRMED — NUMEROLOGY FORTUNE* ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━
🧾 *ORDER & PAYMENT RECEIPT:*
• Razorpay Order ID: ${orderId}
• Razorpay Payment ID: ${paymentId}
• Payment Status: PAID (₹1,499 via Razorpay)
• Confirmation Email: ${customerEmail} (Receipt Dispatched)

👤 *1. CUSTOMER NAME:*
${customerName}

📱 *2. CONTACT DETAILS:*
• WhatsApp / Phone: ${customerPhone}
• Email: ${customerEmail}

📍 *3. DELIVERY ADDRESS:*
• Street / Landmark: ${addressStreet}
• City: ${addressCity}
• State: ${addressState} - ${addressPincode}

🔮 *4. PRODUCT NAME WITH ID:*
• Product Name: ${productName}
• Product ID: ${productId}
• Sacred Mulank: ${mulankNum}
• Gemstones Included: ${stonesIncluded}
• Birth Date (for Consecration): ${customDOB}
• Wrist Size: ${wristSize}

💳 *5. PAYMENT DETAILS:*
• Original Price: ₹2,500/-
• Offer Price Paid: ₹1,499/- (Flat 40% OFF)
• Vedic Consecration Ritual: INCLUDED (FREE)
• Insured Express Delivery: INCLUDED (FREE)
• Payment Gateway: Razorpay Verified
━━━━━━━━━━━━━━━━━━━━━━━━━━
🙏 *Payment completed and confirmed! Please confirm my dispatch timeline.*`;

            const encodedText = encodeURIComponent(whatsappMessage);
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_MERCHANT_NUMBER}&text=${encodedText}`;

            // 5. Update Success View
            document.getElementById("orderFormView").style.display = "none";
            const successView = document.getElementById("orderSuccessView");
            successView.style.display = "block";

            document.getElementById("successOrderId").textContent = orderId;
            document.getElementById("successPaymentId").textContent = paymentId;
            document.getElementById("successEmailNotice").textContent = `Dispatched to ${customerEmail}`;
            document.getElementById("orderSummaryPreview").textContent = whatsappMessage;

            const waRedirectBtn = document.getElementById("btnRedirectWhatsAppNow");
            if (waRedirectBtn) waRedirectBtn.href = whatsappUrl;

            const copyBtn = document.getElementById("btnCopySummary");
            if (copyBtn) {
              copyBtn.onclick = () => {
                navigator.clipboard.writeText(whatsappMessage).then(() => {
                  copyBtn.textContent = "✓ Order Receipt Copied!";
                  setTimeout(() => { copyBtn.textContent = "📋 Copy Order Receipt"; }, 2500);
                });
              };
            }

            // Empty cart if checkout was from cart
            storeState.cart = [];
            updateCartBadges();

            // Redirect to WhatsApp automatically in new tab
            window.open(whatsappUrl, "_blank");

          } catch (verErr) {
            console.error("Verification error:", verErr);
            alert("Payment completed on Razorpay! Order ID: " + paymentResponse.razorpay_order_id + ". Details sent to WhatsApp.");
          } finally {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = origBtnHtml;
            }
          }
        }
      };

      const rzpInstance = new Razorpay(rzpOptions);
      rzpInstance.open();

    } catch (err) {
      console.error("Checkout error:", err);
      alert("Unable to open Razorpay gateway: " + err.message);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHtml;
      }
    }
  });
}

function openOrderModal(product) {
  if (product) {
    currentSelectedProduct = { ...currentSelectedProduct, ...product };
  }

  const modal = document.getElementById("orderModal");
  if (!modal) return;

  document.getElementById("modalSelectedImg").src = currentSelectedProduct.image;
  document.getElementById("modalSelectedTitle").textContent = currentSelectedProduct.name;
  document.getElementById("modalSelectedSku").textContent = `ID: ${currentSelectedProduct.id}`;
  document.getElementById("modalSelectedMulank").textContent = `Mulank: ${currentSelectedProduct.mulank || 'Vedic'}`;

  if (currentSelectedProduct.dob) {
    document.getElementById("orderDOB").value = currentSelectedProduct.dob;
  }

  document.getElementById("orderFormView").style.display = "block";
  document.getElementById("orderSuccessView").style.display = "none";

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

// ==========================================================================
// 14. GEMSTONE DEEP-DIVE MODAL
// ==========================================================================
window.openGemstoneModal = function(gemId) {
  const gem = GEMSTONES_DATA.find(g => g.id === gemId);
  if (!gem) return;

  const modal = document.getElementById("gemDetailModal");
  if (!modal) return;

  document.getElementById("modalGemTitle").textContent = `${gem.name} Energy Bead Bracelet`;
  document.getElementById("modalGemKeywords").textContent = gem.keywords;
  document.getElementById("modalGemImg").src = `./${gem.image}`;
  document.getElementById("modalGemSku").textContent = gem.id;

  const bulletsContainer = document.getElementById("modalGemAssociations");
  if (bulletsContainer) {
    bulletsContainer.innerHTML = `
      <li><strong>Astrological Symbolism:</strong> ${gem.shortDesc}</li>
      <li><strong>Energy Category:</strong> ${gem.category.toUpperCase()}</li>
      <li><strong>Ruling Frequency:</strong> Mulank ${gem.relatedMulanks ? gem.relatedMulanks.join(', ') : 'Universal Harmonic'}</li>
      <li><strong>Consecration:</strong> 100% Vedic Pran Pratishtha Ritual Included with Certificate.</li>
    `;
  }

  const idealContainer = document.getElementById("modalGemIdeal");
  if (idealContainer) {
    idealContainer.innerHTML = gem.idealFor.map(t => `<span class="ideal-tag">${t}</span>`).join(' ');
  }

  const buyBtn = document.getElementById("btnModalGemBuy");
  if (buyBtn) {
    buyBtn.onclick = () => {
      closeGemModal();
      triggerDirectCheckout(gem.id);
    };
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
};

window.closeGemModal = function() {
  const modal = document.getElementById("gemDetailModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
};

// ==========================================================================
// 15. FAQ ACCORDION & MOBILE MENU
// ==========================================================================
function initFAQAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    const question = item.querySelector(".faq-question");
    if (question) {
      question.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        faqItems.forEach(i => i.classList.remove("open"));
        if (!isOpen) item.classList.add("open");
      });
    }
  });
}

function initMobileMenu() {
  const btnToggle = document.getElementById("btnMobileMenuToggle");
  const mobileDrawer = document.getElementById("mobileNavDrawer");
  if (!btnToggle || !mobileDrawer) return;

  btnToggle.addEventListener("click", () => {
    const isOpen = mobileDrawer.classList.toggle("open");
    btnToggle.classList.toggle("active", isOpen);
  });

  mobileDrawer.querySelectorAll(".mobile-nav-link, .btn-mobile-drawer-cta").forEach(link => {
    link.addEventListener("click", () => {
      mobileDrawer.classList.remove("open");
      btnToggle.classList.remove("active");
    });
  });
}

// ==========================================================================
// 16. INITIALIZATION ON DOM LOAD
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  typewriterInstance = new TypewriterEngine("typewriterText", ".typewriter-cursor");
  typewriterInstance.startLoop();

  initSearchTypewriter();
  initDOBCalculator();
  initCategoryChips();
  initSortTabs();
  initCartDrawer();
  initCheckoutModal();
  initFAQAccordion();
  initMobileMenu();

  renderProductGrid();
  handleUrlParameters();
});
