<template>
  <q-page class="q-pa-md">

      <q-card style="width: 100%; height: 90%">

       <TableComponent
            rowKey="id"
            rowPerPageLabel="Audit Trails per page: "
            selection="none"
            :showTop="false"
            exportFileName="allAuditTrails.csv"
            :rows="projectStore.allAuditTrails"
            :columns="[
              {
                name: 'object_id',
                align: 'left',
                label: 'ID of object changed',
                field: 'object_id',
                sortable: false
              },
              {
                name: 'object_class',
                align: 'left',
                label: 'Type of change',
                field: 'object_class',
                sortable: false
              },
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

    </q-card>

  </q-page>
</template>

<script>
import { defineComponent, onMounted } from 'vue'
import { useProjectStore } from 'stores/project'
import { sortByDate } from 'stores/utils'
import { TableComponent } from 'src/components/index.js'

export default defineComponent({
  name: 'ProjectsIndexPage',
  setup () {
    const projectStore = useProjectStore()

    onMounted(async () => {
      await projectStore.getAuditTrails({
        object_class: 'All',
        object_id: 0
      })
    })

    return {
      projectStore,
      sortByDate
    }
  },
  components: { TableComponent }
})
</script>
