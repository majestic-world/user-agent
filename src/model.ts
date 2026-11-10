export type Category = 'Desktop' | 'Mobile' | 'Tablet' | 'Bots';
export interface ProfileFields {
  id: string;
  name: string;
  category: Category;
  ua: string;
  browser?: string;
  system?: string;
  manufacturer?: string;
  model?: string;
  notes?: string;
}
export interface BuiltinProfile extends ProfileFields {
  origin: 'builtin';
  source: string;
  verifiedAt: string;
}
export interface CustomProfile extends ProfileFields {
  origin: 'custom';
  revision: string;
}
export type Profile = BuiltinProfile | CustomProfile;
export interface ProfileInput { name: string; category: Category; ua: string }
export interface Applied {
  ua: string;
  name: string;
  category?: Category;
  profileId?: string;
}
export interface TabState {
  tabId: number;
  supported: boolean;
  reason?: string;
  applied: Applied | null;
}
export type Command =
  | { type: 'state'; tabId: number }
  | { type: 'apply'; tabId: number; ua: string; profileId?: string }
  | { type: 'restore'; tabId: number }
  | { type: 'catalog' }
  | { type: 'create'; profile: ProfileInput }
  | { type: 'update'; id: string; revision: string; profile: ProfileInput }
  | { type: 'delete'; id: string; revision: string };
export type Response<T> = { ok: true; value: T } | { ok: false; error: string };

export function validUA(value: unknown): string {
  if (typeof value !== 'string' || /[^\x20-\x7e\x80-\xff]/.test(value)) {
    throw new Error('User-Agent inválido: remova quebras de linha, controles ou caracteres fora do cabeçalho HTTP.');
  }
  const ua = value.replace(/^ +| +$/g, '');
  if (!ua) throw new Error('Informe um User-Agent antes de aplicar ou salvar.');
  return ua;
}

export function validProfile(value: unknown): ProfileInput {
  if (!value || typeof value !== 'object') throw new Error('Perfil inválido.');
  const data = value as Record<string, unknown>;
  if (typeof data.name !== 'string' || !data.name.trim()) throw new Error('Informe um nome para salvar o perfil.');
  if (!['Desktop', 'Mobile', 'Tablet', 'Bots'].includes(data.category as string)) throw new Error('Escolha uma categoria válida.');
  return { name: data.name.trim(), category: data.category as Category, ua: validUA(data.ua) };
}

export async function send<T>(command: Command): Promise<T> {
  const response: Response<T> = await chrome.runtime.sendMessage(command);
  if (!response?.ok) throw new Error(response?.error ?? 'A extensão não respondeu. Reabra a interface e tente novamente.');
  return response.value;
}
