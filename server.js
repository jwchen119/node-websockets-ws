'use strict'

const BFX = require('bitfinex-api-node');
const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');

const bfx = new BFX({ 
    apiKey: '1234',
    apiSecret: '4321',
})

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

wss.on('connection', (wsd) => {
  console.log('Client connected');
  wsd.on('close', () => console.log('Client disconnected'));
});

const ws = bfx.ws(2, {
  manageCandles: true,  // enable candle dataset persistence/management
  transform: true,       // converts ws data arrays to Candle models (and others)
  autoReconnect: true
})

const CANDLE_KEY = 'trade:1m:tIOTUSD'
var c = "";
var Crypto = {date:"Waiting...", open:"Waiting...", close:"Waiting...", high:"Waiting...", low:"Waiting...", volume:"Waiting..."};

ws.on('open', () => {
  console.log('open')
  ws.subscribeCandles(CANDLE_KEY)
})

let prevTS = null

ws.onCandle({ key: CANDLE_KEY }, (candles) => {
    c = candles[0] // report previous candle

    console.log(`%s %s open: %f, high: %f, low: %f, close: %f, volume: %f`,
      CANDLE_KEY, new Date(c.mts).toLocaleTimeString(),
      c.open, c.high, c.low, c.close, c.volume
    )
})

ws.open()

var d = "";
var utc = "";
var nd = "";
var date_taipei = "";

function DateTimezone(offset) {
    d = new Date();
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000*offset));

}

setInterval(() => {
    wss.clients.forEach((client) => {
      date_taipei = DateTimezone(8);
      Crypto = {local_date: date_taipei.toLocaleString(), candle_date: new Date(c.mts).toLocaleTimeString(), open :c.open, close: c.close, high: c.high, low: c.low, volume: c.volume};  
      client.send(JSON.stringify(Crypto));
    });
}, 500);
