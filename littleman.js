function LMModel() {
  var self = this;
  self.prefix = 'xyz';
  Model.call(self);
  
  self.title("Blocky Little Man");
  
  self.checkSucceeded = function() {
  }
  
  self.littleman = ko.observable();
  
  self.toLittleMan = function() {
    var code = Blockly.LittleMan.workspaceToCode(self.workspace);
    self.littleman(code);
  };
}
LMModel.prototype = Object.create(Model.prototype);

LMModel.prototype.init = function() {
  Object.getPrototypeOf(LMModel.prototype).init.call(this);
}