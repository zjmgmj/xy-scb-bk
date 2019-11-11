<template lang="pug">
.content
  el-form(ref="dialogForm", :model="form", :rules="rules", label-width="90px")
    el-row
      el-col(:span="8")
        el-form-item(label="项目名称", prop="feeitemName")
          el-input.full-width(v-model="form.feeitemName", clearable, size="mini")
      el-col(:span="8")
        el-form-item(label="仓库")
          el-select.full-width(v-model="form.warehouseCode", remote, filterable, :remote-method="getWarehouse", size="mini", placeholder="")
            el-option(v-for="item in warehouseList", :key="item.warehouseCode", :label="item.warehouseName", :value="item.warehouseCode")                    
      el-col(:span="8")
        el-form-item(label="库位类型")
          el-select.full-width(v-model="form.warehouseCtype", remote, filterable, :remote-method="getWarehouseCtype", size="mini", placeholder="")
            el-option(v-for="item in warehouseCtypeList", :key="item.ddName", :label="item.ddName", :value="item.ddName")
    el-row
      el-col(:span="8")
        el-form-item(label="结算方式")
          el-select.full-width(v-model="form.ddTypeSettlement", size="mini", placeholder="")
            el-option(v-for="item in ddTypeSettlementList", :key="item.ddName", :label="item.ddName", :value="item.ddName")
      el-col(:span="8")
        el-form-item(label="重量尾数")
          el-select.full-width(v-model="form.feeitemWeightmtStr", size="mini")
            el-option(v-for="item in feeitemWeightmtList", :key="item.ddShowname", :label="item.ddShowname", :value="item.ddShowname")
      el-col(:span="8")
        el-form-item(label="金额尾数")
          el-select.full-width(v-model="form.feeitemMoneymtStr", size="mini")
            el-option(v-for="item in feeitemMoneymtList", :key="item.ddShowname", :label="item.ddShowname", :value="item.ddShowname")
    el-row    
      el-col(:span="8")
        el-form-item(label="免储天数")
          .row
            .col
              el-input(v-model="form.feeitemFreeday", clearable, size="mini")
            el-select(v-model="form.feeitemFreeunitStr", size="mini", style="width: 75px; margin-top: 2px", placeholder="")
              el-option(v-for="item in feeitemFreedayList", :key="item.code", :label="item.name", :value="item.code")             
      el-col(:span="8")
        el-form-item(label="备注")
          el-input.full-width(v-model="form.feeitemRemark", clearable, size="mini")  
    el-form-item.mr-5(label="适用单据")
      el-checkbox-group(v-model="form.feeitemConbilltype")
        el-checkbox(:label="item.code", :key="item.code" v-for="item in feeitemConbilltypeList") {{item.name}}
    el-form-item(label="符合该费用的物资条件", label-width="160px")
      el-radio(v-model="form.feeitemScope", :label="0") 在下面的名称中
      el-radio(v-model="form.feeitemScope", :label="1") 不在下面名称中
    el-form-item(label-width="0")
      el-input(type="textarea", placeholder="请输入内容", v-model="form.feeitemFavnumcon", show-word-limit)  
  button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
  vxe-table.mt-10(ref="editTable",
    :data.sync="tableValue.tableData", 
    size="mini", 
    border, 
    :showIcon="false",
    :edit-config="{trigger: 'dblclick', mode: 'cell'}", 
    :edit-rules="tableValue.validRules || null", 
    show-all-overflow, 
    highlight-current-row,
    :height="tableValue.tableHeight ? tableValue.tableHeight : '400px'"
    @cell-click="_tableSelectRow",
    @current-change="handleSelectionChange",
    @toolbar-button-click="toolbarButtonClickEvent")
    vxe-table-column(type="selection", width="40", v-if="tableValue.hasCbx")
    vxe-table-column(type="index", width="40", v-if="tableValue.showRowIndex")
    template(v-for="column in tableValue.tableHead")
      vxe-table-column(:formatter="column.formatter", :field="column.prop", :width="column.width ? column.width : ''", 
        :edit-render="{name: 'ElSelect', autoselect: true, options: column.list, optionProps: column.optionProps}", 
        :title="column.lbl", v-if="column.type == 'select'")        
      vxe-table-column(:prop="column.prop", :width="column.width ? column.width : ''", :label="column.lbl", :edit-render="column.noedit ? null : {name: 'input'}", v-else)
  .text-right.mt-5
    el-button(@click="cancel", size="small") 取消
    el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
import buttonGroup from '~/components/buttonGroup.vue'
export default {
  components: {
    buttonGroup
  },
  props: {
    form: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      feeitemFreedayList: [
        {code: '0', name: '天'}, 
        {code: '1', name: '月'},
      ],
      buttonGroupInfo: [
        {lbl: '新增', type: 'add', icon: 'el-icon-plus'},
        {lbl: '删除', type: 'del', icon: 'el-icon-delete'}
      ],
      feeitemConbilltypeList: [
        {code: 'WLP001', name: '发货单'},
        {code: 'WLP002', name: '出库实提'},
        {code: 'WLP009', name: '仓储过户单'},
        {code: 'WLP058', name: '仓单期现变更'},
        {code: 'WLP010', name: '加工任务(仓储)'},
        {code: 'WLP011', name: '加工验收(仓储)'}
      ],
      ddTypeSettlementList: [],
      warehouseList: [],
      warehouseCtypeList: [],
      feeitemWeightmtList: [],
      feeitemMoneymtList: [],
      disabled: true,
      rules: {
        feeitemName: [{ required: true, message: '请输入项目名称' }]
      },
      tableValue: {
        hasCbx: false,
        pageShow: false,
        showRowIndex: false,
        tableHead: [
          {lbl: '天数从', prop: 'feeitemFavnummin', width: '150px'},
          {lbl: '天数到', prop: 'feeitemFavnummax'},
          {lbl: '单价', prop: 'feeitemInprice', width: '150px'},
          {lbl: '单价单位', prop: 'feeitemPriceunit', type: 'select', 
            list: [
              {code: '0', name: '元/天'},
              {code: '8', name: '元/10天'},
              {code: '1', name: '元/15天'},
              {code: '2', name: '元/30天'},
              {code: '3', name: '元/月'}
            ], 
            formatter: ({cellValue, row, column}) => {
              if (!cellValue) {
                return ''
              }
              let obj = {}
              obj = this.feeitemPriceunitList.find((item) => {                
                return item.code === cellValue.toString()
              })
              row.feeitemPriceunitStr = obj.name ? obj.name : ''
              return row.feeitemPriceunitStr
            },
            optionProps: {
              value: 'code', 
              label: 'name'
            }
          },
          {lbl: '税率', prop: 'goodsTaxrate'}
        ],
        tableData: []
      },
      feeitemPriceunitList: [
        {code: '0', name: '元/天'},
        {code: '8', name: '元/10天'},
        {code: '1', name: '元/15天'},
        {code: '2', name: '元/30天'},
        {code: '3', name: '元/月'}
      ],
      initParams: {
        feeitemFavnummin: '',
        feeitemFavnummax: '',
        feeitemInprice: '',
        feeitemPriceunitStr: '',
        feeitemPriceunit: '',
        goodsTaxrate: '',
        dataFlag: 0       
      },
      rowSelection: []
    }   
  },
  mounted () {
    this.getTypeSettlement()
    this.getWarehouse()
    this.getWarehouseCtype()
    this.getFeeitemWeightmt()
    this.getFeeitemMoneymt()
    this.$nextTick(() => {      
      this.getFeeitemBillcode()
    })
  },
  methods: {
    toolbarButtonClickEvent ({ button }, event) {
      switch (button.code) {
        case 'myBtn':
          this.$XMsg.alert(button.name)
          break
      }
    },
    handleSelectionChange (obj) { 
      this.rowSelection = [obj.row]
    },
    buttonGroupClick(flag) {
      switch(flag) {
        case 'add':
          const addData = Object.assign({}, this.initParams)
          const tableData = JSON.parse(JSON.stringify(this.tableValue.tableData))
          if (tableData.length > 0) {
            const idx = tableData.length - 1
            for (const key in this.initParams) {
              addData[key] = tableData[idx][key]
            }
            addData.dataFlag = 0
            addData.feeitemFavnummin = addData.feeitemFavnummax ? Number(addData.feeitemFavnummax) + 1 : 1
            addData.feeitemFavnummax = 0
            this.tableValue.tableData.push(addData)
          } else {
            this.tableValue.tableData.push(addData)
          }          
          break
        case 'del':
          if (this.rowSelection.length < 1) {
            this.$message.error('请选择需要删除的数据')
            return false
          }
          this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {            
            this.rowSelection[0].dataFlag = '2'
            this.$refs.editTable.remove(this.rowSelection[0])
          })
          break
        default:
          console.error('error')
          break
      }
    },
    feeitemFavnumclassChange (val) {
      val === 0 ? this.disabled = true : this.disabled = false
    },
    save () {
      this.$refs.dialogForm.validate((valid) => {
        if (valid) {
          let params = []
          const saveForm = Object.assign({}, this.form)
          const feeitemConbilltypeArr = saveForm.feeitemConbilltype.join(',')          
          if (this.tableValue.tableData.length > 0) {
            params = JSON.parse(JSON.stringify(this.tableValue.tableData))            
            params.map((item) => {
              saveForm.dataFlag = item.dataFlag
              const obj = JSON.parse(JSON.stringify(saveForm))
              Object.assign(item, obj)
              item.feeitemConbilltype = feeitemConbilltypeArr
            })
          } else {
            params = [saveForm]
            params[0].feeitemConbilltype = feeitemConbilltypeArr
          }
          this.saveAsync({feeitemStr: JSON.stringify(params)})
        } else {
          console.log('error submit!!')
          return false
        }
      })       
    },
    cancel () {
      this.$emit('cancel')
    },
    async saveAsync (params) {
      try {
        const api = 'scscm/app/feeitemAjax!saveFeeItem.do'
        const { data } = await this.proxy(this, api, 'post', params)
        if (data.map.state === "2") {
          this.$message.error(data.map.msg)
          return 
        }
        this.$message.success('保存成功')
        this.$refs.dialogForm.resetFields()
        this.$emit('save')
      } catch (e) {
        console.error(e)
      }
    },
    async getFeeitemBillcode () {
      try {
        console.log('feeitemBillcode', this.form.feeitemBillcode)
        const params = {
          feeitemBillcode: this.form.feeitemBillcode ? this.form.feeitemBillcode : '',
          page: 1,
          start: 0,
          limit: 30
        }
        const { data } = await this.proxy(this, 'scscm/app/feeitemAjax!queryFeeitem.do', 'post', params)
        console.log(data)
        this.tableValue.tableData = []
        if (data.feestockList.length > 0) {
          this.tableValue.tableData = JSON.parse(JSON.stringify(data.feestockList))
        }        
      } catch (e) {
        console.error(e)
      }
    },
    async getTypeSettlement () {
      try {
        const { data } = await this.proxy(this, 'scscm/app/basicDdAjax!queryCombo.do', 'post', {ddtypeClass: 'ddTypeSettlement'})        
        this.ddTypeSettlementList = []
        if (data.ddList.length > 0) {
          this.ddTypeSettlementList = data.ddList
        }
      } catch (e) {
        console.error(e)
      }
    },
    async getWarehouseCtype () {
      try {
        const { data } = await this.proxy(this, 'scscm/app/basicDdAjax!queryCombo.do', 'post', {ddtypeClass: 'warehousetype'})
        this.warehouseCtypeList = []
        if (data.ddList.length > 0) {
          this.warehouseCtypeList = data.ddList
        }
      } catch (e) {
        console.error(e)
      }
    },
    async getFeeitemWeightmt (key) {
      try {
        const params = {
          ddtypeClass: 'feeitemWeightmt',
          query: key,
          page: 1,
          start: 0,
          limit:25
        }
        const { data } = await this.proxy(this, 'scscm/app/ddAjax!queryCombo.do', 'post', params)
        this.feeitemWeightmtList = []
        if (data.ddList.length > 0) {
          this.feeitemWeightmtList = data.ddList
        }
      } catch (e) {
        console.error(e)
      }
    },
    async getFeeitemMoneymt (key) {
      try {
        const params = {
          ddtypeClass: 'feeitemMoneymt',
          query: key,
          page: 1,
          start: 0,
          limit:25
        }
        const { data } = await this.proxy(this, 'scscm/app/ddAjax!queryCombo.do', 'post', params)
        this.feeitemMoneymtList = []
        if (data.ddList.length > 0) {
          this.feeitemMoneymtList = data.ddList
        }
      } catch (e) {
        console.error(e)
      }
    },
    async getWarehouse (key) {
      try {
        const params = {
          query: key,
          page: 1,
          start: 0,
          limit: 10
        }
        const { data } = await this.proxy(this, 'scscm/app/warehouseAjax!queryCombo.do', 'post', params)
        this.warehouseList = []
        if (data.warehouseList.length > 0) {
          this.warehouseList = data.warehouseList
        }
      } catch (e) {
        console.error(e)
      }
    }    
  }
}
</script>
