import Vue from 'vue'
import 'xe-utils'
import VXETable from 'vxe-table'
import VXETablePluginElement from 'vxe-table-plugin-element'
import 'vxe-table-plugin-element/dist/style.css'

export default () => {
  Vue.use(VXETable)
  VXETable.use(VXETablePluginElement)
}
