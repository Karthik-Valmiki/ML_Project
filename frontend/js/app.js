let loadedScenarios = [];
let activeScenario = null;
let toastTimeout = null;

/**
 * Sonner-style non-intrusive toast notification
 * Respects sub-300ms transitions and non-blocking notification flow
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  // Clear existing toast if any for interruptibility
  container.innerHTML = '';
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'alert');
  toast.textContent = message;

  container.appendChild(toast);

  // Force reflow for smooth @starting-style transition
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode === container) {
        container.removeChild(toast);
      }
    }, 250);
  }, 3200);
}

/**
 * Tab Navigation with accessibility state management
 */
function navigateTab(tabId, btn) {
  const panes = document.querySelectorAll('.tab-pane');
  const buttons = document.querySelectorAll('nav button[role="tab"]');

  panes.forEach(pane => {
    pane.classList.remove('active');
  });

  buttons.forEach(button => {
    button.classList.remove('active');
    button.setAttribute('aria-selected', 'false');
  });

  const target = document.getElementById(tabId);
  if (target) {
    target.classList.add('active');
  }

  if (btn) {
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
  }
}

/**
 * Load holdout test scenarios from API
 */
function loadTestScenarios() {
  fetch('/api/scenarios')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      loadedScenarios = data;
      const container = document.getElementById('scenario-btn-group');
      if (!container) return;

      container.innerHTML = '';
      data.forEach((scenario, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-scenario' + (index === 0 ? ' selected' : '');
        btn.textContent = scenario.title;
        btn.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
        
        // Subtle entrance stagger delay for scenarios
        btn.style.animationDelay = `${index * 40}ms`;

        btn.onclick = () => selectScenario(scenario.id, btn);
        container.appendChild(btn);
      });

      if (data.length > 0) {
        selectScenario(data[0].id, container.children[0]);
      }
    })
    .catch(err => {
      console.error("Failed to load traffic scenarios:", err);
      showToast("Unable to load holdout scenarios from API.", "error");
    });
}

/**
 * Select a specific traffic scenario
 */
function selectScenario(id, btnElement) {
  document.querySelectorAll('.btn-scenario').forEach(b => {
    b.classList.remove('selected');
    b.setAttribute('aria-pressed', 'false');
  });

  if (btnElement) {
    btnElement.classList.add('selected');
    btnElement.setAttribute('aria-pressed', 'true');
  }

  fetch(`/api/scenarios/${id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      activeScenario = data;
      const descEl = document.getElementById('scenario-description');
      const truthPill = document.getElementById('scenario-truth-pill');

      if (descEl) {
        descEl.textContent = data.description;
      }
      if (truthPill) {
        truthPill.textContent = `Ground truth: ${data.ground_truth_class}`;
      }
    })
    .catch(err => {
      console.error("Failed to load scenario details:", err);
      showToast("Could not retrieve scenario parameters.", "error");
    });
}

/**
 * Execute real-time inference on the selected flow vector
 */
function executeInference() {
  if (!activeScenario) {
    showToast("Please select a traffic flow scenario first.");
    return;
  }

  const modelSelect = document.getElementById('model-selector');
  const modelType = modelSelect ? modelSelect.value : 'champion';

  const runBtn = document.getElementById('btn-run-inference');
  const runBtnText = document.getElementById('btn-run-text');

  // Set responsive loading state
  if (runBtn) {
    runBtn.disabled = true;
  }
  if (runBtnText) {
    runBtnText.textContent = "Inspecting flow...";
  }

  const assessCard = document.getElementById('assessment-result');
  const statusPill = document.getElementById('result-status-pill');
  const confText = document.getElementById('result-confidence');
  const modelText = document.getElementById('result-model');
  const latencyText = document.getElementById('result-latency');
  const truthText = document.getElementById('result-ground-truth');
  const normalBar = document.getElementById('bar-normal');
  const botBar = document.getElementById('bar-bot');
  const benignLabel = document.getElementById('label-benign-prob');
  const botLabel = document.getElementById('label-bot-prob');
  const meterProgress = document.getElementById('meter-progressbar');

  fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      features: activeScenario.features,
      model_type: modelType
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Inference returned HTTP ${response.status}`);
      }
      return response.json();
    })
    .then(res => {
      const isThreat = res.label === 1;

      if (statusPill) {
        statusPill.className = 'status-badge ' + (isThreat ? 'status-block' : 'status-allow');
        statusPill.textContent = `${res.action}: ${res.prediction.toUpperCase()}`;
      }

      if (confText) confText.textContent = res.confidence_percentage;
      if (modelText) modelText.textContent = res.model_used;
      if (latencyText) latencyText.textContent = `${res.inference_time_ms} ms`;
      if (truthText) truthText.textContent = `${activeScenario.ground_truth_class} (Label: ${activeScenario.ground_truth_label})`;

      const pNormal = res.probabilities.Normal * 100;
      const pBot = res.probabilities["Malicious Bot"] * 100;

      if (normalBar) normalBar.style.width = `${pNormal}%`;
      if (botBar) botBar.style.width = `${pBot}%`;
      if (benignLabel) benignLabel.textContent = `Benign probability: ${pNormal.toFixed(1)}%`;
      if (botLabel) botLabel.textContent = `Bot probability: ${pBot.toFixed(1)}%`;
      
      if (meterProgress) {
        meterProgress.setAttribute('aria-valuenow', pBot.toFixed(1));
      }

      // Smooth entrance transition using .visible class
      if (assessCard) {
        assessCard.classList.add('visible');
      }
    })
    .catch(err => {
      console.error("Inference execution failed:", err);
      showToast("Inference failed. Check API service status.");
    })
    .finally(() => {
      if (runBtn) {
        runBtn.disabled = false;
      }
      if (runBtnText) {
        runBtnText.textContent = "Inspect flow vector";
      }
    });
}

// Initialise scenarios when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  loadTestScenarios();
});
