// CI-only: drives the app like a person on an iPhone (WebKit) and captures key states.
// The app is built with NEXT_PUBLIC_OFFLINE=1 and seeded from scripts/fixture.json via
// localStorage, so no network or production data is involved.
import { webkit, devices } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
// Map localStorage cache keys -> fixture.json collections. Replace with your app's cache keys.
const SEED = {
  srl_trucks_fb_cache: 'trucks',
  srl_drivers_fb_cache: 'drivers',
  srl_trips_fb_cache: 'trips',
};
const fixture = JSON.parse(readFileSync(new URL('./fixture.json', import.meta.url), 'utf8'));
mkdirSync('shots', { recursive: true });

const device = devices['iPhone 15 Pro'] || devices['iPhone 13 Pro'];
const browser = await webkit.launch();
const log = [];

async function openApp(scheme) {
  const context = await browser.newContext({ ...device, colorScheme: scheme, reducedMotion: 'no-preference' });
  await context.addInitScript(({ fx, seed }) => {
    for (const [key, collection] of Object.entries(seed)) {
      localStorage.setItem(key, JSON.stringify(fx[collection] ?? []));
    }
  }, { fx: fixture, seed: SEED });
  const page = await context.newPage();
  page.on('pageerror', e => log.push(`[${scheme}] pageerror: ${e.message}`));
  page.on('console', m => {
    if (m.type() === 'error') log.push(`[${scheme}] console: ${m.text().slice(0, 200)}`);
  });
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForSelector('.tabbar', { timeout: 20000 });
  await page.waitForTimeout(800);
  return { context, page };
}

const settle = (page, ms = 900) => page.waitForTimeout(ms);
const tab = (page, name) => page.getByRole('tab', { name }).click();
const tap = (page, name) => page.getByRole('button', { name }).first().click({ timeout: 8000 });
const scrollTo = (page, y) =>
  page.evaluate(top => {
    const panes = [...document.querySelectorAll('.tab-pane[data-active="true"] .screen-scroll')];
    const el = panes[panes.length - 1];
    if (el) el.scrollTop = top;
  }, y);

async function shot(page, name, scheme) {
  await page.screenshot({ path: `shots/${name}-${scheme}.png` });
  log.push(`[${scheme}] ok ${name}`);
}

async function step(page, name, scheme, fn) {
  try {
    await fn();
    await shot(page, name, scheme);
  } catch (e) {
    log.push(`[${scheme}] FAIL ${name}: ${String(e.message).split('\n')[0]}`);
    try { await page.screenshot({ path: `shots/${name}-${scheme}-FAIL.png` }); } catch {}
  }
}

async function back(page) {
  await page.getByRole('button', { name: 'Back' }).last().click();
  await settle(page, 700);
}

async function light() {
  const { context, page } = await openApp('light');
  await step(page, '00-today', 'light', async () => {});
  await step(page, '01-fleet', 'light', async () => { await tab(page, 'Fleet'); await settle(page); });
  await step(page, '02-trips', 'light', async () => { await tab(page, 'Trips'); await settle(page); });
  await step(page, '03-drivers', 'light', async () => { await tab(page, 'Drivers'); await settle(page); });
  await step(page, '04-driver-detail', 'light', async () => { await tap(page, /Aslam Sanadi/); await settle(page, 1700); });
  await step(page, '05-driver-detail-scrolled', 'light', async () => { await scrollTo(page, 700); await settle(page); });
  await step(page, '06-entry-sheet', 'light', async () => { await scrollTo(page, 0); await tap(page, /^Advance$/); await settle(page, 2200); });
  await page.keyboard.press('Escape').catch(() => {});
  await step(page, '07-fleet-detail', 'light', async () => {
    await page.getByRole('button', { name: 'Close' }).last().click();
    await settle(page, 800);
    await back(page);
    await tab(page, 'Fleet');
    await settle(page, 500);
    await tap(page, /MH 12 QX 4521/);
    await settle(page, 1100);
  });
  await step(page, '08-fleet-detail-scrolled', 'light', async () => { await scrollTo(page, 520); await settle(page); });
  await step(page, '09-trips-menu', 'light', async () => {
    await back(page);
    await tab(page, 'Trips');
    await settle(page, 500);
    await tap(page, 'More');
    await settle(page, 700);
  });
  await step(page, '10-trip-detail', 'light', async () => {
    await page.mouse.click(40, 420);
    await settle(page, 400);
    await tap(page, /Tata Steel Logistics/);
    await settle(page, 1400);
  });
  await step(page, '11-new-trip-sheet', 'light', async () => {
    await back(page);
    await tap(page, 'New Trip');
    await settle(page, 2200);
  });
  await step(page, '12-attendance-sheet', 'light', async () => {
    await page.getByRole('button', { name: 'Close' }).last().click();
    await settle(page, 800);
    await tab(page, 'Drivers');
    await tap(page, /Attendance/);
    await settle(page, 2200);
  });
  await context.close();
}

async function dark() {
  const { context, page } = await openApp('dark');
  await step(page, '20-today', 'dark', async () => {});
  await step(page, '21-fleet', 'dark', async () => { await tab(page, 'Fleet'); await settle(page); });
  await step(page, '22-driver-detail', 'dark', async () => { await tab(page, 'Drivers'); await tap(page, /Aslam Sanadi/); await settle(page, 1700); });
  await step(page, '23-trip-detail', 'dark', async () => { await back(page); await tab(page, 'Trips'); await tap(page, /Tata Steel Logistics/); await settle(page, 1100); });
  await context.close();
}


async function check(page, label, fn) {
  try {
    const ok = await fn();
    log.push(`[assert] ${ok ? 'ok' : 'FAIL'} ${label}`);
    if (!ok) failed = true;
  } catch (e) {
    log.push(`[assert] FAIL ${label}: ${String(e.message).split('\n')[0]}`);
    failed = true;
  }
}

const visible = (page, loc, ms = 4000) => loc.first().waitFor({ state: 'visible', timeout: ms }).then(() => true, () => false);
const hidden = (page, loc, ms = 4000) => loc.first().waitFor({ state: 'hidden', timeout: ms }).then(() => true, () => false);

async function dragMouse(page, from, to, { hold = false } = {}) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  const steps = 14;
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
    await page.waitForTimeout(16);
  }
  if (!hold) await page.mouse.up();
}

async function flows() {
  const { context, page } = await openApp('light');

  // --- swipe a ledger row, delete it, undo it
  await tab(page, 'Drivers');
  await tap(page, /Aslam Sanadi/);
  await settle(page, 1600);
  const row = page.getByRole('button', { name: /Tyre puncture/ }).first();
  await row.scrollIntoViewIfNeeded();
  await settle(page, 600);
  const box = await row.boundingBox();
  await step(page, '30-swipe-actions', 'flow', async () => {
    await dragMouse(page, { x: box.x + box.width - 30, y: box.y + box.height / 2 }, { x: box.x + 40, y: box.y + box.height / 2 });
    await settle(page, 900);
  });
  await step(page, '31-after-delete-undo-hud', 'flow', async () => {
    await page.getByRole('button', { name: 'Delete', exact: true }).first().click({ timeout: 5000 });
    await settle(page, 900);
  });
  await check(page, 'deleted entry disappears', () => hidden(page, page.getByRole('button', { name: /Tyre puncture/ })));
  await check(page, 'Undo HUD shown', () => visible(page, page.getByRole('button', { name: 'Undo' })));
  await page.getByRole('button', { name: 'Undo' }).click({ timeout: 4000 }).catch(() => {});
  await settle(page, 700);
  await check(page, 'undo restores entry', () => visible(page, page.getByRole('button', { name: /Tyre puncture/ })));

  // --- interactive swipe back from the left edge
  await scrollTo(page, 0);
  await settle(page, 400);
  await step(page, '32-swipe-back-midway', 'flow', async () => {
    await dragMouse(page, { x: 4, y: 330 }, { x: 210, y: 330 }, { hold: true });
    await settle(page, 300);
  });
  await page.mouse.move(360, 330, { steps: 6 });
  await page.mouse.up();
  await settle(page, 1200);
  await check(page, 'swipe-back returns to Drivers list', () => visible(page, page.getByRole('heading', { name: 'Drivers' })));

  // --- discard confirmation + creating a trip end to end
  await tab(page, 'Trips');
  await tap(page, 'New Trip');
  await settle(page, 1800);
  await page.getByRole('textbox', { name: 'Client' }).fill('QA Client Ltd');
  await step(page, '33-discard-changes', 'flow', async () => {
    await page.getByRole('button', { name: 'Close' }).last().click();
    await settle(page, 1200);
  });
  await check(page, 'discard dialog appears when form is dirty', () => visible(page, page.getByText('Discard changes?')));
  await page.getByRole('button', { name: 'Keep Editing' }).click();
  await settle(page, 700);
  await page.getByRole('textbox', { name: 'From' }).fill('Pune');
  await page.getByRole('textbox', { name: 'To' }).fill('Hyderabad');
  await page.getByLabel('Freight amount').fill('50000');
  await page.getByLabel('Truck', { exact: true }).selectOption({ label: 'MH 04 AB 8842' });
  await settle(page, 500);
  await step(page, '34-trip-form-filled', 'flow', async () => {});
  await page.getByRole('button', { name: 'Save' }).click();
  await settle(page, 2000);
  await check(page, 'new trip appears in list', () =>
    visible(page, page.locator('.tab-pane[data-active="true"]').getByText('QA Client Ltd', { exact: true })));
  await check(page, 'billing summary counts the new trip', () =>
    visible(page, page.locator('.tab-pane[data-active="true"]').getByText('₹2.37 L', { exact: true })));
  await step(page, '35-after-create-trip', 'flow', async () => {});

  // --- voucher sheet from a maintenance record
  await tab(page, 'Fleet');
  await tap(page, /MH 12 QX 4521/);
  await settle(page, 1600);
  await page.getByRole('button', { name: /Apollo 295/ }).first().scrollIntoViewIfNeeded();
  await tap(page, /Apollo 295/);
  await step(page, '36-voucher-sheet', 'flow', async () => { await settle(page, 2000); });

  // --- browser/Android back button must close the top-most layer, not leave the app
  await page.goBack();
  await settle(page, 1200);
  await check(page, 'browser back closes the voucher sheet first', () => hidden(page, page.getByRole('dialog')));
  await check(page, '...and stays on the truck screen', () => visible(page, page.getByRole('button', { name: 'Edit' })));
  await page.goBack();
  await settle(page, 1400);
  await check(page, 'second browser back pops to the Fleet list', () => visible(page, page.getByRole('heading', { name: 'Fleet' })));
  await tap(page, 'Add Truck');
  await settle(page, 1500);
  await check(page, 'Add Truck sheet opens', () => visible(page, page.getByRole('dialog')));
  await page.goBack();
  await settle(page, 1400);
  await check(page, 'browser back dismisses a clean sheet', () => hidden(page, page.getByRole('dialog')));

  await context.close();
}

let failed = false;
const guarded = async (name, fn) => {
  try {
    await fn();
  } catch (e) {
    log.push(`[${name}] CRASH: ${String(e.message).split('\n').slice(0, 4).join(' | ')}`);
    failed = true;
  }
};

try {
  await guarded('light', light);
  await guarded('dark', dark);
  await guarded('flows', flows);
} finally {
  await browser.close();
  writeFileSync('shots/log.txt', log.join('\n'));
  console.log(log.join('\n'));
}
if (failed || log.some(l => l.includes(' FAIL '))) process.exitCode = 1;
