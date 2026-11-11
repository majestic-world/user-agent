import type { Category, Profile } from './model';

export const categories: Category[] = ['Desktop', 'Mobile', 'Tablet', 'Bots'];
const familyOrder = ['Chrome', 'Edge', 'Firefox', 'Safari', 'Opera', 'Samsung Internet', 'Silk', 'Bots', 'Personalizados'];

export function matches(profile: Profile, query: string): boolean {
  const normalize = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR');
  const searchable = [profile.name, profile.category, profile.browser, profile.system, profile.manufacturer, profile.model, profile.origin === 'custom' ? 'Personalizados' : 'Integrado'].filter(Boolean).join(' ');
  return normalize(query).trim().split(/\s+/).every(term => normalize(searchable).includes(term));
}

export function familyOf(profile: Profile): string {
  if (profile.origin === 'custom') return 'Personalizados';
  if (profile.category === 'Bots') return 'Bots';
  const browser = profile.browser ?? 'Outros';
  return browser.startsWith('Opera') ? 'Opera' : browser;
}

/** Groups matching profiles by browser family, in catalog order; unknown families come last. */
export function byFamily(profiles: Profile[], query: string): [string, Profile[]][] {
  const groups = new Map<string, Profile[]>();
  for (const profile of profiles) {
    if (!matches(profile, query)) continue;
    const family = familyOf(profile);
    groups.set(family, [...(groups.get(family) ?? []), profile]);
  }
  const rank = (family: string) => { const index = familyOrder.indexOf(family); return index === -1 ? familyOrder.length - 1 : index; };
  return [...groups].sort(([a], [b]) => rank(a) - rank(b));
}

export function familySlug(family: string): string {
  return 'family-' + family.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function profileMeta(profile: Profile): string {
  if (profile.origin === 'custom') return profile.category + ', ID ' + profile.id.slice(0, 8);
  const details = [profile.manufacturer, profile.system].filter((value): value is string => !!value && !profile.name.includes(value));
  return details.length ? details.join(', ') : profile.category;
}

export function provenance(container: HTMLElement, profile?: Profile): void {
  container.replaceChildren();
  if (!profile) return;
  const tags = document.createElement('ul'); tags.className = 'tags';
  const values = [profile.origin === 'builtin' ? 'Integrado' : 'Personalizado', profile.category, profile.browser, profile.system, profile.manufacturer, profile.model, profile.origin === 'custom' ? 'ID ' + profile.id : undefined];
  for (const value of values) {
    if (!value) continue;
    const tag = document.createElement('li'); tag.textContent = value; tags.append(tag);
  }
  container.append(tags);
  if (profile.notes) {
    const notes = document.createElement('p'); notes.textContent = profile.notes; container.append(notes);
  }
  if (profile.origin === 'builtin') {
    const source = document.createElement('a'); source.textContent = 'Fonte verificada em ' + profile.verifiedAt.split('-').reverse().join('/');
    source.href = profile.source; source.target = '_blank'; source.rel = 'noopener noreferrer'; container.append(source);
  }
}
