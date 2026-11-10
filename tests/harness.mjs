import puppeteer from 'puppeteer-core';
import { createServer } from 'node:http';
import { createServer as createSecureServer } from 'node:https';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { generate } from 'selfsigned';

export async function startHarness({ headless = true, profile } = {}) {
  const requests = [];
  const handler = (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    requests.push({ path: url.pathname, query: url.search, headers: req.headers });
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Accept-CH', 'Sec-CH-UA-Full-Version, Sec-CH-UA-Full-Version-List, Sec-CH-UA-Platform-Version, Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Model, Sec-CH-UA-WoW64, Sec-CH-UA-Form-Factors');
    if (url.pathname === '/echo') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(req.headers));
    } else if (url.pathname === '/pixel.svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.end('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>');
    } else {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end('<!doctype html><html lang="pt-BR"><title>Eco local de User-Agent</title><h1>Eco local</h1><p>Origem isolada, sem cache ou service worker.</p><button id="request">Consultar cabeçalhos</button><pre id="result"></pre><iframe title="Eco iframe" src="/echo?iframe"></iframe><img alt="" src="/pixel.svg"><script>document.querySelector("button").onclick=async()=>document.querySelector("pre").textContent=JSON.stringify(await(await fetch("/echo?button")).json(),null,2)</script></html>');
    }
  };
  const cert = await generate([{ name: 'commonName', value: 'localhost' }], { extensions: [{ name: 'subjectAltName', altNames: [{ type: 2, value: 'localhost' }, { type: 7, ip: '127.0.0.1' }] }] });
  const http = createServer(handler);
  const https = createSecureServer({ key: cert.private, cert: cert.cert }, handler);
  await Promise.all([new Promise(r => http.listen(0, '127.0.0.1', r)), new Promise(r => https.listen(0, '127.0.0.1', r))]);
  const userDataDir = profile ?? await mkdtemp(join(tmpdir(), 'ua-extension-'));
  let browser;
  try {
    browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless, userDataDir, enableExtensions: true, args: ['--enable-unsafe-extension-debugging', '--ignore-certificate-errors', '--no-first-run', '--no-default-browser-check'] });
    // Developer mode is required for unpacked reloads. This touches only the
    // disposable integration profile, never the user's Chrome configuration.
    const manager = await browser.newPage();
    await manager.goto('chrome://extensions');
    await manager.evaluate(() => chrome.developerPrivate.updateProfileConfiguration({ inDeveloperMode: true }));
    await manager.close();
    const extensionId = await browser.installExtension(resolve('dist'));
    const origin = 'http://127.0.0.1:' + http.address().port;
    const secureOrigin = 'https://127.0.0.1:' + https.address().port;
    const page = await browser.newPage();
    await page.goto(origin);
    async function popup(target = page) {
      await target.bringToFront();
      // Creating a background target preserves the inspected site's active tab.
      const session = await browser.target().createCDPSession();
      const { targetId } = await session.send('Target.createTarget', { url: 'chrome-extension://' + extensionId + '/popup.html', background: true });
      const targetHandle = await browser.waitForTarget(t => t._targetId === targetId);
      const view = await targetHandle.page();
      await view.waitForSelector('#apply');
      await view.waitForFunction(() => document.querySelector('#status').dataset.ready === 'true', { polling: 50 }).catch(async error => {
        throw new Error(error.message + ': ' + await view.$eval('#status', el => el.outerHTML) + ' Targets: ' + JSON.stringify(browser.targets().map(t => ({ type: t.type(), url: t.url() }))));
      });
      await view.bringToFront();
      return view;
    }
    return { browser, page, origin, secureOrigin, requests, extensionId, popup, userDataDir, async close({ keepProfile = false } = {}) {
      await browser.close();
      await Promise.all([new Promise(r => http.close(r)), new Promise(r => https.close(r))]);
      if (!keepProfile && !profile) await rm(userDataDir, { recursive: true, force: true });
    } };
  } catch (error) {
    if (browser) await browser.close();
    await Promise.all([new Promise(r => http.close(r)), new Promise(r => https.close(r))]);
    if (!profile) await rm(userDataDir, { recursive: true, force: true });
    throw error;
  }
}

export async function enter(page, selector, value) {
  await page.locator(selector).fill(value);
}
export async function clickAndSettle(page, selector) {
  await page.click(selector);
  await page.waitForFunction(() => document.querySelector('#status').dataset.busy !== 'true');
}
export async function headers(page, query = '') {
  return page.evaluate(async q => (await fetch('/echo?' + q)).json(), query);
}
