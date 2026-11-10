import { validUA } from './model';
import type { Applied, Command, Response, TabState } from './model';

const hints = ['Sec-CH-UA', 'Sec-CH-UA-Mobile', 'Sec-CH-UA-Platform', 'Sec-CH-UA-Full-Version', 'Sec-CH-UA-Full-Version-List', 'Sec-CH-UA-Platform-Version', 'Sec-CH-UA-Arch', 'Sec-CH-UA-Bitness', 'Sec-CH-UA-Model', 'Sec-CH-UA-WoW64', 'Sec-CH-UA-Form-Factors'];
let snapshots: Record<string, Applied> = {};
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(action: () => Promise<T>): Promise<T> {
  const result = queue.then(action);
  queue = result.catch(() => undefined);
  return result;
}
function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
async function indicator(tabId: number, applied: Applied | null, supported = true): Promise<void> {
  await chrome.action.setBadgeText({ tabId, text: applied && supported ? 'UA' : '' });
  await chrome.action.setBadgeBackgroundColor({ tabId, color: '#275DC7' });
  await chrome.action.setTitle({ tabId, title: applied && supported ? 'User-Agent HTTP ativo: ' + applied.name : 'User-Agent Local — navegador original ou destino não suportado' });
}
async function reconcile(): Promise<void> {
  const [installedRules, tabs, data] = await Promise.all([chrome.declarativeNetRequest.getSessionRules(), chrome.tabs.query({}), chrome.storage.session.get(['applied', 'epoch'])]);
  let rules = installedRules;
  if (!data.epoch) {
    await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: rules.map(rule => rule.id) });
    await chrome.storage.session.set({ epoch: crypto.randomUUID(), applied: {} });
    rules = [];
  }
  const existing = new Map(tabs.map(tab => [tab.id, tab]));
  const previous = (data.applied ?? {}) as Record<string, Applied>;
  const next: Record<string, Applied> = {};
  const orphaned: number[] = [];
  for (const rule of rules) {
    const tabId = rule.condition.tabIds?.[0];
    const ua = rule.action.requestHeaders?.find(header => header.header.toLowerCase() === 'user-agent' && header.operation === 'set')?.value;
    if (tabId === undefined || !existing.has(tabId) || !ua) { orphaned.push(rule.id); continue; }
    next[tabId] = previous[tabId]?.ua === ua ? previous[tabId] : { ua, name: 'Personalizado aplicado' };
  }
  if (orphaned.length) await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: orphaned });
  snapshots = next;
  await chrome.storage.session.set({ applied: snapshots });
  for (const tab of tabs) {
    if (tab.id !== undefined) await indicator(tab.id, snapshots[tab.id] ?? null, allowedURL(tab.url));
  }
}
function allowedURL(url?: string): boolean {
  if (!url) return false;
  const parsed = new URL(url);
  return ['http:', 'https:'].includes(parsed.protocol) && parsed.hostname !== 'chromewebstore.google.com' && !(parsed.hostname === 'chrome.google.com' && parsed.pathname.startsWith('/webstore'));
}
async function state(tabId: number): Promise<TabState> {
  const tab = await chrome.tabs.get(tabId);
  let reason: string | undefined;
  if (!allowedURL(tab.url)) reason = 'Esta página é protegida ou não usa HTTP/HTTPS. Abra uma página web permitida.';
  else if (!await chrome.permissions.contains({ origins: [new URL(tab.url!).origin + '/*'] })) reason = 'Acesso ao site não disponível. Confira o acesso a sites nas configurações da extensão e tente novamente.';
  return { tabId, supported: !reason, reason, applied: snapshots[tabId] ?? null };
}
async function apply(tabId: number, raw: unknown): Promise<TabState> {
  const ua = validUA(raw);
  const current = await state(tabId);
  if (!current.supported) throw new Error(current.reason);
  const rules = await chrome.declarativeNetRequest.getSessionRules();
  const removeRuleIds = rules.filter(rule => rule.condition.tabIds?.includes(tabId)).map(rule => rule.id);
  await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds, addRules: [{
    id: tabId + 1, priority: 1,
    action: { type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS, requestHeaders: [
      { header: 'User-Agent', operation: chrome.declarativeNetRequest.HeaderOperation.SET, value: ua },
      ...hints.map(header => ({ header, operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE })),
    ] },
    condition: { tabIds: [tabId], regexFilter: '^https?://', resourceTypes: Object.values(chrome.declarativeNetRequest.ResourceType) },
  }] });
  snapshots[tabId] = { ua, name: 'Personalizado aplicado' };
  try {
    await chrome.storage.session.set({ applied: snapshots });
    await indicator(tabId, snapshots[tabId]);
  } catch (error) {
    await reconcile().catch(() => undefined);
    throw new Error('A regra foi configurada, mas os metadados ou indicador falharam. Reabra para consultar o estado real. ' + message(error));
  }
  return state(tabId);
}
async function restore(tabId: number): Promise<TabState> {
  const rules = await chrome.declarativeNetRequest.getSessionRules();
  await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: rules.filter(rule => rule.condition.tabIds?.includes(tabId)).map(rule => rule.id) });
  delete snapshots[tabId];
  await chrome.storage.session.set({ applied: snapshots });
  await indicator(tabId, null);
  return state(tabId);
}
function parse(input: unknown): Command {
  if (!input || typeof input !== 'object') throw new Error('Comando inválido.');
  const data = input as Record<string, unknown>;
  if (!Number.isInteger(data.tabId) || (data.tabId as number) < 0) throw new Error('Aba inválida.');
  switch (data.type) {
    case 'state': return { type: 'state', tabId: data.tabId as number };
    case 'restore': return { type: 'restore', tabId: data.tabId as number };
    case 'apply': return { type: 'apply', tabId: data.tabId as number, ua: validUA(data.ua) };
    default: throw new Error('Comando desconhecido.');
  }
}
async function execute(command: Command): Promise<unknown> {
  await reconcile();
  switch (command.type) {
    case 'state': return state(command.tabId);
    case 'apply': return apply(command.tabId, command.ua);
    case 'restore': return restore(command.tabId);
    default: { const exhaustive: never = command; throw new Error(String(exhaustive)); }
  }
}
chrome.runtime.onMessage.addListener((input: unknown, sender, reply: (response: Response<unknown>) => void) => {
  if (sender.id !== chrome.runtime.id || !sender.url?.startsWith(chrome.runtime.getURL('')) || !['popup.html', 'options.html'].includes(new URL(sender.url).pathname.slice(1))) {
    reply({ ok: false, error: 'Remetente não autorizado.' }); return false;
  }
  serial(() => execute(parse(input))).then(value => reply({ ok: true, value }), error => reply({ ok: false, error: message(error) + ' Confira as permissões e tente novamente.' }));
  return true;
});
async function clear(): Promise<void> {
  const rules = await chrome.declarativeNetRequest.getSessionRules();
  await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: rules.map(rule => rule.id) });
  snapshots = {};
  await chrome.storage.session.set({ applied: {} });
  for (const tab of await chrome.tabs.query({})) if (tab.id !== undefined) await indicator(tab.id, null);
}
async function discard(tabId: number): Promise<void> {
  const rules = await chrome.declarativeNetRequest.getSessionRules();
  await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: rules.filter(rule => rule.condition.tabIds?.includes(tabId)).map(rule => rule.id) });
  delete snapshots[tabId];
  await chrome.storage.session.set({ applied: snapshots });
}
const report = (error: unknown) => console.error(message(error));
chrome.runtime.onInstalled.addListener(() => { void serial(clear).catch(report); });
chrome.runtime.onStartup.addListener(() => { void serial(clear).catch(report); });
chrome.tabs.onRemoved.addListener(tabId => { void serial(() => discard(tabId)).catch(report); });
chrome.tabs.onReplaced.addListener((_added, removed) => { void serial(() => discard(removed)).catch(report); });
chrome.tabs.onUpdated.addListener((tabId, change) => {
  if (change.status === 'loading' || change.url) void serial(async () => {
    const current = await state(tabId);
    await indicator(tabId, current.applied, current.supported);
  }).catch(report);
});
void serial(reconcile).catch(report);
