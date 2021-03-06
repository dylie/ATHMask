const ObservableStore=require('obs-store')
const extend=require('xtend')
const PhishingDetector=require('eth-phishing-detect/src/detector')
const PHISHING_DETECTION_CONFIG=require('eth-phishing-detect/src/config.json')
const POLLING_INTERVAL=4*60*1000
class BlacklistController{constructor(opts={}){const initState=extend({phishing:PHISHING_DETECTION_CONFIG,},opts.initState)
this.store=new ObservableStore(initState)
this._phishingDetector=null
this._setupPhishingDetector(initState.phishing)
this._phishingUpdateIntervalRef=null}
checkForPhishing(hostname){if(!hostname)return!1
const{result}=this._phishingDetector.check(hostname)
return result}
async updatePhishingList(){const response=await fetch('https://api.infura.io/v2/blacklist')
const phishing=await response.json()
this.store.updateState({phishing})
this._setupPhishingDetector(phishing)
return phishing}
scheduleUpdates(){if(this._phishingUpdateIntervalRef)return
this.updatePhishingList()
this._phishingUpdateIntervalRef=setInterval(()=>{this.updatePhishingList()},POLLING_INTERVAL)}
_setupPhishingDetector(config){this._phishingDetector=new PhishingDetector(config)}}
module.exports=BlacklistController