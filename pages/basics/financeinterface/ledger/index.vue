<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(accordion, v-model="collapseName")
      el-collapse-item.slot-left(title="账套设置", name="1")
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
      //- el-collapse-item.slot-left(title="查询", name="2")
      //-   left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search") 
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
    //- left-edit(:title="leftOrgTitle", :dialogShow="leftOrgDialog", @close="leftOrgDialog = false", @save="leftOrgSave", v-if="leftOrgDialog")
    el-dialog(title="账套设置", :visible="treeEditShow", width="800px", @close="treeEditCancel")
      tree-edit(v-if="treeEditShow", :form="treeEditForm", @save="treeEditSave", @cancel="treeEditCancel")
    el-dialog(ref="dialog", title="单据设置", :visible="dialogShow", width="600px", @close="editCancel") 
      edit-box(v-if="dialogShow", :form="editForm" @save="editSave", @cancel="editCancel")
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
        copyTreeEditForm: {},
        treeEditForm: {
          financeLedgerOrglist: [],
          financeLedgerPermitlist: [],
          financeLedgerId: '',
          financeLedgerCode: '',
          memberCode: '',
          financeLedgerType: 0,
          financeLedgerName: '',
          financeLedgerOrgName: '', 
          financeLedgerPermitName: '',
          financeLedgerUrl: '',
          financeLedgerRemark: '',
          financeLedgerFlag: 0
        },
        treeEditShow: false,
        copyTreeData: [],
        treeData: [{id: '0000', text: '账套', children: []}],
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
          financeBilltypeId: '',
          memberCode: '',
          financeLedgerCode: '',
          financeVoutypeCode: '',
          billtypeCode: '',
          financeBilltypeIsuser: 1,
          financeBilltypeRemark: ''
        },
        tableValue: {          
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '单据类型', prop: 'billtypeName', width: '250px'},
            {lbl: '启用', prop: 'financeBilltypeIsuser', width: '100px', formatter: ({cellValue}) => {
              return cellValue === 1 ? '√' : '×'
            }},
            {lbl: '备注', prop: 'financeBilltypeRemark'},
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
          sort: '[{"property":"financeLedgerCode","direction":"ASC"}]'
        },
        loading: false,
        dialogShow: false,
        copyEditForm: {},
        dialogTitle: '单据设置',
        tableSelect: [],
        checkNode: {data: {}}
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
      this.copyTreeEditForm = JSON.stringify(this.treeEditForm)
    },
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
        if (!this.checkNode.data.id) {
          this.$message.error('请选择节点')
          return
        }
        if (this.checkNode.data.text !== '账套') {
          this.treeEditForm = Object.assign(this.treeEditForm, this.getFilterObj(this.checkNode.data.filterObj))
        }      
        this.treeEditForm.financeLedgerFlag = 0
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
          const { data } = await this.proxy(this, 'scscm/app/financeLedgerAjax!editTree.do', 'post', {ledger: this.getFilterObj(this.checkNode.data.filterObj)})          
          this.treeEditForm = data.ledger
          this.treeEditForm.financeLedgerOrglist = data.ledger.financeLedgerOrglist === '-1' ? [] : data.ledger.financeLedgerOrglist.split(',')
          this.treeEditForm.financeLedgerPermitlist = data.ledger.financeLedgerPermitlist === '-1' ? [] : data.ledger.financeLedgerPermitlist.split(',')
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
      treeEditCancel() {
        this.treeEditForm = JSON.parse(this.copyTreeEditForm)
        this.treeEditShow = false
      },
      treeEditSave() {
        this.getTreeList()
        this.treeEditForm = JSON.parse(this.copyTreeEditForm)
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
            sort: '[{"property":"financeLedgerCode","direction":"ASC"}]'
          }
          this.queryObject = Object.assign(this.queryObject, queryBean)  
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
            this.editForm.financeLedgerCode = this.checkNode.data.financeLedgerCode
            this.editForm.memberCode = this.checkNode.data.memberCode
            console.log(this.editForm)
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
        console.log('row', row)
        if (row) {
          this.editForm = Object.assign({}, row)
        }
        this.dialogShow = true
      },
      rowDel (row) {
        this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
          const list = row ? [row] : this.tableSelect
          const params = {
            financeVoutypeCode: list[0].financeVoutypeCode
          }
          this.delete({ledgerBilltype: params})
        })
      },
      async loadData () {
        this.loading = true
        try {          
          const { data } = await this.proxy(this, 'scscm/app/financeLedgerAjax.do', 'post', this.queryObject)
          this.tableValue.tableData = []
          this.tableSelect = []
          this.totalCount = 0
          if (data.ledgerBilltypeList) {
            this.tableValue.tableData = data.ledgerBilltypeList
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async delete (params) {
        try {          
          const { data } = await this.proxy(this, 'scscm/app/financeLedgerAjax!delete.do', 'post', params)
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
          const { data } = await this.proxy(this, 'scscm/app/financeLedgerAjax!queryLedger.do', 'post', {financeLedgerCode: 'root'})
          this.treeData[0].children = data.children
          this.treeProps = {
            children: 'children',
            label: 'text',
            isLeaf: 'leaf'
          }
        } catch (e) {
          console.error(e)
        }
      },
      async deleteTree (params) {
        try {          
          const { data } = await this.proxy(this, 'scscm/app/financeLedgerAjax!deleteTree.do', 'post', this.paramsFormat('ledger', params))
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
      async updateTreeParent (params) {
        try {
          const { data } = await this.proxy(this, 'scscm/app/financeLedgerAjax!updateTreeParent.do', 'post', params)
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