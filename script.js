document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const music = document.getElementById("bgMusic");

  let unlocked = false;
  let litCount = 0;
  let lastTap = { x: 50, y: 50 };

  const REQUIRED_WINDOWS = 10;

  const BUILDING_ZONES = [
    { xMin: 6,  xMax: 18, yMin: 42, yMax: 76 },
    { xMin: 20, xMax: 30, yMin: 38, yMax: 74 },
    { xMin: 32, xMax: 46, yMin: 35, yMax: 78 },
    { xMin: 48, xMax: 62, yMin: 40, yMax: 80 },
    { xMin: 64, xMax: 76, yMin: 36, yMax: 78 },
    { xMin: 78, xMax: 92, yMin: 42, yMax: 76 },
  ];

  function showOnlyPage(pageNumber){
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const el = document.getElementById("page" + pageNumber);
    if (el) el.classList.add("active");
  }

  function startMusic(){
    if (!music) return;
    music.volume = 0;
    music.play().catch(()=>{});
    const fade = setInterval(() => {
      if (music.volume < 0.7){
        music.volume = Math.min(0.7, music.volume + 0.05);
      } else {
        clearInterval(fade);
      }
    }, 150);
  }

  startBtn?.addEventListener("click", () => {
    showOnlyPage(1);
    startMusic();
    setupCityGame();
  });

  /* ================= CITY GAME ================= */

  function setupCityGame(){
    const container = document.getElementById("cityContainer");
    if (!container) return;

    container.innerHTML = "";
    litCount = 0;
    unlocked = false;

    const placed = [];

    for (let i = 0; i < REQUIRED_WINDOWS; i++){
      const windowLight = document.createElement("div");
      windowLight.classList.add("window-light");

      const pos = pickNonOverlappingWindowPos(placed);
      placed.push(pos);

      windowLight.style.left = pos.x + "%";
      windowLight.style.top  = pos.y + "%";

      windowLight.addEventListener("click", (e) => {
        if (unlocked || windowLight.classList.contains("lit")) return;

        const rect = container.getBoundingClientRect();
        lastTap.x = ((e.clientX - rect.left) / rect.width) * 100;
        lastTap.y = ((e.clientY - rect.top) / rect.height) * 100;

        windowLight.classList.add("lit");
        litCount++;

        if (litCount >= REQUIRED_WINDOWS){
          unlockCity();
        }
      });

      container.appendChild(windowLight);
    }

    requestAnimationFrame(() => container.classList.add("game-ready"));
  }

  function pickNonOverlappingWindowPos(placed){
    const minDist = 6.5;
    let tries = 0;

    while (tries < 250){
      tries++;

      const zone = BUILDING_ZONES[Math.floor(Math.random() * BUILDING_ZONES.length)];
      const x = rand(zone.xMin, zone.xMax);
      const y = rand(zone.yMin, zone.yMax);

      const ok = placed.every(p => distPct(p.x, p.y, x, y) >= minDist);
      if (ok) return { x, y };
    }

    return { x: rand(10, 90), y: rand(40, 80) };
  }

  function rand(min, max){
    return Math.random() * (max - min) + min;
  }

  function distPct(x1, y1, x2, y2){
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx*dx + dy*dy);
  }

  function unlockCity(){
    unlocked = true;

    const city = document.getElementById("cityContainer");
    const flood = document.getElementById("neonFlood");
    if (!city || !flood) return;

    city.classList.add("emerald");
    createEmeraldRipple(city, lastTap.x, lastTap.y);

    setTimeout(() => {
      city.classList.add("zooming");
    }, 420);

    setTimeout(() => {
      flood.style.setProperty("--origin-x", lastTap.x + "%");
      flood.style.setProperty("--origin-y", lastTap.y + "%");
      flood.style.setProperty("--center-x", lastTap.x + "%");
      flood.style.setProperty("--center-y", lastTap.y + "%");

      flood.classList.remove("flooding");
      void flood.offsetWidth;
      flood.classList.add("flooding");
    }, 720);

    setTimeout(() => {
      document.body.classList.remove("locked");
      document.body.classList.add("scroll-mode");

      flood.classList.remove("flooding");
      flood.style.opacity = "0";
      city.classList.remove("zooming");

      document.getElementById("page2")?.scrollIntoView({behavior:"smooth"});
    }, 1450);
  }

  function createEmeraldRipple(container, xPct, yPct){
    const ripple = document.createElement("div");
    ripple.className = "emerald-ripple";
    ripple.style.left = xPct + "%";
    ripple.style.top = yPct + "%";

    container.appendChild(ripple);
    void ripple.offsetWidth;
    ripple.classList.add("go");

    setTimeout(() => ripple.remove(), 900);
  }

  /* ===========================
     QUIZ (KISSLAND)
     =========================== */

  const openQuizBtn = document.getElementById("openQuizBtn");
  const quizBackBtn = document.getElementById("quizBackBtn");
  const quizCloseBtn = document.getElementById("quizCloseBtn");
  const quizFinishBtn = document.getElementById("quizFinishBtn");
  const quizRetryBtn = document.getElementById("quizRetryBtn");

  const quizScreen = document.getElementById("pageQuiz");
  const quizForm = document.getElementById("quizForm");
  const quizResult = document.getElementById("quizResult");
  const quizResultInner = document.getElementById("quizResultInner");
  const quizOverlay = document.getElementById("quizOverlay");
  const resultCover = document.getElementById("resultCover");
  const resultBlurb = document.getElementById("resultBlurb");
  const guestNameInput = document.getElementById("guestName");

  const resultAudio = document.getElementById("resultAudio");

  const SONG_KEYS = [
    "kissland-quiz",
    "adaptation",
    "professional",
    "belong-to-the-world",
    "wanderlust",
  ];

  const SONG_PRETTY = {
    "kissland-quiz": "Kiss Land",
    "adaptation": "Adaptation",
    "professional": "Professional",
    "belong-to-the-world": "Belong To The World",
    "wanderlust": "Wanderlust",
  };

  const SONG_BLURB = {
    "kissland-quiz": "You’re the main character. Dark glam, neon heart, fearless energy.",
    "adaptation": "Soft on the outside, deep on the inside. You feel everything.",
    "professional": "Luxury vibe. Calm, composed… but you know your power.",
    "belong-to-the-world": "Mysterious magnetism. You don’t chase — you attract.",
    "wanderlust": "Free spirit energy. Fun, flirty, and always down for an adventure.",
  };

  let _inviteWasPlaying = false;
  let _inviteTime = 0;
  let _scrollYBeforeQuiz = 0;

  function stopResultAudio() {
    if (!resultAudio) return;
    resultAudio.pause();
    resultAudio.currentTime = 0;
    resultAudio.removeAttribute("src");
  }

  function enterQuizAudioMode() {
    stopResultAudio();

    if (!music) return;
    _inviteWasPlaying = !music.paused;
    _inviteTime = music.currentTime || 0;
    music.pause();
  }

  function exitQuizAudioMode() {
    stopResultAudio();

    if (!music) return;
    if (_inviteWasPlaying) {
      try { music.currentTime = _inviteTime || 0; } catch (e) {}
      music.play().catch(() => {});
    }
  }

  function resetQuizUI() {
    quizForm?.reset();

    if (quizResult) quizResult.style.display = "none";
    if (quizResultInner) {
      quizResultInner.classList.remove("show");
      quizResultInner.innerHTML = "";
    }
    if (resultCover) {
      resultCover.classList.remove("show");
      resultCover.removeAttribute("src");
    }
    if (resultBlurb) resultBlurb.textContent = "";
    quizOverlay?.classList.remove("on");
  }

  function openQuiz() {
    _scrollYBeforeQuiz = window.scrollY || 0;
    enterQuizAudioMode();
    resetQuizUI();

    document.body.classList.add("quiz-open");
    quizScreen?.setAttribute("aria-hidden", "false");

    // snap to top (so the quiz always starts clean)
    setTimeout(() => {
      if (quizScreen) quizScreen.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: "auto" });
    }, 0);
  }

  function closeQuiz() {
    document.body.classList.remove("quiz-open");
    quizScreen?.setAttribute("aria-hidden", "true");
    stopResultAudio();

    // go back to where they were on the invite
    setTimeout(() => {
      window.scrollTo({ top: _scrollYBeforeQuiz, behavior: "auto" });
    }, 0);

    exitQuizAudioMode();
  }

  function computeQuizResult() {
    if (!quizForm) return { error: "Quiz not found." };

    const guestName = (guestNameInput?.value || "").trim();
    if (!guestName) return { error: "Enter your name first." };

    const data = new FormData(quizForm);

    for (let i = 1; i <= 6; i++) {
      if (!data.get("q" + i)) return { error: "Answer all 6 questions first." };
    }

    const scores = Object.fromEntries(SONG_KEYS.map(k => [k, 0]));

    for (const [key, value] of data.entries()) {
      if (key === "guestName") continue;
      if (scores[value] !== undefined) scores[value] += 1;
    }

    const max = Math.max(...Object.values(scores));
    const top = Object.keys(scores).filter(k => scores[k] === max);
    const chosen = top[Math.floor(Math.random() * top.length)];

    return { chosen, guestName };
  }

  function playResultSong(songKey) {
    // Ensure invite music stays stopped while result plays
    music?.pause();

    if (resultCover) {
      resultCover.src = `${songKey}.jpg`;
      resultCover.classList.add("show");
    }

    if (resultAudio) {
      resultAudio.pause();
      resultAudio.currentTime = 0;
      resultAudio.src = `${songKey}.mp3`;
      resultAudio.load();
      resultAudio.play().catch(() => {});
    }
  }

  function revealQuizResult(songKey, guestName) {
    if (!quizResult || !quizResultInner) return;

    quizResult.style.display = "block";

    quizResultInner.classList.remove("show");
    quizResultInner.innerHTML = `
      <h2>${guestName}, you are <span>${SONG_PRETTY[songKey] || "a Mystery Track"}</span></h2>
    `;

    if (resultBlurb) resultBlurb.textContent = SONG_BLURB[songKey] || "";

    if (quizOverlay) {
      quizOverlay.classList.add("on");
      setTimeout(() => quizOverlay.classList.remove("on"), 900);
    }

    requestAnimationFrame(() => quizResultInner.classList.add("show"));

    playResultSong(songKey);

    // Change 5: auto-scroll so the FULL reveal is visible (heading + image + blurb + buttons)
    const scrollToFullResult = () => {
      // first scroll the result card to top of view
      quizResult.scrollIntoView({ behavior: "smooth", block: "start" });

      // then nudge down a bit so the image + buttons are visible nicely
      setTimeout(() => {
        window.scrollBy({ top: 140, left: 0, behavior: "smooth" });
      }, 350);

      // and one more small nudge in case the image loads late
      setTimeout(() => {
        window.scrollBy({ top: 80, left: 0, behavior: "smooth" });
      }, 900);
    };

    setTimeout(scrollToFullResult, 180);

    if (resultCover) {
      resultCover.onload = () => setTimeout(scrollToFullResult, 80);
    }
  }

  openQuizBtn?.addEventListener("click", openQuiz);
  quizBackBtn?.addEventListener("click", closeQuiz);
  quizCloseBtn?.addEventListener("click", closeQuiz);

  quizRetryBtn?.addEventListener("click", () => {
    resetQuizUI();
    stopResultAudio();
    if (quizScreen) quizScreen.scrollTop = 0;
  });

  quizFinishBtn?.addEventListener("click", () => {
    const res = computeQuizResult();

    if (res.error) {
      if (!quizResult || !quizResultInner) return;
      quizResult.style.display = "block";
      quizResultInner.classList.remove("show");
      quizResultInner.innerHTML = `<h2>Hold up</h2><p>${res.error}</p>`;
      if (resultBlurb) resultBlurb.textContent = "";
      requestAnimationFrame(() => quizResultInner.classList.add("show"));
      setTimeout(() => quizResult.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      return;
    }

    revealQuizResult(res.chosen, res.guestName);
  });
});
