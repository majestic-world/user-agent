import './style.css';
import { send, validProfile } from './model';
import { matches, provenance } from './catalog-ui';
import type { CustomProfile, Profile } from './model';

const name = document.querySelector<HTMLInputElement>('#profile-name')!;
const category = document.querySelector<HTMLSelectElement>('#profile-category')!;
const ua = document.querySelector<HTMLTextAreaElement>('#profile-ua')!;
const search = document.querySelector<HTMLInputElement>('#search')!;
const status = document.querySelector<HTMLParagraphElement>('#status')!;
const list = document.querySelector<HTMLDivElement>('#list')!;
const save = document.querySelector<HTMLButtonElement>('#save')!;
const duplicate = document.querySelector<HTMLButtonElement>('#duplicate')!;
const remove = document.querySelector<HTMLButtonElement>('#delete')!;
const confirm = document.querySelector<HTMLDivElement>('#delete-confirmation')!;
const conflict = document.querySelector<HTMLParagraphElement>('#conflict')!;
const heading = document.querySelector<HTMLHeadingElement>('#editor-heading')!;
let profiles: Profile[] = [];
let editing: Profile | undefined;
let busy = false;
let conflicted = false;

function errorText(error: unknown): string { return error instanceof Error ? error.message : String(error); }
function renderControls(): void {
  const builtin = editing?.origin === 'builtin';
  name.readOnly = builtin; ua.readOnly = builtin; category.disabled = builtin || busy;
  name.disabled = busy; ua.disabled = busy;
  save.hidden = builtin; save.disabled = busy || conflicted;
  remove.hidden = editing?.origin !== 'custom'; remove.disabled = busy || conflicted;
  duplicate.hidden = !editing; duplicate.disabled = busy;
  document.querySelector<HTMLButtonElement>('#confirm-delete')!.disabled = busy || conflicted;
  document.querySelector<HTMLButtonElement>('#new')!.disabled = busy;
  for (const button of list.querySelectorAll<HTMLButtonElement>('button')) button.disabled = busy;
  status.dataset.busy = String(busy); status.dataset.ready = 'true';
  document.querySelector('#profile-form')!.setAttribute('aria-busy', String(busy));
}
function choose(profile?: Profile): void {
  if (busy) return;
  editing = profile; conflicted = false; conflict.hidden = true; confirm.hidden = true;
  name.value = profile?.name ?? ''; category.value = profile?.category ?? 'Desktop'; ua.value = profile?.ua ?? '';
  heading.textContent = profile ? (profile.origin === 'builtin' ? 'Referência integrada' : 'Editar personalizado') : 'Novo perfil personalizado';
  provenance(document.querySelector('#profile-info')!, profile);
  renderControls();
}
function renderList(): void {
  const visible = profiles.filter(profile => matches(profile, search.value));
  const count = document.querySelector('#count')!;
  count.textContent = visible.length + (visible.length === 1 ? ' perfil encontrado' : ' perfis encontrados');
  list.replaceChildren();
  for (const profile of visible) {
    const article = document.createElement('article'); article.dataset.profileId = profile.id;
    const title = document.createElement('button'); title.type = 'button'; title.className = 'profile-name'; title.textContent = profile.name;
    title.addEventListener('click', () => { choose(profile); status.textContent = profile.origin === 'builtin' ? 'Integrado somente leitura. Duplique para adaptar.' : 'Edite e salve explicitamente; a aba ativa não será alterada.'; });
    const context = document.createElement('p');
    context.textContent = [profile.origin === 'builtin' ? 'Integrado' : 'Personalizado', profile.category, profile.browser, profile.system, profile.origin === 'custom' ? 'ID ' + profile.id : profile.manufacturer].filter(Boolean).join(' · ');
    article.append(title, context); list.append(article);
  }
  if (!visible.length) { const empty = document.createElement('p'); empty.textContent = 'Nenhum perfil encontrado. Ajuste a pesquisa ou crie um perfil.'; list.append(empty); }
  renderControls();
}
function checkConflict(): void {
  if (editing?.origin !== 'custom') return;
  const latest = profiles.find(profile => profile.id === editing!.id);
  if (!latest || latest.origin !== 'custom' || latest.revision !== editing.revision) {
    conflicted = true; conflict.hidden = false;
    conflict.textContent = 'Conflito: este perfil foi alterado ou excluído em outra interface. Seu rascunho foi preservado. Selecione o perfil na lista para revisar a versão atual ou escolha Novo perfil.';
    confirm.hidden = true;
  }
}
async function refresh(): Promise<void> {
  profiles = await send<Profile[]>({ type: 'catalog' });
  if (!busy) checkConflict();
  renderList();
}
async function operation(action: () => Promise<void>, note: string): Promise<void> {
  if (busy) return;
  busy = true; status.textContent = 'Salvando alteração…'; status.className = ''; renderControls();
  try { await action(); await refresh(); status.textContent = note; status.className = 'success'; }
  catch (error) { status.textContent = errorText(error); status.className = 'error'; }
  finally { busy = false; checkConflict(); renderControls(); }
}
document.querySelector('#profile-form')!.addEventListener('submit', event => {
  event.preventDefault();
  if (editing?.origin === 'builtin' || conflicted) return;
  void operation(async () => {
    const profile = validProfile({ name: name.value, category: category.value, ua: ua.value });
    const result = editing?.origin === 'custom'
      ? await send<CustomProfile>({ type: 'update', id: editing.id, revision: editing.revision, profile })
      : await send<CustomProfile>({ type: 'create', profile });
    editing = result; name.value = result.name; ua.value = result.ua; heading.textContent = 'Editar personalizado';
    provenance(document.querySelector('#profile-info')!, result);
  }, 'Perfil salvo neste navegador. Nenhuma aba foi alterada.');
});
remove.addEventListener('click', () => {
  if (editing?.origin !== 'custom') return;
  document.querySelector('#delete-question')!.textContent = 'Excluir “' + editing.name + '”? Abas já configuradas manterão seu snapshot.';
  confirm.hidden = false; document.querySelector<HTMLButtonElement>('#confirm-delete')!.focus();
});
document.querySelector('#cancel-delete')!.addEventListener('click', () => { confirm.hidden = true; remove.focus(); });
document.querySelector('#confirm-delete')!.addEventListener('click', () => {
  if (editing?.origin !== 'custom' || conflicted) return;
  const profile = editing;
  void operation(async () => {
    await send({ type: 'delete', id: profile.id, revision: profile.revision });
    editing = undefined; name.value = ''; ua.value = ''; category.value = 'Desktop'; confirm.hidden = true;
    provenance(document.querySelector('#profile-info')!); heading.textContent = 'Novo perfil personalizado';
  }, 'Perfil excluído. Abas já configuradas foram preservadas.');
});
duplicate.addEventListener('click', () => {
  if (!editing) return;
  const original = editing;
  choose(); name.value = original.name + ' — cópia'; category.value = original.category; ua.value = original.ua;
  status.textContent = 'Cópia independente em rascunho. Escolha Salvar perfil para cadastrar.'; name.focus();
});
document.querySelector('#new')!.addEventListener('click', () => { choose(); status.textContent = 'Novo perfil. Salvar não aplica à aba.'; name.focus(); });
search.addEventListener('input', renderList);
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.customCatalog) void refresh().catch(error => { status.textContent = errorText(error); status.className = 'error'; });
});
void refresh().then(() => { choose(); status.textContent = 'Catálogo local disponível. Selecione uma referência ou crie seu perfil.'; }, error => { status.textContent = errorText(error); status.className = 'error'; renderControls(); });
