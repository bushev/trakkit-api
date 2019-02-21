# Trakkit™ Public API Node.js library | [trakkitfleet.com](https://trakkitfleet.com/)

## Usage

```javascript
const Trakkit = require('trakkit-api');

const trakkit = new Trakkit({
    apiEndpoint: `https://api-trakkit.zedly.us/api/v2`,
    token: `API_KEY`,
    debug: true
});

trakkit.subscribe(`DEVICE_LOCATION`, {deviceId: `Device-ID`}, err => {
    if (err) return console.log(err);
    console.log(`Subscribed OK`);
}, data => {
    console.log(`Event received`);
    console.log(data);
    
});
```

Data will be an object like:

```json
{
  "deviceId": "5911feebddfb260ede780bdd",
  "lastLocation": {
    "id": "59dca3ace63ad70001e8f034",
    "altitude": 25,
    "battery": "78",
    "motion": 2,
    "speed": 13,
    "temperature": 85,
    "direction": 34,
    "location": {
      "coordinates": [-80.2047, 26.2355]
    },
    "timestamp": "2017-10-10T10:40:44.527Z"
  },
  "lastTrack": {
    "id": "59dca3ace63ad70001e8f035",
    "altitude": 45,
    "battery": "L",
    "motion": 1,
    "speed": 25,
    "temperature": 78,
    "direction": 12,
    "timestamp": "2017-11-18T12:31:18.424Z"
  }
}
```
