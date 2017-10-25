var dexparse = require('dex-parse')
var chokidar = require('chokidar')
var fs = require('fs')

var dirPath = "/home/pi/Documents/vendingCPDataBuffer/"
var filePath = dirPath + "dexRaw/dex_data.txt"
var prevDataPath = dirPath + "dexJson/prev_data.txt"
var prevData = undefined
try {
	prevData = JSON.parse(fs.readFileSync(dirPath + "dexJson/prev_data.txt", 'utf8'))
} catch (e) {
	console.log(e)
} finally {

}

var remainingUnit = 8890

var eventName2Code = {
	'OBH': 1010,
	'EBJ': 1009,
	'EDT_1': 1008
}

function updateEvent(eventName, eventStatus, cb) {
	var dateStamp = (new Date()).toISOString().substr(0, 10);
	var log = {
		"code": eventName2Code[eventName],
		"occurred": (new Date()).toISOString(),
		"metaData": {
			"status": eventStatus
		}
	}
	fs.appendFile(dirPath + "agentLogs/" + dateStamp, JSON.stringify(log) + "\n", function(err) {
		console.log("Log appended");
		cb()
	});
}

listenToLogs((path) => {
	fs.readFile(path, {encoding: 'utf-8'}, function(err, data) {
		if (!err) {
			dexparse.readText(data, function(err, data) {
				console.log("===============================DATA==================================")
				console.log(data)
				console.log("===============================DATA==================================")
				if (!(data == undefined || data == "")){
					fs.writeFile(prevDataPath, JSON.stringify(data), 'utf8', function(err) {
							if (err) {
								 return console.log(err);
							};
					});

					if (prevData !== undefined) {
						var prevProducts = prevData.products
						var currProducts = data.products

						// error check
						var prevEvents = prevData.events == undefined ? undefined : prevData.events.map((event) => {
							if (event.eventActivity == '1')
								return event
						})
						console.log(prevEvents)

						var currEvents = data.events == undefined ? undefined : data.events.map((event) => {
							if (event.eventActivity == '0') {
								if (prevEvents == undefined || prevEvents == [])
									console.log("previous events are empty")
								else {
									prevEvents.forEach((prevEvent) => {
										if (prevEvent.eventIdentification == event.eventIdentification && prevEvent.eventActivity == '1') {
											updateEvent(event.eventIdentification, 'OPEN', ()=>{
												prevData = data
											})
										}
									})
								}
							} else if (event.eventActivity == '1') {
								prevEvents.forEach((prevEvent) => {
									if (prevEvent.eventIdentification == event.eventIdentification && prevEvent.eventActivity == '0') {
										updateEvent(event.eventIdentification, 'FIXED', ()=>{
											prevData = data
										})
									}
								})
							}
						})
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
								fs.appendFile(dirPath + "agentLogs/" + dateStamp, JSON.stringify(log) + "\n", function(err) {
						        console.log("Log appended");
						        prevData = data
						        remainingUnit = remainingUnit - 1
						    });
							}
						}
					} else {
						prevData = data
						fs.writeFile(dirPath + "dexJson/prev_data.txt", JSON.stringify(data), 'utf8', function(err) {
				        if (err) {
				           return console.log(err);
				        };
				    });
					}
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
            if (path == filePath)
            	cb(path);
        })
        .on('change', function(path) {
            console.log("File has been changed: " + path);
            if (path == filePath)
            	cb(path);
        });

    watcher.add(dirPath);
}
