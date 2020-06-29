require('dotenv').config();
const clientFromConnectionString = require('azure-iot-device-amqp').clientFromConnectionString;
const Message = require('azure-iot-device').Message;
const client = clientFromConnectionString(process.env.CONNECTION_STRING_PRIMARY);

const printResultFor = (op) => {
    return (err, res) => {
        if (err) console.log(op + ' error: ' + err.toString());
        if (res) console.log(op + ' status: ' + res.constructor.name);
    }
}


const connectCallback = (err) => {
    if(err) console.log(`Couldn't connect to IOT HUB: ${err}`);
    else {
        console.log("Client connected to IOT HUB");

        //CALLBACK FOR INVOKED METHODS
        /* THESE ARE SPECIFIC METHODS CALLED BY THE SERVER, AND, JUST LIKE A SERVER, ANSWERS THE DATA IN THE SAME REQUEST.
        *  THIS METHOD SAVES SOME RESOURCES CAUSE IT ONLY RESPONDS WHEN CALLED, SAVING NETWORK DATA
        */
        client.onDeviceMethod("getData", (req, res) => {
            res.send(200, { 
                ID_KEG: 123456789,
                ID_SKU: 12345,
                LATITUDE: -22.920915,
                LONGITUDE: -47.018038,
                NFC_ID: 456789465,
                TEMP_KEG: 17.65,
                TEMP_DEV: 20.65,
                UR_DEV: 22,
                ACCEL_VAL: 133,
                GIRO_VAL: 133,
                BARO_VAL: 133,
                AMB_VAL: 133,
                MAGNET_VAL: 133
             });
        });

        //CALLBACK FOR RECEIVED MESSAGES
        client.on('message', (msg) => {
            client.complete(msg, printResultFor('completed'));
 
            if ( msg.data[0] == 42) {
                console.log("\x1b[33m",'Command = ' + msg.data);
                console.log("\x1b[0m", '------------------');
            } else {
                console.log("\x1b[31m",'Command = ' + msg.data);
                console.log("\x1b[0m", '------------------');
            }
        });

        //SENDING MESSAGES (ONE PER MINUTE)
        setInterval(function(){
       
            var data = JSON.stringify({ 
                ID_KEG: 123456789,
                ID_SKU: 12345,
                LATITUDE: -22.920915,
                LONGITUDE: -47.018038,
                NFC_ID: 456789465,
                TEMP_KEG: 17.65,
                TEMP_DEV: 20.65,
                UR_DEV: 22,
                ACCEL_VAL: 133,
                GIRO_VAL: 133,
                BARO_VAL: 133,
                AMB_VAL: 133,
                MAGNET_VAL: 133
             });
            var message = new Message(data);
       
            console.log("Telemetry sent: " + message.getData());
            client.sendEvent(message, printResultFor('send'));
          }, 60000);
    }
}

console.log("\x1b[31m",'NodeJs IoTHub DEMO');
console.log("\x1b[0m", '==================');

client.open(connectCallback);