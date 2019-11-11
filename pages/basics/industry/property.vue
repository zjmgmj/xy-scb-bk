<template lang="pug">
  .content
    .table-content
      edit-table(:tableValue="tableValue", :loading="loading")
    .mt-15.mb-15.text-right
      el-button(@click="cancel", size="small") 取消
      el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
  import editTable from '@/components/editTable'

  export default {
    components: {
      editTable
    },
    props: {
      industryCode:{
        type:String,
        required: true
      }
    },
    data() {
      return {
        tableValue: {
          // pageShow: true,
          hasCbx: false,
          // showRowIndex: true,
          tableHeight: '400px',
          tableHead: [
            { lbl: '名称', prop: 'columnName', noedit: true },
            { lbl: '数据类型', prop: 'columnDatatype', noedit: true },
            {
              lbl: '启用',
              prop: 'columnIsuse',
              type: 'ElSelect',
              list: [{ label: '不启用', value: 0 }, { label: '启用', value: 1 }]
            },
            { lbl: '显示名称', prop: 'columnTxt' },
            {
              lbl: '库存汇总字段',
              prop: 'columnSumflag',
              type: 'ElSelect',
              list: [{ label: '是', value: 0 }, { label: '不是', value: 1 }]
            },
            { lbl: '显示格式', prop: 'columnFormat' },
            { lbl: '显示宽度', prop: 'columnWidth' }
          ],
          tableData: []
        },
        loading: false
      }
    },
    mounted() {
      this.$nextTick(() => {
        const params = {
          industryCode: this.industryCode,
          sort: '[{"property":"columnName","direction":"ASC"}]'
        }
        this.proxy(this, 'scscm/app/industryAjax!queryGoodscolumns.do', 'get', params).then(x => this.tableValue.tableData = x.data.goodscolumnlist)
      })
    },
    methods: {
      async asyncSave() {
        try {
          const api = 'scscm/app/industryAjax!saveGoodscolumn.do'
          const params = {
            industryCode: this.industryCode,
            columnStr: JSON.stringify(this.tableValue.tableData)
          }
          const { data } = await this.proxy(this, api, 'post', params)
          if (data.map.state === '2') {
            this.$message.error(data.map.msg)
            return
          }
          this.$message.success('保存成功')
          this.$emit('save')
        } catch (e) {
          console.error(e)
        }
      },
      save() {
        this.asyncSave()
      },
      cancel() {
        this.$emit('cancel')
      }
    }
  }
</script>
