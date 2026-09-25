const SCORES = [
  ["InternVL 38B", [23.3, 8.3, 6.7, 5.0, 36.7, 16.0], [17.9, 10.1, 11.1, null, 15.8, 13.7]],
  ["InternVL 8B", [15.0, 8.3, 8.3, 8.3, 18.3, 11.7], [19.0, 3.4, 16.8, null, 9.3, 12.1]],
  ["Qwen3-VL 32B", [33.3, 13.3, 50.0, 30.0, 23.3, 30.0], [28.8, 9.6, 41.8, null, 31.4, 27.9]],
  ["Qwen3-VL 8B", [30.0, 13.3, 28.3, 5.0, 3.3, 16.0], [23.6, 11.9, 32.8, null, 10.9, 19.8]],
  ["Cosmos 7B", [15.0, 13.3, 28.3, 5.0, 6.7, 13.7], [19.9, 13.7, 36.1, null, 16.2, 21.5]],
  ["Среднее", [23.3, 11.3, 24.3, 10.7, 17.7, 17.5], [21.8, 9.7, 27.7, null, 16.7, 19.0]],
];

const INDEPENDENT_SCORES = [
  ["Molmo2-4B", [31.7, 20.0, 20.0, 3.3, 25.0, 20.0], [30.5, 10.3, 31.6, null, 31.0, 25.8]],
  ["Molmo2-8B", [31.7, 11.7, 18.3, 5.0, 0.0, 13.3], [20.0, 8.0, 23.9, null, 7.4, 14.8]],
];

const TEXT_SCORES = [
  ["InternVL 38B", [0.0, 11.7, 0.0, 0.0, 0.0, 2.3], [0.4, 9.9, 0.1, null, 1.4, 3.0]],
  ["InternVL 8B", [0.0, 11.7, 0.0, 0.0, 0.0, 2.3], [0.4, 9.7, 0.0, null, 0.6, 2.7]],
  ["Qwen3-VL 32B", [0.0, 6.7, 0.0, 6.7, 0.0, 2.7], [0.4, 10.5, 0.0, null, 1.2, 3.0]],
  ["Qwen3-VL 8B", [0.0, 5.0, 0.0, 0.0, 0.0, 1.0], [0.4, 10.1, 0.0, null, 0.2, 2.7]],
  ["Cosmos 7B", [0.0, 21.7, 0.0, 3.3, 0.0, 5.0], [21.2, 9.0, 0.0, null, 1.1, 7.8]],
  ["Среднее", [0.0, 11.4, 0.0, 2.0, 0.0, 2.7], [4.6, 9.8, 0.0, null, 0.9, 3.8]],
];

const TYPES = [
  {
    id: "current",
    title: "Текущее действие",
    input: "Только видео",
    blurb: "Кадр обрывается примерно на 80% шага: действие ещё идёт. Нужно назвать его одной короткой фразой.",
    check: "Судья Pollux: 1, если описано то же действие. Синонимы допустимы.",
  },
  {
    id: "next",
    title: "Следующий шаг",
    input: "Инструкция и видео",
    blurb: "Виден только предыдущий шаг. Следующее действие в кадр не входит. Его нужно предсказать по инструкции и тому, что уже сделано.",
    check: "Тот же судья Pollux. Верный ответ — текст следующего шага, а не пересказ инструкции.",
  },
  {
    id: "completed",
    title: "Завершённое действие",
    input: "Только видео",
    blurb: "К шагу добавлено короткое начало следующего, около 20%. Видно, что действие уже закончилось.",
    check: "Снова Pollux: 1 за то же действие, 0 за другое действие или другой объект.",
  },
  {
    id: "progress",
    title: "Прогресс",
    input: "Инструкция и видео",
    blurb: "Ролик идёт от начала выполнения до текущей точки. Ответ — одно целое число от 1 до 99.",
    check: "Судья не используется. Число верно, если оно не дальше половины шага от эталона.",
    baselines: [
      ["Uniform {0…100}", "14.9"],
      ["Всегда 50%", "11.7"],
    ],
  },
  {
    id: "skipped",
    title: "Пропущенный шаг",
    input: "Только видео",
    blurb: "Один внутренний шаг вырезан, куски до и после склеены. Нужно назвать пропущенное действие.",
    check: "Pollux сравнивает ответ с текстом вырезанного шага.",
  },
];

const EXAMPLES = {
  current: {
    video: "media/current.mp4",
    question: "What action is the robot currently performing?",
    sees: "Модель видит только ролик. Текст задачи ей не дают.",
    task: null,
    gold: "The right arm passes the green bagged snack to the left arm.",
    clip: "Виден кусок передачи пакета из правой руки в левую. Конец шага в ролик не входит.",
    bars: [
      ["seen", 80],
      ["tail", 20],
    ],
    barNote: "Цветом отмечена видимая часть шага, серым — то, что уже не показывают.",
    answers: [
      {
        label: "Передача из руки в руку",
        text: "The robot is transferring a green packet from one robotic arm to the other.",
        ok: true,
        why: "То же действие: пакет переходит от одной руки к другой.",
      },
      {
        label: "Просто берёт пакет",
        text: "The robot is picking up a green bag of candy.",
        ok: false,
        why: "Это другое действие: захват, а не передача.",
      },
      {
        label: "Кладёт в корзину",
        text: "The robot is picking up a green item from the shelf and placing it into the shopping cart.",
        ok: false,
        why: "В кадре передача между руками, а не укладка в корзину.",
      },
    ],
  },
  next: {
    video: "media/next.mp4",
    question: "What action does the robot perform next in this execution?",
    sees: "Модель видит инструкцию и ролик предыдущего шага.",
    task: "Adjust the yellow and green bagged snacks on the shelf to their correct positions.",
    gold: "Waist rotation.",
    clip: "Кадр кончается до поворота корпуса. Сам поворот не показан.",
    bars: [
      ["seen", 70],
      ["gap", 30],
    ],
    barNote: "Виден текущий шаг. Следующий шаг в ролик не входит.",
    answers: [
      {
        label: "Поворот корпуса",
        text: "The robot rotates its waist.",
        ok: true,
        why: "Это и есть следующий шаг.",
      },
      {
        label: "Пересказ инструкции",
        text: "The robot adjusts the yellow and green bagged snacks on the shelf.",
        ok: false,
        why: "Это цель всей задачи, а не ближайший следующий шаг.",
      },
      {
        label: "Берёт снек",
        text: "Grasp a yellow and green bagged snack from the shelf.",
        ok: false,
        why: "Захват пакета в этом месте плана не следующий шаг.",
      },
    ],
  },
  completed: {
    video: "media/completed.mp4",
    question: "What action has just been completed?",
    sees: "Модель видит только ролик.",
    task: null,
    gold: "The right arm picks up the white wrapping paper from the table.",
    clip: "Правая рука уже подняла белую бумагу со стола, и кадр чуть заходит в следующий шаг.",
    bars: [
      ["seen", 78],
      ["tail", 22],
    ],
    barNote: "Основная часть — завершённый шаг, короткий хвост — начало следующего.",
    answers: [
      {
        label: "Подняла белый предмет",
        text: "The robot arm has picked up a small white object from the table.",
        ok: true,
        why: "То же действие и тот же объект, формулировка короче.",
      },
      {
        label: "Ножницы",
        text: "The right robot arm has just picked up the rightmost scissors from the table.",
        ok: false,
        why: "Действие похоже, но объект другой.",
      },
      {
        label: "Кладёт на стол",
        text: "Putting the object to the table",
        ok: false,
        why: "Направление действия другое: предмет поднимают, а не кладут.",
      },
    ],
  },
  progress: {
    video: "media/progress.mp4",
    question: "What percentage of the task has been completed?",
    sees: "Модель видит инструкцию и ролик от начала до текущей точки.",
    task: "Put the green packaged meat products from the fresh cooler into the shopping cart.",
    gold: "33",
    k: 2,
    n: 6,
    clip: "В плане 6 шагов, выполнены 2. Эталон — 33%.",
    bars: [
      ["seen", 33],
      ["tail", 67],
    ],
    barNote: "Цветом отмечена уже прошедшая доля плана.",
    answers: [
      { label: "25", text: "25", ok: true, why: "25 укладывается в допуск ±8.3 вокруг 33.3." },
      { label: "50", text: "50", ok: false, why: "50 дальше половины шага от эталона." },
      { label: "100", text: "100", ok: false, why: "Задача ещё не закончена." },
    ],
  },
  skipped: {
    video: "media/skipped.mp4",
    question: "Which step was skipped during task execution?",
    sees: "Модель видит только склеенный ролик, без текста задачи.",
    task: null,
    gold: "Right arm throws the held yellow packaging bag into the trash bin",
    clip: "Шаг, где правая рука бросает жёлтый пакет в урну, из видео убран.",
    bars: [
      ["seen", 42],
      ["gap", 16],
      ["seen", 42],
    ],
    barNote: "Два видимых куска и вырезанный шаг между ними.",
    answers: [
      {
        label: "Пакет не бросили в урну",
        text: "The step of placing the yellow object into the trash bin was skipped.",
        ok: true,
        why: "Названо то же пропущенное действие.",
      },
      {
        label: "Ничего не пропущено",
        text: "None of the steps were skipped.",
        ok: false,
        why: "Шаг в ролике отсутствует.",
      },
      {
        label: "Номер шага",
        text: "Step 1 was skipped.",
        ok: false,
        why: "Нужен текст действия, а не номер.",
      },
    ],
  },
};

function cells(vals) {
  return vals
    .map((v) => `<td>${v == null ? "—" : v.toFixed(1)}</td>`)
    .join("");
}

function fillScores(body, rows) {
  for (const [name, acc, f1] of rows) {
    const mean = name === "Среднее" ? " mean" : "";
    const accRow = document.createElement("tr");
    accRow.className = "acc" + mean;
    accRow.innerHTML =
      `<td rowspan="2">${name}</td><td class="metric">acc</td>` + cells(acc);
    const f1Row = document.createElement("tr");
    f1Row.className = "f1" + mean;
    f1Row.innerHTML = `<td class="metric">F1</td>` + cells(f1);
    body.appendChild(accRow);
    body.appendChild(f1Row);
  }
}

fillScores(document.getElementById("score-body"), SCORES);
fillScores(document.getElementById("text-score-body"), TEXT_SCORES);
fillScores(document.getElementById("indep-score-body"), INDEPENDENT_SCORES);

const typeGrid = document.getElementById("type-grid");
for (const t of TYPES) {
  const card = document.createElement("article");
  card.className = "type-card";
  const baselines = t.baselines
    ? `<p>Случайные бейзлайны: ${t.baselines.map(([name, value]) => `${name} — ${value}`).join(", ")}.</p>`
    : "";
  card.innerHTML = `<b>${t.title}</b><p>${t.blurb}</p><p>${t.check}</p>${baselines}<span class="chip">${t.input}</span>`;
  typeGrid.appendChild(card);
}

const tabs = document.getElementById("tabs");
const stage = document.getElementById("stage");
let currentId = "current";

for (const t of TYPES) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.role = "tab";
  btn.textContent = t.title;
  btn.dataset.id = t.id;
  btn.setAttribute("aria-selected", t.id === currentId ? "true" : "false");
  btn.addEventListener("click", () => select(t.id));
  tabs.appendChild(btn);
}

function select(id) {
  currentId = id;
  for (const btn of tabs.querySelectorAll("button")) {
    btn.setAttribute("aria-selected", btn.dataset.id === id ? "true" : "false");
  }
  render(id);
}

function barsHtml(ex) {
  const segs = ex.bars
    .map(([kind, w]) => `<i class="${kind}" style="width:${w}%"></i>`)
    .join("");
  return `<div class="timeline"><div class="seg">${segs}</div><small>${ex.barNote}</small></div>`;
}

function render(id) {
  const meta = TYPES.find((t) => t.id === id);
  const ex = EXAMPLES[id];
  const task = ex.task
    ? `<div class="instruction"><b>Инструкция.</b> ${ex.task}</div>`
    : "";
  const answerBox =
    id === "progress"
      ? `<label for="ans">Ваш процент</label>
         <input id="ans" type="number" min="0" max="100" step="1" value="33" inputmode="numeric">
         <input id="slider" type="range" min="0" max="100" value="33">
         <div class="scale" aria-hidden="true">
           <div class="rail"></div>
           <div class="zone" style="left:25%;width:16.7%"></div>
           <div class="mark" style="left:33.3%"></div>
         </div>
         <p class="meta">Зелёная полоса — допуск. Чёрная черта — эталон, 2 из 6 шагов, 33.3%.</p>`
      : `<label for="ans">Ваш ответ по-английски</label>
         <textarea id="ans" placeholder="One short English sentence"></textarea>`;

  stage.innerHTML = `
    <div class="stage">
      <div>
        <video id="clip" controls playsinline preload="metadata" src="${ex.video}"></video>
        ${barsHtml(ex)}
        <p class="meta">${ex.clip}</p>
      </div>
      <div>
        <p class="meta">${meta.input}</p>
        <p class="q">${ex.question}</p>
        <p class="meta">${ex.sees}</p>
        ${task}
        ${answerBox}
        <div class="row">
          <button class="primary" id="check" type="button">Проверить</button>
          <button class="ghost" id="reset" type="button">Сбросить</button>
        </div>
        <div id="result"></div>
      </div>
    </div>`;

  document.getElementById("check").addEventListener("click", () => check(id));
  document.getElementById("reset").addEventListener("click", () => render(id));
  if (id === "progress") {
    const num = document.getElementById("ans");
    const slider = document.getElementById("slider");
    slider.addEventListener("input", () => {
      num.value = slider.value;
    });
    num.addEventListener("input", () => {
      if (num.value !== "") slider.value = num.value;
    });
  }
}

function instructionRow(task) {
  return task ? `<dt>Инструкция</dt><dd>${task}</dd>` : "";
}

function judgeCard(question, gold, answer, verdictHtml, task) {
  return `<div class="judge">
    <dl>
      <dt>Задание</dt><dd>${question}</dd>
      ${instructionRow(task)}
      <dt>Эталон</dt><dd>${gold}</dd>
      <dt>Ответ</dt><dd>${answer || "—"}</dd>
      <dt>Критерий</dt><dd>1 — то же действие, синонимы допустимы. 0 — другое действие или другой объект.</dd>
    </dl>
    ${verdictHtml || ""}
  </div>`;
}

function picks(id, selected) {
  const ex = EXAMPLES[id];
  const buttons = ex.answers
    .map((a, i) => {
      const cls = selected === i ? (a.ok ? "on-ok" : "on-bad") : "";
      return `<button type="button" class="${cls}" data-i="${i}">${a.label}</button>`;
    })
    .join("");
  return `<p class="meta">Разные формулировки и балл по правилу этого типа.</p><div class="picks">${buttons}</div>`;
}

function check(id) {
  const ex = EXAMPLES[id];
  const raw = document.getElementById("ans").value.trim();
  const box = document.getElementById("result");

  if (id === "progress") {
    box.innerHTML = progressResult(ex, raw) + picks(id, null);
  } else {
    const same = raw.toLowerCase() === ex.gold.toLowerCase().replace(/\.$/, "") ||
      raw.toLowerCase() === ex.gold.toLowerCase();
    const verdict = same
      ? `<p class="verdict ok">Дословное совпадение с эталоном. Такой ответ получает 1.</p>`
      : `<p class="verdict wait">Смысл сравнивает Pollux. Дословного совпадения с эталоном нет, поэтому страница сама балл не ставит.</p>`;
    box.innerHTML = judgeCard(ex.question, ex.gold, raw, verdict, ex.task) + picks(id, null);
  }
  bindPicks(id);
}

function bindPicks(id) {
  const box = document.getElementById("result");
  box.querySelectorAll(".picks button").forEach((btn) => {
    btn.addEventListener("click", () => showPick(id, Number(btn.dataset.i)));
  });
}

function showPick(id, index) {
  const ex = EXAMPLES[id];
  const a = ex.answers[index];
  const box = document.getElementById("result");
  const badge = a.ok
    ? `<p class="verdict ok">По критерию: 1. ${a.why}</p>`
    : `<p class="verdict bad">По критерию: 0. ${a.why}</p>`;
  if (id === "progress") {
    box.innerHTML = progressResult(ex, a.text, true) + picks(id, index);
  } else {
    box.innerHTML = judgeCard(ex.question, ex.gold, a.text, badge, ex.task) + picks(id, index);
  }
  bindPicks(id);
}

function progressResult(ex, raw, preset) {
  const gt = (100 * ex.k) / ex.n;
  const tol = 50 / ex.n;
  const text = String(raw).trim();
  const range = /^\s*\d+(?:[.,]\d+)?\s*[-–]\s*\d+/.test(text);
  const match = text.match(/\d+(?:[.,]\d+)?/);
  let body;
  if (!preset && range) {
    body = `<p class="verdict bad">Балл 0. Диапазон не принимается: нужно одно число.</p>`;
  } else if (!match) {
    body = `<p class="verdict bad">Балл 0. В ответе нет числа от 0 до 100.</p>`;
  } else {
    const p = Number(match[0].replace(",", "."));
    const ok = p >= 0 && p <= 100 && Math.abs(p - gt) <= tol + 1e-9;
    body = ok
      ? `<p class="verdict ok">Балл 1. |${p} − ${gt.toFixed(1)}| ≤ ${tol.toFixed(1)}.</p>`
      : `<p class="verdict bad">Балл 0. |${p} − ${gt.toFixed(1)}| больше допуска ${tol.toFixed(1)}.</p>`;
  }
  return `<div class="judge">
    <dl>
      ${instructionRow(ex.task)}
      <dt>Эталон</dt><dd>${gt.toFixed(1)}% = 100 × ${ex.k} / ${ex.n}</dd>
      <dt>Допуск</dt><dd>±${tol.toFixed(1)} п.п. — это половина одного шага</dd>
      <dt>Ответ</dt><dd>${text || "—"}</dd>
    </dl>
    ${body}
  </div>`;
}

select("current");
