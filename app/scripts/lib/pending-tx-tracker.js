const EventEmitter=require('events')
const EthQuery=require('ethjs-query')
module.exports=class PendingTransactionTracker extends EventEmitter{constructor(config){super()
this.query=new EthQuery(config.provider)
this.nonceTracker=config.nonceTracker
this.getPendingTransactions=config.getPendingTransactions
this.getCompletedTransactions=config.getCompletedTransactions
this.publishTransaction=config.publishTransaction
this._checkPendingTxs()}
checkForTxInBlock(block){const signedTxList=this.getPendingTransactions()
if(!signedTxList.length)return
signedTxList.forEach((txMeta)=>{const txHash=txMeta.hash
const txId=txMeta.id
if(!txHash){const noTxHashErr=new Error('We had an error while submitting this transaction, please try again.')
noTxHashErr.name='NoTxHashError'
this.emit('tx:failed',txId,noTxHashErr)
return}
block.transactions.forEach((tx)=>{if(tx.hash===txHash)this.emit('tx:confirmed',txId)})})}
queryPendingTxs({oldBlock,newBlock}){if(!oldBlock){this._checkPendingTxs()
return}
const diff=Number.parseInt(newBlock.number,16)-Number.parseInt(oldBlock.number,16)
if(diff>1)this._checkPendingTxs()}
resubmitPendingTxs(block){const pending=this.getPendingTransactions()
if(!pending.length)return
pending.forEach((txMeta)=>this._resubmitTx(txMeta,block.number).catch((err)=>{const errorMessage=err.message.toLowerCase()
const isKnownTx=(errorMessage.includes('replacement transaction underpriced')||errorMessage.includes('known transaction')||errorMessage.includes('gas price too low to replace')||errorMessage.includes('transaction with the same hash was already imported')||errorMessage.includes('gateway timeout')||errorMessage.includes('nonce too low'))
if(isKnownTx)return
txMeta.warning={error:errorMessage,message:'There was an error when resubmitting this transaction.',}
this.emit('tx:warning',txMeta,err)}))}
async _resubmitTx(txMeta,latestBlockNumber){if(!txMeta.firstRetryBlockNumber){this.emit('tx:block-update',txMeta,latestBlockNumber)}
const firstRetryBlockNumber=txMeta.firstRetryBlockNumber||latestBlockNumber
const txBlockDistance=Number.parseInt(latestBlockNumber,16)-Number.parseInt(firstRetryBlockNumber,16)
const retryCount=txMeta.retryCount||0
if(txBlockDistance<=Math.pow(2,retryCount)-1)return
if(!('rawTx' in txMeta))return
const rawTx=txMeta.rawTx
const txHash=await this.publishTransaction(rawTx)
this.emit('tx:retry',txMeta)
return txHash}
async _checkPendingTx(txMeta){const txHash=txMeta.hash
const txId=txMeta.id
if(!txHash){const noTxHashErr=new Error('We had an error while submitting this transaction, please try again.')
noTxHashErr.name='NoTxHashError'
this.emit('tx:failed',txId,noTxHashErr)
return}
const taken=await this._checkIfNonceIsTaken(txMeta)
if(taken){const nonceTakenErr=new Error('Another transaction with this nonce has been mined.')
nonceTakenErr.name='NonceTakenErr'
return this.emit('tx:failed',txId,nonceTakenErr)}
let txParams
try{txParams=await this.query.getTransactionByHash(txHash)
if(!txParams)return
if(txParams.blockNumber){this.emit('tx:confirmed',txId)}}catch(err){txMeta.warning={error:err.message,message:'There was a problem loading this transaction.',}
this.emit('tx:warning',txMeta,err)}}
async _checkPendingTxs(){const signedTxList=this.getPendingTransactions()
const nonceGlobalLock=await this.nonceTracker.getGlobalLock()
try{await Promise.all(signedTxList.map((txMeta)=>this._checkPendingTx(txMeta)))}catch(err){console.error('PendingTransactionWatcher - Error updating pending transactions')
console.error(err)}
nonceGlobalLock.releaseLock()}
async _checkIfNonceIsTaken(txMeta){const address=txMeta.txParams.from
const completed=this.getCompletedTransactions(address)
const sameNonce=completed.filter((otherMeta)=>{return otherMeta.txParams.nonce===txMeta.txParams.nonce})
return sameNonce.length>0}}