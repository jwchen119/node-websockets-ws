'use strict'

const BFX = require('bitfinex-api-node');

const bfx = new BFX({ 
    apiKey: '1234',
    apiSecret: '4321',
})

const ws = bfx.ws(2, {
  manageCandles: true,  // enable candle dataset persistence/management
  transform: true       // converts ws data arrays to Candle models (and others)
})

const CANDLE_KEY = 'trade:1m:tBTCUSD'

ws.on('open', () => {
  console.log('open')
  ws.subscribeCandles(CANDLE_KEY)
})

ws.onCandle({ key: CANDLE_KEY }, (candles) => {
  if (prevTS === null || candles[0].mts > prevTS) {
    const c = candles[1] // report previous candle

    console.log(`%s %s open: %f, high: %f, low: %f, close: %f, volume: %f`,
      CANDLE_KEY, new Date(c.mts).toLocaleTimeString(),
      c.open, c.high, c.low, c.close, c.volume
    )

    prevTS = candles[0].mts
  }
})

ws.open()
