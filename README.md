GM_context
==========

A JavaScript library to create native HTML5 contextmenu in the browser. This library is designed for userscripts.

Usage
-----
```js
const items = [{
	type: "menu",
	label: "Reverse image search",
	items: [{
		type: "item",
		label: "TinEye",
		onclick(e) {
			// ...
		}
	}, {
		type: "separater"
	}, {
		type: "item",
		label: "Google",
		onclick(e) {
			// ...
		}
	}]
}];
GM_context.create({
	context: ["image"],
	items: items
});
```

API reference
-------------

### GM_context.add(options: object) -> menuId

Create a menu. `options` contain following properties:

* context: array of string. A list of valid context type that the context menu should apply to. Possible values are:

	- page: when there is no other context type matched.
	- image: match images.
	- link: match links.
	- editable: match editable target.
	- selection: when part of the page is selected.
	
	If this property is missing, the menu is globally applied.

* items: array of object. A list of items. See [Define a menu item](#define-a-menu-item).

### GM_context.remove(menuId)

Remove the menu.

Define a menu item
------------------

Each item may contain `onclick` callback, which would recieve an [`contextmenu` event](https://developer.mozilla.org/en-US/docs/Web/Events/contextmenu).

### submenu

A submenu.

```js
{
	type: "submenu",
	label: "The label",
	items: [/* a list of menu item */]
}
```

### item

Normal item.

```js
{
	type: "item",
	label: "The label",
	onclick(e) {
		// ...
	}
}
```

### checkbox

An item which could be checked/unchecked.

```js
{
	type: "checkbox",
	label: "The label",
	onclick(e, isChecked) {
		// ...
	}
}
```

### radio

A radio submenu, which is a group of checkbox. When an item is checked, the others are unchecked.

```js
{
	type: "radio",
	label: "The label",
	select: {
		// {id: label}
		item1: "Item 1",
		item2: "Item 2"
	},
	default: "item1",
	onclick(e, id) {
		// ...
	}
}
```

Changelog
---------

* 0.1.0

    - First release.
