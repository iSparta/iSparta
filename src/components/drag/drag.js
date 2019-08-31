const path = require('path')
var foldPath = []
export default {
  drag () {
    var holder = document.getElementById('wrapper')
    holder.ondragover = function () {
      return false
    }
    holder.ondragleave = holder.ondragend = function () {
      return false
    }
    holder.ondrop = function (e) {
      foldPath.push(e.dataTransfer.files)
      // console.log(foldPath)
      e.preventDefault()
    }
        // return new Promise(function(resolve, reject) {
        //         resolve(foldPath);
        //         foldPath = [];
        // })
  }
}
