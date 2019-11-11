<template lang="pug">
  .table-box(:id="id", ref="tableBox", :style="'height: 100%'")
    vxe-table.elx-table(ref="basicEditable",
      :style="{width: tableWidth}",
      :show-footer="tableValue.showSummary",
      :footer-method="getSummaries"
      :loading="loading",
      :data="currentData",
      :show-header="true",
      :select-config="{checkMethod}"
      size="mini",
      border,
      resizable,
      :height="tableValue.tableHeight ? tableValue.tableHeight : tableHeight",
      highlight-current-row,
      highlight-hover-row,
      @cell-dblclick="rowDbclick",
      @cell-click="selectRow",
      @current-change="currentChange",
      @select-change="selectionChange",
      @select-all="selectAll")
        vxe-table-column(type="radio", width="50", v-if="tableValue.hasCbx", align="center")
        vxe-table-column(type="selection", width="50", v-if="tableValue.selection", align="center")
        vxe-table-column(type="index", width="50", v-if="tableValue.showRowIndex", align="center")
        template(v-for="(head, index) in tableValue.tableHead")
          template(v-if="head.type === 'action'")
            vxe-table-column(
              :align="head.align ? head.align : 'center'"
              :fixed="head.fixed",
              title="操作",
              :width="head.width ? head.width : 'auto'",
              :field="head.prop")
              template(slot-scope="scope")
                .row.tab-row
                  template(v-for="(btn, index) in head.actionBtns", v-if="canShowRowBtn(btn.type, scope, btn.lbl) && scope.row['actionBtns']")
                    .row-button(v-if="scope.row['actionBtns'][index] || btn.lbl", :class="btn.class ? btn.class : 'default'", @click="handerRowBtn(scope.$index, scope.row, btn.type)") {{scope.row['actionBtns'][index] ? scope.row['actionBtns'][index] : btn.lbl}}
                  template(v-else-if="canShowRowBtn(btn.type, scope, btn.lbl)")
                    .row-button(:class="btn.class ? btn.class : 'default'", @click="handerRowBtn(scope.$index, scope.row, btn.type)") {{scope.row.btnLbl ? scope.row.btnLbl : btn.lbl}}
          template(v-else)
            vxe-table-column(show-overflow-tooltip,
              show-header-overflow, show-overflow,
              :align="head.align ? head.align : 'left'"
              :summary="head.summary",
              :formatter="head.formatter ? head.formatter : formatter",
              :field="head.prop",
              :width="head.width ? head.width : ''",
              :min-width="head.minWidth? head.minWidth : '100'",
              :title="head.lbl")
    pageination.page(v-if="tableValue.pageination", :total="total", :pageSize="pageSize", :currentPage="currentPage", @current-change="pgChange")
</template>

<script>
import { mapState } from 'vuex'
import pageination from '@/components/pagination'
export default {
  components: {
    pageination
  },
  props: {
    id: {
      type: String,
      default: 'table-box'
    },
    loading: {
      type: Boolean,
      default: false
    },
    tableValue: {
      type: Object,
      required: true
    },
    currentPage: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 5
    },
    total: {
      type: Number,
      default: 0
    },
    dialogBox: {
      type: Object,
      default: null
    },
    tableDialogFun: {
      type: Function,
      default: function () {
        return true
      }
    },
    selectRowFun: {
      // 选择时执行
      type: Function,
      default: function () {
        return true
      }
    },
    sumsFun: {
      type: Function,
      default: () => {}
    },
    checkMethod: {
      type: Function,
      default: ({row, rowIndex}) => true
    }
  },
  data() {
    return {
      tableWidth: '100%',
      pgTotal: 0,
      dialogConfig: {
        title: '新增',
        show: false,
        labelWidth: '100px'
      },
      rowSelection: [],
      resetDialog: {},
      tableHeight: '500px',
      currentData: []
    }
  },
  computed: {
    ...mapState({
      g_format: state => state.g_format,
      g_decimalP: state => state.g_decimalP
    })
  },
  watch: {
    'tableValue.tableData': {
      handler (newVal, oldVal) {
        // console.log('------watch')
        this.currentData = Object.assign([], newVal)
        // this.pgTotal = this.total
      },
      deep: true
    }
  },
  mounted () {
    this.$nextTick(() => {
      // this.pgTotal = this.total
      this.currentData = Object.assign([], this.tableValue.tableData)
      let tableBoxHeight = document.getElementById(this.id).clientHeight
      this.tableHeight = this.tableValue.pageination ? tableBoxHeight - 25 + 'px' : tableBoxHeight + 'px'
      window.addEventListener('resize', () => {
        console.log('clientHeight', document.getElementById(this.id).clientHeight)
        tableBoxHeight = document.getElementById(this.id).clientHeight ? document.getElementById(this.id).clientHeight : 0
        this.tableHeight = this.tableValue.pageination ? tableBoxHeight - 25 + 'px' : tableBoxHeight + 'px'
      })
    })
  },
  methods: {
    formatter ({cellValue, row, rowIndex, column, columnIndex}) {      
      let resValue = cellValue
      if (column.property) {
        const head = this.tableValue.tableHead.filter(obj => obj.prop === column.property)
        const type = head[0].g_type
        switch(type) {
          case 'dataAudit':
            const obj = { '0': '未审', '1': '已审', '2': '在审', '-1': '弃审' }
            resValue = obj[cellValue]
            break
          case 'num':
          case 'weight':
          case 'price':
          case 'money':
          case 'exprice':
          case 'taxrate':
            resValue = this.commafy(this.toNumber(cellValue), this.g_format[type])
            break
          default:
            resValue = cellValue         
            break
        }        
      }
      return resValue
    },
    currentChange({row,rowIndex,$rowIndex,column,columnIndex,$columnIndex,cell},event) {      
      const isDisabled = cell.parentElement.childNodes[0].getElementsByClassName('is--disabled')
      if (isDisabled.length > 0) {
        return false
      }
      const table = this.$refs.basicEditable
      let resData = [row]
      if (this.tableValue.hasCbx) {        
        table.setRadioRow(row)
      } else if (this.tableValue.selection) {
        // column.type !== 'selection'
        // 清除 row-checked
        const tableNodeArr = this.toArray(table.$el.getElementsByClassName('row-checked'))
        tableNodeArr.forEach(elm => {
          this.addRowClassName(false, elm)
        })
        table.clearSelection()
        if (this.tableValue.checkFilter && this.tableValue.sameOrder === 1) {
          // 同单选择
          const filter = this.tableValue.checkFilter
          const fullData = table.getTableData().fullData
          const filterKeys = Object.keys(filter)
          let filterStr = ''
          filterKeys.forEach(key => {
            filterStr += row[key]
          })
          const filterArr = fullData.filter(item => {
            let itemStr = ''
            filterKeys.forEach(key => {
              itemStr += item[key]
            })
            if (filterStr === itemStr) {
              const idx = table.getRowIndex(item)
              const tableNodeArr = this.toArray(table.$el.getElementsByClassName('vxe-body--row'))
              this.addRowClassName(true, tableNodeArr[idx])
            }
            return filterStr === itemStr
          })
          resData = filterArr
          table.setSelection(filterArr, true)
        } else {
          // resData = [row]
          table.toggleRowSelection(row)
        }
      }
      // 选中
      this.rowSelection = resData
      this.$emit('rowSelection', resData)
    },
    selectAll ({selection, checked}, event) {
      const table = this.$refs.basicEditable
      const tableNodeArr = this.toArray(table.$el.getElementsByClassName('vxe-body--row'))
      tableNodeArr.forEach(elm => {
        this.addRowClassName(checked, elm)
      })
      this.$emit('rowSelection', selection)
    },
    addRowClassName (checked, node) {
      if (checked) {
        // 添加选中后className
        node.className += ' row-checked'
      } else {
        // 清除选中className
        const pathArr = node.className.split(' ')
        const idx = pathArr.indexOf('row-checked')
        this.$refs.basicEditable.clearCurrentRow()
        if (idx !== -1) {
          pathArr.splice(idx, 1)
          node.className = pathArr.join(' ')
        }
      }
    },
    selectionChange ({selection,checked,row,rowIndex,$rowIndex,column,columnIndex,$columnIndex,cell},event) {
      // console.log('----selectionChange')
      this.addRowClassName(checked, event.path[4])
      this.rowSelection = selection
      this.$emit('rowSelection', selection)
    },
    pgChange(val) {
      // 翻页
      this.$emit('paginateChange', val)
    },
    selectRow ({ row, rowIndex, column, columnIndex }, event) {
      // const res = []
      this.$emit('cellClick', { row, rowIndex, column, columnIndex, event })
      // console.log('-------selectRow')
    },
    handerRowBtn (idx, row, btnType) {
      row.idx = idx
      this.isVerify = true
      if (this.isVerify) {
        this.$emit(`tableRow${btnType.substring(0, 1).toUpperCase()}${btnType.substring(1)}`, row)
      }
    },
    canShowRowBtn (type, scope, lbl) {
      const result = true
      let condition = true
      // if (this.currentUser.id !== 1) {
      //   let idx = this.currentUser.auths.findIndex(itm => this.$route.path.startsWith(itm.fkMenu.pageUrl))
      //   const currentAuth = this.currentUser.auths[idx]
      //   if (type === 'edit' && currentAuth.hasUpdate === 0) result = false
      //   if (type === 'delete' && currentAuth.hasDelete === 0) result = false
      // }
      condition = !((scope.row.mainStatus === 1 || scope.row.mainAcct === 1 || scope.row.del === false) && lbl === '删除')
      return result && condition
    },
    rowDbclick ({row, rowIndex, column, columnIndex}, event) {
      const obj = {
        row: row,
        column: column,
        event: event
      }
      this.$emit('row-dbclick', obj)
    },
    getSummaries (params) {
      const { columns, data } = params
      const that = this
      const head = that.tableValue.tableHead
      const a = columns.length - head.length
      return [
        columns.map((column, index) => {
          if (index === 0) {
            return that.tableValue.sumText ? that.tableValue.sumText : '合计'
          }
          const headColumn = head[index - a]
          if (index > a && headColumn.summary) {
            return this.commafy(this.sum(data, headColumn.prop), headColumn.g_type ? this.g_format[headColumn.g_type] : {})
          }
          return null
        })
      ]
    }
  }
}
</script>
<style lang="stylus" scoped>
.row{
  align-items: center;
}
.row-button{
  padding: 0 3px;
  margin: 0 2px;
  cursor: pointer;
}
.tab-row{
  justify-content: space-around;
}
.table-box{
  box-sizing: border-box;
  position: relative;
}
.elx-table{
  width: 100%;
}
/deep/.elx-table.vxe-table .vxe-body--row.row-checked {
  background: #e6f7ff!important
}
.page{
  /* position: absolute;
  bottom: 0; */
  width: 100%;
}
</style>
