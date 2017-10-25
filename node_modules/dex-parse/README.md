[![Build Status](https://travis-ci.org/mdisibio/dex-parse.svg?branch=master)](https://travis-ci.org/mdisibio/dex-parse) [![Coverage Status](https://coveralls.io/repos/github/mdisibio/dex-parse/badge.svg?branch=master)](https://coveralls.io/github/mdisibio/dex-parse?branch=master)

# dex-parse
Dex-parse is a node.js library for parsing raw vending machine audit data in the DEX/UCS format into plain JS objects. Currently supports basic product sales and machine data, with support for remaining fields planned as needed.

# Input
DEX data is new line (\n) delimited text where each line contains 2 or 3 character prefix denoting the type of record.  Fields within a record are delimited by '*', and the interpretation depends on the type of record.
```
DXS*WTN4213952*VA*V0/6*1
ST*001*0001
ID1*WTN11082110074*GVC1        *8207***
ID4*2*001*5
CB1*11082110074*GVC1        *8207
PA1*010*50*****
PA2*6*350*6*350*0*0*0*0*0*0*0*0
PA3*2*150*2*150
PA4*0*0*0*0
PA5*20120301*125320*0
```   
# Output
Output is a single JS object containing an array of products and machine data properties.  Data is typed where possible; for example, price information is returned as Number. 

## Example output
Output for the example given above would be:
```javascript
{
  "products": [
    {
      "name": "010",
      "price": 0.5,
      "sold": 6,
      "revenue": 3.5,
      "testVendCount": "2",
      "soldOutDate": "20120301",
      "soldOutTime": "125320",
      "soldOutCount": "0"
    }
  ],
  "machine": {
    "serialNumber": "WTN11082110074",
    "modelNumber": "GVC1",
    "buildStandard": "8207",
    "assetNumber": "",
    "controlBoard": {
      "serialNumber": "11082110074",
      "modelNumber": "GVC1",
      "softwareRevision": "8207"
    }
  }
}
```

# Example Usage
Input data can be passed directly as string or read from a file.

```javascript 
var dexparse = require('dex-parse')

var mytext = "..."
dexparse.readText(mytext, function(err, data) {
    console.log(data.products[0].name)
})

dexparse.readFile('myfile.dex', function(err, data) {
    console.log(data.products[0].name)
})
```

# License
Dex-parse is licensed under the MIT license. See LICENSE.txt.


