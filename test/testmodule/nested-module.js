/**
 * Created by tony on 3/18/17.
 */
'use strict'


let nestedModule1 = function (){
  "nest-module1"
}

nestedModule1.info = {
  name:"nest-module1"
}


// let nestedModule2 = function (){
//   "nest-module1"
// }
//
// module.exports.info = {
//   name:"nest-module2"
// }

module.exports = [
  nestedModule1,
  // nestedModule2,
  "./simple-module",
  {
    plugin:"./module-factory",
    options:"ttt"
  }
]

module.exports.info = {
  name:"composite-module"
}