function FindModel() {
  var self = this;
  Model.call(this);
  
  self.title("Blockly Find");
  self.problem = ko.computed(function() {
    return "Define an algorithm that determines the index in the shown array where the corresponding element has the value of the searched element. Store this index in a variable called 'output'";
  }, self);
  
  
  self.checkSucceeded = function() {
    var valid = false;
    var idx = -1;
    for (var i=0; i<self.array().length; i++) {
      if (self.array()[i] == self.toFind()) {
        idx = i;
        break;
      }
    }
    for (var i=0; i<self.variables().length; i++) {
      if (self.variables()[i].name() == "output") {
        if (self.variables()[i].val() == idx) {
          valid = true;
        }
        break;
      }
    };
    self.succeeded(valid);
  }

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

  self.reset = function() {
    var seed = self.seed();
    self.interpreter = null;
    self.succeeded(false);
    self.steps(0);
    self.array.removeAll();
    var rng = null;
    if (seed < 0) {
      var plus = (seed > -20) ? 1.0 : -1.0;
      var rng = new MersenneTwister(Math.abs(seed));
      var ar = [];
      var last = 0;
      var ma = -1E6;
      var mi = 1E6;
      for (var i=0; i<self.n(); i++) {
        last += rng.random() * 50 * plus;
        if (last>ma) ma = last;
        if (last<mi) mi = last;
        ar.push(last);
      }
      range = rng.random() * 40 + 50;
      for (var x in ar) {
        self.array.push( Math.floor((ar[x]-mi) / (ma-mi) * range));
      }
    } else {
      var rng = new MersenneTwister(seed);
      for (var i=0; i<self.n(); i++) {
        self.array.push(Math.round(Math.ceil(rng.random() * 90) + 10))
      }  
    }
    if (rng == null)
      rng = new MersenneTwister(seed);
    self.toFind(self.array()[Math.floor(rng.random() * self.n())]);
  }
  
  self.toFind = ko.observable(123);

  self.newProblem();  
  
}
FindModel.prototype = Object.create(Model.prototype);

FindModel.prototype.init = function() {
  Object.getPrototypeOf(FindModel.prototype).init.call(this);
}