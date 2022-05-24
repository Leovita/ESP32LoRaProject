const mqtt = require("mqtt");
const { MongoClient, ServerApiVersion } = require("mongodb");
const http = require("http");
require("dotenv").config();

const host = "mqtt.ssh.edu.it";
const mqttPort = "1883";
const topic = "museum/params";
const serverPort = 3000;
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
const connectUrl = `mqtt://${host}:${mqttPort}`;
let collection = "LoRaDB_";

const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: "",
  password: "",
  reconnectPeriod: 1000,
});

client.on("connect", () => {
  console.log("Connected");
  client.subscribe([topic], () => {
    console.log(`Subscribe to topic '${topic}'`);
  });
});

function jsonCheck(jsonObj) {
  for (var key in jsonObj) {
    if (jsonObj[key] == null || jsonObj[key] == "undefined") {
      collection = "badJsonFormats";
      break;
    } else {
      collection = "LoRa_DB";
    }
  }
}

client.on("message", (topic, payload) => {
  console.log("Received Message:", topic, payload.toString());
  let parsedJSON = JSON.parse(payload);
  jsonCheck(parsedJSON);
  MongoClient.connect(process.env.URISTRING, function (err, db) {
    if (err) throw err;
    let dbo = db.db("LoRaDB_");
    dbo.collection(collection).insertOne(parsedJSON, function (err, res) {
      if (err) throw err;
      console.log("\n Json obj added to mongoDB!");
      db.close();
    });
  });
});
