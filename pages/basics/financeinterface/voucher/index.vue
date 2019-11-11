<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(accordion, v-model="collapseName")
      el-collapse-item.slot-left(title="账套", name="1")
        left-tree(ref="leftTree", :data="treeData", :props="treeProps", @nodeClick="treeNodeClick")
      el-collapse-item.slot-left(title="查询", name="2")
        left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search", :labelWidth="'120px'")
  .erp-content(slot="right")
    make-voucher(:tabRow="tableSelect[0]", :checkNodeData="checkNode.data")
    .table-content
      basic-elx-table(
        :tableValue="tableValue",
        :total="totalCount",
        :currentPage="currentPage",
        :pageSize="pageSize",
        :loading="loading"   
        @paginateChange="tableChange",
        @rowSelection="rowSelection")
</template>

<script>  
  import { mapState } from 'vuex'
  import makeVoucher from './makeVoucher'
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
      makeVoucher
    },
    data () {
      return {
        collapseName: ['1'],
        searchFormItems: [
          {lbl: '起始日期', prop: 'startDate', val: '', type:"date"},
          {lbl: '结束日期', prop: 'endDate', val: '', type:"date"},
          {lbl: '账套', prop: 'financeLedgerName', val: '', readonly: true},
          {lbl: '单据类型', prop: 'balanceLeadBilltypeName', val: '', readonly: true},
          {lbl: '单据号', prop: 'balanceLeadOptcode', val: ''},
          {lbl: '业务单据类型', prop: 'balanceLeadTbilltype', val: '', type:"billtype"},
          {lbl: '结算单位', prop: 'datasBalcorpcode', val: '', type:"company", props: {datasBalcorpname: 'companyName'}},
          {lbl: '业务机构', prop: 'orgCode', val: '', type:"org"},
          {lbl: '业务部门', prop: 'deptCode', val: '', type:"dept"},
          {lbl: '业务员', prop: 'employeeCode', val: '', type:"employee"},
          {lbl: '制单人', prop: 'operatorCode', val: '', type:"operator"},
          {lbl: '备注', prop: 'financeLeadRemark', val: ''}
        ],
        treeData: [],
        treeProps: {
          children: 'children',
          label: 'text',
          isLeaf: 'leaf'
        },
        buttonGroupInfo: [
          {lbl: '设置', type: 'set', icon: 'el-icon-edit'},
          {lbl: '刷新', type: 'refresh', icon: 'el-icon-refresh'}
        ],
        tableValue: {          
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          showSummary: true,
          tableHead: [
            {lbl: '单据类型', prop: 'balanceLeadBilltypeName', width: '250px'},
            {lbl: '业务单据类型', prop: 'balanceLeadTbilltypeName', width: '100px'},
            {lbl: '单据号', prop: 'balanceLeadOptcode'},
            {lbl: '日期', prop: 'financeLeadDate'},
            {lbl: '结算单位', prop: 'datasBalcorpname'},
            {lbl: '结算重量', prop: 'dataBweight', summary: true},
            {lbl: '含税金额', prop: 'datasDetailInmoney', summary: true},
            {lbl: '账号', prop: 'inneraccountsCode'},
            {lbl: '银行名称', prop: 'innerbankName'},
            {lbl: '业务机构', prop: 'orgName'},
            {lbl: '业务部门', prop: 'deptName'},
            {lbl: '业务员', prop: 'employeeName'},
            {lbl: '制单人', prop: 'operatorName'},
            {lbl: '备注', prop: 'financeLeadRemark'},
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
        dialogTitle: '单据打印设置',
        dialogShow: false,
        tableSelect: [],
        checkNode: {data: {}},
        editForm: {}
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
      this.searchFormItems[0].val = this.date2Str(new Date())
      this.searchFormItems[1].val = this.date2Str(new Date())
      this.copyEditForm = JSON.stringify(this.editForm)
    },
    methods: {
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
        this.queryObject['queryBean.startDate'] += ' 00:00'
        this.queryObject['queryBean.endDate'] += ' 23:59'
        this.queryObject['queryBean.likeCol'] = ['balanceLeadOptcode', 'datasBalcorpname', 'financeLeadRemark']
        this.loadData()    
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
            limit: this.pageSize,
            'queryBean.likeCol': ['balanceLeadOptcode', 'datasBalcorpname', 'financeLeadRemark']
          }
          this.queryObject = Object.assign(this.queryObject, {queryBean: queryBean})  
          console.log('refsearch', this.$refs.search.formItemModel)
          console.log('queryBean', obj.data)
          this.$refs.search.formItemModel.financeLedgerCode = queryBean.financeLedgerCode
          this.$refs.search.formItemModel.financeLedgerName = queryBean.financeLedgerName
          this.$refs.search.formItemModel.balanceLeadBilltype = obj.data.billtypeCode
          this.$refs.search.formItemModel.balanceLeadBilltypeName = obj.data.text
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
      async loadData () {
        this.loading = true
        try {          
          const { data } = await this.proxy(this, 'scscm/app/financeEntryAjax.do', 'post', this.queryObject)
          this.tableValue.tableData = []
          this.tableSelect = []
          this.totalCount = 0
          if (data.leadList) {
            this.tableValue.tableData = data.leadList
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async getTreeList () {
        try {
          const { data } = await this.proxy(this, 'scscm/app/financeEntryAjax!queryTree.do', 'post', {financeLedgerCode: 'root'})
          this.treeData = data.children
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