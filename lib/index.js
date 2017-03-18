/**
 * Created by tony on 3/18/17.
 */
'use strict'
const path = require('path');

// run a sequence of functions like fn(next) where next is fn(err)
function runCallbacksInSequence(functions, cb){
  // last argument will pass to functions each time
  if(functions.length == 0){
    cb()
  }
  else {
    _recursiveRun(functions,0,cb)
  }
  
}

function _recursiveRun(functions, cursor, cb){
  functions[cursor]((err)=>{
    if(err){
      cb(err)
    }
    else {
      if(cursor < functions.length-1){
        _recursiveRun(functions,cursor+1,cb)
      }
      else {
        cb()
      }
      
    }
  })
  
  
}

/**
 * determine whether the host contains the the given creteria,
 * if value in creteria is array, then host must be array and contains all values in creteria array,
 * if value is RegExp then RegExp must apply to that field
 * if value is speical char like "<*>"=> any thing but not undefined
 * @param target
 * @param pattern
 * @private
 */
function patternMatch(target, pattern) {
  if(typeof pattern === "object"){
    // array
    if(Array.isArray(pattern)){
      if(!Array.isArray(target)){
        throw new Error(`to use Array structure compare, host must be array too`)
      }
      return pattern.every((itemCreteria)=>{
        return target.some((item)=>patternMatch(item,itemCreteria))
      })
    }
    //RegExp
    else if(pattern instanceof RegExp){
      if(typeof target === "object" && (target === null || target === undefined)){
        throw new Error(`to use RegExp strcuture compare, host should be string or number but was [${target}]`)
      }
      
      return pattern.test(target)
    }
    // object
    else {
      if(typeof target !== "object" || Array.isArray(target) || target instanceof RegExp){
        return false
      }
      return Object.keys(pattern).every((key)=>(patternMatch(target[key],pattern[key])))
    }
  }
  // others
  else {
    if(typeof pattern === "string"){
      if(pattern === "<any>"){
        return target !== undefined
      }
    }
    return target === pattern
  }
}


//test
// runCallbacksInSequence([
//   (cb)=>{
//     console.log(":1");
//     cb()
//   },
//   (cb)=>{
//     console.log(":2");
//     cb()
//   }
// ],function (err){
//     console.log("end");
//     console.log(err);
// })



function requireRelativePlugin(workingDir,relativePath){
  return require(require.resolve(path.resolve(workingDir,relativePath)))
}

/**
 * load npmModule ignore whether it's relative or dependency
 * @param path
 * @param workingDir [optinoal] if missing use __dirname
 * @returns {*}
 */
function loadNpmModule(path, workingDir){
  if(path.startsWith(".")){
    return requireRelativePlugin(workingDir || __dirname, path)
  }
  else {
    return require(path)
  }
}

function getNpmModuleAbsolutePath(npmModulePath, workingDir) {
  if(npmModulePath.startsWith(".")){
    return require.resolve(path.resolve(workingDir,npmModulePath))
  }
  else {
    return require.resolve(npmModulePath)
  }
}

/**
 * the mechanism to load Hanbao Module (list will be flattened, unit should be string(module name),function(module), object(factory))
 * a hanbao module should be
 * trace will be added to each module
 * @param module : object or array
 * @param options: trace,workingDir,check(check the integrity of module),factoryFieldName(the filedname of factory)
 * @return array of module
 */
function loadHanbaoModule(module,options){
  if(!Array.isArray(module)){
      module = [module]
  }
  
  let flattenedModules = []
  
  options.trace = options.trace || []
  
  for (let submodule of module) {
    _recursiveLoadHanbaoModule(submodule,options,flattenedModules)
  }
  
  return flattenedModules
}

function _recursiveLoadHanbaoModule(module,options, flatternedModules){
  let error
  let processedModule
  let moduleFilePath
  
  if(typeof module === "string"){
    processedModule = loadNpmModule(module,options.workingDir)
    moduleFilePath = getNpmModuleAbsolutePath(module,options.workingDir)
  }
  else if(typeof module === "function"){
    processedModule = module
  }
  else if(Array.isArray(module)){
    
    processedModule = module
  }
  // factory
  else if(typeof module === "object"){
    
    error = new Error(`must contains '${options.factoryFieldName}' field on Hanbao module (factory type)`)
    error._debug = {trace:options.trace,module}
    assert(module[options.factoryFieldName],error)
    
    // if factory module, load factory module
    let factory = module[options.factoryFieldName]
    if(typeof factory === "string"){
      let factoryPath = factory
      factory = loadNpmModule(factory,options.workingDir)
      moduleFilePath = getNpmModuleAbsolutePath(factoryPath,options.workingDir)
    }
    else if(typeof factory === "function"){
        // already factory
    }
    else
    {
      // shouldn't reach here
      error = new Error(`hanbao module (factory type) has error, make sure it's string or object or function`)
      error._debug = {trace:options.trace,module}
      raise(error)
    }
    
    try {
      processedModule = factory(module.options)
    }
    catch (err){
      err._debug = {
        trace:options.trace,
        module
      }
      throw err
    }
    
    
  }
  
  
  if(processedModule){
  
    if(options.check){
      let checkresult = options.check(processedModule)
      
      if(checkresult ===true){
          //success
      }
      else{
        let errormessage = checkresult || "hanbao module not fulfill the check"
        error = new Error(errormessage)
        error._debug = {trace:options.trace,module}
        raise(error)
      }
    }
    
    if(Array.isArray(processedModule)){
      options.trace.push(processedModule)
      let outerWorkingDir = options.workingDir
      options.workingDir= path.dirname(moduleFilePath)
      
      for (let submodule of processedModule) {
        _recursiveLoadHanbaoModule(submodule,options,flatternedModules)
      }
      options.trace.pop(processedModule)
      options.workingDir = outerWorkingDir
    }
    else {
      processedModule._debug = {trace:Object.assign([],options.trace)}
      flatternedModules.push(processedModule)
    }
  }
  
  
  
}

// throw the given error if the expression is not true, also tunning the stack of error to show the place error throw
function assert(isTrue,error){
  if(!isTrue){
    // if not error, turn it into error
    if(!(error instanceof Error)){
      error = new Error(error.toString())
    }
  
    Error.captureStackTrace(error,assert)
    
    throw error
  }
}

// directly throw the error
function raise(error){
  if(!(error instanceof Error)){
    error = new Error(error.toString())
  }
  
  Error.captureStackTrace(error,assert)
  throw error
}


module.exports = {
  loadNpmModule,
  loadHanbaoModule,
  runCallbacksInSequence,
  patternMatch,
  assert,
  raise
}