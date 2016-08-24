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
 * @fileoverview Generating JavaScript for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.LittleMan.procedures');

goog.require('Blockly.LittleMan');


Blockly.LittleMan['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  var funcName = Blockly.LittleMan.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.LittleMan.statementToCode(block, 'STACK');
  if (Blockly.LittleMan.STATEMENT_PREFIX) {
    branch = Blockly.LittleMan.prefixLines(
        Blockly.LittleMan.STATEMENT_PREFIX.replace(/%1/g,
        '\'' + block.id + '\''), Blockly.LittleMan.INDENT) + branch;
  }
  if (Blockly.LittleMan.INFINITE_LOOP_TRAP) {
    branch = Blockly.LittleMan.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var returnValue = Blockly.LittleMan.valueToCode(block, 'RETURN',
      Blockly.LittleMan.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = '  return ' + returnValue + ';\n';
  }
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.LittleMan.variableDB_.getName(block.arguments_[i],
        Blockly.Variables.NAME_TYPE);
  }
  var code = 'function ' + funcName + '(' + args.join(', ') + ') {\n' +
      branch + returnValue + '}';
  code = Blockly.LittleMan.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.LittleMan.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.LittleMan['procedures_defnoreturn'] =
    Blockly.LittleMan['procedures_defreturn'];

Blockly.LittleMan['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.LittleMan.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.LittleMan.valueToCode(block, 'ARG' + i,
        Blockly.LittleMan.ORDER_COMMA) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.LittleMan.ORDER_FUNCTION_CALL];
};

Blockly.LittleMan['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  var funcName = Blockly.LittleMan.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.LittleMan.valueToCode(block, 'ARG' + i,
        Blockly.LittleMan.ORDER_COMMA) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ');\n';
  return code;
};

Blockly.LittleMan['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.LittleMan.valueToCode(block, 'CONDITION',
      Blockly.LittleMan.ORDER_NONE) || 'false';
  var code = 'if (' + condition + ') {\n';
  if (block.hasReturnValue_) {
    var value = Blockly.LittleMan.valueToCode(block, 'VALUE',
        Blockly.LittleMan.ORDER_NONE) || 'null';
    code += '  return ' + value + ';\n';
  } else {
    code += '  return;\n';
  }
  code += '}\n';
  return code;
};
