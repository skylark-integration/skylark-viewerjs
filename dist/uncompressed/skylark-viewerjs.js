/**
 * skylark-viewerjs - A version of viewerjs that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx-ns");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('skylark-viewerjs/viewerjs',[
	"skylark-langx-ns"
],function(skylark) {
	return skylark.attach("intg.viewerjs");
});
define('skylark-viewerjs/viewer',[
    "./viewerjs"
],function(viewerjs) {
    /*global document, window*/

    function Viewer(viewerPlugin, parameters) {
        "use strict";

        var self = this,
            kScrollbarPadding = 40,
            kMinScale = 0.25,
            kMaxScale = 4.0,
            kDefaultScaleDelta = 1.1,
            kDefaultScale = 'auto',
            presentationMode = false,
            isFullScreen = false,
            initialized = false,
            url,
            viewerElement = document.getElementById('viewer'),
            canvasContainer = document.getElementById('canvasContainer'),
            overlayNavigator = document.getElementById('overlayNavigator'),
            titlebar = document.getElementById('titlebar'),
            toolbar = document.getElementById('toolbarContainer'),
            pageSwitcher = document.getElementById('toolbarLeft'),
            zoomWidget = document.getElementById('toolbarMiddleContainer'),
            scaleSelector = document.getElementById('scaleSelect'),
            dialogOverlay = document.getElementById('dialogOverlay'),
            toolbarRight = document.getElementById('toolbarRight'),
            aboutDialog,
            pages = [],
            currentPage,
            scaleChangeTimer,
            touchTimer,
            toolbarTouchTimer,
            /**@const*/
            UI_FADE_DURATION = 5000;

        function isBlankedOut() {
            return (blanked.style.display === 'block');
        }

        function initializeAboutInformation() {
            var aboutDialogCentererTable, aboutDialogCentererCell, aboutButton, pluginName, pluginVersion, pluginURL,
                version;

            version = (String(typeof ViewerJS_version) !== "undefined" ? ViewerJS_version : "From Source");
            if (viewerPlugin) {
                pluginName = viewerPlugin.getPluginName();
                pluginVersion = viewerPlugin.getPluginVersion();
                pluginURL = viewerPlugin.getPluginURL();
            }

            // Create dialog
            aboutDialogCentererTable = document.createElement('div');
            aboutDialogCentererTable.id = "aboutDialogCentererTable";
            aboutDialogCentererCell = document.createElement('div');
            aboutDialogCentererCell.id = "aboutDialogCentererCell";
            aboutDialog = document.createElement('div');
            aboutDialog.id = "aboutDialog";
            aboutDialog.innerHTML =
                "<h1>ViewerJS</h1>" +
                "<p>Open Source document viewer for webpages, built with HTML and JavaScript.</p>" +
                "<p>Learn more and get your own copy on the <a href=\"http://viewerjs.org/\" target=\"_blank\">ViewerJS website</a>.</p>" +
                (viewerPlugin ? ("<p>Using the <a href = \""+ pluginURL + "\" target=\"_blank\">" + pluginName + "</a> " +
                                "(<span id = \"pluginVersion\">" + pluginVersion + "</span>) " +
                                "plugin to show you this document.</p>")
                             : "") +
                "<p>Version " + version + "</p>" +
                "<p>Supported by <a href=\"https://nlnet.nl\" target=\"_blank\"><br><img src=\"images\/nlnet.png\" width=\"160\" height=\"60\" alt=\"NLnet Foundation\"></a></p>" +
                "<p>Made by <a href=\"http://kogmbh.com\" target=\"_blank\"><br><img src=\"images\/kogmbh.png\" width=\"172\" height=\"40\" alt=\"KO GmbH\"></a></p>" +
                "<button id = \"aboutDialogCloseButton\" class = \"toolbarButton textButton\">Close</button>";
            dialogOverlay.appendChild(aboutDialogCentererTable);
            aboutDialogCentererTable.appendChild(aboutDialogCentererCell);
            aboutDialogCentererCell.appendChild(aboutDialog);

            // Create button to open dialog that says "ViewerJS"
            aboutButton = document.createElement('button');
            aboutButton.id = "about";
            aboutButton.className = "toolbarButton textButton about";
            aboutButton.title = "About";
            aboutButton.innerHTML = "ViewerJS"
            toolbarRight.appendChild(aboutButton);

            // Attach events to the above
            aboutButton.addEventListener('click', function () {
                    showAboutDialog();
            });
            document.getElementById('aboutDialogCloseButton').addEventListener('click', function () {
                    hideAboutDialog();
            });

        }

        function showAboutDialog() {
            dialogOverlay.style.display = "block";
        }

        function hideAboutDialog() {
            dialogOverlay.style.display = "none";
        }

        function selectScaleOption(value) {
            // Retrieve the options from the zoom level <select> element
            var options = scaleSelector.options,
                option,
                predefinedValueFound = false,
                i;

            for (i = 0; i < options.length; i += 1) {
                option = options[i];
                if (option.value !== value) {
                    option.selected = false;
                    continue;
                }
                option.selected = true;
                predefinedValueFound = true;
            }
            return predefinedValueFound;
        }

        function getPages() {
            return viewerPlugin.getPages();
        }

        function setScale(val, resetAutoSettings) {
            if (val === self.getZoomLevel()) {
                return;
            }

            self.setZoomLevel(val);

            var event = document.createEvent('UIEvents');
            event.initUIEvent('scalechange', false, false, window, 0);
            event.scale = val;
            event.resetAutoSettings = resetAutoSettings;
            window.dispatchEvent(event);
        }

        function onScroll() {
            var pageNumber;

            if (viewerPlugin.onScroll) {
                viewerPlugin.onScroll();
            }
            if (viewerPlugin.getPageInView) {
                pageNumber = viewerPlugin.getPageInView();
                if (pageNumber) {
                    currentPage = pageNumber;
                    document.getElementById('pageNumber').value = pageNumber;
                }
            }
        }

        function delayedRefresh(milliseconds) {
            window.clearTimeout(scaleChangeTimer);
            scaleChangeTimer = window.setTimeout(function () {
                onScroll();
            }, milliseconds);
        }

        function parseScale(value, resetAutoSettings) {
            var scale,
                maxWidth,
                maxHeight;

            if (value === 'custom') {
                scale = parseFloat(document.getElementById('customScaleOption').textContent) / 100;
            } else {
                scale = parseFloat(value);
            }

            if (scale) {
                setScale(scale, true);
                delayedRefresh(300);
                return;
            }

            maxWidth = canvasContainer.clientWidth - kScrollbarPadding;
            maxHeight = canvasContainer.clientHeight - kScrollbarPadding;

            switch (value) {
            case 'page-actual':
                setScale(1, resetAutoSettings);
                break;
            case 'page-width':
                viewerPlugin.fitToWidth(maxWidth);
                break;
            case 'page-height':
                viewerPlugin.fitToHeight(maxHeight);
                break;
            case 'page-fit':
                viewerPlugin.fitToPage(maxWidth, maxHeight);
                break;
            case 'auto':
                if (viewerPlugin.isSlideshow()) {
                    viewerPlugin.fitToPage(maxWidth + kScrollbarPadding, maxHeight + kScrollbarPadding);
                } else {
                    viewerPlugin.fitSmart(maxWidth);
                }
                break;
            }

            selectScaleOption(value);
            delayedRefresh(300);
        }

        function readZoomParameter(zoom) {
            var validZoomStrings = ["auto", "page-actual", "page-width"],
                number;

            if (validZoomStrings.indexOf(zoom) !== -1) {
                return zoom;
            }
            number = parseFloat(zoom);
            if (number && kMinScale <= number && number <= kMaxScale) {
                return zoom;
            }
            return kDefaultScale;
        }

        function readStartPageParameter(startPage) {
            var result = parseInt(startPage, 10);
            return isNaN(result) ? 1 : result;
        }

        this.initialize = function () {
            var initialScale,
                element;

            initialScale = readZoomParameter(parameters.zoom);

            url = parameters.documentUrl;
            document.title = parameters.title;
            var documentName = document.getElementById('documentName');
            documentName.innerHTML = "";
            documentName.appendChild(documentName.ownerDocument.createTextNode(parameters.title));

            viewerPlugin.onLoad = function () {
                document.getElementById('pluginVersion').innerHTML = viewerPlugin.getPluginVersion();

                if (viewerPlugin.isSlideshow()) {
                    // Slideshow pages should be centered
                    canvasContainer.classList.add("slideshow");
                    // Show page nav controls only for presentations
                    pageSwitcher.style.visibility = 'visible';
                } else {
                    // For text documents, show the zoom widget.
                    zoomWidget.style.visibility = 'visible';
                    // Only show the page switcher widget if the plugin supports page numbers
                    if (viewerPlugin.getPageInView) {
                        pageSwitcher.style.visibility = 'visible';
                    }
                }

                initialized = true;
                pages = getPages();
                document.getElementById('numPages').innerHTML = 'of ' + pages.length;


                // Set default scale
                parseScale(initialScale);


                self.showPage(readStartPageParameter(parameters.startpage));

                canvasContainer.onscroll = onScroll;
                delayedRefresh();
            };

            viewerPlugin.initialize(canvasContainer, url);
        };

        /**
         * Shows the 'n'th page. If n is larger than the page count,
         * shows the last page. If n is less than 1, shows the first page.
         * @return {undefined}
         */
        this.showPage = function (n) {
            if (n <= 0) {
                n = 1;
            } else if (n > pages.length) {
                n = pages.length;
            }

            viewerPlugin.showPage(n);

            currentPage = n;
            document.getElementById('pageNumber').value = currentPage;
        };

        /**
         * Shows the next page. If there is no subsequent page, does nothing.
         * @return {undefined}
         */
        this.showNextPage = function () {
            self.showPage(currentPage + 1);
        };

        /**
         * Shows the previous page. If there is no previous page, does nothing.
         * @return {undefined}
         */
        this.showPreviousPage = function () {
            self.showPage(currentPage - 1);
        };

        /**
         * Attempts to 'download' the file.
         * @return {undefined}
         */
        this.download = function () {
            var documentUrl = url.split('#')[0];
            documentUrl += '#viewer.action=download';
            window.open(documentUrl, '_parent');
        };

        /**
         * Toggles the fullscreen state of the viewer
         * @return {undefined}
         */
        this.toggleFullScreen = function () {
            var elem = viewerElement;
            if (!isFullScreen) {
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                } else if (elem.mozRequestFullScreen) {
                    elem.mozRequestFullScreen();
                } else if (elem.webkitRequestFullscreen) {
                    elem.webkitRequestFullscreen();
                } else if (elem.webkitRequestFullScreen) {
                    elem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
                } else if (elem.msRequestFullscreen) {
                    elem.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.cancelFullScreen) {
                    document.cancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        };

        /**
         * Toggles the presentation mode of the viewer.
         * Presentation mode involves fullscreen + hidden UI controls
         */
        this.togglePresentationMode = function () {
            var overlayCloseButton = document.getElementById('overlayCloseButton');

            if (!presentationMode) {
                titlebar.style.display = toolbar.style.display = 'none';
                overlayCloseButton.style.display = 'block';
                canvasContainer.classList.add('presentationMode');
                canvasContainer.onmousedown = function (event) {
                    event.preventDefault();
                };
                canvasContainer.oncontextmenu = function (event) {
                    event.preventDefault();
                };
                canvasContainer.onmouseup = function (event) {
                    event.preventDefault();
                    if (event.which === 1) {
                        self.showNextPage();
                    } else {
                        self.showPreviousPage();
                    }
                };
                parseScale('page-fit');
            } else {
                if (isBlankedOut()) {
                    leaveBlankOut();
                }
                titlebar.style.display = toolbar.style.display = 'block';
                overlayCloseButton.style.display = 'none';
                canvasContainer.classList.remove('presentationMode');
                canvasContainer.onmouseup = function () {};
                canvasContainer.oncontextmenu = function () {};
                canvasContainer.onmousedown = function () {};
                parseScale('auto');
            }

            presentationMode = !presentationMode;
        };

        /**
         * Gets the zoom level of the document
         * @return {!number}
         */
        this.getZoomLevel = function () {
            return viewerPlugin.getZoomLevel();
        };

        /**
         * Set the zoom level of the document
         * @param {!number} value
         * @return {undefined}
         */
        this.setZoomLevel = function (value) {
            viewerPlugin.setZoomLevel(value);
        };

        /**
         * Zoom out by 10 %
         * @return {undefined}
         */
        this.zoomOut = function () {
            // 10 % decrement
            var newScale = (self.getZoomLevel() / kDefaultScaleDelta).toFixed(2);
            newScale = Math.max(kMinScale, newScale);
            parseScale(newScale, true);
        };

        /**
         * Zoom in by 10%
         * @return {undefined}
         */
        this.zoomIn = function () {
            // 10 % increment
            var newScale = (self.getZoomLevel() * kDefaultScaleDelta).toFixed(2);
            newScale = Math.min(kMaxScale, newScale);
            parseScale(newScale, true);
        };

        function cancelPresentationMode() {
            if (presentationMode && !isFullScreen) {
                self.togglePresentationMode();
            }
        }

        function handleFullScreenChange() {
            isFullScreen = !isFullScreen;
            cancelPresentationMode();
        }

        function showOverlayNavigator() {
            if (presentationMode || viewerPlugin.isSlideshow()) {
                overlayNavigator.className = 'viewer-touched';
                window.clearTimeout(touchTimer);
                touchTimer = window.setTimeout(function () {
                    overlayNavigator.className = '';
                }, UI_FADE_DURATION);
            }
        }

        /**
         * @param {!boolean} timed Fade after a while
         */
        function showToolbars() {
            titlebar.classList.add('viewer-touched');
            toolbar.classList.add('viewer-touched');
            window.clearTimeout(toolbarTouchTimer);
            toolbarTouchTimer = window.setTimeout(function () {
                hideToolbars();
            }, UI_FADE_DURATION);
        }

        function hideToolbars() {
            titlebar.classList.remove('viewer-touched');
            toolbar.classList.remove('viewer-touched');
        }

        function toggleToolbars() {
            if (titlebar.classList.contains('viewer-touched')) {
                hideToolbars();
            } else {
                showToolbars();
            }
        }

        function blankOut(value) {
            blanked.style.display = 'block';
            blanked.style.backgroundColor = value;
            hideToolbars();
        }

        function leaveBlankOut() {
            blanked.style.display = 'none';
            toggleToolbars();
        }

        function setButtonClickHandler(buttonId, handler) {
            var button = document.getElementById(buttonId);

            button.addEventListener('click', function () {
                handler();
                button.blur();
            });
        }

        function init() {

            initializeAboutInformation();

            if (viewerPlugin) {
                self.initialize();

                if (!(document.exitFullscreen || document.cancelFullScreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.webkitCancelFullScreen || document.msExitFullscreen)) {
                    document.getElementById('fullscreen').style.visibility = 'hidden';
                    document.getElementById('presentation').style.visibility = 'hidden';
                }

                setButtonClickHandler('overlayCloseButton', self.toggleFullScreen);
                setButtonClickHandler('fullscreen', self.toggleFullScreen);
                setButtonClickHandler('presentation', function () {
                    if (!isFullScreen) {
                        self.toggleFullScreen();
                    }
                    self.togglePresentationMode();
                });

                document.addEventListener('fullscreenchange', handleFullScreenChange);
                document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
                document.addEventListener('mozfullscreenchange', handleFullScreenChange);
                document.addEventListener('MSFullscreenChange', handleFullScreenChange);

                setButtonClickHandler('download', self.download);

                setButtonClickHandler('zoomOut', self.zoomOut);
                setButtonClickHandler('zoomIn', self.zoomIn);

                setButtonClickHandler('previous', self.showPreviousPage);
                setButtonClickHandler('next', self.showNextPage);

                setButtonClickHandler('previousPage', self.showPreviousPage);
                setButtonClickHandler('nextPage', self.showNextPage);

                document.getElementById('pageNumber').addEventListener('change', function () {
                    self.showPage(this.value);
                });

                document.getElementById('scaleSelect').addEventListener('change', function () {
                    parseScale(this.value);
                });

                canvasContainer.addEventListener('click', showOverlayNavigator);
                overlayNavigator.addEventListener('click', showOverlayNavigator);
                canvasContainer.addEventListener('click', toggleToolbars);
                titlebar.addEventListener('click', showToolbars);
                toolbar.addEventListener('click', showToolbars);

                window.addEventListener('scalechange', function (evt) {
                    var customScaleOption = document.getElementById('customScaleOption'),
                        predefinedValueFound = selectScaleOption(String(evt.scale));

                    customScaleOption.selected = false;

                    if (!predefinedValueFound) {
                        customScaleOption.textContent = Math.round(evt.scale * 10000) / 100 + '%';
                        customScaleOption.selected = true;
                    }
                }, true);

                window.addEventListener('resize', function (evt) {
                    if (initialized &&
                              (document.getElementById('pageWidthOption').selected ||
                              document.getElementById('pageAutoOption').selected)) {
                        parseScale(document.getElementById('scaleSelect').value);
                    }
                    showOverlayNavigator();
                });

                window.addEventListener('keydown', function (evt) {
                    var key = evt.keyCode,
                        shiftKey = evt.shiftKey;

                    // blanked-out mode?
                    if (isBlankedOut()) {
                        switch (key) {
                        case 16: // Shift
                        case 17: // Ctrl
                        case 18: // Alt
                        case 91: // LeftMeta
                        case 93: // RightMeta
                        case 224: // MetaInMozilla
                        case 225: // AltGr
                            // ignore modifier keys alone
                            break;
                        default:
                            leaveBlankOut();
                            break;
                        }
                    } else {
                        switch (key) {
                        case 8: // backspace
                        case 33: // pageUp
                        case 37: // left arrow
                        case 38: // up arrow
                        case 80: // key 'p'
                            self.showPreviousPage();
                            break;
                        case 13: // enter
                        case 34: // pageDown
                        case 39: // right arrow
                        case 40: // down arrow
                        case 78: // key 'n'
                            self.showNextPage();
                            break;
                        case 32: // space
                            shiftKey ? self.showPreviousPage() : self.showNextPage();
                            break;
                        case 66:  // key 'b' blanks screen (to black) or returns to the document
                        case 190: // and so does the key '.' (dot)
                            if (presentationMode) {
                                blankOut('#000');
                            }
                            break;
                        case 87:  // key 'w' blanks page (to white) or returns to the document
                        case 188: // and so does the key ',' (comma)
                            if (presentationMode) {
                                blankOut('#FFF');
                            }
                            break;
                        case 36: // key 'Home' goes to first page
                            self.showPage(1);
                            break;
                        case 35: // key 'End' goes to last page
                            self.showPage(pages.length);
                            break;
                        }
                    }
                });
            }
        }

        init();
    }

    return viewerjs.Viewer = Viewer;
});
define('skylark-viewerjs/ODFViewerPlugin',[
    "skylark-webodf",
    "./viewerjs"
],function(webodf,viewerjs) {
    function ODFViewerPlugin() {
        "use strict";

        function init(callback) {
            /*
            var lib = document.createElement('script'),
                pluginCSS;

            lib.async = false;
            lib.src = './webodf.js';
            lib.type = 'text/javascript';
            lib.onload = function () {
                runtime.loadClass('gui.HyperlinkClickHandler');
                runtime.loadClass('odf.OdfCanvas');
                runtime.loadClass('ops.Session');
                runtime.loadClass('gui.CaretManager');
                runtime.loadClass("gui.HyperlinkTooltipView");
                runtime.loadClass('gui.SessionController');
                runtime.loadClass('gui.SvgSelectionView');
                runtime.loadClass('gui.SelectionViewManager');
                runtime.loadClass('gui.ShadowCursor');
                runtime.loadClass('gui.SessionView');

                callback();
            };

            document.head.appendChild(lib);
            */
            callback();
        }

        // that should probably be provided by webodf
        function nsResolver(prefix) {
            var ns = {
                'draw' : "urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
                'presentation' : "urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",
                'text' : "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
                'office' : "urn:oasis:names:tc:opendocument:xmlns:office:1.0"
            };
            return ns[prefix] || console.log('prefix [' + prefix + '] unknown.');
        }

        var self = this,
            pluginName = "WebODF",
            pluginURL = "http://webodf.org",
            odfCanvas = null,
            odfElement = null,
            initialized = false,
            root = null,
            documentType = null,
            pages = [],
            currentPage = null;

        this.initialize = function (viewerElement, documentUrl) {
            // If the URL has a fragment (#...), try to load the file it represents
            init(function () {
                var session,
                    sessionController,
                    sessionView,
                    odtDocument,
                    shadowCursor,
                    selectionViewManager,
                    caretManager,
                    localMemberId = 'localuser',
                    hyperlinkTooltipView,
                    eventManager;

                odfElement = document.getElementById('canvas');
                odfCanvas = new webodf.odf.OdfCanvas(odfElement);
                odfCanvas.load(documentUrl);

                odfCanvas.addListener('statereadychange', function () {
                    root = odfCanvas.odfContainer().rootElement;
                    initialized = true;
                    documentType = odfCanvas.odfContainer().getDocumentType(root);
                    if (documentType === 'text') {
                        odfCanvas.enableAnnotations(true, false);

                        session = new ops.Session(odfCanvas);
                        odtDocument = session.getOdtDocument();
                        shadowCursor = new gui.ShadowCursor(odtDocument);
                        sessionController = new gui.SessionController(session, localMemberId, shadowCursor, {});
                        eventManager = sessionController.getEventManager();
                        caretManager = new gui.CaretManager(sessionController, odfCanvas.getViewport());
                        selectionViewManager = new gui.SelectionViewManager(gui.SvgSelectionView);
                        sessionView = new gui.SessionView({
                            caretAvatarsInitiallyVisible: false
                        }, localMemberId, session, sessionController.getSessionConstraints(), caretManager, selectionViewManager);
                        selectionViewManager.registerCursor(shadowCursor);
                        hyperlinkTooltipView = new gui.HyperlinkTooltipView(odfCanvas,
                            sessionController.getHyperlinkClickHandler().getModifier);
                        eventManager.subscribe("mousemove", hyperlinkTooltipView.showTooltip);
                        eventManager.subscribe("mouseout", hyperlinkTooltipView.hideTooltip);

                        var op = new ops.OpAddMember();
                        op.init({
                            memberid: localMemberId,
                            setProperties: {
                                fillName: webodf.runtime.tr("Unknown Author"),
                                color: "blue"
                            }
                        });
                        session.enqueue([op]);
                        sessionController.insertLocalCursor();
                    }

                    self.onLoad();
                });
            });
        };

        this.isSlideshow = function () {
            return documentType === 'presentation';
        };

        this.onLoad = function () {};

        this.fitToWidth = function (width) {
            odfCanvas.fitToWidth(width);
        };

        this.fitToHeight = function (height) {
            odfCanvas.fitToHeight(height);
        };

        this.fitToPage = function (width, height) {
            odfCanvas.fitToContainingElement(width, height);
        };

        this.fitSmart = function (width) {
            odfCanvas.fitSmart(width);
        };

        this.getZoomLevel = function () {
            return odfCanvas.getZoomLevel();
        };

        this.setZoomLevel = function (value) {
            odfCanvas.setZoomLevel(value);
        };

        // return a list of tuples (pagename, pagenode)
        this.getPages = function () {
            var pageNodes = Array.prototype.slice.call(root.getElementsByTagNameNS(nsResolver('draw'), 'page')),
                pages  = [],
                i,
                tuple;

            for (i = 0; i < pageNodes.length; i += 1) {
                tuple = [
                    pageNodes[i].getAttribute('draw:name'),
                    pageNodes[i]
                ];
                pages.push(tuple);
            }
            return pages;
        };

        this.showPage = function (n) {
            odfCanvas.showPage(n);
        };

        this.getPluginName = function () {
            return pluginName;
        };

        this.getPluginVersion = function () {
            var version;

            if (String(typeof webodf) !== "undefined") {
                version = webodf.Version;
            } else {
                version = "Unknown";
            }

            return version;
        };

        this.getPluginURL = function () {
            return pluginURL;
        };
    }

    return viewerjs.ODFViewerPlugin = ODFViewerPlugin;
});



define('skylark-viewerjs/ui_utils',[
    "./viewerjs"
],function(viewerjs) {
  'use strict';

  var CSS_UNITS = 96.0 / 72.0;
  var DEFAULT_SCALE = 'auto';
  var UNKNOWN_SCALE = 0;
  var MAX_AUTO_SCALE = 1.25;
  var SCROLLBAR_PADDING = 40;
  var VERTICAL_PADDING = 5;

  // optimised CSS custom property getter/setter
  var CustomStyle = (function CustomStyleClosure() {

    // As noted on: http://www.zachstronaut.com/posts/2009/02/17/
    //              animate-css-transforms-firefox-webkit.html
    // in some versions of IE9 it is critical that ms appear in this list
    // before Moz
    var prefixes = ['ms', 'Moz', 'Webkit', 'O'];
    var _cache = {};

    function CustomStyle() {}

    CustomStyle.getProp = function get(propName, element) {
      // check cache only when no element is given
      if (arguments.length === 1 && typeof _cache[propName] === 'string') {
        return _cache[propName];
      }

      element = element || document.documentElement;
      var style = element.style, prefixed, uPropName;

      // test standard property first
      if (typeof style[propName] === 'string') {
        return (_cache[propName] = propName);
      }

      // capitalize
      uPropName = propName.charAt(0).toUpperCase() + propName.slice(1);

      // test vendor specific properties
      for (var i = 0, l = prefixes.length; i < l; i++) {
        prefixed = prefixes[i] + uPropName;
        if (typeof style[prefixed] === 'string') {
          return (_cache[propName] = prefixed);
        }
      }

      //if all fails then set to undefined
      return (_cache[propName] = 'undefined');
    };

    CustomStyle.setProp = function set(propName, element, str) {
      var prop = this.getProp(propName);
      if (prop !== 'undefined') {
        element.style[prop] = str;
      }
    };

    return CustomStyle;
  })();

  function getFileName(url) {
    var anchor = url.indexOf('#');
    var query = url.indexOf('?');
    var end = Math.min(
      anchor > 0 ? anchor : url.length,
      query > 0 ? query : url.length);
    return url.substring(url.lastIndexOf('/', end) + 1, end);
  }

  /**
   * Returns scale factor for the canvas. It makes sense for the HiDPI displays.
   * @return {Object} The object with horizontal (sx) and vertical (sy)
                      scales. The scaled property is set to false if scaling is
                      not required, true otherwise.
   */
  function getOutputScale(ctx) {
    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                            ctx.mozBackingStorePixelRatio ||
                            ctx.msBackingStorePixelRatio ||
                            ctx.oBackingStorePixelRatio ||
                            ctx.backingStorePixelRatio || 1;
    var pixelRatio = devicePixelRatio / backingStoreRatio;
    return {
      sx: pixelRatio,
      sy: pixelRatio,
      scaled: pixelRatio !== 1
    };
  }

  /**
   * Scrolls specified element into view of its parent.
   * element {Object} The element to be visible.
   * spot {Object} An object with optional top and left properties,
   *               specifying the offset from the top left edge.
   */
  function scrollIntoView(element, spot) {
    // Assuming offsetParent is available (it's not available when viewer is in
    // hidden iframe or object). We have to scroll: if the offsetParent is not set
    // producing the error. See also animationStartedClosure.
    var parent = element.offsetParent;
    var offsetY = element.offsetTop + element.clientTop;
    var offsetX = element.offsetLeft + element.clientLeft;
    if (!parent) {
      console.error('offsetParent is not set -- cannot scroll');
      return;
    }
    while (parent.clientHeight === parent.scrollHeight) {
      if (parent.dataset._scaleY) {
        offsetY /= parent.dataset._scaleY;
        offsetX /= parent.dataset._scaleX;
      }
      offsetY += parent.offsetTop;
      offsetX += parent.offsetLeft;
      parent = parent.offsetParent;
      if (!parent) {
        return; // no need to scroll
      }
    }
    if (spot) {
      if (spot.top !== undefined) {
        offsetY += spot.top;
      }
      if (spot.left !== undefined) {
        offsetX += spot.left;
        parent.scrollLeft = offsetX;
      }
    }
    parent.scrollTop = offsetY;
  }

  /**
   * Helper function to start monitoring the scroll event and converting them into
   * PDF.js friendly one: with scroll debounce and scroll direction.
   */
  function watchScroll(viewAreaElement, callback) {
    var debounceScroll = function debounceScroll(evt) {
      if (rAF) {
        return;
      }
      // schedule an invocation of scroll for next animation frame.
      rAF = window.requestAnimationFrame(function viewAreaElementScrolled() {
        rAF = null;

        var currentY = viewAreaElement.scrollTop;
        var lastY = state.lastY;
        if (currentY !== lastY) {
          state.down = currentY > lastY;
        }
        state.lastY = currentY;
        callback(state);
      });
    };

    var state = {
      down: true,
      lastY: viewAreaElement.scrollTop,
      _eventHandler: debounceScroll
    };

    var rAF = null;
    viewAreaElement.addEventListener('scroll', debounceScroll, true);
    return state;
  }

  /**
   * Use binary search to find the index of the first item in a given array which
   * passes a given condition. The items are expected to be sorted in the sense
   * that if the condition is true for one item in the array, then it is also true
   * for all following items.
   *
   * @returns {Number} Index of the first array element to pass the test,
   *                   or |items.length| if no such element exists.
   */
  function binarySearchFirstItem(items, condition) {
    var minIndex = 0;
    var maxIndex = items.length - 1;

    if (items.length === 0 || !condition(items[maxIndex])) {
      return items.length;
    }
    if (condition(items[minIndex])) {
      return minIndex;
    }

    while (minIndex < maxIndex) {
      var currentIndex = (minIndex + maxIndex) >> 1;
      var currentItem = items[currentIndex];
      if (condition(currentItem)) {
        maxIndex = currentIndex;
      } else {
        minIndex = currentIndex + 1;
      }
    }
    return minIndex; /* === maxIndex */
  }

  /**
   * Generic helper to find out what elements are visible within a scroll pane.
   */
  function getVisibleElements(scrollEl, views, sortByVisibility) {
    var top = scrollEl.scrollTop, bottom = top + scrollEl.clientHeight;
    var left = scrollEl.scrollLeft, right = left + scrollEl.clientWidth;

    function isElementBottomBelowViewTop(view) {
      var element = view.div;
      var elementBottom =
        element.offsetTop + element.clientTop + element.clientHeight;
      return elementBottom > top;
    }

    var visible = [], view, element;
    var currentHeight, viewHeight, hiddenHeight, percentHeight;
    var currentWidth, viewWidth;
    var firstVisibleElementInd = (views.length === 0) ? 0 :
      binarySearchFirstItem(views, isElementBottomBelowViewTop);

    for (var i = firstVisibleElementInd, ii = views.length; i < ii; i++) {
      view = views[i];
      element = view.div;
      currentHeight = element.offsetTop + element.clientTop;
      viewHeight = element.clientHeight;

      if (currentHeight > bottom) {
        break;
      }

      currentWidth = element.offsetLeft + element.clientLeft;
      viewWidth = element.clientWidth;
      if (currentWidth + viewWidth < left || currentWidth > right) {
        continue;
      }
      hiddenHeight = Math.max(0, top - currentHeight) +
        Math.max(0, currentHeight + viewHeight - bottom);
      percentHeight = ((viewHeight - hiddenHeight) * 100 / viewHeight) | 0;

      visible.push({
        id: view.id,
        x: currentWidth,
        y: currentHeight,
        view: view,
        percent: percentHeight
      });
    }

    var first = visible[0];
    var last = visible[visible.length - 1];

    if (sortByVisibility) {
      visible.sort(function(a, b) {
        var pc = a.percent - b.percent;
        if (Math.abs(pc) > 0.001) {
          return -pc;
        }
        return a.id - b.id; // ensure stability
      });
    }
    return {first: first, last: last, views: visible};
  }

  /**
   * Event handler to suppress context menu.
   */
  function noContextMenuHandler(e) {
    e.preventDefault();
  }

  /**
   * Returns the filename or guessed filename from the url (see issue 3455).
   * url {String} The original PDF location.
   * @return {String} Guessed PDF file name.
   */
  function getPDFFileNameFromURL(url) {
    var reURI = /^(?:([^:]+:)?\/\/[^\/]+)?([^?#]*)(\?[^#]*)?(#.*)?$/;
    //            SCHEME      HOST         1.PATH  2.QUERY   3.REF
    // Pattern to get last matching NAME.pdf
    var reFilename = /[^\/?#=]+\.pdf\b(?!.*\.pdf\b)/i;
    var splitURI = reURI.exec(url);
    var suggestedFilename = reFilename.exec(splitURI[1]) ||
                             reFilename.exec(splitURI[2]) ||
                             reFilename.exec(splitURI[3]);
    if (suggestedFilename) {
      suggestedFilename = suggestedFilename[0];
      if (suggestedFilename.indexOf('%') !== -1) {
        // URL-encoded %2Fpath%2Fto%2Ffile.pdf should be file.pdf
        try {
          suggestedFilename =
            reFilename.exec(decodeURIComponent(suggestedFilename))[0];
        } catch(e) { // Possible (extremely rare) errors:
          // URIError "Malformed URI", e.g. for "%AA.pdf"
          // TypeError "null has no properties", e.g. for "%2F.pdf"
        }
      }
    }
    return suggestedFilename || 'document.pdf';
  }

  var ProgressBar = (function ProgressBarClosure() {

    function clamp(v, min, max) {
      return Math.min(Math.max(v, min), max);
    }

    function ProgressBar(id, opts) {
      this.visible = true;

      // Fetch the sub-elements for later.
      this.div = document.querySelector(id + ' .progress');

      // Get the loading bar element, so it can be resized to fit the viewer.
      this.bar = this.div.parentNode;

      // Get options, with sensible defaults.
      this.height = opts.height || 100;
      this.width = opts.width || 100;
      this.units = opts.units || '%';

      // Initialize heights.
      this.div.style.height = this.height + this.units;
      this.percent = 0;
    }

    ProgressBar.prototype = {

      updateBar: function ProgressBar_updateBar() {
        if (this._indeterminate) {
          this.div.classList.add('indeterminate');
          this.div.style.width = this.width + this.units;
          return;
        }

        this.div.classList.remove('indeterminate');
        var progressSize = this.width * this._percent / 100;
        this.div.style.width = progressSize + this.units;
      },

      get percent() {
        return this._percent;
      },

      set percent(val) {
        this._indeterminate = isNaN(val);
        this._percent = clamp(val, 0, 100);
        this.updateBar();
      },

      setWidth: function ProgressBar_setWidth(viewer) {
        if (viewer) {
          var container = viewer.parentNode;
          var scrollbarWidth = container.offsetWidth - viewer.offsetWidth;
          if (scrollbarWidth > 0) {
            this.bar.setAttribute('style', 'width: calc(100% - ' +
                                           scrollbarWidth + 'px);');
          }
        }
      },

      hide: function ProgressBar_hide() {
        if (!this.visible) {
          return;
        }
        this.visible = false;
        this.bar.classList.add('hidden');
        document.body.classList.remove('loadingInProgress');
      },

      show: function ProgressBar_show() {
        if (this.visible) {
          return;
        }
        this.visible = true;
        document.body.classList.add('loadingInProgress');
        this.bar.classList.remove('hidden');
      }
    };

    return ProgressBar;
  })();

  return viewerjs.uiutils = {
    CustomStyle,
    getFileName,
    getOutputScale,
    scrollIntoView,
    watchScroll,
    binarySearchFirstItem,
    getVisibleElements,
    getPDFFileNameFromURL,
    ProgressBar
  };
});
define('skylark-viewerjs/text_layer_builder',[
    "skylark-pdfjs-display",
    "./viewerjs",
    "./ui_utils"
],function(PDFJS,viewerjs,uiutils) {
  'use strict';

  var MAX_TEXT_DIVS_TO_RENDER = 100000;

  var NonWhitespaceRegexp = /\S/;

  function isAllWhitespace(str) {
    return !NonWhitespaceRegexp.test(str);
  }

  /**
   * @typedef {Object} TextLayerBuilderOptions
   * @property {HTMLDivElement} textLayerDiv - The text layer container.
   * @property {number} pageIndex - The page index.
   * @property {PageViewport} viewport - The viewport of the text layer.
   * @property {PDFFindController} findController
   */

  /**
   * TextLayerBuilder provides text-selection functionality for the PDF.
   * It does this by creating overlay divs over the PDF text. These divs
   * contain text that matches the PDF text they are overlaying. This object
   * also provides a way to highlight text that is being searched for.
   * @class
   */
  function TextLayerBuilder(options) {
    this.textLayerDiv = options.textLayerDiv;
    this.renderingDone = false;
    this.divContentDone = false;
    this.pageIdx = options.pageIndex;
    this.pageNumber = this.pageIdx + 1;
    this.matches = [];
    this.viewport = options.viewport;
    this.textDivs = [];
    this.findController = options.findController || null;
  }

  TextLayerBuilder.prototype = {
    _finishRendering: function TextLayerBuilder_finishRendering() {
      this.renderingDone = true;

      var event = document.createEvent('CustomEvent');
      event.initCustomEvent('textlayerrendered', true, true, {
        pageNumber: this.pageNumber
      });
      this.textLayerDiv.dispatchEvent(event);
    },

    renderLayer: function TextLayerBuilder_renderLayer() {
      var textLayerFrag = document.createDocumentFragment();
      var textDivs = this.textDivs;
      var textDivsLength = textDivs.length;
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');

      // No point in rendering many divs as it would make the browser
      // unusable even after the divs are rendered.
      if (textDivsLength > MAX_TEXT_DIVS_TO_RENDER) {
        this._finishRendering();
        return;
      }

      var lastFontSize;
      var lastFontFamily;
      for (var i = 0; i < textDivsLength; i++) {
        var textDiv = textDivs[i];
        if (textDiv.dataset.isWhitespace !== undefined) {
          continue;
        }

        var fontSize = textDiv.style.fontSize;
        var fontFamily = textDiv.style.fontFamily;

        // Only build font string and set to context if different from last.
        if (fontSize !== lastFontSize || fontFamily !== lastFontFamily) {
          ctx.font = fontSize + ' ' + fontFamily;
          lastFontSize = fontSize;
          lastFontFamily = fontFamily;
        }

        var width = ctx.measureText(textDiv.textContent).width;
        if (width > 0) {
          textLayerFrag.appendChild(textDiv);
          var transform;
          if (textDiv.dataset.canvasWidth !== undefined) {
            // Dataset values come of type string.
            var textScale = textDiv.dataset.canvasWidth / width;
            transform = 'scaleX(' + textScale + ')';
          } else {
            transform = '';
          }
          var rotation = textDiv.dataset.angle;
          if (rotation) {
            transform = 'rotate(' + rotation + 'deg) ' + transform;
          }
          if (transform) {
            uiutils.CustomStyle.setProp('transform' , textDiv, transform);
          }
        }
      }

      this.textLayerDiv.appendChild(textLayerFrag);
      this._finishRendering();
      this.updateMatches();
    },

    /**
     * Renders the text layer.
     * @param {number} timeout (optional) if specified, the rendering waits
     *   for specified amount of ms.
     */
    render: function TextLayerBuilder_render(timeout) {
      if (!this.divContentDone || this.renderingDone) {
        return;
      }

      if (this.renderTimer) {
        clearTimeout(this.renderTimer);
        this.renderTimer = null;
      }

      if (!timeout) { // Render right away
        this.renderLayer();
      } else { // Schedule
        var self = this;
        this.renderTimer = setTimeout(function() {
          self.renderLayer();
          self.renderTimer = null;
        }, timeout);
      }
    },

    appendText: function TextLayerBuilder_appendText(geom, styles) {
      var style = styles[geom.fontName];
      var textDiv = document.createElement('div');
      this.textDivs.push(textDiv);
      if (isAllWhitespace(geom.str)) {
        textDiv.dataset.isWhitespace = true;
        return;
      }
      var tx = PDFJS.Util.transform(this.viewport.transform, geom.transform);
      var angle = Math.atan2(tx[1], tx[0]);
      if (style.vertical) {
        angle += Math.PI / 2;
      }
      var fontHeight = Math.sqrt((tx[2] * tx[2]) + (tx[3] * tx[3]));
      var fontAscent = fontHeight;
      if (style.ascent) {
        fontAscent = style.ascent * fontAscent;
      } else if (style.descent) {
        fontAscent = (1 + style.descent) * fontAscent;
      }

      var left;
      var top;
      if (angle === 0) {
        left = tx[4];
        top = tx[5] - fontAscent;
      } else {
        left = tx[4] + (fontAscent * Math.sin(angle));
        top = tx[5] - (fontAscent * Math.cos(angle));
      }
      textDiv.style.left = left + 'px';
      textDiv.style.top = top + 'px';
      textDiv.style.fontSize = fontHeight + 'px';
      textDiv.style.fontFamily = style.fontFamily;

      textDiv.textContent = geom.str;
      // |fontName| is only used by the Font Inspector. This test will succeed
      // when e.g. the Font Inspector is off but the Stepper is on, but it's
      // not worth the effort to do a more accurate test.
      if (PDFJS.pdfBug) {
        textDiv.dataset.fontName = geom.fontName;
      }
      // Storing into dataset will convert number into string.
      if (angle !== 0) {
        textDiv.dataset.angle = angle * (180 / Math.PI);
      }
      // We don't bother scaling single-char text divs, because it has very
      // little effect on text highlighting. This makes scrolling on docs with
      // lots of such divs a lot faster.
      if (textDiv.textContent.length > 1) {
        if (style.vertical) {
          textDiv.dataset.canvasWidth = geom.height * this.viewport.scale;
        } else {
          textDiv.dataset.canvasWidth = geom.width * this.viewport.scale;
        }
      }
    },

    setTextContent: function TextLayerBuilder_setTextContent(textContent) {
      this.textContent = textContent;

      var textItems = textContent.items;
      for (var i = 0, len = textItems.length; i < len; i++) {
        this.appendText(textItems[i], textContent.styles);
      }
      this.divContentDone = true;
    },

    convertMatches: function TextLayerBuilder_convertMatches(matches) {
      var i = 0;
      var iIndex = 0;
      var bidiTexts = this.textContent.items;
      var end = bidiTexts.length - 1;
      var queryLen = (this.findController === null ?
                      0 : this.findController.state.query.length);
      var ret = [];

      for (var m = 0, len = matches.length; m < len; m++) {
        // Calculate the start position.
        var matchIdx = matches[m];

        // Loop over the divIdxs.
        while (i !== end && matchIdx >= (iIndex + bidiTexts[i].str.length)) {
          iIndex += bidiTexts[i].str.length;
          i++;
        }

        if (i === bidiTexts.length) {
          console.error('Could not find a matching mapping');
        }

        var match = {
          begin: {
            divIdx: i,
            offset: matchIdx - iIndex
          }
        };

        // Calculate the end position.
        matchIdx += queryLen;

        // Somewhat the same array as above, but use > instead of >= to get
        // the end position right.
        while (i !== end && matchIdx > (iIndex + bidiTexts[i].str.length)) {
          iIndex += bidiTexts[i].str.length;
          i++;
        }

        match.end = {
          divIdx: i,
          offset: matchIdx - iIndex
        };
        ret.push(match);
      }

      return ret;
    },

    renderMatches: function TextLayerBuilder_renderMatches(matches) {
      // Early exit if there is nothing to render.
      if (matches.length === 0) {
        return;
      }

      var bidiTexts = this.textContent.items;
      var textDivs = this.textDivs;
      var prevEnd = null;
      var pageIdx = this.pageIdx;
      var isSelectedPage = (this.findController === null ?
        false : (pageIdx === this.findController.selected.pageIdx));
      var selectedMatchIdx = (this.findController === null ?
                              -1 : this.findController.selected.matchIdx);
      var highlightAll = (this.findController === null ?
                          false : this.findController.state.highlightAll);
      var infinity = {
        divIdx: -1,
        offset: undefined
      };

      function beginText(begin, className) {
        var divIdx = begin.divIdx;
        textDivs[divIdx].textContent = '';
        appendTextToDiv(divIdx, 0, begin.offset, className);
      }

      function appendTextToDiv(divIdx, fromOffset, toOffset, className) {
        var div = textDivs[divIdx];
        var content = bidiTexts[divIdx].str.substring(fromOffset, toOffset);
        var node = document.createTextNode(content);
        if (className) {
          var span = document.createElement('span');
          span.className = className;
          span.appendChild(node);
          div.appendChild(span);
          return;
        }
        div.appendChild(node);
      }

      var i0 = selectedMatchIdx, i1 = i0 + 1;
      if (highlightAll) {
        i0 = 0;
        i1 = matches.length;
      } else if (!isSelectedPage) {
        // Not highlighting all and this isn't the selected page, so do nothing.
        return;
      }

      for (var i = i0; i < i1; i++) {
        var match = matches[i];
        var begin = match.begin;
        var end = match.end;
        var isSelected = (isSelectedPage && i === selectedMatchIdx);
        var highlightSuffix = (isSelected ? ' selected' : '');

        if (this.findController) {
          this.findController.updateMatchPosition(pageIdx, i, textDivs,
                                                  begin.divIdx, end.divIdx);
        }

        // Match inside new div.
        if (!prevEnd || begin.divIdx !== prevEnd.divIdx) {
          // If there was a previous div, then add the text at the end.
          if (prevEnd !== null) {
            appendTextToDiv(prevEnd.divIdx, prevEnd.offset, infinity.offset);
          }
          // Clear the divs and set the content until the starting point.
          beginText(begin);
        } else {
          appendTextToDiv(prevEnd.divIdx, prevEnd.offset, begin.offset);
        }

        if (begin.divIdx === end.divIdx) {
          appendTextToDiv(begin.divIdx, begin.offset, end.offset,
                          'highlight' + highlightSuffix);
        } else {
          appendTextToDiv(begin.divIdx, begin.offset, infinity.offset,
                          'highlight begin' + highlightSuffix);
          for (var n0 = begin.divIdx + 1, n1 = end.divIdx; n0 < n1; n0++) {
            textDivs[n0].className = 'highlight middle' + highlightSuffix;
          }
          beginText(end, 'highlight end' + highlightSuffix);
        }
        prevEnd = end;
      }

      if (prevEnd) {
        appendTextToDiv(prevEnd.divIdx, prevEnd.offset, infinity.offset);
      }
    },

    updateMatches: function TextLayerBuilder_updateMatches() {
      // Only show matches when all rendering is done.
      if (!this.renderingDone) {
        return;
      }

      // Clear all matches.
      var matches = this.matches;
      var textDivs = this.textDivs;
      var bidiTexts = this.textContent.items;
      var clearedUntilDivIdx = -1;

      // Clear all current matches.
      for (var i = 0, len = matches.length; i < len; i++) {
        var match = matches[i];
        var begin = Math.max(clearedUntilDivIdx, match.begin.divIdx);
        for (var n = begin, end = match.end.divIdx; n <= end; n++) {
          var div = textDivs[n];
          div.textContent = bidiTexts[n].str;
          div.className = '';
        }
        clearedUntilDivIdx = match.end.divIdx + 1;
      }

      if (this.findController === null || !this.findController.active) {
        return;
      }

      // Convert the matches on the page controller into the match format
      // used for the textLayer.
      this.matches = this.convertMatches(this.findController === null ?
        [] : (this.findController.pageMatches[this.pageIdx] || []));
      this.renderMatches(this.matches);
    }
  };

  /**
   * @constructor
   * @implements IPDFTextLayerFactory
   */
  function DefaultTextLayerFactory() {}
  DefaultTextLayerFactory.prototype = {
    /**
     * @param {HTMLDivElement} textLayerDiv
     * @param {number} pageIndex
     * @param {PageViewport} viewport
     * @returns {TextLayerBuilder}
     */
    createTextLayerBuilder: function (textLayerDiv, pageIndex, viewport) {
      return new TextLayerBuilder({
        textLayerDiv: textLayerDiv,
        pageIndex: pageIndex,
        viewport: viewport
      });
    }
  };

  TextLayerBuilder.DefaultTextLayerFactory = DefaultTextLayerFactory;

  return viewerjs.TextLayerBuilder = TextLayerBuilder
});
define('skylark-viewerjs/PDFViewerPlugin',[
    "skylark-pdfjs-display",
    "./viewerjs",
    "./ui_utils",
    "./text_layer_builder"
],function(PDFJS,viewerjs,uiutils,TextLayerBuilder) {
    function PDFViewerPlugin() {
        "use strict";

        function loadScript(path, callback) {
            var script = document.createElement('script');
            script.async = false;
            script.src = path;
            script.type = 'text/javascript';
            script.onload = callback || script.onload;
            document.getElementsByTagName('head')[0].appendChild(script);
        }

        function init(callback) {
            var pluginCSS;

            /*
            loadScript('./compatibility.js', function () {
                loadScript('./pdf.js');
                loadScript('./ui_utils.js');
                loadScript('./text_layer_builder.js');
                loadScript('./pdfjsversion.js', callback);
            });
            */
            callback();

        }

        var self = this,
            pages = [],
            domPages = [],
            pageText = [],
            renderingStates = [],
            RENDERING = {
                BLANK: 0,
                RUNNING: 1,
                FINISHED: 2,
                RUNNINGOUTDATED: 3
            },
            TEXT_LAYER_RENDER_DELAY = 200, // ms
            container = null,
            pdfDocument = null,
            pageViewScroll = null,
            isGuessedSlideshow = true, // assume true as default, any non-matching page will unset this
            isPresentationMode = false,
            scale = 1,
            currentPage = 1,
            maxPageWidth = 0,
            maxPageHeight = 0,
            createdPageCount = 0;

        function scrollIntoView(elem) {
            elem.parentNode.scrollTop = elem.offsetTop;
        }

        function isScrolledIntoView(elem) {
            if (elem.style.display === "none") {
                return false;
            }

            var docViewTop = container.scrollTop,
                docViewBottom = docViewTop + container.clientHeight,
                elemTop = elem.offsetTop,
                elemBottom = elemTop + elem.clientHeight;

            // Is in view if either the top or the bottom of the page is between the
            // document viewport bounds,
            // or if the top is above the viewport and the bottom is below it.
            return (elemTop >= docViewTop && elemTop < docViewBottom)
                    || (elemBottom >= docViewTop && elemBottom < docViewBottom)
                    || (elemTop < docViewTop && elemBottom >= docViewBottom);
        }

        function getDomPage(page) {
            return domPages[page.pageNumber-1]; //modified by lwf for new pdf version
        }
        function getPageText(page) {
            return pageText[page.pageNumber-1];//modified by lwf for new pdf version
        }
        function getRenderingStatus(page) {
            return renderingStates[page.pageNumber-1];//modified by lwf for new pdf version
        }
        function setRenderingStatus(page, renderStatus) {
            renderingStates[page.pageNumber-1] = renderStatus;//modified by lwf for new pdf version
        }

        function updatePageDimensions(page, width, height) {
            var domPage = getDomPage(page),
                canvas = domPage.getElementsByTagName('canvas')[0],
                textLayer = domPage.getElementsByTagName('div')[0],
                cssScale = 'scale(' + scale + ', ' + scale + ')';

            domPage.style.width = width + "px";
            domPage.style.height = height + "px";

            canvas.width = width;
            canvas.height = height;
            canvas.style.width = width + "px";
            canvas.style.height = height + "px";


            textLayer.style.width = width + "px";
            textLayer.style.height = height + "px";

            uiutils.CustomStyle.setProp('transform', textLayer, cssScale);
            uiutils.CustomStyle.setProp('transformOrigin', textLayer, '0% 0%');

            if (getRenderingStatus(page) === RENDERING.RUNNING) {
                // TODO: should be able to cancel that rendering
                setRenderingStatus(page, RENDERING.RUNNINGOUTDATED);
            } else {
                // Once the page dimension is updated, the rendering state is blank.
                setRenderingStatus(page, RENDERING.BLANK);
            }
        }

        function ensurePageRendered(page) {
            var domPage, textLayer, canvas;

            if (getRenderingStatus(page) === RENDERING.BLANK) {
                setRenderingStatus(page, RENDERING.RUNNING);

                domPage = getDomPage(page);
                textLayer = getPageText(page);
                canvas = domPage.getElementsByTagName('canvas')[0];

                page.render({
                    canvasContext: canvas.getContext('2d'),
                    textLayer: textLayer,
                    viewport: page.getViewport({scale}) //modified by lwf for new pdf version
                }).promise.then(function () {
                    /*
                    if (getRenderingStatus(page) === RENDERING.RUNNINGOUTDATED) {
                        // restart
                        setRenderingStatus(page, RENDERING.BLANK);
                        ensurePageRendered(page);
                    } else {
                        setRenderingStatus(page, RENDERING.FINISHED);
                    }
                    */
                });
            }
        }

        function completeLoading() {
            var allPagesVisible = !self.isSlideshow();
            domPages.forEach(function (domPage) {
                if (allPagesVisible) {
                    domPage.style.display = "block";
                }
                container.appendChild(domPage);
            });

            self.onLoad();
            self.showPage(1);
        }

        function createPage(page) {
            var pageNumber,
                textLayerDiv,
                textLayer,
                canvas,
                domPage,
                viewport;

            pageNumber = page.pageNumber; // page.pageIndex + 1; modified by lwf for new pdf version

            viewport = page.getViewport({scale});//viewport = page.getViewport(scale);modified by lwf for new pdf version

            domPage = document.createElement('div');
            domPage.id = 'pageContainer' + pageNumber;
            domPage.className = 'page';
            domPage.style.display = "none";

            canvas = document.createElement('canvas');
            canvas.id = 'canvas' + pageNumber;

            textLayerDiv = document.createElement('div');
            textLayerDiv.className = 'textLayer';
            textLayerDiv.id = 'textLayer' + pageNumber;

            domPage.appendChild(canvas);
            domPage.appendChild(textLayerDiv);

            pages[page.pageNumber-1] = page; //modified by lwf for new pdf version
            domPages[page.pageNumber-1] = domPage; //modified by lwf for new pdf version
            renderingStates[page.pageNumber-1] = RENDERING.BLANK;

            updatePageDimensions(page, viewport.width, viewport.height);
            if (maxPageWidth < viewport.width) {
                maxPageWidth = viewport.width;
            }
            if (maxPageHeight < viewport.height) {
                maxPageHeight = viewport.height;
            }
            // A very simple but generally true guess - if any page has the height greater than the width, treat it no longer as a slideshow
            if (viewport.width < viewport.height) {
                isGuessedSlideshow = false;
            }

            textLayer = new TextLayerBuilder({
                textLayerDiv: textLayerDiv,
                viewport: viewport,
                pageIndex: pageNumber - 1
            });
            page.getTextContent().then(function (textContent) {
                textLayer.setTextContent(textContent);
                textLayer.render(TEXT_LAYER_RENDER_DELAY);
            });
            pageText[page.pageNumber-1] = textLayer; //modified by lwf for new pdf version

            createdPageCount += 1;
            if (createdPageCount === (pdfDocument.numPages)) {
                completeLoading();
            }
        }

        this.initialize = function (viewContainer, location) {
            var self = this,
                i,
                pluginCSS;


            init(function () {
                PDFJS.GlobalWorkerOptions.workerSrc = "./skylark-pdfjs-worker-all.js"; //PDFJS.workerSrc = "./skylark-pdfjs-worker-all.js"; modified by lwf for new pdf version
                //PDFJS.getDocument(location).then(function loadPDF(doc) {
                PDFJS.getDocument(location).promise.then(function loadPDF(doc) {
                    pdfDocument = doc;
                    container = viewContainer;

                    for (i = 0; i < pdfDocument.numPages; i += 1) {
                        pdfDocument.getPage(i + 1).then(createPage);
                    }
                });
            });
        };

        this.isSlideshow = function () {
            return isGuessedSlideshow;
        };

        this.onLoad = function () {};

        this.getPages = function () {
            return domPages;
        };

        this.fitToWidth = function (width) {
            var zoomLevel;

            if (maxPageWidth === width) {
                return;
            }
            zoomLevel = width / maxPageWidth;
            self.setZoomLevel(zoomLevel);
        };

        this.fitToHeight = function (height) {
            var zoomLevel;

            if (maxPageHeight === height) {
                return;
            }
            zoomLevel = height / maxPageHeight;
            self.setZoomLevel(zoomLevel);
        };

        this.fitToPage = function (width, height) {
            var zoomLevel = width / maxPageWidth;
            if (height / maxPageHeight < zoomLevel) {
                zoomLevel = height / maxPageHeight;
            }
            self.setZoomLevel(zoomLevel);
        };

        this.fitSmart = function (width, height) {
            var zoomLevel = width / maxPageWidth;
            if (height && (height / maxPageHeight) < zoomLevel) {
                zoomLevel = height / maxPageHeight;
            }
            zoomLevel = Math.min(1.0, zoomLevel);
            self.setZoomLevel(zoomLevel);
        };

        this.setZoomLevel = function (zoomLevel) {
            var i, viewport;

            if (scale !== zoomLevel) {
                scale = zoomLevel;

                for (i = 0; i < pages.length; i += 1) {
                    viewport = pages[i].getViewport({scale}); //modified by lwf for new pdf version
                    updatePageDimensions(pages[i], viewport.width, viewport.height);
                }
            }
        };

        this.getZoomLevel = function () {
            return scale;
        };

        this.onScroll = function () {
            var i;

            for (i = 0; i < domPages.length; i += 1) {
                if (isScrolledIntoView(domPages[i])) {
                    ensurePageRendered(pages[i]);
                }
            }
        };

        this.getPageInView = function () {
            var i;

            if (self.isSlideshow()) {
                return currentPage;
            } else {
                for (i = 0; i < domPages.length; i += 1) {
                    if (isScrolledIntoView(domPages[i])) {
                        return i + 1;
                    }
                }
            }
        };

        this.showPage = function (n) {
            if (self.isSlideshow()) {
                domPages[currentPage - 1].style.display = "none";
                currentPage = n;
                ensurePageRendered(pages[n - 1]);
                domPages[n - 1].style.display = "block";
            } else {
                scrollIntoView(domPages[n - 1]);
            }
        };

        this.getPluginName = function () {
            return "PDF.js"
        };

        this.getPluginVersion = function () {
            var version = (String(typeof pdfjs_version) !== "undefined"
                ? pdfjs_version
                : "From Source"
            );
            return version;
        };

        this.getPluginURL = function () {
            return "https://github.com/mozilla/pdf.js/";
        };
    }

    return viewerjs.PDFViewerPlugin = PDFViewerPlugin;
});
define('skylark-viewerjs/plugin_registry',[
    "./viewerjs",
    "./ODFViewerPlugin",
    "./PDFViewerPlugin"
],function(viewerjs,ODFViewerPlugin,PDFViewerPlugin) {
    var css,
        pluginRegistry = [
        (function() {
            var odfMimetypes = [
                'application/vnd.oasis.opendocument.text',
                'application/vnd.oasis.opendocument.text-flat-xml',
                'application/vnd.oasis.opendocument.text-template',
                'application/vnd.oasis.opendocument.presentation',
                'application/vnd.oasis.opendocument.presentation-flat-xml',
                'application/vnd.oasis.opendocument.presentation-template',
                'application/vnd.oasis.opendocument.spreadsheet',
                'application/vnd.oasis.opendocument.spreadsheet-flat-xml',
                'application/vnd.oasis.opendocument.spreadsheet-template'];
            var odfFileExtensions = [
                'odt',
                'fodt',
                'ott',
                'odp',
                'fodp',
                'otp',
                'ods',
                'fods',
                'ots'];

            return {
                supportsMimetype: function(mimetype) {
                    return (odfMimetypes.indexOf(mimetype) !== -1);
                },
                supportsFileExtension: function(extension) {
                    return (odfFileExtensions.indexOf(extension) !== -1);
                },
                path: "./ODFViewerPlugin",
                getClass: function() { return ODFViewerPlugin; }
            };
        }()),
        {
            supportsMimetype: function(mimetype) {
                return (mimetype === 'application/pdf');
            },
            supportsFileExtension: function(extension) {
                return (extension === 'pdf');
            },
            path: "./PDFViewerPlugin",
            getClass: function() { return PDFViewerPlugin; }
        }
    ];



    return viewerjs.pluginRegistry = pluginRegistry

});

define('skylark-viewerjs/init',[
    "./viewerjs",
	"./viewer",
	"./plugin_registry"

],function(viewerjs,Viewer,pluginRegistry){
	var viewer;

    function parseSearchParameters(location) {
        var parameters = {},
            search = location.search || "?";

        search.substr(1).split('&').forEach(function (q) {
            // skip empty strings
            if (!q) {
                return;
            }
            // if there is no '=', have it handled as if given key was set to undefined
            var s = q.split('=', 2);
            parameters[decodeURIComponent(s[0])] = decodeURIComponent(s[1]);
        });

        return parameters;
    }

    function estimateTypeByHeaderContentType(documentUrl, cb) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            var mimetype, matchingPluginData;
            if (xhr.readyState === 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
                    mimetype = xhr.getResponseHeader('content-type');

                    if (mimetype) {
                        pluginRegistry.some(function(pluginData) {
                            if (pluginData.supportsMimetype(mimetype)) {
                                matchingPluginData = pluginData;
                                console.log('Found plugin by mimetype and xhr head: ' + mimetype);
                                return true;
                            }
                            return false;
                        });
                    }
                }
                cb(matchingPluginData);
            }
        };
        xhr.open("HEAD", documentUrl, true);
        xhr.send();
    }


    function doEstimateTypeByFileExtension(extension) {
        var matchingPluginData;

        pluginRegistry.some(function(pluginData) {
            if (pluginData.supportsFileExtension(extension)) {
                matchingPluginData = pluginData;
                return true;
            }
            return false;
        });

        return matchingPluginData;
    }


    function estimateTypeByFileExtension(extension) {
        var matchingPluginData = doEstimateTypeByFileExtension(extension)

        if (matchingPluginData) {
            console.log('Found plugin by parameter type: ' + extension);
        }

        return matchingPluginData;
    }


    function estimateTypeByFileExtensionFromPath(documentUrl) {
        // See to get any path from the url and grep what could be a file extension
        var documentPath = documentUrl.split('?')[0],
            extension = documentPath.split('.').pop(),
            matchingPluginData = doEstimateTypeByFileExtension(extension)

        if (matchingPluginData) {
            console.log('Found plugin by file extension from path: ' + extension);
        }

        return matchingPluginData;
    }

	function init() {
	   window.onload = function () {
	        var viewer,
	            documentUrl = document.location.hash.substring(1),
	            parameters = parseSearchParameters(document.location),
	            Plugin;

	        if (documentUrl) {
	            // try to guess the title as filename from the location, if not set by parameter
	            if (!parameters.title) {
	                parameters.title = documentUrl.replace(/^.*[\\\/]/, '');
	            }

	            parameters.documentUrl = documentUrl;

	            // trust the server most
	            estimateTypeByHeaderContentType(documentUrl, function(pluginData) {
	                if (!pluginData) {
	                    if (parameters.type) {
	                        pluginData = estimateTypeByFileExtension(parameters.type);
	                    } else {
	                        // last ressort: try to guess from path
	                        pluginData = estimateTypeByFileExtensionFromPath(documentUrl);
	                    }
	                }

	                if (pluginData) {
	                    if (String(typeof loadPlugin) !== "undefined") {
	                        loadPlugin(pluginData.path, function () {
	                            Plugin = pluginData.getClass();
	                            viewer = new Viewer(new Plugin(), parameters);
	                        });
	                    } else {
	                        Plugin = pluginData.getClass();
	                        viewer = new Viewer(new Plugin(), parameters);
	                    }
	                } else {
	                    viewer = new Viewer();
	                }
	            });
	        } else {
	            viewer = new Viewer();
	        }
	    };
	}
 
 	return viewerjs.init = init;
});



define('skylark-viewerjs/main',[
	"./viewerjs",
	"./viewer",
	"./ODFViewerPlugin",
	"./PDFViewerPlugin",
	"./plugin_registry",
	"./text_layer_builder",
	"./ui_utils",
	"./init"
],function(viewerjs) {
	return viewerjs;
});
define('skylark-viewerjs', ['skylark-viewerjs/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-viewerjs.js.map
