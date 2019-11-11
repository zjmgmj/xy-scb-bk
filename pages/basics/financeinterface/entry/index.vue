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
          :data="treeData", 
          :props="treeProps",
          :draggable="true",
          @nodeDragEnd="nodeDragEnd", 
          @nodeClick="treeNodeClick")
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
    el-dialog(ref="dialog", :title="dialogTitle", :visible="dialogShow", width="600px", @close="editCancel") 
      edit-box(v-if="dialogShow", :form="editForm" @save="editSave", @cancel="editCancel")
    el-dialog(ref="formula", title="取教公式", :visible="formulaShow", top="5px", width="600px", @close="formulaCancel") 
      formula-box(v-if="formulaShow", :tabRow="formulaRow", @cancel="formulaCancel", @save="formulaSave")
</template>

<script>  
  import { mapState } from 'vuex'
  import formulaBox from './formula'
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
      formulaBox
    },
    data () {
      return {
        formulaShow: false,
        collapseName: ['1'],
        treeData: [{id: '0000', text: '账套', children: []}],
        treeProps: {
          children: 'children',
          label: 'text',
          isLeaf: 'leaf'
        },
        buttonGroupInfo: [
          {lbl: '新增', type: 'add', icon: 'el-icon-plus'},
          {lbl: '修改', type: 'edit', icon: 'el-icon-edit'},
          {lbl: '删除', type: 'del', icon: 'el-icon-delete'},
          {lbl: '取教公式', type: 'formula', icon: 'el-icon-formula'}
        ],
        editForm: {
          financeSubjectCode: '',
          financeEntrySort: '',
          financeEntryDirection: 0,
          financeEntryConvert: '',
          financeEntrySum: '',
          financeEntryRemark: ''
        },
        tableValue: {          
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '单据类型', prop: 'billtypeName', width: '250px'},
            {lbl: '凭证科目', prop: 'financeSubjectCode', width: '100px'},
            {lbl: '借/贷', prop: 'financeEntryDirection', formatter: ({cellValue}) => {
              return cellValue === 1 ? '贷' : '借'
            }},
            {lbl: '负转借贷', prop: 'financeEntryConvert', formatter: ({cellValue}) => {
              return cellValue === 1 ? '√' : '×'
            }},
            {lbl: '求和汇总', prop: 'financeEntrySum', formatter: ({cellValue}) => {
              return cellValue === 1 ? '√' : '×'
            }},
            {lbl: '排序', prop: 'financeEntrySort'},
            {lbl: '备注', prop: 'financeEntryRemark'},
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
          sort: '[{"property":"financeEntryId","direction":"ASC"}]'
        },
        loading: false,
        dialogShow: false,
        copyEditForm: {},
        dialogTitle: '分录设置',
        tableSelect: [],
        formulaRow: {},
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
    },
    mounted () {},
    methods: {      
      nodeDragEnd (res) {
        // this.confirmDialog(this, '您确定要把该节点移至['+ res.dropNode.label +']下吗?').then((type) => {         
        //   const dragFilterObj = this.getFilterObj(res.draggingNode.data.filterObj)
        //   const params = {
        //       orgParent: res.dropNode.data.id,
        //       orgNodecode: res.draggingNode.data.id,
        //       memberCode: dragFilterObj.memberCode,
        //       orgCode: res.draggingNode.data.id
        //   }
        //   this.updateTreeParent({basicOrg: params})
        // }).catch(() => {
        //   this.treeData = JSON.parse(this.copyTreeData)
        // })
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
            sort: '[{"property":"financeEntryId","direction":"ASC"}]'
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
            this.editForm.financeLedgerName = this.checkNode.data.financeLedgerName
            this.editForm.billtypeCode = this.checkNode.data.billtypeCode
            this.editForm.memberCode = this.checkNode.data.memberCode
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
          case 'formula':
            this.formulaRow = JSON.parse(JSON.stringify(this.tableSelect[0]))
            this.formulaShow = true            
            break
          case 'refresh':
            // this.$refs.search.searchHandler()
            this.loadData()
            break
        }
      },
      formulaCancel (type) {
        this.formulaShow = false
      },
      formulaSave () {
        console.log('save')
        this.formulaShow = false
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
            financeEntryId: list[0].financeEntryId
          }
          this.delete({financeEntry: params})
        })
      },
      async loadData () {
        this.loading = true
        try {          
          const { data } = await this.proxy(this, 'scscm/app/financeEntryAjax.do', 'post', this.queryObject)
            // console.log(data)
          this.tableValue.tableData = []
          this.tableSelect = []
          this.totalCount = 0
          if (data.financeEntryList) {
            this.tableValue.tableData = data.financeEntryList
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async delete (params) {
        try {          
          const { data } = await this.proxy(this, 'scscm/app/financeEntryAjax!delete.do', 'post', params)
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
          const { data } = await this.proxy(this, 'scscm/app/financeEntryAjax!queryTree.do', 'post', {financeLedgerCode: 'root'})
          console.log('-----', data)
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