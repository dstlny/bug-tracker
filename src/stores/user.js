import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import Models from 'stores/objects'

export const useUserStore = defineStore({

  id: 'user',

  state: () => ({
    id: 0,
    username: null,
    is_authenticated: false,

    /** @type {Models.Users[]} */
    all_users: []
  }),

  getters: {

    getUser: (state) => {
      return new Models.User({
        id: state.id,
        username: state.username
      })
    },

    isAuthenticated: (state) => state.is_authenticated,

    allUsers: (state) => [...new Set(state.all_users)]

  },

  actions: {

    // eslint-disable-next-line
    async getUsers() {

      const { data } = await this.api.get('/auth/users/')

      this.$patch((state) => {
        state.all_users = data.map(entry => new Models.User(entry))
        state.hasChanged = true
      })
    },

    // eslint-disable-next-line
    async login(username, password) {

      let args = {}
      if (username && password) {
        args = {
          username,
          password
        }
      }

      const { data } = await this.api.post(
        '/auth/login/',
        args
      )

      if (data.is_authenticated) {
        this.$patch(data)
      } else {
        Notify.create({
          type: 'negative',
          message: `${data.message}`
        })
      }
    },

    // eslint-disable-next-line
    async register(username, password) {

      const { data } = await this.api.post(
        '/auth/register/',
        {
          username,
          password
        }
      )

      if (data.is_authenticated) {
        this.$patch(data)
      } else {
        Notify.create({
          type: 'negative',
          message: `${data.message}`
        })
      }
    },

    // eslint-disable-next-line
    async logout() {
      this.$patch({
        id: null,
        username: null,
        is_authenticated: false
      })

      await this.api.post(
        '/auth/logout/',
        {
        }
      )
    }
  }

})
