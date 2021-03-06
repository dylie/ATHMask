const render=require('react-dom').render
const h=require('react-hyperscript')
const Root=require('./app/root')
const actions=require('./app/actions')
const configureStore=require('./app/store')
const txHelper=require('./lib/tx-helper')
global.log=require('loglevel')
module.exports=launchMetamaskUi
log.setLevel(global.METAMASK_DEBUG?'debug':'warn')
function launchMetamaskUi(opts,cb){var accountManager=opts.accountManager
actions._setBackgroundConnection(accountManager)
accountManager.getState(function(err,metamaskState){if(err)return cb(err)
const store=startApp(metamaskState,accountManager,opts)
cb(null,store)})}
function startApp(metamaskState,accountManager,opts){const store=configureStore({metamask:metamaskState,appState:{},networkVersion:opts.networkVersion,})
const unapprovedTxsAll=txHelper(metamaskState.unapprovedTxs,metamaskState.unapprovedMsgs,metamaskState.unapprovedPersonalMsgs,metamaskState.unapprovedTypedMessages,metamaskState.network)
if(unapprovedTxsAll.length>0){store.dispatch(actions.showConfTxPage())}
accountManager.on('update',function(metamaskState){store.dispatch(actions.updateMetamaskState(metamaskState))})
render(h(Root,{store:store,}),opts.container)
return store}