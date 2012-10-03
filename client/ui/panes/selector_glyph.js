/*global window, nodeca, jQuery, Handlebars, Backbone, $, _*/


"use strict";


module.exports = Backbone.View.extend({
  tagName:    'li',
  className:  'glyph',


  events: {
    click: function () {
      this.model.toggle('selected');
    },
/*
    Disabled by slow performance? used css (but also not fast)

    mouseenter: function () {
      this.$el.append($('<a/>', {
        class: 'btn btn-glyph-edit'
      }).click(function(){alert('aaa');}));
    },
    mouseleave: function () {
      this.$('.btn-glyph-edit').remove();
    }
*/
  },


  initialize: function () {
    var self = this,
        font = this.model.get('font').getName(),
        uid  = this.model.get('source').uid,
        code = nodeca.shared.glyphs_map[font][uid],
        text = nodeca.client.util.fixedFromCharCode(code);

    this.$el.data('model', this.model);
    this.$el.text(text);

    debugger;
    if (this.model.get('font').isEditable()) {
      // todo - different events model

      // Create and bind edit button
      this.$el.append($('<a/>', {
        class: 'btn btn-glyph-edit'
      }).click($.proxy(function (e) {
        // Stop parent notification
        e.stopPropagation();

        this.model.trigger('click:edit-glyph-graphics', this.model);
      }, this)));
    }

    //
    // Listen to the model changes
    //

    this.model.on('change:selected', function (g, v) {
      self.$el.toggleClass('selected', v);
    });
  }
});
