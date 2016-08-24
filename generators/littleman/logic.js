/**
 * @license
 * Visual Blocks Language
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

/**
 * @fileoverview Generating JavaScript for logic blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.LittleMan.logic');

goog.require('Blockly.LittleMan');


Blockly.LittleMan['controls_if'] = function(block) {
  // If/elseif/else condition.
  var n = 0;
  var code = '';
  // generate end labels
  var endlabels = [];
  for (n = 0; n <= block.elseifCount_; n++) {
    endlabels.push(Blockly.LittleMan.getLabel('if'));
    if (n>0) {
      code += '\n' + Blockly.LittleMan.instruction3(endlabels[n-1], 'LDA', 'one');
    }
    code += '\n' + Blockly.LittleMan.instruction1('// if condition ' + n);
    code += Blockly.LittleMan.valueToCode(block, 'IF' + n, Blockly.LittleMan.ORDER_NONE) || 'false';
    code += '\n' + Blockly.LittleMan.instruction2('BRP', endlabels[n]);
    code += '\n' + Blockly.LittleMan.instruction1('// branch if ' + n);
    code += Blockly.LittleMan.statementToCode(block, 'DO' + n);
  }
  // else
  if (block.elseCount_) {
    code += '\n' + Blockly.LittleMan.instruction1('// else');
    code += '\n' + Blockly.LittleMan.instruction3(endlabels[n-1], 'LDA', 'one');
    code += Blockly.LittleMan.statementToCode(block, 'ELSE');
  } else {
    code += '\n' + Blockly.LittleMan.instruction1('// null operation ' + n);
    code += '\n' + Blockly.LittleMan.instruction3(endlabels[n-1], 'LDA', 'one');
  }
  return code;
};

Blockly.LittleMan['logic_compare'] = function(block) {
  // Comparison operator.
  var OPERATORS = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var order = (operator == '==' || operator == '!=') ?
      Blockly.LittleMan.ORDER_EQUALITY : Blockly.LittleMan.ORDER_RELATIONAL;
  
  var code = "";
  
  var A = block.getInputTargetBlock('A');
  var address0 = Blockly.LittleMan.getAddress(A);
  if (address0 == null) {
    address0 = Blockly.LittleMan.makeTemp('0');
    code += '\n' + Blockly.LittleMan.instruction1("// calculate comparator 1 and store in " + address0);
    code += Blockly.LittleMan.valueToCode(block, 'A', order);
    code += '\n' + Blockly.LittleMan.instruction2('STA', address0);
  } else {
    code += '\n' + Blockly.LittleMan.instruction1("// comparator 1 already calculated in " + address0);
  }
  
  var B = block.getInputTargetBlock('B');
  var address1 = Blockly.LittleMan.getAddress(B);
  if (address1 == null) {    
    address1 = Blockly.LittleMan.makeTemp('0');
    code += '\n' + Blockly.LittleMan.instruction1("// calculate comparator 2 and store in " + address1);
    code += Blockly.LittleMan.valueToCode(block, 'B', order);
    code += '\n' + Blockly.LittleMan.instruction2('STA', address1);
  } else {
    code += '\n' + Blockly.LittleMan.instruction1("// comparator 2 already calculated in " + address1);
  }
  
  if (operator == "==") {
    code += '\n' + Blockly.LittleMan.instruction2('LDA', address0);
    code += '\n' + Blockly.LittleMan.instruction2('SUB', address1);
  } else if (operator == "!=") {
    var lbl1 = Blockly.LittleMan.getLabel('ifequal');
    var lbl2 = Blockly.LittleMan.getLabel('ifunequal');
    var tmp = Blockly.LittleMan.makeTemp('0');
    code += '\n' + Blockly.LittleMan.instruction2('LDA', address0);
    code += '\n' + Blockly.LittleMan.instruction2('SUB', address1);    
    code += '\n' + Blockly.LittleMan.instruction2('BRZ', lbl1);
    code += '\n' + Blockly.LittleMan.instruction2('LDA', 'zero');
    code += '\n' + Blockly.LittleMan.instruction2('BRA', lbl2);
    code += '\n' + Blockly.LittleMan.instruction3(lbl1, 'LDA', 'one');

    code += '\n' + Blockly.LittleMan.instruction3(lbl2, 'STA', tmp);
  }
  return [code, order];
};

Blockly.LittleMan['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? '&&' : '||';
  var order = (operator == '&&') ? Blockly.LittleMan.ORDER_LOGICAL_AND :
      Blockly.LittleMan.ORDER_LOGICAL_OR;
  var argument0 = Blockly.LittleMan.valueToCode(block, 'A', order);
  var argument1 = Blockly.LittleMan.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'false';
    argument1 = 'false';
  } else {
    // Single missing arguments have no effect on the return value.
    var defaultArgument = (operator == '&&') ? 'true' : 'false';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.LittleMan['logic_negate'] = function(block) {
  // Negation.
  var order = Blockly.LittleMan.ORDER_LOGICAL_NOT;
  var argument0 = Blockly.LittleMan.valueToCode(block, 'BOOL', order) ||
      'true';
  var code = '!' + argument0;
  return [code, order];
};

Blockly.LittleMan['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Blockly.LittleMan.ORDER_ATOMIC];
};

Blockly.LittleMan['logic_null'] = function(block) {
  // Null data type.
  return ['null', Blockly.LittleMan.ORDER_ATOMIC];
};

Blockly.LittleMan['logic_ternary'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.LittleMan.valueToCode(block, 'IF',
      Blockly.LittleMan.ORDER_CONDITIONAL) || 'false';
  var value_then = Blockly.LittleMan.valueToCode(block, 'THEN',
      Blockly.LittleMan.ORDER_CONDITIONAL) || 'null';
  var value_else = Blockly.LittleMan.valueToCode(block, 'ELSE',
      Blockly.LittleMan.ORDER_CONDITIONAL) || 'null';
  var code = value_if + ' ? ' + value_then + ' : ' + value_else;
  return [code, Blockly.LittleMan.ORDER_CONDITIONAL];
};
