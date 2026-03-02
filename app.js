/* ================================
   Manga Tracker - Script principal
   ================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  updateDoc,
  query,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

/* -------- CONFIG -------- */
const firebaseConfig = {
  apiKey: "AIzaSyBjGHgNC4CHglfh75yMxXYcLMij8aywcQc",
  authDomain: "mangatracker-63f14.firebaseapp.com",
  projectId: "mangatracker-63f14",
  storageBucket: "mangatracker-63f14.appspot.com",
  messagingSenderId: "612200334218",
  appId: "1:612200334218:web:1cd7349bbc61b71ad7fe73",
  measurementId: "G-1VY5WJG76J",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* -------- BOOTSTRAP -------- */

document.addEventListener("DOMContentLoaded", () => {
  /* -------- DOM REFS -------- */

  // Areas and Displays
  const authControls = document.getElementById("auth-controls");
  const userControls = document.getElementById("user-controls");
  const userDisplay = document.getElementById("user-display");
  const profileImg = document.getElementById("profile-img");
  const profileInitial = document.getElementById("profile-initial");
  const gearBtn = document.getElementById("gear-btn");
  const settingsMenu = document.getElementById("settings-menu");
  const sChangeName = document.getElementById("s-change-name");
  const sChangePhoto = document.getElementById("s-change-photo");
  const sSignout = document.getElementById("s-signout");
  const sGoProfile = document.getElementById("s-goProfile");
  const themeGrid = document.getElementById("theme-grid");
  const searchLoader = document.getElementById("searchLoader");

  // Buttons
  const btnLogin = document.getElementById("btn-login");
  const btnAdd = document.getElementById("btn-add");
  const btnSave = document.getElementById("btn-save");
  const btnCancel = document.getElementById("btn-cancel");

  // Mobile
  const mobileAdd = document.getElementById("mobile-add");
  const mobileGear = document.getElementById("mobile-gear");
  const mobileProfile = document.getElementById("mobile-profile");
  const filePhotoInput = document.getElementById("file-photo");

  // Main Grid and Empry States
  const gridEl = document.getElementById("grid");
  const empty = document.getElementById("empty");

  // Modal
  const modal = document.getElementById("modal");
  const preview = document.getElementById("preview");

  // Time Box
  const timeBox = document.getElementById("time-box");
  const timeBoxValue = document.getElementById("time-box-value");
  const timeBoxSwitch = document.getElementById("timebox-switch");

  // Buttons navigation PC/Mobile
  const btnFinalizadosPC = document.getElementById("btn-finalizados-pc");
  const btnVolverPC = document.getElementById("btn-volver-pc");
  const btnVolverSearch = document.getElementById("btn-volver-search");
  const btnFinalizadosMobile = document.getElementById("btn-finalizados-mobile");
  const btnHomeMobile = document.getElementById("mobile-home");

  // API JIKAN
  const zmQueryInput = document.getElementById("zm-query");
  const zmSearchBtn = document.getElementById("zm-search-btn");
  const zmResults = document.getElementById("zm-results");
  const searchBox = document.querySelector(".search-box");

  const filterToggle = document.getElementById("filter-btn");
  const filterBox = document.getElementById("filter-panel");

  const filterType = document.getElementById("filter-type");
  const filterOrder = document.getElementById("filter-order");
  const filterSort = document.getElementById("filter-sort");

  const sidebar = document.getElementById("settings-sidebar");
  const overlay = document.getElementById("settings-overlay");
  const closeBtn = document.getElementById("settings-close");
  const themeGridLight = document.getElementById("theme-grid-light");
  const themeGridDark = document.getElementById("theme-grid-dark");

  // User Page
  const userView = document.getElementById("user-view");
  const userPageAvatar = document.getElementById("user-page-avatar");
  const userPageName = document.getElementById("user-page-name");
  const userPageEmail = document.getElementById("user-page-email");
  const userBio = document.getElementById("user-bio");
  const statsToggle = document.getElementById("stats-public-toggle");
  const reviewsToggle = document.getElementById("reviews-toggle");
  const reviewsList = document.getElementById("reviews-list");
  const btnEditNamePage = document.getElementById("btn-edit-name-page");


  /* -------- STATE -------- */
  let currentView = "home";
  let currentUser = null;
  let editId = null;
  let selectedToFinish = null;
  let currentFilter = "reading"; // 'reading' or 'finished'
  let userJikanIds = new Set();
  let mobileSettingsPopup = null;
  window.timeBoxEnabled = false;
  window.addEventListener("resize", mobileBarDisplayCheck);

  /* -------- THEMES -------- */
  const THEMES = {

    // DARK THEMES
    
    dark: { type: "dark", "--bg": "#0f172a", "--card": "#1e293b", "--accent": "#f1f5f9", "--accent-2": "#3b82f6", "--muted": "#94a3b8" },
    black: { type: "dark", "--bg": "#0f0f0f", "--card": "#1a1a1a", "--accent": "#f5f5f5", "--accent-2": "#888888", "--muted": "#5a5a5a" },
    pinkDark: { type: "dark", "--bg": "#1a0b14", "--card": "#2a1020", "--accent": "#fde7f3", "--accent-2": "#ec4899", "--muted": "#c58aa6" },
    purpleDark: { type: "dark", "--bg": "#160b22", "--card": "#221238", "--accent": "#f1e9ff", "--accent-2": "#7c3aed", "--muted": "#b59ee0" },
    greenDark: { type: "dark", "--bg": "#062012", "--card": "#0b2f1b", "--accent": "#e6fff2", "--accent-2": "#10b981", "--muted": "#7fc9a4" },
    redDark: { type: "dark", "--bg": "#1f0a0a", "--card": "#2e1111", "--accent": "#ffeaea", "--accent-2": "#ef4444", "--muted": "#d98a8a" },
    orangeDark: { type: "dark", "--bg": "#241200", "--card": "#341a00", "--accent": "#fff1e0", "--accent-2": "#f97316", "--muted": "#e0a16b" },
    tealDark: { type: "dark", "--bg": "#03201e", "--card": "#05302d", "--accent": "#e6fffb", "--accent-2": "#14b8a6", "--muted": "#7ccfc6" },
    yellowDark: { type: "dark", "--bg": "#1f1a05", "--card": "#2e2608", "--accent": "#fff8dc", "--accent-2": "#facc15", "--muted": "#e3c56b" },
    cyanDark: { type: "dark", "--bg": "#031e22", "--card": "#06323a", "--accent": "#e6fdff", "--accent-2": "#06b6d4", "--muted": "#7ccfd9" },
    brownDark: { type: "dark", "--bg": "#1e130b", "--card": "#2a1b10", "--accent": "#f5ede7", "--accent-2": "#92400e", "--muted": "#c6a38a" },
    slateDark: { type: "dark", "--bg": "#020617", "--card": "#020617", "--accent": "#e5e7eb", "--accent-2": "#64748b", "--muted": "#94a3b8" },
    oliveDark: { type: "dark", "--bg": "#1a1f0f", "--card": "#262c16", "--accent": "#f4f7e8", "--accent-2": "#84a21d", "--muted": "#b5c27a" },
    roseDark: { type: "dark", "--bg": "#1f0a10", "--card": "#2e1118", "--accent": "#ffe7ec", "--accent-2": "#f43f5e", "--muted": "#e09aad" },
    iceDark: { type: "dark", "--bg": "#041926", "--card": "#06283a", "--accent": "#e6f7ff", "--accent-2": "#38bdf8", "--muted": "#9dcde5" },
    indigoDark: { type: "dark", "--bg": "#0c0a24", "--card": "#161238", "--accent": "#ecebff", "--accent-2": "#6366f1", "--muted": "#a6a9e5" },

    // LIGHT THEMES

    blue: { type: "light", "--bg": "#eff6ff", "--card": "#e0f2fe", "--accent": "#0b1220", "--accent-2": "#3b82f6", "--muted": "#64748b" },
    light: { type: "light", "--bg": "#ffffff", "--card": "#f8fafc", "--accent": "#0f172a", "--accent-2": "#f0f1f5", "--muted": "#6b7280" },
    pink: { type: "light", "--bg": "#fff0f6", "--card": "#fff1f2", "--accent": "#2b2a2a", "--accent-2": "#ec4899", "--muted": "#7c4a5b" },
    purple: { type: "light", "--bg": "#faf5ff", "--card": "#f3e8ff", "--accent": "#211634", "--accent-2": "#7c3aed", "--muted": "#6b5b7a" },
    green: { type: "light", "--bg": "#f0fdf4", "--card": "#dcfce7", "--accent": "#04260f", "--accent-2": "#10b981", "--muted": "#4b6b53" },
    red: { type: "light", "--bg": "#fff5f5", "--card": "#ffe5e5", "--accent": "#2a0a0a", "--accent-2": "#ef4444", "--muted": "#a64b4b" },
    orange: { type: "light", "--bg": "#fffaf0", "--card": "#fff3e0", "--accent": "#2b1a00", "--accent-2": "#f97316", "--muted": "#b36b3b" },
    teal: { type: "light", "--bg": "#f0fdfa", "--card": "#ccfbf1", "--accent": "#042f2e", "--accent-2": "#14b8a6", "--muted": "#4a7c79" },
    yellow: { type: "light", "--bg": "#fffbeb", "--card": "#fef3c7", "--accent": "#2b2a00", "--accent-2": "#facc15", "--muted": "#a68c4b" },
    cyan: { type: "light", "--bg": "#ecfeff", "--card": "#cffafe", "--accent": "#042f2e", "--accent-2": "#06b6d4", "--muted": "#4b7c82" },
    brown: { type: "light", "--bg": "#faf7f5", "--card": "#ede6e1", "--accent": "#2a1c14", "--accent-2": "#92400e", "--muted": "#7a5c4a" },
    slate: { type: "light", "--bg": "#f8fafc", "--card": "#e2e8f0", "--accent": "#0f172a", "--accent-2": "#64748b", "--muted": "#64748b" },
    olive: { type: "light", "--bg": "#f7f8f3", "--card": "#e6e9d8", "--accent": "#2a2f1b", "--accent-2": "#84a21d", "--muted": "#6b7450" },
    rose: { type: "light", "--bg": "#fff1f2", "--card": "#ffe4e6", "--accent": "#2a0a12", "--accent-2": "#f43f5e", "--muted": "#a8576c" },
    ice: { type: "light", "--bg": "#f0f9ff", "--card": "#e0f2fe", "--accent": "#082f49", "--accent-2": "#38bdf8", "--muted": "#5b7c92" },
    indigo: { type: "light", "--bg": "#eef2ff", "--card": "#e0e7ff", "--accent": "#1e1b4b", "--accent-2": "#6366f1", "--muted": "#6b6fa1" }
  };

  function prefsDocRef(uid) {
    return doc(db, "users", uid, "prefs", "ui");
  }

  function updateSwitchColors(themeName) {
    const theme = THEMES[themeName];
    if (!theme) return;
    const root = document.documentElement;

    // Switch Color off
    root.style.setProperty(
      "--switch-off",
      themeName === "dark" || themeName === "black" ? "#555" : "#ccc",
    );

    // Switch Color on
    root.style.setProperty("--switch-on", theme["--accent-2"]);

    // Switch Circle Color
    root.style.setProperty(
      "--switch-circle",
      themeName === "dark" || themeName === "black" ? "#f1f5f9" : "#fff",
    );
  }

  Object.keys(THEMES).forEach((key) => {
    const theme = THEMES[key];

    // elegimos contenedor según tipo
    const container = theme.type === "light" ? themeGridLight : themeGridDark;

    if (!container) return;

    const sw = document.createElement("div");
    sw.className = "theme-swatch";
    sw.style.background = theme["--accent-2"];
    sw.title = key;
    sw.dataset.theme = key;

    sw.addEventListener("click", () => applyTheme(key, true));

    container.appendChild(sw);
  });

  function setCssVarsFromTheme(themeKey) {
    const vars = THEMES[themeKey] || THEMES.dark;
    Object.entries(vars).forEach(([k, v]) =>
      document.documentElement.style.setProperty(k, v),
    );
  }
  async function applyTheme(themeKey, save = true) {
    document.body.dataset.theme = themeKey;
    setCssVarsFromTheme(themeKey);
    if (save) {
      try {
        if (currentUser) {
          await setDoc(
            prefsDocRef(currentUser.uid),
            { theme: themeKey },
            { merge: true },
          );
        } else {
          localStorage.setItem("mt_theme", themeKey);
        }
      } catch (e) {
        console.error("Error guardando tema:", e);
      }
    }
  }

  function toAnimeflvSlug(title) {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  function openSettings() {
    sidebar.classList.add("open");
    overlay.classList.add("open");
    sidebar.setAttribute("aria-hidden", "false");
  }

  function closeSettings() {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
    sidebar.setAttribute("aria-hidden", "true");
  }

  closeBtn?.addEventListener("click", closeSettings);
  gearBtn?.addEventListener("click", openSettings);
  overlay?.addEventListener("click", closeSettings);

  /* -------- PROFILE HELPERS -------- */
  function setProfileImage(url) {
    const mobileImg = document.getElementById("mobile-profile-img");
    const mobileInitial = document.getElementById("mobile-profile-initial");
    if (!profileImg) return;
    if (url) {
      if (url.startsWith("data:image/")) {
        profileImg.src = url;
        if (mobileImg) mobileImg.src = url;
      } else {
        const safeUrl =
          url + (url.includes("?") ? "&" : "?") + "t=" + Date.now();
        profileImg.src = safeUrl;
        if (mobileImg) mobileImg.src = safeUrl;
      }
      profileImg.style.display = "block";
      profileInitial.style.display = "none";
      if (mobileImg) mobileImg.style.display = "block";
      if (mobileInitial) mobileInitial.style.display = "none";
    } else {
      profileImg.style.display = "none";
      profileInitial.style.display = "inline-block";
      if (mobileImg) mobileImg.style.display = "none";
      if (mobileInitial) mobileInitial.style.display = "inline-block";
    }
  }

  function setUserNameDisplay(name) {
    if (!userDisplay) return;
    userDisplay.textContent = name || "Invitado";
    const initial = name && name[0] ? name[0].toUpperCase() : "I";
    if (profileInitial) profileInitial.textContent = initial;
    const mobileInitial = document.getElementById("mobile-profile-initial");
    if (mobileInitial) mobileInitial.textContent = initial;
  }

  function applyView() {
    if (currentView === "finished") {
      userView.style.display = "none";
      searchBox && (searchBox.style.display = "none");
      btnAdd && (btnAdd.style.display = "none");
      btnVolverSearch && (btnVolverSearch.style.display = "none");
    } else if (currentView === "search") {
      userView.style.display = "none";
      searchBox && (searchBox.style.display = "");
      btnAdd && (btnAdd.style.display = "");
      btnVolverSearch && (btnVolverSearch.style.display = "inline-block");
      timeBox && (timeBox.style.display = "none");
    } else if (currentView === "user") {
      userView.style.display = "block";
      searchBox && (searchBox.style.display = "none");
      btnAdd && (btnAdd.style.display = "none");
      btnVolverSearch && (btnVolverSearch.style.display = "inline-block");
      btnVolverPC && (btnVolverPC.style.display = "none");
      timeBox && (timeBox.style.display = "none");
    } else {
      // home
      userView.style.display = "none";
      searchBox && (searchBox.style.display = "");
      btnAdd && (btnAdd.style.display = "");
      btnVolverSearch && (btnVolverSearch.style.display = "none");
      timeBox && (timeBox.style.display = "none");
      
    }
  }

  function showSearchLoader() {
    searchLoader.classList.remove("hidden");
  }

  function hideSearchLoader() {
    searchLoader.classList.add("hidden");
  }

  async function searchJikan(query, type = "manga") {
    const endpoint =
      type === "anime"
        ? `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=24`
        : `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=24`;

    let res;
    try {
      res = await fetch(endpoint);
    } catch (e) {
      zmResults.innerHTML = `
        <div style="grid-column: 1 / -1; margin-top: 20%; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; text-align: center; color: var(--accent);">
            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="100pt" height="100pt" viewBox="0 0 100 100"
 preserveAspectRatio="xMidYMid meet">

<g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
fill="currentColor" stroke="none">
<path d="M403 4461 c-99 -34 -170 -99 -216 -198 l-22 -48 0 -1655 0 -1655 27
-57 c34 -73 103 -142 176 -176 l57 -27 2135 0 2135 0 67 33 c77 37 128 90 167
172 l26 55 0 1655 0 1655 -27 57 c-34 73 -103 142 -176 176 l-57 27 -2120 2
c-2020 2 -2122 2 -2172 -16z m4225 -313 c9 -9 12 -76 12 -240 l0 -228 -539 0
-539 0 -158 78 -159 77 -1382 3 -1383 2 0 148 c0 102 4 152 12 160 17 17 4119
17 4136 0z m-1340 -692 c204 -102 154 -96 794 -96 l558 0 0 -1188 c0 -911 -3
-1191 -12 -1200 -17 -17 -4119 -17 -4136 0 -9 9 -12 307 -12 1280 l0 1268
1340 0 1340 0 128 -64z"/>
<path d="M1375 2866 c-41 -18 -83 -69 -91 -111 -13 -71 2 -104 89 -192 l81
-83 -81 -83 c-87 -89 -102 -121 -88 -194 9 -49 69 -109 118 -118 73 -14 105 1
194 88 l83 81 83 -81 c89 -87 121 -102 194 -88 49 9 109 69 118 118 14 73 -1
105 -88 194 l-81 83 81 83 c87 89 102 121 88 194 -9 49 -69 109 -118 118 -73
14 -105 -1 -194 -88 l-83 -81 -78 76 c-99 99 -150 118 -227 84z"/>
<path d="M3135 2866 c-41 -18 -83 -69 -91 -111 -13 -71 2 -104 89 -192 l81
-83 -81 -83 c-87 -89 -102 -121 -88 -194 9 -49 69 -109 118 -118 73 -14 105 1
194 88 l83 81 83 -81 c89 -87 121 -102 194 -88 49 9 109 69 118 118 14 73 -1
105 -88 194 l-81 83 81 83 c87 89 102 121 88 194 -9 49 -69 109 -118 118 -73
14 -105 -1 -194 -88 l-83 -81 -78 76 c-99 99 -150 118 -227 84z"/>
<path d="M1855 1746 c-94 -41 -124 -168 -58 -247 34 -40 300 -173 380 -189 81
-17 155 -2 281 59 l102 50 103 -50 c125 -61 199 -76 280 -59 80 16 346 149
380 189 86 103 9 261 -126 261 -23 0 -84 -25 -176 -70 l-141 -69 -100 49
c-182 88 -256 89 -438 1 l-102 -50 -141 69 c-149 74 -185 82 -244 56z"/>
</g>
</svg>
            <p style="color: var(--error); font-weight: bold; margin-left: 10px;">Error de conexión con Jikan</p>
        </div>`;
      return [];
    }

    if (!res.ok) {
      zmResults.innerHTML = `
        <div style="grid-column: 1 / -1; margin-top: 20%; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; text-align: center; color: var(--accent);">
            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="100pt" height="100pt" viewBox="0 0 512.000000 512.000000"
 preserveAspectRatio="xMidYMid meet">

<g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
fill="currentColor" stroke="none">
<path d="M403 4461 c-99 -34 -170 -99 -216 -198 l-22 -48 0 -1655 0 -1655 27
-57 c34 -73 103 -142 176 -176 l57 -27 2135 0 2135 0 67 33 c77 37 128 90 167
172 l26 55 0 1655 0 1655 -27 57 c-34 73 -103 142 -176 176 l-57 27 -2120 2
c-2020 2 -2122 2 -2172 -16z m4225 -313 c9 -9 12 -76 12 -240 l0 -228 -539 0
-539 0 -158 78 -159 77 -1382 3 -1383 2 0 148 c0 102 4 152 12 160 17 17 4119
17 4136 0z m-1340 -692 c204 -102 154 -96 794 -96 l558 0 0 -1188 c0 -911 -3
-1191 -12 -1200 -17 -17 -4119 -17 -4136 0 -9 9 -12 307 -12 1280 l0 1268
1340 0 1340 0 128 -64z"/>
<path d="M1375 2866 c-41 -18 -83 -69 -91 -111 -13 -71 2 -104 89 -192 l81
-83 -81 -83 c-87 -89 -102 -121 -88 -194 9 -49 69 -109 118 -118 73 -14 105 1
194 88 l83 81 83 -81 c89 -87 121 -102 194 -88 49 9 109 69 118 118 14 73 -1
105 -88 194 l-81 83 81 83 c87 89 102 121 88 194 -9 49 -69 109 -118 118 -73
14 -105 -1 -194 -88 l-83 -81 -78 76 c-99 99 -150 118 -227 84z"/>
<path d="M3135 2866 c-41 -18 -83 -69 -91 -111 -13 -71 2 -104 89 -192 l81
-83 -81 -83 c-87 -89 -102 -121 -88 -194 9 -49 69 -109 118 -118 73 -14 105 1
194 88 l83 81 83 -81 c89 -87 121 -102 194 -88 49 9 109 69 118 118 14 73 -1
105 -88 194 l-81 83 81 83 c87 89 102 121 88 194 -9 49 -69 109 -118 118 -73
14 -105 -1 -194 -88 l-83 -81 -78 76 c-99 99 -150 118 -227 84z"/>
<path d="M1855 1746 c-94 -41 -124 -168 -58 -247 34 -40 300 -173 380 -189 81
-17 155 -2 281 59 l102 50 103 -50 c125 -61 199 -76 280 -59 80 16 346 149
380 189 86 103 9 261 -126 261 -23 0 -84 -25 -176 -70 l-141 -69 -100 49
c-182 88 -256 89 -438 1 l-102 -50 -141 69 c-149 74 -185 82 -244 56z"/>
</g>
</svg>
            <p style="color: var(--error); font-weight: bold; margin-left: 10px;">Jikan está saturado, prueba en unos segundos</p>
        </div>`;
      return [];
    }

    const json = await res.json();

    return (json.data || []).map((item) => ({
      id: item.mal_id,
      title: item.title,
      img: item.images?.jpg?.image_url || "",
      chapters: type === "anime" ? (item.episodes ?? 0) : (item.chapters ?? 0),
      status: item.status || "Desconocido",
      type,
    }));
  }

  function zonatmoLink(title) {
    return `https://zonatmo.com/library?title=${encodeURIComponent(title)}&_pg=1`;
  }

  function animeflvLink(title) {
    const slug = toAnimeflvSlug(title);
    return `https://m.animeflv.net/anime/${slug}`;
  }

  function renderJikanResults(results) {
    if (!zmResults) return;

    zmResults.innerHTML = "";

    if (results.length === 0) {
      zmResults.innerHTML = `
            <div style="grid-column: 1 / -1; margin-top: 20%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; color: var(--accent); width: 100%; min-height: 200px;">
                <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="100pt" height="100pt" viewBox="0 0 512.000000 512.000000"
 preserveAspectRatio="xMidYMid meet">

<g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
fill="currentColor" stroke="none">
<path d="M593 5102 c-100 -35 -171 -115 -193 -216 -8 -36 -10 -508 -8 -1626
l3 -1575 21 -46 c28 -60 87 -119 150 -150 47 -23 59 -24 306 -29 l257 -5 -459
-430 c-252 -236 -470 -448 -485 -470 -62 -96 -71 -231 -22 -338 92 -201 346
-279 521 -159 33 23 269 267 611 632 306 327 562 599 569 604 9 6 23 2 43 -12
96 -68 313 -155 464 -186 454 -93 972 35 1285 317 l51 46 529 3 529 3 57 28
c69 34 121 91 148 164 20 53 20 76 20 1633 0 1557 0 1580 -20 1633 -27 73 -79
130 -148 164 l-57 28 -2060 2 c-1957 2 -2063 2 -2112 -15z m4142 -194 c48 -22
55 -52 55 -228 l0 -160 -835 0 c-908 0 -877 2 -903 -55 -15 -33 -15 -57 0 -90
26 -57 -5 -55 903 -55 l835 0 0 -1296 0 -1296 -34 -34 -34 -34 -416 0 -415 0
56 83 c102 149 181 339 220 533 27 134 24 423 -5 560 -64 299 -201 559 -406
772 -214 222 -458 359 -759 424 -87 19 -133 22 -307 22 -174 0 -220 -3 -307
-22 -294 -64 -523 -190 -738 -406 -223 -224 -359 -476 -427 -790 -18 -84 -22
-133 -22 -291 0 -206 14 -299 70 -462 28 -82 110 -256 144 -303 11 -16 20 -32
20 -37 0 -5 -20 -25 -44 -46 l-45 -37 -341 0 -342 0 -34 34 -34 34 0 1296 0
1296 835 0 c625 0 841 3 860 12 29 13 55 55 55 88 0 33 -26 75 -55 88 -19 9
-235 12 -860 12 l-835 0 0 166 0 166 34 34 34 34 2026 0 c1549 0 2031 -3 2051
-12z m-1788 -1077 c282 -58 509 -182 693 -378 454 -486 454 -1300 -1 -1787
-211 -226 -500 -362 -845 -396 -645 -65 -1252 396 -1381 1047 -21 109 -24 355
-4 463 88 493 456 901 931 1032 190 53 410 59 607 19z m-1304 -2478 l-66 -74
-84 83 -84 83 73 67 73 67 77 -76 77 -76 -66 -74z m-293 -138 l84 -85 -50 -52
c-28 -29 -220 -234 -428 -455 -403 -431 -407 -434 -488 -419 -106 20 -169 137
-123 226 13 26 901 870 915 870 3 0 43 -38 90 -85z"/>
<path d="M2644 4509 c-25 -13 -54 -60 -54 -89 0 -51 49 -100 100 -100 51 0
100 49 100 99 0 73 -80 122 -146 90z"/>
<path d="M2305 3320 c-11 -4 -101 -90 -200 -189 -236 -237 -234 -207 -27 -414
l152 -152 -140 -140 c-146 -146 -176 -188 -165 -233 8 -34 338 -369 381 -388
17 -7 42 -10 55 -7 13 3 93 73 177 157 l152 151 153 -151 c83 -84 163 -154
176 -157 13 -3 35 -1 50 4 40 15 379 358 386 391 10 46 -19 87 -165 233 l-140
140 152 152 c207 208 210 176 -32 418 -115 115 -194 186 -210 190 -47 10 -83
-14 -228 -158 l-142 -141 -143 141 c-169 168 -185 178 -242 153z m185 -384
c147 -147 174 -165 228 -151 16 4 85 64 175 153 l147 146 87 -87 88 -87 -153
-153 c-133 -135 -152 -157 -152 -186 0 -18 5 -42 11 -54 6 -12 75 -86 152
-165 l142 -142 -87 -87 -88 -88 -153 153 c-151 149 -154 152 -197 152 -43 0
-46 -3 -197 -152 l-153 -153 -87 87 -87 87 152 155 c149 150 152 155 152 197
0 42 -3 46 -152 196 l-152 153 84 85 c47 47 87 85 89 85 3 0 71 -65 151 -144z"/>
</g>
</svg>
                <p style="color: var(--error); font-weight: bold; margin-left: 10px;">No se encontraron Resultados</p>
            </div>`;
      return;
    }

    results.forEach((m) => {
      const card = document.createElement("article");
      const alreadyAdded = userJikanIds.has(m.id);
      card.className = "card";

      card.innerHTML = `
      <div class="thumb">
        ${m.img ? `<img data-src="${m.img}" loading="lazy">` : ""}
      </div>

      <div class="meta">
        <div class="title">${m.title}</div>
        <div class="genre">${m.status}</div>
        <div class="last">
          Capítulos: <strong>${m.chapters ?? "?"}</strong>
        </div>
      </div>

      <div class="actions">
        ${
          m.type === "manga"
            ? `<a class="link" href="${zonatmoLink(m.title)}" target="_blank">ZonaTMO</a>`
            : `<a class="link" href="${animeflvLink(m.title)}" target="_blank">AnimeFLV</a>`
        }
        <button class="small add-jikan" ${alreadyAdded ? "disabled" : ""}>${alreadyAdded ? "✔ Añadido" : "Añadir"}</button>
      </div>
    `;

      const img = card.querySelector("img");
      if (img) {
        img.src = img.dataset.src;
        img.onload = () => {
          img.classList.add("loaded");
        };
      }

      const addBtn = card.querySelector(".add-jikan");

      if (!alreadyAdded) {
        addBtn.onclick = async () => {
          await addFromJikan(m);

          userJikanIds.add(m.id);

          addBtn.textContent = "✔ Añadido";
          addBtn.disabled = true;
        };
      }
      zmResults.appendChild(card);
    });
  }

  async function addFromJikan(m) {
    if (!currentUser) return alert("Inicia sesión");

    await addDoc(collection(db, "users", currentUser.uid, "mangas"), {
      title: m.title,
      type: m.type === "anime" ? "Anime" : "Manga",
      genre: "Otro",
      last: "0",
      imgurl: m.img || "",
      url: m.type === "anime" ? animeflvLink(m.title) : zonatmoLink(m.title),
      status: "reading",
      jikanId: m.id,
      lastKnownChapters: m.chapters || 0,
    });

    if (currentView === "home") {
      loadMangas("reading");
    }
  }

  async function loadUserJikanIds() {
    if (!currentUser) return;

    userJikanIds.clear();

    const mangaSnap = await getDocs(
      collection(db, "users", currentUser.uid, "mangas"),
    );

    mangaSnap.forEach((doc) => {
      const data = doc.data();
      if (data.jikanId) userJikanIds.add(data.jikanId);
    });

    const animeSnap = await getDocs(
      collection(db, "users", currentUser.uid, "animes"),
    );

    animeSnap.forEach((doc) => {
      const data = doc.data();
      if (data.jikanId) userJikanIds.add(data.jikanId);
    });
  }

  zmSearchBtn.addEventListener("click", async () => {
    const q = zmQueryInput.value.trim();
    if (!q) return;

    showSearchLoader();

    try {
      goSearch();

      const type = filterType.value;
      const orderBy = filterOrder.value;
      const sort = filterSort.value;

      zmResults.innerHTML = "";

      await loadUserJikanIds();
      const results = await searchJikan(q, type);

      results.sort((a, b) => {
        let av = orderBy === "chapters" ? a.chapters || 0 : a.title;
        let bv = orderBy === "chapters" ? b.chapters || 0 : b.title;

        if (sort === "asc") return av > bv ? 1 : -1;
        return av < bv ? 1 : -1;
      });

      renderJikanResults(results, type);
    } catch (err) {
      console.error(err);
      zmResults.innerHTML = "<p>Error en la búsqueda</p>";
    } finally {
      hideSearchLoader();
    }
  });

  async function mobileBarDisplayCheck() {
    const activeEl = document.activeElement;

    const isTyping =
      activeEl &&
      (activeEl.tagName === "INPUT" || activeEl.tagName === "SELECT");

    const isSearching = activeEl && activeEl.id === "zm-query";

    if (isTyping && !isSearching) {
      document.getElementById("mobile-bar").style.display = "none";
      return;
    }

    if (window.innerWidth <= 520) {
      document.getElementById("mobile-bar").style.display = "flex";
    } else {
      document.getElementById("mobile-bar").style.display = "none";
    }
  }

  /* -------- LOAD PREFS -------- */
  async function loadPrefsForUser(uid) {
    try {
      const prefsRef = prefsDocRef(uid);
      const snap = await getDoc(prefsRef);
      if (snap && snap.exists()) {
        const data = snap.data();
        if (data.theme) applyTheme(data.theme, false);
        if (data.photoURL) setProfileImage(data.photoURL);
        if (data.showTimeBox !== undefined) {
          window.timeBoxEnabled = !!data.showTimeBox;
          if (timeBoxSwitch) timeBoxSwitch.checked = !!data.showTimeBox;
          updateTimeBoxVisibility();
        }
      } else {
        const local = localStorage.getItem("mt_theme") || "dark";
        applyTheme(local, false);
        const localShow = localStorage.getItem("mt_showTimeBox");
        if (localShow !== null) {
          window.timeBoxEnabled = localShow === "1";
          if (timeBoxSwitch) timeBoxSwitch.checked = window.timeBoxEnabled;
          updateTimeBoxVisibility();
        }
      }
    } catch (e) {
      console.error(e);
      const local = localStorage.getItem("mt_theme") || "dark";
      applyTheme(local, false);
    }
  }

  /* -------- AUTH STATE -------- */
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (user) {
      authControls && (authControls.style.display = "none");
      userControls && (userControls.style.display = "flex");
      setUserNameDisplay(user.displayName || user.email);

      // try load prefs/photo
      const prefsSnap = await getDoc(prefsDocRef(user.uid));
      if (prefsSnap && prefsSnap.exists() && prefsSnap.data().photoURL) {
        setProfileImage(prefsSnap.data().photoURL);
      } else if (user.photoURL) {
        setProfileImage(user.photoURL);
      } else {
        setProfileImage(null);
      }

      await loadPrefsForUser(user.uid);
      await goHome();
    } else {
      authControls && (authControls.style.display = "flex");
      userControls && (userControls.style.display = "none");
      setUserNameDisplay("Invitado");
      setProfileImage(null);
      if (gridEl) gridEl.innerHTML = "";
      if (empty) empty.style.display = "block";

      const local = localStorage.getItem("mt_theme") || "dark";
      applyTheme(local, false);

      const localShow = localStorage.getItem("mt_showTimeBox");
      window.timeBoxEnabled = localShow === "1";
      if (timeBoxSwitch) timeBoxSwitch.checked = window.timeBoxEnabled;
      updateTimeBoxVisibility();
    }
  });

  /* -------- AUTH (login/register) -------- */
  btnLogin?.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const username = (
      document.getElementById("username").value || "Usuario"
    ).trim();

    if (!email || !password) {
      alert("Email y contraseña necesarios");
      return;
    }

    try {
      const uc = await signInWithEmailAndPassword(auth, email, password);

      if (!uc.user.emailVerified) {
        alert(
          "Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja.",
        );
        await sendEmailVerification(uc.user);
        await signOut(auth);
        return;
      }

      if (!uc.user.displayName)
        await updateProfile(uc.user, { displayName: username });
    } catch (err) {
      console.warn("No pudo iniciar sesión, intentando crear cuenta…");

      try {
        const created = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await updateProfile(created.user, { displayName: username });
        await sendEmailVerification(created.user);

        alert(
          "Cuenta creada. Debes verificar tu correo antes de poder iniciar sesión. Revisa inbox/spam.",
        );
        await signOut(auth);
      } catch (e) {
        console.error(e);
        alert("Error creando la cuenta o enviando el correo de verificación");
      }
    }
  });

  /* -------- SETTINGS / PROFILE actions -------- */
  sChangeName?.addEventListener("click", async () => {
    if (!currentUser) return alert("Inicia sesión");
    settingsMenu.classList.remove("open");
    const nameSpan = document.getElementById("user-display");
    if (nameSpan.dataset.editing === "1") return;
    const original = nameSpan.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.value = original;
    input.maxLength = 20;
    nameSpan.dataset.editing = "1";
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") input.blur();
      if (ev.key === "Escape") {
        input.value = original;
        input.blur();
      }
    });
    input.addEventListener("blur", async () => {
      const newName = input.value.trim();
      delete nameSpan.dataset.editing;
      input.remove();
      nameSpan.style.display = "inline";
      if (!newName || newName === original) return;
      if (newName.length > 20) return alert("Máx 20 caracteres");
      try {
        await updateProfile(currentUser, { displayName: newName });
        await setDoc(
          doc(db, "users", currentUser.uid),
          { displayName: newName },
          { merge: true },
        );
        setUserNameDisplay(newName);
      } catch (e) {
        console.error(e);
        alert("Error actualizando nombre");
      }
    });
    nameSpan.style.display = "none";
    nameSpan.parentElement.prepend(input);
    input.focus();
  });

  sChangePhoto?.addEventListener("click", () => {
    if (!currentUser) return alert("Inicia sesión");
    filePhotoInput.click();
    settingsMenu.classList.remove("open");
  });

  async function uploadProfilePhoto(file) {
    try {
      if (file.size > 3 * 1024 * 1024) throw new Error("Máximo 3MB");
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      await setDoc(
        prefsDocRef(currentUser.uid),
        { photoURL: base64 },
        { merge: true },
      );
      setProfileImage(base64);
    } catch (err) {
      alert("Error: " + err.message);
    }
  }
  filePhotoInput?.addEventListener("change", () => {
    const f = filePhotoInput.files[0];
    if (f) uploadProfilePhoto(f);
  });

  sSignout?.addEventListener("click", async () => {
    await signOut(auth);
  });

  // Toggle del acordeón de reseñas
  reviewsToggle?.addEventListener("click", () => {
    const isHidden = reviewsList.style.display === "none";
    reviewsList.style.display = isHidden ? "block" : "none";
    reviewsToggle.querySelector(".arrow-icon").style.transform = isHidden ? "rotate(180deg)" : "rotate(0)";
  });

  async function renderUserPage() {
    if (!currentUser) return;

    const prefsSnap = await getDoc(doc(db, "users", currentUser.uid, "prefs", "ui"));
    let finalPhoto = currentUser.photoURL;

    if (prefsSnap.exists() && prefsSnap.data().photoURL) {
      finalPhoto = prefsSnap.data().photoURL; // Si existe la subida a mano, usamos esa
    }

    // 1. Datos básicos
    userPageName.textContent = currentUser.displayName || "Usuario";
    userPageEmail.textContent = currentUser.email || "ejemplo@gmail.com";
    userPageAvatar.src = finalPhoto;
    
    // Cargar Bio y Preferencias de Firestore
    const prefs = await getDoc(prefsDocRef(currentUser.uid));
    if (prefs.exists()) {
      userBio.value = prefs.data().bio || "";
      statsToggle.checked = prefs.data().statsPublic || false;
    }

    // 2. Cargar listas públicas y estadísticas
    const querySnapshot = await getDocs(collection(db, "users", currentUser.uid, "mangas"));
    const allItems = [];
    querySnapshot.forEach(doc => allItems.push({ id: doc.id, ...doc.data() }));

    // Filtrar públicos
    const publicReading = allItems.filter(it => it.status === "reading" && it.isPublic);
    const publicFinished = allItems.filter(it => it.status === "finished" && it.isPublic);

    renderGridInElement(publicReading, "public-reading-grid", "public-reading-container");
    renderGridInElement(publicFinished, "public-finished-grid", "public-finished-container");

    // 3. Estadísticas
    document.getElementById("stat-total").textContent = allItems.length;
    const totalChapters = allItems.reduce((acc, curr) => acc + (Number(curr.last) || 0), 0);
    document.getElementById("stat-chapters").textContent = totalChapters;
    const minutosTotales = await calculateTotalTime();
    const horasTotales = Math.floor(minutosTotales / 60);
    document.getElementById("stat-time").textContent = `${horasTotales}h`;

    // 4. Reseñas
    reviewsList.innerHTML = "";
    allItems.filter(it => it.review).forEach(it => {
      const div = document.createElement("div");
      div.className = "review-item";
      div.innerHTML = `<strong>${it.title}:</strong> <p>${it.review}</p>`;
      reviewsList.appendChild(div);
    });
  }

  // Función auxiliar para renderizar mini-grids en el perfil
  function renderGridInElement(items, gridId, containerId) {
    const container = document.getElementById(containerId);
    const grid = document.getElementById(gridId);
    grid.innerHTML = "";
    
    if (items.length === 0) {
      container.style.display = "none";
    } else {
      container.style.display = "block";
      items.forEach(it => { 
        const card = document.createElement("div");
        card.className = "mini-card";
        card.innerHTML = `
          <div class="mini-card-image" style="background-image: url('${it.image}')"></div>
          <div class="mini-card-title">${it.title}</div>
        `;
        grid.appendChild(card);
      });
    }
  }

  // Guardar biografía automáticamente al salir del textarea
  userBio?.addEventListener("blur", async () => {
    await setDoc(prefsDocRef(currentUser.uid), { bio: userBio.value }, { merge: true });
  });

  // Guardar privacidad de stats
  statsToggle?.addEventListener("change", async () => {
    await setDoc(prefsDocRef(currentUser.uid), { statsPublic: statsToggle.checked }, { merge: true });
  });

  // Mobile settings
  mobileGear?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (mobileSettingsPopup) {
      mobileSettingsPopup.remove();
      mobileSettingsPopup = null;
      return;
    }

    const c = document.createElement("div");
    c.className = "mobile-settings-popup";

    c.innerHTML = `
    <h3>Ajustes</h3>
    <button id="mb-change-name">Cambiar nombre</button>
    <button id="mb-change-photo">Cambiar foto</button>
    <button id="mb-toggle-timebox">Mostrar tiempo consumido</button>
    <div class="settings-divider"></div>
    <h4 style="margin-top:10px">Claros</h4>
    <div class="theme-grid" id="mb-theme-grid-light"></div>
    <div class="settings-divider"></div>
    <h4 style="margin-top:14px">Oscuros</h4>
    <div class="theme-grid" id="mb-theme-grid-dark"></div>
    <div class="settings-divider"></div>
    <button id="mb-signout">Cerrar sesión</button>
  `;

    document.body.appendChild(c);
    mobileSettingsPopup = c;

    renderMobileThemes();

    // Define esta función dentro o fuera de tu evento
    function renderMobileThemes() {
      const mbGridLight = document.getElementById("mb-theme-grid-light");
      const mbGridDark = document.getElementById("mb-theme-grid-dark");

      // Recorremos tu objeto de temas (THEMES)
      Object.keys(THEMES).forEach((key) => {
        const theme = THEMES[key];
        const container = theme.type === "light" ? mbGridLight : mbGridDark;

        if (container) {
          const sw = document.createElement("div");
          sw.className = "theme-swatch";
          sw.style.background = theme["--accent-2"];
          // Si el tema actual es el seleccionado, puedes añadirle una clase 'active'
          if (localStorage.getItem("mt_theme") === key)
            sw.classList.add("active");

          sw.onclick = () => {
            applyTheme(key, true);
            // Opcional: cerrar popup al elegir tema
          };
          container.appendChild(sw);
        }
      });
    }

    // Evita que al tocar dentro se cierre
    c.addEventListener("click", (ev) => ev.stopPropagation());

    c.querySelector("#mb-change-name").onclick = async () => {
      const n = prompt("Nuevo nombre:");
      if (!n || n.length > 20) return;
      await updateProfile(currentUser, { displayName: n });
      await setDoc(
        doc(db, "users", currentUser.uid),
        { displayName: n },
        { merge: true },
      );
      setUserNameDisplay(n);
      closeMobileSettings();
    };

    c.querySelector("#mb-change-photo").onclick = () => {
      filePhotoInput.click();
      closeMobileSettings();
    };

    c.querySelector("#mb-toggle-timebox").onclick = async () => {
      const v = !window.timeBoxEnabled;
      if (currentUser) {
        await setDoc(
          prefsDocRef(currentUser.uid),
          { showTimeBox: v },
          { merge: true },
        );
      }
      window.timeBoxEnabled = v;
      localStorage.setItem("mt_showTimeBox", v ? "1" : "0");
      updateTimeBoxVisibility();
      closeMobileSettings();
    };

    c.querySelector("#mb-signout").onclick = async () => {
      await signOut(auth);
      closeMobileSettings();
    };
  });

  /* cerrar tocando fuera */
  document.addEventListener("click", () => {
    if (mobileSettingsPopup) closeMobileSettings();
  });

  function closeMobileSettings() {
    if (mobileSettingsPopup) {
      mobileSettingsPopup.remove();
      mobileSettingsPopup = null;
    }
  }
  /* ---------- DATA / CARDS ---------- */
  /* categories */
  const categories = {
    Manga: [
      "Acción",
      "Aventura",
      "Comedia",
      "Drama",
      "Misterio",
      "Fantasía",
      "Romance",
      "Seinen",
      "Shonen",
      "Otro",
    ],
    Anime: [
      "Acción",
      "Aventura",
      "Comedia",
      "Drama",
      "Misterio",
      "Fantasía",
      "Romance",
      "Slice of Life",
      "Mecha",
      "Isekai",
      "Otro",
    ],
  };

  const fields = ["title", "genre", "last", "url", "imgurl", "type"];

  /* ======= SAGA DETECTION ====== */

  function getBaseName(title) {
    if (!title) return "";

    let t = title.toLowerCase();

    // Delete common saga/season words
    t = t.replace(
      /\b(season|temporada|temp|part|parte|saga|arc|chapter|capítulo|capitulo|ova|special|movie|film)\b/g,
      "",
    );

    // Delete S1 / T2 / etc
    t = t.replace(/\b(s|t)\d+\b/g, "");

    // Delete 1st, 2nd, etc
    t = t.replace(/\b(\d+st|\d+nd|\d+rd|\d+th)\b/g, "");

    //  Delete standalone numbers (to avoid confusion with titles that have numbers but are not seasons, e.g. "One Piece")
    t = t.replace(/\b\d+\b/g, "");

    // Delete special characters and extra spaces
    t = t.replace(/[\.\-–:_]/g, " ");
    t = t.replace(/\s+/g, " ").trim();

    return t;
  }

  function extractSeasonNumber(title) {
    const t = title.toLowerCase();

    let m = t.match(/season\s*(\d+)/) || t.match(/temporada\s*(\d+)/);
    if (m) return parseInt(m[1]);

    m = t.match(/\bs(\d+)\b/);
    if (m) return parseInt(m[1]);

    m = t.match(/part\s*(\d+)/) || t.match(/parte\s*(\d+)/);
    if (m) return parseInt(m[1]) + 0.01;

    if (t.includes("final season")) return 999;

    return 0;
  }

  /* IMAGE PREVIEW */
  document
    .getElementById("fakefile")
    ?.addEventListener("click", () => document.getElementById("file")?.click());
  document.getElementById("file")?.addEventListener("change", () => {
    const f = document.getElementById("file").files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      preview.innerHTML = `<img src="${r.result}" style="max-width:120px;border-radius:6px">`;
      preview.dataset.image = r.result;
    };
    r.readAsDataURL(f);
  });
  document.getElementById("imgurl")?.addEventListener("change", (e) => {
    const v = e.target.value.trim();
    preview.dataset.image = v;
    preview.innerHTML = v
      ? `<img src="${v}" style="max-width:120px;border-radius:6px">`
      : "";
  });

  /* -------- UI helper: toggle buttons according to filter -------- */
  function setButtonsForFilter(filter) {
    currentFilter = filter;

    // PC
    if (btnFinalizadosPC)
      btnFinalizadosPC.style.display =
        filter === "finished" ? "none" : "inline-block";
    if (btnVolverPC)
      btnVolverPC.style.display =
        filter === "finished" ? "inline-block" : "none";

    // Mobile
    if (btnFinalizadosMobile)
      btnFinalizadosMobile.style.display =
        filter === "finished" ? "flex" : "flex";
    if (btnHomeMobile)
      btnHomeMobile.style.opacity = filter === "finished" ? 1 : 0.5;
  }

  filterToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    filterBox.classList.toggle("hidden");
  });

  filterBox?.addEventListener("click", (e) => e.stopPropagation());
  filterBox?.addEventListener("mousedown", (e) => e.stopPropagation());

  document.addEventListener("click", () => {
    filterBox?.classList.add("hidden");
  });

  /* -------- LOAD MANGAS (reading | finished) -------- */
  async function loadMangas(status = "reading") {
    // 🔹 Mostrar skeleton
    gridEl.innerHTML = "";

    for (let i = 0; i < 6; i++) {
      const sk = document.createElement("div");
      sk.className = "skeleton-card";
      sk.innerHTML = `
                <div class="skeleton-thumb"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
            `;
      gridEl.appendChild(sk);
    }

    try {
      if (!currentUser) {
        gridEl.innerHTML = "";
        if (empty) empty.style.display = "block";
        return;
      }

      const col = collection(db, "users", currentUser.uid, "mangas");
      const snap = await getDocs(col);
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const filtered = items.filter(
        (it) => (it.status || "reading") === status,
      );

      gridEl.innerHTML = "";

      if (filtered.length === 0) {
        if (empty) empty.style.display = "block";
        setButtonsForFilter(status);
        return;
      }

      if (empty) empty.style.display = "none";
      setButtonsForFilter(status);

      const tipos = ["Manga", "Anime"];

      tipos.forEach((tipo) => {
        const group = filtered
          .filter((it) => it.type === tipo)
          .sort((a, b) => {
            const baseA = getBaseName(a.title);
            const baseB = getBaseName(b.title);
            if (baseA < baseB) return -1;
            if (baseA > baseB) return 1;

            const sA = extractSeasonNumber(a.title);
            const sB = extractSeasonNumber(b.title);
            return sA - sB;
          });

        if (group.length === 0) return;

        const header = document.createElement("h2");
        header.textContent = tipo;
        header.className = "tipo-header";
        header.style.gridColumn = "1 / -1";
        gridEl.appendChild(header);

        group.forEach((it) => {
          const card = document.createElement("article");
          card.className = "card";
          card.dataset.id = it.id;

          const last = Number(it.last) || 0;
          const total = Number(it.lastKnownChapters) || 0;

          let progressHTML = "";

          if (total > 0) {
            const percent = Math.min((last / total) * 100, 100);
            progressHTML = `
            <div class="progress-wrapper">
              <div class="progress-bar">
                <div class="progress-fill" style="width:${percent}%"></div>
              </div>
              <div class="progress-text">
                ${last} / ${total}
              </div>
            </div>
          `;
          } else {
            progressHTML = `
            <div class="progress-wrapper">
              <div class="progress-bar">
                <div class="progress-fill" style="width:0%"></div>
              </div>
              <div class="progress-text" style="opacity:0.7">
                En emisión
              </div>
            </div>
          `;
          }

          card.innerHTML = `
          <div class="thumb">
            ${it.imgurl ? `<img src="${it.imgurl}" style="width:100%;height:100%;object-fit:cover">` : ""}
          </div>

          <div class="meta">
            <div class="title">${it.title}</div>
            <div class="genre">${it.genre}</div>
            <div class="last">Últ.: <strong>${last}</strong></div>

            ${progressHTML}

            ${
              status === "reading"
                ? `<div class="finish-box">
                  <label>
                    <input type="checkbox" class="finish-check" data-id="${it.id}">
                    Terminado
                  </label>
                </div>`
                : `<div class="finished-label">Finalizado ✔</div>
                <button type="button" class="small restore-btn" data-id="${it.id}" style="margin-top:8px;">
                  Restaurar
                </button>`
            }
          </div>

          <div class="actions">
            <a class="link" href="${it.url || "#"}" target="_blank" rel="noopener">Ir →</a>
            <div style="display:flex;gap:6px;">
              <button type="button" class="small del-btn" data-id="${it.id}"
                style="background:transparent;border:1px solid rgba(255,255,255,0.12); color:var(--error);">
                Borrar
              </button>
            </div>
          </div>
        `;

          gridEl.appendChild(card);
        });
      });

      /* ===== EVENTOS ===== */

      gridEl.querySelectorAll(".edit-btn").forEach((b) => {
        b.onclick = (e) => {
          e.stopPropagation();
          openForm(b.dataset.id);
        };
      });

      gridEl.querySelectorAll(".del-btn").forEach((b) => {
        b.onclick = async (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!confirm("¿Eliminar?")) return;

          await deleteDoc(
            doc(db, "users", currentUser.uid, "mangas", b.dataset.id),
          );
          const card = b.closest(".card");
          if (card) card.remove();
        };
      });

      if (status === "reading") {
        gridEl.querySelectorAll(".card").forEach((card) => {
          card.addEventListener("mousedown", async (e) => {
            if (
              e.target.closest("button") ||
              e.target.closest("a") ||
              e.target.closest(".finish-box")
            )
              return;

            const id = card.dataset.id;
            const docRef = doc(db, "users", currentUser.uid, "mangas", id);
            const snap = await getDoc(docRef);
            if (!snap.exists()) return;

            let delta = 1;

            if (e.button === 2)
              delta = -1; // click derecho
            else if (e.altKey)
              delta = parseInt(prompt("¿Cuántos capítulos leíste?", "1")) || 0;

            // Si es negativo no bloqueamos, pero si es 0, salimos
            if (delta === 0) return;

            const old = Number(snap.data().last) || 0;
            const totalS = Number(snap.data().lastKnownChapters) || 0;

            let newValue = old + delta;
            if (newValue < 0) newValue = 0;
            if (totalS > 0 && newValue > totalS) newValue = totalS;

            // Si llegamos al final
            if (totalS > 0 && newValue === totalS) {
              selectedToFinish = snap.id;
              showFinishModal();
              finishModal.querySelector("h3").textContent =
                `¿Marcar "${snap.data().title}" como terminado?`;
              finishModal.querySelector("p").textContent =
                `Has alcanzado el último capítulo (${totalS}). ¿Quieres marcarlo como terminado?`;
            }

            await updateDoc(docRef, { last: String(newValue) });

            const strong = card.querySelector(".last strong");
            if (strong) strong.textContent = String(newValue);

            if (totalS > 0) {
              const percent = Math.min((newValue / totalS) * 100, 100);
              const fill = card.querySelector(".progress-fill");
              const text = card.querySelector(".progress-text");

              if (fill) fill.style.width = percent + "%";
              if (text) text.textContent = `${newValue} / ${totalS}`;
            }

            if (window.timeBoxEnabled) calculateTotalTime();
          });

          // ===== SWIPE MOBILE =====
          let touchStartX = 0;
          let touchStartY = 0;

          card.addEventListener(
            "touchstart",
            (e) => {
              touchStartX = e.changedTouches[0].screenX;
              touchStartY = e.changedTouches[0].screenY;
            },
            { passive: true },
          );

          card.addEventListener("touchend", async (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;

            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            // Evitar activar con scroll vertical
            if (Math.abs(diffY) > Math.abs(diffX)) return;

            const threshold = 60;
            if (Math.abs(diffX) < threshold) return;

            const id = card.dataset.id;
            const docRef = doc(db, "users", currentUser.uid, "mangas", id);
            const snap = await getDoc(docRef);
            if (!snap.exists()) return;

            const old = Number(snap.data().last) || 0;
            const totalS = Number(snap.data().lastKnownChapters) || 0;

            let delta = diffX > 0 ? 1 : -1;
            let newValue = old + delta;

            if (newValue < 0) newValue = 0;
            if (totalS > 0 && newValue > totalS) newValue = totalS;

            await updateDoc(docRef, { last: String(newValue) });

            const strong = card.querySelector(".last strong");
            if (strong) strong.textContent = String(newValue);

            if (totalS > 0) {
              const percent = Math.min((newValue / totalS) * 100, 100);
              const fill = card.querySelector(".progress-fill");
              const text = card.querySelector(".progress-text");

              if (fill) fill.style.width = percent + "%";
              if (text) text.textContent = `${newValue} / ${totalS}`;
            }

            if (window.timeBoxEnabled) calculateTotalTime();
          });
        });

        gridEl.querySelectorAll(".finish-check").forEach((chk) => {
          chk.onchange = () => {
            if (chk.checked) {
              selectedToFinish = chk.dataset.id;
              showFinishModal();
            }
          };
        });
      }

      if (status === "finished") {
        gridEl.querySelectorAll(".restore-btn").forEach((btn) => {
          btn.onclick = async (e) => {
            e.stopPropagation();

            await updateDoc(
              doc(db, "users", currentUser.uid, "mangas", btn.dataset.id),
              { status: "reading" },
            );

            await loadMangas("reading");
          };
        });
      }

      if (window.timeBoxEnabled) calculateTotalTime();
    } catch (err) {
      console.error(err);
      gridEl.innerHTML = "";
    }
  }

  /* -------- FINISH MODAL HANDLERS -------- */
  const finishModal = document.getElementById("finish-modal");
  const finishConfirm = document.getElementById("finish-confirm");
  const finishCancel = document.getElementById("finish-cancel");

  const originalH3 = finishModal.querySelector("h3").textContent;
  const originalP = finishModal.querySelector("p").textContent;

  function showFinishModal() {
    if (finishModal) finishModal.classList.remove("hidden");
  }
  function hideFinishModal() {
    if (finishModal) finishModal.classList.add("hidden");
    selectedToFinish = null;
    finishModal.querySelector("h3").textContent = originalH3;
    finishModal.querySelector("p").textContent = originalP;
  }

  finishCancel?.addEventListener("click", () => {
    if (finishModal) hideFinishModal();
  });
  finishConfirm?.addEventListener("click", async () => {
    if (!selectedToFinish) {
      hideFinishModal();
      return;
    }
    try {
      await updateDoc(
        doc(db, "users", currentUser.uid, "mangas", selectedToFinish),
        { status: "finished" },
      );
      // reload view according to currentFilter (setButtonsForFilter already updates currentFilter)
      hideFinishModal();
      await loadMangas(currentFilter);
    } catch (e) {
      console.error(e);
      hideFinishModal();
    }
  });

  /* -------- FORM OPEN/CLOSE/SAVE -------- */
  function closeForm() {
    modal && modal.classList.remove("open");
    editId = null;
    if (window.innerWidth <= 520) {
      document.getElementById("mobile-bar").style.display = "flex";
    }
  }

  /* --- IMPORTANT: listeners for Add buttons (fix for the issue) --- */
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeForm();
  });

  /* -------- TIME BOX -------- */
  function updateTimeBoxVisibility() {
    if (!timeBox) return;
    if (window.timeBoxEnabled) {
      timeBox.style.display = "flex";
      calculateTotalTime();
    } else {
      timeBox.style.display = "none";
    }
  }

  timeBoxSwitch?.addEventListener("change", async () => {
    const v = timeBoxSwitch.checked;
    if (currentUser) {
      try {
        await setDoc(
          prefsDocRef(currentUser.uid),
          { showTimeBox: v },
          { merge: true },
        );
      } catch (e) {
        console.error(e);
      }
    } else localStorage.setItem("mt_showTimeBox", v ? "1" : "0");
    window.timeBoxEnabled = v;
    updateTimeBoxVisibility();
  });

  async function calculateTotalTime() {
    if (!currentUser || !timeBoxValue) {
      if (timeBoxValue) timeBoxValue.textContent = "0d 0h 0m";
      return;
    }

    const col = collection(db, "users", currentUser.uid, "mangas");
    const snap = await getDocs(col);
    let totalMinutes = 0;

    snap.docs.forEach((d) => {
      const it = d.data();

      const last = Number(it.last) || 0;

      let mult = 10;
      if (it.type === "Anime") mult = 20;

      totalMinutes += last * mult;
    });

    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    timeBoxValue.textContent = `${days}d ${hours}h ${minutes}m`;

    return totalMinutes;
  }

  /* -------- BUTTONS: Finished / Come Back / mobile home -------- */
  async function goHome() {
    currentView = "home";
    zmResults && (zmResults.innerHTML = "");
    await loadMangas("reading");
    applyView();
  }

  async function goFinished() {
    closeMobileSettings();
    currentView = "finished";
    zmResults && (zmResults.innerHTML = "");
    await loadMangas("finished");
    applyView();
  }

  function goUser() {
    closeMobileSettings();
    currentView = "user";
    zmResults && (zmResults.innerHTML = "");
    gridEl.innerHTML = "";
    renderUserPage();
    applyView();
  }

  function goSearch() {
    closeMobileSettings();
    currentView = "search";
    gridEl.innerHTML = "";
    applyView();
  }

  function volverDesdeBusqueda() {
    currentView = "home";
    zmResults && (zmResults.innerHTML = "");
    loadMangas("reading");
    applyView();
  }

  btnVolverSearch?.addEventListener("click", volverDesdeBusqueda);

  btnFinalizadosPC?.addEventListener("click", () => {
    if (currentView === "finished") goHome();
    else goFinished();
  });

  btnFinalizadosMobile?.addEventListener("click", () => {
    if (currentView === "finished") goHome();
    else goFinished();
  });
  profileImg?.addEventListener("click", () => {
    if (currentView === "user") goHome();
    else goUser();
  });

  sGoProfile?.addEventListener("click", () => {
    if (currentView === "user") goHome();
    else { goUser(); closeSettings(); }
  });

  mobileProfile?.addEventListener("click", () => {
    if (currentView === "user") goHome();
    else goUser();
  });
  btnEditNamePage?.addEventListener("click", async () => {
  // 1. Pedimos el nuevo nombre (puedes usar un prompt sencillo para ir rápido)
  const currentName = currentUser.displayName || "Usuario";
  const newName = prompt("Introduce tu nuevo nombre de usuario:", currentName);

  // 2. Validamos que no esté vacío y que no sea el mismo
  if (newName && newName !== currentName) {
    try {
      // 3. Actualizamos en Firebase Auth
      await updateProfile(auth.currentUser, {
        displayName: newName
      });

      // 4. Actualizamos la interfaz al momento
      if (userPageName) userPageName.textContent = newName;
      if (userDisplay) userDisplay.textContent = newName;
    } catch (error) {
      console.error("Error al actualizar el nombre:", error);
      alert("No se pudo actualizar el nombre. Inténtalo de nuevo.");
    }
  }
});
  btnVolverPC?.addEventListener("click", goHome);
  btnHomeMobile?.addEventListener("click", goHome);

  /* -------- INITIAL LOCAL THEME & TIMEBOX ON PAGE LOAD -------- */
  window.addEventListener("load", () => {
    const local = localStorage.getItem("mt_theme") || "dark";
    applyTheme(local, false);
    const localShow = localStorage.getItem("mt_showTimeBox");
    window.timeBoxEnabled = localShow === "1";
    if (timeBoxSwitch) timeBoxSwitch.checked = window.timeBoxEnabled;
    updateTimeBoxVisibility();
  });

  /* prevent settings menu from closing while interacting */
  settingsMenu?.addEventListener("click", (e) => e.stopPropagation());

  const originalTitle = document.title;

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href) return;

    if (href.includes("zonatmo")) {
      document.title = "Leyendo...";
    } else if (href.includes("animeflv")) {
      document.title = "Viendo...";
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      document.title = originalTitle;
    }
  });

  const btnScrollTop = document.getElementById("btn-scroll-top");

  // 1. Detectar el scroll para mostrar/ocultar el botón
  window.addEventListener("scroll", () => {
    // Si bajamos más de 300px, mostramos el botón
    if (window.scrollY > 300) {
      btnScrollTop.classList.add("show");
    } else {
      btnScrollTop.classList.remove("show");
    }
  });

  // 2. Función para subir suavemente
  btnScrollTop?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth" // Esto hace que el movimiento sea suave
    });
  });

  document.addEventListener("contextmenu", (e) => e.preventDefault());
}); // DOMContentLoaded end
