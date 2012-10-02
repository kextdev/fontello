/*global window, nodeca, Raphael, jQuery, Handlebars, Backbone, $, _*/


"use strict";

module.exports = Backbone.View.extend({
  el: '#glyph-graphics-edit',
  glyph: null,
  r: null,
  element: null,
  grid: null,
  graphics: null,
  box: null,
  transform: null,

  initialize: function () {
    var width = 320,
      height = 240,
      $grid_size_slider,
      $grid_size_text;

    var r = Raphael('graphics-edit-canvas', width, height);

    this.r = r;

    //r.circle(80, 80, 60).animate({fill: "#0f0", stroke: "#00f", "stroke-width": 80, "stroke-opacity": 0.5}, 5000);

    // should move to raphael init

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

    $grid_size_text = $('#grid-size-text');
    $grid_size_text.change($.proxy(function () {
      $grid_size_slider.slider("value", ~~$grid_size_text.val());
      $grid_size_text.val($grid_size_slider.slider("value"));
      this.update();
    }, this));

    $grid_size_slider = $('#grid-size-slider').slider({
      orientation:  'horizontal',
      range:        'min',
      value:        nodeca.config.app.editor.grid_size.val,
      min:          nodeca.config.app.editor.grid_size.min,
      max:          nodeca.config.app.editor.grid_size.max,
      slide:        $.proxy(function (event, ui) {
        /*jshint bitwise:false*/
        var val = ~~ui.value;
        $grid_size_text.val(val);
        //self.trigger("change:glyph-size", val);
        this.update();
      }, this)
    });

    var $glyph_tx_text,
      $glyph_ty_text,
      $glyph_scale_text;

    $glyph_tx_text = $('#glyph-tx-text');
    $glyph_tx_text.change($.proxy(function () {
      this.transform.tx = $glyph_tx_text.val();
      this.update();
    }, this));

    $glyph_ty_text = $('#glyph-ty-text');
    $glyph_ty_text.change($.proxy(function () {
      this.transform.ty = $glyph_ty_text.val();
      this.update();
    }, this));

    $glyph_scale_text = $('#glyph-scale-text');
    $glyph_scale_text.change($.proxy(function () {
      this.transform.sx = this.transform.sy = $glyph_scale_text.val();
      this.update();
    }, this));

    $('#glyph-save-button').click($.proxy(function () {
      this.graphics.metrics.transform = this.transform;

      this.$el.modal('hide');
    }, this));

    $grid_size_text.val($grid_size_slider.slider("value"));
//    r.drawEditGrid();
  },

  editGlyph: function (g) {
    this.glyph = g;

    $('#glyph-name').val(g.get('css'));
    $('#glyph-code').val(g.get('code'));

    var graphics = g.get('graphics');

    this.graphics = graphics;
    this.box = graphics.metrics.box;
    this.transform = _.clone(graphics.metrics.transform);

    var f = g.get('font').get('font');

    var ascent = f.ascent;
    var descent = f.descent;
    var horiz_adv_x_glyph = graphics.horiz_adv_x;
//    var glyph_x_scale = horiz_adv_x_glyph / (ascent - descent);
//    var size = 16;
//    var size_x_glyph = Math.round(size * glyph_x_scale);
//    var size_x_glyph_px = size_x_glyph+"px";

    debugger;
    var delta = Math.round((ascent-descent)/16 + 0.5);

    var r = this.r;

    var box = this.box;

    box.delta = delta;
    box.x = 0 - delta;
    box.y = descent - delta;
    box.w = horiz_adv_x_glyph + delta;
    box.h = (ascent - descent) + delta;

    console.log(delta, descent, ascent, horiz_adv_x_glyph);
    console.log(graphics.d);

    if (this.element)
      this.element.remove();

    var element = r.path(graphics.d); //($(this).attr("d")).attr(cfg.path_options);
    element.show();

    this.element = element;

    this.update();

    $(this.el).modal({backdrop: 'static', keyboard: false});
  },

  drawEditGrid: function () {
    var $grid_size_slider = $('#grid-size-slider');
    var n = $grid_size_slider.slider("value");

    debugger;
    //this.clear();
    if (this.grid)
      this.grid.remove();

    var box = this.box;
    this.grid = this.r.drawGrid(box.x, box.y, box.w-1, box.h-1, n, n, '#030');
  //      this.drawGrid(0, 0, width-1, height-1, n, n, '#030');
  },

  update: function () {
    var box = this.box;

    this.r.setViewBox(box.x, box.y, box.w, box.h, true);

    this.drawEditGrid();

    var transform = this.transform;
    var element = this.element;

    element.transform("");
    element.translate(transform.tx, transform.ty);
    element.scale(transform.sx, -transform.sy);

    $('#glyph-tx-text').val(transform.tx);
    $('#glyph-ty-text').val(transform.ty);
    $('#glyph-scale-text').val(transform.sx);
  }

});
