<template lang="pug">
  erplr-panel(:right-padding="false")
    div(slot="left")
      el-collapse(accordion, v-model="collapseName")
        el-collapse-item.slot-left(title="查询", name="1")
          left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search")
    .erp-content(slot="right")
      .up(style="height: 70%")
        button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
        .table-content
          basic-elx-table(
            :tableValue="tableValue",
            :total="totalCount",
            :currentPage="currentPage",
            :pageSize="pageSize",
            :loading="loading",
            @paginateChange="tableChange",
            @rowSelection="rowSelection")
      .down(style="height: 30%")
        basic-elx-table(:tableValue="tableValueBottom", :loading="loading2")
      edit-box(v-if="dialogShow", :origin-form="editForm" @save="editSave", @close="dialogShow=false")
      audit-glide-view(v-if="auditGlideShow", @close="auditGlideShow = false", :fileMod="fileMod")
</template>

<script>
  import { mapState } from 'vuex'
  import { isArray } from 'xe-utils'
  import editBox from './edit'
  import buttonGroup from '@/components/buttonGroup.vue'
  import erplrPanel from '@/components/erplrPanel'
  import basicElxTable from '@/components/basicElxTable'
  import leftSearch from '@/components/leftSearch'
  import auditGlideView from '@/components/billtypeaudit'

  export default {
    layout: 'backend',
    name: 'TradeMachineTask',
    components: {
      basicElxTable,
      erplrPanel,
      buttonGroup,
      leftSearch,
      editBox,
      auditGlideView
    },
    data() {
      return {
        collapseName: ['1'],
        searchFormItems: [
          { lbl: '起始日期', prop: 'startDate', val: '', type: 'datetime', format: 'yyyy-MM-dd HH:mm' },
          { lbl: '结束日期', prop: 'endDate', val: '', type: 'datetime', format: 'yyyy-MM-dd HH:mm' },
          { lbl: '单据号', prop: 'mtaskBillcode', val: '' },
          { lbl: '仓库', prop: 'warehouseCode', val: '', type: 'warehouse' },
          { lbl: '业务机构', prop: 'orgCode', val: '', type: 'org' },
          { lbl: '业务部门', prop: 'deptCode', val: '', type: 'dept' },
          { lbl: '业务员', prop: 'employeeCode', val: '', type: 'employee' },
          { lbl: '制单人', prop: 'operatorCode', val: '' },
          { lbl: '备注', prop: 'mtaskRemark', val: '' }
        ],
        buttonGroupInfo: [
          { lbl: '新增', type: 'add', icon: 'el-icon-plus' },
          { lbl: '修改', type: 'edit', icon: 'el-icon-edit' },
          { lbl: '删除', type: 'del', icon: 'el-icon-delete' },
          { lbl: '打印', type: 'print', icon: 'el-icon-printer' },
          { lbl: '审核', type: 'audit', icon: 'el-icon-document-checked' },
          { lbl: '查看审核流水', type: 'auditView', icon: 'el-icon-view' },
          { lbl: '刷新', type: 'refresh', icon: 'el-icon-refresh' }
        ],
        tableValue: {
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            { lbl: '单据号', prop: 'mtaskBillcode', width: '160px' },
            {
              lbl: '日期', prop: 'mtaskDate', width: '90px', formatter: ({ cellValue }) => {
                return this.toDateString(cellValue, 'yyyy-MM-dd')
              }
            },
            { lbl: '原始单号', prop: 'mtaskOthercode' },
            { lbl: '仓库', prop: 'warehouseName', width: '110px' },
            {
              lbl: '业务类别', prop: 'mtaskType', width: '80px', formatter: ({ cellValue }) => {
                const o = { '01': '订货加工', '03': '库存加工', '04': '来料加工', _: '' }
                return o[cellValue] || ('_' in o ? o._ : cellValue)
              }
            },
            { lbl: '加工工艺', prop: 'ddTypeCraft', width: '80px', type: 'basic', ddtypeClass: 'mtaskddTypeCraft' },
            { lbl: '包装类型', prop: 'ddTypePacktype', width: '80px' },
            { lbl: '加工标准', prop: 'mtaskMsta', width: '80px', type: 'basic', ddtypeClass: 'mtaskMsta' },
            { lbl: '数量', prop: 'goodsNum', width: '60px', g_type: 'num' },
            { lbl: '重量', prop: 'goodsWeight', width: '100px', g_type: 'weight' },
            { lbl: '费用金额', prop: 'dataInfeemoney', width: '110px', g_type: 'money' },
            { lbl: '刀厚(mm)', prop: 'mtaskMply', width: '70px' },
            {
              lbl: '单据流程', prop: 'datasBillflow', width: '80px', formatter: ({ cellValue }) => {
                const o = { 0: '直接验收', 1: '排产验收', 3: '排产领料验收', _: '' }
                return o[cellValue] || ('_' in o ? o._ : cellValue)
              }
            },
            {
              lbl: '审核', prop: 'dataAudit', width: '60px', formatter: ({ cellValue, row }) => {
                if (row.billtypeCheckmode === '-1') return ''
                const o = { 0: '未审', 1: '已审', 2: '在审', '-1': '弃审', _: '' }
                return o[cellValue] || ('_' in o ? o._ : cellValue)
              }
            },
            { lbl: '审核人', prop: 'dataAuditPerson', width: '80px' },
            {
              lbl: '审核日期', prop: 'dataAuditDate', width: '90px', formatter: ({ cellValue }) => {
                return this.toDateString(cellValue, 'yyyy-MM-dd')
              }
            },
            { lbl: '审核备注', prop: 'dataAuditRemark', width: '160px' },
            { lbl: '弃审备注', prop: 'dataAuditNremark', width: '160px' },
            { lbl: '业务机构', prop: 'orgName', width: '110px' },
            { lbl: '业务部门', prop: 'deptName', width: '110px' },
            { lbl: '业务员', prop: 'employeeName', width: '80px' },
            { lbl: '制单人', prop: 'operatorName', width: '80px' },
            { lbl: '备注', prop: 'mtaskRemark', width: '160px' }
          ],
          tableData: []
        },
        tableValueBottom: {
          showRowIndex: true,
          showSummary: true,
          tableHeight: '260px',
          tableHead: [
            { lbl: '货齐', prop: 'dataGoodsflagStr', width: '90px' },
            {
              lbl: '类别', prop: 'mtaskDetailsClass', width: '60px', formatter: ({ cellValue }) => {
                const o = { 0: '基料', 1: '半成品', 2: '成品', 3: '余料', 4: '废料', _: '' }
                return o[cellValue] || ('_' in o ? o._ : cellValue)
              }
            },
            { lbl: '工序', prop: 'mtaskDetailsProcess', width: '70px' },
            { lbl: '品名', prop: 'partsnameName', width: '100px' },
            { lbl: '规格', prop: 'goodsSpec', width: '140px' },
            { lbl: '材质', prop: 'goodsMaterial', width: '100px' },
            { lbl: '产地', prop: 'productareaName', width: '90px' },
            { lbl: '长度', prop: 'goodsProperty1' },
            { lbl: '米重', prop: 'goodsProperty2' },
            { lbl: '重量范围', prop: 'goodsProperty4' },
            { lbl: '公差范围', prop: 'goodsProperty5' },
            { lbl: '数量', prop: 'goodsUnbindersnum', width: '60px', g_type: 'num' },
            { lbl: '重量', prop: 'goodsUnbindersweight', width: '100px', g_type: 'weight' },
            { lbl: '基料数量', prop: 'goodsBindersnum', width: '70px', g_type: 'num' },
            { lbl: '基料重量', prop: 'goodsBindersweight', width: '100px', g_type: 'weight' },
            { lbl: '验收数量', prop: 'mtaskDetailsOknum', width: '70px', g_type: 'num' },
            { lbl: '验收重量', prop: 'mtaskDetailsOkweight', width: '100px', g_type: 'weight' },
            { lbl: '未验收数量', prop: 'nomtaskDetailsOknum', width: '80px', g_type: 'num' },
            { lbl: '未验收重量', prop: 'nomtaskDetailsOkweight', width: '100px', g_type: 'weight' },
            { lbl: '数量单位', prop: 'partsnameNumunit', width: '70px' },
            { lbl: '重量单位', prop: 'partsnameWeightunit', width: '70px' },
            { lbl: '计量方式', prop: 'goodsMetering', width: '80px' },
            { lbl: '费用单价', prop: 'goodsBinfeeprice', width: '90px', g_type: 'price' },
            { lbl: '费用金额', prop: 'goodsInfeemoney', width: '110px', g_type: 'money' },
            { lbl: '车皮号', prop: 'goodsContractstr2' },
            { lbl: '入库批号', prop: 'goodsEntrystr1' },
            { lbl: '期货原货主代码', prop: 'goodsEntrystr4' },
            { lbl: '期货原货主名称', prop: 'goodsEntrystr5' },
            { lbl: '库位', prop: 'goodsCodestr1' },
            { lbl: '捆包号', prop: 'goodsCodestr2' },
            { lbl: '炉批号', prop: 'goodsCodestr3' },
            { lbl: '仓储号', prop: 'goodsCodestr4' },
            { lbl: '件编号', prop: 'goodsCodestr5' },
            { lbl: '库区', prop: 'goodsCodestr10' },
            { lbl: '件支数', prop: 'goodsPartsbranch' },
            { lbl: '仓库', prop: 'warehouseName', width: '110px' },
            { lbl: '货权机构', prop: 'goodsOrgName', width: '110px' },
            { lbl: '预加工时间', prop: 'mtaskDetailsMtime', width: '90px' },
            { lbl: '加工设备', prop: 'equsettingCode', width: '80px' },
            { lbl: '备注', prop: 'mtaskDetailsRemark', width: '160px' },
            { lbl: '销售合同号', prop: 'scontractBillcode', width: '160px' }
          ],
          tableData: []
        },
        currentPage: 1,
        totalCount: 0,
        queryObject: {
          queryBean: {
            likeCol: ['mtaskBillcode', 'mtaskRemark']
          },
          otherlikeCol: 0,
          sort: '[{"property":"mtaskBillcode","direction":"DESC"}]'
        },
        loading: false,
        loading2: false,
        dialogShow: false,
        auditGlideShow: false,
        editForm: {},
        tableSelect: [],
        fileMod: {
          fileBilltype: '',
          fileOpcode: ''
        },
      }
    },
    computed: {
      ...mapState({
        pageSize: state => state.pageSize,
        currentUser: state => state.user.currentUser
      })
    },
    created() {
      this.searchFormItems[0].val = this.toDateString(this.getStatDate(), 'yyyy-MM-dd HH:mm')
      this.searchFormItems[1].val = this.toDateString(this.getEndDate(), 'yyyy-MM-dd HH:mm')
      this.queryObject.page = this.currentPage
      this.queryObject.limit = this.pageSize
    },
    mounted() {
      this.$nextTick(() => {
        // this.loadData()
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
        this.fileMod = {
          fileBilltype: row[0].billtypeCode,
          fileOpcode: row[0].planBillcode
        }
        this.loadDataBottom()
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
            mtaskBillcode: list[0].billtypeCode,
            billtypeCode: list[0].mtaskBillcode,
            feeOptcode: list[0].billtypeCode,
            feeBilltype: list[0].mtaskBillcode,
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
          case 'audit':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要审核的记录')
              return false
            }
            this.showAudit()
            break
          case 'auditView':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要查看的记录')
              return false
            }
            this.auditGlideShow = true
            break
          case 'refresh':
            this.$refs.search.searchHandler()
            break
        }
      },
      async loadData() {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/sdpMtaskEnrollAjax.do', 'post', this.queryObject)
          if ('mainList' in data) {
            data.mainList.forEach(x => {
              x.ddTypeCraft = x.ddTypeCraft !== null ? Number(x.ddTypeCraft) : x.ddTypeCraft
              x.mtaskMsta = x.mtaskMsta !== null ? Number(x.mtaskMsta) : x.mtaskMsta
            })
            this.tableValue.tableData = data.mainList
            this.totalCount = data.totalCount
          }
          this.tableValueBottom.tableData = []
          this.tableSelect = []
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async delete(params) {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/sdpMtaskEnrollAjax!delete.do', 'post', params)
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
      },
      async loadDataBottom() {
        let row
        if (isArray(this.tableSelect)){
          row = this.tableSelect[0]
        }else{
          row = this.tableSelect
        }
        this.loading2 = true
        try {
          const params = {
            mtaskBillcode: row.mtaskBillcode,
            billtypeCode: row.billtypeCode,
            feeOptcode: row.mtaskBillcode,
            feeBilltype: row.billtypeCode
          }
          const { data } = await this.proxy(this, 'scscm/app/sdpMtaskEnrollAjax!queryDetailReport.do', 'post', params)
          if ('reportList' in data) {
            this.tableValueBottom.tableData = data.reportList
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading2 = false
      },
      async showAudit () {
        const loading = this.loadShow()
        try {
          const { data } = await this.proxy(this, 'scscm/app/sdpMtaskEnrollAjax!showAudit.do', 'post', this.tableSelect[0])
          if (!data.needAudit) {
            this.$message.success('该单据无审核操作!')
            loading.close()
            return false
          } else {
            this.$message.success('TODO 审核')
            loading.close()
            return false
          }
        } catch (e) {
          console.error(e)
          loading.close()
        }
      },
    }
  }
</script>

<style scoped>
</style>
