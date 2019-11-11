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
        upload-url="scscm/app/invoiceFeeoutInitAjax!uploadInitgoods.do",
        import-url="scscm/app/invoiceFeeoutInitAjax!importInitgoods.do",
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
    name: 'BasicsInitInitinvoiceFeeout',
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
          { lbl: '品名', prop: 'partsnameName', val: '', type: 'goods', useName: true },
          { lbl: '材质', prop: 'goodsMaterial', val: '', type: 'material' },
          { lbl: '规格', prop: 'goodsSpec', val: '', type: 'spec' },
          { lbl: '产地', prop: 'productareaName', val: '', type: 'area', useName: true },
          { lbl: '业务机构', prop: 'orgCode', val: '', type: 'org' },
          { lbl: '业务部门', prop: 'deptCode', val: '', type: 'dept' },
          { lbl: '业务员', prop: 'employeeCode', val: '', type: 'employee' },
          { lbl: '备注', prop: 'unmakeInitRemark', val: '' }
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
            {
              lbl: '日期', prop: 'unmakeDate',
              formatter: ({ cellValue }) => (cellValue || '').substr(0, 10)
            },
            { lbl: '结算单位', prop: 'datasCustomername' },
            { lbl: '费用类别', prop: 'feeclassName' },
            { lbl: '费用名称', prop: 'feeitemName' },
            { lbl: '品名', prop: 'partsnameName' },
            { lbl: '材质', prop: 'goodsMaterial' },
            { lbl: '规格', prop: 'goodsSpec' },
            { lbl: '产地', prop: 'productareaName' },
            { lbl: '长度', prop: 'goodsProperty1' },
            { lbl: '米重', prop: 'goodsProperty2' },
            { lbl: '重量范围', prop: 'goodsProperty4' },
            { lbl: '公差范围', prop: 'goodsProperty5' },
            { lbl: '数量', prop: 'dataBnum', summary: true },
            { lbl: '重量', prop: 'dataBweight', summary: true },
            { lbl: '数量单位', prop: 'partsnameNumunit' },
            { lbl: '重量单位', prop: 'partsnameWeightunit' },
            { lbl: '计量方式', prop: 'goodsMetering' },
            { lbl: '含税单价', prop: 'goodsInprice' },
            { lbl: '含税金额', prop: 'goodsInmoney', summary: true },
            { lbl: '无税单价', prop: 'goodsExprice' },
            { lbl: '无税金额', prop: 'goodsExmoney', summary: true },
            { lbl: '税率', prop: 'goodsTaxrate' },
            { lbl: '税额', prop: 'goodsTaxmoney' },
            { lbl: '车皮号', prop: 'goodsContractstr2' },
            { lbl: '入库批号', prop: 'goodsEntrystr1' },
            { lbl: '期货原货主代码', prop: 'goodsEntrystr4' },
            { lbl: '期货原货主名称', prop: 'goodsEntrystr5' },
            { lbl: '件支数', prop: 'goodsPartsbranch' },
            { lbl: '业务机构', prop: 'orgName' },
            { lbl: '业务部门', prop: 'deptName' },
            { lbl: '业务员', prop: 'employeeName' },
            { lbl: '制单人', prop: 'operatorName' },
            { lbl: '备注', prop: 'unmakeInitRemark' }
          ],
          tableData: []
        },
        currentPage: 1,
        totalCount: 0,
        queryObject: {
          queryBean: {
            likeCol: ['partsnameName', 'goodsMaterial', 'goodsSpec', 'productareaName', 'unmakeInitRemark']
          },
          otherlikeCol: 0,
        },
        loading: false,
        dialogShow: false,
        dialogTitle: '初始化费用未开票',
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
        const url = 'scscm/app/invoiceFeeoutInitAjax!downTemplet.do'
        const excelBean = {}
        excelBean.headerName = this.tableValue.tableHead.map(x => x.lbl)
        excelBean.valueName = this.tableValue.tableHead.map(x => x.prop)
        excelBean.valueFormatMapStr = 'dataBnum;###,###>dataBweight;###,###.0000>goodsInprice;###,###.00>goodsInmoney;###,###.00>goodsExprice;###,###.000000>goodsExmoney;###,###.00>goodsTaxmoney;###,###.00'
        excelBean.sheetName = '初始化费用未到导入'

        this.download(this, url, { excelBean })
      },
      importSuccess() {
        this.importShow = false
        this.loadData()
      },
      async loadData() {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/invoiceFeeoutInitAjax.do', 'post', this.queryObject)
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
          const { data } = await this.proxy(this, 'scscm/app/invoiceFeeoutInitAjax!delete.do', 'post', params)
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
