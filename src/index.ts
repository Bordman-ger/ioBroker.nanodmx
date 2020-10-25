const util = require('util');
const EventEmitter = require('events').EventEmitter;

// export interface Format {
//   relativeHumidity: string;
//   temperature: string;
//   windSpeed: string;
//   precipitation: string;
//   barometricPressure: string;



 class DMX {
  private universes: any;
  private devices: any;
  private drivers: any;
  private animation: any;
  static devices: any;

  constructor(options: any) {
    const opt = options || {};
    const devices = opt.devices  || {};

    this.universes = {};
    this.drivers = {};
    this.devices = Object.assign({}, require('./devices'), devices);
    this.animation = require('./anim');

    this.registerDriver('null', require('./drivers/null'));
    // erDriver('socketio', require('./drivers/socketio'));
    this.registerDriver('dmx4all', require('./drivers/dmx4all'));
    // this.registerDriver('enttec-usb-dmx-pro', require('./drivers/enttec-usb-dmx-pro'));
    // this.registerDriver('enttec-open-usb-dmx', require('./drivers/enttec-open-usb-dmx'));
    // this.registerDriver('dmxking-ultra-dmx-pro', require('./drivers/dmxking-ultra-dmx-pro'));
    // this.registerDriver('artnet', require('./drivers/artnet'));
    // this.registerDriver('bbdmx', require('./drivers/bbdmx'));
  }

  registerDriver(name: string, module: {}) {
    this.drivers[name] = module;
  }

  addUniverse(name: string, driver:any, deviceId:string, options:any) {
    this.universes[name] = new this.drivers[driver](deviceId, options);

    // this.universes[name].on('update', (channels:any , extraData:any) => {
    //   // this.emit('update', name, channels, extraData);
    // });

    return this.universes[name];
  }
  // emit(arg0: string, name: string, channels: any, extraData: any) {
  //   throw new Error("Method not implemented.");
  // }

  update(universe:any, channels:any, extraData:any) {
    this.universes[universe].update(channels, extraData || {});
  }

  updateAll(universe:any, value:string) {
    this.universes[universe].updateAll(value);
    // this.emit('updateAll', universe, value);
  }

  universeToObject(universeKey:any) {
    const universe = this.universes[universeKey];
    const u = [];

    for (let i = 0; i < 512; i++) {
      u[i] = universe.get(i);
    }
    return u;
  }
}

util.inherits(DMX, EventEmitter);

DMX.devices = require('./devices');
// DMX.Animation = require('./anim');

export default DMX