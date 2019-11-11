<template lang="pug">
  erplr-panel(:right-padding="false")
    div(slot="left")
      el-collapse(accordion, v-model="collapseName")
        el-collapse-item.slot-left(title="菜单模块", name="1")
          left-tree(
          ref="leftTree",
          :button="treeButton",
          :data="treeData",
          :props="{children: 'children', label: 'text'}",
          @nodeClick="treeNodeClick",
          @addEvent="treeButtonHandler('add')",
          @addOtherEvent="treeButtonHandler('addOther')",
          @editEvent="treeButtonHandler('edit')",
          @delEvent="treeButtonHandler('del')")
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
      el-dialog(v-if="treeShow", title="菜单模块", :visible="true", width="500px", @close="editCancel")
        tree-edit(:origin-form="editForm" @save="editSave", @cancel="editCancel")
      el-dialog(v-if="editShow", title="子菜单配置", :visible="true", width="600px", @close="editCancel")
        edit-box(:origin-form="editForm", @save="editSave", @cancel="editCancel")
      el-dialog(v-if="buttonShow", title="权限按钮设置", :visible="true", width="1000px", @close="editCancel")
        button-win-view(:origin-form="editForm", @save="editSave", @cancel="editCancel")
</template>

<script>
  import { mapState } from 'vuex'
  import treeEdit from './treeEdit'
  import editBox from './edit'
  import buttonWinView from './buttonWinView'
  import buttonGroup from '@/components/buttonGroup.vue'
  import erplrPanel from '@/components/erplrPanel'
  import basicElxTable from '@/components/basicElxTable'
  import leftTree from '@/components/leftTree'
  import leftSearch from '@/components/leftSearch'

  export default {
    layout: 'backend',
    name: 'BasicsMenu',
    components: {
      basicElxTable,
      erplrPanel,
      buttonGroup,
      leftTree,
      treeEdit,
      leftSearch,
      editBox,
      buttonWinView
    },
    data() {
      return {
        collapseName: ['1'],
        treeData: [],
        treeButton: [
          { type: 'add', label: '新增' },
          { type: 'addOther', label: '实施新增' },
          { type: 'edit', label: '编辑' },
          { type: 'del', label: '删除' }
        ],
        searchFormItems: [
          { lbl: '代码', prop: 'permissionCode', val: '' },
          { lbl: '名称', prop: 'permissionName', val: '' }
        ],
        buttonGroupInfo: [
          { lbl: '新增', type: 'add', icon: 'el-icon-plus' },
          { lbl: '实施增加', type: 'addOther', icon: 'el-icon-plus' },
          { lbl: '修改', type: 'edit', icon: 'el-icon-edit' },
          { lbl: '删除', type: 'del', icon: 'el-icon-delete' },
          { lbl: '操作按钮', type: 'button', icon: 'el-icon-plus' },
          { lbl: '操作按钮（实施）', type: 'buttonOther', icon: 'el-icon-plus' },
          { lbl: '刷新', type: 'refresh', icon: 'el-icon-refresh' }
        ],
        tableValue: {
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            { lbl: '名称', prop: 'permissionName', width: '200px' },
            { lbl: '代码', prop: 'permissionCode', width: '100px' },
            { lbl: '单据类型', prop: 'billtypeCode', width: '80px' },
            {
              lbl: '链接方式', prop: 'permissionShowmode', width: '80px', formatter: ({ cellValue }) => {
                const o = { 0: 'tabpanel', 1: 'window', 2: 'url', _: '' }
                return o[cellValue] || ('_' in o ? o._ : cellValue)
              }
            },
            { lbl: '链接地址', prop: 'permissionJspath', width: '300px' },
            {
              lbl: '授权方式', prop: 'permissionSort', formatter: ({ cellValue }) => {
                const o = { 0: '操作员', 1: '登录', 2: '管理员', 3: '系统管理员', _: '' }
                return o[cellValue] || ('_' in o ? o._ : cellValue)
              }
            },
            {
              lbl: '显示', prop: 'permissionShowinmenu', formatter: ({ cellValue }) => {
                const o = { 0: '√', _: '' }
                return o[cellValue] || ('_' in o ? o._ : cellValue)
              }
            },
            {
              lbl: '状态', prop: 'permissionState', formatter: ({ cellValue }) => {
                const o = { 0: '√', _: '' }
                return o[cellValue] || ('_' in o ? o._ : cellValue)
              }
            },
            {
              lbl: '类型', prop: 'permissionType', formatter: ({ cellValue }) => {
                const o = { 0: '单据', 1: '报表', 2: '自定义报表', _: '' }
                return o[cellValue] || ('_' in o ? o._ : cellValue)
              }
            },
            { lbl: '顺序', prop: 'permissionOrder' },
            { lbl: '应用', prop: 'applicationCode' }
          ],
          tableData: []
        },
        currentPage: 1,
        totalCount: 0,
        queryObject: {
          queryBean: {},
          sort: '[{"property":"menuNodecode","direction":"ASC"},{"property":"permissionOrder","direction":"ASC"}]'
        },
        loading: false,
        tableSelect: [],
        checkNode: {},
        editForm: {},
        editShow: false,
        buttonShow: false,
        treeShow: false,
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
        this.refreshTree()
      })
    },
    methods: {
      async refreshTree(){
        const {data} = await this.proxy(this, 'scscm/app/menuAjax!queryTree.do', 'get', { menuParent: 'root' })
        this.treeData = data.children
        this.checkNode = {}
        this.tableValue.tableData = []
        this.tableSelect = []
      },
      treeNodeClick(obj) {
        this.checkNode = obj
        this.queryObject.queryBean = this.deepCopy(this.treeFilterParam)
        this.queryObject.page = this.currentPage = 1
        this.loadData()
      },
      searchForm(values) {
        const queryBean = {
          treeFlag: 1,
          likeCol: ['permissionCode', 'permissionName']
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
      editSave(type) {
        switch (type) {
          case 'tree':
            this.treeShow = false
            this.refreshTree()
            break
          case 'button':
            this.buttonShow = false
            break
          case 'edit':
            this.editShow = false
            this.queryObject.page = this.currentPage = 1
            this.loadData()
            break
          default:
            this.treeShow = false
            this.editShow = false
            this.buttonShow = false
            console.warn('in default case')
        }
      },
      editCancel(type) {
        switch (type) {
          case 'tree':
            this.treeShow = false
            break
          case 'button':
            this.buttonShow = false
            break
          case 'edit':
            this.editShow = false
            break
          default:
            this.treeShow = false
            this.editShow = false
            this.buttonShow = false
        }
      },
      rowSelection(row) {
        this.tableSelect = row
      },
      buttonGroupClick(type) {
        switch (type) {
          case 'add':
            this.editForm = this.deepCopy(this.treeFilterParam)
            this.editForm.menuCode= this.checkNode.data.id
            this.editShow = true
            break
          case 'addOther':
            this.editForm = this.deepCopy(this.treeFilterParam)
            this.editForm.menuCode= this.checkNode.data.id
            this.editForm.menuProperty= 2
            this.editShow = true
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
            this.editShow = true
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
            this.confirmDialog(this, '您确认要删掉记录吗？')
              .then(() => this.delete({ permission: this.tableSelect[0] }))
            break
          case 'button':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择数据')
              return false
            }
            if (this.tableSelect.length > 1) {
              this.$message.error('只能选择一条数据')
              return false
            }
            this.editForm = {
              permissionCode: this.tableSelect[0].permissionCode,
              menuProperty: 0
            }
            this.buttonShow = true
            break
          case 'buttonOther':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择数据')
              return false
            }
            if (this.tableSelect.length > 1) {
              this.$message.error('只能选择一条数据')
              return false
            }
            this.editForm = {
              permissionCode: this.tableSelect[0].permissionCode,
              menuProperty: 2
            }
            this.buttonShow = true
            break
          case 'refresh':
            this.loadData()
            break
        }
      },
      treeButtonHandler(type) {
        if (Object.keys(this.checkNode).length !== 2) {
          this.$message.error('请选择节点')
          return false
        }
        switch (type) {
          case 'add':
            this.editForm = { menuParent: this.checkNode.data.id }
            this.treeShow = true
            break
          case 'addOther':
            this.editForm = { menuParent: this.checkNode.data.id, menuProperty: 2 }
            this.treeShow = true
            break
          case 'edit':
            this.editForm = this.treeFilterParam
            this.treeShow = true
            break
          case 'del':
            this.confirmDialog(this, '您确认要删掉记录吗？')
              .then(() => this.deleteTree({ menu: this.treeFilterParam }))
            break
        }
      },



      buttonCancel() {
        this.buttonShow = false
      },
      async loadData() {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/menuAjax.do', 'post', this.queryObject)
          if ('permissionList' in data) {
            this.tableValue.tableData = data.permissionList
            this.totalCount = data.totalCount
          }
          this.tableSelect = []
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async delete(params) {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/menuAjax!delete.do', 'post', params)
          if (data.map.state === '3') {
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
      },
      async deleteTree(params) {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/menuAjax!deleteTree.do', 'post', params)
          if (data.map.state === '3') {
            this.msgShow(this, '删除成功', 'success')
            this.refreshTree()
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
