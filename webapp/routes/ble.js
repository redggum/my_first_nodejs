var express = require('express');
var router = express.Router();

var noble = require('noble');

router.get('/', function(req, res, next) {
	console.log("ble is starting!!");
	noble.startScanning();
	noble.on('stageChange', function(state) {
		console.log('on -> stageChange: ' + state);

		if (state === 'poweredOn') {
			noble.startScanning();
		} else {
			noble.stopScanning();
		}
	});

	noble.on('scanStart', function() {
	  	console.log('on -> scanStart');
	});

	noble.on('scanStop', function() {
	  	console.log('on -> scanStop');
	});

	noble.on('discover', function(peripheral) {
		// console.log('on -> discover: ' + peripheral);

		var id = peripheral.id;
		var address = peripheral.address;
		var advertisement = peripheral.advertisement;
		var localName = advertisement.localName;
		var serviceData = advertisement.serviceData;	// array

		// console.log("advertisement : " + advertisement);
		// console.log("serviceData : " + serviceData);

		// connect to Xiaomi Flower mate
		if (localName === "Flower mate") {
			console.log("name : " + localName);
			noble.stopScanning();

			// serviceData.forEach((item, index) => {
			// 	console.log(item);
			// });

			peripheral.connect();
		}

		// for (var obj in serviceData) {
		// 	console.log("obj : " + obj);
		// }

		// noble.stopScanning();

		peripheral.on('connect', (err) => {
		    console.log('on -> connect');
		    this.updateRssi();
		    if (!err) {
		    	this.discoverServices();
		    } else {
		    	console.log("connect : " + err);
		    	this.disconnect();
		    }
		});

		peripheral.on('disconnect', (err) => {
		    console.log('on -> disconnect');

		    if (!err) {
		    	noble.startScanning();
		    } else {
		    	console.log("disconnect : " + err);
		    }
		});

		peripheral.on('rssiUpdate', function(rssi) {
		    console.log('on -> RSSI update ' + rssi);
		    this.discoverServices();
		});

		peripheral.on('servicesDiscover', function(services) {
		    console.log('on -> peripheral services discovered ' + services);

		    var serviceIndex = 0;

		    services[serviceIndex].on('includedServicesDiscover', function(includedServiceUuids) {
		    	console.log('on -> service included services discovered ' + includedServiceUuids);
		      	this.discoverCharacteristics();
		    });

		    services[serviceIndex].on('characteristicsDiscover', function(characteristics) {
		      	console.log('on -> service characteristics discovered ' + characteristics);

		      	var characteristicIndex = 0;

		      	characteristics[characteristicIndex].on('read', function(data, isNotification) {
		        	console.log('on -> characteristic read ' + data + ' ' + isNotification);
		        	console.log(data);

		        	peripheral.disconnect();
		      	});

		      	characteristics[characteristicIndex].on('write', function() {
		        	console.log('on -> characteristic write ');

		        	peripheral.disconnect();
		     	});

		      	characteristics[characteristicIndex].on('broadcast', function(state) {
		        	console.log('on -> characteristic broadcast ' + state);

		        	peripheral.disconnect();
		      	});

		      	characteristics[characteristicIndex].on('notify', function(state) {
		        	console.log('on -> characteristic notify ' + state);

		        	peripheral.disconnect();
		      	});

		      	characteristics[characteristicIndex].on('descriptorsDiscover', function(descriptors) {
		        	console.log('on -> descriptors discover ' + descriptors);

		        	var descriptorIndex = 0;

			        descriptors[descriptorIndex].on('valueRead', function(data) {
			          	console.log('on -> descriptor value read ' + data);
			          	console.log(data);
			          	peripheral.disconnect();
			        });

			        descriptors[descriptorIndex].on('valueWrite', function() {
			          	console.log('on -> descriptor value write ');
			          	peripheral.disconnect();
			        });

			        descriptors[descriptorIndex].readValue();
			        //descriptors[descriptorIndex].writeValue(new Buffer([0]));
		    	});

		    	characteristics[characteristicIndex].read();
		    	//characteristics[characteristicIndex].write(new Buffer('hello'));
		    	//characteristics[characteristicIndex].broadcast(true);
		    	//characteristics[characteristicIndex].notify(true);
		    	// characteristics[characteristicIndex].discoverDescriptors();
			});
		    
			services[serviceIndex].discoverIncludedServices();
		});

	  // peripheral.connect();
	});
});

router.get('/scanning', function(req, res, next) {
	noble.startScanning();
	res.send('ble start scanning...');	
});

module.exports = router;
