<template lang="pug">
  el-form(ref="dialogForm", :model="form", :rules="rules", label-width="85px")
    el-form-item(label="行业名称", prop="industryName")
      el-input(v-model="form.industryName", size="mini")
    el-row
      el-col(:span="12")
        el-form-item(label="计件模式", prop="goodsPiecemode")
          el-radio(v-model="form.goodsPiecemode", :label="0") 默认
          el-radio(v-model="form.goodsPiecemode", :label="1") 件只
      el-col(:span="12")
        el-form-item(label="计价方式", prop="goodsPriceun")
          el-radio(v-model="form.goodsPriceun", :label="0") 重量
          el-radio(v-model="form.goodsPriceun", :label="1") 数量
    el-form-item(label="计重模式", prop="goodsWeightmode")
      el-radio(v-model="form.goodsWeightmode", :label="0") 默认
      el-radio(v-model="form.goodsWeightmode", :label="1") 过磅理算
      el-radio(v-model="form.goodsWeightmode", :label="2") 湿吨干吨
    el-form-item(label="计量方式", prop="goodsMetering")
      general-select(
        v-model="form.goodsMetering",
        url="scscm/app/basicDdAjax!queryCombo.do",
        list-prop="ddList",
        code-prop="ddName",
        name-prop="ddName",
        :extraParam="{ddtypeClass: 'goodsMetering'}"
        size="mini")
    el-form-item(label="物资属性", prop="goodsProperty")
      el-input(type="textarea", rows="2", v-model="form.goodsProperty", size="mini")
    el-form-item(label="备注", prop="orgRemark")
      el-input(v-model="form.orgRemark", size="mini")
    el-form-item.text-right.mt-15
      el-button(@click="cancel", size="small") 取消
      el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
  import generalSelect from '@/components/select/generalSelect'
  export default {
    components: {
      generalSelect
    },
    props: {
      form: {
        type: Object,
        default: () => {
          return {
            goodsPiecemode: 0,
            goodsPriceun: 0,
            goodsWeightmode: 0,
            goodsMetering: '',
            goodsProperty: '',
            orgRemark: ''
          }
        }
      }
    },
    data() {
      return {
        rules: {
          industryName: [
            { required: true, message: '请输入', trigger: 'blur' }
          ],
        }
      }
    },
    methods: {
      async asyncSave() {
        try {
          let api = 'scscm/app/industryAjax!save.do'
          if (this.form.columnId) {
            api = 'scscm/app/industryAjax!update.do'
          }
          const { data } = await this.proxy(this, api, 'post', { systemIndustry: this.form })
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
