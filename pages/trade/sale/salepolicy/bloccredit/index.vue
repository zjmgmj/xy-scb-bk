<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(accordion, v-model="collapseName")
      el-collapse-item.slot-left(title="控制级别", name="1")
        left-tree(
          ref="leftTree",                   
          :defaultExpandedKeys="['0']", 
          :nodeKey="'id'", 
          :iconClass="'el-icon-folder'"           
          :data="treeData", 
          :props="treeProps",
          :draggable="true",
          @nodeClick="treeNodeClick")      
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
    el-dialog(ref="dialog", title="客户信誉度设置", :visible="dialogShow", width="600px", @close="editCancel") 
      edit-box(v-if="dialogShow", :form="editForm" @save="editSave", @cancel="editCancel")
</template>

<script>  
  import { mapState } from 'vuex'
  import editBox from './edit'
  import buttonGroup from '~/components/buttonGroup.vue'  
  import erplrPanel from '~/components/erplrPanel'
  import basicElxTable from '~/components/basicElxTable'
  import leftTree from '@/components/leftTree'
  export default {
    layout: 'backend',
    components: {      
      basicElxTable,
      erplrPanel,
      buttonGroup,
      leftTree,
      editBox
    },
    data () {
      return {        
        collapseName: ['1'],
        treeData: [{text: '机构控制', id:'1', filterObj:"'{creditGrade:'1'}'"}],
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
          creditId: '',
          memberCode: '',
          areaCode: '',
          datasBalcorp: '',
          creditClass: '',
          creditGrade: '',
          creditUsermoney: '',
          operatorCode: '',
          employeeCode: '',
          deptCode: '',
          creditSdate: '',
          creditEdate: '',
          datasBalcorpname: '',
          orgCode: '',
          orgAbbreviate: '',
          creditMoney: '',
          creditState: 0,
          creditRemark: ''
        },
        tableValue: {          
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '启用', prop: 'creditState', width: '50px', formatter: ({cellValue}) => {
              return cellValue === 0 ? '√' : '×'
            }},
            {lbl: '启用日期', prop: 'creditSdate', width: '90px', formatter: ({cellValue}) => {
              return this.toDateString(cellValue, 'yyyy-MM-dd')
            }},
            {lbl: '失效日期', prop: 'creditEdate', width: '90px', formatter: ({cellValue}) => {
              return this.toDateString(cellValue, 'yyyy-MM-dd')
            }},
            {lbl: '金额', prop: 'creditMoney', g_type:'money'},            
            {lbl: '业务机构', prop: 'orgName', width: '130px'},
            {lbl: '制单人', prop: 'operatorName'},
            {lbl: '日期', prop: 'creditDate', width: '90px', formatter: ({cellValue}) => {
              return this.toDateString(cellValue, 'yyyy-MM-dd')
            }},
            {lbl: '备注', prop: 'creditRemark'},
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
          limit: this.pageSize
        },
        loading: false,
        dialogShow: false,
        copyEditForm: {},
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
      this.editForm.creditSdate = this.toDateString(new Date(), 'yyyy-MM-dd')
      this.editForm.creditEdate = this.toDateString(new Date(), 'yyyy-MM-dd')      
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
          Object.assign(this.editForm, queryBean)
          this.queryObject = {
            page: this.currentPage,
            otherlikeCol:0,
            start: 0,
            limit: this.pageSize,
            sort: '[{"property":"creditId","direction":"ASC"}]'
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
            if (!this.checkNode.data.creditGrade) {
              this.$message.error('请选择节点')
              return false
            }
            this.editForm.creditGrade = this.checkNode.data.creditGrade
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
          delete list[0]._XID
          this.delete({mod: list[0]})
          this.tableSelect = []
        })
      },
      async loadData () {
        this.loading = true
        try {          
          const { data } = await this.proxy(this, 'scscm/app/blocSaleCreditAjax.do', 'post', this.queryObject)
          this.tableValue.tableData = []
          this.tableSelect = []
          this.totalCount = 0
          if (data.list) {
            this.tableValue.tableData = data.list
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async delete (params) {
        try {          
          const { data } = await this.proxy(this, 'scscm/app/blocSaleCreditAjax!delete.do', 'post', params)
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
      }
    }
  }
</script>