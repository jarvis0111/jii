import type { JSONResponse } from '~~/types'

// Composable to make ecosystem-related tasks easier for admins and users
export default function useEcosystemAdmin() {
  const apiPath = useRuntimeConfig().public.apiPath

  return {
    getEcosystemAnalytics,
  }

  // Admin Wallet Functions

  async function getEcosystemAnalytics(): Promise<JSONResponse> {
    const response = await $fetch(
      `${apiPath}/api/admin/ecosystem/blockchains`,
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
}
