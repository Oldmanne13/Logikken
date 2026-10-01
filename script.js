const gateInfo = {
  AND: {
    inputs: 2,
    rule: 'Begge skal være 1',
    explanation: 'AND giver kun 1, når begge inputs er 1.',
    calc: (a, b) => Number(Boolean(a) && Boolean(b)),
    hint: 'Spørg dig selv: Er begge inputs 1?',
    question: 'Hvis det ene input er 0, kan en AND-gate så give 1?'
  },
  OR: {
    inputs: 2,
    rule: 'Mindst én skal være 1',
    explanation: 'OR giver 1, når mindst ét input er 1.',
    calc: (a, b) => Number(Boolean(a) || Boolean(b)),
    hint: 'OR behøver ikke to 1-taller. Ét er nok.',
    question: 'Hvad tror du OR giver ved inputs 1 og 0?'
  },
  NOT: {
    inputs: 1,
    rule: 'Vender signalet',
    explanation: 'NOT vender inputtet om: 0 bliver 1, og 1 bliver 0.',
    calc: a => Number(!Boolean(a)),
    hint: 'Tænk på NOT som “det modsatte”.',
    question: 'Hvis input er 1, hvad er det modsatte signal?'
  },
  XOR: {
    inputs: 2,
    rule: 'Inputs skal være forskellige',
    explanation: 'XOR giver 1, når præcis ét input er 1. Hvis begge er 1, bliver output 0.',
    calc: (a, b) => Number(Boolean(a) !== Boolean(b)),
    hint: 'XOR giver 1 ved forskellige inputs – ikke ved to ens inputs.',
    question: 'Hvis A = 1 og B = 1, er inputs så forskellige eller ens?'
  }
};

const state = {
  section: 'learn',
  learn: { gate: 'AND', A: 0, B: 0 },
  practice: { gate: 'AND', target: 1, A: 0, B: 0, checked: false, hintLevel: 0 },
  challenge: { A: 0, B: 0, C: 0, D: 0, step: 0, revealed: [false, false, false, false], hintLevel: 0 },
  minecraft: { A: 0, B: 0 }
};

function escapeText(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function gateSvg(gate, a, b, options = {}) {
  const output = gateInfo[gate].calc(a, b);
  const showB = gateInfo[gate].inputs === 2;
  const width = options.compact ? 370 : 470;
  const height = showB ? 220 : 170;
  const wireOn = v => v ? 'wire on' : 'wire';
  let symbol = '';

  if (gate === 'AND') {
    symbol = `
      <path class="symbol" d="M170 48 H230 C305 48 305 172 230 172 H170 Z" />
      <text class="symbol-label" x="224" y="112">AND</text>`;
  } else if (gate === 'OR' || gate === 'XOR') {
    symbol = `
      ${gate === 'XOR' ? '<path class="symbol" fill="none" d="M150 48 Q190 110 150 172" />' : ''}
      <path class="symbol" d="M170 48 Q214 110 170 172 Q260 172 315 110 Q260 48 170 48 Z" />
      <text class="symbol-label" x="232" y="112">${gate}</text>`;
  } else {
    symbol = `
      <path class="symbol" d="M175 45 L175 125 L270 85 Z" />
      <circle class="symbol" cx="283" cy="85" r="12" />
      <text class="symbol-label" x="220" y="145">NOT</text>`;
  }

  if (!showB) {
    return `
      <svg class="gate-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="NOT-gate med input ${a} og output ${output}">
        <text class="terminal-label" x="22" y="92">A=${a}</text>
        <path class="${wireOn(a)}" d="M78 85 H175" />
        ${symbol}
        <path class="${wireOn(output)}" d="M295 85 H430" />
        <text class="terminal-label" x="392" y="72">${output}</text>
      </svg>`;
  }

  return `
    <svg class="gate-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${gate}-gate med inputs ${a} og ${b} og output ${output}">
      <text class="terminal-label" x="15" y="77">A=${a}</text>
      <text class="terminal-label" x="15" y="157">B=${b}</text>
      <path class="${wireOn(a)}" d="M72 70 H175" />
      <path class="${wireOn(b)}" d="M72 150 H175" />
      ${symbol}
      <path class="${wireOn(output)}" d="M315 110 H430" />
      <text class="terminal-label" x="395" y="98">${output}</text>
    </svg>`;
}

function setSection(name) {
  state.section = name;
  document.querySelectorAll('.course-section').forEach(section => {
    const active = section.id === name;
    section.hidden = !active;
    section.classList.toggle('active', active);
  });
  document.querySelectorAll('.nav-button').forEach(btn => btn.classList.toggle('active', btn.dataset.section === name));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderLearn() {
  const { gate, A, B } = state.learn;
  const info = gateInfo[gate];
  const output = info.calc(A, B);

  document.getElementById('learnGateTitle').textContent = `${gate}-gate`;
  document.getElementById('learnGateRule').textContent = info.rule;
  document.getElementById('learnExplanation').textContent = info.explanation;
  document.getElementById('learnGateDiagram').innerHTML = gateSvg(gate, A, B);
  document.getElementById('learnOutput').textContent = output;
  document.getElementById('learnOutputBox').classList.toggle('on', output === 1);

  const buttons = document.querySelectorAll('[data-learn-input]');
  buttons.forEach(btn => {
    const key = btn.dataset.learnInput;
    const value = state.learn[key];
    btn.hidden = key === 'B' && info.inputs === 1;
    btn.classList.toggle('on', Boolean(value));
    btn.setAttribute('aria-pressed', String(Boolean(value)));
    btn.querySelector('strong').textContent = value;
  });

  document.querySelectorAll('.gate-choice').forEach(btn => {
    const active = btn.dataset.gate === gate;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });

  renderLearnTruthTable();
}

function renderLearnTruthTable() {
  const { gate, A, B } = state.learn;
  const info = gateInfo[gate];
  const head = document.getElementById('learnTruthHead');
  const body = document.getElementById('learnTruthBody');
  head.innerHTML = info.inputs === 1 ? '<tr><th>A</th><th>OUT</th></tr>' : '<tr><th>A</th><th>B</th><th>OUT</th></tr>';
  body.innerHTML = '';

  const rows = info.inputs === 1 ? [[0], [1]] : [[0,0], [0,1], [1,0], [1,1]];
  rows.forEach(values => {
    const out = info.calc(values[0], values[1]);
    const tr = document.createElement('tr');
    const current = values[0] === A && (info.inputs === 1 || values[1] === B);
    if (current) tr.classList.add('current');
    tr.innerHTML = info.inputs === 1
      ? `<td>${values[0]}</td><td>${out}</td>`
      : `<td>${values[0]}</td><td>${values[1]}</td><td>${out}</td>`;
    body.appendChild(tr);
  });
}

function selectLearnGate(gate) {
  state.learn.gate = gate;
  state.learn.A = 0;
  state.learn.B = 0;
  document.getElementById('learnAssistantText').textContent = 'Prøv først at ændre inputtene. Hvis noget er uklart, kan jeg forklare reglen eller stille dig et spørgsmål.';
  document.getElementById('learnMicroQuestion').hidden = true;
  renderLearn();
}

function toggleLearnInput(key) {
  state.learn[key] = state.learn[key] ? 0 : 1;
  renderLearn();
}

function showLearnMicroQuestion() {
  const { gate } = state.learn;
  const panel = document.getElementById('learnMicroQuestion');
  const questions = {
    AND: { q: 'Hvornår kan en AND-gate give 1?', choices: ['Når begge inputs er 1', 'Når mindst ét input er 1'], correct: 0 },
    OR: { q: 'Er ét input på 1 nok til, at OR giver 1?', choices: ['Ja', 'Nej'], correct: 0 },
    NOT: { q: 'Hvis input er 0, hvad giver NOT?', choices: ['0', '1'], correct: 1 },
    XOR: { q: 'Hvad giver XOR ved inputs 1 og 1?', choices: ['0', '1'], correct: 0 }
  };
  const item = questions[gate];
  panel.hidden = false;
  panel.innerHTML = `<p><strong>${escapeText(item.q)}</strong></p><div class="micro-answer-row"></div><p class="micro-response" aria-live="polite"></p>`;
  const row = panel.querySelector('.micro-answer-row');
  item.choices.forEach((choice, index) => {
    const btn = document.createElement('button');
    btn.textContent = choice;
    btn.addEventListener('click', () => {
      panel.querySelector('.micro-response').textContent = index === item.correct ? 'Ja. Brug den regel, når du ændrer inputtene.' : 'Prøv igen og kig på sandhedstabellen.';
    });
    row.appendChild(btn);
  });
}

function learnHelp(action) {
  const info = gateInfo[state.learn.gate];
  const target = document.getElementById('learnAssistantText');
  document.getElementById('learnMicroQuestion').hidden = true;

  if (action === 'hint') target.textContent = info.hint;
  if (action === 'rule') target.textContent = info.explanation;
  if (action === 'question') {
    target.textContent = 'Svar først for dig selv – brug derefter knapperne nedenfor.';
    showLearnMicroQuestion();
  }
  if (action === 'ai') {
    target.textContent = `Et godt AI-spørgsmål kunne være: “Forklar ${state.learn.gate}-reglen med et nyt eksempel, men lad mig selv finde output.”`;
  }
}

function newPractice() {
  const gates = ['AND', 'OR', 'NOT', 'XOR'];
  const currentIndex = gates.indexOf(state.practice.gate);
  let next = gates[Math.floor(Math.random() * gates.length)];
  if (next === state.practice.gate) next = gates[(currentIndex + 1) % gates.length];
  state.practice.gate = next;
  state.practice.target = Math.random() < .5 ? 0 : 1;
  state.practice.A = 0;
  state.practice.B = 0;
  state.practice.checked = false;
  state.practice.hintLevel = 0;
  document.getElementById('practiceAssistantText').textContent = 'Prøv én kombination først. Et forkert forsøg er også information.';
  document.getElementById('practiceFeedback').textContent = '';
  renderPractice();
}

function renderPractice() {
  const p = state.practice;
  const info = gateInfo[p.gate];
  const out = info.calc(p.A, p.B);
  document.getElementById('practicePrompt').textContent = `Kan du få ${p.gate}-gaten til at give output ${p.target}?`;
  document.getElementById('practiceGateDiagram').innerHTML = gateSvg(p.gate, p.A, p.B, { compact: true });

  const inputs = document.getElementById('practiceInputs');
  inputs.innerHTML = '';
  ['A', 'B'].slice(0, info.inputs).forEach(key => {
    const btn = document.createElement('button');
    btn.className = `signal-button${p[key] ? ' on' : ''}`;
    btn.dataset.practiceInput = key;
    btn.innerHTML = `<span>${key}</span><strong>${p[key]}</strong>`;
    btn.addEventListener('click', () => {
      p[key] = p[key] ? 0 : 1;
      p.checked = false;
      document.getElementById('practiceFeedback').textContent = '';
      renderPractice();
    });
    inputs.appendChild(btn);
  });

  const outputBox = document.getElementById('practiceOutputBox');
  outputBox.querySelector('strong').textContent = p.checked ? out : '?';
  outputBox.classList.toggle('on', p.checked && out === 1);
  outputBox.classList.toggle('muted-output', !p.checked);
}

function checkPractice() {
  const p = state.practice;
  const out = gateInfo[p.gate].calc(p.A, p.B);
  p.checked = true;
  renderPractice();
  const feedback = document.getElementById('practiceFeedback');
  if (out === p.target) {
    feedback.textContent = `Ja. Dine inputs får ${p.gate} til at give ${p.target}.`;
    feedback.className = 'feedback good';
    document.getElementById('practiceAssistantText').textContent = 'Godt. Kan du forklare med gate-reglen, hvorfor din kombination virker?';
  } else {
    feedback.textContent = `Ikke endnu. Din kombination giver ${out}. Prøv at ændre ét input ad gangen.`;
    feedback.className = 'feedback try';
  }
}

function practiceHelp(action) {
  const p = state.practice;
  const info = gateInfo[p.gate];
  const target = document.getElementById('practiceAssistantText');
  if (action === 'hint') {
    p.hintLevel += 1;
    target.textContent = p.hintLevel === 1 ? info.hint : `Målet er output ${p.target}. Sammenlign målet med reglen: ${info.rule.toLowerCase()}.`;
  }
  if (action === 'question') target.textContent = info.question;
  if (action === 'ai') target.textContent = `Prøv fx: “Jeg øver ${p.gate}. Mit mål er output ${p.target}. Stil mig et spørgsmål, der hjælper mig med at vælge inputs, uden at give kombinationen.”`;
}

function calcCircuit(values = state.challenge) {
  const and1 = Number(Boolean(values.A) && Boolean(values.C));
  const or1 = Number(Boolean(values.B) || Boolean(values.D));
  const not1 = Number(!Boolean(or1));
  const output = Number(Boolean(and1) && Boolean(not1));
  return { and1, or1, not1, output };
}

const challengeSteps = [
  { title: 'Trin 1 af 4', prompt: 'Se på A og C. Hvad kommer ud af den første AND-gate?', key: 'and1', gate: 'cGateAnd1', badge: 'badgeAnd1', hint: 'AND giver kun 1, hvis både A og C er 1.' },
  { title: 'Trin 2 af 4', prompt: 'Se på B og D. Hvad kommer ud af OR-gaten?', key: 'or1', gate: 'cGateOr', badge: 'badgeOr', hint: 'OR giver 1, hvis mindst ét af inputtene er 1.' },
  { title: 'Trin 3 af 4', prompt: 'NOT-gaten får resultatet fra OR. Hvad sender NOT videre?', key: 'not1', gate: 'cGateNot', badge: 'badgeNot', hint: 'NOT vender signalet: 0↔1.' },
  { title: 'Trin 4 af 4', prompt: 'Til sidst mødes de to grene i en AND-gate. Hvad bliver OUT?', key: 'output', gate: 'cGateFinal', badge: null, hint: 'Den sidste AND-gate får resultatet fra øverste AND og fra NOT-gaten.' }
];

function resetChallengeProgress(message = 'Arbejd kun med den gate, der er fremhævet. Du behøver ikke regne hele kredsløbet på én gang.') {
  state.challenge.step = 0;
  state.challenge.revealed = [false, false, false, false];
  state.challenge.hintLevel = 0;
  document.getElementById('challengeStepFeedback').textContent = '';
  document.getElementById('challengeAssistantText').textContent = message;
  renderChallenge();
}

function renderChallenge() {
  const c = state.challenge;
  const v = calcCircuit();

  document.querySelectorAll('[data-challenge-input]').forEach(btn => {
    const key = btn.dataset.challengeInput;
    btn.querySelector('strong').textContent = c[key];
    btn.classList.toggle('on', Boolean(c[key]));
  });

  const inputWires = { cWireA: c.A, cWireB: c.B, cWireC: c.C, cWireD: c.D };
  Object.entries(inputWires).forEach(([id, value]) => document.getElementById(id).classList.toggle('on', Boolean(value)));

  const revealed = c.revealed;
  const signalMap = [
    ['cWireAnd1', v.and1, 0],
    ['cWireOr', v.or1, 1],
    ['cWireNot', v.not1, 2],
    ['cWireOut', v.output, 3]
  ];
  signalMap.forEach(([id, value, step]) => {
    document.getElementById(id).classList.toggle('on', revealed[step] && Boolean(value));
  });

  challengeSteps.forEach((stepInfo, index) => {
    const gateEl = document.getElementById(stepInfo.gate);
    gateEl.classList.toggle('focus', index === c.step && c.step < 4);
    gateEl.classList.toggle('done', revealed[index]);
    if (stepInfo.badge) {
      const badge = document.getElementById(stepInfo.badge);
      badge.classList.toggle('revealed', revealed[index]);
      badge.querySelector('text').textContent = revealed[index] ? v[stepInfo.key] : '?';
    }
  });

  const outRevealed = revealed[3];
  document.getElementById('cOutText').textContent = outRevealed ? v.output : '?';
  document.getElementById('cOutBox').classList.toggle('on', outRevealed && v.output === 1);

  if (c.step < challengeSteps.length) {
    const stepInfo = challengeSteps[c.step];
    document.getElementById('challengeStepTitle').textContent = stepInfo.title;
    document.getElementById('challengeStepPrompt').textContent = stepInfo.prompt;
    document.querySelectorAll('.binary-answer').forEach(btn => btn.disabled = false);
  } else {
    document.getElementById('challengeStepTitle').textContent = 'Færdig';
    document.getElementById('challengeStepPrompt').textContent = `Du har analyseret hele kredsløbet. OUT = ${v.output}.`;
    document.querySelectorAll('.binary-answer').forEach(btn => btn.disabled = true);
  }

  updateCircuitTruthHighlight();
}

function challengeAnswer(answer) {
  const c = state.challenge;
  if (c.step >= challengeSteps.length) return;
  const values = calcCircuit();
  const current = challengeSteps[c.step];
  const correct = values[current.key];
  const feedback = document.getElementById('challengeStepFeedback');
  if (Number(answer) === correct) {
    c.revealed[c.step] = true;
    c.step += 1;
    c.hintLevel = 0;
    feedback.textContent = 'Korrekt. Gå videre til næste gate.';
    feedback.className = 'feedback good';
    if (c.step === 4) {
      document.getElementById('challengeAssistantText').textContent = 'Du fandt hele vejen gennem kredsløbet. Prøv nu at forklare, hvorfor B eller D på 1 kan forhindre OUT i at blive 1.';
    }
    renderChallenge();
  } else {
    feedback.textContent = 'Ikke helt. Kig kun på den fremhævede gate og dens inputs.';
    feedback.className = 'feedback try';
  }
}

function toggleChallengeInput(key) {
  state.challenge[key] = state.challenge[key] ? 0 : 1;
  resetChallengeProgress(`Du ændrede ${key}. Analysen starter igen fra den første gate.`);
}

function randomChallenge() {
  ['A','B','C','D'].forEach(k => state.challenge[k] = Math.random() < .5 ? 0 : 1);
  resetChallengeProgress('Nye inputs er klar. Start med A og C – én gate ad gangen.');
}

function challengeHelp(action) {
  const c = state.challenge;
  const target = document.getElementById('challengeAssistantText');
  if (c.step >= 4) {
    target.textContent = 'Prøv at forklare kredsløbet med dine egne ord. Hvilke betingelser skal være opfyldt for OUT = 1?';
    return;
  }
  const step = challengeSteps[c.step];
  if (action === 'hint') {
    c.hintLevel += 1;
    target.textContent = c.hintLevel === 1 ? step.hint : 'Læs kun de to signaler, der går ind i den fremhævede gate, og brug gate-reglen på dem.';
  }
  if (action === 'question') {
    const qs = [
      `Hvilke inputværdier går ind i den fremhævede gate lige nu?`,
      `Hvilken regel gælder for ${c.step === 2 ? 'NOT' : c.step === 1 ? 'OR' : 'AND'}?`,
      'Kan du sige højt, hvad der skal være sandt, før denne gate giver 1?'
    ];
    target.textContent = qs[c.hintLevel % qs.length];
  }
  if (action === 'ai') {
    target.textContent = 'Et godt AI-spørgsmål kunne være: “Jeg analyserer et logisk kredsløb. Hjælp mig med kun den næste gate og stil mig et spørgsmål i stedet for at give OUT.”';
  }
}

function buildCircuitTruthTable() {
  const body = document.getElementById('circuitTruthBody');
  body.innerHTML = '';
  for (let A = 0; A <= 1; A++) {
    for (let B = 0; B <= 1; B++) {
      for (let C = 0; C <= 1; C++) {
        for (let D = 0; D <= 1; D++) {
          const out = calcCircuit({ A, B, C, D }).output;
          const tr = document.createElement('tr');
          tr.dataset.combo = `${A}${B}${C}${D}`;
          tr.innerHTML = `<td>${A}</td><td>${B}</td><td>${C}</td><td>${D}</td><td>${out}</td>`;
          body.appendChild(tr);
        }
      }
    }
  }
}

function updateCircuitTruthHighlight() {
  const c = state.challenge;
  const combo = `${c.A}${c.B}${c.C}${c.D}`;
  document.querySelectorAll('#circuitTruthBody tr').forEach(row => row.classList.toggle('current', row.dataset.combo === combo));
}

function renderMinecraft() {
  const m = state.minecraft;
  const out = Number(Boolean(m.A) && Boolean(m.B));
  document.querySelectorAll('[data-mc-input]').forEach(btn => {
    const key = btn.dataset.mcInput;
    btn.classList.toggle('on', Boolean(m[key]));
    btn.setAttribute('aria-pressed', String(Boolean(m[key])));
    btn.querySelector('strong').textContent = `${key}: ${m[key]}`;
  });
  document.querySelector('[data-mc-wire="A"]').classList.toggle('on', Boolean(m.A));
  document.querySelector('[data-mc-wire="B"]').classList.toggle('on', Boolean(m.B));
  document.querySelector('[data-mc-wire="OUT"]').classList.toggle('on', Boolean(out));
  document.querySelector('.mc-lamp').classList.toggle('on', Boolean(out));
  document.getElementById('mcExplanation').textContent = out
    ? 'Begge håndtag er 1, så AND-betingelsen er opfyldt, og lampen lyser.'
    : `Håndtagene er ${m.A} og ${m.B}. AND kræver to 1-taller, så lampen er slukket.`;
}

function init() {
  document.querySelectorAll('.nav-button').forEach(btn => btn.addEventListener('click', () => setSection(btn.dataset.section)));
  document.querySelectorAll('.gate-choice').forEach(btn => btn.addEventListener('click', () => selectLearnGate(btn.dataset.gate)));
  document.querySelectorAll('[data-learn-input]').forEach(btn => btn.addEventListener('click', () => toggleLearnInput(btn.dataset.learnInput)));
  document.querySelectorAll('[data-learn-help]').forEach(btn => btn.addEventListener('click', () => learnHelp(btn.dataset.learnHelp)));

  document.getElementById('practiceCheck').addEventListener('click', checkPractice);
  document.getElementById('practiceNew').addEventListener('click', newPractice);
  document.querySelectorAll('[data-practice-help]').forEach(btn => btn.addEventListener('click', () => practiceHelp(btn.dataset.practiceHelp)));

  document.querySelectorAll('[data-challenge-input]').forEach(btn => btn.addEventListener('click', () => toggleChallengeInput(btn.dataset.challengeInput)));
  document.querySelectorAll('[data-challenge-answer]').forEach(btn => btn.addEventListener('click', () => challengeAnswer(btn.dataset.challengeAnswer)));
  document.getElementById('challengeRandom').addEventListener('click', randomChallenge);
  document.getElementById('challengeReset').addEventListener('click', () => resetChallengeProgress());
  document.querySelectorAll('[data-challenge-help]').forEach(btn => btn.addEventListener('click', () => challengeHelp(btn.dataset.challengeHelp)));

  document.querySelectorAll('[data-mc-input]').forEach(btn => btn.addEventListener('click', () => {
    const key = btn.dataset.mcInput;
    state.minecraft[key] = state.minecraft[key] ? 0 : 1;
    renderMinecraft();
  }));

  buildCircuitTruthTable();
  renderLearn();
  renderPractice();
  renderChallenge();
  renderMinecraft();
}

init();
