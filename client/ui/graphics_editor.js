/*global window, nodeca, Raphael, jQuery, Handlebars, Backbone, $, _*/


"use strict";

module.exports = Backbone.View.extend({
  el: '#glyph-graphics-edit',

  initialize: function () {
    var width = 320,
      height = 240,
      $grid_size_slider,
      $grid_size_text;
//    debugger;
    var r = Raphael('graphics-edit-canvas', width, height);
    //r.circle(80, 80, 60).animate({fill: "#0f0", stroke: "#00f", "stroke-width": 80, "stroke-opacity": 0.5}, 5000);

    Raphael.fn.drawGrid = function (x, y, w, h, wv, hv, color) {
      color = color || "#000";
      var path = ["M", Math.round(x) + .5, Math.round(y) + .5, "L", Math.round(x + w) + .5, Math.round(y) + .5, Math.round(x + w) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y) + .5],
        rowHeight = h / hv,
        columnWidth = w / wv;
      for (var i = 1; i < hv; i++) {
        path = path.concat(["M", Math.round(x) + .5, Math.round(y + i * rowHeight) + .5, "H", Math.round(x + w) + .5]);
      }
      for (i = 1; i < wv; i++) {
        path = path.concat(["M", Math.round(x + i * columnWidth) + .5, Math.round(y) + .5, "V", Math.round(y + h) + .5]);
      }
      return this.path(path.join(",")).attr({stroke: color});
    };

    Raphael.fn.drawEditGrid = function () {
      var n = $grid_size_slider.slider("value");
      this.clear();
      this.drawGrid(0, 0, width-1, height-1, n, n, '#030');
    };


    $grid_size_text = $('#grid-size-text');
    $grid_size_text.change(function () {
      $grid_size_slider.slider("value", ~~$grid_size_text.val());
      $grid_size_text.val($grid_size_slider.slider("value"));
      r.drawEditGrid();
    });

    $grid_size_slider = $('#grid-size-slider').slider({
      orientation:  'horizontal',
      range:        'min',
      value:        nodeca.config.app.editor.grid_size.val,
      min:          nodeca.config.app.editor.grid_size.min,
      max:          nodeca.config.app.editor.grid_size.max,
      slide:        function (event, ui) {
        /*jshint bitwise:false*/
        var val = ~~ui.value;
        $grid_size_text.val(val);
        //self.trigger("change:glyph-size", val);
        r.drawEditGrid();
      }
    });

    $grid_size_text.val($grid_size_slider.slider("value"));
    r.drawEditGrid();
  }
});
