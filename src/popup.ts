import './style.css';
import { send, validProfile, validUA } from './model';
import { byFamily, categories, familyOf, profileMeta, provenance } from './catalog-ui';
import { familyIcon, icon } from './icons';
import type { Category, CustomProfile, Profile, TabState } from './model';

type View = { kind: 'families' } | { kind: 'family'; family: string } | { kind: 'save' };

const ua = document.querySelector<HTMLTextAreaElement>('#ua')!;
const status = document.querySelector<HTMLParagraphElement>('#status')!;
const applied = document.querySelector<HTMLDivElement>('#applied')!;
const apply = document.querySelector<HTMLButtonElement>('#apply')!;
const restore = document.querySelector<HTMLButtonElement>('#restore')!;
const reload = document.querySelector<HTMLButtonElement>('#reload')!;
const search = document.querySelector<HTMLInputElement>('#search')!;
const list = document.querySelector<HTMLElement>('#profiles')!;
const scroller = document.querySelector<HTMLDivElement>('.browse-scroll')!;
const saveForm = document.querySelector<HTMLFormElement>('#save-form')!;
const saveOpen = document.querySelector<HTMLButtonElement>('#save-open')!;
const saveName = document.querySelector<HTMLInputElement>('#save-name')!;
const saveCategory = document.querySelector<HTMLSelectElement>('#save-category')!;
let current: TabState | undefined;
let profiles: Profile[] = [];
let selected: string | undefined;
let view: View = { kind: 'families' };
let busy = false;
let stateKnown = true;

function errorText(error: unknown): string { return error instanceof Error ? error.message : String(error); }
function element<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function lockList(): void {
  for (const button of list.querySelectorAll<HTMLButtonElement>('button')) button.disabled = busy;
  for (const control of saveForm.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>('input, select, button')) control.disabled = busy;
  saveOpen.disabled = busy;
}
function renderApplied(): void {
  const value = current?.applied;
  applied.dataset.state = !stateKnown ? 'unknown' : value ? 'active' : 'original';
  const text = element('span', 'identity-text');
  text.append(element('span', 'identity-label', !stateKnown ? 'Estado HTTP indisponível' : value ? 'Ativo nesta aba' : 'Navegador original'));
  text.append(element('span', 'identity-name', !stateKnown ? 'Reabra o popup para conferir a regra real.' : value ? value.name : 'Sem alteração HTTP'));
  if (stateKnown && value) { const code = element('code', 'identity-ua', value.ua); code.title = value.ua; text.append(code); }
  applied.replaceChildren(element('span', 'pulse'), text);
}
function render(): void {
  apply.disabled = busy || !current?.supported || !stateKnown;
  restore.disabled = busy || !current?.applied || !stateKnown;
  reload.disabled = busy || !current?.supported || !stateKnown;
  ua.disabled = busy;
  lockList(); renderApplied();
  status.dataset.busy = String(busy);
  status.dataset.ready = 'true';
  document.querySelector('main')!.setAttribute('aria-busy', String(busy));
}
function draft(): void {
  status.textContent = current?.reason ?? (ua.value === (current?.applied?.ua ?? '') ? (current?.applied ? 'Perfil aplicado às próximas requisições' : 'Navegador original — sem alteração HTTP') : 'Rascunho — ainda não aplicado');
  status.className = '';
}

function choose(profile: Profile): void {
  selected = profile.id; ua.value = profile.ua; saveName.value = profile.name; saveCategory.value = profile.category;
  draft(); renderList();
}
function profileRows(entries: Profile[]): HTMLUListElement {
  const rows = element('ul', 'rows');
  for (const profile of entries) {
    const item = element('li');
    const active = profile.id === selected;
    const button = element('button', 'profile-row'); button.type = 'button';
    button.dataset.profileId = profile.id; button.dataset.key = 'profile:' + profile.id;
    button.setAttribute('aria-pressed', String(active));
    const text = element('span', 'row-text');
    text.append(element('span', 'row-name', profile.name), element('span', 'row-meta', profileMeta(profile)));
    button.append(text, icon('check', 'icon row-check'));
    button.addEventListener('click', () => choose(profile));
    item.append(button);
    if (active) { const info = element('div', 'provenance'); provenance(info, profile); item.append(info); }
    rows.append(item);
  }
  return rows;
}
function familyRows(groups: [string, Profile[]][]): HTMLUListElement {
  const rows = element('ul', 'rows');
  for (const [family, entries] of groups) {
    const button = element('button', 'family-row'); button.type = 'button'; button.dataset.key = 'family:' + family;
    button.setAttribute('aria-label', family + ', ' + entries.length + (entries.length === 1 ? ' perfil' : ' perfis'));
    if (entries.some(profile => profile.id === selected)) button.dataset.current = 'true';
    const tile = element('span', 'tile'); tile.append(familyIcon(family));
    button.append(tile, element('span', 'row-name', family), element('span', 'count', String(entries.length)), icon('chevron', 'icon chevron'));
    button.addEventListener('click', () => { view = { kind: 'family', family }; renderList('back'); scroller.scrollTop = 0; });
    const item = element('li'); item.append(button); rows.append(item);
  }
  return rows;
}
function renderList(focusKey = (document.activeElement as HTMLElement | null)?.dataset?.key): void {
  const saving = view.kind === 'save';
  saveForm.hidden = !saving; list.hidden = saving; saveOpen.hidden = saving;
  list.replaceChildren();
  const query = search.value.trim();
  const groups = byFamily(profiles, query);
  if (view.kind === 'family' && !query) {
    const family = view.family;
    const entries = groups.find(([name]) => name === family)?.[1];
    if (!entries) view = { kind: 'families' };
    else {
      const back = element('button', 'list-back'); back.type = 'button'; back.dataset.key = 'back';
      back.setAttribute('aria-label', 'Voltar às famílias; ' + family + ' aberta');
      const tile = element('span', 'tile'); tile.append(familyIcon(family));
      back.append(icon('back'), tile, element('span', 'row-name', family), element('span', 'count', String(entries.length)));
      back.addEventListener('click', () => { view = { kind: 'families' }; renderList('family:' + family); });
      list.append(back);
      for (const category of categories) {
        const inCategory = entries.filter(profile => profile.category === category);
        if (!inCategory.length) continue;
        if (entries.length !== inCategory.length) list.append(element('h2', 'group-title', category));
        list.append(profileRows(inCategory));
      }
    }
  }
  if (view.kind === 'families' && !query) list.append(familyRows(groups));
  if (!saving && query) {
    for (const [family, entries] of groups) {
      const title = element('h2', 'group-title'); title.append(familyIcon(family, 'icon small'), family);
      list.append(title, profileRows(entries));
    }
    if (!groups.length) list.append(element('p', 'empty', 'Nenhum perfil encontrado. Ajuste a busca ou cole um User-Agent abaixo.'));
  }
  lockList();
  if (focusKey) list.querySelector<HTMLElement>('[data-key="' + CSS.escape(focusKey) + '"]')?.focus();
}
async function refreshCatalog(): Promise<void> {
  profiles = await send<Profile[]>({ type: 'catalog' });
  const profile = profiles.find(profile => profile.id === selected);
  if (!profile || profile.ua !== ua.value) selected = undefined;
  renderList();
}
async function operation(action: () => Promise<void>, note: string): Promise<void> {
  if (busy) return;
  busy = true; status.textContent = 'Operação em andamento…'; status.className = ''; render();
  try { await action(); status.textContent = note; status.className = 'success'; }
  catch (error) {
    status.textContent = errorText(error); status.className = 'error';
    if (current) {
      try { current = await send<TabState>({ type: 'state', tabId: current.tabId }); stateKnown = true; }
      catch { stateKnown = false; }
    }
  } finally { busy = false; render(); }
}
apply.addEventListener('click', () => { void operation(async () => {
  const value = validUA(ua.value);
  current = await send<TabState>({ type: 'apply', tabId: current!.tabId, ua: value, profileId: selected });
  ua.value = value; stateKnown = true;
}, 'Regra confirmada. Próximas requisições usarão este UA; recarregar é opcional.'); });
restore.addEventListener('click', () => { void operation(async () => {
  current = await send<TabState>({ type: 'restore', tabId: current!.tabId }); stateKnown = true;
}, 'Restaurado. Próximas requisições usarão o navegador original; recarregar é opcional.'); });
reload.addEventListener('click', () => { void operation(async () => {
  await chrome.tabs.reload(current!.tabId);
}, 'Recarregamento solicitado explicitamente.'); });
ua.addEventListener('input', () => { if (selected) { selected = undefined; renderList(); } draft(); });
search.addEventListener('input', () => { if (view.kind === 'save') view = { kind: 'families' }; renderList(); scroller.scrollTop = 0; });
saveOpen.addEventListener('click', () => { view = { kind: 'save' }; renderList(); saveName.focus(); });
document.querySelector('#save-back')!.addEventListener('click', () => { view = { kind: 'families' }; renderList(); saveOpen.focus(); });
saveForm.addEventListener('submit', event => {
  event.preventDefault();
  void operation(async () => {
    const profile = validProfile({ name: saveName.value, category: saveCategory.value as Category, ua: ua.value });
    const saved = await send<CustomProfile>({ type: 'create', profile });
    selected = saved.id; search.value = ''; view = { kind: 'family', family: 'Personalizados' };
    await refreshCatalog();
  }, 'Perfil salvo neste navegador. A aba não foi alterada.');
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.customCatalog) void refreshCatalog().catch(error => { status.textContent = errorText(error); status.className = 'error'; });
  if (area === 'session' && changes.applied && current && !busy) {
    void send<TabState>({ type: 'state', tabId: current.tabId }).then(value => {
      if (busy) return;
      current = value; stateKnown = true; draft(); render();
    }, error => {
      if (busy) return;
      stateKnown = false; status.textContent = errorText(error); status.className = 'error'; render();
    });
  }
});
async function init(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined) throw new Error('Nenhuma aba disponível. Abra uma página HTTP/HTTPS.');
  current = await send<TabState>({ type: 'state', tabId: tab.id });
  ua.value = current.applied?.ua ?? ''; selected = current.applied?.profileId;
  await refreshCatalog();
  const profile = profiles.find(profile => profile.id === selected);
  if (profile) { view = { kind: 'family', family: familyOf(profile) }; renderList(); }
  draft(); render();
  list.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: 'nearest' });
}
void init().catch(error => { stateKnown = false; status.textContent = errorText(error); status.className = 'error'; render(); });
