// ==UserScript==
// @name gm-context
// @version 0.0.0
// @description A html5 contextmenu library
// @supportURL https://github.com/eight04/GM_context/issues
// @license MIT
// @author eight04 <eight04@gmail.com> (https://github.com/eight04)
// @homepageURL https://github.com/eight04/GM_context
// @compatible firefox >=8
// @grant none
// ==/UserScript==

/* exported GM_context */

const GM_context = (function() {
	const EDITABLE_INPUT = [
		"text", "number", "email", "number", "search", "tel", "url"
	];
	
	const menus = new Map;
	
	const inc = function() {
		let i = 1;
		return () => i++;
	}();
	
	let contextEvent;
	let contextSelection;
	let menuContainer;
	
	document.addEventListener("contextmenu", e => {
		contextEvent = e;
		contextSelection = document.getSelection() + "";
		const context = getContext(e);
		const matchedMenus = [...menus.values()]
			.filter(m => !m.context || m.context.some(c => context.has(c)));
		if (!matchedMenus.length) return;
		const {el: container, destroy: destroyContainer} = createContainer(e);
		const removeMenus = [];
		for (const menu of matchedMenus) {
			if (!menu.el) {
				buildMenu(menu);
			}
			if (!menu.static) {
				updateMenu(menu);
			}
			removeMenus.push(appendMenu(container, menu));
		}
		setTimeout(() => {
			for (const removeMenu of removeMenus) {
				removeMenu();
			}
			destroyContainer();
		});
	});
	
	function updateMenu(menu) {
		// update label
		updateItems(menu.items);
	}
	
	function checkStatic(menu) {
		return checkItems(menu.items);
		
		function checkItems(items) {
			for (const item of items) {
				if (item.label && item.label.includes("%s")) {
					return false;
				}
				if (item.items && checkItems(item.items)) {
					return false;
				}
			}
			return true;
		}
	}
	
	function updateItems(items) {
		for (const item of items) {
			if (item.label && item.el) {
				item.el.label = buildLabel(item.label);
			}
			if (item.items) {
				updateItems(item.items);
			}
		}
	}
	
	function createContainer(e) {
		let el = e.target;
		while (!el.contextMenu) {
			if (el == document.documentElement) {
				if (!menuContainer) {
					menuContainer = document.createElement("menu");
					menuContainer.type = "context";
					menuContainer.id = "gm-context-menu";
					document.body.appendChild(menuContainer);
				}
				el.setAttribute("contextmenu", menuContainer.id);
				break;
			}
			el = el.parentNode;
		}
		return {
			el: el.contextMenu,
			destroy() {
				if (el.contextMenu == menuContainer) {
					el.removeAttribute("contextmenu");
				}
			}
		};
	}
	
	function getContext(e) {
		const el = e.target;
		const context = new Set;
		if (el.nodeName == "IMG") {
			context.add("image");
		}
		if (el.closest("a")) {
			context.add("link");
		}
		if (el.isContentEditable ||
			el.nodeName == "INPUT" && EDITABLE_INPUT.includes(el.type) ||
			el.nodeName == "TEXTAREA"
		) {
			context.add("editable");
		}
		if (!document.getSelection().isCollapsed) {
			context.add("selection");
		}
		if (!context.size) {
			context.add("page");
		}
		return context;
	}
	
	function buildMenu(menu) {
		menu.el = buildItems(menu.items);
		menu.startEl = menu.el.firstChild;
		menu.endEl = menu.el.lastChild;
		menu.static = checkStatic(menu);
	}
	
	function buildLabel(s) {
		return s.replace(/%s/g, contextSelection);
	}
	
	function buildItems(items) {
		const root = document.createDocumentFragment();
		for (const item of items) {
			let el;
			if (item.type == "submenu") {
				el = document.createElement("menu");
				Object.assign(el, item, {items: null});
				el.appendChild(buildItems(item.items));
			} else if (item.type == "separator") {
				el = document.createElement("hr");
			} else if (item.type == "checkbox") {
				el = document.createElement("menuitem");
				Object.assign(el, item);
				if (item.onclick) {
					el.onclick = () => {
						item.onclick.call(el, contextEvent, el.checked);
					};
				}
			} else if (item.type == "radiogroup") {
				item.id = `gm-context-radio-${inc()}`;
				el = document.createDocumentFragment();
				for (const i of item.items) {
					const iEl = document.createElement("menuitem");
					iEl.type = "radio";
					iEl.radiogroup = item.id;
					Object.assign(iEl, i);
					if (item.onchange) {
						iEl.onclick = () => {
							item.onchange.call(iEl, contextEvent, i.value);
						};
					}
					i.el = iEl;
					el.appendChild(iEl);
				}
			} else {
				el = document.createElement("menuitem");
				Object.assign(el, item);
				if (item.onclick) {
					el.onclick = () => {
						item.onclick.call(el, contextEvent);
					};
				}
			}
			if (item.type != "radiogroup") {
				item.el = el;
			}
			root.appendChild(el);
		}
		return root;
	}
	
	function appendMenu(container, menu) {
		container.appendChild(menu.el);
		return () => {
			const range = document.createRange();
			range.setStartBefore(menu.startEl);
			range.setEndAfter(menu.endEl);
			menu.el = range.extractContents();
		};
	}
	
	function add(menu) {
		menu.id = inc();
		menus.set(menu.id, menu);
	}
	
	function remove(id) {
		menus.delete(id);
	}
	
	return {add, remove};
})();
