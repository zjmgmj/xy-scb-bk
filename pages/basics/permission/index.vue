<template lang="pug">
  erplr-panel(:right-padding="false")
    div(slot="left")
      el-collapse(accordion, v-model="collapseName")
        el-collapse-item.slot-left(title="操作员/角色列表", name="1")
          left-tree(
            ref="operTree",
            :data="operTree",
            :props="{children: 'children',label: 'text'}",
            @nodeClick="treeNodeClick",)
        el-collapse-item.slot-left(title="菜单列表", name="2")
          left-tree(
            ref="menuTree",
            :data="menuTree",
            :props="{children: 'children',label: 'text'}",
            @nodeClick="treeNodeClick")
    .erp-content(slot="right")
      button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
      elx-table(
        :data="tableValue.tableData",
        :row-key="x=>x.text+x.filterObj",
        size="mini",
        border,
        v-loading="loading",
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}")
        elx-table-column(prop="text", label="菜单/功能名称")
        elx-table-column(prop="opPermissionAllot", label="操作员权限", width="120px", :formatter="columnFormatter")
        elx-table-column(prop="roPermissionAllot", label="角色权限", width="120px", :formatter="columnFormatter")
      el-dialog(ref="dialog", :title="dialogTitle", :visible="dialogShow", width="900px", @close="editCancel")
        allocation-box(v-if="dialogShow", :queryParam="queryNodeParam", @refresh="loadData")
</template>

<script>
  import { mapState } from 'vuex'
  import allocationBox from './allocation'
  import buttonGroup from '@/components/buttonGroup.vue'
  import erplrPanel from '@/components/erplrPanel'
  import basicElxTable from '@/components/basicElxTable'
  import leftTree from '@/components/leftTree'
  import leftSearch from '@/components/leftSearch'

  export default {
    layout: 'backend',
    components: {
      basicElxTable,
      erplrPanel,
      buttonGroup,
      leftTree,
      leftSearch,
      allocationBox
    },
    data() {
      return {
        collapseName: ['1'],
        operTree: [],
        menuTree: [],
        buttonGroupInfo: [
          { lbl: '分配', type: 'allocation', icon: 'el-icon-edit' },
          { lbl: '刷新', type: 'refresh', icon: 'el-icon-refresh' }
        ],
        tableValue: {
          tableHead: [
            { lbl: '菜单/功能名称', prop: 'text' },
            { lbl: '操作员权限', prop: 'opPermissionAllot', width: '120px' },
            { lbl: '角色权限', prop: 'roPermissionAllot', width: '120px' }
          ],
          tableData: []
        },
        loading: false,
        dialogShow: false,
        tableSelect: [],
        checkNode: {}
      }
    },
    computed: {
      ...mapState({
        pageSize: state => state.pageSize,
        currentUser: state => state.user.currentUser
      }),
      dialogTitle(){
        let s
        if (!this.checkNode || !this.checkNode.node || !this.checkNode.node.isLeaf) {
        }else{
          let obj = this.checkNode.data.filterObj
          obj = eval('(' + obj.substring(1, obj.length - 1) + ')')

          if (this._checkOperator(obj)) {
            const org = this.checkNode.node.parent.parent.label
            const dept = this.checkNode.node.parent.label
            const oper = this.checkNode.node.label
            s= `机构[${org}]-部门[${dept}]-操作员[${oper}]`
          } else if (this._checkRole(obj)) {
            const role = this.checkNode.node.label
            s = `角色[${role}]`
          } else if (this._checkButton(obj)) {
            const menu = this._getTreePath(this.checkNode.node.parent)
            const fun = this.checkNode.node.parent.label
            const btn = this.checkNode.node.label
            s = `菜单[${menu}]-功能[${fun}]-按钮[${btn}]`
          } else if (this._checkPermission(obj)) {
            const menu = this._getTreePath(this.checkNode.node.parent)
            const fun = this.checkNode.node.label
            s = `菜单[${menu}]-功能[${fun}]`
          }
        }
        return s
      },
      queryNodeParam() {
        let obj = null
        try {
          const s = this.checkNode.data.filterObj
          obj = eval('(' + s.substring(1, s.length - 1) + ')')
          if (this._checkOperator(obj)) {
            obj.allotType = 0
            obj.node = 'root'
          } else if (this._checkRole(obj)) {
            obj.allotType = 2
            obj.node = 'root'
          } else if (this._checkButton(obj)) {
            obj.allotType = 4
            obj.node = 'root'
          } else if (this._checkPermission(obj)) {
            obj.allotType = 4
            obj.node = 'root'
          } else {
            obj = null
          }
        } catch (e) {
          console.error(e)
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
        this.proxy(this, '/scscm/app/permissionAjax!queryTree.do').then(x => this.operTree = x.data.children)
        this.proxy(this, '/scscm/app/permissionAjax!queryMenuTree.do').then(x => this.menuTree = x.data.children)
      })
    },
    methods: {
      _checkOperator: _ => _ && _.orgCode && _.deptCode && _.operatorCode,
      _checkRole: _ => _ && _.roleCode,
      _checkPermission: _ => _ && _.menuCode && _.permissionCode,
      _checkButton: _ => _ && _.menuCode && _.permissionCode && _.buttonName,
      _getTreePath(node) {
        if (!node || node.level === 0) {
          return ''
        } else {
          return this._getTreePath(node.parent) + '/' + node.label
        }
      },

      columnFormatter({ row, cellValue }) {
        if (row.children && row.children.length === 0) {
          const o = { 0: ' ', 1: '√', 2: '×' }
          return o[cellValue] || cellValue
        } else {
          return ' '
        }
      },
      treeNodeClick(obj) {
        console.log(obj)
        console.log(this.deepCopy(obj.data))
        this.checkNode = obj
        this.loadData()
      },

      buttonGroupClick(type) {
        switch (type) {
          case 'allocation':
            if (!this.dialogTitle){
              this.$message.error('请选择节点')
            }else{
              this.dialogShow = true
            }
            break
          case 'refresh':
            // this.$refs.search.searchHandler()
            this.loadData()
            break
        }
      },
      editSave(form) {
        console.log('form:', form)
        this.createOrUpdate(form).then(() => {
          this.loadData()
          this.dialogShow = false
        })
      },
      editCancel(type) {
        this.dialogShow = false
        // this.smsTemplate = JSON.parse(JSON.stringify(this.copySmsTemplate))
      },

      async loadData() {
        if (!this.queryNodeParam) {
          this.tableValue.tableData = []
          return
        }
        this.loading = true
        try {
          const { data } = await this.proxy(this, '/scscm/app/permissionAjax!queryPermission.do', 'get', this.queryNodeParam)
          this.tableValue.tableData = data.children
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
