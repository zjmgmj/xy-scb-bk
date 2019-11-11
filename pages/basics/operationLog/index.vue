<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(accordion, v-model="collapseName")
      el-collapse-item.slot-left(title="查询", name="1")
        left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search", :labelWidth="'90px'")      
  .erp-content(slot="right")
    el-button(size="mini", type="primary", @click="printShow") 打印[客户端]
    el-dropdown.ml-10(trigger="click")
      el-button(size="mini", type="success") 输出
      el-dropdown-menu(slot="dropdown")
        el-dropdown-item PDF
        el-dropdown-item Word
        el-dropdown-item Excel 分页导出
        el-dropdown-item Excel 原样导出
    .table-content
      basic-elx-table(
        :tableValue="tableValue",
        :total="totalCount",
        :currentPage="currentPage",
        :pageSize="pageSize",
        :loading="loading"   
        @paginateChange="tableChange",
        @rowSelection="rowSelection")   
    el-dialog(ref="dialog", :title="dialogTitle", :visible="dialogShow", width="400px", @close="printCancel") 
      print-box(v-if="dialogShow", @save="printHandler", @cancel="printCancel")
      //- edit-box(v-if="dialogShow", :form="editForm", @save="editSave", @cancel="editCancel")     
</template>

<script>    
  import { mapState } from 'vuex'
  import printBox from './print'
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
      printBox
    },
    data () {
      return {
        mergeShow: false,
        collapseName: ['1'],
        exportFlag: '',
        exportButton: [
          {value: 'PDF', label: 'PDF'}, 
          {value: 'Excel', label: 'Excel', children: [
            {value: '分页导出', label: '分页导出'},
            {value: '原样导出', label: '原样导出'}
          ]},
          {value: 'Word', label: 'Word'}
        ],
        searchFormItems: [
          {lbl: '起始时间', prop: 'startTime', val: '', type:'datetime'},
          {lbl: '结束时间', prop: 'endTime', val: '', type:'datetime'},
          {lbl: '操作员', prop: 'userPhone', val: '', type: 'select', list: []},
          {lbl: '日志级别', prop: 'cbName', val: '', type: 'select', list: []},
          {lbl: 'IP地址', prop: 'cbCode', val: ''},
          {lbl: '机器名称', prop: 'rcbType', val: ''},
          {lbl: '操作信息', prop: 'userRemark', val: ''},
          {lbl: '操作方法', prop: 'userRemark1', val: ''},
          {lbl: '服务器名称', prop: 'userRemark2', val: ''}
        ],
        buttonGroupInfo: [
          {lbl: '打印', type: 'print', icon: 'el-icon-plus'}        
        ],
        rules: {},
        tableValue: {          
          hasCbx: true,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '日期', prop: 'userName', width: '100px'},
            {lbl: '操作员', prop: 'userNickname', width: '100px'},
            {lbl: '操作信息', prop: 'userPhone'},
            {lbl: '操作方法', prop: 'userEmail'}, 
            {lbl: 'IP地址', prop: 'cbName'}, 
            {lbl: '机器名称', prop: 'cbCode'}, 
            {lbl: '服务器名称', prop: 'userDate'}, 
            {lbl: '日志级别', prop: 'rcbType', width: '150px'}            
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
        // editForm: {},
        // copySmsTemplate: {},
        dialogTitle: '打印',
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
            this.dialogTitle = '打印'
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
            // this.rowEdit()
            break
          case 'del':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要删除的数据')
              return false
            }
            // this.rowDel() 
            break
          case 'refresh':
            // this.$refs.search.searchHandler()
            this.loadData()
            break
        }
      },
      printShow () {
        this.dialogShow = true
      },
      exportHandler (val) {
        console.log(val)
      },
      printCancel () {
        this.dialogShow = false
      },
      printHandler () {
        console.log('print')
      },
      // editSave (form) {
      //   console.log('form:', form)
      //   this.createOrUpdate(form).then(() => {                
      //     this.loadData()                
      //     this.dialogShow = false
      //   })
      // }, 
      // editCancel (type) {
      //   this.dialogShow = false
      //   // this.smsTemplate = JSON.parse(JSON.stringify(this.copySmsTemplate))      
      // },
      // rowEdit (row) {        
      //   this.dialogTitle = '远程协同管理'
      //   if (row) {
      //     this.editForm = Object.assign({}, row)
      //   }
      //   this.dialogShow = true
      // },
      // rowDel (row) {
      //   this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
      //     const list = row ? [row] : this.tableSelect
      //     let params = '/' + list[0].orgId
      //     if (list.length > 1) {
      //       const spIds = []
      //       list.map((item) => {
      //         spIds.push('spIds[]=' + item.orgId)
      //       })
      //       const spIdsStr = spIds.toString().replace(/,/g, '&')
      //       params = '?' + encodeURI(spIdsStr)
      //     }
      //     console.log(params)
      //     this.delete(params)
      //   })
      // },      
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