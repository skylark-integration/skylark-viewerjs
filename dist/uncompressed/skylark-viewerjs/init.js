define([
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


