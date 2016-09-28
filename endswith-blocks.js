Blockly.Blocks['array_swap'] = {
  /**
   * Block for 'for' loop.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "Swap %1 and %2",
      "args0": [
        {
          "type": "input_value",
          "name": "FROM",
          "check": "Number",
          "align": "RIGHT"
        },
        {
          "type": "input_value",
          "name": "TO",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.lists.HUE,
      "helpUrl": Blockly.Msg.CONTROLS_FOR_HELPURL
    });
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return Blockly.Msg.CONTROLS_FOR_TOOLTIP.replace('%1',
          thisBlock.getFieldValue('VAR'));
    });
  }
};

Blockly.JavaScript['array_swap'] = function(block) {
  var FROM = Blockly.JavaScript.valueToCode(block, 'FROM',
      Blockly.JavaScript.ORDER_NONE) || '\'\'';
  var TO = Blockly.JavaScript.valueToCode(block, 'TO',
      Blockly.JavaScript.ORDER_NONE) || '\'\'';
  
  return 'swap(' + FROM + ',' + TO + ');\n';
};

Blockly.Blocks['text_get'] = {
  /**
   * Block for 'for' loop.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "s[%1]",
      "args0": [
        {
          "type": "input_value",
          "name": "INDEX",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "inputsInline": true,
      "output": "String",
      "colour": Blockly.Blocks.lists.HUE,
      "helpUrl": Blockly.Msg.CONTROLS_FOR_HELPURL
    });
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return Blockly.Msg.CONTROLS_FOR_TOOLTIP.replace('%1',
          thisBlock.getFieldValue('VAR'));
    });
  }
};

Blockly.JavaScript['text_get'] = function(block) {
  var INDEX = Blockly.JavaScript.valueToCode(block, 'INDEX',
      Blockly.JavaScript.ORDER_NONE) || '\'\'';
  return ['get(' + INDEX + ')', Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['text2_get'] = {
  /**
   * Block for 'for' loop.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "e[%1]",
      "args0": [
        {
          "type": "input_value",
          "name": "INDEX",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "inputsInline": true,
      "output": "String",
      "colour": Blockly.Blocks.lists.HUE,
      "helpUrl": Blockly.Msg.CONTROLS_FOR_HELPURL
    });
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return Blockly.Msg.CONTROLS_FOR_TOOLTIP.replace('%1',
          thisBlock.getFieldValue('VAR'));
    });
  }
};

Blockly.JavaScript['text2_get'] = function(block) {
  var INDEX = Blockly.JavaScript.valueToCode(block, 'INDEX',
      Blockly.JavaScript.ORDER_NONE) || '\'\'';
  return ['get2(' + INDEX + ')', Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['array_set'] = {
  /**
   * Block for 'for' loop.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "Set %1 %2",
      "args0": [
        {
          "type": "input_value",
          "name": "INDEX",
          "check": "Number",
          "align": "RIGHT"
        },
        {
          "type": "input_value",
          "name": "VALUE",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "inputsInline": true,
      "colour": Blockly.Blocks.lists.HUE,
      "helpUrl": Blockly.Msg.CONTROLS_FOR_HELPURL
    });
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return Blockly.Msg.CONTROLS_FOR_TOOLTIP.replace('%1',
          thisBlock.getFieldValue('VAR'));
    });
  }
};

Blockly.JavaScript['array_set'] = function(block) {
  var INDEX = Blockly.JavaScript.valueToCode(block, 'INDEX',
      Blockly.JavaScript.ORDER_NONE) || '\'\'';
  var VALUE = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_NONE) || '\'\'';    
  return 'set(' + INDEX + ', ' + VALUE + ');\n';
};

Blockly.Blocks['array_length'] = {
  /**
   * Block for list length.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "Len(s)",
      "args0": [
      ],
      "output": 'Number',
      "colour": Blockly.Blocks.lists.HUE
    });
  }
};

Blockly.JavaScript['array_length'] = function(block) {
  return ['length()', Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['array_length2'] = {
  /**
   * Block for list length.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "Len(e)",
      "args0": [
      ],
      "output": 'Number',
      "colour": Blockly.Blocks.lists.HUE
    });
  }
};

Blockly.JavaScript['array_length2'] = function(block) {
  return ['length2()', Blockly.JavaScript.ORDER_ATOMIC];
};


Blockly.Blocks['array_element'] = {
  /**
   * Block for list length.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "Element",
      "args0": [
      ],
      "output": 'Number',
      "colour": Blockly.Blocks.lists.HUE
    });
  }
};

Blockly.JavaScript['array_element'] = function(block) {
  return ['element()', Blockly.JavaScript.ORDER_ATOMIC];
};