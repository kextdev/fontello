/*global $, nodeca*/

"use strict";

//
// Create empty custom font template
//

module.exports.createCustomFont = function () {
  var font = {
    "font" : {
      'fontname'  : 'custom',
      'fullname'  : 'Custom font',
      'familyname': 'Custom font',
      'descent'   : -200,
      'ascent'    : 800,
      // fake
      'version'   : '1.0',
      'copyright' : '',
      'weight'    : 'Medium'
    },
    "meta" : {
      "github": "https://github.com/",
      "license": "",
      "author": "",
      "twitter": "http://twitter.com/",
      "email": "",
      "license_url": "",
      "css_prefix": "icon-",
      "homepage": "",
      "dribble": "",
      "columns": 4
    },
    'editable' : true,
    'glyphs' : []
  };

  // fix glyphs_map

  nodeca.shared.glyphs_map[font.font.fontname] = {};

  return font;
};

//
// Find custom font in fonts
//

var findCustomFont = function (fonts) {
  var font = null;
  fonts.each(function (f) {
    if (f.isEditable()) {
      font = f;
    }
  });
  return font;
};

// 
// Find or create custom font. (Font can load from session)
//

var getCustomFont = function (fonts) {
  if (!custom_font)
  {
    custom_font = findCustomFont(fonts);

    if (!custom_font) {
      var font = createCustomFont();
      fonts.add([font]);

      custom_font = findCustomFont(fonts);
    }
  }
  return custom_font;
};

//
// Custom font add glyphs array. Generate glyph UID and update glyphs_map
//

module.exports.customFontAddGlyphs = function (fonts, glyphs) {
  var font = getCustomFont(fonts);

  // todo - correct uid & code for undefined glyphs
  var glyphs = font._glyphs;
  glyph.uid = 'uid='+glyphs.length;
  glyph.code = glyphs.length;

  // update glyphs_map
  var fontname = font.get('font').fontname;
  nodeca.shared.glyphs_map[fontname][glyph.uid] = glyph.code;

  font.addGlyph(glyph);
};



