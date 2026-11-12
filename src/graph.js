// Gate to GPT · web of connections (canvas + d3-force). Layouts: groups (clustered), flow (by depth), islands (by realm).
(function (root) {
  "use strict";
  let ctx = null, canvas = null, box = null, c2d = null, nodes = [], byId = {}, pre = [], conc = [], thm = [], transform = null, zoom = null, tip = null;
  let hover = null, layoutMode = "groups", dpr = 1, W = 0, H = 0, ro = null, hulls = [], centers = [];

  const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#888";
  const dark = () => { const t = document.documentElement.dataset.theme; return t ? t === "dark" : root.matchMedia && root.matchMedia("(prefers-color-scheme: dark)").matches; };
  function groupColor(i, alpha) {
    const h = (i * 137.508 + 20) % 360, l = dark() ? 64 : 44 + (i % 2) * 6, s = 62 + (i % 3) * 8;
    return alpha == null ? `hsl(${h} ${s}% ${l}%)` : `hsl(${h} ${s}% ${l}% / ${alpha})`;
  }

  function mount(container, c, mode) {
    ctx = c; box = container; layoutMode = mode || "groups";
    box.replaceChildren();
    canvas = document.createElement("canvas");
    canvas.setAttribute("aria-label", "Network of topics. Use the Find box and the side panel to explore with the keyboard.");
    tip = document.createElement("div"); tip.className = "wtip"; tip.hidden = true;
    box.append(canvas, tip);
    c2d = canvas.getContext("2d");
    build(); layout(); size();
    zoom = d3.zoom().scaleExtent([0.12, 6]).on("zoom", ev => { transform = ev.transform; draw(); });
    d3.select(canvas).call(zoom).on("dblclick.zoom", null);
    fit(true);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", () => { hover = null; tip.hidden = true; draw(); });
    canvas.addEventListener("click", onClick);
    if (ro) ro.disconnect();
    ro = new ResizeObserver(() => { size(); draw(); });
    ro.observe(box);
    if (root.matchMedia) root.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", draw);
  }

  function build() {
    const G = ctx.G, depth = {};
    G.ORDER.forEach(n => (depth[n.id] = n.deps.length ? Math.max(...n.deps.map(d => depth[d])) + 1 : 0));
    nodes = G.ORDER.map(n => ({ id: n.id, n, realm: n.realm, cl: G.CLUSTER[n.id], depth: depth[n.id], r: 4 + Math.sqrt(G.DESC[n.id].size) * 0.9 }));
    byId = {}; nodes.forEach(x => (byId[x.id] = x));
    pre = []; G.ORDER.forEach(n => n.deps.forEach(d => pre.push({ source: byId[d], target: byId[n.id] })));
    conc = []; thm = [];
    G.ORDER.forEach(n => G.SHARED[n.id].forEach((cs, o) => { if (n.id < o) conc.push({ a: byId[n.id], b: byId[o], k: cs.length }); }));
    G.ORDER.forEach(n => G.TLINK[n.id].forEach((l, o) => { if (n.id < o) thm.push({ a: byId[n.id], b: byId[o], k: l.themes.length, bridge: !!l.bridge }); }));
  }

  // place groups on a ring so strongly linked groups sit next to each other (greedy chain)
  function groupOrder() {
    const G = ctx.G, n = G.CLUSTERS.length, w = (a, b) => G.CL_LINK[Math.min(a, b) + "-" + Math.max(a, b)] || 0;
    const used = new Set([0]), order = [0];
    while (order.length < n) {
      const last = order[order.length - 1];
      let best = -1, bw = -1;
      for (let i = 0; i < n; i++) if (!used.has(i) && w(last, i) > bw) { bw = w(last, i); best = i; }
      used.add(best); order.push(best);
    }
    return order;
  }

  function layout() {
    const G = ctx.G, R = G.REALMS.length;
    let cx = {}, cy = {};
    if (layoutMode === "groups") {
      const ord = groupOrder(), n = ord.length;
      ord.forEach((c, k) => { const a = k / n * 6.283 - 1.57, rad = 520 + (k % 2) * 150; cx[c] = Math.cos(a) * rad; cy[c] = Math.sin(a) * rad; });
      centers = ord.map(c => ({ c, x: cx[c], y: cy[c] }));
    }
    nodes.forEach((x, i) => {
      if (layoutMode === "flow") { x.x = x.depth * 95; x.y = x.realm * 140 + (i % 9) * 6; }
      else if (layoutMode === "groups") { x.x = cx[x.cl] + (i % 7) * 9 - 27; x.y = cy[x.cl] + (i % 5) * 9 - 18; }
      else { x.x = Math.cos(x.realm / R * 6.283) * 500 + (i % 7) * 4; x.y = Math.sin(x.realm / R * 6.283) * 500 + (i % 5) * 4; }
    });
    const sim = d3.forceSimulation(nodes).stop().force("collide", d3.forceCollide(d => d.r + (layoutMode === "flow" ? 6 : 7)));
    if (layoutMode === "groups") {
      const links = [];
      G.ORDER.forEach(n => G.W2[n.id].forEach((w, o) => { if (n.id < o) links.push({ source: byId[n.id], target: byId[o], w }); }));
      sim.force("link", d3.forceLink(links).distance(l => l.source.cl === l.target.cl ? 34 : 180).strength(l => Math.min(0.9, (l.source.cl === l.target.cl ? 0.12 : 0.012) * l.w)))
        .force("x", d3.forceX(d => cx[d.cl]).strength(0.16)).force("y", d3.forceY(d => cy[d.cl]).strength(0.16))
        .force("charge", d3.forceManyBody().strength(-34).distanceMax(260));
    } else if (layoutMode === "flow") {
      sim.force("link", d3.forceLink(pre.map(l => ({ source: l.source, target: l.target }))).distance(80).strength(0.05))
        .force("x", d3.forceX(d => d.depth * 95).strength(1)).force("y", d3.forceY(d => d.realm * 140).strength(0.12)).force("charge", d3.forceManyBody().strength(-25));
    } else {
      sim.force("link", d3.forceLink(pre.map(l => ({ source: l.source, target: l.target }))).distance(60).strength(0.25))
        .force("x", d3.forceX(d => Math.cos(d.realm / R * 6.283 - 1.57) * 520).strength(0.14))
        .force("y", d3.forceY(d => Math.sin(d.realm / R * 6.283 - 1.57) * 520).strength(0.14))
        .force("charge", d3.forceManyBody().strength(-60));
    }
    for (let i = 0; i < 360; i++) sim.tick();
    computeHulls();
  }
  function computeHulls() {
    hulls = [];
    if (layoutMode !== "groups") return;
    ctx.G.CLUSTERS.forEach(c => {
      const pts = [];
      c.ids.forEach(id => { const n = byId[id]; for (let a = 0; a < 6.283; a += 1.047) pts.push([n.x + Math.cos(a) * (n.r + 10), n.y + Math.sin(a) * (n.r + 10)]); });
      const h = d3.polygonHull(pts);
      const ns = c.ids.map(id => byId[id]);
      hulls.push({ c: c.i, hull: h, x: ns.reduce((a, n) => a + n.x, 0) / ns.length, top: Math.min(...ns.map(n => n.y - n.r)) - 16 });
    });
  }

  function size() { const r = box.getBoundingClientRect(); dpr = Math.min(2, root.devicePixelRatio || 1); W = r.width; H = r.height; canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
  function fit(instant) {
    if (!nodes.length) return;
    const xs = nodes.map(n => n.x), ys = nodes.map(n => n.y);
    const x0 = Math.min(...xs) - (layoutMode === "flow" ? 190 : 50), x1 = Math.max(...xs) + 50, y0 = Math.min(...ys) - 50, y1 = Math.max(...ys) + 30;
    const k = Math.min(W / (x1 - x0), H / (y1 - y0)) * 0.96;
    const t = d3.zoomIdentity.translate(W / 2, H / 2).scale(k).translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    const sel = d3.select(canvas);
    (instant ? sel : sel.transition().duration(450)).call(zoom.transform, t);
  }
  function focus(id) {
    const n = byId[id]; if (!n || !zoom) return;
    const k = Math.max(transform ? transform.k : 1, 1.2);
    d3.select(canvas).transition().duration(450).call(zoom.transform, d3.zoomIdentity.translate(W / 2, H / 2).scale(k).translate(-n.x, -n.y));
  }
  function focusGroup(ci) {
    const ns = ctx.G.CLUSTERS[ci].ids.map(id => byId[id]); if (!ns.length || !zoom) return;
    const x = ns.reduce((a, n) => a + n.x, 0) / ns.length, y = ns.reduce((a, n) => a + n.y, 0) / ns.length;
    d3.select(canvas).transition().duration(450).call(zoom.transform, d3.zoomIdentity.translate(W / 2, H / 2).scale(1.4).translate(-x, -y));
  }

  function neighbours(x, minShared) {
    const G = ctx.G, nb = new Set([...G.BY[x].deps, ...G.BY[x].dependents]);
    G.SHARED[x].forEach((cs, o) => { if (cs.length >= minShared) nb.add(o); });
    if (ctx.UI.webThemes !== false) G.TLINK[x].forEach((l, o) => nb.add(o));
    return nb;
  }
  function hops(id, n, minShared) {
    const G = ctx.G, seen = new Map([[id, 0]]), byHop = [[id]];
    let frontier = [id];
    for (let h = 1; h <= n; h++) {
      const next = [];
      frontier.forEach(x => neighbours(x, minShared).forEach(y => { if (!seen.has(y)) { seen.set(y, h); next.push(y); } }));
      byHop.push(next.sort((a, b) => G.BY[a].pos - G.BY[b].pos)); frontier = next;
    }
    return { byHop, seen };
  }

  function update(c) { ctx = c; draw(); }
  function relayout(mode) { layoutMode = mode; layout(); fit(false); draw(); }
  function toGraph(ev) { const r = canvas.getBoundingClientRect(), t = transform || d3.zoomIdentity; return t.invert([ev.clientX - r.left, ev.clientY - r.top]); }
  function pick(ev) {
    const [x, y] = toGraph(ev), k = (transform || d3.zoomIdentity).k;
    let best = null, bd = Infinity;
    nodes.forEach(n => { const d = Math.hypot(n.x - x, n.y - y); if (d < n.r + 6 / k && d < bd) { bd = d; best = n; } });
    return best;
  }
  function pickHull(ev) {
    const p = toGraph(ev);
    const h = hulls.find(h => h.hull && d3.polygonContains(h.hull, p));
    return h ? h.c : null;
  }
  function onMove(ev) {
    const n = pick(ev);
    canvas.classList.toggle("pointer", !!n);
    if ((n && n.id) !== (hover && hover.id)) { hover = n; draw(); }
    const r = box.getBoundingClientRect();
    if (n) {
      const t = n.n, cl = ctx.G.CLUSTERS[n.cl];
      tip.textContent = t.id + " · " + t.t + " — " + cl.name + " group · value " + Math.round(ctx.V[t.id]) + " · " + Math.round(ctx.frac(t.id) * 100) + "% done";
    } else {
      const hc = pickHull(ev);
      if (hc == null) { tip.hidden = true; return; }
      const cl = ctx.G.CLUSTERS[hc];
      tip.textContent = cl.name + " group · " + cl.ids.length + " topics" + (cl.theme ? " · held together by " + cl.theme : "") + " · click to select";
    }
    tip.hidden = false;
    tip.style.left = Math.min(r.width - 270, ev.clientX - r.left + 14) + "px"; tip.style.top = (ev.clientY - r.top + 14) + "px";
  }
  function onClick(ev) {
    const n = pick(ev);
    if (n) { ctx.onSelect(n.id); return; }
    const hc = pickHull(ev);
    if (ctx.onSelectGroup) ctx.onSelectGroup(hc);
    else ctx.onSelect(null);
  }

  function nodeColor(n) {
    const mode = ctx.UI.webColor || "cluster";
    if (mode === "cluster") return groupColor(n.cl);
    if (mode === "realm") return css("--r" + n.realm);
    const f = ctx.frac(n.id); return f >= 1 ? css("--done") : f > 0 ? css("--prog") : css("--block");
  }

  function draw() {
    if (!c2d) return;
    const G = ctx.G, t = transform || d3.zoomIdentity, k = t.k;
    const col = { line: css("--line2"), ink: css("--ink"), muted: css("--muted"), surface: css("--surface"), req: css("--req"), next: css("--next"), rel: css("--rel"), route: css("--route"), done: css("--done"), prog: css("--prog") };
    c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    c2d.fillStyle = col.surface; c2d.fillRect(0, 0, W, H);
    c2d.setTransform(dpr * k, 0, 0, dpr * k, dpr * t.x, dpr * t.y);
    const mode = ctx.UI.webColor || "cluster";

    const sel = ctx.sel && byId[ctx.sel] ? ctx.sel : null;
    const selG = !sel && ctx.selGroup != null ? ctx.selGroup : null;
    let role = null;
    if (sel) {
      const H2 = hops(sel, ctx.n, ctx.UI.webMin || 2);
      role = {};
      H2.seen.forEach((h, id) => { role[id] = id === sel ? "sel" : G.ANC[sel].has(id) ? "req" : G.DESC[sel].has(id) ? "next" : "rel"; });
    } else if (selG != null) {
      role = {};
      G.CLUSTERS[selG].ids.forEach(id => (role[id] = "grp"));
      G.CLUSTERS[selG].ids.forEach(id => G.TLINK[id].forEach((l, o) => { if (!role[o]) role[o] = "out"; }));
      G.CLUSTERS[selG].ids.forEach(id => [...G.BY[id].deps, ...G.BY[id].dependents].forEach(o => { if (!role[o]) role[o] = "out"; }));
    }
    const roleCol = r => r === "req" ? col.req : r === "next" ? col.next : r === "rel" ? col.rel : col.ink;

    // group hulls
    if (layoutMode === "groups") {
      hulls.forEach(h => {
        if (!h.hull) return;
        const on = selG == null || selG === h.c, cl = G.CLUSTERS[h.c];
        c2d.beginPath(); h.hull.forEach(([x, y], i) => (i ? c2d.lineTo(x, y) : c2d.moveTo(x, y))); c2d.closePath();
        c2d.fillStyle = groupColor(h.c, role && !on ? 0.03 : selG === h.c ? 0.16 : 0.08); c2d.fill();
        c2d.lineWidth = (selG === h.c ? 2.5 : 1.2) / Math.sqrt(k); c2d.strokeStyle = groupColor(h.c, role && !on ? 0.15 : 0.55); c2d.stroke();
        c2d.globalAlpha = role && !on ? 0.3 : 1;
        c2d.font = "800 " + (12.5 / Math.max(k, 0.55)) + "px Overpass, sans-serif"; c2d.textAlign = "center"; c2d.textBaseline = "bottom";
        c2d.fillStyle = groupColor(h.c); c2d.fillText(cl.name.toUpperCase(), h.x, h.top);
        if (cl.theme && k > 0.45) { c2d.font = "600 " + (10.5 / Math.max(k, 0.55)) + "px Overpass, sans-serif"; c2d.fillStyle = col.muted; c2d.fillText(cl.theme, h.x, h.top + 13 / Math.max(k, 0.55)); }
        c2d.globalAlpha = 1;
      });
    } else {
      c2d.font = "800 " + (13 / Math.max(k, 0.5)) + "px Overpass, sans-serif"; c2d.fillStyle = col.muted;
      if (layoutMode === "web") { c2d.textAlign = "center"; G.REALMS.forEach((r, i) => { const ns = nodes.filter(n => n.realm === i); c2d.fillText(r.name.toUpperCase(), ns.reduce((a, n) => a + n.x, 0) / ns.length, Math.min(...ns.map(n => n.y)) - 24); }); }
      else { c2d.textAlign = "left"; const minX = Math.min(...nodes.map(n => n.x)); G.REALMS.forEach((r, i) => { const ns = nodes.filter(n => n.realm === i); if (!ns.length) return; const cy = ns.reduce((a, n) => a + n.y, 0) / ns.length; c2d.fillText(r.name.toUpperCase(), minX - 40 - c2d.measureText(r.name.toUpperCase()).width, cy + 4); }); }
    }

    // theme & bridge threads
    if (ctx.UI.webThemes !== false) {
      thm.forEach(e => {
        const inter = e.a.cl !== e.b.cl;
        let on;
        if (sel) on = (e.a.id === sel || e.b.id === sel);
        else if (selG != null) on = e.a.cl === selG && e.b.cl === selG;
        else on = null;
        if (role && !on) return;
        if (!role && !e.bridge && !inter && k < 0.5) return;
        c2d.setLineDash(e.bridge ? [] : [1.5 / k, 3 / k]);
        c2d.strokeStyle = role ? (sel ? col.rel : groupColor(e.a.cl === selG ? e.b.cl : e.a.cl)) : inter ? col.muted : groupColor(e.a.cl);
        c2d.globalAlpha = role ? 0.85 : e.bridge ? 0.45 : inter ? 0.10 : 0.16;
        c2d.lineWidth = ((e.bridge ? 1.6 : 0.7) + (role ? 0.6 : 0)) / Math.sqrt(k);
        c2d.beginPath(); c2d.moveTo(e.a.x, e.a.y);
        if (inter && layoutMode === "groups") c2d.quadraticCurveTo((e.a.x + e.b.x) / 2 * 0.6, (e.a.y + e.b.y) / 2 * 0.6, e.b.x, e.b.y); else c2d.lineTo(e.b.x, e.b.y);
        c2d.stroke();
      });
      c2d.setLineDash([]);
    }
    // aggregated links from the selected group to every other group (width = strength)
    if (selG != null && layoutMode === "groups") {
      const me = hulls.find(h => h.c === selG);
      const ns = G.CLUSTERS[selG].ids.map(id => byId[id]), mx = ns.reduce((a, n) => a + n.x, 0) / ns.length, my = ns.reduce((a, n) => a + n.y, 0) / ns.length;
      Object.entries(G.CL_LINK).forEach(([key, w]) => {
        const [a, b] = key.split("-").map(Number); if (a !== selG && b !== selG) return;
        const o = a === selG ? b : a, os = G.CLUSTERS[o].ids.map(id => byId[id]);
        const ox = os.reduce((s2, n) => s2 + n.x, 0) / os.length, oy = os.reduce((s2, n) => s2 + n.y, 0) / os.length;
        c2d.globalAlpha = 0.55; c2d.strokeStyle = groupColor(o); c2d.lineCap = "round";
        c2d.lineWidth = Math.min(22, 1.5 + w * 0.45) / Math.sqrt(k);
        c2d.beginPath(); c2d.moveTo(mx, my); c2d.quadraticCurveTo((mx + ox) / 2 * 0.7, (my + oy) / 2 * 0.7, ox, oy); c2d.stroke();
        c2d.globalAlpha = 1; c2d.font = "700 " + (11 / Math.max(k, 0.6)) + "px 'Overpass Mono', monospace"; c2d.fillStyle = groupColor(o); c2d.textAlign = "center";
        c2d.fillText(w.toFixed(0), (mx + ox) / 2 * 0.7 + (mx + ox) / 4 * 0.6, (my + oy) / 2 * 0.7 + (my + oy) / 4 * 0.6);
      });
      c2d.globalAlpha = 1;
    }
    // concept threads
    if (ctx.UI.webConc !== false && (sel || layoutMode !== "groups")) {
      c2d.setLineDash([3 / k, 4 / k]);
      conc.forEach(e => {
        if (e.k < (ctx.UI.webMin || 2)) return;
        const on = sel && (e.a.id === sel || e.b.id === sel);
        if (role && !on) return;
        c2d.strokeStyle = on ? col.rel : col.line; c2d.globalAlpha = on ? 0.9 : 0.2; c2d.lineWidth = (on ? 1.4 : 0.6) / Math.sqrt(k);
        c2d.beginPath(); c2d.moveTo(e.a.x, e.a.y); c2d.lineTo(e.b.x, e.b.y); c2d.stroke();
      });
      c2d.setLineDash([]);
    }
    // prerequisite arrows
    pre.forEach(l => {
      const a = l.source, b = l.target;
      let on = false, c = col.line;
      if (sel && role[a.id] && role[b.id]) {
        if ((G.ANC[sel].has(a.id) || a.id === sel) && (G.ANC[sel].has(b.id) || b.id === sel)) { on = true; c = col.req; }
        else if (G.DESC[sel].has(b.id) && (G.DESC[sel].has(a.id) || a.id === sel)) { on = true; c = col.next; }
      } else if (selG != null && (a.cl === selG || b.cl === selG)) { on = true; c = a.cl === b.cl ? groupColor(selG) : col.ink; }
      c2d.globalAlpha = role ? (on ? 0.85 : 0.04) : layoutMode === "groups" ? (a.cl === b.cl ? 0.35 : 0.14) : 0.5;
      c2d.strokeStyle = !role && layoutMode === "groups" && a.cl === b.cl ? groupColor(a.cl) : c; c2d.lineWidth = (on ? 1.8 : 0.9) / Math.sqrt(k);
      const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
      const ex = b.x - ux * (b.r + 2), ey = b.y - uy * (b.r + 2);
      c2d.beginPath(); c2d.moveTo(a.x + ux * a.r, a.y + uy * a.r); c2d.lineTo(ex, ey); c2d.stroke();
      if (on || k > 1.3) { const s = 5 / Math.sqrt(k); c2d.fillStyle = c2d.strokeStyle; c2d.beginPath(); c2d.moveTo(ex, ey); c2d.lineTo(ex - ux * s - uy * s * 0.6, ey - uy * s + ux * s * 0.6); c2d.lineTo(ex - ux * s + uy * s * 0.6, ey - uy * s - ux * s * 0.6); c2d.fill(); }
    });
    c2d.globalAlpha = 1;

    // highlighted route (followed plan or a route preview)
    const route = ctx.route;
    if (route && route.length > 1) {
      c2d.strokeStyle = col.route; c2d.lineWidth = 5 / Math.sqrt(k); c2d.lineJoin = "round"; c2d.lineCap = "round"; c2d.globalAlpha = role ? 0.35 : 0.75;
      c2d.beginPath(); route.forEach((id, i) => { const n = byId[id]; if (!n) return; i ? c2d.lineTo(n.x, n.y) : c2d.moveTo(n.x, n.y); }); c2d.stroke();
      c2d.globalAlpha = 1;
    }

    // nodes
    nodes.forEach(n => {
      const r = role ? role[n.id] : null, dim = role && !r;
      const f = ctx.frac(n.id), base = nodeColor(n);
      c2d.globalAlpha = dim ? 0.13 : r === "out" ? 0.75 : 1;
      c2d.beginPath(); c2d.arc(n.x, n.y, n.r, 0, 6.283);
      c2d.fillStyle = mode === "status" ? base : col.surface; c2d.fill();
      if (mode !== "status") {
        c2d.beginPath(); c2d.arc(n.x, n.y, n.r * 0.62, 0, 6.283); c2d.fillStyle = base; c2d.globalAlpha *= f > 0 ? 1 : 0.28; c2d.fill(); c2d.globalAlpha = dim ? 0.13 : 1;
        if (f > 0 && f < 1) { c2d.beginPath(); c2d.arc(n.x, n.y, n.r + 1.5, -1.571, -1.571 + 6.283 * f); c2d.lineWidth = 2.2 / Math.sqrt(k); c2d.strokeStyle = col.prog; c2d.stroke(); }
      }
      c2d.beginPath(); c2d.arc(n.x, n.y, n.r, 0, 6.283);
      c2d.lineWidth = (r === "sel" ? 3.5 : r && r !== "grp" && r !== "out" ? 2.4 : 1.6) / Math.sqrt(k);
      c2d.strokeStyle = r === "req" || r === "next" || r === "rel" ? roleCol(r) : f >= 1 && mode !== "status" ? col.done : base; c2d.stroke();
      if (ctx.S.current === n.id || r === "sel") { c2d.beginPath(); c2d.arc(n.x, n.y, n.r + 4 / k + 2, 0, 6.283); c2d.lineWidth = 1.5 / k; c2d.strokeStyle = r === "sel" ? col.ink : col.route; c2d.stroke(); }
      if ((ctx.S.goals || []).includes(n.id)) { c2d.beginPath(); c2d.arc(n.x, n.y, n.r + 7 / k + 3, 0, 6.283); c2d.lineWidth = 2 / k; c2d.strokeStyle = col.route; c2d.setLineDash([2 / k, 2 / k]); c2d.stroke(); c2d.setLineDash([]); }
    });
    // labels
    c2d.textAlign = "center"; c2d.textBaseline = "top";
    nodes.forEach(n => {
      const r = role ? role[n.id] : null;
      if (role && !r && hover !== n) return;
      if (!r && hover !== n && k < 0.55) return;
      const big = r === "sel" || hover === n || k > 1.7;
      c2d.globalAlpha = 1;
      c2d.font = (big ? "700 " : "600 ") + (10.5 / Math.max(k, 0.7)) + "px 'Overpass Mono', monospace";
      c2d.fillStyle = r === "req" || r === "next" || r === "rel" ? roleCol(r) : col.ink;
      c2d.fillText(n.id, n.x, n.y + n.r + 2);
      if (big) { c2d.font = "600 " + (11 / Math.max(k, 0.7)) + "px Overpass, sans-serif"; c2d.fillStyle = col.muted; c2d.fillText(n.n.t.length > 34 ? n.n.t.slice(0, 32) + "…" : n.n.t, n.x, n.y + n.r + 2 + 13 / Math.max(k, 0.7)); }
    });
    c2d.globalAlpha = 1;
  }

  root.Graph = { mount, update, relayout, fit: () => fit(false), focus, focusGroup, hops, groupColor };
})(window);
