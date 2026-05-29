let dark = localStorage.getItem("theme") === "dark";

function applyTheme(){
    document.body.setAttribute("data-theme", dark ? "dark" : "");
    document.getElementById("themeBtn").innerText =
        dark ? "☀️ Light" : "🌙 Dark";
}

applyTheme();

document.getElementById("themeBtn").addEventListener("click", () => {
    dark = !dark;
    localStorage.setItem("theme", dark ? "dark" : "light");
    applyTheme();
});

/* CLOCK */

function updateClock(){
    const now = new Date();

    const en = new Intl.DateTimeFormat("en-US",{weekday:"long"}).format(now);
    const de = new Intl.DateTimeFormat("de-DE",{weekday:"long"}).format(now);
    const bn = new Intl.DateTimeFormat("bn-BD",{weekday:"long"}).format(now);

    document.getElementById("clock").innerHTML = `
        <span class="day">${en} / ${de} / ${bn}</span>
        ${now.toLocaleString()}
    `;
}

updateClock();
setInterval(updateClock, 1000);

/* NEWS */

const RSS = "https://api.rss2json.com/v1/api.json?rss_url=";

const FEEDS = [
    "https://www.tagesschau.de/xml/rss2/",
    "https://rss.dw.com/rdf/rss-en-all",
    "https://news.sap.com/feed/",
    "https://rss.focus.de/fol/XML/rss_folnews.xml"
];

const FILTERS = [
    "germany","deutschland","berlin","bundestag",
    "sap","job","jobs","health","market",
    "arbeit","visa","economy","ai","hospital"
];

async function fetchFeed(url){
    const r = await fetch(RSS + encodeURIComponent(url));
    const d = await r.json();
    return d.items || [];
}

async function loadBreaking(){

    const el = document.getElementById("breakingList");

    el.innerHTML = `<li class="loading">Loading…</li>`;

    try{
        let all = [];

        for(const f of FEEDS){
            try{
                const items = await fetchFeed(f);
                all.push(...items);
            }catch(e){}
        }

        all = all.filter(item=>{
            const t = (item.title || "").toLowerCase();
            return FILTERS.some(k => t.includes(k));
        });

        all = all.slice(0,18);

        el.innerHTML = all.map(item => `
            <li class="news-item">
                <div class="news-title">
                    <a href="${item.link}" target="_blank" rel="noopener">
                        ${item.title}
                    </a>
                </div>
                <div class="news-meta">
                    ${new Date(item.pubDate).toLocaleString()}
                </div>
            </li>
        `).join("");

    }catch(e){
        el.innerHTML = `<li class="error">Failed to load news.</li>`;
    }
}

loadBreaking();
setInterval(loadBreaking, 600000);

/* TTS */

document.getElementById("ttsBtn").addEventListener("click", () => {
    if(!window.speechSynthesis) return;

    const headlines = [...document.querySelectorAll("#breakingList a")]
        .slice(0,5)
        .map(a => a.textContent)
        .join(". ");

    const speech = new SpeechSynthesisUtterance(headlines);
    speech.rate = 0.95;

    speechSynthesis.cancel();
    speechSynthesis.speak(speech);
});