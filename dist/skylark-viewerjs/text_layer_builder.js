/**
 * skylark-viewerjs - A version of viewerjs that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["skylark-pdfjs-display","./viewerjs","./ui_utils"],function(t,e,i){"use strict";var n=/\S/;function r(t){this.textLayerDiv=t.textLayerDiv,this.renderingDone=!1,this.divContentDone=!1,this.pageIdx=t.pageIndex,this.pageNumber=this.pageIdx+1,this.matches=[],this.viewport=t.viewport,this.textDivs=[],this.findController=t.findController||null}function s(){}return r.prototype={_finishRendering:function(){this.renderingDone=!0;var t=document.createEvent("CustomEvent");t.initCustomEvent("textlayerrendered",!0,!0,{pageNumber:this.pageNumber}),this.textLayerDiv.dispatchEvent(t)},renderLayer:function(){var t=document.createDocumentFragment(),e=this.textDivs,n=e.length,r=document.createElement("canvas").getContext("2d");if(n>1e5)this._finishRendering();else{for(var s,a,d=0;d<n;d++){var o=e[d];if(void 0===o.dataset.isWhitespace){var h=o.style.fontSize,l=o.style.fontFamily;h===s&&l===a||(r.font=h+" "+l,s=h,a=l);var f=r.measureText(o.textContent).width;if(f>0){var v;if(t.appendChild(o),void 0!==o.dataset.canvasWidth)v="scaleX("+o.dataset.canvasWidth/f+")";else v="";var c=o.dataset.angle;c&&(v="rotate("+c+"deg) "+v),v&&i.CustomStyle.setProp("transform",o,v)}}}this.textLayerDiv.appendChild(t),this._finishRendering(),this.updateMatches()}},render:function(t){if(this.divContentDone&&!this.renderingDone)if(this.renderTimer&&(clearTimeout(this.renderTimer),this.renderTimer=null),t){var e=this;this.renderTimer=setTimeout(function(){e.renderLayer(),e.renderTimer=null},t)}else this.renderLayer()},appendText:function(e,i){var r=i[e.fontName],s=document.createElement("div");if(this.textDivs.push(s),a=e.str,n.test(a)){var a,d=t.Util.transform(this.viewport.transform,e.transform),o=Math.atan2(d[1],d[0]);r.vertical&&(o+=Math.PI/2);var h,l,f=Math.sqrt(d[2]*d[2]+d[3]*d[3]),v=f;r.ascent?v=r.ascent*v:r.descent&&(v=(1+r.descent)*v),0===o?(h=d[4],l=d[5]-v):(h=d[4]+v*Math.sin(o),l=d[5]-v*Math.cos(o)),s.style.left=h+"px",s.style.top=l+"px",s.style.fontSize=f+"px",s.style.fontFamily=r.fontFamily,s.textContent=e.str,t.pdfBug&&(s.dataset.fontName=e.fontName),0!==o&&(s.dataset.angle=o*(180/Math.PI)),s.textContent.length>1&&(r.vertical?s.dataset.canvasWidth=e.height*this.viewport.scale:s.dataset.canvasWidth=e.width*this.viewport.scale)}else s.dataset.isWhitespace=!0},setTextContent:function(t){this.textContent=t;for(var e=t.items,i=0,n=e.length;i<n;i++)this.appendText(e[i],t.styles);this.divContentDone=!0},convertMatches:function(t){for(var e=0,i=0,n=this.textContent.items,r=n.length-1,s=null===this.findController?0:this.findController.state.query.length,a=[],d=0,o=t.length;d<o;d++){for(var h=t[d];e!==r&&h>=i+n[e].str.length;)i+=n[e].str.length,e++;e===n.length&&console.error("Could not find a matching mapping");var l={begin:{divIdx:e,offset:h-i}};for(h+=s;e!==r&&h>i+n[e].str.length;)i+=n[e].str.length,e++;l.end={divIdx:e,offset:h-i},a.push(l)}return a},renderMatches:function(t){if(0!==t.length){var e=this.textContent.items,i=this.textDivs,n=null,r=this.pageIdx,s=null!==this.findController&&r===this.findController.selected.pageIdx,a=null===this.findController?-1:this.findController.selected.matchIdx,d={divIdx:-1,offset:void 0},o=a,h=o+1;if(null!==this.findController&&this.findController.state.highlightAll)o=0,h=t.length;else if(!s)return;for(var l=o;l<h;l++){var f=t[l],v=f.begin,c=f.end,u=s&&l===a?" selected":"";if(this.findController&&this.findController.updateMatchPosition(r,l,i,v.divIdx,c.divIdx),n&&v.divIdx===n.divIdx?m(n.divIdx,n.offset,v.offset):(null!==n&&m(n.divIdx,n.offset,d.offset),p(v)),v.divIdx===c.divIdx)m(v.divIdx,v.offset,c.offset,"highlight"+u);else{m(v.divIdx,v.offset,d.offset,"highlight begin"+u);for(var x=v.divIdx+1,g=c.divIdx;x<g;x++)i[x].className="highlight middle"+u;p(c,"highlight end"+u)}n=c}n&&m(n.divIdx,n.offset,d.offset)}function p(t,e){var n=t.divIdx;i[n].textContent="",m(n,0,t.offset,e)}function m(t,n,r,s){var a=i[t],d=e[t].str.substring(n,r),o=document.createTextNode(d);if(s){var h=document.createElement("span");return h.className=s,h.appendChild(o),void a.appendChild(h)}a.appendChild(o)}},updateMatches:function(){if(this.renderingDone){for(var t=this.matches,e=this.textDivs,i=this.textContent.items,n=-1,r=0,s=t.length;r<s;r++){for(var a=t[r],d=Math.max(n,a.begin.divIdx),o=a.end.divIdx;d<=o;d++){var h=e[d];h.textContent=i[d].str,h.className=""}n=a.end.divIdx+1}null!==this.findController&&this.findController.active&&(this.matches=this.convertMatches(null===this.findController?[]:this.findController.pageMatches[this.pageIdx]||[]),this.renderMatches(this.matches))}}},s.prototype={createTextLayerBuilder:function(t,e,i){return new r({textLayerDiv:t,pageIndex:e,viewport:i})}},r.DefaultTextLayerFactory=s,e.TextLayerBuilder=r});
//# sourceMappingURL=sourcemaps/text_layer_builder.js.map