/*global nodeca, _, $*/

"use strict";

module.exports.readFile = function (file, session, fonts) {
  var reader;

  nodeca.logger.debug('Import config requested', file);

  // file.type is empty on Chromium, so we allow upload anything
  // and will get real error only if JSON.parse fails

  if (!file) {
    // Unexpected behavior. Should not happen in real life.
    nodeca.client.util.notify('error',
      'You must choose a file.');
    return;
  }

  reader = new window.FileReader();

  reader.onload = function (event) {
    var config;

    try {
      var data = event.target.result;

      var ext = file.name.split('.').pop();
      if (ext.toLowerCase() == 'svg') {
        nodeca.client.font_reader.loadSVGData(fonts, data);
        nodeca.logger.debug('SVG successfully parsed');
      } else {
        config = JSON.parse(data);
        nodeca.logger.debug('Config successfully parsed', config);
        session.readConfig(config);
      }
    } catch (err) {
      nodeca.client.util.notify('error',
        nodeca.client.render('errors.read-config', {
          error: (err.message || err.toString())
        }));
      return;
    }
  };

  reader.readAsBinaryString(file);
};