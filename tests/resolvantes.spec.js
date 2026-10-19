/* global buildResolvante, zetaPow */
import { test, expect } from "@playwright/test";
import { adresse, surveiller } from "./outils.js";

// Lit une résolvante affichée : liste de [coefficient complexe, indice de α].
function lire(html, n) {
  const z = (e) => [Math.cos(2 * Math.PI * e / n), Math.sin(2 * Math.PI * e / n)];
  const s = html.replace(/&alpha;<sub>(\d+)<\/sub>/g, "A$1").replace(/&zeta;<sub>\d+<\/sub><sup>(\d+)<\/sup>/g, "Z$1")
    .replace(/j<sup>2<\/sup>/g, "Z2").replace(/&middot;/g, "·").replace(/\bj·/g, "Z1·").replace(/\bi·/g, "Zi·");
  return s.split(/ (?=[+−] )/).map((t) => {
    const m = t.trim().match(/^([+−] )?(?:(Z\d+|Zi)·)?A(\d+)$/);
    if (!m) throw new Error(`terme illisible : ${t}`);
    let c = !m[2] ? [1, 0] : m[2] === "Zi" ? z(n / 4) : z(Number(m[2].slice(1)));
    if (m[1] === "− ") c = [-c[0], -c[1]];
    return [c, Number(m[3]) - 1];
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto(adresse("index.html"));
});

test("résolvantes connues pour n = 2, 3, 4", async ({ page }) => {
  const r = await page.evaluate(() => [buildResolvante(2, 0, 1), buildResolvante(3, 0, 1), buildResolvante(4, 0, 2), buildResolvante(4, 0, 1), zetaPow(5, -1)]);
  expect(r).toEqual([
    "&alpha;<sub>1</sub> − &alpha;<sub>2</sub>",
    "&alpha;<sub>1</sub> + j<sup>2</sup>&middot;&alpha;<sub>2</sub> + j&middot;&alpha;<sub>3</sub>",
    "&alpha;<sub>1</sub> − &alpha;<sub>2</sub> + &alpha;<sub>3</sub> − &alpha;<sub>4</sub>",
    "&alpha;<sub>1</sub> − i&middot;&alpha;<sub>2</sub> − &alpha;<sub>3</sub> + i&middot;&alpha;<sub>4</sub>",
    "&zeta;<sub>5</sub><sup>4</sup>",
  ]);
});

test("σ : αi ↦ αi+1 multiplie Λk par ζnᵏ (vérification numérique des formules affichées)", async ({ page }) => {
  const formules = await page.evaluate(() => {
    const out = [];
    for (let n = 2; n <= 5; n++) for (let b = 0; b < 2; b++) for (let k = 0; k < n; k++) out.push([n, b, k, buildResolvante(n, b, k)]);
    return out;
  });
  const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  for (const [n, b, k, html] of formules) {
    const termes = lire(html, n);
    expect(termes.map((t) => t[1]).sort(), html).toEqual([...Array(n).keys()]);
    const alpha = Array.from({ length: n }, (_, i) => [Math.cos(i * 1.7 + 0.3) * (i + 2), Math.sin(i * 2.3) + i]);
    const lambda = (a) => termes.reduce((s, [c, i]) => { const m = mul(c, a[i]); return [s[0] + m[0], s[1] + m[1]]; }, [0, 0]);
    const avant = lambda(alpha);
    const apres = lambda(alpha.map((_, i) => alpha[(i + 1) % n]));   // σ(αi) = αi+1
    const attendu = mul([Math.cos(2 * Math.PI * k / n), Math.sin(2 * Math.PI * k / n)], avant);
    expect(Math.hypot(apres[0] - attendu[0], apres[1] - attendu[1]), `n=${n} β=α${b + 1} k=${k}`).toBeLessThan(1e-9);
    expect(lire(html, n)[0][1], "le premier terme est β").toBe(b);
  }
});

test("interface : n = 3 montre Cardan, n = 5 non", async ({ page }) => {
  const suivi = surveiller(page);
  await expect(page.locator("#resolvantes .row")).toHaveCount(3);
  await expect(page.locator("#cardanPanel")).toBeVisible();
  await page.selectOption("#n", "5");
  await expect(page.locator("#resolvantes .row")).toHaveCount(5);
  await expect(page.locator("#cardanPanel")).toBeHidden();
  await page.selectOption("#beta", "1");
  await expect(page.locator("#resolvantes .row").first()).toContainText("Λ0(β) = α2");
  suivi.verifier();
});
