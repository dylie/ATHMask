enableFailureOnUnhandledPromiseRejection()
var log=require('loglevel')
log.setDefaultLevel(5)
global.log=log
require('jsdom-global')()
window.localStorage={}
if(!window.crypto)window.crypto={}
if(!window.crypto.getRandomValues)window.crypto.getRandomValues=require('polyfill-crypto.getrandomvalues')
function enableFailureOnUnhandledPromiseRejection(){global.Promise=require('bluebird')
if(typeof process!=='undefined'){process.on('unhandledRejection',function(reason){throw reason})}else if(typeof window!=='undefined'){if(typeof window.addEventListener==='function'){window.addEventListener('unhandledrejection',function(evt){throw evt.detail.reason})}else{var oldOHR=window.onunhandledrejection
window.onunhandledrejection=function(evt){if(typeof oldOHR==='function')oldOHR.apply(this,arguments)
throw evt.detail.reason}}}else if(typeof console!=='undefined'&&typeof(console.error||console.log)==='function'){(console.error||console.log)('Unhandled rejections will be ignored!')}}