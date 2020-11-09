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
// Load your modules here, e.g.:
// import * as fs from "fs";
const dmx_1 = __importDefault(require("dmx"));
// import DMX from "./index";
// import * as DMX from "./index";
const dmx = new dmx_1.default();
class nanodmx extends utils.Adapter {
    constructor(options = {}) {
        super(Object.assign(Object.assign({}, options), { name: "nanodmx" }));
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
            this.log.info(`Adapter state Ready`);
            // Initialize your adapter here
            // var universe = dmx.addUniverse('demo', 'enttec-open-usb-dmx', '/dev/cu.usbserial-6AVNHXS8')
            // const universe = dmx.addUniverse('demo', 'socketio', null, {port: 17809, debug: true});
            // const universe = dmx.addUniverse('myusb', 'dmx4all', '/dev/usb1', 'null');
            const universe = dmx.addUniverse('myusb', 'dmx4all', '/dev/ttyACM0', 'null');
            // The adapters config (in the instance object everything under the attribute "native") is accessible via
            // this.config:
            this.log.info("config option1: " + this.config.device);
            this.log.info("config option2: " + this.config.test);
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
            // dmx.update(universe, channels[, extraData])
            universe.update({ 1: 1, 2: 0 });
            universe.update({ 16: 1, 17: 255 });
            universe.update({ 1: 255, 3: 120, 4: 230, 5: 30, 6: 110, 7: 255, 8: 10, 9: 255, 10: 255, 11: 0 });
            let on = false;
            setInterval(() => {
                if (on) {
                    on = false;
                    universe.updateAll(0);
                    console.log('off');
                }
                else {
                    on = true;
                    universe.updateAll(250);
                    console.log('on');
                }
            }, 1000);
            // In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
            // this.subscribeStates("testVariable");
            // You can also add a subscription for multiple states. The following line watches all states starting with "lights."
            // this.subscribeStates("lights.*");
            // Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
            // this.subscribeStates("*");
            /*
                setState examples
                you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
            */
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
        try {
            // Here you must clear all timeouts or intervals that may still be active
            // clearTimeout(timeout1);
            // clearTimeout(timeout2);
            // ...
            // clearInterval(interval1);
            callback();
        }
        catch (e) {
            callback();
        }
    }
    // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
    // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
    // /**
    //  * Is called if a subscribed object changes
    //  */
    // private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
    // 	if (obj) {
    // 		// The object was changed
    // 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
    // 	} else {
    // 		// The object was deleted
    // 		this.log.info(`object ${id} deleted`);
    // 	}
    // }
    /**
     * Is called if a subscribed state changes
     */
    onStateChange(id, state) {
        this.log.info(`Adapter state change`);
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        }
        else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }
}
if (require.main) {
    // Export the constructor in compact mode
    module.exports = (options) => new nanodmx(options);
}
else {
    // otherwise start the instance directly
    (() => new nanodmx())();
}
//# sourceMappingURL=main.js.map