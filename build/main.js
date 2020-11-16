"use strict";
/*
 * Created with @iobroker/create-adapter v1.29.1
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = __importStar(require("@iobroker/adapter-core"));
const dmx_1 = __importDefault(require("dmx"));
class nanodmx extends utils.Adapter {
    constructor(options = {}) {
        super(Object.assign(Object.assign({ dirname: __dirname.indexOf('node_modules') !== -1 ? undefined : __dirname + '/../' }, options), { name: "nanodmx" }));
        this.existingObjects = {};
        this.currentStateValues = {};
        // private operatingModes: OperatingModes = {};
        this.stateChangeListeners = {};
        this.stateEventHandlers = {};
        this.cacheEvents = false;
        this.eventsCache = {};
        this.on("ready", this.onReady.bind(this));
        this.on("stateChange", this.onStateChange.bind(this));
        // this.on("objectChange", this.onObjectChange.bind(this));
        // this.on("message", this.onMessage.bind(this));
        this.on("unload", this.onUnload.bind(this));
    }
    /**
     * Is called when databases are connected and adapter received configuration.
     */
    onReady() {
        return __awaiter(this, void 0, void 0, function* () {
            // Reset the connection indicator during startup
            this.setState("info.connection", false, true);
            this.log.info(`Adapter state Ready`);
            // Initialize your adapter here
            this.mydmx = new dmx_1.default();
            // var universe = dmx.addUniverse('demo', 'enttec-open-usb-dmx', '/dev/cu.usbserial-6AVNHXS8')
            // const universe = dmx.addUniverse('demo', 'socketio', null, {port: 17809, debug: true});
            // const universe = dmx.addUniverse('myusb', 'dmx4all', '/dev/usb1', 'null');
            // const universe = dmx.addUniverse("myusb", "dmx4all", "/dev/ttyACM0", "null");
            const universe = this.mydmx.addUniverse("myusb", "dmx4all", "/dev/ttyACM0", "null");
            this.log.info(`Universe erzeugt`);
            let on = false;
            setInterval(() => {
                if (on) {
                    on = false;
                    universe.updateAll(0);
                    this.log.info('off');
                }
                else {
                    on = true;
                    // universe.updateAll(250);
                    universe.update({ 1: 65, 2: 0, 3: 255, 4: 0 });
                    // universe.update({5: 65, 6: 0, 7: 255, 8: 0});
                    // universe.update({9: 65, 10: 0, 11: 255, 12: 0});
                    this.log.info('on');
                }
            }, 5000);
            // The adapters config (in the instance object everything under the attribute "native") is accessible via
            // this.config:
            this.log.info(`Test ausgeführt`);
            this.log.info("config option1: " + this.config.device);
            this.log.info("config option2: " + this.config.test);
            // we are ready, let's set the connection indicator
            this.setState("info.connection", true, true);
            /*
            For every state in the system there has to be also an object of type state
            Here a simple template for a boolean variable named "testVariable"
            Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
            */
            yield this.setObjectNotExistsAsync("testVariable", {
                type: "state",
                common: {
                    name: "testVariable",
                    type: "boolean",
                    role: "indicator",
                    read: true,
                    write: true,
                },
                native: {},
            });
            // the variable testVariable is set to true as command (ack=false)
            yield this.setStateAsync("testVariable", true);
            // same thing, but the value is flagged "ack"
            // ack should be always set to true if the value is received from or acknowledged from the target system
            yield this.setStateAsync("testVariable", { val: true, ack: true });
            // same thing, but the state is deleted after 30s (getState will return null afterwards)
            yield this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });
            // // examples for the checkPassword/checkGroup functions
            // let result = await this.checkPasswordAsync("admin", "iobroker");
            // this.log.info("check user admin pw iobroker: " + result);
            // result = await this.checkGroupAsync("admin", "admin");
            // this.log.info("check group user admin group admin: " + result);
        });
    }
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    onUnload(callback) {
        var _a;
        try {
            // Here you must clear all timeouts or intervals that may still be active
            // clearTimeout(timeout1);
            // clearTimeout(timeout2);
            // ...
            // clearInterval(interval1);
            (_a = this.mydmx) === null || _a === void 0 ? void 0 : _a.close();
            callback();
        }
        catch (e) {
            callback();
        }
    }
    /**
     * Is called if a subscribed state changes
     */
    onStateChange(id, state) {
        if (!id || !state || state.ack) {
            return;
        }
        // The state was changed from the outside
        this.log.debug(`state ${id} changed: ${JSON.stringify(state.val)}`);
        const idParts = id.split('.');
        idParts.shift(); // remove adapter name
        idParts.shift(); // remove instance number
    }
    addStateEventHandler(uuid, eventHandler, name) {
        if (this.stateEventHandlers[uuid] === undefined) {
            this.stateEventHandlers[uuid] = [];
        }
        if (name) {
            this.removeStateEventHandler(uuid, name);
        }
        this.stateEventHandlers[uuid].push({ name: name, handler: eventHandler });
    }
    removeStateEventHandler(uuid, name) {
        if (this.stateEventHandlers[uuid] === undefined || !name) {
            return false;
        }
        let found = false;
        for (let i = 0; i < this.stateEventHandlers[uuid].length; i++) {
            if (this.stateEventHandlers[uuid][i].name === name) {
                this.stateEventHandlers[uuid].splice(i, 1);
                found = true;
            }
        }
        return found;
    }
}
if (module.parent) {
    // Export the constructor in compact mode
    module.exports = (options) => new nanodmx(options);
}
else {
    // otherwise start the instance directly
    (() => new nanodmx())();
}
//# sourceMappingURL=main.js.map