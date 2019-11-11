<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(accordion, v-model="collapseName")
      el-collapse-item.slot-left(title="单据类型", name="1")
        left-tree(v-if="treeData.length > 0", @nodeClick="treeNodeClick", :iconClass="'el-icon-document'", ref="leftTree", :data="treeData", :props="treeProps")
        //- left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search", :labelWidth="'65px'")
  .erp-content(slot="right")
    .up(style="height: 70%")
      button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
      .table-content
        basic-elx-table(
          :tableValue="tableValue",
          :total="totalCount",
          :currentPage="currentPage",
          :pageSize="pageSize",
          :id="'table-up'",
          @paginateChange="tableChange",
          @tableRowEdit="rowEdit",
          @tableRowDel="rowDel",
          @rowSelection="rowSelection")
    .down(style="height: 29%")
      basic-elx-table(
        :id="'table-down'",
        :tableValue="tableBottomValue",      
        @rowSelection="rowSelection")
    edit-box(:form="editForm", @save="editSave", @close="editCancel", v-if="dialogShow")
</template>

<script>
  import { mapState } from 'vuex'
  import editBox from './edit'
  import buttonGroup from '~/components/buttonGroup.vue'  
  import erplrPanel from '~/components/erplrPanel'
  import basicElxTable from '~/components/basicElxTable'
  import leftSearch from '~/components/leftSearch'
  import leftTree from '~/components/leftTree'  
  export default {
    layout: 'backend',
    components: {      
      basicElxTable,
      erplrPanel,
      leftSearch,      
      buttonGroup,
      leftTree,
      editBox
    },
    data () {
      return {
        collapseName: ['1'],
        buttonGroupInfo: [
          {lbl: '新增', type: 'add', icon: 'el-icon-plus'},
          {lbl: '复制', type: 'copy', icon: 'el-icon-edit'},
          {lbl: '修改', type: 'edit', icon: 'el-icon-edit'},
          {lbl: '删除', type: 'del', icon: 'el-icon-delete'}
          // {lbl: '刷新', type: 'refresh', icon: 'el-icon-refresh'}
        ],
        editForm: {
          termsettingName: ''
        },        
        tableValue: {   
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '条款名称', prop: 'termsettingName'},
            {type: 'action', width: '100px', fixed: 'right', actionBtns: [
                {lbl: '修改', type: 'edit'}, 
                {lbl: '删除', type: 'del'}
              ]
            }
          ],
          tableData: []
        },
        treeData: [],
        treeProps: {
          children: 'children',
          label: 'text',
          isLeaf: 'leaf'
        },
        tableBottomValue: {   
          showRowIndex: true,
          tableHead: [
            {lbl: '排序', prop: 'termsettingSort', width: '100px'},
            {lbl: '条款名称', prop: 'termsettingText', width: '100px'},
            {lbl: '条款内容', prop: 'termsettingContent'}
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
        dialogShow: false,
        dialogTitle: '新增开户银行',
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
    },
    methods: {
      editSave() {
        this.editForm = {termsettingName: ''}
        this.dialogShow = false
        this.loadData()
      },
      editCancel () {
        this.editForm = {termsettingName: ''}
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
            sort: '[{"property":"termsettingSort","direction":"ASC"}]'
          }
          this.queryObject = Object.assign(this.queryObject, {queryBean: queryBean})
          this.tableBottomValue.tableData = []       
          this.loadData()
        }
        obj.data = Object.assign(obj.data, queryBean)
        this.checkNode = obj
      },
      rowSelection (row) {
        console.log('checkTable', row)
        if (row.length > 0) {
          this.tableSelect = row        
          const params = {
            termsettingCode: row[0].termsettingCode ? row[0].termsettingCode : null,
            page: 1,
            start: 0,
            limit: 25,
            sort: '[{"property":"termsettingSort","direction":"ASC"}]'
          }
          console.log(params)
          this.getDetail(params) 
        }        
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
            if (this.tableSelect.length > 1) {
              this.$message.error('只能选择一条数据编辑')
              return false
            }
            this.rowEdit()
            break
          case 'copy':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要复制的数据')
              return false
            }            
            this.rowEdit()
            this.editForm.flag = 'copy'
            break
          case 'del':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要删除的数据')
              return false
            }
            this.rowDel() 
            break
          case 'refresh':
            this.$refs.search.searchHandler()
            break
        }
      },
      rowEdit (row) {
        let objForm = this.tableSelect[0]
        if (row) {
          objForm = JSON.parse(JSON.stringify(row))
        }
        this.editForm = {
          termsettingName: objForm.termsettingName,
          termsettingCode: objForm.termsettingCode,
          termsettingId: objForm.termsettingId,
          memberCode: objForm.memberCode,
          billtypeCode: objForm.billtypeCode,
          tempDirty: objForm.tempDirty,
        }
        this.dialogShow = true
      },
      rowDel (row) {
        this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
          const list = row ? [row] : this.tableSelect
          const params = {
            termsettingCode: list[0].termsettingCode
          }
          this.delete(params)
        })
      },      
      async loadData () {
        this.loading = true
        try {          
          const { data } = await this.proxy(this, 'scscm/app/termsettingAjax.do', 'post', this.queryObject)
          this.tableValue.tableData = []
          this.tableSelect = []
          this.totalCount = 0
          if (data.termsettingList) {
            this.tableValue.tableData = data.termsettingList
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async getDetail (params) {
        this.loading = true
        try {          
          const { data } = await this.proxy(this, 'scscm/app/termsettingAjax!queryDetail.do', 'post', params)
          this.tableBottomValue.tableData = []
          if (data.termsettingList.length > 0) {
            this.tableBottomValue.tableData = data.termsettingList
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async delete (params) {
        try {          
          const { data } = await this.proxy(this, 'scscm/app/termsettingAjax!delete.do', 'post', params)
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
          const { data } = await this.proxy(this, 'scscm/app/termsettingAjax!queryTree.do', 'post', {billtypeCode: 'root'})
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