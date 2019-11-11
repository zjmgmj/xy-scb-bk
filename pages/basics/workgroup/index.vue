<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(accordion, v-model="collapseName")
      el-collapse-item.slot-left(title="查询", name="1")
        left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search", :labelWidth="'70px'")
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
    .down(style="height: 30%")
      basic-elx-table(
        :id="'table-down'",
        :tableValue="tableBottomValue")
    edit-box(:form="editForm", @save="editSave", @close="editCancel", v-if="dialogShow") 
</template>

<script>
  import { mapState } from 'vuex'
  import editBox from './edit'
  import buttonGroup from '~/components/buttonGroup.vue'  
  import erplrPanel from '~/components/erplrPanel'
  import basicElxTable from '~/components/basicElxTable'
  import leftSearch from '~/components/leftSearch'  
  export default {
    layout: 'backend',
    components: {      
      basicElxTable,
      erplrPanel,
      leftSearch,      
      buttonGroup,
      editBox
    },
    data () {
      return {
        collapseName: ['1'],
        buttonGroupInfo: [
          {lbl: '新增', type: 'add', icon: 'el-icon-plus'},
          {lbl: '修改', type: 'edit', icon: 'el-icon-edit'},
          {lbl: '删除', type: 'del', icon: 'el-icon-delete'}
        ],
        editForm: {
          workgroupCode: '',
          workgroupName: '',
          warehouseCode: '',
          orgCode: '',
          workgroupClass: '',
          workgroupRemark: ''
        },              
        searchFormItems: [
          {lbl: '代码', prop: 'workgroupCode', val: ''},
          {lbl: '组名', prop: 'workgroupName', val: ''},
          {lbl: '仓库', prop: 'warehouseName', val: ''},
          {lbl: '所属机构', prop: 'orgCode', val: ''},
          {lbl: '备注', prop: 'workgroupRemark', val: ''},
        ],        
        tableValue: {   
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '代码', prop: 'workgroupCode'},
            {lbl: '组名', prop: 'workgroupName'},
            {lbl: '仓库', prop: 'warehouseName'},
            {lbl: '类别', prop: 'workgroupClass'},
            {lbl: '所属机构', prop: 'orgName'},
            {lbl: '备注', prop: 'workgroupRemark'},
            {type: 'action', width: '100px', fixed: 'right', actionBtns: [
                {lbl: '修改', type: 'edit'}, 
                {lbl: '删除', type: 'del'}
              ]
            }
          ],
          tableData: []
        },
        tableBottomValue: {   
          showRowIndex: true,
          tableHead: [
            {lbl: '员工', prop: 'employeeName', width: '100px'},
            {lbl: '工种名称', prop: 'worktypeName'}
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
          'queryBean.likeCol': ['workgroupCode', 'workgroupName', 'workgroupRemark'],
          sort: '[{"property":"workgroupCode","direction":"DESC"}]'
        },
        loading: true,
        dialogShow: false,
        copyEditForm: {},
        dialogTitle: '工作组设置',
        tableSelect: []
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
      // this.getMsgTemplateGroup()
      this.copyEditForm = JSON.parse(JSON.stringify(this.editForm))
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
      editSave() {
        this.editForm = this.copyEditForm
        this.dialogShow = false
        this.loadData()
      },
      editCancel () {
        this.editForm = this.copyEditForm
        this.dialogShow = false
      },
      rowSelection (row) {
        // this.tableSelect = row
        if (row.length > 0) {
          this.tableSelect = row        
          const params = {
            workgroupCode: row[0].workgroupCode ? row[0].workgroupCode : null,
            page: 1,
            start: 0,
            limit: 25,
            sort:[{"property":"termsettingSort","direction":"ASC"}]
          }
          console.log(params)
          this.getDetail(params) 
        }
      },
      tableChange (val) {
        this.currentPage = val
        this.queryObject.page = this.currentPage
        this.queryObject.start = (this.currentPage - 1) * this.pageSize
        this.loadData()
      },
      buttonGroupClick (type) {
        switch (type) {
          case 'add':
            this.dialogTitle = '新增开户银行'
            this.dialogShow = true
            break
          case 'edit':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要编辑的数据')
              return false
            }
            // if (this.tableSelect.length > 1) {
            //   this.$message.error('只能选择一条数据编辑')
            //   return false
            // }
            // this.editForm = JSON.parse(JSON.stringify(this.tableSelect[0]))
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
            console.error('error')
        }
      },
      searchForm (values) {
        this.currentPage = 1
        this.queryObject = {
          page: this.currentPage,
          otherlikeCol:0,
          start: 0,
          limit: this.pageSize,                    
          sort: '[{"property":"workgroupCode","direction":"DESC"}]'
        }
        const params = this.paramsFormat('queryBean', values)
        for (const key in params) {
          this.queryObject[key] = params[key]
          if (!this.queryObject[key]) {
            delete this.queryObject[key]
          }
        }        
        this.queryObject['queryBean.likeCol'] = ['workgroupCode', 'workgroupName', 'workgroupRemark']
        this.loadData()    
      },
      rowEdit (row=null) {
        const rowData = row ? Object.assign({}, row) : JSON.parse(JSON.stringify(this.tableSelect[0]))
        const obj = {}
        for (const key in this.editForm) {
          obj[key] = rowData[key]
        }
        this.editForm = obj
        this.dialogShow = true
      },
      rowDel (row) {
        this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
          const list = row ? [row] : this.tableSelect
          const params = {
            workgroupCode: list[0].workgroupCode
          }
          this.delete(params)
        })
      },
      async getDetail (params) {
        try {
          const { data } = await this.proxy(this, 'scscm/app/workgroupAjax!queryDetail.do', 'post', params)
          this.tableBottomValue.tableData = []
          if (data.workgroupList.length > 0) {
            this.tableBottomValue.tableData = data.workgroupList
          }        
        } catch (e) {
          console.error(e)
        }
      },
      async loadData () {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/workgroupAjax.do', 'post', this.queryObject)
          this.tableValue.tableData = []
          this.totalCount = 0
          if (data.workgroupList.length > 0) {
            this.tableValue.tableData = data.workgroupList
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async delete (params) {
        try {          
          const { data } = await this.proxy(this, 'scscm/app/workgroupAjax!delete.do', 'post', params)
          console.log(data)
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
<style>
  .baidu-map{
    width: 100%;
    height: 550px;
  }
  .bm-serch{
  }
</style>