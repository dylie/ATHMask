module.exports=function(network){const net=parseInt(network)
let prefix
switch(net){case 1:prefix=''
break
case 3:prefix='ropsten.'
break
case 4:prefix='rinkeby.'
break
case 42:prefix='kovan.'
break
default:prefix=''}
return prefix}