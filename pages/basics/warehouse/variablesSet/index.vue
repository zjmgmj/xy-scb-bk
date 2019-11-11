<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(v-model="collapseName")
      el-collapse-item.slot-left(title="仓库列表", name="1")
        left-tree(ref="leftTree", :data="treeData", :props="treeProps", @nodeClick="treeNodeClick")
      el-collapse-item.slot-left(title="查询", name="2")
        left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search", :labelWidth="'55px'")
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
    el-dialog(ref="dialog", title="库位设置", :visible="dialogShow", width="800px", @close="editCancel")
      edit-box(v-if="dialogShow", :form="editForm", @save="editSave", @cancel="editCancel")  
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
        collapseName: ['1', '2'],
        searchFormItems: [{lbl: '库位', prop: 'wareplaceName', val: ''}],        
        treeData: [{text: '仓库', children: []}],
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
          wareplaceName: '',
          wareplaceWregion: '',
          wareplaceGregion: '',
          wareplaceCtype: '',
          wareplaceMinnum: '',
          wareplaceMaxnum: '',
          wareplaceX: '',
          wareplaceY: '',
          deviceName: '',
          wareplaceRemark: ''
        },
        tableValue: {          
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '仓库', prop: 'warehouseName', width: '100px'},
            {lbl: '库区', prop: 'wareplaceWregion', width: '100px'},
            {lbl: '货区', prop: 'wareplaceGregion'}, 
            {lbl: '库位', prop: 'wareplaceName'}, 
            {lbl: '类型', prop: 'wareplaceCtype'}, 
            {lbl: '最低存放量', prop: 'wareplaceMinnum', width: '120px'},
            {lbl: '最大存放量', prop: 'wareplaceMaxnum', width: '120px'},
            {lbl: '图形行', prop: 'wareplaceX'},
            {lbl: '图形列', prop: 'wareplaceY'},
            {lbl: '视频设备', prop: 'deviceName'},
            {lbl: '备注', prop: 'wareplaceRemark'},
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
          start: 0,
          limit: this.pageSize
        },
        loading: false,
        dialogShow: false,
        copyEditForm: {},
        dialogTitle: '库位设置',
        tableSelect: [],
        checkNode: {data: {}}
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
      this.copyEditForm = JSON.parse(JSON.stringify(this.editForm))
    },
    mounted () {
      this.$nextTick(()=>{     
        this.getWareareaList()   
        this.queryObject = {
          page: this.currentPage,
          'queryBean.likeCol': ['wareplaceName'],  
          otherlikeCol:0,
          start: 0,
          limit: this.pageSize
        }
        // this.loadData()        
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
      searchForm (values) {
        const params = this.paramsFormat('queryBean', values)       
        for (const key in params) {
          this.queryObject[key] = params[key]
          if (!this.queryObject[key]) {
            delete this.queryObject[key]
          }
        }
        this.queryObject['queryBean.likeCol'] = ['wareplaceName']
        if (this.queryObject['queryBean.warehouseCode']) {
          delete this.queryObject['queryBean.warehouseCode']
        }
        this.currentPage = 1
        this.queryObject.page = this.currentPage
        this.queryObject.start = 0
        this.loadData()
      },
      treeNodeClick (obj) {        
        this.queryObject['queryBean.warehouseCode'] = obj.data.id
        this.checkNode = obj
        if (this.queryObject['queryBean.warehouseCode']) {
          delete this.queryObject['queryBean.likeCol']   
          this.currentPage = 1
          this.queryObject.page = this.currentPage
          this.queryObject.start = 0
          this.loadData()
        }
        
      },
      rowSelection (row) {
        this.tableSelect = row
      },
      tableChange (val) {
        console.log(val)
        this.currentPage = val
        this.queryObject.page = this.currentPage
        this.queryObject.start = (this.currentPage - 1) * this.pageSize
        this.loadData()
      },
      buttonGroupClick (type) {
        switch (type) {
          case 'add':            
            if (!this.checkNode.data.id) {
              this.$message.error('请选择节点')
              return false
            }
            this.editForm.warehouseCode = this.checkNode.data.id
            this.dialogTitle = '新增库区'
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
             if (this.tableSelect.length > 1) {
              this.$message.error('只能选择一条数据编辑')
              return false
            }
            this.rowDel() 
            break
          case 'refresh':
            // this.$refs.search.searchHandler()
            this.loadData()
            break
        }
      },
      rowEdit (row) {        
        this.dialogTitle = '编辑库区'
        if (row) {
          this.editForm = Object.assign({}, row)
        }
        this.dialogShow = true
      },
      rowDel (row) {
        this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
          const list = row ? [row] : this.tableSelect
          const params = {
            wareplaceCode: list[0].wareplaceCode
          }
          this.delete(this.paramsFormat('wareplace', params))
        })
      },
      async getWareareaList () {
        try {
          const { data } = await this.proxy(this, 'scscm/app/wareplaceAjax!queryTree.do', 'post', {warehouseCode: 'root'})
          this.treeData[0].children = data.children
          // return data.children
        } catch (e) {
          console.error(e)
        }
      },
      async loadData () {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/wareplaceAjax.do', 'post', this.queryObject)
          this.tableValue.tableData = []
          this.totalCount = 0
          if (data.wareplaceList.length > 0) {
            this.tableValue.tableData = data.wareplaceList
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async delete (params) {
        try {          
          const { data } = await this.proxy(this, 'scscm/app/wareplaceAjax!delete.do', 'post', params)
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