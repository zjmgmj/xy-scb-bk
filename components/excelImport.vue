<template lang="pug">
  el-dialog(
  ref="uploadDialog",
  title="Excel导入",
  :visible="true",
  :close-on-click-modal="false",
  :close-on-press-escape="false",
  @close="cancel")
    el-upload.crm-simple-upload(
    ref="upload",
    :action="fileUploadUrl",
    name="uploadExcel",
    :data="uploadData",
    accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    :limit="1",
    :auto-upload="false",
    :before-upload="beforePicUpload",
    :on-change="uploadChange",
    :on-remove="uploadRemove",
    :on-success="uploadSuccess",
    :on-progress="uploadProgress",
    :on-error="uploadError",
    v-if="step===1")
      el-button(slot="trigger", size="small",  type="primary") 选取文件
      el-button.ml-10(size="small", type="success", :disabled="disableUploadBtn", @click="uploadSubmit") 上传
      .el-upload__tip(slot="tip") 只能上传xls/xlsx文件，且不超过10MB
    div(v-if="step===2")
      .row {{uploadResult.impCount}} 行记录将被导入
      .row.mt-5 您确定执行此操作吗?
      .row.flex-content-end
        el-button(@click="cancel", size="small") 取消
        el-button(@click="save", type="primary", size="small") 确定
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'ExcelImport',
    componentName: 'ExcelImport',
    props: {
      uploadUrl: {
        type: String,
        required: true
      },
      importUrl: {
        type: String,
        required: true
      },
      extraParam: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data() {
      return {
        step: 1,
        fileList: [],
        uploadResult: {
          impCount: 0,
          uploadExcelPath: '',
          headerName: '',
          valueName: ''
        }
      }
    },
    computed: {
      ...mapState({
        fileUploadUrl: state => state.fileUploadUrl
      }),
      uploadData() {
        return { url: this.uploadUrl, ...this.extraParam }
      },
      disableUploadBtn() {
        return this.fileList.length === 0
      }
    },
    methods: {
      beforePicUpload(file) {
        // console.log(file)
        const imgType = (file.name.indexOf('xls') > 0) || (file.name.indexOf('xlsx') > 0)
        const imgSize = file.size / 1000000 <= 10
        if (!imgType) {
          this.$message.error('上传文件格式错误!')
        }
        if (!imgSize) {
          this.$message.error('上传文件大不能超过10M!')
        }
        return imgType && imgSize
      },
      uploadChange(file, fileList) {
        this.fileList = fileList
      },
      uploadRemove(file, fileList) {
        this.fileList = fileList
      },
      uploadSuccess(resp, file, fileList) {
        // console.log(resp)
        if (!resp.map) {
          this.msgShow(this, '上传失败')
          this.$refs.upload.clearFiles()
        } else if (resp.map.state !== '3') {
          this.msgShow(this, resp.map.msg)
          this.$refs.upload.clearFiles()
        } else if (resp.impCount === 0) {
          this.msgShow(this, '导入数据为空')
          this.$refs.upload.clearFiles()
        } else {
          this.msgShow(this, '文件上传成功', 'success')
          this.uploadResult = resp
          this.step = 2
        }

        // this.pageHide()
      },
      uploadProgress() {
        // this.pageShow(this)
      },
      uploadError() {
        // this.pageHide()
      },
      uploadSubmit() {
        this.$refs.upload.submit()
      },

      cancel() {
        this.$emit('cancel')
      },
      async save() {
        const uploadExcelPath = this.uploadResult.uploadExcelPath
        const headerName = this.uploadResult.headerName
        const valueName = this.uploadResult.valueName
        console.log({ uploadExcelPath, headerName, valueName })
        const { data } = await this.proxy(this, this.importUrl, 'post', { uploadExcelPath, headerName, valueName })
        if (data.map.state === '2') {
          this.$message.error(data.map.msg)
          return
        }
        this.$message.success('导入成功')
        this.$emit('success')
      }
    }

  }
</script>

<style lang="stylus" scoped>

</style>
