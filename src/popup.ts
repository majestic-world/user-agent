import './style.css';
import { send, validProfile, validUA } from './model';
import { populate, provenance } from './catalog-ui';
import type { Category, CustomProfile, Profile, TabState } from './model';

const ua = document.querySelector<HTMLTextAreaElement>('#ua')!;
const status = document.querySelector<HTMLParagraphElement>('#status')!;
const applied = document.querySelector<HTMLParagraphElement>('#applied')!;
const apply = document.querySelector<HTMLButtonElement>('#apply')!;
const restore = document.querySelector<HTMLButtonElement>('#restore')!;
const reload = document.querySelector<HTMLButtonElement>('#reload')!;
const search = document.querySelector<HTMLInputElement>('#search')!;
const select = document.querySelector<HTMLSelectElement>('#profiles')!;
const info = document.querySelector<HTMLDivElement>('#profile-info')!;
const save = document.querySelector<HTMLButtonElement>('#save')!;
const saveName = document.querySelector<HTMLInputElement>('#save-name')!;
const saveCategory = document.querySelector<HTMLSelectElement>('#save-category')!;
let current: TabState | undefined;
let profiles: Profile[] = [];
let selected: string | undefined;
let busy = false;
let stateKnown = true;

function errorText(error: unknown): string { return error instanceof Error ? error.message : String(error); }
function render(): void {
  apply.disabled = busy || !current?.supported || !stateKnown;
  restore.disabled = busy || !current?.applied || !stateKnown;
  reload.disabled = busy || !current?.supported || !stateKnown;
  save.disabled = busy;
  select.disabled = busy; ua.disabled = busy;
  applied.textContent = !stateKnown ? 'Estado HTTP indisponível. Reabra o popup para conferir a regra real.' : current?.applied ? 'Configurado: ' + current.applied.name + ' — ' + current.applied.ua : 'Navegador original';
  status.dataset.busy = String(busy);
  status.dataset.ready = 'true';
  document.querySelector('main')!.setAttribute('aria-busy', String(busy));
}
function draft(): void {
  status.textContent = current?.reason ?? (ua.value === (current?.applied?.ua ?? '') ? (current?.applied ? 'Perfil aplicado às próximas requisições' : 'Navegador original — sem alteração HTTP') : 'Rascunho — ainda não aplicado');
  status.className = '';
}
async function refreshCatalog(): Promise<void> {
  profiles = await send<Profile[]>({ type: 'catalog' });
  const profile = profiles.find(profile => profile.id === selected);
  if (!profile || profile.ua !== ua.value) selected = undefined;
  populate(select, profiles, search.value, selected);
  provenance(info, profiles.find(profile => profile.id === selected));
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
ua.addEventListener('input', () => { selected = undefined; select.value = ''; provenance(info); draft(); });
search.addEventListener('input', () => { populate(select, profiles, search.value, selected); });
select.addEventListener('change', () => {
  const profile = profiles.find(profile => profile.id === select.value);
  selected = profile?.id;
  if (profile) { ua.value = profile.ua; saveName.value = profile.name; saveCategory.value = profile.category; }
  provenance(info, profile); draft();
});
document.querySelector('#save-form')!.addEventListener('submit', event => {
  event.preventDefault();
  void operation(async () => {
    const profile = validProfile({ name: saveName.value, category: saveCategory.value as Category, ua: ua.value });
    const saved = await send<CustomProfile>({ type: 'create', profile });
    selected = saved.id; search.value = ''; await refreshCatalog();
    document.querySelector<HTMLDetailsElement>('#save-panel')!.open = false;
  }, 'Perfil salvo neste navegador. A aba não foi alterada.');
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.customCatalog) void refreshCatalog().catch(error => { status.textContent = errorText(error); status.className = 'error'; });
  if (area === 'session' && changes.applied && current && !busy) {
    void send<TabState>({ type: 'state', tabId: current.tabId }).then(value => { current = value; stateKnown = true; render(); }, () => { stateKnown = false; render(); });
  }
});
async function init(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined) throw new Error('Nenhuma aba disponível. Abra uma página HTTP/HTTPS.');
  current = await send<TabState>({ type: 'state', tabId: tab.id });
  ua.value = current.applied?.ua ?? ''; selected = current.applied?.profileId;
  await refreshCatalog(); draft(); render();
}
void init().catch(error => { stateKnown = false; status.textContent = errorText(error); status.className = 'error'; render(); });
