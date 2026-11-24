/* Presentation enhancements only; database records and viewer logic stay in place. */
(() => {
  const normalizePath = path => path.replace(/\/$/, '') || '/';
  const current = normalizePath(location.pathname);
  document.querySelectorAll('.rc-route-nav a').forEach(link => {
    const target = normalizePath(new URL(link.href).pathname);
    if (target === current || (target.endsWith('/ribozyme') && current.includes('/docs/'))) {
      link.setAttribute('aria-current', 'page');
    }
  });
  const wrapTables = () => {
    document.querySelectorAll('.rc-main table.table-style1, .rc-main table.dataTable, .rc-main #ribozyme table, .rc-main .post-content > table, .rc-main .post-content > div > table').forEach(table => {
      if (table.closest('.rc-table-scroll, .msp-plugin, .gsc-control-cse')) return;
      const wrap = document.createElement('div');
      wrap.className = 'rc-table-scroll';
      wrap.tabIndex = 0;
      wrap.setAttribute('role', 'region');
      wrap.setAttribute('aria-label', 'Scrollable data table');
      table.before(wrap);
      wrap.append(table);
    });
  };
  wrapTables();
  if (window.jQuery) window.jQuery(document).on('init.dt', wrapTables);

  // Static figure tables can stack; interactive scientific viewers keep their
  // coordinate systems and the existing horizontal scrolling container.
  document.querySelectorAll('.post-content table').forEach(table => {
    if (!table.querySelector('img') || table.matches('.table-style1, .dataTable') ||
        table.querySelector('th, script, iframe, canvas, svg, form, input, button, .viewerSection, .main-container, [id]')) return;
    table.classList.add('rc-figure-table');
    table.closest('.rc-table-scroll')?.classList.add('rc-figure-scroll');
  });

  // Preserve authored desktop figure sizes while letting both dimensions shrink
  // proportionally. Fixed height + max-width alone stretches figures on phones.
  document.querySelectorAll('.rc-main img').forEach(img => {
    if (img.closest('.carousel, #newsid, .msp-plugin, [class*="zoom-area"]') ||
        img.classList.contains('rc-team-photo')) return;
    const authoredWidth = img.style.width || img.getAttribute('width') || '';
    const authoredHeight = img.style.height || img.getAttribute('height') || '';
    if (authoredWidth.includes('%') || (!authoredWidth && !authoredHeight)) return;
    const fit = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      const width = parseFloat(authoredWidth) ||
        (parseFloat(authoredHeight) * img.naturalWidth / img.naturalHeight) || img.naturalWidth;
      img.style.setProperty('--rc-image-max-width', `${width}px`);
      img.classList.add('rc-responsive-image');
    };
    if (img.complete) fit();
    else img.addEventListener('load', fit, { once: true });
  });

  document.querySelectorAll('.rc-main p').forEach(paragraph => {
    if (!paragraph.textContent.trim() && paragraph.children.length &&
        [...paragraph.children].every(child => child.tagName === 'BR')) {
      paragraph.classList.add('rc-empty-spacer');
    }
  });
})();

(() => {
  const menu = document.querySelector('.rc-menu-trigger');
  if (menu) {
    const header = menu.closest('.rc-header');
    menu.hidden = false;
    header.dataset.menu = 'closed';
    menu.addEventListener('click', () => {
      const open = header.dataset.menu !== 'open';
      header.dataset.menu = open ? 'open' : 'closed';
      menu.setAttribute('aria-expanded', String(open));
    });
  }

  const gallery = document.querySelector('.rc-specimens');
  if (gallery) {
    const plates = [...gallery.querySelectorAll('.rc-plate')];
    const controls = gallery.querySelector('.rc-plate-controls');
    let active = 0;
    const show = () => {
      plates.forEach((plate, index) => { plate.hidden = index !== active; });
      const counter = gallery.querySelector('.rc-plate-counter');
      counter.textContent = (active + 1) + ' / ' + plates.length;
      const name = plates[active].querySelector('.rc-family-link').textContent;
      const accessibleName = document.createElement('span');
      accessibleName.className = 'sr-only';
      accessibleName.textContent = ', ' + name;
      counter.append(accessibleName);
    };
    if (plates.length) {
      show();
      controls.hidden = plates.length < 2;
      controls.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
          active = (active + Number(button.dataset.step) + plates.length) % plates.length;
          show();
        });
      });
    }
  }

  const tools = document.querySelector('.rc-catalog-tools');
  if (tools) {
    const table = document.querySelector('.rc-family-table');
    const query = tools.querySelector('input');
    const size = tools.querySelector('select');
    const count = tools.querySelector('output');
    const filter = () => {
      const term = query.value.trim().toLowerCase();
      let matches = 0;
      for (const group of table.tBodies) {
        let visibleRows = 0;
        for (const row of [...group.rows].slice(1)) {
          const searchable = [row.cells[0], row.cells[3], row.cells[4]].map(cell => cell.textContent.toLowerCase());
          row.hidden = (size.value && group.dataset.size !== size.value) || !searchable.some(text => text.includes(term));
          if (!row.hidden) visibleRows++;
        }
        group.hidden = visibleRows === 0;
        matches += visibleRows;
      }
      count.textContent = matches === 0 ? 'No matching families. Try another name, accession or size.' : matches + (matches === 1 ? ' family' : ' families');
    };
    tools.hidden = false;
    query.addEventListener('input', filter);
    size.addEventListener('change', filter);
    filter();
  }
})();
