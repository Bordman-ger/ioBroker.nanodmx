/*
 * Created with @iobroker/create-adapter v1.29.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from "@iobroker/adapter-core";
import DMX from "dmx";
// const dmx = new DMX();

// Augment the adapter.config object with the actual types
declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace ioBroker {
		interface AdapterConfig {
			// Define the shape of your options here (recommended)
			device: string;
			test: number;
		}
	}
}
export type FlatStateValue = string | number | boolean;
export type StateValue = FlatStateValue | any[] | Record<string, any>;

export type OldStateValue = StateValue | null | undefined;
export type CurrentStateValue = StateValue | null;
export type StateChangeListener = (oldValue: OldStateValue, newValue: CurrentStateValue) => void;
export type StateEventHandler = (value: any) => void;
export type StateEventRegistration = { name?: string; handler: StateEventHandler };
export type NamedStateEventHandler = (id: string, value: any) => void;


class nanodmx extends utils.Adapter {
	private mydmx?: any;
	private existingObjects: Record<string, ioBroker.Object> = {};
	private currentStateValues: Record<string, CurrentStateValue> = {};
	// private operatingModes: OperatingModes = {};
	private stateChangeListeners: Record<string, StateChangeListener> = {};
	private stateEventHandlers: Record<string, StateEventRegistration[]> = {};

	private cacheEvents = false;
	private eventsCache: Record<string, any> = {};

	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			dirname: __dirname.indexOf('node_modules') !== -1 ? undefined : __dirname + '/../',
			...options,
			name: "nanodmx",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("objectChange", this.onObjectChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	private async onReady(): Promise<void> {
		// store all current (acknowledged) state values
		// const allStates = await this.getStatesAsync("*");
		// for (const id in allStates) {
		// 	if (allStates[id] && allStates[id].ack) {
		// 		this.currentStateValues[id] = allStates[id].val;
		// 	}
		// }

		// store all existing objects for later use
		// this.existingObjects = await this.getAdapterObjectsAsync();

		// Reset the connection indicator during startup
		this.setState("info.connection", false, true);

		this.log.info(`Adapter state Ready`);
		// Initialize your adapter here

		this.mydmx = new DMX();
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
	    // we are ready, let's set the connection indicator
		this.setState("info.connection", true, true);

		/*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named "testVariable"
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/
		await this.setObjectNotExistsAsync("testVariable", {
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


	    this.cacheEvents = true;
	    this.mydmx.connect();

	    this.subscribeStates("*");






		// dmx.update(universe, channels[, extraData])
		this.mydmx.update({1: 1, 2: 0});
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
		await this.setStateAsync("testVariable", true);
		// same thing, but the value is flagged "ack"
		// ack should be always set to true if the value is received from or acknowledged from the target system
		await this.setStateAsync("testVariable", { val: true, ack: true });
		// same thing, but the state is deleted after 30s (getState will return null afterwards)
		await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });
		// // examples for the checkPassword/checkGroup functions
		// let result = await this.checkPasswordAsync("admin", "iobroker");
		// this.log.info("check user admin pw iobroker: " + result);
		// result = await this.checkGroupAsync("admin", "admin");
		// this.log.info("check group user admin group admin: " + result);
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 */
	private onUnload(callback: () => void): void {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);
			callback();
		} catch (e) {
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
	private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
		if (!id || !state || state.ack) {
	    return;
	    }

	    // The state was changed from the outside
		this.log.debug(`state ${id} changed: ${JSON.stringify(state.val)}`);
		const idParts = id.split('.');
		idParts.shift(); // remove adapter name
		idParts.shift(); // remove instance number
	}
	
	public addStateEventHandler(uuid: string, eventHandler: StateEventHandler, name?: string): void {
		if (this.stateEventHandlers[uuid] === undefined) {
			this.stateEventHandlers[uuid] = [];
		}

		if (name) {
			this.removeStateEventHandler(uuid, name);
		}

		this.stateEventHandlers[uuid].push({ name: name, handler: eventHandler });
	}

	public removeStateEventHandler(uuid: string, name: string): boolean {
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
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new nanodmx(options);
} else {
	// otherwise start the instance directly
	(() => new nanodmx())();
}