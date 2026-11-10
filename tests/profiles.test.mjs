import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startHarness, enter, clickAndSettle, headers } from './harness.mjs';
import { rm } from 'node:fs/promises';

async function options(h) {
  const page = await h.browser.newPage();
  await page.goto('chrome-extension://' + h.extensionId + '/options.html');
  await page.waitForSelector('#profile-name', { timeout: 2000 });
  await page.waitForFunction(() => document.querySelector('#status').dataset.ready === 'true');
  return page;
}

test('salvar disponibiliza o perfil sem aplicar; editar/excluir não muda o snapshot aplicado', { timeout: 60000 }, async () => {
  const h = await startHarness();
  try {
    const original = (await headers(h.page))['user-agent'];
    const settings = await options(h);
    await enter(settings, '#profile-name', 'Meu cenário');
    await settings.select('#profile-category', 'Mobile');
    await enter(settings, '#profile-ua', 'SavedProbe/1');
    await clickAndSettle(settings, '#save');
    assert.equal((await headers(h.page))['user-agent'], original);
    const popup = await h.popup();
    await enter(popup, '#search', 'Meu cenário');
    const id = await popup.$eval('#profiles option:not([value=""])', el => el.value);
    await popup.select('#profiles', id);
    assert.equal(await popup.$eval('#ua', el => el.value), 'SavedProbe/1');
    await clickAndSettle(popup, '#apply');
    await settings.bringToFront();
    await settings.click('[data-profile-id="' + id + '"] .profile-name');
    await enter(settings, '#profile-ua', 'SavedProbe/2');
    await clickAndSettle(settings, '#save');
    assert.equal((await headers(h.page))['user-agent'], 'SavedProbe/1');
    await settings.click('[data-profile-id="' + id + '"] .profile-name');
    await clickAndSettle(settings, '#delete');
    await clickAndSettle(settings, '#confirm-delete');
    assert.equal((await headers(h.page))['user-agent'], 'SavedProbe/1');
    await popup.bringToFront();
    await popup.waitForFunction(() => document.querySelectorAll('#profiles option[value]:not([value=""])').length === 0);
  } finally { await h.close(); }
});

test('duplicar preserva o integrado; conflitos de edição e exclusão preservam o rascunho', { timeout: 60000 }, async () => {
  const h = await startHarness();
  try {
    const first = await options(h);
    await first.click('[data-profile-id="chrome-win11"] .profile-name');
    const original = await first.$eval('#profile-ua', el => el.value);
    assert.equal(await first.$eval('#profile-ua', el => el.readOnly), true);
    assert.equal(await first.$eval('#delete', el => el.hidden), true);
    await first.click('#duplicate');
    await enter(first, '#profile-name', 'Cenário em disputa');
    await enter(first, '#profile-ua', 'Initial/1');
    await clickAndSettle(first, '#save');
    const id = await first.$eval('#list article:last-child', el => el.dataset.profileId);
    const second = await options(h);
    await second.click('[data-profile-id="' + id + '"] .profile-name');
    await enter(second, '#profile-ua', 'UnsavedDraft/2');
    await first.bringToFront();
    await enter(first, '#profile-ua', 'ConfirmedElsewhere/3');
    await clickAndSettle(first, '#save');
    await second.bringToFront();
    await second.waitForFunction(() => !document.querySelector('#conflict').hidden);
    assert.equal(await second.$eval('#save', el => el.disabled), true);
    assert.equal(await second.$eval('#profile-ua', el => el.value), 'UnsavedDraft/2');
    await second.click('[data-profile-id="' + id + '"] .profile-name');
    assert.equal(await second.$eval('#profile-ua', el => el.value), 'ConfirmedElsewhere/3');
    await first.bringToFront();
    await clickAndSettle(first, '#delete');
    await clickAndSettle(first, '#confirm-delete');
    await second.bringToFront();
    await second.waitForFunction(() => !document.querySelector('#conflict').hidden);
    assert.equal(await second.$eval('#save', el => el.disabled), true);
    await second.click('[data-profile-id="chrome-win11"] .profile-name');
    assert.equal(await second.$eval('#profile-ua', el => el.value), original);
  } finally { await h.close(); }
});

test('falha de armazenamento não declara cadastro ou exclusão concluídos', { timeout: 60000 }, async () => {
  const h = await startHarness();
  try {
    const page = await options(h);
    const target = await h.browser.waitForTarget(t => t.type() === 'service_worker' && t.url().includes(h.extensionId));
    const worker = await target.worker();
    const failNextWrite = () => {
      const original = chrome.storage.local.set;
      chrome.storage.local.set = async () => { chrome.storage.local.set = original; throw new Error('Quota indisponível induzida'); };
    };
    await enter(page, '#profile-name', 'Não salvo');
    await enter(page, '#profile-ua', 'StorageProbe/1');
    await worker.evaluate(failNextWrite);
    await clickAndSettle(page, '#save');
    assert.equal(await page.$eval('#status', el => el.classList.contains('error')), true);
    await enter(page, '#search', 'Não salvo');
    assert.equal(await page.$$eval('#list article', els => els.length), 0);
    await clickAndSettle(page, '#save');
    const id = await page.$eval('#list article', el => el.dataset.profileId);
    await worker.evaluate(failNextWrite);
    await clickAndSettle(page, '#delete');
    await clickAndSettle(page, '#confirm-delete');
    assert.equal(await page.$eval('#status', el => el.classList.contains('error')), true);
    assert.equal(await page.$eval('[data-profile-id="' + id + '"] .profile-name', el => el.textContent), 'Não salvo');
  } finally { await h.close(); }
});

test('personalizados persistem no reinício e marcação é texto inerte', { timeout: 60000 }, async () => {
  const h = await startHarness();
  const profile = h.userDataDir;
  let closed = false;
  const malicious = '<img src=x onerror="globalThis.injected=true">';
  try {
    const page = await options(h);
    await enter(page, '#profile-name', malicious);
    await enter(page, '#profile-ua', 'Persistent/1');
    await clickAndSettle(page, '#save');
    await enter(page, '#search', 'onerror');
    assert.equal(await page.$eval('#list .profile-name', el => el.textContent), malicious);
    assert.equal(await page.evaluate(() => globalThis.injected), undefined);
    assert.equal(await page.$$eval('#list img', els => els.length), 0);
    await h.close({ keepProfile: true }); closed = true;
    const restarted = await startHarness({ profile });
    try {
      const reopened = await options(restarted);
      await enter(reopened, '#search', 'onerror');
      await reopened.click('#list .profile-name');
      assert.equal(await reopened.$eval('#profile-name', el => el.value), malicious);
      assert.equal(await reopened.$eval('#profile-ua', el => el.value), 'Persistent/1');
    } finally { await restarted.close(); }
  } finally {
    if (!closed) await h.close();
    await rm(profile, { recursive: true, force: true });
  }
});
