/*global window, nodeca, jQuery, Handlebars, Backbone, $, _*/


"use strict";


module.exports = Backbone.View.extend({
  el: '#selector',


  initialize: function (attributes) {
    this.changeGlyphSize(nodeca.config.app.glyph_size.val);
    this.model.each(this.addFont, this);

    // remove font should too handle
    this.model.on('add', function (font) {
      this.addFontToLocation(font, true);
    }, this);
  },


  changeGlyphSize: function (size) {
    this.$el.css('font-size', size);
  },


  addFont: function (font) {
    this.addFontToLocation(font, false);
  },

  addFontToLocation: function (font, location) {
    var view = new nodeca.client.ui.panes.selector_font({model: font});
    this.$('#selector-fonts')[location ? "prepend" : "append"](view.render().el);
  }
});
