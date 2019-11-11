<template lang="pug">
  erplr-panel(:right-padding="false")
    div(slot="left")
      el-collapse(accordion, v-model="collapseName")
        el-collapse-item.slot-left(title="查询", name="1")
          left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search")
    .erp-content(slot="right")
      button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
      .table-content
        basic-elx-table(
          :tableValue="tableValue",
          :total="totalCount",
          :currentPage="currentPage",
          :pageSize="pageSize",
          :loading="loading",
          @row-dbclick="rowDbclick",
          @paginateChange="tableChange",
          @rowSelection="rowSelection")
      el-dialog(ref="dialog", :title="dialogTitle", :visible="dialogShow",  width="900px", @close="editCancel")
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
    name: 'BasicsOperator',
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
        searchFormItems: [
          { lbl: '用户代码', prop: 'operatorCode', val: '' },
          { lbl: '用户名称', prop: 'operatorUser', val: '' },
          { lbl: '账号', prop: 'operatorUserid', val: '' },
          { lbl: '手机号', prop: 'operatorMobile', val: '' },
          { lbl: '所属机构', prop: 'orgCode', val: '', type: 'org' },
          { lbl: '所属部门', prop: 'deptCode', val: '', type: 'dept' },
          { lbl: '职员', prop: 'employeeCode', val: '', type: 'employee' }
        ],
        buttonGroupInfo: [
          { lbl: '新增', type: 'add', icon: 'el-icon-plus' },
          { lbl: '修改', type: 'edit', icon: 'el-icon-edit' },
          { lbl: '删除', type: 'del', icon: 'el-icon-delete' },
          { lbl: '刷新', type: 'refresh', icon: 'el-icon-refresh' }
        ],
        tableValue: {
          hasCbx: true,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            { lbl: '用户名称', prop: 'operatorUser', width: '100px' },
            { lbl: '用户代码', prop: 'operatorCode', width: '100px' },
            { lbl: '昵称', prop: 'operatorNickname' },
            { lbl: '账号', prop: 'operatorUserid' },
            { lbl: '手机号', prop: 'operatorMobile' },
            { lbl: '所属机构', prop: 'orgName' },
            { lbl: '所属部门', prop: 'deptName' },
            { lbl: '职员', prop: 'employeeName' },
            {
              lbl: '状态', prop: 'operatorState', formatter: ({ cellValue }) => {
                const o = { 0: '启用', 1: '停用' }
                return o[cellValue] || cellValue
              }
            },
            {
              lbl: '身份', prop: 'operatorIdentity', formatter: ({ cellValue }) => {
                const o = { 0: '用户', 1: '管理员', 2: '系统管理员' }
                return o[cellValue] || cellValue
              }
            },
            { lbl: '角色', prop: 'roleListName' },
            { lbl: '登陆失败次数', prop: 'operatorFailnum' },
            {
              lbl: 'PDA操作', prop: 'pdauserState', formatter: ({ cellValue }) => {
                const o = { 0: '未启用', 1: '启用' }
                return o[cellValue] || cellValue
              }
            }
          ],
          tableData: []
        },
        currentPage: 1,
        totalCount: 0,
        queryObject: {
          queryBean: {
            likeCol: ['operatorCode', 'operatorUser', 'operatorUserid', 'operatorMobile']
          },
          otherlikeCol: 0,
          sort: '[{"property":"operatorCode","direction":"DESC"}]'
        },
        loading: false,
        dialogShow: false,
        dialogTitle: '操作员设置',
        editForm: {},
        tableSelect: [],
      }
    },
    computed: {
      ...mapState({
        pageSize: state => state.pageSize,
        currentUser: state => state.user.currentUser
      })
    },
    mounted() {
      this.$nextTick(() => {
        this.queryObject.page = this.currentPage
        this.queryObject.limit = this.pageSize
        this.loadData()
      })
    },
    methods: {
      searchForm(values) {
        for (const key in values) {
          this.queryObject.queryBean[key] = values[key]
          if (!this.queryObject.queryBean[key]) {
            delete this.queryObject.queryBean[key]
          }
        }
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
            operatorCode: list[0].operatorCode
          }
          this.delete({ operator: params })
        })
      },
      buttonGroupClick(type) {
        switch (type) {
          case 'add':
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
            this.$refs.search.searchHandler()
            break
        }
      },
      async loadData() {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/operatorAjax.do', 'post', this.queryObject)
          if ('operatorList' in data) {
            this.tableValue.tableData = data.operatorList
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
          const { data } = await this.proxy(this, 'scscm/app/operatorAjax!delete.do', 'post', params)
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
