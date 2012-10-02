/*global nodeca, _, $, Modernizr, Backbone, window, Faye*/


"use strict";


module.exports = function () {
  var
    // jQuery $elements
    $fontname, $users_count, $glyphs, $import, $load_font,
    // models
    fonts, result, session,
    // ui views
    toolbar, tabs, selector, preview, editor, graphics_editor;

  // check browser's capabilities
  if (!Modernizr.fontface) {
    nodeca.logger.error("bad browser");
    $('#err-bad-browser').modal({backdrop: 'static', keyboard: false});
    return;
  }


  //
  // Models
  //


  // list of all fonts
  fonts = new (Backbone.Collection.extend({
    model: nodeca.client.models.font
  }))(nodeca.shared.embedded_fonts);

  // special collection of selected glyphs (cache) with
  // extra model logic (validate, config creation and
  // download requesting), but which can still be used
  // as a normal collection for the views
  result = new nodeca.client.models.result;


  //
  // Views (UI)
  //


  toolbar   = new nodeca.client.ui.toolbar;
  tabs      = new nodeca.client.ui.tabs;
  selector  = new nodeca.client.ui.panes.selector({model: fonts});
  preview   = new nodeca.client.ui.panes.preview({model: result});
  editor    = new nodeca.client.ui.panes.codes_editor({model: result});
  graphics_editor = new nodeca.client.ui.graphics_editor;

  //
  // Initialization
  //

  var attachFontButtons = function (f) {
    f.eachGlyph(function (g) {
      toolbar.addKeywords(g.get('source').search || []);
      g.on('change:selected', function (g, val) {
        result[val ? 'add' : 'remove'](g);
      });
      g.on('click:edit-glyph-graphics', function (g) {
        graphics_editor.editGlyph(g);
      });
    });
  };

  fonts.each(function (f) {
//    f.eachGlyph(function (g) {
//    });
    attachFontButtons(f);
  });

  fonts.on('add', function (font) {
    attachFontButtons(font);
  });

  toolbar.on('click:download', function () {
    result.startDownload($('#result-fontname').val());
  });


  toolbar.on('change:glyph-size', _.debounce(function (size) {
    selector.changeGlyphSize(size);
    preview.changeGlyphSize(size);
  }, 250));


  $('#glyph-3d').change(function () {
    var val = 'checked' === $(this).attr('checked');
    selector.$el.toggleClass('_3d', val);
    preview.$el.toggleClass('_3d', val);
  }).trigger('change');


  // perform glyphs search
  $glyphs = $('.glyph');
  toolbar.on('change:search', function (q) {
    q = $.trim(q);

    if (0 === q.length) {
      $glyphs.show();
      return;
    }

    $glyphs.hide().filter(function () {
      var model = $(this).data('model');
      return model && 0 <= model.keywords.indexOf(q);
    }).show();
  });


  // update selected glyphs count
  result.on('add remove', function () {
    var count = result.length;

    toolbar.setGlyphsCount(count);
    tabs.setGlyphsCount(count);
  });


  // show selector tab after  load complete
  tabs.activate('#selector');


  // Attach tooltip handler to matching elements
  $('._tip').tooltip();


  // Attach collapse handler to matching elements
  $('._collapser').ndCollapser();


  //
  // Fontname
  //


  $fontname = $('#result-fontname');
  $fontname.on('keyup change', function () {
    var $el = $(this);
    $el.val($el.val().replace(/[^a-z0-9\-_]+/g, ''));
  });


  //
  // Sessions
  //


  // Session manager instance
  session = new nodeca.client.sessions({
    fontnameElement:  $fontname,
    fontsList:        fonts
  });


  var save_session = _.debounce(function () {
    session.save();
  }, 2000);


  // save current state upon fontname change
  $fontname.change(save_session);


  // change current state when some of glyph properties were changed
  fonts.each(function (f) {
    f.on('before:batch-select', function () {
      nodeca.client.sessions.disable();
    });

    f.on('after:batch-select', function () {
      nodeca.client.sessions.enable();
      save_session();
    });

    f.eachGlyph(function (g) {
      g.on('change:selected change:code change:css', save_session);
    });
  });


  session.load();


  //
  // Initialize clear (selections) button
  //


  $('#reset-app-selections').click(function (event) {
    // do not change location
    event.preventDefault();

    fonts.each(function (f) {
      f.eachGlyph(function (g) {
        g.toggle('selected', false);
      });
    });

    save_session();
  });


  //
  // Initialize reset everything button
  //


  $('#reset-app-all').click(function (event) {
    // do not change location
    event.preventDefault();

    fonts.each(function (f) {
      f.eachGlyph(function (g) {
        g.toggle('selected', false);
        g.unset('code');
        g.unset('css');
      });
    });

    $fontname.val('');
    save_session();
  });


  if ('development' === nodeca.runtime.env) {
    // export some internal collections for debugging
    window.fontello_fonts   = fonts;
    window.fontello_result  = result;
  }


  //
  // Initialize config reader
  //


  $import = $('#import-app-config');

  $import.click(function (event) {
    event.preventDefault();

    if (!window.FileReader) {
      nodeca.client.util.notify('error',
        nodeca.client.render('errors.no-file-reader'));
      return false;
    }

    $('#import-app-config-file').click();
    return false;
  });

  // handle file upload
  $('#import-app-config-file').change(function (event) {
    var file = (event.target.files || [])[0], reader;

    nodeca.logger.debug('Import config requested', file);

    // file.type is empty on Chromium, so we allow upload anything
    // and will get real error only if JSON.parse fails

    if (!file) {
      // Unexpected behavior. Should not happen in real life.
      nodeca.client.util.notify('error',
        'You must choose a file.');
      return;
    }

    // we must "reset" value of input field, otherwise Chromium will
    // not fire change event if the same file will be chosen twice, e.g.
    // import config -> made changes -> import config

    $(this).val('');

    reader = new window.FileReader();

    reader.onload = function (event) {
      var config;

      try {
        config = JSON.parse(event.target.result);
      } catch (err) {
        nodeca.client.util.notify('error',
          nodeca.client.render('errors.read-config', {
            error: (err.message || err.toString())
          }));
        return;
      }

      nodeca.logger.debug('Config successfully parsed', config);
      session.readConfig(config);
    };

    reader.readAsBinaryString(file);
  });

  //
  // Initialize font reader
  // todo - refactoring
  //

  var checkFileReader = function () {
    if (!window.FileReader) {
      nodeca.client.util.notify('error',
        nodeca.client.render('errors.no-file-reader'));
      return false;
    }
    return true;
  };

  var fontLoadSvg = function (data) {
    var xml = $.parseXML(data);

    var $font = $('font:first', xml);//.attr("id") || "unknown";
    var $font_face = $('font-face:first', xml);

    var font = {
      "font" : {
        'fontname'  : $font.attr('id'),
        'fullname'  : $font_face.attr('font-family'),
        'familyname': $font_face.attr('font-family'),
        'descent'   : parseInt($font_face.attr('descent')),
        'ascent'    : parseInt($font_face.attr('ascent')),
        // fake
        'version'   : '1.0',
        'copyright' : '',
        'weight'    : 'Medium',
        // svg
        'horiz_adv_x' : parseInt($font.attr('horiz-adv-x'))
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
      "glyphs" : []
    };

    // fix glyphs_map

    nodeca.shared.glyphs_map[font.font.fontname] = {};

    $("glyph", xml).filter(function (index) {
      // debug
      return true;//debug.maxglyphs && index < debug.maxglyphs || true;
    }).each(function (index) {
        var code;
        var glyph = {
          // svg
          graphics : {
            'horiz_adv_x' : parseInt($(this).attr('horiz-adv-x')) || font.font.horiz_adv_x,
            d             : $(this).attr('d') || '',
            modified      : false,
            metrics : {
              box : {
                x : 0,
                y : 0,
                w : 0,
                h : 0,
                delta : 0
              },
              transform : {
                tx : 0,
                ty : 0,
                sx : 1,
                sy : 1
              }
            }
          },
          search  : [],
          code    : (code = ($(this).attr('unicode') || '0').charCodeAt(0)),
          uid     : 'genuid_'+font.font.fontname+'_'+index+'_'+code, //todo generate uid
          file    : $(this).attr('glyph-name') || 'unknown',
          css     : $(this).attr('glyph-name') || 'unknown'
        };

        font.glyphs.push(glyph);

        // fix glyphs_map

        nodeca.shared.glyphs_map[font.font.fontname][glyph.uid] = glyph.code;
    });

    return font;
  };

  $load_font = $('#import-font');

  $load_font.click(function (event) {
    event.preventDefault();

    if (!checkFileReader())
      return false;

    $('#import-font-file').click();
    return false;
  });

  $('#import-font-file').change(function (event) {
    var file = (event.target.files || [])[0], reader;

    nodeca.logger.debug('Import font requested', file);

    if (!file) {
      // Unexpected behavior. Should not happen in real life.
      nodeca.client.util.notify('error',
        'You must choose a file.');
      return;
    }

    // we must "reset" value of input field.

    $(this).val('');

    reader = new window.FileReader();

    reader.onload = function (event) {
      var font;
      try {
        font = fontLoadSvg(event.target.result);
        fonts.add([font]);
      } catch (err) {
        nodeca.client.util.notify('error',
          nodeca.client.render('errors.read-font', {
            error: (err.message || err.toString())
          }));
        return;
      }

      nodeca.logger.debug('Font successfully parsed', font);
    };

    reader.readAsBinaryString(file);
  });

  /*
   debugger;
   var a = nodeca.client.models.font.extend({
   initialize: function (attributes) {
   debugger;
   console.log(attributes);
   a.__super__.initialize.call(this, attributes);
   }
   });
   var b = new a([123456]);

   */
};

