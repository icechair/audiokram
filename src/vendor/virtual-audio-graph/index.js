var capitalize = function (a) {
    return a.charAt(0).toUpperCase() + a.substring(1);
};
var entries = function (o) {
    var xs = [];
    for (var _i = 0, _a = Object.keys(o); _i < _a.length; _i++) {
        var key = _a[_i];
        xs.push([key, o[key]]);
    }
    return xs;
};
var equals = function (a, b) {
    if (a === b)
        return true;
    var typeA = typeof a;
    if (typeA !== typeof b || typeA !== "object")
        return false;
    if (Array.isArray(a)) {
        if (a.length !== b.length)
            return false;
        for (var i = 0; i < a.length; i++)
            if (!equals(a[i], b[i]))
                return false;
        return true;
    }
    var keysA = Object.keys(a);
    var keysB = Object.keys(b);
    if (keysA.length !== keysB.length)
        return false;
    for (var i = 0; i < keysA.length; i++) {
        var key = keysA[i];
        if (!equals(a[key], b[key]))
            return false;
    }
    return true;
};
var find = function (f, xs) {
    for (var i = 0; i < xs.length; i++)
        if (f(xs[i]))
            return xs[i];
};
var mapObj = function (f, o) {
    var p = {};
    for (var key in o) {
        if (Object.prototype.hasOwnProperty.call(o, key))
            p[key] = f(o[key]);
    }
    return p;
};
var values = function (obj) {
    var keys = Object.keys(obj);
    var ret = [];
    for (var i = 0; i < keys.length; i++)
        ret[i] = obj[keys[i]];
    return ret;
};

var CustomVirtualAudioNode = /** @class */ (function () {
    function CustomVirtualAudioNode(node, output, params) {
        this.node = node;
        this.output = output;
        this.audioNode = undefined;
        this.connected = false;
        this.params = params || {};
    }
    CustomVirtualAudioNode.prototype.connect = function () {
        var connectArgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            connectArgs[_i] = arguments[_i];
        }
        for (var _a = 0, _b = values(this.virtualNodes); _a < _b.length; _a++) {
            var childVirtualNode = _b[_a];
            var output = childVirtualNode.output;
            if (output === "output" ||
                (Array.isArray(output) && output.indexOf("output") !== -1)) {
                childVirtualNode.connect.apply(childVirtualNode, connectArgs.filter(Boolean));
            }
        }
        this.connected = true;
    };
    CustomVirtualAudioNode.prototype.disconnect = function (node) {
        for (var _i = 0, _a = values(this.virtualNodes); _i < _a.length; _i++) {
            var virtualNode = _a[_i];
            var output = virtualNode.output;
            if (output === "output" ||
                (Array.isArray(output) && output.indexOf("output") !== -1)) {
                virtualNode.disconnect();
            }
        }
        this.connected = false;
    };
    CustomVirtualAudioNode.prototype.disconnectAndDestroy = function () {
        for (var _i = 0, _a = values(this.virtualNodes); _i < _a.length; _i++) {
            var virtualNode = _a[_i];
            virtualNode.disconnectAndDestroy();
        }
        this.connected = false;
    };
    CustomVirtualAudioNode.prototype.initialize = function (audioContext) {
        this.virtualNodes = mapObj(function (virtualAudioNodeParam) {
            return virtualAudioNodeParam.initialize(audioContext);
        }, this.node(this.params));
        connectAudioNodes(this.virtualNodes, function () { });
        return this;
    };
    CustomVirtualAudioNode.prototype.update = function (params) {
        if (params === void 0) { params = {}; }
        var audioGraphParamsFactoryValues = values(this.node(params));
        var keys = Object.keys(this.virtualNodes);
        for (var i = 0; i < keys.length; i++) {
            var p = audioGraphParamsFactoryValues[i];
            this.virtualNodes[keys[i]].update(p.params);
        }
        this.params = params;
        return this;
    };
    return CustomVirtualAudioNode;
}());

var __spreadArrays = (undefined && undefined.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var AudioWorkletVirtualAudioNode = /** @class */ (function () {
    function AudioWorkletVirtualAudioNode(node, output, params, input) {
        this.node = node;
        this.output = output;
        this.params = params;
        this.input = input;
        this.connected = false;
        this.connections = [];
    }
    AudioWorkletVirtualAudioNode.prototype.connect = function () {
        var connectArgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            connectArgs[_i] = arguments[_i];
        }
        var audioNode = this.audioNode;
        var filteredConnectArgs = connectArgs.filter(Boolean);
        var firstArg = filteredConnectArgs[0], rest = filteredConnectArgs.slice(1);
        if (audioNode.connect) {
            audioNode.connect.apply(audioNode, __spreadArrays([firstArg], rest));
        }
        this.connections = this.connections.concat(filteredConnectArgs);
        this.connected = true;
    };
    AudioWorkletVirtualAudioNode.prototype.disconnect = function (node) {
        var audioNode = this.audioNode;
        if (node) {
            if (node instanceof CustomVirtualAudioNode) {
                var _loop_1 = function (childNode) {
                    if (!this_1.connections.some(function (x) { return x === childNode.audioNode; }))
                        return "continue";
                    this_1.connections = this_1.connections.filter(function (x) { return x !== childNode.audioNode; });
                };
                var this_1 = this;
                for (var _i = 0, _a = values(node.virtualNodes); _i < _a.length; _i++) {
                    var childNode = _a[_i];
                    _loop_1(childNode);
                }
            }
            else {
                if (!this.connections.some(function (x) { return x === node.audioNode; }))
                    return;
                this.connections = this.connections.filter(function (x) { return x !== node.audioNode; });
            }
        }
        if (audioNode.disconnect)
            audioNode.disconnect();
        this.connected = false;
    };
    AudioWorkletVirtualAudioNode.prototype.disconnectAndDestroy = function () {
        var audioNode = this.audioNode;
        if (audioNode.disconnect)
            audioNode.disconnect();
        this.connected = false;
    };
    AudioWorkletVirtualAudioNode.prototype.initialize = function (audioContext) {
        var params = this.params || {};
        this.audioNode = new window.AudioWorkletNode(audioContext, this.node);
        this.params = undefined;
        return this.update(params);
    };
    AudioWorkletVirtualAudioNode.prototype.update = function (params) {
        if (params === void 0) { params = {}; }
        var audioNode = this.audioNode;
        var _loop_2 = function (key) {
            var param = params[key];
            if (this_2.params && this_2.params[key] === param)
                return "continue";
            var paramInstance = audioNode.parameters.get(key);
            if (Array.isArray(param)) {
                if (this_2.params && !equals(param, this_2.params[key])) {
                    audioNode.parameters.get(key).cancelScheduledValues(0);
                }
                var callMethod = function (_a) {
                    var methodName = _a[0], args = _a.slice(1);
                    return paramInstance[methodName].apply(paramInstance, args);
                };
                Array.isArray(param[0])
                    ? param.forEach(callMethod)
                    : callMethod(param);
                return "continue";
            }
            paramInstance.value = param;
        };
        var this_2 = this;
        for (var _i = 0, _a = Object.keys(params); _i < _a.length; _i++) {
            var key = _a[_i];
            _loop_2(key);
        }
        this.params = params;
        return this;
    };
    return AudioWorkletVirtualAudioNode;
}());

var audioParamProperties = [
    "attack",
    "delayTime",
    "detune",
    "frequency",
    "gain",
    "knee",
    "pan",
    "playbackRate",
    "ratio",
    "release",
    "threshold",
    "Q",
];
var constructorParamsKeys = [
    "maxDelayTime",
    "mediaElement",
    "mediaStream",
    "numberOfOutputs",
];
var setters = ["position", "orientation"];
var startAndStopNodes = ["oscillator", "bufferSource"];

var __spreadArrays$1 = (undefined && undefined.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var createAudioNode = function (audioContext, name, audioNodeFactoryParam) {
    var audioNodeFactoryName = "create" + capitalize(name);
    if (typeof audioContext[audioNodeFactoryName] !== "function") {
        throw new Error("Unknown node type: " + name);
    }
    var audioNode = audioNodeFactoryParam
        ? audioContext[audioNodeFactoryName](audioNodeFactoryParam)
        : audioContext[audioNodeFactoryName]();
    return audioNode;
};
var StandardVirtualAudioNode = /** @class */ (function () {
    function StandardVirtualAudioNode(node, output, params, input) {
        this.node = node;
        this.output = output;
        this.params = params;
        this.input = input;
        this.connected = false;
        this.connections = [];
        var stopTime = params && params.stopTime;
        this.stopCalled = stopTime !== undefined;
    }
    StandardVirtualAudioNode.prototype.connect = function () {
        var connectArgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            connectArgs[_i] = arguments[_i];
        }
        var audioNode = this.audioNode;
        var filteredConnectArgs = connectArgs.filter(Boolean);
        var firstArg = filteredConnectArgs[0], rest = filteredConnectArgs.slice(1);
        if (audioNode.connect) {
            audioNode.connect.apply(audioNode, __spreadArrays$1([firstArg], rest));
        }
        this.connections = this.connections.concat(filteredConnectArgs);
        this.connected = true;
    };
    StandardVirtualAudioNode.prototype.disconnect = function (node) {
        var audioNode = this.audioNode;
        if (node) {
            if (node instanceof CustomVirtualAudioNode) {
                var _loop_1 = function (childNode) {
                    if (!this_1.connections.some(function (x) { return x === childNode.audioNode; }))
                        return "continue";
                    this_1.connections = this_1.connections.filter(function (x) { return x !== childNode.audioNode; });
                };
                var this_1 = this;
                for (var _i = 0, _a = values(node.virtualNodes); _i < _a.length; _i++) {
                    var childNode = _a[_i];
                    _loop_1(childNode);
                }
            }
            else {
                if (!this.connections.some(function (x) { return x === node.audioNode; }))
                    return;
                this.connections = this.connections.filter(function (x) { return x !== node.audioNode; });
            }
        }
        if (audioNode.disconnect)
            audioNode.disconnect();
        this.connected = false;
    };
    StandardVirtualAudioNode.prototype.disconnectAndDestroy = function () {
        var _a = this, audioNode = _a.audioNode, stopCalled = _a.stopCalled;
        if (audioNode.stop && !stopCalled) {
            audioNode.stop();
        }
        if (audioNode.disconnect)
            audioNode.disconnect();
        this.connected = false;
    };
    StandardVirtualAudioNode.prototype.initialize = function (audioContext) {
        var params = this.params || {};
        var constructorParam = params[find(function (key) { return constructorParamsKeys.indexOf(key) !== -1; }, Object.keys(params))];
        var offsetTime = params.offsetTime, startTime = params.startTime, stopTime = params.stopTime;
        // TODO remove `any` when AudioScheduledSourceNode typings are correct
        var audioNode = createAudioNode(audioContext, this.node, constructorParam);
        this.audioNode = audioNode;
        this.params = undefined;
        this.update(params);
        if (startAndStopNodes.indexOf(this.node) !== -1) {
            audioNode.start(startTime == null ? audioContext.currentTime : startTime, offsetTime || 0);
            if (stopTime != null)
                audioNode.stop(stopTime);
        }
        return this;
    };
    StandardVirtualAudioNode.prototype.update = function (params) {
        if (params === void 0) { params = {}; }
        var audioNode = this.audioNode;
        var _loop_2 = function (key) {
            if (constructorParamsKeys.indexOf(key) !== -1)
                return "continue";
            var param = params[key];
            if (this_2.params && equals(this_2.params[key], param))
                return "continue";
            if (audioParamProperties.indexOf(key) !== -1) {
                if (Array.isArray(param)) {
                    if (this_2.params)
                        audioNode[key].cancelScheduledValues(0);
                    var callMethod = function (_a) {
                        var _b;
                        var methodName = _a[0], args = _a.slice(1);
                        return (_b = audioNode[key])[methodName].apply(_b, args);
                    };
                    Array.isArray(param[0])
                        ? param.forEach(callMethod)
                        : callMethod(param);
                    return "continue";
                }
                audioNode[key].value = param;
                return "continue";
            }
            if (setters.indexOf(key) !== -1) {
                audioNode["set" + capitalize(key)].apply(audioNode, param);
                return "continue";
            }
            audioNode[key] = param;
        };
        var this_2 = this;
        for (var _i = 0, _a = Object.keys(params); _i < _a.length; _i++) {
            var key = _a[_i];
            _loop_2(key);
        }
        this.params = params;
        return this;
    };
    return StandardVirtualAudioNode;
}());

var connectAudioNodes = (function (virtualGraph, handleConnectionToOutput) {
    for (var _i = 0, _a = entries(virtualGraph); _i < _a.length; _i++) {
        var _b = _a[_i], id = _b[0], virtualNode = _b[1];
        if (virtualNode.connected || virtualNode.output == null)
            continue;
        for (var _c = 0, _d = [].concat(virtualNode.output); _c < _d.length; _c++) {
            var output = _d[_c];
            if (output === "output") {
                handleConnectionToOutput(virtualNode);
                continue;
            }
            if (Object.prototype.toString.call(output) === "[object Object]") {
                var key = output.key, destination = output.destination, inputs = output.inputs, outputs = output.outputs;
                if (key == null) {
                    throw new Error("id: " + id + " - output object requires a key property");
                }
                if (inputs) {
                    if (inputs.length !== outputs.length) {
                        throw new Error("id: " + id + " - outputs and inputs arrays are not the same length");
                    }
                    for (var i = 0; i++; i < inputs.length) {
                        virtualNode.connect(virtualGraph[key].audioNode, outputs[i], inputs[i]);
                    }
                    continue;
                }
                virtualNode.connect(virtualGraph[key].audioNode[destination]);
                continue;
            }
            var destinationVirtualAudioNode = virtualGraph[output];
            if (destinationVirtualAudioNode instanceof CustomVirtualAudioNode) {
                for (var _e = 0, _f = values(destinationVirtualAudioNode.virtualNodes); _e < _f.length; _e++) {
                    var node = _f[_e];
                    if ((node instanceof StandardVirtualAudioNode ||
                        node instanceof AudioWorkletVirtualAudioNode) &&
                        node.input === "input") {
                        virtualNode.connect(node.audioNode);
                    }
                }
                continue;
            }
            virtualNode.connect(destinationVirtualAudioNode.audioNode);
        }
    }
});

var VirtualAudioGraph = /** @class */ (function () {
    function VirtualAudioGraph(audioContext, output) {
        this.audioContext = audioContext;
        this.output = output;
        this.virtualNodes = {};
    }
    VirtualAudioGraph.prototype.getAudioNodeById = function (id) {
        var vNode = this.virtualNodes[id];
        return vNode && vNode.audioNode;
    };
    VirtualAudioGraph.prototype.update = function (newGraph) {
        var _this = this;
        if (newGraph.hasOwnProperty("output")) {
            throw new Error('"output" is not a valid id');
        }
        for (var _i = 0, _a = entries(this.virtualNodes); _i < _a.length; _i++) {
            var _b = _a[_i], id = _b[0], virtualAudioNode = _b[1];
            if (newGraph.hasOwnProperty(id))
                continue;
            virtualAudioNode.disconnectAndDestroy();
            this.disconnectParents(virtualAudioNode);
            delete this.virtualNodes[id];
        }
        for (var _c = 0, _d = Object.keys(newGraph); _c < _d.length; _c++) {
            var key = _d[_c];
            var newVirtualAudioNode = newGraph[key];
            var virtualAudioNode = this.virtualNodes[key];
            if (virtualAudioNode == null) {
                this.virtualNodes[key] = newVirtualAudioNode.initialize(this.audioContext);
                continue;
            }
            if ((newVirtualAudioNode.params && newVirtualAudioNode.params.startTime) !==
                (virtualAudioNode.params && virtualAudioNode.params.startTime) ||
                (newVirtualAudioNode.params && newVirtualAudioNode.params.stopTime) !==
                    (virtualAudioNode.params && virtualAudioNode.params.stopTime) ||
                newVirtualAudioNode.node !== virtualAudioNode.node) {
                virtualAudioNode.disconnectAndDestroy();
                this.disconnectParents(virtualAudioNode);
                this.virtualNodes[key] = newVirtualAudioNode.initialize(this.audioContext);
                continue;
            }
            if (!equals(newVirtualAudioNode.output, virtualAudioNode.output)) {
                virtualAudioNode.disconnect();
                this.disconnectParents(virtualAudioNode);
                virtualAudioNode.output = newVirtualAudioNode.output;
            }
            virtualAudioNode.update(newVirtualAudioNode.params);
        }
        connectAudioNodes(this.virtualNodes, function (vNode) {
            return vNode.connect(_this.output);
        });
        return this;
    };
    Object.defineProperty(VirtualAudioGraph.prototype, "currentTime", {
        get: function () {
            return this.audioContext.currentTime;
        },
        enumerable: false,
        configurable: true
    });
    VirtualAudioGraph.prototype.disconnectParents = function (vNode) {
        for (var _i = 0, _a = values(this.virtualNodes); _i < _a.length; _i++) {
            var node = _a[_i];
            node.disconnect(vNode);
        }
    };
    return VirtualAudioGraph;
}());

var __spreadArrays$2 = (undefined && undefined.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var createNodeConstructor = function (nodeName) { return function (output) {
    var rest = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        rest[_i - 1] = arguments[_i];
    }
    if (nodeName === "mediaStreamDestination") {
        return new StandardVirtualAudioNode(nodeName);
    }
    if (output == null) {
        throw new Error("Output not specified for " + nodeName);
    }
    return new (StandardVirtualAudioNode.bind.apply(StandardVirtualAudioNode, __spreadArrays$2([void 0, nodeName, output], rest)))();
}; };
var analyser = createNodeConstructor("analyser");
var biquadFilter = createNodeConstructor("biquadFilter");
var bufferSource = createNodeConstructor("bufferSource");
var channelMerger = createNodeConstructor("channelMerger");
var channelSplitter = createNodeConstructor("channelSplitter");
var convolver = createNodeConstructor("convolver");
var delay = createNodeConstructor("delay");
var dynamicsCompressor = createNodeConstructor("dynamicsCompressor");
var gain = createNodeConstructor("gain");
var mediaElementSource = createNodeConstructor("mediaElementSource");
var mediaStreamDestination = createNodeConstructor("mediaStreamDestination");
var mediaStreamSource = createNodeConstructor("mediaStreamSource");
var oscillator = createNodeConstructor("oscillator");
var panner = createNodeConstructor("panner");
var stereoPanner = createNodeConstructor("stereoPanner");
var waveShaper = createNodeConstructor("waveShaper");

var createNode = (function (node) { return function (output, params) { return new CustomVirtualAudioNode(node, output, params); }; });

var createWorkletNode = (function (nodeName) { return function (output, params) { return new AudioWorkletVirtualAudioNode(nodeName, output, params); }; });

var index = (function (config) {
    var audioContext = (config && config.audioContext) || new AudioContext();
    var output = (config && config.output) || audioContext.destination;
    return new VirtualAudioGraph(audioContext, output);
});

export default index;
export { analyser, biquadFilter, bufferSource, channelMerger, channelSplitter, convolver, createNode, createWorkletNode, delay, dynamicsCompressor, gain, mediaElementSource, mediaStreamDestination, mediaStreamSource, oscillator, panner, stereoPanner, waveShaper };
