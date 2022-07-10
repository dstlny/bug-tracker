import { defineStore } from 'pinia'
import { Notify } from 'quasar'

import Models from 'stores/objects'
import { useUserStore } from 'stores/user'

export const needToBeAuthenticated = () => {
  Notify.create({
    message: 'You need to be authenticated to do this action.',
    type: 'info'
  })
}

const notFoundObject = (objectType) => {
  Notify.create({
    message: 'Could not find ' + objectType,
    type: 'negative'
  })
}

const successfulObjectAction = (objectType, actionType) => {
  Notify.create({
    message: 'Successfully ' + actionType + ' ' + objectType + '.',
    type: 'info'
  })
}

export const useProjectStore = defineStore({

  id: 'project',

  state: () => ({

    /** @type {Models.Project} */
    currentProject: null,

    /** @type {Models.Organisation} */
    currentClient: null,

    /** @type {Models.Project[]} */
    allProjects: [],

    /** @type {Models.Client[]} */
    allClients: [],

    /** @type {Models.AuditTrail[]} */
    allAuditTrails: [],

    /** @type {Models.Badge[]} */
    allBadges: [],

    /** @type {'all' | 'closed' | 'open'} */
    filter: 'all'
  }),

  getters: {

    /** @returns {Models.Project} */
    // eslint-disable-next-line
    getCurrentProject: (state) => {
      return state.currentProject
    },

    /** @returns {Models.Project[]} */
    // eslint-disable-next-line
    openProjects(state) {
      return state.allProjects.filter((project) => project.status.toLowerCase() !== 'closed')
    },

    /** @returns {Models.Project[]} */
    // eslint-disable-next-line
    closedProjects(state) {
      return state.allProjects.filter((project) => project.status.toLowerCase() === 'closed')
    },

    /** @returns {Models.Project[]} */
    // eslint-disable-next-line
    internalProjects(state) {
      return state.allProjects.filter((project) => project.is_internal)
    },

    /** @returns {Models.Project[]} */
    // eslint-disable-next-line
    externalProjects(state) {
      return state.allProjects.filter((project) => !project.is_internal)
    },

    /** @returns {Models.Project[]} */
    // eslint-disable-next-line
    projectsWithBugs(state) {
      return state.allProjects.filter((project) => project.bugs.length > 0)
    },

    /** @returns {Models.Project[]} */
    // eslint-disable-next-line
    highPriorityProjects(state) {
      return state.allProjects.filter((project) => project.priority.toLowerCase() === 'high')
    },

    /** @returns {Models.Project[]} */
    // eslint-disable-next-line
    mediumPriorityProjects(state) {
      return state.allProjects.filter((project) => project.priority.toLowerCase() === 'medium')
    },

    /** @returns {Models.Project[]} */
    // eslint-disable-next-line
    lowPriorityProjects(state) {
      return state.allProjects.filter((project) => project.priority.toLowerCase() === 'low')
    },

    /** @returns {Models.Organisation[]} */
    // eslint-disable-next-line
    allDistinctClients(state) {
      return [...new Set(state.allClients)]
    },

    /** @returns {Models.Badge[]} */
    // eslint-disable-next-line
    allDistinctBadges(state) {
      return [...new Set(state.allBadges)]
    },

    /** @returns {Models.Project[]} */
    // eslint-disable-next-line
    filteredProjects(state) {
      switch (this.filter.toLowerCase()) {
        case 'closed':
          return this.closedProjects
        case 'open':
          return this.openProjects
        case 'internal':
          return this.internalProjects
        case 'external':
          return this.externalProjects
        case 'with outstanding bugs':
          return this.projectsWithBugs
        case 'low priority':
          return this.lowPriorityProjects
        case 'medium priority':
          return this.mediumPriorityProjects
        case 'high priority':
          return this.highPriorityProjects

        // return this.allProjects
      }

      return state.allProjects
    },

    /** @returns {(id: number) => Boolean} */
    // eslint-disable-next-line
    hasProjectWithID(state) {
      return (id) => state.allProjects.some(project => project.id === id)
    },

    /** @returns {(id: number) => Boolean} */
    // eslint-disable-next-line
    hasClientWithID(state) {
      return (id) => state.allClients.some(client => client.id === id)
    }

  },

  actions: {

    // eslint-disable-next-line
    async getProjects(projectId, clientId, extraArgs) {

      let url = '/projects/'

      if (projectId) {
        url += '?project_id=' + projectId
      }

      if (clientId) {
        url += '?client_id=' + clientId
      }

      if (extraArgs) {
        url += extraArgs
      }

      const { data } = await this.api.get(url)

      /** @type {Models.Project[]} */
      const allProjectInstances = data.map(entry => new Models.Project(entry))

      if (!clientId) {
        this.$patch((state) => {
          state.currentClient = null
          state.allAuditTrails = []
          state.allProjects = allProjectInstances
          state.hasChanged = true
        })
      } else {
        this.$patch((state) => {
          state.currentProject = null
          state.allAuditTrails = []
          state.currentClient.setProjects({ projects: allProjectInstances })
          state.hasChanged = true
        })
      }

      if (projectId) {
        if (data.length === 0) {
          notFoundObject('project with ID: ' + projectId)
          this.router.replace({
            name: 'notFound'
          })
        }

        projectId = parseInt(projectId)
        this.setCurrentProject(this.allProjects.find(dataEntry => dataEntry.id === projectId))
      }
    },

    // eslint-disable-next-line
    async getClients(id) {

      let url = '/projects/client/'

      if (id) {
        url += '?client_id=' + id
      }

      const { data } = await this.api.get(url)

      this.$patch((state) => {
        if (id) {
          state.currentProject = null
          state.allAuditTrails = []
        }

        state.allClients = data.map(entry => new Models.Organisation(entry))
        state.hasChanged = true
      })

      if (id) {
        if (data.length === 0) {
          notFoundObject('client with ID: ' + id)
          this.router.replace({
            name: 'notFound'
          })
        }

        id = parseInt(id)
        this.setCurrentClient(this.allClients.find(dataEntry => dataEntry.id === id))
      }
    },

    // eslint-disable-next-line
    async getBadges() {
      const { data } = await this.api.get('/projects/badges/')

      this.$patch((state) => {
        state.allBadges = data.map(entry => new Models.Badge(entry))
        state.hasChanged = true
      })
    },

    // eslint-disable-next-line
    async addBadge({ object_id, object_type, label, color }) {

      const userStore = useUserStore()

      if (!userStore.is_authenticated) {
        needToBeAuthenticated()
        return
      }

      const { data } = await this.api.post(
        '/projects/badges/',
        {
          // eslint-disable-next-line
          object_id,
          // eslint-disable-next-line
          object_type,
          label,
          color
        }
      )

      const badge = new Models.Badge(data[0])

      this.$patch((state) => {
        let hasChanged = false

        // eslint-disable-next-line
        if (object_type === 'Project') {
          const badgeExists = state.currentProject.badges.some(currBadge => currBadge.id === badge.id)

          if (!badgeExists) {
            state.currentProject.badges.push(badge)
            hasChanged = true
          }
        } else {
          // eslint-disable-next-line
          const bug = state.currentProject.bug.find(bug => bug.id === object_id)

          if (bug) {
            const badgeExists = bug.badges.some(currBadge => currBadge.id === badge.id)

            if (!badgeExists) {
              bug.badges.push(badge)
              hasChanged = true
            }
          }
        }

        state.hasChanged = hasChanged
      })

      // eslint-disable-next-line
      successfulObjectAction('badge to ' + object_type, 'added')
    },

    // eslint-disable-next-line
    setFilter(filter) {
      this.filter = filter
    },

    // eslint-disable-next-line
    setCurrentProject(project) {
      this.currentProject = project
      if (this.router.currentRoute.value.name !== 'projectDetail') {
        this.router.replace({
          name: 'projectDetail',
          params: {
            projectId: project.id
          }
        })
      }
    },

    // eslint-disable-next-line
    setCurrentClient(client) {
      this.currentClient = client
      if (this.router.currentRoute.value.name !== 'clientDetail') {
        this.router.replace({
          name: 'clientDetail',
          params: {
            clientId: client.id
          }
        })
      }
    },

    // eslint-disable-next-line
    async updateProject({ id, name, status, priority, client, badges }) {

      const userStore = useUserStore()
      if (!userStore.is_authenticated) {
        needToBeAuthenticated()
        return
      }

      const { data } = await this.api.post(
        '/projects/',
        {
          id,
          name,
          status,
          priority,
          client_id: client.id,
          badge_ids: badges.map(badge => badge.id)
        }
      )

      this.$patch((state) => {
        state.currentProject = new Models.Project(data[0])
        state.hasChanged = true
        successfulObjectAction('project', 'updated')
      })
    },

    // eslint-disable-next-line
    async updateBug({ id, content, status, priority, allocatedUserIDS, badges }) {

      const userStore = useUserStore()

      if (!userStore.is_authenticated) {
        needToBeAuthenticated()
        return
      }

      const { data } = await this.api.post(
        '/projects/bug/',
        {
          id,
          content,
          status,
          priority,
          project_id: this.currentProject.id,
          allocated_to_ids: allocatedUserIDS,
          badge_ids: badges.map(badge => badge.id)
        }
      )

      this.$patch((state) => {
        const bugIndex = state.currentProject.bugs.findIndex(bug => bug.id === id)

        state.currentProject.bugs[bugIndex] = new Models.Bug(data)
        state.hasChanged = true
        successfulObjectAction('bug', 'updated')
      })
    },

    // eslint-disable-next-line
    async bulkCloseBugs({ ids }) {
      const userStore = useUserStore()

      if (!userStore.is_authenticated) {
        needToBeAuthenticated()
        return
      }

      await this.api.delete(
        '/projects/bug/',
        {
          data: {
            ids
          }
        }
      )

      this.$patch((state) => {
        for (const bug of state.currentProject.bugs) {
          if (ids.includes(bug.id)) {
            bug.status = 'Closed'
          }
        }

        state.hasChanged = true
        successfulObjectAction('bugs', 'updated')
      })
    },

    // eslint-disable-next-line
    async addBug({ content, status, priority, allocatedUserIDS }) {

      const userStore = useUserStore()

      if (!userStore.is_authenticated) {
        needToBeAuthenticated()
        return
      }

      const { data } = await this.api.post(
        '/projects/bug/',
        {
          content,
          status,
          priority,
          project_id: this.currentProject.id,
          allocated_to_ids: allocatedUserIDS
        }
      )

      this.$patch((state) => {
        state.currentProject.bugs.push(new Models.Bug(data))
        state.hasChanged = true
        successfulObjectAction('bug for project', 'created')
      })
    },

    // eslint-disable-next-line
    async addProject({ name, status, priority, client }) {

      const userStore = useUserStore()

      if (!userStore.is_authenticated) {
        needToBeAuthenticated()
        return
      }

      const { data } = await this.api.post(
        '/projects/',
        {
          name,
          status,
          priority,
          client_id: client.id
        }
      )

      this.$patch((state) => {
        state.allProjects.push(new Models.Project(data[0]))
        state.hasChanged = true
        successfulObjectAction('project', 'created')
      })
    },

    // eslint-disable-next-line
    async removeProjects({ ids }) {

      const userStore = useUserStore()

      if (!userStore.is_authenticated) {
        needToBeAuthenticated()
        return
      }

      await this.api.delete(
        '/projects/',
        {
          data: {
            ids
          }
        }
      )

      this.$patch((state) => {
        state.allProjects = state.allProjects.filter(project => !ids.includes(project.id))

        if (state.currentProject && ids.includes(state.currentProject.id)) {
          state.currentProject = null
        }

        state.hasChanged = true

        successfulObjectAction('projects', 'removed')
      })
    },

    // eslint-disable-next-line
    async removeClients({ ids }) {

      const userStore = useUserStore()

      if (!userStore.is_authenticated) {
        needToBeAuthenticated()
        return
      }

      await this.api.delete(
        '/projects/clients/',
        {
          data: {
            ids
          }
        }
      )

      this.$patch((state) => {
        state.allClients = state.allClients.filter(client => !ids.includes(client.id))

        if (state.currentClient && ids.includes(state.currentClient.id)) {
          state.currentClient = null
        }

        state.hasChanged = true
        successfulObjectAction('clients', 'removed')
      })
    },

    // eslint-disable-next-line
    async addClient({ name, is_internal }) {

      const userStore = useUserStore()

      if (!userStore.is_authenticated) {
        needToBeAuthenticated()
        return
      }

      // eslint-disable-next-line
      const { data } = await this.api.post(
        '/projects/client/',
        {
          name,
          is_internal // eslint-disable-line
        }
      )

      const organisationObject = new Models.Organisation(data)

      this.$patch((state) => {
        const allClientIds = state.allClients.map(client => client.id)

        if (!allClientIds.includes(data.id)) {
          state.allClients.push(organisationObject)
          state.hasChanged = true
          successfulObjectAction('client', 'created')
        } else {
          state.hasChanged = false
        }
      })

      return organisationObject
    },

    // eslint-disable-next-line
    async updateClient({ id, name, is_internal }) {

      const userStore = useUserStore()

      if (!userStore.is_authenticated) {
        needToBeAuthenticated()
        return
      }

      // eslint-disable-next-line
      const { data } = await this.api.post(
        '/projects/client/',
        {
          id,
          name,
          is_internal // eslint-disable-line
        }
      )

      const organisationObject = new Models.Organisation(data)

      this.$patch((state) => {
        const clientIndex = state.allClients.findIndex(client => client.id === organisationObject.id)

        if (clientIndex !== -1) {
          state.allClients[clientIndex] = organisationObject
          state.currentClient = state.allClients[clientIndex]
          state.hasChanged = true
          successfulObjectAction('client', 'updated')
        } else {
          state.hasChanged = false
        }
      })

      return organisationObject
    },

    // eslint-disable-next-line
    async addComment({ content, project, bug }) {

      const userStore = useUserStore()

      if (!userStore.is_authenticated) {
        needToBeAuthenticated()
        return
      }

      let postData = {
        content,
        project_id: project.id
      }

      if (bug) {
        postData = {
          content,
          project_id: project.id,
          bug_id: bug.id
        }
      }

      await this.api.post(
        '/projects/comments/',
        postData
      )

      let url = '/projects/'

      if (project) {
        url += '?project_id=' + project.id
      }

      const { data } = await this.api.get(url)

      this.$patch((state) => {
        state.currentProject = new Models.Project(data[0])
        state.hasChanged = true
        successfulObjectAction('comment', 'posted')
      })
    },

    // eslint-disable-next-line
    async getAuditTrails({ object_id, object_class }) {

      const { data } = await this.api.get(
        '/projects/audit_trails/',
        {
          params: {
            // eslint-disable-next-line
            object_id,
            // eslint-disable-next-line
            object_class
          }
        }
      )

      this.$patch((state) => {
        // eslint-disable-next-line
        switch (object_class) {
          case 'Project':
            state.currentProject.setAuditTrails({ audit_trails: data })
            state.hasChanged = true
            break
          case 'Bug':
            // eslint-disable-next-line
            state.currentProject.setAuditTrailsForBug({ bug_id: object_id, audit_trails: data })
            state.hasChanged = true
            break
          case 'Organisation':
            state.currentClient.setAuditTrails({ audit_trails: data })
            state.hasChanged = true
            break
          case 'All': {
            state.allAuditTrails = data.map(entry => new Models.AuditTrail(entry))
            state.currentClient = null
            state.currentProject = null
            state.hasChanged = true
            break
          }
        }
      })
    },

    // eslint-disable-next-line
    async getBugComments({ id }) {

      const { data } = await this.api.get(
        '/projects/bug/comments/',
        {
          params: {
            // eslint-disable-next-line
            bug_id: id,
          }
        }
      )

      this.$patch((state) => {
        state.currentProject.setCommentsForBug({ bug_id: id, comments: data })
        state.hasChanged = true
      })
    },

    // eslint-disable-next-line
    async getBugThreads({ id }) {

      const { data } = await this.api.get(
        '/projects/bug/threads/',
        {
          params: {
            // eslint-disable-next-line
            bug_id: id,
          }
        }
      )

      this.$patch((state) => {
        state.currentProject.setThreadsForBug({ bug_id: id, threads: data })
        state.hasChanged = true
      })
    },

    // eslint-disable-next-line
    async getThreadReplies({ thread_id, bug_id }) {
      const { data } = await this.api.get(
        '/projects/threads/replies/',
        {
          params: {
            // eslint-disable-next-line
            thread_id
          }
        }
      )

      this.$patch((state) => {
        // eslint-disable-next-line
        if (state.currentProject.threads.some(thread => thread.id === thread_id)) {
          // eslint-disable-next-line
          state.currentProject.setThreadReplies({ thread_id, replies: data })
        } else {
          // eslint-disable-next-line
          state.currentProject.setRepliesForBugThread({ bug_id, thread_id, replies: data })
        }

        state.hasChanged = true
      })
    },

    // eslint-disable-next-line
    async addThread({ content, project, bug }) {

      const userStore = useUserStore()

      if (!userStore.is_authenticated) {
        needToBeAuthenticated()
        return
      }

      let postData = {
        content,
        project_id: project.id
      }

      if (bug) {
        postData = {
          content,
          project_id: project.id,
          bug_id: bug.id
        }
      }

      await this.api.post(
        '/projects/threads/',
        postData
      )

      successfulObjectAction('thread', 'created')
    },

    // eslint-disable-next-line
    async addThreadReply({ content, thread_id }) {

      const userStore = useUserStore()

      if (!userStore.is_authenticated) {
        needToBeAuthenticated()
        return
      }

      await this.api.post(
        '/projects/threads/replies/',
        {
          content,
          // eslint-disable-next-line
          thread_id
        }
      )

      successfulObjectAction('thread reply', 'created')
    }

  }
})
