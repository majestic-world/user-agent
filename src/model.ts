export type Category = 'Desktop' | 'Mobile' | 'Tablet' | 'Bots';
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
  | { type: 'apply'; tabId: number; ua: string }
  | { type: 'restore'; tabId: number };
export type Response<T> = { ok: true; value: T } | { ok: false; error: string };

export function validUA(value: unknown): string {
  if (typeof value !== 'string' || /[^\x20-\x7e\x80-\xff]/.test(value)) {
    throw new Error('User-Agent inválido: remova quebras de linha, controles ou caracteres fora do cabeçalho HTTP.');
  }
  const ua = value.replace(/^ +| +$/g, '');
  if (!ua) throw new Error('Informe um User-Agent antes de aplicar ou salvar.');
  return ua;
}

export async function send<T>(command: Command): Promise<T> {
  const response: Response<T> = await chrome.runtime.sendMessage(command);
  if (!response?.ok) throw new Error(response?.error ?? 'A extensão não respondeu. Reabra a interface e tente novamente.');
  return response.value;
}
