Blockly.Blocks['alg_input'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Input");
    this.appendValueInput("Description")
        .setCheck(null)
        .appendField("Name");
    this.appendStatementInput("Input")
        .setCheck(null);
    this.setNextStatement(true, null);
    this.setColour(65);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['alg_input'] = function(block) {
  var value_description = Blockly.JavaScript.valueToCode(block, 'Description', Blockly.JavaScript.ORDER_ATOMIC);
  var statements_input = Blockly.JavaScript.statementToCode(block, 'Input');
  // TODO: Assemble JavaScript into code variable.
  var code = '...;\n';
  return code;
};

Blockly.Blocks['alg_output'] = {
  init: function() {
    this.appendValueInput("Description")
        .setCheck(null)
        .appendField("Output");
    this.setPreviousStatement(true, null);
    this.setColour(65);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['alg_output'] = function(block) {
  var value_description = Blockly.JavaScript.valueToCode(block, 'Description', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '...;\n';
  return code;
};

Blockly.Blocks['math_plusminus'] = {
  /**
   * Block for basic arithmetic operator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 %2 %3",
      "args0": [
        {
          "type": "input_value",
          "name": "A",
          "check": "Number"
        },
        {
          "type": "field_dropdown",
          "name": "OP",
          "options":
            [[Blockly.Msg.MATH_ADDITION_SYMBOL, 'ADD'],
             [Blockly.Msg.MATH_SUBTRACTION_SYMBOL, 'MINUS']]
        },
        {
          "type": "input_value",
          "name": "B",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "output": "Number",
      "colour": Blockly.Blocks.math.HUE,
      "helpUrl": Blockly.Msg.MATH_ARITHMETIC_HELPURL
    });
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('OP');
      var TOOLTIPS = {
        'ADD': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_ADD,
        'MINUS': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MINUS,
      };
      return TOOLTIPS[mode];
    });
  }
};

Blockly.JavaScript['math_plusminus'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    'ADD': [' + ', Blockly.JavaScript.ORDER_ADDITION],
    'MINUS': [' - ', Blockly.JavaScript.ORDER_SUBTRACTION],
    'MULTIPLY': [' * ', Blockly.JavaScript.ORDER_MULTIPLICATION],
    'DIVIDE': [' / ', Blockly.JavaScript.ORDER_DIVISION],
    'POWER': [null, Blockly.JavaScript.ORDER_COMMA]  // Handle power separately.
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.JavaScript.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.JavaScript.valueToCode(block, 'B', order) || '0';
  var code;
  // Power in JavaScript requires a special case since it has no operator.
  if (!operator) {
    code = 'Math.pow(' + argument0 + ', ' + argument1 + ')';
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  }
  code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.Python['math_plusminus'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    'ADD': [' + ', Blockly.JavaScript.ORDER_ADDITION],
    'MINUS': [' - ', Blockly.JavaScript.ORDER_SUBTRACTION],
    'MULTIPLY': [' * ', Blockly.JavaScript.ORDER_MULTIPLICATION],
    'DIVIDE': [' / ', Blockly.JavaScript.ORDER_DIVISION],
    'POWER': [null, Blockly.JavaScript.ORDER_COMMA]  // Handle power separately.
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.JavaScript.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.JavaScript.valueToCode(block, 'B', order) || '0';
  var code;
  // Power in JavaScript requires a special case since it has no operator.
  if (!operator) {
    code = 'Math.pow(' + argument0 + ', ' + argument1 + ')';
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  }
  code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.LittleMan['math_plusminus'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    'ADD': ['ADD', Blockly.LittleMan.ORDER_ADDITION],
    'MINUS': ['SUB', Blockly.LittleMan.ORDER_SUBTRACTION]
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  
  var code = '';
    
  var B = block.getInputTargetBlock('B');
  var address1 = Blockly.LittleMan.getAddress(B);
  if (address1 == null) {
    address1 = Blockly.LittleMan.makeTemp('0');
    code += '\n' + Blockly.LittleMan.instruction1('// calculate math argument 2 ');
    code += Blockly.LittleMan.valueToCode(block, 'B', order) || '0';
    code += '\n' + Blockly.LittleMan.instruction2('STA', address1);
  }
  
  var A = block.getInputTargetBlock('A');
  var address0 = Blockly.LittleMan.getAddress(A);
  if (address0 == null) {
    code += '\n' + Blockly.LittleMan.instruction1('// calculate math argument 1 ');
    code += Blockly.LittleMan.valueToCode(block, 'A', order) || '0';
  } else {
    code += '\n' + Blockly.LittleMan.instruction2('LDA', address0);
  }
  
  code += '\n' + Blockly.LittleMan.instruction1('// mathematical operation ' + operator) +
          '\n' + Blockly.LittleMan.instruction2(operator, address1);
  return [code, order];
};