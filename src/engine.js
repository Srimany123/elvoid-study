// Gate to GPT engine: graph model, weights, routes, recommendations and points.
// Pure functions over the curriculum and a progress state. Works in the browser and in Node.
(function (root) {
  "use strict";

  const DEFAULT_W = { impact: 0.40, foundation: 0.30, bridge: 0.15, concepts: 0.15 };
  const DEFAULT_R = { value: 0.30, goal: 0.35, unlock: 0.15, progress: 0.15, reinforce: 0.05, momentum: 0.05, cost: 0.10 };
  const DAY = 864e5;

  let G_GAMMA = 2.5;
  function setGamma(g) { G_GAMMA = g; }
  function build(CURRICULUM, CONCEPTS, IMPACT, REALMS, FORMULAS, THEMES, BRIDGES) {
    const ORDER = [], BY = {};
    const REALM_OF = {};
    REALMS.forEach((r, i) => r.codes.forEach(c => (REALM_OF[c] = i)));

    CURRICULUM.forEach((ph, pi) => ph.topics.forEach((t, ti) => {
      const deps = [...(t.pre || [])];
      if (ti > 0 && !ph.branch) deps.unshift(ph.topics[ti - 1].id);
      const n = {
        id: t.id, t: t.t, h: t.h, w: t.w, s: t.s, r: t.r, p: t.p,
        phase: pi, code: ph.code, phaseName: ph.name, realm: REALM_OF[ph.code],
        pos: ORDER.length, deps: [...new Set(deps)], dependents: [],
        impact: IMPACT[t.id] || 3
      };
      ORDER.push(n); BY[n.id] = n;
    }));
    ORDER.forEach(n => n.deps.forEach(d => BY[d].dependents.push(n.id)));

    // transitive closures
    const ANC = {}, DESC = {};
    ORDER.forEach(n => { const s = new Set(); n.deps.forEach(d => { s.add(d); ANC[d].forEach(x => s.add(x)); }); ANC[n.id] = s; });
    [...ORDER].reverse().forEach(n => { const s = new Set(); n.dependents.forEach(d => { s.add(d); DESC[d].forEach(x => s.add(x)); }); DESC[n.id] = s; });

    // heaviest prerequisite chain (hours) ending at each topic, and the chain itself
    const CHAIN_H = {}, CHAIN_VIA = {};
    ORDER.forEach(n => {
      let best = 0, via = null;
      n.deps.forEach(d => { if (CHAIN_H[d] > best) { best = CHAIN_H[d]; via = d; } });
      CHAIN_H[n.id] = best + n.h; CHAIN_VIA[n.id] = via;
    });

    // concept index
    const SUB_CONCEPTS = {}, CONC = {}, CONCEPT_TOPICS = CONCEPTS.map(() => new Set());
    ORDER.forEach(n => {
      const all = new Set();
      SUB_CONCEPTS[n.id] = n.s.map(sub => {
        const hit = [];
        CONCEPTS.forEach(([, re], i) => { if (re.test(sub)) { hit.push(i); all.add(i); CONCEPT_TOPICS[i].add(n.id); } });
        return hit;
      });
      CONC[n.id] = all;
    });
    // concept neighbours: topic -> Map(other -> shared concept indices)
    const SHARED = {};
    ORDER.forEach(n => (SHARED[n.id] = new Map()));
    CONCEPT_TOPICS.forEach((set, ci) => {
      const ids = [...set];
      for (let a = 0; a < ids.length; a++) for (let b = a + 1; b < ids.length; b++) {
        const x = ids[a], y = ids[b];
        if (!SHARED[x].has(y)) SHARED[x].set(y, []);
        if (!SHARED[y].has(x)) SHARED[y].set(x, []);
        SHARED[x].get(y).push(ci); SHARED[y].get(x).push(ci);
      }
    });

    // static weight components, each 0..1
    const maxDesc = Math.max(...ORDER.map(n => DESC[n.id].size));
    const maxConc = Math.max(...ORDER.map(n => CONC[n.id].size));
    const maxChain = Math.max(...ORDER.map(n => CHAIN_H[n.id]));
    ORDER.forEach(n => {
      const realms = new Set();
      DESC[n.id].forEach(d => realms.add(BY[d].realm));
      SHARED[n.id].forEach((_, o) => realms.add(BY[o].realm));
      realms.delete(n.realm);
      n.m = {
        impact: n.impact / 5,
        foundation: Math.sqrt(DESC[n.id].size / maxDesc),
        bridge: realms.size / (REALMS.length - 1),
        concepts: CONC[n.id].size / maxConc,
        difficulty: CHAIN_H[n.id] / maxChain
      };
    });

    // themes and hand-written bridges: TLINK[a] = Map(b -> {themes:[idx], bridge:text|null})
    THEMES = THEMES || []; BRIDGES = BRIDGES || [];
    const THEME_OF = {}, TLINK = {};
    ORDER.forEach(n => { THEME_OF[n.id] = []; TLINK[n.id] = new Map(); });
    const tl = (a, b) => { if (!TLINK[a].has(b)) TLINK[a].set(b, { themes: [], bridge: null }); return TLINK[a].get(b); };
    THEMES.forEach((th, ti) => {
      const ids = Object.keys(th.roles).filter(id => BY[id]);
      ids.forEach(id => THEME_OF[id].push(ti));
      for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) { tl(ids[i], ids[j]).themes.push(ti); tl(ids[j], ids[i]).themes.push(ti); }
    });
    BRIDGES.forEach(([a, b, why]) => { if (BY[a] && BY[b]) { tl(a, b).bridge = why; tl(b, a).bridge = why; } });

    // weighted similarity graph for clustering
    const W2 = {};
    ORDER.forEach(n => (W2[n.id] = new Map()));
    const addW = (a, b, w) => { if (a === b) return; W2[a].set(b, (W2[a].get(b) || 0) + w); W2[b].set(a, (W2[b].get(a) || 0) + w); };
    ORDER.forEach(n => n.deps.forEach(d => addW(n.id, d, 1.0)));
    ORDER.forEach(n => SHARED[n.id].forEach((cs, o) => { if (n.id < o) addW(n.id, o, 0.3 * cs.length); }));
    ORDER.forEach(n => TLINK[n.id].forEach((l, o) => { if (n.id < o) addW(n.id, o, 0.45 * l.themes.length + (l.bridge ? 1.0 : 0)); }));
    const CLUSTER = louvain(ORDER.map(n => n.id), W2, G_GAMMA);
    const groups = {};
    ORDER.forEach(n => { (groups[CLUSTER[n.id]] = groups[CLUSTER[n.id]] || []).push(n.id); });
    const CLUSTERS = Object.values(groups).sort((a, b) => BY[a[0]].pos - BY[b[0]].pos).map((ids, i) => {
      ids.forEach(id => (CLUSTER[id] = i));
      const ph = {}; ids.forEach(id => (ph[BY[id].phaseName] = (ph[BY[id].phaseName] || 0) + 1));
      const top = Object.entries(ph).sort((a, b) => b[1] - a[1]);
      const LBL = { OR: "Tooling", PR: "Programming", DM: "Discrete math", HW: "Hardware", AR: "Architecture", DS: "Algorithms", MA: "Math", TC: "Theory", SY: "Systems", SV: "Servers", EM: "Embedded", SE: "Software eng.", DE: "Data eng.", SC: "Security", SP: "Signals", ML: "ML", DL: "Deep learning", CV: "Vision", NL: "NLP", AI: "Frontier AI", XF: "Further fields" };
      const pc = {}; ids.forEach(id => (pc[BY[id].code] = (pc[BY[id].code] || 0) + 1));
      const tp = Object.entries(pc).sort((a, b) => b[1] - a[1] || BY[ids.find(x => BY[x].code === a[0])].pos - BY[ids.find(x => BY[x].code === b[0])].pos);
      const name = tp.length > 1 && tp[1][1] >= 2 ? LBL[tp[0][0]] + " & " + LBL[tp[1][0]] : LBL[tp[0][0]];
      let hub = ids[0], hw = -1;
      ids.forEach(id => { let w = 0; W2[id].forEach((v, o) => { if (ids.includes(o)) w += v; }); if (w > hw) { hw = w; hub = id; } });
      const tc = {}; ids.forEach(id => THEME_OF[id].forEach(t => (tc[t] = (tc[t] || 0) + 1)));
      const theme = Object.entries(tc).sort((a, b) => b[1] - a[1])[0];
      return { i, ids, name, hub, theme: theme ? THEMES[theme[0]].name : null };
    });
    // inter-cluster weights
    const CL_LINK = {};
    ORDER.forEach(n => W2[n.id].forEach((w, o) => { const a = CLUSTER[n.id], b = CLUSTER[o]; if (a < b) { const k = a + "-" + b; CL_LINK[k] = (CL_LINK[k] || 0) + w; } }));

    const G = { ORDER, BY, THEMES, BRIDGES, THEME_OF, TLINK, W2, CLUSTER, CLUSTERS, CL_LINK, ANC, DESC, CHAIN_H, CHAIN_VIA, SUB_CONCEPTS, CONC, CONCEPT_TOPICS, SHARED, REALMS, CONCEPTS, CURRICULUM,
      FORMULAS: FORMULAS || null, TOTAL_H: ORDER.reduce((a, n) => a + n.h, 0), TOTAL_SUBS: ORDER.reduce((a, n) => a + n.s.length, 0) };
    return G;
  }


  // Louvain community detection (two levels), deterministic order. gamma > 1 gives more, smaller groups.
  function louvain(ids, W, gamma) {
    function level(nodes, adj) {
      const comm = {}, k = {}, tot = {};
      let m2 = 0;
      nodes.forEach(n => { comm[n] = n; k[n] = 0; adj[n].forEach(w => (k[n] += w)); m2 += k[n]; tot[n] = k[n]; });
      if (!m2) return comm;
      for (let it = 0, moved = true; moved && it < 30; it++) {
        moved = false;
        for (const n of nodes) {
          const c0 = comm[n]; tot[c0] -= k[n];
          const wTo = {};
          adj[n].forEach((w, nb) => { if (nb !== n) wTo[comm[nb]] = (wTo[comm[nb]] || 0) + w; });
          let best = c0, bg = (wTo[c0] || 0) - gamma * tot[c0] * k[n] / m2;
          for (const c in wTo) { const g = wTo[c] - gamma * tot[c] * k[n] / m2; if (g > bg + 1e-9) { bg = g; best = c; } }
          comm[n] = best; tot[best] += k[n]; if (best !== c0) moved = true;
        }
      }
      return comm;
    }
    const c1 = level(ids, W);
    const sup = {}, sids = [...new Set(ids.map(i => c1[i]))];
    sids.forEach(c => (sup[c] = new Map()));
    ids.forEach(a => W[a].forEach((w, b) => { const ca = c1[a], cb = c1[b]; if (ca !== cb) sup[ca].set(cb, (sup[ca].get(cb) || 0) + w); }));
    const c2 = level(sids, sup);
    const out = {}; ids.forEach(i => (out[i] = c2[c1[i]]));
    // fold tiny groups (< 3) into their most connected neighbour group
    const size = {}; ids.forEach(i => (size[out[i]] = (size[out[i]] || 0) + 1));
    ids.forEach(i => { if (size[out[i]] < 3) { let best = null, bw = 0; W[i].forEach((w, o) => { if (out[o] !== out[i] && size[out[o]] >= 3 && w > bw) { bw = w; best = out[o]; } }); if (best != null) { size[out[i]]--; out[i] = best; size[best]++; } } });
    return out;
  }

  // ---------------- value ----------------
  function value(G, id, W) {
    W = W || DEFAULT_W;
    const m = G.BY[id].m, sum = W.impact + W.foundation + W.bridge + W.concepts || 1;
    return 100 * (W.impact * m.impact + W.foundation * m.foundation + W.bridge * m.bridge + W.concepts * m.concepts) / sum;
  }
  function valueTable(G, W) {
    const V = {};
    G.ORDER.forEach(n => (V[n.id] = value(G, n.id, W)));
    return V;
  }
  const roi = (G, V, id) => V[id] / G.BY[id].h;

  // ---------------- state helpers ----------------
  function emptyState(G) {
    return { v: 2, done: {}, proj: {}, current: G.ORDER[0].id, notes: {}, touched: {}, completedAt: {}, log: [],
      goals: [], start: { mode: "progress", topic: null }, plan: null, combo: [], wikiSeen: 0, ladder: {},
      prefs: { hpw: 10, slack: 25, W: { ...DEFAULT_W }, R: { ...DEFAULT_R } }, updatedAt: 0 };
  }
  function sanitize(G, s) {
    const out = emptyState(G);
    if (!s || typeof s !== "object") return out;
    const ok = id => !!G.BY[id];
    if (s.done && typeof s.done === "object") for (const [k, v] of Object.entries(s.done)) {
      if (ok(k) && Array.isArray(v)) { const a = [...new Set(v.filter(i => Number.isInteger(i) && i >= 0 && i < G.BY[k].s.length))].sort((a, b) => a - b); if (a.length) out.done[k] = a; }
    }
    if (s.proj && typeof s.proj === "object") for (const [k, v] of Object.entries(s.proj)) if (ok(k) && v) out.proj[k] = Number(v) || Date.now();
    if (ok(s.current)) out.current = s.current;
    if (s.notes && typeof s.notes === "object") for (const [k, v] of Object.entries(s.notes)) {
      if (ok(k) && v && typeof v.text === "string" && v.text.trim()) out.notes[k] = { text: v.text.slice(0, 5000), at: Number(v.at) || 0 };
    }
    for (const key of ["touched", "completedAt"]) if (s[key] && typeof s[key] === "object") for (const [k, v] of Object.entries(s[key])) if (ok(k) && Number.isFinite(v)) out[key][k] = v;
    if (Array.isArray(s.log)) out.log = s.log.filter(e => Array.isArray(e) && Number.isFinite(e[0]) && ok(e[1])).slice(-5000);
    if (Array.isArray(s.combo)) out.combo = s.combo.filter(e => Array.isArray(e) && e.length >= 6 && Number.isFinite(e[0]) && Number.isFinite(e[5])).map(e => [e[0], String(e[1]).slice(0, 12), String(e[2]).slice(0, 12), String(e[3]).slice(0, 10), Number(e[4]) || 0, Math.max(0, Math.min(200, e[5])), String(e[6] || "").slice(0, 600)]).slice(-3000);
    if (s.ladder && typeof s.ladder === "object") for (const [k, v] of Object.entries(s.ladder)) if (ok(k) && v && typeof v === "object") { const o = {}; if (Number.isFinite(v.s)) o.s = v.s; if (Number.isFinite(v.x)) o.x = v.x; if (o.s || o.x) out.ladder[k] = o; }
    if (Number.isFinite(s.wikiSeen)) out.wikiSeen = Math.max(0, Math.min(1e7, s.wikiSeen));
    if (Array.isArray(s.goals)) out.goals = [...new Set(s.goals.filter(ok))].slice(0, 8);
    if (s.start && typeof s.start === "object") {
      out.start.mode = ["progress", "scratch", "topic"].includes(s.start.mode) ? s.start.mode : "progress";
      out.start.topic = ok(s.start.topic) ? s.start.topic : null;
    }
    if (s.plan && Array.isArray(s.plan.ids)) out.plan = { ids: s.plan.ids.filter(ok), goals: (s.plan.goals || []).filter(ok), mode: String(s.plan.mode || "best"), at: Number(s.plan.at) || 0 };
    if (s.prefs && typeof s.prefs === "object") {
      const p = s.prefs;
      if (Number.isFinite(p.hpw) && p.hpw > 0 && p.hpw <= 100) out.prefs.hpw = p.hpw;
      if (Number.isFinite(p.slack) && p.slack >= 0 && p.slack <= 200) out.prefs.slack = p.slack;
      for (const k of Object.keys(DEFAULT_W)) if (p.W && Number.isFinite(p.W[k]) && p.W[k] >= 0 && p.W[k] <= 1) out.prefs.W[k] = p.W[k];
      for (const k of Object.keys(DEFAULT_R)) if (p.R && Number.isFinite(p.R[k]) && p.R[k] >= 0 && p.R[k] <= 1) out.prefs.R[k] = p.R[k];
    }
    out.updatedAt = Number(s.updatedAt) || 0;
    return out;
  }
  const cnt = (S, id) => (S.done[id] || []).length;
  const frac = (G, S, id) => cnt(S, id) / G.BY[id].s.length;
  const isDone = (G, S, id) => cnt(S, id) === G.BY[id].s.length;
  function doneSet(G, S) { const s = new Set(); G.ORDER.forEach(n => { if (isDone(G, S, n.id)) s.add(n.id); }); return s; }

  // What counts as "already known" for planning, given a start setting.
  function knownSet(G, S, start) {
    start = start || S.start;
    const k = start.mode === "scratch" ? new Set() : doneSet(G, S);
    if (start.mode === "topic" && start.topic && G.BY[start.topic]) {
      // Starting AT a topic means its prerequisites are known; the topic itself is where you begin.
      G.ANC[start.topic].forEach(x => k.add(x));
    }
    return k;
  }

  // ---------------- goal relevance ----------------
  function relevance(G, goals) {
    const req = new Set(), gc = new Set(), cc = new Set(), beyond = new Set();
    goals.forEach(g => { req.add(g); G.ANC[g].forEach(x => req.add(x)); G.CONC[g].forEach(c => gc.add(c)); G.DESC[g].forEach(x => beyond.add(x)); });
    req.forEach(x => G.CONC[x].forEach(c => cc.add(c)));
    const R = {};
    G.ORDER.forEach(n => {
      if (!goals.length) { R[n.id] = 0; return; }
      if (req.has(n.id)) { R[n.id] = 1; return; }
      const ct = G.CONC[n.id];
      if (!ct.size) { R[n.id] = 0; return; }
      let inter = 0, interC = 0;
      ct.forEach(c => { if (gc.has(c)) inter++; if (cc.has(c)) interC++; });
      const J = inter / (ct.size + gc.size - inter || 1);
      const K = interC / ct.size;
      let r = 0.55 * Math.min(1, 3 * J) + 0.45 * K;
      if (beyond.has(n.id)) r *= 0.5;
      R[n.id] = Math.min(0.95, r);
    });
    return { R, req, gc, beyond };
  }
  function sharedWith(G, id, goals) {
    const gc = new Set(); goals.forEach(g => G.CONC[g].forEach(c => gc.add(c)));
    return [...G.CONC[id]].filter(c => gc.has(c)).map(c => G.CONCEPTS[c][0]);
  }

  // ---------------- routes ----------------
  // Kahn topological order restricted to `ids`, picking the lowest priority value among ready topics.
  function topo(G, ids, pri) {
    const set = new Set(ids), indeg = {}, out = [];
    ids.forEach(id => (indeg[id] = G.BY[id].deps.filter(d => set.has(d)).length));
    const ready = ids.filter(id => indeg[id] === 0);
    while (ready.length) {
      ready.sort((a, b) => pri(a) - pri(b));
      const id = ready.shift(); out.push(id);
      G.BY[id].dependents.forEach(d => { if (set.has(d) && --indeg[d] === 0) ready.push(d); });
    }
    return out;
  }

  function requiredFor(G, goals, known) {
    const req = new Set();
    goals.forEach(g => { if (!known.has(g)) req.add(g); G.ANC[g].forEach(x => { if (!known.has(x)) req.add(x); }); });
    return req;
  }

  function plan(G, opts) {
    const { goals, known, V } = opts;
    const slack = opts.slack != null ? opts.slack : 0;      // percent of required hours allowed for extras
    const order = opts.order || "value";                    // value | curriculum | quick
    const rel = opts.rel || relevance(G, goals);
    const req = requiredFor(G, goals, known);
    const reqH = [...req].reduce((a, id) => a + G.BY[id].h, 0);

    // enrichment: greedy best gain-per-hour bundles within the slack budget
    const chosen = new Set(), extras = [];
    let budget = reqH * slack / 100, spent = 0;
    if (slack > 0) {
      for (let iter = 0; iter < 40; iter++) {
        let best = null;
        G.ORDER.forEach(n => {
          const id = n.id;
          if (known.has(id) || req.has(id) || chosen.has(id) || rel.beyond.has(id) || rel.R[id] < 0.3) return;
          const bundle = [id];
          G.ANC[id].forEach(x => { if (!known.has(x) && !req.has(x) && !chosen.has(x)) bundle.push(x); });
          const cost = bundle.reduce((a, x) => a + G.BY[x].h, 0);
          if (spent + cost > budget) return;
          const gain = bundle.reduce((a, x) => a + rel.R[x] * V[x], 0);
          const ratio = gain / cost;
          if (!best || ratio > best.ratio) best = { id, bundle, cost, gain, ratio };
        });
        if (!best || best.ratio < (opts.minRatio != null ? opts.minRatio : slack >= 50 ? 0.6 : 1.2)) break;
        best.bundle.forEach(x => chosen.add(x));
        spent += best.cost;
        extras.push({ id: best.id, bundle: best.bundle, cost: best.cost, gain: best.gain, shared: sharedWith(G, best.id, goals) });
      }
    }
    const all = [...req, ...chosen];
    const unlockIn = id => G.BY[id].dependents.filter(d => req.has(d) || chosen.has(d)).length;
    const pri = order === "curriculum" ? (id => G.BY[id].pos)
      : order === "quick" ? (id => G.BY[id].h * 1000 + G.BY[id].pos)
      : (id => -((rel.R[id] || 0.2) * V[id] / Math.sqrt(G.BY[id].h) + 3 * unlockIn(id)));
    const seq = topo(G, all, pri);

    let cumH = 0, cumV = 0;
    const steps = seq.map(id => {
      cumH += G.BY[id].h; cumV += (rel.R[id] || 0) * V[id];
      return { id, h: G.BY[id].h, extra: chosen.has(id), cumH, cumV, rel: rel.R[id] || 0, v: V[id] };
    });
    // goal concept coverage
    const covered = new Set();
    [...known, ...all].forEach(id => G.CONC[id].forEach(c => { if (rel.gc.has(c)) covered.add(c); }));
    const hours = cumH, val = cumV;
    return { steps, req, extras, hours, value: val, density: hours ? val / hours : 0, reqHours: reqH,
      extraHours: spent, coverage: rel.gc.size ? covered.size / rel.gc.size : 1 };
  }

  // Bottleneck: the heaviest chain of not-yet-known prerequisites leading to the goals.
  function criticalPath(G, goals, known) {
    const req = requiredFor(G, goals, known), H = {}, VIA = {};
    topo(G, [...req], id => G.BY[id].pos).forEach(id => {
      let best = 0, via = null;
      G.BY[id].deps.forEach(d => { if (req.has(d) && H[d] > best) { best = H[d]; via = d; } });
      H[id] = best + G.BY[id].h; VIA[id] = via;
    });
    let end = null;
    goals.forEach(g => { if (req.has(g) && (!end || H[g] > H[end])) end = g; });
    const chain = [];
    for (let x = end; x; x = VIA[x]) chain.unshift(x);
    return { chain, hours: end ? H[end] : 0 };
  }

  // Shortest directed prerequisite chain from start to goal (fewest hours), if start leads to goal.
  function directedPath(G, from, to) {
    if (!G.DESC[from].has(to)) return null;
    const dist = { [from]: 0 }, prev = {};
    G.ORDER.slice(G.BY[from].pos).forEach(n => {
      if (dist[n.id] == null) return;
      n.dependents.forEach(d => {
        if (d !== to && !G.ANC[to].has(d)) return;
        const nd = dist[n.id] + G.BY[d].h;
        if (dist[d] == null || nd < dist[d]) { dist[d] = nd; prev[d] = n.id; }
      });
    });
    const path = [];
    for (let x = to; x; x = prev[x]) { path.unshift(x); if (x === from) break; }
    return { path, hours: dist[to] + G.BY[from].h };
  }

  // Fewest-hop path through any thread (prerequisite or shared concept), ties broken by hours.
  function webPath(G, from, to, minShared) {
    minShared = minShared || 2;
    const nb = id => {
      const s = new Set([...G.BY[id].deps, ...G.BY[id].dependents]);
      G.SHARED[id].forEach((cs, o) => { if (cs.length >= minShared) s.add(o); });
      if (G.TLINK) G.TLINK[id].forEach((l, o) => { if (l.bridge || l.themes.length >= 1) s.add(o); });
      return s;
    };
    const best = { [from]: [0, 0] }, prev = {};
    const q = [from];
    while (q.length) {
      const x = q.shift();
      if (x === to) break;
      nb(x).forEach(y => {
        const cand = [best[x][0] + 1, best[x][1] + G.BY[y].h];
        if (!best[y]) { best[y] = cand; prev[y] = x; q.push(y); }
        else if (best[y][0] === cand[0] && cand[1] < best[y][1]) { best[y] = cand; prev[y] = x; }
      });
    }
    if (!best[to]) return null;
    const path = [];
    for (let x = to; x; x = prev[x]) { path.unshift(x); if (x === from) break; }
    const links = [];
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1], b = path[i];
      if (G.BY[b].deps.includes(a)) links.push({ kind: "unlocks" });
      else if (G.BY[a].deps.includes(b)) links.push({ kind: "requires" });
      else if (G.TLINK && G.TLINK[a].get(b) && !(G.SHARED[a].get(b) || []).length) { const l = G.TLINK[a].get(b); links.push({ kind: "theme", shared: l.themes.map(t => G.THEMES[t].name), bridge: l.bridge }); }
      else links.push({ kind: "concept", shared: (G.SHARED[a].get(b) || []).map(c => G.CONCEPTS[c][0]) });
    }
    return { path, links, hops: path.length - 1 };
  }

  // Branches that open once `known` is complete, ranked by decayed downstream value per entry hour.
  function branches(G, known, V, exclude) {
    exclude = exclude || new Set();
    const out = [];
    G.ORDER.forEach(n => {
      if (known.has(n.id) || exclude.has(n.id)) return;
      if (!n.deps.every(d => known.has(d))) return;
      // BFS through dependents for decayed potential
      let pot = V[n.id], seen = new Set([n.id]), frontier = [n.id], depth = 0;
      while (frontier.length && depth < 6) {
        depth++;
        const next = [];
        frontier.forEach(x => G.BY[x].dependents.forEach(d => {
          if (seen.has(d) || known.has(d)) return; seen.add(d); next.push(d);
          pot += V[d] * Math.pow(0.5, depth);
        }));
        frontier = next;
      }
      out.push({ id: n.id, potential: pot, perHour: pot / n.h, unlocks: G.DESC[n.id].size, h: n.h });
    });
    return out.sort((a, b) => b.perHour - a.perHour);
  }

  // Goals within reach after a route: high value for little extra.
  function nearbyGoals(G, known, V, exclude, limitHours, route) {
    const out = [];
    G.ORDER.forEach(n => {
      if (known.has(n.id) || exclude.has(n.id)) return;
      if (route && !n.deps.some(d => route.has(d))) return;   // must extend the route, not sit beside it
      let extra = n.h, missing = [n.id];
      G.ANC[n.id].forEach(x => { if (!known.has(x)) { extra += G.BY[x].h; missing.push(x); } });
      let full = n.h; G.ANC[n.id].forEach(x => (full += G.BY[x].h));
      const reuse = (full - extra) / full;                      // share of its groundwork the route already pays for
      if (extra <= limitHours) out.push({ id: n.id, extra, missing, reuse, worth: V[n.id] * reuse * reuse / Math.sqrt(extra) });
    });
    return out.sort((a, b) => b.worth - a.worth);
  }

  // ---------------- recommendations ----------------
  function lastActivity(S) { return S.log.length ? S.log[S.log.length - 1][0] : 0; }

  function recommend(G, S, opts) {
    opts = opts || {};
    const V = opts.V || valueTable(G, S.prefs.W);
    const Rw = S.prefs.R;
    const goals = opts.goals || S.goals;
    const rel = relevance(G, goals);
    const done = opts.done || doneSet(G, S);
    const now = opts.now || Date.now();
    const fr = id => opts.sim ? (done.has(id) ? 1 : 0) : frac(G, S, id);
    const inProg = G.ORDER.filter(n => !done.has(n.id) && fr(n.id) > 0).map(n => n.id);
    const overall = opts.sim ? 0.5 : G.ORDER.reduce((a, n) => a + cnt(S, n.id), 0) / G.TOTAL_SUBS;
    const recentDone = Object.entries(S.completedAt).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
    const lastRealm = recentDone.length === 3 && recentDone.every(id => G.BY[id].realm === G.BY[recentDone[0]].realm) ? G.BY[recentDone[0]].realm : null;
    const idle = (now - (lastActivity(S) || now)) / DAY;
    const lastTouched = Object.entries(S.touched).sort((a, b) => b[1] - a[1])[0];
    const lastT = lastTouched ? G.BY[lastTouched[0]] : null;
    const seenConc = new Set(); done.forEach(id => G.CONC[id].forEach(c => seenConc.add(c)));
    const planNext = S.plan && !opts.sim ? S.plan.ids.find(id => !done.has(id)) : null;

    const newlyReady = id => G.BY[id].dependents.filter(d => !done.has(d) && G.BY[d].deps.every(x => x === id || done.has(x))).length;
    const maxNR = Math.max(1, ...G.ORDER.map(n => newlyReady(n.id)));
    const items = [], blocked = [];
    G.ORDER.forEach(n => {
      const id = n.id;
      if (done.has(id)) return;
      const missing = n.deps.filter(d => !done.has(d));
      if (missing.length) { if (goals.length && rel.req.has(id)) blocked.push({ id, missing }); return; }   // R1 readiness gate
      const f = fr(id);
      const ct = G.CONC[id];
      let seen = 0; ct.forEach(c => { if (seenConc.has(c)) seen++; });
      const parts = {
        value: Rw.value * V[id] / 100,
        goal: Rw.goal * (rel.R[id] || 0),
        unlock: Rw.unlock * newlyReady(id) / maxNR,
        progress: Rw.progress * f,
        reinforce: Rw.reinforce * (ct.size ? seen / ct.size : 0),
        momentum: Rw.momentum * (lastT ? (lastT.phase === n.phase ? 1 : lastT.realm === n.realm ? 0.5 : 0) : 0),
        cost: -Rw.cost * Math.min(1, n.h / 60)
      };
      let score = Object.values(parts).reduce((a, b) => a + b, 0);
      const rules = [];
      if (f >= 0.5) { score += 0.25; rules.push(["R2", "Finish what you started (+0.25)"]); }
      if (inProg.length >= 3 && f === 0) { score -= 0.3; rules.push(["R3", "3 topics already open: focus (−0.30)"]); }
      if (goals.length && !rel.req.has(id)) {
        if (rel.R[id] < 0.5) { score *= 0.5; rules.push(["R4", "Off your goal route (×0.5)"]); }
        else rules.push(["R4", "Off-route but strongly related to the goal"]);
      }
      if (lastRealm != null && n.realm !== lastRealm) { score += 0.08; rules.push(["R5", "Interleave: switch realm after 3 in a row (+0.08)"]); }
      if (overall < 0.15 && n.realm === 0) { score += 0.10; rules.push(["R8", "Foundations first while under 15% (+0.10)"]); }
      if (idle >= 3 && n.h <= 15) { score += 0.08; rules.push(["R9", "Quick win to restart momentum (+0.08)"]); }
      if (planNext === id) { score += 0.20; rules.push(["R11", "Next on the route you're following (+0.20)"]); }
      if (rel.req.has(id) && goals.length) rules.push(["R7", "Required for your goal"]);
      items.push({ id, score, parts, rules, f });
    });
    items.sort((a, b) => b.score - a.score || G.BY[a.id].pos - G.BY[b.id].pos);

    // alerts
    const alerts = [];
    if (!opts.sim) {
      inProg.forEach(id => {
        const t = S.touched[id] || 0;
        if (t && (now - t) / DAY > 14) alerts.push({ kind: "stale", id, text: "Paused " + Math.floor((now - t) / DAY) + " days: resume or reset it (R6)." });
      });
      const top = items[0];
      if (top) G.BY[top.id].deps.forEach(d => {
        const at = S.completedAt[d];
        if (at && (now - at) / DAY > 30) alerts.push({ kind: "review", id: d, text: "Finished " + Math.floor((now - at) / DAY) + " days ago and needed next: spend an hour reviewing it (R10)." });
      });
    }
    return { items, blocked, alerts, inProg, rel };
  }

  // Predict the next n topics by repeatedly taking the top recommendation in a simulated future.
  function predict(G, S, n, opts) {
    opts = opts || {};
    const V = opts.V || valueTable(G, S.prefs.W);
    const done = doneSet(G, S);
    const out = [];
    let hours = 0;
    for (let i = 0; i < n; i++) {
      const rec = recommend(G, S, { V, done, sim: i > 0, goals: opts.goals });
      const top = rec.items[0];
      if (!top) break;
      const left = G.BY[top.id].h * (1 - (i === 0 ? frac(G, S, top.id) : 0));
      hours += left;
      out.push({ id: top.id, score: top.score, hoursLeft: left, cumH: hours, rules: top.rules });
      done.add(top.id);
    }
    return out;
  }


  // ---------------- connections (combo rolls) ----------------
  // A and B are {id, sub} where sub is a subtopic index or null. Returns score 0–100, label and evidence.
  function connect(G, A, B, wiki) {
    const a = G.BY[A.id], b = G.BY[B.id], ev = [];
    let score = 0;
    const name = X => X.sub != null ? "“" + G.BY[X.id].s[X.sub] + "”" : G.BY[X.id].t;
    const add = (pts, sign, kind, text, extra) => { score += pts; ev.push({ sign, kind, text, pts, ...(extra || {}) }); };
    if (A.id === B.id) {
      add(55, "+", "same", "Both live inside " + a.id + " " + a.t + ": the same topic teaches them side by side, so one is context for the other.");
    } else if (b.deps.includes(a.id) || a.deps.includes(b.id)) {
      const [x, y] = b.deps.includes(a.id) ? [a, b] : [b, a];
      add(45, "+", "prereq", x.id + " is a direct prerequisite of " + y.id + ". You can't really do " + y.t + " without " + x.t + ": the curriculum puts one straight after the other.");
    } else if (G.ANC[b.id].has(a.id) || G.ANC[a.id].has(b.id)) {
      const [x, y] = G.ANC[b.id].has(a.id) ? [a, b] : [b, a];
      const dp = directedPath(G, x.id, y.id);
      const steps = dp ? dp.path.length - 1 : 3;
      add(Math.max(16, 32 - 2.5 * steps), "+", "chain", x.id + " is an ancestor of " + y.id + ", " + steps + " steps down the prerequisite chain" + (dp ? " (" + dp.path.join(" → ") + ")" : "") + ". The ideas in " + x.t + " get reused, transformed, inside " + y.t + ".");
    } else {
      add(0, "−", "noprereq", "Neither is a prerequisite of the other: you can learn them in either order.");
    }
    // shared concepts at topic level and at subtopic level
    const ca = A.sub != null ? new Set(G.SUB_CONCEPTS[A.id][A.sub]) : G.CONC[A.id];
    const cb = B.sub != null ? new Set(G.SUB_CONCEPTS[B.id][B.sub]) : G.CONC[B.id];
    const sharedSub = [...ca].filter(c => cb.has(c)).map(c => G.CONCEPTS[c][0]);
    const sharedTop = A.id === B.id ? [] : (G.SHARED[A.id].get(B.id) || []).map(c => G.CONCEPTS[c][0]);
    if (sharedSub.length) add(Math.min(30, 16 * sharedSub.length), "+", "concept", name(A) + " and " + name(B) + " both teach " + list(sharedSub) + ". That's the same idea seen from two angles.");
    if (sharedTop.length && A.id !== B.id) {
      const extra = sharedTop.filter(x => !sharedSub.includes(x));
      if (extra.length) add(Math.min(22, 7 * extra.length), "+", "concept", "Their parent topics share " + extra.length + " more concept" + (extra.length > 1 ? "s" : "") + ": " + list(extra.slice(0, 5)) + ".");
    }
    if (!sharedSub.length && !sharedTop.length && A.id !== B.id) add(0, "−", "noconcept", "They share no tracked concepts, so any link is indirect.");
    // where they meet and where they come from
    if (A.id !== B.id) {
      const meet = [...G.DESC[A.id]].filter(x => G.DESC[B.id].has(x) || x === B.id).sort((x, y) => G.BY[x].pos - G.BY[y].pos);
      const meet2 = [...G.DESC[B.id]].filter(x => x === A.id);
      const m = meet.find(x => x !== B.id) || null;
      if (m && !meet2.length && !G.ANC[A.id].has(B.id) && !G.ANC[B.id].has(A.id)) add(6, "+", "meet", "They meet in " + m + " " + G.BY[m].t + ", which builds on both: that's where the two ideas get combined.");
      const roots = [...G.ANC[A.id]].filter(x => G.ANC[B.id].has(x)).sort((x, y) => G.BY[y].pos - G.BY[x].pos);
      if (roots.length && !G.ANC[A.id].has(B.id) && !G.ANC[B.id].has(A.id)) add(4, "+", "root", "Both grow from " + roots[0] + " " + G.BY[roots[0]].t + " (" + roots.length + " common ancestor" + (roots.length > 1 ? "s" : "") + " in total).");
      const wp = webPath(G, A.id, B.id, 2);
      if (wp) {
        if (wp.hops <= 1) add(14, "+", "near", "They're directly linked in the web: one hop apart.");
        else if (wp.hops === 2) add(9, "+", "near", "Two hops apart in the web, via " + wp.path[1] + " " + G.BY[wp.path[1]].t + ".");
        else add(wp.hops >= 4 ? 0 : 3, wp.hops >= 4 ? "−" : "+", "far", wp.hops + " hops apart in the web: " + wp.path.join(" → ") + ". " + (wp.hops >= 4 ? "That's a long way: they rarely meet in practice." : "A moderate distance."));
      }
      if (a.realm === b.realm) add(a.phase === b.phase ? 7 : 4, "+", "realm", a.phase === b.phase ? "Same phase (" + a.phaseName + ")." : "Same realm (" + G.REALMS[a.realm].name + "), different phases.");
      else add(0, "−", "realm", "Different realms: " + G.REALMS[a.realm].name + " vs " + G.REALMS[b.realm].name + ".");
    }
    if (G.TLINK && A.id !== B.id) {
      const l = G.TLINK[A.id].get(B.id);
      if (l && l.bridge) add(32, "+", "bridge", l.bridge);
      if (l && l.themes.length) l.themes.slice(0, 3).forEach((ti, k) => {
        const th = G.THEMES[ti];
        add(k === 0 ? 20 : 10, "+", "theme", "Same big idea, " + th.name + ": in " + a.id + ", " + lc(th.roles[a.id]) + " In " + b.id + ", " + lc(th.roles[b.id]), { theme: ti });
      });
    }
    if (G.FORMULAS && A.id !== B.id) {
      const fs = G.FORMULAS.filter(f => (f.t.includes(A.id) || f.c.some(c => ca.has(c))) && (f.t.includes(B.id) || f.c.some(c => cb.has(c))) && (f.t.includes(A.id) || f.t.includes(B.id)));
      if (fs.length) add(Math.min(26, 13 * fs.length), "+", "formula", "Shared math: " + list(fs.slice(0, 3).map(f => f.n)) + (fs.length > 3 ? " and " + (fs.length - 3) + " more" : "") + (fs.length === 1 ? " appears" : " appear") + " in both. " + fs[0].m);
    }
    if (wiki) {
      if (wiki.direct) add(15, "+", "wiki", "On Wikipedia, “" + wiki.direct[0] + "” links straight to “" + wiki.direct[1] + "”.");
      if (wiki.shared && wiki.shared.length) add(Math.min(18, 2 + wiki.shared.length), "+", "wiki", "Their Wikipedia articles both link to " + wiki.shared.length + " of the same pages, like " + list(wiki.shared.slice(0, 5)) + ".");
      else if (wiki.checked) add(0, "−", "wiki", "Their Wikipedia articles share no links: the wider world doesn't connect them much either.");
    }
    score = Math.max(0, Math.min(100, Math.round(score)));
    const label = score >= 70 ? "Strong" : score >= 45 ? "Solid" : score >= 25 ? "Weak" : "Distant";
    return { score, label, ev, sharedSub, sharedTop };
  }
  function lc(t) { return t && /^[A-Z][a-z]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t || ""; }
  function list(arr) { return arr.length <= 1 ? (arr[0] || "") : arr.slice(0, -1).join(", ") + " and " + arr[arr.length - 1]; }

  // Multiple-choice "bridge" challenge: which topic sits on the shortest web path between A and B?
  function bridgeQuestion(G, aId, bId, rnd) {
    const wp = webPath(G, aId, bId, 2);
    if (!wp || wp.hops < 2) return null;
    const answer = wp.path[1 + Math.floor(rnd() * (wp.path.length - 2))];
    const onPath = new Set(wp.path);
    const pool = G.ORDER.filter(n => !onPath.has(n.id)).map(n => n.id);
    const opts = new Set([answer]);
    for (let i = 0; opts.size < 4 && i < 200; i++) opts.add(pool[Math.floor(rnd() * pool.length)]);
    for (let i = 0; opts.size < 4; i++) opts.add(pool[i]);
    return { answer, options: [...opts].sort(() => rnd() - 0.5), path: wp.path };
  }

  // ---------------- points ----------------
  function topicPoints(G, id) {
    const V = value(G, id, DEFAULT_W);
    return Math.round(G.BY[id].h * 10 * (0.6 + 0.8 * V / 100));
  }
  function points(G, S) {
    let total = 0, subs = 0, topics = 0, projects = 0, phases = 0;
    const byPhase = G.CURRICULUM.map(() => 0);
    G.ORDER.forEach(n => {
      const tp = topicPoints(G, n.id), c = cnt(S, n.id);
      let p = tp * c / n.s.length;
      if (c === n.s.length) { p += tp * 0.2; topics++; }
      if (S.proj[n.id]) { p += tp * 0.25; projects++; }
      const ld = (S.ladder || {})[n.id];
      if (ld && ld.s) { p += tp * 0.10; projects++; }
      if (ld && ld.x) { p += tp * 0.35; projects++; }
      total += p; subs += c; byPhase[n.phase] += p;
    });
    G.CURRICULUM.forEach((ph, pi) => {
      if (ph.topics.every(t => isDone(G, S, t.id))) {
        const bonus = ph.topics.reduce((a, t) => a + topicPoints(G, t.id), 0) * 0.1;
        total += bonus; byPhase[pi] += bonus; phases++;
      }
    });
    let combo = 0;
    (S.combo || []).forEach(e => (combo += e[5] || 0));
    total += combo + 2 * Math.min(S.wikiSeen || 0, 3000);
    total = Math.round(total);
    const level = Math.floor(Math.sqrt(total / 60));
    const floorPts = 60 * level * level, nextPts = 60 * (level + 1) * (level + 1);
    return { total, level, floorPts, nextPts, subs, topics, projects, phases, byPhase, combo, rolls: (S.combo || []).length };
  }
  const TITLES = ["Visitor", "Apprentice", "Tinkerer", "Builder", "Hacker", "Engineer", "Systems Thinker", "Architect", "Specialist", "Researcher", "Polymath", "Gatekeeper"];
  const levelTitle = l => TITLES[Math.min(TITLES.length - 1, Math.floor(l / 3))];

  function streak(S, now) {
    now = now || Date.now();
    const days = new Set(S.log.filter(e => e[2] > 0).map(e => Math.floor((e[0] - new Date(e[0]).getTimezoneOffset() * 6e4) / DAY)));
    const today = Math.floor((now - new Date(now).getTimezoneOffset() * 6e4) / DAY);
    let s = 0, d = days.has(today) ? today : today - 1;
    while (days.has(d)) { s++; d--; }
    return { current: s, activeDays: days.size, today: days.has(today) };
  }

  root.Engine = { build, value, valueTable, roi, emptyState, sanitize, cnt, frac, isDone, doneSet, knownSet, relevance, sharedWith,
    topo, requiredFor, plan, criticalPath, directedPath, webPath, branches, nearbyGoals, recommend, predict,
    topicPoints, points, levelTitle, streak, connect, bridgeQuestion, louvain, setGamma, DEFAULT_W, DEFAULT_R };
})(typeof window !== "undefined" ? window : globalThis);
