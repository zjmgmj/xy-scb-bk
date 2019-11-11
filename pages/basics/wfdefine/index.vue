<template lang="pug">
  erplr-panel(:right-padding="false")
    div(slot="left")
      el-collapse(accordion, v-model="collapseName")
        el-collapse-item.slot-left(title="菜单模块", name="1")
          left-tree(
            :data="treeData",
            :props="{children: 'children',label: 'text'}",
            @nodeClick="treeNodeClick",)
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
      setting-edit(v-if="settingDialog", :billtypeCode="treeFilterParam.billtypeCode", @close="settingDialog=false")
      el-dialog(ref="dialog", :title="dialogTitle", :visible="dialogShow", fullscreen, @close="editCancel")
        edit-box(v-if="dialogShow", :form="editForm" @save="editSave", @cancel="editCancel")
</template>

<script>
  import { mapState } from 'vuex'
  import editBox from './edit'
  import settingEdit from './settingEdit'
  import buttonGroup from '@/components/buttonGroup.vue'
  import erplrPanel from '@/components/erplrPanel'
  import basicElxTable from '@/components/basicElxTable'
  import leftTree from '@/components/leftTree'
  import leftSearch from '@/components/leftSearch'

  export default {
    layout: 'backend',
    name: 'BasicsWfdefine',
    components: {
      basicElxTable,
      erplrPanel,
      buttonGroup,
      leftTree,
      settingEdit,
      leftSearch,
      editBox
    },
    data() {
      return {
        collapseName: ['1'],
        treeData: [],
        buttonGroupInfo: [
          { lbl: '设置', type: 'set', icon: 'el-icon-edit' },
          { lbl: '刷新', type: 'refresh', icon: 'el-icon-refresh' },
          { lbl: '设置控制', type: 'setting', icon: 'el-icon-document-add', class: 'default' },
        ],
        tableValue: {
          hasCbx: true,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            { lbl: '单据类型', prop: 'billtypeName', width: '250px' },
            { lbl: '流程代码', prop: 'defineCode', width: '100px' },
            { lbl: '流程名称', prop: 'defineName' }
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
        dialogTitle: '流程设计器',
        settingDialog: false,
        tableSelect: [],
        checkNode: {},
        editForm: {}
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
        this.proxy(this, '/scscm/app/billtypeAjax!queryTree.do', 'get', { menuParent: 'root' }).then(x => this.treeData = x.data.children)
      })
    },
    methods: {
      treeNodeClick(obj) {
        this.checkNode = obj
        this.queryObject.queryBean = this.deepCopy(this.treeFilterParam)
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
          const params = {
            memberCode: list[0].memberCode,
            defineCode: list[0].defineCode,
          }
          this.delete(params)
        })
      },
      buttonGroupClick(type) {
        switch (type) {
          case 'set':
            // if (this.tableSelect.length < 1) {
            //   this.$message.error('请选择需要编辑的数据')
            //   return false
            // }
            // if (this.tableSelect.length > 1) {
            //   this.$message.error('只能选择一条数据编辑')
            //   return false
            // }
            // this.smsTemplate = JSON.parse(JSON.stringify(this.tableSelect[0]))
            // this.rowEdit()
            this.dialogShow = true
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
          case 'setting':
            if (!(this.checkNode.node && this.checkNode.node.isLeaf)) {
              this.$message.error('请选择末级节点')
              return false
            }
            this.settingDialog = true
            break
        }
      },
      async loadData() {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/wfDefineAjax.do', 'post', this.queryObject)
          if ('defineList' in data) {
            this.tableValue.tableData = data.defineList
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
          const { data } = await this.proxy(this, 'scscm/app/wfDefineAjax!delete.do', 'post', params)
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
