import {
  admitSimulationPlans,newContractSession,projectContractSession,
  startSimulationContract,claimSimulationPoints,
} from './contract-experience.mjs';

/**
 * Browser-only display binding. Reads the Public site's DEMO plan config
 * from a local data attribute. No ad completion, payment or network call.
 */
export function mountContractDemo(dom=document,{clock=()=>Date.now(),storage=globalThis.localStorage}={}){
  const configNode=dom.getElementById('plan-definitions');
  if(!configNode?.dataset?.plans)return {installed:false,reason:'no-demo-plans-selected'};
  const status=dom.getElementById('contract-feedback');
  let plans;
  try { plans=admitSimulationPlans(JSON.parse(configNode.dataset.plans)); }
  catch { if(status)status.textContent='Demo plan configuration unavailable.';return {installed:false,reason:'invalid-plan-config'}; }
  const key='virtual-miner:contract-session:v1';
  const load=()=>{
    try{
      const raw=storage?.getItem(key);
      if(!raw)return newContractSession(clock());
      const candidate=JSON.parse(raw);
      projectContractSession(candidate,plans,clock()); // Revalidate; no money at stake.
      return candidate;
    }catch{return newContractSession(clock());}
  };
  let state=load();
  const persist=()=>{try{storage?.setItem(key,JSON.stringify(state));}catch{/* no account or persistent tracking */}};
  const fmt=new Intl.NumberFormat('en-US');
  const buttons=Array.from(dom.querySelectorAll('button[data-demo-plan-id]'));
  const msg=s=>{if(status)status.textContent=s};
  const display=()=>{
    const now=clock();
    const p=projectContractSession(state,plans,now);
    const pending=dom.getElementById('contract-pending');
    const rate=dom.getElementById('contract-rate');
    const claimed=dom.getElementById('contract-claimed');
    const active=dom.getElementById('contract-active');
    if(pending)pending.textContent=fmt.format(p.pendingDemoPoints);
    if(rate)rate.textContent=fmt.format(p.currentPointsPerSecond)+' demo points/sec';
    if(claimed)claimed.textContent=fmt.format(p.claimedDemoPoints);
    if(active)active.textContent=String(p.active.length);
    const list=dom.getElementById('contract-list');
    if(list&&typeof list.replaceChildren==='function'){
      list.replaceChildren();
      if(p.active.length===0){
        const li=dom.createElement('li');li.textContent='No active virtual contract. Start the free 8-hour plan.';list.appendChild(li);
      }else for(const c of p.active){
        const li=dom.createElement('li');
        const hours=Math.floor(c.secondsLeft/3600);
        const minutes=Math.floor((c.secondsLeft%3600)/60);
        li.textContent=c.label+' · '+hours+'h '+String(minutes).padStart(2,'0')+'m remaining · '+c.ratePointsPerSecond+' virtual points/sec';
        list.appendChild(li);
      }
    }
    for(const button of buttons){
      const eligibility=startSimulationContract(state,plans,button.dataset.demoPlanId,now);
      button.disabled=!eligibility.accepted;
      button.title=eligibility.accepted?'Start an entirely fictional earning interval':'Unavailable: '+eligibility.reason;
    }
    const claimButton=dom.getElementById('contract-claim');
    if(claimButton)claimButton.disabled=p.pendingDemoPoints===0;
    return p;
  };
  for(const button of buttons)button.addEventListener('click',()=>{
    const outcome=startSimulationContract(state,plans,button.dataset.demoPlanId,clock());
    if(outcome.accepted){state=outcome.state;persist();msg('Virtual '+outcome.contract.planId+' contract started. No BTC earned.');}
    else msg('That plan is unavailable: '+outcome.reason+'.');
    display();
  });
  const claimButton=dom.getElementById('contract-claim');
  if(claimButton)claimButton.addEventListener('click',()=>{
    const outcome=claimSimulationPoints(state,plans,clock());
    state=outcome.state;persist();
    msg(outcome.claimed?'Collected '+fmt.format(outcome.claimed)+' demo points (not sats).':'Nothing to collect yet.');
    display();
  });
  display();
  return {installed:true,refresh:display};
}
