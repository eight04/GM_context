require("jsdom-global")();

const {describe, it} = require("mocha");
const assert = require("assert");
const GM_context = require("./index");
const sinon = require("sinon");

// https://github.com/tmpvar/jsdom/issues/937
document.getSelection = () => "";

// https://github.com/tmpvar/jsdom/issues/1555
Element.prototype.closest = function (selector) {
    var el = this;
    while (el) {
        if (el.matches(selector)) {
            return el;
        }
        el = el.parentElement;
    }
};

describe("Different items", () => {
	const item = {label: "default command"};
	const submenu = {type: "submenu", label: "a submenu", items: [{
		label: "submenu item"
	}]};
	const separator = {type: "separator"};
	const checkbox = {
		type: "checkbox", label: "a checkbox", checked: true,
		onclick: sinon.spy()
	};
	const radiogroup = {type: "radiogroup", items: [{
		label: "radio 1",
		value: "a"
	}, {
		label: "radio 2",
		value: "b"
	}], onchange: sinon.spy()};
	
	GM_context.buildMenu({
		items: [item, submenu, separator, checkbox, radiogroup]
	});
	
	it("command", () => {
		assert.equal(item.el.nodeName, "MENUITEM");
		assert.equal(item.el.label, item.label);
	});
	
	it("submenu", () => {
		assert.equal(submenu.el.nodeName, "MENU");
		assert.equal(submenu.el.childNodes.length, 1);
	});
	
	it("separator", () => {
		assert.equal(separator.el.nodeName, "HR");
	});
	
	it("checkbox", () => {
		assert.equal(checkbox.el.nodeName, "MENUITEM");
		assert.equal(checkbox.el.checked, checkbox.checked);
	});
	
	it("checkbox event", () => {
		checkbox.el.dispatchEvent(new MouseEvent("click"));
		sinon.assert.calledWithMatch(checkbox.onclick, sinon.match.any, checkbox.el.checked);
	});
	
	it("radiogroup", () => {
		assert.equal(radiogroup.el, null);
		["startEl", "endEl"].forEach(el => {
			assert.equal(radiogroup[el].nodeName, "#comment");
		});
		assert.equal(radiogroup.startEl.nextSibling, radiogroup.items[0].el);
		assert.equal(radiogroup.startEl.nextSibling.nextSibling, radiogroup.items[1].el);
		assert.equal(radiogroup.items[1].el.nextSibling, radiogroup.endEl);
	});
	
	it("radiogroup children", () => {
		radiogroup.items.forEach(item => {
			assert.equal(item.el.type, "radio");
			assert.equal(item.el.nodeName, "MENUITEM");
		});
	});
	
	it("radiogroup event", () => {
		radiogroup.items[1].el.dispatchEvent(new MouseEvent("click"));
		sinon.assert.calledWithMatch(radiogroup.onchange, sinon.match.any, radiogroup.items[1].value);
	});
});

describe("Manipulation", () => {
	const menu = {items: []};
	GM_context.buildMenu(menu);
	const item = {};
	const item2 = {};
	const item3 = {};
	
	it("addItem", () => {
		GM_context.addItem(menu, item);
		assert.equal(menu.frag.childNodes[1], item.el);
		
		GM_context.addItem(menu, item2, 0);
		assert.equal(menu.frag.childNodes[1], item2.el);
		
		GM_context.addItem(menu, item3, -1);
		assert.equal(menu.frag.childNodes[2], item3.el);
	});
	
	it("removeItem", () => {
		GM_context.removeItem(menu, item);
		GM_context.removeItem(menu, item2);
		GM_context.removeItem(menu, item3);
		assert.equal(menu.startEl.nextSibling, menu.endEl);
	});
	
	it("update", () => {
		GM_context.update(item, {label: "123"});
		assert.equal(item.label, "123");
		assert.equal(item.el.label, "123");
	});
	
	it("update event", () => {
		const onclick = sinon.spy();
		GM_context.update(item, {onclick});
		item.el.dispatchEvent(new MouseEvent("click"));
		sinon.assert.calledOnce(onclick);
	});
});

describe("Initialize", () => {
	it("don't create container when no context match", done => {
		GM_context.add({
			items: [],
			oncontext: () => false
		});
		setTimeout(() => {
			assert.equal(document.querySelector("[contextmenu]"), null);
			done();
		});
		document.body.dispatchEvent(
			new MouseEvent("contextmenu", {bubbles: true})
		);
	});
});

function wait(time) {
	return new Promise(resolve => {
		setTimeout(resolve, time);
	});
}
