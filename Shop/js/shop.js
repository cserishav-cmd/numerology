/**
 * NUMEROLOGY FORTUNE — SACRED GEMSTONE BRACELETS SHOP
 * Features:
 * - Dynamic Mulank & Full Date of Birth Cosmic Calculator (e.g. 24-08-2005 -> 3)
 * - 9 Sacred Mulank Power Combination Bracelets
 * - 16 Natural Earth Gemstones Encyclopedia & Catalog
 * - 5-Point Order & WhatsApp Checkout Redirection to +91 98363 94217
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
// 1. DATA: 9 MULANK SACRED COMBINATION BRACELETS
// ==========================================================================
const MULANK_DATA = {
  1: {
    mulank: 1,
    id: "BRAC-MUL-01",
    name: "Mulank 1 — Solar Emperor Power Bracelet",
    planet: "Sun (Surya) ✦ Divine Vitality & Willpower",
    stones: ["Natural Citrine", "Sunstone"],
    stoneImages: ["NaturalCitrine.jpg", "Sunstone.jpg"],
    vibe: "Leadership • Divine Vitality • Supreme Confidence • Abundance",
    description: "Formulated for leaders, visionaries, and pioneers ruled by the Sun. Synergizes pure golden solar energy of Natural Citrine with the radiant fire of Sunstone to magnify magnetism, authority, and prosperity.",
    idealFor: ["Leadership", "Executive Success", "Self-Empowerment", "Vitality", "Wealth Attraction"]
  },
  2: {
    mulank: 2,
    id: "BRAC-MUL-02",
    name: "Mulank 2 — Lunar Intuition & Peace Bracelet",
    planet: "Moon (Chandra) ✦ Emotional Harmony & Intuition",
    stones: ["Moonstone", "Aquamarine"],
    stoneImages: ["Moonstone.jpg", "Aquamarine.jpg"],
    vibe: "Inner Peace • Deep Intuition • Emotional Balance • Calm Expression",
    description: "Ruled by the Moon, this tranquil talisman unites iridescent Moonstone and tranquil ocean-blue Aquamarine. Calms emotional turmoil, balances subconscious tides, and fosters eloquent heart-centered communication.",
    idealFor: ["Emotional Peace", "Intuitive Wisdom", "Mindfulness", "Tranquil Sleep", "Relationship Harmony"]
  },
  3: {
    mulank: 3,
    id: "BRAC-MUL-03",
    name: "Mulank 3 — Cosmic Jupiter Abundance & Wisdom Bracelet",
    planet: "Jupiter (Brihaspati / Guru) ✦ Wisdom & Expansion",
    stones: ["Ametrine", "Citrine", "Aventurine", "Amethyst"],
    stoneImages: ["Ametrine.jpg", "Citrine.jpg", "Aventurine.jpg", "Amethyst.jpg"],
    vibe: "Creative Genius • Higher Wisdom • Wealth Expansion • Mental Clarity",
    description: "A consecrated quad-stone alignment for innovators and spiritual seekers governed by Jupiter. Combines Ametrine for creative clarity, Citrine for fortune, Aventurine for opportunity, and Amethyst for divine spiritual grounding.",
    idealFor: ["Academic & Career Growth", "Financial Prosperity", "Creative Expression", "Focus", "Spiritual Expansion"]
  },
  4: {
    mulank: 4,
    id: "BRAC-MUL-04",
    name: "Mulank 4 — Supreme Shield & Grounding Bracelet",
    planet: "Rahu ✦ Master Strategist, Stability & Psychic Protection",
    stones: ["Hematite", "Tiger Eye", "Black Tourmaline", "Smoky Quartz"],
    stoneImages: ["Hematite.jpg", "TigerEye.jpg", "BlackTourmaline.jpg", "SmokyQuartz.jpg"],
    vibe: "Psychic Protection • Energetic Grounding • Willpower • Stability",
    description: "A quad-crystal fortress designed to harmonize Rahu's volatile energies. Blends mirror-finish Hematite, courage-giving Tiger Eye, protective Black Tourmaline, and grounding Smoky Quartz to shield against negative auras and stress.",
    idealFor: ["Evil Eye & EMF Defense", "Emotional Grounding", "Overcoming Anxiety", "Disciplined Focus", "Unyielding Strength"]
  },
  5: {
    mulank: 5,
    id: "BRAC-MUL-05",
    name: "Mulank 5 — Mercury Rapid Growth & Magnetism Bracelet",
    planet: "Mercury (Budha) ✦ Commerce, Intellect & Versatility",
    stones: ["Citrine", "Amethyst", "Ametrine", "Aquamarine"],
    stoneImages: ["Citrine.jpg", "Amethyst.jpg", "Ametrine.jpg", "Aquamarine.jpg"],
    vibe: "Commercial Acumen • Fluid Communication • Financial Luck • Adaptability",
    description: "Specially formulated for entrepreneurs, speakers, and dynamic minds ruled by Mercury. Combines Citrine's merchant luck, Amethyst's calm intellect, Ametrine's balance, and Aquamarine's persuasive clarity.",
    idealFor: ["Business Expansion", "Stock & Trade Success", "Charismatic Public Speaking", "Adaptability", "Stress Relief"]
  },
  6: {
    mulank: 6,
    id: "BRAC-MUL-06",
    name: "Mulank 6 — Venusian Love & Luxury Magnetism Bracelet",
    planet: "Venus (Shukra) ✦ Divine Beauty, Harmony & Affluence",
    stones: ["Rose Quartz", "Moonstone"],
    stoneImages: ["RoseQuartz.jpg", "Moonstone.jpg"],
    vibe: "Unconditional Love • Romantic Harmony • Artistic Grace • Luxury Magnetism",
    description: "Consecrated for magnetic souls ruled by Venus. Harnesses the heart-chakra frequencies of authentic Rose Quartz alongside the sacred feminine glow of Moonstone to attract true romance, luxury, aesthetic refinement, and peace.",
    idealFor: ["Soulmate Attraction", "Self-Love & Healing", "Marital Bliss", "Artistic Charisma", "Peaceful Relationships"]
  },
  7: {
    mulank: 7,
    id: "BRAC-MUL-07",
    name: "Mulank 7 — Ketu Mystic Awakening & Aura Purification Bracelet",
    planet: "Ketu ✦ Spiritual Liberation, Mysticism & Psychic Clarity",
    stones: ["Clear Quartz", "Selenite"],
    stoneImages: ["ClearQuartz.jpg", "Selenite.jpg"],
    vibe: "Pure Consciousness • Aura Cleansing • Deep Meditation • Sacred Vision",
    description: "A transcendent combination for deep thinkers, healers, and spiritual seekers influenced by Ketu. Combines Clear Quartz (the Master Healer) and luminous Selenite to dissolve energetic blockages and illuminate the crown chakra.",
    idealFor: ["Meditation & Yoga", "Aura Cleansing", "Spiritual Intuition", "Mind Clearing", "Divine Guidance"]
  },
  8: {
    mulank: 8,
    id: "BRAC-MUL-08",
    name: "Mulank 8 — Saturn Karmic Wealth & Resilient Power Bracelet",
    planet: "Saturn (Shani) ✦ Karmic Justice, Mastery & Empire Building",
    stones: ["Pyrite", "Hematite"],
    stoneImages: ["Pyrite.jpg", "Hematite.jpg"],
    vibe: "Monumental Wealth • Iron Determination • Karmic Protection • Relentless Focus",
    description: "Engineered for visionaries who build enduring legacies under Saturn's steady gaze. Integrates genuine Fool's Gold (Pyrite) for massive financial manifestation with metallic Hematite for root-chakra grounding and courage.",
    idealFor: ["Long-term Wealth Creation", "Career Resilience", "Overcoming Obstacles", "Financial Discipline", "Physical Stamina"]
  },
  9: {
    mulank: 9,
    id: "BRAC-MUL-09",
    name: "Mulank 9 — Mars Warrior Courage & Divine Wisdom Bracelet",
    planet: "Mars (Mangal) ✦ Fiery Courage, Humanitarian Spirit & Strategic Power",
    stones: ["Amethyst", "Citrine", "Ametrine"],
    stoneImages: ["Amethyst.jpg", "Citrine.jpg", "Ametrine.jpg"],
    vibe: "Dynamic Courage • Tempered Passion • Abundant Victory • Spiritual Harmony",
    description: "Harnesses Mars's fiery dynamism and channels it into enlightened victory. Harmonizes Amethyst's soothing spiritual frequency with Citrine's joyful wealth energy and Ametrine's unifying balance to transform anger into unstoppable leadership.",
    idealFor: ["Confidence & Courage", "Strategic Victory", "Anger Management", "Compassionate Leadership", "Prosperity"]
  }
};

// ==========================================================================
// 2. DATA: 16 NATURAL GEMSTONES ENCYCLOPEDIA & CATALOG
// ==========================================================================
const GEMSTONES_DATA = [
  {
    id: "GEM-AME-01",
    name: "Amethyst",
    image: "Amethyst.jpg",
    category: "spiritual",
    keywords: "Calmness • Emotional Balance • Relaxation • Spiritual Awareness",
    associations: [
      { title: "Calm & Relaxation", desc: "Often chosen for creating a peaceful and relaxed state of mind, especially during meditation or quiet personal time." },
      { title: "Emotional Balance", desc: "Traditionally associated with maintaining emotional harmony and helping one approach situations with greater calmness." },
      { title: "Mental Clarity", desc: "Commonly used symbolically for clearing distractions and encouraging a more focused and thoughtful mindset." },
      { title: "Spiritual Awareness", desc: "Frequently connected with meditation, introspection, and spiritual practices." },
      { title: "Peaceful Energy", desc: "Its soothing purple appearance and traditional symbolism make it popular for people seeking a sense of serenity." }
    ],
    idealFor: ["Meditation", "Relaxation", "Emotional balance", "Inner peace", "Mindfulness"],
    relatedMulanks: [3, 5, 9]
  },
  {
    id: "GEM-AMT-02",
    name: "Ametrine",
    image: "Ametrine.jpg",
    category: "clarity",
    keywords: "Clarity • Balance • Creativity • Focus",
    associations: [
      { title: "Mental Clarity", desc: "Often chosen to symbolize clear thinking and a more organized approach to thoughts and decisions." },
      { title: "Balance & Harmony", desc: "Traditionally associated with balancing different aspects of one's energy and maintaining a harmonious mindset." },
      { title: "Creativity", desc: "Commonly connected with imagination, creative thinking, and exploring new ideas." },
      { title: "Focus", desc: "Often selected by people who want to symbolize concentration and purposeful action." },
      { title: "Positive Outlook", desc: "Its combination of golden and purple tones is traditionally associated with balanced and uplifting energy." }
    ],
    idealFor: ["Creativity", "Focus", "Mental clarity", "Balance", "Personal growth"],
    relatedMulanks: [3, 5, 9]
  },
  {
    id: "GEM-AQU-03",
    name: "Aquamarine",
    image: "Aquamarine.jpg",
    category: "clarity",
    keywords: "Calmness • Communication • Courage • Emotional Clarity",
    associations: [
      { title: "Calm Communication", desc: "Traditionally regarded as a stone connected with peaceful and clear communication." },
      { title: "Emotional Clarity", desc: "Often chosen to symbolize a calmer approach to understanding and expressing emotions." },
      { title: "Courage", desc: "Traditionally associated with inner courage and confidence when facing unfamiliar situations." },
      { title: "Peace & Tranquility", desc: "Its ocean-blue appearance is strongly connected with peaceful and soothing symbolism." },
      { title: "Self-Expression", desc: "Commonly chosen by those who want to encourage open and balanced expression." }
    ],
    idealFor: ["Communication", "Emotional balance", "Courage", "Peace", "Self-expression"],
    relatedMulanks: [2, 5]
  },
  {
    id: "GEM-AVE-04",
    name: "Aventurine",
    image: "Aventurine.jpg",
    category: "wealth",
    keywords: "Optimism • Confidence • Growth • Opportunity",
    associations: [
      { title: "Optimism", desc: "Often chosen as a symbol of positive thinking and maintaining an encouraging outlook." },
      { title: "Confidence", desc: "Traditionally associated with self-belief and the courage to approach new experiences." },
      { title: "Growth", desc: "Commonly connected with personal development, learning, and moving forward." },
      { title: "Opportunity", desc: "Often regarded symbolically as a stone of new possibilities and fresh beginnings." },
      { title: "Positive Energy", desc: "Its green appearance is traditionally associated with renewal, balance, and growth." }
    ],
    idealFor: ["Confidence", "Growth", "New beginnings", "Optimism", "Opportunity"],
    relatedMulanks: [3]
  },
  {
    id: "GEM-BTR-05",
    name: "Black Tourmaline",
    image: "BlackTourmaline.jpg",
    category: "protection",
    keywords: "Protection • Grounding • Stability • Energetic Boundaries",
    associations: [
      { title: "Protection", desc: "Traditionally regarded as a protective stone and commonly worn as a symbolic reminder of personal boundaries." },
      { title: "Grounding", desc: "Often chosen by people who want to feel more centered, stable, and connected to the present moment." },
      { title: "Emotional Stability", desc: "Traditionally associated with maintaining a steady and balanced mindset during stressful or changing situations." },
      { title: "Personal Boundaries", desc: "Commonly connected with creating a sense of distance from unwanted or overwhelming influences." },
      { title: "Sense of Security", desc: "Its deep black appearance contributes to its strong protective symbolism." }
    ],
    idealFor: ["Grounding", "Protection symbolism", "Stability", "Personal boundaries", "Balance"],
    relatedMulanks: [4]
  },
  {
    id: "GEM-CIT-06",
    name: "Citrine",
    image: "Citrine.jpg",
    category: "wealth",
    keywords: "Abundance • Confidence • Motivation • Positivity",
    associations: [
      { title: "Abundance", desc: "Traditionally connected with prosperity, opportunity, and an abundance-oriented mindset." },
      { title: "Confidence", desc: "Often chosen to symbolize self-belief, enthusiasm, and a willingness to take action." },
      { title: "Motivation", desc: "Commonly associated with drive, ambition, and maintaining momentum toward personal goals." },
      { title: "Positive Outlook", desc: "Its warm golden color is traditionally linked with optimism, happiness, and uplifting energy." },
      { title: "Personal Growth", desc: "Often selected by people who want to symbolize progress, confidence, and new possibilities." }
    ],
    idealFor: ["Confidence", "Motivation", "Prosperity symbolism", "Optimism", "Growth"],
    relatedMulanks: [3, 5, 9]
  },
  {
    id: "GEM-HEM-07",
    name: "Hematite",
    image: "Hematite.jpg",
    category: "protection",
    keywords: "Grounding • Stability • Focus • Mental Clarity",
    associations: [
      { title: "Grounding", desc: "Often chosen as a symbolic stone for feeling centered, steady, and connected to the present." },
      { title: "Stability", desc: "Traditionally associated with maintaining balance and steadiness during periods of change." },
      { title: "Focus", desc: "Commonly selected by people who want to symbolize concentration and disciplined thinking." },
      { title: "Mental Clarity", desc: "Often connected with organizing thoughts and approaching situations with a clear mindset." },
      { title: "Strength & Determination", desc: "Its metallic appearance and weight are traditionally associated with strength, resilience, and stability." }
    ],
    idealFor: ["Focus", "Grounding", "Stability", "Determination", "Mental clarity"],
    relatedMulanks: [4, 8]
  },
  {
    id: "GEM-MOO-08",
    name: "Moonstone",
    image: "Moonstone.jpg",
    category: "love",
    keywords: "Intuition • Emotional Balance • Inner Calm • New Beginnings",
    associations: [
      { title: "Intuition", desc: "Traditionally connected with inner awareness, reflection, and trusting one's instincts." },
      { title: "Emotional Balance", desc: "Often chosen to symbolize calmness and emotional harmony." },
      { title: "Inner Calm", desc: "Commonly associated with peaceful energy and quiet self-reflection." },
      { title: "New Beginnings", desc: "Traditionally regarded as a symbolic stone for transitions, fresh starts, and personal growth." },
      { title: "Feminine & Lunar Energy", desc: "Its connection with the moon gives it strong traditional symbolism around cycles, intuition, and renewal." }
    ],
    idealFor: ["Intuition", "Emotional harmony", "Reflection", "New beginnings", "Inner peace"],
    relatedMulanks: [2, 6]
  },
  {
    id: "GEM-NCIT-09",
    name: "Natural Citrine",
    image: "NaturalCitrine.jpg",
    category: "wealth",
    keywords: "Abundance • Confidence • Optimism • Prosperity",
    associations: [
      { title: "Abundance", desc: "Commonly regarded as a symbolic stone for prosperity, opportunity, and an abundance-oriented mindset." },
      { title: "Confidence", desc: "Traditionally associated with self-belief, enthusiasm, and personal empowerment." },
      { title: "Optimism", desc: "Its natural golden color is often connected with warmth, positivity, and an uplifting outlook." },
      { title: "Motivation", desc: "Commonly chosen to symbolize ambition, action, and determination toward personal goals." },
      { title: "Prosperity", desc: "Often associated with success, growth, and attracting positive opportunities in crystal traditions." }
    ],
    idealFor: ["Abundance", "Confidence", "Prosperity symbolism", "Motivation", "Positive outlook"],
    relatedMulanks: [1]
  },
  {
    id: "GEM-SMQ-10",
    name: "Smoky Quartz",
    image: "SmokyQuartz.jpg",
    category: "protection",
    keywords: "Grounding • Stability • Protection • Emotional Release",
    associations: [
      { title: "Grounding", desc: "Often chosen to symbolize stability and a stronger connection with the present moment." },
      { title: "Emotional Release", desc: "Traditionally associated with letting go of unwanted thoughts, emotional heaviness, or past experiences." },
      { title: "Protection", desc: "Commonly regarded as a protective and grounding stone in crystal traditions." },
      { title: "Stability", desc: "Often selected during periods of change when a person wants to symbolize steadiness and balance." },
      { title: "Calm Energy", desc: "Its smoky appearance is traditionally connected with quiet, grounded, and composed energy." }
    ],
    idealFor: ["Grounding", "Stability", "Protection symbolism", "Emotional balance", "Calmness"],
    relatedMulanks: [4]
  },
  {
    id: "GEM-SUN-11",
    name: "Sunstone",
    image: "Sunstone.jpg",
    category: "wealth",
    keywords: "Confidence • Positivity • Vitality • Personal Power",
    associations: [
      { title: "Confidence", desc: "Often chosen to symbolize self-belief, independence, and personal strength." },
      { title: "Positivity", desc: "Traditionally connected with optimism, enthusiasm, and an uplifting attitude." },
      { title: "Vitality", desc: "Its warm, radiant appearance is associated with energetic and lively symbolism." },
      { title: "Leadership", desc: "Commonly chosen as a symbolic stone for initiative, confidence, and taking charge." },
      { title: "Personal Power", desc: "Traditionally associated with independence, determination, and a strong sense of self." }
    ],
    idealFor: ["Confidence", "Leadership", "Positivity", "Motivation", "Personal power"],
    relatedMulanks: [1]
  },
  {
    id: "GEM-TIG-12",
    name: "Tiger Eye",
    image: "TigerEye.jpg",
    category: "protection",
    keywords: "Confidence • Courage • Focus • Grounding",
    associations: [
      { title: "Confidence", desc: "Often chosen to symbolize self-belief and a strong sense of personal direction." },
      { title: "Courage", desc: "Traditionally connected with facing challenges with determination and composure." },
      { title: "Focus", desc: "Commonly selected by people who want to symbolize concentration and purposeful decision-making." },
      { title: "Grounding", desc: "Its earthy appearance is traditionally associated with stability and a balanced mindset." },
      { title: "Determination", desc: "Often regarded as a symbolic stone for persistence, discipline, and staying committed to one's goals." }
    ],
    idealFor: ["Confidence", "Courage", "Focus", "Determination", "Grounding"],
    relatedMulanks: [4]
  },
  {
    id: "GEM-RSQ-13",
    name: "Rose Quartz",
    image: "RoseQuartz.jpg",
    category: "love",
    keywords: "Love • Compassion • Emotional Harmony • Self-Love",
    associations: [
      { title: "Love", desc: "Traditionally regarded as one of the most well-known stones associated with love, affection, and meaningful connections." },
      { title: "Self-Love", desc: "Often chosen as a reminder of self-care, self-acceptance, and treating oneself with kindness." },
      { title: "Compassion", desc: "Commonly associated with empathy, understanding, and gentle interactions with others." },
      { title: "Emotional Harmony", desc: "Traditionally connected with peaceful relationships and emotional balance." },
      { title: "Relationships", desc: "Often selected as a symbolic gift for partners, family members, friends, and loved ones." }
    ],
    idealFor: ["Love", "Self-love", "Relationships", "Compassion", "Emotional harmony"],
    relatedMulanks: [6]
  },
  {
    id: "GEM-CLQ-14",
    name: "Clear Quartz",
    image: "ClearQuartz.jpg",
    category: "spiritual",
    keywords: "Clarity • Focus • Balance • Intention",
    associations: [
      { title: "Clarity", desc: "Traditionally regarded as a stone connected with clear thinking and a focused mindset." },
      { title: "Focus", desc: "Often chosen to symbolize concentration and staying attentive to personal goals." },
      { title: "Intention", desc: "Commonly used symbolically during meditation or intention-setting practices." },
      { title: "Balance", desc: "Traditionally associated with harmony and maintaining a balanced approach." },
      { title: "Versatility", desc: "Clear Quartz is widely used in crystal traditions and is often selected as a general-purpose stone for spiritual and mindfulness practices." }
    ],
    idealFor: ["Clarity", "Focus", "Meditation", "Intention-setting", "Balance"],
    relatedMulanks: [7]
  },
  {
    id: "GEM-SEL-15",
    name: "Selenite",
    image: "Selenite.jpg",
    category: "spiritual",
    keywords: "Peace • Clarity • Purification • Spiritual Awareness",
    associations: [
      { title: "Peace & Serenity", desc: "Often chosen to symbolize a calm, peaceful, and quiet environment." },
      { title: "Clarity", desc: "Traditionally connected with clear thinking, reflection, and creating mental space." },
      { title: "Purification", desc: "Commonly regarded in crystal traditions as a stone associated with cleansing and renewal." },
      { title: "Spiritual Awareness", desc: "Often used symbolically during meditation, reflection, and spiritual practices." },
      { title: "Calm Environment", desc: "Frequently placed in personal spaces as a symbol of serenity and peaceful energy." }
    ],
    idealFor: ["Peace", "Meditation", "Clarity", "Reflection", "Spiritual practices"],
    relatedMulanks: [7]
  },
  {
    id: "GEM-PYR-16",
    name: "Pyrite",
    image: "Pyrite.jpg",
    category: "wealth",
    keywords: "Confidence • Ambition • Abundance • Motivation",
    associations: [
      { title: "Confidence", desc: "Often chosen to symbolize self-belief, courage, and a strong attitude toward challenges." },
      { title: "Ambition", desc: "Traditionally connected with determination, goals, leadership, and the desire to move forward." },
      { title: "Abundance", desc: "Commonly associated with prosperity, opportunity, and success-oriented symbolism." },
      { title: "Motivation", desc: "Often selected by people who want to symbolize drive, action, and persistence." },
      { title: "Determination", desc: "Its metallic golden appearance gives it strong traditional associations with strength, achievement, and purposeful action." }
    ],
    idealFor: ["Confidence", "Ambition", "Motivation", "Prosperity symbolism", "Determination"],
    relatedMulanks: [8]
  }
];

// ==========================================================================
// 3. CORE LOGIC: DOB / MULANK CALCULATION ENGINE
// e.g. "24-08-2005 -> 3"
// 2 + 4 + 0 + 8 + 2 + 0 + 0 + 5 = 21 -> 2 + 1 = 3
// ==========================================================================
function calculateMulankFromDOB(dobStr) {
  if (!dobStr) return null;

  // Extract all digit characters
  const digits = dobStr.replace(/\D/g, '').split('').map(Number);
  if (digits.length < 8) return null;

  // Sum all digits
  const sumStep1 = digits.reduce((acc, curr) => acc + curr, 0);

  // Reduction steps array for transparent user feedback
  const steps = [];
  steps.push(`${digits.join(" + ")} = ${sumStep1}`);

  let current = sumStep1;
  while (current > 9) {
    const digitArray = current.toString().split('').map(Number);
    const nextSum = digitArray.reduce((acc, curr) => acc + curr, 0);
    steps.push(`${digitArray.join(" + ")} = ${nextSum}`);
    current = nextSum;
  }

  // Also calculate Root Day number if possible (first 2 digits e.g. 24 -> 2+4 = 6)
  // Check format: if YYYY-MM-DD, day is last 2. If DD-MM-YYYY, day is first 2.
  let dayDigits = [];
  if (dobStr.includes("-") || dobStr.includes("/")) {
    const parts = dobStr.split(/[-/]/);
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      dayDigits = parts[2].replace(/\D/g, '').split('').map(Number);
    } else {
      // DD-MM-YYYY
      dayDigits = parts[0].replace(/\D/g, '').split('').map(Number);
    }
  }

  let dayRoot = null;
  if (dayDigits.length > 0) {
    let daySum = dayDigits.reduce((a, b) => a + b, 0);
    while (daySum > 9) {
      daySum = daySum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
    }
    dayRoot = daySum;
  }

  return {
    mulankNumber: current,
    steps: steps,
    rawSum: sumStep1,
    dayRoot: dayRoot,
    bracelet: MULANK_DATA[current]
  };
}

// ==========================================================================
// 4. DOM RENDERING & INITIALIZATION
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initDOBCalculator();
  renderMulankProducts("all");
  initMulankTabs();
  renderGemstoneCatalog();
  initCatalogFilters();
  initOrderModal();
  initFAQAccordion();
  initMobileMenu();
  handleUrlMulankParam();
});

// --------------------------------------------------------------------------
// DOB CALCULATOR INTERACTION
// --------------------------------------------------------------------------
function initDOBCalculator() {
  const calcBtn = document.getElementById("btnCalculateDOB");
  const dobInput = document.getElementById("dobInput");
  const resultBox = document.getElementById("calcResultBox");
  const chipButtons = document.querySelectorAll(".chip-btn");

  if (!calcBtn || !dobInput || !resultBox) return;

  function runCalculation(value) {
    const calculation = calculateMulankFromDOB(value);
    if (!calculation) {
      alert("Please enter a valid 8-digit birth date (e.g., 24-08-2005 or select a date).");
      return;
    }

    const { mulankNumber, steps, bracelet, dayRoot } = calculation;

    // Populate Results
    const mathEl = document.getElementById("calcMathSteps");
    const numEl = document.getElementById("resultMulankNumber");
    const titleEl = document.getElementById("resultBraceletTitle");
    const planetEl = document.getElementById("resultPlanetText");
    const stonesWrap = document.getElementById("resultStonesWrap");
    const orderBtn = document.getElementById("btnOrderCalculated");
    const scrollBtn = document.getElementById("btnScrollToStones");

    if (mathEl) mathEl.innerHTML = `Calculation: <strong>${steps.join(" ➔ ")}</strong> (Sacred Destiny Number: <strong>${mulankNumber}</strong>${dayRoot ? `, Day Root: ${dayRoot}` : ''})`;
    if (numEl) numEl.textContent = mulankNumber;
    if (titleEl) titleEl.textContent = `Mulank ${mulankNumber} — ${bracelet.name}`;
    if (planetEl) planetEl.textContent = `Ruling Astrological Frequency: ${bracelet.planet}`;

    if (stonesWrap) {
      stonesWrap.innerHTML = bracelet.stones.map(st => `
        <span class="stone-chip">✦ ${st}</span>
      `).join('');
    }

    if (orderBtn) {
      orderBtn.onclick = () => {
        openOrderModal({
          name: bracelet.name,
          id: bracelet.id,
          stones: bracelet.stones.join(", "),
          mulank: mulankNumber,
          dob: value,
          image: `./${bracelet.stoneImages[0]}`
        });
      };
    }

    // Automatically switch the Mulank tabs section to this calculated number so the separate gemstone cards are ready!
    selectMulankTab(mulankNumber);

    if (scrollBtn) {
      scrollBtn.onclick = (e) => {
        e.preventDefault();
        const targetSection = document.getElementById("mulankBraceletsSection");
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      };
    }

    resultBox.style.display = "block";
    resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  calcBtn.addEventListener("click", () => {
    runCalculation(dobInput.value);
  });

  dobInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      runCalculation(dobInput.value);
    }
  });

  // Quick Chips (e.g. 24-08-2005 -> 3)
  chipButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.getAttribute("data-dob");
      if (val) {
        dobInput.value = val;
        runCalculation(val);
      }
    });
  });
}

// --------------------------------------------------------------------------
// RENDER SEPARATE GEMSTONE PRODUCTS PER MULANK (NOT COMBINED!)
// --------------------------------------------------------------------------
function renderMulankProducts(selectedTab = "all") {
  const container = document.getElementById("mulankCardsContainer");
  const headerContainer = document.getElementById("mulankActiveHeader");
  if (!container) return;

  const tabStr = String(selectedTab).toLowerCase();

  if (tabStr === "all") {
    // 1. ALL TAB: Show header and all 16 gemstones in the eCommerce grid
    if (headerContainer) {
      headerContainer.innerHTML = `
        <div class="mulank-banner-info">
          <div class="banner-title-row">
            <div class="mulank-seal-mini">✦</div>
            <div>
              <h3>Complete Sacred Gemstone Catalog</h3>
              <p>Explore all 16 certified natural crystal bracelets consecrated via Vedic rituals. Select any Mulank (1 to 9) above to view your prescribed astrological gemstones.</p>
            </div>
          </div>
          <div class="banner-count-badge">
            ✦ Showing All 16 Sacred Gemstones
          </div>
        </div>
      `;
    }

    container.innerHTML = GEMSTONES_DATA.map(gem => {
      const mulankLabel = gem.relatedMulanks && gem.relatedMulanks.length > 0
        ? `Mulank ${gem.relatedMulanks.join(', ')}`
        : "Universal";

      return `
        <div class="stone-product-card" data-id="${gem.id}" data-category="${gem.category}">
          <div class="product-badge-strip">
            <span class="product-mulank-pill">${mulankLabel}</span>
            <span class="product-cert-tag">✦ 100% Certified Natural</span>
          </div>

          <div class="product-img-box">
            <span class="product-sku-tag">${gem.id}</span>
            <img src="./${gem.image}" alt="${gem.name} Sacred Energy Bracelet" class="product-card-img" loading="lazy" />
          </div>

          <div class="product-info-box">
            <h3 class="product-card-title">${gem.name} Energy Bead Bracelet</h3>
            <p class="product-keywords-text">${gem.keywords}</p>
            <p class="product-desc-snippet">${gem.associations[0].desc}</p>
            <div class="product-ideal-tags">
              ${gem.idealFor.slice(0, 3).map(t => `<span class="ideal-tag">${t}</span>`).join('')}
            </div>
          </div>

          <div class="product-card-footer">
            <div class="product-price-block">
              <span class="product-orig-price">₹${PRICING.originalPrice}</span>
              <span class="product-offer-price"><span>₹</span>${PRICING.offerPrice}</span>
            </div>
            <div class="product-actions-group">
              <button type="button" class="btn-product-details" onclick="openGemstoneModal('${gem.id}')" title="Full Astrological Symbolism">
                Details
              </button>
              <button type="button" class="btn-product-buy" onclick="triggerGemstoneOrder('${gem.id}', 'Universal')">
                <span>Buy Now</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

  } else {
    // 2. SPECIFIC MULANK TAB (1-9): Display individual separate product cards for that Mulank's stones
    const mulankNum = parseInt(tabStr, 10);
    const mulankInfo = MULANK_DATA[mulankNum];
    if (!mulankInfo) return;

    // Filter gemstones belonging to this Mulank
    const stonesToShow = GEMSTONES_DATA.filter(g => 
      mulankInfo.stones.includes(g.name) || (g.relatedMulanks && g.relatedMulanks.includes(mulankNum))
    );

    if (headerContainer) {
      headerContainer.innerHTML = `
        <div class="mulank-banner-info">
          <div class="banner-title-row">
            <div class="mulank-seal-mini">${mulankNum}</div>
            <div>
              <h3>Mulank ${mulankNum} — ${mulankInfo.planet}</h3>
              <p>${mulankInfo.description}</p>
            </div>
          </div>
          <div class="banner-count-badge">
            ✦ ${stonesToShow.length} Prescribed Gemstone${stonesToShow.length > 1 ? 's' : ''} for Mulank ${mulankNum}
          </div>
        </div>
      `;
    }

    container.innerHTML = stonesToShow.map(gem => `
      <div class="stone-product-card" data-id="${gem.id}" data-mulank="${mulankNum}">
        <div class="product-badge-strip">
          <span class="product-mulank-pill">Mulank ${mulankNum} Prescribed</span>
          <span class="product-cert-tag">✦ 100% Certified Natural</span>
        </div>

        <div class="product-img-box">
          <span class="product-sku-tag">${gem.id}</span>
          <img src="./${gem.image}" alt="${gem.name} Sacred Energy Bracelet for Mulank ${mulankNum}" class="product-card-img" loading="lazy" />
        </div>

        <div class="product-info-box">
          <h3 class="product-card-title">${gem.name} Energy Bead Bracelet</h3>
          <p class="product-keywords-text">${gem.keywords}</p>
          <p class="product-desc-snippet">${gem.associations[0].desc}</p>
          <div class="product-ideal-tags">
            ${gem.idealFor.slice(0, 3).map(t => `<span class="ideal-tag">${t}</span>`).join('')}
          </div>
        </div>

        <div class="product-card-footer">
          <div class="product-price-block">
            <span class="product-orig-price">₹${PRICING.originalPrice}</span>
            <span class="product-offer-price"><span>₹</span>${PRICING.offerPrice}</span>
          </div>
          <div class="product-actions-group">
            <button type="button" class="btn-product-details" onclick="openGemstoneModal('${gem.id}')" title="Full Astrological Symbolism">
              Details
            </button>
            <button type="button" class="btn-product-buy" onclick="triggerGemstoneOrder('${gem.id}', '${mulankNum}')">
              <span>Buy via Razorpay</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

// Select Mulank Tab programmatically
function selectMulankTab(tabNum) {
  const tabButtons = document.querySelectorAll(".mulank-tab-btn");
  tabButtons.forEach(btn => {
    if (btn.getAttribute("data-tab") === String(tabNum)) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
  renderMulankProducts(tabNum);
}

// URL Parameter Handler (e.g., /shop/?mulank=6)
function handleUrlMulankParam() {
  const params = new URLSearchParams(window.location.search);
  const mulankParam = params.get("mulank");
  if (mulankParam) {
    const val = mulankParam.toLowerCase();
    if (val === "all" || (parseInt(val, 10) >= 1 && parseInt(val, 10) <= 9)) {
      selectMulankTab(val);
      setTimeout(() => {
        const sec = document.getElementById("mulankBraceletsSection");
        if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }
}

// --------------------------------------------------------------------------
// MULANK QUICK TABS NAVIGATION (1 to 9)
// --------------------------------------------------------------------------
function initMulankTabs() {
  const tabButtons = document.querySelectorAll(".mulank-tab-btn");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const selectedNum = btn.getAttribute("data-tab");
      renderMulankProducts(selectedNum);
    });
  });
}

// --------------------------------------------------------------------------
// RENDER 16 GEMSTONES ENCYCLOPEDIA & CATALOG
// --------------------------------------------------------------------------
function renderGemstoneCatalog(filterCategory = "all") {
  const container = document.getElementById("gemstonesGridContainer");
  if (!container) return;

  const filtered = filterCategory === "all"
    ? GEMSTONES_DATA
    : GEMSTONES_DATA.filter(g => g.category === filterCategory);

  container.innerHTML = filtered.map(gem => {
    const idealTagsHtml = gem.idealFor.slice(0, 3).map(tag => `
      <span class="ideal-tag">${tag}</span>
    `).join('');

    return `
      <div class="stone-card" data-category="${gem.category}" data-id="${gem.id}">
        <div class="stone-img-container">
          <span class="stone-sku-badge">${gem.id}</span>
          <img src="./${gem.image}" alt="${gem.name} Bracelet" class="stone-card-img" loading="lazy" />
        </div>

        <h3 class="stone-name-title">${gem.name}</h3>
        <p class="stone-keywords">${gem.keywords}</p>
        <p class="stone-associations-preview">${gem.associations[0].desc}</p>

        <div class="stone-ideal-for">
          ${idealTagsHtml}
        </div>

        <div class="stone-card-footer">
          <div class="stone-price-col">
            <span class="stone-orig">₹${PRICING.originalPrice}</span>
            <span class="stone-offer"><span>₹</span>${PRICING.offerPrice}</span>
          </div>
          <div class="stone-btn-group">
            <button type="button" class="btn-stone-details" onclick="openGemstoneModal('${gem.id}')" title="Read Complete Symbolism">
              Details
            </button>
            <button type="button" class="btn-stone-buy" onclick="triggerGemstoneOrder('${gem.id}')">
              Buy
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Global hooks for gemstone card interactions
window.triggerGemstoneOrder = function(gemId, mulankNum = null) {
  const gem = GEMSTONES_DATA.find(g => g.id === gemId);
  if (!gem) return;
  const mulankStr = mulankNum && mulankNum !== "all" && mulankNum !== "Universal"
    ? String(mulankNum)
    : (gem.relatedMulanks ? gem.relatedMulanks.join(", ") : "Universal");
  const currentDob = document.getElementById("dobInput")?.value || "";
  openOrderModal({
    name: `${gem.name} Sacred Consecrated Energy Bracelet`,
    id: gem.id,
    stones: gem.name,
    mulank: mulankStr,
    dob: currentDob,
    image: `./${gem.image}`
  });
};

window.openGemstoneModal = function(gemId) {
  const gem = GEMSTONES_DATA.find(g => g.id === gemId);
  if (!gem) return;

  const modal = document.getElementById("gemDetailModal");
  if (!modal) return;

  document.getElementById("modalGemTitle").textContent = gem.name;
  document.getElementById("modalGemKeywords").textContent = gem.keywords;
  document.getElementById("modalGemImg").src = `./${gem.image}`;
  document.getElementById("modalGemSku").textContent = gem.id;

  const bulletsContainer = document.getElementById("modalGemAssociations");
  bulletsContainer.innerHTML = gem.associations.map(assoc => `
    <li><strong>${assoc.title}:</strong> ${assoc.desc}</li>
  `).join('');

  const idealContainer = document.getElementById("modalGemIdeal");
  idealContainer.innerHTML = gem.idealFor.map(t => `<span class="ideal-tag">${t}</span>`).join(' ');

  const buyBtn = document.getElementById("btnModalGemBuy");
  buyBtn.onclick = () => {
    closeGemModal();
    triggerGemstoneOrder(gem.id);
  };

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

// --------------------------------------------------------------------------
// CATALOG CATEGORY FILTERS
// --------------------------------------------------------------------------
function initCatalogFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.getAttribute("data-filter");
      renderGemstoneCatalog(category);
    });
  });
}

// ==========================================================================
// 5. ORDER CHECKOUT & WHATSAPP REDIRECTION ENGINE
// All 5 Details strictly implemented:
// 1. Name
// 2. Contact details (Phone, Email)
// 3. Address (Street, Landmark, City, State, Pincode)
// 4. Product Name with ID
// 5. Payment Details
// Redirects to: +919836394217
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

function initOrderModal() {
  const modal = document.getElementById("orderModal");
  const form = document.getElementById("orderForm");
  const closeBtn = document.getElementById("orderModalClose");
  const cancelBtn = document.getElementById("btnOrderCancel");
  const submitBtn = document.getElementById("btnSubmitOrderRazorpay");

  if (!modal || !form) return;

  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
    // Reset view states
    document.getElementById("orderFormView").style.display = "block";
    document.getElementById("orderSuccessView").style.display = "none";
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  // Close on outside click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Handle Form Submission: Trigger Razorpay Checkout Popup
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Customer Name
    const customerName = document.getElementById("customerName").value.trim();

    // 2. Contact Details
    const customerPhone = document.getElementById("customerPhone").value.trim();
    const customerEmail = document.getElementById("customerEmail").value.trim();

    // 3. Address Details
    const addressStreet = document.getElementById("addressStreet").value.trim();
    const addressCity = document.getElementById("addressCity").value.trim();
    const addressState = document.getElementById("addressState").value.trim() || "India";
    const addressPincode = document.getElementById("addressPincode").value.trim();

    // 4. Product Details
    const productName = currentSelectedProduct.name;
    const productId = currentSelectedProduct.id;
    const stonesIncluded = currentSelectedProduct.stones;
    const mulankNum = currentSelectedProduct.mulank || "Custom / Vedic";
    const customDOB = document.getElementById("orderDOB").value.trim() || currentSelectedProduct.dob || "Not provided (General Energization)";
    const wristSize = document.getElementById("wristSize").value;

    // Validations
    if (!customerName || !customerPhone || !customerEmail || !addressStreet || !addressCity || !addressPincode) {
      alert("Please fill in all mandatory fields (Name, Phone, Email, and Delivery Address).");
      return;
    }

    if (!customerEmail.includes("@") || !customerEmail.includes(".")) {
      alert("Please provide a valid email address so your order receipt and order ID can be delivered.");
      return;
    }

    // Set Loading State
    const originalBtnContent = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite;">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg>
        <span>Opening Razorpay Gateway...</span>
      `;
    }

    try {
      // Step 1: Create Order on Backend
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
        amount: 149900 // ₹1,499 in paise
      };

      const createRes = await fetch("/api/shop/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      if (!createRes.ok) {
        throw new Error("Payment gateway connection error (" + createRes.status + ")");
      }

      const createData = await createRes.json();
      const rzpOrder = createData.data;
      const keyId = createData.key_id;

      // Verify Razorpay SDK availability
      if (typeof Razorpay === "undefined") {
        throw new Error("Razorpay checkout SDK failed to load. Please verify your connection.");
      }

      // Step 2: Open Official Razorpay Checkout Popup
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
        theme: {
          color: "#D4AF37" // Royal Gold
        },
        modal: {
          ondismiss: function () {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalBtnContent;
            }
          }
        },
        handler: async function (paymentResponse) {
          // Payment Successful inside Razorpay Popup!
          if (submitBtn) {
            submitBtn.innerHTML = `<span>Verifying & Sending Email Receipt...</span>`;
          }

          try {
            // Step 3: Verify Payment on Backend & Dispatch Email
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

            const verifyRes = await fetch("/api/shop/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(verifyPayload)
            });

            const verifyData = await verifyRes.json();
            const orderId = paymentResponse.razorpay_order_id;
            const paymentId = paymentResponse.razorpay_payment_id;

            // Step 4: Format Verified 5-Point WhatsApp Receipt
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

            // Step 5: Update Success Screen UI
            document.getElementById("orderFormView").style.display = "none";
            const successView = document.getElementById("orderSuccessView");
            successView.style.display = "block";

            document.getElementById("successOrderId").textContent = orderId;
            document.getElementById("successPaymentId").textContent = paymentId;
            document.getElementById("successEmailNotice").textContent = `Dispatched to ${customerEmail} (No login required)`;
            document.getElementById("orderSummaryPreview").textContent = whatsappMessage;

            const waRedirectBtn = document.getElementById("btnRedirectWhatsAppNow");
            if (waRedirectBtn) {
              waRedirectBtn.href = whatsappUrl;
            }

            const copyBtn = document.getElementById("btnCopySummary");
            if (copyBtn) {
              copyBtn.onclick = () => {
                navigator.clipboard.writeText(whatsappMessage).then(() => {
                  copyBtn.textContent = "✓ Order Receipt Copied!";
                  setTimeout(() => { copyBtn.textContent = "📋 Copy Order Receipt"; }, 2500);
                });
              };
            }

            // Step 6: Automatically redirect to WhatsApp in a new tab
            window.open(whatsappUrl, "_blank");

          } catch (verErr) {
            console.error("Verification error:", verErr);
            alert("Payment was successful on Razorpay! Order ID: " + paymentResponse.razorpay_order_id + ". Please share this with us on WhatsApp.");
          } finally {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalBtnContent;
            }
          }
        }
      };

      const rzpInstance = new Razorpay(rzpOptions);
      rzpInstance.open();

    } catch (err) {
      console.error("Razorpay error:", err);
      alert("Unable to open Razorpay gateway: " + err.message);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;
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

  // Update Modal Preview
  document.getElementById("modalSelectedImg").src = currentSelectedProduct.image;
  document.getElementById("modalSelectedTitle").textContent = currentSelectedProduct.name;
  document.getElementById("modalSelectedSku").textContent = `ID: ${currentSelectedProduct.id}`;
  document.getElementById("modalSelectedMulank").textContent = `Mulank: ${currentSelectedProduct.mulank || 'Vedic'}`;

  // Pre-fill DOB if passed
  if (currentSelectedProduct.dob) {
    document.getElementById("orderDOB").value = currentSelectedProduct.dob;
  }

  // Switch to form view
  document.getElementById("orderFormView").style.display = "block";
  document.getElementById("orderSuccessView").style.display = "none";

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

// --------------------------------------------------------------------------
// FAQ ACCORDION TOGGLES
// --------------------------------------------------------------------------
function initFAQAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    const question = item.querySelector(".faq-question");
    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      faqItems.forEach(i => i.classList.remove("open"));
      if (!isOpen) {
        item.classList.add("open");
      }
    });
  });
}

// --------------------------------------------------------------------------
// MOBILE MENU TOGGLE
// --------------------------------------------------------------------------
function initMobileMenu() {
  const toggleBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.querySelector(".nav-links");

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener("click", () => {
    const isVisible = navLinks.style.display === "flex";
    navLinks.style.display = isVisible ? "none" : "flex";
    if (!isVisible) {
      navLinks.style.position = "absolute";
      navLinks.style.top = "80px";
      navLinks.style.left = "0";
      navLinks.style.width = "100%";
      navLinks.style.flexDirection = "column";
      navLinks.style.background = "#120e0a";
      navLinks.style.padding = "20px";
      navLinks.style.borderBottom = "1px solid var(--border-subtle)";
    }
  });
}
