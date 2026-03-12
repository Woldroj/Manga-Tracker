// tutorial.js
import { db } from "./app.js";
import {
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

const tutorialSteps = [
  {
    id: 1,
    text: "¡Hola, {name}! Bienvenido a MangaTracker. Soy MangaBot, tu guía personal.",
    target: null,
  },
  {
    id: 2,
    text: "En este Tutorial aprenderás a gestionar tu lista. Puedes Saltartelo cuando quieras.",
    target: null,
  },
  {
    id: 3,
    text: "Empecemos por el buscador.",
    target: "zm-search",
  },
  {
    id: 4,
    text: "Abre del desplegable del filtro.",
    target: "filter-btn",
    mustAction: true,
  },
  {
    id: 4.5,
    text: "Selecciona 'Anime' en el filtro.",
    target: "filter-panel",
    mustAction: true,
  },
  {
    id: 5,
    text: "Escribe 'Death Note'.",
    target: "zm-query",
    mustAction: true,
  },
  {
    id: 6,
    text: "Pulsa el botón de buscar.",
    target: "zm-search-btn",
    mustAction: true,
  },
  {
    id: 7,
    text: "Pulsa 'Añadir' en el resultado.",
    target: "add-jikan",
    mustAction: true,
  },
  {
    id: 8,
    text: "Ahora pulsa 'Volver'.",
    target: "btn-volver-search",
    mustAction: true,
  },
  { id: 9, text: "Esta es tu 'Card'.", target: "grid" },
  {
    id: 10,
    text: "Aquí verás el progreso o capítulos.",
    target: "progress-wrapper",
  },
  {
    id: 11,
    text: "Tienes botones rápidos para ir a la web o borrar.",
    target: "actions",
  },
  {
    id: 12,
    text: "Haz clic normal en la card para sumar +1.",
    target: "grid",
    mustAction: true,
  },
  {
    id: 13,
    text: "Haz clic derecho para restar -1.",
    target: "grid",
    mustAction: true,
  },
  {
    id: 14,
    text: "Truco: Alt + Clic para sumar varios capítulos y escriba 999.",
    target: "grid",
    mustAction: true,
  },
  {
    id: 16,
    text: "Pulsa el botón 'Mover'.",
    target: "finish-confirm",
    mustAction: true,
  },
  { id: 17, text: "Ya no está en tu lista principal.", target: null },
  {
    id: 18,
    text: "Pulsa en la pestaña de 'Finalizados'.",
    target: "btn-finalizados-pc",
    mustAction: true,
  },
  { id: 19, text: "Aquí verás tus títulos terminados.", target: "grid" },
  {
    id: 20,
    text: "Puedes marcar como 'Públicos' tus mangas y animes. Si pones tu cursor encima y le das al ojito tachado",
    target: "grid",
    mustAction: true,
  },
  { id: 21, text: "¡Vamos con tu perfil!", target: null },
  {
    id: 22,
    text: "Dirígete a 'Ajustes'.",
    target: "gear-btn",
    mustAction: true,
  },
  {
    id: 23,
    text: "Puedes cambiar el diseño con temas claros.",
    target: "theme-light",
  },
  {
    id: 23.5,
    text: "Y tambien con temas oscuros",
    target: "theme-dark",
  },
  {
    id: 24,
    text: "Entra en el apartado de 'Perfil'.",
    target: "s-goProfile",
    mustAction: true,
  },
  {
    id: 25,
    text: "Aquí verás tu biografía, tus estadísticas y los mangas o animes que tienes en público.",
    target: "user-view",
  },
  { id: 26, text: "Este es tu 'Código de Amigo'.", target: "my-user-code" },
  {
    id: 26.5,
    text: "Dírgete de nuevo a 'Ajustes'",
    target: "gear-btn",
    mustAction: true,
  },
  {
    id: 27,
    text: "Entra en el apartado de 'Amigos'.",
    target: "s-goFriends",
    mustAction: true,
  },
  {
    id: 28,
    text: "Busca amigos. Pega mi Código de Amigo en el buscador: 'BOT-123'.",
    target: "friend-search-input",
    mustAction: true,
  },
  {
    id: 28.5,
    text: "Dale al Botón de 'Buscar'",
    target: "btn-search-friend",
    mustAction: true,
  },
  {
    id: 29,
    text: "¡Me has encontrado! Envíame una solicitud solicitud.",
    target: "search-result-area",
    mustAction: true,
  },
  {
    id: 29.5,
    text: "Dejame que te Acepte ...",
    mustAction: true,
  },
  {
    id: 30,
    text: "Entremos en mi perfil.",
    target: "friends-list-grid",
    mustAction: true,
  },
  {
    id: 30.1,
    text: "Aqui puedes ver el perfil de tus amigos y cotillear sus cosas :>",
    target: "profile-modal-content",
  },
  {
    id: 30.3,
    text: "Dale a la 'x' para salir del perfil",
    target: "close-public-profile",
    mustAction: true,
  },
  {
    id: 30.6,
    text: "Dale al Botón 'Volver'",
    target: "btn-volver-search",
    mustAction: true,
  },
  {
    id: 31,
    text: "¡Felicidades! Has completado el Tutorial.",
    target: null,
  },
];

const tutorial = {
  active: false,
  currentStep: 0,
  steps: tutorialSteps,
  user: null,
  tempData: { mangaId: null, botUid: "BOT-123" },

  start(userInstance) {
    this.user = userInstance;
    this.active = true;
    this.currentStep = 0;
    document.body.classList.add("tutorial-active");
    document.getElementById("tutorial-overlay").classList.remove("hidden");
    document.getElementById("tutorial-blocker").classList.remove("hidden");
    this.showStep();
  },

  async showStep() {
    const step = this.steps[this.currentStep];
    const textEl = document.getElementById("tutorial-text");
    const overlay = document.getElementById("tutorial-overlay");
    const nextBtn = document.getElementById("next-step-btn");

    // 1. Actualizar texto
    if (textEl)
      textEl.textContent = step.text.replace(
        "{name}",
        this.user?.displayName || "Usuario",
      );

    // 2. Lógica de estados y acciones (Tus IFs originales)
    if (step.id === 4.5)
      document.getElementById("filter-panel")?.classList.remove("hidden");
    if (step.id === 29.5) setTimeout(() => this.nextStep(), 3000);

    if (step.id === 30) {
      document.getElementById("res-btn").textContent = "Amigos";
      document.getElementById("res-btn").style.backgroundColor = "#2ecc71";
      try {
        await setDoc(doc(db, "users", this.user.uid, "friends", "BOT-123"), {
          uid: "BOT-123",
          displayName: "MangaBot",
          addedAt: new Date(),
          status: "friend",
        });
      } catch (e) {
        console.error(e);
      }
    }

    if (step.id === 5 || step.id === 28) {
      const inputEl = document.getElementById(step.target);
      if (inputEl)
        inputEl.oninput = (e) => {
          const req = step.id === 5 ? "Death Note" : "BOT-123";
          if (nextBtn)
            nextBtn.style.display =
              e.target.value.trim() === req ? "block" : "none";
        };
    }

    if (step.id === 31) {
      this.celebrate();
      if (nextBtn) {
        nextBtn.textContent = "Finalizar";
        nextBtn.style.backgroundColor = "#2ecc71";
      }
    }

    if (nextBtn) nextBtn.style.display = step.mustAction ? "none" : "block";

    // 3. POSICIONAMIENTO INTEGRADO (El que tú tenías, pero con espera)
    const runPositioning = (retries = 20) => {
      // 1. Selector inteligente
      // Si estamos en el paso del Bot (id 30), buscamos la clase .friend-item-card
      // Si es otro paso, buscamos por ID o por la clase definida en el target
      const selector =
        step.id === 30
          ? ".friend-item-card"
          : document.getElementById(step.target)
            ? `#${step.target}`
            : `.${step.target}`;

      // Captura siempre el primero que encuentra
      const targetEl = document.querySelector(selector);

      if (targetEl && targetEl.offsetParent !== null) {
        // Aplicamos el resaltado (tu lógica original)
        this.applyHighlight(step.target);

        const rect = targetEl.getBoundingClientRect();
        const padding = 10;
        const oW = overlay.offsetWidth;
        const oH = overlay.offsetHeight;

        overlay.style.position = "fixed";
        overlay.style.transform = "none";

        // Cálculo de posición relativo a la primera tarjeta encontrada
        let left = rect.left;
        if (left + oW > window.innerWidth - padding)
          left = window.innerWidth - oW - padding;

        let top = rect.bottom + 10;
        // Si el cartel se sale por abajo, lo ponemos encima de la tarjeta
        if (top + oH > window.innerHeight - padding) top = rect.top - oH - 10;
        if (top < padding) top = padding;

        overlay.style.top = `${top}px`;
        overlay.style.left = `${left}px`;
      } else if (retries > 0) {
        // Reintento: Esperamos a que la primera tarjeta del DOM se renderice
        setTimeout(() => runPositioning(retries - 1), 150);
      } else {
        // Fallback: si después de 20 intentos no está, centramos el aviso
        overlay.style.top = "50%";
        overlay.style.left = "50%";
        overlay.style.transform = "translate(-50%, -50%)";
      }
    };

    // Disparamos el posicionamiento
    if (!step.target || step.id === 31) {
      overlay.style.top = "50%";
      overlay.style.left = "50%";
      overlay.style.transform = "translate(-50%, -50%)";
    } else {
      runPositioning();
    }

    // Lanzar posicionamiento
    if (!step.target || step.id === 31) {
      overlay.style.top = "50%";
      overlay.style.left = "50%";
      overlay.style.transform = "translate(-50%, -50%)";
    } else {
      runPositioning();
    }
  },

  applyHighlight(targetId) {
    document
      .querySelectorAll(".highlighted")
      .forEach((el) => el.classList.remove("highlighted"));
    if (!targetId) return;

    let el = null;

    // Si buscamos una card específica o un elemento dentro de ella
    if (targetId === "grid") {
      // Busca la primera card que exista en el DOM
      el = document.querySelector(".card");
    } else if (targetId === "progress-wrapper") {
      // Busca el primer contenedor de progreso dentro de la primera card
      el = document.querySelector(".card .progress-wrapper");
    } else if (targetId === "add-jikan") {
      // Nota: Como tu botón de añadir viene de una API externa, asegúrate de que tiene esta clase
      el = document.querySelector(".add-jikan");
    } else if (targetId === "visibility-btn") {
      el = document.querySelector(".card .visibility-btn");
    } else if (targetId === "actions") {
      el = document.querySelector(".card .actions");
    } else if (targetId === "search-result-area") {
      el = document.querySelector(".search-card-result .res-btn");
    } else {
      // Para IDs fijos como 'zm-search', 'filter-btn', etc.
      el = document.getElementById(targetId);
    }

    if (el) {
      el.classList.add("highlighted");
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      console.warn(`Tutorial: No se encontró el elemento para: ${targetId}`);
    }
  },

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.showStep();
    } else {
      this.endTutorial();
    }
  },

  celebrate() {
    const duration = 3 * 1000; // 3 segundos
    const end = Date.now() + duration;

    const frame = () => {
      // Lanzar confeti desde la izquierda
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ["#ffcc00", "#ffffff", "#ff0000"],
      });
      // Lanzar confeti desde la derecha
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ["#ffcc00", "#ffffff", "#ff0000"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  },

  async endTutorial() {
    this.active = false;
    document.body.classList.remove("tutorial-active");
    document.getElementById("tutorial-overlay").classList.add("hidden");
    document.getElementById("tutorial-blocker").classList.add("hidden");
    try {
      await updateDoc(doc(db, "users", this.user.uid), {
        tutorialCompleted: true,
      });
      await this.cleanTestData();
    } catch (e) {
      console.error("Error al finalizar:", e);
    }
  },

  async cleanTestData() {
    try {
      if (this.tempData.mangaId) {
        await deleteDoc(
          doc(db, "users", this.user.uid, "finalizados", this.tempData.mangaId),
        );
      }
      await deleteDoc(doc(db, "users", this.user.uid, "friends", "BOT-123"));
    } catch (e) {
      console.error("Error en limpieza:", e);
    }
  },
};

export { tutorial };
window.tutorial = tutorial;
window.nextStep = () => tutorial.nextStep();
window.skipTutorial = () => tutorial.endTutorial();
