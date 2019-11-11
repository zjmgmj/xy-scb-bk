<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(accordion, v-model="collapseName")
      el-collapse-item.slot-left(title="查询", name="1")
        left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search", :labelWidth="'80px'")        
      el-collapse-item.slot-left(title="地区", name="2")
        left-tree(ref="leftTree", :data="treeData", :props="defaultProps", @nodeClick="treeNodeClick", @addEvent="addOrgHandler", @editEvent="editOrgHandler", @delEvent="delOrgHandler")
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
    el-dialog(ref="dialog", :title="dialogTitle", top="0px" :visible="dialogShow", width="1600px", @close="editCancel") 
      edit-box(v-if="dialogShow", :form="editForm", @save="editSave", @cancel="editCancel")
      //- div 1111
    el-dialog(ref="mergeDialog", title="单位合并", :visible="mergeShow", width="800px", @close="mergeCancel")
      merge-box(v-if="mergeShow", :row="selectRow", @save="mergeSave", @cancel="mergeCancel")
</template>

<script>    
  import { mapState } from 'vuex'
  import editBox from './edit'
  import mergeBox from './merge'
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
      mergeBox
    },
    data () {
      return {
        mergeShow: false,
        selectRow: {},
        collapseName: ['1'],
        searchFormItems: [
          {lbl: '开始时间', type:'datetime', prop: 'createAtStart', val: ''},
          {lbl: '结束时间', type:'datetime', prop: 'createAtEnd', val: ''},
          {lbl: '代码', prop: 'companyCodeFilter', val: ''},
          {lbl: '名称', prop: 'companyName', val: ''},
          {lbl: '简称', prop: 'companyAbbreviate', val: ''},
          {lbl: '地区', prop: 'areaName', val: '', type: 'select', list: []},
          {lbl: '状态', prop: 'companyState', val: ''},
          {lbl: '信誉额度', prop: 'companyAssessCredit', val: ''},
          {lbl: '单位性质', prop: 'companyProperty', val: ''},
          {lbl: '客户类别', prop: 'companyType', val: ''},
          {lbl: '客户来源', prop: 'companySource', val: ''},
          {lbl: '业务关系', prop: 'companyAssessType', val: ''},
          {lbl: '单位类型', prop: 'companyClass', val: ''},
          {lbl: '所属行业', prop: 'companyIndustry', val: ''},
          {lbl: '经营范围', prop: 'companyRemark', val: ''}
        ],
        leftOrgDialog: false,
        leftOrgTitle: '新增组织',
        treeData: [{
          label: '类别', 
          children: []}],
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        buttonGroupInfo: [
          {lbl: '新增', type: 'add', icon: 'el-icon-plus'},
          {lbl: '修改', type: 'edit', icon: 'el-icon-edit'},
          {lbl: '删除', type: 'del', icon: 'el-icon-delete'},
          {lbl: '单位合并', type: 'merge', icon: 'el-icon-delete'},
          {lbl: '下载导入模板', type: 'del', icon: 'el-icon-delete'},
          {lbl: '导入', type: 'del', icon: 'el-icon-delete'},
          {lbl: '刷新', type: 'refresh', icon: 'el-icon-refresh'}
        ],
        rules: {},
        tableValue: {          
          hasCbx: true,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '代码', prop: 'companyCode', width: '100px'},
            {lbl: '名称', prop: 'companyName', width: '100px'},
            {lbl: '日期', prop: 'dataSystemdate'},
            {lbl: '简称', prop: 'companyAbbreviate'}, 
            {lbl: '状态', prop: 'companyStateStr'}, 
            {lbl: '信誉额度', prop: 'companyAssessCredit'}, 
            {lbl: '单位性质', prop: 'companyProperty'}, 
            {lbl: '客户类别', prop: 'companyType', width: '150px'}, 
            {lbl: '客户来源', prop: 'companySource'}, 
            {lbl: '单位类型', prop: 'companyClass'}, 
            {lbl: '所属行业', prop: 'companyIndustry'}, 
            {lbl: '电话', prop: 'companyPhone'}, 
            {lbl: '传真', prop: 'companyFax'}, 
            {lbl: '法人代表', prop: 'companyCorporation'}, 
            {lbl: '账号', prop: 'companyBankaccounts'}, 
            {lbl: '开户行', prop: 'companyBank'}, 
            {lbl: '税号', prop: 'companyTanu', width: '120px'}, 
            {lbl: '联系地址', prop: 'companyAddr', width: '120px'}, 
            {lbl: '地区', prop: 'areaName'}, 
            {lbl: '助记码', prop: 'companyMnemcode', width: '150px'}, 
            {lbl: '联系人', prop: 'companyLinkman', width: '150px'}, 
            {lbl: '邮政编码', prop: 'companyPostcode'}, 
            {lbl: '开票地址', prop: 'companyInvoiceaddr', width: '150px'}, 
            {lbl: '业务员', prop: 'employeeName', width: '150px'}, 
            {lbl: '分管部门', prop: 'deptName'}, 
            {lbl: '业务关系', prop: 'companyAssessTypeListStr', width: '150px'}, 
            {lbl: '内部机构', prop: 'companyOrgname'}, 
            {lbl: '授权模式', prop: 'companyPermitmodeStr'}, 
            {lbl: '登记机构', prop: 'orgName'}, 
            {lbl: '经营范围', prop: 'companyRemark'}
          ],
          tableData: []
        },
        currentPage: 1,
        totalCount: 0,
        queryObject: {
          currentPage: this.currentPage,
          pageSize: this.pageSize
        },
        loading: false,
        dialogShow: false,
        editForm: {},
        // copySmsTemplate: {},
        dialogTitle: '费用项目设置',
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
      // this.copySmsTemplate = JSON.parse(JSON.stringify(this.editForm))
    },
    mounted () {
      this.$nextTick(()=>{
        this.queryObject = {
          currentPage: this.currentPage,
          pageSize: this.pageSize
        }
        // this.loadData()
      })
    },
    methods: {
      searchForm (values) {
        for (const key in values) {
          this.queryObject[key] = values[key]
          if (!this.queryObject[key]) {
            delete this.queryObject[key]
          }
        }
        this.loadData()       
      },
      treeNodeClick (obj) {
        console.log(obj)
        this.checkNode = obj
      },      
      addOrgHandler () {
        console.log('---------add')
        this.leftOrgDialog = true
      },
      editOrgHandler () {
        this.leftOrgTitle = '编辑组织'
        this.leftOrgDialog = true
      },
      delOrgHandler () {},
      rowSelection (row) {
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
            console.log('add-------')
            this.dialogTitle = '费用项目设置'
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
            // this.smsTemplate = JSON.parse(JSON.stringify(this.tableSelect[0]))
            this.rowEdit()
            break
          case 'del':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要删除的数据')
              return false
            }
            this.rowDel() 
            break
          case 'merge':
            // if (this.tableSelect.length < 1) {
            //   this.$message.error('请选择需要删除的数据')
            //   return false
            // }
            this.mergeShow = true
            break
          case 'refresh':
            // this.$refs.search.searchHandler()
            this.loadData()
            break
        }
      },
      editSave (form) {
        console.log('form:', form)
        this.createOrUpdate(form).then(() => {                
          this.loadData()                
          this.dialogShow = false
        })
      }, 
      editCancel (type) {
        this.dialogShow = false
        // this.smsTemplate = JSON.parse(JSON.stringify(this.copySmsTemplate))      
      },
      mergeSave (form) {
        console.log('form:', form)
        this.mergeShow = false
      },
      mergeCancel () {
        this.mergeShow = false
      },
      rowEdit (row) {        
        this.dialogTitle = '费用项目设置'
        if (row) {
          this.editForm = Object.assign({}, row)
        }
        this.dialogShow = true
      },
      rowDel (row) {
        this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
          const list = row ? [row] : this.tableSelect
          let params = '/' + list[0].orgId
          if (list.length > 1) {
            const spIds = []
            list.map((item) => {
              spIds.push('spIds[]=' + item.orgId)
            })
            const spIdsStr = spIds.toString().replace(/,/g, '&')
            params = '?' + encodeURI(spIdsStr)
          }
          console.log(params)
          this.delete(params)
        })
      },      
      async loadData () {
        try {
          const { data } = await this.proxy(this, 'basic-server/v1/basicInfo/org', 'get', this.queryObject)
          if (data.return_code === 0) {          
            this.tableValue.tableData = data.list
            this.totalCount = data.total
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },      
      async createOrUpdate (form) {
        try {
          const methods = form.orgId ? 'put' : 'post'          
          const { data } = await this.proxy(this, 'basic-server/v1/basicInfo/org', methods, form)
          if (data.return_code === 0) {            
            this.dialogShow = false
            this.msgShow(this, this.dialogTitle + '成功', 'success')
          } else {
            this.msgShow(this, data.errMsg)
          }
        } catch (e) {
          console.error(e)
          this.msgShow(this)
          this.loading = false
        }
      },
      async delete (params) {
        try {          
          const { data } = await this.proxy(this, 'basic-server/v1/basicInfo/org'+ params, 'del')
          if (data.return_code === 0) {
            this.dialogShow = false
            this.msgShow(this, '删除成功', 'success')
            this.loadData()
          } else {
            this.msgShow(this, data.message)
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