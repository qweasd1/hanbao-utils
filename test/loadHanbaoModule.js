/**
 * Created by tony on 3/18/17.
 */
'use strict'
const loadHanbaoModule = require('../lib/index').loadHanbaoModule;


// // relative module
// console.log(loadHanbaoModule("./testmodule/simple-module",
//   {
//     workingDir:__dirname,
//     factoryFieldName:"plugin"
//   })
// );
//
//
// // factory (literal)
// console.log(loadHanbaoModule(
//   [
//     {
//       plugin:"./testmodule/module-factory",
//       options:"test"
//     }
//   ],
//   {
//     workingDir:__dirname,
//     factoryFieldName:"plugin"
//   })
// );
//
//
// // factory (function)
// console.log(loadHanbaoModule(
//   [
//     {
//       plugin:function (options){
//         let module = function (){
//
//         }
//
//         module.info = {
//           name:"module-from-function",
//           options: options
//         }
//
//         return module
//       },
//       options:"test"
//     }
//   ],
//   {
//     workingDir:__dirname,
//     factoryFieldName:"plugin"
//   })
// );


//// nested module

// console.log(loadHanbaoModule(
//   [
//     "./testmodule/nested-module"
//   ],
//   {
//     workingDir:__dirname,
//     factoryFieldName:"plugin"
//   })
// );


// module factory with exception

try {
  console.log(loadHanbaoModule(
    [
      {
        plugin:"./testmodule/module-factory-with-exception",
        options:"test"
      }

    ],
    {
      workingDir:__dirname,
      factoryFieldName:"plugin"
    })
  );
}
catch(e){
  console.log(e);
}


// module factory with exception

try {
  console.log(loadHanbaoModule(
    [
      "./testmodule/module-factory-with-exception"
    
    ],
    {
      workingDir:__dirname,
      factoryFieldName:"plugin",
      check:function (module){
          if(!module.info || !module.info.name){
              return "plugin must have 'info' attribute"
          }
      }
    })
  );
}
catch(e){
  console.log(e);
}
