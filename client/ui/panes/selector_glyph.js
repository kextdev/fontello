/*global window, nodeca, jQuery, Handlebars, Backbone, $, _*/


"use strict";


module.exports = Backbone.View.extend({
  tagName:    'li',
  className:  'glyph',


  events: {
    click: function () {
      this.model.toggle('selected');
    },
  },


  initialize: function () {
    var self = this,
        font = this.model.get('font').getName(),
        uid  = this.model.get('source').uid,
        code = nodeca.shared.glyphs_map[font][uid],
        text = nodeca.client.util.fixedFromCharCode(code);

    this.$el.data('model', this.model);
    this.$el.text(text);

    var graphics = this.model.get('graphics');
    if (graphics)
    {
      this.$el.text("");

      var gd = 'gd'+code;

      // todo - calculate element size by font size
      var width = 30;
      var height = 30;

      // create glyph svg view
      this.$el.append('<div id="'+gd+'"style="display: inline-block !important; vertical-align: middle !important; width: '+width+'px; height: '+height+'px;"/>');

      var $gd = this.$el.find('#'+gd);
      var r = Raphael($gd[0], width, height);

      r.setViewBox(0,0, 1000, 1000);

      var xml = $.parseXML(graphics);
      var groups = nodeca.client.font_reader.svgGetGroups(xml);
      r.canvas.appendChild(groups.$draw[0]);
    }


    if (this.model.get('font').isEditable()) {
      this.$el.append(nodeca.client.render('selector.glyph-controls', {
        uid: uid
      }));
    }

    //
    // Listen to the model changes
    //

    this.model.on('change:selected', function (g, v) {
      self.$el.toggleClass('selected', v);
    });
  }
});
