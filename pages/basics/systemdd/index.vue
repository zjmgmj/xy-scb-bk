<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(accordion, v-model="collapseName")
      el-collapse-item.slot-left(title="系统代码设置", name="1")
        left-tree(ref="leftTree", :data="treeData", :props="treeProps", @nodeClick="treeNodeClick")
      //- el-collapse-item.slot-left(title="查询", name="2")
        left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search", :labelWidth="'55px'")
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
        @rowSelection="rowSelection")
    el-dialog(ref="dialog", title="系统代码设置", :visible="dialogShow", width="600px", @close="editCancel")
      edit-box(v-if="dialogShow", :form="editForm", @save="editSave", @cancel="editCancel")
</template>

<script>  
  import { mapState } from 'vuex'
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
      editBox
    },
    data () {
      return {
        collapseName: ['1'],
        // searchFormItems: [
        //   {lbl: '类别', prop: 'type', val: ''},
        //   {lbl: '名称', prop: 'orgName', val: ''},
        //   {lbl: '显示名称', prop: 'orgAbbreviate', val: ''},
        //   {lbl: '备注', prop: 'orgPhone', val: ''}
        // ],
        // leftOrgDialog: false,
        // leftOrgTitle: '新增组织',
        treeData: [],
        treeProps: {
          children: 'children',
          label: 'text',
          isLeaf: 'leaf'
        },
        buttonGroupInfo: [
          {lbl: '修改', type: 'edit', icon: 'el-icon-edit'}
        ],
        editForm: {
          ddValue: '',
          ddShowname: '',
          ddNotuse: '',
          basicShare: '',
          ddRemark: ''
        },
        rules: {},
        tableValue: {          
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '名称', prop: 'ddValue', width: '100px'},
            {lbl: '显示名称', prop: 'ddShowname', width: '100px'},
            {lbl: '显示', prop: 'ddNotuse', formatter: ({cellValue}) => {
              return cellValue === 1 ? '不显示' : '显示'
            }}, 
            {lbl: '共享', prop: 'basicShare', formatter: ({cellValue}) => {
              return cellValue === 1 ? '√' : '×'
            }}, 
            {lbl: '备注', prop: 'ddRemark'},
            {type: 'action', width: '80px', fixed: 'right', actionBtns: [{lbl: '修改', type: 'edit'}]}
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
        smsTemplate: {},
        copySmsTemplate: {},
        dialogTitle: '系统代码设置',
        tableSelect: [],
        checkNode: {}
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
      this.getTreeList()
      this.copyEditForm = JSON.stringify(this.editForm)
    },
    methods: {
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
          this.queryObject = {
            page: this.currentPage,
            otherlikeCol:0,
            start: 0,
            limit: this.pageSize,
            sort: '[{"property":"ddShowname","direction":"ASC"}]'
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
        if (this.tableSelect.length < 1) {
          this.$message.error('请选择需要编辑的数据')
          return false
        }
        this.editForm = JSON.parse(JSON.stringify(this.tableSelect[0]))
        this.rowEdit()
      },
      rowEdit (row) {
        if (row) {
          this.editForm = Object.assign({}, row)
        }
        this.dialogShow = true
      },    
      async loadData () {
        this.loading = true
        try {          
          const { data } = await this.proxy(this, 'scscm/app/ddAjax.do', 'post', this.queryObject)
          this.tableValue.tableData = []
          this.tableSelect = []
          this.totalCount = 0
          if (data.ddList) {
            this.tableValue.tableData = data.ddList
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async getTreeList () {
        try {
          const { data } = await this.proxy(this, 'scscm/app/ddAjax!queryTree.do', 'post', {billtypeCode: 'root'})
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
<style>
  .baidu-map{
    width: 100%;
    height: 550px;
  }
  .bm-serch{
  }
</style>