<template>
<section class="globalsetting">
  <!-- Form -->
  <el-button type="text" @click="showDialog"><i class="el-icon-setting"></i></el-button>
  <el-dialog :title="$t('defaultSetting')" :visible.sync="dialogFormVisible" v-on:open="resetVarible" :modal="true" :modal-append-to-body="true" :append-to-body="true" width="540px" :close-on-click-modal="false">
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
</section>
</template>

<script>
export default {
  data() {
    return {
      setting: JSON.parse(window.storage.getItem('globalSetting')),
      dialogFormVisible: false,
      formLabelWidth: '120px'
    }
  },
  mounted(){
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
      this.setting = JSON.parse(window.storage.getItem('globalSetting'))
    },
    changeVarible() {
      //save to localStorage
      
      window.storage.setItem('globalSetting', JSON.stringify(this.setting))
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
</script>

<style lang="scss">
@import "./globalSetting.scss";
</style>
