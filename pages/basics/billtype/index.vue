<template lang="pug">
  erplr-panel(:right-padding="false")
    div(slot="left")
      el-collapse(accordion, v-model="collapseName")
        el-collapse-item.slot-left(title="菜单模块", name="1")
          left-tree(
            :data="treeData",
            :props="{children: 'children', label: 'text'}",
            @nodeClick="treeNodeClick",)
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
      el-dialog(ref="dialog", :title="dialogTitle", :visible="dialogShow", top="10px" width="800px", @close="editCancel")
        edit-box(v-if="dialogShow", :form="editForm" @save="editSave", @cancel="editCancel")
</template>

<script>
  import { mapState } from 'vuex'
  import editBox from './edit'
  import buttonGroup from '@/components/buttonGroup.vue'
  import erplrPanel from '@/components/erplrPanel'
  import basicElxTable from '@/components/basicElxTable'
  import leftTree from '@/components/leftTree'
  import leftSearch from '@/components/leftSearch'

  export default {
    layout: 'backend',
    name: 'BasicsBilltype',
    components: {
      basicElxTable,
      erplrPanel,
      buttonGroup,
      leftTree,
      leftSearch,
      editBox
    },
    data() {
      return {
        collapseName: ['1'],
        treeData: [],
        searchFormItems: [
          { lbl: '代码', prop: 'billtypeCode', val: '' },
          { lbl: '名称', prop: 'billtypeName', val: '' }
        ],
        buttonGroupInfo: [
          { lbl: '修改', type: 'edit', icon: 'el-icon-edit' }
        ],
        tableValue: {
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            { lbl: '代码', prop: 'billtypeCode', width: '200px' },
            { lbl: '名称', prop: 'billtypeName', width: '140px' },
            {
              lbl: '关账控制', prop: 'billtypeClose', width: '70px', formatter: ({ cellValue }) => {
                const o = { 0: '√', 1: '×' }
                return o[cellValue] || cellValue
              }
            },
            {
              lbl: '审核控制', prop: 'billtypeCheck', width: '70px', formatter: ({ cellValue }) => {
                const o = { 0: '×', 1: '√' }
                return o[cellValue] || cellValue
              }
            },
            {
              lbl: '审核后打印', prop: 'billtypeCheckprint', width: '90px', formatter: ({ cellValue }) => {
                const o = { 0: '×', 1: '√' }
                return o[cellValue] || cellValue
              }
            },
            {
              lbl: '单据号生成模式', prop: 'billtypeBillcodemode', width: '120px', formatter: ({ cellValue }) => {
                const o = { 0: '自动', 1: '手动' }
                return o[cellValue] || cellValue
              }
            },
            { lbl: '单据号字段', prop: 'billcodeColumn', width: '200px' },
            { lbl: '单据主表', prop: 'billcodeTable', width: '200px' },
            { lbl: '标识符', prop: 'billtypeBillcodemark', width: '80px' },
            { lbl: '单据号规则', prop: 'billtypeRule', width: '200v' },
            { lbl: '打印次数', prop: 'billtypePrintnum', width: '80px' },
            { lbl: '备注', prop: 'billtypeRemark', width: '200px' }
          ],
          tableData: []
        },
        currentPage: 1,
        totalCount: 0,
        queryObject: {
          queryBean: {},
          sort: '[{"property":"billtypeCode","direction":"ASC"}]'
        },
        loading: false,
        dialogShow: false,
        editForm: {},
        dialogTitle: '单据类型设置',
        tableSelect: [],
        checkNode: {}
      }
    },
    computed: {
      ...mapState({
        pageSize: state => state.pageSize,
        currentUser: state => state.user.currentUser
      }),
      treeFilterParam() {
        let obj = null
        try {
          const s = this.checkNode.data.filterObj
          obj = eval('(' + s.substring(1, s.length - 1) + ')')
        } catch (e) {
          // console.error(e)
          obj = null
        }
        if (obj && Object.keys(obj).length === 0) {
          obj = null
        }
        return obj
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.queryObject.limit = this.pageSize
        this.proxy(this, 'scscm/app/billtypeAjax!queryTree.do', 'get', { menuParent: 'root' }).then(x => this.treeData = x.data.children)
      })
    },
    methods: {
      treeNodeClick(obj) {
        this.checkNode = obj
        if (obj.node.isLeaf) {
          this.queryObject.queryBean = this.deepCopy(this.treeFilterParam)
          this.queryObject.page = this.currentPage = 1
          this.loadData()
        } else {
          this.tableValue.tableData = []
        }
      },
      searchForm(values) {
        const queryBean = {
          treeFlag: 1,
          likeCol: ['billtypeCode', 'billtypeName']
        }
        for (const key in values) {
          queryBean[key] = values[key]
          if (!queryBean[key]) {
            delete queryBean[key]
          }
        }
        this.queryObject.queryBean = queryBean
        this.queryObject.otherlikeCol = 0
        this.queryObject.page = this.currentPage = 1
        this.loadData()
      },
      tableChange(val) {
        this.queryObject.page = this.currentPage = val
        this.loadData()
      },
      editSave() {
        this.dialogShow = false
        this.queryObject.page = this.currentPage = 1
        this.loadData()
      },
      editCancel() {
        this.dialogShow = false
      },
      rowSelection(row) {
        this.tableSelect = row
      },
      rowEdit(row) {
        if (row) {
          this.editForm = this.deepCopy(row)
        }
        this.dialogShow = true
      },
      buttonGroupClick(type) {
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
            this.editForm = this.deepCopy(this.tableSelect[0])
            this.rowEdit()
            break
          case 'refresh':
            // this.$refs.search.searchHandler()
            this.loadData()
            break
        }
      },
      async loadData() {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/billtypeAjax.do', 'post', this.queryObject)
          if ('billtypeList' in data) {
            this.tableValue.tableData = data.billtypeList
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
          this.tableValue.tableData = []
        }
        this.loading = false
      },
    }
  }
</script>
<style>
</style>
