GM_context
==========

**Firefox is going to remove contextmenu support! See https://bugzilla.mozilla.org/show_bug.cgi?id=1372276**

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

* [Basic](https://rawgit.com/eight04/GM_context/master/demo/basic.html)
* [Dynamic manipulation](https://rawgit.com/eight04/GM_context/master/demo/dynamic-manipulation.html)
* [oncontext handler](https://rawgit.com/eight04/GM_context/master/demo/oncontext.html)

API reference
-------------

### GM_context.add(menu: object)

Add a menu. The `menu` object contains following properties:

* `context`: array of string. A list of valid context type that the context menu should apply to. Possible values are:

	- `page`: when there is no other context type matched.
	- `image`: match images.
	- `link`: match links.
	- `editable`: match editable target.
	- `selection`: when part of the page is selected.
	
	If this property is missing, the menu is globally applied.

* `items`: array of object. A list of items. See [Define a menu item](#define-a-menu-item).
* `oncontext`: function. An event handler to handle contextmenu event, which would be called after `context` property is matched. The function may return `false` to not show the menu.

### GM_context.remove(menu: object)

Remove the menu.

### GM_context.update(item: object, changes: object)

Update the property of an item. If `changes` object contains `items`, it would replace all sub-items with it.

```
const myCheckbox = {
	type: "checkbox",
	label: "A checkbox"
};
GM_context.add({items: [myCheckbox]});

function toggleCheckbox() {
	GM_context.update(myCheckbox, {
		checked: !myCheckbox.checked
	});
}
```

### GM_context.addItem(parent: object, item: object, position: number)

Add a sub-item to parent.

* `parent`: Must be `submenu`, `radiogroup`, or the menu itself.
* `item`: The item to add. See [Define a menu item](#define-a-menu-item).
* `position`: Where the item should insert to. Negative value is allowed. Default to `parent.items.length`.

### GM_context.removeItem(parent: object, item: object)

Remove a sub-item from parent.

* `parent`: Must be `submenu`, `radiogroup`, or the menu itself.
* `item`: The item to remove.

Define a menu item
------------------

An item may have following properties:

* `checked`: boolean. Only available to `checkbox` and `radiogroup`'s items.
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

* 0.2.1 (Sep 21, 2017)

	- Fix empty container issue.

* 0.2.0 (Sep 21, 2017)

	- Add test.
	- Add `oncontext` handler.
	- Add `.addItem`, `.removeItem`, `update`.

* 0.1.0 (Sep 8, 2017)

    - First release.
