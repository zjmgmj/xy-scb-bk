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
          :loading="loading"
          @row-dbclick="rowDbclick",
          @paginateChange="tableChange",
          @rowSelection="rowSelection")
      el-dialog(ref="dialog", :title="dialogTitle", :visible="dialogShow", width="1200px", @close="editCancel")
        edit-box(v-if="dialogShow", :form="editForm", @save="editSave", @cancel="editCancel")
</template>

<script>
  import { mapState } from 'vuex'
  import editBox from './edit'
  import buttonGroup from '@/components/buttonGroup.vue'
  import erplrPanel from '@/components/erplrPanel'
  import basicElxTable from '@/components/basicElxTable'
  import leftSearch from '@/components/leftSearch'

  export default {
    layout: 'backend',
    components: {
      basicElxTable,
      erplrPanel,
      buttonGroup,
      leftSearch,
      editBox
    },
    data() {
      return {
        collapseName: ['1'],
        searchFormItems: [
          { lbl: '账号', prop: 'userName', val: '' },
          { lbl: '姓名', prop: 'userNickname', val: '' },
          { lbl: '电话', prop: 'userPhone', val: '' },
          { lbl: '单位名称', prop: 'cbName', val: '' },
          { lbl: '单位代码', prop: 'cbCode', val: '' },
          {
            lbl: '用户类型',
            prop: 'rcbType',
            val: '',
            type: 'select',
            list: [{ value: '', label: '全部' }, { value: '1', label: '货主' }, { value: '2', label: '质押银行' }]
          },
          { lbl: '备注', prop: 'userRemark', val: '' }
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
            { lbl: '账号', prop: 'userName', width: '100px' },
            { lbl: '姓名', prop: 'userNickname', width: '100px' },
            { lbl: '电话', prop: 'userPhone' },
            { lbl: '邮箱', prop: 'userEmail' },
            { lbl: '单位名称', prop: 'cbName' },
            { lbl: '单位代码', prop: 'cbCode' },
            { lbl: '注册日期', prop: 'userDate' },
            {
              lbl: '用户类型', prop: 'rcbType', formatter: ({ cellValue }) => {
                const o = { 1: '货主', 2: '质押银行' }
                return o[cellValue] || cellValue
              }
            },
            { lbl: '用户角色', prop: 'roleStr' },
            { lbl: '业务机构', prop: 'orgName' },
            { lbl: '业务部门', prop: 'deptName' },
            { lbl: '备注', prop: 'userRemark' }
          ],
          tableData: []
        },
        currentPage: 1,
        totalCount: 0,
        queryObject: {
          queryBean: {
            likeCol: ['userName', 'userNickname', 'userPhone', 'cbName', 'cbCode', 'userRemark']
          },
          otherlikeCol: 0,
          sort: '[{"property":"userCode","direction":"DESC"}]'
        },
        loading: false,
        dialogShow: false,
        editForm: {},
        dialogTitle: '远程协同管理',
        tableSelect: [],
        checkNode: {}
      }
    },
    computed: {
      ...mapState({
        pageSize: state => state.pageSize,
        currentUser: state => state.user.currentUser,
      })
    },
    mounted() {
      this.$nextTick(() => {
        this.queryObject.limit = this.pageSize
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
            userId: list[0].userId,
            cbCode: list[0].cbCode,
            rcbType: list[0].rcbType
          }
          this.delete(params)
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
          const { data } = await this.proxy(this, 'scscm/app/rcbAccountAjax.do', 'post', this.queryObject)
          if ('userList' in data) {
            this.tableValue.tableData = data.userList
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
          const { data } = await this.proxy(this, 'scscm/app/rcbAccountAjax!delete.do', 'post', params)
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
