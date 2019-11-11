<template lang="pug">
  erplr-panel(:right-padding="false")
    div(slot="left")
      el-collapse(accordion, v-model="collapseName")
        el-collapse-item.slot-left(title="菜单模块", name="1")
          left-tree(
            ref="leftTree",
            :data="treeData",
            :props="{children: 'children',label: 'text'}",
            @nodeClick="treeNodeClick")
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
          @row-dbclick="rowDbclick",
          @paginateChange="tableChange",
          @rowSelection="rowSelection")
      billtype-edit(v-if="billtypeEditDialog", :billtypeCode="treeFilterParam.billtypeCode", @close="billtypeEditDialog=false")
      el-dialog(ref="dialog", :title="dialogTitle", :visible="dialogShow",  width="600px", @close="editCancel")
        edit-box(v-if="dialogShow", :form="editForm", :permissionCode="treeFilterParam.permissionCode", :billtypeCode="treeFilterParam.billtypeCode", @save="editSave", @cancel="editCancel")
</template>

<script>
  import { mapState } from 'vuex'
  import editBox from './edit'
  import billtypeEdit from './billtypeEdit'
  import buttonGroup from '@/components/buttonGroup.vue'
  import erplrPanel from '@/components/erplrPanel'
  import basicElxTable from '@/components/basicElxTable'
  import leftTree from '@/components/leftTree'
  import leftSearch from '@/components/leftSearch'

  export default {
    layout: 'backend',
    name: 'BasicsBilltypeprint',
    components: {
      basicElxTable,
      erplrPanel,
      buttonGroup,
      leftTree,
      billtypeEdit,
      leftSearch,
      editBox
    },
    data() {
      return {
        collapseName: ['1'],
        searchFormItems: [
          { lbl: '名称', prop: 'billtypePrintName', val: '' },
          { lbl: '备注', prop: 'billtypePrintRemark', val: '' }
        ],
        treeData: [],
        buttonGroupInfo: [
          { lbl: '新增', type: 'add', icon: 'el-icon-plus' },
          { lbl: '修改', type: 'edit', icon: 'el-icon-edit' },
          { lbl: '删除', type: 'del', icon: 'el-icon-delete' },
          { lbl: '刷新', type: 'refresh', icon: 'el-icon-refresh' },
          { lbl: '设置控制', type: 'setting', icon: 'el-icon-document-add' },
        ],
        tableValue: {
          hasCbx: true,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            { lbl: '名称', prop: 'billtypePrintName', width: '250px' },
            { lbl: '菜单名称', prop: 'permissionName', width: '100px' },
            {
              lbl: '默认', prop: 'billtypePrintDefault', formatter: ({ cellValue }) => {
                const o = { 0: '×', 1: '√' }
                return o[cellValue] || cellValue
              }
            },
            { lbl: '备注', prop: 'billtypePrintRemark' },
            { lbl: '格式路径', prop: 'billtypePrintJsppath' }
          ],
          tableData: []
        },
        currentPage: 1,
        totalCount: 0,
        queryObject: {
          queryBean: {},
          sort: '[{"property":"billtypePrintName","direction":"ASC"}]'
        },
        loading: false,
        dialogShow: false,
        dialogTitle: '单据打印设置',
        billtypeEditDialog: false,
        editForm: {},
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
        this.proxy(this, 'scscm/app/billtypePrintAjax!queryTree.do', 'get', { areaParent: 'root' }).then(x => this.treeData = x.data.children)
      })
    },
    methods: {
      treeNodeClick(obj) {
        this.checkNode = obj
        this.queryObject.queryBean = this.deepCopy(this.treeFilterParam)
        this.queryObject.page = this.currentPage = 1
        this.loadData()
      },
      searchForm(values) {
        const queryBean = {
          treeFlag: 1,
          likeCol: ['billtypePrintName', 'billtypePrintRemark']
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
      rowDbclick(obj) {
        this.rowEdit(obj.row)
      },
      rowEdit(row) {
        if (row) {
          this.editForm = this.deepCopy(row)
        }
        this.dialogShow = true
      },
      rowDel(row) {
        this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
          const list = row ? [row] : this.tableSelect
          this.delete({ billtypePrint: list[0] })
        })
      },
      buttonGroupClick(type) {
        switch (type) {
          case 'add':
            if (!(this.checkNode.node && this.checkNode.node.isLeaf)) {
              this.$message.error('请选择末级节点')
              return false
            }
            this.editForm = undefined
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
            this.editForm = this.deepCopy(this.tableSelect[0])
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
            this.loadData()
            break
          case 'setting':
            if (!(this.checkNode.node && this.checkNode.node.isLeaf)) {
              this.$message.error('请选择末级节点')
              return false
            }
            this.billtypeEditDialog=true
            break
        }
      },
      async loadData() {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/billtypePrintAjax.do', 'post', this.queryObject)
          if ('billtypePrintList' in data) {
            this.tableValue.tableData = data.billtypePrintList
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async delete(params) {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/billtypePrintAjax!delete.do', 'post', params)
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
        }
        this.loading = false
      }
    }
  }
</script>
<style>
</style>
