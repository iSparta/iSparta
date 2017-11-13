<template>
<section class="globalsetting">
<<<<<<< Updated upstream
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
=======
  <!-- Form -->
  <el-button type="text" @click="showDialog"><i class="el-icon-setting"></i></el-button>
  <el-dialog :title="$t('defaultSetting')" :visible.sync="dialogFormVisible" v-on:open="resetVarible" :modal="false" :modal-append-to-body="false">
    <el-form>
      <el-form-item :label="$t('language')" label-width="formLabelWidth">
        <el-select v-model="setting.language">
          <el-option label="简体中文" value="zh-cn"></el-option>
          <el-option label="繁體中文" value="zh-tw"></el-option>
          <el-option label="English" value="en-us"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('fps')" label-width="formLabelWidth">
        <el-input type="number" v-model="setting.options.frameRate" max="100" min="0" size="mini" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('loop')" label-width="formLabelWidth">
        <el-input type="number" v-model="setting.options.loop" size="mini" auto-complete="off"></el-input>{{ $t('times') }}
        <i>({{ $t('loopTips')}})</i>
      </el-form-item>
      <el-form-item :label="$t('filenameSuffix')" class="suffix" label-width="formLabelWidth">
        <el-input size="mini" v-model="setting.options.outputSuffix" :maxlength="10" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="Floyd">
        <el-input type="number" v-model="setting.options.floyd.value" max="1" min="0" size="mini" @blur="floydBlur"></el-input>
        <i>(0-1)</i>
      </el-form-item>
      <el-form-item label="Quality">
        <el-input type="number" v-model="setting.options.quality.value" max="100" min="0" size="mini" value="100" @blur="qualityBlur"></el-input>
        <i>(0-100)</i>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false">{{ $t('cancel')}}</el-button>
      <el-button type="primary" @click="changeVarible">{{ $t('confrim')}}</el-button>
    </div>
  </el-dialog>
>>>>>>> Stashed changes
</section>
</template>

<script>
<<<<<<< Updated upstream
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
=======

export default {
  data() {
    return {
      setting: JSON.parse(window.localStorage.getItem('globalSetting')),
      dialogFormVisible: false,
      formLabelWidth: '120px'
    }
  },
  methods: {
    floydBlur(){

    },
    qualityBlur(){

    },
    showDialog(){
      let locked = this.$store.getters.getterLocked;
      if(locked){
        return false;
      }
      this.dialogFormVisible = true
    },
    resetVarible(){
      this.setting = JSON.parse(window.localStorage.getItem('globalSetting'))
    },
    changeVarible() {
      //save to localStorage
      window.localStorage.setItem('globalSetting', JSON.stringify(this.setting))
      this.$data.dialogFormVisible = false
      //change language
      switch (this.setting.language) {
        case 'zh-cn':
          this.$i18n.locale = 'zh-cn'
          break;
        case 'zh-tw':
          this.$i18n.locale = 'zh-tw'
          break;
        case 'en-us':
          this.$i18n.locale = 'en-us'
          break;
        default:
          break;
      }
    }
  }
}
>>>>>>> Stashed changes
</script>

<style lang="scss">
@import "./globalSetting.scss";
</style>
