<template lang="pug">
.content
  .flex.flex-center
    span 选择模板：
    el-select(v-model="termsettingCode", placeholder="请选择", size="mini", @change="termChange")
      el-option(v-for="item in termsettingList", :key="item.termsettingCode", :label="item.termsettingName", :value="item.termsettingCode")
  edit-table(ref="termsTable", :loading="loading", :tableValue="tableValue")
</template>
<script>
import editTable from '@/components/editTable'
export default {
  components: {
    editTable
  },
  props: {
    mainMod: {
      type: Object,
      default: () => {
        return {}
      }
    },
    termList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      loading: false,
      termsettingName: '',
      termsettingCode: '',
      termsettingList: [],
      tableValue: { 
        showRowIndex: true,
        tableHead: [
          {lbl: '条款项', prop: 'termsettingText', width: '350px', align: 'center', noedit: true},
          {lbl: '值', prop: 'termsettingContent', minWidth: '1000px'}
        ],
        tableData: []
      },
      billtypeCode: 'S001',
      queryObject: {
        page: 1,
        start: 0,
        limit: 25
      }
    }
  },
  watch: {
    termList () {
      if (this.termList.length > 0) {
        this.tableValue.tableData = this.extend(true, this.termList)
        this.termsettingCode = this.tableValue.tableData[0].termsettingCode
      }      
    }
  },
  mounted () {    
    this.$nextTick(() => {
      this.queryObject.billtypeCode = this.billtypeCode
      this.getTermList()
    })    
  },
  methods: {
    async getTermList () {
      this.loading = true
      try {          
        const { data } = await this.proxy(this, 'scscm/app/termsettingAjax!queryCombo.do', 'post', this.queryObject)
        this.termsettingList = []
        if (data.termsettingList) {
          this.termsettingList = data.termsettingList
        }
      } catch (e) {
        console.error(e)
      }
      this.loading = false
    },
    async getDetail (params) {
      this.loading = true
      try {          
        const { data } = await this.proxy(this, 'scscm/app/termsettingAjax!queryOpDetail.do', 'post', params)
        this.tableValue.tableData = []
        if (data.termList) {
          this.tableValue.tableData = data.termList
        }
        console.log('this.tableValue.tableData', this.tableValue.tableData)
      } catch (e) {
        console.error(e)
      }
      this.loading = false
    },
    termChange (val) {
      const params = {
        billtypeCode: this.billtypeCode,
        termsettingCode: val,
        page: 1,
        start: 0,
        limit: 25
      }
      this.getDetail(params)
    }
  }
}
</script>