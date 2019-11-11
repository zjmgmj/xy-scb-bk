<template lang="pug">
el-dialog(width="875px", title="查看审核流水", :visible="true", append-to-body, top="10px", @close="close")      
  basic-elx-table(
    :tableValue="tableValue", 
    :total="totalCount",
    :currentPage="currentPage",
    :pageSize="pageSize",
    :loading="loading",
    @paginateChange="tableChange")
</template>
<script>
import buttonGroup from '~/components/buttonGroup.vue'
import basicElxTable from '~/components/basicElxTable'
export default {
  components: {
    buttonGroup,
    basicElxTable
  },
  props: {
    fileMod: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      loading: false,
      pageSize: 20,
      currentPage: 1,
      totalCount: 0,
      queryObject: {        
        page: this.currentPage,
        start: 0,
        limit: this.pageSize,
        sort: '[{"property":"billtypeAuditId","direction":"ASC"}]'
      },
      tableValue: {
        tableHeight: '300',
        showRowIndex: true,
        pageination: true,
        tableHead: [
          {lbl: '审核人', prop: 'billtypeAuditPersonStr', width: '150px'},
          {lbl: '状态', prop: 'billtypeAuditglideAudit', width: '80px',
            formatter: ({cellValue}) => {
              const obj = {
                '0': '未审', '1': '已审', '2': '在审', '-1': '弃审'
              }
              return obj[cellValue]
            }},
          {lbl: '当前审核人', prop: 'billtypeAuditglidePersonStr', width: '150px'},
          {lbl: '审核日期', prop: 'billtypeAuditglideDate', width: '150px'},
          {lbl: '审核备注', prop: 'billtypeAuditglideRemark'},
          {lbl: '弃审备注', prop: 'billtypeAuditglideNremark'}   
        ],
        tableData: []
      }
    }
  },
  mounted () {
    this.$nextTick(() => {   
      this.queryObject = {
        page: this.currentPage,
        start: 0,
        limit: this.pageSize,
        sort: '[{"property":"billtypeAuditId","direction":"ASC"}]',
        opAuditBillcode: this.fileMod.fileOpcode,
        billtypeCode: this.fileMod.fileBilltype
      }
      this.loadData()
    })
  },
  methods: {
    close () {
      this.$emit('close')
    },
    tableChange (val) {
      console.log(val)
      this.currentPage = val
      this.queryObject.page = this.currentPage
      this.queryObject.start = (this.currentPage - 1) * this.pageSize
      this.loadData()
    },
    async loadData () {
      this.loading = true
      try {
        const { data } = await this.proxy(this, 'scscm/app/billtypeAuditAjax!queryAuditGlide.do', 'post', this.queryObject)
        this.tableValue.tableData = []
        this.totalCount = 0
        if (data.auditList) {
          this.tableValue.tableData = data.auditList
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