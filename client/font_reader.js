/*global nodeca, _, $*/

"use strict";

var custom_font = null;

// create empty custom font template

var createCustomFont = function () {
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


var findCustomFont = function (fonts) {
  var font = null;
  fonts.each(function (f) {
    if (f.isEditable()) {
      font = f;
    }
  });
  return font;
};

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

var customFontAddGlyph = function (fonts, glyph) {
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


// todo - readSVGFontGlyphs

var readSVGFontGlyphs = function (data) {

};

// todo - loadSVGFont

var loadSVGFont = function (data) {
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

var loadSVGGlyph = function (data) {
  var code = 0;
  var glyph = {
    graphics : data,
    search  : [],
    code    : code,
    uid     : '',
    file    : '',
    css     : ''
  };
  return glyph;
};

module.exports.loadSVGData = function (fonts, data) {
  try {
    var glyph = loadSVGGlyph(data);
    customFontAddGlyph(fonts, glyph);
  } catch (err) {
    nodeca.client.util.notify('error',
      nodeca.client.render('errors.bad-svg', {
        error: (err.message || err.toString())
      }));
    return;
  }
};
