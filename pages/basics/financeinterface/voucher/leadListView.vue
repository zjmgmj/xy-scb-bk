<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(accordion, v-model="collapseName")
      el-collapse-item.slot-left(title="账套", name="1")
        left-tree(ref="leftTree", :data="treeData", :props="defaultProps", @nodeClick="treeNodeClick")
      el-collapse-item.slot-left(title="查询", name="2")
        left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search", :labelWidth="'110px'")
  .erp-content(slot="right")
    button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
    .table-content
      basic-elx-table(
        :tableValue="tableValue",
        :total="totalCount",
        :currentPage="currentPage",
        :pageSize="pageSize",
        :loading="loading",
        @tableRowDel="rowDel",
        @paginateChange="tableChange",
        @rowSelection="rowSelection")    
    //- left-edit(:title="leftOrgTitle", :dialogShow="leftOrgDialog", @close="leftOrgDialog = false", @save="leftOrgSave", v-if="leftOrgDialog")
    //- el-dialog(ref="dialog", :title="dialogTitle", :visible="dialogShow", fullscreen, @close="editCancel") 
      edit-box
</template>

<script>  
  import { mapState } from 'vuex'
  // import leftEdit from './leftEdit'
  // import editBox from './edit'  
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
      // leftEdit,
      leftSearch,
      makeVoucher
      // editBox
    },
    data () {
      return {
        // treeButton: [
        //   {type: 'control', label: '设置控制', icon: 'el-icon-document-add'}
        // ],
        collapseName: ['1'],
        searchFormItems: [
          {lbl: '起始日期', prop: 'startDate', val: '', type:"datetime"},
          {lbl: '结束日期', prop: 'endDate', val: '', type:"datetime"},
          {lbl: '账套', prop: 'financeLedgerCode', val: ''},
          {lbl: '单据类型', prop: 'balanceLeadBilltype', val: ''},
          {lbl: '单据号', prop: 'balanceLeadOptcode', val: ''},
          {lbl: '业务单据类型', prop: 'balanceLeadTbilltype', val: '', type:"select", list: []},
          {lbl: '结算单位', prop: 'datasBalcorpname', val: '', type:"select", list: []},
          {lbl: '业务机构', prop: 'orgCode', val: '', type:"select", list: []},
          {lbl: '业务部门', prop: 'deptCode', val: '', type:"select", list: []},
          {lbl: '业务员', prop: 'employeeCode', val: '', type:"select", list: []},
          {lbl: '制单人', prop: 'operatorCode', val: '', type:"select", list: []},
          {lbl: '备注', prop: 'financeLeadRemark', val: ''}
        ],
        // leftOrgDialog: false,
        // leftOrgTitle: '单据审核设置',
        treeData: [{label: '商贸物流', children: [
          {label: '采购管理', children: [
            {label: '采购计划', children: [{label: '采购计划登记'}]}]},{label: '仓库管理'}]}],
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        buttonGroupInfo: [
          {lbl: '删除', type: 'del', icon: 'el-icon-delete'},
          {lbl: '刷新', type: 'refresh', icon: 'el-icon-refresh'}
        ],
        tableValue: {          
          hasCbx: true,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '单据类型', prop: 'billtypeName', width: '250px'},
            {lbl: '流程代码', prop: 'defineCode', width: '100px'},
            {lbl: '流程名称', prop: 'defineName'},
            {type: 'action', width: '100px', fixed: 'right', actionBtns: [
                {lbl: '删除', type: 'del'}
              ]
            }
          ],
          tableData: []
        },
        currentPage: 1,
        totalCount: 0,
        queryObject: {
          currentPage: this.currentPage,
          pageSize: this.pageSize
        },
        loading: true,
        // smsTemplate: {},
        // copySmsTemplate: {},
        dialogTitle: '单据打印设置',
        dialogShow: false,
        tableSelect: [],
        checkNode: {},
        editForm: {}
      }
    },
    computed: {
      ...mapState({
        pageSize: state => state.pageSize,
        currentUser: state => state.user.currentUser,
        cstmArr: state => state.cstmArr
      })
    },
    created () {
      // this.copySmsTemplate = JSON.parse(JSON.stringify(this.smsTemplate))
    },
    mounted () {
      this.$nextTick(()=>{
        this.queryObject = {
          currentPage: this.currentPage,
          pageSize: this.pageSize
        }
        this.loadData()
      })
    },
    methods: {
      searchForm (values) {
        for (const key in values) {
          this.queryObject[key] = values[key]
          if (!this.queryObject[key]) {
            delete this.queryObject[key]
          }
        }
        this.loadData()       
      },
      treeNodeClick (obj) {
        console.log(obj)
        this.checkNode = obj
      },
      rowSelection (row) {
        this.tableSelect = row
      },
      tableChange (val) {
        this.currentPage = val
        this.queryObject.currentPage = this.currentPage
        this.loadData()
      },
      buttonGroupClick (type) {
        switch (type) {
          case 'del':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要删除的数据')
              return false
            }
            this.rowDel() 
            break          
          case 'refresh':
            // this.$refs.search.searchHandler()
            this.loadData()
            break
        }
      }, 
      rowDel (row) {
        this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
          const list = row ? [row] : this.tableSelect
          let params = '/' + list[0].orgId
          if (list.length > 1) {
            const spIds = []
            list.map((item) => {
              spIds.push('spIds[]=' + item.orgId)
            })
            const spIdsStr = spIds.toString().replace(/,/g, '&')
            params = '?' + encodeURI(spIdsStr)
          }
          console.log(params)
          this.delete(params)
        })
      }, 
      async loadData () {
        try {
          const { data } = await this.proxy(this, 'basic-server/v1/basicInfo/org', 'get', this.queryObject)
          if (data.return_code === 0) {          
            this.tableValue.tableData = data.list
            this.totalCount = data.total
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      }, 
      async delete (params) {
        try {          
          const { data } = await this.proxy(this, 'basic-server/v1/basicInfo/org'+ params, 'del')
          if (data.return_code === 0) {
            this.dialogShow = false
            this.msgShow(this, '删除成功', 'success')
            this.loadData()
          } else {
            this.msgShow(this, data.message)
          }
        } catch (e) {
          console.error(e)
          this.msgShow(this)
          this.loading = false
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
  .bm-serch{
  }
</style>