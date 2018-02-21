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

// 新增當地時區的時間物件
function DateTimezone(offset) {
    // 建立現在時間的物件
    d = new Date();
    // 取得 UTC time
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    // 新增不同時區的日期資料
    return new Date(utc + (3600000*offset));

}
// 計算當地時區的時間
function calcTime(city, offset) {
    // 建立現在時間的物件
    d = new Date();
    // 取得 UTC time
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    // 新增不同時區的日期資料
    nd = new Date(utc + (3600000*offset));
    // 顯示當地時間
    return "在 " + city + " 的本地時間是 " + nd.toLocaleString();
}
var date_taipei = DateTimezone(8);

setInterval(() => {
    wss.clients.forEach((client) => {
      Crypto = {date: date_taipei.toLocaleString(), open:c.open, close:c.close, high:c.high, low:c.low, volume:c.volume};  
      client.send(JSON.stringify(Crypto));
    });
}, 1000);
