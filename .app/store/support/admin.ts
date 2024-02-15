import type { JSONResponse, SupportTicket } from '~~/types'
import type { Chat } from '~~/types'

export const useAdminSupportStore = defineStore({
  // unique id of the store across your application
  id: 'adminSupport',

  // a function that returns a fresh state
  state: () => ({
    tickets: [] as SupportTicket[],
    currentTicket: null as SupportTicket | null,
    chat: null as Chat | null,
    loading: false,
  }),

  // optional getters
  getters: {
    ticketCount(state) {
      return state.tickets.length
    },
  },

  // actions/mutations
  actions: {
    async fetchTickets() {
      this.loading = true
      const { getTicketsAdmin } = useSupport()
      const response: JSONResponse = await getTicketsAdmin()
      if (response.status) {
        this.tickets = response.data
      }
      this.loading = false
    },

    async fetchTicket(ticketId: string) {
      const { getTicketAdmin } = useSupport()
      const response: JSONResponse = await getTicketAdmin(ticketId)
      if (response.status) {
        this.currentTicket = response.data
      }
    },

    async fetchChat(ticketId: string) {
      const { getMessages } = useSupport()
      const response: JSONResponse = await getMessages(ticketId)
      if (response.status) {
        this.chat = response.data
      }
    },
  },
})
