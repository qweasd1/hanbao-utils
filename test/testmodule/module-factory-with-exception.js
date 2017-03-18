/**
 * Created by tony on 3/18/17.
 */
'use strict'
module.exports = function (options){
  let module = function (){
    
  }
  
  throw new Error("error in module factory")
  
  module.info = {
    name:"module-from-factory",
    options: options
  }
  
  return module
}