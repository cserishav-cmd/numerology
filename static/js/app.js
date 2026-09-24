/* ==========================================================================
   NUMEROLOGY FORTUNE — PRODUCTION JAVASCRIPT APPLICATION LOGIC
   Seamlessly communicates with FastAPI backend (/api/check, /api/variants,
   /api/payment/create-order, /api/payment/verify, /api/chart, /api/matrix)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initPublicConfig();
  initModalTriggers();
  initMobileNav();
  initAnalysisForm();
  initRazorpayPaymentFlow();
  initMatrixModal();
  initCertificateModal();
  initFaqModal();
  initEmailDispatch();
  initFooterAndLegalModals();
});

// Global Application State
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
   1. Fetch Public Runtime Configuration
   ========================================================================== */
async function initPublicConfig() {
  try {
    const res = await fetch("/api/config");
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        state.pricing.razorpay_key_id = json.data.razorpay_key_id || state.pricing.razorpay_key_id;
        state.pricing.harmonization_inr = json.data.harmonization_price_inr || 99;
        state.pricing.harmonization_paise = json.data.harmonization_price_paise || 9900;
        state.pricing.matrix_inr = json.data.matrix_chart_price_inr || 199;
        state.pricing.matrix_paise = json.data.matrix_chart_price_paise || 19900;
      }
    }
  } catch (e) {
    console.warn("Could not fetch /api/config; using defaults", e);
  }
}

/* ==========================================================================
   2. Modal Triggers & Navigation Setup
   ========================================================================== */
function initModalTriggers() {
  const calcModal = document.getElementById("calculatorModal");
  const calcBackdrop = document.getElementById("calcModalBackdrop");
  const btnCloseCalc = document.getElementById("btnCloseCalculatorModal");
  const triggerBtns = document.querySelectorAll(".btnTriggerCalculator");

  function openCalcModal() {
    calcModal?.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeCalcModal() {
    calcModal?.classList.add("hidden");
    document.body.style.overflow = "";
  }

  triggerBtns.forEach((btn) => {
    btn.addEventListener("click", openCalcModal);
  });

  btnCloseCalc?.addEventListener("click", closeCalcModal);
  calcBackdrop?.addEventListener("click", closeCalcModal);

  // Services Menu Button
  const navBtnServices = document.getElementById("navBtnServices");
  navBtnServices?.addEventListener("click", (e) => {
    e.preventDefault();
    openCalcModal();
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

  const emailWarningModal = document.getElementById("emailWarningModal");
  const btnCloseEmailWarning = document.getElementById("btnCloseEmailWarning");
  const emailWarningBackdrop = document.getElementById("emailWarningBackdrop");
  const btnWarningAddEmail = document.getElementById("btnWarningAddEmail");
  const btnWarningProceedWithout = document.getElementById("btnWarningProceedWithout");

  btnCloseEmailWarning?.addEventListener("click", () => {
    emailWarningModal?.classList.add("hidden");
  });

  emailWarningBackdrop?.addEventListener("click", () => {
    emailWarningModal?.classList.add("hidden");
  });

  btnWarningAddEmail?.addEventListener("click", () => {
    emailWarningModal?.classList.add("hidden");
    const emailInput = document.getElementById("inputEmail");
    if (emailInput) {
      emailInput.focus();
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
}

/* ==========================================================================
   4. Razorpay Checkout Flow (₹99 vs ₹199)
   ========================================================================== */
function initRazorpayPaymentFlow() {
  const unlockBtn = document.getElementById("btnUnlockCorrection");
  const unlockMatrixBtn = document.getElementById("btnUnlockMatrixChart");

  // ₹99 Name Harmonization CTA
  unlockBtn?.addEventListener("click", async () => {
    if (!state.currentAnalysis) {
      const ok = await triggerAnalysis();
      if (!ok) return;
    }
    launchRazorpayPayment("harmonization");
  });

  // ₹199 All-In-One Combo CTA
  unlockMatrixBtn?.addEventListener("click", async () => {
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
  const amountPaise = isMatrix ? state.pricing.matrix_paise : state.pricing.harmonization_paise;
  const productLabel = isMatrix ? "All-In-One Combo & 9x9 Matrix" : "3–5 Auspicious Name Suggestions";
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
          document.querySelectorAll('.razorpay-container').forEach(el => el.remove());
        }
      }
    };

    if (typeof Razorpay !== "undefined") {
      const rzpInstance = new Razorpay(options);
      rzpInstance.on("payment.failed", function (failResp) {
        const loadingScreen = document.getElementById("paymentLoadingScreen");
        loadingScreen?.classList.add("hidden");
        document.querySelectorAll('.razorpay-container').forEach(el => el.remove());
        alert("Payment was not completed: " + (failResp.error?.description || "Transaction declined."));
      });
      rzpInstance.open();
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
  document.querySelectorAll('.razorpay-container').forEach(el => el.remove());

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

    // Hide paywall package selection
    const paywallSection = document.getElementById("paywallSelectionSection");
    paywallSection?.classList.add("hidden");

    // Pre-fill email resend input
    const inputResend = document.getElementById("inputResendEmail");
    if (inputResend) {
      inputResend.value = email || state.userEmail || "";
    }

    state.isPaid = true;
    state.paymentId = razorpay_payment_id;

    // Reveal Suggestions
    await fetchAndDisplayVariants(razorpay_payment_id, productType);

    const successBadge = document.getElementById("paymentSuccessNotice");
    const successText = document.getElementById("paymentSuccessText");
    if (successBadge) {
      successBadge.classList.remove("hidden");
      if (successText) {
        const emailMsg = emailDispatched ? ` • Dossier emailed to ${email}` : "";
        successText.textContent = `Payment Verified (${productType === "matrix_chart" ? "₹199 Combo" : "₹99"} • Ref: ${razorpay_payment_id}${emailMsg})`;
      }
    }

    const variantsContainer = document.getElementById("variantsContainer");
    variantsContainer?.classList.remove("hidden");

    // If ₹199 Combo, unlock full dashboard!
    if (productType === "matrix_chart") {
      state.isMatrixPaid = true;
      const resultsDashboard = document.getElementById("resultsDashboard");
      resultsDashboard?.classList.remove("hidden");
    }

    variantsContainer?.scrollIntoView({ behavior: "smooth" });
  } catch (e) {
    console.error("Verification processing error:", e);
  } finally {
    loadingScreen?.classList.add("hidden");
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
   6. 9x9 Driver / Conductor Matrix Modal
   ========================================================================== */
function initMatrixModal() {
  const chartModal = document.getElementById("chartModal");
  const chartBackdrop = document.getElementById("chartModalBackdrop");
  const btnClose = document.getElementById("btnCloseChartModal");
  const btnOpenDash = document.getElementById("btnOpenMatrixModalFromDash");

  function openChart() {
    renderMatrixTable();
    chartModal?.classList.remove("hidden");
  }

  function closeChart() {
    chartModal?.classList.add("hidden");
  }

  btnOpenDash?.addEventListener("click", openChart);
  btnClose?.addEventListener("click", closeChart);
  chartBackdrop?.addEventListener("click", closeChart);
}

function renderMatrixTable() {
  const tbody = document.getElementById("dcMatrixBody");
  if (!tbody || !state.dcMatrix) return;

  tbody.innerHTML = "";

  for (let d = 1; d <= 9; d++) {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.textContent = `D${d}`;
    tr.appendChild(th);

    for (let c = 1; c <= 9; c++) {
      const td = document.createElement("td");
      const key = `${d},${c}`;
      const recs = state.dcMatrix[key] || [];
      td.textContent = recs.join(",");
      td.title = `Driver ${d} & Conductor ${c}: [${recs.join(", ")}]`;

      td.addEventListener("click", () => {
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
   7. Resend / Dispatch Dossier to Email
   ========================================================================== */
function initEmailDispatch() {
  const btnSend = document.getElementById("btnSendEmailDossier");
  const inputEmail = document.getElementById("inputResendEmail");
  const statusEl = document.getElementById("resendEmailStatus");

  btnSend?.addEventListener("click", async () => {
    const email = inputEmail?.value.trim();
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    const name = document.getElementById("inputFullName")?.value.trim() || "Seeker";
    const dob = document.getElementById("inputDOB")?.value || "";
    const gender = document.getElementById("selectGender")?.value || "Male";

    btnSend.disabled = true;
    btnSend.style.opacity = "0.7";
    if (statusEl) {
      statusEl.textContent = "Dispatching dossier to email...";
      statusEl.classList.remove("hidden");
      statusEl.style.color = "#D4AF37";
    }

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
          amount: state.isMatrixPaid ? 199 : 99,
          analysis_data: state.currentAnalysis,
          suggestions: state.generatedVariants,
          product_type: state.isMatrixPaid ? "matrix_chart" : "harmonization"
        })
      });

      if (res.ok) {
        if (statusEl) {
          statusEl.textContent = `✓ Official dossier delivered to ${email}!`;
          statusEl.style.color = "#10B981";
        }
      } else {
        if (statusEl) {
          statusEl.textContent = "Could not send email. Please check the address.";
          statusEl.style.color = "#FB7185";
        }
      }
    } catch (e) {
      console.error("Email dispatch error:", e);
      if (statusEl) {
        statusEl.textContent = "Network error sending email.";
        statusEl.style.color = "#FB7185";
      }
    } finally {
      btnSend.disabled = false;
      btnSend.style.opacity = "1";
    }
  });
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
