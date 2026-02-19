const startBtn = document.getElementById("startBtn");
const music = document.getElementById("bgMusic");

let unlocked = false;
let litCount = 0;
let lastTap = { x: 50, y: 50 };

/**
 * Fewer taps + more deliberate placement so the windows line up with the skyline.
 */
const REQUIRED_WINDOWS = 10;

/**
 * Rough building “zones” (percent-based) so windows sit where buildings are.
 * xMin/xMax: 0-100 across the container
 * yMin/yMax: 0-100 from top (higher number = lower on screen)
 */
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
    if(el) el.classList.add("active");
}

startBtn?.addEventListener("click", () => {
    showOnlyPage(1);
    startMusic();
    setupCityGame();
});

function startMusic(){
    if(!music) return;
    music.volume = 0;
    music.play().catch(()=>{});
    const fade = setInterval(() => {
        if(music.volume < 0.7){
            music.volume += 0.05;
        } else {
            clearInterval(fade);
        }
    }, 150);
}

/* ================= CITY GAME ================= */

function setupCityGame(){
    const container = document.getElementById("cityContainer");
    if(!container) return;

    container.innerHTML = "";
    litCount = 0;
    unlocked = false;

    // Keep windows from spawning on top of each other
    const placed = [];

    for(let i = 0; i < REQUIRED_WINDOWS; i++){
        const windowLight = document.createElement("div");
        windowLight.classList.add("window-light");

        const pos = pickNonOverlappingWindowPos(placed);
        placed.push(pos);

        windowLight.style.left = pos.x + "%";
        windowLight.style.top  = pos.y + "%";

        windowLight.addEventListener("click", (e) => {
            if(unlocked || windowLight.classList.contains("lit")) return;

            const rect = container.getBoundingClientRect();
            lastTap.x = ((e.clientX - rect.left) / rect.width) * 100;
            lastTap.y = ((e.clientY - rect.top) / rect.height) * 100;

            windowLight.classList.add("lit");
            litCount++;

            if(litCount >= REQUIRED_WINDOWS){
                unlockCity();
            }
        });

        container.appendChild(windowLight);
    }

    requestAnimationFrame(() => container.classList.add("game-ready"));
}

function pickNonOverlappingWindowPos(placed){
    const minDist = 6.5; // percent distance between window centers
    let tries = 0;

    while(tries < 250){
        tries++;

        const zone = BUILDING_ZONES[Math.floor(Math.random() * BUILDING_ZONES.length)];
        const x = rand(zone.xMin, zone.xMax);
        const y = rand(zone.yMin, zone.yMax);

        const ok = placed.every(p => distPct(p.x, p.y, x, y) >= minDist);
        if(ok) return { x, y };
    }

    // Fallback if somehow crowded
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
    if(!city || !flood) return;

    // Turn the city emerald + ripple from last window
    city.classList.add("emerald");
    createEmeraldRipple(city, lastTap.x, lastTap.y);

    // Zoom the city a bit (feels like it’s “becoming” the full-screen glow)
    setTimeout(() => {
        city.classList.add("zooming");
    }, 420);

    // Start the full-screen emerald flood from the last tap point
    setTimeout(() => {
        // Set origin + center so the flood feels like it comes from the last window
        flood.style.setProperty("--origin-x", lastTap.x + "%");
        flood.style.setProperty("--origin-y", lastTap.y + "%");
        flood.style.setProperty("--center-x", lastTap.x + "%");
        flood.style.setProperty("--center-y", lastTap.y + "%");

        flood.classList.remove("flooding");
        void flood.offsetWidth;
        flood.classList.add("flooding");
    }, 720);

    // As soon as page 2 opens, the flood should be gone
    setTimeout(() => {
        document.body.classList.remove("locked");
        document.body.classList.add("scroll-mode");

        // kill the flood immediately when page 2 is revealed
        flood.classList.remove("flooding");
        flood.style.opacity = "0";

        // reset city zoom for when users scroll back (just in case)
        city.classList.remove("zooming");

        document.getElementById("page2").scrollIntoView({behavior:"smooth"});
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



