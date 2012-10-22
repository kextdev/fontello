/*global $, nodeca*/

"use strict";

//
// Return svg bounds
//

var readSvgHeader = function (data)
{

}

//
// Return graphics object 
//

var xmlToGraphics = function (data)
{

}

//
// Read glyph object from data
//

module.exports.readGlyph = function (data) {
  var code = 0;
  
  var glyph = {
    graphics : nodeca.client.import.svg_reader.xmlToGraphics(data),
    search  : [],
    code    : code,
    uid     : '',
    file    : '',
    css     : ''
  };
  
  return glyph;
};
