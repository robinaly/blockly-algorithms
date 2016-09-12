/**
 * Blockly Demos: Code
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Blockly.JavaScript.STATEMENT_PREFIX = 'highlightBlock(%1);dumpVariables();\n';
// Blockly.JavaScript.addReservedWords('highlightBlock');
Blockly.JavaScript.STATEMENT_PREFIX = 'step(%1);\n';
Blockly.JavaScript.addReservedWords('dumpVariables,step,highlightBlock');



/**
 * Create a namespace for the application.
 */
var Model = function() {
var self = this;
self.doc = document;  

/**
 * Blockly's main workspace.
 * @type {Blockly.WorkspaceSvg}
 */
self.workspace = null;

self.clear = function() {
  self.workspace.clear();
  self.algorithm('');
}

self.runDelete = function() {
  if (self.algorithm() != '') {
    localStorage.removeItem(self.algorithm());
    alert("Deleted");
  }
  self.loadAlgorithms();
}

self.save = function() {
  var xml = Blockly.Xml.workspaceToDom(self.workspace);
  var text = Blockly.Xml.domToText(xml);
  var name = window.prompt("Please insert algorithm name");
  if (localStorage.getItem(name) != null) {
    var sure = window.prompt("Are you sure you want to overwrite?", "no");
    if (sure != "yes")
      return;
  } else {
    self.algorithms.push(name);
  }
  self.algorithm(name);
  localStorage.setItem(name,text);
  window.alert("Saved");
}

self.load = function(name) {
  var text = localStorage.getItem(name);
  var xmlDom = Blockly.Xml.textToDom(text);
  self.workspace.clear();
  Blockly.Xml.domToWorkspace(xmlDom, self.workspace);
  self.interpreter = null;
}

self.play = function() {
  self.logs.push("Play");
  if (!self.interpreter) {
    self.compile();
  }
  self.running(!self.running());
  self.run();
}

self.onestep = function() {
  while (!self.stepFound()) {
    if (!self.interpreter) return;
    if (!self.interpreter.step()) {
      self.running(false);
      self.interpreter = null;
      self.checkSucceeded();
      return false;
    }
  }
  self.steps(self.steps()+1);
  return true;
}

self.step = function() {
  self.running(false);
  if (self.interpreter) {
    self.stepFound(false);
    self.onestep();
  } else {
    self.compile();
  }
}

self.run = function() {
  self.stepFound(false);
  if (self.onestep() && self.running()) {
    setTimeout(self.run, self.speed());
  }
}

/* API */
self.swap = function(i,j) {
  var temp = self.array()[i];
  self.array()[i] = self.array()[j];
  self.array()[j] = temp;
  self.logs.push("Swapped " + i + " with " + j);
  self.array.valueHasMutated();
}

self.array_length = function() {
  return self.array().length;
}

self.array_get = function(i) {
  return self.array()[i];
}

self.array_set = function(i,v) {
  self.array()[i] = v;
  self.array.valueHasMutated();
}

self.highlightBlock = function(id) {
  self.workspace.highlightBlock(id);
}

self.update = function(data) {
  self.stepFound(true);
  self.variables.removeAll();
  var data = JSON.parse(data);
  self.data = data;
  var keys = Object.keys(data);
  keys.sort();
  for (var k in keys) {
    self.variables.push(
      new self.Variable(keys[k], data[keys[k]])
    );
  }
}

self.initApi = function(interpreter, scope) {
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
      
  // Get
  wrapper = function(i) {
    return interpreter.createPrimitive(self.array_get(i));
  };
  interpreter.setProperty(scope, 'get',
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
  
  // dump variables
  var wrapper = function(data) {
    self.update(data.data);
    return null;
    };
  interpreter.setProperty(scope, 'update',
      interpreter.createNativeFunction(wrapper));
}

self.compile = function() {
  self.succeeded(false);
  self.steps(0);
  self.logs.push("Compile");
  var code = Blockly.JavaScript.workspaceToCode(self.workspace);
  code += '\n\n';
  //code += "var data = {};\n"
  code += "function step(id) {\n";
  //code += "  if (data == undefined) data = {}\n";
  code += "  var data = {};\n";
  code += "  highlightBlock(id);\n";
  //code += "  var found = false;\n";
  for (var i in self.workspace.variableList) {
    var v = self.workspace.variableList[i];
    //code += "  if (" + v + "!= undefined && (data." + v + " == undefined || " + v + " !=  data." + v + ")) {\n";
    //code += "    found = true;\n";
    code += "    data." + v + " = " + v + ';\n';
    //code += "  }\n";
  }
  //code += '  if (found) {\n';
  code += '    update(JSON.stringify(data));\n';
  //code += '  }\n';
  code += '}\n';
  self.code(code);
  self.interpreter = new Interpreter(code, self.initApi);
}

self.checkSucceeded = function() {
  var valid = true;
  for (var i=1; i<self.array().length; i++) {
    if (self.array()[i-1] > self.array()[i]) {
      valid = false;
      break;
    }
  };
  if (valid) {
    self.succeeded(true);
  } else {
    self.succeeded(false);
  }
}

self.Variable = function(name, val) {
  var self = this;
  self.name = ko.observable(name);
  self.val = ko.observable(val);
}

self.newProblem = function() {
  self.seed(Math.ceil(Math.random() * 1000));
  self.reset();
}

self.sortedProblem = function() {
  self.seed(-1);
  self.reset();
}

self.invSortedProblem = function() {
  self.seed(-2);
  self.reset();
}

self.reset = function() {
  var seed = self.seed();
  self.interpreter = null;
  self.succeeded(false);
  self.steps(0);
  self.array.removeAll();
  
  if (seed == -1) {
    for (var i=0; i<self.n(); i++) {
      self.array.push(i);
    } 
  } else if (seed == -2) {
    for (var i=self.n(); i>=0; i--) {
      self.array.push(i);
    }
  } else {
    var rng = new MersenneTwister(seed);
    for (var i=0; i<self.n(); i++) {
      self.array.push(Math.round(Math.ceil(rng.random() * 90) + 10))
    }  
  }
}


self.changeAlgorithm = function() {
  self.load(self.algorithm());
}

self.loadAlgorithms = function() {
  /* saved games */
  var algorithms = ['']
  for (var i = 0; i < localStorage.length; i++){
      algorithms.push(localStorage.key(i));
  }
  self.algorithms(algorithms);
}

self.download = function() {
  var xml = Blockly.Xml.workspaceToDom(self.workspace);
  var text = Blockly.Xml.domToText(xml);
  
  download(text, self.algorithm()+".xml", "text/xml");
}

self.onUpload = function() {
  var fileInput = document.getElementById('fileInput');
  var file = fileInput.files[0];
	var textType = /text.*/;

	if (file.type.match(textType)) {
		var reader = new FileReader();

		reader.onload = function(e) {
      var xmlDom = Blockly.Xml.textToDom(reader.result);
      self.workspace.clear();
      Blockly.Xml.domToWorkspace(xmlDom, self.workspace);
      self.interpreter = null;
      self.algorithm('');
		}

		reader.readAsText(file);	
	} else {
    alert("error");
	}
}


/**
 * Initialize Blockly.  Called on page load.
 */
self.init = function() {
  // Interpolate translated messages into toolbox.
  var blocklyArea = self.doc.getElementById('blocklyArea');
  var blocklyDiv = self.doc.getElementById('blocklyDiv');
  self.workspace = Blockly.inject(
    blocklyDiv, {
      toolbox: self.doc.getElementById('toolbox')
    }
  );
  var onresize = function(e) {
    // Compute the absolute coordinates and dimensions of blocklyArea.
    var element = blocklyArea;
    var x = 0;
    var y = 0;
    do {
      x += element.offsetLeft;
      y += element.offsetTop;
      element = element.offsetParent;
    } while (element);
    // Position blocklyDiv over blocklyArea.
    blocklyDiv.style.left = x + 'px';
    blocklyDiv.style.top = y + 'px';
    blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
    blocklyDiv.style.height = blocklyArea.offsetHeight + 'px';
  };
  window.addEventListener('resize', onresize, false);
  onresize();
  Blockly.svgResize(self.workspace);
  self.workspace.traceOn(true);
  
  
  self.array = ko.observableArray();
  self.succeeded = ko.observable(false);
  self.n = ko.observable(20);
  self.seed = ko.observable(124);
  self.logs = ko.observableArray();
  self.code = ko.observable();
  self.variables = ko.observableArray();
  self.running = ko.observable(false);
  self.steps = ko.observable(0);
  self.stepFound = ko.observable(false);
  
  self.speeds = ko.observableArray([0,10,50,100,1000]);
  self.speed = ko.observable(0);
  
  self.algorithm = ko.observable();
  
  self.algorithms = ko.observableArray([]);
  self.loadAlgorithms();
  
  self.newProblem();
  
  var fileInput = document.getElementById('fileInput');
  fileInput.addEventListener('change', self.onUpload);
}

// Activates knockout.js

};

var model = null;
var init = function() {
  model = new Model();
  model.init();
  ko.applyBindings(model);
}

window.addEventListener('load', init);
