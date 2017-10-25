var dexparse = require('dex-parse')
var chokidar = require('chokidar')
var fs = require('fs')

var dirPath = "/Users/leonardean/Desktop/vendingMachine/"
var filePath = dirPath + "dex_data.txt"
var prevData = JSON.parse(fs.readFileSync(dirPath + "prev_products.txt", 'utf8')) || undefined
var remainingUnit = 8890

listenToLogs((path) => {
	fs.readFile(path, {encoding: 'utf-8'}, function(err, data) {
		if (!err) {
			dexparse.readText(data, function(err, data) {
				console.log("===============================DATA==================================")
				console.log(data)
				console.log("===============================DATA==================================")				
				if (prevData !== undefined) {
					prevProducts = prevData.products
					currProducts = data.products
					// error check
					if (data.machine.event !== undefined) {
						if (data.machine.event.eventActivity == '1') {
							if (prevData.machine.event !== undefined)
								if (prevData.machine.event.eventActivity == '0') {
									// report error
									if (data.machine.event.eventIdentification == "OBH") {
										var dateStamp = (new Date()).toISOString().substr(0, 10);
										var log = {
											"code": 1010,
											"occurred": (new Date()).toISOString(),
											"metaData": {
												"status": "OPEN"
											}
										}
										fs.appendFile(dirPath + "logs/" + dateStamp, JSON.stringify(log) + "\n", function(err) {
											console.log("Log appended");
											prevData = data
											fs.writeFile(dirPath + "prev_products.txt", JSON.stringify(data), 'utf8', function(err) {
									        if (err) {
									           return console.log(err);
									        };
									    });
										});
									} else if (data.machine.event.eventIdentification == "EBJ") {
										var dateStamp = (new Date()).toISOString().substr(0, 10);
										var log = {
											"code": 1009,
											"occurred": (new Date()).toISOString(),
											"metaData": {
												"status": "OPEN"
											}
										}
										fs.appendFile(dirPath + "logs/" + dateStamp, JSON.stringify(log) + "\n", function(err) {
											console.log("Log appended");
											prevData = data
											fs.writeFile(dirPath + "prev_products.txt", JSON.stringify(data), 'utf8', function(err) {
									        if (err) {
									           return console.log(err);
									        };
									    });
										});
									} else if (data.machine.event.eventIdentification == "EDT_1") {
										var dateStamp = (new Date()).toISOString().substr(0, 10);
										var log = {
											"code": 1008,
											"occurred": (new Date()).toISOString(),
											"metaData": {
												"status": "OPEN"
											}
										}
										fs.appendFile(dirPath + "logs/" + dateStamp, JSON.stringify(log) + "\n", function(err) {
											console.log("Log appended");
											prevData = data
											fs.writeFile(dirPath + "prev_products.txt", JSON.stringify(data), 'utf8', function(err) {
									        if (err) {
									           return console.log(err);
									        };
									    });
										});
									}									
								}
						} else if (data.machine.event.eventActivity == '0') {
							if (prevData.machine.event !== undefined) 
								if (prevData.machine.event.eventActivity == '1') {
									// report fixed
									if (data.machine.event.eventIdentification == "OBH") {
										var dateStamp = (new Date()).toISOString().substr(0, 10);
										var log = {
											"code": 1010,
											"occurred": (new Date()).toISOString(),
											"metaData": {
												"status": "FIXED"
											}
										}
										fs.appendFile(dirPath + "logs/" + dateStamp, JSON.stringify(log) + "\n", function(err) {
											console.log("Log appended");
											prevData = data
											fs.writeFile(dirPath + "prev_products.txt", JSON.stringify(data), 'utf8', function(err) {
									        if (err) {
									           return console.log(err);
									        };
									    });
										});
									} else if (data.machine.event.eventIdentification == "EBJ") {
										var dateStamp = (new Date()).toISOString().substr(0, 10);
										var log = {
											"code": 1009,
											"occurred": (new Date()).toISOString(),
											"metaData": {
												"status": "FIXED"
											}
										}
										fs.appendFile(dirPath + "logs/" + dateStamp, JSON.stringify(log) + "\n", function(err) {
											console.log("Log appended");
											prevData = data
											fs.writeFile(dirPath + "prev_products.txt", JSON.stringify(data), 'utf8', function(err) {
									        if (err) {
									           return console.log(err);
									        };
									    });
										});
									} else if (data.machine.event.eventIdentification == "EDT_1") {
										var dateStamp = (new Date()).toISOString().substr(0, 10);
										var log = {
											"code": 1008,
											"occurred": (new Date()).toISOString(),
											"metaData": {
												"status": "FIXED"
											}
										}
										fs.appendFile(dirPath + "logs/" + dateStamp, JSON.stringify(log) + "\n", function(err) {
											console.log("Log appended");
											prevData = data
											fs.writeFile(dirPath + "prev_products.txt", JSON.stringify(data), 'utf8', function(err) {
									        if (err) {
									           return console.log(err);
									        };
									    });
										});
									}
								}
						}
					}

					// products transaction check
					for (var i = 0; i < prevProducts.length; i ++) {
						if (prevProducts[i].sold !== currProducts[i].sold) {
							var dateStamp = (new Date()).toISOString().substr(0, 10);
							var log = {
								"code": 7,
								"occurred": (new Date()).toISOString(),
								"metaData": {
									"remaining": remainingUnit,
									"cost": prevProducts[i].price * 100,
									"productId": "PR-eceacade-f859-0bc1-b1a0-904d607b16f0",
									"locationId": "canister2",
									"paymentType": "Cash"
								}
							}
							fs.appendFile(dirPath + "logs/" + dateStamp, JSON.stringify(log) + "\n", function(err) {
									console.log(err)
					        console.log("Log appended");
					        prevData = data
					        remainingUnit = remainingUnit - 1
					    });
						}
					}
				} else {
					prevData = data
					fs.writeFile(dirPath + "prev_products.txt", JSON.stringify(data), 'utf8', function(err) {
			        if (err) {
			           return console.log(err);
			        };
			    });
				}
			})
		} else {
			console.log(err)
		}
	})
})


function listenToLogs(cb) {

    var watcher = chokidar.watch('file', {
        ignored: /(^|[\/\\])\../,
        persistent: true,
        ignoreInitial: true,
    });

    watcher
        .on('add', function(path) {
            console.log("File has been added: " + path);
            if (path == dirPath + "dex_data.txt")
            	cb(path);
        })
        .on('change', function(path) {
            console.log("File has been changed: " + path);
            if (path == dirPath + "dex_data.txt")
            	cb(path);
        });

    watcher.add(dirPath);
}

