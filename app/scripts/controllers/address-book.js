const ObservableStore=require('obs-store')
const extend=require('xtend')
class AddressBookController{constructor(opts={},keyringController){const initState=extend({addressBook:[],},opts.initState)
this.store=new ObservableStore(initState)
this.keyringController=keyringController}
setAddressBook(address,name){return this._addToAddressBook(address,name).then((addressBook)=>{this.store.updateState({addressBook,})
return Promise.resolve()})}
_addToAddressBook(address,name){const addressBook=this._getAddressBook()
const identities=this._getIdentities()
const addressBookIndex=addressBook.findIndex((element)=>{return element.address.toLowerCase()===address.toLowerCase()||element.name===name})
const identitiesIndex=Object.keys(identities).findIndex((element)=>{return element.toLowerCase()===address.toLowerCase()})
if(identitiesIndex!==-1){return Promise.resolve(addressBook)}else if(addressBookIndex!==-1){addressBook.splice(addressBookIndex,1)}else if(addressBook.length>15){addressBook.shift()}
addressBook.push({address:address,name,})
return Promise.resolve(addressBook)}
_getAddressBook(){return this.store.getState().addressBook}
_getIdentities(){return this.keyringController.memStore.getState().identities}}
module.exports=AddressBookController