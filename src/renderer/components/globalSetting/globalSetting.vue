<template>
<section class="globalsetting">
<!-- Form -->
<el-button type="text" @click="dialogFormVisible = true" ><i class="el-icon-setting"></i></el-button>
<el-dialog title="全局设置" :visible.sync="dialogFormVisible" v-on:open="resetVarible" :modal="false" :modal-append-to-body="false">
    <el-form :model="form">
      <el-form-item label="帧频:" label-width="formLabelWidth">
        <el-input type="number" v-model="form.frameRate" max="100" min="0" size="mini" auto-complete="off"></el-input>fps
      </el-form-item>
    </el-form>
    <el-form :model="form">
    <el-form-item label="循环:" label-width="formLabelWidth">
      <el-input type="number" v-model="form.loop" size="mini" auto-complete="off"></el-input>次
      <i>(0次代表无限循环)</i>
      </el-form-item>
    </el-form>
    <el-form :model="form">
    <el-form-item label="输出名字:" class="suffix" label-width="formLabelWidth">
      <el-input size="mini"  v-model="form.suffix" auto-complete="off"></el-input>
    </el-form-item>
  </el-form>
  <!--  -->
    <el-form :inline="true">
      <el-form-item label="压缩质量参数floyd:">
        <el-input type="number"  v-model="form.floyd" max="1" min="0" size="mini"></el-input>
        <i>(0-1)</i>
      </el-form-item>
    </el-form>
    <el-form :inline="true">
      <el-form-item label="压缩质量参数quality:">
        <el-input type="number" v-model="form.quality" max="100" min="0" size="mini" value="100"></el-input>
        <i>(0-100)</i>
      </el-form-item>
    </el-form>
  <div slot="footer" class="dialog-footer">
    <el-button @click="dialogFormVisible = false">取 消</el-button>
    <el-button type="primary" @click="changeVarible">确 定</el-button>
  </div>
</el-dialog>
</section>
</template>

<script>
  export default {
    data () {
      return {
        dialogFormVisible: false,
        form: {
          frameRate: '25',
          loop: '0',
          suffix: 'output-ispt',
          floyd: '0.35',
          quality: '100'
        },
        formLabelWidth: '120px'
      }
    },
    computed: {
        // resetVarible(){
        //   return false
        // }
    },
    methods: {
      resetVarible () {
        let globalSetting = JSON.parse(window.localStorage.getItem('globalSetting'))
        console.log(globalSetting)
        this.$data.form.frameRate = globalSetting.options.frameRate
        this.$data.form.loop = globalSetting.options.loop
        this.$data.form.suffix = globalSetting.options.outputName
        this.$data.form.floyd = globalSetting.options.floyd.value
        this.$data.form.quality = globalSetting.options.quality.value
      },
      changeVarible () {
        let globalSetting = JSON.parse(window.localStorage.globalSetting)
        console.log(typeof (globalSetting))
        globalSetting.options.frameRate = this.$data.form.frameRate
        globalSetting.options.loop = this.$data.form.loop
        globalSetting.options.outputName = this.$data.form.suffix
        globalSetting.options.floyd.value = this.$data.form.floyd
        globalSetting.options.quality.value = this.$data.form.quality
        window.localStorage.setItem('globalSetting', JSON.stringify(globalSetting))
        this.$data.dialogFormVisible = false
      }
    }
  }
</script>

<style lang="scss">
@import "./globalSetting.scss";
</style>
