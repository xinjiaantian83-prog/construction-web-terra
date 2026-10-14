import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const listeners = new Map();
const dataLayer = [];
const session = new Map();
const document = {
  body: { dataset: { pageType: 'cweb_ad_lp', landingPage: '/lp/shokunin-homepage/' }, classList: { add() {}, remove() {} } },
  head: { appendChild() {} },
  createElement() { return {}; },
  addEventListener(name, handler) { listeners.set(name, handler); },
  querySelector() { return null; },
  querySelectorAll() { return []; },
};
const window = {
  SITE_CONFIG: { ga4MeasurementId: 'G-TEST', metaPixelId: '' },
  dataLayer,
  location: { search: '?ga_debug=1', pathname: '/lp/shokunin-homepage/' },
  addEventListener() {},
  removeEventListener() {},
  setTimeout() {},
};
const context = {
  window,
  document,
  location: window.location,
  sessionStorage: {
    getItem(key) { return session.get(key) ?? null; },
    setItem(key, value) { session.set(key, value); },
  },
  URLSearchParams,
  requestAnimationFrame() {},
  setTimeout() {},
  console,
};

vm.runInNewContext(readFileSync(new URL('../script.js', import.meta.url), 'utf8'), context);

const lineLink = {
  dataset: { gaEvent: 'click_line', gaLabel: 'test' },
  href: 'https://lin.ee/test',
  textContent: 'LINEで相談',
  closest() { return this; },
};
listeners.get('click')({ target: lineLink });

const events = dataLayer
  .filter(entry => entry[0] === 'event')
  .map(entry => entry[1]);

if (!events.includes('click_line')) throw new Error('click_line was not sent');
if (events.includes('line_inquiry_click')) throw new Error('obsolete line_inquiry_click was sent');
if (events.includes('generate_lead')) throw new Error('generate_lead must not fire on a click');

console.log('Tracking test passed:', events.join(', '));
