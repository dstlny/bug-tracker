<template>

  <q-page class="q-pa-md">

      <q-card style="width: 100%; height: 90%">

        <TableComponent
          rowKey="id"
          rowPerPageLabel="Projects per page: "
          selection="multiple"
          :exportFileName="selectedStatus.toLowerCase().replace(' ', '_') + '_projects.csv'"
          :rows="projectStore.filteredProjects"
          :columns="columns"
          :pagination="{ rowsPerPage: 25 }"
          @row-click="projectStore.setCurrentProject"
          @selected="selectedProjects"
        >

           <template v-slot:top>
            <div class="q-table__title">
              Projects ({{ selectedStatus }})
            </div>

            <q-space />

            <q-btn
              label="Add new project"
              type="submit"
              color="primary"
              style="margin-right: 10px;"
              @click="addProject = true"
            />

            <q-select
              v-model="selectedStatus"
              outlined
              dense
              options-dense
              emit-value
              :options="[ 'All', 'External', 'Internal', 'Open', 'Closed', 'Low Priority', 'Medium Priority', 'High Priority', 'With Outstanding Bugs' ]"
              style="min-width: 150px"
            />

            <AuthenticatedDialog
              v-model="addProject"
            >
              <template
                v-slot:content
              >

                <q-form
                  ref="addProjectForm"
                  @submit="onProjectSubmit"
                >

                  <q-input
                    outlined
                    dense
                    options-dense
                    v-model="projectName"
                    label="Name"
                    required
                  />

                  <q-select
                    outlined
                    dense
                    options-dense
                    v-model="projectStatus"
                    :options="statuses"
                    label="Status"
                    style="margin-top: 10px"
                    required
                  />

                  <q-select
                    outlined
                    dense
                    options-dense
                    v-model="projectPriority"
                    :options="priorities"
                    label="Priority"
                    style="margin-top: 10px"
                    required
                  />

                  <q-select
                    outlined
                    dense
                    options-dense
                    v-model="projectClient"
                    :options="projectClients"
                    option-value="id"
                    option-label="name"
                    label="Client"
                    style="margin-top: 10px"
                    required
                  >

                    <template v-slot:after>
                      <q-btn
                        round
                        dense
                        flat
                        icon="add"
                        @click="addClient = true"
                      />
                    </template>

                  </q-select>

                  <div>

                    <q-btn
                      label="Create project"
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
import { defineComponent, onMounted, ref, watch, computed } from 'vue'
import { useProjectStore } from 'stores/project'
import { getStatusColour, getPriorityColour } from 'stores/utils'
import AuthenticatedDialog from 'components/AuthenticatedDialog.vue'
import { useUserStore } from 'stores/user'
import TableComponent from 'src/components/TableComponent.vue'

export default defineComponent({
  name: 'ProjectsIndexPage',
  setup () {
    const projectStore = useProjectStore()
    const userStore = useUserStore()

    const projectClients = computed(() => projectStore.allDistinctClients)
    const selectedStatus = ref('All')
    const addProject = ref(false)
    const addProjectForm = ref(null)
    const projectName = ref(null)
    const projectStatus = ref('Open')
    const projectPriority = ref('High')
    const projectClient = ref(null)
    const addClient = ref(false)
    const addClientForm = ref(null)
    const clientName = ref('Internal')
    const clientIsInternal = ref('Yes')
    const statuses = ref([
      'Open',
      'Closed'
    ])
    const priorities = ref([
      'Low',
      'Medium',
      'High'
    ])

    watch(selectedStatus, (newValue) => {
      projectStore.setFilter(newValue)
    })

    onMounted(async () => {
      if (projectStore.allProjects.length === 0) {
        await projectStore.getProjects()
      }
      if (projectStore.allProjects.length === 1 && projectStore.currentProject && projectStore.allProjects[0].id === projectStore.currentProject.id) {
        await projectStore.getProjects()
      }
      if (projectStore.allClients.length === 0) {
        await projectStore.getClients()
      }
    })

    function onProjectSubmit () {
      addProjectForm.value.validate().then(async (success) => {
        if (success) {
          await projectStore.addProject({
            name: projectName.value,
            status: projectStatus.value,
            priority: projectPriority.value,
            client: projectClient.value
          })
          addProject.value = false
        }
      })
    }

    async function selectedProjects (selectedValues) {
      const selectedProjects = selectedValues.map(selected => selected.id)
      await projectStore.removeProjects({
        ids: selectedProjects
      })
    }

    function onClientSubmit () {
      addClientForm.value.validate().then(async (success) => {
        if (success) {
          const createdClient = await projectStore.addClient({
            name: clientName.value,
            is_internal: clientIsInternal.value
          })
          projectClient.value = createdClient
          addClient.value = false
        }
      })
    }

    return {
      selectedStatus,
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
          field: row => row.bugs ? row.bugs.length : row.bug_count,
          sortable: true
        }
      ],
      statuses,
      priorities,
      projectStore,
      addProject,
      addProjectForm,
      projectStatus,
      projectPriority,
      projectName,
      projectClients,
      projectClient,
      onProjectSubmit,
      addClient,
      addClientForm,
      clientName,
      clientIsInternal,
      onClientSubmit,
      getPriorityColour,
      getStatusColour,
      selectedProjects,
      userStore
    }
  },
  components: {
    AuthenticatedDialog,
    TableComponent
  }
})
</script>
