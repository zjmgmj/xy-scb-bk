<template lang="pug">
  el-form(ref="dialogForm", :model="form", :rules="rules", label-width="90px")
    .row
      .col
        el-form-item(label="含税单价", prop="goodsInprice")
          el-input.full-width(v-model="form.goodsInprice", clearable, size="mini", @change="formatNum($event, '+2', 'form.goodsInprice', calculatePriceMoney)")
      .col
        el-form-item(label="无税单价", prop="goodsExprice")
          el-input.full-width(v-model="form.goodsExprice", clearable, size="mini", @change="formatNum($event, '+6', 'form.goodsExprice', calculatePriceMoney)")
    .row
      .col
        el-form-item(label="税率", prop="goodsTaxrate")
          el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini", @change="formatNum($event, '+2', 'form.goodsTaxrate', calculatePriceMoney)")
      .col
        el-form-item(label="费用单价", prop="goodsInfeeprice")
          el-input.full-width(v-model="form.goodsInfeeprice", clearable, size="mini", @change="formatNum($event, '+2', 'form.goodsInfeeprice', calculatePriceMoney)")
    el-form-item(label="备注", prop="goodsInitRemark")
      el-input.full-width(v-model="form.goodsInitRemark", clearable, size="mini")
    el-form-item.text-right
      el-button(@click="cancel", size="small") 取消
      el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
  export default {
    props: {
      form: {
        type: Object,
        default: () => {
          return {
            goodsInprice: '',
            goodsExprice: '',
            goodsTaxrate: '',
            goodsInfeeprice: '',
            goodsInitRemark: ''
          }
        }
      }
    },
    data() {
      return {
        rules: {
          goodsInprice: [
            { required: true, message: '请输入', trigger: 'blur' }
          ],
        },
      }
    },
    methods: {
      calculatePriceMoney(val){
        // TODO 费率计算  含税单价、无税单价、税率等等，抽成公共方法
        // 原 global.Util._pricemoneycomputer 方法在 Utils.js文件中

      },
      async asyncSave() {
        try {
          const api = 'scscm/app/warehouseGoodsCostInitAjax!update.do'
          const { data } = await this.proxy(this, api, 'post', { mod: this.form })
          if (data.map.state === '2') {
            this.$message.error(data.map.msg)
            return
          }
          this.$message.success('保存成功')
          this.$refs.dialogForm.resetFields()
          this.$emit('save')
        } catch (e) {
          console.error(e)
        }
      },
      save() {
        this.$refs.dialogForm.validate((valid) => {
          if (valid) {
            this.asyncSave()
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
      cancel() {
        this.$refs.dialogForm.resetFields()
        this.$emit('cancel')
      }
    }
  }
</script>
