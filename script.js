/**
 * QUANTUM CALC - MODERN SCIENTIFIC CALCULATOR ENGINE
 */

(function () {
  'use strict';

  // State Store
  const state = {
    expression: '',
    result: '0',
    memory: 0,
    isCalculated: false,
    angleMode: localStorage.getItem('qc_angle_mode') || 'DEG',
    mode: localStorage.getItem('qc_mode') || 'standard',
    theme: (localStorage.getItem('qc_theme') && localStorage.getItem('qc_theme') !== 'cyberpunk') ? localStorage.getItem('qc_theme') : 'nature',
    sound: localStorage.getItem('qc_sound') !== 'false',
    history: JSON.parse(localStorage.getItem('qc_history') || '[]')
  };

  // DOM Elements
  const el = {
    html: document.documentElement,
    app: document.getElementById('calculator-app'),
    expressionDisplay: document.getElementById('expression-display'),
    resultDisplay: document.getElementById('result-display'),
    angleBadge: document.getElementById('angle-badge'),
    memoryBadge: document.getElementById('memory-badge'),
    modeBadge: document.getElementById('mode-badge'),
    btnAngleToggle: document.getElementById('btn-angle-toggle'),
    sciKeypad: document.getElementById('sci-keypad'),
    stdKeypad: document.getElementById('std-keypad'),
    btnModeStd: document.getElementById('btn-mode-standard'),
    btnModeSci: document.getElementById('btn-mode-scientific'),
    soundToggle: document.getElementById('sound-toggle'),
    soundIconOn: document.querySelector('.sound-icon-on'),
    soundIconOff: document.querySelector('.sound-icon-off'),
    themeMenuBtn: document.getElementById('theme-menu-btn'),
    themeDropdown: document.getElementById('theme-dropdown'),
    historyToggle: document.getElementById('history-toggle'),
    historyPanel: document.getElementById('history-panel'),
    closeHistoryBtn: document.getElementById('close-history-btn'),
    clearHistoryBtn: document.getElementById('clear-history-btn'),
    historyList: document.getElementById('history-list'),
    emptyHistoryMsg: document.getElementById('empty-history-msg')
  };

  // --------------------------------------------------------------------------
  // AUDIO SYNTHESIZER (Web Audio API)
  // --------------------------------------------------------------------------
  let audioCtx = null;

  function playKeyClickSound(type = 'click') {
    if (!state.sound) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (type === 'operator') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      } else if (type === 'equals') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.06); // E5
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
      }

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.07);
    } catch (e) {
      // Audio fallback silent
    }
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION & THEME SETUP
  // --------------------------------------------------------------------------
  function init() {
    setTheme(state.theme);
    setMode(state.mode);
    setAngleMode(state.angleMode);
    updateSoundUI();
    updateMemoryUI();
    renderHistory();
    attachEventListeners();
    updateDisplay();
  }

  function setTheme(theme) {
    state.theme = theme;
    el.html.setAttribute('data-theme', theme);
    localStorage.setItem('qc_theme', theme);

    document.querySelectorAll('.theme-opt').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.theme === theme);
    });
  }

  function setMode(mode) {
    state.mode = mode;
    localStorage.setItem('qc_mode', mode);

    if (mode === 'scientific') {
      el.sciKeypad.classList.remove('hidden');
      el.btnModeSci.classList.add('active');
      el.btnModeStd.classList.remove('active');
      el.modeBadge.textContent = 'SCIENTIFIC';
    } else {
      el.sciKeypad.classList.add('hidden');
      el.btnModeStd.classList.add('active');
      el.btnModeSci.classList.remove('active');
      el.modeBadge.textContent = 'STANDARD';
    }
  }

  function setAngleMode(mode) {
    state.angleMode = mode;
    localStorage.setItem('qc_angle_mode', mode);
    el.angleBadge.textContent = mode;
    if (el.btnAngleToggle) {
      el.btnAngleToggle.textContent = mode;
    }
  }

  function toggleAngleMode() {
    setAngleMode(state.angleMode === 'DEG' ? 'RAD' : 'DEG');
    playKeyClickSound();
  }

  function updateSoundUI() {
    if (state.sound) {
      el.soundIconOn.classList.remove('hidden');
      el.soundIconOff.classList.add('hidden');
    } else {
      el.soundIconOn.classList.add('hidden');
      el.soundIconOff.classList.remove('hidden');
    }
  }

  function toggleSound() {
    state.sound = !state.sound;
    localStorage.setItem('qc_sound', state.sound);
    updateSoundUI();
  }

  function updateMemoryUI() {
    if (state.memory !== 0) {
      el.memoryBadge.classList.remove('hidden');
    } else {
      el.memoryBadge.classList.add('hidden');
    }
  }

  // --------------------------------------------------------------------------
  // DISPLAY RENDERER & AUTO-RESIZING
  // --------------------------------------------------------------------------
  function updateDisplay() {
    el.expressionDisplay.textContent = state.expression;
    el.resultDisplay.textContent = state.result;

    // Dynamic Result Font Scaling for long inputs
    const len = state.result.length;
    if (len > 14) {
      el.resultDisplay.style.fontSize = '1.4rem';
    } else if (len > 10) {
      el.resultDisplay.style.fontSize = '1.8rem';
    } else if (len > 7) {
      el.resultDisplay.style.fontSize = '2.2rem';
    } else {
      el.resultDisplay.style.fontSize = '2.5rem';
    }
  }

  // --------------------------------------------------------------------------
  // INPUT & EVALUATION LOGIC
  // --------------------------------------------------------------------------
  function handleNumber(val) {
    if (state.isCalculated) {
      state.expression = '';
      state.result = val;
      state.isCalculated = false;
    } else {
      if (state.result === '0' || state.result === 'Error') {
        state.result = val;
      } else {
        state.result += val;
      }
    }
    updateDisplay();
    playKeyClickSound('click');
  }

  function handleDecimal() {
    if (state.isCalculated) {
      state.expression = '';
      state.result = '0.';
      state.isCalculated = false;
    } else {
      // Check if current active number token already contains decimal point
      const lastToken = state.result.split(/[\+\-\×\÷\^\(\)]/).pop();
      if (!lastToken.includes('.')) {
        state.result += '.';
      }
    }
    updateDisplay();
    playKeyClickSound('click');
  }

  function handleOperator(op) {
    state.isCalculated = false;
    if (state.result === 'Error') state.result = '0';

    if (op === '^2') {
      state.expression = `sqr(${state.result})`;
      calculateResult(true, `(${state.result})^2`);
      return;
    }

    if (state.result !== '') {
      state.expression += state.result + ' ' + op + ' ';
      state.result = '0';
    } else if (state.expression !== '') {
      // Replace last operator if expression ends with one
      state.expression = state.expression.trim().replace(/[\+\-\×\÷\^]$/, op) + ' ';
    }
    updateDisplay();
    playKeyClickSound('operator');
  }

  function handleFunction(fnName) {
    if (state.result === 'Error') state.result = '0';
    
    // Wrap current input in function call
    if (state.isCalculated || state.result !== '0') {
      state.expression = `${fnName}(${state.result})`;
      calculateResult(true, state.expression);
    } else {
      state.result = `${fnName}(`;
      state.isCalculated = false;
    }
    updateDisplay();
    playKeyClickSound('operator');
  }

  function handleConstant(cSymbol) {
    if (state.isCalculated || state.result === '0' || state.result === 'Error') {
      state.result = cSymbol;
    } else {
      state.result += cSymbol;
    }
    state.isCalculated = false;
    updateDisplay();
    playKeyClickSound('click');
  }

  function handleParentheses() {
    if (state.isCalculated) {
      state.expression = '';
      state.result = '(';
      state.isCalculated = false;
      updateDisplay();
      return;
    }

    const openCount = (state.expression + state.result).split('(').length - 1;
    const closeCount = (state.expression + state.result).split(')').length - 1;

    if (openCount > closeCount && state.result !== '0' && state.result !== '') {
      state.result += ')';
    } else {
      if (state.result === '0' || state.result === 'Error') {
        state.result = '(';
      } else {
        state.result += '(';
      }
    }
    updateDisplay();
    playKeyClickSound('click');
  }

  function handleNegate() {
    if (state.result === '0' || state.result === 'Error') return;

    if (state.result.startsWith('-')) {
      state.result = state.result.substring(1);
    } else {
      state.result = '-' + state.result;
    }
    updateDisplay();
    playKeyClickSound('click');
  }

  function handleBackspace() {
    if (state.isCalculated) {
      state.expression = '';
      state.isCalculated = false;
      updateDisplay();
      return;
    }

    if (state.result.length > 1) {
      state.result = state.result.slice(0, -1);
    } else {
      state.result = '0';
    }
    updateDisplay();
    playKeyClickSound('click');
  }

  function handleClearAll() {
    state.expression = '';
    state.result = '0';
    state.isCalculated = false;
    updateDisplay();
    playKeyClickSound('click');
  }

  // --------------------------------------------------------------------------
  // MATHEMATICAL EVALUATION ENGINE
  // --------------------------------------------------------------------------
  function calculateResult(isImmediate = false, overrideExpr = null) {
    let fullExpr = overrideExpr || (state.expression + state.result).trim();

    if (!fullExpr) return;

    try {
      const sanitized = sanitizeExpression(fullExpr);
      const evalValue = evaluateSanitized(sanitized);

      if (isNaN(evalValue) || !isFinite(evalValue)) {
        throw new Error('Invalid math result');
      }

      const formattedResult = formatResult(evalValue);

      // Save to history
      saveHistory(fullExpr, formattedResult);

      if (!isImmediate) {
        state.expression = fullExpr + ' =';
      }
      state.result = formattedResult;
      state.isCalculated = true;
      playKeyClickSound('equals');
    } catch (err) {
      state.result = 'Error';
      state.isCalculated = true;
      playKeyClickSound('operator');
    }
    updateDisplay();
  }

  function sanitizeExpression(expr) {
    let s = expr;

    // Replace visual symbols with javascript math operations
    s = s.replace(/×/g, '*').replace(/÷/g, '/');
    s = s.replace(/π/g, `(${Math.PI})`).replace(/e/g, `(${Math.E})`);

    // Implicit Multiplication: e.g. 5( -> 5*(, )5 -> )*5, 5sin -> 5*sin, 5π -> 5*π
    s = s.replace(/(\d+)\s*\(/g, '$1*(');
    s = s.replace(/\)\s*(\d+)/g, ')*$1');
    s = s.replace(/(\d+)\s*(sin|cos|tan|asin|acos|atan|log|ln|sqrt|cbrt)/g, '$1*$2');

    // Handle Factorial n!
    s = s.replace(/(\d+(\.\d+)?)!/g, (match, n) => factorial(parseFloat(n)));

    // Handle percentages: e.g. 50% -> (50/100)
    s = s.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

    // Replace powers x^y -> Math.pow(x,y) using regex
    s = transformPowers(s);

    return s;
  }

  function transformPowers(expr) {
    while (expr.includes('^')) {
      expr = expr.replace(/([a-zA-Z0-9_\.\(\)]+)\^([a-zA-Z0-9_\.\(\)]+)/g, 'Math.pow($1,$2)');
    }
    return expr;
  }

  function evaluateSanitized(expr) {
    // Custom context scope for scientific functions with DEG/RAD awareness
    const isDeg = state.angleMode === 'DEG';
    const toRad = deg => deg * (Math.PI / 180);
    const toDeg = rad => rad * (180 / Math.PI);

    const scope = {
      sin: x => Math.sin(isDeg ? toRad(x) : x),
      cos: x => Math.cos(isDeg ? toRad(x) : x),
      tan: x => Math.tan(isDeg ? toRad(x) : x),
      asin: x => (isDeg ? toDeg(Math.asin(x)) : Math.asin(x)),
      acos: x => (isDeg ? toDeg(Math.acos(x)) : Math.acos(x)),
      atan: x => (isDeg ? toDeg(Math.atan(x)) : Math.atan(x)),
      log: x => Math.log10(x),
      ln: x => Math.log(x),
      sqrt: x => Math.sqrt(x),
      cbrt: x => Math.cbrt(x),
      sqr: x => Math.pow(x, 2),
      Math: Math
    };

    // Safe execution sandbox using Function constructor
    const keys = Object.keys(scope);
    const vals = Object.values(scope);
    const fn = new Function(...keys, `"use strict"; return (${expr});`);
    return fn(...vals);
  }

  function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    if (!Number.isInteger(n)) return gamma(n + 1); // Gamma function approximation for non-integers
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  function gamma(n) {
    // Lanczos approximation
    const g = 7;
    const p = [
      0.99999999999980993, 676.5203681218851, -1259.139216722289,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
    ];
    if (n < 0.5) return Math.PI / (Math.sin(Math.PI * n) * gamma(1 - n));
    n -= 1;
    let x = p[0];
    for (let i = 1; i < g + 2; i++) x += p[i] / (n + i);
    const t = n + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x;
  }

  function formatResult(num) {
    // Avoid float precision noise like 0.1 + 0.2 = 0.30000000000000004
    let clean = Number(Math.round(parseFloat(num + 'e12')) + 'e-12');
    if (Math.abs(clean) > 1e12 || (Math.abs(clean) < 1e-7 && clean !== 0)) {
      return clean.toExponential(6);
    }
    return clean.toString();
  }

  // --------------------------------------------------------------------------
  // MEMORY FUNCTIONS
  // --------------------------------------------------------------------------
  function handleMemory(action) {
    const currentVal = parseFloat(state.result) || 0;

    switch (action) {
      case 'mc':
        state.memory = 0;
        break;
      case 'mr':
        state.result = state.memory.toString();
        state.isCalculated = true;
        break;
      case 'm-plus':
        state.memory += currentVal;
        break;
      case 'm-minus':
        state.memory -= currentVal;
        break;
      case 'ms':
        state.memory = currentVal;
        break;
    }

    updateMemoryUI();
    updateDisplay();
    playKeyClickSound('operator');
  }

  // --------------------------------------------------------------------------
  // HISTORY DRAWER & LOCALSTORAGE PERSISTENCE
  // --------------------------------------------------------------------------
  function saveHistory(expr, res) {
    const entry = {
      id: Date.now(),
      expr: expr,
      res: res
    };
    state.history.unshift(entry);
    if (state.history.length > 30) state.history.pop();
    localStorage.setItem('qc_history', JSON.stringify(state.history));
    renderHistory();
  }

  function renderHistory() {
    if (state.history.length === 0) {
      el.emptyHistoryMsg.classList.remove('hidden');
      el.historyList.querySelectorAll('.history-item').forEach(i => i.remove());
      return;
    }

    el.emptyHistoryMsg.classList.add('hidden');
    el.historyList.querySelectorAll('.history-item').forEach(i => i.remove());

    state.history.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'history-item';
      itemEl.innerHTML = `
        <div class="hist-expr">${escapeHtml(item.expr)}</div>
        <div class="hist-res">${escapeHtml(item.res)}</div>
      `;
      itemEl.addEventListener('click', () => {
        state.result = item.res;
        state.expression = item.expr + ' =';
        state.isCalculated = true;
        updateDisplay();
        closeHistory();
        playKeyClickSound('click');
      });
      el.historyList.appendChild(itemEl);
    });
  }

  function clearHistory() {
    state.history = [];
    localStorage.removeItem('qc_history');
    renderHistory();
    playKeyClickSound();
  }

  function openHistory() {
    el.historyPanel.classList.remove('hidden');
  }

  function closeHistory() {
    el.historyPanel.classList.add('hidden');
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // --------------------------------------------------------------------------
  // EVENT LISTENERS & KEYBOARD MAPPING
  // --------------------------------------------------------------------------
  function attachEventListeners() {
    // Mode Switcher Buttons
    el.btnModeStd.addEventListener('click', () => setMode('standard'));
    el.btnModeSci.addEventListener('click', () => setMode('scientific'));

    // Angle Mode Toggle
    el.angleBadge.addEventListener('click', toggleAngleMode);
    if (el.btnAngleToggle) el.btnAngleToggle.addEventListener('click', toggleAngleMode);

    // Sound Toggle
    el.soundToggle.addEventListener('click', toggleSound);

    // Theme Menu Dropdown
    el.themeMenuBtn.addEventListener('click', e => {
      e.stopPropagation();
      el.themeDropdown.classList.toggle('hidden');
    });

    document.querySelectorAll('.theme-opt').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const targetTheme = btn.getAttribute('data-theme');
        if (targetTheme) {
          setTheme(targetTheme);
          playKeyClickSound('click');
        }
        el.themeDropdown.classList.add('hidden');
      });
    });

    document.addEventListener('click', () => el.themeDropdown.classList.add('hidden'));

    // History Panel
    el.historyToggle.addEventListener('click', openHistory);
    el.closeHistoryBtn.addEventListener('click', closeHistory);
    el.clearHistoryBtn.addEventListener('click', clearHistory);

    // Memory Bar
    document.querySelectorAll('.mem-btn[data-action]').forEach(btn => {
      btn.addEventListener('click', () => handleMemory(btn.dataset.action));
    });

    // Keypad Click Event Delegation
    el.app.addEventListener('click', e => {
      const keyBtn = e.target.closest('.key');
      if (!keyBtn) return;

      const action = keyBtn.dataset.action;
      const value = keyBtn.dataset.value;

      switch (action) {
        case 'num':
          handleNumber(value);
          break;
        case 'decimal':
          handleDecimal();
          break;
        case 'operator':
          handleOperator(value);
          break;
        case 'func':
          handleFunction(value);
          break;
        case 'constant':
          handleConstant(value);
          break;
        case 'parentheses':
          handleParentheses();
          break;
        case 'negate':
          handleNegate();
          break;
        case 'backspace':
          handleBackspace();
          break;
        case 'clear-all':
          handleClearAll();
          break;
        case 'calculate':
          calculateResult();
          break;
        case 'action':
          if (value === 'factorial') {
            state.result += '!';
            updateDisplay();
          }
          break;
      }
    });

    // Keyboard Event Listener
    window.addEventListener('keydown', e => {
      // Ignore if focus is in an input or contenteditable element
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      const key = e.key;

      if (key >= '0' && key <= '9') {
        highlightKey(`[data-value="${key}"]`);
        handleNumber(key);
      } else if (key === '.') {
        highlightKey('[data-action="decimal"]');
        handleDecimal();
      } else if (key === '+') {
        highlightKey('[data-value="+"]');
        handleOperator('+');
      } else if (key === '-') {
        highlightKey('[data-value="-"]');
        handleOperator('-');
      } else if (key === '*') {
        highlightKey('[data-value="×"]');
        handleOperator('×');
      } else if (key === '/') {
        e.preventDefault();
        highlightKey('[data-value="÷"]');
        handleOperator('÷');
      } else if (key === '%') {
        highlightKey('[data-value="%"]');
        handleOperator('%');
      } else if (key === '^') {
        highlightKey('[data-value="^"]');
        handleOperator('^');
      } else if (key === '(' || key === ')') {
        highlightKey('[data-action="parentheses"]');
        handleParentheses();
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        highlightKey('[data-action="calculate"]');
        calculateResult();
      } else if (key === 'Backspace') {
        highlightKey('[data-action="backspace"]');
        handleBackspace();
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        highlightKey('[data-action="clear-all"]');
        handleClearAll();
      } else if (key.toLowerCase() === 's') {
        highlightKey('[data-value="sin"]');
        handleFunction('sin');
      } else if (key.toLowerCase() === 'o') {
        highlightKey('[data-value="cos"]');
        handleFunction('cos');
      } else if (key.toLowerCase() === 't') {
        highlightKey('[data-value="tan"]');
        handleFunction('tan');
      }
    });
  }

  function highlightKey(selector) {
    const keyBtn = document.querySelector(selector);
    if (keyBtn) {
      keyBtn.classList.add('active');
      setTimeout(() => keyBtn.classList.remove('active'), 150);
    }
  }

  // Launch app on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
