// Brainstorming: * What code do I want to write?

var TestWidget = Widget.create({
  ui: {
    input:   { text:   '#e_test_widget_input_text'},
    buttons: { update: '#e_test_widget_button_update'},
    display: '#e_test_widget_display'
  },
  template: function() { return $('#temp_1').html(); },
});

var tw;
$(function () {
  tw = new TestWidget().set_values({
    display: 'Initial Text',
    input: {
      text: {val: 'Oh, yea!'}},
    buttons: {
      update: {val: 'Click Me!', css: ['color', '#A20']}}
  });
  tw.render_into(document.body);
  tw.ui.display.html('Testing');
});

// tw.hijack('.e_some_element');
// tw.append_to('#e_test_container');

//tw.render_into('#_e_test_container');
//tw.ui.display('Some test message');

