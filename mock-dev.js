const extend=require('xtend')
const render=require('react-dom').render
const h=require('react-hyperscript')
const pipe=require('mississippi').pipe
const Root=require('./ui/app/root')
const configureStore=require('./ui/app/store')
const actions=require('./ui/app/actions')
const states=require('./development/states')
const Selector=require('./development/selector')
const MetamaskController=require('./app/scripts/metamask-controller')
const firstTimeState=require('./app/scripts/first-time-state')
const extension=require('./development/mockExtension')
const noop=function(){}
const log=require('loglevel')
window.log=log
log.setLevel('debug')
const qs=require('qs')
let queryString=qs.parse(window.location.href.split('#')[1])
let selectedView=queryString.view||'first time'
const firstState=states[selectedView]
updateQueryParams(selectedView)
function updateQueryParams(newView){queryString.view=newView
const params=qs.stringify(queryString)
window.location.href=window.location.href.split('#')[0]+`#${params}`}
const MetaMaskUiCss=require('./ui/css')
const injectCss=require('inject-css')
const controller=new MetamaskController({showUnconfirmedMessage:noop,unlockAccountMessage:noop,showUnapprovedTx:noop,platform:{},initState:firstTimeState,})
global.metamaskController=controller
actions._setBackgroundConnection(controller.getApi())
actions.update=function(stateName){selectedView=stateName
updateQueryParams(stateName)
const newState=states[selectedView]
return{type:'GLOBAL_FORCE_UPDATE',value:newState,}}
var css=MetaMaskUiCss()
injectCss(css)
var store=configureStore(firstState)
startApp()
function startApp(){const body=document.body
const container=document.createElement('div')
container.id='test-container'
body.appendChild(container)
render(h('.super-dev-container',[h('button',{onClick:(ev)=>{ev.preventDefault()
store.dispatch(actions.update('terms'))},style:{margin:'19px 19px 0px 19px',},},'Reset State'),h(Selector,{actions,selectedKey:selectedView,states,store}),h('#app-content',{style:{height:'500px',width:'360px',boxShadow:'grey 0px 2px 9px',margin:'20px',},},[h(Root,{store:store,}),]),]),container)}