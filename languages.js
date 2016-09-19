function LanguagesModel() {
  var self = this;
  self.prefix = 'xyz';
  Model.call(self);

  self.title("Blocky Little Man");

  self.checkSucceeded = function() {
  }

  self.javascript = ko.observable();
  self.php = ko.observable();
  self.python = ko.observable();
  self.lua = ko.observable();
  self.dart = ko.observable();

  self.update = function(e) {
    Blockly.JavaScript.STATEMENT_PREFIX = '';
    var code = Blockly.JavaScript.workspaceToCode(self.workspace);
    self.javascript(code);
    self.php(Blockly.PHP.workspaceToCode(self.workspace));
    self.python(Blockly.Python.workspaceToCode(self.workspace));
    self.lua(Blockly.Lua.workspaceToCode(self.workspace));
    self.dart(Blockly.Dart.workspaceToCode(self.workspace));
  }

  self.localInit = function() {
    self.workspace.addChangeListener(self.update);
  }
}
LanguagesModel.prototype = Object.create(Model.prototype);

LanguagesModel.prototype.init = function() {
  var self = this;
  Object.getPrototypeOf(LanguagesModel.prototype).init.call(this);
  //
}