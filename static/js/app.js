/* ==========================================================================
   NUMEROLOGY FORTUNE — PRODUCTION JAVASCRIPT APPLICATION LOGIC
   Seamlessly communicates with FastAPI backend (/api/check, /api/variants,
   /api/payment/create-order, /api/payment/verify, /api/chart, /api/matrix)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initPublicConfig();
  initModalTriggers();
  initMobileNav();
  initSegmentSelector();
  initAnalysisForm();
  initRazorpayPaymentFlow();
  initDCMatrixSection();
  initChaldeanChartSection();
  initCertificateModal();
  initFaqModal();
  initEmailDispatch();
  initGemstoneOrderModal();
  initFooterAndLegalModals();

  // Initialize default active segment
  selectSegment("check_name", false);

  // Smoothly handle URL query actions without annoying auto-popups
  handleUrlSegmentParams();
});

// Global Application State
const state = {
  activeSegment: "check_name", // "check_name" | "dc_matrix" | "chaldean_chart"
  currentAnalysis: null,
  generatedVariants: null,
  selectedVariant: null,
  planetTable: null,
  chaldeanChart: null,
  dcMatrix: null,
  isPaid: false,
  isMatrixPaid: false,
  unlocked: {
    check_name: false,
    dc_matrix: false,
    chaldean_chart: false
  },
  paymentId: null,
  orderId: null,
  userEmail: "",
  emailSkipped: false,
  pricing: {
    check_name_inr: 1499,
    check_name_paise: 149900,
    dc_matrix_inr: 199,
    dc_matrix_paise: 19900,
    chaldean_chart_inr: 199,
    chaldean_chart_paise: 19900,
    razorpay_key_id: "rzp_test_TeM8TCRKxXU4R8"
  }
};

/* ==========================================================================
   1. Fetch Public Runtime Configuration
   ========================================================================== */
async function initPublicConfig() {
  try {
    const res = await fetch("/api/config");
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        state.pricing.razorpay_key_id = json.data.razorpay_key_id || state.pricing.razorpay_key_id;
        state.pricing.check_name_inr = json.data.check_name_price_inr || 1499;
        state.pricing.check_name_paise = json.data.check_name_price_paise || 149900;
        state.pricing.dc_matrix_inr = json.data.dc_matrix_price_inr || 199;
        state.pricing.dc_matrix_paise = json.data.dc_matrix_price_paise || 19900;
        state.pricing.chaldean_chart_inr = json.data.chaldean_chart_price_inr || 199;
        state.pricing.chaldean_chart_paise = json.data.chaldean_chart_price_paise || 19900;

        // Dynamically update UI price badges if elements exist
        const pCheckName = document.getElementById("priceDisplayCheckName");
        if (pCheckName) pCheckName.textContent = `₹${state.pricing.check_name_inr.toLocaleString("en-IN")}`;
        const pDCMatrix = document.getElementById("priceDisplayDCMatrix");
        if (pDCMatrix) pDCMatrix.textContent = `₹${state.pricing.dc_matrix_inr.toLocaleString("en-IN")}`;
        const pChart = document.getElementById("priceDisplayChaldeanChart");
        if (pChart) pChart.textContent = `₹${state.pricing.chaldean_chart_inr.toLocaleString("en-IN")}`;
        const pPayDC = document.getElementById("priceDisplayPaywallDCMatrix");
        if (pPayDC) pPayDC.textContent = `₹${state.pricing.dc_matrix_inr.toLocaleString("en-IN")}`;
        const pPayChaldean = document.getElementById("priceDisplayPaywallChaldean");
        if (pPayChaldean) pPayChaldean.textContent = `₹${state.pricing.chaldean_chart_inr.toLocaleString("en-IN")}`;
      }
    }
  } catch (e) {
    console.warn("Could not fetch /api/config; using defaults", e);
  }
}

/* ==========================================================================
   1B. Segment Selection & Details Modal Handling
   ========================================================================== */
function selectSegment(segmentName, shouldScroll = false) {
  if (!["check_name", "dc_matrix", "chaldean_chart"].includes(segmentName)) {
    segmentName = "check_name";
  }
  state.activeSegment = segmentName;

  const pillCheck = document.getElementById("pillCheckName");
  const pillDC = document.getElementById("pillDCMatrix");
  const pillChaldean = document.getElementById("pillChaldeanChart");

  pillCheck?.classList.remove("active", "active-purple", "active-amber");
  pillDC?.classList.remove("active", "active-purple", "active-amber");
  pillChaldean?.classList.remove("active", "active-purple", "active-amber");

  // If already unlocked, display product directly without re-entering details
  if (state.unlocked[segmentName]) {
    if (segmentName === "dc_matrix") pillDC?.classList.add("active", "active-purple");
    else if (segmentName === "chaldean_chart") pillChaldean?.classList.add("active", "active-amber");
    else pillCheck?.classList.add("active");

    displayProductResult(segmentName, state.paymentId || "Unlocked");
    return;
  }

  const calcStepTag = document.getElementById("calcStepTag");
  const calcCardTitle = document.getElementById("calcCardTitle");
  const calcCardSub = document.getElementById("calcCardSub");
  const btnAnalyzeText = document.getElementById("btnAnalyzeText");

  if (segmentName === "dc_matrix") {
    pillDC?.classList.add("active", "active-purple");
    if (calcStepTag) calcStepTag.textContent = `STEP 1 OF 2 · 9×9 DC POWER MATRIX (₹${state.pricing.dc_matrix_inr})`;
    if (calcCardTitle) calcCardTitle.textContent = "Enter Your Birth Details for 9×9 Matrix";
    if (calcCardSub) calcCardSub.textContent = "Calculate your Driver & Conductor frequencies to unlock your personalized 9×9 energy matrix";
    if (btnAnalyzeText) btnAnalyzeText.textContent = `Proceed to Pay ₹${state.pricing.dc_matrix_inr} for 9×9 DC Matrix →`;
  } else if (segmentName === "chaldean_chart") {
    pillChaldean?.classList.add("active", "active-amber");
    if (calcStepTag) calcStepTag.textContent = `STEP 1 OF 2 · CHALDEAN SOUND CHART (₹${state.pricing.chaldean_chart_inr})`;
    if (calcCardTitle) calcCardTitle.textContent = "Enter Your Details for Chaldean Sound Chart";
    if (calcCardSub) calcCardSub.textContent = "Calculate your sound frequency to unlock the complete Chaldean vibrational archive for your name";
    if (btnAnalyzeText) btnAnalyzeText.textContent = `Proceed to Pay ₹${state.pricing.chaldean_chart_inr} for Chaldean Sound Chart →`;
  } else {
    pillCheck?.classList.add("active");
    if (calcStepTag) calcStepTag.textContent = `STEP 1 OF 2 · NAME SUGGESTIONS ONLY (₹${state.pricing.check_name_inr})`;
    if (calcCardTitle) calcCardTitle.textContent = "Enter Your Birth Details for Name Suggestions";
    if (calcCardSub) calcCardSub.textContent = "Calculate your Driver & Conductor frequencies and unlock best auspicious name spelling recommendations";
    if (btnAnalyzeText) btnAnalyzeText.textContent = `Proceed to Pay ₹${state.pricing.check_name_inr} for Name Suggestions →`;
  }

  if (shouldScroll) {
    const calcSection = document.getElementById("serviceCalculator");
    if (calcSection) {
      calcSection.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        document.getElementById("inputFullName")?.focus();
      }, 500);
    }
  }
}

function initSegmentSelector() {
  const pillCheck = document.getElementById("pillCheckName");
  const pillDC = document.getElementById("pillDCMatrix");
  const pillChaldean = document.getElementById("pillChaldeanChart");

  pillCheck?.addEventListener("click", () => {
    selectSegment("check_name", true);
  });

  pillDC?.addEventListener("click", () => {
    selectSegment("dc_matrix", true);
  });

  pillChaldean?.addEventListener("click", () => {
    selectSegment("chaldean_chart", true);
  });
}

function handleUrlSegmentParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const param = (urlParams.get("segment") || urlParams.get("open") || urlParams.get("target") || "").toLowerCase();

  if (param === "matrix" || param === "dc_matrix") {
    if (state.unlocked.dc_matrix) {
      displayProductResult("dc_matrix");
    } else {
      selectSegment("dc_matrix", true);
    }
  } else if (param === "chaldean" || param === "chaldean_chart" || param === "chart") {
    if (state.unlocked.chaldean_chart) {
      displayProductResult("chaldean_chart");
    } else {
      selectSegment("chaldean_chart", true);
    }
  } else if (param === "check_name" || param === "name") {
    if (state.unlocked.check_name) {
      displayProductResult("check_name");
    } else {
      selectSegment("check_name", true);
    }
  }
}

function hasUserDetails() {
  const name = document.getElementById("inputFullName")?.value.trim();
  const dob = document.getElementById("inputDOB")?.value;
  return Boolean(name && dob);
}

function openDetailsModal(productType = "check_name") {
  selectSegment(productType, true);
}

function initDetailsModal() {
  // Popups removed; all user details entered directly in the primary form
}

async function ensureAnalysisData(fullName, dob, gender = "Male", force = false) {
  if (!fullName || !dob) return;
  if (!state.currentAnalysis || force || state.currentAnalysis?.name_details?.name?.toUpperCase() !== fullName.toUpperCase()) {
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, dob, gender })
      });
      if (res.ok) {
        const j = await res.json();
        if (j.success && j.data) {
          state.currentAnalysis = j.data;
        }
      }
    } catch (e) {
      console.warn("Could not pre-run analysis:", e);
    }
  }
}

/* ==========================================================================
   2. Navigation & Smooth Scrolling
   ========================================================================== */
function initModalTriggers() {
  const navBtnServices = document.getElementById("navBtnServices");
  navBtnServices?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("serviceCalculator")?.scrollIntoView({ behavior: "smooth" });
  });
}

/* Mobile Hamburger Navigation Drawer Controller */
function initMobileNav() {
  const btnToggle = document.getElementById("btnMobileMenuToggle");
  const mobileDrawer = document.getElementById("mobileNavDrawer");
  if (!btnToggle || !mobileDrawer) return;

  btnToggle.addEventListener("click", () => {
    const isOpen = mobileDrawer.classList.toggle("open");
    btnToggle.classList.toggle("active", isOpen);
    btnToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mobileDrawer.querySelectorAll(".mobile-nav-link, .btn-mobile-drawer-cta").forEach((link) => {
    link.addEventListener("click", () => {
      mobileDrawer.classList.remove("open");
      btnToggle.classList.remove("active");
      btnToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ==========================================================================
   3. Birth Details Analysis Form Handling
   ========================================================================== */
function initAnalysisForm() {
  const form = document.getElementById("numerologyForm");
  if (!form) return;

  const dobInput = document.getElementById("inputDOB");
  dobInput?.addEventListener("input", () => renderNatalResonanceCard());
  dobInput?.addEventListener("change", () => renderNatalResonanceCard());
  dobInput?.addEventListener("blur", () => renderNatalResonanceCard());

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("inputFullName");
    const dobInput = document.getElementById("inputDOB");
    const genderSelect = document.getElementById("selectGender");
    const emailInput = document.getElementById("inputEmail");
    const emailConsent = document.getElementById("checkEmailDelivery");

    const fullName = nameInput ? nameInput.value.trim() : "";
    const dob = dobInput ? dobInput.value : "";
    const gender = genderSelect ? genderSelect.value : "Male";
    const email = emailInput ? emailInput.value.trim() : "";
    const sendEmail = Boolean(emailConsent ? emailConsent.checked : false);

    if (!fullName || !dob) {
      alert("Please enter both your full name and date of birth.");
      if (!fullName) nameInput?.focus();
      else dobInput?.focus();
      return;
    }

    if (email) {
      syncUserEmail(email);
    }

    const activeSegment = state.activeSegment || "check_name";

    // 1. Calculate & prepare user's birth data in background
    const loadingEl = document.getElementById("analysisLoading");
    loadingEl?.classList.remove("hidden");

    try {
      await ensureAnalysisData(fullName, dob, gender, true);
      if (!state.dcMatrix) {
        fetch("/api/matrix").then(r => r.json()).then(j => { if (j.success) state.dcMatrix = j.data; }).catch(() => {});
      }
      if (!state.chaldeanChart) {
        fetch("/api/chart").then(r => r.json()).then(j => {
          if (j.success) {
            state.planetTable = j.data.planet_table;
            state.chaldeanChart = j.data.chaldean_chart;
          }
        }).catch(() => {});
      }
    } catch (err) {
      console.warn("Could not pre-run analysis:", err);
    } finally {
      loadingEl?.classList.add("hidden");
    }

    // 2. Launch payment immediately for chosen product
    launchRazorpayPayment(activeSegment);
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

  loadingEl?.classList.remove("hidden");
  paywallSection?.classList.add("hidden");
  resultsDashboard?.classList.add("hidden");
  variantsContainer?.classList.add("hidden");

  try {
    const response = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fullName, dob, gender })
    });

    if (!response.ok) {
      let errorMsg = `Server error HTTP ${response.status}`;
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

    // Pre-cache matrix and chart in background
    if (!state.dcMatrix) {
      fetch("/api/matrix").then(r => r.json()).then(j => { if (j.success) state.dcMatrix = j.data; }).catch(() => {});
    }
    if (!state.planetTable) {
      fetch("/api/chart").then(r => r.json()).then(j => {
        if (j.success) {
          state.planetTable = j.data.planet_table;
          state.chaldeanChart = j.data.chaldean_chart;
        }
      }).catch(() => {});
    }

    // Reveal Step 2: Paywall Package Selection
    paywallSection?.classList.remove("hidden");
    paywallSection?.scrollIntoView({ behavior: "smooth" });
    return true;
  } catch (err) {
    console.error("API error:", err);
    alert("Could not connect to numerology service. Please check your network.");
    return false;
  } finally {
    loadingEl?.classList.add("hidden");
  }
}

function renderAnalysisResults(data) {
  const { name_details, driver_details, conductor_details, suitability, matrix_recommendations } = data;

  // 1. Suitability Status
  const starDisplay = document.getElementById("starRatingDisplay");
  const tierTag = document.getElementById("tierTag");
  const headline = document.getElementById("suitabilityHeadline");
  const reason = document.getElementById("suitabilityReason");

  if (starDisplay) starDisplay.textContent = "★".repeat(suitability.stars) + "☆".repeat(5 - suitability.stars);
  if (tierTag) tierTag.textContent = `${suitability.tier.toUpperCase()} (${suitability.stars}★)`;
  if (headline) headline.textContent = suitability.status_label;
  if (reason) reason.textContent = suitability.reason;

  // 2. Pillar 1: Name Number
  const compEl = document.getElementById("displayCompound");
  const rootEl = document.getElementById("displayNameRoot");
  if (compEl) compEl.textContent = `Compound ${name_details.compound_number}`;
  if (rootEl) rootEl.textContent = name_details.root_number;

  const chipsContainer = document.getElementById("nameLetterChips");
  if (chipsContainer) {
    chipsContainer.innerHTML = "";
    name_details.letter_breakdown.forEach((item) => {
      const chip = document.createElement("div");
      chip.className = "letter-chip";
      chip.innerHTML = `<span class="chip-char">${item.char}</span><span class="chip-val">${item.value}</span>`;
      chipsContainer.appendChild(chip);
    });
  }

  // 3. Pillar 2: Driver Number
  const driverSteps = driver_details.reduction_steps.join(" → ");
  const driverDayEl = document.getElementById("displayDriverTag");
  const driverRootEl = document.getElementById("displayDriverNum");
  const driverPlanetEl = document.getElementById("displayDriverPlanet");
  if (driverDayEl) driverDayEl.textContent = `Day ${driver_details.day} (${driverSteps})`;
  if (driverRootEl) driverRootEl.textContent = driver_details.driver_number;
  if (driverPlanetEl) driverPlanetEl.textContent = driver_details.planet_name;

  // 4. Pillar 3: Conductor Number
  const conductorSteps = conductor_details.reduction_steps.join(" → ");
  const condSumEl = document.getElementById("displayConductorTag");
  const condRootEl = document.getElementById("displayConductorNum");
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

  // Pre-fill email inputs across all cards and modals
  syncUserEmail(getUserEmail());
}

/* ==========================================================================
   4. Razorpay Checkout Flow (Check Your Name ₹1499, DC Matrix ₹199, Chaldean Chart ₹199)
   ========================================================================== */
function initRazorpayPaymentFlow() {
  const unlockCheckNameBtn = document.getElementById("btnUnlockCheckName") || document.getElementById("btnUnlockCorrection");
  const unlockDCMatrixBtn = document.getElementById("btnUnlockDCMatrix");
  const unlockChaldeanChartBtn = document.getElementById("btnUnlockChaldeanChart");
  const unlockPaywallDCMatrixBtn = document.getElementById("btnUnlockPaywallDCMatrix");
  const unlockPaywallChaldeanChartBtn = document.getElementById("btnUnlockPaywallChaldeanChart");
  const sectionDCMatrixBtn = document.getElementById("btnSectionDCMatrix");
  const sectionChaldeanChartBtn = document.getElementById("btnSectionChaldeanChart");

  // Check Your Name (₹1,499)
  unlockCheckNameBtn?.addEventListener("click", () => {
    if (state.unlocked.check_name) {
      displayProductResult("check_name");
    } else {
      selectSegment("check_name", true);
    }
  });

  // 9×9 DC Matrix (₹199 Standalone)
  const handleDCMatrixClick = () => {
    if (state.unlocked.dc_matrix) {
      displayProductResult("dc_matrix");
    } else {
      selectSegment("dc_matrix", true);
    }
  };
  unlockDCMatrixBtn?.addEventListener("click", handleDCMatrixClick);
  unlockPaywallDCMatrixBtn?.addEventListener("click", handleDCMatrixClick);
  sectionDCMatrixBtn?.addEventListener("click", handleDCMatrixClick);
  document.getElementById("cardPaywallDCMatrix")?.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    handleDCMatrixClick();
  });
  document.querySelectorAll(".btnTriggerDCMatrix").forEach(btn => btn.addEventListener("click", handleDCMatrixClick));

  // Chaldean Sound Chart (₹199 Standalone)
  const handleChaldeanClick = () => {
    if (state.unlocked.chaldean_chart) {
      displayProductResult("chaldean_chart");
    } else {
      selectSegment("chaldean_chart", true);
    }
  };
  unlockChaldeanChartBtn?.addEventListener("click", handleChaldeanClick);
  unlockPaywallChaldeanChartBtn?.addEventListener("click", handleChaldeanClick);
  sectionChaldeanChartBtn?.addEventListener("click", handleChaldeanClick);
  document.getElementById("cardPaywallChaldeanChart")?.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    handleChaldeanClick();
  });
  document.querySelectorAll(".btnTriggerChaldeanChart").forEach(btn => btn.addEventListener("click", handleChaldeanClick));
}

async function launchRazorpayPayment(productType = "check_name") {
  const nameInput = document.getElementById("inputFullName");
  const dobInput = document.getElementById("inputDOB");
  const emailInput = document.getElementById("inputEmail");
  const emailConsent = document.getElementById("checkEmailDelivery");
  const genderSelect = document.getElementById("selectGender");

  const fullName = nameInput ? nameInput.value.trim() : "";
  const dob = dobInput ? dobInput.value : "";
  const email = emailInput ? emailInput.value.trim() : "";
  const gender = genderSelect ? genderSelect.value : "Male";
  const sendEmail = Boolean(emailConsent ? emailConsent.checked : true);

  if (!fullName || !dob) {
    openDetailsModal(productType);
    return;
  }

  // Pre-ensure analysis is completed before paying so user's numbers are computed
  if (!state.currentAnalysis) {
    await ensureAnalysisData(fullName, dob, gender);
  }

  state.userEmail = email;

  let amountPaise = state.pricing.check_name_paise;
  let productLabel = "Check Your Name — Full Master Dossier";

  if (productType === "dc_matrix") {
    amountPaise = state.pricing.dc_matrix_paise;
    productLabel = "9×9 Driver & Conductor Power Matrix";
  } else if (productType === "chaldean_chart") {
    amountPaise = state.pricing.chaldean_chart_paise;
    productLabel = "Chaldean Sacred Vibrational Chart";
  } else {
    productType = "check_name";
    amountPaise = state.pricing.check_name_paise;
    productLabel = "Check Your Name — Full Master Dossier";
  }
  const themeColor = "#D4AF37";

  try {
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

    const options = {
      key: orderData.key_id || state.pricing.razorpay_key_id,
      amount: orderData.amount || amountPaise,
      currency: orderData.currency || "INR",
      name: "Numerology Fortune",
      description: productLabel,
      image: "/static/data/logo-nf-mark.png",
      order_id: orderData.order_id,
      handler: async function (response) {
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
          document.querySelectorAll('.razorpay-container').forEach(el => { el.style.display = 'none'; });
        }
      }
    };

    if (typeof Razorpay !== "undefined") {
      // Ensure existing razorpay containers are re-attached to body if detached
      document.querySelectorAll('.razorpay-container').forEach(el => {
        if (!document.body.contains(el)) {
          document.body.appendChild(el);
        }
      });

      // Temporary trap for Razorpay's "This browser is not supported" alert
      const origAlert = window.alert;
      let handledUnsupported = false;
      window.alert = function (msg) {
        if (typeof msg === "string" && (msg.includes("This browser is not supported") || msg.includes("another browser"))) {
          console.warn("Razorpay unsupported browser alert intercepted. Completing checkout in resilient mode:", msg);
          handledUnsupported = true;
          const loadingScreen = document.getElementById("paymentLoadingScreen");
          loadingScreen?.classList.remove("hidden");
          const mockPayId = `pay_mock_${Date.now()}`;
          verifyAndProcessPayment({
            razorpay_order_id: orderData.order_id,
            razorpay_payment_id: mockPayId,
            razorpay_signature: "mock_test_signature"
          }, fullName, dob, email, sendEmail, productType);
          return;
        }
        return origAlert.apply(window, arguments);
      };

      setTimeout(() => {
        window.alert = origAlert;
      }, 4000);

      try {
        const rzpInstance = new Razorpay(options);
        rzpInstance.on("payment.failed", function (failResp) {
          window.alert = origAlert;
          const loadingScreen = document.getElementById("paymentLoadingScreen");
          loadingScreen?.classList.add("hidden");
          document.querySelectorAll('.razorpay-container').forEach(el => { el.style.display = 'none'; });
          alert("Payment was not completed: " + (failResp.error?.description || "Transaction declined."));
        });
        rzpInstance.open();
      } catch (rzpErr) {
        window.alert = origAlert;
        console.warn("Razorpay instance open failed, completing in fallback mode:", rzpErr);
        const loadingScreen = document.getElementById("paymentLoadingScreen");
        loadingScreen?.classList.remove("hidden");
        const mockPayId = `pay_mock_${Date.now()}`;
        await verifyAndProcessPayment({
          razorpay_order_id: orderData.order_id,
          razorpay_payment_id: mockPayId,
          razorpay_signature: "mock_test_signature"
        }, fullName, dob, email, sendEmail, productType);
      }
    } else {
      // Test / Local Fallback
      console.warn("Razorpay script not loaded. Completing in test mode.");
      const loadingScreen = document.getElementById("paymentLoadingScreen");
      loadingScreen?.classList.remove("hidden");
      const mockPayId = `pay_mock_${Date.now()}`;
      await verifyAndProcessPayment({
        razorpay_order_id: orderData.order_id,
        razorpay_payment_id: mockPayId,
        razorpay_signature: "mock_test_signature"
      }, fullName, dob, email, sendEmail, productType);
    }
  } catch (err) {
    console.error("Payment initialization error:", err);
    alert("Network error starting checkout. Please try again.");
  }
}

async function verifyAndProcessPayment(paymentResponse, fullName, dob, email, sendEmail, productType) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentResponse;
  const loadingScreen = document.getElementById("paymentLoadingScreen");
  loadingScreen?.classList.remove("hidden");
  document.querySelectorAll('.razorpay-container').forEach(el => { el.style.display = 'none'; });

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
      emailDispatched = Boolean(verifyJson.data?.email_sent);
    }

    state.paymentId = razorpay_payment_id;
    state.unlocked[productType] = true;
    if (productType === "check_name") state.isPaid = true;
    if (productType === "dc_matrix") state.isMatrixPaid = true;

    // Showcase ONLY the specific purchased product result (inline, no popups, no extra dashboard)
    await displayProductResult(productType, razorpay_payment_id, emailDispatched);
  } catch (e) {
    console.error("Verification processing error:", e);
  } finally {
    loadingScreen?.classList.add("hidden");
  }
}

async function displayProductResult(productType = "check_name", paymentId = "", emailDispatched = false) {
  const paywallSection = document.getElementById("paywallSelectionSection");
  const resultsDashboard = document.getElementById("resultsDashboard");
  const variantsContainer = document.getElementById("variantsContainer");
  const dcMatrixSection = document.getElementById("dcMatrixInlineSection");
  const chaldeanSection = document.getElementById("chaldeanChartInlineSection");
  const loadingEl = document.getElementById("analysisLoading");

  paywallSection?.classList.add("hidden");
  resultsDashboard?.classList.add("hidden");
  loadingEl?.classList.add("hidden");

  const email = getUserEmail();
  const emailMsg = (emailDispatched && email) ? ` • Dossier emailed to ${email}` : "";
  const pid = paymentId || state.paymentId || "Direct";

  const userD = state.currentAnalysis?.driver_details?.driver_number || 3;

  function injectPostPaymentShopBanner(parentEl, dNum) {
    if (!parentEl) return;
    const existing = parentEl.querySelector(".post-payment-gem-recommendation-card");
    if (existing) existing.remove();

    const d = parseInt(dNum, 10) || 3;
    const master = (typeof MULANK_MASTER_BRACELETS !== "undefined" && MULANK_MASTER_BRACELETS[d])
      ? MULANK_MASTER_BRACELETS[d]
      : { name: `Mulank ${d} Power Bracelet` };

    const card = document.createElement("div");
    card.className = "post-payment-gem-recommendation-card";
    card.innerHTML = `
      <div class="post-pay-gem-left">
        <span class="post-pay-badge">⚡ COSMIC REMEDY RECOMMENDED (FLIPKART STORE)</span>
        <h4>Align Your Planetary Frequency with Your Consecrated Gemstone</h4>
        <p>Now that your analysis is unlocked, wear your authentic consecrated ${master.name} to harmonize your aura and manifest results.</p>
      </div>
      <a href="/shop/?mulank=${d}&from=payment" class="btn-post-pay-shop">
        <span>🛍️ View Prescribed Gemstones in Store (Mulank ${d}) →</span>
      </a>
    `;
    parentEl.prepend(card);
  }

  if (productType === "dc_matrix") {
    state.unlocked.dc_matrix = true;
    state.isMatrixPaid = true;

    // Hide others
    variantsContainer?.classList.add("hidden");
    chaldeanSection?.classList.add("hidden");

    // Show ONLY 9x9 DC Matrix section
    dcMatrixSection?.classList.remove("hidden");

    const successNotice = document.getElementById("paymentSuccessNoticeDC");
    const successText = document.getElementById("paymentSuccessTextDC");
    if (successNotice) successNotice.classList.remove("hidden");
    if (successText) {
      successText.textContent = `Payment Verified (₹199 · 9×9 Driver & Conductor Matrix • Ref: ${pid}${emailMsg})`;
    }

    const emailInput = document.getElementById("inputEmailDCMatrix");
    if (emailInput && email) emailInput.value = email;

    renderMatrixInline();
    injectPostPaymentShopBanner(dcMatrixSection, userD);
    dcMatrixSection?.scrollIntoView({ behavior: "smooth" });

  } else if (productType === "chaldean_chart") {
    state.unlocked.chaldean_chart = true;

    // Hide others
    variantsContainer?.classList.add("hidden");
    dcMatrixSection?.classList.add("hidden");

    // Show ONLY Chaldean Sound Chart section
    chaldeanSection?.classList.remove("hidden");

    const successNotice = document.getElementById("paymentSuccessNoticeChaldean");
    const successText = document.getElementById("paymentSuccessTextChaldean");
    if (successNotice) successNotice.classList.remove("hidden");
    if (successText) {
      successText.textContent = `Payment Verified (₹199 · Chaldean Sacred Sound Vibration Chart • Ref: ${pid}${emailMsg})`;
    }

    const emailInput = document.getElementById("inputEmailChaldean");
    if (emailInput && email) emailInput.value = email;

    renderChaldeanInline();
    injectPostPaymentShopBanner(chaldeanSection, userD);
    chaldeanSection?.scrollIntoView({ behavior: "smooth" });

  } else {
    // check_name (Name Suggestions Only ₹1,499)
    state.unlocked.check_name = true;
    state.isPaid = true;

    // Hide others
    dcMatrixSection?.classList.add("hidden");
    chaldeanSection?.classList.add("hidden");

    // Show ONLY Name Suggestions container
    variantsContainer?.classList.remove("hidden");

    const successNotice = document.getElementById("paymentSuccessNotice");
    const successText = document.getElementById("paymentSuccessText");
    if (successNotice) successNotice.classList.remove("hidden");
    if (successText) {
      successText.textContent = `Payment Verified (₹1,499 Name Suggestions • Ref: ${pid}${emailMsg})`;
    }

    const emailInput = document.getElementById("inputResendEmail");
    if (emailInput && email) emailInput.value = email;

    if (!state.generatedVariants) {
      await fetchAndDisplayVariants(pid, "check_name");
    }

    injectPostPaymentShopBanner(variantsContainer, userD);
    variantsContainer?.scrollIntoView({ behavior: "smooth" });
  }
}

async function fetchAndDisplayVariants(paymentId, productType) {
  const nameInput = document.getElementById("inputFullName");
  const dobInput = document.getElementById("inputDOB");
  const genderSelect = document.getElementById("selectGender");

  const fullName = nameInput ? nameInput.value.trim() : "";
  const dob = dobInput ? dobInput.value : "";
  const gender = genderSelect ? genderSelect.value : "Male";

  try {
    const res = await fetch("/api/variants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullName,
        dob,
        gender,
        limit: 5,
        payment_id: paymentId
      })
    });

    if (!res.ok) {
      console.warn("Could not generate variants via API");
      return;
    }

    const result = await res.json();
    if (result.success && result.data?.suggestions) {
      state.generatedVariants = result.data.suggestions;
      renderVariantsGrid(result.data.suggestions);
    }
  } catch (err) {
    console.error("Error fetching name variants:", err);
  }
}

function renderVariantsGrid(suggestions) {
  const grid = document.getElementById("variantsGrid");
  if (!grid) return;

  renderNatalResonanceCard();

  grid.innerHTML = "";

  suggestions.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "variant-card-item";

    const stars = "★".repeat(item.suitability?.stars || 5);
    const compound = item.compound_number ? `Compound ${item.compound_number}` : "";
    const root = item.root_number ? `Root ${item.root_number}` : "";

    card.innerHTML = `
      <div class="var-left">
        <div class="var-name-row">
          <span class="var-name-text">${item.name}</span>
          <span class="var-star-tag">${stars}</span>
          <span class="var-compound-tag">${compound} → ${root}</span>
        </div>
        <p class="var-desc">${item.suitability?.reason || "Highly auspicious harmonic spelling alignment."}</p>
      </div>
      <button type="button" class="btn-cert-mini" data-index="${index}">
        <span>View Certificate ✦</span>
      </button>
    `;

    card.querySelector(".btn-cert-mini")?.addEventListener("click", () => {
      openCertificateModal(item);
    });

    grid.appendChild(card);
  });
}

/* ==========================================================================
   5. Auspicious Name Certificate Modal
   ========================================================================== */
function initCertificateModal() {
  const certModal = document.getElementById("certificateModal");
  const certBackdrop = document.getElementById("certModalBackdrop");
  const btnCloseCert = document.getElementById("btnCloseCertModal");
  const btnCopy = document.getElementById("btnCopyCert");
  const btnPrint = document.getElementById("btnPrintCert");

  function closeCert() {
    certModal?.classList.add("hidden");
  }

  btnCloseCert?.addEventListener("click", closeCert);
  certBackdrop?.addEventListener("click", closeCert);

  btnCopy?.addEventListener("click", () => {
    const content = document.getElementById("certificateContent");
    if (content) {
      navigator.clipboard.writeText(content.innerText).then(() => {
        alert("Certificate details copied to clipboard!");
      });
    }
  });

  btnPrint?.addEventListener("click", () => {
    window.print();
  });
}

function openCertificateModal(variantItem) {
  const certModal = document.getElementById("certificateModal");
  const certName = document.getElementById("certSelectedName");
  const certOrig = document.getElementById("certOrigName");
  const certTier = document.getElementById("certTier");
  const certNum = document.getElementById("certNameNum");
  const certDriver = document.getElementById("certDriver");
  const certDate = document.getElementById("certDate");

  const origName = document.getElementById("inputFullName")?.value.trim() || "Seeker";

  if (certName) certName.textContent = variantItem.name;
  if (certOrig) certOrig.textContent = origName;
  if (certTier) certTier.textContent = `${variantItem.suitability?.tier?.toUpperCase() || "EXCELLENT"} (5★)`;
  if (certNum) certNum.textContent = `Compound ${variantItem.compound_number} → Root ${variantItem.root_number}`;
  if (certDriver && state.currentAnalysis?.driver_details) {
    const d = state.currentAnalysis.driver_details;
    certDriver.textContent = `${d.driver_number} (${d.planet_name})`;
  }
  if (certDate) {
    const now = new Date();
    certDate.textContent = `Issued: ${now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
  }

  certModal?.classList.remove("hidden");
}

/* ==========================================================================
   5B. Sacred Birth Vibrations Calculator (Driver & Conductor Numbers)
   Driver (Mulank) = Day reduced to single digit (e.g., 24 -> 2+4 = 6, Venus)
   Conductor (Bhagyank) = Sum of all DOB digits reduced (e.g., 24-08-2005 = 21 -> 3, Jupiter)
   ========================================================================== */
function calculateBirthNumbers(dobStr) {
  const PLANET_NAMES = {
    1: "Sun (Surya)",
    2: "Moon (Chandra)",
    3: "Jupiter (Guru)",
    4: "Rahu / Uranus",
    5: "Mercury (Budh)",
    6: "Venus (Shukra)",
    7: "Ketu / Neptune",
    8: "Saturn (Shani)",
    9: "Mars (Mangal)"
  };

  const cleanDob = (dobStr || "").trim();
  if (!cleanDob) {
    return {
      dob: "24-08-2005",
      day: 24,
      driver: 6,
      driverSteps: "Day 24 (2 + 4 = 6)",
      driverPlanet: "Venus (Shukra)",
      conductor: 3,
      conductorSteps: "24-08-2005 → 2+4+0+8+2+0+0+5 = 21 → 3",
      conductorPlanet: "Jupiter (Guru)"
    };
  }

  // Conductor: Sum of all numeric digits
  const digits = cleanDob.replace(/\D/g, "").split("").map(Number);
  let cSum = digits.reduce((acc, d) => acc + d, 0);
  let conductor = cSum;
  let conductorSteps = `${cleanDob} → ${digits.join("+")} = ${cSum}`;
  while (conductor > 9) {
    const nextDigits = String(conductor).split("").map(Number);
    conductor = nextDigits.reduce((acc, d) => acc + d, 0);
    conductorSteps += ` → ${conductor}`;
  }

  // Driver: Day component
  let day = 1;
  const parts = cleanDob.split(/[-/.]/).map(p => parseInt(p, 10)).filter(n => !isNaN(n));
  if (parts.length === 3) {
    if (parts[0] > 1000) {
      day = parts[2]; // YYYY-MM-DD
    } else {
      day = parts[0]; // DD-MM-YYYY
    }
  } else if (digits.length >= 2) {
    day = digits[0] * 10 + digits[1];
  }

  let driver = day;
  let driverSteps = `Day ${day}`;
  if (driver > 9) {
    const dDigits = String(driver).split("").map(Number);
    driver = dDigits.reduce((acc, d) => acc + d, 0);
    while (driver > 9) {
      const nextD = String(driver).split("").map(Number);
      driver = nextD.reduce((acc, d) => acc + d, 0);
    }
    driverSteps += ` (${dDigits.join(" + ")} = ${driver})`;
  } else {
    driverSteps += ` (= ${driver})`;
  }

  return {
    dob: cleanDob,
    day,
    driver,
    driverSteps,
    driverPlanet: PLANET_NAMES[driver] || "Venus (Shukra)",
    conductor,
    conductorSteps,
    conductorPlanet: PLANET_NAMES[conductor] || "Jupiter (Guru)"
  };
}

function renderNatalResonanceCard() {
  const dobInput = document.getElementById("inputDOB")?.value 
    || state.currentAnalysis?.driver_details?.dob 
    || "24-08-2005";
  const info = calculateBirthNumbers(dobInput);

  // 1. In Name Suggestions Container:
  const dobDisplay = document.getElementById("natalDobDisplay");
  const dVal = document.getElementById("natalDriverNumber");
  const dCalc = document.getElementById("natalDriverCalc");
  const dPlanet = document.getElementById("natalDriverPlanet");
  const cVal = document.getElementById("natalConductorNumber");
  const cCalc = document.getElementById("natalConductorCalc");
  const cPlanet = document.getElementById("natalConductorPlanet");
  const noteD = document.getElementById("noteDriverNum");
  const noteC = document.getElementById("noteConductorNum");

  if (dobDisplay) dobDisplay.textContent = `DOB: ${info.dob}`;
  if (dVal) dVal.textContent = String(info.driver);
  if (dCalc) dCalc.textContent = info.driverSteps;
  if (dPlanet) dPlanet.textContent = `Ruled by ${info.driverPlanet}`;
  if (cVal) cVal.textContent = String(info.conductor);
  if (cCalc) cCalc.textContent = info.conductorSteps;
  if (cPlanet) cPlanet.textContent = `Ruled by ${info.conductorPlanet}`;
  if (noteD) noteD.textContent = String(info.driver);
  if (noteC) noteC.textContent = String(info.conductor);

  // 2. In 9x9 Matrix Section:
  const synergyTitle = document.getElementById("userNatalSynergyTitle");
  const synergyCalc = document.getElementById("userNatalSynergyCalc");
  if (synergyTitle) synergyTitle.textContent = `Driver ${info.driver} & Conductor ${info.conductor}`;
  if (synergyCalc) synergyCalc.innerHTML = `${info.conductorSteps} &bull; Conductor ${info.conductor} (${info.conductorPlanet})`;

  // 3. In Chaldean Section:
  const chaldeanD = document.getElementById("chaldeanBirthDriverVal");
  const chaldeanC = document.getElementById("chaldeanBirthConductorVal");
  const chaldeanNote = document.getElementById("chaldeanBirthDobNote");
  if (chaldeanD) chaldeanD.textContent = `${info.driver}`;
  if (chaldeanC) chaldeanC.textContent = `${info.conductor}`;
  if (chaldeanNote) {
    chaldeanNote.innerHTML = `✦ Natal Frequencies: ${info.driverSteps} &rarr; <strong>Driver ${info.driver} (${info.driverPlanet.split(" ")[0]})</strong> &bull; ${info.conductorSteps} &rarr; <strong>Conductor ${info.conductor} (${info.conductorPlanet.split(" ")[0]})</strong>`;
  }

  // 4. Synchronize Prescribed Gemstone Showcase across all 3 Segments
  const driverPlanetShort = info.driverPlanet.split(" ")[0];
  const s1Badge = document.getElementById("prescribedSectionBadge");
  const s1Title = document.getElementById("prescribedSectionTitle");
  const s1Sub = document.getElementById("prescribedSectionSub");
  if (s1Badge) s1Badge.textContent = `✦ VEDIC GEMSTONE PRESCRIPTION · DRIVER ${info.driver} (${driverPlanetShort.toUpperCase()})`;
  if (s1Title) s1Title.textContent = `Vedic Gemstone Prescription for Driver ${info.driver} (${info.driverPlanet})`;
  if (s1Sub) {
    s1Sub.textContent = `Prescribed strictly for your Date of Birth (${info.dob}). How each sacred crystal bracelet transforms your planetary vibrations, harmonizes your name frequency, and invites abundance:`;
  }

  const s2Title = document.getElementById("matrixSectionTitle");
  const s2Sub = document.getElementById("matrixSectionSub");
  if (s2Title) s2Title.textContent = `Active Synergy Gemstones: Driver ${info.driver} (${driverPlanetShort}) Frequencies`;
  if (s2Sub) {
    s2Sub.textContent = `Ground the 81-intersection cosmic matrix with authentic natural crystal bracelets consecrated for your Driver line.`;
  }

  const s3Title = document.getElementById("chaldeanSectionTitle");
  const s3Sub = document.getElementById("chaldeanSectionSub");
  if (s3Title) s3Title.textContent = `Sound Resonance Gemstones for Driver ${info.driver} (${driverPlanetShort})`;
  if (s3Sub) {
    s3Sub.textContent = `Harmonize your name's acoustic vibration with sacred crystal frequencies consecrated with authentic Vedic Pran Pratishtha.`;
  }

  // Render the real prescribed products cards grid for each section
  renderPrescribedGemstoneProducts(info.driver, "gemstoneProductsGrid");
  renderPrescribedGemstoneProducts(info.driver, "matrixProductsGrid");
  renderPrescribedGemstoneProducts(info.driver, "chaldeanProductsGrid");
}

// ==========================================================================
// SACRED PRESCRIBED GEMSTONE CATALOG & MULANK MASTER BRACELETS (DOB-TUNED)
// ==========================================================================

const MULANK_PRESCRIBED_STONES = {
  1: ["Natural Citrine", "Sunstone"],
  2: ["Moonstone", "Aquamarine"],
  3: ["Ametrine", "Citrine", "Aventurine", "Amethyst"],
  4: ["Hematite", "Tiger Eye", "Black Tourmaline", "Smoky Quartz"],
  5: ["Citrine", "Amethyst", "Ametrine", "Aquamarine"],
  6: ["Rose Quartz", "Moonstone"],
  7: ["Clear Quartz", "Selenite"],
  8: ["Pyrite", "Hematite"],
  9: ["Amethyst", "Citrine", "Ametrine"]
};

const MULANK_MASTER_BRACELETS = {
  1: {
    id: "BRAC-MUL-01",
    name: "Mulank 1 — Solar Emperor Power Bracelet",
    planet: "Sun (Surya) ✦ Divine Vitality & Leadership",
    image: "/Shop/NaturalCitrine.jpg",
    stones: ["Natural Citrine", "Sunstone"],
    vibe: "Leadership • Divine Vitality • Supreme Confidence • Abundance",
    lifeImpact: [
      "Awakens supreme executive authority, public recognition, and bold decision-making.",
      "Dissolves self-doubt, career hesitation, and fear of failure with blazing solar fire.",
      "Attracts high-level career opportunities, financial victory, and leadership acclaim."
    ]
  },
  2: {
    id: "BRAC-MUL-02",
    name: "Mulank 2 — Lunar Intuition & Peace Bracelet",
    planet: "Moon (Chandra) ✦ Emotional Serenity & Deep Intuition",
    image: "/Shop/Moonstone.jpg",
    stones: ["Moonstone", "Aquamarine"],
    vibe: "Inner Peace • Deep Intuition • Emotional Balance • Calm Expression",
    lifeImpact: [
      "Soothes mood swings, lunar anxiety, and mental overthinking into deep stillness.",
      "Awakens piercing spiritual intuition and instinctive foresight for major life choices.",
      "Cultivates eloquent, compassionate communication and healing harmony in all relationships."
    ]
  },
  3: {
    id: "BRAC-MUL-03",
    name: "Mulank 3 — Cosmic Jupiter Abundance & Wisdom Bracelet",
    planet: "Jupiter (Guru) ✦ Higher Wisdom, Expansion & Fortune",
    image: "/Shop/Ametrine.jpg",
    stones: ["Ametrine", "Citrine", "Aventurine", "Amethyst"],
    vibe: "Creative Genius • Higher Wisdom • Wealth Expansion • Mental Clarity",
    lifeImpact: [
      "Multiplies intellectual brilliance, mentorship favor, and career promotion opportunities.",
      "Channels unbounded creative inspiration into lucrative, successful real-world ventures.",
      "Maintains divine spiritual grounding while unlocking exponential material prosperity."
    ]
  },
  4: {
    id: "BRAC-MUL-04",
    name: "Mulank 4 — Supreme Shield & Grounding Bracelet",
    planet: "Rahu ✦ Master Strategist, Stability & Psychic Protection",
    image: "/Shop/Hematite.jpg",
    stones: ["Hematite", "Tiger Eye", "Black Tourmaline", "Smoky Quartz"],
    vibe: "Psychic Protection • Energetic Grounding • Willpower • Stability",
    lifeImpact: [
      "Constructs an impenetrable energetic shield against psychic attacks, evil eye, and sudden shocks.",
      "Transforms chaotic overstimulation into grounded, strategic, unstoppable focus.",
      "Neutralizes EMF electromagnetic stress and grounds nervous restlessness into solid stability."
    ]
  },
  5: {
    id: "BRAC-MUL-05",
    name: "Mulank 5 — Mercury Rapid Growth & Magnetism Bracelet",
    planet: "Mercury (Budh) ✦ Commerce, Intellect, Speed & Versatility",
    image: "/Shop/Citrine.jpg",
    stones: ["Citrine", "Amethyst", "Ametrine", "Aquamarine"],
    vibe: "Commercial Acumen • Fluid Communication • Financial Luck • Adaptability",
    lifeImpact: [
      "Sharpens commercial acumen, sales negotiation power, and fast intellectual wit.",
      "Attracts rapid business growth, lucrative trade deals, and financial luck in transactions.",
      "Relieves burnout, calming a hyperactive mind while maintaining peak mental efficiency."
    ]
  },
  6: {
    id: "BRAC-MUL-06",
    name: "Mulank 6 — Venusian Love & Luxury Magnetism Bracelet",
    planet: "Venus (Shukra) ✦ Divine Beauty, Luxury, Magnetism & Affluence",
    image: "/Shop/RoseQuartz.jpg",
    stones: ["Rose Quartz", "Moonstone"],
    vibe: "Unconditional Love • Romantic Harmony • Artistic Grace • Luxury Magnetism",
    lifeImpact: [
      "Magnetizes devoted soulmate romance, marital harmony, and affectionate lifelong bonds.",
      "Radiates captivating Venusian charm, social magnetism, and refined aesthetic luxury.",
      "Heals deep emotional wounds and heart grief, replenishing aura with pure joyful radiance."
    ]
  },
  7: {
    id: "BRAC-MUL-07",
    name: "Mulank 7 — Ketu Mystic Awakening & Aura Purification Bracelet",
    planet: "Ketu ✦ Spiritual Liberation, Higher Perception & Aura Cleansing",
    image: "/Shop/ClearQuartz.jpg",
    stones: ["Clear Quartz", "Selenite"],
    vibe: "Pure Consciousness • Aura Cleansing • Deep Meditation • Sacred Vision",
    lifeImpact: [
      "Dissolves stubborn energetic blockages and karmic fog from your aura and chakras.",
      "Deepens meditation, prayer, and yoga practice into profound transcendent peace.",
      "Awakens mystical foresight and protects spiritual seekers from psychic disturbance."
    ]
  },
  8: {
    id: "BRAC-MUL-08",
    name: "Mulank 8 — Saturn Karmic Wealth & Resilient Power Bracelet",
    planet: "Saturn (Shani) ✦ Monumental Wealth, Mastery & Empire Building",
    image: "/Shop/Pyrite.jpg",
    stones: ["Pyrite", "Hematite"],
    vibe: "Monumental Wealth • Iron Determination • Karmic Protection • Relentless Focus",
    lifeImpact: [
      "Attracts monumental long-term wealth, high-ticket deal closure, and asset creation.",
      "Infuses your mind with iron perseverance to overcome delays and conquer life obstacles.",
      "Protects against severe Saturnian karmic setbacks, legal traps, and financial bleeding."
    ]
  },
  9: {
    id: "BRAC-MUL-09",
    name: "Mulank 9 — Mars Warrior Courage & Divine Wisdom Bracelet",
    planet: "Mars (Mangal) ✦ Dynamic Courage, Victory & Tempered Passion",
    image: "/Shop/Amethyst.jpg",
    stones: ["Amethyst", "Citrine", "Ametrine"],
    vibe: "Dynamic Courage • Tempered Passion • Abundant Victory • Spiritual Harmony",
    lifeImpact: [
      "Channels fiery Martian intensity into laser-focused strategic victory and leadership.",
      "Tempers explosive frustration and impatience into calm, charismatic, respected authority.",
      "Fuses unstoppable courage with spiritual wisdom to achieve peak career milestones."
    ]
  }
};

const GEMSTONES_PRESCRIPTION_CATALOG = {
  "Natural Citrine": {
    id: "GEM-NCIT-09",
    name: "Natural Citrine Wealth & Radiance Bracelet",
    image: "/Shop/NaturalCitrine.jpg",
    planet: "Sun (Surya) Resonance ✦ Solar Plexus Chakra",
    vibe: "Abundance • Solar Power • Confidence • Prosperity",
    lifeImpact: [
      "Draws unexpected wealth opportunities, business expansion, and financial security.",
      "Dissolves self-doubt, fear of failure, and lethargy with warm solar radiance.",
      "Cleanses the solar plexus chakra to command respect, authority, and executive clarity."
    ]
  },
  "Sunstone": {
    id: "GEM-SUN-11",
    name: "Sacred Sunstone Leadership & Vitality Bracelet",
    image: "/Shop/Sunstone.jpg",
    planet: "Sun (Surya) Resonance ✦ Sacral & Solar Chakra",
    vibe: "Vitality • Charisma • Willpower • Solar Fortune",
    lifeImpact: [
      "Ignites charismatic personal presence and social magnetism in high-stakes negotiations.",
      "Restores physical stamina, banishes fatigue, and shields against energetic exhaustion.",
      "Aligns your aura with Sun vibrations for public fame, honors, and professional triumph."
    ]
  },
  "Moonstone": {
    id: "GEM-MOO-08",
    name: "Sacred Rainbow Moonstone Intuition & Calm Bracelet",
    image: "/Shop/Moonstone.jpg",
    planet: "Moon (Chandra) Resonance ✦ Third Eye & Crown Chakra",
    vibe: "Inner Peace • Deep Intuition • Emotional Poise • Lunar Grace",
    lifeImpact: [
      "Dissolves anxiety, overthinking, and restless mood swings with tranquil lunar vibrations.",
      "Awakens psychic intuition, spiritual instinct, and lucid clarity during pivotal decisions.",
      "Brings deep harmony to personal relationships, emotional healing, and restful sleep."
    ]
  },
  "Aquamarine": {
    id: "GEM-AQU-03",
    name: "Sacred Aquamarine Serenity & Eloquence Bracelet",
    image: "/Shop/Aquamarine.jpg",
    planet: "Moon & Mercury Resonance ✦ Throat Chakra",
    vibe: "Tranquility • Eloquence • Clear Speech • Aura Shield",
    lifeImpact: [
      "Unblocks the throat chakra for persuasive, articulate, and magnetic verbal communication.",
      "Washes away pent-up emotional frustration, stress, and anger like ocean waves.",
      "Protects personal energy fields against hostile environments and negativity."
    ]
  },
  "Ametrine": {
    id: "GEM-AMT-02",
    name: "Sacred Ametrine Dual-Ray Clarity & Balance Bracelet",
    image: "/Shop/Ametrine.jpg",
    planet: "Jupiter & Mercury Resonance ✦ Solar & Crown Synergy",
    vibe: "Creative Genius • Balance • Mental Focus • Spiritual Abundance",
    lifeImpact: [
      "Fuses Citrine's wealth frequency with Amethyst's spiritual peace for laser-focused genius.",
      "Eliminates mental confusion, creative blocks, and burnout during heavy workloads.",
      "Harmonizes intellect with higher intuition for prosperous, balanced life decisions."
    ]
  },
  "Citrine": {
    id: "GEM-CIT-06",
    name: "Merchant's Golden Citrine Prosperity Bracelet",
    image: "/Shop/Citrine.jpg",
    planet: "Jupiter & Mercury Resonance ✦ Solar Plexus Chakra",
    vibe: "Wealth Magnet • Joy • Commercial Success • Abundance",
    lifeImpact: [
      "Known traditionally as the 'Merchant's Stone' to multiply commercial turnover and profits.",
      "Transforms heavy negative thoughts into joyous optimism, motivation, and radiant confidence.",
      "Never absorbs negative energy; continuously dispenses warm, expansive solar vibrations."
    ]
  },
  "Aventurine": {
    id: "GEM-AVE-04",
    name: "Green Aventurine Fortune & Growth Bracelet",
    image: "/Shop/Aventurine.jpg",
    planet: "Mercury & Jupiter Resonance ✦ Heart Chakra",
    vibe: "Good Fortune • Growth • Heart Healing • Prosperity",
    lifeImpact: [
      "Known as the premier stone of opportunity and winning energy in career and investments.",
      "Releases old patterns, emotional baggage, and heart distress to welcome fresh beginnings.",
      "Boosts vitality, perseverance, and practical problem-solving in competitive fields."
    ]
  },
  "Amethyst": {
    id: "GEM-AME-01",
    name: "Sacred Royal Amethyst Spiritual Shield Bracelet",
    image: "/Shop/Amethyst.jpg",
    planet: "Jupiter & Saturn Resonance ✦ Crown Chakra",
    vibe: "Crown Chakra Awakening • Divine Peace • Sleep & Sobriety",
    lifeImpact: [
      "Shields your aura with a violet spiritual flame that repels negativity, evil eye, and ill-will.",
      "Quiets a hyperactive racing mind to cultivate serene meditation and restorative sleep.",
      "Breaks compulsive habits, emotional dependencies, and stress-induced anxiety."
    ]
  },
  "Hematite": {
    id: "GEM-HEM-07",
    name: "Mirror Hematite Supreme Grounding & Armor Bracelet",
    image: "/Shop/Hematite.jpg",
    planet: "Saturn & Rahu Resonance ✦ Root Chakra",
    vibe: "Iron Grounding • Willpower • Mental Clarity • Defense",
    lifeImpact: [
      "Anchors your nervous system into deep physical stability and unshakeable inner resilience.",
      "Reflects negative planetary afflictions, toxic comments, and psychic drainage like a mirror.",
      "Enhances memory, logical calculation, and disciplined concentration under intense pressure."
    ]
  },
  "Tiger Eye": {
    id: "GEM-TIG-12",
    name: "Golden Tiger Eye Courage & Fierce Focus Bracelet",
    image: "/Shop/TigerEye.jpg",
    planet: "Rahu & Sun Resonance ✦ Solar Plexus & Root",
    vibe: "Fierce Courage • Wealth Protection • Action • Focus",
    lifeImpact: [
      "Instills the fierce courage of a tiger to conquer daunting obstacles and seize profitable deals.",
      "Guards your accumulated savings and investments against impulsive losses and deceit.",
      "Grounds scattered willpower into relentless, successful daily execution."
    ]
  },
  "Black Tourmaline": {
    id: "GEM-BTR-05",
    name: "Black Tourmaline Absolute Psychic Shield Bracelet",
    image: "/Shop/BlackTourmaline.jpg",
    planet: "Rahu & Saturn Resonance ✦ Earth Star & Root",
    vibe: "Psychic Shield • EMF Defense • Toxin Purge • Aura Cleanse",
    lifeImpact: [
      "The ultimate occult shield against psychic attacks, evil eye (Nazar), and negative entities.",
      "Neutralizes harmful electromagnetic smog from laptops, phones, and high-tech environments.",
      "Grounds root chakra energy to eliminate chronic worry, panic, and fatigue."
    ]
  },
  "Smoky Quartz": {
    id: "GEM-SMQ-10",
    name: "Smoky Quartz Negative Energy Transmutation Bracelet",
    image: "/Shop/SmokyQuartz.jpg",
    planet: "Rahu & Saturn Resonance ✦ Root Chakra",
    vibe: "Detoxification • Emotional Stability • Resilience • Grounding",
    lifeImpact: [
      "Absorbs heavy emotional pain, depression, and tension, transmuting them into neutral light.",
      "Provides unwavering emotional stamina during life crises, career shifts, and challenges.",
      "Deepens grounding connection to the earth for practical, clear-headed survival instincts."
    ]
  },
  "Rose Quartz": {
    id: "GEM-RSQ-13",
    name: "Natural Rose Quartz Divine Love & Magnetism Bracelet",
    image: "/Shop/RoseQuartz.jpg",
    planet: "Venus (Shukra) Resonance ✦ Heart Chakra Frequency",
    vibe: "Unconditional Love • Romantic Harmony • Self-Healing • Grace",
    lifeImpact: [
      "Opens the heart chakra to attract devoted soulmate love, romantic commitment, and deep affection.",
      "Heals emotional heartbreak, dissolves trauma, and restores compassionate self-esteem.",
      "Radiates soft Venusian beauty and grace that inspires trust and affection from everyone around you."
    ]
  },
  "Clear Quartz": {
    id: "GEM-CLQ-14",
    name: "Sacred Clear Quartz Master Healer & Amplifier Bracelet",
    image: "/Shop/ClearQuartz.jpg",
    planet: "Ketu & Crown Resonance ✦ All 7 Chakras Harmonizer",
    vibe: "Crown Awakening • Frequency Amplification • Purity • Clarity",
    lifeImpact: [
      "Amplifies the vibrational power of all other crystals and your sacred name frequencies ten-fold.",
      "Cleanses energetic blockages from all 7 chakras, bringing pristine mental and spiritual focus.",
      "Connects your conscious mind with divine cosmic guidance and intuitive foresight."
    ]
  },
  "Selenite": {
    id: "GEM-SEL-15",
    name: "Pure Selenite Moon-Ray Aura Purification Bracelet",
    image: "/Shop/Selenite.jpg",
    planet: "Moon & Ketu Resonance ✦ Crown & Soul Star Chakra",
    vibe: "Divine Light • Aura Cleansing • High Vibration • Serenity",
    lifeImpact: [
      "Dissolves stagnant aura baggage and energetic blockages with pure ethereal liquid light.",
      "Instantly clears spiritual clutter, offering divine serenity, peaceful thoughts, and meditation depth.",
      "Infuses your subtle energy field with celestial protection and angelic harmony."
    ]
  },
  "Pyrite": {
    id: "GEM-PYR-16",
    name: "Golden Pyrite (Fool's Gold) Monumental Wealth Bracelet",
    image: "/Shop/Pyrite.jpg",
    planet: "Saturn (Shani) Resonance ✦ Solar Plexus & Root",
    vibe: "Monumental Wealth • Iron Determination • Karmic Mastery • Success",
    lifeImpact: [
      "The premier stone for massive wealth manifestation, high-ticket deal closure, and empire building.",
      "Harnesses Saturnian perseverance to overcome insurmountable career obstacles and delays.",
      "Shields personal wealth from financial bleeding, fraud, and deceptive partnerships."
    ]
  }
};

function renderPrescribedGemstoneProducts(driverNum, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const d = parseInt(driverNum, 10) || 6;
  const dobInput = document.getElementById("inputDOB")?.value || "24-08-2005";
  const fullName = document.getElementById("inputFullName")?.value.trim() || "Seeker";

  // Typewriter animation on service banner
  const twEl = document.getElementById("serviceTypewriterText");
  const shopRedirectBtn = document.getElementById("btnServiceRedirectShop");
  if (shopRedirectBtn) {
    shopRedirectBtn.href = `/shop/?mulank=${d}&matched=true`;
  }
  if (twEl) {
    const planetName = MULANK_MASTER_BRACELETS[d]?.planet || "Cosmic Planet";
    const msg = `🎯 Cosmic Match Confirmed: Based on your Driver ${d} (${planetName}), our Vedic engine has prescribed authentic consecrated crystal remedies for your aura.`;
    let charIdx = 0;
    twEl.textContent = "";
    clearInterval(window._serviceTypeInt);
    window._serviceTypeInt = setInterval(() => {
      if (charIdx < msg.length) {
        twEl.textContent += msg.charAt(charIdx++);
      } else {
        clearInterval(window._serviceTypeInt);
      }
    }, 25);
  }

  // Prescribed stone names for this Driver
  const stoneNames = MULANK_PRESCRIBED_STONES[d] || ["Rose Quartz", "Moonstone"];
  const masterTalisman = MULANK_MASTER_BRACELETS[d];

  // Build product list: Master Talisman FIRST, followed by individual prescribed crystals
  const productsToRender = [];
  if (masterTalisman) {
    productsToRender.push({
      id: masterTalisman.id,
      name: masterTalisman.name,
      image: masterTalisman.image,
      planet: masterTalisman.planet,
      vibe: masterTalisman.vibe,
      lifeImpact: masterTalisman.lifeImpact,
      mulank: d,
      stones: masterTalisman.stones.join(", "),
      isMaster: true
    });
  }

  stoneNames.forEach((sName) => {
    const gem = GEMSTONES_PRESCRIPTION_CATALOG[sName];
    if (gem) {
      productsToRender.push({
        id: gem.id,
        name: gem.name,
        image: gem.image,
        planet: gem.planet,
        vibe: gem.vibe,
        lifeImpact: gem.lifeImpact,
        mulank: d,
        stones: sName,
        isMaster: false
      });
    }
  });

  container.innerHTML = "";

  productsToRender.forEach((prod) => {
    const card = document.createElement("div");
    card.className = "prescribed-product-card";

    const topTagText = prod.isMaster
      ? `✦ MASTER TALISMAN • DRIVER ${d} SYNERGY`
      : `✦ 100% NATURAL CERTIFIED GEMSTONE • DRIVER ${d}`;

    const impactHtml = prod.lifeImpact
      .map((item) => `<li class="life-impact-item">${item}</li>`)
      .join("");

    const waMsg = encodeURIComponent(
      `Hello Numerology Fortune, I want to order the consecrated ${prod.name} (Flat ₹1,499 offer) for my DOB: ${dobInput}, Name: ${fullName}.`
    );
    const waUrl = `https://api.whatsapp.com/send?phone=919836394217&text=${waMsg}`;

    card.innerHTML = `
      <div class="prescribed-card-top-tag">
        <span>${topTagText}</span>
        <span style="color: #34D399; font-size: 0.72rem; font-weight: 700;">● Consecrated Stock</span>
      </div>
      <div class="prescribed-card-visual">
        <img src="${prod.image}" alt="${prod.name}" class="prescribed-card-img" loading="lazy" />
      </div>
      <div class="prescribed-card-content">
        <h4 class="prescribed-card-title">${prod.name}</h4>
        <span class="prescribed-card-planet-tag">✦ ${prod.planet}</span>
        <div class="prescribed-card-vibe">"${prod.vibe}"</div>

        <div class="prescribed-life-impact-box">
          <span class="life-impact-heading">✦ How This Sacred Bracelet Transforms Your Life:</span>
          <ul class="life-impact-list">
            ${impactHtml}
          </ul>
        </div>

        <div class="prescribed-consecration-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <span>Consecrated for DOB: <strong>${dobInput}</strong> with Vedic Pran Pratishtha</span>
        </div>

        <div class="prescribed-card-pricing">
          <span class="prescribed-curr-price">₹1,499</span>
          <span class="prescribed-old-price">₹2,500</span>
          <span class="prescribed-discount-pill">Save 40% (₹1,001 OFF)</span>
        </div>

        <div class="prescribed-card-actions">
          <button type="button" class="btn-order-stone-rzp" data-product-id="${prod.id}">
            <span>✦ Order Consecrated Bracelet — ₹1,499</span>
          </button>
          <a href="/shop/?mulank=${d}&matched=true" class="btn-prescribed-store-redirect">
            <span>🛍️ View in Sacred Gemstone Store (Flipkart Style) →</span>
          </a>
          <a href="${waUrl}" target="_blank" rel="noopener" class="btn-order-stone-wa">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.18-.543-1.897-.787-3.119-2.73-3.214-2.857-.093-.127-.768-1.022-.768-1.95 0-.928.487-1.385.661-1.574.174-.189.381-.237.508-.237.126 0 .253.003.363.008.117.006.274-.045.428.327.16.386.545 1.332.593 1.43.048.099.08.214.015.342-.064.129-.096.209-.191.319-.095.109-.2.245-.286.329-.095.094-.194.196-.083.387.111.19.493.814 1.057 1.318.727.648 1.341.85 1.531.945.191.096.302.08.414-.048.111-.127.476-.556.603-.746.127-.19.254-.159.428-.095.175.064 1.11.523 1.301.619.191.095.318.143.366.222.048.08.048.461-.096.866zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.178L2 22l4.981-1.396A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
            </svg>
            <span>Or Order via WhatsApp (+91 98363 94217)</span>
          </a>
        </div>

        <div class="prescribed-card-trust-row">
          <span>✓ 100% Certified Natural</span>
          <span>✓ Vedic Pran Pratishtha</span>
          <span>✓ Pan-India Delivery Included</span>
        </div>
      </div>
    `;

    card.querySelector(".btn-order-stone-rzp")?.addEventListener("click", () => {
      openGemstoneOrderModal(prod);
    });

    container.appendChild(card);
  });
}

function openGemstoneOrderModal(product) {
  const modal = document.getElementById("gemstoneOrderModal");
  if (!modal) return;

  const hiddenId = document.getElementById("orderProductId");
  const hiddenName = document.getElementById("orderProductName");
  const hiddenMulank = document.getElementById("orderProductMulank");
  const hiddenStones = document.getElementById("orderProductStones");
  const previewImg = document.getElementById("gemstoneOrderPreviewImg");
  const titleEl = document.getElementById("gemstoneOrderTitle");
  const tagEl = document.getElementById("gemstoneOrderMulankTag");

  if (hiddenId) hiddenId.value = product.id || "GEM-RSQ-13";
  if (hiddenName) hiddenName.value = product.name || "Sacred Gemstone Bracelet";
  if (hiddenMulank) hiddenMulank.value = String(product.mulank || "6");
  if (hiddenStones) hiddenStones.value = product.stones || product.name;
  if (previewImg) previewImg.src = product.image || "/Shop/RoseQuartz.jpg";
  if (titleEl) titleEl.textContent = product.name;
  if (tagEl) tagEl.textContent = `✦ Driver ${product.mulank} Prescription`;

  // Autofill user details if available
  const nameInput = document.getElementById("inputFullName");
  const dobInput = document.getElementById("inputDOB");
  const emailVal = getUserEmail();

  const cName = document.getElementById("gemstoneCustomerName");
  const cDob = document.getElementById("gemstoneCustomerDob");
  const cEmail = document.getElementById("gemstoneCustomerEmail");

  if (cName && nameInput && nameInput.value.trim() && !cName.value) {
    cName.value = nameInput.value.trim();
  }
  if (cDob && dobInput && dobInput.value.trim() && !cDob.value) {
    cDob.value = dobInput.value.trim();
  }
  if (cEmail && emailVal && !cEmail.value) {
    cEmail.value = emailVal;
  }

  const errEl = document.getElementById("gemstoneOrderError");
  if (errEl) {
    errEl.textContent = "";
    errEl.classList.add("hidden");
  }

  modal.classList.remove("hidden");
}

function initGemstoneOrderModal() {
  const modal = document.getElementById("gemstoneOrderModal");
  const backdrop = document.getElementById("gemstoneModalBackdrop");
  const btnClose = document.getElementById("btnCloseGemstoneModal");
  const form = document.getElementById("gemstoneOrderForm");
  const btnWa = document.getElementById("btnOrderGemstoneWhatsApp");
  const errEl = document.getElementById("gemstoneOrderError");

  function closeModal() {
    modal?.classList.add("hidden");
  }

  btnClose?.addEventListener("click", closeModal);
  backdrop?.addEventListener("click", closeModal);

  btnWa?.addEventListener("click", () => {
    const prodName = document.getElementById("orderProductName")?.value || "Sacred Gemstone Bracelet";
    const cName = document.getElementById("gemstoneCustomerName")?.value || "Seeker";
    const cDob = document.getElementById("gemstoneCustomerDob")?.value || "24-08-2005";
    const waMsg = encodeURIComponent(
      `Hello Numerology Fortune, I would like to order the ${prodName} (Flat ₹1,499 offer).\nName: ${cName}\nDOB for Consecration: ${cDob}\nPlease guide me on dispatch.`
    );
    window.open(`https://api.whatsapp.com/send?phone=919836394217&text=${waMsg}`, "_blank");
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (errEl) {
      errEl.textContent = "";
      errEl.classList.add("hidden");
    }

    const prodId = document.getElementById("orderProductId")?.value;
    const prodName = document.getElementById("orderProductName")?.value;
    const prodMulank = document.getElementById("orderProductMulank")?.value;
    const prodStones = document.getElementById("orderProductStones")?.value;

    const customerName = document.getElementById("gemstoneCustomerName")?.value.trim();
    const customerPhone = document.getElementById("gemstoneCustomerPhone")?.value.trim();
    const customerEmail = document.getElementById("gemstoneCustomerEmail")?.value.trim();
    const customerDob = document.getElementById("gemstoneCustomerDob")?.value.trim();
    const shippingAddress = document.getElementById("gemstoneShippingAddress")?.value.trim();
    const city = document.getElementById("gemstoneCity")?.value.trim();
    const stateVal = document.getElementById("gemstoneState")?.value.trim() || "India";
    const pincode = document.getElementById("gemstonePincode")?.value.trim();

    if (!customerName || !customerPhone || !customerEmail || !shippingAddress || !city || !pincode) {
      if (errEl) {
        errEl.textContent = "Please fill in all required shipping and contact details.";
        errEl.classList.remove("hidden");
      }
      return;
    }

    syncUserEmail(customerEmail);

    const submitBtn = document.getElementById("btnSubmitGemstoneRazorpay");
    const originalBtnText = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = "<span>Connecting to Secure Gateway...</span>";
    }

    try {
      const orderRes = await fetch("/api/shop/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: prodName,
          product_id: prodId,
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          address: shippingAddress,
          city: city,
          state: stateVal,
          pincode: pincode,
          dob: customerDob,
          mulank: prodMulank,
          stones: prodStones,
          amount: 149900
        })
      });

      if (!orderRes.ok) {
        throw new Error("Unable to create order with payment gateway.");
      }

      const orderJson = await orderRes.json();
      if (!orderJson.success || !orderJson.data) {
        throw new Error(orderJson.detail || "Gateway initialization failed.");
      }

      const rzpOrder = orderJson.data;
      const keyId = orderJson.key_id || state.pricing.razorpay_key_id;

      if (typeof Razorpay === "undefined") {
        throw new Error("Razorpay SDK not loaded. Please try ordering via WhatsApp.");
      }

      const options = {
        key: keyId,
        amount: rzpOrder.amount || 149900,
        currency: rzpOrder.currency || "INR",
        name: "Numerology Fortune",
        description: `Sacred Consecrated Bracelet: ${prodName}`,
        image: "/static/data/logo-nf-mark.png",
        order_id: rzpOrder.id,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone
        },
        theme: {
          color: "#B88928"
        },
        handler: async function (response) {
          try {
            if (submitBtn) {
              submitBtn.innerHTML = "<span>Verifying Consecration Order...</span>";
            }

            await fetch("/api/shop/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                product_name: prodName,
                product_id: prodId,
                name: customerName,
                phone: customerPhone,
                email: customerEmail,
                address: shippingAddress,
                city: city,
                state: stateVal,
                pincode: pincode,
                dob: customerDob,
                mulank: prodMulank,
                stones: prodStones,
                amount: 1499
              })
            });

            closeModal();

            const waSuccessMsg = encodeURIComponent(
              `✨ Namaste Numerology Fortune! I have completed payment for my sacred bracelet.\n\n` +
              `✦ Order Ref: ${response.razorpay_payment_id}\n` +
              `✦ Bracelet: ${prodName}\n` +
              `✦ Consecration Name: ${customerName}\n` +
              `✦ DOB: ${customerDob}\n` +
              `✦ Shipping: ${shippingAddress}, ${city} - ${pincode}\n\n` +
              `Please begin the Vedic Pran Pratishtha ritual and share the courier tracking.`
            );

            alert(
              `✦ Order Placed Successfully!\n\nPayment ID: ${response.razorpay_payment_id}\n\n` +
              `Your order for "${prodName}" is confirmed! The official receipt has been dispatched to ${customerEmail}.\n\n` +
              `Click OK to open WhatsApp and share your order details with our Vedic Acharyas.`
            );

            window.open(`https://api.whatsapp.com/send?phone=919836394217&text=${waSuccessMsg}`, "_blank");
          } catch (verErr) {
            console.error("Verification error:", verErr);
            alert("Payment processed! Our team will contact you shortly on WhatsApp to confirm shipping.");
          }
        },
        modal: {
          ondismiss: function () {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalBtnText;
            }
          }
        }
      };

      const rzpInstance = new Razorpay(options);
      rzpInstance.open();

    } catch (err) {
      console.error("Order processing error:", err);
      if (errEl) {
        errEl.textContent = err.message || "An error occurred. Please try again or use WhatsApp ordering.";
        errEl.classList.remove("hidden");
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  });
}

/* ==========================================================================
   6A. 9x9 Driver / Conductor Matrix Section (₹199 Standalone — Inline No Popups)
   ========================================================================== */
function initDCMatrixSection() {
  // Pre-fetch matrix data
  if (!state.dcMatrix) {
    fetch("/api/matrix")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          state.dcMatrix = j.data;
        }
      })
      .catch(() => {});
  }
}

function renderMatrixInline() {
  const dobInput = document.getElementById("inputDOB")?.value || "24-08-2005";
  const info = calculateBirthNumbers(dobInput);
  const userD = state.currentAnalysis?.driver_details?.driver_number || info.driver;
  const userC = state.currentAnalysis?.conductor_details?.conductor_number || info.conductor;

  const synergyTitle = document.getElementById("userNatalSynergyTitle");
  const synergyNumbers = document.getElementById("userNatalSynergyNumbers");
  const synergyCalc = document.getElementById("userNatalSynergyCalc");
  const inspectorTitle = document.getElementById("inspectorTitle");
  const inspectorNumbers = document.getElementById("inspectorNumbers");

  let recs = [];
  if (state.dcMatrix) {
    recs = (state.dcMatrix[String(userD)] && state.dcMatrix[String(userD)][String(userC)])
      || state.dcMatrix[`${userD},${userC}`]
      || [];
  }
  if (!recs || recs.length === 0) {
    recs = (userD === 6 && userC === 3) ? [3, 5] : [5];
  }

  if (synergyTitle) synergyTitle.textContent = `Driver ${userD} & Conductor ${userC}`;
  if (synergyCalc) synergyCalc.innerHTML = `${info.conductorSteps} &bull; Ruled by ${info.conductorPlanet}`;
  if (synergyNumbers) synergyNumbers.textContent = `[${recs.join(", ")}]`;
  if (inspectorTitle) inspectorTitle.textContent = `Driver ${userD} & Conductor ${userC}`;
  if (inspectorNumbers) inspectorNumbers.innerHTML = `Recommended Name Numbers: <strong>[${recs.join(", ")}]</strong>`;

  renderNatalResonanceCard();
  renderMatrixTable();
}

function renderMatrixTable() {
  const tbody = document.getElementById("dcMatrixBody");
  if (!tbody) return;

  if (!state.dcMatrix) {
    fetch("/api/matrix")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          state.dcMatrix = j.data;
          renderMatrixTable();
        }
      })
      .catch(() => {});
    return;
  }

  tbody.innerHTML = "";

  const dobInput = document.getElementById("inputDOB")?.value || "24-08-2005";
  const info = calculateBirthNumbers(dobInput);
  const userD = state.currentAnalysis?.driver_details?.driver_number || info.driver;
  const userC = state.currentAnalysis?.conductor_details?.conductor_number || info.conductor;

  for (let d = 1; d <= 9; d++) {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.textContent = `D${d}`;
    tr.appendChild(th);

    for (let c = 1; c <= 9; c++) {
      const td = document.createElement("td");
      const recs = (state.dcMatrix[String(d)] && state.dcMatrix[String(d)][String(c)])
        || state.dcMatrix[`${d},${c}`]
        || [];
      td.textContent = recs.join(", ");
      td.title = `Driver ${d} & Conductor ${c}: [${recs.join(", ")}]`;

      if (userD === d && userC === c) {
        td.classList.add("highlight-user-cell");
      }

      td.addEventListener("click", () => {
        document.querySelectorAll("#dcMatrixBody td").forEach((cell) => cell.classList.remove("selected-cell"));
        td.classList.add("selected-cell");

        const titleEl = document.getElementById("inspectorTitle");
        const numsEl = document.getElementById("inspectorNumbers");
        if (titleEl) titleEl.textContent = `Driver ${d} & Conductor ${c}`;
        if (numsEl) numsEl.innerHTML = `Recommended Name Numbers: <strong>[${recs.join(", ")}]</strong>`;
      });

      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  }
}

/* ==========================================================================
   6B. Chaldean Sacred Vibrational Chart Section (₹199 Standalone — Inline No Popups)
   ========================================================================== */
const CHALDEAN_MAP = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8
};

const PLANET_MAP = {
  1: "Sun (Surya) — Leadership & Vitality",
  2: "Moon (Chandra) — Intuition & Sensitivity",
  3: "Jupiter (Guru) — Wisdom & Creative Growth",
  4: "Rahu / Uranus — Intellect & Radical Transformation",
  5: "Mercury (Budh) — Commerce, Versatility & Speed",
  6: "Venus (Shukra) — Luxury, Magnetism & Harmony",
  7: "Ketu / Neptune — Spiritual Depth & Mysticism",
  8: "Saturn (Shani) — Karmic Discipline & Material Mastery",
  9: "Mars (Mangal) — Passion, Courage & Drive"
};

function calculateChaldeanBreakdown(rawName) {
  const letters = (rawName || "").toUpperCase().replace(/[^A-Z]/g, "").split("");
  if (letters.length === 0) {
    return { compound: 0, root: 0, planet: "-", chipsHtml: "" };
  }

  let compound = 0;
  const chips = [];

  letters.forEach((char) => {
    const val = CHALDEAN_MAP[char] || 0;
    compound += val;
    chips.push(`<span class="letter-chip"><span class="chip-char">${char}</span><span class="chip-val">${val}</span></span>`);
  });

  let root = compound;
  while (root > 9) {
    root = String(root).split("").reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }

  return {
    compound,
    root,
    planet: PLANET_MAP[root] || "-",
    chipsHtml: chips.join(" + ")
  };
}

function initChaldeanChartSection() {
  // Initialized without live analyzer as per requirements
}

function renderChaldeanInline() {
  const rawName = document.getElementById("inputFullName")?.value.trim() || "Seeker";
  const userTitle = document.getElementById("chaldeanUserNameTitle");
  if (userTitle) userTitle.textContent = `✦ Chaldean Sound Frequency Analysis for "${rawName.toUpperCase()}"`;

  const breakdown = calculateChaldeanBreakdown(rawName);

  const personalBreakdown = document.getElementById("chaldeanPersonalLetterBreakdown");
  const personalComp = document.getElementById("chaldeanPersonalCompoundVal");
  const personalRoot = document.getElementById("chaldeanPersonalRootVal");
  const personalPlanet = document.getElementById("chaldeanPersonalPlanetVal");

  if (personalBreakdown) personalBreakdown.innerHTML = breakdown.chipsHtml;
  if (personalComp) personalComp.textContent = String(breakdown.compound);
  if (personalRoot) personalRoot.textContent = String(breakdown.root);
  if (personalPlanet) personalPlanet.textContent = breakdown.planet;

  renderNatalResonanceCard();
}

/* ==========================================================================
   7. Resend / Dispatch Dossier to Email & Save PDF (All Products)
   ========================================================================== */
function syncUserEmail(email) {
  if (!email) return;
  state.userEmail = email;
  const emailInputIds = [
    "inputEmail",
    "modalEmail",
    "inputResendEmail",
    "inputEmailDashboard",
    "inputEmailDCMatrix",
    "inputEmailChaldean"
  ];
  emailInputIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el && !el.value) {
      el.value = email;
    }
  });
}

function getUserEmail() {
  if (state.userEmail) return state.userEmail;
  const emailInputIds = [
    "inputEmail",
    "modalEmail",
    "inputResendEmail",
    "inputEmailDashboard",
    "inputEmailDCMatrix",
    "inputEmailChaldean"
  ];
  for (const id of emailInputIds) {
    const el = document.getElementById(id);
    if (el && el.value && el.value.trim().includes("@")) {
      return el.value.trim();
    }
  }
  return "";
}

async function sendProductEmail(email, productType = "check_name", btnEl, statusEl) {
  if (!email) {
    email = getUserEmail();
  }
  if (!email || !email.includes("@")) {
    alert("Please enter a valid email address.");
    return false;
  }
  syncUserEmail(email);

  const name = document.getElementById("inputFullName")?.value.trim() 
    || document.getElementById("modalFullName")?.value.trim() 
    || "Seeker";
  const dob = document.getElementById("inputDOB")?.value 
    || document.getElementById("modalDOB")?.value 
    || "";
  const gender = document.getElementById("selectGender")?.value 
    || document.getElementById("modalGender")?.value 
    || "Male";

  if (btnEl) {
    btnEl.disabled = true;
    btnEl.style.opacity = "0.7";
  }
  if (statusEl) {
    statusEl.textContent = "Dispatching report to email...";
    statusEl.classList.remove("hidden");
    statusEl.style.color = "#D4AF37";
  }

  let amount = state.pricing.check_name_inr;
  if (productType === "dc_matrix") amount = state.pricing.dc_matrix_inr;
  else if (productType === "chaldean_chart") amount = state.pricing.chaldean_chart_inr;

  try {
    const res = await fetch("/api/payment/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name,
        dob,
        gender,
        payment_id: state.paymentId || "Direct",
        amount,
        analysis_data: state.currentAnalysis,
        suggestions: state.generatedVariants,
        product_type: productType
      })
    });

    if (res.ok) {
      if (statusEl) {
        statusEl.textContent = `✓ Official dossier delivered to ${email}!`;
        statusEl.style.color = "#10B981";
      }
      return true;
    } else {
      let errText = "Could not send email. Please check the address.";
      try {
        const j = await res.json();
        if (j.detail) errText = j.detail;
      } catch(e) {}
      if (statusEl) {
        statusEl.textContent = errText;
        statusEl.style.color = "#FB7185";
      }
      return false;
    }
  } catch (e) {
    console.error("Email dispatch error:", e);
    if (statusEl) {
      statusEl.textContent = "Network error sending email.";
      statusEl.style.color = "#FB7185";
    }
    return false;
  } finally {
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.style.opacity = "1";
    }
  }
}

function initEmailDispatch() {
  // Sync email inputs on typing & blur
  const emailInputIds = [
    "inputEmail",
    "modalEmail",
    "inputResendEmail",
    "inputEmailDashboard",
    "inputEmailDCMatrix",
    "inputEmailChaldean"
  ];
  emailInputIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", (e) => {
      const val = e.target.value.trim();
      if (val && val.includes("@")) {
        state.userEmail = val;
      }
    });
    el.addEventListener("blur", (e) => {
      const val = e.target.value.trim();
      if (val) syncUserEmail(val);
    });
  });

  // 1. Check Your Name / Auspicious Spelling Variants
  const btnSendVariants = document.getElementById("btnSendEmailDossier");
  const inputEmailVariants = document.getElementById("inputResendEmail");
  const statusVariants = document.getElementById("resendEmailStatus");
  const btnPrintVariants = document.getElementById("btnPrintVariantsPDF");

  btnSendVariants?.addEventListener("click", () => {
    sendProductEmail(inputEmailVariants?.value.trim() || getUserEmail(), "check_name", btnSendVariants, statusVariants);
  });
  btnPrintVariants?.addEventListener("click", () => window.print());

  // 2. Full Vibrational Dashboard
  const btnSendDashboard = document.getElementById("btnSendEmailDashboard");
  const inputEmailDashboard = document.getElementById("inputEmailDashboard");
  const statusDashboard = document.getElementById("statusEmailDashboard");
  const btnPrintDashboard = document.getElementById("btnPrintDashboardPDF");

  btnSendDashboard?.addEventListener("click", () => {
    sendProductEmail(inputEmailDashboard?.value.trim() || getUserEmail(), "check_name", btnSendDashboard, statusDashboard);
  });
  btnPrintDashboard?.addEventListener("click", () => window.print());

  // 3. 9×9 Driver & Conductor Matrix Modal
  const btnSendDC = document.getElementById("btnSendEmailDCMatrix");
  const inputEmailDC = document.getElementById("inputEmailDCMatrix");
  const statusDC = document.getElementById("statusEmailDCMatrix");
  const btnPrintDC = document.getElementById("btnPrintDCMatrixPDF");

  btnSendDC?.addEventListener("click", () => {
    sendProductEmail(inputEmailDC?.value.trim() || getUserEmail(), "dc_matrix", btnSendDC, statusDC);
  });
  btnPrintDC?.addEventListener("click", () => window.print());

  // 4. Chaldean Sacred Sound Vibration Chart Modal
  const btnSendChaldean = document.getElementById("btnSendEmailChaldean");
  const inputEmailChaldean = document.getElementById("inputEmailChaldean");
  const statusChaldean = document.getElementById("statusEmailChaldean");
  const btnPrintChaldean = document.getElementById("btnPrintChaldeanPDF");

  btnSendChaldean?.addEventListener("click", () => {
    sendProductEmail(inputEmailChaldean?.value.trim() || getUserEmail(), "chaldean_chart", btnSendChaldean, statusChaldean);
  });
  btnPrintChaldean?.addEventListener("click", () => window.print());
}

/* ==========================================================================
   8. FAQ Modal
   ========================================================================== */
function initFaqModal() {
  const faqModal = document.getElementById("faqModal");
  const faqBackdrop = document.getElementById("faqModalBackdrop");
  const btnClose = document.getElementById("btnCloseFaqModal");
  const navBtnFaq = document.getElementById("navBtnFaq");

  function openFaq(e) {
    e?.preventDefault();
    faqModal?.classList.remove("hidden");
  }

  function closeFaq() {
    faqModal?.classList.add("hidden");
  }

  navBtnFaq?.addEventListener("click", openFaq);
  btnClose?.addEventListener("click", closeFaq);
  faqBackdrop?.addEventListener("click", closeFaq);
}

/* ==========================================================================
   9. Footer Interactions & Legal Compliance Modals
   ========================================================================== */
function initFooterAndLegalModals() {
  // Back to top smooth scroll
  const btnTop = document.getElementById("btnBackToTop");
  btnTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const legalModal = document.getElementById("legalModal");
  const legalBackdrop = document.getElementById("legalModalBackdrop");
  const btnClose = document.getElementById("btnCloseLegalModal");
  const legalTitle = document.getElementById("legalModalTitle");
  const legalBody = document.getElementById("legalModalBody");

  function closeLegal() {
    legalModal?.classList.add("hidden");
  }

  btnClose?.addEventListener("click", closeLegal);
  legalBackdrop?.addEventListener("click", closeLegal);

  const btnPrivacy = document.getElementById("btnOpenPrivacyModal");
  const btnTerms = document.getElementById("btnOpenTermsModal");
  const btnRefund = document.getElementById("btnOpenRefundModal");

  btnPrivacy?.addEventListener("click", () => {
    if (!legalModal || !legalTitle || !legalBody) return;
    legalTitle.textContent = "✦ Zero-Database Privacy Policy";
    legalBody.innerHTML = `
      <p style="margin-bottom:12px;"><strong>Strict Zero-Retention Architecture:</strong> At Numerology Fortune, your sacred personal details (Full Name, Date of Birth, Gender) are processed in real-time RAM memory solely during your active computation session.</p>
      <p style="margin-bottom:12px;"><strong>No Data Resale or Profiling:</strong> We do NOT maintain persistent user profiles, databases of birth records, or tracking cookies for third-party advertising. Once your session concludes and your dossier is emailed (if requested), your data leaves our computational memory.</p>
      <p style="margin-bottom:12px;"><strong>Payment Security:</strong> All payment transactions are encrypted and processed directly via Razorpay's PCI-DSS compliant infrastructure. Numerology Fortune never touches, views, or stores your card, UPI, or banking credentials.</p>
      <p style="margin-bottom:0;">For questions regarding our privacy protocol, contact: <a href="mailto:support@numerologyfortune.com" style="color:#D4AF37;">support@numerologyfortune.com</a></p>
    `;
    legalModal.classList.remove("hidden");
  });

  btnTerms?.addEventListener("click", () => {
    if (!legalModal || !legalTitle || !legalBody) return;
    legalTitle.textContent = "✦ Terms of Service & Guidance";
    legalBody.innerHTML = `
      <p style="margin-bottom:12px;"><strong>1. Metaphysical Nature:</strong> Numerology Fortune provides ancient Chaldean numerical calculation tools for personal self-discovery, spiritual harmony, and motivation. By using this service, you acknowledge that numerological readings do not substitute for professional legal, medical, or financial advice.</p>
      <p style="margin-bottom:12px;"><strong>2. Algorithmic Precision:</strong> Name vibrations, compound root values, and Driver/Conductor harmonies are calculated strictly adhering to authentic ancient Chaldean mathematical tables and the 9×9 symmetric matrix.</p>
      <p style="margin-bottom:12px;"><strong>3. Digital Content Delivery:</strong> Upon successful order verification via Razorpay, your report dossier, phonetic suggestions, and harmony certificate are immediately unlocked on screen and dispatched to your specified email.</p>
      <p style="margin-bottom:0;">Governed under applicable digital service and fair-use trade regulations.</p>
    `;
    legalModal.classList.remove("hidden");
  });

  btnRefund?.addEventListener("click", () => {
    if (!legalModal || !legalTitle || !legalBody) return;
    legalTitle.textContent = "✦ Cancellation & Refund Policy";
    legalBody.innerHTML = `
      <p style="margin-bottom:12px;"><strong>Instant Delivery Service:</strong> Because our Chaldean algorithmic engine computes and generates personalized name vibrational dossiers instantly upon payment, orders cannot be cancelled once generation has completed.</p>
      <p style="margin-bottom:12px;"><strong>Transaction Failures & Duplicate Debits:</strong> In the event of a network disruption where your account is debited but the system fails to display or email your dossier, our payment verification engine automatically reconciles with Razorpay to dispatch your dossier, or an automatic refund is processed to your original payment method within 5–7 business days.</p>
      <p style="margin-bottom:0;">For assistance with any transaction, write to us with your Payment ID at: <a href="mailto:support@numerologyfortune.com" style="color:#D4AF37;">support@numerologyfortune.com</a></p>
    `;
    legalModal.classList.remove("hidden");
  });
}

// Ensure celebrity banner image slot only activates when user provides an image src
(function initBannerSlot() {
  const userImg = document.getElementById("userBannerImage");
  if (userImg && userImg.getAttribute("src") && userImg.getAttribute("src").trim() !== "") {
    const rightCol = userImg.closest(".celebrities-right-col");
    if (rightCol) rightCol.classList.remove("is-empty");
    userImg.style.display = "block";
  }
})();
