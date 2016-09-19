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
 * @fileoverview Generating JavaScript for loop blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.LittleMan.loops');

goog.require('Blockly.LittleMan');


Blockly.LittleMan['controls_for'] = function(block) {
  // For loop.
  var variable0 = Blockly.LittleMan.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var branch = Blockly.LittleMan.statementToCode(block, 'DO');
  branch = Blockly.LittleMan.addLoopTrap(branch, block.id);
  
    
  var LAST = Blockly.LittleMan.makeTemp('0');
  var loop = Blockly.LittleMan.getLabel('loop');
  var finish = Blockly.LittleMan.getLabel('finish');
  
  var code = '';
  var FROM = block.getInputTargetBlock('FROM');
  var addressFrom = Blockly.LittleMan.getAddress(FROM);
  if (addressFrom == null) {
    addressFrom = Blockly.LittleMan.makeTemp('0');
    //code += '\n' + Blockly.LittleMan.instruction1('// calculate from');
    code += Blockly.LittleMan.valueToCode(block, 'FROM', Blockly.LittleMan.ORDER_ASSIGNMENT) || '0';
    code += '\n' + Blockly.LittleMan.instruction2('STA', addressFrom);
  }  

  var TO = block.getInputTargetBlock('TO');  
  var addressTo = Blockly.LittleMan.getAddress(TO);
  if (addressTo == null) {
    addressTo = Blockly.LittleMan.makeTemp('0');
    //code += '\n' + Blockly.LittleMan.instruction1('// calculate to');
    code += Blockly.LittleMan.valueToCode(block, 'TO', Blockly.LittleMan.ORDER_ASSIGNMENT) || '0';
    code += '\n' + Blockly.LittleMan.instruction2('STA', addressTo);
  }

  var BY = block.getInputTargetBlock('BY');  
  var addressBy = Blockly.LittleMan.getAddress(BY);
  if (addressBy == null) {
    addressBy = Blockly.LittleMan.makeTemp('0')
    //code += '\n' + Blockly.LittleMan.instruction1('// by');
    code += Blockly.LittleMan.valueToCode(block, 'BY', Blockly.LittleMan.ORDER_ASSIGNMENT) || '0';    
    code += '\n' + Blockly.LittleMan.instruction2('STA', addressBy);
  }
  
  //code += '\n' + Blockly.LittleMan.instruction1('// init loop variable');
  code += '\n' + Blockly.LittleMan.instruction2('LDA', addressFrom);
  code += '\n' + Blockly.LittleMan.instruction2('STA', variable0);
  //code += '\n' + Blockly.LittleMan.instruction1('// check condition');
  code += '\n' + Blockly.LittleMan.instruction3(loop, 'LDA', variable0)
  code += '\n' + Blockly.LittleMan.instruction2('SUB', addressTo);
  //code += '\n' + Blockly.LittleMan.instruction2('ADD', 'one');
  code += '\n' + Blockly.LittleMan.instruction2('BRP', finish);
  code += '\n' + branch; 
  //code += '\n' + Blockly.LittleMan.instruction1('// store last accumulator');
  code += '\n' + Blockly.LittleMan.instruction2('STA', LAST);
  //code += '\n' + Blockly.LittleMan.instruction1('// increase counter');
  code += '\n' + Blockly.LittleMan.instruction2('LDA', variable0);
  code += '\n' + Blockly.LittleMan.instruction2('ADD', addressBy);
  code += '\n' + Blockly.LittleMan.instruction2('STA', variable0);
  //code += '\n' + Blockly.LittleMan.instruction1('// repeat');
  code += '\n' + Blockly.LittleMan.instruction2('BRA', loop);
  //code += '\n' + Blockly.LittleMan.instruction1('// load last value');
  code += '\n' + Blockly.LittleMan.instruction3(finish, 'LDA', LAST);
  return code;
};

