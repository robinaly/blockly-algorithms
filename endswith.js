function FindModel() {
  var self = this;
  Model.call(this);
  
  self.title("Blockly EndsWith");
  self.type = ko.observable('endchar');
  self.endchar = ko.computed(function() {
    return self.type() == 'endchar';
  }, self);
  
  self.problem = ko.computed(function() {
    if (self.endchar()) {
      return "Define an algorithm that determines whether a text variable s ends with the text in variable e. The variables use the special end character representation, with the end character being '$'. Store true in a variable called 'endswith' if s ends with e, and otherwise false. To access character i of the variable s and e, you can use the blocks s[i] and e[i] in the category 'Math/Text' respectively. In the special end character representation you cannot use the blocks len(s) and len(e).";  
    }
    else {
      return "Define an algorithm that determines whether a text variable s ends with the text in variable e. The variables use the length counter representation. Store true in a variable called 'endswith' if s ends with e, and otherwise false. To access the character i of the variable s and e, you can use the blocks s[i] and e[i] in the category 'Math/Text' respectively. In the length counter representation you can use the blocks len(s) and len(e).";  
    }
  }, self);
  
  self.to_find = ko.observableArray();
  
  self.shouldbe = ko.computed(function() {
    var valid = true;
    var s = self.array();
    var e = self.to_find();
    var ls = s.length;
    var le = e.length;
    for (var i=0; i<le; i++) {
      var is = ls - i - 1;
      var ie = le - i - 1; 
      console.log(i, is, ie, s[is], e[ie]);
      if (s[is] != e[ie]) {
        valid = false;
        break;
      }
    }
    console.log('Should be', valid);
    return valid;
  }, self);
  
  self.checkSucceeded = function() {
    var valid = true;
    var shouldbe = self.shouldbe();
    for (var i=0; i<self.variables().length; i++) {
      if (self.variables()[i].name() == "endswith") {
        console.log(self.variables()[i].val(), shouldbe);
        valid = self.variables()[i].val() == shouldbe;
        break;
      }
    };
    self.succeeded(valid);
  }
  
  self.setProblem = ko.computed({
    'read': function() { 
      return self.type();
    },
    'write': function(val) {
      self.type(val);
      self.reset();
    }
  }, self);

  self.newProblem = function() {
    self.seed(Math.ceil(Math.random() * 1000));
    self.reset();
  }

  self.sortedProblem = function() {
    self.seed(Math.ceil(Math.random() * 20) - 20);
    self.reset();
  }

  self.invSortedProblem = function() {
    self.seed(Math.ceil(Math.random() * 80) - 100);
    self.reset();
  }
  
  self.array_element = function() {
    return self.toFind();
  }
  
  self.array_get2 = function(i) {
    return self.to_find()[i];
  }
  
  self.array_length2 = function() {
    return self.to_find().length;
  }
  
  

  self.reset = function() {
    self.variables.removeAll();
    var seed = self.seed();
    self.interpreter = null;
    self.succeeded(false);
    self.steps(0);
    self.array.removeAll();
    
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var ar = [];
    var a2 = [];
    var rng = new MersenneTwister(seed);
    
    for (var i=0; i<self.n(); i++) {
      ar.push(possible.charAt(Math.floor(rng.random() * possible.length)));
    }
    var l = Math.floor(Math.max(1, rng.random() * self.n()));
    if (rng.random() > 0.5) {
      for (var i=0; i<l; i++) {
        a2.push(possible.charAt(Math.floor(rng.random() * possible.length)));
      }
    } else {
      var x = self.n() - l;
      var j = 0;
      for (var i=x; i<self.n(); i++) {
        a2.push(ar[i]);
        j ++;
      }
    }
    if (self.endchar()) {
      ar.push('$');
      a2.push('$');
    }
    self.array(ar);
    self.to_find(a2);
  }
  
  self.initApi = function(interpreter, scope) {
    console.log('here');
    // Alert
    var wrapper = function(text) {
      text = text ? text.toString() : '';
      return interpreter.createPrimitive(alert(text));
    };
    interpreter.setProperty(scope, 'alert',
        interpreter.createNativeFunction(wrapper));

    var wrapper = function(text) {
      return interpreter.createPrimitive(console.log(text));
    };
    interpreter.setProperty(scope, 'log',
        interpreter.createNativeFunction(wrapper));


    // Prompt
    wrapper = function(text) {
      text = text ? text.toString() : '';
      return interpreter.createPrimitive(prompt(text));
    };
    interpreter.setProperty(scope, 'prompt',
        interpreter.createNativeFunction(wrapper));

    // Swap
    wrapper = function(i,j) {
      return interpreter.createPrimitive(self.swap(i,j));
    };
    interpreter.setProperty(scope, 'swap',
        interpreter.createNativeFunction(wrapper));

    // Length
    wrapper = function() {
      return interpreter.createPrimitive(self.array_length());
    };
    interpreter.setProperty(scope, 'length',
        interpreter.createNativeFunction(wrapper));
        
    // Length
    wrapper = function() {
      return interpreter.createPrimitive(self.array_length2());
    };
    interpreter.setProperty(scope, 'length2',
        interpreter.createNativeFunction(wrapper));    
      
    // Length
    wrapper = function() {
      return interpreter.createPrimitive(self.array_element());
    };
    interpreter.setProperty(scope, 'element',
        interpreter.createNativeFunction(wrapper));

      
    // Get
    wrapper = function(i) {
      return interpreter.createPrimitive(self.array_get(i));
    };
    interpreter.setProperty(scope, 'get',
        interpreter.createNativeFunction(wrapper));

    // Get
    wrapper = function(i) {
      return interpreter.createPrimitive(self.array_get2(i));
    };
    interpreter.setProperty(scope, 'get2',
        interpreter.createNativeFunction(wrapper));

    // Set
    wrapper = function(i,v) {
      return interpreter.createPrimitive(self.array_set(i,v));
    };
    interpreter.setProperty(scope, 'set',
        interpreter.createNativeFunction(wrapper));

    // highlighting blocks.
    var wrapper = function(id) {
      id = id ? id.toString() : '';
      return interpreter.createPrimitive(self.highlightBlock(id));
    };
    interpreter.setProperty(scope, 'highlightBlock',
        interpreter.createNativeFunction(wrapper));
  
    // update variables
    var wrapper = function(id, data) {
      self.update(id, data.data);
      return null;
    };
    interpreter.setProperty(scope, 'update',
        interpreter.createNativeFunction(wrapper));
  }

  self.newProblem();  
  
}
FindModel.prototype = Object.create(Model.prototype);

FindModel.prototype.init = function() {
  Object.getPrototypeOf(FindModel.prototype).init.call(this);
}