<template>
  <div>

    <div
      v-if="showTop"
      class="row q-pa-md"
    >
      <slot name="top"></slot>
    </div>
    <q-table
      square
      flat

      :title="title"
      :row-key="rowKey"
      :rows-per-page-label="rowPerPageLabel"
      :rows="rows"
      :columns="columns"
      :selection="selection"
      :pagination="pagination"
      v-model:selected="selected"

      @row-click="rowClick"
    >

      <template v-slot:top-left>
        <q-btn
          flat
          size="sm"
          dense
          :ripple="false"
          label="CSV"
          icon="file_download"

          @click="exportTable"
        />

        <q-btn
          v-if="selection !== 'none'"
          style="margin-left: 5px"
          flat
          size="sm"
          dense
          :ripple="false"
          :label="selectedLabel"
          :icon="selectedIcon"

          @click="emitSelected"
        />

        <q-btn
          v-if="hasRowSelected"
          style="margin-left: 5px"
          flat
          size="sm"
          dense
          :ripple="false"
          label="UNSELECT"
          icon="deselect"

          @click="emitDeselected"
        />

      </template>

      <template v-slot:top-row>
        <slot name="top-row"></slot>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <div>
            <q-badge
              :color="getStatusColour(props.row.status || '')"
              :label="props.row.status"
            />
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-priority="props">
        <q-td :props="props">
          <div>
            <q-badge
              :color="getPriorityColour(props.row.priority || '')"
              :label="props.row.priority"
            />
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-no-of-bugs="props">
        <q-td :props="props">
          <div>
            <q-badge
              :color="props.value == 0 ? 'blue' : 'red'"
              :label="props.value"
            />
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-client="props">
        <q-td :props="props">
          <div>
            <q-badge
              :color="props.row.is_internal ? 'blue' : 'red'"
              :label="props.value"
            />
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-is-internal="props">
        <q-td :props="props">
          <div>
            <q-badge
              :color="props.row.is_internal ? 'blue' : 'red'"
              :label="props.row.is_internal ? 'Yes' : 'No'"
            />
          </div>
        </q-td>
      </template>

    </q-table>
  </div>
</template>

<script>
import { exportFile } from 'quasar'
import { ref } from 'vue'
import { getStatusColour, getPriorityColour } from 'stores/utils'

function wrapCsvValue (val, formatFn, row) {
  let formatted = formatFn !== void 0
    ? formatFn(val, row)
    : val

  formatted = formatted === void 0 || formatted === null
    ? ''
    : String(formatted)

  formatted = formatted.split('"').join('""')

  return `"${formatted}"`
}

export default {
  name: 'TableComponent',

  props: {
    title: {
      type: String,
      required: false
    },
    rowKey: {
      type: String,
      required: true
    },
    rowPerPageLabel: {
      type: String,
      required: true
    },
    rows: {
      type: Array,
      required: true
    },
    columns: {
      type: Array,
      required: true
    },
    pagination: {
      type: Object,
      required: true
    },
    selection: {
      type: String,
      required: false
    },
    selectionFilter: {
      type: Function,
      required: false,
      default: (item) => item
    },
    showTop: {
      type: Boolean,
      required: false,
      default: true
    },
    exportFileName: {
      type: String,
      required: false
    },
    hasRowSelected: {
      type: Boolean,
      required: false,
      default: false
    },
    statuses: {
      type: Array,
      required: false
    },
    priorities: {
      type: Array,
      required: false
    },
    selectedLabel: {
      type: String,
      required: false,
      default: 'DELETE SELECTED'
    },
    selectedIcon: {
      type: String,
      required: false,
      default: 'delete'
    }
  },

  setup (props, { emit }) {
    const selected = ref([])

    function emitSelected () {
      emit('selected', selected.value.filter(props.selectionFilter))
    }

    function emitDeselected () {
      emit('row-deselected')
    }

    const exportTable = () => {
      // naive encoding to csv format
      const content = [props.columns.map(col => wrapCsvValue(col.label))].concat(
        props.rows.map(row => props.columns.map(col => wrapCsvValue(
          typeof col.field === 'function'
            ? col.field(row)
            : row[col.field === void 0 ? col.name : col.field],
          col.format,
          row
        )).join(','))
      ).join('\r\n')

      exportFile(
        props.exportFileName ? props.exportFileName : 'table-export.csv',
        content,
        'text/csv'
      )
    }

    return {
      selected,
      emitSelected,
      rowClick (event, row, index) {
        emit('row-click', row)
      },
      emitDeselected,
      getStatusColour,
      getPriorityColour,
      exportTable
    }
  }

}
</script>
