<template>
  <q-dialog
    v-bind:value="value"
    v-on:input="$emit('input', $event)"
    position="top"
  >
    <q-card
      style="width: 500px"
      class="q-pa-md"
    >
      <slot
        name="content"
      >
      </slot>
      <q-inner-loading
        :showing="userStore && !userStore.is_authenticated"
      >
        <q-icon
          name="warning"
          size="xl"
        />
        <span
          style="font-size: 1.5em"
        >
          {{ label }}
        </span>
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<script>
import { useUserStore } from 'stores/user'

export default {
  name: 'AuthenticatedDialog',

  props: {
    value: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: 'Please login to do this action..'
    }
  },

  emits: ['input'],

  setup () {
    const userStore = useUserStore()

    return {
      userStore
    }
  }

}
</script>
