const Component=require('react').Component
const h=require('react-hyperscript')
const inherits=require('util').inherits
const extend=require('xtend')
const debounce=require('debounce')
const copyToClipboard=require('copy-to-clipboard')
const ENS=require('ethjs-ens')
const networkMap=require('ethjs-ens/lib/network-map.json')
const ensRE=/.+\..+$/
const ZERO_ADDRESS='0x0000000000000000000000000000000000000000'
module.exports=EnsInput
inherits(EnsInput,Component)
function EnsInput(){Component.call(this)}
EnsInput.prototype.render=function(){const props=this.props
const opts=extend(props,{list:'addresses',onChange:()=>{const network=this.props.network
const networkHasEnsSupport=getNetworkEnsSupport(network)
if(!networkHasEnsSupport)return
const recipient=document.querySelector('input[name="address"]').value
if(recipient.match(ensRE)===null){return this.setState({loadingEns:!1,ensResolution:null,ensFailure:null,})}
this.setState({loadingEns:!0,})
this.checkName()},})
return h('div',{style:{width:'100%'},},[h('input.large-input',opts),h('datalist#addresses',[Object.keys(props.identities).map((key)=>{const identity=props.identities[key]
return h('option',{value:identity.address,label:identity.name,key:identity.address,})}),props.addressBook.map((identity)=>{return h('option',{value:identity.address,label:identity.name,key:identity.address,})}),]),this.ensIcon(),])}
EnsInput.prototype.componentDidMount=function(){const network=this.props.network
const networkHasEnsSupport=getNetworkEnsSupport(network)
this.setState({ensResolution:ZERO_ADDRESS})
if(networkHasEnsSupport){const provider=global.ethereumProvider
this.ens=new ENS({provider,network})
this.checkName=debounce(this.lookupEnsName.bind(this),200)}}
EnsInput.prototype.lookupEnsName=function(){const recipient=document.querySelector('input[name="address"]').value
const{ensResolution}=this.state
log.info(`ENS attempting to resolve name: ${recipient}`)
this.ens.lookup(recipient.trim()).then((address)=>{if(address===ZERO_ADDRESS)throw new Error('No address has been set for this name.')
if(address!==ensResolution){this.setState({loadingEns:!1,ensResolution:address,nickname:recipient.trim(),hoverText:address+'\nClick to Copy',ensFailure:!1,})}}).catch((reason)=>{log.error(reason)
return this.setState({loadingEns:!1,ensResolution:ZERO_ADDRESS,ensFailure:!0,hoverText:reason.message,})})}
EnsInput.prototype.componentDidUpdate=function(prevProps,prevState){const state=this.state||{}
const ensResolution=state.ensResolution
const nickname=state.nickname||' '
if(prevState&&ensResolution&&this.props.onChange&&ensResolution!==prevState.ensResolution){this.props.onChange(ensResolution,nickname)}}
EnsInput.prototype.ensIcon=function(recipient){const{hoverText}=this.state||{}
return h('span',{title:hoverText,style:{position:'absolute',padding:'9px',transform:'translatex(-40px)',},},this.ensIconContents(recipient))}
EnsInput.prototype.ensIconContents=function(recipient){const{loadingEns,ensFailure,ensResolution}=this.state||{ensResolution:ZERO_ADDRESS}
if(loadingEns){return h('img',{src:'images/loading.svg',style:{width:'30px',height:'30px',transform:'translateY(-6px)',},})}
if(ensFailure){return h('i.fa.fa-warning.fa-lg.warning')}
if(ensResolution&&(ensResolution!==ZERO_ADDRESS)){return h('i.fa.fa-check-circle.fa-lg.cursor-pointer',{style:{color:'green'},onClick:(event)=>{event.preventDefault()
event.stopPropagation()
copyToClipboard(ensResolution)},})}}
function getNetworkEnsSupport(network){return Boolean(networkMap[network])}