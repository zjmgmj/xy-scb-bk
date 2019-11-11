<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(accordion, v-model="collapseName")
      el-collapse-item.slot-left(title="公司组织", name="1")
        left-tree(
          ref="leftTree",                   
          :defaultExpandedKeys="['0000']", 
          :nodeKey="'id'", 
          :iconClass="'el-icon-folder'" 
          :button="treeButton", 
          :data="treeData", 
          :props="treeProps",
          :draggable="true",
          @nodeDragEnd="nodeDragEnd", 
          @nodeClick="treeNodeClick", 
          @addEvent="addTree", 
          @editEvent="editTree", 
          @delEvent="delTree")
        //- left-tree(ref="leftTree", :button="treeButton", :data="treeData", :props="treeProps", @nodeClick="treeNodeClick", @addEvent="addTree", @editEvent="editTree", @delEvent="delTree")
      //- el-collapse-item.slot-left(title="查询", name="2")
        left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search")
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
    el-dialog(title="公司组织", :visible="treeEditShow", width="400px", @close="treeEditCancel")
      tree-edit(v-if="treeEditShow", :form="treeEditForm", @save="treeEditSave", @cancel="treeEditCancel")
    el-dialog(ref="dialog", title="机构设置", :visible="dialogShow", width="800px", @close="editCancel")
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
      buttonGroup,
      leftTree,
      treeEdit,
      leftSearch,
      editBox
    },
    data () {
      return {
        treeButton: [
          {type: 'add', label: '新增', icon: 'el-icon-document-add'}, 
          {type: 'edit', label: '编辑', icon: 'el-icon-edit'},
          {type: 'del', label: '删除', icon: 'el-icon-delete'}
        ],
        collapseName: ['1'],
        // searchFormItems: [
        //   {lbl: '机构代码', prop: 'orgCode', val: '', placeholder:'请输入机构代码'},
        //   {lbl: '机构名称', prop: 'orgName', val: '', placeholder:'请输入机构名称'},
        //   {lbl: '机构简称', prop: 'deptCode', val: '', placeholder:'请输入机构简称'}
        // ],
        treeEditForm: {
          orgId: '',
          memberCode: '',
          orgCode: '',
          orgParent: '',
          orgIsleaf: '',
          orgAbbreviate: '',
          orgNodecode: '',
          orgName: '', 
          orgRemark: ''
        },
        treeEditShow: false,
        copyTreeData: [],
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
          orgId: '',
          memberCode: '',
          orgCode: '',
          companyCode: '',
          orgIsleaf: '',
          orgNodecode: '',
          orgName: '',
          orgAbbreviate: '',
          orgParent: '',
          orgPhone: '',
          orgFax: '',
          orgCorporation: '',
          orgTanu: '',
          orgAccounts: '',
          orgBankname: '',
          orgAddr: '',
          orgRemark: ''
        },
        tableValue: {          
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '机构名称', prop: 'orgName', width: '250px'},
            {lbl: '机构代码', prop: 'orgCode', width: '100px'},
            {lbl: '机构简称', prop: 'orgAbbreviate'}, 
            {lbl: '机构法人', prop: 'orgCorporation'}, 
            {lbl: '电话', prop: 'orgPhone'},
            {lbl: '传真', prop: 'orgFax'},
            {lbl: '账号', prop: 'orgAccounts'},
            {lbl: '开户银行', prop: 'orgBankname'},
            {lbl: '税号', prop: 'orgTanu'},
            {lbl: '地址', prop: 'orgAddr'},
            {lbl: '备注', prop: 'orgRemark'},
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
        dialogTitle: '新增机构',
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
      nodeDragEnd (res) {
        this.confirmDialog(this, '您确定要把该节点移至['+ res.dropNode.label +']下吗?').then((type) => {         
          const dragFilterObj = this.getFilterObj(res.draggingNode.data.filterObj)
          const params = {
              orgParent: res.dropNode.data.id,
              orgNodecode: res.draggingNode.data.id,
              memberCode: dragFilterObj.memberCode,
              orgCode: res.draggingNode.data.id
          }
          this.updateTreeParent({basicOrg: params})
        }).catch(() => {
          this.treeData = JSON.parse(this.copyTreeData)
        })
      },
      addTree () {
        console.log('checkNodeId', this.checkNode.data.id)
        if (!this.checkNode.data.id) {
          this.$message.error('请选择节点')
          return
        }
        this.treeEditForm = Object.assign(this.treeEditForm, this.getFilterObj(this.checkNode.data.filterObj))
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
          const { data } = await this.proxy(this, 'scscm/app/orgAjax!editTree.do', 'post', {basicOrg: this.getFilterObj(this.checkNode.data.filterObj)})          
          this.treeEditForm = data.basicOrg
          this.treeEditForm.orgName = data.basicOrg.orgAbbreviate
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
          const { data } = await this.proxy(this, 'scscm/app/orgAjax!deleteTree.do', 'post', this.paramsFormat('basicOrg', params))
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
            this.editForm.orgParent = this.checkNode.data.id
            this.editForm.orgParentName = this.checkNode.data.text
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
          const params = {
            orgCode: list[0].orgCode
          }
          this.delete({basicOrg: params})
        })
      },
      async loadData () {
        this.loading = true
        try {          
          const { data } = await this.proxy(this, 'scscm/app/orgAjax.do', 'post', this.queryObject)
          this.tableValue.tableData = []
          this.tableSelect = []
          this.totalCount = 0
          if (data.orgList) {
            this.tableValue.tableData = data.orgList
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async delete (params) {
        try {          
          const { data } = await this.proxy(this, 'scscm/app/orgAjax!delete.do', 'post', params)
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
          const { data } = await this.proxy(this, 'scscm/app/orgAjax!queryTree.do', 'post', {orgParent: 'root'})
          this.treeData = data.children
          this.copyTreeData = JSON.stringify(this.treeData)
          this.treeProps = {
            children: 'children',
            label: 'text',
            isLeaf: 'leaf'
          }
        } catch (e) {
          console.error(e)
        }
      },
      async updateTreeParent (params) {
        try {
          const { data } = await this.proxy(this, 'scscm/app/orgAjax!updateTreeParent.do', 'post', params)
          console.log('updateTreeParent', data)
          if (data.map.state === '3') {
             this.$message.success('移动节点成功')
            this.getTreeList()
          } else {
            this.$message.error('移动节点失败')
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