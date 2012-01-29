/*** Objectives:
*
* 1. Explicit is better than implicit
* 2. Put the css selectors in one place, with a clear meaning
* 3. Pure HTML templates
* 4. Explicit data manipulation
* 5. Never lose the reference to a relevant DOM node
* 6. Put as much as possible in the code (because the code is programmable)
* 7. Events are great. Crate custom, meaningful events to pass messages between componentes.
* 8. Isolate everything else.
*
***/

(function (exports) {
  var Class = Wrlx.Class;

  // Some utils (stolen from Coffee)
  var _hasProp = Object.prototype.hasOwnProperty,
      _extend = function(target) {
        var sources = Array.prototype.slice.call(arguments, 1);
        _.each(sources, function(source) {
          for (var key in source) { target[key] = source[key]; }
        });
        return target;
  };

  function build_path(root) {
    var path_description = Array.prototype.slice.call(arguments, 1),
        path = path_description.join('.');
    return (!root || root == '') ? path : root + '.' + path;
  }

  // Path = route in the tree. Ej:
  // 'some.nested.objs.val'
  function tree_walk_to(tree, path, create_if_needed) {
    if (path == '') return tree;
    var i = path.indexOf('.'), key;
    if (i == -1) {
      if (create_if_needed && tree[path] === undefined) tree[path] = {};
      return tree[path];
    } else {
      key = path.slice(0, i);
      if (typeof tree[key] == 'object')
        return tree_walk_to(tree[key], path.slice(i+1))
      else
        return undefined;
    }
  }

  function tree_iterator(tree, fn, current_path) {
    current_path || (current_path = '');
    _.each(tree, function (node, key) {
      if (typeof node == 'object' && !_.isArray(node)) {
        return tree_iterator(node, fn, build_path(current_path, key));
      } else {
        return fn(tree, key, node, current_path);
      }
    });
  }

  function tree_to_path(one_way_tree) {
    var return_value;
    tree_iterator(one_way_tree, function(tree, key, node, path) {
      return_value = [build_path(path, key), node];
    });
    return return_value;
  }

  window.ttp = tree_to_path;

  function tree_map(tree, fn) {
    var result = {},
        iterator = function (tree, key, node, path) {
          tree_walk_to(result, path, true)[key] = fn(node, build_path(path, key));
        };
    tree_iterator(tree, iterator);
    return result;
  }

  function tree_apply (tree, values_tree, fn) {
    var iterator = function (tree, key, node, path) {
      var value = tree_walk_to(values_tree, build_path(path, key));
      if (value === undefined) return;
      if (typeof fn == 'string' && node[fn]) {
        node[fn](value);
      } else if (typeof fn == 'function') {
        fn.call(node, value);
      }
    };
    tree_iterator(tree, iterator);
  }

  var UIElements = {

    extract_ui_elements: function (ui_description, find) {
      var self = this;
      var process_ui_element = function (selector, ui_path) {
        if (typeof selector != 'string') { throw new Error('Malformed ui tree description'); }
        return self.generate_element_interface(find(selector), ui_path, self);
      };
      return tree_map(ui_description, process_ui_element);
    },

    generate_element_interface: function (element, path, widget) {
      // Convenience inteface
      var interface = function (value) {
        if (value === undefined) {
          return interface.hget();
        } else {
          return interface.hset(value);
        }
      };

      // Prevent nasty jQuery error messages
      _.bindAll(element);

      // A lot of mixed functionality
      var mixins = _extend({}, {
        hset: function(value) {
          return this.html(value);
        },
        hget: function() {
          return this.html();
        },
        svalue: function(v) {
          this.attr('value', v);
        },
        _ui_path: path,
        _widget: widget,
      }, element, Filters, Hooks);

      return _extend(interface, mixins);
    },

    set_ui_values: function(values_tree) {
      tree_iterator(this.ui, function (tree, key, node, path) {
        var value = tree_walk_to(values_tree, build_path(path, key));
        if (value === undefined) return;
        if (typeof value == 'string')
          { node.hset(value); }
        else if (typeof value == 'object') {
          _.each(value, function (data, prop) {
            _.isArray(data) || (data = [data]);
            node[prop].apply(node, data);
          });
        } else {
          throw new Error('Bad initial values');
        }
      });
      return this;
    },

  };

  var Filters = {

    add_getter_filter: function (property, filter) {
      if (filter == undefined) return this.add_getter_filter('html', property);
      var previous = this[property],
          self = this;
      this[property] = function (value) {
        if (value !== undefined) return previous.call(self, value);
        return filter.call(self, previous.call(self));
      };
      return this;
    },

    add_setter_filter: function (property, filter) {
      if (filter == undefined) return this.add_setter_filter('html', property);
      var previous = this[property],
          self = this;
      this[property] = function(value) {
        if (value === undefined) return previous.call(self);
        if(value = filter.call(self, value))
          return previous.call(self, value);
      };
      return this;
    },

    add_animated_setter_filter: function (property, filter, timeout, initial, args) {
      var previous = this[property],
          self = this,
          timeout = timeout || 0;
      this[property] = function(value) {
        var fixed_args = args || [];
        if (value === undefined) return previous.call(self);
        var iter_value = (initial === undefined) ?  value : initial;
        (function action () {
          var iter_args = [iter_value, value].concat(fixed_args);
          iter_value = filter.apply(self, iter_args);
          if (iter_value !== undefined) {
            previous.call(self, iter_value);
            setTimeout(action, timeout);
          }
        })();
      };
      return this;
    },

  };

  var Hooks = {

    add_change_hook: function(property, callback) {
      var self = this,
          previous = self[property];
      self[property] = function(value) {
        if (value == undefined) return previous.call(self);
        previous.call(self, value);
        callback.call(self, value, self._widget);
      };
      return this;
    }

  };

  var Events = {

    bind_events: function() {
      var event_tree = this.events,
          selector_tree = this.ui_selectors,
          self = this;
      tree_iterator(this.ui, function (tree, key, node, path) {
        var events = tree_walk_to(event_tree, build_path(path, key)),
            selector = tree_walk_to(selector_tree, build_path(path, key));
        if (events === undefined) return;
        _.each(events, function (handler, event) {
          if (typeof handler == 'string') handler = self[handler];
          self.ui_root.delegate(selector, event, function () {
            var el = this,
                args = Array.prototype.slice.call(arguments, 0);
            handler.apply(self, [el].concat(args));
          });
        });
      });
      return this;
    },

  }

  var Data = {

    parse_data_associations: function () {
      var data_hash = {},
          data_description = this.data,
          ui_tree = this.ui,
          ui_root = this.ui_root,
          self = this;
      _.each(data_description, function (description, key) {
        var node_accesor, args;
        switch (typeof description) {
        case 'string':
          node_accesor = _.bindAll(ui_root.find(description)).html;
          args = ['html'];
          break;
        case 'object':
          var _ref = tree_to_path(description);
          node_accesor = tree_walk_to(ui_tree,  _ref[0]);
          args = _.isArray(_ref[1]) ? _ref[1] : [_ref[1]];
          break
        default:
          throw new Error('Bad data description');
        }
        var method = args.shift();
        data_hash[key] = function() {
          var caller_args = Array.prototype.slice.call(arguments, 0);
          return node_accesor[method].apply(self, args.concat(caller_args))
        };
      });
      return data_hash;
    },

    set_data_values: function (values) {
      var data_hash = this.data;
      _.each(values, function (value, key) { if (data_hash[key]) data_hash[key](value); });
    },

    to_json: function () {
      var json = {};
      _.each(this.data, function(accesor, key) { json[key] = accesor(); })
      return json;
    },

  };

  // Main Class

  var Widget = Class.create({

    init: function (initial_values) {
      var el;
      if (typeof this.template == 'function') { this.template = this.template(); }
      el = $(this.template);
      this.ui_selectors = this.ui;
      this.ui = this.extract_ui_elements(this.ui_selectors, _.bind(el.find, el));
      this.ui_root = el;
      initial_values && this.set_values(initial_values);
      this.events && this.bind_events();
      this.data && (this.data = this.parse_data_associations());
    },

    render_into: function (container) {
      $(container).html(this.ui_root);
    },

  });

  Widget.include(UIElements);
  Widget.include(Events);
  Widget.include(Data);

  exports['Widget'] = Widget;
})(this.Panorama || (this.Panorama = {}))
