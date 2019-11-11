<template lang="pug">
  .pt-10.pb-10
    button-group(:btns="buttons1", @groupBtnClick="buttons1Handler")
    edit-table(ref="detailTable", :tableValue="tableValue1", @rowSelection="filterCodeTable")
    button-group.mt-15(:btns="buttons2", @groupBtnClick="buttons2Handler")
    edit-table(ref="codeTable", :tableValue="tableValue2")
</template>

<script>
  import buttonGroup from '@/components/buttonGroup.vue'
  import editTable from '@/components/editTable'

  export default {
    name: 'TradeMachineTaskEditPanel1',
    components: {
      buttonGroup,
      editTable
    },
    inject: {
      parentEdit: 'edit'
    },
    data() {
      return {
        buttons1: [
          { lbl: '新增', type: 'add', icon: 'el-icon-plus', disabled: true },
          { lbl: '复制', type: 'copy', icon: 'el-icon-document-copy', disabled: true },
          { lbl: '删除', type: 'del', icon: 'el-icon-delete', disabled: false }
        ],
        tableValue1: {
          showRowIndex: true,
          showSummary: true,
          tableHeight: '260px',
          tableHead: [
            {
              lbl: '类别', prop: 'mtaskDetailsClass', width: '60px', noedit: true,
              // type: 'ElSelect', list: [{ label: '基料', value: 0 }, { label: '半成品', value: 1 }, { label: '成品', value: 2 }, { label: '余料', value: 3 }, { label: '废料', value: 4 }],
              formatter: ({ cellValue }) => {
                const o = { 0: '基料', 1: '半成品', 2: '成品', 3: '余料', 4: '废料', _: '' }
                return o[cellValue] || ('_' in o ? o._ : cellValue)
              }
            },
            {
              lbl: '工序',
              prop: 'mtaskDetailsProcess',
              width: '70px',
              type: 'basic',
              ddtypeClass: 'mtaskDetailsProcess',
              props: { mtaskDetailsProcess: 'ddName' }
            },
            { lbl: '捆包号', prop: 'goodsCodestr2', noedit: true },
            { lbl: '品名', prop: 'partsnameName', width: '100px', noedit: true },
            { lbl: '规格', prop: 'goodsSpec', width: '140px', noedit: true },
            { lbl: '材质', prop: 'goodsMaterial', width: '100px', noedit: true },
            { lbl: '产地', prop: 'productareaName', width: '90px', noedit: true },
            { lbl: '件支数', prop: 'goodsPartsbranch', noedit: true },
            { lbl: '数量', prop: 'goodsNum', width: '60px', g_type: 'num', summary: true },
            { lbl: '重量', prop: 'goodsWeight', width: '100px', g_type: 'weight', summary: true },
            {
              lbl: '数量单位',
              prop: 'partsnameNumunit',
              width: '70px',
              type: 'basic',
              ddtypeClass: 'partsnameNumunit',
              props: { partsnameNumunit: 'ddName' }
            },
            {
              lbl: '重量单位',
              prop: 'partsnameWeightunit',
              width: '70px',
              type: 'basic',
              ddtypeClass: 'partsnameWeightunit',
              props: { partsnameWeightunit: 'ddName' }
            },
            { lbl: '费用单价', prop: 'goodsBinfeeprice', width: '90px', g_type: 'price', noedit: true },
            { lbl: '费用金额', prop: 'goodsInfeemoney', width: '110px', g_type: 'money', noedit: true },
            { lbl: '长度', prop: 'goodsProperty1', noedit: true },
            { lbl: '米重', prop: 'goodsProperty2', noedit: true },
            { lbl: '重量范围', prop: 'goodsProperty4', noedit: true },
            { lbl: '公差范围', prop: 'goodsProperty5', noedit: true },
            { lbl: '计量方式', prop: 'goodsMetering', width: '70px', noedit: true },
            { lbl: '库区', prop: 'goodsCodestr10', noedit: true },
            { lbl: '库位', prop: 'goodsCodestr1', noedit: true },
            { lbl: '车皮号', prop: 'goodsContractstr2', noedit: true },
            { lbl: '入库批号', prop: 'goodsEntrystr1', noedit: true },
            { lbl: '期货原货主代码', prop: 'goodsEntrystr4', noedit: true },
            { lbl: '期货原货主名称', prop: 'goodsEntrystr5', noedit: true },
            { lbl: '炉批号', prop: 'goodsCodestr3', noedit: true },
            { lbl: '仓储号', prop: 'goodsCodestr4', noedit: true },
            { lbl: '件编号', prop: 'goodsCodestr5', noedit: true },
            { lbl: '预加工时间', prop: 'mtaskDetailsMtime', width: '90px', g_type: 'num' },
            {
              lbl: '加工设备',
              prop: 'equsettingCode',
              width: '80px',
              type: 'equsetting',
              props: { equsettingCode: 'equsettingCode', equsettingName: 'equsettingName' }
            },
            { lbl: '备注', prop: 'mtaskDetailsRemark', width: '160px' },
            { lbl: '销售合同号', prop: 'scontractBillcode', width: '160px', noedit: true }
          ],
          tableData: []
        },
        buttons2: [
          { lbl: '新增', type: 'add', icon: 'el-icon-plus', disabled: false },
          { lbl: '复制', type: 'copy', icon: 'el-icon-document-copy', disabled: false },
          { lbl: '删除', type: 'del', icon: 'el-icon-delete', disabled: false },
          { lbl: '配货销售加工', type: 'sale', icon: 'el-icon-document', disabled: false }
        ],
        tableValue2: {
          showRowIndex: true,
          showSummary: true,
          tableHeight: '260px',
          tableHead: [
            {
              lbl: '类别', prop: 'mtaskDetailsClass', width: '60px',
              type: 'ElSelect', list: [{ label: '成品', value: 2 }, { label: '余料', value: 3 }, { label: '废料', value: 4 }],
              formatter: ({ cellValue }) => {
                const o = { 0: '基料', 1: '半成品', 2: '成品', 3: '余料', 4: '废料', _: '' }
                return o[cellValue] || ('_' in o ? o._ : cellValue)
              }
            },
            {
              lbl: '工序',
              prop: 'mtaskDetailsProcess',
              width: '70px',
              type: 'basic',
              ddtypeClass: 'mtaskDetailsProcess',
              props: { mtaskDetailsProcess: 'ddName' }
            },
            { lbl: '捆包号', prop: 'goodsCodestr2' },
            {
              lbl: '品名',
              prop: 'partsnameName',
              width: '100px',
              type: 'goods',
              props: {
                partsnameName: 'partsnameName',
                pntreeName: 'pntreeName',
                industryCode: 'industryCode',
                goodsPriceun: 'goodsPriceun',
                goodsPiecemode: 'goodsPiecemode',
                goodsWeightmode: 'goodsWeightmode',
                goodsMetering: 'goodsMetering',
                goodsProperty: 'goodsProperty'
              }
            },
            { lbl: '规格', prop: 'goodsSpec', width: '140px', type: 'spec', props: { goodsSpec: 'goodsSpec' } },
            {
              lbl: '材质',
              prop: 'goodsMaterial',
              width: '100px',
              type: 'material',
              props: { goodsMaterial: 'goodsMaterial' }
            },
            {
              lbl: '产地',
              prop: 'productareaName',
              width: '90px',
              type: 'area',
              props: { productareaName: 'productareaName' }
            },
            { lbl: '件支数', prop: 'goodsPartsbranch' },
            { lbl: '数量', prop: 'goodsNum', width: '60px', g_type: 'num', summary: true },
            { lbl: '重量', prop: 'goodsWeight', width: '100px', g_type: 'weight', summary: true },
            {
              lbl: '数量单位',
              prop: 'partsnameNumunit',
              width: '70px',
              type: 'basic',
              ddtypeClass: 'partsnameNumunit',
              props: { partsnameNumunit: 'ddName' }
            },
            {
              lbl: '重量单位',
              prop: 'partsnameWeightunit',
              width: '70px',
              type: 'basic',
              ddtypeClass: 'partsnameWeightunit',
              props: { partsnameWeightunit: 'ddName' }
            },
            { lbl: '长度', prop: 'goodsProperty1' },
            { lbl: '米重', prop: 'goodsProperty2' },
            { lbl: '重量范围', prop: 'goodsProperty4' },
            { lbl: '公差范围', prop: 'goodsProperty5' },
            {
              lbl: '计量方式',
              prop: 'goodsMetering',
              width: '80px',
              type: 'basic',
              ddtypeClass: 'goodsMetering',
              props: { goodsMetering: 'ddName' }
            },
            {
              lbl: '库区',
              prop: 'goodsCodestr10',
              type: 'wareregion',
              props: {
                warehouseCode: 'warehouseCode',
                goodsCodestr10: 'wareplaceWregion',
                goodsCodestr1: 'wareplaceName'
              }
            },
            {
              lbl: '库位',
              prop: 'goodsCodestr1',
              type: 'wareplace',
              warehouseCode: '',
              props: { goodsCodestr1: 'wareplaceName' }
            },
            { lbl: '车皮号', prop: 'goodsContractstr2' },
            { lbl: '入库批号', prop: 'goodsEntrystr1' },
            { lbl: '期货原货主代码', prop: 'goodsEntrystr4' },
            { lbl: '期货原货主名称', prop: 'goodsEntrystr5' },
            { lbl: '炉批号', prop: 'goodsCodestr3' },
            { lbl: '仓储号', prop: 'goodsCodestr4' },
            { lbl: '件编号', prop: 'goodsCodestr5' },
            { lbl: '预加工时间', prop: 'mtaskDetailsMtime', width: '90px' },
            {
              lbl: '加工设备',
              prop: 'equsettingName',
              width: '80px',
              type: 'equsetting',
              props: { equsettingCode: 'equsettingCode', equsettingName: 'equsettingName' }
            },
            { lbl: '备注', prop: 'mtaskDetailsRemark', width: '160px' },
            { lbl: '销售合同号', prop: 'scontractBillcode', width: '160px' }
          ],
          tableData: []
        }
      }
    },
    mounted() {
      this.detailTable = this.$refs.detailTable.$refs.basicEditable
      this.codeTable = this.$refs.codeTable.$refs.basicEditable

      this.codeData = []
    },
    methods: {
      buttons1Handler(type) {
        switch (type) {
          case 'add':
            break
          case 'copy':
            break
          case 'del':
            const row = this.detailTable.getCurrentRow()
            if (!row) {
              this.$message.error('请选择数据!')
              return false
            }
            this.detailTable.remove(row)
            this.detailTable.clearCurrentRow()
            const insertRecords = this.codeTable.getInsertRecords()
            this.codeTable.remove(insertRecords)
            let codeData = this.codeData
            insertRecords.forEach(x=>{
              if (x.mtaskDetailsId){
                x.dataFlag = 2
              }else{
                codeData = codeData.filter(xx=>xx!==x)
              }
            })
            this.codeData = codeData
            // this.codeData = this.codeData.filter(x => x.batchForFilter !== row.batchForFilter || x.mtaskDetailsId)
            this.refresh()
            const n = Object.values(this.detailTable.getRecordset()).reduce((a,b)=>a+b.length,0)
            this.parentEdit.setFieldReadonly(n!==0)
            break
        }
      },
      buttons2Handler(type) {
        let currentRow
        let rec
        switch (type) {
          case 'add':
            const { insertRecords, updateRecords } = this.detailTable.getRecordset()
            const n = insertRecords.length + updateRecords.length
            if (n === 0) {
              this.$message.error('请先增加基料信息!')
              return false
            }

            currentRow = this.detailTable.getCurrentRow()
            if (!currentRow) {
              this.$message.error('请先选择明细!')
              return false
            }

            rec = this.extend(true, currentRow)
            delete rec._XID
            const mtaskDetailsPerbatch = rec.mtaskBillbatch
            rec.mtaskBillbatch = this.getTempBatchStr(0)
            rec.goodsCodebill = ''
            rec.goodsEntrybatch = '' // 批号等重新赋值
            rec.mtaskDetailsClass = 2
            rec.mtaskDetailsProcessno = 1
            rec.mtaskDetailsState = 0
            rec.dataFlag = 0 // 操作标记
            rec.goodsInprice = rec.goodsNewinprice
            rec.goodsInfeeprice = rec.goodsNewinfeeprice
            rec.goodsBinfeeprice = 0
            rec.goodsInfeemoney = 0
            if (this.parentEdit.form.datasMto === 0) {
              // 一对多
              rec.mtaskDetailsPerbatch = mtaskDetailsPerbatch // 上级批号等于选择的批号
              rec.mtaskDetailsPerbatchall = rec.mtaskDetailsPerbatchall + '|' + rec.mtaskBillbatch // 上级批号汇总等于选择基料的批号汇总加自己批号
            } else {
              rec.mtaskDetailsBindersbatch = ''
              rec.mtaskDetailsPerbatch = ''
              rec.mtaskDetailsPerbatchall = ''
              rec.batchForFilter = 'FILTER'
            }
            rec.warehoseCode = this.parentEdit.warehouseCode
            this.codeTable.insertAt(rec, -1).then(({ row }) => this.codeData.push(row))


            break
          case 'copy':
            currentRow = this.codeTable.getCurrentRow()
            if (!currentRow) {
              this.$message.error('请选择数据!')
              return false
            }
            rec = this.extend(true, currentRow)
            delete rec._XID
            rec.mtaskBillbatch = this.getTempBatchStr(0)
            rec.mtaskDetailsState = 0
            rec.goodsBinfeeprice = 0
            rec.goodsInfeemoney = 0
            rec.dataFlag = 0 // 操作标记
            this.codeTable.insertAt(rec, -1).then(({ row }) => this.codeData.push(row))
            break
          case 'del':
            currentRow = this.codeTable.getCurrentRow()
            if (!currentRow) {
              this.$message.error('请选择数据!')
              return false
            }
            this.codeTable.remove(currentRow)
            if (currentRow.mtaskDetailsId) {
              // 标记删除
              currentRow.dataFlag = 2
            } else {
              // 仅删除没有id的数据
              this.codeData = this.codeData.filter(x => x !== currentRow)
            }
            break
          case 'sale':
            break
        }
      },
      /** 重新计算Footer */
      refresh() {
        this.detailTable.updateFooter()
        this.codeTable.updateFooter()
      },
      filterCodeTable(row) {
        if (row) {
          const batchForFilter = row.batchForFilter
          const list = this.codeData.filter(x => x.batchForFilter === batchForFilter)
          this.codeTable.remove(this.codeTable.getInsertRecords())
          this.codeTable.reloadData(list)

          this.parentEdit.rowSelection = [row]
        }
      },
      addCodeTableByParent(row){
        this.codeTable.insertAt(row, -1).then(({ row }) => this.codeData.push(row))
      },
      getRecordSet() {
        const detailData = this.detailTable.getData().map(x => this.extend(true, x))
        const { insertRecords, updateRecords, removeRecords } = this.detailTable.getRecordset()
        insertRecords.forEach(x => detailData.push(this.extend(true, x, { dataFlag: 0, _: true })))
        updateRecords.forEach(x => {
          detailData.filter(xx => xx.mtaskDetailsId === x.mtaskDetailsId).forEach(xx => {
            xx.dataFlag = 1
            xx._ = true
          })
        })
        removeRecords.forEach(x => {
          detailData.filter(xx => xx.mtaskDetailsId === x.mtaskDetailsId).forEach(xx => {
            xx.dataFlag = 2
            xx._ = true
          })
        })

        const codeData = this.codeData.map(x => this.extend(true, x))

        return { detailData, codeData }
      }
    }
  }
</script>

<style scoped>

</style>
