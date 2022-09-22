<template>
  <codemirror ref="cm" v-model="currentValue" :options="cmOptions" />
</template>

<script>
// require component
import { codemirror, CodeMirror } from 'vue-codemirror'

// require styles
//   import 'codemirror/lib/codemirror.css'

// language js
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/clike/clike.js'
import 'codemirror/mode/shell/shell.js'
import 'codemirror/mode/python/python.js'

// theme css
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'
import 'codemirror/theme/erlang-dark.css'
import 'codemirror/theme/3024-day.css'

// 导入自动提示核心文件及样式
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/hint/show-hint.js'
// 导入指定语言的提示文件
import 'codemirror/addon/hint/javascript-hint.js'
import 'codemirror/addon/display/autorefresh' // 自动刷新
if (CodeMirror !== require('codemirror')) {
  throw new Error('CodeMirror 版本依赖不正确，请保证项目依赖的版本和 vue-codemirror 依赖的版本是一致的。')
}

export default {
  name: 'CodeEditor',
  components: {
    codemirror
  },
  props: {
    value: {
      type: String,
      default: function() {
        return ''
      }
    },
    cmOptions: {}
  },
  data() {
    return {
    }
  },
  computed: {
    currentValue: {
      // 动态计算currentValue的值
      get: function() {
        return this.value// 将props中的value赋值给currentValue
      },
      set: function(val) {
        this.$emit('input', val) // 通过$emit触发父组件
      }
    },
    codemirror() {
      return this.$refs.cm.codemirror
    }
  },
  watch: {
    parentCode: function() { // 监听父组件的变化
      this.childrenCode = this.parentCode
    }
  }
}
</script>
