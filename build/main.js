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
        super(Object.assign(Object.assign({}, options), { name: "nanodmx" }));
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
            // const universe = this.mydmx.addUniverse("myusb", "dmx4all", "/dev/ttyACM0", "null");
            // const universe = this.mydmx.addUniverse("myusb", this.config.driver, this.config.device, "null");
            this.mydmx.universe = this.mydmx.addUniverse("myusb", this.config.driver, this.config.device, "null");
            this.log.info(`Universe erzeugt`);
            this.mydmx.universe.updateAll(0);
            // Keller 2-5
            this.mydmx.universe.update({ 2: 90, 3: 15, 4: 255, 5: 25 });
            // OG 6-9
            this.mydmx.universe.update({ 6: 90, 7: 15, 8: 255, 9: 25 });
            // Küche 10-13 
            this.mydmx.universe.update({ 10: 90, 11: 15, 12: 255, 13: 25 });
            // Party 16-18, Terasse 19-21
            this.log.info('on');
            // The adapters config (in the instance object everything under the attribute "native") is accessible via
            // this.config:
            //LIMIT the number of DMX channels max. 224 usable with ioBroker
            if (this.config.channels_used > 224) {
                this.config.channels_used = 224;
            }
            ;
            if (this.config.channels_used < 0) {
                this.config.channels_used = 1;
            }
            ;
            this.log.info("config option1: " + this.config.device);
            this.log.info("config option3: " + this.config.driver);
            this.log.info("config option4: " + this.config.channels_used);
            // we are ready, let's set the connection indicator
            this.setState("info.connection", true, true);
            //Initialize ioBrokers state objects if they dont exist
            //DMX CHANNELS contain and send DMX value 0-255 to a DMX channel
            // for (i=1;i<=DMX_CHANNELS_USED;i++){
            for (let i = 2; i < this.config.channels_used; i++) {
                // for (i:Number =1;i<=21;i++){
                this.setObjectNotExists(this.GetDMX(i), {
                    type: 'state',
                    common: { name: 'DMX channel' + i, type: 'number', role: 'value', read: true, write: true },
                    native: {}
                });
            }
            // await this.setObjectNotExistsAsync("testVariable", {
            // 	type: "state",
            // 	common: {
            // 		name: "testVariable",
            // 		type: "boolean",
            // 		role: "indicator",
            // 		read: true,
            // 		write: true,
            // 	},
            // 	native: {},
            // });
            // In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
            // this.subscribeStates("testVariable");
            // You can also add a subscription for multiple states. The following line watches all states starting with "lights."
            // this.subscribeStates("lights.*");
            // Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
            this.subscribeStates("DMX*");
            // the variable testVariable is set to true as command (ack=false)
            // await this.setStateAsync("testVariable", true);
            // same thing, but the value is flagged "ack"
            // ack should be always set to true if the value is received from or acknowledged from the target system
            // await this.setStateAsync("testVariable", { val: true, ack: true });
            // same thing, but the state is deleted after 30s (getState will return null afterwards)
            // await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });
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
        var _a, _b, _c;
        try {
            // Here you must clear all timeouts or intervals that may still be active
            // clearTimeout(timeout1);
            // clearTimeout(timeout2);
            // ...
            // clearInterval(interval1);
            (_b = (_a = this.mydmx) === null || _a === void 0 ? void 0 : _a.universe) === null || _b === void 0 ? void 0 : _b.close();
            (_c = this.mydmx) === null || _c === void 0 ? void 0 : _c.close();
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
        if (state) {
            // var adaptername = this.name;
            this.log.info(this.name);
            // The state was changed: state nanodmx.0.DMX010 changed: 100 (ack = false)
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
            let portstring = id.substring(this.name.length + 3); //remove Instance name
            let portnumber = parseInt(portstring.substring(3));
            this.log.info(`number ${portnumber}`);
            this.log.info(`value ${state.val}`);
            // this.mydmx.universe.update({11: state.val });  
            this.mydmx.universe.update({ [portnumber]: state.val });
            this.log.info('updated');
            // Küche 10-13 
        }
        else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }
    GetDMX(number) {
        if (number < 10) {
            return 'DMX00' + number;
        }
        if (number < 100) {
            return 'DMX0' + number;
        }
        return 'DMX' + number;
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