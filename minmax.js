function MinMaxModel() {
  var self = this;

  Model.call(self);
  
  self.title("Blockly MinMax");
  
  self.minimum = ko.observable(true); 
  
  self.checkSucceeded = function() {
    var valid = false;
    var min = self.minimum();
    var mi = 1E6;
    var ma = -1E6;
    var ar = self.array();
    for (var i=0; i<ar.length; i++) {
      if (mi>ar[i]) mi = ar[i];
      if (ma<ar[i]) ma = ar[i];
    };
    for (var i=0; i<self.variables().length; i++) {
      if (self.variables()[i].name() == "output") {
        if ((self.variables()[i].val() == mi && min) ||
            (self.variables()[i].val() == ma && !min)) {
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

  }

  self.newProblem();  
}
MinMaxModel.prototype = Object.create(Model.prototype);

MinMaxModel.prototype.init = function() {
  Object.getPrototypeOf(MinMaxModel.prototype).init.call(this);
}