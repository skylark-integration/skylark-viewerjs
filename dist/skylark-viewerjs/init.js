/**
 * skylark-viewerjs - A version of viewerjs that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./viewerjs","./viewer","./plugin_registry"],function(n,e,t){function o(n){var e;return t.some(function(t){return!!t.supportsFileExtension(n)&&(e=t,!0)}),e}return n.init=function(){window.onload=function(){var n,i=document.location.hash.substring(1),r=function(n){var e={};return(n.search||"?").substr(1).split("&").forEach(function(n){if(n){var t=n.split("=",2);e[decodeURIComponent(t[0])]=decodeURIComponent(t[1])}}),e}(document.location);i?(r.title||(r.title=i.replace(/^.*[\\\/]/,"")),r.documentUrl=i,function(n,e){var o=new XMLHttpRequest;o.onreadystatechange=function(){var n,i;4===o.readyState&&((o.status>=200&&o.status<300||0===o.status)&&(n=o.getResponseHeader("content-type"))&&t.some(function(e){return!!e.supportsMimetype(n)&&(i=e,console.log("Found plugin by mimetype and xhr head: "+n),!0)}),e(i))},o.open("HEAD",n,!0),o.send()}(i,function(t){var u,s;t||(r.type?(u=r.type,(s=o(u))&&console.log("Found plugin by parameter type: "+u),t=s):t=function(n){var e=n.split("?")[0].split(".").pop(),t=o(e);return t&&console.log("Found plugin by file extension from path: "+e),t}(i)),t?"undefined"!==String(typeof loadPlugin)?loadPlugin(t.path,function(){n=t.getClass(),new e(new n,r)}):(n=t.getClass(),new e(new n,r)):new e})):new e}}});
//# sourceMappingURL=sourcemaps/init.js.map
