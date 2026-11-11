import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startHarness, enter, clickAndSettle, headers } from './harness.mjs';
import { rm } from 'node:fs/promises';

test('applying a direct UA changes the next tab request without reloading', { timeout: 60000 }, async () => {
  const h = await startHarness();
  try {
    const reference = await headers(h.page);
    const navigation = h.requests.filter(r => r.path === '/').length;
    const popup = await h.popup();
    await enter(popup, '#ua', 'LocalProbe/1.0');
    await clickAndSettle(popup, '#apply');
    assert.equal((await headers(h.page))['user-agent'], 'LocalProbe/1.0');
    assert.equal(h.requests.filter(r => r.path === '/').length, navigation);
    assert.notEqual(reference['user-agent'], 'LocalProbe/1.0');
  } finally { await h.close(); }
});

test('tab isolation, navigation, resources, hints, navigator and restoration', { timeout: 60000 }, async () => {
  const h = await startHarness();
  try {
    await h.page.goto(h.secureOrigin);
    const reference = await headers(h.page, 'reference');
    const navigatorReference = await h.page.evaluate(() => ({ ua: navigator.userAgent, data: navigator.userAgentData?.toJSON() }));
    assert.ok(reference['sec-ch-ua'], 'the reference must actually send UA-CH');
    assert.ok(reference['sec-ch-ua-full-version-list'], 'the reference must send high-entropy hints');
    const other = await h.browser.newPage();
    await other.goto(h.secureOrigin);
    const popup = await h.popup();
    await enter(popup, '#ua', 'FirstTab/1.0');
    await clickAndSettle(popup, '#apply');
    assert.equal((await headers(other))['user-agent'], reference['user-agent']);
    const otherPopup = await h.popup(other);
    await enter(otherPopup, '#ua', 'SecondTab/2.0');
    await clickAndSettle(otherPopup, '#apply');
    assert.equal((await headers(h.page))['user-agent'], 'FirstTab/1.0');
    assert.equal((await headers(other))['user-agent'], 'SecondTab/2.0');
    const fresh = await h.browser.newPage();
    await fresh.goto(h.secureOrigin);
    assert.equal((await headers(fresh))['user-agent'], reference['user-agent']);
    const start = h.requests.length;
    await h.page.goto(h.origin + '/?navigation');
    await h.page.evaluate(async () => {
      await fetch('/echo?fetch');
      await new Promise(resolve => { const xhr = new XMLHttpRequest(); xhr.open('GET', '/echo?xhr'); xhr.onload = resolve; xhr.send(); });
    });
    const observed = h.requests.slice(start).filter(r => r.path === '/' || r.path === '/echo' || r.path === '/pixel.svg');
    for (const path of ['/', '/echo', '/pixel.svg']) assert.ok(observed.some(r => r.path === path));
    for (const request of observed) assert.equal(request.headers['user-agent'], 'FirstTab/1.0');
    await h.page.goto(h.secureOrigin);
    const active = await headers(h.page);
    assert.equal(active['user-agent'], 'FirstTab/1.0');
    assert.deepEqual(Object.keys(active).filter(key => key.startsWith('sec-ch-ua')), []);
    assert.deepEqual(await h.page.evaluate(() => ({ ua: navigator.userAgent, data: navigator.userAgentData?.toJSON() })), navigatorReference);
    const restoredPopup = await h.popup();
    const navigation = h.requests.filter(r => r.path === '/').length;
    await clickAndSettle(restoredPopup, '#restore');
    assert.equal(h.requests.filter(r => r.path === '/').length, navigation);
    const restored = await headers(h.page);
    assert.equal(restored['user-agent'], reference['user-agent']);
    for (const key of Object.keys(reference).filter(key => key.startsWith('sec-ch-ua'))) assert.equal(restored[key], reference[key], key);
    assert.equal((await headers(other))['user-agent'], 'SecondTab/2.0');
    await clickAndSettle(restoredPopup, '#reload');
    await h.page.waitForNavigation({ waitUntil: 'load', timeout: 3000 }).catch(() => {});
    assert.ok(h.requests.filter(r => r.path === '/').length > navigation);
  } finally { await h.close(); }
});

test('invalid input and protected destinations preserve the valid configuration', { timeout: 60000 }, async () => {
  const h = await startHarness();
  try {
    const popup = await h.popup();
    await enter(popup, '#ua', 'ToolWithoutMozilla/7');
    await clickAndSettle(popup, '#apply');
    // The UA field is a single-line input, so browsers strip line breaks before validation.
    for (const invalid of ['', '   ', 'Control\u0001Value', 'Nul\u0000Value', 'Tab\tValue']) {
      await enter(popup, '#ua', invalid);
      // CDP text insertion drops NUL before it reaches the input. Preserve it at
      // the public form boundary to exercise validation rather than CDP filtering.
      if (invalid.includes('\u0000')) await popup.$eval('#ua', (el, value) => {
        el.value = value; el.dispatchEvent(new Event('input', { bubbles: true }));
      }, invalid);
      await clickAndSettle(popup, '#apply');
      assert.equal(await popup.$eval('#status', el => el.classList.contains('error')), true, JSON.stringify(invalid));
      assert.equal((await headers(h.page))['user-agent'], 'ToolWithoutMozilla/7');
    }
    await h.page.goto('chrome://version');
    const protectedPopup = await h.popup();
    assert.equal(await protectedPopup.$eval('#apply', el => el.disabled), true);
  } finally { await h.close(); }
});

async function extensionWorker(h) {
  const target = await h.browser.waitForTarget(t => t.type() === 'service_worker' && t.url().startsWith('chrome-extension://' + h.extensionId));
  return target.worker();
}

test('reconciliation, worker resumption, tab closure and extension reload', { timeout: 60000 }, async () => {
  const h = await startHarness();
  try {
    const reference = (await headers(h.page))['user-agent'];
    let popup = await h.popup();
    await enter(popup, '#ua', 'SurvivesWorker/1');
    await clickAndSettle(popup, '#apply');
    const worker = await extensionWorker(h);
    await worker.evaluate(() => chrome.storage.session.remove('applied'));
    await popup.close();
    const stopped = new Promise(resolve => {
      const listener = target => {
        if (target.type() === 'service_worker' && target.url().includes(h.extensionId)) {
          h.browser.off('targetdestroyed', listener); resolve();
        }
      };
      h.browser.on('targetdestroyed', listener);
    });
    await worker.close();
    await stopped;
    assert.equal((await headers(h.page))['user-agent'], 'SurvivesWorker/1');
    popup = await h.popup();
    assert.equal(await popup.$eval('#ua', el => el.value), 'SurvivesWorker/1');
    assert.match(await popup.$eval('#applied', el => el.textContent), /SurvivesWorker/);
    const resumed = await extensionWorker(h);
    assert.match(await resumed.evaluate(async () => {
      const [tab] = await chrome.tabs.query({ url: 'http://127.0.0.1/*' });
      return chrome.action.getTitle({ tabId: tab.id });
    }), /^User-Agent HTTP ativo/);
    await h.page.close();
    const replacement = await h.browser.newPage();
    await replacement.goto(h.origin);
    assert.equal((await headers(replacement))['user-agent'], reference);
    popup = await h.popup(replacement);
    await enter(popup, '#ua', 'ReloadMustDiscard/1');
    await clickAndSettle(popup, '#apply');
    const previousTarget = h.browser.targets().find(t => t.type() === 'service_worker' && t.url().includes(h.extensionId));
    const reloaded = h.browser.waitForTarget(t => t.type() === 'service_worker' && t.url().includes(h.extensionId) && t !== previousTarget);
    await popup.evaluate(() => chrome.runtime.reload()).catch(() => {});
    await reloaded;
    const afterReload = await h.popup(replacement);
    assert.equal((await headers(replacement))['user-agent'], reference);
    assert.equal(await afterReload.$eval('#ua', el => el.value), '');
  } finally { await h.close(); }
});

test('rule rejection preserves state; metadata failure exposes the actual rule', { timeout: 60000 }, async () => {
  const h = await startHarness();
  try {
    const popup = await h.popup();
    await enter(popup, '#ua', 'BeforeFailure/1');
    await clickAndSettle(popup, '#apply');
    const worker = await extensionWorker(h);
    await worker.evaluate(() => {
      const original = chrome.declarativeNetRequest.updateSessionRules;
      chrome.declarativeNetRequest.updateSessionRules = async () => {
        chrome.declarativeNetRequest.updateSessionRules = original;
        throw new Error('Falha de regra induzida');
      };
    });
    await enter(popup, '#ua', 'Rejected/2');
    await clickAndSettle(popup, '#apply');
    assert.equal((await headers(h.page))['user-agent'], 'BeforeFailure/1');
    assert.equal(await popup.$eval('#status', el => el.classList.contains('error')), true);
    await worker.evaluate(() => {
      const original = chrome.storage.session.set;
      let calls = 0;
      chrome.storage.session.set = async data => {
        if (++calls === 2) { chrome.storage.session.set = original; throw new Error('Falha de metadados induzida'); }
        return original.call(chrome.storage.session, data);
      };
    });
    await enter(popup, '#ua', 'ActualAfterFailure/3');
    await clickAndSettle(popup, '#apply');
    assert.equal((await headers(h.page))['user-agent'], 'ActualAfterFailure/3');
    assert.equal(await popup.$eval('#status', el => el.classList.contains('error')), true);
    assert.match(await popup.$eval('#applied', el => el.textContent), /ActualAfterFailure\/3/);
  } finally { await h.close(); }
});

test('restarting Chrome does not restore temporary identities', { timeout: 60000 }, async () => {
  const h = await startHarness();
  const profile = h.userDataDir;
  let closed = false;
  try {
    const popup = await h.popup();
    await enter(popup, '#ua', 'NeverPersistActive/1');
    await clickAndSettle(popup, '#apply');
    await h.close({ keepProfile: true }); closed = true;
    const restarted = await startHarness({ profile });
    try {
      assert.notEqual((await headers(restarted.page))['user-agent'], 'NeverPersistActive/1');
      const reopened = await restarted.popup();
      assert.equal(await reopened.$eval('#ua', el => el.value), '');
    } finally { await restarted.close(); }
  } finally {
    if (!closed) await h.close();
    await rm(profile, { recursive: true, force: true });
  }
});

test('withheld access disables application and the active indicator but allows restoration', { timeout: 60000 }, async () => {
  const h = await startHarness();
  try {
    let popup = await h.popup();
    await enter(popup, '#ua', 'BeforeWithholding/1');
    await clickAndSettle(popup, '#apply');
    const tabId = await (await extensionWorker(h)).evaluate(async origin => (await chrome.tabs.query({})).find(tab => tab.url === origin + '/').id, h.origin);
    await popup.close();
    const manager = await h.browser.newPage();
    await manager.goto('chrome://extensions');
    await manager.evaluate(id => chrome.developerPrivate.updateExtensionConfiguration({ extensionId: id, hostAccess: 'ON_CLICK' }), h.extensionId);
    popup = await h.popup();
    assert.equal(await popup.$eval('#apply', el => el.disabled), true);
    const worker = await extensionWorker(h);
    assert.doesNotMatch(await worker.evaluate(id => chrome.action.getTitle({ tabId: id }), tabId), /ativo/);
    assert.equal(await popup.$eval('#restore', el => el.disabled), false);
    await clickAndSettle(popup, '#restore');
    const reopened = await h.popup();
    assert.equal(await reopened.$eval('#restore', el => el.disabled), true);
    assert.notEqual((await headers(h.page))['user-agent'], 'BeforeWithholding/1');
  } finally { await h.close(); }
});

test('concurrent commands complete in order and show the last confirmed UA', { timeout: 60000 }, async () => {
  const h = await startHarness();
  try {
    const first = await h.popup();
    const second = await h.popup();
    const worker = await extensionWorker(h);
    await worker.evaluate(() => {
      const original = chrome.declarativeNetRequest.updateSessionRules;
      const gate = new Promise(resolve => { globalThis.releaseRule = resolve; });
      chrome.declarativeNetRequest.updateSessionRules = async options => {
        await gate;
        chrome.declarativeNetRequest.updateSessionRules = original;
        return original(options);
      };
    });
    await first.bringToFront();
    await enter(first, '#ua', 'ConcurrentFirst/1');
    await first.click('#apply');
    await second.bringToFront();
    await enter(second, '#ua', 'ConcurrentLast/2');
    await second.click('#apply');
    await worker.evaluate(() => globalThis.releaseRule());
    await second.waitForFunction(() => document.querySelector('#status').dataset.busy === 'false');
    assert.equal((await headers(h.page))['user-agent'], 'ConcurrentLast/2');
    await first.bringToFront();
    await first.waitForFunction(() => document.querySelector('#applied').textContent.includes('ConcurrentLast/2'));
  } finally { await h.close(); }
});

test('external application and restoration refresh the visible draft status', { timeout: 60000 }, async () => {
  const h = await startHarness();
  try {
    const reference = (await headers(h.page))['user-agent'];
    const first = await h.popup();
    await enter(first, '#ua', 'ExternalState/1');
    const unappliedStatus = await first.$eval('#status', el => el.textContent);
    const second = await h.popup();
    await enter(second, '#ua', 'ExternalState/1');
    await clickAndSettle(second, '#apply');
    await first.bringToFront();
    await first.waitForFunction(() => document.querySelector('#applied').textContent.includes('ExternalState/1'));
    assert.equal((await headers(h.page))['user-agent'], 'ExternalState/1');
    assert.notEqual(await first.$eval('#status', el => el.textContent), unappliedStatus, 'a confirmed matching UA must no longer be described as an unapplied draft');
    await enter(first, '#ua', '');
    const differentDraftStatus = await first.$eval('#status', el => el.textContent);
    await second.bringToFront();
    await clickAndSettle(second, '#restore');
    await first.bringToFront();
    await first.waitForFunction(() => document.querySelector('#restore').disabled);
    assert.equal((await headers(h.page))['user-agent'], reference);
    assert.notEqual(await first.$eval('#status', el => el.textContent), differentDraftStatus, 'an empty field matching the restored original must no longer be described as a different draft');
  } finally { await h.close(); }
});
