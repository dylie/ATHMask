const extend=require('xtend')
const EventEmitter=require('events')
const ObservableStore=require('obs-store')
const ethUtil=require('ethereumjs-util')
const txStateHistoryHelper=require('./tx-state-history-helper')
module.exports=class TransactionStateManger extends EventEmitter{constructor({initState,txHistoryLimit,getNetwork}){super()
this.store=new ObservableStore(extend({transactions:[],},initState))
this.txHistoryLimit=txHistoryLimit
this.getNetwork=getNetwork}
getTxCount(){return this.getTxList().length}
getTxList(){const network=this.getNetwork()
const fullTxList=this.getFullTxList()
return fullTxList.filter((txMeta)=>txMeta.metamaskNetworkId===network)}
getFullTxList(){return this.store.getState().transactions}
getUnapprovedTxList(){const txList=this.getTxsByMetaData('status','unapproved')
return txList.reduce((result,tx)=>{result[tx.id]=tx
return result},{})}
getPendingTransactions(address){const opts={status:'submitted'}
if(address)opts.from=address
return this.getFilteredTxList(opts)}
getConfirmedTransactions(address){const opts={status:'confirmed'}
if(address)opts.from=address
return this.getFilteredTxList(opts)}
addTx(txMeta){this.once(`${txMeta.id}:signed`,function(txId){this.removeAllListeners(`${txMeta.id}:rejected`)})
this.once(`${txMeta.id}:rejected`,function(txId){this.removeAllListeners(`${txMeta.id}:signed`)})
txMeta.history=[]
const snapshot=txStateHistoryHelper.snapshotFromTxMeta(txMeta)
txMeta.history.push(snapshot)
const transactions=this.getFullTxList()
const txCount=this.getTxCount()
const txHistoryLimit=this.txHistoryLimit
if(txCount>txHistoryLimit-1){const index=transactions.findIndex((metaTx)=>metaTx.status==='confirmed'||metaTx.status==='rejected')
transactions.splice(index,1)}
transactions.push(txMeta)
this._saveTxList(transactions)
return txMeta}
getTx(txId){const txMeta=this.getTxsByMetaData('id',txId)[0]
return txMeta}
updateTx(txMeta,note){if(txMeta.txParams){Object.keys(txMeta.txParams).forEach((key)=>{let value=txMeta.txParams[key].toString()
if(typeof value!=='string')console.error(`${key}: ${value} in txParams is not a string`)
if(!ethUtil.isHexPrefixed(value))console.error('is not hex prefixed, anything on txParams must be hex prefixed')})}
const currentState=txStateHistoryHelper.snapshotFromTxMeta(txMeta)
const previousState=txStateHistoryHelper.replayHistory(txMeta.history)
const entry=txStateHistoryHelper.generateHistoryEntry(previousState,currentState,note)
txMeta.history.push(entry)
const txId=txMeta.id
const txList=this.getFullTxList()
const index=txList.findIndex(txData=>txData.id===txId)
txList[index]=txMeta
this._saveTxList(txList)}
updateTxParams(txId,txParams){const txMeta=this.getTx(txId)
txMeta.txParams=extend(txMeta.txParams,txParams)
this.updateTx(txMeta,`txStateManager#updateTxParams`)}
getFilteredTxList(opts,initialList){let filteredTxList=initialList
Object.keys(opts).forEach((key)=>{filteredTxList=this.getTxsByMetaData(key,opts[key],filteredTxList)})
return filteredTxList}
getTxsByMetaData(key,value,txList=this.getTxList()){return txList.filter((txMeta)=>{if(txMeta.txParams[key]){return txMeta.txParams[key]===value}else{return txMeta[key]===value}})}
getTxStatus(txId){const txMeta=this.getTx(txId)
return txMeta.status}
setTxStatusRejected(txId){this._setTxStatus(txId,'rejected')}
setTxStatusUnapproved(txId){this._setTxStatus(txId,'unapproved')}
setTxStatusApproved(txId){this._setTxStatus(txId,'approved')}
setTxStatusSigned(txId){this._setTxStatus(txId,'signed')}
setTxStatusSubmitted(txId){this._setTxStatus(txId,'submitted')}
setTxStatusConfirmed(txId){this._setTxStatus(txId,'confirmed')}
setTxStatusFailed(txId,err){const txMeta=this.getTx(txId)
txMeta.err={message:err.toString(),stack:err.stack,}
this.updateTx(txMeta)
this._setTxStatus(txId,'failed')}
_setTxStatus(txId,status){const txMeta=this.getTx(txId)
txMeta.status=status
this.emit(`${txMeta.id}:${status}`,txId)
this.emit(`tx:status-update`,txId,status)
if(['submitted','rejected','failed'].includes(status)){this.emit(`${txMeta.id}:finished`,txMeta)}
this.updateTx(txMeta,`txStateManager: setting status to ${status}`)
this.emit('update:badge')}
_saveTxList(transactions){this.store.updateState({transactions})}}