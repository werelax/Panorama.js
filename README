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

## Explainded examples

First, some commets about the dependencies. For the class system, I am using [Wrlx.Class](http://github.com/WeRelax/werelax-js-toolbox), for DOM manipulation jQuery and Underscore.js for all the cool functional utilities.


### The Widget

`Panorama.Widget` is the main class, from wich all other widgets will inherit. The simplest possible widget is this:

```javascript
var SimpleWidget = Panorama.Widget.create({
  template: '<div></div>'
});
```
