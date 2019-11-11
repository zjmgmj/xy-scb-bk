<template lang="pug">
  .table-box(:id="id", ref="tableBox", :style="'height: 100%'")
    vxe-table(ref="basicEditable",
      size="mini",
      resizable,
      border,
      :loading="loading",
      show-overflow,
      :show-footer="tableValue.showSummary",
      highlight-current-row,
      :data="currentData",
      :footer-method="getSummaries",
      :edit-config="{trigger: 'click', mode: 'cell', showIcon: false, showStatus: true, activeMethod: activeMethod}",
      :edit-rules="tableValue.validRules || null",
      show-all-overflow,
      :height="tableValue.tableHeight ? tableValue.tableHeight : tableHeight",
      @current-change="handleSelectionChange",
      @edit-actived="editActive",
      @edit-closed="cellEdit")
      vxe-table-column(type="radio", width="50", v-if="tableValue.hasCbx", align="center")
      vxe-table-column(type="selection", width="50", v-if="tableValue.selection", align="center")
      vxe-table-column(type="index", width="50", v-if="tableValue.showRowIndex", align="center")
      template(v-for="head in tableValue.tableHead")
        vxe-table-column(
          v-if="head.type === 'ElSelect'",
          show-header-overflow, show-overflow,
          :formatter="head.formatter ? head.formatter : formatter",
          :field="head.prop",
          :width="head.width ? head.width : ''",
          :title="head.lbl",
          :edit-render="head.noedit ? null : {name: 'ElSelect', options: head.list, showIcon: false, autofocus: '.el-input__inner', autoselect: true}",
          :min-width="head.minWidth? head.minWidth : '100'"
        )
        vxe-table-column(
          v-else,
          show-header-overflow, show-overflow,
          :formatter="head.formatter ? head.formatter : formatter",
          :field="head.prop",
          :width="head.width ? head.width : ''",
          :min-width="head.minWidth? head.minWidth : '100'",
          :align="head.align ? head.align : ''",
          :edit-render="head.noedit ? null : {type: 'default', autofocus: '.el-input__inner', autoselect: true}",
          :title="head.lbl")
            template(v-slot:edit="scope")              
              el-date-picker.full-width(v-model="scope.row[head.prop]", type="date", v-if="head.type === 'date'", :placeholder="head.placeholder", size="mini", :value-format="head.format ? head.format : 'yyyy-MM-dd'")
              el-date-picker.full-width(v-model="scope.row[head.prop]", type="month", v-else-if="head.type === 'month'", :placeholder="head.placeholder", size="mini", value-format="yyyy-MM")      
              el-date-picker.full-width(:value="scope.row[head.prop]", type="datetime", v-else-if="head.type === 'datetime'", :placeholder="head.placeholder", size="mini", :format="item.format ? head.format : 'yyyy-MM-dd HH:mm:ss'", :value-format="item.format ? item.format : 'yyyy-MM-dd HH:mm:ss'")
              employee-select(:value="head.valProp ? scope.row[head.valProp] : scope.row[head.prop]", size="mini", :useName="head.useName", v-else-if="head.type==='employee'", @change="selectChange($event, head.props, scope)")
              operator-select(:value="head.valProp ? scope.row[head.valProp] : scope.row[head.prop]", size="mini", :useName="head.useName", v-else-if="head.type==='operator'", @change="selectChange($event, head.props, scope)")
              dept-select(:value="head.valProp ? scope.row[head.valProp] : scope.row[head.prop]", size="mini", :useName="head.useName", v-else-if="head.type==='dept'", @change="selectChange($event, head.props, scope)")
              org-select(:value="head.valProp ? scope.row[head.valProp] : scope.row[head.prop]", size="mini", :useName="head.useName", v-else-if="head.type==='org'", @change="selectChange($event, head.props, scope)")
              company-select(:value="head.valProp ? scope.row[head.valProp] : scope.row[head.prop]", :useName="head.useName", :typeStr="head.typeStr", size="mini", v-else-if="head.type==='company'", @change="selectChange($event, head.props, scope)")
              goods-name-select(:value="head.valProp ? scope.row[head.valProp] : scope.row[head.prop]", :useName="head.useName", size="mini", v-else-if="head.type==='goods'", @change="selectChange($event, head.props, scope)")
              goods-spec-select(:value="head.valProp ? scope.row[head.valProp] : scope.row[head.prop]", size="mini", v-else-if="head.type==='spec'", @change="selectChange($event, head.props, scope)")
              goods-material-select(:value="head.valProp ? scope.row[head.valProp] : scope.row[head.prop]", size="mini", v-else-if="head.type==='material'", @change="selectChange($event, head.props, scope)")
              goods-area-select(:value="head.valProp ? scope.row[head.valProp] : scope.row[head.prop]", :useName="head.useName", size="mini", v-else-if="head.type==='area'", @change="selectChange($event, head.props, scope)")
              goods-warehouse-select(:value="head.valProp ? scope.row[head.valProp] : scope.row[head.prop]", :useName="head.useName", size="mini", v-else-if="head.type==='warehouse'", @change="selectChange($event, head.props, scope)")
              billtype-select(:value="head.valProp ? scope.row[head.valProp] : scope.row[head.prop]", :useName="head.useName", size="mini", v-else-if="head.type==='billtype'", @change="selectChange($event, head.props, scope)")
              partsname-select(:value="head.valProp ? scope.row[head.valProp] : scope.row[head.prop]", :useName="head.useName", size="mini", v-else-if="head.type==='partsname'", @change="selectChange($event, head.props, scope)")
              basic-select(:value="scope.row[head.prop]", :useName="head.useName", :ddtypeClass="head.ddtypeClass", size="mini", v-else-if="head.type==='basic'", @change="selectChange($event, head.props, scope)")
              company-project-select(:value="head.valProp ? scope.row[head.valProp] : scope.row[head.prop]", :companyCode="scope.row['companyCode'] ? scope.row['companyCode'] : ''", :useName="head.useName", size="mini", v-else-if="head.type==='companyProject'", @change="selectChange($event, head.props, scope)")
              feeitem-select(:value="head.valProp ? scope.row[head.valProp] : scope.row[head.prop]", :useName="head.useName", size="mini", v-else-if="head.type==='feeitem'", @change="selectChange($event, head.props, scope)")
              wareplace-select(:value="head.valProp ? scope.row[head.valProp] : scope.row[head.prop]", ddtypeClass="goodsCodestr1", :warehouseCode="scope.row['warehouseCode']", size="mini", v-else-if="head.type==='wareplace'", @change="selectChange($event, head.props, scope)")
              wareplace-select(:value="head.valProp ? scope.row[head.valProp] : scope.row[head.prop]", ddtypeClass="goodsCodestr10", :warehouseCode="scope.row['warehouseCode']", size="mini", v-else-if="head.type==='wareregion'", @change="selectChange($event, head.props, scope)")
              equsetting-select(:value="head.valProp ? scope.row[head.valProp] : scope.row[head.prop]", size="mini", v-else-if="head.type==='equsetting'", @change="selectChange($event, head.props, scope)")
              el-select(
                v-else-if="head.type==='select'",
                v-model="head.valProp ? scope.row[head.valProp] : scope.row[head.prop]",
                @change="selectChange($event, head.props, scope)"
                filterable,
                size="mini")
                el-option(v-for="item in head.list", :key="item[head.selectValue || 'value']", :label="item[head.selectLabel || 'label']", :value="item[head.selectValue || 'value']")
              el-select(
                v-else-if="head.type==='remoteSelect'",
                :value="head.valProp ? scope.row[head.valProp] : scope.row[head.prop]",
                @change="inputChange(scope)"
                filterable,
                remote,
                :remote-method="head.optionProps.remoteMethod",
                size="mini")
                el-option(v-for="item in head.list", :key="item[head.selectValue || 'value']", :label="item[head.selectLabel || 'label']", :value="item[head.selectValue || 'value']")
              el-checkbox(v-model="scope.row[head.prop]", :true-label="head.trueLabel", :false-label="head.falseLabel", v-else-if="head.type==='checkBox'")
              el-input-number.full-width(
                v-else-if="inputType.indexOf(head.g_type) !== -1",
                v-model="scope.row[head.prop]",
                @change="inputChange(scope)",                 
                :min="head.minValue || head.minValue === 0 ? head.minValue : -1000000000000",
                :max="head.maxValue || head.maxValue === 0 ? head.maxValue : 1000000000000",
                size="mini",
                :disabled="head.disabled",
                :controls="false",
                clearable)
              el-input.full-width(
                v-else,                
                ref="input",
                :disabled="head.disabled",
                v-model="scope.row[head.prop]",                
                @change="inputChange(scope)",
                size="mini", clearable)
    pageination(v-if="tableValue.pageShow", :total="total", :pageSize="pageSize", :currentPage="currentPage", @current-change="pgChange")
</template>

<script>
import { mapState } from 'vuex'
import employeeSelect from '@/components/select/employeeSelect'
import operatorSelect from '@/components/select/operatorSelect'
import deptSelect from '@/components/select/deptSelect'
import orgSelect from '@/components/select/orgSelect'
import roleSelect from '@/components/select/roleSelect'
import companySelect from '@/components/select/companySelect'
import goodsNameSelect from '@/components/select/goodsNameSelect'
import goodsSpecSelect from '@/components/select/goodsSpecSelect'
import goodsMaterialSelect from '@/components/select/goodsMaterialSelect'
import goodsAreaSelect from '@/components/select/goodsAreaSelect'
import goodsWarehouseSelect from '@/components/select/goodsWarehouseSelect'
import billtypeSelect from '@/components/select/billtypeSelect'
import partsnameSelect from '@/components/select/partsnameSelect'
import basicSelect from '@/components/select/basicSelect'
import companyProjectSelect from '@/components/select/companyProject'
import feeitemSelect from '@/components/select/feeitemSelect'

import pageination from '@/components/pagination'
export default {
  components: {
    pageination,
    employeeSelect,
    operatorSelect,
    deptSelect,
    orgSelect,
    roleSelect,
    companySelect,
    goodsNameSelect,
    goodsSpecSelect,
    goodsMaterialSelect,
    goodsAreaSelect,
    goodsWarehouseSelect,
    billtypeSelect,
    partsnameSelect,
    basicSelect,
    companyProjectSelect,
    feeitemSelect
  },
  props: {
    id: {
      type: String,
      default: ''
    },
    tableValue: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    currentPage: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 20
    },
    total: {
      type: Number,
      default: 0
    },
    beforeEdit: {
      type: Function,
      default: () => {
        return true
      }
    }
  },
  data() {
    return {
      inputType: ['num', 'weight', 'money', 'price', 'exprice', 'taxrate'],
      pgTotal: 0,
      rowSelection: [],
      priceMoneyComputercolumn: '',
      adjustColumn: '',
      currentData: [],
      tableHead: [],
      tableHeight: '500px'
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
        console.log('------watch')
        // this.currentData = Object.assign([], newVal)
        // this.currentData = newVal
        this.currentData = this.toArray(JSON.parse(JSON.stringify(newVal)))
        this.$refs.basicEditable.updateFooter()
        // this.pgTotal = this.total
      },
      deep: true
    }
  },
  beforeMount() {
    console.log('total:>>', this.total)
    this.pgTotal = this.total
  },
  mounted () {
    this.$nextTick(() => {
      this.priceMoneyComputercolumn = this.getPriceMoneyComputercolumn(this.tableValue.priceMoneyComputerColumn)
      this.adjustColumn = this.getAdjustColumn(this.tableValue.adjustColumn)
      // debugger
      // if (this.id) {
      //   let tableBoxHeight = document.getElementById(this.id).clientHeight
      //   this.tableHeight = this.tableValue.pageination ? tableBoxHeight - 25 + 'px' : tableBoxHeight + 'px'
      //   window.addEventListener('resize', () => {
      //     console.log('clientHeight', document.getElementById(this.id).clientHeight)
      //     tableBoxHeight = document.getElementById(this.id).clientHeight ? document.getElementById(this.id).clientHeight : 0
      //     this.tableHeight = this.tableValue.pageination ? tableBoxHeight - 25 + 'px' : tableBoxHeight + 'px'
      //   })
      // }      
    })
  },
  methods: {
    activeMethod ({row, rowIndex, column, columnIndex}) {
      const isEdit = this.beforeEdit({row, rowIndex, column, columnIndex})
      console.log('isEdit', isEdit)
      return isEdit === false ? isEdit : true
    },
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
            // resValue = this.commafy(cellValue, this.g_format[type])
            resValue = this.commafy(this.toNumber(cellValue), this.g_format[type])
            break
          default:
            resValue = cellValue         
            break
        }        
      }
      const rowHead = this.getRowHead({column})
      if (rowHead.change) rowHead.change({cellValue, row, rowIndex, column, columnIndex})
      return resValue
    },
    getRowHead (scope) {
      const rowHead = this.tableValue.tableHead.find(item => {
        return item.prop === scope.column.property
      })
      return rowHead  
    },
    inputChange (scope) {
      console.log('scope', scope)      
      // debugger
      // this.pricemoneycomputer('grid', scope.row, scope.column.property, this.priceMoneyComputercolumn)
      const rowHead = this.getRowHead(scope)
      if (rowHead.editChange) {
        rowHead.editChange(scope) // 修改的时候触发
      }
      this.$refs.basicEditable.updateStatus(scope)
      this.$refs.basicEditable.updateFooter()
      this.$emit('inputChange', scope)
    },
    editActive ({row,rowIndex,$rowIndex,column,columnIndex,$columnIndex,cell}) {
      this.$emit('editActive', {row,rowIndex,$rowIndex,column,columnIndex,$columnIndex,cell})
    },
    selectChange (e, props, scope) {
      for (const key in props) {
        scope.row[key] = e[props[key]]
        this.pricemoneycomputer('grid', scope.row, key, this.priceMoneyComputercolumn)
      }
      this.$refs.basicEditable.updateStatus(scope)
    },
    cellEdit({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell }, event) {
      console.log('------cellEdit')
      this.pricemoneycomputer('grid', row, column.property, this.priceMoneyComputercolumn)
      this.$emit('rowEditInfo', { row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell, event })
      this.$refs.basicEditable.updateFooter()
    },
    handleSelectionChange(val) {
      this.rowSelection = val.row
      this.$emit('rowSelection', val.row)
    },
    pgChange(val) {
      this.$emit('paginateChange', val)
    },
    getInsertRecords() {
      return this.$refs.basicEditable.getInsertRecords()
    },
    getRemoveRecords() {
      return this.$refs.basicEditable.getRemoveRecords()
    },
    getUpdateRecords() {
      return this.$refs.basicEditable.getUpdateRecords()
    },
    getRef() {
      return this.$refs.basicEditable
    },
    getSummaries ({ columns, data }) {
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
  .table-box{
    box-sizing: border-box;
    position: relative;
  }
</style>
