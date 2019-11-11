<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(v-model="collapseName")
      el-collapse-item.slot-left(title="品名大类", name="1")
        //- left-tree(ref="leftTree", :data="treeData", :props="defaultProps", @nodeClick="treeNodeClick", @addEvent="addOrgHandler", @editEvent="editOrgHandler", @delEvent="delOrgHandler")
        left-tree(ref="leftTree", :data="treeData", :props="treeProps", @nodeClick="treeNodeClick")
      el-collapse-item.slot-left(title="查询", name="2")
        left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search", :labelWidth="'80px'")
  .erp-content(slot="right")
    button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
    .table-content
      basic-elx-table(
        :tableValue="tableValue",
        :total="totalCount",
        :currentPage="currentPage",
        :pageSize="pageSize",
        :loading="loading",
        @paginateChange="tableChange",
        @tableRowEdit="rowEdit",
        @tableRowDel="rowDel",
        @rowSelection="rowSelection")
    el-dialog(ref="dialog", title="物资代码设置", :visible="dialogShow", width="800px", @close="editCancel")
      edit-box(v-if="dialogShow", :form="editForm", @save="editSave", @cancel="editCancel")
    excel-import(
      upload-url="scscm/app/goodscodeAjax!uploadInitgoods.do",
      import-url="scscm/app/goodscodeAjax!importInitgoods.do",
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
        collapseName: ['1', '2'],
        searchFormItems: [
          {lbl: '物资代码', prop: 'goodscodeCode', val: ''},
          {lbl: '品名大类', prop: 'pntreeName', val: ''},
          {lbl: '品名', prop: 'partsnameName', val: ''},
          {lbl: '材质', prop: 'goodsMaterial', val: ''},
          {lbl: '规格', prop: 'goodsSpec', val: ''},
          {lbl: '产地', prop: 'productareaName', val: ''},
        ],
        treeData: [{text: '品名大类', children: []}],
        treeProps: {
          children: 'children',
          label: 'text',
          isLeaf: 'leaf'
        },
        buttonGroupInfo: [
          {lbl: '新增', type: 'add', icon: 'el-icon-plus'},
          {lbl: '修改', type: 'edit', icon: 'el-icon-edit'},
          {lbl: '删除', type: 'del', icon: 'el-icon-delete'},
          {lbl: '下载导入模板', type: 'down', icon: 'el-icon-edit'},
          {lbl: '导入', type: 'export', icon: 'el-icon-edit'}
        ],
        editForm: {
          partsnameName: '',
          goodsMaterial: '',
          goodsSpec: '',
          productareaName: '',
          partsnameNumunit: '',
          partsnameWeightunit: '',
          partsnameMnemcode: '',
          partsnameRemark: ''
        },
        tableValue: {          
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '物资代码', prop: 'goodscodeCode', width: '100px'},
            {lbl: '品名大类', prop: 'pntreeName'},
            {lbl: '品名', prop: 'partsnameName', minWidth: '120px'}, 
            {lbl: '材质', prop: 'goodsMaterial'}, 
            {lbl: '规格', prop: 'goodsSpec', minWidth: '120px'},
            {lbl: '产地', prop: 'productareaName'},
            {lbl: '税率', prop: 'goodsTaxrate'},
            {lbl: '数量单位', prop: 'partsnameNumunit', width: '80px'},
            {lbl: '重量单位', prop: 'partsnameWeightunit', width: '80px'},
            {lbl: '助记码', prop: 'partsnameMnemcode'},
            {lbl: '备注', prop: 'partsnameRemark'},
            {lbl: '计件模式', prop: 'goodsPiecemode', width: '80px'},
            {lbl: '计重模式', prop: 'goodsWeightmode', width: '80px'},
            {lbl: '计量方式', prop: 'goodsMetering', width: '80px'},
            {lbl: '计价方式', prop: 'goodsPriceun', width: '80px'},
            {lbl: '物资属性', prop: 'goodsProperty'},
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
          'queryBean.likeCol': ['goodscodeCode', 'pntreeName', 'partsnameName', 'goodsMaterial', 'goodsSpec', 'productareaName']
        },
        loading: false,
        dialogShow: false,
        copyEditForm: {},
        dialogTitle: '物资代码设置',
        tableSelect: [],
        checkNode: {},
        upload: {
          headerName: [],
          valueName: []
        },
        importShow: false
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
        this.getTreeList()
        // this.queryObject = {
        //   page: this.currentPage,
        //   otherlikeCol:0,
        //   start: 0,
        //   limit: this.pageSize
        // }
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
        this.currentPage = 1
        this.queryObject = {
          page: this.currentPage,
          otherlikeCol:0,
          start: 0,
          limit: this.pageSize,          
          sort: '[{"property":"goodscodeCode","direction":"DESC"}]'
        }
        const params = this.paramsFormat('queryBean', values)
        for (const key in params) {
          this.queryObject[key] = params[key]
          if (!this.queryObject[key]) {
            delete this.queryObject[key]
          }
        }        
        this.queryObject['queryBean.likeCol'] = ['goodscodeCode', 'pntreeName', 'partsnameName', 'goodsMaterial', 'goodsSpec', 'productareaName']
        this.loadData()    
      },
      treeNodeClick (obj) {
        this.checkNode = obj
        let filterObj = {}
        if (obj.data.filterObj) {
          this.currentPage = 1
          filterObj = this.getFilterObj(obj.data.filterObj)
          this.queryObject = {
            page: this.currentPage,
            otherlikeCol:0,
            start: 0,
            limit: this.pageSize,
            sort: '[{"property":"goodscodeCode","direction":"DESC"}]'
          }
          this.queryObject = Object.assign(this.queryObject, this.paramsFormat('queryBean', filterObj))          
          this.loadData()
        }
        this.checkNode = obj
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
            this.dialogTitle = '物资代码设置'
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
              sheetName: '物资代码导入'
            }
            this.tableValue.tableHead.map((item) => {
              excelBean.headerName.push(item.lbl)
              excelBean.valueName.push(item.prop)
            })
            const params = {
              excelBean: excelBean,
              sort: '[{"property":"goodscodeCode","direction":"ASC","root":"data"}]'
            }
            this.download(this, 'scscm/app/goodscodeAjax!downTemplet.do', params)
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
      importSuccess () {
        this.importShow = false
      },
      rowEdit (row) {        
        this.dialogTitle = '物资代码设置'
        if (row) {
          this.editForm = Object.assign({}, row)
        }
        this.dialogShow = true
      },
      rowDel (row) {
        this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
          const list = row ? [row] : this.tableSelect
          const params = {
            goodscodeCode: list[0].goodscodeCode
          }
          this.delete(this.paramsFormat('goodscode', params))
        })
      },      
      async loadData () {
        this.loading = true
        try {          
          const { data } = await this.proxy(this, 'scscm/app/goodscodeAjax.do', 'post', this.queryObject)
          this.tableValue.tableData = []
          this.totalCount = 0
          if (data.goodscodelist.length > 0) {
            this.tableValue.tableData = data.goodscodelist
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async getTreeList () {
        try {
          const { data } = await this.proxy(this, 'scscm/app/partsnameAjax!queryGoodscodeTree.do', 'post', {warehouseCode: 'root'})
          this.treeData[0].children = data.children
        } catch (e) {
          console.error(e)
        }
      },
      async delete (params) {
        try {          
          const { data } = await this.proxy(this, 'scscm/app/goodscodeAjax!delete.do', 'post', params)
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
  .bm-serch{}
</style>