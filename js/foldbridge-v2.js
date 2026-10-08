/* Header presentation and accessible menus. Search/data handlers stay unchanged. */
document.addEventListener('DOMContentLoaded', function () {
  var header = document.querySelector('.fb-header');
  if (!header) return;
  var closeDropdowns = function () {
    header.querySelectorAll('.dropdown.open').forEach(function (item) {
      item.classList.remove('open');
      item.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
    });
  };
  // Handle the redesigned navigation without depending on a remote jQuery CDN.
  header.addEventListener('click', function (event) {
    var toggle = event.target.closest('.navbar-toggle');
    if (toggle) {
      event.preventDefault(); event.stopPropagation();
      var menu = header.querySelector('#navbar-collapse-1');
      var open = !menu.classList.contains('show');
      menu.classList.toggle('show', open); menu.classList.toggle('in', open);
      toggle.setAttribute('aria-expanded', String(open));
      return;
    }
    var dropdownToggle = event.target.closest('.dropdown-toggle');
    if (dropdownToggle) {
      event.preventDefault(); event.stopPropagation();
      var dropdown = dropdownToggle.closest('.dropdown');
      var openDropdown = !dropdown.classList.contains('open');
      closeDropdowns();
      dropdown.classList.toggle('open', openDropdown);
      dropdownToggle.setAttribute('aria-expanded', String(openDropdown));
    }
  }, true);
  document.addEventListener('click', function (event) {
    if (!event.target.closest('.fb-header .dropdown')) closeDropdowns();
  });
  header.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      var toggle = header.querySelector('.dropdown.open .dropdown-toggle');
      closeDropdowns();
      if (toggle) toggle.focus();
    }
  });
  var normalize = function (path) { return path.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/'; };
  var current = normalize(window.location.pathname);
  document.querySelectorAll('.fb-header #navbar-collapse-1 a[href]').forEach(function (link) {
    if (!link.getAttribute('href') || link.getAttribute('href') === '#') return;
    var url = new URL(link.href, window.location.href);
    if (url.origin === window.location.origin && !url.hash && normalize(url.pathname) === current) {
      link.setAttribute('aria-current', 'page');
      var dropdown = link.closest('.dropdown');
      if (dropdown) dropdown.querySelector('.dropdown-toggle').setAttribute('aria-current', 'page');
    }
  });
});
