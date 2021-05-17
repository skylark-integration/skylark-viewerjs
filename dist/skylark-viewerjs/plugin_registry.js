/**
 * skylark-viewerjs - A version of viewerjs that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./viewerjs","./ODFViewerPlugin","./PDFViewerPlugin"],function(n,t,e){var o,i,p=[(o=["application/vnd.oasis.opendocument.text","application/vnd.oasis.opendocument.text-flat-xml","application/vnd.oasis.opendocument.text-template","application/vnd.oasis.opendocument.presentation","application/vnd.oasis.opendocument.presentation-flat-xml","application/vnd.oasis.opendocument.presentation-template","application/vnd.oasis.opendocument.spreadsheet","application/vnd.oasis.opendocument.spreadsheet-flat-xml","application/vnd.oasis.opendocument.spreadsheet-template"],i=["odt","fodt","ott","odp","fodp","otp","ods","fods","ots"],{supportsMimetype:function(n){return-1!==o.indexOf(n)},supportsFileExtension:function(n){return-1!==i.indexOf(n)},path:"./ODFViewerPlugin",getClass:function(){return t}}),{supportsMimetype:function(n){return"application/pdf"===n},supportsFileExtension:function(n){return"pdf"===n},path:"./PDFViewerPlugin",getClass:function(){return e}}];return n.pluginRegistry=p});
//# sourceMappingURL=sourcemaps/plugin_registry.js.map
