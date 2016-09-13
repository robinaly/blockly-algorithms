function SortModel() {
  var self = this;
  self.prefix = 'xyz';
  Model.call(self);
  
  self.title("Blocky Sort Animals");
  
  self.reverse = ko.observable(false); 
  self.problem = ko.computed(function() {
    if (self.reverse()) {
      return "Define an algorithm that sorts the array of animals below in descending order according to their weights:";
    } else {
      return "Define an algorithm that sorts the array of animals below in ascending order according to their weights:";
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
  
  self.animalsLookup = {
    'Tiger': 303,
    'Elephant': 2721,
    'Turtle': 249,
    'Pelican': 14,
    'Mouse': 0.019,
    'Dog': 68,
    'Horse': 453 
  }
  
  self.animals = Object.keys(self.animalsLookup);
  self.weights = [];
  for (var x in self.animals) {
    self.weights.push(self.animalsLookup[self.animals[x]]);
  }

  self.reset = function() {
    var seed = self.seed();
    self.interpreter = null;
    self.succeeded(false);
    self.steps(0);
    self.array.removeAll();
    
    var keys = self.animals;
    var ar = [];
    var rng = new MersenneTwister(seed);
    for (var i=0; i<self.n(); i++) {
      ar.push(keys[Math.floor(rng.random() * keys.length)]);
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