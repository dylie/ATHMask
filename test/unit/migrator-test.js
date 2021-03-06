const assert=require('assert')
const clone=require('clone')
const Migrator=require('../../app/scripts/lib/migrator/')
const migrations=[{version:1,migrate:(data)=>{const clonedData=clone(data)
clonedData.meta.version=1
return Promise.resolve(clonedData)},},{version:2,migrate:(data)=>{const clonedData=clone(data)
clonedData.meta.version=2
return Promise.resolve(clonedData)},},{version:3,migrate:(data)=>{const clonedData=clone(data)
clonedData.meta.version=3
return Promise.resolve(clonedData)},},]
const versionedData={meta:{version:0},data:{hello:'world'}}
describe('Migrator',()=>{const migrator=new Migrator({migrations})
it('migratedData version should be version 3',(done)=>{migrator.migrateData(versionedData).then((migratedData)=>{assert.equal(migratedData.meta.version,migrations[2].version)
done()}).catch(done)})})