<template lang="pug">
el-dialog(width="875px", title="附件", :visible="true", append-to-body, top="10px", @close="close")
  button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
  .mt-5
    el-form.mt-10(ref="form", :model="fileFrom", :rules="rules", label-width="100px")
      el-row
        el-col(:span="6")
          el-form-item(label="文件名", prop="fileName")
            el-input.full-width(v-model="fileFrom.fileName", clearable, size="mini")
        el-col(:span="18")
          el-form-item(label="附件上传")
            el-upload.flex(
              action="/proxy/fileImport/post", 
              :limit="1", 
              :on-success="uploadSuccess",
              :file-list="fileList",
              name="uploadfile", :data="file", ref="upload", :auto-upload="false")
              el-button(slot="trigger", size="mini" type="primary", @click="$refs.upload.clearFiles()") 选择
      el-form-item(label="文件描述", prop="fileTxt")      
        el-input(type="textarea", :rows="2", placeholder="请输入内容", v-model="fileFrom.fileTxt")        
  basic-elx-table(
    :tableValue="tableValue",  
    @tableRowDown="rowDown",
    @tableRowDel="rowDel",  
    @rowSelection="rowSelection")
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
    table: {
      type: Array,
      default: () => {
        return []
      }
    },
    fileMod: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      fileList: [{name: 'test', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'}],
      buttonGroupInfo: [
        {lbl: '增加', type: 'add', icon: 'el-icon-folder-plus'},
        {lbl: '修改', type: 'edit', icon: 'el-icon-edit'},
        {lbl: '删除', type: 'del', icon: 'el-icon-delete'},
        {lbl: '重置', type: 'reset', icon: 'el-icon-refresh-right'},
        {lbl: '刷新', type: 'refresh', icon: 'el-icon-refresh'}
      ],
      url: 'scscm/app/oaFileAjax!save.do',      
      fileFrom: {
        fileTxt: '',
        fileName: '',
        fileId: '',
        fileOpcode: "CGJH000019000017",
        fileBilltype: "P001",
        fileOldName: '',
        filePath: ''
      },
      rules: {
        fileName: [{ required: true, message: '请输入文件名称' }]
      },
      tableValue: {
        tableHeight: '300',
        showRowIndex: true,
        tableHead: [
          {lbl: '文件名', prop: 'fileShowName', width: '150px'},
          {lbl: '下载次数', prop: 'fileDnum', width: '80px'},
          {lbl: '上传时间', prop: 'dataSystemdateStr', width: '150px'},
          {lbl: '上传人', prop: 'operatorName', width: '150px'},
          {lbl: '文件描述', prop: 'fileTxt'},
          {type: 'action', width: '100px', fixed: 'right', actionBtns: [
              {lbl: '下载', type: 'down'}, 
              {lbl: '删除', type: 'del'}
            ]
          }
        ],
        tableData: []
      },
      tableSelect: [],
      fileData: {},
      queryObject: {          
        page: this.currentPage,
        start: 0,
        limit: this.pageSize,
        sort: '[{"property":"fileId","direction":"ASC"}]'
      },
    }
  },
  computed: {
    file () {
      return {url: this.url, ...this.fileFrom}
    }
  },
  mounted() {
    this.$nextTick(() => {
      Object.assign(this.fileFrom, this.fileMod)
      Object.assign(this.queryObject, this.fileMod)
      this.loadData()
    })    
  },
  methods: {
    uploadSuccess (response, file, fileList) {
      if (response.map.state !== '3') {
        this.$message.error(response.map.msg ? response.map.msg : '上传失败')
        return false
      }
      this.$message.success('上传成功')
      this.resetForm()
      this.loadData()      
    },
    upload() {
      this.$refs.form.validate((valid) => {
        if (valid) {          
          this.$refs.upload.submit()
        } else {
          console.log('error submit!!');
          return false;
        }
      })
    },
    buttonGroupClick(flag) {
      switch(flag) {
        case 'add':
          if (this.$refs.upload.uploadFiles.length === 0) {
            this.$message.error('请选择文件上传')
            return false
          }
          this.url = 'scscm/app/oaFileAjax!save.do'
          this.upload()
          break
        case 'edit':
          this.url = 'scscm/app/oaFileAjax!update.do'
          this.$refs.upload.submit()
          console.log()
          break
        case 'del':
          if (this.rowSelection.length < 1) {
            this.$message.error('请选择需要删除的数据')
            return false
          }  
          this.rowDel()                         
          break
        case 'reset':
          this.resetForm()
          break
        case 'refresh':
          this.loadData()
          break
        default:
          console.error('error')
          break
      }
    },
    resetForm () {
      this.$refs.form.resetFields()
      this.$refs.upload.clearFiles()
    },
    rowDown (row) {  
      this.download(this, 'scscm/app/oaFileAjax!download.do', {fileId: row.fileId})
    },
    rowDel (row) {
      this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
        const list = row ? [row] : this.tableSelect
        const params = {
          fileId: list[0].fileId
        }
        this.delete(params)
      })      
    },
    rowSelection (row) {
      this.tableSelect = row      
      Object.keys(this.fileFrom).forEach((key) => {
        this.fileFrom[key] = row[0][key]
      })
    },
    close() {
      this.$refs.form.resetFields()
      this.$emit('close')
    },
    async loadData () {
      this.loading = true
      try {
        const { data } = await this.proxy(this, 'scscm/app/oaFileAjax.do', 'post', this.queryObject)
        this.tableValue.tableData = []
        if (data.fileList.length > 0) {
          this.tableValue.tableData = data.fileList
        }
      } catch (e) {
        console.error(e)
      }
      this.loading = false
    },
    async delete (params) {
      try {          
        const { data } = await this.proxy(this, 'scscm/app/oaFileAjax!delete.do', 'post', params)
        console.log(data)
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
        this.loading = false
      }
    }    
  }
}
</script>