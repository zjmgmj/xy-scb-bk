<template lang="pug">
  el-dialog(title="公式", :visible="true", width="500px", @close="close")
    el-button(v-for="item in formulaButton", :key="item", size="mini", @click="formulaHandler(item)") {{item}}
    el-form.mt-5(:model="form", label-width="70px", ref="form")
      el-form-item(label="理算公式")
        el-input(v-model="form.partsnameFormula", size="mini")
      el-form-item(label="可用列名")
        el-select.full-width(v-model="form.goodsSpec", filterable, placeholder="请选择", size="mini", @change="goodsSpecChange")
          el-option(v-for="item in goodsSpecList", :key="item.value", :label="item.label", :value="item.value")
      el-form-item.text-right
        el-button(type="primary", size="mini", @click="saveFormula") 保存
        el-button(size="mini", @click="close") 关闭
</template>
<script>
export default {
  props: {
    form: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      formulaButton: ['+', '-', '*', '/', '(', ')'],
      goodsSpecList: [
        {label: '规格系数一', value: 'ggxs1_'},
        {label: '规格系数二', value: 'ggxs2_'},
        {label: '规格系数三', value: 'ggxs3_'},
        {label: '规格系数四', value: 'ggxs4_'},
        {label: '规格系数五', value: 'ggxs5_'},
        {label: '自定义数值项一', value: 'wznum1_'},
        {label: '自定义数值项二', value: 'wznum2_'},
        {label: '理算系数', value: 'lsxs_'},
        {label: '件支数', value: 'packagenum_'},
        {label: '件数', value: 'piecenum_'},
        {label: '支数', value: 'singernum_'}
      ]
    }
  },
  methods: {
    formulaHandler (val) {
      this.form.partsnameFormula += val
    },
    goodsSpecChange() {
      this.form.partsnameFormula += this.form.goodsSpec
    },
    async saveFormula () {
      try {
        delete this.form.goodsSpec
        const api = 'scscm/app/partsnameAjax!updateFormula.do'
        const { data } = await this.proxy(this, api, 'get', this.paramsFormat('partsname', this.form))
        if (data.map.state === "2") {
          this.$message.error(data.map.msg)
          return 
        }
        this.$message.success('修改成功')
        this.$emit('close', 'reload')
      } catch (e) {
        console.error(e)
      }      
    },
    close () {
      this.$emit('close')
    }
  }
}
</script>
