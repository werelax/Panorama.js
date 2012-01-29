# Panorama.js

An experimental widget library, aiming to untangle the messy UI code.

## Motivation behind Panorama.js

The Javascript code written to manage UI behaviour gets very ugly very quickly, because the programmer usually writes it in event-per-event manner ("When I click here these thing happens. If I click on these other thing then some other action triggers. And then when this value changes the label text over there blinks. And.."), failing to build general, solid fundations for future changes and understanding.

## Goals

This library has a very opinionated view of the js UI world, and it's written to foce a very specific code structure. It's not a general toolkit, nor a agnostic MVC framework. It's a focused solution for programming with a strong and clear structure. The fundamental ideas behind Panorama.js can be summarized as:

* Explicit is better than implicit
* Put all the CSS selectors in one place, with a clear meaning
* Pure HTML templates
* Explicit data manipulation
* Never lose the reference to a relevant DOM node
* Put as much as possible in the code, because the code is smart (instead of templates, attributes, etc, ...)
* Events are great. Create custom, meaningful events to pass messages between components
* Isolate everything else

## Examples

First, some commets about the dependencies. For the class system, I am using [Wrlx.Class](http://github.com/WeRelax/werelax-js-toolbox), for DOM manipulation jQuery and Underscore.js for all the cool functional utilities.


### The Widget

`Panorama.Widget` is the main class, from which all other widgets will inherit. The simplest possible widget is this:

```javascript
var SimpleWidget = Panorama.Widget.create({
  template: '<div></div>'
});
```

The only requirement is an HTML string to use as a template. You can also pass a function that returns the string. These function will be called at instantiation time.

```javascrirpt
var SimpleWidget = Panorama.Widget.create({
	template: function() { return $('some-selector-with-the-template').html(); }
});
```

You **can't** use any template system with Panorama.js, and you will never can. One of the core ideas of the library is leave all those behind and use only plain, "dumb" strings. The template will be converted into a jQuery object and stored in the `ui_root` property of the instance.

### UI Elements

The UI elements are defined in a declarative style in the `ui` attribute of the widget. For example:

```javascript
var SimpleUIWidget = Panorama.Widget.create({
	template: '<div> <span id="e_sample_element"></span> </div>',
	ui: {sample_element: '#e_sample_element'}
});

var instance = new SimpleUIWidget();
```

The `ui` description object consist of an arbitrary object tree with CSS selectors as leafs. When instantiated, the selectors will be replaced with its matches inside the template. So we can do

```javascript
instance.ui.sample_element.html('My Value');
```

to set a value inside the `<span>` or

```javascript
alert(instance.ui.sample_element.html());
```

to read the contents. A note abot selectors: prefix every selector used for logic with 'e'. Also, use underscores for separating IDs and dashes for separating clases. For example, `e_my_id_selector` of `e-my-class-selector`.

You can nest objects in the `ui` description for groupping related elements.

```javascript
var SimpleWidget = Panorama.Widget.create({
	template: '<div> <input type="button" id="e_button_1" /> <input type="e_button_2" /></div>'
	ui: {
		buttons: {
			button_1: '#e_button_1',
			button_2: '#e_button_2'
		}
	}
});
```

In the instance you will have `instance.ui.buttons.button_1` and `instance.ui.buttons.button_2` as accesors.

These accesors are extended jQuery objects, so you can access to all the usual jQuery stuff on them (events, attr, css, etc,...). Also, as calling 'html' is the more common operation, you can call the accesor directly as an alias. `instance.ui.element()` is the same as `instance.ui.element.html()`.

The instance method `set_ui_values` can be used to set the UI contents in one call.

```javascript
var SampleWidget = Panorama.Widget.create({
	template: '<div> <span id="e_span_1"></span> <span id="e_span_2"></span> <input type="text" id="e_text_input"/> </div>',
	ui: {
		span_1: '#e_span_1',
		span_2: '#e_span_2',
		input: {
			text: '#e_text_input'
		}
	}
});

var inst = new SampleWidget().set_ui_values({
	span_1: 'First Span',
	span_2: 'Second Span',
	input: {
		text: {attr: ['placeholder', 'Type something here']}
	}
});
```

As shown, you can pass just plain text strings and they will be setted as the html contents of the element, or you can specify more complex behaviour. In the text field we are specifying: 'call the `attr` function of the element with the parameters "placeholder" and "Type something here"'. This syntax is quite powerful.


### Binding Events

In a similar way, the event handlers of the UI description can be declared in the `events` property like this:

```javascript
var SampleWidget = Panorama.Widget.create({
	template: '<div> <input type="button" id="e_button" /> </div>',
	ui: {button: '#e_button'},
	events: {
		button: {click: function(element, event) {
			alert("You clicked in " + element);
		}}
	}
});
```

The mechanics are the same: the `events` tree resembles the same structure of the `ui` tree, with the last node being a event descriptor (in the example, specifying a handler for the `click` event). All these events will be automatically scaned and delegated to the right element (which will be passed as the first element of your handler). Also, it's important to notice that _the handlers are all automatically binded to the widget instance as context_, so `this` inside the handler will point to the widget instance. You can, if you prefer, specify just a string instead of a function. In that case, you have to define a method with that name in the widget to be called as a handler.


### Data (model behaviour)

A widget is usually associated with some kind of data model, probably some JSON coming from the server. Panorama.js offers a clear, explicit way to bind these JSON models to the UI elements used for showing them.

```javascript
var SampleDataWidget = Panorama.Widget.create({
	template: '<div> <span id="e_display"></span> </div>',
	ui: {display: '#e_display'},
	data: {
		some_value: {display: 'html'}
	}
});
```

This means: "associate the 'some_value' field of the JSON model to the 'html' accesor fo the 'ui.display' ui element". So, doing:

```javascriot
var inst = new SampleDataWidget();
inst.set_data_values({some_value: "Hello, World!"});
```

The message "Hello, World!" will be automatically inserted calling the `.html(..)` accesor of the `<span>`. Again, we can use more complex descriptors:

```javascript
data: {
	some_value: {display: ['attr', 'data-message']}
}
```

Or, if the UI element is not explicitly declared in the `ui` description object, you can pass a CSS selector.

The association also works in the other way: the bindings between data values and ui elements can be used to generate a JSON model calling `inst.to_json()`, which will read the ui accesors and build the JSON object with the values.

### Rendering

Just call `inst.render_into(selector-or-dom-object)` to render the widget inside the specified parent.

## Advanced, highly experimental features

Some things that I have not yet deciced if they will be kept or thrown away.

### Filters

You can build a stack of filters around any accesor of the ui elements to modify their behaviour. This is intended to be a very flexible way to add effects or transformations to the displayed/readed data.

```javascript
// the widget definition code here...
init: function () {
	this.super('init', arguments);

	// I assume that ui.display is defined above

	this.ui.display.add_getter_filter(function (value) {
		return value.toUpperCase();
	});
}
```

So, doing `this.ui.display()` will first filter the result and the returned value will be uppercased. Simmetrically, you can do

```javascript
	this.ui.display.add_setter_filter(function (value) {
		return value.toUpperCase();
	});
```

for applying the filter _before_ setting the value to the `ui.display` element.

There is a more advanced way to describe animated filters with `add_animated_setter_filter`, but it's quite complicated and I refer you to the `testbed.js` file for an example.

### Hooks



