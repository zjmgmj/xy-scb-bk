<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(accordion, v-model="collapseName")
      el-collapse-item.slot-left(title="查询", name="1")
        left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search", :labelWidth="'140px'")
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
        @rowSelection="rowSelection")
    el-dialog(ref="dialog", title="工作量类别系数设置", :visible="dialogShow", width="800px", @close="editCancel")
      edit-box(v-if="dialogShow", :form="editForm", @save="editSave", @cancel="editCancel")    
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
          {lbl: '修改', type: 'edit', icon: 'el-icon-edit'}
        ],
        editForm: {},
        rules: {},             
        searchFormItems: [
          {lbl: '名称', prop: 'billtypeName', val: ''},
          {lbl: '工作量登记方式', prop: 'billtypeWorktype', val: '', type: 'select', list:[], labelKey: 'ddShowname', valueKey: 'ddValue'},
          {lbl: '费用登记方式', prop: 'billtypeFeetype', val: '', type: 'select', list:[], labelKey: 'ddShowname', valueKey: 'ddValue'}
        ],        
        tableValue: {
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '代码', prop: 'billtypeCode'},
            {lbl: '名称', prop: 'billtypeName'},            
            {lbl: '系数', prop: 'billtypeWorkcoe'},
            {lbl: '工作量登记方式', prop: 'billtypeWorktype', formatter: (row, column, cellValue) => {
              let val = ''
              switch(cellValue){
                case 0:
                  val = '按汇总登记'
                  break
                case 1:
                  val = '按明细登记'
                  break
                case 2:
                  val = '按品名汇总'
                  break
                case 3:
                  val = '按大类汇总'
                  break
                default:
                  console.log('cellValue')
                  break
              }
              return val              
            }},
            {lbl: '费用登记方式', prop: 'billtypeFeetype', formatter: (row, column, cellValue) => {
              return cellValue === 0 ? '按汇总登记' : cellValue === 1 ? '按码单明细' : cellValue === 2 ? '按码单明细(成品)' : cellValue === 3 ? '按品名汇总' : cellValue === 4 ? '按大类汇总': cellValue === 5 ? '按码单汇总登记(成品)' : '无'
            }},
            {type: 'action', width: '80px', fixed: 'right', actionBtns: [
                {lbl: '修改', type: 'edit'}             
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
          'queryBean.likeCol': ['billtypeName'],
          typeStr: 'WLP014,WLP015,WLP001,WLP002,WLP003,WLP021,WLP040,WLP019,WLP009,WLP006,WLP004,WLP005,WLP010,WLP011',
          sort: '[{"property":"billtypeCode","direction":"ASC"}]'
        },
        loading: false,
        dialogShow: false,
        copyEditForm: {},
        dialogTitle: '工作量类别系数设置',
        tableSelect: []
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
        this.getBilltypeFeetype()
        this.getBilltypeWorktype()
        this.queryObject = {
          page: this.currentPage,
          otherlikeCol:0,
          start: 0,
          limit: this.pageSize,
          'queryBean.likeCol': ['billtypeName'],
          'queryBean.typeStr': 'WLP014,WLP015,WLP001,WLP002,WLP003,WLP021,WLP040,WLP019,WLP009,WLP006,WLP004,WLP005,WLP010,WLP011',
          sort: '[{"property":"billtypeCode","direction":"ASC"}]'
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
          'queryBean.typeStr': 'WLP014,WLP015,WLP001,WLP002,WLP003,WLP021,WLP040,WLP019,WLP009,WLP006,WLP004,WLP005,WLP010,WLP011',
          sort: '[{"property":"billtypeCode","direction":"ASC"}]'
        }
        const params = this.paramsFormat('queryBean', values)
        for (const key in params) {
          this.queryObject[key] = params[key]
          if (!this.queryObject[key]) {
            delete this.queryObject[key]
          }
        }        
        this.queryObject['queryBean.likeCol'] = ['billtypeName']
        this.loadData()    
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
          const { data } = await this.proxy(this, 'scscm/app/workcoeAjax.do', 'post', this.queryObject)
          this.tableValue.tableData = []
          this.totalCount = 0
          console.log(data)
          if (data.billtypeList) {
            this.tableValue.tableData = data.billtypeList
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async getBilltypeWorktype () {
        try {
          const { data } = await this.proxy(this, 'scscm/app/ddAjax!queryCombo.do', 'get', {ddtypeClass: 'billtypeWorktype'})        
          this.searchFormItems[1].list = []
          if (data.ddList.length > 0) {
            this.searchFormItems[1].list = data.ddList
          }        
        } catch (e) {
          console.error(e)
        }
      },
      async getBilltypeFeetype () {
        try {
          const { data } = await this.proxy(this, 'scscm/app/ddAjax!queryCombo.do', 'get', {ddtypeClass: 'billtypeFeetype'})        
          this.searchFormItems[2].list = []
          if (data.ddList.length > 0) {
            this.searchFormItems[2].list = data.ddList
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