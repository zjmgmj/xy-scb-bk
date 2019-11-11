<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(accordion, v-model="collapseName")
      el-collapse-item.slot-left(title="地区", name="1")
        left-tree(ref="leftTree", :button="treeButton", :data="treeData", :props="defaultProps", @nodeClick="treeNodeClick", @addEvent="addOrgHandler", @editEvent="editOrgHandler", @delEvent="delOrgHandler")
      el-collapse-item.slot-left(title="查询", name="2")
        left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search")
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
        @rowSelection="rowSelection")
    //- el-dialog(ref="dialog", :title="dialogTitle", :visible="dialogShow",  width="800px", @close="dialogHandler('cancel')")
    //-   el-form(v-if="dialogShow", ref="dialogForm", :model="smsTemplate", label-width="70px")
    //-     el-form-item(v-for="item in editForm", :label="item.lbl", :key="item.prop")
    //-       template(v-if="item.type === 'textarea'")
    //-         el-input(type="textarea", :rows="2", placeholder="请输入内容", v-model="smsTemplate[item.prop]", size="small")
    //-       template(v-else-if="item.type === 'select'")
    //-         el-select.full-width(
    //-           v-model="smsTemplate[item.prop]", 
    //-           :multiple="item.select.multiple ? item.select.multiple : false", 
    //-           :filterable="item.select.filterable",
    //-           :reserve-keyword="item.select.reserveKeyword",
    //-           :placeholder="item.placeholder"
    //-           :remote-method="item.select.remoteMethod",
    //-           size="small"
    //-         )
    //-           el-option(v-for="obj in item.select.list", :key="obj[item.select.labelProp]", :label="obj[item.select.labelProp]", :value="obj[item.select.labelProp]")
    //-       template(v-else)
    //-         el-input.full-width(v-model="smsTemplate[item.prop]", clearable, size="small", :placeholder="item.placeholder")
    //-   .dialog-footer(slot="footer")
    //-     el-button(@click="dialogHandler('cancel')", size="small") 取消
    //-     el-button(@click="dialogHandler('sure')", type="primary", size="small") 确定
    left-edit(:title="leftOrgTitle", :dialogShow="leftOrgDialog", @close="leftOrgDialog = false", @save="leftOrgSave", v-if="leftOrgDialog")
</template>

<script>  
  import { mapState } from 'vuex'
  import leftEdit from './leftEdit'
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
      leftEdit,
      leftSearch
    },
    data () {
      return {
        treeButton: [
          {type: 'add', label: '新增', icon: 'el-icon-document-add'}, 
          {type: 'edit', label: '编辑', icon: 'el-icon-edit'},
          {type: 'del', label: '删除', icon: 'el-icon-delete'}
        ],
        collapseName: ['1'],
        searchFormItems: [
          {lbl: '地区代码', prop: 'areaCode', val: ''},
          {lbl: '地区名称', prop: 'areaName', val: ''}
        ],
        leftOrgDialog: false,
        leftOrgTitle: '地区',
        treeData: [{label: '地区设置', children: [{label: '北京'},{label: '上海'},{label: '四川'},{label: '温州'}]}],
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        buttonGroupInfo: [
          // {lbl: '新增', type: 'add', icon: 'el-icon-plus'},
          // {lbl: '修改', type: 'edit', icon: 'el-icon-edit'},
          // {lbl: '删除', type: 'del', icon: 'el-icon-delete'},
          {lbl: '刷新', type: 'refresh', icon: 'el-icon-refresh'}
        ],
        // editForm: [
        //   {lbl: '机构名称', prop: 'orgName', placeholder: '请输入机构名称'},
        //   {lbl: '机构简称', prop: 'orgAbbreviate', placeholder: '请输入机构简称'},
        //   {lbl: '法人代表', prop: 'orgCorporation', placeholder: '请输入法人代表'},
        //   {lbl: '电话', prop: 'orgPhone', placeholder: '请输入电话'},
        //   {lbl: '传真', prop: 'orgFax', placeholder: '请输入传真'},
        //   {lbl: '地址', prop: 'orgAdd', placeholder: '请输入地址'},
        //   {lbl: '账号', prop: 'orgAccounts', placeholder: '请输入账号'},
        //   {lbl: '开户行', prop: 'orgBankname', placeholder: '请输入开户行'},
        //   {lbl: '税号', prop: 'orgTanu', placeholder: '请输入税号'},
        //   {lbl: '备注', prop: 'orgRemark', type: 'textarea', placeholder: '请输入备注'},
        // ],
        tableValue: {          
          hasCbx: true,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '地区名称', prop: 'areaName', width: '250px'},
            {lbl: '地区代码', prop: 'areaCode', width: '100px'},
            {lbl: '助记码', prop: 'areaMnemcode'}, 
            {lbl: '备注', prop: 'areaRemark'}
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
        // smsTemplate: {},
        // copySmsTemplate: {},
        // dialogTitle: '新增机构',
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
      // this.copySmsTemplate = JSON.parse(JSON.stringify(this.smsTemplate))
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
      leftOrgSave (data) {
        // console.log(this.$refs.leftTree.$refs.tree)
        let newNodeId = null
        if (!this.checkNode.node) {
          newNodeId = this.$refs.leftTree.data[0].$treeNodeId
        } else {
          newNodeId = this.checkNode.node.id++
          if (!this.checkNode.data.children) {
            this.$set(this.checkNode.data, 'children', [])
          }
        }        
        const newChild = {
          id: newNodeId,
          label: data.orgName,
          children: []
        }        
        this.checkNode.data.children.push(newChild)
        this.leftOrgDialog = false
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
        this.loadData()
      },      
      // dialogHandler (type) {
      //   if (type === 'sure') {
      //     this.$refs.dialogForm.validate((valid) => {
      //       if (valid) {
      //         this.createOrUpdate().then(() => {                
      //           this.loadData()                
      //           this.dialogShow = false
      //         })
      //       } else {
      //         console.log('error submit!!')
      //         return false
      //       }
      //     })          
      //   } else {
      //     this.dialogShow = false
      //   }
      //   this.smsTemplate = JSON.parse(JSON.stringify(this.copySmsTemplate))      
      // },
      // rowEdit (row) {        
      //   this.dialogTitle = '编辑机构'
      //   if (row) {
      //     this.smsTemplate = Object.assign({}, row)
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
      // async createOrUpdate () {
      //   try {
      //     const methods = this.smsTemplate.orgId ? 'put' : 'post'          
      //     const { data } = await this.proxy(this, 'basic-server/v1/basicInfo/org', methods, this.smsTemplate)
      //     if (data.return_code === 0) {            
      //       this.dialogShow = false
      //       this.msgShow(this, this.dialogTitle + '成功', 'success')
      //     } else {
      //       this.msgShow(this, data.errMsg)
      //     }
      //   } catch (e) {
      //     console.error(e)
      //     this.msgShow(this)
      //     this.loading = false
      //   }
      // },
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