function SortModel() {
  var self = this;

  Model.call(self);
  
  self.title("Blocky Plain");
  
  self.reverse = ko.observable(false); 
  
  self.checkSucceeded = function() {
    var valid = true;
    var rev = self.reverse();
    for (var i=1; i<self.array().length; i++) {
      if ((!rev & self.array()[i-1] > self.array()[i]) ||
          (rev & self.array()[i-1] < self.array()[i]) ) {
        valid = false;
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
SortModel.prototype = Object.create(Model.prototype);

SortModel.prototype.init = function() {
  Object.getPrototypeOf(SortModel.prototype).init.call(this);
}