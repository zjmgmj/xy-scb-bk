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
          @paginateChange="tableChange",
          @rowSelection="rowSelection")
      el-dialog(ref="dialog", :title="dialogTitle", :visible="dialogShow", width="800px", @close="editCancel")
        edit-box(v-if="dialogShow", :form="editForm" @save="editSave", @cancel="editCancel")
      excel-import(
        upload-url="scscm/app/purchaseGroupInitAjax!uploadInitgoods.do",
        import-url="scscm/app/purchaseGroupInitAjax!importInitgoods.do",
        :extraParam="upload",
        @success="importSuccess",
        @cancel="importShow=false",
        v-if="importShow")
</template>

<script>
  import { mapState } from 'vuex'
  import editBox from './edit'
  import buttonGroup from '@/components/buttonGroup.vue'
  import erplrPanel from '@/components/erplrPanel'
  import basicElxTable from '@/components/basicElxTable'
  import leftSearch from '@/components/leftSearch'
  import excelImport from '@/components/excelImport'

  export default {
    layout: 'backend',
    name: 'BasicsInitInitaccountglideInitbalance',
    components: {
      basicElxTable,
      erplrPanel,
      buttonGroup,
      leftSearch,
      editBox,
      excelImport
    },
    data() {
      return {
        collapseName: ['1'],
        searchFormItems: [
          { lbl: '起始日期', prop: 'startDate', val: this.date2Str(new Date()) + ' 00:00:00', type: 'datetime' },
          { lbl: '结束日期', prop: 'endDate', val: this.date2Str(new Date()) + ' 23:59:59', type: 'datetime' },
          { lbl: '结算单位', prop: 'datasBalcorp', val: '', type: 'company', typeStr: 'GYS' },
          { lbl: '业务机构', prop: 'orgCode', val: '', type: 'org' },
          { lbl: '业务部门', prop: 'deptCode', val: '', type: 'dept' },
          { lbl: '业务员', prop: 'employeeCode', val: '', type: 'employee' },
          { lbl: '制单人', prop: 'operatorCode', val: '', type: 'operator' },
          { lbl: '备注', prop: 'accountglideRemark', val: '' }
        ],
        buttonGroupInfo: [
          { lbl: '增加', type: 'add', icon: 'el-icon-plus' },
          { lbl: '修改', type: 'edit', icon: 'el-icon-edit' },
          { lbl: '删除', type: 'del', icon: 'el-icon-delete' },
          { lbl: '下载导入模板', type: 'down', icon: 'el-icon-document' },
          { lbl: '导入', type: 'import', icon: 'el-icon-document' },
          { lbl: '刷新', type: 'refresh', icon: 'el-icon-refresh' }
        ],
        tableValue: {
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          showSummary: true,
          tableHead: [
            { lbl: '结算单位', prop: 'datasBalcorpname' },
            {
              lbl: '日期', prop: 'accountglideDate',
              formatter: ({ cellValue }) => (cellValue || '').substr(0, 10)
            },
            { lbl: '余额', prop: 'accountglideMoney', summary: true },
            { lbl: '费用', prop: 'accountglideFundflagStr' },
            { lbl: '业务机构', prop: 'orgName' },
            { lbl: '业务部门', prop: 'deptName' },
            { lbl: '业务员', prop: 'employeeName' },
            { lbl: '制单人', prop: 'operatorName' },
            { lbl: '备注', prop: 'accountglideRemark' }
          ],
          tableData: []
        },
        currentPage: 1,
        totalCount: 0,
        queryObject: {
          queryBean: {
            likeCol: ['accountglideRemark']
          },
          otherlikeCol: 0,
        },
        loading: false,
        dialogShow: false,
        dialogTitle: '初始化采购往来余额',
        editForm: {},
        tableSelect: [],
        importShow: false
      }
    },
    computed: {
      ...mapState({
        pageSize: state => state.pageSize,
        currentUser: state => state.user.currentUser,
      }),
      upload() {
        const headerName = this.tableValue.tableHead.map(x => x.lbl).join(',')
        const valueName = this.tableValue.tableHead.map(x => x.prop).join(',')
        return { headerName, valueName }
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.queryObject.page = this.currentPage
        this.queryObject.limit = this.pageSize
        this.$refs.search.searchHandler()
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
      rowEdit(row) {
        if (row) {
          this.editForm = this.deepCopy(row)
        }
        this.dialogShow = true
      },
      rowDel(row) {
        this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
          const list = row ? [row] : this.tableSelect
          this.delete({ mod: list[0] })
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
          case 'down':
            this.downTemplate()
            break
          case 'import':
            this.importShow=true
            break
          case 'refresh':
            this.$refs.search.searchHandler()
            break
        }
      },
      downTemplate() {
        const url = 'scscm/app/purchaseGroupInitAjax!downTemplet.do'
        const excelBean = {}
        excelBean.headerName = this.tableValue.tableHead.map(x => x.lbl)
        excelBean.valueName = this.tableValue.tableHead.map(x => x.prop)
        excelBean.valueFormatMapStr = 'accountglideMoney;###,###.00'
        excelBean.sheetName = '初始化采购往来余额导入'

        this.download(this, url, { excelBean })
      },
      importSuccess() {
        this.importShow = false
        this.loadData()
      },
      async loadData() {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/purchaseGroupInitAjax.do', 'post', this.queryObject)
          if ('list' in data) {
            this.tableValue.tableData = data.list
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
          const { data } = await this.proxy(this, 'scscm/app/purchaseGroupInitAjax!delete.do', 'post', params)
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
