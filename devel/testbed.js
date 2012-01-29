// Brainstorming: * What code do I want to write?
var crack_password_filter = function(acc, value, visited) {
  function rand_int(n) { return Math.floor(Math.random() * n); }
  function random_string(len) { return rand_int(Math.pow(36, len)).toString(36); }

  if (acc == '') visited.splice(0, visited.length);
  if (visited.length == value.length) return;
  var positions = _.range(0, value.length),
      pending   = _.difference(positions, visited),
      next      = _.shuffle(pending)[0],
      garbage   = random_string(value.length).split('');
  visited.push(next);
  _.each(visited, function(i) { garbage[i] = value[i]; });
  return garbage.join('');
}

var TestWidget = Panorama.Widget.create({
  ui: {
    input:   { text:   '#e_test_widget_input_text'},
    buttons: { update: '#e_test_widget_button_update'},
    display: '#e_test_widget_display'
  },

  events: {
    buttons: {
      update: {click: function(el) {
        var val = this.ui.input.text.val();
        this.ui.input.text.val('');
        this.ui.display(val);
      }}
    }
  },

  template: function() { return $('#temp_1').html(); },

  init: function() {
    this.super('init', arguments);

    var self = this;

    this.ui.display.add_getter_filter(function (value) {
      return value.toUpperCase();
    });

    this.ui.display.add_animated_setter_filter('html', crack_password_filter, 100, '', [[]]);

    this.ui.display.add_change_hook('html', function(value, widget) {
      var self = this;
      this.css('background-color', 'red');
      this.fadeOut('fast', function() {
        self.css('background-color', 'transparent');
      });
      widget.ui.display.fadeIn(2000);
    });
  }
});

$(function () {
  window.tw = new TestWidget();
  tw.set_values({
    display: 'Initial Text',
    input: {
      text: {attr: ['placeholder', 'type something here...']}},
    buttons: {
      update: {val: 'Update!', css: ['color', '#A20']}}
  });


  tw.render_into(document.body);
  // tw.ui.display.html('Testing');
});

// tw.hijack('.e_some_element');
// tw.append_to('#e_test_container');

//tw.render_into('#_e_test_container');
//tw.ui.display('Some test message');
