import './style.css';
import { send } from './model';
import type { TabState } from './model';

const ua = document.querySelector<HTMLTextAreaElement>('#ua')!;
const status = document.querySelector<HTMLParagraphElement>('#status')!;
const applied = document.querySelector<HTMLParagraphElement>('#applied')!;
const apply = document.querySelector<HTMLButtonElement>('#apply')!;
const restore = document.querySelector<HTMLButtonElement>('#restore')!;
const reload = document.querySelector<HTMLButtonElement>('#reload')!;
let current: TabState;
let busy = false;
function render(): void {
  apply.disabled = busy || !current?.supported;
  restore.disabled = busy || !current?.applied;
  reload.disabled = busy || !current?.supported;
  applied.textContent = current?.applied ? 'Configurado: ' + current.applied.ua : 'Navegador original';
  status.dataset.busy = String(busy);
  status.dataset.ready = 'true';
}
async function operation(action: () => Promise<TabState>, note: string): Promise<void> {
  if (busy) return;
  busy = true; status.textContent = 'Configurando…'; status.className = ''; render();
  try { current = await action(); status.textContent = note; }
  catch (error) {
    status.textContent = error instanceof Error ? error.message : String(error); status.className = 'error';
    try { current = await send<TabState>({ type: 'state', tabId: current.tabId }); } catch { /* The original failure remains visible. */ }
  } finally { busy = false; render(); }
}
apply.addEventListener('click', () => { void operation(() => send({ type: 'apply', tabId: current.tabId, ua: ua.value }), 'Regra confirmada. Próximas requisições usarão este UA; recarregar é opcional.'); });
restore.addEventListener('click', () => { void operation(() => send({ type: 'restore', tabId: current.tabId }), 'Restaurado. Próximas requisições usarão o navegador original; recarregar é opcional.'); });
reload.addEventListener('click', () => { void chrome.tabs.reload(current.tabId).catch(error => { status.textContent = String(error); status.className = 'error'; }); });
ua.addEventListener('input', () => { status.textContent = ua.value === (current?.applied?.ua ?? '') ? (current?.applied ? 'Perfil aplicado' : 'Navegador original') : 'Rascunho personalizado — ainda não aplicado'; status.className = ''; });
async function init(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined) throw new Error('Nenhuma aba disponível. Abra uma página HTTP/HTTPS.');
  current = await send<TabState>({ type: 'state', tabId: tab.id });
  ua.value = current.applied?.ua ?? '';
  status.textContent = current.reason ?? (current.applied ? 'Perfil aplicado às próximas requisições' : 'Navegador original — sem alteração HTTP');
  render();
}
void init().catch(error => { status.textContent = String(error); status.className = 'error'; status.dataset.ready = 'true'; });
