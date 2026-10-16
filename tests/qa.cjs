/* Development-only QA; no testing libraries are loaded by index.html. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { spawn } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const url = process.env.QN_QA_URL || 'http://127.0.0.1:4173';
const widths = [1920, 1440, 1366, 1024, 768, 430, 390, 375];
const report = { responsive: [], checks: [], consoleErrors: [], accessibility: [], browser: '' };
let server;
let browser;
const ready = () => new Promise(resolve => {
  const request = http.get(url, response => { response.resume(); resolve(response.statusCode === 200); });
  request.on('error', () => resolve(false));
  request.setTimeout(1000, () => { request.destroy(); resolve(false); });
});
const record = name => { report.checks.push(name); console.log(`PASS ${name}`); };
const inject = (page, count, extra = {}) => page.evaluate(async ({ count, extra }) => {
  const { qnCareerData } = await import('/assets/js/mock-data.js');
  const data = structuredClone(qnCareerData);
  data.jobs = data.jobs.slice(0, count);
  data.recruitmentPrograms = [];
  data.partners = data.partners.slice(0, count);
  Object.assign(data, extra);
  document.getElementById('fpt-qn-career').dispatchEvent(new CustomEvent('qn:career-data', { detail: data }));
}, { count, extra });
const noOverflow = page => page.evaluate(() => {
  const width = document.documentElement.clientWidth;
  const overflowing = [...document.querySelectorAll('#fpt-qn-career *')].filter(element => {
    const style = getComputedStyle(element);
    if (style.display === 'none' || element.closest('dialog:not([open])') || element.classList.contains('qn-sr-only') || element.classList.contains('qn-skip-link')) return false;
    if (element.closest('.qn-partner-track') && !element.classList.contains('qn-partner-track')) return false;
    const rect = element.getBoundingClientRect();
    return rect.right > width + 1 || rect.left < -1;
  }).map(element => `${element.tagName}.${element.className}`);
  return { documentOverflow: document.documentElement.scrollWidth > width, overflowing };
});
const audit = async (page, label) => {
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
  const result = await page.evaluate(async () => (await axe.run('#fpt-qn-career', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(item => ({ id: item.id, impact: item.impact, description: item.description, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) })));
  report.accessibility.push({ label, violations: result });
  assert.deepEqual(result, [], `${label}: accessibility violations ${JSON.stringify(result)}`);
};

(async () => {
  await fs.mkdir(path.join(root, '.qa'), { recursive: true });
  if (!await ready()) {
    server = spawn(process.execPath, ['scripts/serve.mjs'], { cwd: root, stdio: 'ignore', windowsHide: true });
    for (let attempt = 0; attempt < 20 && !await ready(); attempt++) await new Promise(resolve => setTimeout(resolve, 150));
    assert.ok(await ready(), 'Local preview did not start');
  }
  browser = await chromium.launch({ headless: true });
  report.browser = await browser.version();
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  page.on('pageerror', error => report.consoleErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });

  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.querySelectorAll('#fpt-qn-career img')].map(img => { img.loading = 'eager'; return img.decode().catch(() => null); }));
    });
    assert.equal(await page.locator('.qn-job-item').count(), 8);
    assert.equal(await page.locator('.qn-save-button, [data-qn-save], [data-qn-save-status]').count(), 0);
    assert.equal(await page.locator('main > section').count(), 3);
    const overflow = await noOverflow(page);
    assert.equal(overflow.documentOverflow, false, `${width}px horizontal overflow`);
    assert.deepEqual(overflow.overflowing, [], `${width}px elements exceed viewport`);
    const layout = await page.evaluate(() => {
      const badImages = [...document.querySelectorAll('#fpt-qn-career img')].filter(img => !img.complete || !img.naturalWidth).map(img => img.src);
      const columns = getComputedStyle(document.querySelector('.qn-job-list')).gridTemplateColumns.split(' ').length;
      return { columns, badImages };
    });
    assert.equal(layout.columns, width >= 1200 ? 4 : width >= 900 ? 3 : width >= 600 ? 2 : 1);
    assert.deepEqual(layout.badImages, []);
    report.responsive.push({ width, ...layout, overflow: false });
    if ([1440, 768, 390].includes(width)) {
      await page.screenshot({ path: path.join(root, '.qa', `${width}-full.png`), fullPage: true });
      if (width === 1440) await page.screenshot({ path: path.join(root, '.qa', 'desktop-top.png') });
      if (width === 390) await page.screenshot({ path: path.join(root, '.qa', 'mobile-top.png') });
    }
    record(`responsive ${width}px`);
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(url, { waitUntil: 'networkidle' });
  await audit(page, 'desktop');
  record('WCAG A/AA automated desktop audit');
  const semantic = await page.evaluate(() => {
    const root = document.getElementById('fpt-qn-career');
    const ids = [...root.querySelectorAll('[id]')].map(element => element.id);
    const selectors = [];
    const splitSelectors = value => {
      let depth = 0;
      let start = 0;
      const result = [];
      for (let index = 0; index < value.length; index++) {
        if (value[index] === '(' || value[index] === '[') depth++;
        if (value[index] === ')' || value[index] === ']') depth--;
        if (value[index] === ',' && depth === 0) { result.push(value.slice(start, index).trim()); start = index + 1; }
      }
      result.push(value.slice(start).trim());
      return result;
    };
    const walk = rules => [...rules].forEach(rule => { if (rule.selectorText) selectors.push(...splitSelectors(rule.selectorText)); if (rule.cssRules) walk(rule.cssRules); });
    [...document.styleSheets].forEach(sheet => walk(sheet.cssRules));
    return {
      h1: root.querySelectorAll('h1').length,
      duplicatedIds: ids.filter((id, index) => ids.indexOf(id) !== index),
      globalSelectors: selectors.filter(selector => !selector.startsWith('#fpt-qn-career')),
      unprefixedClasses: [...root.querySelectorAll('[class]')].flatMap(element => [...element.classList]).filter(name => !name.startsWith('qn-')),
      missingAlt: root.querySelectorAll('img:not([alt])').length,
      inlineEvents: root.querySelectorAll('[onclick],[onerror],[onload]').length
    };
  });
  assert.equal(semantic.h1, 1);
  assert.deepEqual(semantic.duplicatedIds, []);
  assert.deepEqual(semantic.globalSelectors, []);
  assert.deepEqual(semantic.unprefixedClasses, []);
  assert.equal(semantic.missingAlt, 0);
  assert.equal(semantic.inlineEvents, 0);
  record('semantic HTML, scoped CSS and qn class prefixes');

  assert.equal(await page.locator('.qn-filters, [data-qn-filter], .qn-card-category').count(), 0);
  assert.equal(await page.locator('.qn-card-published time').count(), 8);
  const badges = await page.locator('.qn-card-published time').evaluateAll(elements => elements.map(element => ({ date: element.dateTime, title: element.title, text: element.textContent })));
  assert.ok(badges.every(badge => /^\d{4}-\d{2}-\d{2}$/.test(badge.date) && /^\d{2}\/\d{2}\/\d{4}$/.test(badge.title) && badge.text.trim()));
  await page.locator('#qn-job-search').fill('quy nhon');
  await page.waitForTimeout(180);
  assert.ok(await page.locator('.qn-job-item').count() > 0);
  await page.locator('#qn-job-search').fill('khong-co-co-hoi-nay');
  await page.waitForTimeout(180);
  assert.equal(await page.locator('.qn-job-item').count(), 0);
  assert.ok(await page.getByText('Không tìm thấy thông tin phù hợp').isVisible());
  await page.locator('#qn-job-search').fill('');
  await page.waitForTimeout(180);
  const firstPageTitles = await page.locator('.qn-job-item h3').allTextContents();
  await page.getByRole('button', { name: 'Trang 2', exact: true }).click();
  assert.equal(await page.locator('.qn-job-item').count(), 4);
  assert.notDeepEqual(await page.locator('.qn-job-item h3').allTextContents(), firstPageTitles);
  assert.equal(await page.locator('[aria-current="page"]').getAttribute('data-qn-page'), '2');
  assert.ok(await page.getByRole('button', { name: 'Trang tiếp theo', exact: true }).isDisabled());
  assert.ok((await page.locator('[data-qn-results]').textContent()).includes('9–12'));
  assert.equal(await page.evaluate(() => document.activeElement.id), 'jobs');
  await page.getByRole('button', { name: 'Trang trước', exact: true }).click();
  assert.deepEqual(await page.locator('.qn-job-item h3').allTextContents(), firstPageTitles);
  assert.ok(await page.getByRole('button', { name: 'Trang trước', exact: true }).isDisabled());
  await page.getByRole('button', { name: 'Trang tiếp theo', exact: true }).focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('[aria-current="page"]').getAttribute('data-qn-page'), '2');
  await page.locator('#qn-job-search').fill('quy nhon');
  await page.waitForTimeout(180);
  assert.ok((await page.locator('[data-qn-results]').textContent()).includes('1–'));
  await page.locator('#qn-job-search').fill('');
  await page.waitForTimeout(180);
  await page.getByRole('button', { name: 'Trang 2', exact: true }).click();
  await page.locator('[data-qn-location]').selectOption('Hà Nội');
  assert.ok(await page.locator('[data-qn-pagination]').evaluate(element => element.hidden));
  await page.locator('[data-qn-location]').selectOption('all');
  assert.equal(await page.locator('[aria-current="page"]').getAttribute('data-qn-page'), '1');
  record('hero filter removal, publication badges, search and pagination with page reset');

  const trigger = page.locator('.qn-job-item > .qn-text-link').first();
  await trigger.focus();
  await page.keyboard.press('Enter');
  assert.ok(await page.locator('dialog').evaluate(element => element.open));
  assert.ok(await page.locator('[data-qn-close]').evaluate(element => document.activeElement === element));
  await audit(page, 'detail dialog');
  await page.keyboard.press('Shift+Tab');
  assert.ok(await page.evaluate(() => document.querySelector('dialog').contains(document.activeElement)));
  await page.keyboard.press('Tab');
  assert.ok(await page.evaluate(() => document.querySelector('dialog').contains(document.activeElement)));
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('dialog').evaluate(element => element.open), false);
  assert.ok(await trigger.evaluate(element => document.activeElement === element));
  record('keyboard dialog, focus containment, Escape and focus restoration');

  await page.getByRole('link', { name: 'Shizuoka Job Fair 2026', exact: true }).click();
  assert.ok((await page.locator('#qn-dialog-title').textContent()).includes('Shizuoka'));
  await page.locator('[data-qn-dialog-anchor]').click();
  assert.equal(await page.locator('dialog').evaluate(element => element.open), false);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'jobs');
  const dates = await page.locator('.qn-card-published time').evaluateAll(elements => elements.map(element => element.dateTime));
  assert.deepEqual(dates, [...dates].sort().reverse());
  await page.getByRole('button', { name: 'Tìm kiếm', exact: true }).click();
  assert.equal(await page.evaluate(() => document.activeElement.id), 'jobs');
  record('program details, unified chronological list and intro/dialog anchors');

  await page.locator('[data-qn-location]').selectOption('Hà Nội');
  assert.equal(await page.locator('.qn-job-item').count(), 2);
  assert.ok((await page.locator('.qn-job-meta > span:first-child').allTextContents()).every(text => text === 'Hà Nội'));
  await page.locator('[data-qn-location]').selectOption('all');
  await page.locator('[data-qn-sort]').selectOption('oldest');
  const oldestDates = await page.locator('.qn-card-published time').evaluateAll(elements => elements.map(element => element.dateTime));
  assert.deepEqual(oldestDates, [...oldestDates].sort());
  await page.locator('[data-qn-sort]').selectOption('company');
  const companies = await page.locator('.qn-card-company').allTextContents();
  assert.deepEqual(companies, [...companies].sort((a, b) => a.localeCompare(b, 'vi')));
  await page.locator('[data-qn-sort]').selectOption('newest');
  await page.locator('#qn-job-search').fill('Linux');
  await page.waitForTimeout(180);
  assert.equal(await page.locator('.qn-job-item').count(), 1);
  await page.getByRole('button', { name: 'Tìm kiếm', exact: true }).click();
  assert.equal(await page.evaluate(() => document.activeElement.id), 'jobs');
  await page.locator('#qn-job-search').fill('');
  await page.waitForTimeout(180);
  record('location filter, newest/oldest/company sorting and skill search');

  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.locator('.qn-partner:not([data-qn-partner-clone])').count(), 17);
  assert.equal(await page.locator('[data-qn-partner-toggle]').count(), 0);
  await page.locator('[data-qn-partners]').focus();
  const trackBefore = await page.locator('[data-qn-partners]').evaluate(element => element.scrollLeft);
  await page.getByRole('button', { name: 'Doanh nghiệp tiếp theo', exact: true }).click();
  await page.waitForFunction(before => document.querySelector('[data-qn-partners]').scrollLeft > before, trackBefore);
  await page.waitForFunction(() => !document.querySelector('[data-qn-partner-direction="-1"]').disabled);
  const trackAfterNext = await page.locator('[data-qn-partners]').evaluate(element => element.scrollLeft);
  await page.getByRole('button', { name: 'Doanh nghiệp trước', exact: true }).click();
  await page.waitForFunction(before => document.querySelector('[data-qn-partners]').scrollLeft < before, trackAfterNext);
  assert.equal((await noOverflow(page)).documentOverflow, false);
  record('17 reference partner logos and previous/next on mobile without document overflow');

  const carouselPage = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  const carouselErrors = [];
  carouselPage.on('pageerror', error => carouselErrors.push(error.message));
  await carouselPage.goto(url, { waitUntil: 'networkidle' });
  const carouselTrack = carouselPage.locator('[data-qn-partners]');
  await carouselTrack.scrollIntoViewIfNeeded();
  await carouselPage.locator('#qn-partners-title').hover();
  await carouselPage.waitForTimeout(150);
  const autoBefore = await carouselTrack.evaluate(element => element.scrollLeft);
  await carouselPage.waitForFunction(before => Math.abs(document.querySelector('[data-qn-partners]').scrollLeft - before) > 20, autoBefore, { timeout: 1500 });
  await carouselTrack.hover();
  let movingPosition = await carouselTrack.evaluate(element => element.scrollLeft);
  for (let sample = 0; sample < 4; sample++) {
    await carouselPage.waitForTimeout(250);
    const currentPosition = await carouselTrack.evaluate(element => element.scrollLeft);
    assert.ok(currentPosition - movingPosition > 3, 'Logos move continuously while hovered, without waiting for a slide timer');
    movingPosition = currentPosition;
  }
  assert.equal(await carouselPage.locator('[data-qn-partner-toggle]').count(), 0);
  await carouselTrack.focus();
  await carouselPage.waitForTimeout(850);
  const focusedPosition = await carouselTrack.evaluate(element => element.scrollLeft);
  await carouselPage.waitForTimeout(600);
  assert.equal(await carouselTrack.evaluate(element => element.scrollLeft), focusedPosition);
  await carouselTrack.evaluate(element => element.scrollTo({ left: element.querySelector('.qn-partner:not([data-qn-partner-clone])').offsetLeft, behavior: 'instant' }));
  await carouselPage.waitForTimeout(250);
  const partnerIds = await carouselPage.locator('.qn-partner:not([data-qn-partner-clone])').evaluateAll(elements => elements.map(element => element.dataset.qnBrand));
  const firstVisiblePartner = () => carouselTrack.evaluate(element => {
    const left = element.getBoundingClientRect().left;
    return [...element.children].find(child => {
      const rect = child.getBoundingClientRect();
      return rect.left <= left + 2 && rect.right > left + 2;
    })?.dataset.qnBrand;
  });
  await carouselPage.keyboard.press('ArrowLeft');
  await carouselPage.waitForTimeout(1000);
  assert.equal(await firstVisiblePartner(), partnerIds.at(-1), 'Previous wraps from first to last logo');
  await carouselPage.keyboard.press('ArrowRight');
  await carouselPage.waitForTimeout(1000);
  assert.equal(await firstVisiblePartner(), partnerIds[0], 'Next wraps from last to first logo');
  assert.ok(await carouselPage.locator('[data-qn-partner-clone]').evaluateAll(elements => elements.every(element => element.inert && element.getAttribute('aria-hidden') === 'true')));
  await carouselPage.emulateMedia({ reducedMotion: 'reduce' });
  await carouselPage.waitForTimeout(250);
  await carouselPage.evaluate(() => document.activeElement.blur());
  const reducedPosition = await carouselTrack.evaluate(element => element.scrollLeft);
  await carouselPage.waitForFunction(before => Math.abs(document.querySelector('[data-qn-partners]').scrollLeft - before) > 20, reducedPosition, { timeout: 1500 });
  await carouselPage.reload({ waitUntil: 'networkidle' });
  await carouselTrack.scrollIntoViewIfNeeded();
  await carouselPage.locator('#qn-partners-title').hover();
  assert.equal(await carouselPage.locator('[data-qn-partner-toggle]').count(), 0);
  const defaultReducedPosition = await carouselTrack.evaluate(element => element.scrollLeft);
  await carouselPage.waitForFunction(before => Math.abs(document.querySelector('[data-qn-partners]').scrollLeft - before) > 20, defaultReducedPosition, { timeout: 1500 });
  assert.deepEqual(carouselErrors, []);
  await carouselPage.close();
  record('no pause button; continuous logo autoplay in both motion settings, focus, wrap and reload');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url, { waitUntil: 'networkidle' });
  await audit(page, 'mobile');
  const motion = await page.locator('.qn-job-item').first().evaluate(element => getComputedStyle(element).transitionDuration);
  assert.equal(motion, '0s');
  record('mobile accessibility and prefers-reduced-motion');

  for (const count of [9, 32, 84]) {
    await page.evaluate(async count => {
      const { qnCareerData } = await import('/assets/js/mock-data.js');
      const jobs = Array.from({ length: count }, (_, index) => ({ ...qnCareerData.jobs[index % qnCareerData.jobs.length], id: `pagination-${index}`, title: `Tin tuyển dụng ${index + 1}`, permalink: `#pagination-${index}` }));
      document.getElementById('fpt-qn-career').dispatchEvent(new CustomEvent('qn:career-data', { detail: { jobs, recruitmentPrograms: [] } }));
    }, count);
    const pageCount = Math.ceil(count / 8);
    if (count === 84) {
      for (let step = 1; step < 7; step++) await page.getByRole('button', { name: 'Trang tiếp theo', exact: true }).click();
      assert.ok(await page.getByRole('button', { name: 'Trang 7', exact: true }).isVisible());
      assert.ok(await page.locator('[data-qn-page]').count() <= 7);
    } else {
      await page.getByRole('button', { name: `Trang ${pageCount}`, exact: true }).click();
      assert.equal(await page.locator('.qn-job-item').count(), count % 8 || 8);
      assert.equal(await page.locator('[aria-current="page"]').getAttribute('data-qn-page'), String(pageCount));
      if (count === 32) {
        await audit(page, 'four-page pagination');
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.locator('[data-qn-pagination]').screenshot({ path: path.join(root, '.qa', 'pagination-reference.png') });
      }
    }
    for (const width of [1440, 390, 375]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal((await noOverflow(page)).documentOverflow, false);
    }
  }
  record('partial last page, four-page reference, long pagination and mobile overflow');

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const count of [0, 1, 2, 6, 8]) {
      await inject(page, count);
      const overflow = await noOverflow(page);
      assert.equal(overflow.documentOverflow, false, `${width}px ${count} records overflow`);
      assert.deepEqual(overflow.overflowing, []);
      assert.equal(await page.locator('.qn-job-item').count(), Math.min(count, 8));
      assert.equal(await page.locator('[data-qn-pagination]').evaluate(element => element.hidden), count <= 8);
      assert.equal(await page.locator('[data-qn-partner-section]').evaluate(element => element.hidden), count === 0);
      if (count === 0) assert.ok(await page.getByText('Chưa có thông tin tuyển dụng').isVisible());
    }
  }
  record('0/1/2/6/8 records at desktop and mobile');

  await page.evaluate(async () => {
    const { qnCareerData } = await import('/assets/js/mock-data.js');
    const data = structuredClone(qnCareerData);
    data.jobs[0].title = 'Chương trình tuyển dụng nhân sự dành cho sinh viên và cựu sinh viên FPT University Quy Nhơn năm 2026';
    data.jobs[0].excerpt = 'Nội dung dài cần được hiển thị rõ ràng, đảm bảo bố cục ổn định và có thể đọc đầy đủ trong chi tiết. '.repeat(30);
    data.jobs[0].thumbnail = null;
    data.jobs[1].title = 'TieuDeKhongCoKhoangTrang'.repeat(30);
    data.jobs[2].title = '<img src=x onerror=alert(1)>';
    document.getElementById('fpt-qn-career').dispatchEvent(new CustomEvent('qn:career-data', { detail: data }));
  });
  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    assert.equal((await noOverflow(page)).documentOverflow, false, `long title overflow at ${width}`);
  }
  assert.ok(await page.locator('.qn-job-item img').first().evaluate(img => img.src.endsWith('fallback.svg')));
  assert.equal(await page.locator('.qn-job-item h3 img').count(), 0);
  await page.locator('.qn-job-item > .qn-text-link').first().click();
  assert.ok((await page.locator('#qn-dialog-title').textContent()).includes('cựu sinh viên'));
  await page.keyboard.press('Escape');
  record('long title/excerpt, missing thumbnail and escaped HTML');

  await page.evaluate(() => {
    const outside = document.createElement('div');
    outside.id = 'qa-host-sentinel';
    outside.className = 'card qn-card';
    outside.innerHTML = '<h1>Host heading</h1><button>Host button</button>';
    document.body.append(outside);
    window.qaHostBefore = { html: outside.outerHTML, font: getComputedStyle(outside).fontFamily, button: getComputedStyle(outside.querySelector('button')).backgroundColor };
  });
  await inject(page, 3);
  const host = await page.evaluate(() => {
    const outside = document.getElementById('qa-host-sentinel');
    return { html: outside.outerHTML, font: getComputedStyle(outside).fontFamily, button: getComputedStyle(outside.querySelector('button')).backgroundColor };
  });
  assert.deepEqual(host, await page.evaluate(() => window.qaHostBefore));
  await page.evaluate(() => document.getElementById('qa-host-sentinel').remove());
  record('WordPress host DOM and styles remain untouched');

  await page.evaluate(() => document.getElementById('fpt-qn-career').dispatchEvent(new CustomEvent('qn:career-error')));
  assert.ok(await page.getByText('Chưa thể tải thông tin tuyển dụng', { exact: true }).isVisible());
  assert.ok(await page.locator('[data-qn-pagination]').evaluate(element => element.hidden));
  await inject(page, 3);
  assert.equal(await page.locator('.qn-job-item').count(), 3);
  await page.evaluate(() => document.getElementById('fpt-qn-career').dispatchEvent(new CustomEvent('qn:career-data', { detail: { jobs: null, recruitmentPrograms: [null, 3] } })));
  assert.equal(await page.locator('.qn-job-item').count(), 0);
  record('error/recovery and malformed payloads');

  // Broken network images must recover; expected 404 console entries are excluded here only.
  const errorCount = report.consoleErrors.length;
  await page.route('**/deliberately-missing.webp', route => route.fulfill({ status: 404, body: '' }));
  await inject(page, 3, { jobs: [{ id: 'broken', title: 'Missing image scenario', thumbnail: '/deliberately-missing.webp', publishedDate: 'invalid', permalink: '#jobs', excerpt: 'Fallback must remain visible.' }] });
  await page.waitForFunction(() => document.querySelector('.qn-job-item img')?.dataset.qnFallback === 'true');
  await page.locator('.qn-job-item .qn-media img').evaluate(img => img.decode());
  assert.ok(await page.locator('.qn-job-item .qn-media img').evaluate(img => img.naturalWidth > 0 && img.src.endsWith('fallback.svg')));
  assert.ok((await page.locator('.qn-card-published').textContent()).includes('Đang cập nhật'));
  report.expectedImageErrors = report.consoleErrors.splice(errorCount);
  record('broken image fallback and invalid date');

  assert.deepEqual(report.consoleErrors, [], 'Unexpected browser console errors');
  record('no unexpected console errors');
  report.browserChannels = [];
  for (const channel of (process.env.QN_QA_CHANNELS || '').split(',').filter(Boolean)) {
    const channelBrowser = await chromium.launch({ channel, headless: true });
    try {
      const channelPage = await channelBrowser.newPage({ reducedMotion: 'reduce' });
      const errors = [];
      channelPage.on('pageerror', error => errors.push(error.message));
      for (const width of [1440, 390]) {
        await channelPage.setViewportSize({ width, height: 900 });
        await channelPage.goto(url, { waitUntil: 'networkidle' });
        assert.equal((await noOverflow(channelPage)).documentOverflow, false);
        await channelPage.locator('.qn-job-item > .qn-text-link').first().click();
        assert.ok(await channelPage.locator('dialog').evaluate(element => element.open));
        await channelPage.keyboard.press('Escape');
        assert.equal(await channelPage.locator('dialog').evaluate(element => element.open), false);
      }
      assert.deepEqual(errors, []);
      report.browserChannels.push({ channel, version: await channelBrowser.version(), widths: [1440, 390], status: 'passed' });
      record(`${channel} desktop/mobile browser sanity`);
    } finally { await channelBrowser.close(); }
  }
  report.status = 'passed';
  await fs.writeFile(path.join(root, '.qa', 'results.json'), JSON.stringify(report, null, 2));
  console.log(`\n${report.checks.length} checks passed. Screenshots and results: .qa/`);
})().catch(async error => {
  report.status = 'failed';
  report.failure = error.stack;
  await fs.mkdir(path.join(root, '.qa'), { recursive: true });
  await fs.writeFile(path.join(root, '.qa', 'results.json'), JSON.stringify(report, null, 2));
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  if (browser) await browser.close();
  if (server) server.kill();
});
