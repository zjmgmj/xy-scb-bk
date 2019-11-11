<template lang="pug">
.content
  .up
    button-group(:btns="detailTable.buttonGroupInfo", @groupBtnClick="detailBtnClick")
    .table-content(:style="{height: detailHeight}")
      edit-table(
        v-if="detailHeight",
        :id="detailTable.id",
        :ref="detailTable.ref",
        :loading="detailTable.loading",
        :tableValue="detailTable.tableValue",
        :beforeEdit="beforeDetailEdit",
        @rowSelection="detailSelection")
  button-group(:btns="codeTable.buttonGroupInfo", @groupBtnClick="codeBtnClick")
  .down(:style="{height: codeHeight}")
    edit-table(
      v-if="codeHeight",
      :id="codeTable.id",
      :ref="codeTable.ref",
      :beforeEdit="beforeCodeEdit",
      :loading="codeTable.loading",
      :tableValue="codeTable.tableValue",
      @inputChange="codeChange",
      @rowSelection="codeSelection")
</template>
<script>
import buttonGroup from '@/components/buttonGroup.vue'
import editTable from '@/components/editTable'
export default {
  components: {
    editTable,
    buttonGroup
  },
  props: {
    thisDialog: {
      type: Object,
      default: () => {
        return {}
      }
    },
    elTable: {
      type: Boolean,
      default: false
    },
    detailConfig: {
      type: Object,
      default: () => {
        return {}
      }
    },
    codeConfig: {
      type: Object,
      default: () => {
        return {}
      }
    },
    beforeDetailEdit: {
      type: Function,
      default: () => {
        return true
      }
    },
    beforeCodeEdit: {
      type: Function,
      default: () => {
        return true
      }
    }
  },  
  data () {
    return {
      detailHeight: '',
      codeHeight: '',
      detailList: [],
      codeList: [],
      detailTable: null,
      codeTable: null,
      codeObj: {}   
    }
  },
  watch: {
    'detailConfig.tableValue.tableData': {
      handler () {
        this.detailTable.tableValue.tableData = this.extend(true, this.detailConfig.tableValue.tableData)
        this.detailTable.loading = this.detailConfig.loading
        this.$refs[this.detailTable.ref].$nextTick(() => {
          const detailTable = this.$refs[this.detailTable.ref].$refs.basicEditable
          const rowSelection = detailTable.getTableData().fullData[0]
          detailTable.setCurrentRow(rowSelection)
          this.detailSelection(rowSelection)
        })
      },
      deep: true
    },
    'codeConfig.tableValue.tableData': {
      handler () {
        this.codeTable.tableValue.tableData = this.extend(true, this.codeConfig.tableValue.tableData)
        // this.codeList = this.toArray(this.extend(true, this.codeConfig.tableValue.tableData))
        this.codeTable.loading = this.codeConfig.loading
        this.initCode(this.codeTable.tableValue.tableData)
      },
      deep: true
    }
  },  
  created () {
    this.detailTable = this.extend(true, this.detailConfig)
    this.codeTable = this.extend(true, this.codeConfig)    
  },
  mounted () {
    this.$nextTick(() => {
      this.getHeight()      
      window.addEventListener('resize', () => {
        this.getHeight()
      })      
    })
  },
  methods: {
    getHeight () {
      const thisDialog = this.thisDialog.$refs
      const heightDialog = thisDialog.dialog.$el.clientHeight
      const formHeight = thisDialog.form.$el.clientHeight      
      let head = 34      
      if (this.elTable) {
        head += 59
      }
      const btnHeight = 110   
      const tableHeight = heightDialog - formHeight - head - btnHeight - 20
      const detailHeight = tableHeight * 0.6
      this.detailHeight = detailHeight + 'px'
      this.codeHeight = tableHeight - detailHeight + 'px'
      this.detailTable.tableValue.tableHeight = this.detailHeight
      this.codeTable.tableValue.tableHeight = this.codeHeight
    },
    // topSelectionChange (row) {
    //   this.$emit('rowSelection', row)
    // },
    detailBtnClick (type) {
      this.$emit('detailBtnClick', type)
    },
    detailSelection (row) { // 明细切换
      const relationBatch = this.detailTable.relationBatch
      let codeList = []
      if (this.codeObj[row[relationBatch]]) {
        codeList = this.codeObj[row[relationBatch]].filter(item => {
          return item.dataFlag !== 2
        })        
      } 
      this.$refs[this.codeTable.ref].$refs.basicEditable.reloadData(codeList)
      this.$emit('detailRowSelection', row)
    },
    codeSelection (row) {
      this.$emit('codeRowSelection', row)
    },
    codeChange (scope) {
      // 回写明细
      debugger
      const detailTable = this.$refs[this.detailTable.ref].$refs.basicEditable
      const codeTable = this.$refs[this.codeTable.ref].$refs.basicEditable
      const key = scope.column.property
      const currentRow = detailTable.getCurrentRow()      
      const scontractBillbatch = currentRow.scontractBillbatch      
      this.codeObj[scontractBillbatch] = codeTable.getTableData().fullData
      currentRow[key] = this.getColumnSum(key, codeTable)      
      const column = detailTable.getColumnByField(key)
      detailTable.updateStatus({ currentRow, column })
      detailTable.updateFooter()
    },
    getSumObj(codeKey, codeRow = null) {
      const obj = {}      
      if (codeRow === null) {
        const codeTable = this.$refs[this.codeTable.ref].$refs.basicEditable
        codeRow = codeTable.getTableData().fullData 
      }
      codeRow.map(item => {
        codeKey.forEach(key => {
          if (!obj[key]) obj[key] = []
          obj[key].push(item[key])      
        })
      })
      return obj
    },
    recDetailTable(codeTable, relationBatchList) {
      // 回写明细
      const detailTable = this.$refs[this.detailTable.ref].$refs.basicEditable
      const detailSumProp = []      
      const relationBatch = this.detailTable.relationBatch
      const fullData = detailTable.getTableData().fullData
      const backColParam = this.codeConfig.backColParam
      const codeKey = Object.keys(backColParam)
      if (backColParam) {
        if (relationBatchList) {
          relationBatchList.forEach(batch => {
            const row = fullData.find(item => {return item[relationBatch] === batch})
            const codeSumObj = this.getSumObj(codeKey, this.codeObj[batch])
            codeKey.forEach(key => {
              row[backColParam[key]] = this.sum(codeSumObj[key])
              const column = detailTable.getColumnByField(backColParam[key])
              if (column) detailTable.updateStatus({ row, column })          
            })
          }) 
        } else {
          const row = detailTable.getCurrentRow()  
          const codeSumObj = this.getSumObj(codeKey)
          codeKey.forEach(key => {
            row[backColParam[key]] = this.sum(codeSumObj[key])
            const column = detailTable.getColumnByField(backColParam[key])
            if (column) detailTable.updateStatus({ row, column })          
          })
        }
      } else {
        const row = detailTable.getCurrentRow()
        this.detailTable.tableValue.tableHead.map(item => {
          if (item.summary) {
            detailSumProp.push(item.prop)
          }
        })
        detailSumProp.forEach(key => {
          row[key] = this.getColumnSum(key, codeTable)
          const column = detailTable.getColumnByField(key)
          if (column) detailTable.updateStatus({ row, column })
        })
      }
      detailTable.updateFooter()
    },
    detailInsertAt (insertList) {
      const detailTable = this.$refs[this.detailTable.ref].$refs.basicEditable
      detailTable.insertAt(insertList, -1)
      detailTable.updateFooter()
      const newfullData = detailTable.getTableData().fullData
      const rowSelection = newfullData[newfullData.length - 1]
      detailTable.setCurrentRow(rowSelection)        
      this.detailSelection(rowSelection)   
    },
    codeInsertAt (list) { // 新增码单
      const codeTable = this.$refs[this.codeTable.ref].$refs.basicEditable      
      const relationBatchList = []   
      // const detailTable = this.$refs[this.detailTable.ref].$refs.basicEditable
      const relationBatch = this.detailTable.relationBatch
      // const currentRow = detailTable.getCurrentRow()
      const insertList = []
      list.map(item => {
        if (!this.codeObj[item[relationBatch]]) {
          this.codeObj[item[relationBatch]] = []
        }
        relationBatchList.push(item[relationBatch])
        // if (item[relationBatch] === currentRow[relationBatch]) insertList.push(item)
        insertList.push(item)
        this.codeObj[item[relationBatch]].push(item)
      })
      codeTable.insertAt(insertList, -1)
      // this.codeList.push(...list)
      codeTable.updateFooter()
      // 回写明细
      this.recDetailTable(codeTable, relationBatchList)
      // 默认选中码单最后一条数据
      const newfullData = codeTable.getTableData().fullData
      const rowSelection = newfullData[newfullData.length - 1]
      codeTable.setCurrentRow(rowSelection)
      this.codeSelection(rowSelection)
    },
    codeRemove (row) {
      const codeTable = this.$refs[this.codeTable.ref].$refs.basicEditable
      const relationBatch = this.detailTable.relationBatch
      // const idx = this.codeList.indexOf(row)
      // if (row.dataFlag === 1) {
      //   row.dataFlag = 2
      // } else {
      //   this.codeList.splice(idx, 1)
      // }     
      const idx = this.codeObj[row[relationBatch]].indexOf(row)
      if (row.dataFlag === 1) {
        row.dataFlag = 2
      } else {        
        this.codeObj[row[relationBatch]].splice(idx, 1)
      }
      codeTable.remove(row)
      codeTable.updateFooter()
      this.recDetailTable(codeTable)
      const codeLength = codeTable.getTableData().fullData.length - 1
      const codeLastRow = codeTable.getTableData().fullData[codeLength]
      codeTable.setCurrentRow(codeLastRow)
      this.codeSelection(codeLastRow)
    },
    detailRemove (row) {      
      const detailTable = this.$refs[this.detailTable.ref].$refs.basicEditable
      const codeTable = this.$refs[this.codeTable.ref].$refs.basicEditable      
      const relationBatch = this.detailTable.relationBatch
      debugger
      const codeFullData = codeTable.getTableData().fullData
      const codeRowList = this.codeObj[row[relationBatch]]
      if (codeRowList) {
        codeRowList.map((item, index) => {
          if (item.dataFlag === 1) {
            item.dataFlag = 2
          } else {        
            this.codeObj[row[relationBatch]].splice(index, 1)
          }
        })
      }      
      codeTable.remove(codeFullData)
      codeTable.updateFooter()      
      detailTable.remove(row)
      detailTable.updateFooter()
      if (detailTable.getTableData().fullData.length > 0) {
        const detailLastRow = detailTable.getTableData().fullData[detailTable.getTableData().fullData.length - 1]
        detailTable.setCurrentRow(detailLastRow)
        this.detailSelection(detailLastRow)
      } else {
        this.$emit('detailRowSelection')
      }      
      // this.topSelectionChange(detailFirstRow)
    },
    codeBtnClick (type) {
      this.$emit('codeBtnClick', type)
    },
    initCode (data) {
      const relationBatch = this.detailTable.relationBatch
      this.toArray(data).map(item => {
        if (!this.codeObj[item[relationBatch]]) this.codeObj[item[relationBatch]] = []
        this.codeObj[item[relationBatch]].push(this.extend(true, item))
      })      
    }
  }
}
</script>