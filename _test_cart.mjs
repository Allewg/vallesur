import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`PAGE: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`CON: ${m.text()}`);
});

await page.goto('file:///E:/Proyectos/ECCOMERCE%20WHATSAPPP/vallesur/index.html', {
  waitUntil: 'networkidle',
  timeout: 60000,
});
await page.waitForTimeout(2000);

const state = await page.evaluate(() => {
  const stack = document.body._x_dataStack?.[0];
  return {
    alpine: typeof window.Alpine !== 'undefined',
    hasStack: !!document.body._x_dataStack,
    cartOpen: stack?.cartOpen,
    cartLen: stack?.cartItems?.length,
    addToCartType: typeof stack?.addToCart,
    filteredCount: stack?.filteredProducts?.length,
  };
});

await page.locator('header button .fa-cart-shopping').click();
await page.waitForTimeout(500);

const drawer = await page.evaluate(() => {
  const el = [...document.querySelectorAll('div')].find((n) => n.getAttribute('x-show') === 'cartOpen');
  if (!el) return { found: false };
  const cs = getComputedStyle(el);
  return {
    found: true,
    display: cs.display,
    visibility: cs.visibility,
    rect: el.getBoundingClientRect(),
    inlineStyle: el.getAttribute('style'),
    cartOpen: document.body._x_dataStack?.[0]?.cartOpen,
  };
});

const addBtn = page.locator('#productos button', { hasText: 'Agregar al Carrito' }).first();
await addBtn.click();
await page.waitForTimeout(500);

const afterAdd = await page.evaluate(() => {
  const stack = document.body._x_dataStack?.[0];
  const el = [...document.querySelectorAll('div')].find((n) => n.getAttribute('x-show') === 'cartOpen');
  const cs = el ? getComputedStyle(el) : null;
  return {
    cartLen: stack?.cartItems?.length,
    cartOpen: stack?.cartOpen,
    drawerDisplay: cs?.display,
    badgeText: document.querySelector('header .fa-cart-shopping')?.parentElement?.querySelector('span')?.textContent,
  };
});

console.log(JSON.stringify({ state, drawer, afterAdd, errors }, null, 2));
await browser.close();
