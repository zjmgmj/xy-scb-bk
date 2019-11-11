<template lang="pug">
  erplr-panel(:right-padding="false")
    div(slot="left")
      el-collapse(accordion, v-model="collapseName")
        el-collapse-item.slot-left(title="行业类别", name="1")
          left-tree(
            :data="treeData",
            :button="treeButton",
            :props="{children: 'children',label: 'text'}",
            @nodeClick="treeNodeClick",
            @editEvent="treeButtonClick")
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
      el-dialog(ref="dialog", :title="dialogTitle", :visible="dialogShow", width="600px", @close="editCancel")
        edit-box(v-if="dialogShow", :form="editForm" @save="editSave", @cancel="editCancel")
      el-dialog(ref="propertyDialog", title="物资属性", :visible="propertyShow", width="1000px", @close="editCancel")
        property-box(v-if="propertyShow", :industryCode="industryCode", @save="editSave", @cancel="editCancel")
      el-dialog(ref="treeEditDialog", title="行业类别组织", :visible="treeEditShow", width="600px", @close="editCancel")
        tree-edit-box(v-if="treeEditShow", :queryParam="treeFilterParam", @save="treeEditClose", @cancel="treeEditClose")
</template>

<script>
  import { mapState } from 'vuex'
  import editBox from './edit'
  import propertyBox from './property'
  import treeEditBox from './treeEdit'
  import buttonGroup from '@/components/buttonGroup.vue'
  import erplrPanel from '@/components/erplrPanel'
  import basicElxTable from '@/components/basicElxTable'
  import leftTree from '@/components/leftTree'

  export default {
    layout: 'backend',
    components: {
      basicElxTable,
      erplrPanel,
      buttonGroup,
      editBox,
      propertyBox,
      leftTree,
      treeEditBox
    },
    data() {
      return {
        collapseName: ['1'],
        treeData: [],
        treeButton: [{ label: '修改', type: 'edit', icon: 'el-icon-edit' }],
        buttonGroupInfo: [
          { lbl: '修改', type: 'edit', icon: 'el-icon-edit' },
          { lbl: '物资属性', type: 'property', icon: 'el-icon-edit' },
          { lbl: '刷新', type: 'refresh', icon: 'el-icon-refresh' }
        ],
        tableValue: {
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          showSummary: false,
          tableHead: [
            { lbl: '行业名称', prop: 'industryName' },
            { lbl: '行业代码', prop: 'industryCode' },
            {
              lbl: '计件模式', prop: 'goodsPiecemode', formatter: ({ cellValue }) => {
                const o = { 0: '默认', 1: '件只' }
                return o[cellValue] || cellValue
              }
            },
            {
              lbl: '计重模式', prop: 'goodsWeightmode', formatter: ({ cellValue }) => {
                const o = { 0: '默认', 1: '过磅理算', 2: '湿吨干吨' }
                return o[cellValue] || cellValue
              }
            },
            { lbl: '计量方式', prop: 'goodsMetering' },
            {
              lbl: '计价方式', prop: 'goodsPriceun', formatter: ({ cellValue }) => {
                const o = { 0: '重量', 1: '数量' }
                return o[cellValue] || cellValue
              }
            },
            { lbl: '物资属性', prop: 'goodsProperty' },
            { lbl: '备注', prop: 'orgRemark' }
          ],
          tableData: []
        },
        currentPage: 1,
        totalCount: 0,
        queryObject: {
          queryBean: {},
          sort: '[{"property":"industryCode","direction":"ASC"}]'
        },
        loading: false,
        dialogShow: false,
        dialogTitle: '行业类别设置',
        editForm: {},
        tableSelect: [],
        checkNode: {},
        propertyShow: false,
        industryCode: '',
        treeEditShow: false,
      }
    },
    computed: {
      ...mapState({
        pageSize: state => state.pageSize,
        currentUser: state => state.user.currentUser,
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
        this.proxy(this, 'scscm/app/industryAjax!queryTree.do', 'get', { industryParent: 'root' }).then(x => this.treeData = x.data.children)
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
      tableChange(val) {
        this.queryObject.page = this.currentPage = val
        this.loadData()
      },
      editSave() {
        this.dialogShow = false
        this.propertyShow = false
        this.queryObject.page = this.currentPage = 1
        this.loadData()
      },
      editCancel() {
        this.dialogShow = false
        this.propertyShow = false
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
          case 'property':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择数据')
              return false
            }
            if (this.tableSelect.length > 1) {
              this.$message.error('只能选择一条数据')
              return false
            }
            this.industryCode = this.tableSelect[0].industryCode
            this.propertyShow = true
            break
          case 'refresh':
            this.loadData()
            break
        }
      },
      treeButtonClick() {
        if (Object.keys(this.checkNode).length === 0) {
          this.$message.error('请选择需要编辑的节点')
          return false
        }
        this.treeEditShow = true
      },
      treeEditClose() {
        this.proxy(this, 'scscm/app/industryAjax!queryTree.do', 'get', { industryParent: 'root' }).then(x => this.treeData = x.data.children)

        this.treeEditShow = false
        this.tableValue.tableData = []
        this.editForm = {}
      },
      async loadData() {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/industryAjax.do', 'post', this.queryObject)
          if ('industryList' in data) {
            this.tableValue.tableData = data.industryList
            this.totalCount = data.totalCount
          }
          this.tableSelect = []
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
