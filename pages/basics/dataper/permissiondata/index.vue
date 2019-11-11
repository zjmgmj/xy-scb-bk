<template lang="pug">
  erplr-panel(:right-padding="false")
    div(slot="left")
      el-collapse(accordion, v-model="collapseName")
        el-collapse-item.slot-left(title="数据权限", name="1")
          left-tree(
            ref="leftTree",
            :data="treeData",
            :props="{children: 'children',label: 'text'}",
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
      el-dialog(ref="dialog", :title="dialogTitle", :visible="dialogShow", top="5px", width="1200px", @close="editClose")
        edit-box(v-if="dialogShow", :dataperCode="treeFilterParam.dataperCode", @close="editClose")
</template>

<script>
  import { mapState } from 'vuex'
  import editBox from './edit'
  import buttonGroup from '@/components/buttonGroup.vue'
  import erplrPanel from '@/components/erplrPanel'
  import basicElxTable from '@/components/basicElxTable'
  import leftTree from '@/components/leftTree'
  import leftSearch from '@/components/leftSearch'

  const formatter = ({ cellValue }) => {
    const o = { 0: '角色', 1: '启用', 2: '停用' }
    return o[cellValue] || cellValue
  }

  export default {
    layout: 'backend',
    name: 'BasicsPermissiondata',
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
        buttonGroupInfo: [
          { lbl: '分配', type: 'allocation', icon: 'el-icon-edit' }
        ],
        tableValue: {
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            { lbl: '名称', prop: 'dataperItemstr' },
            { lbl: '操作员/角色', prop: 'operatorName' },
            { lbl: '查询权', prop: 'dataperRstate', formatter },
            { lbl: '编辑权', prop: 'dataperWstate', formatter }
          ],
          tableData: []
        },
        currentPage: 1,
        totalCount: 0,
        queryObject: {
          queryBean: {
            dataperCode: '',
            memberCode: '0000'
          },
          sort: '[{"property":"dataperItemstr","direction":"ASC"},{"property":"permissionFlag","direction":"ASC"}]'
        },
        loading: false,
        dialogShow: false,
        dialogTitle: '数据权限设置',
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
        this.proxy(this, '/scscm/app/permissionDataAjax!queryTree.do').then(x => this.treeData = x.data.children)
      })
    },
    methods: {
      treeNodeClick(obj) {
        this.checkNode = obj
        this.loadData()
      },
      tableChange(val) {
        this.currentPage = val
        this.loadData()
      },
      editClose() {
        this.dialogShow = false
        this.currentPage = 1
        this.loadData()
      },
      rowSelection(row) {
        this.tableSelect = row
      },
      buttonGroupClick(type) {
        switch (type) {
          case 'allocation':
            if (this.checkNode && Object.keys(this.checkNode).length > 0) {
              this.dialogShow = true
            } else {
              this.$message.error('请选择节点')
            }
            break
          case 'refresh':
            this.loadData()
            break
        }
      },
      async loadData() {
        this.loading = true
        try {
          this.queryObject.queryBean = { ...this.treeFilterParam }
          this.queryObject.page = this.currentPage
          this.queryObject.limit = this.pageSize
          const { data } = await this.proxy(this, 'scscm/app/permissionDataAjax.do', 'post', this.queryObject)
          if ('permissionList' in data) {
            this.tableValue.tableData = data.permissionList
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      }
    }
  }
</script>
<style>
</style>
