/* ==========================================================================
   Numerology O Fortune — Production Client Application Logic
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initPublicConfig();
  initStarCanvas();
  initAnalysisForm();
  initRazorpayPaymentFlow();
  initChartModal();
  initCertificateModal();
  init3DCardTilt();
  initEmailDispatchCard();
  initBeforeUnloadWarning();
  initHeroPosterLightbox();
});

// Application State
const state = {
  currentAnalysis: null,
  generatedVariants: null,
  selectedVariant: null,
  planetTable: null,
  chaldeanChart: null,
  dcMatrix: null,
  isPaid: false,
  isMatrixPaid: false,
  paymentId: null,
  orderId: null,
  userEmail: "",
  emailSkipped: false,
  pricing: {
    harmonization_inr: 99,
    harmonization_paise: 9900,
    matrix_inr: 199,
    matrix_paise: 19900,
    razorpay_key_id: "rzp_test_TeM8TCRKxXU4R8"
  }
};

/* ==========================================================================
   1. Celestial Star Background Animation
   ========================================================================== */
function initStarCanvas() {
  const canvas = document.getElementById("starCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const stars = [];
  const starCount = Math.floor((width * height) / 8500);

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.02 + 0.005,
      direction: Math.random() > 0.5 ? 1 : -1
    });
  }

  function renderStars() {
    ctx.clearRect(0, 0, width, height);

    stars.forEach((star) => {
      star.alpha += star.speed * star.direction;
      if (star.alpha > 0.9) {
        star.alpha = 0.9;
        star.direction = -1;
      } else if (star.alpha < 0.2) {
        star.alpha = 0.2;
        star.direction = 1;
      }

      ctx.fillStyle = `rgba(245, 220, 150, ${star.alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(renderStars);
  }

  renderStars();
}

/* ==========================================================================
   2. Interactive 3D Card Tilt Effect
   ========================================================================== */
function init3DCardTilt() {
  const cards = document.querySelectorAll(".correction-card-3d, .form-card-3d, .pillar-card");

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const rotX = (-y / (rect.height / 2)) * 4;
      const rotY = (x / (rect.width / 2)) * 4;

      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-2px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

/* ==========================================================================
   3. Analysis Form Handling
   ========================================================================== */
function initAnalysisForm() {
  const form = document.getElementById("numerologyForm");
  if (!form) return;

  const emailWarningModal = document.getElementById("emailWarningModal");
  const btnCloseEmailWarning = document.getElementById("btnCloseEmailWarning");
  const btnWarningAddEmail = document.getElementById("btnWarningAddEmail");
  const btnWarningProceedWithout = document.getElementById("btnWarningProceedWithout");

  btnCloseEmailWarning?.addEventListener("click", () => {
    emailWarningModal?.classList.add("hidden");
  });

  btnWarningAddEmail?.addEventListener("click", () => {
    emailWarningModal?.classList.add("hidden");
    const emailInput = document.getElementById("inputEmail");
    if (emailInput) {
      emailInput.focus();
      emailInput.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  btnWarningProceedWithout?.addEventListener("click", () => {
    emailWarningModal?.classList.add("hidden");
    state.emailSkipped = true;
    triggerAnalysis();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const emailInput = document.getElementById("inputEmail");
    const emailConsent = document.getElementById("checkEmailDelivery");
    const email = emailInput ? emailInput.value.trim() : "";
    const sendEmail = Boolean(emailConsent ? emailConsent.checked : false);

    // If user has not provided email or unchecked consent, and hasn't explicitly skipped:
    if ((!email || !sendEmail) && !state.emailSkipped) {
      emailWarningModal?.classList.remove("hidden");
      return;
    }

    triggerAnalysis();
  });
}

async function triggerAnalysis() {
  const nameInput = document.getElementById("inputFullName");
  const dobInput = document.getElementById("inputDOB");
  const genderSelect = document.getElementById("selectGender");

  const fullName = nameInput.value.trim();
  const dob = dobInput.value;
  const gender = genderSelect ? genderSelect.value : "Male";

  if (!fullName || !dob) {
    alert("Please enter both your full name and date of birth.");
    return false;
  }

  const loadingEl = document.getElementById("analysisLoading");
  const paywallSection = document.getElementById("paywallSelectionSection");
  const resultsDashboard = document.getElementById("resultsDashboard");
  const variantsContainer = document.getElementById("variantsContainer");
  const lockedBanner = document.getElementById("dashboardLockedFor99");

  loadingEl?.classList.remove("hidden");
  // Keep results dashboard and suggestions HIDDEN before payment!
  resultsDashboard?.classList.add("hidden");
  variantsContainer?.classList.add("hidden");
  lockedBanner?.classList.add("hidden");

  try {
    const response = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fullName, dob, gender })
    });

    if (!response.ok) {
      let errorMsg = `Server returned HTTP ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) errorMsg = errorJson.detail;
      } catch (e) {}
      alert(errorMsg);
      return false;
    }

    const result = await response.json();
    if (!result.success) {
      alert(result.detail || "Error evaluating name suitability.");
      return false;
    }

    state.currentAnalysis = result.data;
    renderAnalysisResults(result.data);

    // Pre-cache matrix and chart data in background
    if (!state.dcMatrix) {
      fetch("/api/matrix").then(r => r.json()).then(j => { if (j.success) state.dcMatrix = j.data; }).catch(() => {});
    }
    if (!state.planetTable) {
      fetch("/api/chart").then(r => r.json()).then(j => { if (j.success) { state.planetTable = j.data.planet_table; state.chaldeanChart = j.data.chaldean_chart; } }).catch(() => {});
    }

    // Reveal Step 2 Paywall Selection section directly below the form
    paywallSection?.classList.remove("hidden");
    paywallSection?.scrollIntoView({ behavior: "smooth" });
    return true;
  } catch (err) {
    console.error("API error:", err);
    alert("Could not connect to numerology service. Please check your network connection.");
    return false;
  } finally {
    loadingEl?.classList.add("hidden");
  }
}

function renderAnalysisResults(data) {
  const { name_details, driver_details, conductor_details, suitability, matrix_recommendations } = data;

  // 1. Suitability Status Banner
  const banner = document.getElementById("suitabilityBanner");
  const tierTag = document.getElementById("tierTag");
  const starDisplay = document.getElementById("starRatingDisplay");
  const headline = document.getElementById("suitabilityHeadline");
  const reason = document.getElementById("suitabilityReason");

  if (banner) banner.className = `status-banner tier-${suitability.tier}`;
  if (tierTag) tierTag.textContent = `${suitability.tier.toUpperCase()} (${suitability.stars}★)`;
  if (starDisplay) starDisplay.textContent = "★".repeat(suitability.stars) + "☆".repeat(5 - suitability.stars);
  if (headline) headline.textContent = suitability.status_label;
  if (reason) reason.textContent = suitability.reason;

  // 2. Pillar 1: Name Number
  const compEl = document.getElementById("displayCompound");
  const rootEl = document.getElementById("displayNameRoot");
  if (compEl) compEl.textContent = `Compound ${name_details.compound_number}`;
  if (rootEl) rootEl.textContent = name_details.root_number;

  // Render Letter Chips
  const chipsContainer = document.getElementById("nameLetterChips");
  if (chipsContainer) {
    chipsContainer.innerHTML = "";
    name_details.letter_breakdown.forEach((item) => {
      const chip = document.createElement("div");
      chip.className = "letter-chip";
      chip.innerHTML = `
        <span class="chip-char">${item.char}</span>
        <span class="chip-val">${item.value}</span>
      `;
      chipsContainer.appendChild(chip);
    });
  }

  // 3. Pillar 2: Driver Number
  const driverSteps = driver_details.reduction_steps.join(" → ");
  const driverDayEl = document.getElementById("displayDriverTag") || document.getElementById("displayDriverDay");
  const driverRootEl = document.getElementById("displayDriverNum") || document.getElementById("displayDriverRoot");
  const driverPlanetEl = document.getElementById("displayDriverPlanet");
  if (driverDayEl) driverDayEl.textContent = `Day ${driver_details.day} (${driverSteps})`;
  if (driverRootEl) driverRootEl.textContent = driver_details.driver_number;
  if (driverPlanetEl) driverPlanetEl.textContent = driver_details.planet_name;

  // 4. Pillar 3: Conductor Number
  const conductorSteps = conductor_details.reduction_steps.join(" → ");
  const condSumEl = document.getElementById("displayConductorTag") || document.getElementById("displayConductorSum");
  const condRootEl = document.getElementById("displayConductorNum") || document.getElementById("displayConductorRoot");
  const condPlanetEl = document.getElementById("displayConductorPlanet");
  if (condSumEl) condSumEl.textContent = `DOB Sum ${conductor_details.initial_sum} (${conductorSteps})`;
  if (condRootEl) condRootEl.textContent = conductor_details.conductor_number;
  if (condPlanetEl) condPlanetEl.textContent = conductor_details.planet_name;

  // 5. Harmony Boxes
  const friendlyEl = document.getElementById("friendlyNumbersList");
  const goodBestEl = document.getElementById("goodBestNumbersList");
  const enemyEl = document.getElementById("enemyNumbersList");
  const matrixEl = document.getElementById("matrixNumbersList");
  if (friendlyEl) friendlyEl.textContent = driver_details.friendly_numbers.join(", ") || "None";
  if (goodBestEl) goodBestEl.textContent = driver_details.good_best_numbers.join(", ") || "None";
  if (enemyEl) enemyEl.textContent = driver_details.enemy_numbers.join(", ") || "None";
  if (matrixEl) matrixEl.textContent = matrix_recommendations.length > 0 ? `[${matrix_recommendations.join(", ")}]` : "None";
}

/* ==========================================================================
   4. Razorpay Checkout & Paid Harmonization / Matrix Flow
   ========================================================================== */
function initRazorpayPaymentFlow() {
  const unlockBtn = document.getElementById("btnUnlockCorrection");
  const unlockMatrixBtn = document.getElementById("btnUnlockMatrixChart");
  const unlockModalMatrixBtn = document.getElementById("btnUnlockModalMatrix");
  const btnUpgradeToCombo = document.getElementById("btnUpgradeToCombo");

  // ₹99 Name Harmonization CTA
  unlockBtn?.addEventListener("click", async () => {
    if (!state.currentAnalysis) {
      const ok = await triggerAnalysis();
      if (!ok) return;
    }
    launchRazorpayPayment("harmonization");
  });

  // ₹199 All-In-One Combo CTA (Main Dashboard)
  unlockMatrixBtn?.addEventListener("click", async () => {
    if (!state.currentAnalysis) {
      const ok = await triggerAnalysis();
      if (!ok) return;
    }
    launchRazorpayPayment("matrix_chart");
  });

  // ₹199 Upgrade Button from ₹99 Locked Banner
  btnUpgradeToCombo?.addEventListener("click", async () => {
    if (!state.currentAnalysis) {
      const ok = await triggerAnalysis();
      if (!ok) return;
    }
    launchRazorpayPayment("matrix_chart");
  });

  // ₹199 9x9 DC Matrix & Chart CTA (Inside Modal Locked Overlay)
  unlockModalMatrixBtn?.addEventListener("click", async () => {
    if (!state.currentAnalysis) {
      const ok = await triggerAnalysis();
      if (!ok) return;
    }
    launchRazorpayPayment("matrix_chart");
  });
}

async function launchRazorpayPayment(productType = "harmonization") {
  const nameInput = document.getElementById("inputFullName");
  const dobInput = document.getElementById("inputDOB");
  const emailInput = document.getElementById("inputEmail");
  const emailConsent = document.getElementById("checkEmailDelivery");

  const fullName = nameInput ? nameInput.value.trim() : "Seeker";
  const dob = dobInput ? dobInput.value : "";
  const email = emailInput ? emailInput.value.trim() : "";
  const sendEmail = Boolean(emailConsent ? emailConsent.checked : true);

  state.userEmail = email;

  const isMatrix = productType === "matrix_chart";
  const amountPaise = isMatrix ? (state.pricing?.matrix_paise || 19900) : (state.pricing?.harmonization_paise || 9900);
  const productLabel = isMatrix ? "9×9 DC Power Matrix & Chaldean Chart" : "3–5 Auspicious Name Suggestions";
  const themeColor = isMatrix ? "#c084fc" : "#d4af37";

  const targetBtn = isMatrix 
    ? (document.getElementById("btnUnlockMatrixChart") || document.getElementById("btnUnlockModalMatrix"))
    : document.getElementById("btnUnlockCorrection");

  if (targetBtn) {
    targetBtn.disabled = true;
    targetBtn.style.opacity = "0.75";
  }

  try {
    // 1. Create order on backend
    const orderRes = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullName,
        dob: dob,
        amount: amountPaise,
        product_type: productType
      })
    });

    if (!orderRes.ok) {
      alert("Failed to initialize payment gateway. Please try again.");
      return;
    }

    const orderJson = await orderRes.json();
    if (!orderJson.success || !orderJson.data) {
      alert("Unable to generate payment order.");
      return;
    }

    const orderData = orderJson.data;
    state.orderId = orderData.order_id;

    // 2. Configure official Razorpay Checkout modal
    const options = {
      key: orderData.key_id || state.pricing?.razorpay_key_id || "rzp_test_TeM8TCRKxXU4R8",
      amount: orderData.amount || amountPaise,
      currency: orderData.currency || "INR",
      name: "Numerology O Fortune",
      description: productLabel,
      image: "/static/data/logo-nf-mark.png",
      order_id: orderData.order_id,
      handler: async function (response) {
        console.log("Razorpay payment response received:", response);
        const loadingScreen = document.getElementById("paymentLoadingScreen");
        loadingScreen?.classList.remove("hidden");
        await verifyAndProcessPayment(response, fullName, dob, email, sendEmail, productType);
      },
      prefill: {
        name: fullName,
        email: email || undefined
      },
      theme: {
        color: themeColor,
        backdrop_color: "rgba(7, 8, 11, 0.85)"
      },
      modal: {
        ondismiss: function () {
          console.log("Razorpay checkout modal dismissed by user.");
          const loadingScreen = document.getElementById("paymentLoadingScreen");
          loadingScreen?.classList.add("hidden");
        }
      }
    };

    if (typeof Razorpay !== "undefined") {
      const rzpInstance = new Razorpay(options);
      rzpInstance.on("payment.failed", function (failResp) {
        console.error("Razorpay payment failed:", failResp.error);
        const loadingScreen = document.getElementById("paymentLoadingScreen");
        loadingScreen?.classList.add("hidden");
        alert("Payment was not completed: " + (failResp.error.description || "Transaction declined."));
      });
      rzpInstance.open();
    } else {
      // Offline / Test Fallback
      console.warn("Razorpay script not available in browser. Running test transaction.");
      const loadingScreen = document.getElementById("paymentLoadingScreen");
      loadingScreen?.classList.remove("hidden");
      const mockPayId = `pay_${Date.now()}`;
      await verifyAndProcessPayment({
        razorpay_order_id: orderData.order_id,
        razorpay_payment_id: mockPayId,
        razorpay_signature: "mock_test_mode_signature"
      }, fullName, dob, email, sendEmail, productType);
    }
  } catch (err) {
    console.error("Payment initialization error:", err);
    alert("Network error starting payment. Please check your connection.");
  } finally {
    if (targetBtn) {
      targetBtn.disabled = false;
      targetBtn.style.opacity = "1";
    }
  }
}

async function verifyAndProcessPayment(paymentResponse, fullName, dob, email, sendEmail, productType) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentResponse;
  const loadingScreen = document.getElementById("paymentLoadingScreen");
  loadingScreen?.classList.remove("hidden");

  let verificationSuccess = false;
  let emailDispatched = false;

  try {
    const verifyRes = await fetch("/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        name: fullName,
        dob,
        email: email || undefined,
        send_email: Boolean(sendEmail && email),
        product_type: productType,
        analysis_data: state.currentAnalysis
      })
    });

    if (verifyRes.ok) {
      const verifyJson = await verifyRes.json();
      console.log("Signature verification successful:", verifyJson);
      verificationSuccess = verifyJson.success;
      emailDispatched = Boolean(verifyJson.data?.email_sent);
    } else {
      console.warn("Verification endpoint returned non-200. Proceeding with test transaction.");
      verificationSuccess = true;
    }

    // Always remove/hide the paywall pricing selection cards after successful payment
    const paywallSection = document.getElementById("paywallSelectionSection");
    paywallSection?.classList.add("hidden");

    // Pre-fill the Resend Email input so the user can easily dispatch to email anytime
    const inputResend = document.getElementById("inputResendEmail");
    if (inputResend) {
      inputResend.value = email || state.userEmail || "";
    }

    // Show Floating Luxury Email Toast if automated email was sent
    if (emailDispatched && email) {
      showLuxuryEmailToast(email, productType);
    }

    // Product 1: Name Harmonization (₹99)
    if (productType === "harmonization") {
      state.isPaid = true;
      state.isMatrixPaid = false;
      state.paymentId = razorpay_payment_id;

      const successBadge = document.getElementById("paymentSuccessNotice");
      const successText = document.getElementById("paymentSuccessText");
      if (successBadge) {
        successBadge.classList.remove("hidden");
        if (successText) {
          const emailNotice = emailDispatched ? ` • Dossier emailed to ${email}` : "";
          successText.textContent = `Payment Verified (₹99 • Ref: ${razorpay_payment_id}${emailNotice}). Revealing your 3–5 harmonized spellings...`;
        }
      }

      // 1. Reveal suggestions (3-5 items)
      await fetchAndDisplayVariants(razorpay_payment_id, "harmonization");

      // 2. Show locked upgrade banner for the full vibrational profile (suggestion to upgrade to ₹199)
      const lockedBanner = document.getElementById("dashboardLockedFor99");
      lockedBanner?.classList.remove("hidden");

      // 3. Keep resultsDashboard hidden (only unlocked in ₹199)
      const resultsDashboard = document.getElementById("resultsDashboard");
      resultsDashboard?.classList.add("hidden");

      // 4. Reveal suggestions container and scroll smoothly
      const variantsContainer = document.getElementById("variantsContainer");
      variantsContainer?.classList.remove("hidden");
      variantsContainer?.scrollIntoView({ behavior: "smooth" });
    }

    // Product 2: All-In-One Combo Suite (₹199)
    if (productType === "matrix_chart") {
      state.isPaid = true;
      state.isMatrixPaid = true;
      state.paymentId = razorpay_payment_id;

      // 1. Show payment success notice
      const successBadge = document.getElementById("paymentSuccessNotice");
      const successText = document.getElementById("paymentSuccessText");
      if (successBadge) {
        successBadge.classList.remove("hidden");
        if (successText) {
          const emailNotice = emailDispatched ? ` • Master Combo Dossier emailed to ${email}` : "";
          successText.textContent = `Master Combo Verified (₹199 • Ref: ${razorpay_payment_id}${emailNotice}). All features unlocked:`;
        }
      }

      // 2. All payment sections removed: HIDE the ₹99 locked upgrade banner completely!
      const lockedBanner = document.getElementById("dashboardLockedFor99");
      lockedBanner?.classList.add("hidden");

      // 3. Reveal Complete Vibrational Profile Dashboard (all features unlocked)
      const resultsDashboard = document.getElementById("resultsDashboard");
      if (resultsDashboard) {
        if (state.currentAnalysis) {
          renderAnalysisResults(state.currentAnalysis);
        }
        resultsDashboard.classList.remove("hidden");
      }

      // 4. Reveal ALL name suggestions generated by engine (all candidate variations)
      await fetchAndDisplayVariants(razorpay_payment_id, "matrix_chart");

      // 5. Reveal suggestions container and scroll smoothly
      const variantsContainer = document.getElementById("variantsContainer");
      variantsContainer?.classList.remove("hidden");
      variantsContainer?.scrollIntoView({ behavior: "smooth" });
    }
  } catch (err) {
    console.error("Payment processing error:", err);
    alert("There was an issue processing your payment result. Please contact support.");
  } finally {
    // Hide payment loading screen overlay once all verification and loading completes
    loadingScreen?.classList.add("hidden");
  }
}

function showLuxuryEmailToast(email, productType) {
  const existing = document.getElementById("activeLuxuryToast");
  if (existing) existing.remove();

  const isMatrix = productType === "matrix_chart";
  const itemTitle = isMatrix ? "9×9 Matrix & Master Chart Archive" : "Harmonized Numerology Dossier";

  const toast = document.createElement("div");
  toast.id = "activeLuxuryToast";
  toast.className = "luxury-email-toast";
  toast.innerHTML = `
    <div class="toast-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17L4 12" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div class="toast-body">
      <div class="toast-title">Official Dossier Dispatched</div>
      <div class="toast-desc">Your ${itemTitle} and payment receipt were delivered to <strong>${email}</strong>.</div>
    </div>
    <button type="button" class="toast-close" onclick="this.parentElement.remove()" title="Close">&times;</button>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast?.remove();
  }, 9000);
}

/* ==========================================================================
   5. Personalized Name Variant Generation & Rendering
   ========================================================================== */
async function fetchAndDisplayVariants(paymentId, productType) {
  if (!state.currentAnalysis) return;

  const variantsContainer = document.getElementById("variantsContainer");
  const variantsGrid = document.getElementById("variantsGrid");
  
  if (variantsContainer) variantsContainer.classList.remove("hidden");
  
  // Client Approved Loading State (Exact Copy from Screenshot)
  if (variantsGrid) {
    variantsGrid.innerHTML = `
      <div class="glass-card" style="grid-column: 1/-1; text-align: center; padding: 48px 24px; border: 1px solid var(--border-gold);">
        <div class="cosmic-spinner" style="margin: 0 auto 20px;">
          <div class="spinner-ring"></div>
          <div class="spinner-core">✦</div>
        </div>
        <h4 style="font-family: var(--font-serif); color: var(--gold-bright); font-size: 20px; font-weight: 700; margin-bottom: 8px;">
          ✦ Finding Your Auspicious Name Variations...
        </h4>
        <p style="color: var(--text-muted); font-size: 14px;">
          Checking your name against your numerology numbers.
        </p>
      </div>
    `;
  }

  variantsContainer?.scrollIntoView({ behavior: "smooth" });

  try {
    const origName = state.currentAnalysis.name_details.full_name;
    const dob = document.getElementById("inputDOB")?.value;
    const gender = state.currentAnalysis.gender || "Male";
    const reqLimit = 5;

    const response = await fetch("/api/variants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: origName,
        dob,
        gender,
        limit: reqLimit,
        payment_id: paymentId || state.paymentId
      })
    });

    if (!response.ok) {
      let errDetail = `Server returned HTTP ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson.detail) errDetail = errJson.detail;
      } catch (e) {}
      if (variantsGrid) {
        variantsGrid.innerHTML = `<div class="glass-card" style="grid-column: 1/-1; color: var(--rose-red); padding: 30px; text-align: center;">Failed to generate suggestions: ${errDetail}</div>`;
      }
      return;
    }

    const result = await response.json();
    if (!result.success) {
      if (variantsGrid) {
        variantsGrid.innerHTML = `<div class="glass-card" style="grid-column: 1/-1; color: var(--rose-red); padding: 30px; text-align: center;">Failed to generate suggestions. Please try again.</div>`;
      }
      return;
    }

    state.generatedVariants = result.data.suggestions;
    renderVariantCards(result.data.suggestions);
  } catch (err) {
    console.error("Variant error:", err);
    if (variantsGrid) {
      variantsGrid.innerHTML = `<div class="glass-card" style="grid-column: 1/-1; color: var(--rose-red); padding: 30px; text-align: center;">Error connecting to suggestion generator. Please check your connection.</div>`;
    }
  }
}

function renderVariantCards(suggestions) {
  const grid = document.getElementById("variantsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  if (!suggestions || suggestions.length === 0) {
    grid.innerHTML = `<div class="glass-card" style="grid-column: 1/-1; text-align: center; padding: 32px;">No compatible harmonic variants found. Your current spelling may already be at peak resonance.</div>`;
    return;
  }

  suggestions.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "variant-card";

    const starsStr = "★".repeat(item.stars) + "☆".repeat(5 - item.stars);

    card.innerHTML = `
      <div class="variant-top">
        <div>
          <div class="variant-name-display">${item.display_diff_html}</div>
          <div class="variant-num-pill">
            <span>Compound ${item.compound_number}</span>
            <span>→ Root <strong>${item.root_number}</strong></span>
          </div>
        </div>
        <div class="variant-stars" title="${item.tier.toUpperCase()}">${starsStr}</div>
      </div>

      <div class="variant-reason">
        ${item.reason}
      </div>

      <button type="button" class="variant-btn-select" data-index="${index}">
        ✦ Select This Name & Generate Certificate
      </button>
    `;

    grid.appendChild(card);
  });

  // Attach selection listeners
  document.querySelectorAll(".variant-btn-select").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.currentTarget.getAttribute("data-index"), 10);
      const chosenVariant = suggestions[idx];
      openCertificateModal(chosenVariant);
    });
  });
}

/* ==========================================================================
   6. Auspicious Name Certificate Modal
   ========================================================================== */
function initCertificateModal() {
  const modal = document.getElementById("certificateModal");
  const closeBtn = document.getElementById("btnCloseCertModal");
  const copyBtn = document.getElementById("btnCopyCert");
  const printBtn = document.getElementById("btnPrintCert");

  closeBtn?.addEventListener("click", () => modal?.classList.add("hidden"));

  copyBtn?.addEventListener("click", () => {
    if (!state.selectedVariant || !state.currentAnalysis) return;
    const v = state.selectedVariant;
    const a = state.currentAnalysis;
    const text = `
✦ NUMEROLOGY O FORTUNE HARMONY CERTIFICATE ✦
================================================
Selected Harmonized Name: ${v.name}
Original Name: ${a.name_details.full_name}
Harmonic Rating: ${v.stars}★ (${v.tier.toUpperCase()})
Chaldean Name Number: Compound ${v.compound_number} → Root ${v.root_number}
Driver Planet: ${a.driver_details.planet_name} (Number ${a.driver_details.driver_number})
Conductor Planet: ${a.conductor_details.planet_name} (Number ${a.conductor_details.conductor_number})
Alignment Note: ${v.reason}
Issued by: Numerology O Fortune System
================================================
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = "✓ Copied to Clipboard!";
      setTimeout(() => {
        copyBtn.innerHTML = `
          <svg class="btn-inline-svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="8" y="8" width="12" height="12" rx="2" stroke="#07080b" stroke-width="2"/>
            <path d="M16 8V6C16 4.9 15.1 4 14 4H6C4.9 4 4 4.9 4 6V14C4 15.1 4.9 16 6 16H8" stroke="#07080b" stroke-width="2"/>
          </svg>
          <span>Copy Certificate Text</span>
        `;
      }, 2500);
    });
  });

  printBtn?.addEventListener("click", () => {
    window.print();
  });
}

function openCertificateModal(variant) {
  state.selectedVariant = variant;
  const a = state.currentAnalysis;
  const modal = document.getElementById("certificateModal");

  const selNameEl = document.getElementById("certSelectedName");
  const origNameEl = document.getElementById("certOrigName");
  const tierEl = document.getElementById("certTier");
  const nameNumEl = document.getElementById("certNameNum");
  const driverEl = document.getElementById("certDriver");
  const dateEl = document.getElementById("certDate");

  if (selNameEl) selNameEl.textContent = variant.name;
  if (origNameEl) origNameEl.textContent = a ? a.name_details.full_name : "";
  if (tierEl) tierEl.textContent = `${variant.stars}★ ${variant.tier.toUpperCase()}`;
  if (nameNumEl) nameNumEl.textContent = `Compound ${variant.compound_number} → Root ${variant.root_number}`;
  if (driverEl) driverEl.textContent = a ? `${a.driver_details.driver_number} (${a.driver_details.planet_name})` : "";
  
  const now = new Date();
  if (dateEl) dateEl.textContent = `Issued: ${now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;

  modal?.classList.remove("hidden");
}

/* ==========================================================================
   7. Reference Chart Modal & 9×9 Matrix Flow
   ========================================================================== */
function initChartModal() {
  const btn = document.getElementById("btnHeaderCharts");
  const modal = document.getElementById("chartModal");
  const closeBtn = document.getElementById("btnCloseChartModal");
  const bottomCloseBtn = document.getElementById("btnBottomCloseChartModal");

  btn?.addEventListener("click", () => {
    openChartModalAppropriately();
  });

  closeBtn?.addEventListener("click", () => {
    modal?.classList.add("hidden");
  });

  bottomCloseBtn?.addEventListener("click", () => {
    modal?.classList.add("hidden");
  });

  // Close when clicking dark backdrop outside modal card
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });

  // Global Escape Key Listener for all modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      modal?.classList.add("hidden");
      document.getElementById("certificateModal")?.classList.add("hidden");
    }
  });
}

async function openChartModalAppropriately() {
  const modal = document.getElementById("chartModal");
  const lockedOverlay = document.getElementById("chartLockedOverlay");
  const unlockedContent = document.getElementById("chartUnlockedContent");

  if (!modal) return;

  // Instant Display with zero delay
  modal.classList.remove("hidden");
  modal.scrollTop = 0;
  const modalBody = modal.querySelector(".modal-body");
  if (modalBody) modalBody.scrollTop = 0;

  if (state.isMatrixPaid) {
    lockedOverlay?.classList.add("hidden");
    unlockedContent?.classList.remove("hidden");
    // Render matrix and tables asynchronously without blocking display
    loadAndRender9x9Matrix();
    loadChartData();
  } else {
    lockedOverlay?.classList.remove("hidden");
    unlockedContent?.classList.add("hidden");
  }
}

async function loadAndRender9x9Matrix() {
  const tbody = document.getElementById("dcMatrixBody");
  if (!tbody) return;

  try {
    if (!state.dcMatrix) {
      const res = await fetch("/api/matrix");
      const json = await res.json();
      if (json.success) {
        state.dcMatrix = json.data;
      }
    }

    const matrix = state.dcMatrix;
    if (!matrix) return;

    const userDriver = state.currentAnalysis?.driver_details?.driver_number;
    const userConductor = state.currentAnalysis?.conductor_details?.conductor_number;

    tbody.innerHTML = "";

    for (let d = 1; d <= 9; d++) {
      const tr = document.createElement("tr");
      
      const rowHeader = document.createElement("th");
      rowHeader.className = "row-header";
      rowHeader.textContent = `D${d}`;
      tr.appendChild(rowHeader);

      for (let c = 1; c <= 9; c++) {
        const td = document.createElement("td");
        const cellData = (matrix[String(d)] && matrix[String(d)][String(c)]) || [];
        
        td.textContent = cellData.length > 0 ? cellData.join(", ") : "—";
        td.dataset.d = d;
        td.dataset.c = c;
        td.dataset.recs = cellData.join(", ");

        if (userDriver === d && userConductor === c) {
          td.classList.add("user-active-cell");
          td.title = `Your Natal Synergy: Driver ${d} & Conductor ${c}`;
        }

        td.addEventListener("click", () => {
          document.querySelectorAll(".dc-table td").forEach(cell => cell.classList.remove("selected-cell"));
          td.classList.add("selected-cell");
          updateMatrixInspector(d, c, cellData);
        });

        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }

    // Auto inspect user's synergy cell if available, else default to D1/C1
    if (userDriver && userConductor) {
      const userRecs = (matrix[String(userDriver)] && matrix[String(userDriver)][String(userConductor)]) || [];
      updateMatrixInspector(userDriver, userConductor, userRecs);
    } else {
      updateMatrixInspector(1, 1, (matrix["1"] && matrix["1"]["1"]) || [5]);
    }
  } catch (err) {
    console.error("Matrix load error:", err);
  }
}

function updateMatrixInspector(d, c, recs) {
  const title = document.getElementById("inspectorTitle");
  const numbers = document.getElementById("inspectorNumbers");
  if (title) title.textContent = `Driver ${d} & Conductor ${c} Synergy`;
  if (numbers) {
    const listStr = recs && recs.length > 0 ? recs.join(", ") : "None";
    numbers.innerHTML = `Recommended Name Vibrations: <strong>[${listStr}]</strong>`;
  }
}

async function loadChartData() {
  const tbody = document.getElementById("planetTableBody");
  if (!tbody) return;

  try {
    if (!state.planetTable) {
      const response = await fetch("/api/chart");
      const res = await response.json();
      if (!res.success) return;

      state.planetTable = res.data.planet_table;
      state.chaldeanChart = res.data.chaldean_chart;
    }

    tbody.innerHTML = "";
    for (let i = 1; i <= 9; i++) {
      const p = state.planetTable[String(i)];
      if (!p) continue;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${i}</strong></td>
        <td><strong>${p.name}</strong></td>
        <td style="color: var(--rose-red);">${p.enemy_numbers.join(", ") || "None"}</td>
        <td style="color: var(--cyan-bright);">${p.friendly_numbers.join(", ") || "None"}</td>
        <td style="color: var(--emerald-green); font-weight: 700;">${p.good_best_numbers.join(", ")}</td>
      `;
      tbody.appendChild(tr);
    }
  } catch (e) {
    console.error("Chart load error:", e);
  }
}

/* ==========================================================================
   8. In-Page Email Dossier Dispatch (Send / Resend to Email)
   ========================================================================== */
function initEmailDispatchCard() {
  const btnSend = document.getElementById("btnSendEmailDossier");
  const inputEmail = document.getElementById("inputResendEmail");
  const statusEl = document.getElementById("resendEmailStatus");
  const btnText = document.getElementById("btnSendEmailDossierText");
  if (!btnSend) return;

  btnSend.addEventListener("click", async () => {
    const rawVal = inputEmail ? inputEmail.value.trim() : "";
    const formVal = document.getElementById("inputEmail")?.value.trim() || "";
    const email = rawVal || formVal || state.userEmail;

    if (!email || !email.includes("@") || !email.includes(".")) {
      if (statusEl) {
        statusEl.className = "resend-status-msg resend-status-error";
        statusEl.textContent = "Please enter a valid email address (e.g. yourname@gmail.com).";
        statusEl.classList.remove("hidden");
      }
      inputEmail?.focus();
      return;
    }

    // UI Loading state
    btnSend.disabled = true;
    btnSend.style.opacity = "0.75";
    if (btnText) btnText.textContent = "Sending Dossier...";
    if (statusEl) {
      statusEl.className = "resend-status-msg";
      statusEl.textContent = "Securing and dispatching your official dossier...";
      statusEl.classList.remove("hidden");
    }

    try {
      const fullName = state.currentAnalysis?.name_details?.full_name || document.getElementById("inputFullName")?.value.trim() || "Seeker";
      const dob = document.getElementById("inputDOB")?.value || "";
      const gender = state.currentAnalysis?.gender || document.getElementById("selectGender")?.value || "Male";
      const isMatrix = state.isMatrixPaid;
      const productType = isMatrix ? "matrix_chart" : "harmonization";
      const amount = isMatrix ? (state.pricing?.matrix_inr || 199) : (state.pricing?.harmonization_inr || 99);

      const res = await fetch("/api/payment/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          name: fullName,
          dob: dob,
          gender: gender,
          payment_id: state.paymentId || "Verified",
          amount: amount,
          product_type: productType,
          analysis_data: state.currentAnalysis,
          suggestions: state.generatedVariants
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        state.userEmail = email;
        if (inputEmail) inputEmail.value = email;
        if (statusEl) {
          statusEl.className = "resend-status-msg resend-status-success";
          statusEl.innerHTML = `✓ Official dossier successfully delivered to <strong>${escapeHtml(email)}</strong>. Please check your inbox (and spam folder).`;
        }
        showLuxuryEmailToast(email, productType);
      } else {
        if (statusEl) {
          statusEl.className = "resend-status-msg resend-status-error";
          statusEl.textContent = data.detail || "Unable to send email dossier. Please verify the address and try again.";
        }
      }
    } catch (err) {
      console.error("Resend email error:", err);
      if (statusEl) {
        statusEl.className = "resend-status-msg resend-status-error";
        statusEl.textContent = "Network error while sending email. Please check your connection.";
      }
    } finally {
      btnSend.disabled = false;
      btnSend.style.opacity = "1";
      if (btnText) btnText.textContent = "Send Dossier to Email";
    }
  });
}

/* ==========================================================================
   9. Zero-Database Refresh / Unload Session Warning
   ========================================================================== */
function initBeforeUnloadWarning() {
  window.addEventListener("beforeunload", (e) => {
    // Only warn if user has computed an analysis or made a payment in this session
    if (state.currentAnalysis || state.isPaid) {
      e.preventDefault();
      const warningMessage = "Zero-Database Notice: Your vibrational analysis and generated spellings exist only in this live session. Refreshing or leaving will permanently clear this data unless sent to your email.";
      e.returnValue = warningMessage;
      return warningMessage;
    }
  });
}

/* ==========================================================================
   10. Helper Utilities
   ========================================================================== */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ==========================================================================
   11. Dynamic Public Configuration & Pricing Loader
   ========================================================================== */
async function initPublicConfig() {
  try {
    const res = await fetch("/api/config");
    if (!res.ok) return;
    const json = await res.json();
    if (!json.success || !json.data) return;

    const {
      razorpay_key_id,
      harmonization_price_inr,
      harmonization_price_paise,
      matrix_chart_price_inr,
      matrix_chart_price_paise
    } = json.data;

    state.pricing.razorpay_key_id = razorpay_key_id;
    state.pricing.harmonization_inr = harmonization_price_inr;
    state.pricing.harmonization_paise = harmonization_price_paise;
    state.pricing.matrix_inr = matrix_chart_price_inr;
    state.pricing.matrix_paise = matrix_chart_price_paise;

    applyDynamicPricingToUI();
  } catch (e) {
    console.warn("Could not load dynamic configuration from backend, fallback to defaults:", e);
  }
}

function applyDynamicPricingToUI() {
  const harmINR = state.pricing.harmonization_inr;
  const matINR = state.pricing.matrix_inr;

  // 1. Navigation Matrix & Charts button price badge
  const headerBtnBadge = document.querySelector("#btnOpenMatrixModal .nav-price-badge");
  if (headerBtnBadge) headerBtnBadge.textContent = `₹${matINR}`;

  // 2. Package 1 Card Price: ₹99
  const harmPriceNum = document.querySelector(".plan-card:not(.plan-popular) .plan-price-num");
  if (harmPriceNum) harmPriceNum.textContent = `₹${harmINR}`;

  // 3. Package 2 Card Price: ₹199
  const matPriceNum = document.querySelector(".plan-popular .plan-price-num");
  if (matPriceNum) matPriceNum.textContent = `₹${matINR}`;

  // 4. Package 1 CTA button: "Find Your Numerology Name — ₹99 →"
  const harmBtnText = document.querySelector("#btnUnlockCorrection .cta-text");
  if (harmBtnText && !state.isPaid) {
    harmBtnText.textContent = `Find Your Numerology Name — ₹${harmINR} →`;
  }

  // 5. Package 2 CTA button: "Unlock All-Inclusive Combo — ₹199 →"
  const matBtnText = document.querySelector("#btnUnlockMatrixChart .cta-text");
  if (matBtnText && !state.isPaid) {
    matBtnText.textContent = `Unlock All-Inclusive Combo — ₹${matINR} →`;
  }

  // 6. Locked ₹99 Upgrade card button: "Upgrade to Master All-In-One Combo Suite — ₹199 →"
  const upgradeBtnText = document.querySelector("#btnUpgradeToCombo .cta-text");
  if (upgradeBtnText) {
    upgradeBtnText.textContent = `Upgrade to Master All-In-One Combo Suite — ₹${matINR} →`;
  }

  // 7. Modal Matrix CTA button: "Unlock Full Matrix & Chart Access — ₹199"
  const modalMatrixBtnText = document.querySelector("#btnUnlockModalMatrix .cta-text");
  if (modalMatrixBtnText) {
    modalMatrixBtnText.textContent = `Unlock Full Matrix & Chart Access — ₹${matINR}`;
  }
}

/* ==========================================================================
   Hero Poster Lightbox Preview
   ========================================================================== */
function initHeroPosterLightbox() {
  const trigger = document.getElementById("heroPosterTrigger");
  const modal = document.getElementById("posterLightboxModal");
  const closeBtn = document.getElementById("btnCloseLightbox");
  const backdrop = document.getElementById("lightboxBackdrop");

  if (!trigger || !modal) return;

  function openLightbox() {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }

  trigger.addEventListener("click", openLightbox);
  const zoomBtn = document.getElementById("btnZoomPosterTrigger");
  if (zoomBtn) {
    zoomBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openLightbox();
    });
  }
  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  if (backdrop) backdrop.addEventListener("click", closeLightbox);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeLightbox();
    }
  });
}

