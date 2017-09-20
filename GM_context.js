// ==UserScript==
// @name GM_context
// @version 0.1.0
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
			if (menu.oncontext && menu.oncontext(e) === false) {
				continue;
			}
			if (!menu.isBuilt) {
				buildMenu(menu);
			}
			if (!menu.static) {
				updateLabel(menu.items);
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
	
	// check if there are dynamic label
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
	
	function updateLabel(items) {
		for (const item of items) {
			if (item.label && item.el) {
				item.el.label = buildLabel(item.label);
			}
			if (item.items) {
				updateLabel(item.items);
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
		const el = buildItems(null, menu.items);
		menu.startEl = document.createComment(`<menu ${menu.id}>`);
		el.prepend(menu.startEl);
		menu.endEl = document.createComment("</menu>");
		el.append(menu.endEl);
		if (menu.static == null) {
			menu.static = checkStatic(menu);
		}
		menu.frag = el;
		menu.isBuilt = true;
	}
	
	function buildLabel(s) {
		return s.replace(/%s/g, contextSelection);
	}
	
	// build item's element
	function buildItem(parent, item) {
		let el;
		if (item.type == "submenu") {
			el = document.createElement("menu");
			Object.assign(el, item, {items: null});
			el.appendChild(buildItems(item, item.items));
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
			el = document.createDocumentFragment();
			item.id = `gm-context-radio-${inc()}`;
			item.startEl = document.createComment(`<radiogroup ${item.id}>`);
			el.appendChild(item.startEl);
			el = buildItems(item, item.items);
			item.endEl = document.createComment("</radiogroup>");
			el.appendChild(item.endEl);
		} else if (parent && parent.type == "radiogroup") {
			el = document.createElement("menuitem");
			item.type = "radio";
			item.radiogroup = parent.id;
			Object.assign(el, item);
			if (parent.onchange || item.onclick) {
				el.onclick = () => {
					if (parent.onchange) {
						parent.onchange.call(el, contextEvent, item.value);
					}
					if (item.onclick) {
						item.onclick.call(el, contextEvent);
					}
				};
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
		if (!(el instanceof DocumentFragment)) {
			item.el = el;
		}
		item.isBuilt = true;
		return el;
	}
	
	// build items' element
	function buildItems(parent, items) {
		const root = document.createDocumentFragment();
		for (const item of items) {
			root.appendChild(buildItem(parent, item));
		}
		return root;
	}
	
	// attach menu to DOM
	function appendMenu(container, menu) {
		container.appendChild(menu.frag);
		return () => {
			const range = document.createRange();
			range.setStartBefore(menu.startEl);
			range.setEndAfter(menu.endEl);
			menu.frag = range.extractContents();
		};
	}
	
	// add a menu
	function add(menu) {
		menu.id = inc();
		menus.set(menu.id, menu);
		return menu.id;
	}
	
	// remove a menu
	function remove(id) {
		menus.delete(id);
	}
	
	// update item's properties. If @changes includes a `items` key, it would replace item's children.
	function update(item, changes) {
		if (changes.type) {
			throw new Error("item type is not changable");
		}
		if (changes.items) {
			if (item.isBuilt) {
				item.items.forEach(removeElement);
			}
			item.items.length = 0;
			changes.items.forEach(i => addItem(item, i));
			delete changes.items;
		}
		Object.assign(item, changes);
		if (item.el) {
			delete changes.onclick;
			delete changes.onchange;
			Object.assign(item.el, changes);
		}
	}
	
	// add an item to parent
	function addItem(parent, item, pos = parent.items.length) {
		if (parent.isBuilt) {
			const el = buildItem(parent, item);
			if (parent.el) {
				parent.el.insertBefore(el, parent.el.childNodes[pos]);
			} else {
				// search from end, so it would be faster to insert multiple item to end
				let ref = parent.endEl,
					i = pos < 0 ? -pos : parent.items.length - pos;
				while (i-- && ref) {
					ref = ref.previousSibling;
				}
				parent.startEl.parentNode.insertBefore(el, ref);
			}
		}
		parent.items.splice(pos, 0, item);
	}
	
	// remove an item from parent
	function removeItem(parent, item) {
		const pos = parent.items.indexOf(item);
		parent.items.splice(pos, 1);
		if (item.isBuilt) {
			removeElement(item);
		}
	}
	
	// remove item's element
	function removeElement(item) {
		if (item.el) {
			item.el.remove();
		} else {
			while (item.startEl.nextSibling != item.endEl) {
				item.startEl.nextSibling.remove();
			}
			item.startEl.remove();
			item.endEl.remove();
		}
	}
	
	return {add, remove, update, addItem, removeItem};
})();
