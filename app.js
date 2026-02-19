/* ================================
   Manga Tracker - Script principal
   ================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, deleteDoc, getDoc, updateDoc, query } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-storage.js";

/* -------- CONFIG -------- */
const firebaseConfig = {
    apiKey: "AIzaSyBjGHgNC4CHglfh75yMxXYcLMij8aywcQc",
    authDomain: "mangatracker-63f14.firebaseapp.com",
    projectId: "mangatracker-63f14",
    storageBucket: "mangatracker-63f14.appspot.com",
    messagingSenderId: "612200334218",
    appId: "1:612200334218:web:1cd7349bbc61b71ad7fe73",
    measurementId: "G-1VY5WJG76J"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/* -------- BOOTSTRAP -------- */

document.addEventListener('DOMContentLoaded', () => {


    /* -------- DOM REFS -------- */

    // Areas and Displays
    const authControls = document.getElementById('auth-controls');
    const userControls = document.getElementById('user-controls');
    const userDisplay = document.getElementById('user-display');
    const profileImg = document.getElementById('profile-img');
    const profileInitial = document.getElementById('profile-initial');
    const gearBtn = document.getElementById('gear-btn');
    const settingsMenu = document.getElementById('settings-menu');
    const sChangeName = document.getElementById('s-change-name');
    const sChangePhoto = document.getElementById('s-change-photo');
    const sSignout = document.getElementById('s-signout');
    const themeGrid = document.getElementById('theme-grid');
    const searchLoader = document.getElementById('searchLoader');

    // Buttons
    const btnLogin = document.getElementById('btn-login');
    const btnAdd = document.getElementById('btn-add');
    const btnSave = document.getElementById('btn-save');
    const btnCancel = document.getElementById('btn-cancel');

    // Mobile
    const mobileAdd = document.getElementById('mobile-add');
    const mobileGear = document.getElementById('mobile-gear');
    const mobileProfile = document.getElementById('mobile-profile');
    const filePhotoInput = document.getElementById('file-photo');

    // Main Grid and Empry States
    const gridEl = document.getElementById('grid');
    const empty = document.getElementById('empty');

    // Modal
    const modal = document.getElementById('modal');
    const preview = document.getElementById('preview');

    // Time Box
    const timeBox = document.getElementById('time-box');
    const timeBoxValue = document.getElementById('time-box-value');
    const timeBoxSwitch = document.getElementById('timebox-switch');

    // Buttons navigation PC/Mobile
    const btnFinalizadosPC = document.getElementById('btn-finalizados-pc');
    const btnVolverPC = document.getElementById("btn-volver-pc");
    const btnVolverSearch = document.getElementById('btn-volver-search');
    const btnFinalizadosMobile = document.getElementById('btn-finalizados-mobile');
    const btnHomeMobile = document.getElementById('mobile-home');

    // API JIKAN
    const zmQueryInput = document.getElementById('zm-query');
    const zmSearchBtn = document.getElementById('zm-search-btn');
    const zmResults = document.getElementById('zm-results');
    const searchBox = document.querySelector('.search-box');

    const filterToggle = document.getElementById('filter-btn');
    const filterBox = document.getElementById('filter-panel');

    const filterType = document.getElementById('filter-type');
    const filterOrder = document.getElementById('filter-order');
    const filterSort = document.getElementById('filter-sort');

    /* -------- STATE -------- */
    let currentView = 'home';
    let currentUser = null;
    let editId = null;
    let selectedToFinish = null;
    let currentFilter = 'reading'; // 'reading' or 'finished'
    let userJikanIds = new Set();
    let mobileSettingsPopup = null;
    window.timeBoxEnabled = false;
    window.addEventListener('resize', mobileBarDisplayCheck);

    /* -------- THEMES -------- */
    const THEMES = {
        dark: { '--bg': '#0f172a', '--card': '#1e293b', '--accent': '#f1f5f9', '--accent-2': '#3b82f6', '--muted': '#94a3b8' },
        black: { '--bg': '#0f0f0f', '--card': '#1a1a1a', '--accent': '#f5f5f5', '--accent-2': '#888888', '--muted': '#5a5a5a' },
        light: { '--bg': '#ffffff', '--card': '#f8fafc', '--accent': '#0f172a', '--accent-2': '#f0f1f5', '--muted': '#6b7280' },
        pink: { '--bg': '#fff0f6', '--card': '#fff1f2', '--accent': '#2b2a2a', '--accent-2': '#ec4899', '--muted': '#7c4a5b' },
        blue: { '--bg': '#eff6ff', '--card': '#e0f2fe', '--accent': '#0b1220', '--accent-2': '#3b82f6', '--muted': '#64748b' },
        purple: { '--bg': '#faf5ff', '--card': '#f3e8ff', '--accent': '#211634', '--accent-2': '#7c3aed', '--muted': '#6b5b7a' },
        green: { '--bg': '#f0fdf4', '--card': '#dcfce7', '--accent': '#04260f', '--accent-2': '#10b981', '--muted': '#4b6b53' },
        red: { '--bg': '#fff5f5', '--card': '#ffe5e5', '--accent': '#2a0a0a', '--accent-2': '#ef4444', '--muted': '#a64b4b' },
        orange: { '--bg': '#fffaf0', '--card': '#fff3e0', '--accent': '#2b1a00', '--accent-2': '#f97316', '--muted': '#b36b3b' },
        teal: { '--bg': '#f0fdfa', '--card': '#ccfbf1', '--accent': '#042f2e', '--accent-2': '#14b8a6', '--muted': '#4a7c79' },
        yellow: { '--bg': '#fffbeb', '--card': '#fef3c7', '--accent': '#2b2a00', '--accent-2': '#facc15', '--muted': '#a68c4b' }
    };

    function prefsDocRef(uid) { return doc(db, 'users', uid, 'prefs', 'ui'); }

    function updateSwitchColors(themeName) {
        const theme = THEMES[themeName];
        if (!theme) return;
        const root = document.documentElement;

        // Switch Color off
        root.style.setProperty('--switch-off', themeName === 'dark' || themeName === 'black' ? '#555' : '#ccc');

        // Switch Color on
        root.style.setProperty('--switch-on', theme['--accent-2']);

        // Switch Circle Color
        root.style.setProperty('--switch-circle', themeName === 'dark' || themeName === 'black' ? '#f1f5f9' : '#fff');
    }

    /* render swatches */
    if (themeGrid) {
        Object.keys(THEMES).forEach(key => {
            const sw = document.createElement('div');
            sw.className = 'theme-swatch';
            sw.style.background = THEMES[key]['--accent-2'];
            sw.title = key;
            sw.dataset.theme = key;
            sw.addEventListener('click', () => applyTheme(key, true));
            themeGrid.appendChild(sw);
        });
    }
    function setCssVarsFromTheme(themeKey) {
        const vars = THEMES[themeKey] || THEMES.dark;
        Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
    }
    async function applyTheme(themeKey, save = true) {
        document.body.dataset.theme = themeKey;
        setCssVarsFromTheme(themeKey);
        if (save) {
            try {
                if (currentUser) {
                    await setDoc(prefsDocRef(currentUser.uid),
                        { theme: themeKey },
                        { merge: true });
                } else {
                    localStorage.setItem('mt_theme', themeKey);
                }
            } catch (e) {
                console.error('Error guardando tema:', e);
            }
        }
    }

    function toAnimeflvSlug(title) {
        return title
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s]/g, "")
            .trim()
            .replace(/\s+/g, "-");
    }

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
                const safeUrl = url + (url.includes("?") ? "&" : "?") + "t=" + Date.now();
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
        userDisplay.textContent = name || 'Invitado';
        const initial = (name && name[0]) ? name[0].toUpperCase() : 'I';
        if (profileInitial) profileInitial.textContent = initial;
        const mobileInitial = document.getElementById("mobile-profile-initial");
        if (mobileInitial) mobileInitial.textContent = initial;
    }

    function applyView() {
        if (currentView === 'finished') {
            searchBox && (searchBox.style.display = 'none');
            btnAdd && (btnAdd.style.display = 'none');
            btnVolverSearch && (btnVolverSearch.style.display = 'none');
        }
        else if (currentView === 'search') {
            searchBox && (searchBox.style.display = '');
            btnAdd && (btnAdd.style.display = '');
            btnVolverSearch && (btnVolverSearch.style.display = 'inline-block');
            timeBox && (timeBox.style.display = 'none');
        }
        else { // home
            searchBox && (searchBox.style.display = '');
            btnAdd && (btnAdd.style.display = '');
            btnVolverSearch && (btnVolverSearch.style.display = 'none');
            timeBox && (timeBox.style.display = '');
        }
    }

    function showSearchLoader() {
        searchLoader.classList.remove('hidden');
    }

    function hideSearchLoader() {
        searchLoader.classList.add('hidden');
    }

    async function searchJikan(query, type = 'manga') {
        const endpoint =
            type === 'anime'
                ? `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=24`
                : `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=24`;

        let res;
        try {
            res = await fetch(endpoint);
        } catch (e) {
            zmResults.innerHTML = "Error de conexión con Jikan";
            return [];
        }

        if (!res.ok) {
            zmResults.innerHTML = "Jikan está saturado, prueba en unos segundos";
            return [];
        }

        const json = await res.json();

        return (json.data || []).map(item => ({
            id: item.mal_id,
            title: item.title,
            img: item.images?.jpg?.image_url || '',
            chapters:
                type === 'anime'
                    ? item.episodes ?? 0
                    : item.chapters ?? 0,
            status: item.status || 'Desconocido',
            type
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
            zmResults.innerHTML =
                `<p style="padding:10px;color:var(--muted)">Sin resultados</p>`;
            return;
        }

        results.forEach(m => {
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
        ${m.type === 'manga'
                    ? `<a class="link" href="${zonatmoLink(m.title)}" target="_blank">ZonaTMO</a>`
                    : `<a class="link" href="${animeflvLink(m.title)}" target="_blank">AnimeFLV</a>`}
        <button class="small add-jikan" ${alreadyAdded ? 'disabled' : ''}>${alreadyAdded ? '✔ Añadido' : 'Añadir'}</button>
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

        await addDoc(
            collection(db, 'users', currentUser.uid, 'mangas'),
            {
                title: m.title,
                type: m.type === 'anime' ? "Anime" : "Manga",
                genre: "Otro",
                last: "0",
                imgurl: m.img || "",
                url: m.type === 'anime'
                    ? animeflvLink(m.title)
                    : zonatmoLink(m.title),
                status: "reading",
                jikanId: m.id,
                lastKnownChapters: m.chapters || 0
            }
        );

        if (currentView === "home") {
            loadMangas("reading");
        }
    }

    async function loadUserJikanIds() {
        if (!currentUser) return;

        userJikanIds.clear();

        const mangaSnap = await getDocs(
            collection(db, 'users', currentUser.uid, 'mangas')
        );

        mangaSnap.forEach(doc => {
            const data = doc.data();
            if (data.jikanId) userJikanIds.add(data.jikanId);
        });

        const animeSnap = await getDocs(
            collection(db, 'users', currentUser.uid, 'animes')
        );

        animeSnap.forEach(doc => {
            const data = doc.data();
            if (data.jikanId) userJikanIds.add(data.jikanId);
        });
    }

    zmSearchBtn.addEventListener('click', async () => {
        const q = zmQueryInput.value.trim();
        if (!q) return;

        showSearchLoader();

        try {

            goSearch();

            const type = filterType.value;
            const orderBy = filterOrder.value;
            const sort = filterSort.value;

            zmResults.innerHTML = '';

            await loadUserJikanIds();
            const results = await searchJikan(q, type);

            results.sort((a, b) => {
                let av = orderBy === 'chapters' ? (a.chapters || 0) : a.title;
                let bv = orderBy === 'chapters' ? (b.chapters || 0) : b.title;

                if (sort === 'asc') return av > bv ? 1 : -1;
                return av < bv ? 1 : -1;
            });

            renderJikanResults(results, type);

        } catch (err) {
            console.error(err);
            zmResults.innerHTML = '<p>Error en la búsqueda</p>';
        } finally {
            hideSearchLoader();
        }
    });


    async function mobileBarDisplayCheck() {
        const activeEl = document.activeElement;

        const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'SELECT');

        const isSearching = activeEl && activeEl.id === 'zm-query';

        if (modal.style.display === 'flex' || (isTyping && !isSearching)) {
            document.getElementById('mobile-bar').style.display = 'none';
            return;
        }

        if (window.innerWidth <= 520) {
            document.getElementById('mobile-bar').style.display = 'flex';
        } else {
            document.getElementById('mobile-bar').style.display = 'none';
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
                const local = localStorage.getItem('mt_theme') || 'dark';
                applyTheme(local, false);
                const localShow = localStorage.getItem('mt_showTimeBox');
                if (localShow !== null) {
                    window.timeBoxEnabled = localShow === '1';
                    if (timeBoxSwitch) timeBoxSwitch.checked = window.timeBoxEnabled;
                    updateTimeBoxVisibility();
                }
            }
        } catch (e) { console.error(e); const local = localStorage.getItem('mt_theme') || 'dark'; applyTheme(local, false); }
    }

    /* -------- AUTH STATE -------- */
    onAuthStateChanged(auth, async (user) => {
        currentUser = user;

        if (user) {
            authControls && (authControls.style.display = 'none');
            userControls && (userControls.style.display = 'flex');
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
            authControls && (authControls.style.display = 'flex');
            userControls && (userControls.style.display = 'none');
            setUserNameDisplay('Invitado');
            setProfileImage(null);
            if (gridEl) gridEl.innerHTML = '';
            if (empty) empty.style.display = 'block';

            const local = localStorage.getItem('mt_theme') || 'dark';
            applyTheme(local, false);

            const localShow = localStorage.getItem('mt_showTimeBox');
            window.timeBoxEnabled = localShow === '1';
            if (timeBoxSwitch) timeBoxSwitch.checked = window.timeBoxEnabled;
            updateTimeBoxVisibility();
        }
    });

    /* -------- AUTH (login/register) -------- */
    btnLogin?.addEventListener('click', async () => {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const username = (document.getElementById('username').value || 'Usuario').trim();

        if (!email || !password) { alert('Email y contraseña necesarios'); return; }

        try {
            const uc = await signInWithEmailAndPassword(auth, email, password);

            if (!uc.user.emailVerified) {
                alert("Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja.");
                await sendEmailVerification(uc.user);
                await signOut(auth);
                return;
            }

            if (!uc.user.displayName) await updateProfile(uc.user, { displayName: username });

        } catch (err) {
            console.warn("No pudo iniciar sesión, intentando crear cuenta…");

            try {
                const created = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(created.user, { displayName: username });
                await sendEmailVerification(created.user);

                alert("Cuenta creada. Debes verificar tu correo antes de poder iniciar sesión. Revisa inbox/spam.");
                await signOut(auth);

            } catch (e) {
                console.error(e);
                alert('Error creando la cuenta o enviando el correo de verificación');
            }
        }
    });

    /* -------- SETTINGS / PROFILE actions -------- */
    gearBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.innerWidth > 520) {
            settingsMenu.classList.toggle('open');
        }
    });
    document.addEventListener('click', () => settingsMenu && settingsMenu.classList.remove('open'));

    sChangeName?.addEventListener('click', async () => {
        if (!currentUser) return alert('Inicia sesión');
        settingsMenu.classList.remove('open');
        const nameSpan = document.getElementById('user-display');
        if (nameSpan.dataset.editing === '1') return;
        const original = nameSpan.textContent;
        const input = document.createElement('input');
        input.type = 'text'; input.value = original; input.maxLength = 20;
        nameSpan.dataset.editing = '1';
        input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') input.blur(); if (ev.key === 'Escape') { input.value = original; input.blur(); } });
        input.addEventListener('blur', async () => {
            const newName = input.value.trim();
            delete nameSpan.dataset.editing;
            input.remove();
            nameSpan.style.display = 'inline';
            if (!newName || newName === original) return;
            if (newName.length > 20) return alert("Máx 20 caracteres");
            try {
                await updateProfile(currentUser,
                    { displayName: newName });
                await setDoc(doc(db, 'users', currentUser.uid),
                    { displayName: newName },
                    { merge: true });
                setUserNameDisplay(newName);
            } catch (e) {
                console.error(e); alert("Error actualizando nombre");
            }
        });
        nameSpan.style.display = 'none';
        nameSpan.parentElement.prepend(input);
        input.focus();
    });

    sChangePhoto?.addEventListener('click', () => { if (!currentUser) return alert('Inicia sesión'); filePhotoInput.click(); settingsMenu.classList.remove('open'); });

    async function uploadProfilePhoto(file) {
        try {
            if (file.size > 3 * 1024 * 1024) throw new Error("Máximo 3MB");
            const base64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
            await setDoc(prefsDocRef(currentUser.uid), { photoURL: base64 }, { merge: true });
            setProfileImage(base64);
        } catch (err) { alert("Error: " + err.message); }
    }
    filePhotoInput?.addEventListener('change', () => { const f = filePhotoInput.files[0]; if (f) uploadProfilePhoto(f); });

    sSignout?.addEventListener('click', async () => { await signOut(auth); });



    // Mobile settings
    mobileGear?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (mobileSettingsPopup) {
            mobileSettingsPopup.remove();
            mobileSettingsPopup = null;
            return;
        }

        const c = document.createElement('div');
        c.className = 'mobile-settings-popup';

        c.innerHTML = `
    <h3>Ajustes</h3>
    <button id="mb-change-name">✏ Cambiar nombre</button>
    <button id="mb-change-photo">🖼 Cambiar foto</button>
    <button id="mb-toggle-timebox">🕒 Mostrar tiempo consumido</button>
    <div id="mb-theme-grid" style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0;"></div>
    <button id="mb-signout">🚪 Cerrar sesión</button>
    <button id="mb-close">Cerrar</button>
  `;

        document.body.appendChild(c);
        mobileSettingsPopup = c;

        // Evita que al tocar dentro se cierre
        c.addEventListener('click', ev => ev.stopPropagation());

        /* THEMES */
        const g = c.querySelector('#mb-theme-grid');
        Object.keys(THEMES).forEach(k => {
            const d = document.createElement('div');
            d.style.width = '30px';
            d.style.height = '30px';
            d.style.borderRadius = '6px';
            d.style.background = THEMES[k]['--accent-2'];
            d.style.cursor = 'pointer';
            d.onclick = () => { applyTheme(k, true); closeMobileSettings(); };
            g.appendChild(d);
        });

        c.querySelector('#mb-change-name').onclick = async () => {
            const n = prompt("Nuevo nombre:");
            if (!n || n.length > 20) return;
            await updateProfile(currentUser, { displayName: n });
            await setDoc(doc(db, 'users', currentUser.uid), { displayName: n }, { merge: true });
            setUserNameDisplay(n);
            closeMobileSettings();
        };

        c.querySelector('#mb-change-photo').onclick = () => {
            filePhotoInput.click();
            closeMobileSettings();
        };

        c.querySelector('#mb-toggle-timebox').onclick = async () => {
            const v = !window.timeBoxEnabled;
            if (currentUser) {
                await setDoc(prefsDocRef(currentUser.uid), { showTimeBox: v }, { merge: true });
            }
            window.timeBoxEnabled = v;
            localStorage.setItem('mt_showTimeBox', v ? '1' : '0');
            updateTimeBoxVisibility();
            closeMobileSettings();
        };

        c.querySelector('#mb-signout').onclick = async () => {
            await signOut(auth);
            closeMobileSettings();
        };

        c.querySelector('#mb-close').onclick = closeMobileSettings;
    });

    /* cerrar tocando fuera */
    document.addEventListener('click', () => {
        if (mobileSettingsPopup) closeMobileSettings();
    });

    function closeMobileSettings() {
        if (mobileSettingsPopup) {
            mobileSettingsPopup.remove();
            mobileSettingsPopup = null;
        }
    }

    /* Mobile profile click */
    mobileProfile.addEventListener('click', () => {
        if (currentUser) alert(`Perfil: ${currentUser.displayName || currentUser.email}`);
        else alert('Invitado');
    });

    /* ---------- DATA / CARDS ---------- */
    /* categories */
    const categories = {
        Manga: ['Acción', 'Aventura', 'Comedia', 'Drama', 'Misterio', 'Fantasía', 'Romance', 'Seinen', 'Shonen', 'Otro'],
        Anime: ['Acción', 'Aventura', 'Comedia', 'Drama', 'Misterio', 'Fantasía', 'Romance', 'Slice of Life', 'Mecha', 'Isekai', 'Otro'],
    };

    const fields = ['title', 'genre', 'last', 'url', 'imgurl', 'type'];
    const typeSelect = document.getElementById('type');
    const genreSelect = document.getElementById('genre');
    function updateGenres() {
        if (!typeSelect || !genreSelect) return;
        genreSelect.innerHTML = '';
        categories[typeSelect.value].forEach(c => {
            const o = document.createElement('option');
            o.value = o.textContent = c; genreSelect.appendChild(o);
        });
    }
    typeSelect?.addEventListener('change', updateGenres);
    updateGenres();

    /* ======= SAGA DETECTION ====== */

    function getBaseName(title) {
        if (!title) return "";

        let t = title.toLowerCase();

        // Delete common saga/season words
        t = t.replace(/\b(season|temporada|temp|part|parte|saga|arc|chapter|capítulo|capitulo|ova|special|movie|film)\b/g, "");

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
    document.getElementById('fakefile')?.addEventListener('click', () => document.getElementById('file')?.click());
    document.getElementById('file')?.addEventListener('change', () => {
        const f = document.getElementById('file').files[0]; if (!f) return;
        const r = new FileReader();
        r.onload = () => { preview.innerHTML = `<img src="${r.result}" style="max-width:120px;border-radius:6px">`; preview.dataset.image = r.result; };
        r.readAsDataURL(f);
    });
    document.getElementById('imgurl')?.addEventListener('change', (e) => { const v = e.target.value.trim(); preview.dataset.image = v; preview.innerHTML = v ? `<img src="${v}" style="max-width:120px;border-radius:6px">` : ''; });

    /* -------- UI helper: toggle buttons according to filter -------- */
    function setButtonsForFilter(filter) {
        currentFilter = filter;

        // PC
        if (btnFinalizadosPC) btnFinalizadosPC.style.display = (filter === 'finished') ? 'none' : 'inline-block';
        if (btnVolverPC) btnVolverPC.style.display = (filter === 'finished') ? 'inline-block' : 'none';

        // Mobile
        if (btnFinalizadosMobile) btnFinalizadosMobile.style.display = (filter === 'finished') ? 'flex' : 'flex';
        if (btnHomeMobile) btnHomeMobile.style.opacity = (filter === 'finished') ? 1 : 0.5;
    }

    filterToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        filterBox.classList.toggle('hidden');
    });

    filterBox?.addEventListener('click', e => e.stopPropagation());
    filterBox?.addEventListener('mousedown', e => e.stopPropagation());

    document.addEventListener('click', () => {
        filterBox?.classList.add('hidden');
    });

    /* -------- LOAD MANGAS (reading | finished) -------- */
    async function loadMangas(status = 'reading') {

        // 🔹 Mostrar skeleton
        gridEl.innerHTML = '';

        for (let i = 0; i < 6; i++) {
            const sk = document.createElement('div');
            sk.className = 'skeleton-card';
            sk.innerHTML = `
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    `;
            gridEl.appendChild(sk);
        }

        try {

            if (!currentUser) {
                gridEl.innerHTML = ''; // 🔥 limpiar skeleton
                if (empty) empty.style.display = 'block';
                return;
            }

            const col = collection(db, 'users', currentUser.uid, 'mangas');
            const snap = await getDocs(col);
            const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

            const filtered = items.filter(it => (it.status || 'reading') === status);

            gridEl.innerHTML = '';

            if (filtered.length === 0) {
                if (empty) empty.style.display = 'block';
                setButtonsForFilter(status);
                return;
            }

            if (empty) empty.style.display = 'none';
            setButtonsForFilter(status);

            const tipos = ['Manga', 'Anime'];

            tipos.forEach(tipo => {

                const group = filtered
                    .filter(it => it.type === tipo)
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

                const header = document.createElement('h2');
                header.textContent = tipo;
                header.className = 'tipo-header';
                header.style.gridColumn = '1 / -1';
                gridEl.appendChild(header);

                group.forEach(it => {

                    const card = document.createElement('article');
                    card.className = 'card';
                    card.dataset.id = it.id;

                    const last = Number(it.last) || 0;
                    const total = Number(it.lastKnownChapters) || 0;

                    let progressHTML = '';

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
            ${it.imgurl ? `<img src="${it.imgurl}" style="width:100%;height:100%;object-fit:cover">` : ''}
          </div>

          <div class="meta">
            <div class="title">${it.title}</div>
            <div class="genre">${it.genre}</div>
            <div class="last">Últ.: <strong>${last}</strong></div>

            ${progressHTML}

            ${status === 'reading'
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
            <a class="link" href="${it.url || '#'}" target="_blank" rel="noopener">Ir →</a>
            <div style="display:flex;gap:6px;">
              <button type="button" class="small edit-btn" data-id="${it.id}">Editar</button>
              <button type="button" class="small del-btn" data-id="${it.id}"
                style="background:transparent;border:1px solid rgba(255,255,255,0.12)">
                Borrar
              </button>
            </div>
          </div>
        `;

                    gridEl.appendChild(card);
                });
            });

            /* ===== EVENTOS ===== */

            gridEl.querySelectorAll('.edit-btn')
                .forEach(b => {
                    b.onclick = (e) => {
                        e.stopPropagation();
                        openForm(b.dataset.id);
                    };
                });

            gridEl.querySelectorAll('.del-btn')
                .forEach(b => {
                    b.onclick = async (e) => {
                        e.stopPropagation();
                        if (!confirm("¿Eliminar?")) return;

                        await deleteDoc(doc(db, 'users', currentUser.uid, 'mangas', b.dataset.id));
                        await loadMangas(status);
                    };
                });

            if (status === 'reading') {

                gridEl.querySelectorAll('.card').forEach(card => {
                    card.onclick = async (e) => {

                        if (
                            e.target.closest('button') ||
                            e.target.closest('a') ||
                            e.target.closest('.finish-box')
                        ) return;

                        const id = card.dataset.id;
                        const docRef = doc(db, 'users', currentUser.uid, 'mangas', id);
                        const snap = await getDoc(docRef);
                        if (!snap.exists()) return;

                        let delta = e.shiftKey
                            ? parseInt(prompt("¿Cuántos sumar?", "1"))
                            : 1;

                        if (!delta || delta <= 0) return;

                        const old = Number(snap.data().last) || 0;
                        const totalS = Number(snap.data().lastKnownChapters) || 0;

                        let newValue = old + delta;

                        if (totalS > 0) {
                            if (old >= totalS) return;
                            if (newValue >= totalS) {
                                newValue = totalS

                                selectedToFinish = snap.id;
                                showFinishModal();
                                finishModal.querySelector("h3").textContent = `¿Marcar "${snap.data().title}" como terminado?`;
                                finishModal.querySelector("p").textContent = `Has alcanzado el último capítulo (${totalS}). ¿Quieres marcarlo como terminado?`;
                            };
                        }

                        await updateDoc(docRef, { last: String(newValue) });

                        const strong = card.querySelector('.last strong');
                        if (strong) strong.textContent = String(newValue);

                        if (totalS > 0) {
                            const percent = Math.min((newValue / totalS) * 100, 100);
                            const fill = card.querySelector('.progress-fill');
                            const text = card.querySelector('.progress-text');

                            if (fill) fill.style.width = percent + "%";
                            if (text) text.textContent = `${newValue} / ${totalS}`;
                        }

                        if (window.timeBoxEnabled) calculateTotalTime();
                    };
                });

                gridEl.querySelectorAll('.finish-check')
                    .forEach(chk => {
                        chk.onchange = () => {
                            if (chk.checked) {
                                selectedToFinish = chk.dataset.id;
                                showFinishModal();
                            }
                        };
                    });
            }

            if (status === 'finished') {
                gridEl.querySelectorAll('.restore-btn')
                    .forEach(btn => {
                        btn.onclick = async (e) => {
                            e.stopPropagation();

                            await updateDoc(
                                doc(db, 'users', currentUser.uid, 'mangas', btn.dataset.id),
                                { status: 'reading' }
                            );

                            await loadMangas('reading');
                        };
                    });
            }

            if (window.timeBoxEnabled) calculateTotalTime();

        } catch (err) {
            console.error(err);
            gridEl.innerHTML = '';
        }
    }

    /* -------- FINISH MODAL HANDLERS -------- */
    const finishModal = document.getElementById('finish-modal');
    const finishConfirm = document.getElementById('finish-confirm');
    const finishCancel = document.getElementById('finish-cancel');

    const originalH3 = finishModal.querySelector("h3").textContent;
    const originalP = finishModal.querySelector("p").textContent;

    function showFinishModal() { if (finishModal) finishModal.classList.remove('hidden'); }
    function hideFinishModal() { if (finishModal) finishModal.classList.add('hidden'); selectedToFinish = null; finishModal.querySelector("h3").textContent = originalH3; finishModal.querySelector("p").textContent = originalP; }

    finishCancel?.addEventListener('click', () => { if (finishModal) hideFinishModal(); });
    finishConfirm?.addEventListener('click', async () => {
        if (!selectedToFinish) { hideFinishModal(); return; }
        try {
            await updateDoc(doc(db, 'users', currentUser.uid, 'mangas', selectedToFinish), { status: 'finished' });
            // reload view according to currentFilter (setButtonsForFilter already updates currentFilter)
            hideFinishModal();
            await loadMangas(currentFilter);
        } catch (e) { console.error(e); hideFinishModal(); }
    });

    /* -------- FORM OPEN/CLOSE/SAVE -------- */
    function openForm(id = null) {
        editId = id;
        document.getElementById('form-title').textContent = id ? "Editar" : "Añadir";
        fields.forEach(f => { const el = document.getElementById(f); if (el) el.value = ''; });
        preview.innerHTML = ''; preview.dataset.image = '';
        if (id) {
            getDoc(doc(db, 'users', currentUser.uid, 'mangas', id)).then(s => {
                if (!s.exists()) return;
                const d = s.data();
                const t = document.getElementById('title'); if (t) t.value = d.title || "";
                const l = document.getElementById('last'); if (l) l.value = d.last || "";
                const u = document.getElementById('url'); if (u) u.value = d.url || "";
                const tp = document.getElementById('type'); if (tp) tp.value = d.type || "Manga";
                updateGenres();
                const g = document.getElementById('genre'); if (g) g.value = d.genre || "";
                if (d.imgurl) { preview.innerHTML = `<img src="${d.imgurl}" style="max-width:120px;border-radius:6px">`; preview.dataset.image = d.imgurl; }
            }).catch(e => console.error(e));
        }
        if (window.innerWidth <= 520) { document.getElementById('mobile-bar').style.display = 'none'; }
        modal && modal.classList.add('open');
    }
    function closeForm() {
        modal && modal.classList.remove('open'); editId = null;
        if (window.innerWidth <= 520) { document.getElementById('mobile-bar').style.display = 'flex'; }
    }

    /* --- IMPORTANT: listeners for Add buttons (fix for the issue) --- */
    btnAdd?.addEventListener('click', () => { openForm(); });
    mobileAdd?.addEventListener('click', () => { openForm(); });

    btnSave?.addEventListener('click', async () => {
        if (!currentUser) return alert("Inicia sesión");
        const data = {};
        fields.forEach(f => { const el = document.getElementById(f); data[f] = el ? el.value : ""; });
        data.imgurl = preview.dataset.image || "";
        data.status = data.status || "reading";
        const colRef = collection(db, 'users', currentUser.uid, 'mangas');
        try {
            if (editId) { await setDoc(doc(db, 'users', currentUser.uid, 'mangas', editId), data, { merge: true }); }
            else { await addDoc(colRef, data); }
            closeForm();
            await loadMangas(currentFilter);
        } catch (e) { console.error(e); alert("Error guardando"); }
    });
    btnCancel?.addEventListener('click', closeForm);
    modal?.addEventListener('click', e => { if (e.target === modal) closeForm(); });

    /* -------- TIME BOX -------- */
    function updateTimeBoxVisibility() {
        if (!timeBox) return;
        if (window.timeBoxEnabled) { timeBox.style.display = 'flex'; calculateTotalTime(); } else { timeBox.style.display = 'none'; }
    }

    timeBoxSwitch?.addEventListener('change', async () => {
        const v = timeBoxSwitch.checked;
        if (currentUser) { try { await setDoc(prefsDocRef(currentUser.uid), { showTimeBox: v }, { merge: true }); } catch (e) { console.error(e); } }
        else localStorage.setItem('mt_showTimeBox', v ? '1' : '0');
        window.timeBoxEnabled = v;
        updateTimeBoxVisibility();
    });

    async function calculateTotalTime() {
        if (!currentUser || !timeBoxValue) {
            if (timeBoxValue) timeBoxValue.textContent = '0d 0h 0m';
            return;
        }

        const col = collection(db, "users", currentUser.uid, "mangas");
        const snap = await getDocs(col);
        let totalMinutes = 0;

        snap.docs.forEach(d => {
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
    }


    /* -------- BUTTONS: Finished / Come Back / mobile home -------- */
    async function goHome() {
        currentView = 'home';
        zmResults && (zmResults.innerHTML = '');
        await loadMangas('reading');
        applyView();
    }

    async function goFinished() {
        closeMobileSettings();
        currentView = 'finished';
        zmResults && (zmResults.innerHTML = '');
        await loadMangas('finished');
        applyView();
    }

    function goSearch() {
        closeMobileSettings();
        currentView = 'search';
        gridEl.innerHTML = '';
        applyView();
    }

    function volverDesdeBusqueda() {
        currentView = 'home';
        zmResults && (zmResults.innerHTML = '');
        loadMangas('reading');
        applyView();
    }

    btnVolverSearch?.addEventListener('click', volverDesdeBusqueda);

    btnFinalizadosPC?.addEventListener('click', () => {
        if (currentView === 'finished') goHome();
        else goFinished();
    });

    btnFinalizadosMobile?.addEventListener('click', () => {
        if (currentView === 'finished') goHome();
        else goFinished();
    });
    btnVolverPC?.addEventListener('click', goHome);
    btnHomeMobile?.addEventListener('click', goHome);

    /* -------- INITIAL LOCAL THEME & TIMEBOX ON PAGE LOAD -------- */
    window.addEventListener('load', () => {
        const local = localStorage.getItem('mt_theme') || 'dark';
        applyTheme(local, false);
        const localShow = localStorage.getItem('mt_showTimeBox');
        window.timeBoxEnabled = localShow === '1';
        if (timeBoxSwitch) timeBoxSwitch.checked = window.timeBoxEnabled;
        updateTimeBoxVisibility();
    });

    /* prevent settings menu from closing while interacting */
    settingsMenu?.addEventListener('click', e => e.stopPropagation());

    const originalTitle = document.title;

    document.addEventListener('click', (e) => {

        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        if (href.includes('zonatmo')) {
            document.title = 'Leyendo...';
        }
        else if (href.includes('animeflv')) {
            document.title = 'Viendo...';
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            document.title = originalTitle;
        }
    });
}); // DOMContentLoaded end

