<template>
  <q-layout view="hHh lpr lff">
    <q-header elevated>
      <q-toolbar
        :class="$q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-grey-2 text-black'"
      >
        <q-toolbar-title>
         <router-link
            :is-active="false"
            :to="{ name: 'index' }"
            style="text-decoration: none!important; color: #FFF!important;"
            :style="{ color: $q.dark.isActive ? '#FFF!important' : '#000!important'}"
          >
             Bug Tracker
          </router-link>
        </q-toolbar-title>

        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          :color="$q.dark.isActive ? 'white' : 'black'"
          @click="toggleRightDrawer"
        />

      </q-toolbar>

      <q-tabs
        :class="$q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-grey-2 text-black'"
        align="left"
      >

        <q-route-tab
          :to="{ 'name': 'projectsIndex' }"
          label="Projects"
        />

        <q-route-tab
          :to="{ 'name': 'clientsIndex' }"
          label="Clients"
        />

        <q-route-tab
          :to="{ 'name': 'auditTrailsIndex' }"
          label="Audit Trails"
        />

      </q-tabs>

      <q-toolbar
        :class="$q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-grey-2 text-black'"
      >
        <q-breadcrumbs>
          <q-breadcrumbs-el
            v-for="item in route.meta.breadcrumbs"

            exact
            class='text-sm'

            :to="{ name: item.name, params: { ...getRouteParams(item.name)}}"
            :disabled="item.disabled"
            :key="typeof item.text == 'function' ? item.text() : item.text"

            :icon="item.icon"
            :label="typeof item.text == 'function' ? item.text() : item.text.toLocaleUpperCase()"
          />

        </q-breadcrumbs>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="rightDrawerOpen"
      side="right"
      overlay
      behavior="desktop"
      bordered
    >

      <q-list
        v-if="userStore.isAuthenticated"
      >
        <q-item-label
          header
        >
          Logged in as {{ userStore.username }}
        </q-item-label>
        <q-item
          @click="logout"
          clickable
          v-ripple
        >
          <q-item-section>Logout</q-item-section>
        </q-item>
      </q-list>
      <q-list
        v-else
      >

        <q-item
          :to="{
            name: 'index',
            hash: '#login'
          }"
          clickable
          v-ripple
        >
          <q-item-section>Login</q-item-section>
        </q-item>

        <q-item
          :to="{
            name: 'index',
            hash: '#register'
          }"
          clickable
          v-ripple
        >
          <q-item-section>Register</q-item-section>
        </q-item>

      </q-list>

      <q-separator />

      <q-list>
        <q-item-label
          header
        >
          Settings
        </q-item-label>

        <q-item tag="label" v-ripple>
          <q-item-section side top>
            <q-checkbox
              v-model="darkModeActive"
              @toggle="toggleDarkMode"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label>Dark Mode</q-item-label>
            <q-item-label caption>
              {{ darkModeActive ? 'Deactivate' : 'Activate' }} Dark Mode
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
/* eslint-disable */

import { watch, defineComponent, ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useUserStore } from 'stores/user'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'MainLayout',

  setup () {
    const $q = useQuasar()
    const route = useRoute()
    const userStore = useUserStore()

    const rightDrawerOpen = ref(false)
    const darkModeActive = ref($q.dark.isActive)
    let params = ref(Object.create(null))

    const getRouteParams = computed(() => function (routeName) {
      return params[routeName]
    })
    const generateParamsForBreadcrumbs = () => {
      params = Object.create(null)
      for (var i = 0; i < route.meta.breadcrumbs.length; i++) {
        const crumb = route.meta.breadcrumbs[i]
        if (crumb.params) {
          params[crumb.name] = Object.create(null)
          for (const param of crumb.params) {
            params[crumb.name][param] = route.params[param]
          }
        }
      }
    }

    watch(darkModeActive, (value) => {
      $q.dark.set(value)
    })

    watch(route, (newValue, oldValue) => {
      if (newValue.name !== oldValue.name) {
          generateParamsForBreadcrumbs()
        }
      }
    )

    return {
      params,
      darkModeActive,
      rightDrawerOpen,
      toggleRightDrawer () {
        rightDrawerOpen.value = !rightDrawerOpen.value
      },
      toggleDarkMode () {
        darkModeActive.value = !darkModeActive.value
      },
      async logout () {
        await userStore.logout()
      },
      userStore,
      generateParamsForBreadcrumbs,
      getRouteParams,
      route
    }
  }
})
</script>
