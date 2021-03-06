const createParentStream=require('iframe-stream').ParentStream
const SWcontroller=require('client-sw-ready-event/lib/sw-client.js')
const SwStream=require('sw-stream/lib/sw-stream.js')
const intervalDelay=Math.floor(Math.random()*(30000-1000))+1000
const background=new SWcontroller({fileName:'/background.js',letBeIdle:!1,wakeUpInterval:30000,intervalDelay,})
const pageStream=createParentStream()
background.on('ready',()=>{const swStream=SwStream({serviceWorker:background.controller,context:'dapp',})
pageStream.pipe(swStream).pipe(pageStream)})
background.on('updatefound',()=>window.location.reload())
background.on('error',console.error)
background.startWorker()