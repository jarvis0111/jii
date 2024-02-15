import type { ExchangeCurrency, JSONResponse } from '~~/types'

export default function useCurrencies() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getCurrencies,
    getCurrency,
    getAdminCurrencies,
    getAdminCurrency,
    updateCurrency,
    updateCurrenciesStatus,
    updateCurrencyChains,
  }

  async function getCurrencies(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/exchange/currencies`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    if (!response.status) {
      throw response
    }

    return response
  }

  async function getAdminCurrencies(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/exchange/currencies`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    if (!response.status) {
      throw response
    }

    return response
  }

  async function getCurrency(id: number): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/exchange/currencies/${id}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    if (!response.status) {
      throw response
    }

    return response
  }

  async function getAdminCurrency(id: number): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/exchange/currencies/${id}`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    if (!response.status) {
      throw response
    }

    return response
  }

  async function updateCurrency(
    id: number,
    currencyData: ExchangeCurrency,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/exchange/currencies/update/${id}`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          data: currencyData,
        },
      },
    )
    if (!response.status) {
      throw response
    }

    return response
  }

  async function updateCurrencyChains(
    id: number,
    chains: any[],
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/exchange/currencies/update-chains/${id}`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          chains: chains,
        },
      },
    )
    if (!response.status) {
      throw response
    }

    return response
  }

  async function updateCurrenciesStatus(
    ids: number[],
    status: boolean,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/exchange/currencies/update-status`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          ids: ids,
          status: status,
        },
      },
    )
    if (!response.status) {
      throw response
    }

    return response
  }
}
