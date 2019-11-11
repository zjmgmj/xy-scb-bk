<template lang="pug">
  el-dialog(title="公式", :visible="true", width="1200px", @close="close")
    .text-red.text-16
      p 规格设置有2种情况:
      p 第一种直接设置规格:比如规格='5*300*400',规格应设置为gg_=='5*300*400'的式子；
      p 第二种设置规格范围:比如规格系数1从5-10应设置为ggxs1_>=5&&10>ggxs1_,多个规格范围:ggxs1_>=5&&10>ggxs1_,ggxs2_>=300&&500>ggxs2_, ggxs3_>=300&&500>ggxs3_
    .mt-15
      button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")      
      elx-editable.mt-15(ref="editTable", 
        :data.sync="tableValue.tableData", 
        size="mini", 
        border, 
        :showIcon="false",
        :edit-config="{trigger: 'dblclick', mode: 'cell'}", 
        :edit-rules="tableValue.validRules || null", 
        show-all-overflow, 
        highlight-current-row,
        :height="tableValue.tableHeight ? tableValue.tableHeight : '400px'"
        @selection-change="handleSelectionChange", 
        @row-click="_tableSelectRow",
        @blur-active="cellEdit")
        elx-editable-column(type="selection", width="40", v-if="tableValue.hasCbx")
        elx-editable-column(type="index", width="40", v-if="tableValue.showRowIndex")
        template(v-for="column in tableValue.tableHead")        
          elx-editable-column(:prop="column.prop", :width="column.width? column.width : ''", :label="column.lbl", :edit-render="column.noedit ? null : {name: 'ElDatePicker'}", v-if="column.type == 'ElDatePicker'")          
          elx-editable-column(:prop="column.prop", :width="column.width? column.width : ''", :edit-render="{type: 'default', autofocus: true}", :label="column.lbl", v-else-if="column.type == 'select'")
            template(v-slot:edit="{ row }")
              el-select(v-model="row[column.prop]", filterable, remote, :remote-method="column.optionProps.remoteMethod", size="mini")
                el-option(v-for="item in column.list" :key="item[column.optionProps.value]" :label="item[column.optionProps.label]" :value="item[column.optionProps.value]")
          //- elx-editable-column(:prop="column.prop", :width="column.width? column.width : ''", :label="column.lbl", :edit-render="column.noedit ? null : {name: 'ElInputNumber'}", v-else-if="column.type == 'number'")
          elx-editable-column(:prop="column.prop", :width="column.width? column.width : ''", :label="column.lbl", :edit-render="{type: 'default', autofocus: true}", v-else-if="column.type == 'number'")
            template(v-slot:edit="{ row }")
              el-input-number(v-model="row[column.prop]", :min="1", size="mini")
          elx-editable-column(:prop="column.prop", :width="column.width? column.width : ''", :label="column.lbl", :edit-render="column.noedit ? null : {name: 'ElInput'}", v-else)
      .mt-15.text-right
        el-button(type="primary", size="mini", @click="saveFormula") 保存
        el-button(size="mini", @click="close") 关闭
</template>
<script>
import buttonGroup from '~/components/buttonGroup.vue'
// import editTable from '@/components/editTable'
export default {
  components: {
    // editTable,
    buttonGroup
  },
  props: {
    row: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      loading: false,
      buttonGroupInfo: [
          {lbl: '新增', type: 'add', icon: 'el-icon-plus'},
          {lbl: '复制', type: 'copy', icon: 'el-icon-edit'},
          {lbl: '删除', type: 'del', icon: 'el-icon-delete'}
        ],
      tableValue: {
        hasCbx: false,
        pageShow: false,
        showRowIndex: true,
        tableHead: [
          {lbl: '材质', prop: 'goodsMaterial', width: '120px', type: 'select', list: [], optionProps: {value: 'goodsMaterial', label: 'goodsMaterial', remoteMethod: this.materialRemoteMethod}},
          {lbl: '产地', prop: 'productareaName', width: '120px', type: 'select', list: [], optionProps: {value: 'productareaName', label: 'productareaName', remoteMethod: this.productAreaMethod}},
          {lbl: '规格描述', prop: 'partsnameAdjustSpecscope', width: '200px'},
          {lbl: '系数', prop: 'partsnameAdjustWeight', width: '150px', type: 'number'},
          {lbl: '备注', prop: 'partsnameAdjustRemark'}
        ],
        tableData: []
      },
      rowSelection: [],
      initParams: {},
      delRow: []
    }
  },
  beforeMount () {
    this.getMaterialCombo()
    this.getProductArea()
  },
  mounted () {
    this.$nextTick(() => {      
      this.getAdjust()
      this.initParams = {
        memberCode: this.row.memberCode,
        partsnameCode: this.row.partsnameCode,
        goodsProperty1: this.row.goodsProperty1,
        goodsProperty2: this.row.goodsProperty2,
        goodsProperty3: this.row.goodsProperty3,
        goodsProperty4: this.row.goodsProperty4,
        goodsProperty5: this.row.goodsProperty5,
        goodsNumproperty1: this.row.goodsNumproperty1,
        goodsNumproperty2: this.row.goodsNumproperty2
      }
    })    
  },
  methods: {
    materialRemoteMethod (query) {
      this.getMaterialCombo(query)
    },
    productAreaMethod (query) {
      this.getProductArea(query)
    },
    saveFormula() {      
      let adjustStr = []
      let isAdjustWeight = true
      this.tableValue.tableData.map((item) => {
        if (!item.partsnameAdjustWeight) {
          this.$message.error('请输入系数')
          isAdjustWeight = false
          return
        }
        let obj = {}        
        obj = Object.assign(item, this.initParams)
        adjustStr.push(obj)
      })
      if (isAdjustWeight) {
        adjustStr = this.$refs.editTable.getRemoveRecords().concat(adjustStr)
        this.saveAdjust({adjustStr: JSON.stringify(adjustStr)})
      }      
    },
    close() {
      this.$emit('close')
    },
    async saveAdjust (params) {
      try {
        const { data } = await this.proxy(this, 'scscm/app/partsnameAjax!upadteAdjust.do', 'post', params)
        console.log(data)    
        this.$emit('close', 'reload')       
      } catch (e) {
        console.error(e)
      }
    },
    async getMaterialCombo (query = '') {
      try {      
        const params = {
          query: query,
          page: 1,
          start: 0,
          limit: 10
        }
        const { data } = await this.proxy(this, 'scscm/app/goodscodeAjax!queryMaterialCombo.do', 'post', params)        
        this.tableValue.tableHead[0].list = []
        if (data.materialComboList.length > 0) {
          this.tableValue.tableHead[0].list = data.materialComboList
        }        
      } catch (e) {
        console.error(e)
      }
    },
    async getProductArea (query = '') {
      try {
        const params = {
          query: query,
          page: 1,
          start: 0,
          limit: 10
        }
        const { data } = await this.proxy(this, 'scscm/app/productareaAjax!queryCombo.do', 'post', params)        
        this.tableValue.tableHead[1].list = []
        if (data.productareaList.length > 0) {
          this.tableValue.tableHead[1].list = data.productareaList
        }        
      } catch (e) {
        console.error(e)
      }
    },
    async getAdjust () {
      try {
        console.log('row:', this.row)
        const params = {
          partsnameCode: this.row.partsnameCode,
          page: 1,
          start: 0,
          limit: 25
        }
        const { data } = await this.proxy(this, 'scscm/app/partsnameAjax!queryAdjust.do', 'post', params)        
        this.tableValue.tableData = []
        if (data.adjustList.length > 0) {
          this.tableValue.tableData = data.adjustList
        }        
      } catch (e) {
        console.error(e)
      }
    },
    buttonGroupClick(flag) {
      switch(flag) {
        case 'add':
          const addObj = {dataFlag: '', goodsMaterial: '', productareaName: '', partsnameAdjustSpecscope: '', partsnameAdjustWeight: '', partsnameAdjustRemark: ''}
          this.tableValue.tableData.push(addObj)
          this.totalCount ++
          break
        case 'copy':
          if (this.rowSelection.length < 1) {
            this.$message.error('请选择需要复制的数据')
            return false
          }
          console.log('rowSelection', this.rowSelection)
          console.log(this.tableValue.tableData)
          const copyRow = JSON.parse(JSON.stringify(this.rowSelection[0]))
          copyRow.dataFlag = ''
          this.tableValue.tableData.push(copyRow)
          this.totalCount ++
          break
        case 'del':
          if (this.rowSelection.length < 1) {
            this.$message.error('请选择需要删除的数据')
            return false
          }
          this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
            this.rowSelection[0].dataFlag = '2'
            this.$refs.editTable.removeSelecteds()
          })
          break
        default:
          console.error('error')
          break
      }
    },
    handleSelectionChange (row) {      
      this.rowSelection = row
      // console.log('handleSelectionChange', row)
    },
    cellEdit(row, cell, idx, event) {
      console.log('cellEdit', row)
      // this.$emit('rowEditInfo', row)
    }
  }
}
</script>

