<template lang="pug">
//- 发采消息同步
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(accordion, v-model="collapseName")      
      el-collapse-item.slot-left(title="查询", name="1")
        left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search", :labelWidth="'70px'")
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
    el-dialog(ref="dialog", :title="dialogTitle", :visible="dialogShow",  width="900px", @close="editCancel") 
      edit-box(v-if="dialogShow", :form="editForm" @save="editSave", @cancel="editCancel")
</template>

<script>    
  import { mapState } from 'vuex'
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
      editBox
    },
    data () {
      return {
        collapseName: ['1'],
        searchFormItems: [
          {lbl: '起始日期', prop: 'operatorCode', val: '', type: 'date'},
          {lbl: '结束日期', prop: 'operatorUser', val: '', type: 'date'},
          {lbl: '标题', prop: 'operatorUserid', val: ''},
          {lbl: '内容', prop: 'operatorMobile', val: ''},
          {lbl: '状态', prop: 'orgCode', val: '', type:'select', list: []}          
        ],
        buttonGroupInfo: [
          {lbl: '同步发采', type: 'synchronize', icon: 'el-icon-delete'}
        ],
        rules: {},
        tableValue: {          
          hasCbx: true,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '状态', prop: 'operatorUser', width: '100px'},
            {lbl: '日期', prop: 'operatorCode', width: '100px'},
            {lbl: '接收人', prop: 'operatorNickname'},
            {lbl: '标题', prop: 'operatorUserid'}, 
            {lbl: '内容', prop: 'operatorMobile'}            
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
        dialogTitle: '操作员设置',
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
          case 'synchronize':
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
      rowEdit (row) {        
        this.dialogTitle = '操作员设置'
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