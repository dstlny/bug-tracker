<template>
  <q-form
    ref="registerForm"
    @submit="onSubmit"
    @reset="onReset"
    class="q-gutter-md"
  >

    <q-input
      v-model="username"

      filled
      bottom-slots
      label="Username"
      lazy-rules
      dense
    >

      <template v-slot:prepend>
        <q-icon name="person" />
      </template>
    </q-input>

    <q-input
      v-model="password"

      filled
      bottom-slots
      label="Password"
      lazy-rules
      dense
      :type="showPassword ? 'text' : 'password'"
    >

      <template v-slot:prepend>
        <q-icon name="lock" />
      </template>

      <template v-slot:append>
        <q-icon
          :name="showPassword ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="showPassword = !showPassword"
        />
      </template>
    </q-input>

    <div>

      <q-btn
        label="Register"
        type="submit"
        color="primary"
      />
      <q-btn
        label="Reset"
        type="reset"
        color="primary"
        flat
        class="q-ml-sm"
      />

    </div>

  </q-form>
</template>

<script>
import { ref } from 'vue'
import { useUserStore } from 'stores/user'
import { useQuasar } from 'quasar'

export default {
  name: 'RegisterForm',

  setup () {
    const userStore = useUserStore()
    const q = useQuasar()
    const registerForm = ref(null)
    const username = ref(null)
    const password = ref(null)
    const showPassword = ref(false)

    return {
      username,
      password,
      showPassword,
      registerForm,
      onReset () {
        username.value = null
        password.value = null
      },
      async onSubmit () {
        if (userStore.is_authenticated) {
          q.notify({
            message: 'You are already logged in. If you wish you wish to register another account, please logout!',
            type: 'info'
          })
          return
        }

        registerForm.value.validate().then(async success => {
          if (success) {
            await userStore.register(username.value, password.value)
          }
        })
      }
    }
  }

}
</script>
