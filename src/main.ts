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
			// dirname: __dirname.indexOf('node_modules') !== -1 ? undefined : __dirname + '/../',
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
		// Reset the connection indicator during startup
		this.setState("info.connection", false, true);

		this.log.info(`Adapter state Ready`);
		// Initialize your adapter here

		this.mydmx = new DMX();

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
		} else {
			on = true;
			// universe.updateAll(250);
			// universe.update({1: 65, 2: 0, 3: 255, 4: 0});
			// universe.update({5: 65, 6: 0, 7: 255, 8: 0});
			universe.update({10: 65, 11: 0, 12: 255,13 : 0});
			this.log.info('on');
		}
		}, 5000);

		this.log.info(`Test ausgeführt`);

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

		// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
		this.subscribeStates("testVariable");
		// You can also add a subscription for multiple states. The following line watches all states starting with "lights."
		// this.subscribeStates("lights.*");
		// Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
		// this.subscribeStates("*");
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
			this.mydmx?.universe?.close();
			this.mydmx?.close();
			
			callback();
		} catch (e) {
			callback();
		}
	}



	/**
	 * Is called if a subscribed state changes
	 */
	private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}
	
	

}

if (module.parent) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new nanodmx(options);
} else {
	// otherwise start the instance directly
	(() => new nanodmx())();
}