/**
 * Virtual-miner contracts: a deterministic, local-only demo economy.
 * Plan definitions belong to the owning Public product, not this library.
 * Every outcome remains non-monetary even when the UI resembles mining.
 */
const SECOND=1000, DAY=86400, MAX_CONTRACTS=2048, MAX_DEMO_POINTS=1000000000000;
const safe=(n)=>Number.isSafeInteger(n)&&n>=0;
function integer(n,label,max=Number.MAX_SAFE_INTEGER){
  if(!safe(n)||n>max)throw new TypeError(label+" must be a bounded nonnegative integer");
  return n;
}
export function admitSimulationPlans(input){
  if(!Array.isArray(input)||input.length<1||input.length>8)
    throw new TypeError("plans must be 1..8 entries");
  const ids=new Set();
  return Object.freeze(input.map(p=>{
    if(!p||typeof p!=="object"||Array.isArray(p))throw new TypeError("invalid plan");
    const id=p.id;
    if(typeof id!=="string"||!/^[a-z][a-z0-9-]*$/u.test(id)||ids.has(id))
      throw new TypeError("plan id must be a unique slug");
    ids.add(id);
    if(typeof p.label!=="string"||!p.label.trim()||p.label.length>100)
      throw new TypeError("plan label must be short text");
    const durationSeconds=integer(p.durationSeconds,"durationSeconds",365*DAY);
    const ratePointsPerSecond=integer(p.ratePointsPerSecond,"ratePointsPerSecond",10000);
    const maxClaimsPerUtcDay=integer(p.maxClaimsPerUtcDay,"maxClaimsPerUtcDay",24);
    const minGapSeconds=integer(p.minGapSeconds??0,"minGapSeconds",365*DAY);
    if(!durationSeconds||!ratePointsPerSecond||!maxClaimsPerUtcDay)
      throw new TypeError("duration, rate and daily limits must be positive");
    if(p.source!=="demo"||p.paid===true||p.rewardSats!==undefined||p.hashrate!==undefined)
      throw new TypeError("browser plans cannot promise cash, hashing or real rewards");
    if(typeof p.nonOverlapping!=="boolean")throw new TypeError("nonOverlapping must be declared");
    return Object.freeze({id,label:p.label,durationSeconds,ratePointsPerSecond,maxClaimsPerUtcDay,
      minGapSeconds,nonOverlapping:p.nonOverlapping,source:"demo"});
  }));
}
export function newContractSession(now){
  integer(now,"now");
  return {kind:"virtual-miner-contract-session/v1",source:"browser-demo-only",
    contracts:[],claimedPoints:0,lastObservedSec:Math.floor(now/SECOND)};
}
function accumulated(contracts,byId,second){
  let total=0;
  for(const contract of contracts){
    const elapsed=Math.max(0,Math.min(second,contract.expiresSec)-contract.startedSec);
    total+=elapsed*byId.get(contract.planId).ratePointsPerSecond;
    if(!safe(total)||total>MAX_DEMO_POINTS)
      throw new Error("demo production overflow");
  }
  return total;
}
function verified(state,plans){
  const rules=admitSimulationPlans(plans), byId=new Map(rules.map(x=>[x.id,x]));
  if(!state||state.kind!=="virtual-miner-contract-session/v1"||state.source!=="browser-demo-only"||
    !Array.isArray(state.contracts)||state.contracts.length>MAX_CONTRACTS||
    !safe(state.claimedPoints)||state.claimedPoints>MAX_DEMO_POINTS||!safe(state.lastObservedSec))
    throw new TypeError("invalid browser-local contract session");
  const seen=new Set();
  const contracts=state.contracts.map(c=>{
    if(!c||typeof c!=="object"||Array.isArray(c))throw new TypeError("bad contract");
    const p=byId.get(c.planId);
    if(!p||typeof c.id!=="string"||!/^local:[a-z0-9-]+:[0-9]+$/u.test(c.id)||seen.has(c.id))
      throw new Error("unknown or duplicated local contract");
    seen.add(c.id);
    const startedSec=integer(c.startedSec,"contract start");
    const expiresSec=integer(c.expiresSec,"contract expiry");
    if(expiresSec-startedSec!==p.durationSeconds)
      throw new Error("local contract duration contradicts governing plan");
    return {id:c.id,planId:c.planId,startedSec,expiresSec};
  });
  if(state.claimedPoints>accumulated(contracts,byId,state.lastObservedSec))
    throw new Error("claimed demo points exceed recorded production");
  return {rules,byId,contracts,claimedPoints:state.claimedPoints,lastObservedSec:state.lastObservedSec};
}
function projector(state,plans,now){
  integer(now,"now");
  const input=verified(state,plans);
  const second=Math.max(Math.floor(now/SECOND),input.lastObservedSec);
  const lifetime=accumulated(input.contracts,input.byId,second);
  return {input,second,lifetime,pending:lifetime-input.claimedPoints};
}
export function projectContractSession(state,plans,now){
  const {input,second,lifetime,pending}=projector(state,plans,now);
  const active=input.contracts.filter(c=>c.startedSec<=second&&c.expiresSec>second).map(c=>{
    const p=input.byId.get(c.planId);
    return {id:c.id,planId:c.planId,label:p.label,expiresSec:c.expiresSec,
      secondsLeft:c.expiresSec-second,ratePointsPerSecond:p.ratePointsPerSecond};
  });
  return Object.freeze({kind:"virtual-miner-contract-projection/v1",asOfSec:second,
    active,expiredContracts:input.contracts.filter(c=>c.expiresSec<=second).length,
    currentPointsPerSecond:active.reduce((s,c)=>s+c.ratePointsPerSecond,0),
    earnedDemoPoints:lifetime,pendingDemoPoints:pending,claimedDemoPoints:input.claimedPoints,
    refundable:false,transferable:false,bitcoinEarnedSats:0,
    limitation:"Local browser clock and storage are not authoritative. Never use as a financial ledger."});
}
export function startSimulationContract(state,plans,planId,now){
  const {input,second}=projector(state,plans,now);
  const p=input.byId.get(planId);
  if(!p)return {accepted:false,reason:"unknown-plan",state};
  if(input.contracts.length>=MAX_CONTRACTS)return {accepted:false,reason:"local-history-full",state};
  const old=input.contracts.filter(c=>c.planId===planId);
  if(p.nonOverlapping&&old.some(c=>c.expiresSec>second))
    return {accepted:false,reason:"still-active",state};
  if(old.some(c=>second-c.startedSec<p.minGapSeconds))
    return {accepted:false,reason:"cooldown",state};
  const day=Math.floor(second/DAY);
  if(old.filter(c=>Math.floor(c.startedSec/DAY)===day).length>=p.maxClaimsPerUtcDay)
    return {accepted:false,reason:"daily-limit",state};
  const id="local:"+p.id+":"+(input.contracts.length+1);
  const contract={id,planId:p.id,startedSec:second,expiresSec:second+p.durationSeconds};
  return {accepted:true,contract,state:{kind:state.kind,source:state.source,
    contracts:[...input.contracts,contract],claimedPoints:input.claimedPoints,lastObservedSec:second}};
}
export function claimSimulationPoints(state,plans,now){
  const {input,second,lifetime,pending}=projector(state,plans,now);
  return {claimed:pending,state:{kind:state.kind,source:state.source,
    contracts:input.contracts,claimedPoints:lifetime,lastObservedSec:second}};
}
