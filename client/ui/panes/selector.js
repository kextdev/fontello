/*global window, nodeca, jQuery, Handlebars, Backbone, $, _*/


"use strict";


module.exports = Backbone.View.extend({
  el: '#selector',


  initialize: function (attributes) {
    this.changeGlyphSize(nodeca.config.app.glyph_size.val);
    this.model.each(this.addFont, this);

    this.model.on('add remove', function (font) {
//      this.addFont(font);
      var view = new nodeca.client.ui.panes.selector_font({model: font});
      this.$('#selector-fonts').prepend(view.render().el);
    }, this);
  },


  changeGlyphSize: function (size) {
    this.$el.css('font-size', size);
  },


  addFont: function (font) {
    var view = new nodeca.client.ui.panes.selector_font({model: font});
    this.$('#selector-fonts').append(view.render().el);
  }
});
