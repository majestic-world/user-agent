import type { Profile } from './model';

const groupOrder = ['Desktop', 'Mobile', 'Tablet', 'Bots', 'Personalizados'];
const subgroupOrder = ['Chrome', 'Edge', 'Firefox', 'Safari', 'Opera', 'Samsung Internet', 'Silk', 'Desktop', 'Mobile', 'Tablet', 'Bots'];

export function matches(profile: Profile, query: string): boolean {
  const normalize = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR');
  const searchable = [profile.name, profile.category, profile.browser, profile.system, profile.manufacturer, profile.model, profile.origin === 'custom' ? 'Personalizados' : 'Integrado'].filter(Boolean).join(' ');
  return normalize(query).trim().split(/\s+/).every(term => normalize(searchable).includes(term));
}

/** Top-level grouping: device type for builtins, a single bucket for custom profiles. */
export function groupOf(profile: Profile): string {
  return profile.origin === 'custom' ? 'Personalizados' : profile.category;
}

/** Second-level grouping inside a group: browser family, or type for custom profiles; bots are not subdivided. */
export function subgroupOf(profile: Profile): string {
  if (profile.origin === 'custom') return profile.category;
  if (profile.category === 'Bots') return '';
  const browser = profile.browser ?? 'Outros';
  return browser.startsWith('Opera') ? 'Opera' : browser;
}

function grouped(profiles: Profile[], key: (profile: Profile) => string, order: string[]): [string, Profile[]][] {
  const groups = new Map<string, Profile[]>();
  for (const profile of profiles) {
    const name = key(profile);
    groups.set(name, [...(groups.get(name) ?? []), profile]);
  }
  const rank = (name: string) => { const index = order.indexOf(name); return index === -1 ? order.length : index; };
  return [...groups].sort(([a], [b]) => rank(a) - rank(b));
}

/** Matching profiles grouped by type, in catalog order. */
export function byGroup(profiles: Profile[], query: string): [string, Profile[]][] {
  return grouped(profiles.filter(profile => matches(profile, query)), groupOf, groupOrder);
}

export function bySubgroup(profiles: Profile[]): [string, Profile[]][] {
  return grouped(profiles, subgroupOf, subgroupOrder);
}

export function groupSlug(group: string): string {
  return 'group-' + group.toLowerCase().replace(/[^a-z0-9]+/g, '-');
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
