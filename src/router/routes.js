import { useProjectStore } from 'stores/project'

const getProjectName = () => {
  const projectStore = useProjectStore()

  if (projectStore.currentProject) {
    return `Project: ${projectStore.currentProject.name}`.toLocaleUpperCase()
  }
  if (projectStore.currentClient) {
    return `Client: ${projectStore.currentClient.name}`.toLocaleUpperCase()
  }
}

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'index',
        component: () => import('pages/IndexPage.vue'),
        meta: {
          title: 'Home Page',
          breadcrumbs: [
            {
              text: 'Home Page',
              icon: 'home'
            }
          ]
        }
      }
    ]
  },
  {
    path: '/projects',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'projectsIndex',
        component: () => import('src/pages/ProjectsIndexPage.vue'),
        meta: {
          title: 'Projects Index',
          breadcrumbs: [
            {
              text: 'Home Page',
              name: 'index',
              icon: 'home'
            },
            {
              text: 'Projects Index',
              icon: 'folder'
            }
          ]
        }
      },
      {
        path: '/projects/:projectId(\\d+)/',
        name: 'projectDetail',
        component: () => import('src/pages/ProjectDetailPage.vue'),
        meta: {
          title: 'Project Detail',
          breadcrumbs: [
            {
              text: 'Home Page',
              name: 'index',
              icon: 'home'
            },
            {
              text: 'Projects Index',
              name: 'projectsIndex',
              icon: 'folder'
            },
            {
              text: getProjectName
            }
          ]
        }
      }
    ]
  },

  {
    path: '/clients',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'clientsIndex',
        component: () => import('src/pages/ClientsIndexPage.vue'),
        meta: {
          title: 'Clients Index',
          breadcrumbs: [
            {
              text: 'Home Page',
              name: 'index',
              icon: 'home'
            },
            {
              text: 'Clients Index',
              icon: 'folder'
            }
          ]
        }
      },
      {
        path: '/clients/:clientId(\\d+)/',
        name: 'clientDetail',
        component: () => import('src/pages/ClientDetailPage.vue'),
        meta: {
          title: 'Client Detail',
          breadcrumbs: [
            {
              text: 'Home Page',
              name: 'index',
              icon: 'home'
            },
            {
              text: 'Clients Index',
              name: 'clientsIndex',
              icon: 'folder'
            },
            {
              text: getProjectName
            }
          ]
        }
      }
    ]
  },

  {
    path: '/audit-trails',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'auditTrailsIndex',
        component: () => import('src/pages/AudftTrailIndexPage.vue'),
        meta: {
          title: 'Audit Trail Index',
          breadcrumbs: [
            {
              text: 'Home Page',
              name: 'index',
              icon: 'home'
            },
            {
              text: 'Audit Trail Index',
              icon: 'folder'
            }
          ]
        }
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '/not-found/',
        name: 'notFound',
        component: () => import('pages/ErrorNotFound.vue'),
        meta: {
          title: '404 - Not Found'
        }
      }
    ]
  }
]

export default routes
