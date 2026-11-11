// Monochrome 24px line glyphs drawn for this extension. They evoke each browser
// family without reproducing trademarked logos.
const glyphs = {
  chrome: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M12 8.5h8.3M15.03 13.75l-4.15 7.18M8.97 13.75 4.82 6.57"/>',
  edge: '<path d="M20.6 13.6A9 9 0 1 1 18.4 5.7"/><path d="M21 12.6c0-3.3-2.7-5.4-5.8-5.4-3.9 0-6.6 2.9-6.6 6.2 0 2.7 2 4.6 4.7 4.6 2.1 0 3.6-.9 4.6-2.3"/><path d="M8.6 13.6c2.6.6 7.7.3 12.3-1"/>',
  firefox: '<circle cx="12.6" cy="12.4" r="4.2"/><path d="M5.2 6.6A9 9 0 1 0 19.6 7.4c-1.1-1.8-2.9-3.2-5-3.8.9 1 1.3 2.2 1.2 3.5"/><path d="M5.2 6.6c-.4 1.6-.2 3.1.6 4.3"/>',
  safari: '<circle cx="12" cy="12" r="9"/><path d="M16 8l-2.6 5.4L8 16l2.6-5.4Z"/><path d="M12 3v1.8M12 19.2V21M3 12h1.8M19.2 12H21"/>',
  opera: '<ellipse cx="12" cy="12" rx="8.5" ry="9"/><ellipse cx="12" cy="12" rx="3.4" ry="6.6"/>',
  samsung: '<circle cx="12" cy="12" r="5.6"/><path d="M6.9 14.4C3.6 15.9 1.8 17.6 2.3 18.6c.8 1.6 6.6-.1 12.9-3.8 6.3-3.7 10.6-8 9.8-9.6-.5-1-2.9-.8-6.2.4"/>',
  silk: '<path d="M3.5 9.5c2.6-2.6 5-2.6 7.3 0s4.9 2.6 7.6 0c.8-.8 1.4-1.2 2.1-1.4"/><path d="M3.5 14.5c2.6-2.6 5-2.6 7.3 0s4.9 2.6 7.6 0c.8-.8 1.4-1.2 2.1-1.4"/>',
  bot: '<rect x="4.5" y="8" width="15" height="11" rx="3.5"/><path d="M12 8V4.5M9.5 16h5"/><circle cx="9.3" cy="12.5" r="1.1"/><circle cx="14.7" cy="12.5" r="1.1"/><path d="M2.5 12.5v2.5M21.5 12.5v2.5"/>',
  custom: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3Z"/>',
  chevron: '<path d="m9.5 6 6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  shield: '<path d="M12 3 5 6v5.5c0 4.3 2.9 8 7 9.5 4.1-1.5 7-5.2 7-9.5V6Z"/><path d="M9 12h6"/>',
} as const;
export type Glyph = keyof typeof glyphs;

const familyGlyphs: Record<string, Glyph> = {
  Chrome: 'chrome', Edge: 'edge', Firefox: 'firefox', Safari: 'safari', Opera: 'opera',
  'Samsung Internet': 'samsung', Silk: 'silk', Bots: 'bot', Personalizados: 'custom',
};

export function icon(name: Glyph, className = 'icon'): SVGSVGElement {
  const template = document.createElement('template');
  template.innerHTML = '<svg class="' + className + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + glyphs[name] + '</svg>';
  return template.content.firstElementChild as SVGSVGElement;
}

export function familyIcon(family: string, className?: string): SVGSVGElement {
  return icon(familyGlyphs[family] ?? 'globe', className);
}
