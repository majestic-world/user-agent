import { builtinProfiles } from './catalog';
import { validProfile } from './model';
import type { Command, CustomProfile, Profile } from './model';

type Mutation = Extract<Command, { type: 'create' | 'update' | 'delete' }>;
interface SavedCatalog { version: 1; profiles: CustomProfile[] }

async function saved(): Promise<SavedCatalog> {
  const { customCatalog } = await chrome.storage.local.get('customCatalog');
  if (customCatalog === undefined) return { version: 1, profiles: [] };
  const data = customCatalog as SavedCatalog;
  if (data?.version !== 1 || !Array.isArray(data.profiles)) throw new Error('Formato do catálogo local não suportado. Preserve os dados e verifique a versão da extensão.');
  const ids = new Set<string>();
  for (const profile of data.profiles) {
    validProfile(profile);
    if (profile.origin !== 'custom' || typeof profile.id !== 'string' || typeof profile.revision !== 'string' || ids.has(profile.id) || builtinProfiles.some(item => item.id === profile.id)) throw new Error('Catálogo local inválido. Nenhum dado foi sobrescrito.');
    ids.add(profile.id);
  }
  return data;
}

export async function catalog(): Promise<Profile[]> {
  return [...builtinProfiles, ...(await saved()).profiles];
}

// The worker serializes every mutation, including its read-modify-write cycle.
export async function mutate(command: Mutation): Promise<CustomProfile | null> {
  const data = await saved();
  if (command.type === 'create') {
    const profile: CustomProfile = { ...validProfile(command.profile), id: crypto.randomUUID(), origin: 'custom', revision: crypto.randomUUID() };
    await chrome.storage.local.set({ customCatalog: { version: 1, profiles: [...data.profiles, profile] } });
    return profile;
  }
  const index = data.profiles.findIndex(profile => profile.id === command.id);
  if (index < 0) throw new Error('Este perfil foi excluído ou é integrado. Reabra a lista; integrados são somente leitura.');
  const current = data.profiles[index];
  if (current.revision !== command.revision) throw new Error('Conflito: este perfil mudou em outra interface. Reabra o perfil para revisar a versão confirmada antes de salvar.');
  switch (command.type) {
    case 'update': {
      const profile: CustomProfile = { ...validProfile(command.profile), id: current.id, origin: 'custom', revision: crypto.randomUUID() };
      const profiles = [...data.profiles]; profiles[index] = profile;
      await chrome.storage.local.set({ customCatalog: { version: 1, profiles } });
      return profile;
    }
    case 'delete':
      await chrome.storage.local.set({ customCatalog: { version: 1, profiles: data.profiles.filter(profile => profile.id !== current.id) } });
      return null;
    default: { const exhaustive: never = command; throw new Error(String(exhaustive)); }
  }
}
