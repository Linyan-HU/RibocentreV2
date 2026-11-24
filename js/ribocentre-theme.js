(() => {
  const key = 'ribocentre-theme';
  const root = document.documentElement;

  function apply(theme) {
    root.dataset.theme = theme === 'dark' ? 'dark' : 'light';
  }

  let saved;
  try { saved = localStorage.getItem(key); } catch { /* Storage may be disabled. */ }
  apply(saved);

  document.addEventListener('click', event => {
    if (!event.target.closest('.rc-theme-toggle')) return;
    apply(root.dataset.theme === 'dark' ? 'light' : 'dark');
    try { localStorage.setItem(key, root.dataset.theme); } catch { /* Keep the in-page selection. */ }
  });
})();
