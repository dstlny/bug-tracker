<template>
  <q-page class="flex flex-center">

      <q-card style="width: 50%">
        <q-tabs
          v-model="selectedTab"
          inline-label
          align="justify"
        >
          <q-tab
            icon="person"
            label="Login"
            name="login"
          />
          <q-tab
            icon="person_add"
            label="Register"
            name="register"
          />
        </q-tabs>

        <q-tab-panels
          v-model="selectedTab"
          animated
        >

          <q-tab-panel name="login">
            <LoginForm />
          </q-tab-panel>

          <q-tab-panel name="register">
            <RegisterForm />
          </q-tab-panel>

        </q-tab-panels>

      </q-card>

  </q-page>
</template>

<script>
import { defineComponent, watch, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LoginForm from 'components/LoginForm.vue'
import RegisterForm from 'components/RegisterForm.vue'

export default defineComponent({
  name: 'IndexPage',

  components: {
    LoginForm,
    RegisterForm
  },

  setup () {
    const $route = useRoute()
    const $router = useRouter()
    const selectedTab = ref($route.hash.split('#')[1] || 'login')

    watch(
      selectedTab, (newValue) => {
        if ($route.hash !== newValue) {
          $router.replace({ ...$route, hash: `#${newValue}` })
        }
      }
    )

    return {
      selectedTab
    }
  }
})
</script>
