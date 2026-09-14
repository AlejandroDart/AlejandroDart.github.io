const clock = document.querySelector("#chile-clock");
const progressFill = document.querySelector("#scroll-progress-fill");
const backTop = document.querySelector(".back-top");
const nav = document.querySelector("nav");
const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
const sections = [...document.querySelectorAll("main[id], main section[id]")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const themeToggle = document.querySelector("#theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');
const engineeringBackground = document.querySelector(".engineering-bg");
const dataRain = document.querySelector("#data-rain");
const techCursor = document.querySelector("#tech-cursor");
const cursorToggle = document.querySelector("#cursor-toggle");
const systemToggle = document.querySelector("#system-toggle");
const systemToast = document.querySelector("#system-toast");
const systemReadout = document.querySelector(".hero-system-readout span");
const finePointer = window.matchMedia("(pointer: fine)");

function buildDataRain() {
  if (!dataRain) return;
  dataRain.replaceChildren();
  if (reduceMotion.matches) return;

  const glyphs = ["01", "{ }", "AI", "∑", "λ", "</>", "π", "∞", "SQL", "RAG", "C++", "◈", "∫", "ML", "{}", "⚙"];
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 24; index += 1) {
    const drop = document.createElement("span");
    drop.textContent = glyphs[index % glyphs.length];
    drop.style.setProperty("--left", `${(index * 37 + 7) % 100}%`);
    drop.style.setProperty("--duration", `${12 + (index % 7) * 1.65}s`);
    drop.style.setProperty("--delay", `${-((index * 2.85) % 19)}s`);
    drop.style.setProperty("--drift", `${((index % 5) - 2) * 18}px`);
    drop.style.setProperty("--scale", `${.74 + (index % 4) * .1}`);
    drop.style.setProperty("--peak", `${.22 + (index % 5) * .035}`);
    drop.style.setProperty("--blur", index % 6 === 0 ? ".55px" : "0px");
    fragment.appendChild(drop);
  }

  dataRain.appendChild(fragment);
}

buildDataRain();

let ambientPointerFrame = 0;
let cursorEnabled = finePointer.matches;
try { cursorEnabled = finePointer.matches && localStorage.getItem("am-cursor-enabled") !== "false"; } catch { /* Usa el valor predeterminado. */ }

function setAmbientPosition(x = 0, y = 0) {
  if (!engineeringBackground) return;
  engineeringBackground.style.setProperty("--ambient-x", `${x.toFixed(2)}px`);
  engineeringBackground.style.setProperty("--ambient-y", `${y.toFixed(2)}px`);
}

function applyCursorState(enabled, persist = true) {
  cursorEnabled = Boolean(enabled && finePointer.matches && !reduceMotion.matches);
  document.body.classList.toggle("cursor-disabled", !cursorEnabled);
  cursorToggle.hidden = !finePointer.matches;
  cursorToggle.setAttribute("aria-pressed", String(cursorEnabled));
  cursorToggle.setAttribute("aria-label", cursorEnabled ? "Desactivar cursor tecnológico" : "Activar cursor tecnológico");
  cursorToggle.title = cursorEnabled ? "Desactivar cursor tecnológico" : "Activar cursor tecnológico";
  cursorToggle.textContent = cursorEnabled ? "◎" : "○";
  if (persist) {
    try { localStorage.setItem("am-cursor-enabled", String(cursorEnabled)); } catch { /* El cursor continúa sin persistencia. */ }
  }
}

function createCursorSpark(x, y) {
  const spark = document.createElement("i");
  spark.className = "cursor-spark";
  spark.style.left = `${x}px`;
  spark.style.top = `${y}px`;
  document.body.appendChild(spark);
  window.setTimeout(() => spark.remove(), 520);
}

let lastCursorSpark = 0;
window.addEventListener("pointermove", (event) => {
  if (reduceMotion.matches || event.pointerType === "touch") return;
  const horizontal = (event.clientX / window.innerWidth - .5) * -12;
  const vertical = (event.clientY / window.innerHeight - .5) * -9;
  window.cancelAnimationFrame(ambientPointerFrame);
  ambientPointerFrame = window.requestAnimationFrame(() => {
    setAmbientPosition(horizontal, vertical);
    document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
    document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
    document.body.classList.add("pointer-active");
    if (cursorEnabled && techCursor) {
      techCursor.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
      techCursor.classList.add("visible");
    }
  });
  if (cursorEnabled && event.timeStamp - lastCursorSpark > 46) {
    lastCursorSpark = event.timeStamp;
    createCursorSpark(event.clientX, event.clientY);
  }
}, { passive:true });

document.documentElement.addEventListener("mouseleave", () => {
  if (!reduceMotion.matches) setAmbientPosition();
  document.body.classList.remove("pointer-active");
  techCursor?.classList.remove("visible");
});

reduceMotion.addEventListener?.("change", (event) => {
  if (event.matches) setAmbientPosition();
  buildDataRain();
  applyCursorState(cursorEnabled, false);
});

cursorToggle.addEventListener("click", () => applyCursorState(!cursorEnabled));
applyCursorState(cursorEnabled, false);

let systemActive = false;
let systemToastTimer = 0;
function showSystemToast(message) {
  systemToast.textContent = message;
  systemToast.classList.add("visible");
  window.clearTimeout(systemToastTimer);
  systemToastTimer = window.setTimeout(() => systemToast.classList.remove("visible"), 2600);
}

function setSystemActive(active) {
  systemActive = Boolean(active);
  document.body.classList.toggle("system-active", systemActive);
  systemToggle.setAttribute("aria-pressed", String(systemActive));
  systemToggle.setAttribute("aria-label", systemActive ? "Desactivar modo Sistema Activo" : "Activar modo Sistema Activo");
  systemToggle.title = systemActive ? "Desactivar modo Sistema Activo" : "Activar modo Sistema Activo";
  systemReadout.textContent = systemActive ? "AM/SYS ACTIVO · TODOS LOS MÓDULOS EN LÍNEA" : "AM/SYS EN ESPERA · PRESIONA EL LOGOTIPO";
  showSystemToast(systemActive ? "AM/SYS // SISTEMA ACTIVO" : "AM/SYS // MODO EN ESPERA");
}

systemToggle.addEventListener("click", () => setSystemActive(!systemActive));

document.querySelectorAll(".button, .theme-toggle, .terminal-toggle, .cursor-toggle, .contact-links a").forEach((element) => {
  element.classList.add("magnetic");
  element.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reduceMotion.matches) return;
    const rect = element.getBoundingClientRect();
    element.style.translate = `${(event.clientX - rect.left - rect.width / 2) * .075}px ${(event.clientY - rect.top - rect.height / 2) * .075}px`;
  });
  element.addEventListener("pointerleave", () => { element.style.translate = "0 0"; });
});

function applyTheme(theme, persist = true) {
  const nextTheme = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  const isLight = nextTheme === "light";
  themeToggle.setAttribute("aria-pressed", String(isLight));
  themeToggle.setAttribute("aria-label", isLight ? "Activar tema oscuro" : "Activar tema claro");
  themeToggle.title = isLight ? "Activar tema oscuro" : "Activar tema claro";
  themeColor.content = isLight ? "#edf6ff" : "#020b1e";
  if (persist) {
    try { localStorage.setItem("am-theme", nextTheme); } catch { /* El tema continúa funcionando sin almacenamiento. */ }
  }
}

applyTheme(document.documentElement.dataset.theme, false);
themeToggle.addEventListener("click", () => {
  applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
});
window.addEventListener("storage", (event) => {
  if (event.key === "am-theme" && (event.newValue === "light" || event.newValue === "dark")) {
    applyTheme(event.newValue, false);
  }
});

const chileTime = new Intl.DateTimeFormat("es-CL", {
  timeZone: "America/Santiago",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const chileDate = new Intl.DateTimeFormat("es-CL", {
  timeZone: "America/Santiago",
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function updateClock() {
  const now = new Date();
  clock.textContent = chileTime.format(now).replace(/^24:/, "00:");
  clock.dateTime = now.toISOString();
  clock.parentElement.title = `${chileDate.format(now)} · Hora de Chile continental`;
}

let activeSectionId = "";
function setActiveSection(id) {
  if (id === activeSectionId) return;
  activeSectionId = id;
  navLinks.forEach((link) => {
    const active = link.hash === `#${id}`;
    link.classList.toggle("active", active);
    if (active) {
      link.setAttribute("aria-current", "page");
      if (nav.scrollWidth > nav.clientWidth) {
        link.scrollIntoView({
          behavior: reduceMotion.matches ? "auto" : "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

let ticking = false;
function updateScrollState() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
  progressFill.style.transform = `scaleX(${ratio})`;
  backTop.classList.toggle("visible", window.scrollY > 700);

  const marker = window.scrollY + Math.min(window.innerHeight * 0.42, 360);
  let current = "inicio";
  sections.forEach((section) => {
    if (section.offsetTop <= marker) current = section.id;
  });
  setActiveSection(current);
  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateScrollState);
    ticking = true;
  }
}, { passive: true });

const revealTargets = document.querySelectorAll(".metrics, .section-grid, .contact");
if (reduceMotion.matches || !("IntersectionObserver" in window)) {
  revealTargets.forEach((element) => element.classList.add("revealed"));
} else {
  revealTargets.forEach((element) => element.classList.add("reveal"));
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -8%" });
  revealTargets.forEach((element) => revealObserver.observe(element));
}

updateClock();
window.setInterval(updateClock, 1000);
updateScrollState();

/* Secuencia de inicialización AM/SYS */
const bootScreen = document.querySelector("#boot-screen");
const bootStatus = document.querySelector("#boot-status");
const bootPending = document.documentElement.classList.contains("boot-pending");
let bootTimers = [];

function completeBoot() {
  document.body.classList.add("interface-ready");
  document.documentElement.classList.remove("boot-pending");
  bootScreen?.classList.add("complete");
  if (bootScreen) {
    bootScreen.style.opacity = "0";
    bootScreen.style.pointerEvents = "none";
    window.setTimeout(() => {
      bootScreen.style.removeProperty("visibility");
      bootScreen.style.removeProperty("opacity");
      bootScreen.style.removeProperty("pointer-events");
    }, 620);
  }
  try { localStorage.setItem("am-v4-premium-boot-seen", "true"); } catch { /* La introducción continúa funcionando sin almacenamiento. */ }
}

function playBootSequence() {
  if (!bootScreen || reduceMotion.matches) {
    completeBoot();
    return;
  }
  bootTimers.forEach((timer) => window.clearTimeout(timer));
  bootTimers = [];
  document.documentElement.classList.add("boot-pending");
  document.body.classList.add("booting");
  document.body.classList.remove("interface-ready");
  bootScreen.classList.remove("complete");
  bootScreen.style.visibility = "visible";
  bootScreen.style.opacity = "1";
  bootScreen.style.pointerEvents = "auto";
  const bootBar = bootScreen.querySelector(".boot-progress span");
  bootBar.style.animation = "none";
  void bootBar.offsetWidth;
  bootBar.style.removeProperty("animation");
  bootStatus.textContent = "Verificando arquitectura...";
  bootTimers.push(window.setTimeout(() => { bootStatus.textContent = "Sincronizando módulos de ingeniería..."; }, 620));
  bootTimers.push(window.setTimeout(() => { bootStatus.textContent = "Activando interfaz holográfica..."; }, 1250));
  bootTimers.push(window.setTimeout(() => {
    bootStatus.textContent = "Sistema listo.";
    completeBoot();
    window.setTimeout(() => document.body.classList.remove("booting"), 650);
  }, 2050));
}

if (bootPending && bootScreen) {
  playBootSequence();
} else {
  window.requestAnimationFrame(() => document.body.classList.add("interface-ready"));
}

/* Proyectos interactivos */
document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reduceMotion.matches) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--project-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--project-y", `${event.clientY - rect.top}px`);
  });
});

/* Constelación tecnológica */
const techMap = document.querySelector("#tech-map");
const techNodes = [...document.querySelectorAll(".tech-node")];
const techEdges = [...document.querySelectorAll(".tech-edges .edge")];
let selectedTechnology = "";

function highlightTechnology(technology = "") {
  techMap?.classList.toggle("exploring", Boolean(technology));
  techNodes.forEach((node) => node.classList.toggle("active", node.dataset.tech === technology));
  techEdges.forEach((edge) => edge.classList.toggle("active", Boolean(technology && edge.classList.contains(technology))));
}

techNodes.forEach((node) => {
  node.addEventListener("pointerenter", () => highlightTechnology(node.dataset.tech));
  node.addEventListener("pointerleave", () => highlightTechnology(selectedTechnology));
  node.addEventListener("focus", () => highlightTechnology(node.dataset.tech));
  node.addEventListener("blur", () => highlightTechnology(selectedTechnology));
  node.addEventListener("click", () => {
    selectedTechnology = selectedTechnology === node.dataset.tech ? "" : node.dataset.tech;
    highlightTechnology(selectedTechnology);
  });
});

/* Terminal personal */
const terminalToggle = document.querySelector("#terminal-toggle");
const terminalModal = document.querySelector("#terminal-modal");
const terminalClose = document.querySelector("#terminal-close");
const terminalOutput = document.querySelector("#terminal-output");
const terminalForm = document.querySelector("#terminal-form");
const terminalInput = document.querySelector("#terminal-input");
let terminalReturnFocus = terminalToggle;

function appendTerminalLine(text, type = "response") {
  const line = document.createElement("p");
  line.className = `terminal-${type}`;
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function openTerminal() {
  terminalReturnFocus = document.activeElement;
  terminalModal.hidden = false;
  document.body.classList.add("terminal-open");
  window.requestAnimationFrame(() => terminalModal.classList.add("visible"));
  window.setTimeout(() => terminalInput.focus(), reduceMotion.matches ? 0 : 220);
}

function closeTerminal() {
  terminalModal.classList.remove("visible");
  document.body.classList.remove("terminal-open");
  const finish = () => {
    terminalModal.hidden = true;
    if (terminalReturnFocus instanceof HTMLElement) terminalReturnFocus.focus();
  };
  if (reduceMotion.matches) finish();
  else window.setTimeout(finish, 220);
}

function executeTerminalCommand(rawCommand) {
  const command = rawCommand.trim().toLocaleLowerCase("es");
  if (!command) return;
  appendTerminalLine(`alejandro@am-sys:~$ ${command}`, "command");

  const responses = {
    ayuda: "Comandos disponibles: perfil, proyectos, stack, contacto, anita, sistema, cursor, hora, limpiar.",
    perfil: "Alejandro Mayró Lena // Ingeniería informática, ciberseguridad e Ingeniería Civil Informática en curso.",
    proyectos: "03 sistemas destacados: LinkShield AI, Fake News System y Cybernetic FoodPlease.",
    stack: "Python · Dart · Flutter · Laravel · Flask · C++ · PostgreSQL · Machine Learning · LLM · RAG.",
    contacto: "GitHub: @AlejandroDart // LinkedIn: linkedin.com/in/amavr6",
    hora: `Hora de Chile: ${clock.textContent}`,
  };

  if (command === "limpiar" || command === "clear") {
    terminalOutput.replaceChildren();
    appendTerminalLine("Consola limpia. AM/SYS continúa conectado.", "system");
  } else if (command === "sistema") {
    setSystemActive(!systemActive);
    appendTerminalLine(systemActive ? "Modo Sistema Activo habilitado." : "Modo Sistema Activo deshabilitado.", "success");
  } else if (command === "cursor") {
    applyCursorState(!cursorEnabled);
    appendTerminalLine(cursorEnabled ? "Cursor tecnológico habilitado." : "Cursor tecnológico deshabilitado.", "success");
  } else if (command === "anita") {
    appendTerminalLine("Abriendo protocolo romántico para Anita Cárdenas González...", "success");
    const loveTrigger = document.querySelector(".secret-love-trigger");
    if (loveTrigger) {
      window.setTimeout(() => { closeTerminal(); window.setTimeout(() => loveTrigger.click(), 250); }, 380);
    } else {
      appendTerminalLine("El módulo romántico todavía se está cargando. Inténtalo nuevamente.", "error");
    }
  } else if (responses[command]) {
    appendTerminalLine(responses[command]);
  } else {
    appendTerminalLine(`Comando no reconocido: ${command}. Escribe ayuda.`, "error");
  }
}

terminalToggle.addEventListener("click", openTerminal);
terminalClose.addEventListener("click", closeTerminal);
terminalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  executeTerminalCommand(terminalInput.value);
  terminalInput.value = "";
});
document.querySelectorAll(".terminal-quick [data-command]").forEach((button) => {
  button.addEventListener("click", () => {
    executeTerminalCommand(button.dataset.command);
    terminalInput.focus();
  });
});
terminalModal.addEventListener("click", (event) => {
  if (event.target === terminalModal) closeTerminal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "`" && terminalModal.hidden && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    openTerminal();
  } else if (!terminalModal.hidden && event.key === "Escape") {
    closeTerminal();
  }
});

/* Cyber Catch // CL */
const gameTrigger = document.querySelector("#game-trigger");
const gameOverlay = document.querySelector("#game-overlay");
const gameClose = document.querySelector("#game-close");
const gameRestart = document.querySelector("#game-restart");
const gameField = document.querySelector("#game-field");
const gameResult = document.querySelector("#game-result");
const gameCaught = document.querySelector("#game-caught");
const gameMissed = document.querySelector("#game-missed");
const gameRemaining = document.querySelector("#game-remaining");
const gameScore = document.querySelector("#game-score");
const gameProgress = document.querySelector("#game-progress-fill");
const gameFinalScore = document.querySelector("#game-final-score");
const gameFinalDetail = document.querySelector("#game-final-detail");
const gameStatus = document.querySelector("#game-status");

function resetIdentityCard() {
  gameTrigger.style.setProperty("--card-rx", "0deg");
  gameTrigger.style.setProperty("--card-ry", "0deg");
  gameTrigger.style.setProperty("--card-shine-x", "50%");
  gameTrigger.style.setProperty("--card-shine-y", "35%");
}

gameTrigger.addEventListener("pointermove", (event) => {
  if (!finePointer.matches || reduceMotion.matches) return;
  const rect = gameTrigger.getBoundingClientRect();
  const normalizedX = (event.clientX - rect.left) / rect.width - .5;
  const normalizedY = (event.clientY - rect.top) / rect.height - .5;
  gameTrigger.style.setProperty("--card-rx", `${(-normalizedY * 5.5).toFixed(2)}deg`);
  gameTrigger.style.setProperty("--card-ry", `${(normalizedX * 7).toFixed(2)}deg`);
  gameTrigger.style.setProperty("--card-shine-x", `${((normalizedX + .5) * 100).toFixed(1)}%`);
  gameTrigger.style.setProperty("--card-shine-y", `${((normalizedY + .5) * 100).toFixed(1)}%`);
});
gameTrigger.addEventListener("pointerleave", resetIdentityCard);
resetIdentityCard();

const GAME_TOTAL = 24;
const gameTargets = [
  ["💻", "computador"], ["🎮", "control de juego"], ["🤖", "robot"],
  ["🛡️", "escudo"], ["🔐", "seguridad"], ["🧠", "inteligencia artificial"],
  ["⚙️", "engranaje"], ["📡", "antena"], ["🕹️", "joystick"],
];

let gameSession = 0;
let gameActive = false;
let launchTimer = 0;
let launched = 0;
let caught = 0;
let missed = 0;
let score = 0;
let combo = 0;
let previousFocus = null;
const activeOrbs = new Set();

function counter(value, size = 2) {
  return String(value).padStart(size, "0");
}

function updateGameHud() {
  const resolved = caught + missed;
  gameCaught.textContent = counter(caught);
  gameMissed.textContent = counter(missed);
  gameRemaining.textContent = counter(GAME_TOTAL - resolved);
  gameScore.textContent = counter(score, 4);
  gameProgress.style.transform = `scaleX(${resolved / GAME_TOTAL})`;
}

function clearGameObjects() {
  window.clearTimeout(launchTimer);
  activeOrbs.forEach((orb) => {
    window.clearTimeout(orb.missTimer);
    if (orb.fallAnimation) orb.fallAnimation.cancel();
    orb.remove();
  });
  activeOrbs.clear();
}

function finishGame(session) {
  if (session !== gameSession) return;
  gameActive = false;
  const accuracy = Math.round((caught / GAME_TOTAL) * 100);
  gameFinalScore.textContent = `${counter(score, 4)} PTS`;
  gameFinalDetail.textContent = `${caught} de ${GAME_TOTAL} objetivos atrapados · ${accuracy}% de precisión`;
  gameResult.hidden = false;
  gameStatus.textContent = `Juego terminado. Puntuación ${score}. Precisión ${accuracy} por ciento.`;
  gameRestart.focus();
}

function resolveOrb(orb, wasCaught, session) {
  if (session !== gameSession || orb.dataset.resolved === "true") return;
  orb.dataset.resolved = "true";
  activeOrbs.delete(orb);
  window.clearTimeout(orb.missTimer);
  if (orb.fallAnimation) orb.fallAnimation.cancel();

  if (wasCaught) {
    caught += 1;
    combo += 1;
    score += 100 + Math.min(combo - 1, 10) * 10;
    orb.classList.add("caught");
    gameStatus.textContent = `Objetivo atrapado. ${caught} de ${GAME_TOTAL}.`;
    window.setTimeout(() => orb.remove(), 300);
  } else {
    missed += 1;
    combo = 0;
    orb.remove();
  }

  updateGameHud();
  if (launched === GAME_TOTAL && caught + missed === GAME_TOTAL) {
    window.setTimeout(() => finishGame(session), 450);
  }
}

function launchOrb(session) {
  if (!gameActive || session !== gameSession || launched >= GAME_TOTAL) return;
  const [symbol, name] = gameTargets[Math.floor(Math.random() * gameTargets.length)];
  const orb = document.createElement("button");
  orb.type = "button";
  orb.className = "game-orb";
  orb.textContent = symbol;
  orb.setAttribute("aria-label", `Atrapar ${name}`);
  orb.dataset.resolved = "false";

  const orbSize = window.innerWidth <= 680 ? 68 : 82;
  const safeWidth = Math.max(gameField.clientWidth - orbSize - 14, 1);
  orb.style.left = `${7 + Math.random() * safeWidth}px`;
  gameField.appendChild(orb);
  activeOrbs.add(orb);
  launched += 1;

  orb.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    resolveOrb(orb, true, session);
  }, { once: true });
  orb.addEventListener("click", () => resolveOrb(orb, true, session), { once: true });

  if (reduceMotion.matches) {
    const safeHeight = Math.max(gameField.clientHeight - orbSize - 80, 60);
    orb.style.top = `${55 + Math.random() * safeHeight}px`;
    orb.missTimer = window.setTimeout(() => resolveOrb(orb, false, session), 2600);
  } else {
    const distance = gameField.clientHeight + orbSize + 90;
    const duration = 5600 + Math.random() * 1900;
    orb.fallAnimation = orb.animate([
      { transform:"translate3d(0,-12px,0) rotate(0deg)", opacity:.15 },
      { transform:"translate3d(0,20px,0) rotate(20deg)", opacity:.82, offset:.10 },
      { transform:`translate3d(0,${distance}px,0) rotate(${150 + Math.random() * 180}deg)`, opacity:.18 },
    ], { duration, easing:"linear", fill:"forwards" });
    orb.fallAnimation.onfinish = () => resolveOrb(orb, false, session);
    orb.addEventListener("pointerenter", () => {
      if (orb.fallAnimation && orb.dataset.resolved !== "true") orb.fallAnimation.playbackRate = .55;
    });
    orb.addEventListener("pointerleave", () => {
      if (orb.fallAnimation && orb.dataset.resolved !== "true") orb.fallAnimation.playbackRate = 1;
    });
  }

  if (launched < GAME_TOTAL) {
    launchTimer = window.setTimeout(() => launchOrb(session), 540 + Math.random() * 260);
  }
}

function startGame() {
  const openingFromPortfolio = gameOverlay.hidden;
  gameSession += 1;
  const session = gameSession;
  clearGameObjects();
  launched = 0;
  caught = 0;
  missed = 0;
  score = 0;
  combo = 0;
  gameActive = true;
  if (openingFromPortfolio) previousFocus = document.activeElement;
  gameResult.hidden = true;
  gameOverlay.hidden = false;
  document.body.classList.add("game-open");
  updateGameHud();
  gameStatus.textContent = reduceMotion.matches
    ? "Cyber Catch iniciado en modo de movimiento reducido."
    : "Cyber Catch iniciado. Atrapa las esferas que están cayendo.";
  gameClose.focus();
  window.setTimeout(() => launchOrb(session), 350);
}

function closeGame() {
  gameSession += 1;
  gameActive = false;
  clearGameObjects();
  gameOverlay.hidden = true;
  gameResult.hidden = true;
  document.body.classList.remove("game-open");
  gameStatus.textContent = "Juego cerrado.";
  if (previousFocus instanceof HTMLElement) previousFocus.focus();
}

gameTrigger.addEventListener("click", startGame);
gameTrigger.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    startGame();
  }
});
gameClose.addEventListener("click", closeGame);
gameRestart.addEventListener("click", startGame);
document.addEventListener("keydown", (event) => {
  if (gameOverlay.hidden) return;
  if (event.key === "Escape") {
    closeGame();
    return;
  }
  if (event.key === "Tab") {
    const focusable = [...gameOverlay.querySelectorAll('button:not([disabled])')]
      .filter((element) => element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && !gameOverlay.hidden) closeGame();
});

/* Sorpresa romántica pública, visible desde el pie de página. */
async function initLoveSurprise() {
  try {
    const response = await fetch("private-assets/surprise.json", { cache:"no-store" });
    if (!response.ok) return;
    const surprise = await response.json();
    const slot = document.querySelector("#local-surprise-slot");
    if (!slot) return;

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "secret-love-trigger";
    trigger.textContent = `💙 ${surprise.name}`;
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-label", `Abrir sorpresa para ${surprise.name}`);
    slot.appendChild(trigger);

    const modal = document.createElement("div");
    modal.className = "love-modal";
    modal.hidden = true;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "love-title");

    const card = document.createElement("section");
    card.className = "love-card";

    const close = document.createElement("button");
    close.type = "button";
    close.className = "love-close";
    close.setAttribute("aria-label", "Cerrar sorpresa");
    close.textContent = "×";

    const photoWrap = document.createElement("div");
    photoWrap.className = "love-photo";
    const photo = document.createElement("img");
    photo.src = surprise.image;
    photo.alt = `Fotografía de ${surprise.name}`;
    photoWrap.appendChild(photo);

    const copy = document.createElement("div");
    copy.className = "love-copy";
    const kicker = document.createElement("p");
    kicker.className = "love-kicker";
    kicker.textContent = surprise.kicker;
    const title = document.createElement("h2");
    title.id = "love-title";
    title.textContent = surprise.title;
    const message = document.createElement("p");
    message.className = "love-message";
    message.textContent = surprise.message;
    const caption = document.createElement("span");
    caption.className = "love-caption";
    caption.textContent = surprise.caption;
    const proposalButton = document.createElement("button");
    proposalButton.type = "button";
    proposalButton.className = "proposal-open";
    proposalButton.textContent = "Ver propuesta";
    proposalButton.setAttribute("aria-controls", "love-proposal");
    copy.append(kicker, title, message, caption, proposalButton);

    const proposal = document.createElement("div");
    proposal.id = "love-proposal";
    proposal.className = "love-proposal";
    proposal.hidden = true;

    const proposalBack = document.createElement("button");
    proposalBack.type = "button";
    proposalBack.className = "proposal-back";
    proposalBack.textContent = "← Volver";

    const proposalQuestion = document.createElement("div");
    proposalQuestion.className = "proposal-question";
    const proposalKicker = document.createElement("p");
    proposalKicker.className = "love-kicker";
    proposalKicker.textContent = "// PROTOCOLO ROMÁNTICO INICIADO";
    const ring = document.createElement("span");
    ring.className = "proposal-ring";
    ring.textContent = "💍";
    ring.setAttribute("aria-hidden", "true");
    const proposalTitle = document.createElement("h3");
    proposalTitle.textContent = "Anita, ¿quieres casarte conmigo?";
    const proposalText = document.createElement("p");
    proposalText.textContent = "El sistema ha encontrado una coincidencia del 100 %. Selecciona tu respuesta.";

    const proposalArena = document.createElement("div");
    proposalArena.className = "proposal-arena";
    const yesButton = document.createElement("button");
    yesButton.type = "button";
    yesButton.className = "proposal-answer proposal-yes";
    yesButton.textContent = "Sí, acepto 💙";
    const noButton = document.createElement("button");
    noButton.type = "button";
    noButton.className = "proposal-answer proposal-no";
    noButton.textContent = "No";
    noButton.tabIndex = -1;
    noButton.setAttribute("aria-label", "No (este botón es parte de la broma y se escapa)");
    proposalArena.append(yesButton, noButton);

    const proposalHint = document.createElement("span");
    proposalHint.className = "proposal-hint";
    proposalHint.textContent = "Pista: hay respuestas que el sistema simplemente no admite 😄";
    proposalQuestion.append(proposalKicker, ring, proposalTitle, proposalText, proposalArena, proposalHint);

    const proposalResult = document.createElement("div");
    proposalResult.className = "proposal-result";
    proposalResult.hidden = true;
    const resultIcon = document.createElement("span");
    resultIcon.className = "proposal-result-icon";
    resultIcon.textContent = "💙";
    const resultTitle = document.createElement("h3");
    resultTitle.textContent = "¡Respuesta registrada!";
    const resultText = document.createElement("p");
    resultText.textContent = "Contrato afectivo aceptado. Vigencia: para siempre. ✨";
    const resultAgain = document.createElement("button");
    resultAgain.type = "button";
    resultAgain.className = "proposal-again";
    resultAgain.textContent = "Repetir la propuesta";
    proposalResult.append(resultIcon, resultTitle, resultText, resultAgain);
    proposal.append(proposalBack, proposalQuestion, proposalResult);

    ["♡", "♡", "♡"].forEach((symbol, index) => {
      const heart = document.createElement("span");
      heart.className = `love-heart heart-${index + 1}`;
      heart.textContent = symbol;
      heart.setAttribute("aria-hidden", "true");
      card.appendChild(heart);
    });
    card.append(close, photoWrap, copy, proposal);
    modal.appendChild(card);
    document.body.appendChild(modal);

    let returnFocus = trigger;
    function openLoveModal() {
      returnFocus = document.activeElement;
      modal.hidden = false;
      document.body.classList.add("love-open");
      requestAnimationFrame(() => modal.classList.add("visible"));
      close.focus();
    }
    function closeLoveModal() {
      modal.classList.remove("visible");
      document.body.classList.remove("love-open");
      const finish = () => {
        modal.hidden = true;
        if (returnFocus instanceof HTMLElement) returnFocus.focus();
      };
      if (reduceMotion.matches) finish();
      else window.setTimeout(finish, 240);
    }

    function resetProposal() {
      proposalResult.hidden = true;
      proposalQuestion.hidden = false;
      noButton.style.removeProperty("left");
      noButton.style.removeProperty("top");
      noButton.style.removeProperty("transform");
    }

    function openProposal() {
      resetProposal();
      proposal.hidden = false;
      card.classList.add("proposal-active");
      requestAnimationFrame(() => {
        proposal.classList.add("visible");
        yesButton.focus();
      });
    }

    function closeProposal() {
      proposal.classList.remove("visible");
      card.classList.remove("proposal-active");
      const finish = () => {
        proposal.hidden = true;
        resetProposal();
        proposalButton.focus();
      };
      if (reduceMotion.matches) finish();
      else window.setTimeout(finish, 220);
    }

    function moveNoButton(pointerX, pointerY) {
      const arenaRect = proposalArena.getBoundingClientRect();
      const buttonRect = noButton.getBoundingClientRect();
      const yesRect = yesButton.getBoundingClientRect();
      const maxX = Math.max(8, arenaRect.width - buttonRect.width - 8);
      const maxY = Math.max(8, arenaRect.height - buttonRect.height - 8);
      let nextX = 8;
      let nextY = 8;

      for (let attempt = 0; attempt < 32; attempt += 1) {
        const candidateX = 8 + Math.random() * Math.max(1, maxX - 8);
        const candidateY = 8 + Math.random() * Math.max(1, maxY - 8);
        const centerX = arenaRect.left + candidateX + buttonRect.width / 2;
        const centerY = arenaRect.top + candidateY + buttonRect.height / 2;
        const candidateLeft = arenaRect.left + candidateX;
        const candidateTop = arenaRect.top + candidateY;
        const candidateRight = candidateLeft + buttonRect.width;
        const candidateBottom = candidateTop + buttonRect.height;
        const overlapsYes = !(
          candidateRight < yesRect.left - 12 ||
          candidateLeft > yesRect.right + 12 ||
          candidateBottom < yesRect.top - 12 ||
          candidateTop > yesRect.bottom + 12
        );
        if (!overlapsYes && Math.hypot(centerX - pointerX, centerY - pointerY) > 120) {
          nextX = candidateX;
          nextY = candidateY;
          break;
        }
      }

      noButton.style.left = `${nextX}px`;
      noButton.style.top = `${nextY}px`;
      noButton.style.transform = "none";
    }

    function celebrateProposal() {
      proposalQuestion.hidden = true;
      proposalResult.hidden = false;
      for (let index = 0; index < 30; index += 1) {
        const particle = document.createElement("span");
        particle.className = "proposal-confetti";
        particle.textContent = index % 3 === 0 ? "💙" : index % 3 === 1 ? "✨" : "♡";
        particle.style.setProperty("--x", `${Math.random() * 100}%`);
        particle.style.setProperty("--delay", `${Math.random() * .55}s`);
        particle.style.setProperty("--drift", `${(Math.random() - .5) * 180}px`);
        proposal.appendChild(particle);
        window.setTimeout(() => particle.remove(), 3400);
      }
      resultAgain.focus();
    }

    trigger.addEventListener("click", openLoveModal);
    close.addEventListener("click", closeLoveModal);
    proposalButton.addEventListener("click", openProposal);
    proposalBack.addEventListener("click", closeProposal);
    yesButton.addEventListener("click", celebrateProposal);
    resultAgain.addEventListener("click", () => {
      resetProposal();
      yesButton.focus();
    });
    proposalArena.addEventListener("pointermove", (event) => {
      const rect = noButton.getBoundingClientRect();
      const distance = Math.hypot(event.clientX - (rect.left + rect.width / 2), event.clientY - (rect.top + rect.height / 2));
      if (distance < 120) moveNoButton(event.clientX, event.clientY);
    });
    ["pointerenter", "pointerdown", "click"].forEach((eventName) => {
      noButton.addEventListener(eventName, (event) => {
        event.preventDefault();
        moveNoButton(event.clientX || 0, event.clientY || 0);
      });
    });
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeLoveModal();
    });
    document.addEventListener("keydown", (event) => {
      if (modal.hidden) return;
      if (event.key === "Escape") {
        if (!proposal.hidden) closeProposal();
        else closeLoveModal();
      }
      if (event.key === "Tab") {
        const focusable = [...modal.querySelectorAll('button:not([hidden]):not([tabindex="-1"])')]
          .filter((element) => element.offsetParent !== null);
        if (!focusable.length) return;
        const currentIndex = focusable.indexOf(document.activeElement);
        const direction = event.shiftKey ? -1 : 1;
        const nextIndex = (currentIndex + direction + focusable.length) % focusable.length;
        event.preventDefault();
        focusable[nextIndex].focus();
      }
    });
  } catch {
    /* Si el recurso no está disponible, el resto del portafolio continúa funcionando. */
  }
}

initLoveSurprise();
