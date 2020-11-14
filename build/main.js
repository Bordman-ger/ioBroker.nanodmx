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
exports.nanodmx = void 0;
// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = __importStar(require("@iobroker/adapter-core"));
// import { GlobalStates } from './structure-file';
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
            // store all current (acknowledged) state values
            const allStates = yield this.getStatesAsync("*");
            for (const id in allStates) {
                if (allStates[id] && allStates[id].ack) {
                    this.currentStateValues[id] = allStates[id].val;
                }
            }
            // store all existing objects for later use
            this.existingObjects = yield this.getAdapterObjectsAsync();
            // Reset the connection indicator during startup
            this.setState("info.connection", false, true);
            this.log.info(`Adapter state Ready`);
            // Initialize your adapter here
            this.mydmx = new dmx_1.default();
            // this.mydmx.registerDriver(name, module)
            this.mydmx.addUniverse("myusb", "dmx4all", "/dev/ttyACM0", "null");
            // var universe = dmx.addUniverse('demo', 'enttec-open-usb-dmx', '/dev/cu.usbserial-6AVNHXS8')
            // const universe = dmx.addUniverse('demo', 'socketio', null, {port: 17809, debug: true});
            // const universe = dmx.addUniverse('myusb', 'dmx4all', '/dev/usb1', 'null');
            // const universe = dmx.addUniverse("myusb", "dmx4all", "/dev/ttyACM0", "null");
            // The adapters config (in the instance object everything under the attribute "native") is accessible via
            // this.config:
            this.log.info("config option1: " + this.config.device);
            this.log.info("config option2: " + this.config.test);
            this.mydmx.on("connect", () => {
                this.log.info("Miniserver connected");
            });
            this.mydmx.on("authorized", () => {
                this.log.debug("authorized");
            });
            this.mydmx.on("connect_failed", () => {
                this.log.error("Miniserver connect failed");
            });
            this.mydmx.on("connection_error", (error) => {
                this.log.error("Miniserver connection error: " + error);
            });
            this.mydmx.on("close", () => {
                this.log.info("connection closed");
                this.setState("info.connection", false, true);
            });
            this.mydmx.on("send", (message) => {
                this.log.debug("sent message: " + message);
            });
            this.mydmx.on("message_text", (message) => {
                this.log.debug("message_text " + JSON.stringify(message));
            });
            this.mydmx.on("message_file", (message) => {
                this.log.debug("message_file " + JSON.stringify(message));
            });
            this.mydmx.on("message_invalid", (message) => {
                this.log.debug("message_invalid " + JSON.stringify(message));
            });
            this.mydmx.on("keepalive", (time) => {
                this.log.silly("keepalive (" + time + "ms)");
            });
            // this.mydmx.on('get_structure_file', async (data: StructureFile) => {
            //     this.log.silly('get_structure_file ' + JSON.stringify(data));
            //     this.log.info('got structure file; last modified on ' + data.lastModified);
            //     try {
            //         await this.loadStructureFileAsync(data);
            //         this.log.debug('structure file successfully loaded');
            //         // we are ready, let's set the connection indicator
            //         this.setState('info.connection', true, true);
            //     } catch (error) {
            //         this.log.error(`Couldn't load structure file: ${error}`);
            //     }
            // });
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
            const handleAnyEvent = (uuid, evt) => {
                this.log.silly("received update event: ${JSON.stringify(evt)}: ${uuid}");
                this.handleEvent(uuid, evt);
            };
            this.mydmx.on("update_event_value", handleAnyEvent);
            this.mydmx.on("update_event_text", handleAnyEvent);
            this.mydmx.on("update_event_daytimer", handleAnyEvent);
            this.mydmx.on("update_event_weather", handleAnyEvent);
            this.cacheEvents = true;
            this.mydmx.connect();
            this.subscribeStates("*");
            // dmx.update(universe, channels[, extraData])
            this.mydmx.update({ 1: 1, 2: 0 });
            // this.mydmx.dmx.universe.update({16: 1, 17: 255});
            // this.mydmx.dmx.universe.update({1: 255, 3: 120, 4: 230, 5: 30, 6: 110, 7: 255, 8: 10, 9: 255, 10: 255, 11: 0});
            // let on = false;
            // setInterval(() => {
            // 	if (on) {
            // 		on = false;
            // 		this.mydmx.dmx.universe.updateAll(0);
            // 		console.log("'off");
            // 	} else {
            // 		on = true;
            // 		this.mydmx.dmx.universe.updateAll(250);
            // 		console.log("on");
            // 	}
            // }, 1000);
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
        // this.log.info(`Adapter state change`);
        // if (state) {
        // 	// The state was changed
        // 	this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        // } else {
        // 	// The state was deleted
        // 	this.log.info(`state ${id} deleted`);
        // }
        if (!id || !state || state.ack) {
            return;
        }
        this.log.silly(`stateChange ${id} ${JSON.stringify(state)}`);
        if (!this.stateChangeListeners.hasOwnProperty(id)) {
            this.log.error("Unsupported state change: " + id);
            return;
        }
        this.stateChangeListeners[id](this.currentStateValues[id], state.val);
    }
    // private async loadStructureFileAsync(data: StructureFile): Promise<void> {
    // 	this.stateEventHandlers = {};
    // 	this.foundRooms = {};
    // 	this.foundCats = {};
    // 	this.operatingModes = data.operatingModes;
    // 	await this.loadGlobalStatesAsync(data.globalStates);
    // 	await this.loadControlsAsync(data.controls);
    // 	await this.loadEnumsAsync(data.rooms, 'enum.rooms', this.foundRooms, this.config.syncRooms);
    // 	await this.loadEnumsAsync(data.cats, 'enum.functions', this.foundCats, this.config.syncFunctions);
    // 	await this.loadWeatherServerAsync(data.weatherServer);
    // 	// replay all cached events (and clear them)
    // 	if (this.cacheEvents) {
    // 		this.cacheEvents = false;
    // 		for (const uuid in this.eventsCache) {
    // 			this.handleEvent(uuid, this.eventsCache[uuid]);
    // 		}
    // 		this.eventsCache = {};
    // }
    // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
    // /**
    //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
    //  * Using this method requires "common.message" property to be set to true in io-package.json
    //  */
    // private onMessage(obj: ioBroker.Message): void {
    // 	if (typeof obj === "object" && obj.message) {
    // 		if (obj.command === "send") {
    // 			// e.g. send email or pushover or whatever
    // 			this.log.info("send command");
    // 			// Send response in callback if required
    // 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
    // 		}
    // 	}
    // }
    // private async loadGlobalStatesAsync(globalStates: GlobalStates): Promise<void> {
    //     interface GlobalStateInfo {
    //         type: ioBroker.CommonType;
    //         role: string;
    //         handler: (name: string, value: FlatStateValue) => void;
    //     }
    //     const globalStateInfos: Record<string, GlobalStateInfo> = {
    //         operatingMode: {
    //             type: 'number',
    //             role: 'value',
    //             handler: this.setOperatingMode.bind(this),
    //         }
    //         // sunrise: {
    //     type: 'number',
    //     role: 'value.interval',
    //     handler: this.setStateAck.bind(this),
    // },
    // sunset: {
    //     type: 'number',
    //     role: 'value.interval',
    //     handler: this.setStateAck.bind(this),
    // },
    // notifications: {
    //     type: 'number',
    //     role: 'value',
    //     handler: this.setStateAck.bind(this),
    // },
    // modifications: {
    //     type: 'number',
    //     role: 'value',
    //     handler: this.setStateAck.bind(this),
    // },
    //	};
    //     const defaultInfo: GlobalStateInfo = {
    //         type: 'string',
    //         role: 'text',
    //         handler: this.setStateAck.bind(this),
    // 	};
    handleEvent(uuid, evt) {
        if (this.cacheEvents) {
            this.eventsCache[uuid] = evt;
            return;
        }
        const stateEventHandlerList = this.stateEventHandlers[uuid];
        if (stateEventHandlerList === undefined) {
            this.log.debug("Unknown event UUID: " + uuid);
            return;
        }
        stateEventHandlerList.forEach((item) => {
            try {
                item.handler(evt);
            }
            catch (e) {
                this.log.error(`Error while handling event UUID ${uuid}: ${e}`);
            }
        });
    }
    sendCommand(uuid, action) {
        this.mydmx.send_cmd(uuid, action);
    }
    updateObjectAsync(id, obj) {
        return __awaiter(this, void 0, void 0, function* () {
            const fullId = this.namespace + "." + id;
            if (this.existingObjects.hasOwnProperty(fullId)) {
                // const existingObject = this.existingObjects[fullId];
                // if (!this.config.syncNames && obj.common) {
                //     obj.common.name = existingObject.common.name;
                // }
                /* TODO: re-add:
                if (obj.common.smartName != 'ignore' && existingObject.common.smartName != 'ignore') {
                    // keep the smartName (if it's not supposed to be ignored)
                    obj.common.smartName = existingObject.common.smartName;
                }*/
            }
            yield this.extendObjectAsync(id, obj);
        });
    }
    updateStateObjectAsync(id, commonInfo, stateUuid, stateEventHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            /* TODO: re-add:
            if (commonInfo.hasOwnProperty('smartIgnore')) {
                // interpret smartIgnore (our own extension of common) to generate smartName if needed
                if (commonInfo.smartIgnore) {
                    commonInfo.smartName = 'ignore';
                } else if (!commonInfo.hasOwnProperty('smartName')) {
                    commonInfo.smartName = null;
                }
                delete commonInfo.smartIgnore;
            }*/
            const obj = {
                type: "state",
                common: commonInfo,
                native: {
                    uuid: stateUuid,
                },
            };
            yield this.updateObjectAsync(id, obj);
            if (stateEventHandler) {
                this.addStateEventHandler(stateUuid, (value) => {
                    stateEventHandler(id, value);
                });
            }
        });
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
    addStateChangeListener(id, listener) {
        this.stateChangeListeners[this.namespace + "." + id] = listener;
    }
    setStateAck(id, value) {
        this.currentStateValues[this.namespace + "." + id] = value;
        this.setState(id, { val: value, ack: true });
    }
    getCachedStateValue(id) {
        if (this.currentStateValues.hasOwnProperty(id)) {
            return this.currentStateValues[id];
        }
        return undefined;
    }
}
exports.nanodmx = nanodmx;
if (require.main) {
    // Export the constructor in compact mode
    module.exports = (options) => new nanodmx(options);
}
else {
    // otherwise start the instance directly
    (() => new nanodmx())();
}
//# sourceMappingURL=main.js.map