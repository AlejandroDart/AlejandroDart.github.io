const progressFill = document.querySelector("#scroll-progress-fill");
const backTop = document.querySelector(".back-top");
const topbar = document.querySelector(".topbar");
const nav = document.querySelector(".topbar nav");
const navLinks = [...document.querySelectorAll('.topbar nav a[href^="#"]')];
const mobileMenuToggle = document.querySelector("#mobile-menu-toggle");
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
const resourceConstrained = Boolean(
  navigator.connection?.saveData
  || (navigator.deviceMemory && navigator.deviceMemory <= 4)
  || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
);
let loveSurpriseVisible = false;

function setMobileMenu(open) {
  const nextState = Boolean(open && window.matchMedia("(max-width: 560px)").matches);
  topbar.classList.toggle("menu-open", nextState);
  mobileMenuToggle.setAttribute("aria-expanded", String(nextState));
  mobileMenuToggle.setAttribute("aria-label", nextState ? "Cerrar menú de navegación" : "Abrir menú de navegación");
}

mobileMenuToggle.addEventListener("click", () => {
  setMobileMenu(mobileMenuToggle.getAttribute("aria-expanded") !== "true");
});

navLinks.forEach((link) => link.addEventListener("click", () => setMobileMenu(false)));
document.addEventListener("click", (event) => {
  if (topbar.classList.contains("menu-open") && !topbar.contains(event.target)) setMobileMenu(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMobileMenu(false);
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 560) setMobileMenu(false);
}, { passive:true });

function buildDataRain() {
  if (!dataRain) return;
  dataRain.replaceChildren();
  if (reduceMotion.matches) return;

  const glyphs = ["01", "{ }", "AI", "∑", "λ", "</>", "π", "∞", "SQL", "RAG", "C++", "◈", "∫", "ML", "{}", "⚙"];
  const fragment = document.createDocumentFragment();

  const dropCount = resourceConstrained ? 10 : 14;
  for (let index = 0; index < dropCount; index += 1) {
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
  window.setTimeout(() => spark.remove(), 380);
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
  if (!resourceConstrained && cursorEnabled && event.timeStamp - lastCursorSpark > 110) {
    lastCursorSpark = event.timeStamp;
    createCursorSpark(event.clientX, event.clientY);
  }
}, { passive:true });

document.documentElement.addEventListener("mouseleave", () => {
  if (!reduceMotion.matches) setAmbientPosition();
  document.body.classList.remove("pointer-active");
  techCursor?.classList.remove("visible");
});

function handleReducedMotionChange(event) {
  if (event.matches) setAmbientPosition();
  buildDataRain();
  applyCursorState(cursorEnabled, false);
}

if (typeof reduceMotion.addEventListener === "function") {
  reduceMotion.addEventListener("change", handleReducedMotionChange);
} else {
  reduceMotion.addListener?.(handleReducedMotionChange);
}

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
  if (systemActive) awardAchievement("system");
}

systemToggle.addEventListener("click", () => setSystemActive(!systemActive));

const supportsIndividualTransforms = window.CSS?.supports?.("translate", "1px") ?? false;
document.querySelectorAll(".button, .theme-toggle, .terminal-toggle, .command-toggle, .achievement-toggle, .cursor-toggle, .contact-links a").forEach((element) => {
  element.classList.add("magnetic");
  if (!supportsIndividualTransforms) return;
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
        nav.scrollTo({
          left: link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2,
          behavior: reduceMotion.matches ? "auto" : "smooth",
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
  revealTargets.forEach((element) => {
    if (element.matches(".metrics")) element.classList.add("revealed");
    else revealObserver.observe(element);
  });
}

/* Mantiene en ejecución solo las animaciones complejas que están a la vista. */
const performanceZones = [...document.querySelectorAll(".project-card, .tech-map, .chile-network")];
if (reduceMotion.matches || !("IntersectionObserver" in window)) {
  performanceZones.forEach((zone) => zone.classList.add("motion-active"));
} else {
  const motionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle("motion-active", entry.isIntersecting));
  }, { rootMargin:"180px 0px", threshold:0 });
  performanceZones.forEach((zone) => motionObserver.observe(zone));
}

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
  try { localStorage.setItem("am-v5-release-boot-seen", "true"); } catch { /* La introducción continúa funcionando sin almacenamiento. */ }
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
  node.setAttribute("aria-pressed", "false");
  node.addEventListener("pointerenter", () => highlightTechnology(node.dataset.tech));
  node.addEventListener("pointerleave", () => highlightTechnology(selectedTechnology));
  node.addEventListener("focus", () => highlightTechnology(node.dataset.tech));
  node.addEventListener("blur", () => highlightTechnology(selectedTechnology));
  node.addEventListener("click", () => {
    selectedTechnology = selectedTechnology === node.dataset.tech ? "" : node.dataset.tech;
    techNodes.forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.tech === selectedTechnology)));
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
  terminalToggle.setAttribute("aria-expanded", "true");
  document.body.classList.add("terminal-open");
  awardAchievement("terminal");
  window.requestAnimationFrame(() => terminalModal.classList.add("visible"));
  window.setTimeout(() => terminalInput.focus(), reduceMotion.matches ? 0 : 220);
}

function closeTerminal() {
  terminalModal.classList.remove("visible");
  terminalToggle.setAttribute("aria-expanded", "false");
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
    ayuda: `Comandos disponibles: perfil, proyectos, stack, laboratorio, insignias, contacto${loveSurpriseVisible ? ", anita" : ""}, sistema, cursor, limpiar.`,
    perfil: "Alejandro Mayró Lena // Ingeniería informática, ciberseguridad e Ingeniería Civil Informática en curso.",
    proyectos: "03 sistemas destacados: LinkShield AI, Fake News System y Cybernetic FoodPlease.",
    stack: "Python · Dart · Flutter · Laravel · Flask · C++ · PostgreSQL · Machine Learning · LLM · RAG.",
    contacto: "GitHub: @AlejandroDart // LinkedIn: linkedin.com/in/amayró/",
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
  } else if (command === "laboratorio" || command === "lab") {
    appendTerminalLine("Abriendo laboratorio interactivo de proyectos...", "success");
    window.setTimeout(() => { closeTerminal(); window.setTimeout(() => openProjectLab("phishing"), 250); }, 300);
  } else if (command === "insignias" || command === "logros") {
    appendTerminalLine("Cargando progreso de insignias AM/SYS...", "success");
    window.setTimeout(() => { closeTerminal(); window.setTimeout(openAchievements, 250); }, 300);
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
  awardAchievement("game");
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
  gameTrigger.setAttribute("aria-expanded", "true");
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
  gameTrigger.setAttribute("aria-expanded", "false");
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
  document.body.classList.toggle("page-idle", document.hidden);
  if (document.hidden && !gameOverlay.hidden) closeGame();
  syncTelemetryTimer();
});

/* Sorpresa romántica controlada desde private-assets/surprise.json. */
function applyLoveSurpriseVisibility(visible) {
  loveSurpriseVisible = Boolean(visible);
  document.body.classList.toggle("love-surprise-hidden", !loveSurpriseVisible);
  document.querySelectorAll("[data-love-entry]").forEach((entry) => { entry.hidden = !loveSurpriseVisible; });

  const slot = document.querySelector("#local-surprise-slot");
  if (slot) slot.hidden = !loveSurpriseVisible;

  const commandInput = document.querySelector("#command-input");
  if (commandInput) commandInput.placeholder = loveSurpriseVisible
    ? "Escribe proyectos, formación, jugar, Anita..."
    : "Escribe proyectos, formación o jugar...";

  const terminalHelp = document.querySelector("#terminal-help");
  if (terminalHelp) terminalHelp.textContent = loveSurpriseVisible
    ? "Comandos: ayuda · perfil · proyectos · stack · laboratorio · insignias · contacto · anita · sistema · cursor · limpiar"
    : "Comandos: ayuda · perfil · proyectos · stack · laboratorio · insignias · contacto · sistema · cursor · limpiar";

  if (typeof renderAchievements === "function") renderAchievements();
}

async function initLoveSurprise() {
  try {
    const response = await fetch("private-assets/surprise.json", { cache:"no-store" });
    if (!response.ok) return;
    const surprise = await response.json();
    applyLoveSurpriseVisibility(surprise.visible === true);
    const slot = document.querySelector("#local-surprise-slot");
    if (!slot) return;

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "secret-love-trigger";
    trigger.dataset.loveEntry = "";
    trigger.hidden = !loveSurpriseVisible;
    trigger.textContent = `💙 ${surprise.name}`;
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", `Abrir sorpresa para ${surprise.name}`);
    slot.appendChild(trigger);
    slot.hidden = !loveSurpriseVisible;

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
    proposalButton.setAttribute("aria-expanded", "false");
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
      trigger.setAttribute("aria-expanded", "true");
      document.body.classList.add("love-open");
      awardAchievement("anita");
      requestAnimationFrame(() => modal.classList.add("visible"));
      close.focus();
    }
    function closeLoveModal() {
      modal.classList.remove("visible");
      trigger.setAttribute("aria-expanded", "false");
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
      proposalButton.setAttribute("aria-expanded", "true");
      card.classList.add("proposal-active");
      requestAnimationFrame(() => {
        proposal.classList.add("visible");
        yesButton.focus();
      });
    }

    function closeProposal() {
      proposal.classList.remove("visible");
      proposalButton.setAttribute("aria-expanded", "false");
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

/* V5 · Telemetría profesional */
const telemetryUptime = document.querySelector("#telemetry-uptime");
const telemetryStartedAt = Date.now();
let telemetryTimer = 0;
function updateTelemetry() {
  if (!telemetryUptime) return;
  const elapsed = Math.floor((Date.now() - telemetryStartedAt) / 1000);
  const hours = String(Math.floor(elapsed / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  telemetryUptime.textContent = `UPTIME ${hours}:${minutes}:${seconds}`;
}

function syncTelemetryTimer() {
  window.clearInterval(telemetryTimer);
  telemetryTimer = 0;
  updateTelemetry();
  if (!document.hidden && telemetryUptime) {
    telemetryTimer = window.setInterval(updateTelemetry, 1000);
  }
}

syncTelemetryTimer();

/* V5 · Credenciales expandibles */
const credentialData = {
  "Data Classification and Summarization Using IBM Granite": { issuer:"IBM", date:"Agosto 2026", grade:"Credencial aprobada", id:"977b4138-4487-408b-b908-794009f2814b", skills:["IBM Granite","Clasificación de datos","Resumen"] },
  "Generative AI Essentials: Using LLMs to Work with Data": { issuer:"IBM", date:"Agosto 2026", grade:"Credencial aprobada", id:"922c0450-6297-4576-9509-dce32bc92132", skills:["IA generativa","LLM","Datos"] },
  "Code Generation and Optimization Using IBM Granite": { issuer:"IBM", date:"Agosto 2026", grade:"Credencial aprobada", id:"977b4138-4487-408b-b908-794009f2814b", skills:["Generación de código","Optimización","IBM Granite"] },
  "Generative AI in Action": { issuer:"IBM", date:"Agosto 2026", grade:"Credencial aprobada", id:"60b25ac2-c2ac-4298-9809-69520b180d07", skills:["IA generativa","Aplicaciones de IA","Automatización"] },
  "Artificial Intelligence Fundamentals": { issuer:"IBM", date:"Agosto 2026", grade:"Credencial aprobada", id:"1178d66d-d5e1-4be6-affa-538e19213878", skills:["Inteligencia artificial","Fundamentos","Ética de IA"] },
  "Getting Started with Artificial Intelligence": { issuer:"IBM", date:"Junio 2026", grade:"Credencial aprobada", id:"68615dfb-a8d4-4682-8527-ffb1db8fca6a", skills:["Inteligencia artificial","Casos de uso","Tecnología"] },
  "Fundamentals of Sustainability and Technology": { issuer:"IBM", date:"Agosto 2026", grade:"Credencial aprobada", id:"13538015-3019-46ea-9de2-a4cb100c538e", skills:["Sostenibilidad","Tecnología","Innovación"] },
  "Working in a Digital World: Professional Skills": { issuer:"IBM", date:"Julio 2026", grade:"Credencial aprobada", id:"b0739bd4-a936-4efb-b7b0-2922b8af21fe", skills:["Competencias digitales","Colaboración","Comunicación"] },
  "Agile Explorer": { issuer:"IBM", date:"Julio 2026", grade:"Credencial aprobada", id:"c5281e19-9bb4-4d85-89c9-2c75b084fec8", skills:["Agilidad","Scrum","Trabajo iterativo"] },
  "Career Management Essentials": { issuer:"IBM", date:"Junio 2026", grade:"Credencial aprobada", id:"35fbe21d-a6ca-49f4-9c73-118ced828f5e", skills:["Gestión de carrera","Objetivos","Desarrollo profesional"] },
  "Digital Mindset": { issuer:"IBM", date:"Junio 2026", grade:"Credencial aprobada", id:"b854a06e-d724-40b5-8296-e13b68deafca", skills:["Mentalidad digital","Creatividad","Adaptación"] },
  "Explore Emerging Tech": { issuer:"IBM", date:"Junio 2026", grade:"Credencial aprobada", id:"4d5718bf-a41b-429e-a915-76d5d26cdee8", skills:["Tecnologías emergentes","Computación cuántica","Innovación"] },
  "Técnicas de Machine Learning": { issuer:"Universidad Adolfo Ibáñez", date:"Octubre—diciembre 2025", grade:"Nota 6.9", id:"Sin ID público", skills:["Machine Learning","R","Aprendizaje no supervisado"] },
  "Diplomado en Ciberseguridad: Critical Infrastructure Protection": { issuer:"Universidad del Desarrollo", date:"Marzo—junio 2025", grade:"Nota 7.0", id:"Sin ID público", skills:["Infraestructura crítica","Riesgo cibernético","Ciberseguridad"] },
  "Fundamentos en Seguridad en Redes V.5": { issuer:"Capacitación USACH", date:"Febrero 2025", grade:"Credencial aprobada", id:"cebf628d-e601-4c05-a680-016584497e9a", skills:["Seguridad de redes","Fundamentos","Protección"] },
  "IBM Artificial Intelligence Practitioner Certificate": { issuer:"IBM", date:"Junio 2024", grade:"Certificado profesional", id:"913531df-5e04-4a47-9a23-564ac28300d8", skills:["Inteligencia artificial","Machine Learning","Aplicaciones"] },
  "Digital Transformation Management": { issuer:"Arizona State University", date:"Junio 2024", grade:"Credencial aprobada", id:"Sin ID público", skills:["Transformación digital","Gestión","Tecnologías disruptivas"] },
  "Arduino Certification": { issuer:"Arduino", date:"Noviembre 2021", grade:"Credencial aprobada", id:"5947531b-d342-4395-a4d6-2bdf9c904ad5", skills:["Arduino","Electrónica","Prototipado"] },
  "Certificación de Inglés — Upper Waystage": { issuer:"Wall Street English", date:"Febrero 2018", grade:"Nivel WSE 7", id:"Sin ID público", skills:["Inglés","Comunicación","Comprensión"] },
};

function appendCredentialMeta(container, label, value) {
  const item = document.createElement("span");
  item.textContent = label;
  const strong = document.createElement("strong");
  strong.textContent = value;
  item.appendChild(strong);
  container.appendChild(item);
}

document.querySelectorAll(".cert-year li").forEach((item, index) => {
  const rawTitle = item.textContent.trim();
  const cleanTitle = rawTitle.replace(/ · Nota [\d.]+$/, "");
  const info = credentialData[cleanTitle] || { issuer:"Entidad certificadora", date:"Fecha publicada en el perfil", grade:"Credencial completada", id:"Sin ID público", skills:["Aprendizaje continuo"] };
  const detailId = `credential-detail-${index + 1}`;
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "credential-toggle";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", detailId);
  const title = document.createElement("span");
  title.textContent = rawTitle;
  const icon = document.createElement("span");
  icon.textContent = "+";
  icon.setAttribute("aria-hidden", "true");
  toggle.append(title, icon);

  const detail = document.createElement("div");
  detail.className = "credential-detail";
  detail.id = detailId;
  detail.hidden = true;
  const meta = document.createElement("div");
  meta.className = "credential-meta";
  appendCredentialMeta(meta, "INSTITUCIÓN", info.issuer);
  appendCredentialMeta(meta, "FECHA", info.date);
  appendCredentialMeta(meta, "RESULTADO", info.grade);
  appendCredentialMeta(meta, "ID CREDENCIAL", info.id);
  const skills = document.createElement("div");
  skills.className = "credential-skills";
  info.skills.forEach((skill) => {
    const badge = document.createElement("b");
    badge.textContent = skill;
    skills.appendChild(badge);
  });
  detail.append(meta, skills);
  item.classList.add("credential-item");
  item.replaceChildren(toggle, detail);

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    const group = item.closest(".cert-year");
    group?.querySelectorAll('.credential-toggle[aria-expanded="true"]').forEach((other) => {
      if (other === toggle) return;
      other.setAttribute("aria-expanded", "false");
      document.getElementById(other.getAttribute("aria-controls"))?.setAttribute("hidden", "");
    });
    toggle.setAttribute("aria-expanded", String(!expanded));
    detail.hidden = expanded;
  });
});

/* V5 · Laboratorio de proyectos */
const projectLab = document.querySelector("#project-lab");
const labClose = document.querySelector("#lab-close");
const labTabs = [...document.querySelectorAll("[data-lab-tab]")];
const labPanels = [...document.querySelectorAll("[data-lab-panel]")];
let labReturnFocus = null;

function selectProjectLab(name) {
  const validName = labTabs.some((tab) => tab.dataset.labTab === name) ? name : "phishing";
  labTabs.forEach((tab) => tab.setAttribute("aria-selected", String(tab.dataset.labTab === validName)));
  labPanels.forEach((panel) => {
    const active = panel.dataset.labPanel === validName;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });
}

function openProjectLab(name = "phishing") {
  labReturnFocus = document.activeElement;
  selectProjectLab(name);
  projectLab.hidden = false;
  document.body.classList.add("lab-open");
  requestAnimationFrame(() => projectLab.classList.add("visible"));
  window.setTimeout(() => labTabs.find((tab) => tab.dataset.labTab === name)?.focus(), reduceMotion.matches ? 0 : 180);
}

function closeProjectLab() {
  projectLab.classList.remove("visible");
  document.body.classList.remove("lab-open");
  const finish = () => {
    projectLab.hidden = true;
    if (labReturnFocus instanceof HTMLElement) labReturnFocus.focus();
  };
  if (reduceMotion.matches) finish();
  else window.setTimeout(finish, 220);
}

document.querySelectorAll(".lab-launch").forEach((button) => button.addEventListener("click", () => openProjectLab(button.dataset.lab)));
labTabs.forEach((tab) => tab.addEventListener("click", () => selectProjectLab(tab.dataset.labTab)));
labClose.addEventListener("click", closeProjectLab);
projectLab.addEventListener("click", (event) => { if (event.target === projectLab) closeProjectLab(); });

const urlLabForm = document.querySelector("#url-lab-form");
const urlLabInput = document.querySelector("#url-lab-input");
const urlLabResult = document.querySelector("#url-lab-result");
const urlRiskScore = document.querySelector("#url-risk-score");
const urlRiskLabel = document.querySelector("#url-risk-label");
const urlSignalList = document.querySelector("#url-signal-list");
urlLabForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const signals = [];
  let score = 8;
  try {
    const candidate = new URL(urlLabInput.value.trim());
    const hostname = candidate.hostname.toLowerCase();
    const complete = candidate.href.toLowerCase();
    if (candidate.protocol !== "https:") { score += 20; signals.push("Conexión sin HTTPS"); } else signals.push("Conexión cifrada");
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) { score += 30; signals.push("Host basado en dirección IP"); }
    if (hostname.includes("xn--")) { score += 18; signals.push("Dominio internacional codificado"); }
    if (/(verify|secure|account|login|update|wallet|bank|password)/.test(complete)) { score += 24; signals.push("Términos sensibles detectados"); }
    if (hostname.split(".").length > 3) { score += 12; signals.push("Múltiples subdominios"); }
    if (complete.length > 90) { score += 10; signals.push("URL de longitud inusual"); }
    if (!signals.length) signals.push("Sin señales críticas evidentes");
    score = Math.min(99, score);
  } catch {
    score = 100;
    signals.push("Formato de URL no válido");
  }
  const level = score >= 65 ? "high" : score >= 35 ? "medium" : "safe";
  urlLabResult.dataset.level = level;
  urlRiskScore.textContent = `${score}%`;
  urlRiskLabel.textContent = level === "high" ? "RIESGO ALTO" : level === "medium" ? "REVISIÓN RECOMENDADA" : "RIESGO BAJO";
  urlSignalList.replaceChildren(...signals.map((signal) => {
    const item = document.createElement("li");
    item.textContent = signal;
    return item;
  }));
});

const newsLabForm = document.querySelector("#news-lab-form");
const newsLabInput = document.querySelector("#news-lab-input");
const newsTrustValue = document.querySelector("#news-trust-value");
const newsRiskValue = document.querySelector("#news-risk-value");
const newsTrustBar = document.querySelector("#news-trust-bar");
const newsRiskBar = document.querySelector("#news-risk-bar");
const newsVerdict = document.querySelector("#news-verdict");
newsLabForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = newsLabInput.value.trim();
  const lower = text.toLocaleLowerCase("es");
  const sensational = (lower.match(/última hora|secreto|increíble|nadie quiere|comparte|urgente|impactante|eliminar/g) || []).length;
  const uppercase = text.length ? [...text].filter((character) => /[A-ZÁÉÍÓÚÑ]/.test(character)).length / text.length : 0;
  const sourceSignals = (lower.match(/según|fuente|estudio|universidad|informe|datos/g) || []).length;
  let risk = 24 + sensational * 10 + (uppercase > .16 ? 14 : 0) + (text.split(/\s+/).length < 18 ? 10 : 0) - sourceSignals * 5;
  risk = Math.max(4, Math.min(96, risk));
  const trust = 100 - risk;
  newsTrustValue.textContent = `${trust}%`;
  newsRiskValue.textContent = `${risk}%`;
  newsTrustBar.style.width = `${trust}%`;
  newsRiskBar.style.width = `${risk}%`;
  newsVerdict.textContent = risk >= 65 ? "Patrones sensacionalistas elevados: conviene verificar fuente, autor y evidencia." : risk >= 38 ? "El texto requiere contraste con fuentes independientes antes de compartir." : "No se observan señales estilísticas críticas, pero toda noticia debe verificarse.";
});

const foodCart = new Map();
const foodCartList = document.querySelector("#food-cart");
const foodTotal = document.querySelector("#food-total");
const foodOrderCount = document.querySelector("#food-order-count");
const foodSendOrder = document.querySelector("#food-send-order");
const foodStatusSteps = [...document.querySelectorAll("#food-status li")];
const currency = new Intl.NumberFormat("es-CL", { style:"currency", currency:"CLP", maximumFractionDigits:0 });
let foodTimers = [];

function renderFoodCart() {
  const entries = [...foodCart.values()];
  const count = entries.reduce((total, item) => total + item.quantity, 0);
  const total = entries.reduce((sum, item) => sum + item.price * item.quantity, 0);
  foodCartList.replaceChildren();
  if (!entries.length) {
    const empty = document.createElement("li");
    empty.className = "food-empty";
    empty.textContent = "Selecciona productos del menú.";
    foodCartList.appendChild(empty);
  } else {
    entries.forEach((item) => {
      const row = document.createElement("li");
      const name = document.createElement("span");
      name.textContent = `${item.quantity}× ${item.name}`;
      const price = document.createElement("strong");
      price.textContent = currency.format(item.price * item.quantity);
      row.append(name, price);
      foodCartList.appendChild(row);
    });
  }
  foodOrderCount.textContent = `${String(count).padStart(2, "0")} ITEMS`;
  foodTotal.textContent = currency.format(total);
  foodSendOrder.disabled = count === 0;
}

document.querySelectorAll("[data-food-name]").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.dataset.foodName;
    const current = foodCart.get(name) || { name, price:Number(button.dataset.foodPrice), quantity:0 };
    current.quantity += 1;
    foodCart.set(name, current);
    renderFoodCart();
  });
});
foodSendOrder.addEventListener("click", () => {
  if (!foodCart.size) return;
  foodTimers.forEach((timer) => window.clearTimeout(timer));
  foodTimers = [];
  foodStatusSteps.forEach((step) => step.classList.remove("active"));
  foodStatusSteps[0].classList.add("active");
  foodSendOrder.disabled = true;
  foodSendOrder.textContent = "Pedido enviado ✓";
  foodTimers.push(window.setTimeout(() => foodStatusSteps[1].classList.add("active"), 700));
  foodTimers.push(window.setTimeout(() => {
    foodStatusSteps[2].classList.add("active");
    foodSendOrder.textContent = "Enviar otro pedido";
    foodSendOrder.disabled = false;
  }, 1650));
});
renderFoodCart();

/* V5 · Insignias persistentes */
const achievementConfig = {
  system:"Sistema activo",
  terminal:"Operador de consola",
  game:"Cyber Catch",
  anita:"Protocolo del corazón",
  constellation:"Cartógrafo tecnológico",
};
const achievementToggle = document.querySelector("#achievement-toggle");
const achievementModal = document.querySelector("#achievement-modal");
const achievementClose = document.querySelector("#achievement-close");
const achievementCount = document.querySelector("#achievement-count");
const achievementProgressCount = document.querySelector("#achievement-progress-count");
const achievementProgressTotal = document.querySelector("#achievement-progress-total");
const achievementProgressBar = document.querySelector("#achievement-progress-bar");
const achievements = new Set();
try {
  JSON.parse(localStorage.getItem("am-v5-achievements-progress") || "[]").forEach((id) => {
    if (achievementConfig[id]) achievements.add(id);
  });
} catch { /* Las insignias continúan disponibles durante la sesión. */ }

function renderAchievements() {
  const availableIds = Object.keys(achievementConfig).filter((id) => loveSurpriseVisible || id !== "anita");
  const unlockedCount = availableIds.filter((id) => achievements.has(id)).length;
  document.querySelectorAll("[data-achievement]").forEach((card) => {
    if (card.dataset.achievement === "anita") card.hidden = !loveSurpriseVisible;
    const unlocked = achievements.has(card.dataset.achievement);
    card.classList.toggle("unlocked", unlocked);
    card.querySelector(":scope > b").textContent = unlocked ? "DESBLOQUEADA" : "BLOQUEADA";
  });
  achievementCount.textContent = `${unlockedCount}/${availableIds.length}`;
  achievementProgressCount.textContent = String(unlockedCount);
  achievementProgressTotal.textContent = String(availableIds.length);
  achievementProgressBar.style.width = `${availableIds.length ? (unlockedCount / availableIds.length) * 100 : 0}%`;
}

function awardAchievement(id) {
  if (!achievementConfig[id] || achievements.has(id)) return;
  achievements.add(id);
  try { localStorage.setItem("am-v5-achievements-progress", JSON.stringify([...achievements])); } catch { /* Persistencia opcional. */ }
  renderAchievements();
  showSystemToast(`INSIGNIA DESBLOQUEADA // ${achievementConfig[id].toLocaleUpperCase("es")}`);
}

let achievementReturnFocus = achievementToggle;
function openAchievements() {
  achievementReturnFocus = document.activeElement;
  renderAchievements();
  achievementModal.hidden = false;
  achievementToggle.setAttribute("aria-expanded", "true");
  document.body.classList.add("achievement-open");
  requestAnimationFrame(() => achievementModal.classList.add("visible"));
  achievementClose.focus();
}
function closeAchievements() {
  achievementModal.classList.remove("visible");
  achievementToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("achievement-open");
  const finish = () => {
    achievementModal.hidden = true;
    if (achievementReturnFocus instanceof HTMLElement) achievementReturnFocus.focus();
  };
  if (reduceMotion.matches) finish();
  else window.setTimeout(finish, 220);
}
achievementToggle.addEventListener("click", openAchievements);
achievementClose.addEventListener("click", closeAchievements);
achievementModal.addEventListener("click", (event) => { if (event.target === achievementModal) closeAchievements(); });
renderAchievements();

const visitedTechnologies = new Set();
techNodes.forEach((node) => node.addEventListener("click", () => {
  visitedTechnologies.add(node.dataset.tech);
  if (visitedTechnologies.size === techNodes.length) awardAchievement("constellation");
}));

/* V5 · Paleta de comandos */
const commandToggle = document.querySelector("#command-toggle");
const commandPalette = document.querySelector("#command-palette");
const commandInput = document.querySelector("#command-input");
const commandButtons = [...document.querySelectorAll("[data-command-action]")];
let commandReturnFocus = commandToggle;
let selectedCommandIndex = 0;

function normalizeCommand(value) {
  return value.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function visibleCommandButtons() { return commandButtons.filter((button) => !button.hidden); }
function selectCommand(index = 0) {
  const visible = visibleCommandButtons();
  if (!visible.length) return;
  selectedCommandIndex = (index + visible.length) % visible.length;
  commandButtons.forEach((button) => {
    button.classList.remove("selected");
    button.setAttribute("aria-selected", "false");
  });
  visible[selectedCommandIndex].classList.add("selected");
  visible[selectedCommandIndex].setAttribute("aria-selected", "true");
  visible[selectedCommandIndex].scrollIntoView({ block:"nearest" });
}
function filterCommands(value = "") {
  const query = normalizeCommand(value);
  commandButtons.forEach((button) => {
    const content = normalizeCommand(`${button.textContent} ${button.dataset.keywords || ""}`);
    const hiddenLoveEntry = button.hasAttribute("data-love-entry") && !loveSurpriseVisible;
    button.hidden = hiddenLoveEntry || Boolean(query && !content.includes(query));
  });
  selectCommand(0);
}
function openCommandPalette() {
  commandReturnFocus = document.activeElement;
  commandPalette.hidden = false;
  commandToggle.setAttribute("aria-expanded", "true");
  document.body.classList.add("command-open");
  filterCommands("");
  commandInput.value = "";
  requestAnimationFrame(() => commandPalette.classList.add("visible"));
  window.setTimeout(() => commandInput.focus(), reduceMotion.matches ? 0 : 140);
}
function closeCommandPalette() {
  commandPalette.classList.remove("visible");
  commandToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("command-open");
  const finish = () => {
    commandPalette.hidden = true;
    if (commandReturnFocus instanceof HTMLElement) commandReturnFocus.focus();
  };
  if (reduceMotion.matches) finish();
  else window.setTimeout(finish, 220);
}
function runCommandAction(action) {
  closeCommandPalette();
  window.setTimeout(() => {
    if (action.startsWith("section:")) document.getElementById(action.split(":")[1])?.scrollIntoView({ behavior:reduceMotion.matches ? "auto" : "smooth" });
    else if (action.startsWith("lab:")) openProjectLab(action.split(":")[1]);
    else if (action === "game") gameTrigger.click();
    else if (action === "theme") themeToggle.click();
    else if (action === "terminal") openTerminal();
    else if (action === "achievements") openAchievements();
    else if (action === "anita") document.querySelector(".secret-love-trigger")?.click();
  }, reduceMotion.matches ? 0 : 230);
}
commandToggle.addEventListener("click", openCommandPalette);
commandButtons.forEach((button) => button.setAttribute("role", "option"));
commandInput.addEventListener("input", () => filterCommands(commandInput.value));
commandButtons.forEach((button) => button.addEventListener("click", () => runCommandAction(button.dataset.commandAction)));
commandPalette.addEventListener("click", (event) => { if (event.target === commandPalette) closeCommandPalette(); });
commandInput.addEventListener("keydown", (event) => {
  const visible = visibleCommandButtons();
  if (event.key === "ArrowDown") { event.preventDefault(); selectCommand(selectedCommandIndex + 1); }
  else if (event.key === "ArrowUp") { event.preventDefault(); selectCommand(selectedCommandIndex - 1); }
  else if (event.key === "Enter" && visible[selectedCommandIndex]) { event.preventDefault(); runCommandAction(visible[selectedCommandIndex].dataset.commandAction); }
});
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase("es") === "k") {
    event.preventDefault();
    if (commandPalette.hidden) openCommandPalette();
    else closeCommandPalette();
    return;
  }
  if (event.key !== "Escape") return;
  if (!commandPalette.hidden) closeCommandPalette();
  else if (!projectLab.hidden) closeProjectLab();
  else if (!achievementModal.hidden) closeAchievements();
});

function trapV5Focus(event, container) {
  if (event.key !== "Tab") return;
  const focusable = [...container.querySelectorAll('button:not([disabled]):not([hidden]),input:not([disabled]),textarea:not([disabled]),a[href]')]
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
document.addEventListener("keydown", (event) => {
  if (!commandPalette.hidden) trapV5Focus(event, commandPalette);
  else if (!projectLab.hidden) trapV5Focus(event, projectLab);
  else if (!achievementModal.hidden) trapV5Focus(event, achievementModal);
});
