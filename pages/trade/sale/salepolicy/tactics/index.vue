<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(accordion, v-model="collapseName")
      el-collapse-item.slot-left(title="控制级别", name="1")
        left-tree(
          ref="leftTree",                   
          :defaultExpandedKeys="['销售策略分类']", 
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
        @rowSelection="rowSelection")
    el-dialog(ref="dialog", title="客户信誉度设置", :visible="dialogShow", width="600px", @close="editCancel") 
      edit-box(v-if="dialogShow", :form="editForm" :flag="editflag", @save="editSave", @cancel="editCancel")
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
        treeData: [{}],
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
          settingsId1: '',
          settingsCode1: '',
          settingsValueLength: '',
          settingsId_1: '',
          settingsCode_1: '',
          settingsId4_2: '',
          settingsCode4_2: '',
          settingsValue4_2: '',
          settingsId2: '',
          settingsCode2: '',
          settingsId3: '',
          settingsCode3: '',
          settingsId4: '',
          settingsCode4: '',
          settingsId4_1: '',
          settingsCode4_1: '',
          settingsType: '',
          settingsValue1: '',
          settingsValue_1: '',
          settingsValue2: '',
          settingsValue3: '',
          settingsValue4: '',
          settingsValue4_1: '',
          settingsValue4_21: '',
          settingsValue4_22: '',
          settingsValue4_23: '',
          settingsValue4_24: ''
        },
        tableValue: {          
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '代码', prop: 'settingsCode', width: '100px'},
            {lbl: '名称', prop: 'settingsName', width: '100px'},
            {lbl: '分类', prop: 'settingsType', width: '150px'},
            {lbl: '值', prop: 'settingsValue', width: '90px'},
            {lbl: '备注', prop: 'settingsRemark', width: '600px'}
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
        checkNode: {data: {}},
        editflag: ''
      }
    },
    computed: {
      ...mapState({
        pageSize: state => state.pageSize,
        currentUser: state => state.user.currentUser,
        saleTacticsTree: state => state.saleTacticsTree
      })
    },
    created () {
      this.treeData = this.saleTacticsTree
      this.toArray(this.treeData[0].children).map(item => {
        switch (item.id) {
          case '客户信誉度控制':
          case '集团内部信誉度控制':
          case '销售量控制':
          case '定价销售控制':
            item.settingsValueLength = 4
            break
          case '未定价销售控制':
            item.settingsValueLength = 2
            break
          case '销售合同是否进行销售价控制':
            item.settingsValueLength = 1
            break
          default:
            item.settingsValueLength = 0
            break
        }
      })
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
            if (!this.checkNode.data.id) {
              this.$message.error('请选择节点')
              return false
            }
            this.editForm.settingsType = this.checkNode.data.settingsType
            this.editForm.settingsValueLength = this.checkNode.data.settingsValueLength
            this.editForm.memberCode = this.checkNode.data.memberCode
            console.log(this.editForm)
            this.dialogShow = true
            break
          case 'edit':
            if (!this.checkNode.data.id) {
              this.$message.error('请选择节点')
              return false
            }
            if (this.tableValue.tableData.length === 0) {
              this.$message.error('请先新增')
              return false
            }
            this.editflag = 'edit'
            this.editForm = JSON.parse(JSON.stringify(this.tableValue.tableData[0]))
            this.editForm.settingsValueLength = this.totalCount
            this.dialogShow = true
            break
          case 'del':
            if (!this.checkNode.data.id) {
              this.$message.error('请选择节点')
              return false
            }
            if (this.tableValue.tableData.length === 0) {
              this.$message.error('请先新增')
              return false
            }
            this.rowDel() 
            break
          default:
            this.$refs.search.searchHandler()
            break
        }
      },
      rowDel (row) {
        this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
          const row = this.extend(true, this.tableValue.tableData[0])
          delete row._XID
          this.delete({beanMod: row})
        })
      },
      async loadData () {
        this.loading = true
        try {          
          const { data } = await this.proxy(this, 'scscm/app/saleTacticsAjax.do', 'post', this.queryObject)
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
          const { data } = await this.proxy(this, 'scscm/app/saleTacticsAjax!delete.do', 'post', params)
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