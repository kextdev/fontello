/*global $, nodeca*/

"use strict";

//
// Return true if data is font
//

module.exports.checkFontData = function (data) {

};

//
// Read font object from data
//

module.exports.readFont = function (data) {
  var font = custom_font;
  var xml = $.parseXML(data);

//    nodeca.shared.glyphs_map[font.font.fontname][glyph.uid] = glyph.code;

//    var glyphs_map = nodeca.shared.glyphs_map[font.font.fontname];
//    glyphs_map[glyph.uid] = glyph.code;

  var $font_face = $('font-face:first', xml);
  var descent = parseInt($font_face.attr('descent'));
  var ascent = parseInt($font_face.attr('ascent'));
  var glyph_width = parseInt($font.attr('horiz-adv-x'));

};

//
// Read glyph object from font
//

var readGlyph = function (font, source) {

};



