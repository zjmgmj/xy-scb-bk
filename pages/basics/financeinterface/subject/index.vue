<template lang="pug">
//- 单据类型维护
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(accordion, v-model="collapseName")      
      el-collapse-item.slot-left(title="查询", name="1")
        left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search", :labelWidth="'80px'")
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
    el-dialog(ref="dialog", :title="dialogTitle", :visible="dialogShow", width="800px", @close="editCancel") 
      edit-box(v-if="dialogShow", :form="editForm" @save="editSave", @cancel="editCancel")
    excel-import(
      upload-url="scscm/app/subjectSetAjax!uploadInitgoods.do",
      import-url="scscm/app/subjectSetAjax!importInitgoods.do",
      :extraParam="upload",
      @success="importSuccess",
      @cancel="importShow=false",
      v-if="importShow"
    )
</template>

<script>    
  import { mapState } from 'vuex'
  import editBox from './edit'
  import buttonGroup from '~/components/buttonGroup.vue'  
  import erplrPanel from '~/components/erplrPanel'
  import basicElxTable from '~/components/basicElxTable'
  import leftTree from '@/components/leftTree'
  import leftSearch from '~/components/leftSearch'
  import excelImport from '~/components/excelImport'
  export default {
    layout: 'backend',
    components: {      
      basicElxTable,
      erplrPanel,
      buttonGroup,
      leftTree,
      leftSearch,
      editBox,
      excelImport
    },
    data () {
      return {
        importShow: false,
        collapseName: ['1'],
        searchFormItems: [
          {lbl: '科目代码', prop: 'financeSubjectCode', val: ''},
          {lbl: '科目名称', prop: 'financeSubjectName', val: ''},        
          {lbl: '助记码', prop: 'financeSubjectMnemcode', val: ''}         
        ],
        buttonGroupInfo: [
          {lbl: '增加', type: 'add', icon: 'el-icon-plus'},
          {lbl: '修改', type: 'edit', icon: 'el-icon-edit'},
          {lbl: '删除', type: 'del', icon: 'el-icon-delete'},
          {lbl: '下载导入模板', type: 'down', icon: 'el-icon-delete'},
          {lbl: '导入', type: 'export', icon: 'el-icon-delete'}
        ],
        tableValue: {          
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          showSummary: false,
          tableHead: [            
            {lbl: '科目代码', prop: 'financeSubjectCode'},
            {lbl: '科目名称', prop: 'financeSubjectName'},
            {lbl: '助记码', prop: 'financeSubjectMnemcode'},
            {lbl: '是否启用', prop: 'financeSubjectStateStr'},
            {lbl: '余额方向', prop: 'financeSubjectDirectionStr'},
            {lbl: '外币核算', prop: 'currencyCodeStr'},
            {lbl: '数量金额辅助核算', prop: 'financeSubjectNumberStr', width: '120px'},
            {lbl: '计量单位', prop: 'financeSubjectUnit'},
            {lbl: '现金科目', prop: 'financeSubjectCashStr'},
            {lbl: '银行科目', prop: 'financeSubjectBankStr'},
            {lbl: '现金流量科目', prop: 'financeSubjectCashproStr'},
            {lbl: '核算项目', prop: 'financeSubjectItemShowStr'},
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
          'queryBean.likeCol': ['financeSubjectCode', 'financeSubjectName', 'financeSubjectMnemcode'],
          sort: '[{"property":"financeSubjectCode","direction":"ASC"}]'
        },
        loading: false,
        dialogShow: false,
        editForm: {
          financeSubjectCode: '',
          financeSubjectType: '',
          financeSubjectName:'',
          financeSubjectMnemcode: '',
          currencyCode: '',
          financeSubjectDirection: 0,
          financeSubjectState: '',
          financeSubjectNumber: '',
          financeSubjectUnit: '',
          financeSubjectCash: '',
          financeSubjectBank: '',
          financeSubjectCashpro: '',
          financeSubjectItemSeq1: '',
          financeSubjectItemSeq2: '',
          financeSubjectItemSeq3: '',
          financeSubjectItemSeqOthersName: ''
        },
        dialogTitle: '科目设置',
        tableSelect: [],
        upload: {
          headerName: [],
          valueName: []
        }
      }
    },
    computed: {
      ...mapState({
        pageSize: state => state.pageSize,
        currentUser: state => state.user.currentUser
      })
    },
    created () {
      this.copyEditForm = JSON.parse(JSON.stringify(this.editForm))
    },
    mounted () {
      this.$nextTick(()=>{
        this.queryObject = {
          page: this.currentPage,
          otherlikeCol:0,
          start: 0,
          limit: this.pageSize,
          'queryBean.likeCol': ['financeSubjectCode', 'financeSubjectName', 'financeSubjectMnemcode'],
          sort: '[{"property":"financeSubjectCode","direction":"ASC"}]'
        }
        this.loadData()
      })
    },
    methods: {
      importSuccess () {
        this.importShow = false
        console.log('success')
      },
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
        this.tableSelect = row
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
            this.dialogTitle = '科目设置'
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
          case 'down':
            const excelBean = {
              headerName: [],
              valueName: [],
              valueFormatMapStr: '',
              sheetName: '凭证科目导入'
            }
            this.tableValue.tableHead.map((item) => {
              excelBean.headerName.push(item.lbl)
              excelBean.valueName.push(item.prop)
            })
            const params = {
              excelBean: excelBean,
              sort: '[{"property":"financeSubjectCode","direction":"ASC","root":"data"}]'
            }
            this.download(this, 'scscm/app/subjectSetAjax!downTemplet.do', params)
            break
          case 'export':
            this.tableValue.tableHead.map((item) => {
              this.upload.headerName.push(item.lbl)
              this.upload.valueName.push(item.prop)
            }) 
            this.importShow = true                  
            break
          default:
            this.loadData()
            break
        }
      },
      searchForm (values) {
        this.currentPage = 1
        this.queryObject = {
          page: this.currentPage,
          otherlikeCol:0,
          start: 0,
          limit: this.pageSize,
          sort: '[{"property":"financeSubjectCode","direction":"ASC"}]'
        }
        const params = this.paramsFormat('queryBean', values)
        for (const key in params) {
          this.queryObject[key] = params[key]
          if (!this.queryObject[key]) {
            delete this.queryObject[key]
          }
        }        
        this.queryObject['queryBean.likeCol'] = ['financeSubjectCode', 'financeSubjectName', 'financeSubjectMnemcode']
        this.loadData()    
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
          this.delete({mod: list[0]})
        })
      },
      async loadData () {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/subjectSetAjax.do', 'post', this.queryObject)
          this.tableValue.tableData = []
          this.totalCount = 0
          if (data.list.length > 0) {
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
          const { data } = await this.proxy(this, 'scscm/app/subjectSetAjax!delete.do', 'post', params)
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
</style>