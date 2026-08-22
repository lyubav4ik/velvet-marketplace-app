(function () {
	var isEdit = false;
	try { isEdit = window.BX && window.BX.Landing && typeof window.BX.Landing.getMode === 'function' && window.BX.Landing.getMode() === 'edit'; } catch (e) {}
	function setup(h) {
		if (h.dataset.vlInit) return;
		h.dataset.vlInit = '1';
		var nav = h.querySelector('.vl-nav'), ul = h.querySelector('.vl-menu-list'), right = h.querySelector('.vl-right');
		var moreLi = document.createElement('li');
		moreLi.className = 'vl-more';
		var btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'vl-menu-link vl-more-btn';
		btn.innerHTML = 'Ещё <i class="fa fa-angle-down"></i>';
		var drop = document.createElement('ul');
		drop.className = 'vl-more-list';
		moreLi.appendChild(btn);
		moreLi.appendChild(drop);
		var moved = [];
		function restore() {
			moved.splice(0).forEach(function (li) { ul.insertBefore(li, moreLi.parentNode === ul ? moreLi : null); });
			if (moreLi.parentNode) moreLi.parentNode.removeChild(moreLi);
			h.classList.remove('vl-has-more');
		}
		function fits() { return ul.getBoundingClientRect().right <= right.getBoundingClientRect().left - 24; }
		function relayout() {
			restore();
			if (window.innerWidth < 768) return;
			var guard = 80;
			while (!fits() && ul.children.length > 1 && guard-- > 0) {
				var items = Array.prototype.filter.call(ul.children, function (li) { return li !== moreLi; });
				var last = items[items.length - 1];
				if (!last) break;
				drop.insertBefore(last, drop.firstChild);
				moved.push(last);
			}
			if (moved.length) { ul.appendChild(moreLi); h.classList.add('vl-has-more'); }
		}
		var t = null;
		window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(relayout, 120); });
		window.addEventListener('load', relayout);
		if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
		setTimeout(relayout, 300);
		var burger = h.querySelector('.vl-burger');
		burger.addEventListener('click', function () { h.classList.toggle('vl-open'); });
		document.addEventListener('click', function (e) {
			if (h.classList.contains('vl-open') && !h.contains(e.target)) h.classList.remove('vl-open');
		});
		var wrap = h.querySelector('.vl-search'), toggle = h.querySelector('.vl-search-toggle'), input = h.querySelector('.vl-search-input');
		toggle.addEventListener('click', function () {
			wrap.classList.toggle('open');
			if (wrap.classList.contains('open')) input.focus();
		});
		input.addEventListener('keydown', function (e) {
			if (e.key !== 'Enter') return;
			e.preventDefault();
			var q = (input.value || '').trim();
			if (!q) return;
			var a = document.querySelector('a[data-url^="#system_catalog"]')
				|| document.querySelector('a[href*="/katalog"]')
				|| document.querySelector('a[href*="/catalog"]');
			var base = a ? a.getAttribute('href') : '/catalog/';
			window.location.href = base + (base.indexOf('?') > -1 ? '&' : '?') + 'q=' + encodeURIComponent(q);
		});
		window.addEventListener('scroll', function () { h.classList.toggle('vl-scrolled', window.scrollY > 8); }, { passive: true });
	}
	document.querySelectorAll('.vl-header').forEach(setup);
})();
