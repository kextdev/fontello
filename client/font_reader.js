/*global nodeca, _, $*/

"use strict";

var custom_font = null;

// SVG util

// Calculate the bounding box of an element with respect to its parent element

var transformedBoundingBox = function (el){
  var bb  = el.getBBox(),
      svg = el.ownerSVGElement,
      m   = el.getTransformToElement(el.parentNode);
  var pts = [
    svg.createSVGPoint(), svg.createSVGPoint(),
    svg.createSVGPoint(), svg.createSVGPoint()
  ];
  pts[0].x=bb.x;          pts[0].y=bb.y;
  pts[1].x=bb.x+bb.width; pts[1].y=bb.y;
  pts[2].x=bb.x+bb.width; pts[2].y=bb.y+bb.height;
  pts[3].x=bb.x;          pts[3].y=bb.y+bb.height;

  var xMin=Infinity,xMax=-Infinity,yMin=Infinity,yMax=-Infinity;
  pts.forEach(function(pt){
    pt = pt.matrixTransform(m);
    xMin = Math.min(xMin,pt.x);
    xMax = Math.max(xMax,pt.x);
    yMin = Math.min(yMin,pt.y);
    yMax = Math.max(yMax,pt.y);
  });

  bb.x = xMin; bb.width  = xMax-xMin;
  bb.y = yMin; bb.height = yMax-yMin;
  return bb;
};

// SVG

var svgGetBB = function (data) {
  var $svg = $(data);

  var $g = $svg.children('g');

  // create temporrary view
  // required for getBB

  var tmp = 'svg_glyph_selector';
  $('body').append('<div id="'+tmp+'" style="width:100px; height:100px; visibility:hidden;"/>');
  var $view = $('#'+tmp);
  $view.append($svg);

  var box = transformedBoundingBox($g[0]);

  // remove temporrary view

  $view.remove();

  return box;
};

// get groups

var svgGetGroups = function (xml) {
  var groups = {
    $draw : $('#groupDraw', xml),
    $user : $('#groupUser', xml),
    $center : $('#groupCenter', xml),
    $view : $('#groupView', xml)
  };

  return groups;
};

module.exports.svgGetGroups = svgGetGroups;

// create groups
// groups example:
//              -> 10, 10, 200, 2000    # input bounding box
//  groupView   -> 0, 0, 1000, 1000     # fix to default view
//  groupCenter -> -500, -800           # move to center for user transform
//  groupUser   -> dx(-200, 100) sx(0.5)
//  groupDraw   -> +500, +800           # return for draw
//              -> 0, 0, 1000, 1000     # output


var svgCreateGroups = function (xml) {
  var xmlns="http://www.w3.org/2000/svg";
  var $svg = $('svg', xml);

  var groupDraw = document.createElementNS(xmlns, "g");
  groupDraw.setAttribute('id', 'groupDraw');
  $svg.append(groupDraw);
  
  var groupUser = document.createElementNS(xmlns, "g");
  groupUser.setAttribute('id', 'groupUser');
  groupDraw.appendChild(groupUser);

  var groupCenter = document.createElementNS(xmlns, "g");
  groupCenter.setAttribute('id', 'groupCenter');
  groupUser.appendChild(groupCenter);

  var groupView = document.createElementNS(xmlns, "g");
  groupView.setAttribute('id', 'groupView');
  groupCenter.appendChild(groupView);
};

// fix loaded glyph

var svgFixGlyph = function (data) {
  var xml = $.parseXML(data);

//  console.log(data);

  var $svg = $('svg', xml);
  var $g = $svg.children('g');
  var $paths = $svg.children('path');

  // create transform groups

  svgCreateGroups(xml);

  var groups = svgGetGroups(xml);

  // add graphics to new group

  groups.$view.append($g);
  groups.$view.append($paths);

  // get xml string for fixed svg
  var graphics = new XMLSerializer().serializeToString(xml);

  // calclulate view transform

  var bb = svgGetBB(graphics);
  var view = {x:0, y:0, width:1000, height:1000};

  var dx, dy;
  var scale;
  
  dx = view.x - bb.x;
  dy = view.y - bb.y;

  scale = bb.width > bb.height ? view.width / bb.width : view.height / bb.height;

  // apply view transform
  groups.$view.attr({transform:'translate('+dx+','+dy+') scale('+scale+')'});

  var graphics = new XMLSerializer().serializeToString(xml);

  return graphics;
};

// Reader util

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
    graphics : svgFixGlyph(data),
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
