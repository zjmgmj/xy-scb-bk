<template lang="pug">
.content
  el-tabs(type="border-card", v-model="tabName", @tab-click="tabsClick")
    el-tab-pane.padding-sm(label="常规字段", name="1")
      el-form(ref="form", :model="form", label-width="70px")
        el-form-item(label="金额")
          el-input.full-width(v-model="form.entryData1", clearable, size="mini")
        el-form-item(label="数量")
          el-input.full-width(v-model="form.entryData2", clearable, size="mini")
        el-form-item(label="明细科目")
          el-input.full-width(v-model="form.entryData3", clearable, size="mini")
        el-form-item(label="摘要")
          el-input.full-width(v-model="form.entryData4", clearable, size="mini")
        el-form-item(label="单位代码")
          el-input.full-width(v-model="form.entryData5", clearable, size="mini")
        el-form-item(label="单位名称")
          el-input.full-width(v-model="form.entryData6", clearable, size="mini")
        el-form-item(label="部门代码")
          el-input.full-width(v-model="form.entryData7", clearable, size="mini")
        el-form-item(label="职员代码")
          el-input.full-width(v-model="form.entryData8", clearable, size="mini")
        el-form-item(label="项目代码")
          el-input.full-width(v-model="form.entryData9", clearable, size="mini")
        el-form-item(label="项目名称")
          el-input.full-width(v-model="form.entryData10", clearable, size="mini")
        el-form-item(label="结算方式")
          el-input.full-width(v-model="form.entryData11", clearable, size="mini")
        el-form-item(label="结算单号")
          el-input.full-width(v-model="form.entryData12", clearable, size="mini")
        el-form-item(label="结算日期")
          el-input.full-width(v-model="form.entryData13", clearable, size="mini")
        el-form-item(label="汇率")
          el-input.full-width(v-model="form.entryData14", clearable, size="mini")
        el-form-item(label="外币金额")
          el-input.full-width(v-model="form.entryData15", clearable, size="mini")
        el-form-item(label="数据表")
          el-input.full-width(v-model="form.entryData16", clearable, size="mini")
    el-tab-pane.padding-sm(label="辅助核算项", name="2")
      el-form(ref="form", :model="formAux", label-width="70px")
        el-form-item(label="成本")
          el-input.full-width(v-model="formAux.entryAuxiliaryStr1", clearable, size="mini")
        el-form-item(label="品名")
          el-input.full-width(v-model="formAux.entryAuxiliaryStr2", clearable, size="mini")
        el-form-item(label="规格")
          el-input.full-width(v-model="formAux.entryAuxiliaryStr3", clearable, size="mini")
        el-form-item(label="费用项目")
          el-input.full-width(v-model="formAux.entryAuxiliaryStr4", clearable, size="mini")
    el-tab-pane.padding-sm(label="预览", name="3")
      el-input(type="textarea", autosize, v-model="sqlStr", :autosize="{ minRows: 10, maxRows: 20}")
  .text-right.mt-10
    el-button(@click="test", type="success", size="mini") 测试    
    el-button(@click="save", type="primary", size="mini") 确定
    el-button(@click="cancel", size="mini") 取消
</template>
<script>
import { Base64 } from 'js-base64'
export default {
  props: {
    tabRow: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      mysqlContent: '',
      form: {
        entryData1: '',
        entryData2: '',
        entryData3: '',
        entryData4: '',
        entryData5: '',
        entryData6: '',
        entryData7: '',
        entryData8: '',
        entryData9: '',
        entryData10: '',
        entryData11: '',
        entryData12: '',
        entryData13: '',
        entryData14: '',
        entryData15: '',
        entryData16: ''
      },
      formAux: {
        entryAuxiliaryStr1: '',
        entryAuxiliaryStr2: '',
        entryAuxiliaryStr3: '',
        entryAuxiliaryStr4: ''
      },
      sqlStr: '',
      tabName: '1'
    }
  },  
  methods: {
    tabsClick (tab) { 
      if (tab.name === '3') {
        this.getSqlStr()
      }
    },
    getSqlStr () {
      let str = 'select '
      const formArr = []
      for (const key in this.form) {
        formArr.push(this.form[key])
      }
      for (const key in this.formAux) {
        formArr.push(this.formAux[key])
      }
      str += formArr.toString()
      this.sqlStr = str + ' form ' + this.form.entryData16
    },
    cancel () {
      this.$emit('cancel')
    },
    save () {
      // this.$emit('save')
      this.getSqlStr()
      const params = Object.assign({}, this.form, this.formAux)      
      params.financeEntryId = this.tabRow.financeEntryId
      params.sqlStr = Base64.encode(this.sqlStr)
      this.saveSql(params)
    },
    test () {
      this.getSqlStr()
      const params = {
        financeEntryId: this.tabRow.financeEntryId,
        sqlStr: Base64.encode(this.sqlStr)
      }
      this.testSql(params)
    },
    async testSql (params) {
      try {
        const { data } = await this.proxy(this, 'scscm/app/financeEntryAjax!testSql.do', 'post', params)
        if (data.map.state === "2") {
          this.$message.error(data.map.msg)
          return 
        }
        this.$message.success('测试成功')
      } catch (e) {
        console.error(e)
      }
    },
    async saveSql (params) {
      try {
        const { data } = await this.proxy(this, 'scscm/app/financeEntryAjax!saveSql.do', 'post', params)
        if (data.map.state === "2") {
          this.$message.error(data.map.msg)
          return 
        }
        this.$message.success('测试成功')
        this.$emit('save')
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>

