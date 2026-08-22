(function () {
	var isEdit = false;
	try { isEdit = window.BX && window.BX.Landing && typeof window.BX.Landing.getMode === 'function' && window.BX.Landing.getMode() === 'edit'; } catch (e) {}
	if (isEdit) return;
	function catalogBase() {
		var best = null, bestDepth = 99, seen = {};
		Array.prototype.forEach.call(document.querySelectorAll('a[href]'), function (a) {
			var m = (a.getAttribute('href') || '').match(/^\/?(katalog|catalog|shop)(?:\/|$)/i);
			if (!m) return;
			var seg = m[1].toLowerCase();
			if (seen[seg]) return;
			seen[seg] = true;
			var path = '';
			try { path = new URL(a.href, location.href).pathname; } catch (e) {}
			var d = path.split('/').filter(Boolean).length || 1;
			if (d < bestDepth) { bestDepth = d; best = '/' + seg + '/'; }
		});
		return best || '/catalog/';
	}
	function setup(h) {
		if (h.dataset.vlInit) return;
		h.dataset.vlInit = '1';
		var burger = h.querySelector('.vl-burger');
		if (burger) burger.addEventListener('click', function () { h.classList.toggle('vl-open'); });
		document.addEventListener('click', function (e) {
			if (h.classList.contains('vl-open') && !h.contains(e.target)) h.classList.remove('vl-open');
		});
		var wrap = h.querySelector('.vl-search'), toggle = h.querySelector('.vl-search-toggle'), input = h.querySelector('.vl-search-input');
		if (toggle && input) {
			toggle.addEventListener('click', function () {
				wrap.classList.toggle('open');
				if (wrap.classList.contains('open')) input.focus();
			});
			input.addEventListener('keydown', function (e) {
				if (e.key !== 'Enter') return;
				e.preventDefault();
				var q = (input.value || '').trim();
				if (!q) return;
				window.location.href = catalogBase() + '?q=' + encodeURIComponent(q);
			});
		}
	}
	document.querySelectorAll('.vl-header').forEach(setup);
})();
