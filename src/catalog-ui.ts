import type { Profile } from './model';

export function matches(profile: Profile, query: string): boolean {
  const normalize = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR');
  const searchable = [profile.name, profile.category, profile.browser, profile.system, profile.manufacturer, profile.model, profile.origin === 'custom' ? 'Personalizados' : 'Integrado'].filter(Boolean).join(' ');
  return normalize(query).trim().split(/\s+/).every(term => normalize(searchable).includes(term));
}

export function populate(select: HTMLSelectElement, profiles: Profile[], query: string, selected?: string): void {
  select.replaceChildren(new Option('Escolha um perfil ou cole abaixo', ''));
  for (const category of ['Desktop', 'Mobile', 'Tablet', 'Bots', 'Personalizados']) {
    const entries = profiles.filter(profile => (profile.origin === 'custom' ? 'Personalizados' : profile.category) === category && matches(profile, query));
    if (!entries.length) continue;
    const group = document.createElement('optgroup'); group.label = category;
    for (const profile of entries) group.append(new Option(profile.name + (profile.origin === 'custom' ? ' (' + profile.category + ')' : ''), profile.id));
    select.append(group);
  }
  select.value = selected ?? '';
}

export function provenance(container: HTMLElement, profile?: Profile): void {
  container.replaceChildren();
  if (!profile) return;
  const context = document.createElement('p');
  context.textContent = [profile.origin === 'builtin' ? 'Integrado' : 'Personalizado', profile.category, profile.browser, profile.system, profile.manufacturer, profile.model].filter(Boolean).join(' · ');
  container.append(context);
  if (profile.notes) {
    const notes = document.createElement('p'); notes.textContent = profile.notes; container.append(notes);
  }
  if (profile.origin === 'builtin') {
    const source = document.createElement('a'); source.textContent = 'Fonte verificada em ' + profile.verifiedAt.split('-').reverse().join('/');
    source.href = profile.source; source.target = '_blank'; source.rel = 'noopener noreferrer'; container.append(source);
  }
}
