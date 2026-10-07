// Runtime performance benchmark: drives a real Edge/Chrome with a scripted
// mouse and reports frame times + main-thread cost for idle, hovering the
// background, hovering the cards and scrolling.
//
//   npm i --no-save playwright
//   npx serve -l 5759 .            (in another terminal)
//   node tools/perf-test.mjs <label> [deviceScaleFactor=2] [url=http://localhost:5759/]
//
// Compare runs before/after a change: lower "p95", "over33ms" and "styleMsPerSec"
// are better. Numbers are relative (headless runs frames uncapped).
import { chromium } from "playwright";
const label = process.argv[2] || "run";
const dsf = Number(process.argv[3] || 2);
const url = process.argv[4] || "http://localhost:5759/";
const b = await chromium.launch({ channel: "msedge", args: ["--enable-gpu-rasterization"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: dsf, colorScheme: "dark" });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send("Performance.enable");
await p.goto(url); await p.waitForTimeout(2500);

await p.evaluate(() => {
  window.__f = []; window.__lt = 0; window.__run = false;
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt += e.duration; }).observe({ entryTypes: ["longtask"] });
  let last = performance.now();
  const tick = (t) => { if (window.__run) window.__f.push(t - last); last = t; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
});
const metrics = async () => Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
const stat = (a) => { const s = [...a].sort((x, y) => x - y); const q = (f) => s[Math.min(s.length - 1, Math.floor(f * s.length))] || 0; return { frames: a.length, avg: +(a.reduce((x, y) => x + y, 0) / (a.length || 1)).toFixed(1), p95: +q(0.95).toFixed(1), max: +Math.max(0, ...a).toFixed(1), over20ms: a.filter((x) => x > 20).length, over33ms: a.filter((x) => x > 33).length }; };

async function scenario(name, fn, ms) {
  await p.evaluate(() => { window.__f = []; window.__lt = 0; window.__run = true; });
  const m0 = await metrics(); const t0 = Date.now();
  await fn();
  const dt = Date.now() - t0;
  const m1 = await metrics();
  const r = await p.evaluate(() => { window.__run = false; return { f: window.__f, lt: window.__lt }; });
  const d = (k) => +((m1[k] - m0[k]) * 1000 / (dt / 1000)).toFixed(0); // ms of work per second
  console.log(JSON.stringify({ label, dsf, scenario: name, ...stat(r.f), longtaskMsPerSec: Math.round(r.lt / (dt / 1000)),
    cpuMsPerSec: d("TaskDuration"), scriptMsPerSec: d("ScriptDuration"), layoutMsPerSec: d("LayoutDuration"), styleMsPerSec: d("RecalcStyleDuration"),
    styleRecalcsPerSec: Math.round((m1.RecalcStyleCount - m0.RecalcStyleCount) / (dt / 1000)), layoutsPerSec: Math.round((m1.LayoutCount - m0.LayoutCount) / (dt / 1000)) }));
}
const sweep = async (y, ms) => {
  const start = Date.now(); let i = 0;
  while (Date.now() - start < ms) { i++; const t = (Date.now() - start) / ms; await p.mouse.move(60 + (1320 * (0.5 + 0.5 * Math.sin(t * 9))), y + 120 * Math.sin(t * 13)); await p.waitForTimeout(8); }
};
await scenario("idle", () => p.waitForTimeout(3000));
await p.mouse.move(700, 300);
await scenario("pointer over hero bg", () => sweep(300, 4000));
await p.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; scrollTo(0, 700); }); await p.waitForTimeout(1200);
await scenario("pointer over cards", () => sweep(450, 4000));
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(800);
await scenario("scroll (wheel)", async () => { for (let i = 0; i < 40; i++) { await p.mouse.wheel(0, 120); await p.waitForTimeout(40); } });
await b.close();
