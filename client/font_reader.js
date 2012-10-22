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
  $('body').append('<div id="'+tmp+'"style="width:100px; height:100px; visibility:hidden;"/>');
  var $view = $('#'+tmp);
  $view.append($svg);

  var box = transformedBoundingBox($g[0]);

  // remove temporrary view

  $view.remove();

  return box;
};

module.exports.svgGetGroups = svgGetGroups;

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

