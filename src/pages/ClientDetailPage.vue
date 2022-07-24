<template>

  <GenericDetailPage
    :needExtraActions="false"
    :needSubContent="false"
  >

    <template v-slot:actions-label>
      Update Details
    </template>

    <template v-slot:actions-section>
      <q-form
        ref="editClientForm"
        @submit="onClientSubmit"
      >

        <q-input
          outlined
          dense
          v-model="clientName"
          label="Name"
          required

          :disable="!userStore.isAuthenticated"
        />

        <q-select
          outlined
          dense
          options-dense
          v-model="clientIsInternal"
          :options="yesNoOptions"
          label="Is internal?"
          style="margin-top: 10px"
          required

          :disable="!userStore.isAuthenticated"
        />

        <div>

          <q-btn
            label="Update"
            type="submit"
            color="primary"
            class="full-width"
            style="margin-top: 10px"
            dense

            :disable="!userStore.isAuthenticated"
          />

        </div>
      </q-form>
   </template>

   <template v-slot:main-content>

      <q-tabs
        v-model="currentTab"
        dense
        :class="$q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-grey-2 text-black'"
        align="justify"
      >
        <q-tab
          name="projects"
          label="Client Projects"
        />
        <q-tab
          name="audit-trails"
          label="Client Audit Trails"
        />
      </q-tabs>

      <q-tab-panels
        v-model="currentTab"
        animated
      >

        <q-tab-panel
          name="projects"
          v-if="client"
        >

          <TableComponent
            rowKey="id"
            rowPerPageLabel="Projects per page: "
            selection="none"
            exportFileName="client_projects.csv"
            :rows="client.projects"
            :columns="columns"
            :pagination="{ rowsPerPage: 25 }"
            @row-click="projectStore.setCurrentProject"
          />

        </q-tab-panel>

        <q-tab-panel
          name="audit-trails"
          v-if="client"
        >
          <TableComponent
            rowKey="id"
            rowPerPageLabel="Audit Trails per page: "
            selection="none"
            :showTop="false"
            :exportFileName="'client_audit_trails' + client.name  + '.csv'"
            :rows="client.audit_trails"
            :columns="[
              {
                name: 'object_comment',
                align: 'left',
                label: 'Description',
                field: 'object_comment',
                sortable: false
              },
              {
                name: 'date_created',
                align: 'left',
                label: 'Date Recorded',
                sortable: true,
                field: row => row.date_created.toLocaleString(),
                sortable: true,
                sort: (a, b, rowA, rowB) => sortByDate(rowA, rowB, 'date_created')
              }
            ]"
            :pagination="{
              rowsPerPage: 25,
              sortBy: 'date_created',
              descending: true
            }"
          />
        </q-tab-panel>
      </q-tab-panels>

   </template>

  </GenericDetailPage>

</template>

<script>
import { defineComponent, onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from 'stores/project'
import { useUserStore } from 'stores/user'
import { sortByDate } from 'stores/utils'
import { GenericDetailPage, TableComponent } from 'src/components/index.js'

export default defineComponent({

  name: 'ClientDetailPage',

  setup () {
    const route = useRoute()
    const projectStore = useProjectStore()
    const userStore = useUserStore()

    const client = computed(() => projectStore.currentClient)
    const yesNoOptions = ref([{ label: 'Yes', value: true }, { label: 'No', value: false }])
    const editClientForm = ref(null)
    const isLoadingClient = ref(false)
    const clientName = ref(null)
    const clientIsInternal = ref(yesNoOptions.value[0])
    const currentTab = ref('projects')

    onMounted(async () => {
      const clientId = route.params.clientId

      await projectStore.getClients(clientId)

      await Promise.all([
        projectStore.getAuditTrails({
          object_id: clientId,
          object_class: 'Organisation'
        }),
        projectStore.getProjects(null, clientId)
      ]).then(() => {
        isLoadingClient.value = false
        clientName.value = client.value.name
        clientIsInternal.value = client.value.is_internal ? yesNoOptions.value[0] : yesNoOptions.value[1]
      })
    })

    function onClientSubmit () {
      editClientForm.value.validate().then(async (success) => {
        if (success) {
          await Promise.all([
            projectStore.updateClient({
              id: client.value.id,
              name: clientName.value,
              is_internal: clientIsInternal.value?.value
            })
          ]).then(async () => {
            await Promise.all([
              projectStore.getAuditTrails({
                object_id: client.value.id,
                object_class: 'Organisation'
              }),
              projectStore.getProjects(null, client.value.id)
            ])
          })
        }
      })
    }

    return {
      client,
      isLoadingClient,
      clientName,
      clientIsInternal,
      editClientForm,
      currentTab,
      onClientSubmit,
      sortByDate,
      projectStore,
      userStore,
      yesNoOptions,
      columns: [
        {
          name: 'name',
          align: 'center',
          label: 'Name',
          field: 'name',
          sortable: true
        },
        {
          name: 'author',
          align: 'center',
          label: 'Author',
          field: row => row.author.username,
          sortable: true
        },
        {
          name: 'client',
          align: 'center',
          label: 'Client',
          field: row => row.client.name,
          sortable: true
        },
        {
          name: 'status',
          align: 'center',
          label: 'Status',
          field: 'status',
          sortable: true
        },
        {
          name: 'priority',
          align: 'center',
          label: 'Priority',
          field: 'priority',
          sortable: true
        },
        {
          name: 'no-of-bugs',
          align: 'center',
          label: 'No of Bugs',
          field: row => row.bug_count || row.bugs.length,
          sortable: true
        }
      ]
    }
  },

  components: {
    GenericDetailPage,
    TableComponent
  }
})
</script>
