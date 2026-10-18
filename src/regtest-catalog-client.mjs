/**
 * Read-only projection of the local regtest payout service. A visitor cannot
 * authenticate, reserve, purchase or sign anything through this component.
 * Production Cloudflare static hosting normally has no /v1/catalog route.
 */
export function summarizeRegtestCatalog(value){
 if(value?.kind!=='RewardContractCatalogRegtest.v1'||value.mainnetSalesEnabled!==false||
    !Array.isArray(value.entries)||value.entries.length>100)
  throw new TypeError('only explicitly regtest read-only catalog records are accepted');
 let quoted=0,paused=0;
 for(const item of value.entries){
  if(typeof item?.id!=='string'||!item.id||!item.availability||
     typeof item.availability.available!=='boolean')
   throw new TypeError('incomplete regtest capacity record');
  if(item.availability.available===true)quoted++;else paused++;
 }
 return Object.freeze({quoted,paused,total:value.entries.length,
  message:'Regtest developer lab only: '+quoted+' of '+value.entries.length+
   ' bounded test plan(s) currently show payout-capacity quotes. No mainnet sales, real Bitcoin earnings, or customer bookings are enabled here.'});
}
export function mountRegtestCatalogPreview(dom=document,{fetcher=globalThis.fetch}={}){
 const node=dom.getElementById('regtest-capacity');
 if(!node)return {installed:false,refresh:async()=>({status:'absent'})};
 const refresh=async()=>{
  try{
   if(typeof fetcher!=='function')throw new Error('no same-origin fetch');
   const response=await fetcher('/v1/catalog',{
    method:'GET',headers:{accept:'application/json'},credentials:'omit',cache:'no-store'
   });
   if(!response?.ok)throw new Error('regtest catalog not installed');
   const digest=summarizeRegtestCatalog(await response.json());
   node.textContent=digest.message;
   return {status:'regtest-read-only',...digest};
  }catch{
   node.textContent='Regtest backend not connected. This is a local-only virtual game; no real sats are being earned or paid.';
   return {status:'disconnected'};
  }
 };
 void refresh();
 return {installed:true,refresh};
}
