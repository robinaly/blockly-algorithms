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
 * @fileoverview Generating JavaScript for variable blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.LittleMan.variables');

goog.require('Blockly.LittleMan');


Blockly.LittleMan['variables_get'] = function(block) {
  // Variable getter.
  var varName = Blockly.LittleMan.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  var code = '\n' + Blockly.LittleMan.instruction2('LDA', varName);
  return [code, Blockly.LittleMan.ORDER_ATOMIC];
};

Blockly.LittleMan['variables_set'] = function(block) {
  // Variable setter.
  var argument0 = Blockly.LittleMan.valueToCode(block, 'VALUE',
      Blockly.LittleMan.ORDER_ASSIGNMENT) || '0';
  var varName = Blockly.LittleMan.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  return argument0 +
         '\n' +  Blockly.LittleMan.instruction2('STA', varName);
};
