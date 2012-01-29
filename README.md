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

You **can't** use any template system with Panorama.js, and you will never can. One of the core ideas of the library is leave all those behind and use only plain, "dumb" strings.

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
	ui: {buttons: {
		button_1: '#e_button_1',
		button_2: '#e_button_2'
	}}
});
```

In the instance you will have `instance.ui.buttons.button_1` and `instance.ui.buttons.button_2` as accesors.


