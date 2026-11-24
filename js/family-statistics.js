(() => {
  const panel = document.querySelector('#statistics');
  if (!panel) return;

  const table = panel.querySelector('table');
  const records = Array.from(table.tBodies[0].rows, row => ({
    row, year: row.cells[1].textContent.trim(), size: row.cells[2].textContent.trim(),
    rfam: row.dataset.rfam.split(/\s+/).filter(Boolean),
    pdb: row.dataset.pdb.split(/\s+/).filter(Boolean),
    publications: Number(row.cells[5].textContent)
  }));
  const years = [...new Set(records.map(r => r.year))].sort();
  const sizes = [...new Set(records.map(r => r.size))];
  const selected = {year: new Set(), size: new Set()};
  const matches = (record, key) => !selected[key].size || selected[key].has(record[key]);
  const reset = panel.querySelector('[data-action="reset"]');
  const download = panel.querySelector('[data-action="export"]');
  const status = panel.querySelector('.rc-stats-status');
  const ring = panel.querySelector('.rc-size-ring');
  const svgNS = 'http://www.w3.org/2000/svg';
  let visible = records;

  function toggle(key, value) {
    const values = selected[key];
    if (values.has(value)) values.delete(value);
    else values.add(value);
    render();
  }

  function filterButton(key, value, container) {
    const button = document.createElement('button');
    button.type = 'button';
    button.addEventListener('click', () => toggle(key, value));
    container.append(button);
    return button;
  }

  const yearBars = years.map(year => {
    const button = filterButton('year', year, panel.querySelector('.rc-year-bars'));
    button.innerHTML = '<span class="rc-year-track"><span class="rc-year-bar"></span><b></b></span><span class="rc-year-label"></span>';
    button.lastElementChild.textContent = year;
    return {year, button, bar: button.querySelector('.rc-year-bar'), number: button.querySelector('b')};
  });
  const sizeSlices = sizes.map(size => {
    const button = filterButton('size', size, panel.querySelector('.rc-size-legend'));
    button.innerHTML = '<i aria-hidden="true"></i><span></span><strong></strong>';
    button.querySelector('span').textContent = size;
    button.dataset.size = size;
    const arc = document.createElementNS(svgNS, 'circle');
    for (const [key, value] of Object.entries({cx:60, cy:60, r:44, pathLength:100, fill:'none', 'stroke-width':18, transform:'rotate(-90 60 60)'})) {
      arc.setAttribute(key, value);
    }
    arc.dataset.size = size;
    arc.addEventListener('click', () => toggle('size', size));
    ring.append(arc);
    return {size, button, arc};
  });

  function render() {
    visible = records.filter(r => matches(r,'year') && matches(r,'size'));
    const visibleRows = new Set(visible.map(r => r.row));
    records.forEach(r => { r.row.hidden = !visibleRows.has(r.row); });
    const totals = {
      families: visible.length, rfam: new Set(visible.flatMap(r => r.rfam)).size,
      pdb: new Set(visible.flatMap(r => r.pdb)).size,
      publications: visible.reduce((sum,r) => sum + r.publications, 0)
    };
    Object.entries(totals).forEach(([key, count]) => {
      panel.querySelector('[data-total="' + key + '"]').textContent = count;
    });
    // Each chart reflects the other filter, keeping all alternatives selectable.
    const yearCounts = yearBars.map(({year}) => records.filter(r => r.year === year && matches(r,'size')).length);
    const peak = Math.max(1, ...yearCounts);
    yearBars.forEach(({year, button, bar, number}, i) => {
      const count = yearCounts[i];
      button.setAttribute('aria-pressed', selected.year.has(year));
      button.setAttribute('aria-label', year + ', ' + count + (count === 1 ? ' family' : ' families'));
      bar.style.setProperty('--fraction', count / peak);
      number.textContent = count;
    });
    const byYear = records.filter(r => matches(r,'year'));
    let offset = 0;
    sizeSlices.forEach(({size, button, arc}) => {
      const count = byYear.filter(r => r.size === size).length;
      const percent = byYear.length ? 100 * count / byYear.length : 0;
      button.setAttribute('aria-pressed', selected.size.has(size));
      button.querySelector('strong').textContent = count;
      arc.style.display = count ? '' : 'none';
      arc.style.opacity = !selected.size.size || selected.size.has(size) ? '1' : '.35';
      arc.setAttribute('stroke-dasharray', percent + ' ' + (100 - percent));
      arc.setAttribute('stroke-dashoffset', -offset);
      offset += percent;
    });
    status.textContent = visible.length + ' of ' + records.length + ' families' + (visible.length ? '' : ' · No matches');
    reset.disabled = !selected.year.size && !selected.size.size;
    download.disabled = !visible.length;
  }

  reset.addEventListener('click', () => {
    selected.year.clear(); selected.size.clear(); render();
  });
  download.addEventListener('click', () => {
    const rows = [table.tHead.rows[0], ...visible.map(r => r.row)];
    const csv = rows.map(row => Array.from(row.cells, c => '"' + c.textContent.trim().replace(/"/g,'""') + '"').join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF',csv], {type:'text/csv;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url; link.download = 'ribocentre-family-statistics.csv'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  render();
  panel.querySelector('.rc-stats-interactive').hidden = false;
})();
