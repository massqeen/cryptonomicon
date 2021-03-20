const WS_BASE_URL = 'wss://streamer.cryptocompare.com/v2'
const BASE_URL = 'https://min-api.cryptocompare.com/'
const API_KEY =
  'fa0953473e497fca8bac965e71108df64934eeb22e2f15162856447d7faa3f4b'

const wsParams = new URLSearchParams()
wsParams.append('api_key', API_KEY)
const WS_URL = `${WS_BASE_URL}?${wsParams.toString()}`

const coinsParamsString = '?summary=true'
const COINS_URL = new URL(`${BASE_URL}data/all/coinlist${coinsParamsString}`)

const tickersHandlers = new Map(null)
const socket = new WebSocket(WS_URL)
const AGGREGATE_INDEX = '5'
const AGGREGATE_INDEX_ERR = '500'

let BTCtoUSD = 0

socket.addEventListener('message', e => {
  const {
    TYPE: type,
    FROMSYMBOL: currencyFrom,
    TOSYMBOL: currencyTo,
    PRICE: newPrice,
    MESSAGE: message,
    PARAMETER: parameter,
  } = JSON.parse(e.data)

  if (!tickersHandlers.get('BTC')) {
    subscribeToTicker('BTC', 'USD', price => (BTCtoUSD = price))
  }

  if (type === AGGREGATE_INDEX_ERR && message === 'INVALID_SUB') {
    const convertTo = parameter.split('~')[3]
    const convertFrom = parameter.split('~')[2]

    if (convertTo === 'BTC') {
      const handlers = tickersHandlers.get(convertFrom) ?? []
      handlers.forEach(fn => {
        fn('-', false)
      })
      return
    }
    unsubscribeFromTickerOnWs(convertFrom)
    subscribeToTicker(convertFrom, 'BTC')
  }

  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return
  }

  const handlers = tickersHandlers.get(currencyFrom) ?? []
  handlers.forEach(fn => {
    const priceToUSD = currencyTo === 'USD' ? newPrice : newPrice * BTCtoUSD
    fn(priceToUSD)
  })
})

const sendToWebSocket = message => {
  const stringifiedMessage = JSON.stringify(message)

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage)
    return
  }

  socket.addEventListener(
    'open',
    () => {
      socket.send(stringifiedMessage)
    },
    { once: true }
  )
}

const subscribeToTickerOnWs = (ticker, currency) => {
  sendToWebSocket({
    action: 'SubAdd',
    subs: [`5~CCCAGG~${ticker}~${currency}`],
  })
}

function unsubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
    action: 'SubRemove',
    subs: [`5~CCCAGG~${ticker}~USD`],
  })
  sendToWebSocket({
    action: 'SubRemove',
    subs: [`5~CCCAGG~${ticker}~BTC`],
  })
}

export const getCoins = async () => {
  try {
    const coins = await fetch(COINS_URL.href)
    const { Data } = await coins.json()
    return Data
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e)
  }
}

export const subscribeToTicker = (ticker, currency, cb) => {
  const subscribers = tickersHandlers.get(ticker) || []
  if (cb) {
    tickersHandlers.set(ticker, [...subscribers, cb])
  } else {
    tickersHandlers.set(ticker, [...subscribers])
  }
  subscribeToTickerOnWs(ticker, currency)
}

export const unsubscribeFromTicker = ticker => {
  tickersHandlers.delete(ticker)
  unsubscribeFromTickerOnWs(ticker)
}
