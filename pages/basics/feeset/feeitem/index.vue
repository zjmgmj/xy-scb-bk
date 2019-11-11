<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(accordion, v-model="collapseName")
      el-collapse-item.slot-left(title="费用项目列表", name="1")
        left-tree(ref="leftTree", :data="treeData", :props="treeProps", @nodeClick="treeNodeClick")
      el-collapse-item.slot-left(title="查询", name="2")
        left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search", :labelWidth="'70px'")
  .erp-content(slot="right")
    button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
    .table-content
      basic-elx-table(
        :tableValue="tableValue",
        :total="totalCount",
        :currentPage="currentPage",
        :pageSize="pageSize",
        :loading="loading"   
        @paginateChange="tableChange",
        @tableRowEdit="rowEdit",
        @tableRowDel="rowDel",
        @rowSelection="rowSelection")
    el-dialog(ref="dialog", :title="dialogTitle", top="10px", :visible="dialogShow",  width="900px", @close="editCancel") 
      edit-box(v-if="dialogShow", :form="editForm" @save="editSave", @cancel="editCancel")
    el-dialog(ref="dialog", title="仓租费设置", top="10px", :visible="warehouseFeeShow",  width="900px", @close="warehouseFeeCancel") 
      warehouse-fee(v-if="warehouseFeeShow", :form="warehouseFeeForm" @save="warehouseFeeSave", @cancel="warehouseFeeCancel")
</template>

<script>    
  import { mapState } from 'vuex'
  import warehouseFee from './warehouseFee'
  import editBox from './edit'
  import buttonGroup from '~/components/buttonGroup.vue'  
  import erplrPanel from '~/components/erplrPanel'
  import basicElxTable from '~/components/basicElxTable'
  import leftTree from '@/components/leftTree'
  import leftSearch from '~/components/leftSearch'  
  export default {
    layout: 'backend',
    components: {      
      basicElxTable,
      erplrPanel,
      buttonGroup,
      leftTree,
      leftSearch,
      editBox,
      warehouseFee
    },
    data () {
      return {
        warehouseFeeShow: false,
        warehouseFeeForm: {
          feeitemName: '',
          warehouseCode: '',
          ddTypeSettlement: '',
          feeitemWeightmtStr: '',
          feeitemMoneymtStr: '',
          feeitemFreeday: '',
          feeitemFreeunitStr: '',
          feeitemRemark: '',
          feeitemConbilltype: [],
          feeitemScope: 0,
          feeitemFavnumcon: '',
          feeitemCalmethod: 0,
          feeitemId: '',
          memberCode: '',
          feeitemCode: '',
          feeitemBillcode: '',
          feeclassName: '',
          feeitemWagonsize: '2',
          feeitemWeightmt: '0',
          feeitemMoneymt: '0',
          feeitemFreeunit: '',
          warehouseCtype: '',
          dataFlag: 0,
          feeitemWhrent: 1
        },
        collapseName: ['1'],
        searchFormItems: [
          {lbl: '类别名称', prop: 'feeclassName', val: ''}
        ],
        treeData: [{text: '类别', children: []}],
        treeProps: {
          children: 'children',
          label: 'text',
          isLeaf: 'leaf'
        },
        buttonGroupInfo: [
          {lbl: '新增', type: 'add', icon: 'el-icon-plus'},
          {lbl: '修改', type: 'edit', icon: 'el-icon-edit'},
          {lbl: '删除', type: 'del', icon: 'el-icon-delete'},
          {lbl: '仓租费', type: 'addWhrent', icon: 'el-icon-plus'}
        ],
        rules: {},
        tableValue: {          
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '代码', prop: 'feeitemCode', width: '100px'},
            {lbl: '项目名称', prop: 'feeitemName', width: '100px'},
            {lbl: '类别名称', prop: 'feeclassName'},
            {lbl: '仓租费', prop: 'feeitemWhrent', formatter: ({cellValue}) => {
              return cellValue === 1 ? '√' : '×'
            }},
            {lbl: '仓库', prop: 'warehouseName'}, 
            {lbl: '库位类型', prop: 'warehouseCtype'}, 
            {lbl: '结算方式', prop: 'ddTypeSettlement'}, 
            {lbl: '运输方式(当前单据)', prop: 'ddTypeTransport', width: '150px'}, 
            {lbl: '计费方式', prop: 'feeitemCalmethodStr'}, 
            {lbl: '单价', prop: 'feeitemInprice'}, 
            {lbl: '单价单位', prop: 'feeitemPriceunitStr'}, 
            {lbl: '税率', prop: 'goodsTaxrate'}, 
            {lbl: '重量尾数', prop: 'feeitemWeightmtStr'}, 
            {lbl: '金额尾数', prop: 'feeitemMoneymtStr'}, 
            {lbl: '优惠方式', prop: 'feeitemFavnumclassStr'}, 
            {lbl: '统计方式', prop: 'feeitemThroughputStr'}, 
            {lbl: '大于/天数从', prop: 'feeitemFavnummin', width: '120px'}, 
            {lbl: '小于/天数到', prop: 'feeitemFavnummax', width: '120px'}, 
            {lbl: '加班', prop: 'feeitemOvertimeStr'}, 
            {lbl: '加班开始时间', prop: 'feeitemOverstimeStr', width: '150px'}, 
            {lbl: '加班结束时间', prop: 'feeitemOveretimeStr', width: '150px'}, 
            {lbl: '适用单据', prop: 'feeitemConbilltypeStr'}, 
            {lbl: '物资是否在条件内', prop: 'feeitemScope', width: '150px', formatter: ({cellValue}) => {              
              return cellValue === 1 ? '不在' : '在'
            }}, 
            {lbl: '单据里物资条件', prop: 'feeitemFavnumcon', width: '150px'}, 
            {lbl: '免储天数', prop: 'feeitemFreeday'}, 
            {lbl: '免储天数单位', prop: 'feeitemFreeunitStr', width: '150px'}, 
            {lbl: '所属机构', prop: 'orgName'}, 
            {lbl: '备注', prop: 'feeitemRemark'},
            {type: 'action', width: '100px', fixed: 'right', actionBtns: [
              {lbl: '修改', type: 'edit'},
              {lbl: '删除', type: 'del'}
            ]}
          ],
          tableData: []
        },
        currentPage: 1,
        totalCount: 0,
        queryObject: {
          currentPage: this.currentPage,
          pageSize: this.pageSize
        },
        loading: false,
        dialogShow: false,
        editForm: {
          feeitemName: '',
          feeitemInprice: '',
          feeitemPriceunit: '',
          feeitemPriceunitStr: '',
          goodsTaxrate: '0.17',
          ddTypeSettlement: '',
          warehouseCode: '',
          warehouseCtype: '',
          feeitemWeightmtStr: '不处理',
          feeitemMoneymtStr: '不处理',
          feeitemCalmethodStr: '按重量',
          ddTypeTransport: '',
          feeitemRemark: '',
          feeitemFavnumclass: 0,
          feeitemThroughput: 1,
          feeitemFavnummin: '',
          feeitemFavnummax: '',
          feeitemOvertime: 0,
          feeitemOverstimeStr: '',
          feeitemOveretimeStr: '',
          feeitemScope: 0,
          feeitemFavnumcon: '',
          feeitemConbilltypeStr: [],
          feeitemConbilltype: []          
        },
        copyEditForm: {},
        copyWarehouseFeeForm: {},
        dialogTitle: '费用项目设置',
        tableSelect: [],
        checkNode: {}
      }
    },
    computed: {
      ...mapState({
        pageSize: state => state.pageSize,
        currentUser: state => state.user.currentUser
      })
    },
    created () {
      this.getTreeList()
      this.copyEditForm = JSON.stringify(this.editForm)
      this.copyWarehouseFeeForm = JSON.stringify(this.warehouseFeeForm)
    },
    mounted () {
      this.$nextTick(()=>{
        this.queryObject = {
          currentPage: this.currentPage,
          pageSize: this.pageSize
        }
        // this.loadData()
      })
    },
    methods: {
      warehouseFeeSave() {
        this.warehouseFeeForm = JSON.parse(this.copyWarehouseFeeForm)
        this.warehouseFeeShow = false
        this.loadData()
      },
      warehouseFeeCancel () {
        this.warehouseFeeForm = JSON.parse(this.copyWarehouseFeeForm)
        this.warehouseFeeShow = false
      },
      searchForm (values) {
        this.currentPage = 1
        this.queryObject = {
          page: this.currentPage,
          otherlikeCol:0,
          start: 0,
          limit: this.pageSize
        }
        const params = this.paramsFormat('queryBean', values)
        for (const key in params) {
          this.queryObject[key] = params[key]
          if (!this.queryObject[key]) {
            delete this.queryObject[key]
          }
        }
        this.queryObject['queryBean.likeCol'] = ['feeclassName']
        this.loadData()    
      },
      editSave() {
        this.editForm = JSON.parse(this.copyEditForm)
        this.dialogShow = false
        this.loadData()
      },
      editCancel () {
        this.editForm = JSON.parse(this.copyEditForm)
        this.dialogShow = false
      },   
      treeNodeClick (obj) {
        let queryBean = {}
        if (obj.data.filterObj) {
          this.currentPage = 1
          queryBean = this.getFilterObj(obj.data.filterObj)
          Object.assign(this.editForm, queryBean)
          this.queryObject = {
            page: this.currentPage,
            otherlikeCol:0,
            start: 0,
            limit: this.pageSize
          }
          this.queryObject = Object.assign(this.queryObject, {queryBean: queryBean})  
          this.loadData()
        }
        obj.data = Object.assign(obj.data, queryBean)
        this.checkNode = obj
      },
      rowSelection (row) {
        console.log('checkTable', row)
        this.tableSelect = row
      },
      tableChange (val) {        
        this.currentPage = val
        this.queryObject.currentPage = this.currentPage
        this.loadData()
      },
      buttonGroupClick (type) {
        switch (type) {
          case 'add':
            if (!this.checkNode.data) {
              this.$message.error('请选择节点')
              return false
            }
            // Object.assign(this.editForm, this.checkNode.data)
            this.editForm.feeclassName = this.checkNode.data.feeclassName
            this.editForm.memberCode = this.checkNode.data.memberCode
            this.dialogShow = true         
            break
          case 'edit':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要编辑的数据')
              return false
            }
            this.rowEdit()
            break
          case 'del':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要删除的数据')
              return false
            }
            this.rowDel() 
            break
          case 'addWhrent':
            console.log('仓租费')
            if (!this.checkNode.data) {
              this.$message.error('请选择节点')
              return false
            }            
            this.warehouseFeeForm.feeclassName = this.checkNode.data.feeclassName
            this.warehouseFeeForm.memberCode = this.checkNode.data.memberCode
            this.warehouseFeeShow = true  
            break
          default:
            this.$refs.search.searchHandler()
            break
        }
      },
      rowEdit (row) {
        const rowObj = row ? Object.assign({}, row) : JSON.parse(JSON.stringify(this.tableSelect[0]))
        rowObj.dataFlag = 1
        delete rowObj.idx
        rowObj.feeitemConbilltype = rowObj.feeitemConbilltype ? rowObj.feeitemConbilltype.split(',') : []
        rowObj.feeclassName = this.checkNode.data.feeclassName
        rowObj.memberCode = this.checkNode.data.memberCode
        if (rowObj.feeitemWhrent === 1) {
          delete rowObj.feeitemId
          delete rowObj.feeitemCode
          // delete rowObj.feeitemBillcode
          const idx = rowObj.feeitemName.indexOf('-')
          delete rowObj.dataFlag
          rowObj.feeitemName = rowObj.feeitemName.substr(0, idx)
          const obj = {}
          for (const key in this.warehouseFeeForm) {
            obj[key] = rowObj[key]
          }
          this.warehouseFeeForm = obj
          this.warehouseFeeShow = true
        } else {
          this.editForm = rowObj
          this.dialogShow = true
        }        
      },
      rowDel (row) {
        this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
          const list = row ? [row] : this.tableSelect
          const params = {
            feeitemId: list[0].feeitemId,
            feeitemCode: list[0].feeitemCode
          }
          this.delete({feeitemMod: params})
        })
      },
      async loadData () {
        this.loading = true
        try {          
          const { data } = await this.proxy(this, 'scscm/app/feeitemAjax.do', 'post', this.queryObject)
          this.tableValue.tableData = []
          this.tableSelect = []
          this.totalCount = 0
          if (data.feeitemList) {
            this.tableValue.tableData = data.feeitemList
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async delete (params) {
        try {          
          const { data } = await this.proxy(this, 'scscm/app/feeitemAjax!delete.do', 'post', params)
          if (data.map.state === '3') {
            this.dialogShow = false
            this.msgShow(this, '删除成功', 'success')
            this.loadData()
          } else {
             this.msgShow(this, data.map.msg)
          }
        } catch (e) {
          console.error(e)
          this.msgShow(this)
          this.loading = false
        }
      },
      async getTreeList () {
        try {
          const { data } = await this.proxy(this, 'scscm/app/feeitemAjax!queryTree.do', 'post', {feeclassName: 'root'})
          this.treeData[0].children = data.treeList
          this.treeProps = {
            children: 'children',
            label: 'text',
            isLeaf: 'leaf'
          }
        } catch (e) {
          console.error(e)
        }
      }
    }
  }
</script>
<style>
  .baidu-map{
    width: 100%;
    height: 550px;
  }
</style>