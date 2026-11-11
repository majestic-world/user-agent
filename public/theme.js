// Classic script loaded in <head> so the saved theme applies before first paint.
// Choice ('system' | 'light' | 'dark') lives in localStorage, shared by popup and options.
const themeQuery = matchMedia('(prefers-color-scheme: dark)');
function applyTheme() {
  const choice = localStorage.getItem('theme') ?? 'system';
  document.documentElement.dataset.theme = choice === 'system' ? (themeQuery.matches ? 'dark' : 'light') : choice;
}
applyTheme();
themeQuery.addEventListener('change', applyTheme);
addEventListener('storage', event => { if (event.key === 'theme') applyTheme(); });
