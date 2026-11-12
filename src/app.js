// Gate to GPT · study atlas UI
(() => {
  "use strict";
  const E = window.Engine;
  const G = E.build(CURRICULUM, CONCEPTS, IMPACT, REALMS, FORMULAS, THEMES, BRIDGES);
  const LS = "gtg-state-v2", LSUI = "gtg-ui";
  const app = document.getElementById("app");

  // ================= state & save files =================
  // GitHub Pages build: progress lives in this browser (localStorage). To move it between devices,
  // download a save file and load it on the other device: Merge combines both, Replace overwrites.
  let S = E.emptyState(G);
  try { const raw = localStorage.getItem(LS); if (raw) S = E.sanitize(G, JSON.parse(raw)); } catch (e) {}
  let V = E.valueTable(G, S.prefs.W);
  let UI = { open: {}, strategy: "best", atlasSort: "order", atlasFilter: "all", webN: 2 };
  try { UI = { ...UI, ...JSON.parse(localStorage.getItem(LSUI) || "{}") }; } catch (e) {}
  const saveUI = () => { try { localStorage.setItem(LSUI, JSON.stringify(UI)); } catch (e) {} };
  const LSEXP = "gtg-exported", LSUNDO = "gtg-state-undo";
  let exportedAt = 0; try { exportedAt = Number(localStorage.getItem(LSEXP)) || 0; } catch (e) {}

  const syncBtn = document.getElementById("syncBtn");
  function syncStatus(cls, text, title) { syncBtn.className = "sync " + cls; syncBtn.querySelector("span").textContent = text; syncBtn.title = title || text; }
  function hasProgress(s) { return Object.keys(s.done).length + Object.keys(s.proj).length + Object.keys(s.notes).length + s.combo.length > 0; }
  function refreshSaveStatus() {
    if (!hasProgress(S)) return syncStatus("", "Save & load", "Progress is saved in this browser. Load a save file from another device here.");
    if (exportedAt && exportedAt >= S.updatedAt) return syncStatus("ok", "Saved", "Saved in this browser, and your last downloaded save file is up to date.");
    syncStatus("busy", "Download save", "Saved in this browser. Download a save file to back it up or move it to another device.");
  }
  function persistLocal() { try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) { toast("This browser refused to save. Download a save file."); } }
  function commit(opts) {
    S.updatedAt = Date.now();
    persistLocal(); refreshSaveStatus();
    if (!opts || !opts.quiet) rerender();
  }
  window.addEventListener("storage", e => { // another tab of this site changed progress
    if (e.key !== LS || !e.newValue) return;
    try { S = E.sanitize(G, JSON.parse(e.newValue)); V = E.valueTable(G, S.prefs.W); refreshSaveStatus(); rerender(); } catch (err) {}
  });

  // ---- merge: newest change wins per topic, so un-ticking on one device survives a merge ----
  function topicTime(s, id) {
    return Math.max(s.touched[id] || 0, s.proj[id] || 0, s.completedAt[id] || 0, (s.ladder[id] || {}).s || 0, (s.ladder[id] || {}).x || 0);
  }
  function merge(fileState, localState) {
    const a = E.sanitize(G, fileState), b = E.sanitize(G, localState);
    const newer = (a.updatedAt || 0) > (b.updatedAt || 0) ? a : b;
    const out = E.sanitize(G, { ...newer });   // goals, plan, start point, current topic and preferences: newest save wins
    out.done = {}; out.proj = {}; out.ladder = {}; out.completedAt = {}; out.touched = {};
    const ids = new Set([a, b].flatMap(s => [s.done, s.proj, s.ladder, s.completedAt, s.touched].flatMap(Object.keys)));
    for (const id of ids) {
      const ta = topicTime(a, id), tb = topicTime(b, id);
      const take = (o, s) => { if (s.done[id]) o.done[id] = [...s.done[id]]; if (s.proj[id]) o.proj[id] = s.proj[id]; if (s.ladder[id]) o.ladder[id] = { ...s.ladder[id] }; if (s.completedAt[id]) o.completedAt[id] = s.completedAt[id]; };
      if (ta === tb) {   // no ordering information: keep everything from both
        const d = [...new Set([...(a.done[id] || []), ...(b.done[id] || [])])].sort((x, y) => x - y); if (d.length) out.done[id] = d;
        const p = a.proj[id] || b.proj[id]; if (p) out.proj[id] = p;
        const l = { ...(a.ladder[id] || {}), ...(b.ladder[id] || {}) }; if (l.s || l.x) out.ladder[id] = l;
        const c = Math.max(a.completedAt[id] || 0, b.completedAt[id] || 0); if (c) out.completedAt[id] = c;
      } else take(out, ta > tb ? a : b);
      const t = Math.max(a.touched[id] || 0, b.touched[id] || 0); if (t) out.touched[id] = t;
    }
    out.notes = { ...a.notes };
    for (const [k, v] of Object.entries(b.notes)) if (!out.notes[k] || v.at >= out.notes[k].at) out.notes[k] = v;
    const uniq = (xs, cap) => { const seen = new Set(), r = []; xs.sort((x, y) => x[0] - y[0]).forEach(e => { const k = JSON.stringify(e); if (!seen.has(k)) { seen.add(k); r.push(e); } }); return r.slice(-cap); };
    out.log = uniq([...a.log, ...b.log], 5000);
    out.combo = uniq([...a.combo, ...b.combo], 3000);
    out.wikiSeen = Math.max(a.wikiSeen, b.wikiSeen);
    out.updatedAt = Math.max(a.updatedAt || 0, b.updatedAt || 0);
    return E.sanitize(G, out);
  }
  function summary(s) {
    const subs = Object.values(s.done).reduce((n, v) => n + v.length, 0);
    return { subs, topics: G.ORDER.filter(n => (s.done[n.id] || []).length === n.s.length).length, projects: Object.keys(s.proj).length,
      notes: Object.keys(s.notes).length, rolls: s.combo.length, pts: E.points(G, s).total, at: s.updatedAt };
  }
  const when = t => t ? new Date(t).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "never";

  // ---- save file: download / load ----
  function downloadSave() {
    const doc = { app: "gate-to-gpt", kind: "progress", format: 3, exportedAt: Date.now(), state: S };
    const b = new Blob([JSON.stringify(doc)], { type: "application/json" });
    const a = el("a", { href: URL.createObjectURL(b), download: "gate-to-gpt-save-" + new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-") + ".json" });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    exportedAt = S.updatedAt || Date.now(); try { localStorage.setItem(LSEXP, String(exportedAt)); } catch (e) {}
    refreshSaveStatus(); toast("Save file downloaded"); if (saveDlg.open) openSaveDlg();
  }
  function readSaveFile(text) {   // accepts this format, the Pi build's backups and bare state exports
    const j = JSON.parse(text);
    const raw = j && j.state && typeof j.state === "object" ? j.state : j;
    if (!raw || typeof raw !== "object" || !("done" in raw || "notes" in raw || "prefs" in raw)) throw new Error("not a save");
    return E.sanitize(G, raw);
  }
  function applyLoaded(next, how) {
    try { localStorage.setItem(LSUNDO, JSON.stringify(S)); } catch (e) {}
    S = next; V = E.valueTable(G, S.prefs.W);
    persistLocal(); refreshSaveStatus(); rerender();
    saveDlg.close();
    toastUndo(how === "merge" ? "Merged the save file into this browser" : "Replaced this browser's progress with the save file");
  }
  function undoLoad() {
    try { const raw = localStorage.getItem(LSUNDO); if (!raw) return; S = E.sanitize(G, JSON.parse(raw)); localStorage.removeItem(LSUNDO); } catch (e) { return; }
    V = E.valueTable(G, S.prefs.W); persistLocal(); refreshSaveStatus(); rerender(); toast("Undone");
  }

  const saveDlg = document.getElementById("saveDlg"), saveBody = document.getElementById("saveBody");
  const saveFile = el("input", { type: "file", accept: ".json,application/json", hidden: true, onchange: async e => {
    const f = e.target.files[0]; e.target.value = ""; if (!f) return;
    let file; try { file = readSaveFile(await f.text()); } catch (err) { toast("That file isn't a Gate to GPT save"); return; }
    showCompare(file, f.name);
  } });
  document.body.append(saveFile);
  function statRow(label, s) {
    const m = summary(s);
    return el("tr", null, el("th", { scope: "row" }, label), el("td", { class: "num" }, fmt(m.subs)), el("td", { class: "num" }, fmt(m.topics)), el("td", { class: "num" }, fmt(m.notes)), el("td", { class: "num" }, fmt(m.pts)), el("td", null, when(m.at)));
  }
  function statTable(rows) {
    return el("div", { class: "tblwrap" }, el("table", { class: "tbl" },
      el("thead", null, el("tr", null, el("th", null, ""), el("th", { class: "num" }, "Subtopics"), el("th", { class: "num" }, "Topics"), el("th", { class: "num" }, "Notes"), el("th", { class: "num" }, "Points"), el("th", null, "Last change"))),
      el("tbody", null, rows)));
  }
  function openSaveDlg() {
    saveBody.replaceChildren(
      el("p", { class: "muted", style: "font-size:14px" }, "Progress saves automatically in this browser. To continue on another device, download a save file here and load it there. Loading can merge both copies, so you can study on two devices and combine them."),
      statTable([statRow("This browser", S)]),
      el("p", { class: "muted", style: "font-size:13px" }, exportedAt ? (exportedAt >= S.updatedAt ? "Your last save file (" + when(exportedAt) + ") is up to date." : "Changed since your last save file (" + when(exportedAt) + ").") : "You haven't downloaded a save file from this browser yet."),
      el("div", { class: "row end" },
        el("button", { class: "ghost", type: "button", onclick: () => saveDlg.close() }, "Close"),
        el("button", { class: "btn", type: "button", onclick: () => saveFile.click() }, "Load save file…"),
        el("button", { class: "primary", type: "button", onclick: downloadSave }, "Download save file")));
    if (!saveDlg.open) { if (saveDlg.showModal) saveDlg.showModal(); else saveDlg.setAttribute("open", ""); }
  }
  function showCompare(file, name) {
    const merged = merge(file, S), same = JSON.stringify({ ...merged, updatedAt: 0 }) === JSON.stringify({ ...S, updatedAt: 0 });
    const localEmpty = !hasProgress(S);
    if (!saveDlg.open) { if (saveDlg.showModal) saveDlg.showModal(); else saveDlg.setAttribute("open", ""); }
    saveBody.replaceChildren(
      el("p", { style: "font-size:14px" }, el("b", null, name)),
      statTable([statRow("Save file", file), statRow("This browser", S), localEmpty ? null : statRow("After merge", merged)]),
      same ? el("p", { class: "ok", style: "font-size:14px" }, "This browser already has everything in that file.") :
        el("p", { class: "muted", style: "font-size:13px" }, localEmpty ? "This browser has no progress yet, so loading simply copies the file in." :
          "Merge keeps the newest change for each topic from either copy, so things you un-ticked on purpose stay un-ticked, and keeps every note, roll and log entry. Replace throws away this browser's copy. Both can be undone right after."),
      el("div", { class: "row end" },
        el("button", { class: "ghost", type: "button", onclick: openSaveDlg }, "Back"),
        same ? null : localEmpty ? el("button", { class: "primary", type: "button", onclick: () => applyLoaded(file, "replace") }, "Load progress") : [
          el("button", { class: "btn", type: "button", onclick: () => applyLoaded(file, "replace") }, "Replace"),
          el("button", { class: "primary", type: "button", onclick: () => applyLoaded(merged, "merge") }, "Merge")]));
  }
  syncBtn.onclick = openSaveDlg;
  window.addEventListener("dragover", e => { if (e.dataTransfer && [...e.dataTransfer.types].includes("Files")) e.preventDefault(); });
  window.addEventListener("drop", async e => {   // drop a save file anywhere on the page
    const f = e.dataTransfer && e.dataTransfer.files[0]; if (!f || !/\.json$/i.test(f.name)) return;
    e.preventDefault();
    try { showCompare(readSaveFile(await f.text()), f.name); } catch (err) { toast("That file isn't a Gate to GPT save"); }
  });

  // ================= helpers =================
  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") n.className = v; else if (k === "text") n.textContent = v; else if (k === "html") n.innerHTML = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v); else if (k === "style") n.setAttribute("style", v);
      else n.setAttribute(k, v === true ? "" : v);
    }
    for (const k of kids.flat(Infinity)) if (k != null && k !== false) n.append(k.nodeType ? k : document.createTextNode(String(k)));
    return n;
  }
  function fill(node, ...kids) { node.replaceChildren(); for (const k of kids.flat(Infinity)) if (k != null && k !== false) node.append(k.nodeType ? k : document.createTextNode(String(k))); }
  const T = id => G.BY[id];
  const rc = id => "var(--r" + T(id).realm + ")";
  const fmt = n => Math.round(n).toLocaleString();
  const f1 = n => (Math.round(n * 10) / 10).toLocaleString();
  const pct = f => Math.floor(f * 100) + "%";
  const cnt = id => E.cnt(S, id), frac = id => E.frac(G, S, id), isDone = id => E.isDone(G, S, id);
  const ready = id => T(id).deps.every(isDone);
  function status(id) {
    if (isDone(id)) return ["Done", "done"];
    if (cnt(id)) return ["In progress", "prog"];
    if (ready(id)) return ["Ready", "ready"];
    const m = [...G.ANC[id]].filter(x => !isDone(x)).length;
    return [m + " to go", "block"];
  }
  function st(id, opts) {
    opts = opts || {};
    const a = el("a", { class: "st", href: "#/topic/" + id, style: "--rc:" + rc(id), title: T(id).t },
      el("span", { class: "id", text: id }), opts.noTitle ? null : el("span", { class: "tt", text: T(id).t }));
    return a;
  }
  function bar(f, cls) { return el("div", { class: "bar " + (cls || "") }, el("i", { style: "width:" + Math.max(0, Math.min(100, f * 100)).toFixed(1) + "%", class: f >= 1 ? "full" : null })); }
  function chip(text, cls, extra) { return el("span", { class: "chip " + (cls || ""), ...(extra || {}) }, text); }
  function statusChip(id) { const [t, c] = status(id); return chip(t, c); }
  function etaDate(hours) {
    const d = new Date(Date.now() + hours / S.prefs.hpw * 7 * 864e5);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined });
  }
  const weeks = h => h / S.prefs.hpw;
  const durTxt = h => { const w = weeks(h); return w < 1.5 ? Math.max(1, Math.round(w * 7)) + " days" : w < 9 ? f1(w) + " weeks" : f1(w / 4.35) + " months"; };
  let toastTimer;
  function toast(msg) { const t = document.getElementById("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 2600); }
  function toastUndo(msg) {
    const t = document.getElementById("toast"); t.replaceChildren(msg + " ", el("button", { type: "button", class: "toastbtn", onclick: () => { t.hidden = true; undoLoad(); } }, "Undo"));
    t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 8000);
  }
  function card(title, sub, ...kids) { return el("section", { class: "card" }, title ? el("h2", null, title, sub ? el("small", { class: "muted" }, sub) : null) : null, ...kids); }
  function seg(options, cur, onPick) {
    return el("div", { class: "seg", role: "group" }, options.map(([v, label]) => el("button", { type: "button", "data-v": v, "aria-pressed": String(v === cur), onclick: () => onPick(v) }, label)));
  }
  function topicOptions(sel, placeholder) {
    const s = el("select", null, placeholder ? el("option", { value: "" }, placeholder) : null);
    G.CURRICULUM.forEach(ph => {
      const og = el("optgroup", { label: ph.code + " · " + ph.name });
      ph.topics.forEach(t => og.append(el("option", { value: t.id, selected: t.id === sel ? true : null }, t.id + " · " + t.t)));
      s.append(og);
    });
    return s;
  }

  // ================= resources & links =================
  const LINK_KEYS = LINKS.map(([k, u]) => [k.toLowerCase(), u]);
  function resolve(r) {
    const low = r.toLowerCase();
    const hit = LINK_KEYS.find(([k]) => low.includes(k));
    const kind = /youtube|lectures|videos|channel|series, 3blue|crash course/i.test(r) ? "video"
      : /\bpaper|papers\b/i.test(r) ? "paper"
      : /practice|challenge|wargame|game\b|exercises|crackmes|euler|rosalind|interactive|bandit|gandalf|flaws|cryptopals|hdlbits|tryhackme|hack the box/i.test(r) ? "practice"
      : /course|ocw|\bmit\b|\bcs ?\d|stanford|coursera|edx|harvard|berkeley|cmu|curriculum|lecture|bootcamp|training|learn\b|academy|path/i.test(r) ? "course"
      : /documentation|docs|guide|tutorials|datasheet|manual|wiki/i.test(r) ? "docs"
      : /blog/i.test(r) ? "blog" : "book";
    if (hit) return { url: hit[1], kind, direct: true };
    return { url: "https://www.google.com/search?q=" + encodeURIComponent(r.replace(/\(.*?\)/g, "")), kind, direct: false };
  }
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } };
  const ROADMAP = { OR: "linux", PR: "python", DM: "computer-science", HW: "computer-science", AR: "computer-science", DS: "datastructures-and-algorithms", TC: "computer-science",
    SY: "computer-science", SV: "devops", SE: "system-design", DE: "data-engineer", SC: "cyber-security", ML: "machine-learning", DL: "machine-learning", CV: "machine-learning", NL: "ai-engineer", AI: "ai-engineer", XF: "game-developer" };
  const q = s => encodeURIComponent(s);
  const clean = s => s.replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim();
  function topicLinks(t) {
    const L = [
      ["Wikipedia", "https://en.wikipedia.org/w/index.php?search=" + q(clean(t.t))],
      ["YouTube lectures", "https://www.youtube.com/results?search_query=" + q(clean(t.t) + " lecture")],
      ["MIT OCW", "https://ocw.mit.edu/search/?q=" + q(clean(t.t))],
      ["GitHub projects", "https://github.com/search?type=repositories&q=" + q(clean(t.t))],
      ["Ask Claude", "https://claude.ai/new?q=" + q("I'm studying \"" + t.t + "\". Give me a structured lesson: intuition first, then the key ideas of: " + t.s.join("; ") + ". End with 5 practice questions.")]
    ];
    if (ROADMAP[t.code]) L.splice(1, 0, ["roadmap.sh", "https://roadmap.sh/" + ROADMAP[t.code]]);
    if (["ML", "DL", "CV", "NL", "AI"].includes(t.code)) L.push(["arXiv", "https://arxiv.org/search/?searchtype=all&query=" + q(clean(t.t))]);
    if (["MA", "DM"].includes(t.code)) L.push(["Khan Academy", "https://www.khanacademy.org/search?page_search_query=" + q(clean(t.t))]);
    return L;
  }
  const peekCache = {};
  async function wikiPeek(text, hint) {
    const k = text + "|" + hint;
    if (peekCache[k]) return peekCache[k];
    const tryQ = async qq => {
      const sr = await fetch("https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srlimit=1&srsearch=" + q(qq)).then(r => r.json());
      const hit = sr && sr.query && sr.query.search && sr.query.search[0];
      if (!hit) return null;
      return fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + q(hit.title.replace(/ /g, "_"))).then(r => r.json());
    };
    let s = await tryQ(clean(text).split(/[:;]/)[0]);
    if (!s || !s.extract) s = await tryQ(clean(text) + " " + clean(hint));
    peekCache[k] = s;
    return s;
  }

  // ================= actions =================
  function toggleSub(id, i, on) {
    const arr = new Set(S.done[id] || []);
    const before = E.points(G, S).total, wasDone = isDone(id);
    on ? arr.add(i) : arr.delete(i);
    if (arr.size) S.done[id] = [...arr].sort((a, b) => a - b); else delete S.done[id];
    S.touched[id] = Date.now(); S.current = id;
    S.log.push([Date.now(), id, on ? 1 : -1]); if (S.log.length > 5000) S.log = S.log.slice(-5000);
    if (isDone(id) && !wasDone) S.completedAt[id] = Date.now();
    if (!isDone(id)) delete S.completedAt[id];
    const gain = E.points(G, S).total - before;
    if (isDone(id) && !wasDone) toast("Topic complete: " + T(id).t + " (+" + fmt(gain) + " pts)");
    else if (gain > 0) toast("+" + fmt(gain) + " pts");
    commit();
  }
  function setAllSubs(id, on) {
    const before = E.points(G, S).total;
    if (on) { S.done[id] = T(id).s.map((_, i) => i); S.completedAt[id] = Date.now(); } else { delete S.done[id]; delete S.completedAt[id]; }
    S.touched[id] = Date.now(); S.log.push([Date.now(), id, on ? 1 : -1]);
    const gain = E.points(G, S).total - before;
    if (gain) toast((gain > 0 ? "+" : "") + fmt(gain) + " pts");
    commit();
  }
  function toggleProj(id, on) { if (on) S.proj[id] = Date.now(); else delete S.proj[id]; S.touched[id] = Date.now(); S.log.push([Date.now(), id, on ? 1 : -1]); toast(on ? "Project done: +" + fmt(E.topicPoints(G, id) * 0.25) + " pts" : "Project unmarked"); commit(); }
  function addGoal(id) { if (!G.BY[id] || S.goals.includes(id)) return; S.goals = [...S.goals, id].slice(0, 8); commit(); }
  function removeGoal(id) { S.goals = S.goals.filter(g => g !== id); commit(); }
  function setGoals(list) { S.goals = list.filter(x => G.BY[x]); commit(); }
  function armed(btn, label, confirmLabel, action) {
    let t = null; btn.textContent = label;
    btn.addEventListener("click", () => {
      if (t) { clearTimeout(t); t = null; btn.textContent = label; action(); return; }
      btn.textContent = confirmLabel; t = setTimeout(() => { t = null; btn.textContent = label; }, 3000);
    });
    return btn;
  }

  // ================= router =================
  let view = "today", param = null, graphMounted = false;
  function parse() {
    const h = (location.hash || "#/today").slice(2).split("/");
    view = ["today", "route", "atlas", "topic", "web", "rules", "combo", "wiki", "formulas"].includes(h[0]) ? h[0] : "today";
    param = h.length > 1 && h[1] ? decodeURIComponent(h.slice(1).join("/")) : null;
    if (view === "topic" && !G.BY[param]) { view = "atlas"; param = null; }
  }
  window.addEventListener("hashchange", () => { parse(); render(true); });
  function rerender() { render(false); }
  function render(navigated) {
    const y = window.scrollY, active = document.activeElement && document.activeElement.id;
    document.querySelectorAll(".tabs a").forEach(a => a.setAttribute("aria-current", a.dataset.view === (view === "topic" ? "atlas" : view) ? "page" : "false"));
    updatePoints();
    if (view === "web" && graphMounted && !navigated) { Graph.update(graphCtx()); renderWebPanel(); return; }
    graphMounted = false;
    app.replaceChildren();
    ({ today: viewToday, route: viewRoute, atlas: viewAtlas, topic: viewTopic, web: viewWeb, rules: viewRules, combo: viewCombo, wiki: viewWiki, formulas: viewFormulas })[view]();
    if (navigated) { window.scrollTo(0, 0); } else { window.scrollTo(0, y); if (active) { const n = document.getElementById(active); if (n) n.focus({ preventScroll: true }); } }
    if (view !== "wiki") document.title = (view === "topic" ? param + " " + T(param).t + " · " : view !== "today" ? view[0].toUpperCase() + view.slice(1) + " · " : "") + "Gate to GPT";
  }
  function updatePoints() {
    const P = E.points(G, S);
    const chipEl = document.getElementById("ptsChip");
    chipEl.replaceChildren("Lv ", el("b", { text: P.level }), " · " + fmt(P.total) + " pts");
  }

  // ================= TODAY =================
  function viewToday() {
    const P = E.points(G, S), SK = E.streak(S);
    const doneSubs = G.ORDER.reduce((a, n) => a + cnt(n.id), 0);
    const hoursDone = G.ORDER.reduce((a, n) => a + n.h * frac(n.id), 0);
    const started = doneSubs > 0;
    const rec = E.recommend(G, S, { V });

    // hero
    if (!started) {
      app.append(el("section", { class: "hero" },
        el("div", { class: "stack" },
          el("div", { class: "kicker", style: "color:inherit;opacity:.7" }, "Start here"),
          el("h1", null, "Every topic in computer science, weighted and routed."),
          el("p", null, "169 topics from logic gates to frontier AI, each scored for how much it's worth and what it unlocks. Pick a destination and the atlas plans the shortest route and the best-value route. Check off subtopics to earn points; recommendations update as you go."),
          el("div", { class: "row" }, el("a", { class: "btn route", href: "#/topic/OR1" }, "Begin with OR1: How Computers Work"), el("a", { class: "btn", href: "#/route" }, "Plan a route"))),
        el("div", { class: "stack" },
          el("div", { class: "kicker", style: "color:inherit;opacity:.7" }, "Or pick a destination"),
          el("div", { class: "presets" }, PRESETS.map(p => el("button", { class: "btn sm", type: "button", title: p.why, onclick: () => { setGoals(p.goals); location.hash = "#/route"; } }, p.name))))));
    } else {
      const cur = T(S.current);
      const nx = cur.s.findIndex((_, i) => !(S.done[cur.id] || []).includes(i));
      app.append(el("section", { class: "hero" },
        el("div", { class: "stack" },
          el("div", { class: "kicker", style: "color:inherit;opacity:.7" }, isDone(cur.id) ? "Last finished" : "You're on"),
          el("h1", null, cur.t),
          el("p", null, cur.id + " · " + cur.phaseName + " · " + cnt(cur.id) + " of " + cur.s.length + " subtopics"),
          bar(frac(cur.id), "route"),
          nx >= 0 ? el("p", null, "Resume at: ", el("b", { text: cur.s[nx] })) : null,
          S.notes[cur.id] ? el("p", { style: "font-style:italic" }, "Your note: " + S.notes[cur.id].text.slice(0, 200)) : null,
          el("div", { class: "row" }, el("a", { class: "btn route", href: "#/topic/" + cur.id }, isDone(cur.id) ? "Review it" : "Continue"),
            rec.items[0] && rec.items[0].id !== cur.id ? el("a", { class: "btn", href: "#/topic/" + rec.items[0].id }, "Best next: " + rec.items[0].id) : null)),
        el("div", { class: "stats" },
          stat(pct(doneSubs / G.TOTAL_SUBS), "of all subtopics"),
          stat(fmt(hoursDone) + " h", "studied of " + fmt(G.TOTAL_H)),
          stat(String(G.ORDER.filter(n => isDone(n.id)).length), "topics done"),
          stat(SK.current + (SK.current === 1 ? " day" : " days"), SK.today ? "streak, active today" : "streak"))));
    }

    if (rec.alerts.length) app.append(el("div", { class: "stack", style: "margin-bottom:16px" }, rec.alerts.map(a =>
      el("div", { class: "alert " + a.kind }, st(a.id), el("span", { text: a.text })))));

    const left = el("div", { class: "grid" }), right = el("div", { class: "grid", style: "align-content:start" });
    app.append(el("div", { class: "grid g-side" }, left, right));

    // recommendations
    const PARTS = [["value", "Value", "var(--ink)"], ["goal", "Goal fit", "var(--route)"], ["unlock", "Unlocks", "var(--req)"], ["progress", "Progress", "var(--done)"], ["reinforce", "Builds on known", "var(--rel)"], ["momentum", "Momentum", "var(--prog)"]];
    const recCard = card("Next best moves", S.goals.length ? "ranked toward " + S.goals.join(" + ") : "no goal set: ranked by value and unlocks");
    recCard.append(el("div", { class: "legend", style: "margin-bottom:10px" }, PARTS.map(([, l, c]) => el("span", null, el("i", { style: "background:" + c }), l)), el("span", null, "− cost (hours)")));
    rec.items.slice(0, 6).forEach((it, i) => {
      const t = T(it.id), max = 1.2;
      recCard.append(el("div", { class: "rec" },
        el("span", { class: "rank", text: i + 1 }),
        el("div", { class: "body" },
          el("div", { class: "row" }, st(it.id), statusChip(it.id)),
          el("div", { class: "muted", style: "font-size:13.5px" }, t.w),
          el("div", { class: "stackbar", title: PARTS.map(([k, l]) => l + " " + it.parts[k].toFixed(2)).join(" · ") + " · cost " + it.parts.cost.toFixed(2) },
            PARTS.map(([k, , c]) => it.parts[k] > 0 ? el("i", { style: "width:" + (it.parts[k] / max * 100) + "%;background:" + c }) : null)),
          el("div", { class: "chips" }, el("span", { class: "chip" }, t.h + " h"), el("span", { class: "chip" }, "value " + Math.round(V[it.id])), it.f > 0 ? el("span", { class: "chip prog" }, pct(it.f) + " done") : null,
            it.rules.map(([c, txt]) => el("span", { class: "chip rule", title: txt }, c + " " + txt.replace(/\s*\([^)]*\)$/, ""))))),
        el("div", { class: "score" }, el("b", { text: it.score.toFixed(2) }), "score")));
    });
    if (!rec.items.length) recCard.append(el("p", { class: "empty" }, "Everything is done. Seriously impressive."));
    recCard.append(el("p", { class: "muted", style: "font-size:12.5px;margin-top:8px" }, "Only topics whose prerequisites are complete are ranked (rule R1). ", el("a", { href: "#/rules" }, "See every weight and rule")));
    left.append(recCard);

    // predicted
    const pred = E.predict(G, S, 12, { V });
    const pc = card("Predicted route", "the next 12 topics if you keep taking the best move, at " + S.prefs.hpw + " h/week");
    pc.append(el("div", { class: "hline" }, pred.map(p => el("div", { class: "stop" }, st(p.id), el("small", { class: "muted" }, Math.round(p.hoursLeft) + " h · " + etaDate(p.cumH))))));
    if (pred.length) pc.append(el("p", { class: "muted", style: "font-size:13px;margin-top:6px" }, "All 12 done by about ", el("b", { text: etaDate(pred[pred.length - 1].cumH) }), " (" + fmt(pred[pred.length - 1].cumH) + " h)."));
    left.append(pc);

    // branches
    const br = E.branches(G, E.doneSet(G, S), V).slice(0, 6);
    const bc = card("Branches worth opening now", "ready today, ranked by downstream value per hour");
    const maxP = Math.max(1, ...br.map(b => b.perHour));
    bc.append(el("div", { class: "tblwrap" }, el("table", { class: "tbl" },
      el("thead", null, el("tr", null, el("th", null, "Topic"), el("th", { class: "num" }, "Hours"), el("th", { class: "num" }, "Unlocks"), el("th", null, "Value per hour"))),
      el("tbody", null, br.map(b => el("tr", { class: "click", onclick: () => (location.hash = "#/topic/" + b.id) },
        el("td", null, st(b.id)), el("td", { class: "num" }, b.h), el("td", { class: "num" }, b.unlocks),
        el("td", { style: "min-width:120px" }, el("div", { class: "row", style: "flex-wrap:nowrap" }, el("div", { style: "flex:1" }, bar(b.perHour / maxP, "req")), el("span", { class: "mono", style: "font-size:12px" }, f1(b.perHour))))))))));
    left.append(bc);

    // right column: points, goals, in progress
    const nextIn = P.nextPts - P.total;
    right.append(el("section", { class: "card combo-teaser" }, el("div", { class: "kicker" }, "Combo roll"), el("h2", { style: "margin:4px 0 6px" }, "How are two random ideas connected?"),
      el("p", { class: "muted", style: "font-size:13.5px" }, fmt(nPairsS) + " subtopic pairs, " + (nTriples / 1e6).toFixed(0) + "M triples and every Wikipedia article as wild cards. Guess, bridge, explain, score."),
      el("div", { class: "row", style: "margin-top:10px" }, el("a", { class: "btn route", href: "#/combo" }, "🎲 Roll"), el("a", { class: "btn", href: "#/wiki" }, "Wander the Reader"))));
    right.append(card("Points", E.levelTitle(P.level),
      el("div", { class: "score-big" }, el("b", { text: fmt(P.total) }), el("span", { class: "muted" }, "pts · level " + P.level)),
      el("div", { style: "margin:10px 0 4px" }, bar((P.total - P.floorPts) / (P.nextPts - P.floorPts), "route")),
      el("p", { class: "muted", style: "font-size:13px" }, fmt(nextIn) + " pts to level " + (P.level + 1)),
      el("hr", { class: "sep" }),
      el("div", { class: "stats" }, stat(String(P.subs), "subtopics"), stat(String(P.projects), "projects"), stat(String(SK.activeDays), "active days"))));

    const gc = card("Your goals", null);
    if (!S.goals.length) gc.append(el("p", { class: "muted" }, "No destination yet. Set one to get a route and goal-aware ranking."), el("div", { class: "chips", style: "margin-top:10px" }, PRESETS.slice(0, 8).map(p => el("button", { class: "btn sm", type: "button", title: p.why, onclick: () => setGoals(p.goals) }, p.name))));
    else {
      const known = E.knownSet(G, S, { mode: "progress" });
      const req = E.requiredFor(G, S.goals, known);
      const all = new Set(); S.goals.forEach(g => { all.add(g); G.ANC[g].forEach(x => all.add(x)); });
      const totH = [...all].reduce((a, x) => a + T(x).h, 0), leftH = [...req].reduce((a, x) => a + T(x).h * (1 - frac(x)), 0);
      gc.append(el("div", { class: "chips" }, S.goals.map(g => el("span", { class: "chip goal" }, g + " " + T(g).t))),
        el("div", { style: "margin:12px 0 4px" }, bar(1 - leftH / totH, "route")),
        el("p", { style: "font-size:14px" }, el("b", { text: pct(1 - leftH / totH) }), " of the way · " + fmt(leftH) + " h left · about " + durTxt(leftH) + " (" + etaDate(leftH) + ")"),
        el("div", { class: "row", style: "margin-top:10px" }, el("a", { class: "btn sm primary", href: "#/route" }, "Open route"), S.plan ? chip("Following " + S.plan.mode + " route", "goal") : null));
    }
    right.append(gc);

    const ip = G.ORDER.filter(n => cnt(n.id) && !isDone(n.id)).sort((a, b) => (S.touched[b.id] || 0) - (S.touched[a.id] || 0));
    const ipc = card("In progress", ip.length ? ip.length + " open" : null);
    if (!ip.length) ipc.append(el("p", { class: "muted" }, "Nothing half-done. Tick a subtopic on any topic page to start one."));
    ip.slice(0, 8).forEach(n => ipc.append(el("div", { style: "margin-bottom:10px" }, el("div", { class: "row", style: "justify-content:space-between" }, st(n.id), el("span", { class: "mono muted", style: "font-size:12px" }, cnt(n.id) + "/" + n.s.length)), bar(frac(n.id), "thin"),
      S.notes[n.id] ? el("p", { class: "muted", style: "font-size:12.5px;margin-top:3px" }, "“" + S.notes[n.id].text.slice(0, 120) + "”") : null)));
    right.append(ipc);

    // phases overview
    const phc = card("By phase", null);
    G.CURRICULUM.forEach((ph, pi) => {
      const tot = ph.topics.reduce((a, t) => a + t.s.length, 0), d = ph.topics.reduce((a, t) => a + cnt(t.id), 0);
      phc.append(el("a", { href: "#/atlas", onclick: () => { UI.open[pi] = true; saveUI(); }, style: "display:grid;grid-template-columns:34px 1fr 44px;gap:8px;align-items:center;text-decoration:none;font-size:13px;margin-bottom:5px" },
        el("span", { class: "mono", style: "font-size:11px;color:#fff;background:var(--r" + G.BY[ph.topics[0].id].realm + ");border-radius:4px;text-align:center" }, ph.code),
        el("span", null, el("span", { style: "display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" }, ph.name), bar(d / tot, "thin")),
        el("span", { class: "mono muted", style: "text-align:right;font-size:11.5px" }, pct(d / tot))));
    });
    right.append(phc);
  }
  function stat(b, s) { return el("div", { class: "stat" }, el("b", { text: b }), el("span", { text: s })); }

  // ================= ROUTE =================
  function viewRoute() {
    app.append(el("div", { class: "view-head" }, el("div", { class: "stack" }, el("h1", null, "Route planner"),
      el("p", null, "Set where you start and where you want to end up. The planner computes the shortest route (the fewest hours that still cover every prerequisite), the best-value route (the shortest one plus the side topics most worth adding), the bottleneck chain, and the branches worth taking next."))));

    // controls
    const ctl = el("section", { class: "card", style: "margin-bottom:16px" });
    const startSel = topicOptions(S.start.topic, "Choose a topic…");
    startSel.disabled = S.start.mode !== "topic";
    startSel.onchange = () => { S.start.topic = startSel.value || null; commit(); };
    const goalInput = el("input", { type: "search", list: "topicList", placeholder: "Add a goal: type a topic name or ID", id: "goalInput" });
    const dl = el("datalist", { id: "topicList" }, G.ORDER.map(n => el("option", { value: n.id + " · " + n.t })));
    const addFromInput = () => { const v = goalInput.value.trim(); const id = (v.split(" ")[0] || "").toUpperCase(); const hit = G.BY[id] ? id : (G.ORDER.find(n => n.t.toLowerCase() === v.toLowerCase()) || {}).id; if (hit) { goalInput.value = ""; addGoal(hit); } };
    goalInput.addEventListener("change", addFromInput);
    goalInput.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); addFromInput(); } });
    const hpw = el("input", { type: "number", min: 1, max: 80, value: S.prefs.hpw, style: "width:80px", id: "hpwIn" });
    hpw.onchange = () => { const v = Math.max(1, Math.min(80, Number(hpw.value) || 10)); S.prefs.hpw = v; commit(); };
    const slack = el("input", { type: "range", min: 0, max: 100, step: 5, value: S.prefs.slack, id: "slackIn" });
    const slackOut = el("output", { text: S.prefs.slack + "%" });
    slack.oninput = () => (slackOut.textContent = slack.value + "%");
    slack.onchange = () => { S.prefs.slack = Number(slack.value); commit(); };
    ctl.append(el("div", { class: "grid g2" },
      el("div", { class: "stack" },
        el("div", { class: "kicker" }, "1 · Start point"),
        seg([["progress", "From my progress"], ["scratch", "From scratch"], ["topic", "Start at a topic"]], S.start.mode, m => { S.start.mode = m; commit(); }),
        S.start.mode === "topic" ? el("div", { class: "stack" }, startSel, el("p", { class: "muted", style: "font-size:12.5px" }, "Everything this topic needs is treated as known, and the route begins at it.")) : null,
        S.start.mode === "progress" ? el("p", { class: "muted", style: "font-size:12.5px" }, "Completed topics count as known: " + G.ORDER.filter(n => isDone(n.id)).length + " so far.") : null,
        S.start.mode === "scratch" ? el("p", { class: "muted", style: "font-size:12.5px" }, "Ignores your progress, to see the full cost of a path.") : null),
      el("div", { class: "stack" },
        el("div", { class: "kicker" }, "2 · Goal (one or more)"),
        el("div", { class: "goalbox" }, goalInput, dl, el("button", { class: "btn sm", type: "button", onclick: addFromInput }, "Add")),
        el("div", { class: "chips" }, S.goals.map(g => el("span", { class: "chip goal" }, g + " " + T(g).t, el("button", { type: "button", "aria-label": "Remove goal " + g, onclick: () => removeGoal(g) }, "×")))),
        el("details", null, el("summary", { class: "muted", style: "font-size:13px" }, "Career presets"),
          el("div", { class: "chips", style: "margin-top:8px" }, PRESETS.map(p => el("button", { class: "btn sm", type: "button", title: p.why + " Goals: " + p.goals.join(", "), onclick: () => setGoals(p.goals) }, p.name)))))),
      el("hr", { class: "sep" }),
      el("div", { class: "row", style: "gap:22px" },
        el("label", { class: "row", style: "font-size:13.5px" }, "Hours per week", hpw),
        el("div", { class: "slider", style: "flex:1 1 320px;max-width:520px" }, el("span", null, "Extra budget"), slack, slackOut),
        el("span", { class: "muted", style: "font-size:12.5px;flex-basis:100%" }, "Extra budget: how many more hours, as a share of the shortest route, the best-value route may spend on worthwhile side topics.")));
    app.append(ctl);

    if (!S.goals.length) {
      app.append(card("Pick a goal to see routes", "or try one of these",
        el("div", { class: "chips" }, PRESETS.map(p => el("button", { class: "btn", type: "button", onclick: () => setGoals(p.goals) }, p.name)))));
      const br = E.branches(G, E.knownSet(G, S), V).slice(0, 8);
      app.append(el("div", { style: "height:16px" }), card("Where you can go from here", "branches open now, by value per hour",
        el("ol", { class: "line compact", style: "--lc:var(--req)" }, br.map(b => el("li", null, el("span", { class: "dot" }), el("div", { class: "ln-main" }, st(b.id)), el("div", { class: "ln-sub" }, el("span", null, b.h + " h"), el("span", null, "unlocks " + b.unlocks), el("span", null, f1(b.perHour) + " value/h")))))));
      return;
    }

    const known = E.knownSet(G, S);
    const rel = E.relevance(G, S.goals);
    const strategies = [
      ["shortest", "Shortest", "Only what the goal strictly needs, in curriculum order.", { slack: 0, order: "curriculum" }],
      ["quick", "Quick wins", "Same topics as shortest, short topics first for early momentum.", { slack: 0, order: "quick" }],
      ["best", "Best value", "Shortest plus the highest value-per-hour extras, value-dense topics first.", { slack: S.prefs.slack, order: "value" }],
      ["deep", "Deep", "A wider budget for topics strongly related to the goal.", { slack: Math.max(60, S.prefs.slack * 2), order: "value", minRatio: 0.6 }]
    ];
    const plans = {};
    strategies.forEach(([k, , , o]) => (plans[k] = E.plan(G, { goals: S.goals, known, V, rel, ...o })));
    const firstFinish = p => (p.steps[0] ? p.steps[0].h : 0);
    const goalAt = p => { let m = 0; p.steps.forEach(s => { if (S.goals.includes(s.id)) m = Math.max(m, s.cumH); }); return m; };
    const best = Object.entries(plans).sort((a, b) => b[1].density - a[1].density)[0][0];

    const cmp = card("Compare routes", known.size ? known.size + " topics already counted as known" : "nothing counted as known");
    cmp.append(el("div", { class: "tblwrap" }, el("table", { class: "tbl" },
      el("thead", null, el("tr", null, el("th", null, "Route"), el("th", { class: "num" }, "Topics"), el("th", { class: "num" }, "Hours"), el("th", { class: "num" }, "Extra h"), el("th", { class: "num" }, "Value"), el("th", { class: "num" }, "Value/h"), el("th", { class: "num" }, "Goal concepts"), el("th", { class: "num" }, "Goal reached"), el("th", null, ""))),
      el("tbody", null, strategies.map(([k, name, desc]) => {
        const p = plans[k];
        return el("tr", { class: "click" + (UI.strategy === k ? " sel" : ""), onclick: () => { UI.strategy = k; saveUI(); rerender(); }, title: desc },
          el("td", null, el("b", { text: name }), k === best ? el("span", { class: "chip goal", style: "margin-left:6px" }, "densest") : null, el("div", { class: "muted", style: "font-size:12px" }, desc)),
          el("td", { class: "num" }, p.steps.length), el("td", { class: "num" }, fmt(p.hours)), el("td", { class: "num" }, p.extraHours ? "+" + fmt(p.extraHours) : "0"),
          el("td", { class: "num" }, fmt(p.value)), el("td", { class: "num" }, p.density.toFixed(2)), el("td", { class: "num" }, pct(p.coverage)),
          el("td", { class: "num" }, etaDate(goalAt(p))),
          el("td", null, el("button", { class: "btn sm" + (S.plan && S.plan.mode === k ? " route" : ""), type: "button", onclick: ev => { ev.stopPropagation(); S.plan = { ids: p.steps.map(s => s.id), goals: [...S.goals], mode: k, at: Date.now() }; commit(); toast("Following the " + name + " route. Today's ranking now favours it (R11)"); } }, S.plan && S.plan.mode === k ? "Following" : "Follow")));
      })))),
      el("p", { class: "muted", style: "font-size:12.5px;margin-top:8px" }, "Value = Σ(topic value × goal relevance). Goal concepts = share of the goal's concepts that the route teaches. Dates assume " + S.prefs.hpw + " h/week."));
    app.append(cmp);

    const p = plans[UI.strategy] || plans.best;
    const sName = (strategies.find(s => s[0] === UI.strategy) || strategies[2])[1];
    // ---- what each strategy changes ----
    const base = new Set(plans.shortest.steps.map(s => s.id));
    const diffCard = card("What each route changes", "compared with the shortest route");
    strategies.forEach(([k, name]) => {
      if (k === "shortest") return;
      const ids = plans[k].steps.map(s => s.id), add = ids.filter(x => !base.has(x));
      const firstDiff = ids.findIndex((x, i) => x !== plans.shortest.steps[i]?.id);
      diffCard.append(el("div", { class: "diffrow" },
        el("div", { class: "row", style: "justify-content:space-between" }, el("b", { text: name }), el("span", { class: "mono muted", style: "font-size:12px" }, (add.length ? "+" + add.length + " topics, +" + fmt(plans[k].hours - plans.shortest.hours) + " h" : "same topics") + " · value/h " + plans[k].density.toFixed(2))),
        add.length ? el("div", { class: "chips", style: "margin-top:6px" }, add.map(x => { const ex = plans[k].extras.find(e => e.bundle.includes(x)); return el("a", { class: "chip", href: "#/topic/" + x, title: ex && ex.shared.length ? "shares " + ex.shared.join(", ") + " with the goal" : T(x).t, style: "border-color:var(--rel)" }, "+ " + x + " " + T(x).t); }))
          : el("p", { class: "muted", style: "font-size:13px;margin-top:4px" }, firstDiff < 0 ? "Identical order." : "Same topics, reordered from step " + (firstDiff + 1) + " (" + (k === "quick" ? "short topics first" : "value-dense topics first") + ").")));
    });

    // ---- live route map ----
    const pathIds = p.steps.map(s => s.id), inRoute = new Set(pathIds), idx = {}; pathIds.forEach((x, i) => (idx[x] = i));
    const afterSet = new Set([...known, ...pathIds]);
    const brAll = E.branches(G, afterSet, V);
    const brTop = brAll.slice(0, 14).map(b => ({ ...b, at: Math.max(...T(b.id).deps.filter(d => inRoute.has(d)).map(d => idx[d]), -1) })).filter(b => b.at >= 0);
    const mapCard = card("Route map", "click any station: blue = what it needs on this route, orange = what it unlocks, green = branches off the line");
    const info = el("div", { class: "mapinfo" });
    const NS = "http://www.w3.org/2000/svg", mk = (tag, attrs, text) => { const n = document.createElementNS(NS, tag); for (const [k2, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k2, v); if (text != null) n.textContent = text; return n; };
    const step = 58, lane = 46, mLeft = 112, top0 = 30;
    const lanesUsed = [...new Set(pathIds.map(x => T(x).realm).concat(brTop.map(b => T(b.id).realm)))].sort((a, b) => a - b);
    const laneY = {}; lanesUsed.forEach((r, i) => (laneY[r] = top0 + i * lane));
    const Wm = mLeft + Math.max(1, pathIds.length) * step + 40, Hm = top0 + lanesUsed.length * lane + 70;
    const svg = mk("svg", { viewBox: `0 0 ${Wm} ${Hm}`, width: Wm, height: Hm, class: "metro", role: "img", "aria-label": "Route map with " + pathIds.length + " stations" });
    lanesUsed.forEach(r => { svg.append(mk("line", { x1: mLeft - 10, x2: Wm - 10, y1: laneY[r], y2: laneY[r], class: "lane" })); svg.append(mk("text", { x: 8, y: laneY[r] + 4, class: "lanelbl" }, G.REALMS[r].name)); });
    const pos = id => [mLeft + idx[id] * step, laneY[T(id).realm]];
    const gArcs = mk("g", {}), gLine = mk("g", {}), gBr = mk("g", {}), gSt = mk("g", {});
    svg.append(gArcs, gLine, gBr, gSt);
    let d = ""; pathIds.forEach((x, i) => { const [px, py] = pos(x); d += (i ? " L" : "M") + px + " " + py; });
    if (pathIds.length) gLine.append(mk("path", { d, class: "mline" }));
    const arcs = [];
    pathIds.forEach(x => T(x).deps.filter(dd => inRoute.has(dd)).forEach(dd => { const [x1, y1] = pos(dd), [x2, y2] = pos(x); const a = mk("path", { d: `M${x1} ${y1} Q ${(x1 + x2) / 2} ${Math.min(y1, y2) - 26 - Math.min(60, (x2 - x1) / 6)} ${x2} ${y2}`, class: "arc" }); a.dataset.a = dd; a.dataset.b = x; gArcs.append(a); arcs.push(a); }));
    const brEls = [];
    brTop.forEach((b, k) => { const [sx, sy] = pos(pathIds[b.at]); const bx = sx + 14, by = Hm - 34 - (k % 2) * 18; const g = mk("g", { class: "br" }); g.dataset.from = pathIds[b.at]; g.dataset.id = b.id;
      g.append(mk("path", { d: `M${sx} ${sy} L ${sx} ${by - 6} L ${bx} ${by}`, class: "brline" }), mk("circle", { cx: bx + 5, cy: by, r: 5, class: "brdot" }), mk("text", { x: bx + 13, y: by + 4, class: "brlbl" }, b.id));
      g.append(mk("title", {}, b.id + " " + T(b.id).t + " · branch worth " + f1(b.perHour) + " value/h"));
      g.addEventListener("click", () => (location.hash = "#/topic/" + b.id)); gBr.append(g); brEls.push(g); });
    const stEls = {};
    pathIds.forEach((x, i) => {
      const [px, py] = pos(x), isGoal = S.goals.includes(x), extra = !base.has(x);
      const g = mk("g", { class: "stn" + (isGoal ? " goal" : "") + (extra ? " extra" : "") + (isDone(x) ? " done" : ""), tabindex: 0, role: "button", "aria-label": x + " " + T(x).t });
      g.append(mk("circle", { cx: px, cy: py, r: isGoal ? 10 : 7, style: "--rc:" + rc(x) }), mk("text", { x: px, y: py - 13, class: "stlbl", "text-anchor": "middle" }, x));
      g.append(mk("title", {}, (i + 1) + ". " + x + " " + T(x).t + " · " + T(x).h + " h"));
      const pick = () => selectStation(x); g.addEventListener("click", pick); g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
      gSt.append(g); stEls[x] = g;
    });
    function selectStation(x) {
      UI.routeSel = x; saveUI();
      const needs = new Set([...G.ANC[x]].filter(y => inRoute.has(y))), opens = new Set([...G.DESC[x]].filter(y => inRoute.has(y)));
      Object.entries(stEls).forEach(([id, g]) => g.setAttribute("data-role", id === x ? "sel" : needs.has(id) ? "req" : opens.has(id) ? "next" : "dim"));
      arcs.forEach(a => a.setAttribute("data-role", (a.dataset.b === x || (needs.has(a.dataset.b) && (needs.has(a.dataset.a)))) ? "req" : (a.dataset.a === x || (opens.has(a.dataset.a) && opens.has(a.dataset.b))) ? "next" : "dim"));
      brEls.forEach(b => b.setAttribute("data-role", b.dataset.from === x || opens.has(b.dataset.from) ? "on" : "dim"));
      const t = T(x), succ = t.dependents.filter(y => inRoute.has(y)), mine = brTop.filter(b => b.at === idx[x]);
      const toGoal = S.goals.map(g => E.directedPath(G, x, g)).filter(Boolean).sort((a, b) => a.path.length - b.path.length)[0];
      const shTh = G.THEME_OF[x].filter(ti => S.goals.some(g => G.THEME_OF[g].includes(ti))).map(ti => G.THEMES[ti]);
      const ex = p.extras.find(e2 => e2.bundle.includes(x));
      fill(info,
        el("div", { class: "row", style: "justify-content:space-between" }, el("div", { class: "row" }, el("span", { class: "mono muted" }, "Step " + (idx[x] + 1)), st(x), statusChip(x)), el("a", { class: "btn sm primary", href: "#/topic/" + x }, "Open topic")),
        el("p", { class: "muted", style: "margin:6px 0" }, t.w),
        el("div", { class: "grid g3", style: "gap:12px;margin-top:6px" },
          el("div", null, el("div", { class: "kicker" }, "Why it's on the route"),
            el("p", { style: "font-size:13.5px" }, S.goals.includes(x) ? "It's your goal." : ex ? "Added as a worthwhile extra" + (ex.shared.length ? ": shares " + ex.shared.slice(0, 3).join(", ") + " with the goal." : ".") : succ.length ? "Needed by " + succ.join(", ") + (toGoal ? ", on the chain " + toGoal.path.join(" → ") : "") + "." : "Required groundwork for the goal."),
            shTh.length ? el("p", { class: "muted", style: "font-size:12.5px;margin-top:4px" }, "Same big idea as your goal: " + shTh.map(th => th.name).join(", ")) : null),
          el("div", null, el("div", { class: "kicker" }, "On this route it needs"), needs.size ? el("div", { class: "chips" }, [...needs].map(y => el("a", { class: "chip", href: "#/topic/" + y, style: "border-color:var(--req)" }, y))) : el("p", { class: "muted", style: "font-size:13px" }, "Nothing earlier on the route.")),
          el("div", null, el("div", { class: "kicker" }, "Branches it opens"), mine.length ? el("div", { class: "stack" }, mine.map(b => el("div", { style: "font-size:13px" }, st(b.id), el("span", { class: "muted mono", style: "font-size:11.5px;margin-left:6px" }, b.h + " h · " + f1(b.perHour) + "/h")))) : el("p", { class: "muted", style: "font-size:13px" }, opens.size ? "Leads on to " + opens.size + " later route topics." : "No new branches here."))));
    }
    mapCard.append(el("div", { class: "metrowrap" }, svg), info,
      el("div", { class: "legend", style: "margin-top:8px" }, el("span", null, el("i", { style: "background:var(--route)" }), "route line"), el("span", null, el("i", { style: "background:var(--rel)" }), "extra vs shortest (dotted ring) · branch"), el("span", null, el("i", { style: "background:var(--req)" }), "needs"), el("span", null, el("i", { style: "background:var(--next)" }), "unlocks"),
        el("a", { href: "#/web", onclick: () => { UI.webRoute = pathIds; UI.webSel = null; UI.webGroup = null; saveUI(); } }, "Light this route up in the web →")));
    app.append(el("div", { style: "height:16px" }), mapCard, el("div", { style: "height:16px" }), diffCard);
    setTimeout(() => selectStation(UI.routeSel && inRoute.has(UI.routeSel) ? UI.routeSel : (pathIds.find(x => !isDone(x)) || pathIds[0])), 0);

    const left = el("div", { class: "grid", style: "align-content:start" }), right = el("div", { class: "grid", style: "align-content:start" });
    app.append(el("div", { style: "height:16px" }), el("div", { class: "grid g-side" }, left, right));

    const routeCard = card(sName + " route", p.steps.length + " topics · " + fmt(p.hours) + " h · about " + durTxt(p.hours));
    if (!p.steps.length) routeCard.append(el("p", { class: "empty" }, "You already know everything this goal needs."));
    const extraWhy = {}; p.extras.forEach(x => (extraWhy[x.id] = x));
    routeCard.append(el("ol", { class: "line" }, p.steps.map((s, i) => {
      const t = T(s.id), isGoal = S.goals.includes(s.id), ex = extraWhy[s.id];
      return el("li", { class: (isGoal ? "goal " : "") + (s.extra ? "extra " : "") + (isDone(s.id) ? "known" : ""), style: "--lc:" + rc(s.id) },
        el("span", { class: "dot" }),
        el("div", { class: "ln-main" }, el("span", { class: "mono muted", style: "font-size:11.5px" }, String(i + 1).padStart(2, "0")), st(s.id), statusChip(s.id), isGoal ? chip("goal", "goal") : null),
        el("div", { class: "ln-sub" }, el("span", null, s.h + " h"), el("span", null, "value " + Math.round(s.v)), el("span", null, "relevance " + pct(s.rel)), el("span", null, "by " + etaDate(s.cumH)),
          (() => { const nb = t.dependents.filter(y => p.steps.some(z => z.id === y)); return nb.length ? el("span", null, "→ needed by " + nb.slice(0, 4).join(", ")) : null; })(),
          DEPTH[s.id] ? el("span", null, DEPTH[s.id].q.length + " self-checks · 3 projects") : null,
          s.extra ? el("span", { class: "tag-extra" }, ex ? "worth adding: shares " + (ex.shared.slice(0, 3).join(", ") || "concepts") + " with the goal" : "needed for an extra") : null));
    })));
    left.append(routeCard);

    // critical path
    const cp = E.criticalPath(G, S.goals, known);
    if (cp.chain.length) left.append(card("Bottleneck chain", fmt(cp.hours) + " h that must happen in order",
      el("p", { class: "muted", style: "font-size:13.5px;margin-bottom:10px" }, "The heaviest chain of prerequisites to your goal. Each must finish before the next can start, so it sets the minimum calendar time even if you study several branches in parallel."),
      el("div", { class: "hline" }, cp.chain.map(id => el("div", { class: "stop" }, st(id), el("small", { class: "muted" }, T(id).h + " h"))))));

    // start → goal paths
    const from = S.start.mode === "topic" && S.start.topic ? S.start.topic : (S.current || "OR1");
    const pathCard = card("How " + from + " connects to " + S.goals[0], null);
    const dp = E.directedPath(G, from, S.goals[0]);
    if (dp) pathCard.append(el("div", { class: "kicker", style: "margin-bottom:6px" }, "Shortest prerequisite chain · " + fmt(dp.hours) + " h"),
      el("div", { class: "hline" }, dp.path.map(id => el("div", { class: "stop" }, st(id), el("small", { class: "muted" }, T(id).h + " h")))));
    else pathCard.append(el("p", { class: "muted", style: "font-size:13.5px" }, from === S.goals[0] ? "Start and goal are the same topic." : from + " isn't a prerequisite of " + S.goals[0] + ", so there's no direct chain. Below is how they connect through shared ideas."));
    const wp = from !== S.goals[0] ? E.webPath(G, from, S.goals[0], 2) : null;
    if (wp) pathCard.append(el("div", { class: "kicker", style: "margin:12px 0 6px" }, "Fewest links through the web · " + wp.hops + " hops"),
      el("ol", { class: "line compact", style: "--lc:var(--rel)" }, wp.path.map((id, i) => el("li", null, el("span", { class: "dot" }), el("div", { class: "ln-main" }, st(id)),
        i < wp.links.length ? el("div", { class: "ln-sub" }, wp.links[i].kind === "concept" ? "↓ shares " + wp.links[i].shared.slice(0, 3).join(", ") : wp.links[i].kind === "unlocks" ? "↓ unlocks" : "↓ builds on (its prerequisite)") : null))));
    left.append(pathCard);

    // branches after route
    const after = new Set([...known, ...p.steps.map(s => s.id)]);
    const br = E.branches(G, after, V).slice(0, 8);
    const maxP = Math.max(1, ...br.map(b => b.perHour));
    right.append(card("Branches that hold more value", "open once this route is done",
      el("p", { class: "muted", style: "font-size:13px;margin-bottom:8px" }, "Potential = the topic's value plus everything downstream of it, halved per step away. Ranked per hour of entry cost."),
      br.length ? el("div", { class: "stack" }, br.map(b => el("div", null, el("div", { class: "row", style: "justify-content:space-between;flex-wrap:nowrap" }, st(b.id), el("span", { class: "mono muted", style: "font-size:12px;white-space:nowrap" }, b.h + " h · " + f1(b.perHour) + "/h")), bar(b.perHour / maxP, "req")))) : el("p", { class: "muted" }, "Nothing left to branch into.")));

    const near = E.nearbyGoals(G, after, V, new Set(S.goals), Math.max(60, p.hours * 0.25), after).slice(0, 6);
    right.append(card("Next goals within reach", "small extra cost after this route",
      near.length ? el("div", { class: "stack" }, near.map(n => el("div", { class: "row", style: "justify-content:space-between" }, st(n.id),
        el("span", { class: "row" }, el("span", { class: "mono muted", style: "font-size:12px" }, "+" + n.extra + " h · " + pct(n.reuse) + " groundwork done"), el("button", { class: "btn sm", type: "button", onclick: () => addGoal(n.id) }, "+ goal"))))) : el("p", { class: "muted" }, "No cheap extensions found.")));

    // extras explained
    if (p.extras.length) right.append(card("Why these extras", null, el("div", { class: "stack" }, p.extras.map(x => el("div", { style: "font-size:13.5px" }, st(x.id), el("div", { class: "muted", style: "font-size:12.5px" },
      "+" + x.cost + " h for " + fmt(x.gain) + " weighted value" + (x.bundle.length > 1 ? " (includes " + x.bundle.filter(b => b !== x.id).join(", ") + ")" : "") + (x.shared.length ? ". Shares: " + x.shared.slice(0, 4).join(", ") : "")))))));
  }

  // ================= ATLAS =================
  function viewAtlas() {
    const search = el("input", { type: "search", placeholder: "Search topics, subtopics, books, projects… (press /)", id: "atlasSearch", style: "flex:1 1 280px", value: UI.q || "" });
    let tmr; search.oninput = () => { clearTimeout(tmr); tmr = setTimeout(() => { UI.q = search.value; saveUI(); rerender(); }, 180); };
    app.append(el("div", { class: "view-head" }, el("div", { class: "stack", style: "flex:1" }, el("h1", null, "Atlas"),
      el("p", null, G.CURRICULUM.length + " phases · " + G.ORDER.length + " topics · " + fmt(G.TOTAL_SUBS) + " subtopics · " + fmt(G.TOTAL_H) + " hours. Value is a 0–100 score; ROI is value per hour."))));
    app.append(el("div", { class: "row", style: "margin-bottom:14px;gap:12px" }, search,
      seg([["all", "All"], ["ready", "Ready"], ["prog", "In progress"], ["done", "Done"], ["block", "Locked"]], UI.atlasFilter, v => { UI.atlasFilter = v; saveUI(); rerender(); }),
      seg([["order", "Order"], ["value", "Value"], ["roi", "ROI"], ["hours", "Hours"]], UI.atlasSort, v => { UI.atlasSort = v; saveUI(); rerender(); })));

    const qq = (UI.q || "").trim().toLowerCase();
    if (qq) { atlasSearch(qq); return; }
    const filt = n => UI.atlasFilter === "all" || status(n.id)[1] === UI.atlasFilter;
    const sorter = { order: (a, b) => a.pos - b.pos, value: (a, b) => V[b.id] - V[a.id], roi: (a, b) => V[b.id] / b.h - V[a.id] / a.h, hours: (a, b) => a.h - b.h }[UI.atlasSort];

    if (UI.atlasSort !== "order" || UI.atlasFilter !== "all") {
      const list = G.ORDER.filter(filt).sort(sorter);
      app.append(card(list.length + " topics", null, topicTable(list)));
      return;
    }
    const wrap = el("section", { class: "card" });
    G.CURRICULUM.forEach((ph, pi) => {
      const tots = ph.topics.reduce((a, t) => a + t.s.length, 0), d = ph.topics.reduce((a, t) => a + cnt(t.id), 0);
      const h = ph.topics.reduce((a, t) => a + t.h, 0);
      const open = !!UI.open[pi];
      const sec = el("div", { class: "phase" },
        el("header", { role: "button", tabindex: 0, "aria-expanded": String(open), onclick: () => { UI.open[pi] = !open; saveUI(); rerender(); }, onkeydown: e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); UI.open[pi] = !open; saveUI(); rerender(); } } },
          el("h3", null, el("span", { class: "code", style: "--rc:var(--r" + G.BY[ph.topics[0].id].realm + ")" }, ph.code), ph.name, el("small", { class: "muted", style: "font-weight:400" }, ph.topics.length + " topics · " + h + " h")),
          el("div", null, el("div", { class: "row", style: "justify-content:space-between;font-size:12px" }, el("span", { class: "muted" }, ph.layer), el("span", { class: "mono" }, pct(d / tots))), bar(d / tots)),
          el("p", null, ph.blurb, ph.refs && ph.refs.length ? el("span", { class: "muted", style: "display:block;font-size:12px;margin-top:3px" }, "Covers: " + ph.refs.join(" · ")) : null)));
      if (open) sec.append(topicTable(ph.topics.map(t => G.BY[t.id])));
      wrap.append(sec);
    });
    app.append(wrap);
  }
  function topicTable(list) {
    return el("div", { class: "tlist" },
      el("div", { class: "trow head" }, el("span", null, "Topic"), el("span", { class: "num" }, "Value"), el("span", { class: "num hide-sm" }, "ROI"), el("span", { class: "num hide-sm" }, "Hours"), el("span", null, "Status")),
      list.map(n => el("a", { class: "trow", href: "#/topic/" + n.id },
        el("span", { class: "st", style: "--rc:" + rc(n.id) }, el("span", { class: "id", text: n.id }), el("span", { class: "tt", text: n.t })),
        el("span", { class: "num" }, Math.round(V[n.id])), el("span", { class: "num hide-sm" }, f1(V[n.id] / n.h)), el("span", { class: "num hide-sm" }, n.h),
        el("span", null, statusChip(n.id)))));
  }
  function hlText(text, qq) {
    const i = text.toLowerCase().indexOf(qq);
    if (i < 0) return text;
    return [text.slice(0, i), el("mark", { text: text.slice(i, i + qq.length) }), text.slice(i + qq.length)];
  }
  function atlasSearch(qq) {
    const hits = [];
    G.ORDER.forEach(n => {
      const m = [];
      if (n.t.toLowerCase().includes(qq) || n.id.toLowerCase() === qq) m.push(["Topic", n.t]);
      n.s.forEach(s => { if (s.toLowerCase().includes(qq)) m.push(["Subtopic", s]); });
      n.r.forEach(r => { if (r.toLowerCase().includes(qq)) m.push(["Resource", r]); });
      if (n.p.toLowerCase().includes(qq)) m.push(["Project", n.p]);
      if (n.w.toLowerCase().includes(qq)) m.push(["Why", n.w]);
      if (m.length) hits.push([n, m]);
    });
    const c = card(hits.length + " topics match", null);
    if (!hits.length) c.append(el("p", { class: "empty" }, "No matches. Try a shorter word."));
    hits.forEach(([n, m]) => c.append(el("div", { class: "search-hit", style: "padding:10px 0;border-top:1px solid var(--line)" },
      el("div", { class: "row" }, st(n.id), statusChip(n.id)),
      el("ul", { style: "margin:6px 0 0;padding-left:18px;font-size:13.5px;color:var(--ink2)" }, m.slice(0, 5).map(([k, t]) => el("li", null, el("span", { class: "kicker" }, k + " "), hlText(t, qq)))))));
    app.append(c);
  }

  // ================= TOPIC =================
  function viewTopic() {
    const t = T(param), id = t.id, ph = G.CURRICULUM[t.phase];
    const [stTxt, stCls] = status(id);
    const missing = [...G.ANC[id]].filter(x => !isDone(x)).sort((a, b) => T(a).pos - T(b).pos);
    const rel = S.goals.length ? E.relevance(G, S.goals).R[id] : null;
    const tp = E.topicPoints(G, id);
    const prev = G.ORDER[t.pos - 1], next = G.ORDER[t.pos + 1];

    app.append(el("div", { class: "topic-head", style: "--rc:" + rc(id) },
      el("div", { class: "crumb" }, el("a", { href: "#/atlas" }, "Atlas"), "›", el("span", null, ph.code + " · " + ph.name), "›", el("span", null, G.REALMS[t.realm].name)),
      el("h1", null, el("span", { class: "id", text: id }), t.t),
      el("div", { class: "row" }, chip(stTxt, stCls), chip(t.h + " hours"), chip(t.s.length + " subtopics"), chip(fmt(tp) + " pts"), S.goals.includes(id) ? chip("your goal", "goal") : null, S.current === id ? chip("current", "ready") : null),
      el("p", { style: "font-size:16px;color:var(--ink2);max-width:75ch" }, t.w),
      el("div", { class: "row" },
        S.current !== id ? el("button", { class: "btn sm", type: "button", onclick: () => { S.current = id; S.touched[id] = Date.now(); commit(); toast("Set as current topic"); } }, "Make current") : null,
        S.goals.includes(id) ? el("button", { class: "btn sm", type: "button", onclick: () => removeGoal(id) }, "Remove goal") : el("button", { class: "btn sm route", type: "button", onclick: () => { addGoal(id); toast("Added " + id + " as a goal"); } }, "Set as goal"),
        el("button", { class: "btn sm", type: "button", onclick: () => { S.start = { mode: "topic", topic: id }; commit(); location.hash = "#/route"; } }, "Start route here"),
        el("a", { class: "btn sm", href: "#/web", onclick: () => { UI.webSel = id; saveUI(); } }, "Show in web"))));

    if (missing.length && !isDone(id)) app.append(el("div", { class: "callout", style: "margin-bottom:16px" },
      el("b", null, missing.length + " prerequisite" + (missing.length > 1 ? "s" : "") + " not done yet (" + fmt(missing.reduce((a, x) => a + T(x).h * (1 - frac(x)), 0)) + " h). "),
      "You can still read ahead. The ranking only recommends it once these are done. ",
      el("a", { href: "#/topic/" + missing[0] }, "Start with " + missing[0] + ": " + T(missing[0]).t)));

    const left = el("div", { class: "grid", style: "align-content:start" }), right = el("div", { class: "grid", style: "align-content:start" });
    app.append(el("div", { class: "grid g-side" }, left, right));

    // checklist
    const doneArr = new Set(S.done[id] || []);
    const subsCard = card("Subtopics", cnt(id) + " of " + t.s.length + " done");
    subsCard.append(el("div", { style: "margin-bottom:10px" }, bar(frac(id), "done")));
    const ul = el("ul", { class: "subs" });
    t.s.forEach((s, i) => {
      const cid = "sub-" + id + "-" + i, on = doneArr.has(i);
      const peekBox = el("div", { class: "peek", hidden: true });
      const also = [];
      (G.SUB_CONCEPTS[id][i] || []).forEach(ci => G.CONCEPT_TOPICS[ci].forEach(o => { if (o !== id && !also.find(a => a[0] === o)) also.push([o, G.CONCEPTS[ci][0]]); }));
      also.sort((a, b) => (T(a[0]).phase === t.phase) - (T(b[0]).phase === t.phase) || Math.abs(T(a[0]).pos - t.pos) - Math.abs(T(b[0]).pos - t.pos));
      const peekBtn = el("button", { type: "button", onclick: async () => {
        if (!peekBox.hidden) { peekBox.hidden = true; return; }
        peekBox.hidden = false; fill(peekBox, "Looking it up on Wikipedia…");
        try {
          const d = await wikiPeek(s, t.t);
          if (!d || !d.extract) { fill(peekBox, "No quick summary found. Try the search or video links."); return; }
          fill(peekBox, d.thumbnail ? el("img", { src: d.thumbnail.source, alt: "" }) : null, el("h4", { text: d.title }), el("p", { text: d.extract }),
            el("p", { style: "margin-top:6px;font-size:12.5px" }, el("a", { href: "#/wiki/" + q(d.title) }, "Read the full article in the Reader"), " · ", el("a", { href: d.content_urls && d.content_urls.desktop ? d.content_urls.desktop.page : "https://en.wikipedia.org/wiki/" + q(d.title), target: "_blank", rel: "noopener" }, "Wikipedia ↗")));
        } catch (e) { fill(peekBox, "Couldn't reach Wikipedia right now."); }
      } }, "Quick read");
      ul.append(el("li", null,
        el("div", { class: "sub-main" },
          el("input", { type: "checkbox", id: cid, checked: on ? true : null, onchange: e => toggleSub(id, i, e.target.checked) }),
          el("label", { for: cid, class: on ? "done-txt" : null, style: "cursor:pointer" }, s),
          el("div", { class: "tools" }, peekBtn,
            el("a", { href: "https://www.youtube.com/results?search_query=" + q(clean(s) + " " + clean(t.t)), target: "_blank", rel: "noopener" }, "Video"),
            el("a", { href: "https://www.google.com/search?q=" + q(clean(s) + " " + clean(t.t) + " tutorial"), target: "_blank", rel: "noopener" }, "Search"),
            el("a", { href: "https://claude.ai/new?q=" + q("Teach me \"" + s + "\" in the context of " + t.t + ". Start with intuition and a concrete example, then the key details, then give me 3 practice problems with answers hidden at the end."), target: "_blank", rel: "noopener" }, "Ask Claude"))),
        also.length ? el("div", { class: "also" }, "Also in:", also.slice(0, 4).map(([o, c]) => el("a", { class: "chip", href: "#/topic/" + o, title: c, style: "text-decoration:none" }, o + " · " + c))) : null,
        peekBox));
    });
    subsCard.append(ul, el("div", { class: "row", style: "margin-top:12px" },
      armed(el("button", { class: "btn sm", type: "button" }), isDone(id) ? "Uncheck all" : "I already know this", "Click again to confirm", () => setAllSubs(id, !isDone(id)))));
    left.append(subsCard);

    // depth: self-check + project ladder
    const dp = DEPTH[id];
    if (dp) left.append(card("Check yourself", "answer without notes before ticking the last box",
      el("ol", { class: "qs" }, dp.q.map(qq => el("li", null, el("span", { text: qq }),
        el("a", { class: "chip", href: "https://claude.ai/new?q=" + q("Quiz me on this question from \"" + t.t + "\": " + qq + " — let me answer first, then grade my answer and fill the gaps."), target: "_blank", rel: "noopener" }, "Get quizzed ↗"))))));
    const ld = S.ladder[id] || {};
    const rung = (key, label, text, pts, checked, onch) => el("div", { class: "rung" + (checked ? " on" : "") },
      el("label", null, el("input", { type: "checkbox", id: "ld-" + key + "-" + id, checked: checked ? true : null, onchange: e => onch(e.target.checked) }),
        el("span", { class: "kicker" }, label), el("span", { class: "mono muted", style: "font-size:12px;margin-left:auto" }, "+" + fmt(pts) + " pts")),
      el("p", { text: text }));
    const setLd = (k, on) => { const o = { ...(S.ladder[id] || {}) }; if (on) o[k] = Date.now(); else delete o[k]; if (o.s || o.x) S.ladder[id] = o; else delete S.ladder[id]; S.touched[id] = Date.now(); S.log.push([Date.now(), id, on ? 1 : -1]); toast(on ? "Project rung done" : "Unmarked"); commit(); };
    left.append(card("Project ladder", "three builds, rising difficulty", el("div", { class: "ladder" },
      dp ? rung("s", "1 · Starter", dp.s, tp * 0.10, ld.s, on => setLd("s", on)) : null,
      rung("p", (dp ? "2 · " : "") + "Core project", t.p, tp * 0.25, S.proj[id], on => toggleProj(id, on)),
      dp ? rung("x", "3 · Stretch", dp.x, tp * 0.35, ld.x, on => setLd("x", on)) : null),
      el("p", { style: "margin-top:8px;font-size:12.5px" }, el("a", { href: "https://github.com/search?type=repositories&q=" + q(clean(t.t) + " project"), target: "_blank", rel: "noopener" }, "See similar projects on GitHub ↗"))));

    const tf = formulasFor(id);
    if (tf.length) left.append(card("Formulas", tf.length + " used in this topic", el("div", { class: "grid g2" }, tf.map(f => formulaCard(f, true))), el("p", { style: "margin-top:8px;font-size:13px" }, el("a", { href: "#/formulas" }, "All formulas →"))));
    // resources
    left.append(card("Study material", "links open in a new tab",
      el("ul", { class: "res" }, t.r.map(r => { const x = resolve(r); return el("li", null, el("a", { href: x.url, target: "_blank", rel: "noopener" }, el("span", { class: "kind" + (x.direct ? "" : " search") }, x.direct ? x.kind : "find"), el("span", null, r), el("span", { class: "host" }, x.direct ? host(x.url) : "web search"))); })),
      el("div", { class: "kicker", style: "margin:14px 0 6px" }, "Explore further"),
      el("div", { class: "chips" }, topicLinks(t).map(([l, u]) => el("a", { class: "chip", href: u, target: "_blank", rel: "noopener" }, l + " ↗")))));

    // notes
    const ta = el("textarea", { id: "note-" + id, placeholder: "Where you stopped, what confused you, what to do first next time…" }, S.notes[id] ? S.notes[id].text : "");
    let nt; ta.oninput = () => { clearTimeout(nt); nt = setTimeout(() => { const v = ta.value.trim(); if (v) S.notes[id] = { text: v.slice(0, 5000), at: Date.now() }; else delete S.notes[id]; S.touched[id] = Date.now(); commit({ quiet: true }); }, 700); };
    left.append(card("Notes", S.notes[id] ? "saved " + new Date(S.notes[id].at).toLocaleDateString() : "private to you", ta));

    // evaluation
    const m = t.m, W = S.prefs.W, sumW = W.impact + W.foundation + W.bridge + W.concepts;
    const rank = G.ORDER.filter(n => V[n.id] > V[id]).length + 1;
    const roiRank = G.ORDER.filter(n => V[n.id] / n.h > V[id] / t.h).length + 1;
    right.append(card("Evaluation", "how much this topic is worth",
      el("div", { class: "score-big" }, el("b", { text: Math.round(V[id]) }), el("span", { class: "muted" }, "/ 100 value · #" + rank + " of " + G.ORDER.length)),
      el("div", { class: "stack", style: "margin-top:12px" },
        meter("Impact", m.impact, W.impact / sumW, "Hand-rated 1–5: demand, longevity, leverage (" + t.impact + "/5)"),
        meter("Foundation", m.foundation, W.foundation / sumW, G.DESC[id].size + " topics depend on it"),
        meter("Bridge", m.bridge, W.bridge / sumW, "connects to " + Math.round(m.bridge * 6) + " other realms"),
        meter("Concepts", m.concepts, W.concepts / sumW, G.CONC[id].size + " shared concepts")),
      el("hr", { class: "sep" }),
      el("div", { class: "stats" }, stat(f1(V[id] / t.h), "ROI (value/h) · #" + roiRank), stat(fmt(G.CHAIN_H[id]) + " h", "deepest chain to here"), rel != null ? stat(pct(rel), "goal relevance") : stat(String(t.deps.length), "direct prereqs"))));

    // prereqs / unlocks / related
    const reqC = card("Requires", G.ANC[id].size ? G.ANC[id].size + " topics in its full chain" : "nothing: a starting point");
    if (t.deps.length) reqC.append(el("div", { class: "kicker", style: "margin-bottom:6px" }, "Direct"), el("div", { class: "stack" }, t.deps.map(d => el("div", { class: "row", style: "justify-content:space-between" }, st(d), statusChip(d)))));
    const indirect = [...G.ANC[id]].filter(x => !t.deps.includes(x)).sort((a, b) => T(a).pos - T(b).pos);
    if (indirect.length) reqC.append(el("details", { style: "margin-top:10px" }, el("summary", { class: "muted", style: "font-size:13px" }, indirect.length + " indirect (" + indirect.filter(x => !isDone(x)).length + " not done)"),
      el("div", { class: "chips", style: "margin-top:8px" }, indirect.map(x => el("a", { class: "chip " + status(x)[1], href: "#/topic/" + x, title: T(x).t }, x)))));
    right.append(reqC);

    const unC = card("Unlocks", G.DESC[id].size ? G.DESC[id].size + " topics downstream" : "a leaf: nothing depends on it");
    if (t.dependents.length) unC.append(el("div", { class: "stack" }, t.dependents.map(d => el("div", { class: "row", style: "justify-content:space-between" }, st(d),
      el("span", { class: "mono muted", style: "font-size:12px" }, T(d).deps.filter(x => x !== id && !isDone(x)).length ? "+" + T(d).deps.filter(x => x !== id && !isDone(x)).length + " more needed" : "opens directly")))));
    right.append(unC);

    // big ideas (themes), hand-written bridges, and the data-driven group
    const ths = G.THEME_OF[id].map(ti => G.THEMES[ti]);
    if (ths.length) right.append(card("Big ideas it carries", ths.length + " cross-cutting themes",
      el("div", { class: "stack" }, ths.map(th => el("details", { class: "theme" },
        el("summary", null, el("b", { text: th.name }), el("span", { class: "muted", style: "font-size:12px;margin-left:6px" }, Object.keys(th.roles).length + " topics")),
        el("p", { style: "font-size:13.5px;margin:6px 0" }, el("i", { text: "Here: " }), th.roles[id]),
        el("p", { class: "muted", style: "font-size:12.5px;margin-bottom:6px" }, th.idea),
        el("div", { class: "stack" }, Object.entries(th.roles).filter(([o]) => o !== id).map(([o, r]) => el("div", { style: "font-size:13px" }, st(o), el("div", { class: "muted", style: "font-size:12.5px" }, r)))))))));
    const brs = [...G.TLINK[id].entries()].filter(([, l]) => l.bridge);
    if (brs.length) right.append(card("Surprising bridges", null, el("div", { class: "stack" }, brs.map(([o, l]) => el("div", null, st(o), el("p", { class: "muted", style: "font-size:13px" }, l.bridge))))));
    const cl = G.CLUSTERS[G.CLUSTER[id]];
    right.append(card("Its neighbourhood", cl.name + (cl.theme ? " · " + cl.theme : ""),
      el("p", { class: "muted", style: "font-size:12.5px;margin-bottom:8px" }, "Topics that cluster with this one when the whole web is grouped by prerequisites, shared concepts, themes and bridges."),
      el("div", { class: "chips" }, cl.ids.filter(x => x !== id).map(x => el("a", { class: "chip " + status(x)[1], href: "#/topic/" + x, title: T(x).t }, x + " · " + T(x).t))),
      el("p", { style: "margin-top:8px;font-size:13px" }, el("a", { href: "#/web", onclick: () => { UI.webSel = id; UI.webColor = "cluster"; saveUI(); } }, "See it in the web →"))));

    const shared = [...G.SHARED[id].entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 8);
    right.append(card("Related by concept", shared.length ? null : "no shared concepts",
      el("div", { class: "stack" }, shared.map(([o, cs]) => el("div", null, st(o), el("div", { class: "muted", style: "font-size:12px" }, cs.length + " shared: " + cs.map(c => G.CONCEPTS[c][0]).slice(0, 4).join(", ")))))));

    app.append(el("nav", { class: "pager" },
      prev ? el("a", { class: "btn", href: "#/topic/" + prev.id }, "← " + prev.id + " " + prev.t) : el("span"),
      next ? el("a", { class: "btn", href: "#/topic/" + next.id }, next.id + " " + next.t + " →") : el("span")));
  }
  function meter(label, v, w, title) {
    return el("div", { title },
      el("div", { class: "meter" }, el("span", null, label), bar(v), el("b", { text: Math.round(v * 100) })),
      el("div", { class: "muted", style: "font-size:11.5px;margin:-2px 0 0 104px" }, title + " · weight " + Math.round(w * 100) + "%"));
  }

  // ================= WEB =================
  let panelEl = null;
  function graphCtx() {
    return { G, V, S, UI, isDone, frac, sel: UI.webSel || null, selGroup: UI.webGroup != null ? UI.webGroup : null, n: UI.webN || 2,
      onSelect: id => { UI.webSel = id; if (id) UI.webGroup = null; saveUI(); Graph.update(graphCtx()); renderWebPanel(); },
      onSelectGroup: g => { UI.webSel = null; UI.webGroup = g; saveUI(); Graph.update(graphCtx()); renderWebPanel(); },
      route: UI.webRoute || (S.plan ? S.plan.ids : null) };
  }
  const swatch = i => el("i", { class: "sw", style: "background:" + Graph.groupColor(i) });
  function selectGroup(g) { UI.webSel = null; UI.webGroup = g; saveUI(); Graph.focusGroup(g); Graph.update(graphCtx()); renderWebPanel(); }
  function selectNode(id) { UI.webSel = id; UI.webGroup = null; saveUI(); Graph.focus(id); Graph.update(graphCtx()); renderWebPanel(); }
  function viewWeb() {
    app.append(el("div", { class: "view-head" }, el("div", { class: "stack" }, el("h1", null, "Web of connections"),
      el("p", null, G.ORDER.length + " topics grouped into " + G.CLUSTERS.length + " neighbourhoods by what actually links them: prerequisites, shared concepts, the " + G.THEMES.length + " cross-cutting themes and " + G.BRIDGES.length + " hand-written bridges. Each group has its own colour, groups that link strongly sit side by side, and curved lines are the links between groups. Click a topic or a group."))));
    const ctl = el("div", { class: "webctl" });
    const mk = (labelTxt, input) => el("label", null, labelTxt, input);
    const layout = seg([["groups", "Groups"], ["flow", "Flow"], ["web", "Realms"]], UI.webLayout || "groups", v => { UI.webLayout = v; saveUI(); rerenderSeg(layout, v); Graph.relayout(v); });
    const colour = seg([["cluster", "Colour: groups"], ["realm", "Realms"], ["status", "Progress"]], UI.webColor || "cluster", v => { UI.webColor = v; saveUI(); rerenderSeg(colour, v); Graph.update(graphCtx()); });
    const nIn = el("input", { type: "range", min: 1, max: 6, value: UI.webN || 2 });
    const nOut = el("output", { text: "n = " + (UI.webN || 2) });
    nIn.oninput = () => { UI.webN = Number(nIn.value); nOut.textContent = "n = " + nIn.value; saveUI(); Graph.update(graphCtx()); renderWebPanel(); };
    const thC = el("input", { type: "checkbox", checked: UI.webThemes !== false ? true : null });
    thC.onchange = () => { UI.webThemes = thC.checked; saveUI(); Graph.update(graphCtx()); renderWebPanel(); };
    const conc = el("input", { type: "checkbox", checked: UI.webConc !== false ? true : null });
    conc.onchange = () => { UI.webConc = conc.checked; saveUI(); Graph.update(graphCtx()); };
    const find = el("input", { type: "search", list: "webList", placeholder: "Find a topic", style: "width:170px" });
    const wl = el("datalist", { id: "webList" }, G.ORDER.map(n => el("option", { value: n.id + " · " + n.t })));
    find.onchange = () => { const id = find.value.split(" ")[0].toUpperCase(); if (G.BY[id]) { selectNode(id); find.value = ""; } };
    ctl.append(layout, colour, mk("", nIn), nOut, mk("Theme threads", thC), mk("Concept threads", conc), find, wl,
      el("button", { class: "btn sm", type: "button", onclick: () => Graph.fit() }, "Fit"),
      el("button", { class: "btn sm", type: "button", onclick: () => { UI.webSel = null; UI.webGroup = null; UI.webRoute = null; saveUI(); Graph.update(graphCtx()); renderWebPanel(); } }, "Clear"));
    const box = el("div", { class: "canvasbox" });
    panelEl = el("aside", { class: "card wpanel", "aria-live": "polite" });
    app.append(ctl, el("div", { class: "webwrap" }, el("div", null, box,
      el("div", { class: "legend", style: "margin-top:8px" },
        el("span", null, el("i", { style: "background:var(--req)" }), "requires"), el("span", null, el("i", { style: "background:var(--next)" }), "unlocks"),
        el("span", null, el("i", { style: "background:var(--rel)" }), "related"), el("span", null, el("i", { style: "background:var(--route)" }), "route"),
        el("span", null, "solid line = bridge · dotted = shared theme · inner dot = progress"))), panelEl));
    Graph.mount(box, graphCtx(), UI.webLayout || "groups");
    graphMounted = true;
    if (UI.webSel) Graph.focus(UI.webSel); else if (UI.webGroup != null) Graph.focusGroup(UI.webGroup);
    renderWebPanel();
  }
  function rerenderSeg(segEl, v) { segEl.querySelectorAll("button").forEach((b, i) => b.setAttribute("aria-pressed", String(b.dataset.v === v))); }
  function groupLinks(gi) {
    // strongest links from group gi to every other group, with example explanations
    const out = {};
    G.CLUSTERS[gi].ids.forEach(a => {
      G.TLINK[a].forEach((l, b) => { const gb = G.CLUSTER[b]; if (gb === gi) return; const o = (out[gb] = out[gb] || { w: 0, ex: [] }); o.w += l.themes.length * 0.45 + (l.bridge ? 1 : 0); o.ex.push([a, b, l]); });
      [...T(a).deps, ...T(a).dependents].forEach(b => { const gb = G.CLUSTER[b]; if (gb === gi) return; const o = (out[gb] = out[gb] || { w: 0, ex: [] }); o.w += 1; o.ex.push([a, b, null]); });
    });
    return Object.entries(out).map(([g, o]) => ({ g: Number(g), w: o.w, ex: o.ex.sort((x, y) => (y[2] && y[2].bridge ? 2 : y[2] ? 1 : 0) - (x[2] && x[2].bridge ? 2 : x[2] ? 1 : 0)) })).sort((a, b) => b.w - a.w);
  }
  function linkText(a, b, l) {
    if (!l) return T(b).deps.includes(a) ? a + " is a prerequisite of " + b : b + " is a prerequisite of " + a;
    if (l.bridge) return l.bridge;
    const th = G.THEMES[l.themes[0]];
    return th.name + ": " + th.roles[a] + " / " + th.roles[b];
  }
  function renderWebPanel() {
    if (!panelEl) return;
    panelEl.replaceChildren();
    const id = UI.webSel, gi = UI.webGroup;
    if (id && G.BY[id]) return nodePanel(id);
    if (gi != null && G.CLUSTERS[gi]) {
      const cl = G.CLUSTERS[gi];
      const done = cl.ids.filter(isDone).length;
      panelEl.append(el("div", { class: "row" }, swatch(gi), el("h3", null, cl.name)),
        el("p", { class: "muted", style: "font-size:13px;margin:4px 0 10px" }, cl.ids.length + " topics · " + done + " done · centre: " + cl.hub + " " + T(cl.hub).t + (cl.theme ? " · held together most by “" + cl.theme + "”" : "")),
        el("div", { class: "chips", style: "margin-bottom:12px" }, cl.ids.map(x => el("a", { class: "chip " + status(x)[1], href: "#/web", title: T(x).t, onclick: e => { e.preventDefault(); selectNode(x); } }, x + " · " + T(x).t))),
        el("div", { class: "kicker", style: "margin-bottom:6px" }, "Strongest links to other groups"));
      groupLinks(gi).slice(0, 7).forEach(gl => panelEl.append(el("div", { class: "glink" },
        el("button", { type: "button", class: "row glink-h", onclick: () => selectGroup(gl.g) }, swatch(gl.g), el("b", { text: G.CLUSTERS[gl.g].name }), el("span", { class: "mono muted", style: "font-size:12px;margin-left:auto" }, "weight " + f1(gl.w))),
        el("ul", null, gl.ex.slice(0, 3).map(([a, b, l]) => el("li", null, el("span", { class: "mono", style: "font-size:11.5px" }, a + " ↔ " + b + " "), el("span", { class: "muted", text: linkText(a, b, l) })))))));
      panelEl.append(el("button", { class: "btn sm", type: "button", style: "margin-top:8px", onclick: () => { UI.webGroup = null; saveUI(); Graph.update(graphCtx()); renderWebPanel(); } }, "All groups"));
      return;
    }
    panelEl.append(el("h3", null, "Groups"), el("p", { class: "muted", style: "font-size:13px;margin:4px 0 10px" }, "Found by community detection (Louvain) on the weighted web. Click one to see what holds it together and how it connects to the others."));
    G.CLUSTERS.forEach(cl => panelEl.append(el("button", { type: "button", class: "grow", onclick: () => selectGroup(cl.i) }, swatch(cl.i),
      el("span", { class: "grow-t" }, el("b", { text: cl.name }), el("small", { class: "muted" }, cl.ids.length + " topics" + (cl.theme ? " · " + cl.theme : ""))),
      el("span", { class: "mono muted", style: "font-size:11.5px" }, pct(cl.ids.filter(isDone).length / cl.ids.length)))));
    const top = Object.entries(G.CL_LINK).sort((a, b) => b[1] - a[1]).slice(0, 6);
    panelEl.append(el("div", { class: "kicker", style: "margin:14px 0 6px" }, "Tightest pairs of groups"),
      el("div", { class: "stack" }, top.map(([k, w]) => { const [a, b] = k.split("-").map(Number); return el("button", { type: "button", class: "grow", onclick: () => selectGroup(a) }, swatch(a), swatch(b), el("span", { class: "grow-t" }, el("span", { text: G.CLUSTERS[a].name + " ↔ " + G.CLUSTERS[b].name })), el("span", { class: "mono muted", style: "font-size:11.5px" }, f1(w))); })));
  }
  function nodePanel(id) {
    const t = T(id), H = Graph.hops(id, UI.webN || 2, UI.webMin || 2), gi = G.CLUSTER[id];
    panelEl.append(el("div", { class: "row", style: "justify-content:space-between" }, st(id), statusChip(id)),
      el("button", { type: "button", class: "grow", style: "margin:6px 0", onclick: () => selectGroup(gi) }, swatch(gi), el("span", { class: "grow-t" }, el("small", { class: "muted" }, "group"), el("b", { text: G.CLUSTERS[gi].name }))),
      el("p", { class: "muted", style: "font-size:13px;margin:6px 0" }, t.w),
      el("div", { class: "row", style: "margin-bottom:10px" }, el("a", { class: "btn sm primary", href: "#/topic/" + id }, "Open topic"), el("button", { class: "btn sm", type: "button", onclick: () => { addGoal(id); toast("Added " + id + " as a goal"); } }, "Set as goal"),
        el("a", { class: "btn sm", href: "#/combo", onclick: () => { UI.comboFix = id; saveUI(); roll = null; } }, "🎲 Roll with it")),
      el("div", { class: "stats", style: "margin-bottom:12px" }, stat(String(Math.round(V[id])), "value"), stat(String(G.ANC[id].size), "requires"), stat(String(G.DESC[id].size), "unlocks"), stat(String(G.TLINK[id].size), "theme links")));
    const chipsFor = (ids, cls) => el("div", { class: "chips" }, ids.slice(0, 40).map(x => el("a", { class: "chip " + (cls || ""), href: "#/web", title: T(x).t, onclick: e => { e.preventDefault(); selectNode(x); } }, x)));
    const sec = (title, ids, cls) => ids.length ? el("div", { style: "margin-bottom:12px" }, el("div", { class: "kicker", style: "margin-bottom:5px" }, title + " · " + ids.length), chipsFor(ids, cls)) : null;
    const missing = [...G.ANC[id]].filter(x => !isDone(x)).sort((a, b) => T(a).pos - T(b).pos);
    panelEl.append(sec("Requires (not done)", missing, "block"), sec("Unlocks directly", t.dependents));
    const tl = [...G.TLINK[id].entries()].sort((a, b) => (b[1].bridge ? 5 : 0) + b[1].themes.length - (a[1].bridge ? 5 : 0) - a[1].themes.length);
    const far = tl.filter(([o]) => G.CLUSTER[o] !== gi);
    if (far.length) panelEl.append(el("div", { class: "kicker", style: "margin:4px 0 6px" }, "Reaches into other groups · " + far.length),
      el("ul", { class: "linklist" }, far.slice(0, 8).map(([o, l]) => el("li", null, el("a", { href: "#/web", onclick: e => { e.preventDefault(); selectNode(o); } }, swatch(G.CLUSTER[o]), el("b", { text: o }), " " + T(o).t), el("div", { class: "muted", text: linkText(id, o, l) })))));
    panelEl.append(el("div", { class: "kicker", style: "margin:10px 0 6px" }, "Neighbours by hop (n = " + (UI.webN || 2) + ")"));
    H.byHop.forEach((ids, h) => { if (h > 0 && ids.length) panelEl.append(el("div", { style: "margin-bottom:8px" }, el("div", { class: "muted", style: "font-size:12px" }, h + " hop" + (h > 1 ? "s" : "") + " · " + ids.length + " topics"), chipsFor(ids.slice(0, 30)))); });
  }

  // ================= WIKIPEDIA =================
  const WK = "https://en.wikipedia.org/w/api.php?format=json&formatversion=2&origin=*&";
  const wcache = { title: {}, links: {}, art: {} };
  async function wget(params) { const r = await fetch(WK + params); if (!r.ok) throw new Error("wiki " + r.status); return r.json(); }
  async function wikiTitle(text) {
    const k = clean(text).split(/[:;]/)[0];
    if (k in wcache.title) return wcache.title[k];
    const j = await wget("action=query&list=search&srlimit=1&srsearch=" + q(k));
    const t = j.query && j.query.search && j.query.search[0] ? j.query.search[0].title : null;
    wcache.title[k] = t; return t;
  }
  async function wikiLinks(title) {
    if (wcache.links[title]) return wcache.links[title];
    let out = [], cont = "";
    for (let i = 0; i < 3; i++) {
      const j = await wget("action=query&prop=links&plnamespace=0&pllimit=max&redirects=1&titles=" + q(title) + cont);
      const pg = j.query && j.query.pages && j.query.pages[0];
      if (pg && pg.links) out = out.concat(pg.links.map(l => l.title));
      if (!j.continue) break;
      cont = "&plcontinue=" + q(j.continue.plcontinue);
    }
    wcache.links[title] = out; return out;
  }
  async function wikiArticle(title) {
    if (wcache.art[title]) return wcache.art[title];
    const j = await wget("action=query&prop=extracts|pageimages|info&explaintext=1&exsectionformat=wiki&redirects=1&inprop=url&piprop=thumbnail&pithumbsize=480&titles=" + q(title));
    const pg = j.query && j.query.pages && j.query.pages[0];
    const a = pg && !pg.missing ? { title: pg.title, text: pg.extract || "", url: pg.fullurl, thumb: pg.thumbnail && pg.thumbnail.source } : null;
    wcache.art[title] = a; return a;
  }
  async function wikiCompare(tA, tB) {
    if (!tA || !tB || tA === tB) return { checked: !!(tA && tB), shared: [], direct: tA && tA === tB ? [tA, tB] : null, tA, tB };
    const [la, lb] = await Promise.all([wikiLinks(tA), wikiLinks(tB)]);
    const sb = new Set(lb);
    const shared = la.filter(x => sb.has(x) && !/^(ISBN|Doi|Digital object identifier|Wayback Machine|PubMed|ArXiv|Bibcode|JSTOR|S2CID|OCLC)/i.test(x));
    const direct = la.includes(tB) ? [tA, tB] : lb.includes(tA) ? [tB, tA] : null;
    return { checked: true, shared, direct, tA, tB };
  }
  function withTimeout(p, ms) { return Promise.race([p, new Promise(res => setTimeout(() => res(null), ms))]); }
  // prose matching: anchor every alternative at a word start so "versa" isn't RSA and "opposite" isn't PPO
  const PROSE_RE = G.CONCEPTS.map(([, re]) => new RegExp("(?<![A-Za-z0-9])(?:" + re.source.replace(/\\b/g, "") + ")", "g" + (re.flags.includes("i") ? "i" : "")));
  function conceptHits(text) {
    const hits = [];
    text = text.slice(0, 25000);
    PROSE_RE.forEach((g, i) => { const m = text.match(g); if (m && m.length >= 2) hits.push([i, m.length]); });
    return hits.sort((a, b) => b[1] - a[1]);
  }
  function topicsForConcepts(hits) {
    const score = {};
    hits.forEach(([ci, n]) => G.CONCEPT_TOPICS[ci].forEach(id => (score[id] = (score[id] || 0) + Math.min(n, 60))));
    return Object.entries(score).map(([id, v]) => [id, Math.round(v / Math.sqrt(Math.max(1, G.CONC[id].size)))]).sort((a, b) => b[1] - a[1]);
  }

  // ================= TEX =================
  function tex(src, display) {
    const span = el("span", { class: display ? "tex tex-d" : "tex" });
    if (window.katex) { try { window.katex.render(src, span, { throwOnError: false, displayMode: !!display }); } catch (e) { span.textContent = src; } }
    else span.textContent = src;
    return span;
  }
  window.addEventListener("load", () => { if (["formulas", "combo", "topic"].includes(view)) rerender(); });
  const formulasFor = id => FORMULAS.filter(f => f.t.includes(id));
  // ================= COMBO =================
  const SUB_LIST = []; G.ORDER.forEach(n => n.s.forEach((_, i) => SUB_LIST.push([n.id, i])));
  const nPairsT = G.ORDER.length * (G.ORDER.length - 1) / 2, nPairsS = SUB_LIST.length * (SUB_LIST.length - 1) / 2;
  const nTriples = SUB_LIST.length * (SUB_LIST.length - 1) * (SUB_LIST.length - 2) / 6;
  const nExplained = (() => { let k = 0; G.ORDER.forEach(n => (k += G.TLINK[n.id].size)); return k / 2; })();
  const rnd = () => Math.random();
  const enc = X => X.wiki ? "W:" + X.wiki.slice(0, 9) : X.sub != null ? X.id + "." + X.sub : X.id;
  const labelOf = X => X.wiki ? X.wiki : X.sub != null ? T(X.id).s[X.sub] : T(X.id).t;
  let roll = null;
  const LABELS = ["Strong", "Solid", "Weak", "Distant"];
  const bandOf = s => s >= 70 ? 0 : s >= 45 ? 1 : s >= 25 ? 2 : 3;

  // distance without theme links (prerequisites + strong concept overlap), used to judge how surprising a link is
  let DIST = null;
  function plainDist() {
    if (DIST) return DIST;
    DIST = {};
    const nb = id => { const s = new Set([...T(id).deps, ...T(id).dependents]); G.SHARED[id].forEach((cs, o) => { if (cs.length >= 2) s.add(o); }); return s; };
    G.ORDER.forEach(n => {
      const d = { [n.id]: 0 }, q2 = [n.id];
      while (q2.length) { const x = q2.shift(); nb(x).forEach(y => { if (d[y] == null) { d[y] = d[x] + 1; q2.push(y); } }); }
      DIST[n.id] = d;
    });
    return DIST;
  }
  function inScope(id, side) {
    const realm = side === "A" ? UI.comboRA : UI.comboRB;
    if (realm != null && realm !== "any" && String(T(id).realm) !== String(realm)) return false;
    const sc = UI.comboScope || "all";
    if (sc === "route") { const req = new Set(); S.goals.forEach(g => { req.add(g); G.ANC[g].forEach(x => req.add(x)); }); if (S.goals.length && !req.has(id)) return false; }
    if (sc === "done" && !isDone(id)) return false;
    if (sc === "prog" && !(cnt(id) > 0)) return false;
    if (sc === "new" && cnt(id) > 0) return false;
    return true;
  }
  const poolT = side => G.ORDER.filter(n => inScope(n.id, side)).map(n => n.id);
  function surprisePairs() {
    const D = plainDist(), out = [];
    G.ORDER.forEach(n => G.TLINK[n.id].forEach((l, o) => {
      if (n.id >= o) return;
      const d = D[n.id][o] != null ? D[n.id][o] : 7;
      const crossRealm = T(n.id).realm !== T(o).realm, crossGroup = G.CLUSTER[n.id] !== G.CLUSTER[o];
      const w = (l.themes.length * 1 + (l.bridge ? 2 : 0)) * (0.5 + Math.min(d, 6) / 2.5) * (crossRealm ? 1.6 : 0.7) * (crossGroup ? 2 : 0.45);
      out.push([n.id, o, w]);
    }));
    return out;
  }
  let SURP = null;
  function pickSurprise() {
    SURP = SURP || surprisePairs();
    const fix = UI.comboFix && G.BY[UI.comboFix] ? UI.comboFix : null;
    const ok = SURP.map(([a, b, w]) => {
      if (fix && a !== fix && b !== fix) return null;
      if (inScope(a, "A") && inScope(b, "B")) return [a, b, w];
      if (inScope(b, "A") && inScope(a, "B")) return [b, a, w];
      return null;
    }).filter(Boolean);
    if (!ok.length) return null;
    const tot = ok.reduce((s2, x) => s2 + x[2] * x[2], 0);
    let r = rnd() * tot;
    for (const x of ok) { r -= x[2] * x[2]; if (r <= 0) return x; }
    return ok[ok.length - 1];
  }
  function bestSub(id, otherId) {
    // the subtopic of `id` that shares the most concepts with the other topic, else random
    const oc = G.CONC[otherId]; let best = null, bs = 0;
    G.SUB_CONCEPTS[id].forEach((cs, i) => { const k = cs.filter(c => oc.has(c)).length; if (k > bs) { bs = k; best = i; } });
    return best != null ? best : Math.floor(rnd() * T(id).s.length);
  }

  async function newRoll(mode, dist, seedWiki) {
    mode = mode || UI.comboMode || "surprise"; dist = dist || UI.comboDist || "any";
    const fix = UI.comboFix && G.BY[UI.comboFix] ? UI.comboFix : null;
    const pa = poolT("A"), pb = poolT("B");
    if (!pa.length || !pb.length) { roll = { empty: true }; rerender(); return; }
    const pick = arr => arr[Math.floor(rnd() * arr.length)];
    const mkT = side => ({ id: side === "A" && fix ? fix : pick(side === "A" ? pa : pb), sub: null });
    const mkS = side => { const id = side === "A" && fix ? fix : pick(side === "A" ? pa : pb); return { id, sub: Math.floor(rnd() * T(id).s.length) }; };
    if (mode === "wild" || seedWiki) {
      const A = mkS("A");
      roll = { items: [A, { wiki: seedWiki || null, loading: !seedWiki }], mode: "wild", phase: "guess" };
      rerender();
      if (!seedWiki) {
        try {
          const [sid, si] = SUB_LIST[Math.floor(rnd() * SUB_LIST.length)];
          const t0 = await wikiTitle(T(sid).s[si]);
          const links = t0 ? (await wikiLinks(t0)).filter(x => !/^(List of|Index of|Outline of|ISBN|Digital object)/.test(x)) : [];
          roll.items[1] = { wiki: links.length ? links[Math.floor(rnd() * links.length)] : (t0 || "Information theory") };
        } catch (e) { roll.items[1] = { wiki: "Information theory" }; }
        rerender();
      }
      return;
    }
    let items = null;
    if (mode === "surprise") {
      const p = pickSurprise();
      if (p) items = [{ id: p[0], sub: rnd() < 0.5 ? null : bestSub(p[0], p[1]) }, { id: p[1], sub: rnd() < 0.5 ? null : bestSub(p[1], p[0]) }];
      else mode = "mixed";
    }
    if (!items) {
      for (let tries = 0; tries < 400; tries++) {
        items = mode === "triple" ? [mkS("A"), mkS("B"), mkS("B")] : mode === "topics" ? [mkT("A"), mkT("B")] : mode === "subs" ? [mkS("A"), mkS("B")] : [rnd() < 0.5 ? mkT("A") : mkS("A"), rnd() < 0.5 ? mkT("B") : mkS("B")];
        if (items[0].id === items[1].id && items[0].sub === items[1].sub) continue;
        if (dist === "any" || mode === "triple") break;
        const h = plainDist()[items[0].id][items[1].id]; const hh = h == null ? 9 : h;
        if (dist === "near" && hh <= 2) break;
        if (dist === "far" && hh >= 4) break;
      }
    }
    const wp = items.length === 2 ? E.webPath(G, items[0].id, items[1].id, 2) : null;
    roll = { items, mode, phase: "guess", bridge: wp && wp.hops >= 2 ? E.bridgeQuestion(G, items[0].id, items[1].id, rnd) : null };
    rerender();
  }

  async function reveal() {
    roll.phase = "checking"; rerender();
    const it = roll.items;
    try {
      if (roll.mode === "wild") {
        const A = it[0], tA = await withTimeout(wikiTitle(labelOf(A) + " " + T(A.id).t), 5000);
        const art = await withTimeout(wikiArticle(it[1].wiki), 6000);
        const cmp = await withTimeout(wikiCompare(tA, art ? art.title : it[1].wiki), 7000);
        roll.result = wildConnect(A, art, cmp, tA);
      } else {
        const pairs = it.length === 3 ? [[0, 1], [1, 2], [0, 2]] : [[0, 1]];
        roll.results = [];
        for (const [x, y] of pairs) {
          const tt = await withTimeout(Promise.all([wikiTitle(labelOf(it[x])), wikiTitle(labelOf(it[y]))]), 5000) || [];
          const cmp = tt[0] && tt[1] ? await withTimeout(wikiCompare(tt[0], tt[1]), 7000) : null;
          const res = E.connect(G, it[x], it[y], cmp);
          res.wiki = cmp; res.pair = [x, y];
          roll.results.push(res);
        }
        roll.result = it.length === 3 ? { score: Math.round(roll.results.reduce((a, r) => a + r.score, 0) / 3), ev: [] } : roll.results[0];
        if (it.length === 3) roll.result.label = LABELS[bandOf(roll.result.score)];
      }
    } catch (e) { roll.result = roll.result || { score: 0, label: "Distant", ev: [{ sign: "−", text: "Couldn't compute the connection: " + e.message, pts: 0 }] }; }
    let pts = 0; const notes = [];
    const actual = bandOf(roll.result.score);
    if (roll.guess != null) { const d = Math.abs(roll.guess - actual); if (d === 0) { pts += 30; notes.push("exact strength +30"); } else if (d === 1) { pts += 10; notes.push("one band off +10"); } else notes.push("strength guess missed"); }
    if (roll.bridge && roll.bridgePick) { if (roll.bridgePick === roll.bridge.answer) { pts += 40; notes.push("bridge found +40"); } else notes.push("bridge was " + roll.bridge.answer); }
    if ((roll.idea || "").trim().length >= 40) { pts += 10; notes.push("wrote a connection +10"); }
    if (roll.mode === "triple") pts = Math.round(pts * 1.5);
    roll.pts = pts; roll.notes = notes; roll.phase = "reveal";
    S.combo = [...(S.combo || []), [Date.now(), enc(it[0]), it.length === 3 ? enc(it[1]) + "+" + enc(it[2]) : enc(it[1]), roll.guess != null ? LABELS[roll.guess] : "", roll.result.score, pts, (roll.idea || "").trim()]].slice(-3000);
    S.log.push([Date.now(), it[0].id || "OR1", pts > 0 ? 1 : 0]);
    toast(pts ? "+" + pts + " combo pts" : "No points this roll. Keep rolling");
    commit();
  }

  function wildConnect(A, art, cmp, tA) {
    const ev = []; let score = 0;
    const add = (p, sign, text) => { score += p; ev.push({ sign, text, pts: p, kind: "wiki" }); };
    if (!art) return { score: 0, label: "Distant", ev: [{ sign: "−", text: "Couldn't load the Wikipedia article.", pts: 0 }], art: null };
    const hits = conceptHits(art.text);
    const mine = A.sub != null ? new Set(G.SUB_CONCEPTS[A.id][A.sub]) : G.CONC[A.id];
    const topicC = G.CONC[A.id];
    const overlapSub = hits.filter(([c]) => mine.has(c)), overlapTop = hits.filter(([c]) => topicC.has(c) && !mine.has(c));
    if (overlapSub.length) add(Math.min(36, 18 * overlapSub.length), "+", "“" + art.title + "” discusses " + overlapSub.map(([c, n]) => G.CONCEPTS[c][0] + " (" + n + "×)").join(", ") + ", exactly what " + labelOf(A) + " covers.");
    if (overlapTop.length) add(Math.min(20, 7 * overlapTop.length), "+", "It also mentions " + overlapTop.slice(0, 4).map(([c]) => G.CONCEPTS[c][0]).join(", ") + ", taught elsewhere in " + A.id + ".");
    if (!overlapSub.length && !overlapTop.length) add(0, "−", "None of the article's text matches the concepts " + A.id + " teaches.");
    const ths = G.THEME_OF[A.id].map(ti => G.THEMES[ti]).filter(th => new RegExp(th.name.split(/[ &,]+/).filter(w => w.length > 4).join("|"), "i").test(art.text.slice(0, 20000)));
    if (ths.length) add(Math.min(20, 10 * ths.length), "+", "The article touches the big idea" + (ths.length > 1 ? "s " : " ") + ths.map(t => "“" + t.name + "”").join(", ") + ", which " + A.id + " carries: " + ths[0].roles[A.id]);
    if (cmp && cmp.direct) add(22, "+", "Wikipedia links “" + cmp.direct[0] + "” directly to “" + cmp.direct[1] + "”.");
    if (cmp && cmp.shared.length) add(Math.min(24, 3 + cmp.shared.length), "+", "“" + (tA || labelOf(A)) + "” and “" + art.title + "” share " + cmp.shared.length + " outgoing links, e.g. " + cmp.shared.slice(0, 5).join(", ") + ".");
    else if (cmp) add(0, "−", "Their Wikipedia articles share no links.");
    const tops = topicsForConcepts(hits).slice(0, 5);
    if (tops.length) ev.push({ sign: "·", text: "In your atlas, this article sits closest to " + tops.map(([id]) => id + " " + T(id).t).join(", ") + ".", pts: 0 });
    score = Math.min(100, Math.round(score));
    return { score, label: LABELS[bandOf(score)], ev, art, cmp, tops };
  }

  function itemCard(X) {
    if (X.wiki !== undefined) return el("div", { class: "combo-item wild" }, el("div", { class: "kicker" }, "Wild card · Wikipedia"),
      el("h3", null, X.loading ? "Drawing a random article…" : X.wiki), X.wiki ? el("a", { href: "#/wiki/" + q(X.wiki), class: "muted", style: "font-size:13px" }, "Open in Reader") : null);
    const t = T(X.id), gi = G.CLUSTER[X.id];
    return el("div", { class: "combo-item", style: "--rc:" + rc(X.id) },
      el("div", { class: "kicker" }, (X.sub != null ? "Subtopic" : "Topic") + " · " + G.REALMS[t.realm].name),
      el("h3", null, X.sub != null ? t.s[X.sub] : t.t),
      el("div", { class: "row", style: "margin-top:6px" }, st(X.id), statusChip(X.id)),
      el("div", { class: "row", style: "margin-top:6px;font-size:12.5px" }, swatch(gi), el("span", { class: "muted" }, G.CLUSTERS[gi].name + " group")));
  }

  // SVG diagram: A on the left, B on the right, one lane per kind of link in between
  function connDiagram(A, B, r) {
    const NS = "http://www.w3.org/2000/svg";
    const lanes = [];
    const l = G.TLINK[A.id] && G.TLINK[A.id].get(B.id);
    if (l && l.bridge) lanes.push({ kind: "bridge", label: "Direct bridge", tip: l.bridge, color: "var(--route)" });
    if (l) l.themes.forEach(ti => lanes.push({ kind: "theme", label: G.THEMES[ti].name, tip: G.THEMES[ti].idea, color: Graph.groupColor(ti * 3 % 17) }));
    (r.sharedSub.length ? r.sharedSub : r.sharedTop).slice(0, 4).forEach(c => lanes.push({ kind: "concept", label: c, tip: "Shared concept", color: "var(--rel)" }));
    r.ev.filter(e => e.kind === "formula").forEach(e => { const m = e.text.match(/Shared math: (.*?) appear/); if (m) m[1].split(/, | and /).slice(0, 3).forEach(n => lanes.push({ kind: "formula", label: n.replace(/ and \d+ more$/, ""), tip: "Formula used in both", color: "var(--prog)" })); });
    const chain = (() => { const dp = E.directedPath(G, A.id, B.id) || E.directedPath(G, B.id, A.id); return dp && dp.path.length > 2 ? dp.path.slice(1, -1) : null; })();
    if (chain) lanes.push({ kind: "chain", label: "Prerequisite chain", path: chain, color: "var(--req)" });
    const wp = E.webPath(G, A.id, B.id, 2);
    if (wp && wp.hops >= 2 && (!chain || wp.path.slice(1, -1).join() !== chain.join())) lanes.push({ kind: "web", label: "Shortest web path", path: wp.path.slice(1, -1), color: "var(--muted)" });
    if (G.BY[A.id].deps.includes(B.id) || G.BY[B.id].deps.includes(A.id)) lanes.unshift({ kind: "prereq", label: "Direct prerequisite", color: "var(--req)" });
    if (!lanes.length) lanes.push({ kind: "none", label: "No direct links: only distant paths", color: "var(--line2)" });
    const LH = 46, Wd = 900, Hd = Math.max(140, 30 + lanes.length * LH), bx = 170;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${Wd} ${Hd}`); svg.setAttribute("class", "conn"); svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Connection diagram with " + lanes.length + " links between " + A.id + " and " + B.id);
    const mk = (tag, attrs, text) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); if (text != null) n.textContent = text; return n; };
    const cy = Hd / 2;
    const endBox = (x, X, anchor) => {
      const g = mk("g", {});
      g.append(mk("rect", { x: x - (anchor === "start" ? 0 : bx), y: cy - 34, width: bx, height: 68, rx: 12, fill: "var(--surface)", stroke: rc(X.id), "stroke-width": 3 }));
      g.append(mk("text", { x: x + (anchor === "start" ? 14 : -bx + 14), y: cy - 8, class: "cid", fill: rc(X.id) }, X.id));
      const lbl = labelOf(X); g.append(mk("text", { x: x + (anchor === "start" ? 14 : -bx + 14), y: cy + 14, class: "clbl" }, lbl.length > 22 ? lbl.slice(0, 21) + "…" : lbl));
      return g;
    };
    lanes.forEach((ln, i) => {
      const y = 15 + LH / 2 + i * LH, x0 = bx, x1 = Wd - bx;
      const path = `M${x0} ${cy} C ${x0 + 90} ${cy}, ${300 - 60} ${y}, 300 ${y} L ${600} ${y} C ${600 + 60} ${y}, ${x1 - 90} ${cy}, ${x1} ${cy}`;
      svg.append(mk("path", { d: path, fill: "none", stroke: ln.color, "stroke-width": ln.kind === "bridge" || ln.kind === "prereq" ? 3.5 : 2.2, "stroke-dasharray": ln.kind === "concept" ? "5 5" : ln.kind === "web" || ln.kind === "none" ? "2 5" : "", opacity: 0.9 }));
      const g = mk("g", {});
      if (ln.path) {
        const n = ln.path.length, span = 300 / Math.max(1, n);
        ln.path.slice(0, 6).forEach((id, k) => { const x = 300 + span * (k + 0.5); g.append(mk("circle", { cx: x, cy: y, r: 9, fill: rc(id), stroke: "var(--surface)", "stroke-width": 2 })); g.append(mk("text", { x, y: y - 14, class: "cnode", "text-anchor": "middle" }, id)); });
        g.append(mk("text", { x: 450, y: y + 24, class: "ckind", "text-anchor": "middle" }, ln.label + " · " + ln.path.length + " step" + (ln.path.length > 1 ? "s" : "")));
      } else {
        g.append(mk("rect", { x: 312, y: y - 14, width: 276, height: 28, rx: 14, fill: "var(--surface)", stroke: ln.color, "stroke-width": 1.5 }));
        g.append(mk("text", { x: 450, y: y + 5, class: "cpill", "text-anchor": "middle" }, (ln.label.length > 36 ? ln.label.slice(0, 35) + "…" : ln.label)));
        g.append(mk("text", { x: 450, y: y - 19, class: "ckind", "text-anchor": "middle" }, ln.kind === "theme" ? "shared theme" : ln.kind === "concept" ? "shared concept" : ln.kind === "formula" ? "shared formula" : ""));
      }
      if (ln.tip) g.append(mk("title", {}, ln.tip));
      svg.append(g);
    });
    svg.append(endBox(0, A, "start"), endBox(Wd, B, "end"));
    return el("div", { class: "connwrap" }, svg);
  }

  function themeCards(A, B) {
    const l = G.TLINK[A.id] && G.TLINK[A.id].get(B.id);
    if (!l || (!l.themes.length && !l.bridge)) return null;
    return el("div", { class: "stack", style: "margin-top:12px" },
      l.bridge ? el("div", { class: "callout" }, el("b", null, "Bridge: "), l.bridge) : null,
      l.themes.map(ti => { const th = G.THEMES[ti]; return el("div", { class: "tcard" },
        el("div", { class: "row", style: "justify-content:space-between" }, el("b", { text: th.name }), el("span", { class: "muted", style: "font-size:12px" }, Object.keys(th.roles).length + " topics share it")),
        el("p", { class: "muted", style: "font-size:13px;margin:4px 0 8px" }, th.idea),
        el("div", { class: "tcols" },
          el("div", null, el("div", { class: "kicker" }, A.id + " · " + T(A.id).t), el("p", { text: th.roles[A.id] })),
          el("div", null, el("div", { class: "kicker" }, B.id + " · " + T(B.id).t), el("p", { text: th.roles[B.id] })))); }));
  }

  function viewCombo() {
    app.append(el("div", { class: "view-head" }, el("div", { class: "stack" }, el("h1", null, "Combo rolls"),
      el("p", null, "Roll two ideas and work out how they connect. Surprise rolls favour pairs from different realms that share a deep theme or a known bridge but sit far apart in the prerequisite map. Guess the strength, find the bridge topic, write your own link, then reveal the diagram and the evidence."))));
    const P = E.points(G, S);
    const played = (S.combo || []).length, exact = (S.combo || []).filter(e => e[3] && LABELS.indexOf(e[3]) === bandOf(e[4])).length;
    app.append(el("div", { class: "stats card", style: "margin-bottom:16px" },
      stat(fmt(nExplained), "explained topic links"), stat(fmt(nPairsS), "subtopic pairs"), stat((nTriples / 1e6).toFixed(0) + "M", "subtopic triples"), stat("6.9M", "Wikipedia wild cards"),
      stat(String(played), "rolls played"), stat(played ? pct(exact / played) : "–", "exact guesses"), stat(fmt(P.combo), "combo points")));
    const realmSel = (key, label) => { const s2 = el("select", { "aria-label": label }, el("option", { value: "any" }, label + ": any realm"), G.REALMS.map((r, i) => el("option", { value: String(i), selected: String(UI[key]) === String(i) ? true : null }, label + ": " + r.name))); s2.onchange = () => { UI[key] = s2.value; saveUI(); newRoll(); }; return s2; };
    const scopeSel = el("select", { "aria-label": "Scope" }, [["all", "All topics"], ["route", "My goal route"], ["done", "Done"], ["prog", "In progress"], ["new", "Not started"]].map(([v, l]) => el("option", { value: v, selected: (UI.comboScope || "all") === v ? true : null }, l)));
    scopeSel.onchange = () => { UI.comboScope = scopeSel.value; saveUI(); newRoll(); };
    app.append(el("div", { class: "row", style: "margin-bottom:10px;gap:12px" },
      seg([["surprise", "Surprise"], ["mixed", "Mixed"], ["topics", "Topics"], ["subs", "Subtopics"], ["triple", "Triple"], ["wild", "Wild card"]], UI.comboMode || "surprise", v => { UI.comboMode = v; saveUI(); newRoll(v); }),
      seg([["any", "Any distance"], ["near", "Near"], ["far", "Far apart"]], UI.comboDist || "any", v => { UI.comboDist = v; saveUI(); newRoll(null, v); }),
      el("button", { class: "btn route", type: "button", onclick: () => newRoll(), id: "rollBtn" }, "🎲 Roll")),
      el("div", { class: "row", style: "margin-bottom:16px;gap:10px" }, realmSel("comboRA", "Side A"), realmSel("comboRB", "Side B"), scopeSel,
        UI.comboFix && G.BY[UI.comboFix] ? el("span", { class: "chip goal" }, "Fixed: " + UI.comboFix, el("button", { type: "button", "aria-label": "Unfix", onclick: () => { UI.comboFix = null; saveUI(); newRoll(); } }, "×")) : null));
    if (!roll) { newRoll(); return; }
    if (roll.empty) { app.append(el("p", { class: "empty" }, "No topics match those filters. Loosen them a little.")); return; }

    const it = roll.items;
    app.append(el("section", { class: "card combo" }, el("div", { class: "combo-row" + (it.length === 3 ? " three" : "") }, it.map((X, i) => [i ? el("div", { class: "combo-vs", "aria-hidden": "true" }, "⟷") : null, itemCard(X)]))));

    if (roll.phase !== "reveal") {
      const g = el("section", { class: "card", style: "margin-top:16px" });
      g.append(el("h2", null, "Your call"),
        el("div", { class: "kicker", style: "margin:4px 0 6px" }, it.length === 3 ? "How tightly do all three hang together?" : "How strong is the connection?"),
        el("div", { class: "seg" }, LABELS.map((l, i) => el("button", { type: "button", "aria-pressed": String(roll.guess === i), onclick: () => { roll.guess = i; rerender(); } }, l))));
      if (roll.bridge) g.append(el("div", { class: "kicker", style: "margin:14px 0 6px" }, "Bridge challenge: which topic sits on the shortest path between them?"),
        el("div", { class: "chips" }, roll.bridge.options.map(o => el("button", { type: "button", class: "btn sm" + (roll.bridgePick === o ? " primary" : ""), onclick: () => { roll.bridgePick = o; rerender(); } }, o + " · " + T(o).t))));
      if (!it[1].wiki) { const h = G.THEME_OF[it[0].id].filter(ti => G.THEME_OF[it[1].id].includes(ti)); if (h.length && roll.hint) g.append(el("p", { class: "callout", style: "margin-top:12px" }, "Hint: think about “" + G.THEMES[h[0]].name + "”.")); }
      const ta = el("textarea", { id: "comboIdea", placeholder: "Your connection: how does one lead to, use, or mirror the other? (40+ characters earns +10)" }, roll.idea || "");
      ta.oninput = () => (roll.idea = ta.value);
      g.append(el("div", { class: "kicker", style: "margin:14px 0 6px" }, "Explain the link in your own words"), ta,
        el("div", { class: "row", style: "margin-top:10px" }, el("button", { class: "btn primary", type: "button", disabled: roll.phase === "checking" || (it[1] && it[1].loading) ? true : null, onclick: reveal }, roll.phase === "checking" ? "Checking the graph and Wikipedia…" : "Reveal the connection"),
          !it[1].wiki && !roll.hint ? el("button", { class: "btn", type: "button", onclick: () => { roll.hint = true; rerender(); } }, "Hint") : null,
          el("button", { class: "btn", type: "button", onclick: () => newRoll() }, "Skip")));
      app.append(g);
    } else {
      const r = roll.result;
      const res = el("section", { class: "card", style: "margin-top:16px" });
      res.append(el("div", { class: "row", style: "justify-content:space-between;align-items:flex-end" },
        el("div", { class: "score-big" }, el("b", { text: r.score }), el("span", { class: "muted" }, "/ 100 · " + r.label)),
        el("div", { class: "chips" }, roll.notes.map(n => chip(n, /\+/.test(n) ? "done" : "")), chip("+" + roll.pts + " pts", roll.pts ? "goal" : ""))),
        el("div", { style: "margin:10px 0 14px" }, bar(r.score / 100, r.score >= 70 ? "done" : r.score >= 45 ? "req" : "route")));
      const verdict = r.score >= 70 ? "Strong: several independent signals agree. They share a big idea or a known bridge, and often math or concepts too."
        : r.score >= 45 ? "Solid: a real link, usually one strong signal (a shared theme, a bridge or a prerequisite chain), but they don't overlap everywhere."
        : r.score >= 25 ? "Weak: they touch through one or two indirect threads, so you can learn either without the other."
        : "Distant: different worlds, with no shared theme, concept or short path. Any connection is one you'd have to argue for, which is where unusual insights come from.";
      const evCols = ev => {
        const pos = ev.filter(e => e.sign === "+"), neg = ev.filter(e => e.sign === "−"), info = ev.filter(e => e.sign === "·");
        const item = e => el("li", { class: "ev-" + (e.kind || "x") }, el("span", { class: "evk" }, ({ bridge: "bridge", theme: "theme", concept: "concept", formula: "math", prereq: "prereq", chain: "chain", meet: "meet", root: "root", near: "near", far: "far", realm: "realm", wiki: "wiki", same: "same" })[e.kind] || "link"), el("span", { text: e.text }), e.pts ? el("b", { class: "evp" }, "+" + Math.round(e.pts)) : null);
        return el("div", { class: "evcols" },
          el("div", null, el("h3", null, "Why it's " + (r.score >= 45 ? "strong" : "connected at all")), pos.length ? el("ul", { class: "evl pos" }, pos.map(item)) : el("p", { class: "muted" }, "No positive evidence.")),
          el("div", null, el("h3", null, "Why it's " + (r.score >= 70 ? "not perfect" : "weak")), neg.length ? el("ul", { class: "evl neg" }, neg.map(item)) : el("p", { class: "muted" }, "Nothing against it."), info.length ? el("ul", { class: "evl" }, info.map(item)) : null));
      };
      if (roll.results && roll.results.length === 3) {
        const weakest = [...roll.results].sort((a, b) => a.score - b.score)[0];
        const odd = [0, 1, 2].find(i => !weakest.pair.includes(i)) ;
        res.append(el("p", { class: "callout", style: "margin-bottom:12px" }, "Triangle strength is the average of the three links. The weakest link is " + labelOf(it[weakest.pair[0]]) + " ⟷ " + labelOf(it[weakest.pair[1]]) + ", so " + labelOf(it[odd]) + " is the glue between them."));
        roll.results.forEach(rr => res.append(el("details", { class: "pairbox", open: rr === weakest ? null : true }, el("summary", null, el("b", { text: labelOf(it[rr.pair[0]]) + "  ⟷  " + labelOf(it[rr.pair[1]]) }), " ", chip(rr.score + " · " + rr.label)),
          connDiagram(it[rr.pair[0]], it[rr.pair[1]], rr), evCols(rr.ev))));
      } else if (roll.mode === "wild") {
        res.append(el("p", { class: "callout", style: "margin-bottom:12px" }, verdict), evCols(r.ev));
        if (r.cmp && r.cmp.shared && r.cmp.shared.length) res.append(el("div", { class: "kicker", style: "margin:14px 0 6px" }, "Shared Wikipedia links · " + r.cmp.shared.length), el("div", { class: "chips" }, r.cmp.shared.slice(0, 40).map(x => el("a", { class: "chip", href: "#/wiki/" + q(x) }, x))));
        if (r.art) res.append(el("div", { class: "kicker", style: "margin:14px 0 6px" }, "About the wild card"), el("p", { style: "font-size:14px;color:var(--ink2)" }, r.art.text.slice(0, 700) + (r.art.text.length > 700 ? "…" : "")),
          el("p", { style: "margin-top:6px" }, el("a", { href: "#/wiki/" + q(r.art.title) }, "Read the whole article in the Reader")));
      } else {
        const A = it[0], B = it[1];
        res.append(el("p", { class: "callout", style: "margin-bottom:12px" }, verdict), connDiagram(A, B, r), themeCards(A, B), el("div", { style: "height:12px" }), evCols(r.ev));
        if (r.wiki && r.wiki.shared && r.wiki.shared.length) res.append(el("div", { class: "kicker", style: "margin:14px 0 6px" }, "Wikipedia pages both articles link to · " + r.wiki.shared.length), el("div", { class: "chips" }, r.wiki.shared.slice(0, 40).map(x => el("a", { class: "chip", href: "#/wiki/" + q(x) }, x))));
        const fs = FORMULAS.filter(f => r.ev.some(e => e.kind === "formula" && e.text.includes(f.n)));
        if (fs.length) res.append(el("div", { class: "kicker", style: "margin:14px 0 6px" }, "The shared math"), el("div", { class: "grid g2" }, fs.slice(0, 4).map(f => formulaCard(f, true))));
      }
      if (roll.bridge) res.append(el("p", { style: "margin-top:12px;font-size:14px" }, "Bridge answer: ", st(roll.bridge.answer), " on the path " + roll.bridge.path.join(" → ") + "."));
      if (roll.idea && roll.idea.trim()) res.append(el("div", { class: "kicker", style: "margin:14px 0 6px" }, "Your connection"), el("p", { style: "font-style:italic" }, "“" + roll.idea.trim() + "”"));
      res.append(el("div", { class: "row", style: "margin-top:14px" }, el("button", { class: "btn route", type: "button", onclick: () => newRoll() }, "🎲 Roll again"),
        !it[1].wiki ? el("a", { class: "btn", href: "#/web", onclick: () => { UI.webSel = it[0].id; UI.webRoute = (E.webPath(G, it[0].id, it[1].id, 2) || { path: null }).path; saveUI(); } }, "Show this path in the web") : null,
        !it[1].wiki ? el("a", { class: "btn", href: "https://claude.ai/new?q=" + q("Explain every interesting connection between \"" + labelOf(it[0]) + "\" (" + T(it[0].id).t + ") and \"" + labelOf(it[1]) + "\"" + (it[2] ? " and \"" + labelOf(it[2]) + "\"" : "") + ". Include shared math, historical links, and one surprising application that combines them."), target: "_blank", rel: "noopener" }, "Ask Claude to go deeper ↗") : null));
      app.append(res);
    }

    const hist = (S.combo || []).slice(-12).reverse();
    if (hist.length) app.append(el("div", { style: "height:16px" }), card("Recent rolls", null, el("div", { class: "tblwrap" }, el("table", { class: "tbl" },
      el("thead", null, el("tr", null, el("th", null, "Pair"), el("th", null, "Your guess"), el("th", { class: "num" }, "Score"), el("th", { class: "num" }, "Pts"))),
      el("tbody", null, hist.map(e => el("tr", null, el("td", { style: "font-size:13px" }, e[1] + " ⟷ " + e[2], e[6] ? el("div", { class: "muted", style: "font-size:12px" }, "“" + e[6].slice(0, 90) + "”") : null), el("td", null, e[3] || "–"), el("td", { class: "num" }, e[4] + " " + LABELS[bandOf(e[4])]), el("td", { class: "num" }, e[5]))))))));
  }

  // ================= READER =================
  let readerSeen = new Set();
  function viewWiki() {
    const title = param;
    const sbox = el("input", { type: "search", placeholder: "Search Wikipedia from inside the atlas…", style: "flex:1 1 260px", id: "wikiSearch" });
    sbox.addEventListener("keydown", async e => { if (e.key === "Enter" && sbox.value.trim()) { const t = await wikiTitle(sbox.value.trim()); if (t) location.hash = "#/wiki/" + q(t); else toast("No article found"); } });
    const wander = async ev => {
      const btn = ev && ev.currentTarget; if (btn) { btn.disabled = true; btn.textContent = "Finding an article…"; }
      try {
        // random subtopic → its article; half the time hop one link further for variety
        for (let tries = 0; tries < 4; tries++) {
          const [id, i] = SUB_LIST[Math.floor(Math.random() * SUB_LIST.length)];
          let t = await wikiTitle(T(id).s[i] + " " + T(id).t);
          if (!t) t = await wikiTitle(T(id).s[i]);
          if (t && Math.random() < 0.5) {
            const links = (await wikiLinks(t)).filter(x => !/^(List of|Index of|Outline of|Timeline of|ISBN|Digital object|Wayback)|\b(1[0-9]|20)\d\d\b|^\d/.test(x));
            const onTopic = links.filter(x => PROSE_RE.some(re => { re.lastIndex = 0; return re.test(x); }));
            const pool = onTopic.length ? onTopic : links;
            if (pool.length) t = pool[Math.floor(Math.random() * pool.length)];
          }
          if (t && t !== param) { toast("From " + id + ": " + T(id).s[i]); location.hash = "#/wiki/" + q(t); return; }
        }
        toast("Couldn't find an article, try again");
      } catch (e) { toast("Couldn't reach Wikipedia right now"); }
      if (btn) { btn.disabled = false; btn.textContent = "Wander: random article from the atlas"; }
    };
    app.append(el("div", { class: "view-head" }, el("div", { class: "stack", style: "flex:1" }, el("h1", null, "Reader"),
      el("p", null, "Full Wikipedia articles inside the atlas. Every link opens here too, and each article is matched back to your topics, so you can wander through millions of pages without leaving your map. +2 pts per new article."))),
      el("div", { class: "row", style: "margin-bottom:16px" }, sbox, el("button", { class: "btn route", type: "button", onclick: wander }, "Wander: random article from the atlas")));
    if (!title) {
      app.append(card("Start somewhere", "articles behind your current topic",
        el("div", { class: "chips" }, T(S.current).s.map(s => el("button", { class: "btn sm", type: "button", onclick: async () => { const t = await wikiTitle(s); if (t) location.hash = "#/wiki/" + q(t); } }, s)))));
      return;
    }
    const body = el("section", { class: "card wiki" }, el("p", { class: "muted" }, "Loading “" + title + "” from Wikipedia…"));
    const side = el("div", { class: "grid", style: "align-content:start" });
    app.append(el("div", { class: "grid g-side" }, body, side));
    (async () => {
      let art; try { art = await wikiArticle(title); } catch (e) { fill(body, el("p", null, "Couldn't reach Wikipedia right now.")); return; }
      if (!art) { fill(body, el("p", null, "No article called “" + title + "”."), el("button", { class: "btn", type: "button", onclick: wander }, "Wander instead")); return; }
      if (view !== "wiki" || param !== title) return;
      if (!readerSeen.has(art.title)) { readerSeen.add(art.title); S.wikiSeen = (S.wikiSeen || 0) + 1; commit({ quiet: true }); updatePoints(); }
      document.title = art.title + " · Reader · Gate to GPT";
      const parts = []; let cur = { h: null, lvl: 1, ps: [] };
      art.text.split("\n").forEach(line => {
        const m = line.match(/^(={2,4})\s*(.*?)\s*\1\s*$/);
        if (m) { parts.push(cur); cur = { h: m[2], lvl: m[1].length, ps: [] }; }
        else if (line.trim()) cur.ps.push(line.trim());
      });
      parts.push(cur);
      const skip = /^(See also|References|Notes|Further reading|External links|Bibliography|Sources|Citations|Footnotes)$/i;
      fill(body, 
        el("div", { class: "row", style: "justify-content:space-between" }, el("h1", null, art.title), el("a", { class: "btn sm", href: art.url, target: "_blank", rel: "noopener" }, "Wikipedia ↗")),
        art.thumb ? el("img", { src: art.thumb, alt: "", class: "wiki-thumb" }) : null,
        parts.filter(p => p.ps.length && !(p.h && skip.test(p.h))).map(p => el("div", null, p.h ? el(p.lvl <= 2 ? "h2" : "h3", { class: "wiki-h" }, p.h) : null, p.ps.map(t => el("p", { class: "wiki-p", text: t })))),
        el("p", { class: "muted", style: "font-size:12px;margin-top:20px" }, "Text from Wikipedia, “" + art.title + "”, available under CC BY-SA 4.0."));
      const hits = conceptHits(art.text.slice(0, 80000));
      const tops = topicsForConcepts(hits).slice(0, 10);
      side.append(card("In your atlas", tops.length ? "topics this article touches" : "no matching concepts",
        el("div", { class: "stack" }, tops.map(([id, sc]) => el("div", { class: "row", style: "justify-content:space-between" }, st(id), el("span", { class: "mono muted", style: "font-size:12px" }, sc)))),
        hits.length ? el("div", { class: "chips", style: "margin-top:10px" }, hits.slice(0, 12).map(([c, n]) => chip(G.CONCEPTS[c][0] + " ×" + n))) : null,
        el("div", { class: "row", style: "margin-top:12px" }, el("button", { class: "btn sm route", type: "button", onclick: () => { UI.comboMode = "wild"; saveUI(); location.hash = "#/combo"; setTimeout(() => newRoll("wild", null, art.title), 50); } }, "🎲 Roll this against a random subtopic"))));
      const fs = FORMULAS.filter(f => hits.some(([c]) => f.c.includes(c))).slice(0, 4);
      if (fs.length) side.append(card("Related formulas", null, el("div", { class: "stack" }, fs.map(f => formulaCard(f, true)))));
      const lc = card("Links from this article", "loading…");
      side.append(lc);
      try {
        const links = await wikiLinks(art.title);
        const filt = el("input", { type: "search", placeholder: "Filter " + links.length + " links", style: "width:100%;margin-bottom:8px" });
        const box = el("div", { class: "chips linkcloud" });
        const draw = () => { const f = filt.value.toLowerCase(); box.replaceChildren(...links.filter(l => !f || l.toLowerCase().includes(f)).slice(0, 250).map(l => el("a", { class: "chip", href: "#/wiki/" + q(l) }, l))); };
        filt.oninput = draw; draw();
        lc.querySelector("small").textContent = links.length + " pages to wander into";
        lc.append(filt, box);
      } catch (e) { lc.querySelector("small").textContent = "couldn't load links"; }
    })();
  }

  // ================= FORMULAS =================
  const homeOf = f => f.t.slice().sort((a, b) => T(a).pos - T(b).pos)[0];
  function formulaCard(f, compact) {
    const home = homeOf(f), others = f.t.filter(x => x !== home);
    return el("div", { class: "fcard" },
      el("div", { class: "fhead" }, el("b", { class: "fname", text: f.n }), compact ? null : el("a", { class: "st", href: "#/topic/" + home, style: "--rc:" + rc(home) }, el("span", { class: "id", text: home }), el("span", { class: "muted", style: "font-size:12.5px" }, T(home).t))),
      el("div", { class: "fmath" }, tex(f.tex, true)),
      el("p", { class: "fmean" }, f.m),
      compact ? null : el("div", { class: "fmeta" },
        others.length ? el("span", { class: "kicker" }, "Also used in") : null,
        others.map(t => el("a", { class: "chip", href: "#/topic/" + t, title: T(t).t, style: "border-color:" + rc(t) }, t + " · " + T(t).t)),
        f.c.length ? el("span", { class: "kicker", style: "margin-left:6px" }, "Concepts") : null, f.c.map(c => chip(G.CONCEPTS[c][0]))),
      compact ? null : el("div", { class: "row", style: "gap:6px;margin-top:2px" },
        el("a", { class: "chip", href: "https://en.wikipedia.org/w/index.php?search=" + q(f.n), target: "_blank", rel: "noopener" }, "Wikipedia ↗"),
        el("a", { class: "chip", href: "https://claude.ai/new?q=" + q("Explain the formula \"" + f.n + "\": " + f.tex + " — define every symbol, derive it step by step, give intuition and a worked numeric example, and say where it's used."), target: "_blank", rel: "noopener" }, "Derive with Claude ↗")));
  }
  function viewFormulas() {
    const sb = el("input", { type: "search", placeholder: "Search " + FORMULAS.length + " formulas: name, meaning, topic ID, concept…", style: "flex:1 1 280px", id: "fSearch", value: UI.fq || "" });
    let tm; sb.oninput = () => { clearTimeout(tm); tm = setTimeout(() => { UI.fq = sb.value; saveUI(); rerender(); }, 200); };
    const routeSet = new Set(); S.goals.forEach(g => { routeSet.add(g); G.ANC[g].forEach(x => routeSet.add(x)); });
    app.append(el("div", { class: "view-head" }, el("div", { class: "stack", style: "flex:1" }, el("h1", null, "Formulas"),
      el("p", null, FORMULAS.length + " formulas, filed under the first topic in the curriculum that uses them and ordered the way you'll meet them. Each card shows its home topic, every other topic that reuses it, and the concepts it belongs to."))),
      el("div", { class: "row", style: "margin-bottom:12px;gap:12px" }, sb,
        seg([["all", "All"], ["route", "My goal route"], ["cross", "Cross-realm only"]], UI.fScope || "all", v => { UI.fScope = v; saveUI(); rerender(); }),
        seg([["cards", "Cards"], ["list", "Compact"]], UI.fView || "cards", v => { UI.fView = v; saveUI(); rerender(); })));
    const fq = (UI.fq || "").toLowerCase().trim();
    const realms = f => new Set(f.t.map(t => T(t).realm)).size;
    const list = FORMULAS.filter(f => (!fq || (f.n + " " + f.m + " " + f.t.join(" ") + " " + f.t.map(t => T(t).t).join(" ") + " " + f.c.map(c => G.CONCEPTS[c][0]).join(" ")).toLowerCase().includes(fq))
      && (UI.fScope !== "route" || f.t.some(t => routeSet.has(t)))
      && (UI.fScope !== "cross" || realms(f) >= 2));
    if (UI.fScope === "route" && !S.goals.length) app.append(el("p", { class: "callout", style: "margin-bottom:12px" }, "Set a goal on the Route page to filter to its formulas."));
    const byPhase = G.CURRICULUM.map(() => []);
    list.forEach(f => byPhase[T(homeOf(f)).phase].push(f));
    byPhase.forEach(arr => arr.sort((a, b) => T(homeOf(a)).pos - T(homeOf(b)).pos));
    app.append(el("nav", { class: "fnav" }, G.CURRICULUM.map((ph, i) => byPhase[i].length ? el("a", { href: "#/formulas", onclick: e => { e.preventDefault(); const t = document.getElementById("fph-" + ph.code); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); }, style: "--rc:var(--r" + G.BY[ph.topics[0].id].realm + ")" }, el("span", { class: "id" }, ph.code), byPhase[i].length) : null)));
    if (!list.length) { app.append(el("p", { class: "empty" }, "No formulas match.")); return; }
    G.CURRICULUM.forEach((ph, i) => {
      const fs = byPhase[i]; if (!fs.length) return;
      const sec = el("section", { class: "fsec", id: "fph-" + ph.code },
        el("h2", { class: "fsec-h" }, el("span", { class: "code", style: "--rc:var(--r" + G.BY[ph.topics[0].id].realm + ")" }, ph.code), ph.name, el("small", { class: "muted" }, fs.length + " formula" + (fs.length > 1 ? "s" : ""))));
      if ((UI.fView || "cards") === "list") {
        sec.append(el("div", { class: "card flist" }, fs.map(f => { const home = homeOf(f); return el("div", { class: "frow" },
          el("div", null, el("b", { text: f.n }), el("div", { class: "muted", style: "font-size:12.5px" }, f.m)),
          el("div", { class: "fmath" }, tex(f.tex, false)),
          el("div", { class: "chips" }, f.t.map(t => el("a", { class: "chip", href: "#/topic/" + t, title: T(t).t, style: t === home ? "font-weight:700" : null }, t)))); })));
      } else sec.append(el("div", { class: "grid g2" }, fs.map(f => el("article", { class: "card" }, formulaCard(f)))));
      app.append(sec);
    });
  }

  // ================= RULES =================
  function viewRules() {
    app.append(el("div", { class: "view-head" }, el("div", { class: "stack" }, el("h1", null, "Rules & weights"),
      el("p", null, "Everything the atlas recommends comes from the formulas below. Move a slider and every score, route and ranking updates. Nothing is random: the same progress always gives the same advice."))));
    const left = el("div", { class: "grid", style: "align-content:start" }), right = el("div", { class: "grid", style: "align-content:start" });
    app.append(el("div", { class: "grid g2" }, left, right));

    const W = S.prefs.W, R = S.prefs.R;
    const slider = (obj, k, label, onDone) => {
      const inp = el("input", { type: "range", min: 0, max: 1, step: 0.05, value: obj[k], id: "w-" + k });
      const out = el("output", { text: obj[k].toFixed(2) });
      inp.oninput = () => (out.textContent = Number(inp.value).toFixed(2));
      inp.onchange = () => { obj[k] = Number(inp.value); onDone(); };
      return el("div", { class: "slider" }, el("span", null, label), inp, out);
    };
    const reW = () => { V = E.valueTable(G, S.prefs.W); commit(); };
    left.append(card("Topic value (0–100)", "how worth it a topic is",
      el("div", { class: "formula" }, "value = 100 × ( wI·impact + wF·foundation\n              + wB·bridge + wC·concepts ) / Σw\n\nimpact     = hand rating 1–5 ÷ 5\nfoundation = √(topics depending on it ÷ max)\nbridge     = other realms it connects to ÷ 6\nconcepts   = shared concepts it teaches ÷ max\nROI        = value ÷ hours"),
      el("div", { class: "stack", style: "margin-top:12px" }, slider(W, "impact", "Impact wI", reW), slider(W, "foundation", "Foundation wF", reW), slider(W, "bridge", "Bridge wB", reW), slider(W, "concepts", "Concepts wC", reW)),
      el("div", { class: "row", style: "margin-top:10px" }, el("button", { class: "btn sm", type: "button", onclick: () => { S.prefs.W = { ...E.DEFAULT_W }; reW(); } }, "Reset value weights"))));

    left.append(card("Recommendation score", "ranks ready topics on Today",
      el("div", { class: "formula" }, "score = rV·value/100 + rG·goal relevance\n      + rU·unlock share + rP·progress\n      + rR·known-concept share + rM·momentum\n      − rC·min(1, hours/60)  then rules R2–R11\n\ngoal relevance = 1 if on the goal's prerequisite\n  chain, else 0.55·min(1, 3·Jaccard(concepts))\n  + 0.45·overlap with the chain's concepts"),
      el("div", { class: "stack", style: "margin-top:12px" }, [["value", "Value rV"], ["goal", "Goal rG"], ["unlock", "Unlocks rU"], ["progress", "Progress rP"], ["reinforce", "Known rR"], ["momentum", "Momentum rM"], ["cost", "Cost rC"]].map(([k, l]) => slider(R, k, l, () => commit()))),
      el("div", { class: "row", style: "margin-top:10px" }, el("button", { class: "btn sm", type: "button", onclick: () => { S.prefs.R = { ...E.DEFAULT_R }; commit(); } }, "Reset score weights"))));

    right.append(card("Rules", "applied in this order",
      el("ul", { class: "rules" }, [
        ["R1", "Readiness gate: a topic is only recommended when all its prerequisites are complete. Locked topics stay readable."],
        ["R2", "Finish first: a topic at least 50% done gets +0.25, so half-finished work closes before new work opens."],
        ["R3", "Focus limit: with 3 or more topics open, new topics get −0.30."],
        ["R4", "Goal lock: with a goal set, topics off its prerequisite chain are halved unless they're strongly related (relevance ≥ 0.5)."],
        ["R5", "Interleave: after 3 completions in the same realm, other realms get +0.08 to keep learning varied."],
        ["R6", "Stale alert: an in-progress topic untouched for 14 days is flagged to resume or reset."],
        ["R7", "Goal-required topics are tagged so you can see which moves move the goal."],
        ["R8", "Foundations first: under 15% overall, Foundations-realm topics get +0.10."],
        ["R9", "Restart: after 3+ idle days, topics of 15 h or less get +0.08 for a quick win."],
        ["R10", "Review: a prerequisite of your top move finished over 30 days ago gets a one-hour review prompt."],
        ["R11", "Follow route: the next unfinished topic on the route you're following gets +0.20."],
        ["Route", "Shortest = every not-yet-known prerequisite of the goal (it's a minimum: each one is required). Best value adds side topics greedily by (relevance × value) per hour, bundled with their own missing prerequisites, until the extra budget is spent or the ratio drops below 1.2 (0.6 for Deep)."],
        ["Branch", "Branch potential = value + Σ downstream value × 0.5^steps (6 steps deep), divided by the topic's hours."]
      ].map(([c, t]) => el("li", null, el("b", { class: "code", text: c }), el("span", { text: t }))))));

    const P = E.points(G, S);
    right.append(card("Points & levels", null,
      el("div", { class: "formula" }, "topic points = hours × 10 × (0.6 + 0.8 × value/100)\nsubtopic     = topic points ÷ subtopic count\ncompletion   = +20% of topic points\nproject      = +25% of topic points\nphase done   = +10% of the phase's points\ncombo roll   = exact strength +30, one off +10,\n               bridge +40, written link +10 (triple ×1.5)\nreader       = +2 per new Wikipedia article\nlevel        = ⌊√(points ÷ 60)⌋"),
      el("p", { style: "margin-top:10px;font-size:14px" }, "Points are computed from your progress, so unchecking removes them. Whole curriculum ≈ " + fmt(G.ORDER.reduce((a, n) => a + E.topicPoints(G, n.id) * 1.45, 0) * 1.1) + " pts."),
      el("div", { class: "tblwrap", style: "margin-top:10px" }, el("table", { class: "tbl" }, el("thead", null, el("tr", null, el("th", null, "Level"), el("th", null, "Title"), el("th", { class: "num" }, "Points"))),
        el("tbody", null, [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33].map(l => el("tr", { class: P.level >= l && P.level < l + 3 ? "sel" : null }, el("td", null, l + "–" + (l + 2)), el("td", null, E.levelTitle(l)), el("td", { class: "num" }, fmt(60 * l * l)))))))));

    // settings
    right.append(card("Your data", "saved in this browser",
      el("p", { class: "muted", style: "font-size:13.5px;margin-bottom:10px" }, "Progress, notes and goals save automatically in this browser. To use another device, download a save file here and load it there. Loading can merge two copies, keeping the newest change to each topic. You can also drop a save file anywhere on the page."),
      el("p", { class: "muted", style: "font-size:13px;margin-bottom:10px" }, exportedAt ? "Last save file: " + when(exportedAt) + (exportedAt >= S.updatedAt ? " (up to date)." : " (changed since).") : "No save file downloaded from this browser yet."),
      el("div", { class: "row" },
        el("button", { class: "btn sm primary", type: "button", onclick: downloadSave }, "Download save file"),
        el("button", { class: "btn sm", type: "button", onclick: () => saveFile.click() }, "Load save file…"),
        armed(el("button", { class: "btn sm", type: "button" }), "Reset all progress", "Click again to erase", () => { try { localStorage.setItem(LSUNDO, JSON.stringify(S)); } catch (e) {} const keep = S.prefs; S = E.emptyState(G); S.prefs = keep; commit(); toastUndo("Progress reset"); }))));
  }

  // ================= keyboard =================
  document.addEventListener("keydown", e => {
    if (e.target.closest("input, textarea, select")) return;
    if (e.key === "/") { e.preventDefault(); if (view !== "atlas") location.hash = "#/atlas"; setTimeout(() => { const s = document.getElementById("atlasSearch"); if (s) s.focus(); }, 30); }
    if (view === "topic" && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      const t = T(param), n = G.ORDER[t.pos + (e.key === "ArrowLeft" ? -1 : 1)];
      if (n) location.hash = "#/topic/" + n.id;
    }
  });

  // ================= boot =================
  parse(); render(true);
  refreshSaveStatus();
})();
