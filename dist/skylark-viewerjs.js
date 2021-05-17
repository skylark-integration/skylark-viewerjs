/**
 * skylark-viewerjs - A version of viewerjs that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
!function(e,t){var n=t.define,require=t.require,i="function"==typeof n&&n.amd,o=!i&&"undefined"!=typeof exports;if(!i&&!n){var s={};n=t.define=function(e,t,n){"function"==typeof n?(s[e]={factory:n,deps:t.map(function(t){return function(e,t){if("."!==e[0])return e;var n=t.split("/"),i=e.split("/");n.pop();for(var o=0;o<i.length;o++)"."!=i[o]&&(".."==i[o]?n.pop():n.push(i[o]));return n.join("/")}(t,e)}),resolved:!1,exports:null},require(e)):s[e]={factory:null,resolved:!0,exports:n}},require=t.require=function(e){if(!s.hasOwnProperty(e))throw new Error("Module "+e+" has not been defined");var module=s[e];if(!module.resolved){var n=[];module.deps.forEach(function(e){n.push(require(e))}),module.exports=module.factory.apply(t,n)||null,module.resolved=!0}return module.exports}}if(!n)throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");if(function(e,require){e("skylark-viewerjs/viewerjs",["skylark-langx-ns"],function(e){return e.attach("intg.viewerjs")}),e("skylark-viewerjs/viewer",["./viewerjs"],function(e){return e.Viewer=function(e,t){"use strict";var n,i,o,s,r,a,l=this,u=40,c=.25,d=4,h="auto",f=!1,g=!1,p=!1,m=document.getElementById("viewer"),v=document.getElementById("canvasContainer"),w=document.getElementById("overlayNavigator"),y=document.getElementById("titlebar"),x=document.getElementById("toolbarContainer"),b=document.getElementById("toolbarLeft"),k=document.getElementById("toolbarMiddleContainer"),P=document.getElementById("scaleSelect"),L=document.getElementById("dialogOverlay"),C=document.getElementById("toolbarRight"),E=[],I=5e3;function S(){return"block"===blanked.style.display}function N(){var t,n,o,s,r,a,l;l="undefined"!==String(typeof ViewerJS_version)?ViewerJS_version:"From Source",e&&(s=e.getPluginName(),r=e.getPluginVersion(),a=e.getPluginURL()),(t=document.createElement("div")).id="aboutDialogCentererTable",(n=document.createElement("div")).id="aboutDialogCentererCell",(i=document.createElement("div")).id="aboutDialog",i.innerHTML='<h1>ViewerJS</h1><p>Open Source document viewer for webpages, built with HTML and JavaScript.</p><p>Learn more and get your own copy on the <a href="http://viewerjs.org/" target="_blank">ViewerJS website</a>.</p>'+(e?'<p>Using the <a href = "'+a+'" target="_blank">'+s+'</a> (<span id = "pluginVersion">'+r+"</span>) plugin to show you this document.</p>":"")+"<p>Version "+l+'</p><p>Supported by <a href="https://nlnet.nl" target="_blank"><br><img src="images/nlnet.png" width="160" height="60" alt="NLnet Foundation"></a></p><p>Made by <a href="http://kogmbh.com" target="_blank"><br><img src="images/kogmbh.png" width="172" height="40" alt="KO GmbH"></a></p><button id = "aboutDialogCloseButton" class = "toolbarButton textButton">Close</button>',L.appendChild(t),t.appendChild(n),n.appendChild(i),(o=document.createElement("button")).id="about",o.className="toolbarButton textButton about",o.title="About",o.innerHTML="ViewerJS",C.appendChild(o),o.addEventListener("click",function(){L.style.display="block"}),document.getElementById("aboutDialogCloseButton").addEventListener("click",function(){L.style.display="none"})}function F(e){var t,n,i=P.options,o=!1;for(n=0;n<i.length;n+=1)(t=i[n]).value===e?(t.selected=!0,o=!0):t.selected=!1;return o}function T(e,t){if(e!==l.getZoomLevel()){l.setZoomLevel(e);var n=document.createEvent("UIEvents");n.initUIEvent("scalechange",!1,!1,window,0),n.scale=e,n.resetAutoSettings=t,window.dispatchEvent(n)}}function B(){var t;e.onScroll&&e.onScroll(),e.getPageInView&&(t=e.getPageInView())&&(o=t,document.getElementById("pageNumber").value=t)}function D(e){window.clearTimeout(s),s=window.setTimeout(function(){B()},e)}function M(t,n){var i,o,s;if(i="custom"===t?parseFloat(document.getElementById("customScaleOption").textContent)/100:parseFloat(t))return T(i,!0),void D(300);switch(o=v.clientWidth-u,s=v.clientHeight-u,t){case"page-actual":T(1,n);break;case"page-width":e.fitToWidth(o);break;case"page-height":e.fitToHeight(s);break;case"page-fit":e.fitToPage(o,s);break;case"auto":e.isSlideshow()?e.fitToPage(o+u,s+u):e.fitSmart(o)}F(t),D(300)}function V(){g=!g,f&&!g&&l.togglePresentationMode()}function _(){(f||e.isSlideshow())&&(w.className="viewer-touched",window.clearTimeout(r),r=window.setTimeout(function(){w.className=""},I))}function O(){y.classList.add("viewer-touched"),x.classList.add("viewer-touched"),window.clearTimeout(a),a=window.setTimeout(function(){R()},I)}function R(){y.classList.remove("viewer-touched"),x.classList.remove("viewer-touched")}function j(){y.classList.contains("viewer-touched")?R():O()}function H(e){blanked.style.display="block",blanked.style.backgroundColor=e,R()}function z(){blanked.style.display="none",j()}function U(e,t){var n=document.getElementById(e);n.addEventListener("click",function(){t(),n.blur()})}this.initialize=function(){var i;i=function(e){var t;if(-1!==["auto","page-actual","page-width"].indexOf(e))return e;if((t=parseFloat(e))&&c<=t&&t<=d)return e;return h}(t.zoom),n=t.documentUrl,document.title=t.title;var o=document.getElementById("documentName");o.innerHTML="",o.appendChild(o.ownerDocument.createTextNode(t.title)),e.onLoad=function(){var n,o;document.getElementById("pluginVersion").innerHTML=e.getPluginVersion(),e.isSlideshow()?(v.classList.add("slideshow"),b.style.visibility="visible"):(k.style.visibility="visible",e.getPageInView&&(b.style.visibility="visible")),p=!0,E=e.getPages(),document.getElementById("numPages").innerHTML="of "+E.length,M(i),l.showPage((n=t.startpage,o=parseInt(n,10),isNaN(o)?1:o)),v.onscroll=B,D()},e.initialize(v,n)},this.showPage=function(t){t<=0?t=1:t>E.length&&(t=E.length),e.showPage(t),o=t,document.getElementById("pageNumber").value=o},this.showNextPage=function(){l.showPage(o+1)},this.showPreviousPage=function(){l.showPage(o-1)},this.download=function(){var e=n.split("#")[0];e+="#viewer.action=download",window.open(e,"_parent")},this.toggleFullScreen=function(){var e=m;g?document.exitFullscreen?document.exitFullscreen():document.cancelFullScreen?document.cancelFullScreen():document.mozCancelFullScreen?document.mozCancelFullScreen():document.webkitExitFullscreen?document.webkitExitFullscreen():document.webkitCancelFullScreen?document.webkitCancelFullScreen():document.msExitFullscreen&&document.msExitFullscreen():e.requestFullscreen?e.requestFullscreen():e.mozRequestFullScreen?e.mozRequestFullScreen():e.webkitRequestFullscreen?e.webkitRequestFullscreen():e.webkitRequestFullScreen?e.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT):e.msRequestFullscreen&&e.msRequestFullscreen()},this.togglePresentationMode=function(){var e=document.getElementById("overlayCloseButton");f?(S()&&z(),y.style.display=x.style.display="block",e.style.display="none",v.classList.remove("presentationMode"),v.onmouseup=function(){},v.oncontextmenu=function(){},v.onmousedown=function(){},M("auto")):(y.style.display=x.style.display="none",e.style.display="block",v.classList.add("presentationMode"),v.onmousedown=function(e){e.preventDefault()},v.oncontextmenu=function(e){e.preventDefault()},v.onmouseup=function(e){e.preventDefault(),1===e.which?l.showNextPage():l.showPreviousPage()},M("page-fit")),f=!f},this.getZoomLevel=function(){return e.getZoomLevel()},this.setZoomLevel=function(t){e.setZoomLevel(t)},this.zoomOut=function(){var e=(l.getZoomLevel()/1.1).toFixed(2);M(e=Math.max(c,e),!0)},this.zoomIn=function(){var e=(1.1*l.getZoomLevel()).toFixed(2);M(e=Math.min(d,e),!0)},N(),e&&(l.initialize(),document.exitFullscreen||document.cancelFullScreen||document.mozCancelFullScreen||document.webkitExitFullscreen||document.webkitCancelFullScreen||document.msExitFullscreen||(document.getElementById("fullscreen").style.visibility="hidden",document.getElementById("presentation").style.visibility="hidden"),U("overlayCloseButton",l.toggleFullScreen),U("fullscreen",l.toggleFullScreen),U("presentation",function(){g||l.toggleFullScreen(),l.togglePresentationMode()}),document.addEventListener("fullscreenchange",V),document.addEventListener("webkitfullscreenchange",V),document.addEventListener("mozfullscreenchange",V),document.addEventListener("MSFullscreenChange",V),U("download",l.download),U("zoomOut",l.zoomOut),U("zoomIn",l.zoomIn),U("previous",l.showPreviousPage),U("next",l.showNextPage),U("previousPage",l.showPreviousPage),U("nextPage",l.showNextPage),document.getElementById("pageNumber").addEventListener("change",function(){l.showPage(this.value)}),document.getElementById("scaleSelect").addEventListener("change",function(){M(this.value)}),v.addEventListener("click",_),w.addEventListener("click",_),v.addEventListener("click",j),y.addEventListener("click",O),x.addEventListener("click",O),window.addEventListener("scalechange",function(e){var t=document.getElementById("customScaleOption"),n=F(String(e.scale));t.selected=!1,n||(t.textContent=Math.round(1e4*e.scale)/100+"%",t.selected=!0)},!0),window.addEventListener("resize",function(e){p&&(document.getElementById("pageWidthOption").selected||document.getElementById("pageAutoOption").selected)&&M(document.getElementById("scaleSelect").value),_()}),window.addEventListener("keydown",function(e){var t=e.keyCode,n=e.shiftKey;if(S())switch(t){case 16:case 17:case 18:case 91:case 93:case 224:case 225:break;default:z()}else switch(t){case 8:case 33:case 37:case 38:case 80:l.showPreviousPage();break;case 13:case 34:case 39:case 40:case 78:l.showNextPage();break;case 32:n?l.showPreviousPage():l.showNextPage();break;case 66:case 190:f&&H("#000");break;case 87:case 188:f&&H("#FFF");break;case 36:l.showPage(1);break;case 35:l.showPage(E.length)}}))}}),e("skylark-viewerjs/ODFViewerPlugin",["skylark-webodf","./viewerjs"],function(e,t){return t.ODFViewerPlugin=function(){"use strict";var t=this,n=null,i=null,o=null,s=null;this.initialize=function(r,a){(function(){var r,l,u,c,d,h,f,g;i=document.getElementById("canvas"),(n=new e.odf.OdfCanvas(i)).load(a),n.addListener("statereadychange",function(){if(o=n.odfContainer().rootElement,!0,"text"===(s=n.odfContainer().getDocumentType(o))){n.enableAnnotations(!0,!1),r=new ops.Session(n),u=r.getOdtDocument(),c=new gui.ShadowCursor(u),l=new gui.SessionController(r,"localuser",c,{}),g=l.getEventManager(),h=new gui.CaretManager(l,n.getViewport()),d=new gui.SelectionViewManager(gui.SvgSelectionView),new gui.SessionView({caretAvatarsInitiallyVisible:!1},"localuser",r,l.getSessionConstraints(),h,d),d.registerCursor(c),f=new gui.HyperlinkTooltipView(n,l.getHyperlinkClickHandler().getModifier),g.subscribe("mousemove",f.showTooltip),g.subscribe("mouseout",f.hideTooltip);var i=new ops.OpAddMember;i.init({memberid:"localuser",setProperties:{fillName:e.runtime.tr("Unknown Author"),color:"blue"}}),r.enqueue([i]),l.insertLocalCursor()}t.onLoad()})})()},this.isSlideshow=function(){return"presentation"===s},this.onLoad=function(){},this.fitToWidth=function(e){n.fitToWidth(e)},this.fitToHeight=function(e){n.fitToHeight(e)},this.fitToPage=function(e,t){n.fitToContainingElement(e,t)},this.fitSmart=function(e){n.fitSmart(e)},this.getZoomLevel=function(){return n.getZoomLevel()},this.setZoomLevel=function(e){n.setZoomLevel(e)},this.getPages=function(){var e,t,n,i=Array.prototype.slice.call(o.getElementsByTagNameNS({draw:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",presentation:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",text:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",office:"urn:oasis:names:tc:opendocument:xmlns:office:1.0"}[n="draw"]||console.log("prefix ["+n+"] unknown."),"page")),s=[];for(e=0;e<i.length;e+=1)t=[i[e].getAttribute("draw:name"),i[e]],s.push(t);return s},this.showPage=function(e){n.showPage(e)},this.getPluginName=function(){return"WebODF"},this.getPluginVersion=function(){return"undefined"!==String(typeof e)?e.Version:"Unknown"},this.getPluginURL=function(){return"http://webodf.org"}}}),e("skylark-viewerjs/ui_utils",["./viewerjs"],function(e){"use strict";var t=function(){var e=["ms","Moz","Webkit","O"],t={};function n(){}return n.getProp=function(n,i){if(1===arguments.length&&"string"==typeof t[n])return t[n];var o,s,r=(i=i||document.documentElement).style;if("string"==typeof r[n])return t[n]=n;s=n.charAt(0).toUpperCase()+n.slice(1);for(var a=0,l=e.length;a<l;a++)if("string"==typeof r[o=e[a]+s])return t[n]=o;return t[n]="undefined"},n.setProp=function(e,t,n){var i=this.getProp(e);"undefined"!==i&&(t.style[i]=n)},n}();function n(e,t){var n=0,i=e.length-1;if(0===e.length||!t(e[i]))return e.length;if(t(e[n]))return n;for(;n<i;){var o=n+i>>1,s=e[o];t(s)?i=o:n=o+1}return n}var i=function(){function e(e,t){this.visible=!0,this.div=document.querySelector(e+" .progress"),this.bar=this.div.parentNode,this.height=t.height||100,this.width=t.width||100,this.units=t.units||"%",this.div.style.height=this.height+this.units,this.percent=0}return e.prototype={updateBar:function(){if(this._indeterminate)return this.div.classList.add("indeterminate"),void(this.div.style.width=this.width+this.units);this.div.classList.remove("indeterminate");var e=this.width*this._percent/100;this.div.style.width=e+this.units},get percent(){return this._percent},set percent(e){var t,n,i;this._indeterminate=isNaN(e),this._percent=(t=e,n=0,i=100,Math.min(Math.max(t,n),i)),this.updateBar()},setWidth:function(e){if(e){var t=e.parentNode,n=t.offsetWidth-e.offsetWidth;n>0&&this.bar.setAttribute("style","width: calc(100% - "+n+"px);")}},hide:function(){this.visible&&(this.visible=!1,this.bar.classList.add("hidden"),document.body.classList.remove("loadingInProgress"))},show:function(){this.visible||(this.visible=!0,document.body.classList.add("loadingInProgress"),this.bar.classList.remove("hidden"))}},e}();return e.uiutils={CustomStyle:t,getFileName:function(e){var t=e.indexOf("#"),n=e.indexOf("?"),i=Math.min(t>0?t:e.length,n>0?n:e.length);return e.substring(e.lastIndexOf("/",i)+1,i)},getOutputScale:function(e){var t=window.devicePixelRatio||1,n=e.webkitBackingStorePixelRatio||e.mozBackingStorePixelRatio||e.msBackingStorePixelRatio||e.oBackingStorePixelRatio||e.backingStorePixelRatio||1,i=t/n;return{sx:i,sy:i,scaled:1!==i}},scrollIntoView:function(e,t){var n=e.offsetParent,i=e.offsetTop+e.clientTop,o=e.offsetLeft+e.clientLeft;if(!n)return void console.error("offsetParent is not set -- cannot scroll");for(;n.clientHeight===n.scrollHeight;)if(n.dataset._scaleY&&(i/=n.dataset._scaleY,o/=n.dataset._scaleX),i+=n.offsetTop,o+=n.offsetLeft,!(n=n.offsetParent))return;t&&(void 0!==t.top&&(i+=t.top),void 0!==t.left&&(o+=t.left,n.scrollLeft=o));n.scrollTop=i},watchScroll:function(e,t){var n=function(n){o||(o=window.requestAnimationFrame(function(){o=null;var n=e.scrollTop,s=i.lastY;n!==s&&(i.down=n>s),i.lastY=n,t(i)}))},i={down:!0,lastY:e.scrollTop,_eventHandler:n},o=null;return e.addEventListener("scroll",n,!0),i},binarySearchFirstItem:n,getVisibleElements:function(e,t,i){var o=e.scrollTop,s=o+e.clientHeight,r=e.scrollLeft,a=r+e.clientWidth;for(var l,u,c,d,h,f,g,p,m=[],v=0===t.length?0:n(t,function(e){var t=e.div;return t.offsetTop+t.clientTop+t.clientHeight>o}),w=t.length;v<w&&(l=t[v],u=l.div,c=u.offsetTop+u.clientTop,d=u.clientHeight,!(c>s));v++)g=u.offsetLeft+u.clientLeft,p=u.clientWidth,g+p<r||g>a||(h=Math.max(0,o-c)+Math.max(0,c+d-s),f=100*(d-h)/d|0,m.push({id:l.id,x:g,y:c,view:l,percent:f}));var y=m[0],x=m[m.length-1];i&&m.sort(function(e,t){var n=e.percent-t.percent;return Math.abs(n)>.001?-n:e.id-t.id});return{first:y,last:x,views:m}},getPDFFileNameFromURL:function(e){var t=/[^\/?#=]+\.pdf\b(?!.*\.pdf\b)/i,n=/^(?:([^:]+:)?\/\/[^\/]+)?([^?#]*)(\?[^#]*)?(#.*)?$/.exec(e),i=t.exec(n[1])||t.exec(n[2])||t.exec(n[3]);if(i&&-1!==(i=i[0]).indexOf("%"))try{i=t.exec(decodeURIComponent(i))[0]}catch(e){}return i||"document.pdf"},ProgressBar:i}}),e("skylark-viewerjs/text_layer_builder",["skylark-pdfjs-display","./viewerjs","./ui_utils"],function(e,t,n){"use strict";var i=/\S/;function o(e){this.textLayerDiv=e.textLayerDiv,this.renderingDone=!1,this.divContentDone=!1,this.pageIdx=e.pageIndex,this.pageNumber=this.pageIdx+1,this.matches=[],this.viewport=e.viewport,this.textDivs=[],this.findController=e.findController||null}function s(){}return o.prototype={_finishRendering:function(){this.renderingDone=!0;var e=document.createEvent("CustomEvent");e.initCustomEvent("textlayerrendered",!0,!0,{pageNumber:this.pageNumber}),this.textLayerDiv.dispatchEvent(e)},renderLayer:function(){var e=document.createDocumentFragment(),t=this.textDivs,i=t.length,o=document.createElement("canvas"),s=o.getContext("2d");if(i>1e5)this._finishRendering();else{for(var r,a,l=0;l<i;l++){var u=t[l];if(void 0===u.dataset.isWhitespace){var c=u.style.fontSize,d=u.style.fontFamily;c===r&&d===a||(s.font=c+" "+d,r=c,a=d);var h=s.measureText(u.textContent).width;if(h>0){var f;if(e.appendChild(u),void 0!==u.dataset.canvasWidth){var g=u.dataset.canvasWidth/h;f="scaleX("+g+")"}else f="";var p=u.dataset.angle;p&&(f="rotate("+p+"deg) "+f),f&&n.CustomStyle.setProp("transform",u,f)}}}this.textLayerDiv.appendChild(e),this._finishRendering(),this.updateMatches()}},render:function(e){if(this.divContentDone&&!this.renderingDone)if(this.renderTimer&&(clearTimeout(this.renderTimer),this.renderTimer=null),e){var t=this;this.renderTimer=setTimeout(function(){t.renderLayer(),t.renderTimer=null},e)}else this.renderLayer()},appendText:function(t,n){var o=n[t.fontName],s=document.createElement("div");if(this.textDivs.push(s),r=t.str,i.test(r)){var r,a=e.Util.transform(this.viewport.transform,t.transform),l=Math.atan2(a[1],a[0]);o.vertical&&(l+=Math.PI/2);var u,c,d=Math.sqrt(a[2]*a[2]+a[3]*a[3]),h=d;o.ascent?h=o.ascent*h:o.descent&&(h=(1+o.descent)*h),0===l?(u=a[4],c=a[5]-h):(u=a[4]+h*Math.sin(l),c=a[5]-h*Math.cos(l)),s.style.left=u+"px",s.style.top=c+"px",s.style.fontSize=d+"px",s.style.fontFamily=o.fontFamily,s.textContent=t.str,e.pdfBug&&(s.dataset.fontName=t.fontName),0!==l&&(s.dataset.angle=l*(180/Math.PI)),s.textContent.length>1&&(o.vertical?s.dataset.canvasWidth=t.height*this.viewport.scale:s.dataset.canvasWidth=t.width*this.viewport.scale)}else s.dataset.isWhitespace=!0},setTextContent:function(e){this.textContent=e;for(var t=e.items,n=0,i=t.length;n<i;n++)this.appendText(t[n],e.styles);this.divContentDone=!0},convertMatches:function(e){for(var t=0,n=0,i=this.textContent.items,o=i.length-1,s=null===this.findController?0:this.findController.state.query.length,r=[],a=0,l=e.length;a<l;a++){for(var u=e[a];t!==o&&u>=n+i[t].str.length;)n+=i[t].str.length,t++;t===i.length&&console.error("Could not find a matching mapping");var c={begin:{divIdx:t,offset:u-n}};for(u+=s;t!==o&&u>n+i[t].str.length;)n+=i[t].str.length,t++;c.end={divIdx:t,offset:u-n},r.push(c)}return r},renderMatches:function(e){if(0!==e.length){var t=this.textContent.items,n=this.textDivs,i=null,o=this.pageIdx,s=null!==this.findController&&o===this.findController.selected.pageIdx,r=null===this.findController?-1:this.findController.selected.matchIdx,a=null!==this.findController&&this.findController.state.highlightAll,l={divIdx:-1,offset:void 0},u=r,c=u+1;if(a)u=0,c=e.length;else if(!s)return;for(var d=u;d<c;d++){var h=e[d],f=h.begin,g=h.end,p=s&&d===r,m=p?" selected":"";if(this.findController&&this.findController.updateMatchPosition(o,d,n,f.divIdx,g.divIdx),i&&f.divIdx===i.divIdx?x(i.divIdx,i.offset,f.offset):(null!==i&&x(i.divIdx,i.offset,l.offset),y(f)),f.divIdx===g.divIdx)x(f.divIdx,f.offset,g.offset,"highlight"+m);else{x(f.divIdx,f.offset,l.offset,"highlight begin"+m);for(var v=f.divIdx+1,w=g.divIdx;v<w;v++)n[v].className="highlight middle"+m;y(g,"highlight end"+m)}i=g}i&&x(i.divIdx,i.offset,l.offset)}function y(e,t){var i=e.divIdx;n[i].textContent="",x(i,0,e.offset,t)}function x(e,i,o,s){var r=n[e],a=t[e].str.substring(i,o),l=document.createTextNode(a);if(s){var u=document.createElement("span");return u.className=s,u.appendChild(l),void r.appendChild(u)}r.appendChild(l)}},updateMatches:function(){if(this.renderingDone){for(var e=this.matches,t=this.textDivs,n=this.textContent.items,i=-1,o=0,s=e.length;o<s;o++){for(var r=e[o],a=Math.max(i,r.begin.divIdx),l=a,u=r.end.divIdx;l<=u;l++){var c=t[l];c.textContent=n[l].str,c.className=""}i=r.end.divIdx+1}null!==this.findController&&this.findController.active&&(this.matches=this.convertMatches(null===this.findController?[]:this.findController.pageMatches[this.pageIdx]||[]),this.renderMatches(this.matches))}}},s.prototype={createTextLayerBuilder:function(e,t,n){return new o({textLayerDiv:e,pageIndex:t,viewport:n})}},o.DefaultTextLayerFactory=s,t.TextLayerBuilder=o}),e("skylark-viewerjs/PDFViewerPlugin",["skylark-pdfjs-display","./viewerjs","./ui_utils","./text_layer_builder"],function(e,t,n,i){return t.PDFViewerPlugin=function(){"use strict";var t=this,o=[],s=[],r=[],a=[],l={BLANK:0,RUNNING:1,FINISHED:2,RUNNINGOUTDATED:3},u=200,c=null,d=null,h=!0,f=1,g=1,p=0,m=0,v=0;function w(e){if("none"===e.style.display)return!1;var t=c.scrollTop,n=t+c.clientHeight,i=e.offsetTop,o=i+e.clientHeight;return i>=t&&i<n||o>=t&&o<n||i<t&&o>=n}function y(e){return s[e.pageNumber-1]}function x(e){return a[e.pageNumber-1]}function b(e,t){a[e.pageNumber-1]=t}function k(e,t,i){var o=y(e),s=o.getElementsByTagName("canvas")[0],r=o.getElementsByTagName("div")[0],a="scale("+f+", "+f+")";o.style.width=t+"px",o.style.height=i+"px",s.width=t,s.height=i,s.style.width=t+"px",s.style.height=i+"px",r.style.width=t+"px",r.style.height=i+"px",n.CustomStyle.setProp("transform",r,a),n.CustomStyle.setProp("transformOrigin",r,"0% 0%"),x(e)===l.RUNNING?b(e,l.RUNNINGOUTDATED):b(e,l.BLANK)}function P(e){var t,n,i;x(e)===l.BLANK&&(b(e,l.RUNNING),t=y(e),n=function(e){return r[e.pageNumber-1]}(e),i=t.getElementsByTagName("canvas")[0],e.render({canvasContext:i.getContext("2d"),textLayer:n,viewport:e.getViewport({scale:f})}).promise.then(function(){}))}function L(e){var n,g,w,y,x,b,P;n=e.pageNumber,b=e.getViewport({scale:f}),(x=document.createElement("div")).id="pageContainer"+n,x.className="page",x.style.display="none",(y=document.createElement("canvas")).id="canvas"+n,(g=document.createElement("div")).className="textLayer",g.id="textLayer"+n,x.appendChild(y),x.appendChild(g),o[e.pageNumber-1]=e,s[e.pageNumber-1]=x,a[e.pageNumber-1]=l.BLANK,k(e,b.width,b.height),p<b.width&&(p=b.width),m<b.height&&(m=b.height),b.width<b.height&&(h=!1),w=new i({textLayerDiv:g,viewport:b,pageIndex:n-1}),e.getTextContent().then(function(e){w.setTextContent(e),w.render(u)}),r[e.pageNumber-1]=w,(v+=1)===d.numPages&&(P=!t.isSlideshow(),s.forEach(function(e){P&&(e.style.display="block"),c.appendChild(e)}),t.onLoad(),t.showPage(1))}this.initialize=function(t,n){var i;(function(){e.GlobalWorkerOptions.workerSrc="./skylark-pdfjs-worker-all.js",e.getDocument(n).promise.then(function(e){for(d=e,c=t,i=0;i<d.numPages;i+=1)d.getPage(i+1).then(L)})})()},this.isSlideshow=function(){return h},this.onLoad=function(){},this.getPages=function(){return s},this.fitToWidth=function(e){var n;p!==e&&(n=e/p,t.setZoomLevel(n))},this.fitToHeight=function(e){var n;m!==e&&(n=e/m,t.setZoomLevel(n))},this.fitToPage=function(e,n){var i=e/p;n/m<i&&(i=n/m),t.setZoomLevel(i)},this.fitSmart=function(e,n){var i=e/p;n&&n/m<i&&(i=n/m),i=Math.min(1,i),t.setZoomLevel(i)},this.setZoomLevel=function(e){var t,n;if(f!==e)for(f=e,t=0;t<o.length;t+=1)n=o[t].getViewport({scale:f}),k(o[t],n.width,n.height)},this.getZoomLevel=function(){return f},this.onScroll=function(){var e;for(e=0;e<s.length;e+=1)w(s[e])&&P(o[e])},this.getPageInView=function(){var e;if(t.isSlideshow())return g;for(e=0;e<s.length;e+=1)if(w(s[e]))return e+1},this.showPage=function(e){var n;t.isSlideshow()?(s[g-1].style.display="none",g=e,P(o[e-1]),s[e-1].style.display="block"):(n=s[e-1]).parentNode.scrollTop=n.offsetTop},this.getPluginName=function(){return"PDF.js"},this.getPluginVersion=function(){var e="undefined"!==String(typeof pdfjs_version)?pdfjs_version:"From Source";return e},this.getPluginURL=function(){return"https://github.com/mozilla/pdf.js/"}}}),e("skylark-viewerjs/plugin_registry",["./viewerjs","./ODFViewerPlugin","./PDFViewerPlugin"],function(e,t,n){var i,o,s=[(i=["application/vnd.oasis.opendocument.text","application/vnd.oasis.opendocument.text-flat-xml","application/vnd.oasis.opendocument.text-template","application/vnd.oasis.opendocument.presentation","application/vnd.oasis.opendocument.presentation-flat-xml","application/vnd.oasis.opendocument.presentation-template","application/vnd.oasis.opendocument.spreadsheet","application/vnd.oasis.opendocument.spreadsheet-flat-xml","application/vnd.oasis.opendocument.spreadsheet-template"],o=["odt","fodt","ott","odp","fodp","otp","ods","fods","ots"],{supportsMimetype:function(e){return-1!==i.indexOf(e)},supportsFileExtension:function(e){return-1!==o.indexOf(e)},path:"./ODFViewerPlugin",getClass:function(){return t}}),{supportsMimetype:function(e){return"application/pdf"===e},supportsFileExtension:function(e){return"pdf"===e},path:"./PDFViewerPlugin",getClass:function(){return n}}];return e.pluginRegistry=s}),e("skylark-viewerjs/init",["./viewerjs","./viewer","./plugin_registry"],function(e,t,n){function i(e){var t;return n.some(function(n){return!!n.supportsFileExtension(e)&&(t=n,!0)}),t}return e.init=function(){window.onload=function(){var e,o=document.location.hash.substring(1),s=function(e){var t={};return(e.search||"?").substr(1).split("&").forEach(function(e){if(e){var n=e.split("=",2);t[decodeURIComponent(n[0])]=decodeURIComponent(n[1])}}),t}(document.location);o?(s.title||(s.title=o.replace(/^.*[\\\/]/,"")),s.documentUrl=o,function(e,t){var i=new XMLHttpRequest;i.onreadystatechange=function(){var e,o;4===i.readyState&&((i.status>=200&&i.status<300||0===i.status)&&(e=i.getResponseHeader("content-type"))&&n.some(function(t){return!!t.supportsMimetype(e)&&(o=t,console.log("Found plugin by mimetype and xhr head: "+e),!0)}),t(o))},i.open("HEAD",e,!0),i.send()}(o,function(n){n||(n=s.type?function(e){var t=i(e);t&&console.log("Found plugin by parameter type: "+e);return t}(s.type):function(e){var t=e.split("?")[0].split(".").pop(),n=i(t);n&&console.log("Found plugin by file extension from path: "+t);return n}(o)),n?"undefined"!==String(typeof loadPlugin)?loadPlugin(n.path,function(){e=n.getClass(),new t(new e,s)}):(e=n.getClass(),new t(new e,s)):new t})):new t}}}),e("skylark-viewerjs/main",["./viewerjs","./viewer","./ODFViewerPlugin","./PDFViewerPlugin","./plugin_registry","./text_layer_builder","./ui_utils","./init"],function(e){return e}),e("skylark-viewerjs",["skylark-viewerjs/main"],function(e){return e})}(n),!i){var r=require("skylark-langx-ns");o?module.exports=r:t.skylarkjs=r}}(0,this);
//# sourceMappingURL=sourcemaps/skylark-viewerjs.js.map