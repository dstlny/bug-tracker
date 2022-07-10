<template>
  <q-page
    class="q-pa-lg row"
  >
    <div
      class="col-3 q-pr-md"
    >
      <q-card
        flat
        bordered
      >
        <q-card-section>
          <div
            class="text-h6"
          >
            <slot name="actions-label">
              Actions
            </slot>
          </div>
        </q-card-section>

        <q-separator
          inset
        />

        <div
          class="q-pa-md"
        >
          <slot name="actions-section"></slot>
        </div>

        <div
          v-if="needExtraActions"
        >
          <q-separator
            inset
          />

          <div
            class="q-pa-md"
          >
            <slot name="extra-actions"></slot>
          </div>
        </div>

      </q-card>

      <q-card
        v-if="needSubContentActions"

        style="margin-top: 10px"
        flat
        bordered
      >
        <q-card-section>
          <div
            class="text-h6"
          >
            <slot name="sub-content-actions-label">
              Extra Actions
            </slot>
          </div>
        </q-card-section>

        <q-separator
          inset
        />

        <div
          class="q-pa-md"
        >
          <slot name="sub-content-actions-section"></slot>
        </div>

      </q-card>

    </div>

    <div class="col-9">
      <q-card
        bordered
       >
        <slot name="main-content"></slot>
      </q-card>

      <q-card
        v-if="needSubContent"

        style="margin-top: 10px"

        flat
        bordered
      >
        <slot name="sub-content"></slot>
      </q-card>
    </div>

  </q-page>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'GenericDetailPage',
  props: {
    needExtraActions: {
      type: Boolean,
      default: false,
      required: false
    },
    needSubContent: {
      type: Boolean,
      default: false,
      required: false
    },
    needSubContentActions: {
      type: Boolean,
      default: false,
      required: false
    }
  }
})
</script>
