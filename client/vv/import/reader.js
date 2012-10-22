/*global $, nodeca*/

"use strict";

//
// Read input file data & add glyphs to custom font.
// Notify error if wrong data
//

module.exports.read = function (data) {
  try {
  	var glyphs;
    if (nodeca.client.vv.import.svg.font_reader.checkFontData(data))
    {
    	glyphs = nodeca.client.vv.import.svg.font_reader.readFont(data);
    }
    else
    {
    	glyphs = [nodeca.client.vv.import.svg.svg_reader.readGlyph(data)];
    }
    nodeca.client.vv.font.util.customFontAddGlyphs(fonts, glyphs);
  } catch (err) {
    nodeca.client.util.notify('error',
      nodeca.client.render('errors.bad-svg', {
        error: (err.message || err.toString())
      }));
    return;
  }
};
