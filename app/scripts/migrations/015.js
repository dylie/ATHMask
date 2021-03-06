const version=15
const clone=require('clone')
module.exports={version,migrate:function(originalVersionedData){const versionedData=clone(originalVersionedData)
versionedData.meta.version=version
try{const state=versionedData.data
const newState=transformState(state)
versionedData.data=newState}catch(err){console.warn(`MetaMask Migration #${version}`+err.stack)}
return Promise.resolve(versionedData)},}
function transformState(state){const newState=state
const transactions=newState.TransactionController.transactions
newState.TransactionController.transactions=transactions.map((txMeta)=>{if(!txMeta.err)return txMeta
else if(txMeta.err.message==='Gave up submitting tx.')txMeta.status='failed'
return txMeta})
return newState}