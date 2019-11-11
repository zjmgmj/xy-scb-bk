<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(accordion, v-model="collapseName")
      el-collapse-item.slot-left(title="常用代码设置", name="1")
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
    el-dialog(ref="dialog", title="常用代码设置", :visible="dialogShow", width="500px", @close="editCancel")
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
        collapseName: ['1', '2'],
        searchFormItems: [
          {lbl: '显示名称', prop: 'ddName', val: ''},
          {lbl: '备注', prop: 'ddRemark', val: ''}
        ],
        // leftOrgDialog: false,
        // leftOrgTitle: '新增组织',
        treeData: [],
        treeProps: {
          children: 'children',
          label: 'text',
          isLeaf: 'leaf'
        },
        buttonGroupInfo: [
          {lbl: '新增', type: 'add', icon: 'el-icon-plus'},
          {lbl: '修改', type: 'edit', icon: 'el-icon-edit'},
          {lbl: '删除', type: 'del', icon: 'el-icon-delete'}
        ],
        editForm: {
          ddName: '',
          ddNotuse: 0,
          basicShare: 0,
          ddRemark: ''
        },
        rules: {},
        tableValue: {          
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '显示名称', prop: 'ddName', minWidth: '120px'},
            {lbl: '显示', prop: 'ddNotuse', formatter: ({cellValue}) => {
              return cellValue === 1 ? '不显示' : '显示'
            }}, 
            {lbl: '共享', prop: 'basicShare', formatter: ({cellValue}) => {
              return cellValue === 1 ? '√' : '×'
            }}, 
            {lbl: '备注', prop: 'ddRemark'},
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
          page: this.currentPage,
          otherlikeCol:0,
          start: 0,
          limit: this.pageSize,
          // 'queryBean.likeCol': ['innerbankCode', 'innerbankName'],
          sort:[{"property":"ddName","direction":"DESC"}]
        },
        loading: false,
        dialogShow: false,
        copyEditForm: {},
        dialogTitle: '常用代码设置',
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
      searchForm (values) {
        this.currentPage = 1
        this.queryObject = {
          page: this.currentPage,
          otherlikeCol:0,
          start: 0,
          limit: this.pageSize,
          sort: '[{"property":"ddName","direction":"ASC"}]'
        }
        const params = this.paramsFormat('queryBean', values)
        for (const key in params) {
          this.queryObject[key] = params[key]
          if (!this.queryObject[key]) {
            delete this.queryObject[key]
          }
        }
        this.queryObject['queryBean.likeCol'] = ['ddName', 'ddRemark']
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
          this.queryObject = {
            page: this.currentPage,
            otherlikeCol:0,
            start: 0,
            limit: this.pageSize,
            sort: '[{"property":"ddName","direction":"ASC"}]'
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
            this.editForm = Object.assign(this.editForm, this.checkNode.data)            
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
          default:
            this.$refs.search.searchHandler()
            break
        }
      },
      rowEdit (row) {
        this.editForm = this.tableSelect[0]
        if (row) {
          this.editForm = Object.assign({}, row)
        }
        this.dialogShow = true
      },
      rowDel (row) {
        this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
          const list = row ? [row] : this.tableSelect
          // const params = {
          //   termsettingCode: list[0].termsettingCode
          // }
          this.delete({dd: list[0]})
        })
      },
      async loadData () {
        this.loading = true
        try {          
          const { data } = await this.proxy(this, 'scscm/app/basicDdAjax.do', 'post', this.queryObject)
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
      async delete (params) {
        try {          
          const { data } = await this.proxy(this, 'scscm/app/basicDdAjax!delete.do', 'post', params)
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
          const { data } = await this.proxy(this, 'scscm/app/basicDdAjax!queryTree.do', 'post', {billtypeCode: 'root'})
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