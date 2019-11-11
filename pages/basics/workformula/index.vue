<template lang="pug">
.content.bg-gray.mt-15.ml-15.mr-15
  button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
  .mt-15.formula-button-box
    el-button.mr-5.mb-5(size="mini", v-for="(item, index) in formulaButton", :key="index", @click="formulaHandler(item)") {{item}}
  .mt-15
    .ft-15 公式说明：
    .mt-10
      el-input(type="textarea", v-model="form.workformulaFormulaStr", :rows="4", readonly)
  .mt-15
    .ft-15 备注：
    .mt-10
      el-input(type="textarea", v-model="form.workformulaRemark", :rows="4")
</template>
<script>
import buttonGroup from '~/components/buttonGroup.vue'  
import erplrPanel from '~/components/erplrPanel'
export default {
  layout: 'backend',
  components: {
    buttonGroup,
    erplrPanel
  },
  data () {
    return {
      form: {
        workformulaFormulaStr: '',
        workformulaRemark: ''
      },      
      buttonGroupInfo: [
        {lbl: '保存', type: 'save', icon: 'el-icon-circle-check'},
        {lbl: '删除', type: 'del', icon: 'el-icon-delete'},
        {lbl: '刷新', type: 'refresh', icon: 'el-icon-delete'},
      ],
      formulaButton: ['类别系数', '品名系数', '业务量', '作业人数', '工种人数', '工种系数', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+', '-', '*', '/', '(', ')']
    }
  },
  mounted () {
    this.loadData()
  },
  methods: {
    buttonGroupClick (type) {
      switch (type) {
        case 'save':
          this.saveAsync()
          break
        case 'del':
          this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
            this.delAsync()
          })
          break
        case 'refresh':
          this.loadData()
          break
        default:
          console.log('error')
      }
    },
    formulaHandler (type) {
      console.log(type)
      this.form.workformulaFormulaStr += type
    },
    async loadData (params) {
      try {
        const api = 'scscm/app/workformulaAjax.do'
        const { data } = await this.proxy(this, api, 'post')
        console.log(data)
        if (data.workformula) {
          this.form = data.workformula
        } else {
          this.form = {
            workformulaFormulaStr: '',
            workformulaRemark: ''
          }
        }
      } catch (e) {
        console.error(e)
      }
    },
    async saveAsync (params) {
      try {
        const api = 'scscm/app/workformulaAjax!update.do'
        const { data } = await this.proxy(this, api, 'post', this.paramsFormat('workformula', this.form))
        console.log(data)
        if (data.map.state !== '3') {
          this.$message.error(data.map.msg ? data.map.msg : '保存失败')
          return
        }
        this.$message.success('保存成功')
      } catch (e) {
        console.error(e)
      }
    },
    async delAsync (params) {
      try {
        const api = 'scscm/app/workformulaAjax!delete.do'
        const { data } = await this.proxy(this, api, 'post')
        if (data.map.state === '3') {
            this.msgShow(this, '删除成功', 'success')
            this.loadData()
          } else {
            this.msgShow(this, data.map.msg)
          }
      } catch (e) {
        console.error(e)
      }
    },
  }
}
</script>
<style lang="stylus" scoped>
.formula-button-box
  width 650px
  button
    width: 100px; 
    margin-left: 0;
</style>

