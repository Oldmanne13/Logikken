const state = {
  inputs: { A: 0, B: 0, C: 0, D: 0 },
  prediction: null,
  revealed: false,
  hintLevel: 0,
  checks: 0,
  currentView: 'diagram'
};

function calc(values = state.inputs) {
  const and1 = Number(Boolean(values.A && values.C));
  const or1 = Number(Boolean(values.B || values.D));
  const not1 = Number(!or1);
  const output = Number(Boolean(and1 && not1));
  return { and1, or1, not1, output };
}

function resetAttempt({ keepTutor = true } = {}) {
  state.prediction = null;
  state.revealed = false;
  document.querySelectorAll('.prediction-button').forEach(btn => btn.classList.remove('selected'));
  document.getElementById('checkBtn').disabled = true;
  const feedback = document.getElementById('predictionFeedback');
  feedback.textContent = '';
  feedback.className = 'feedback';
  if (!keepTutor) {
    state.hintLevel = 0;
    setTutor('Prøv først selv at følge signalet fra venstre mod højre.');
  }
}

function updateInputsUI() {
  document.querySelectorAll('.input-toggle').forEach(btn => {
    const key = btn.dataset.input;
    const on = Boolean(state.inputs[key]);
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-pressed', String(on));
    btn.querySelector('.input-value').textContent = state.inputs[key];
  });

  document.querySelectorAll('[data-rs-value]').forEach(el => {
    const key = el.dataset.rsValue;
    if (['A', 'B', 'C', 'D'].includes(key)) el.textContent = state.inputs[key];
  });

  updateTruthHighlight();
}

function setWire(id, active) {
  document.getElementById(id).classList.toggle('active', Boolean(active));
}

function renderSignals() {
  const values = calc();
  const show = state.revealed;

  setWire('wireA', show && state.inputs.A);
  setWire('wireC', show && state.inputs.C);
  setWire('wireB', show && state.inputs.B);
  setWire('wireD', show && state.inputs.D);
  setWire('wireAnd1', show && values.and1);
  setWire('wireOr', show && values.or1);
  setWire('wireNot', show && values.not1);
  setWire('wireOut', show && values.output);

  document.getElementById('labelAnd1').textContent = show ? values.and1 : '?';
  document.getElementById('labelOr').textContent = show ? values.or1 : '?';
  document.getElementById('labelNot').textContent = show ? values.not1 : '?';
  document.getElementById('outText').textContent = show ? `OUT ${values.output}` : 'OUT ?';
  document.querySelector('.output-terminal').classList.toggle('active', show && values.output === 1);

  const analysis = {
    and1Value: values.and1,
    orValue: values.or1,
    notValue: values.not1,
    outValue: values.output
  };
  Object.entries(analysis).forEach(([id, value]) => {
    document.getElementById(id).textContent = show ? value : '?';
  });
  document.getElementById('analysisStrip').classList.toggle('locked', !show);

  document.querySelectorAll('[data-rs-value]').forEach(el => {
    const key = el.dataset.rsValue;
    if (['A','B','C','D'].includes(key)) return;
    el.textContent = show ? values[key] : '?';
  });

  const redstoneMap = {
    A: state.inputs.A,
    B: state.inputs.B,
    C: state.inputs.C,
    D: state.inputs.D,
    and1: values.and1,
    or1: values.or1,
    not1: values.not1,
    output: values.output
  };
  document.querySelectorAll('[data-rs-path]').forEach(el => {
    const key = el.dataset.rsPath;
    el.classList.toggle('active', show && Boolean(redstoneMap[key]));
  });
  document.querySelector('.torch-module').classList.toggle('on', show && values.not1 === 1);
  document.querySelector('.rs-lamp').classList.toggle('on', show && values.output === 1);
}

function toggleInput(key) {
  state.inputs[key] = state.inputs[key] ? 0 : 1;
  resetAttempt();
  updateInputsUI();
  renderSignals();
  setTutor(`Du ændrede ${key}. Hvilken gate bliver påvirket først af det input?`);
}

function selectPrediction(value) {
  state.prediction = Number(value);
  document.querySelectorAll('.prediction-button').forEach(btn => {
    btn.classList.toggle('selected', Number(btn.dataset.prediction) === state.prediction);
  });
  document.getElementById('checkBtn').disabled = false;
  document.getElementById('predictionFeedback').textContent = '';
}

function checkPrediction() {
  if (state.prediction === null) return;
  const values = calc();
  state.revealed = true;
  state.checks += 1;
  renderSignals();

  const feedback = document.getElementById('predictionFeedback');
  if (state.prediction === values.output) {
    feedback.textContent = 'Godt observeret. Følg nu mellemresultaterne og forklar for dig selv, hvorfor det passer.';
    feedback.className = 'feedback good';
    setTutor('Du har fundet det rigtige OUT. Kan du forklare, hvilken af de to grene der afgør resultatet i netop denne kombination?');
  } else {
    feedback.textContent = 'Ikke helt. Brug mellemresultaterne som spor og prøv at forklare, hvor din forudsigelse ændrer retning.';
    feedback.className = 'feedback try-again';
    setTutor('Se på kredsløbet i tre små trin: øverste AND, nederste OR→NOT og til sidst den sidste AND. Hvilket trin vil du kontrollere først?');
  }
}

function randomize() {
  ['A','B','C','D'].forEach(k => state.inputs[k] = Math.random() < .5 ? 0 : 1);
  state.hintLevel = 0;
  resetAttempt({ keepTutor: false });
  updateInputsUI();
  renderSignals();
}

function setView(view) {
  state.currentView = view;
  document.querySelectorAll('.view-tab').forEach(btn => {
    const active = btn.dataset.view === view;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });
  document.getElementById('diagramView').hidden = view !== 'diagram';
  document.getElementById('minecraftView').hidden = view !== 'minecraft';
  document.getElementById('diagramView').classList.toggle('active', view === 'diagram');
  document.getElementById('minecraftView').classList.toggle('active', view === 'minecraft');
}

function setTutor(message) {
  document.getElementById('tutorMessage').textContent = message;
}

function hideMicroQuestion() {
  document.getElementById('microQuestion').hidden = true;
  document.getElementById('microFeedback').textContent = '';
}

function tutorAction(action) {
  hideMicroQuestion();
  const v = state.inputs;
  const values = calc();

  if (action === 'start') {
    setTutor('Start ved venstre side. A og C mødes først i den øverste gate. Find dens type og brug derefter den samme metode på B og D. Vent med den sidste AND-gate, til begge grene er analyseret.');
    return;
  }

  if (action === 'hint') {
    state.hintLevel = Math.min(state.hintLevel + 1, 4);
    const hints = [
      'Følg én gren ad gangen. Begynd med A og C i den øverste AND-gate.',
      'En AND-gate giver kun 1, når begge dens inputs er 1. Sammenlign reglen med A og C.',
      'På den nederste gren går B og D først gennem OR. NOT-gaten vender derefter OR-resultatet om.',
      'Når du har ét resultat fra den øverste gren og ét fra NOT-gaten, er de de to inputs til den sidste AND-gate.'
    ];
    setTutor(hints[state.hintLevel - 1]);
    return;
  }

  if (action === 'question') {
    showMicroQuestion(values);
    return;
  }

  if (action === 'ai') {
    const examples = [
      '“Stil mig ét spørgsmål ad gangen, så jeg selv kan analysere kredsløbet.”',
      '“Forklar forskellen på AND og OR uden at løse mit konkrete kredsløb.”',
      '“Jeg sidder fast ved NOT-gaten. Giv mig et hint, men ikke resultatet.”',
      '“Hjælp mig med at kontrollere mit ræsonnement trin for trin uden at afsløre OUT.”'
    ];
    const example = examples[(state.checks + state.hintLevel) % examples.length];
    setTutor(`Et godt spørgsmål til en AI kunne være: ${example}`);
  }
}

function showMicroQuestion(values) {
  const panel = document.getElementById('microQuestion');
  const text = document.getElementById('microQuestionText');
  const answers = document.getElementById('microAnswers');
  const feedback = document.getElementById('microFeedback');
  feedback.textContent = '';
  panel.hidden = false;

  const questions = [
    {
      text: 'Hvilken gate modtager A og C?',
      answers: ['AND', 'OR', 'NOT'],
      correct: 'AND',
      good: 'Ja. Brug nu AND-reglen på A og C.',
      retry: 'Se på symbolet på den øverste gren igen.'
    },
    {
      text: 'Hvad gør NOT-gaten ved signalet fra OR-gaten?',
      answers: ['Vender 0↔1', 'Adderer 1', 'Lader det være uændret'],
      correct: 'Vender 0↔1',
      good: 'Korrekt. Derfor skal OR-resultatet altid vendes, før det når den sidste AND-gate.',
      retry: 'NOT betyder negation: signalet bliver det modsatte.'
    },
    {
      text: `B er ${state.inputs.B} og D er ${state.inputs.D}. Hvad bør du undersøge først på den nederste gren?`,
      answers: ['OR-gaten', 'Slut-AND', 'OUT direkte'],
      correct: 'OR-gaten',
      good: 'God strategi. Tag kredsløbet i den rækkefølge signalet bevæger sig.',
      retry: 'Følg forbindelsen fra B og D mod højre.'
    }
  ];

  const q = questions[(state.checks + state.hintLevel) % questions.length];
  text.textContent = q.text;
  answers.innerHTML = '';
  q.answers.forEach(answer => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = answer;
    btn.addEventListener('click', () => {
      feedback.textContent = answer === q.correct ? q.good : q.retry;
      feedback.style.color = answer === q.correct ? 'var(--signal)' : 'var(--warning)';
    });
    answers.appendChild(btn);
  });
}

function buildTruthTable() {
  const body = document.getElementById('truthBody');
  body.innerHTML = '';
  for (let A = 0; A <= 1; A++) {
    for (let C = 0; C <= 1; C++) {
      for (let B = 0; B <= 1; B++) {
        for (let D = 0; D <= 1; D++) {
          const values = { A, B, C, D };
          const row = document.createElement('tr');
          row.dataset.combo = `${A}${C}${B}${D}`;
          row.innerHTML = `<td>${A}</td><td>${C}</td><td>${B}</td><td>${D}</td><td>${calc(values).output}</td>`;
          body.appendChild(row);
        }
      }
    }
  }
  updateTruthHighlight();
}

function updateTruthHighlight() {
  const combo = `${state.inputs.A}${state.inputs.C}${state.inputs.B}${state.inputs.D}`;
  document.querySelectorAll('#truthBody tr').forEach(row => row.classList.toggle('current', row.dataset.combo === combo));
}

function init() {
  document.querySelectorAll('.input-toggle').forEach(btn => btn.addEventListener('click', () => toggleInput(btn.dataset.input)));
  document.querySelectorAll('.prediction-button').forEach(btn => btn.addEventListener('click', () => selectPrediction(btn.dataset.prediction)));
  document.getElementById('checkBtn').addEventListener('click', checkPrediction);
  document.getElementById('randomizeBtn').addEventListener('click', randomize);
  document.querySelectorAll('.view-tab').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));
  document.querySelectorAll('.tutor-button').forEach(btn => btn.addEventListener('click', () => tutorAction(btn.dataset.tutor)));

  buildTruthTable();
  updateInputsUI();
  renderSignals();
}

init();
