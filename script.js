/* ===========================
   XO Nights Invite + Quiz (Kissland Version)
   =========================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Elements ---------- */
  const startBtn = document.getElementById("startBtn");
  const memoryGrid = document.getElementById("memoryGrid");
  const lyricReveal = document.getElementById("lyricReveal");
  const finalMessage = document.getElementById("finalMessage");
  const music = document.getElementById("bgMusic");

  /* ---------- Memory Game Config ---------- */
  const TOTAL_PAIRS = 4;
  
  // Card symbols (emojis representing the themes)
  const cardSymbols = [
    { id: 1, symbol: '🐱', name: 'neon-cat', lyric: 'Adapted' },
    { id: 2, symbol: '🐱', name: 'neon-cat', lyric: 'Adapted' },
    { id: 3, symbol: '🏮', name: 'lantern', lyric: 'to' },
    { id: 4, symbol: '🏮', name: 'lantern', lyric: 'to' },
    { id: 5, symbol: '🌆', name: 'tokyo', lyric: 'these' },
    { id: 6, symbol: '🌆', name: 'tokyo', lyric: 'these' },
    { id: 7, symbol: '✖️⭕', name: 'xo', lyric: 'models' },
    { id: 8, symbol: '✖️⭕', name: 'xo', lyric: 'models' }
  ];

  // XO rain config - Green shades for Kissland
  const XO_RAIN_DURATION_MS = 5000;
  const XO_COLORS = ["#00ff7f", "#00cc66", "#00994d", "#66ff99", "#33ff77"];

  let hasFlippedCard = false;
  let lockBoard = false;
  let firstCard, secondCard;
  let matchedPairs = 0;
  let gameComplete = false;
  let musicStarted = false;
  let finishing = false;

  // Prevent touch scrolling while locked (mobile)
  function preventScroll(e) {
    if (document.body.classList.contains("locked")) {
      e.preventDefault();
    }
  }
  window.addEventListener("touchmove", preventScroll, { passive: false });

  /* ---------- Page nav ---------- */
  function showOnlyPage(pageNumber) {
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    const el = document.getElementById("page" + pageNumber);
    if (el) el.classList.add("active");
  }

  /* ---------- Music ---------- */
  function startMusic() {
    if (musicStarted || !music) return;

    music.volume = 0;
    music.play().catch(() => {});
    musicStarted = true;

    const fade = setInterval(() => {
      if (music.volume < 0.6) {
        music.volume = Math.min(0.6, music.volume + 0.05);
      } else {
        clearInterval(fade);
      }
    }, 180);
  }

  /* ---------- Shuffle ---------- */
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /* ---------- Memory Game ---------- */
  function initMemoryGame() {
    if (!memoryGrid) return;

    // Reset game state
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
    matchedPairs = 0;
    gameComplete = false;
    finishing = false;

    // Clear grid and lyric reveal
    memoryGrid.innerHTML = '';
    lyricReveal.innerHTML = '';
    finalMessage.classList.remove('show');

    // Create placeholder slots for lyrics
    const lyricWords = ['Adapted', 'to', 'these', 'models'];
    lyricWords.forEach((word, index) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'lyric-word';
      wordSpan.id = `lyric-${index}`;
      wordSpan.textContent = '___';
      lyricReveal.appendChild(wordSpan);
    });

    // Shuffle and create cards
    const shuffledCards = shuffle([...cardSymbols]);
    
    shuffledCards.forEach((cardData) => {
      const card = createCard(cardData);
      memoryGrid.appendChild(card);
    });
  }

  function createCard(cardData) {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.name = cardData.name;
    card.dataset.lyric = cardData.lyric;

    card.innerHTML = `
      <div class="memory-card-inner">
        <div class="memory-card-front">
          <span class="card-symbol">💚</span>
        </div>
        <div class="memory-card-back">
          <span class="card-symbol">${cardData.symbol}</span>
        </div>
      </div>
    `;

    card.addEventListener('click', flipCard);
    return card;
  }

  function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;
    if (this.classList.contains('matched')) return;
    if (gameComplete) return;

    this.classList.add('flipped');

    if (!hasFlippedCard) {
      hasFlippedCard = true;
      firstCard = this;
      return;
    }

    secondCard = this;
    checkForMatch();
  }

  function checkForMatch() {
    let isMatch = firstCard.dataset.name === secondCard.dataset.name;

    if (isMatch) {
      disableCards();
    } else {
      unflipCards();
    }
  }

  function disableCards() {
    lockBoard = true;

    setTimeout(() => {
      firstCard.classList.add('matched');
      secondCard.classList.add('matched');
      
      // Reveal lyric word
      revealLyric(firstCard.dataset.lyric);
      
      matchedPairs++;
      
      resetBoard();

      if (matchedPairs === TOTAL_PAIRS) {
        setTimeout(() => {
          completeGame();
        }, 800);
      }
    }, 600);
  }

  function revealLyric(word) {
    const lyricMap = {
      'Adapted': 0,
      'to': 1,
      'these': 2,
      'models': 3
    };

    const index = lyricMap[word];
    const lyricElement = document.getElementById(`lyric-${index}`);
    if (lyricElement) {
      lyricElement.textContent = word;
      lyricElement.classList.add('revealed');
    }
  }

  function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetBoard();
    }, 1000);
  }

  function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
  }

  function completeGame() {
    gameComplete = true;
    finishing = true;
    
    // Show final message
    finalMessage.classList.add('show');

    // Start XO rain after a short delay
    setTimeout(() => {
      startXORain(XO_RAIN_DURATION_MS);
    }, 1000);
  }

  /* ---------- XO Rain (Green Shades for Kissland) ---------- */
  function startXORain(durationMs) {
    const page1 = document.getElementById("page1");

    let layer = document.getElementById("xoRainLayer");
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "xoRainLayer";
      document.body.appendChild(layer);
    }

    const start = Date.now();

    const spawn = () => {
      const burst = rand(10, 18);
      for (let i = 0; i < burst; i++) {
        const piece = document.createElement("div");
        piece.className = "xo-piece";
        piece.textContent = "XO";

        const left = rand(0, window.innerWidth);
        const duration = rand(1800, 3200);
        const drift = rand(-140, 140) + "px";
        const rot = rand(-540, 540) + "deg";

        piece.style.left = left + "px";
        piece.style.animationDuration = duration + "ms";
        piece.style.color = XO_COLORS[rand(0, XO_COLORS.length - 1)];
        piece.style.setProperty("--drift", drift);
        piece.style.setProperty("--rot", rot);

        layer.appendChild(piece);
        setTimeout(() => piece.remove(), duration + 150);
      }
    };

    // Start raining immediately
    spawn();
    const rainTimer = setInterval(() => {
      spawn();
      if (Date.now() - start >= durationMs) {
        clearInterval(rainTimer);

        // Fade page1 out, then reveal scroll invite
        if (page1) page1.classList.add("fade-out");

        setTimeout(() => {
          cleanupXORain();
          finishGame();
        }, 850);
      }
    }, 140);
  }

  function cleanupXORain() {
    const layer = document.getElementById("xoRainLayer");
    if (layer) layer.remove();
  }

  /* ---------- Unlock scrolling after game ---------- */
  function finishGame() {
    document.body.classList.remove("locked");
    document.body.classList.add("scroll-mode");

    const page2 = document.getElementById("page2");
    setTimeout(() => {
      page2?.scrollIntoView({ behavior: "smooth" });
    }, 350);
  }

  /* ---------- Helpers ---------- */
  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /* ---------- Start button ---------- */
  function startExperience() {
    showOnlyPage(1);
    startMusic();
    initMemoryGame();
  }

  // Mobile-proof start
  if (startBtn) {
    let started = false;
    const onceStart = (e) => {
      if (started) return;
      started = true;
      e?.preventDefault?.();
      startExperience();
    };

    startBtn.addEventListener("pointerup", onceStart, { passive: false });
    startBtn.addEventListener("touchend", onceStart, { passive: false });
    startBtn.addEventListener("click", onceStart);
  }

  /* ===========================
     QUIZ (Kissland)
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
    "kissland-quiz": "You're the main character. Dark glam, neon heart, fearless energy.",
    "adaptation": "Soft on the outside, deep on the inside. You feel everything.",
    "professional": "Luxury vibe. Calm, composed… but you know your power.",
    "belong-to-the-world": "Mysterious magnetism. You don't chase — you attract.",
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
      try {
        music.currentTime = _inviteTime || 0;
      } catch (e) {}
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

    setTimeout(() => {
      if (quizScreen) quizScreen.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: "auto" });
    }, 0);
  }

  function closeQuiz() {
    document.body.classList.remove("quiz-open");
    quizScreen?.setAttribute("aria-hidden", "true");
    stopResultAudio();

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

    const scores = Object.fromEntries(SONG_KEYS.map((k) => [k, 0]));

    for (const [key, value] of data.entries()) {
      if (key === "guestName") continue;
      if (scores[value] !== undefined) scores[value] += 1;
    }

    const max = Math.max(...Object.values(scores));
    const top = Object.keys(scores).filter((k) => scores[k] === max);
    const chosen = top[Math.floor(Math.random() * top.length)];

    return { chosen, guestName };
  }

  function playResultSong(songKey) {
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

    const scrollToFullResult = () => {
      quizResult.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => window.scrollBy({ top: -16, left: 0, behavior: "auto" }), 350);
    };

    setTimeout(scrollToFullResult, 180);

    if (resultCover) {
      resultCover.onload = () => {
        setTimeout(scrollToFullResult, 60);
      };
    }
  }

  openQuizBtn?.addEventListener("click", openQuiz);
  quizBackBtn?.addEventListener("click", closeQuiz);
  quizCloseBtn?.addEventListener("click", closeQuiz);

  quizRetryBtn?.addEventListener("click", () => {
    resetQuizUI();
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
