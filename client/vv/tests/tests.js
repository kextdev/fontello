

"use strict";

var testFontFile = "";
var testSvgFile = "";

module.exports.run = function() {
    try {
        debugger;
        var customFont = nodeca.client.vv.font.util.createCustomFont();
        var font = nodeca.client.vv.import.svg.font_reader.read(testFontFile);
        var svg = nodeca.client.vv.import.svg.svg_reader.read(testSvgFile);

        var svg1 = nodeca.client.vv.import.reader.read(testFontFile);
        var svg2 = nodeca.client.vv.import.reader.read(testSvgFile);

    } catch (err) {
        // log message
        return;
    }
};
