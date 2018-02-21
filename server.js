'use strict'

const BFX = require('bitfinex-api-node');

const bfx = new BFX({ 
    apiKey: '1234',
    apiSecret: '4321',
})

const SYMBOL = 'tIOTEUR'
const ws = bfx.ws(2)

ws.on('open', () => {
  debug('open')
  ws.subscribeTicker(SYMBOL)
})

ws.onTicker({ symbol: SYMBOL }, (ticker) => {
  debug('%s ticker: %j', SYMBOL, ticker)
})

ws.open()
