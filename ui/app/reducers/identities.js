const extend=require('xtend')
module.exports=reduceIdentities
function reduceIdentities(state,action){var idState=extend({},state.identities)
switch(action.type){default:return idState}}