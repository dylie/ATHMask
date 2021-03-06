global.window=global
const SwGlobalListener=require('sw-stream/lib/sw-global-listener.js')
const connectionListener=new SwGlobalListener(global)
const setupMultiplex=require('../../app/scripts/lib/stream-utils.js').setupMultiplex
const DbController=require('idb-global')
const SwPlatform=require('../../app/scripts/platforms/sw')
const MetamaskController=require('../../app/scripts/metamask-controller')
const Migrator=require('../../app/scripts/lib/migrator/')
const migrations=require('../../app/scripts/migrations/')
const firstTimeState=require('../../app/scripts/first-time-state')
const STORAGE_KEY='metamask-config'
const METAMASK_DEBUG=process.env.METAMASK_DEBUG
global.metamaskPopupIsOpen=!1
const log=require('loglevel')
global.log=log
log.setDefaultLevel(METAMASK_DEBUG?'debug':'warn')
global.addEventListener('install',function(event){event.waitUntil(global.skipWaiting())})
global.addEventListener('activate',function(event){event.waitUntil(global.clients.claim())})
log.debug('inside:open')
const dbController=new DbController({key:STORAGE_KEY,})
loadStateFromPersistence().then((initState)=>setupController(initState)).then(()=>log.debug('MetaMask initialization complete.')).catch((err)=>console.error('WHILE SETTING UP:',err))
async function loadStateFromPersistence(){const migrator=new Migrator({migrations})
const initialState=migrator.generateInitialState(firstTimeState)
dbController.initialState=initialState
const versionedData=await dbController.open()
const migratedData=await migrator.migrateData(versionedData)
await dbController.put(migratedData)
return migratedData.data}
async function setupController(initState,client){const platform=new SwPlatform()
const controller=new MetamaskController({platform,showUnconfirmedMessage:noop,unlockAccountMessage:noop,showUnapprovedTx:noop,initState,})
global.metamaskController=controller
controller.store.subscribe(async(state)=>{try{const versionedData=await versionifyData(state)
await dbController.put(versionedData)}catch(e){console.error('METAMASK Error:',e)}})
async function versionifyData(state){const rawData=await dbController.get()
return{data:state,meta:rawData.meta,}}
connectionListener.on('remote',(portStream,messageEvent)=>{log.debug('REMOTE CONECTION FOUND***********')
connectRemote(portStream,messageEvent.data.context)})
function connectRemote(connectionStream,context){var isMetaMaskInternalProcess=(context==='popup')
if(isMetaMaskInternalProcess){controller.setupTrustedCommunication(connectionStream,'MetaMask')
global.metamaskPopupIsOpen=!0}else{setupUntrustedCommunication(connectionStream,context)}}
function setupUntrustedCommunication(connectionStream,originDomain){var mx=setupMultiplex(connectionStream)
controller.setupProviderConnection(mx.createStream('provider'),originDomain)
controller.setupPublicConfig(mx.createStream('publicConfig'))}}
function noop(){}