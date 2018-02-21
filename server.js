'use strict'

const express = require('express');
const SocketServer = require('ws');
const path = require('path');
const BFX = require('bitfinex-api-node');

const bfx = new BFX({ 
    apiKey: '1234',
    apiSecret: '4321',
})

const SYMBOL = 'tIOTEUR'
const ws = bfx.ws(2)

ws.on('open', () => {
  console.log('open')
  ws.subscribeTicker(SYMBOL)
})

ws.onTicker({ symbol: SYMBOL }, (ticker) => {
  console.log('ok')
})

ws.open()
