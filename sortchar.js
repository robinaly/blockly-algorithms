function SortModel() {
  var self = this;
  self.prefix = 'xyz';
  Model.call(self);
  
  self.title("Blocky Sort Characters");
  
  
  self.reverse = ko.observable(false); 
  self.problem = ko.computed(function() {
    if (self.reverse()) {
      return "Define an algorithm in blockly that sorts the array below in descending order.";
    } else {
      return "Define an algorithm in blockly that sorts the array below in ascending order.";
    }
  }, self);
  
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
    
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var ar = [];
    var rng = new MersenneTwister(seed);
    for (var i=0; i<self.n(); i++) {
      ar.push(possible.charAt(Math.floor(rng.random() * possible.length)));
    }
    
    if (seed < 0) {
      if (seed > -20) {
        ar.sort()
      } else {
        ar.sort(function(a,b) { b-a;});
      }
    }
    self.array(ar);
  }

  self.newProblem();  
}
SortModel.prototype = Object.create(Model.prototype);

SortModel.prototype.init = function() {
  Object.getPrototypeOf(SortModel.prototype).init.call(this);
}