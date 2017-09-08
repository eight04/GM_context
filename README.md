GM_context
==========

A JavaScript library to create native HTML5 contextmenu in the browser. This library is designed for userscripts.

Compatibility
-------------

It uses native HTML5 `<menu>` and `<menuitem>` to build the context menu, so:

1. [It only works on latest Firefox](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/menuitem#Browser_compatibility).
2. It doesn't replace the original context menu but extends it.

Usage
-----
```js
GM_context.add({
	context: ["image"],
	items: [{
		type: "submenu",
		label: "Reverse image search",
		items: [{
			label: "TinEye",
			onclick(e) {
				// ...
			}
		}, {
			type: "separator"
		}, {
			label: "Google",
			onclick(e) {
				// ...
			}
		}]
	}]
});
```

Demo
----

https://rawgit.com/eight04/GM_context/master/demo.html

API reference
-------------

### GM_context.add(options: object) -> menuId

Create a menu. `options` contain following properties:

* `context`: array of string. A list of valid context type that the context menu should apply to. Possible values are:

	- `page`: when there is no other context type matched.
	- `image`: match images.
	- `link`: match links.
	- `editable`: match editable target.
	- `selection`: when part of the page is selected.
	
	If this property is missing, the menu is globally applied.

* `items`: array of object. A list of items. See [Define a menu item](#define-a-menu-item).

### GM_context.remove(menuId)

Remove the menu.

Define a menu item
------------------

An item may have following properties:

* `checked`: boolean. Only available to `checkbox` and `radiogroup`s items.
* `disabled`: boolean. To disable an item.
* `icon`: string. Image URL, used to provide a picture to represent the command.
* `items`: array of object. Define sub-items. Only available to `submenu` and `radiogroup` type. A submenu may contain any type of the items, but the items of radiogroup can only define `label`, `checked`, and `value` properties.
* `label`: string. The label of the item. The label may contain a special string `%s` which would be replaced with the value of `window.getSelection()`.
* `onclick`: function. Called when the item is clicked. *It would recieve a [`contextmenu` event](https://developer.mozilla.org/en-US/docs/Web/Events/contextmenu) not a click event*. Also, `checkbox` type items would recieve a boolean to indicate if the item is checked.
* `onchange`: function. Only available to `radiogroup`. The handler would recieve following params:

	- `contextmenu` event.
	- The value of the item currently choosed.
	
* `type`: string. Define different type of menuitem. Available values are:
	
	- `command`: A normal menuitem. (default)
	- `submenu`: A submenu.
	- `separator`: A separator.
	- `checkbox`: An item which can be checked/unchecked.
	- `radiogroup`: A group of checkbox. When an item is checked, the others are unchecked. It is suggested to separate radiogroup from other items, or display it in a submenu.
	
* `value`: string. Only available to `radiogroup`'s items. The value is passed to `onchange` handler as the second parameter.

Changelog
---------

* 0.1.0

    - First release.
