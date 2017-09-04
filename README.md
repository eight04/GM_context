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
		type: "separator"
	}, {
		type: "item",
		label: "Google",
		onclick(e) {
			// ...
		}
	}]
}];
GM_context.add({
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

The event handler on the item would recieve a [`contextmenu` event](https://developer.mozilla.org/en-US/docs/Web/Events/contextmenu).

All types of items may contain following global properties:

* disabled: boolean.

### submenu

A submenu.

```js
{
	type: "submenu",
	label: "The label",
	items: [/* a list of menu item */]
}
```

### separator

A separator.

```js
{
	type: "separator"
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
	checked: true,
	onclick(e, isChecked) {
		// ...
	}
}
```

### radiogroup

A group of checkbox. When an item is checked, the others are unchecked. It is suggested to separate radiogroup from other items, or display it in a submenu.

```js
{
	type: "radiogroup",
	items: [{
		label: "Item 1",
		checked: true,
		value: "item1"
	}, {
		label: "Item 2",
		value: "item2"
	}],
	onchange(e, value) {
		// ...
	}
}
```

Changelog
---------

* 0.1.0

    - First release.
