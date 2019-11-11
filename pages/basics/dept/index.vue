<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(accordion, v-model="collapseName")
      el-collapse-item.slot-left(title="部门组织", name="1")
        left-tree(ref="leftTree", :button="treeButton", :data="treeData", :props="treeProps", @nodeClick="treeNodeClick", @addEvent="addTree", @editEvent="editTree", @delEvent="delTree")
        //- left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search")
  .erp-content(slot="right")
    button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
    .table-content
      basic-elx-table(
        :tableValue="tableValue",
        :total="totalCount",
        :currentPage="currentPage",
        :pageSize="pageSize",    
        @paginateChange="tableChange",
        @tableRowEdit="rowEdit",
        @tableRowDel="rowDel",
        @rowSelection="rowSelection")
    el-dialog(title="部门组织", :visible="treeEditShow", width="400px", @close="treeEditCancel")
      tree-edit(v-if="treeEditShow", :form="treeEditForm", @save="treeEditSave", @cancel="treeEditCancel")
    el-dialog(ref="dialog", title="部门设置", :visible="dialogShow", width="800px", @close="editCancel")
      edit-box(v-if="dialogShow", :form="editForm", :treeData="treeData", :treeProps="treeProps", @save="editSave", @cancel="editCancel")    
</template>

<script>
  import { mapState } from 'vuex'
  import treeEdit from './treeEdit'
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
      leftSearch,    
      leftTree,  
      buttonGroup,
      treeEdit,
      editBox
    },
    data () {
      return {
        collapseName: ['1'],
        treeButton: [
          {type: 'add', label: '新增', icon: 'el-icon-document-add'}, 
          {type: 'edit', label: '编辑', icon: 'el-icon-edit'},
          {type: 'del', label: '删除', icon: 'el-icon-delete'}
        ],
        treeEditShow: false,
        treeEditForm: {
          deptId: '',
          memberCode: '',
          deptCode: '',
          deptIsleaf: '',
          deptNodecode: '',
          deptParent: '',
          deptManager: '',
          orgCode: '',
          deptName: '',
          deptRemark: ''
        },
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
        editForm: {},   
        tableValue: {          
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '部门代码', prop: 'deptCode', width: '100px'},
            {lbl: '部门名称', prop: 'deptName', width: '100px'},
            {lbl: '负责人', prop: 'deptManager'}, 
            {lbl: '备注', prop: 'deptRemark'}, 
            {type: 'action', width: '100px', fixed: 'right', actionBtns: [
                {lbl: '修改', type: 'edit'}, 
                {lbl: '删除', type: 'del'}
              ]
            }
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
          sort: '[{"property":"orgCode","direction":"ASC"}]'
        },
        loading: false,
        dialogShow: false,
        copyEditForm: {},
        dialogTitle: '新增模板',
        tableSelect: [],
        checkNode: {data: {}}
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
    mounted () {},
    methods: {
      addTree () {
        if (!this.checkNode.data.id) {
          this.$message.error('请选择节点')
          return
        }
        this.treeEditForm.deptParent = this.checkNode.data.deptParent
        this.treeEditShow = true
      },
      editTree () {
        if (!this.checkNode.data.id) {
          this.$message.error('请选择需要修改的节点')
          return
        }
        this.getTree()
      },
      async getTree () {
        try {
          const { data } = await this.proxy(this, 'scscm/app/deptAjax!editTree.do', 'post', {basicDept: this.getFilterObj(this.checkNode.data.filterObj)})          
          this.treeEditForm = data.basicDept
          this.treeEditShow = true
        } catch (e) {
          console.error(e)
        }
      },
      delTree () {
        if (!this.checkNode.data.filterObj) {
          this.$message.error('请选择需要删除的节点')
          return
        }
        this.confirmDialog(this, '确定要删除当前记录？').then(() => {
          const filterObj = this.getFilterObj(this.checkNode.data.filterObj)
          this.deleteTree(filterObj)
        })
      },
      async deleteTree (params) {
        try {          
          const { data } = await this.proxy(this, 'scscm/app/deptAjax!deleteTree.do', 'post', this.paramsFormat('basicDept', params))
          if (data.map.state === '3') {
            this.msgShow(this, '删除成功', 'success')
            this.getTreeList()
          } else {
            this.msgShow(this, data.map.msg)
          }
        } catch (e) {
          console.error(e)
          this.msgShow(this)
          this.loading = false
        }
      },
      treeEditCancel() {
        this.treeEditShow = false
      },
      treeEditSave() {
        this.getTreeList()
        this.treeEditShow = false
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
            limit: this.pageSize,
            sort: '[{"property":"orgCode","direction":"ASC"}]'
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
            this.editForm.deptParent = this.checkNode.data.id
            this.editForm.deptParentName = this.checkNode.data.text
            this.dialogShow = true
            break
          case 'edit':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要编辑的数据')
              return false
            }
            this.editForm = JSON.parse(JSON.stringify(this.tableSelect[0]))
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
        if (row) {
          this.editForm = Object.assign({}, row)
        }
        this.dialogShow = true
      },
      rowDel (row) {
        this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
          const list = row ? [row] : this.tableSelect
          this.delete({basicDept: list[0]})
        })
      },
      async loadData () {
        this.loading = true
        try {          
          const { data } = await this.proxy(this, 'scscm/app/deptAjax.do', 'post', this.queryObject)
          this.tableValue.tableData = []
          this.tableSelect = []
          this.totalCount = 0
          if (data.deptList) {
            this.tableValue.tableData = data.deptList
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async delete (params) {
        try {          
          const { data } = await this.proxy(this, 'scscm/app/deptAjax!delete.do', 'post', params)
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
          const { data } = await this.proxy(this, 'scscm/app/deptAjax!queryTree.do', 'post', {deptParent: 'root'})
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