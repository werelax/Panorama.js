var Class = Wrlx.Class;

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

function tree_iterator (tree, fn, current_path) {
  current_path || (current_path = '');
  _.each(tree, function (node, key) {
    if (typeof node == 'object') {
      return tree_iterator(node, fn, build_path(current_path, key));
    } else {
      return fn(tree, key, node, current_path);
    }
  });
}

function tree_map(tree, fn) {
  var result = {},
      iterator = function (tree, key, node, path) {
        tree_walk_to(result, path, true)[key] = fn(node);
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
    var process_ui_element = function (selector) {
      if (typeof selector != 'string') { throw new Error('Malformed ui tree description'); }
      return self.generate_element_interface(find(selector));
    };
    return tree_map(ui_description, process_ui_element);
  },

  generate_element_interface: function (element) {
    var interface = function(value) {
      if (value === undefined)
        { return element.html(); }
      else
        { return element.html(value); }
    };
    return $.extend(interface, element);
  },

  set_values: function(values_tree) {
    tree_iterator(this.ui, function(tree, key, node, path) {
      var value = tree_walk_to(values_tree, build_path(path, key));
      if (value === undefined) return;
      if (typeof value == 'string')
        { node.html(value); }
      else if (typeof value == 'object') {
        _.each(value, function (data, prop) {
          if (_.isArray(data))
            { node[prop].apply(node, data); }
          else
            { node[prop](data); }
        });
      } else {
        throw new Error('Bad initial values');
      }
    });
    return this;
  },

};

var Widget = Class.create({

  init: function (initial_values) {
    var el;
    if (typeof this.template == 'function') { this.template = this.template(); }
    el = $(this.template);
    this.ui = this.extract_ui_elements(this.ui, _.bind(el.find, el));
    this.ui_root = el;
    initial_values && this.set_values(initial_values);
  },

  render_into: function (container) {
    $(container).html(this.ui_root);
  },

});

Widget.include(UIElements);
