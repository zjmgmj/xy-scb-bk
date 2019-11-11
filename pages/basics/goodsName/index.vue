<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(v-model="collapseName")
      el-collapse-item.slot-left(title="品名大类", name="1")
        left-tree(ref="leftTree", :button="treeButton", :data="treeData", :props="treeProps", @nodeClick="treeNodeClick", @addEvent="addTree", @editEvent="editTree", @delEvent="delTree")
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
    el-dialog(ref="dialog", title="品名设置", :visible="dialogShow", width="800px", @close="editCancel")
      edit-box(v-if="dialogShow", :form="editForm", @save="editSave", @cancel="editCancel")
    el-dialog(title="品名大类", :visible="treeEditShow", width="400px", @close="treeEditCancel")
      treeEditBox(v-if="treeEditShow", :form="treeEditForm", @save="treeEditSave", @cancel="treeEditCancel")
    formula-box(@close="formulaBoxClose", :form="formulaForm", v-if="formulaShow")
    coefficient-box(@close="coefficientBoxClose", :row="tableSelect[0]", v-if="coefficientShow")
</template>

<script>  
  import { mapState } from 'vuex'
  import editBox from './edit'
  import treeEditBox from './treeEdit'
  import formulaBox from './formula'
  import coefficientBox from './coefficient'
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
      formulaBox,
      coefficientBox,
      editBox,
      treeEditBox
    },
    data () {
      return {
        formulaForm: {
          partsnameFormula: '',
          goodsSpec: ''
        },
        treeEditShow: false,
        treeButton: [
          {type: 'add', label: '新增', icon: 'el-icon-document-add'}, 
          {type: 'edit', label: '编辑', icon: 'el-icon-edit'},
          {type: 'del', label: '删除', icon: 'el-icon-delete'}
        ],
        coefficientShow: false,
        formulaShow: false,
        collapseName: ['1', '2'],
        searchFormItems: [
          {lbl: '代码', prop: 'partsnameCode', val: ''},
          {lbl: '品名', prop: 'partsnameName', val: ''}
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
          {lbl: '公式', type: 'formula', icon: 'el-icon-edit'},
          {lbl: '系数', type: 'coefficient', icon: 'el-icon-edit'}          
        ],
        editForm: {
          partsnameName: '',
          partsnameMnemcode: '',
          industryCode: '',
          pntreeName: '',
          goodsPiecemode: '',
          goodsWeightmode: '',
          goodsMetering: '磅计',
          goodsPriceun: '',
          numberfieldformat: '',
          goodsTaxrate: '',
          partsnameRemark: ''
        },
        treeEditForm: {pntreeName: ''},
        rules: {
          employeeName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
          orgCode: [{ required: true, message: '请选择机构', trigger: 'change' }],
          deptCode: [{ required: true, message: '请选择部门', trigger: 'change' }]
        },
        tableValue: {          
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '品名', prop: 'partsnameName', width: '120px'},
            {lbl: '代码', prop: 'partsnameCode'},
            {lbl: '助记码', prop: 'partsnameMnemcode'}, 
            {lbl: '税率', prop: 'goodsTaxrate'}, 
            {lbl: '品名大类', prop: 'pntreeName'},
            {lbl: '计件模式', prop: 'goodsPiecemode'},
            {lbl: '计重模式', prop: 'goodsWeightmode'},
            {lbl: '计量方式', prop: 'goodsMetering'},
            {lbl: '计价方式', prop: 'goodsPriceun'},
            {lbl: '物资属性', prop: 'goodsProperty'},
            {lbl: '工作量系数', prop: 'partsnameWorkcoe', width: '120px'},
            {lbl: '理算公式', prop: 'partsnameFormula', minWidth: '120px'},
            {lbl: '备注', prop: 'partsnameRemark'},
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
          limit: this.pageSize
        },
        loading: false,
        dialogShow: false,
        copyEditForm: {},
        // dialogTitle: '新增库位',
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
        this.getTreeList()
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
      coefficientBoxClose(flag) {
        this.coefficientShow = false
        if (flag === 'reload') {
          this.loadData()
        }
      },
      formulaBoxClose (flag) {
        this.formulaShow = false
        if (flag === 'reload') {
          this.loadData()
        }        
      },
      searchForm (values) {
        this.currentPage = 1
        this.queryObject = {
          page: this.currentPage,
          otherlikeCol:0,
          start: 0,
          limit: this.pageSize
        }
        const params = this.paramsFormat('queryBean', values)
        for (const key in params) {
          this.queryObject[key] = params[key]
          if (!this.queryObject[key]) {
            delete this.queryObject[key]
          }
        }        
        this.queryObject['queryBean.likeCol'] = ['partsnameCode', 'partsnameName']
        this.loadData()    
      },
      treeNodeClick (obj) {
        this.checkNode = obj
        let filterObj = {}
        if (obj.data.filterObj) {
          filterObj = this.getFilterObj(obj.data.filterObj)
          this.queryObject = {
            page: this.currentPage,
            otherlikeCol:0,
            start: 0,
            limit: this.pageSize
          }
          this.queryObject = Object.assign(this.queryObject, this.paramsFormat('queryBean', filterObj))          
          this.loadData()
        }
        this.checkNode = obj
      },
      treeEditSave() {
        this.getTreeList()
        this.treeEditShow = false
      },
      treeEditCancel() {
        this.treeEditShow = false
      },
      addTree () {
        if (!this.checkNode.data.text) {
          this.$message.error('请选择节点')
          return
        }
        this.treeEditForm = {}
        this.treeEditForm.pntreeParentcode = this.checkNode.data.id        
        this.treeEditShow = true
      },
      editTree () {
        if (!this.checkNode.data.id) {
          this.$message.error('请选择需要修改的节点')
          return
        }
        const filterObj = this.getFilterObj(this.checkNode.data.filterObj)
        this.treeEditForm = filterObj
        this.treeEditForm.pntreeParentcode = this.checkNode.node.parent.data.id
        this.treeEditShow = true
      },
      delTree () {
        if (!this.checkNode.data.filterObj) {
          this.$message.error('请选择需要删除的节点')
          return
        }
        this.confirmDialog(this, '确定要删除当前记录？').then(() => {
          const filterObj = this.getFilterObj(this.checkNode.data.filterObj)
          this.deleteTree(filterObj)
        })
      },
      async deleteTree (params) {
        try {          
          const { data } = await this.proxy(this, 'scscm/app/partsnameAjax!deleteTree.do', 'post', this.paramsFormat('pntree', params))
          if (data.map.state === '3') {
            this.msgShow(this, '删除成功', 'success')
            this.getTreeList()
          } else {
            this.msgShow(this, data.map.msg)
          }
        } catch (e) {
          console.error(e)
          this.msgShow(this)
          this.loading = false
        }
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
            if (!this.checkNode.data.filterObj) {
              this.$message.error('请选择节点')
              return false
            }
            this.editForm = Object.assign(this.editForm, this.getFilterObj(this.checkNode.data.filterObj))
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
          case 'formula':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要编辑的数据')
              return false
            }
            console.log('formula')
            this.formulaForm.partsnameCode = this.tableSelect[0].partsnameCode
            this.formulaForm.partsnameFormula = this.tableSelect[0].partsnameFormula
            this.formulaShow = true
            break
          case 'coefficient':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要编辑的数据')
              return false
            }
            this.coefficientShow = true
            break
          default:            
            this.loadData()
            break
        }
      },
      rowEdit (row) {        
        // this.dialogTitle = '编辑库位'
        if (row) {
          this.editForm = Object.assign({}, row)
        }
        this.dialogShow = true
      },
      rowDel (row) {
        this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
          const list = row ? [row] : this.tableSelect
          const params = {
            partsnameCode: list[0].partsnameCode
          }
          this.delete(this.paramsFormat('partsname', params))
        })
      },      
      async loadData () {
        try {
          const { data } = await this.proxy(this, 'scscm/app/partsnameAjax.do', 'post', this.queryObject)
          this.tableValue.tableData = []
          this.totalCount = 0
          if (data.partsnameList.length > 0) {
            this.tableValue.tableData = data.partsnameList
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },      
      async getTreeList () {
        try {
          const { data } = await this.proxy(this, 'scscm/app/partsnameAjax!queryTree.do', 'post', {warehouseCode: 'root'})
          this.treeData[0].children = data.children
        } catch (e) {
          console.error(e)
        }
      },
      async delete (params) {
        try {          
          const { data } = await this.proxy(this, 'scscm/app/partsnameAjax!delete.do', 'post', params)
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