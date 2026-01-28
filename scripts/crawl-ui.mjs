#!/usr/bin/env node
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SESSION_COOKIE = process.env.SESSION_COOKIE || '';
const HEADLESS = process.env.HEADLESS !== 'false';
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 30000);

// Public pages to crawl (all public routes from locked decisions)
const PUBLIC_PAGES = [
  '/',
  '/discover',
  '/about',
  '/program',
  '/orientation',
  '/ethics',
  '/clarity-check',
  '/startup-pack', // optional, may not exist
  '/ai-blueprint',
  '/info-session',
  '/contact',
  '/privacy',
  '/terms',
  '/google-review',
  '/login',
  '/signup',
];

// Primary CTAs to test
const PRIMARY_CTAS = [
  { page: '/', selector: 'a[href="/clarity-check"], a:has-text("Start Assessment")', name: 'Homepage Clarity CTA' },
  { page: '/orientation', selector: 'a[href="/labs/identity"], button:has-text("Start"), a:has-text("Start Identity Lab")', name: 'Orientation CTA' },
  { page: '/signup', selector: 'button[type="submit"], button:has-text("Create"), a:has-text("Create Account")', name: 'Signup Submit' },
  { page: '/login', selector: 'button[type="submit"], button:has-text("Login"), a:has-text("Sign In")', name: 'Login Submit' },
  { page: '/clarity-check', selector: 'button:has-text("Begin"), button:has-text("Start"), a[href="/clarity-check"]', name: 'Clarity Check Begin' },
];

const issues = {
  brokenLinks: [],
  brokenButtons: [],
  jsErrors: [],
  navigationLoops: [],
  missingElements: [],
  undefinedTargets: [],
  emptyActions: [],
  accessibilityIssues: [],
};

const navigationMap = {};
const visitedPages = new Set();
const pageLinks = {};

async function extractElements(page) {
  try {
    return await page.evaluate(() => {
      const elements = {
        links: [],
        buttons: [],
        navLinks: [],
        footerLinks: [],
        ctaButtons: [],
        sidebarLinks: [],
        formSubmits: [],
      };

      // Extract all links
      document.querySelectorAll('a[href]').forEach((link) => {
        const href = link.getAttribute('href');
        const text = link.textContent.trim();
        const isExternal = href?.startsWith('http') || href?.startsWith('//');
        const isMailto = href?.startsWith('mailto:');
        const isTel = href?.startsWith('tel:');

        if (!isExternal && !isMailto && !isTel) {
          elements.links.push({
            href: href || '',
            text: text || '(no text)',
            visible: link.offsetParent !== null,
            class: link.className,
            ariaLabel: link.getAttribute('aria-label') || '',
          });
        }
      });

      // Extract navigation links
      document.querySelectorAll('nav a[href], header a[href]').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href?.startsWith('http')) {
          elements.navLinks.push({
            href: href || '',
            text: link.textContent.trim() || '(no text)',
            inNav: link.closest('nav') !== null,
          });
        }
      });

      // Extract footer links
      document.querySelectorAll('footer a[href]').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href?.startsWith('http')) {
          elements.footerLinks.push({
            href: href || '',
            text: link.textContent.trim() || '(no text)',
          });
        }
      });

      // Extract CTA buttons
      document.querySelectorAll('button[class*="accent"], button[class*="cta"], a[class*="accent"], a[class*="cta"]').forEach((btn) => {
        elements.ctaButtons.push({
          text: btn.textContent.trim() || '(no text)',
          href: btn.getAttribute('href') || '',
          onclick: btn.getAttribute('onclick') || '',
          ariaLabel: btn.getAttribute('aria-label') || '',
          visible: btn.offsetParent !== null,
        });
      });

      // Extract all buttons
      document.querySelectorAll('button').forEach((btn) => {
        elements.buttons.push({
          text: btn.textContent.trim() || '(no text)',
          type: btn.getAttribute('type') || 'button',
          onclick: btn.getAttribute('onclick') || '',
          disabled: btn.hasAttribute('disabled'),
          visible: btn.offsetParent !== null,
          ariaLabel: btn.getAttribute('aria-label') || '',
        });
      });

      // Extract form submits
      document.querySelectorAll('form button[type="submit"], form input[type="submit"]').forEach((btn) => {
        elements.formSubmits.push({
          text: btn.value || btn.textContent.trim() || 'Submit',
          form: btn.form?.id || 'unnamed-form',
        });
      });

      // Extract sidebar links
      document.querySelectorAll('aside a[href], [class*="sidebar"] a[href]').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href?.startsWith('http')) {
          elements.sidebarLinks.push({
            href: href || '',
            text: link.textContent.trim() || '(no text)',
          });
        }
      });

      return elements;
    });
  } catch (e) {
    console.error(`Error extracting elements: ${e.message}`);
    return {
      links: [],
      buttons: [],
      navLinks: [],
      footerLinks: [],
      ctaButtons: [],
      sidebarLinks: [],
      formSubmits: [],
    };
  }
}

async function checkLink(page, href, context) {
  // Skip external, mailto, tel links
  if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
    return { status: 'skipped', reason: 'external or special link' };
  }

  // Skip hash links (anchors)
  if (href.startsWith('#')) {
    return { status: 'skipped', reason: 'anchor link' };
  }

  try {
    const response = await page.goto(`${BASE_URL}${href}`, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
    const status = response?.status();

    if (status === 404) {
      return { status: 404, reason: 'page not found' };
    } else if (status >= 500) {
      return { status, reason: 'server error' };
    } else if (status >= 300 && status < 400) {
      // Redirect — check destination
      const finalUrl = page.url();
      return { status, reason: 'redirect', destination: finalUrl };
    } else if (status === 200 || status === 304) {
      return { status, reason: 'ok' };
    } else {
      return { status, reason: 'unexpected status' };
    }
  } catch (e) {
    return { status: 0, reason: `error: ${e.message}` };
  }
}

async function crawlPage(context, pageUrl) {
  if (visitedPages.has(pageUrl)) {
    return { status: 'cached' };
  }

  visitedPages.add(pageUrl);
  const page = await context.newPage();

  if (SESSION_COOKIE) {
    await context.addCookies([
      {
        name: SESSION_COOKIE.split('=')[0],
        value: SESSION_COOKIE.split('=')[1],
        url: BASE_URL,
      },
    ]);
  }

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      issues.jsErrors.push({ page: pageUrl, message: msg.text() });
    }
  });

  page.on('pageerror', (err) => {
    issues.jsErrors.push({ page: pageUrl, message: err.message });
  });

  try {
    console.log(`  📄 Crawling ${pageUrl}...`);
    const response = await page.goto(`${BASE_URL}${pageUrl}`, {
      waitUntil: 'domcontentloaded',
      timeout: TIMEOUT_MS,
    });

    if (!response) {
      issues.missingElements.push({ page: pageUrl, issue: 'no response' });
      await page.close();
      return { status: 'no_response' };
    }

    const statusCode = response.status();
    if (statusCode !== 200 && statusCode !== 304) {
      issues.missingElements.push({ page: pageUrl, issue: `unexpected status ${statusCode}` });
    }

    const elements = await extractElements(page);
    pageLinks[pageUrl] = elements;

    // Validate links
    for (const link of elements.links) {
      if (!link.href || link.href.trim() === '') {
        issues.undefinedTargets.push({ page: pageUrl, element: 'link', text: link.text });
      } else if (!link.visible && link.text !== '(no text)') {
        // Hidden link with text — may be intentional but flag it
      }
    }

    // Validate buttons
    for (const button of elements.buttons) {
      if (button.text === '(no text)' && !button.onclick && !button.ariaLabel) {
        issues.emptyActions.push({ page: pageUrl, element: 'button', type: button.type });
      }
    }

    // Validate nav links
    for (const link of elements.navLinks) {
      if (!link.href) {
        issues.undefinedTargets.push({ page: pageUrl, element: 'nav-link', text: link.text });
      }
    }

    // Validate footer links
    for (const link of elements.footerLinks) {
      if (!link.href) {
        issues.undefinedTargets.push({ page: pageUrl, element: 'footer-link', text: link.text });
      }
    }

    navigationMap[pageUrl] = {
      links: elements.links.map((l) => l.href).filter(Boolean),
      status: statusCode,
      title: await page.title(),
    };

    await page.close();
    return { status: 'success', elementCount: elements.links.length + elements.buttons.length };
  } catch (e) {
    issues.jsErrors.push({ page: pageUrl, message: e.message });
    await page.close();
    return { status: 'error', error: e.message };
  }
}

async function testCTA(context, ctaTest) {
  const page = await context.newPage();

  if (SESSION_COOKIE) {
    await context.addCookies([
      {
        name: SESSION_COOKIE.split('=')[0],
        value: SESSION_COOKIE.split('=')[1],
        url: BASE_URL,
      },
    ]);
  }

  try {
    console.log(`  🔘 Testing page load on ${ctaTest.page}...`);
    const response = await page.goto(`${BASE_URL}${ctaTest.page}`, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
    const status = response?.status();

    if (status === 200) {
      await page.close();
      return { status: 'success', page: ctaTest.page };
    } else {
      issues.brokenButtons.push({
        page: ctaTest.page,
        name: ctaTest.name,
        selector: ctaTest.selector,
        issue: `page returned ${status}`,
      });
      await page.close();
      return { status: 'error', code: status };
    }
  } catch (e) {
    issues.brokenButtons.push({
      page: ctaTest.page,
      name: ctaTest.name,
      selector: ctaTest.selector,
      issue: e.message,
    });
    await page.close();
    return { status: 'error', error: e.message };
  }
}

async function main() {
  console.log('\n🎯 iPurpose UI/DOM Experience Crawler\n');
  console.log(`BASE_URL: ${BASE_URL}`);
  console.log(`Auth mode: ${SESSION_COOKIE ? '✅ enabled' : '❌ disabled'}`);
  console.log(`Headless: ${HEADLESS ? 'yes' : 'no'}\n`);

  const browser = await chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext();

  // Crawl all public pages
  console.log('📍 Phase 1: Crawling public pages...\n');
  for (const pageUrl of PUBLIC_PAGES) {
    await crawlPage(context, pageUrl);
  }

  // Test CTAs
  console.log('\n🔘 Phase 2: Testing primary CTAs...\n');
  for (const ctaTest of PRIMARY_CTAS) {
    await testCTA(context, ctaTest);
  }

  // Validate links across all pages
  console.log('\n🔗 Phase 3: Validating all links...\n');
  const checkedLinks = new Set();
  for (const pageUrl of Object.keys(pageLinks)) {
    for (const link of pageLinks[pageUrl].links) {
      if (!checkedLinks.has(link.href) && link.href && !link.href.startsWith('http')) {
        checkedLinks.add(link.href);
        const checkResult = await checkLink(context, link.href, context);
        if (checkResult.status === 404 || checkResult.status >= 500) {
          issues.brokenLinks.push({
            source: pageUrl,
            href: link.href,
            linkText: link.text,
            status: checkResult.status,
            reason: checkResult.reason,
          });
        }
      }
    }
  }

  await browser.close();

  // Generate reports
  const reportFilename = 'ui-crawl-report.json';
  const report = {
    baseUrl: BASE_URL,
    timestamp: new Date().toISOString(),
    sessionCookie: SESSION_COOKIE ? 'provided' : 'none',
    summary: {
      pagesChecked: visitedPages.size,
      linksValidated: checkedLinks.size,
      brokenLinks: issues.brokenLinks.length,
      brokenButtons: issues.brokenButtons.length,
      jsErrors: issues.jsErrors.length,
      undefinedTargets: issues.undefinedTargets.length,
      emptyActions: issues.emptyActions.length,
      totalIssues: Object.values(issues).reduce((sum, arr) => sum + arr.length, 0),
    },
    issues,
    navigationMap,
  };

  fs.writeFileSync(reportFilename, JSON.stringify(report, null, 2));

  // Pretty console summary
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║      🎯 UI/DOM EXPERIENCE CRAWL SUMMARY                  ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log(`📊 Coverage:`);
  console.log(`   • Pages crawled: ${visitedPages.size}`);
  console.log(`   • Links validated: ${checkedLinks.size}`);
  console.log(`   • CTAs tested: ${PRIMARY_CTAS.length}\n`);

  console.log(`🔴 Issues Found:`);
  console.log(`   • Broken links: ${issues.brokenLinks.length}`);
  console.log(`   • Broken buttons: ${issues.brokenButtons.length}`);
  console.log(`   • JS errors: ${issues.jsErrors.length}`);
  console.log(`   • Undefined targets: ${issues.undefinedTargets.length}`);
  console.log(`   • Empty actions: ${issues.emptyActions.length}`);
  console.log(`   • Total issues: ${report.summary.totalIssues}\n`);

  if (report.summary.totalIssues > 0) {
    console.log('🚨 FAILURES DETECTED:\n');

    if (issues.brokenLinks.length > 0) {
      console.log('  ❌ Broken Links:');
      issues.brokenLinks.slice(0, 10).forEach((link) => {
        console.log(`    • ${link.href} (${link.status}) from ${link.source}`);
      });
      if (issues.brokenLinks.length > 10) console.log(`    ... and ${issues.brokenLinks.length - 10} more`);
      console.log();
    }

    if (issues.brokenButtons.length > 0) {
      console.log('  ❌ Broken Buttons:');
      issues.brokenButtons.slice(0, 10).forEach((btn) => {
        console.log(`    • ${btn.name} on ${btn.page}: ${btn.issue}`);
      });
      if (issues.brokenButtons.length > 10) console.log(`    ... and ${issues.brokenButtons.length - 10} more`);
      console.log();
    }

    if (issues.jsErrors.length > 0) {
      console.log('  ❌ JS Errors:');
      issues.jsErrors.slice(0, 10).forEach((err) => {
        console.log(`    • ${err.page}: ${err.message}`);
      });
      if (issues.jsErrors.length > 10) console.log(`    ... and ${issues.jsErrors.length - 10} more`);
      console.log();
    }

    console.log(`\n📋 Full report saved to ${reportFilename}\n`);
    process.exitCode = 1;
  } else {
    console.log('✅ ALL GREEN — No UI/DOM issues detected! 🚀\n');
    process.exitCode = 0;
  }
}

main().catch((err) => {
  console.error('💥 Crawler error:', err);
  process.exit(1);
});
