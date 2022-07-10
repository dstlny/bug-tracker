<template>
  <q-page class="q-pa-md">

      <q-card style="width: 100%; height: 90%">

        <TableComponent
          rowKey="id"
          rowPerPageLabel="Clients per page: "
          selection="multiple"
          exportFileName="clients.csv"
          :rows="projectClients"
          :columns="columns"
          :pagination="{ rowsPerPage: 25 }"

          @row-click="projectStore.setCurrentClient"
          @selected="selectedClients"
        >

           <template v-slot:top>
            <div class="q-table__title">
              All Clients
            </div>

            <q-space />

            <q-btn
              label="Add new client"
              type="submit"
              color="primary"
              style="margin-right: 10px;"
              @click="addClient = true"
            />

            <AuthenticatedDialog
              v-model="addClient"
            >
              <template
                v-slot:content
              >

                <q-form
                  ref="addClientForm"
                  @submit="onClientSubmit"
                >

                  <q-input
                    outlined
                    dense
                    v-model="clientName"
                    label="Name"
                    required
                  />

                  <q-select
                    outlined
                    dense
                    options-dense
                    v-model="clientIsInternal"
                    :options="[ { label: 'Yes', value: true }, { label: 'No', value: false }, ]"
                    label="Is internal?"
                    style="margin-top: 10px"
                    required
                  />

                  <div>

                    <q-btn
                      label="Add Client"
                      type="submit"
                      color="primary"
                      class="full-width"
                      style="margin-top: 10px"
                      dense
                    />

                    <q-btn
                      flat
                      label="Cancel"
                      class="full-width"
                      style="margin-top: 10px"
                      dense
                      v-close-popup
                    />

                  </div>
                </q-form>
              </template>
            </AuthenticatedDialog>

          </template>
        </TableComponent>

    </q-card>

  </q-page>
</template>

<script>
import { defineComponent, onMounted, ref, computed } from 'vue'
import { useProjectStore } from 'stores/project'
import AuthenticatedDialog from 'components/AuthenticatedDialog.vue'
import { useUserStore } from 'stores/user'
import TableComponent from 'src/components/TableComponent.vue'

export default defineComponent({
  name: 'ProjectsIndexPage',
  setup () {
    const projectStore = useProjectStore()
    const userStore = useUserStore()

    const projectClients = computed(() => projectStore.allDistinctClients)
    const addClient = ref(false)
    const addClientForm = ref(null)
    const clientName = ref('Internal')
    const clientIsInternal = ref('Yes')

    onMounted(async () => {
      await projectStore.getClients()
    })

    function onClientSubmit () {
      addClientForm.value.validate().then(async (success) => {
        if (success) {
          await projectStore.addClient({
            name: clientName.value,
            is_internal: clientIsInternal.value
          })
          addClient.value = false
        }
      })
    }

    async function selectedClients (selectedValues) {
      const selectedClients = selectedValues.map(selected => selected.id)
      await projectStore.removeClients({
        ids: selectedClients
      })
    }

    return {
      columns: [
        {
          name: 'name',
          align: 'center',
          label: 'Name',
          field: 'name',
          sortable: true
        },
        {
          name: 'is-internal',
          align: 'center',
          label: 'Is Internal?',
          field: 'is_internal',
          sortable: true
        }
      ],
      projectStore,
      projectClients,
      addClient,
      addClientForm,
      clientName,
      clientIsInternal,
      onClientSubmit,
      userStore,
      selectedClients
    }
  },
  components: { AuthenticatedDialog, TableComponent }
})
</script>
