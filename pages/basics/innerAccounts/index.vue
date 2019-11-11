<template lang="pug">
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
        @paginateChange="tableChange",
        @tableRowEdit="rowEdit",
        @tableRowDel="rowDel",
        @rowSelection="rowSelection")
    el-dialog(ref="dialog", title="企业账户设置", :visible="dialogShow", width="800px", @close="editCancel")
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
          {lbl: '新增', type: 'add', icon: 'el-icon-plus'},
          {lbl: '修改', type: 'edit', icon: 'el-icon-edit'},
          {lbl: '删除', type: 'del', icon: 'el-icon-delete'}          
        ],
        editForm: {
          inneraccountsCode:'',
          innerbankName:'',
          inneraccountsName:'',
          inneraccountsType:'',
          inneraccountsProperty:'',
          inneraccountsLinkman:'',
          ddTypeCurrency:'',
          inneraccountsRemark:'',
        },             
        searchFormItems: [
          {lbl: '账号', prop: 'inneraccountsCode', val: ''},
          {lbl: '账户名称', prop: 'inneraccountsName', val: ''}
        ],        
        tableValue: {          
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '账号', prop: 'inneraccountsCode', width: '180px'},
            {lbl: '银行名称', prop: 'innerbankName', width: '200px'},
            {lbl: '账户名称', prop: 'inneraccountsName', width: '220px'}, 
            {lbl: '账号类型', prop: 'inneraccountsType'}, 
            {lbl: '账号性质', prop: 'inneraccountsProperty'}, 
            {lbl: '联系人', prop: 'inneraccountsLinkman'}, 
            {lbl: '币种', prop: 'ddTypeCurrency'}, 
            {lbl: '备注', prop: 'inneraccountsRemark'}, 
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
          'queryBean.likeCol': ['inneraccountsCode', 'inneraccountsName'],
          sort:'[{"property":"inneraccountsCode","direction":"DESC"}]'
        },
        loading: true,
        dialogShow: false,        
        copyEditForm: {},
        dialogTitle: '企业账户设置',
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
      this.copyEditForm = JSON.stringify(this.editForm)
    },
    mounted () {
      this.$nextTick(()=>{
        this.queryObject = {
          page: this.currentPage,
          otherlikeCol:0,
          start: 0,
          limit: this.pageSize,
          'queryBean.likeCol': ['inneraccountsCode', 'inneraccountsName'],
          sort:'[{"property":"inneraccountsCode","direction":"DESC"}]'
        }
        this.loadData()
      })
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
            this.dialogTitle = '新增开户银行'
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
          sort: '[{"property":"inneraccountsCode","direction":"DESC"}]'
        }
        const params = this.paramsFormat('queryBean', values)
        for (const key in params) {
          this.queryObject[key] = params[key]
          if (!this.queryObject[key]) {
            delete this.queryObject[key]
          }
        }        
        this.queryObject['queryBean.likeCol'] = ['inneraccountsCode', 'inneraccountsName']
        this.loadData()    
      },
      rowEdit (row) {        
        this.dialogTitle = '企业账户设置'
        if (row) {
          this.editForm = Object.assign({}, row)
        }
        this.dialogShow = true
      },
      rowDel (row) {
        this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
          const list = row ? [row] : this.tableSelect
          const params = {
            inneraccountsCode: list[0].inneraccountsCode,
            memberCode: list[0].memberCode
          }
          this.delete(this.paramsFormat('inneraccounts', params))
        })
      },
      async loadData () {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/inneraccountsAjax.do', 'post', this.queryObject)
          this.tableValue.tableData = []
          this.totalCount = 0
          if (data.inneraccountsList.length > 0) {
            this.tableValue.tableData = data.inneraccountsList
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async delete (params) {
        try {          
          const { data } = await this.proxy(this, 'scscm/app/inneraccountsAjax!delete.do', 'post', params)
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