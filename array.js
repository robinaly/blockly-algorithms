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

self.workspace = null;

self.clear = function() {
  var answer = window.prompt("Are you sure you want to clear the workspace? (type yes)");
  if (answer == "yes") {
    self.workspace.clear();
    self.algorithm('');
  }
}

self.deleteBrowser = function() {
  if (self.algorithm() != '') {
    localStorage.removeItem(self.title() + ':' + self.algorithm());
    alert("Deleted");
  }
  self.loadAlgorithms();
}

self.saveBrowser = function() {
  var xml = Blockly.Xml.workspaceToDom(self.workspace);
  var text = Blockly.Xml.domToText(xml);
  var name = window.prompt("Please insert algorithm name");
  var prefix = self.title() + ':';
  var l = prefix.length;
  var nameVis = name;
  name = prefix + name;
  
  if (localStorage.getItem(name) != null) {
    var sure = window.prompt("Are you sure you want to overwrite?", "no");
    if (sure != "yes")
      return;
  } else {
    self.algorithms.push(nameVis);
  }
  self.algorithm(nameVis);
  localStorage.setItem(name, text);
  window.alert("Saved");
}

self.load = function(name) {
  var n = self.title() + ':' + name;
  var text = localStorage.getItem(n);
  var xmlDom = Blockly.Xml.textToDom(text);
  self.workspace.clear();
  Blockly.Xml.domToWorkspace(xmlDom, self.workspace);
  self.interpreter = null;
}

self.play = function() {
  if (!self.interpreter) {
    self.compile();
  }
  self.running(!self.running());
  self.run();
}

self.onestep = function() {
  try {
    while (!self.stepFound()) {
      if (!self.interpreter) return false;
      if (!self.interpreter.step()) {
        self.interpreter = null;
        self.running(false);
        self.checkSucceeded();
        return false;
      }
    }
    self.steps(self.steps()+1);
    return true;
  } catch (err) {
    self.interpreter = null;
    self.running(false);
    alert(err);
  }
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

self.update = function(id, data) {
  self.workspace.highlightBlock(id);
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

self.compile = function() {
  self.succeeded(false);
  self.steps(0);
  var code = Blockly.JavaScript.workspaceToCode(self.workspace);
  code += 'step("");\n';
  code += '\n\n';
  code += "function step(id) {\n";
  code += "  var data = {};\n";
  for (var i in self.workspace.variableList) {
    var v = self.workspace.variableList[i];
    code += "  data." + v + " = " + v + ';\n';
  }
  code += '  update(id, JSON.stringify(data));\n';
  code += '}\n';
  self.code(code);
  console.log(code);
  self.interpreter = new Interpreter(code, self.initApi);
}

self.Variable = function(name, val) {
  var self = this;
  self.name = ko.observable(name);
  self.val = ko.observable(val);
}

self.onChangeAlgorithm = function() {
  self.load(self.algorithm());
}

self.loadAlgorithms = function() {
  /* saved games */
  var algorithms = ['']
  var prefix = self.title() + ':';
  var l = prefix.length;
  for (var i = 0; i < localStorage.length; i++){
    var n = localStorage.key(i);
    if (n.startsWith(prefix)) {
      n = n.substring(l);
      algorithms.push(n);
    }
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
      fileInput.value = '';
    }
    reader.readAsText(file);
  } else {
    alert("error");
  }
}

self.upload = function() {
  $('#fileInput').click();
}


self.title = ko.observable();
self.problem = ko.observable();
self.array = ko.observableArray();
self.succeeded = ko.observable(false);
self.n = ko.observable(10);
self.seed = ko.observable(124);
self.code = ko.observable();
self.variables = ko.observableArray();
self.running = ko.observable(false);
self.steps = ko.observable(0);
self.stepFound = ko.observable(false);

self.speeds = ko.observableArray([0,10,50,100,1000]);
self.speed = ko.observable(0);

self.algorithm = ko.observable();
var fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', self.onUpload);

self.algorithms = ko.observableArray([]);

self.status = ko.computed(function() {
  if (self.running() && self.interpreter != null) {
    return "running";
  } else if (self.interpreter != null) {
    return "paused";
  } else {
    return "stopped";
  }
}, self);

self.onChange = function(event) {
  if (
      event.type == Blockly.Events.CHANGE ||
      event.type == Blockly.Events.MOVE ||
      event.type == Blockly.Events.CREATE
      ) {
    self.interpreter = null;
    self.running(false);
    self.steps(0);
  }
}

self.localInit = function() {

}

/**
 * Initialize Blockly. Called on page load.
 */
self.init = function() {
  // Interpolate translated messages into toolbox.
  var blocklyArea = self.doc.getElementById('blocklyArea');
  var blocklyDiv = self.doc.getElementById('blocklyDiv');
  self.workspace = Blockly.inject(
    blocklyDiv, {
      zoom: {
      controls: true,
      wheel: false,
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      scaleSpeed: 1.2,
      trashcan: true},
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
  self.workspace.addChangeListener(self.onChange);
  onresize();
  Blockly.svgResize(self.workspace);
  self.workspace.traceOn(true);
  
  self.loadAlgorithms();
  self.localInit(); 
}
};

