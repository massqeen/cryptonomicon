<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div
      v-if="isLoading"
      class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>

    <div class="container">
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700"
              >Тикер</label
            >
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                v-model.trim="ticker"
                @keydown.enter="add"
                @input="handleInputChange"
                type="text"
                name="wallet"
                id="wallet"
                class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="Например DOGE"
                minlength="2"
              />
            </div>
            <div
              v-if="autoCompleteTags.length > 0"
              class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
            >
              <span
                v-show="autoCompleteTags[0]"
                @click="handleTagClick(autoCompleteTags[0]?.Symbol)"
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                {{ autoCompleteTags[0]?.Symbol }}
              </span>
              <span
                v-show="autoCompleteTags[1]"
                @click="handleTagClick(autoCompleteTags[1]?.Symbol)"
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                {{ autoCompleteTags[1]?.Symbol }}
              </span>
              <span
                v-show="autoCompleteTags[2]"
                @click="handleTagClick(autoCompleteTags[2]?.Symbol)"
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                {{ autoCompleteTags[2]?.Symbol }}
              </span>
              <span
                v-show="autoCompleteTags[3]"
                @click="handleTagClick(autoCompleteTags[3]?.Symbol)"
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                {{ autoCompleteTags[3]?.Symbol }}
              </span>
            </div>
            <div v-if="isDuplicated" class="text-sm text-red-600">
              Такой тикер уже добавлен
            </div>
          </div>
        </div>
        <button
          @click="add"
          type="button"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <svg
            class="-ml-0.5 mr-2 h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="#ffffff"
          >
            <path
              d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            ></path>
          </svg>
          Добавить
        </button>
      </section>

      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <div>
          <button
            v-if="page > 1"
            @click="page -= 1"
            class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Назад
          </button>
          <button
            v-if="hasNextPage"
            @click="page += 1"
            class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Вперед
          </button>
          <label>
            Фильтр:
            <input type="text" v-model.trim="filter" @input="page = 1" />
          </label>
        </div>
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in paginatedTickers"
            :key="t.name"
            @click="select(t)"
            class="overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
            :class="{
              'border-4': selectedTicker === t,
              'bg-red-100': !isCoinExist(t.name),
              'bg-white': isCoinExist(t.name),
            }"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ t.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(t.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="handleDelete(t)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <section v-if="selectedTicker" class="relative">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ selectedTicker.name }} - USD
        </h3>
        <div class="flex items-end border-gray-600 border-b border-l h-64">
          <div
            v-for="(bar, i) in shortenedGraph"
            :key="i"
            :style="{ height: `${bar}%` }"
            class="bg-purple-800 border w-10"
          ></div>
        </div>
        <button
          @click="selectedTicker = null"
          type="button"
          class="absolute top-0 right-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            x="0"
            y="0"
            viewBox="0 0 511.76 511.76"
            xml:space="preserve"
          >
            <g>
              <path
                d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                fill="#718096"
                data-original="#000000"
              ></path>
            </g>
          </svg>
        </button>
      </section>
    </div>
  </div>
</template>

<script>
// [x] 6. Наличие в состоянии ЗАВИСИМЫХ ДАННЫХ | Критичность: 5+
// [x] 4. Запросы напрямую внутри компонента (???) | Критичность: 5
// [x] 2. При удалении остается подписка на загрузку тикера | Критичность: 5
// [ ] 5. Обработка ошибок API | Критичность: 5
// [x] 3. Количество запросов | Критичность: 4
// [x] 8. При удалении тикера не изменяется localStorage | Критичность: 4
// [x] 1. Одинаковый код в watch | Критичность: 3
// [ ] 9. localStorage и анонимные вкладки | Критичность: 3
// [x] 11. Обновление вкладки со второй страницы приводит к ложному срабатыванию watcher и            page-1 |  Критичность: 3
// [x] 7. График ужасно выглядит если будет много цен | Критичность: 2
// [ ] 10. Магические строки и числа (URL, 5000 миллисекунд задержки, ключ локал стореджа, количество на странице) |  Критичность: 1
// [x] 12. Пустые столбцы в графе при выборе первой валюты после обновления страницы |                Критичность: 1

// Параллельно
// [x] График сломан если везде одинаковые значения
// [x] При удалении тикера остается выбор

import { subscribeToTicker, unsubscribeFromTicker, getCoins } from './api'

const CURRENCY = 'USD'

export default {
  name: 'App',

  data() {
    return {
      ticker: '',
      filter: '',
      selectedTicker: null,
      tickers: [],
      graph: [],
      shortenedGraph: [],
      graphInterval: null,
      page: 1,
      perPage: 6,
      autoCompleteTags: [], //
      isLoading: false, //
      nonExistingCoins: [],
    }
  },

  async created() {
    this.isLoading = true
    const windowData = Object.fromEntries(
      new URL(window.location.toString()).searchParams.entries()
    )

    const VALID_KEYS = ['filter', 'page']
    VALID_KEYS.forEach(key => {
      if (windowData[key]) {
        this[key] = windowData[key]
      }
    })

    const tickersData = localStorage.getItem('cryptonomicon-list')
    if (tickersData) {
      try {
        this.tickers = JSON.parse(tickersData)
        this.tickers.forEach(ticker =>
          subscribeToTicker(
            ticker.name,
            CURRENCY,
            (newPrice, isCoinExist = true) => {
              this.updateTicker(ticker.name, newPrice)
              if (!isCoinExist) {
                this.nonExistingCoins.push(ticker.name)
              }
            }
          )
        )
      } catch {
        localStorage.removeItem(tickersData)
      }
    }

    this.isLoading = false
    this.coinList = Object.values(await getCoins())
  },

  computed: {
    startIndex() {
      return this.perPage * (this.page - 1)
    },

    endIndex() {
      return this.perPage * this.page
    },

    filteredTickers() {
      return this.tickers.filter(ticker =>
        ticker.name.toLowerCase().includes(this.filter.toLowerCase())
      )
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex)
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex
    },

    isDuplicated() {
      return !!this.tickers.find(
        ticker => ticker.name.toLowerCase() === this.ticker.toLowerCase()
      )
    },

    foundedTags() {
      return this.coinList.filter(item =>
        item?.Symbol.toLowerCase().includes(this.ticker.toLowerCase())
      )
    },

    identicalTag() {
      return this.foundedTags.find(
        item => item?.Symbol.toLowerCase() === this.ticker.toLowerCase()
      )
    },

    foundedRestTags() {
      return this.foundedTags.filter(
        item =>
          item.Symbol.toLowerCase() !== this.identicalTag.Symbol.toLowerCase()
      )
    },

    normalizedGraph() {
      const maxValue = Math.max(...this.graph)
      const minValue = Math.min(...this.graph)
      if (maxValue === minValue) {
        return this.graph.map(() => 50)
      }

      return this.graph.map(
        price => 5 + ((price - minValue) * 95) / (maxValue - minValue)
      )
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      }
    },
  },

  methods: {
    updateTicker(tickerName, price) {
      const ticker = this.tickers.find(t => t.name === tickerName)
      if (ticker === this.selectedTicker) {
        this.graph.push(price)
      }
      ticker.price = price
    },

    formatPrice(price) {
      if (price === '-') {
        return price
      }
      return price > 1 ? price.toFixed(2) : price.toPrecision(2)
    },

    saveTickers() {
      localStorage.setItem('cryptonomicon-list', JSON.stringify(this.tickers))
    },

    add() {
      if (this.isDuplicated || this.ticker.length < 2) {
        return
      }

      const currentTicker = {
        name: this.ticker.toUpperCase(),
        price: '-',
      }

      this.tickers = [...this.tickers, currentTicker]

      subscribeToTicker(
        currentTicker.name,
        CURRENCY,
        (newPrice, isCoinExist = true) => {
          this.updateTicker(currentTicker.name, newPrice)
          if (!isCoinExist) {
            this.nonExistingCoins.push(currentTicker.name)
          }
        }
      )

      this.resetTickerInput()
      this.resetFilterInput()
      this.resetAutocompleteTags()
    },

    resetTickerInput() {
      this.ticker = ''
    },

    resetFilterInput() {
      this.filter = ''
    },

    resetAutocompleteTags() {
      this.autoCompleteTags = []
    },

    handleInputChange() {
      this.setAutocomplete()
    },

    handleTagClick(value) {
      this.ticker = value
      this.add(value)
    },

    setAutocomplete() {
      if (this.ticker === '') {
        this.resetAutocompleteTags()
        return
      }

      if (this.identicalTag) {
        this.autoCompleteTags =
          this.foundedTags.length === 1
            ? [this.identicalTag]
            : [this.identicalTag, ...this.foundedRestTags]
      } else {
        this.autoCompleteTags = [...this.foundedTags]
      }
    },

    select(ticker) {
      this.selectedTicker = ticker
    },

    isCoinExist(name) {
      return !this.nonExistingCoins.some(coin => coin === name)
    },

    handleDelete(tickerToRemove) {
      if (tickerToRemove === this.selectedTicker) {
        this.selectedTicker = null
        clearInterval(this.graphInterval)
      }

      this.tickers = this.tickers.filter(t => t !== tickerToRemove)
      unsubscribeFromTicker(tickerToRemove.name)
    },

    runIntervalForGraphData() {
      this.graphInterval = setInterval(this.shortenGraph, 3000)
    },

    shortenGraph() {
      if (this.shortenedGraph.length < 30) {
        // TODO replace magic 50 with const - height of bar if no data provided
        const normalizedBars = this.normalizedGraph.slice(-1)
        normalizedBars.length === 0
          ? this.shortenedGraph.push(50)
          : this.shortenedGraph.push(normalizedBars)
        return
      }
      this.shortenedGraph = [
        ...this.shortenedGraph,
        this.normalizedGraph.slice(-1),
      ].slice(-30)
    },
  },

  watch: {
    selectedTicker() {
      this.graph = []
      this.shortenedGraph = []
      clearInterval(this.graphInterval)
      if (this.selectedTicker) {
        this.runIntervalForGraphData()
      }
    },

    tickers() {
      this.saveTickers()
    },

    paginatedTickers() {
      if (
        this.paginatedTickers.length === 0 &&
        this.page > 1 &&
        !this.isLoading
      ) {
        this.page -= 1
      }
    },

    filter() {
      this.page = 1
    },

    pageStateOptions(value) {
      history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      )
    },
  },
}
</script>
