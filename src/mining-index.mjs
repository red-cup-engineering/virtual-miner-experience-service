/**
 * Reproduce the PUBLISHED proportional-hashrate model as a *synthetic
 * benchmark*, with exact integers. It is not actual hashing, payouts,
 * proof of external source-code behavior, or a wallet balance.
 *
 * Source: CloudMineCrypto public explanation (Sep 2026):
 *   (display hashrate/network hashrate) * blocks/hour * sats/block * hours.
 *
 * The result is a rational expectation; whole millisatoshi floor is a
 * PRESENTATION measure and NOT an earned/withdrawable amount.
 */
function amount(value,label,maxDigits=32){
 if(typeof value!=="string"||!/^(0|[1-9][0-9]*)$/u.test(value)||value.length>maxDigits)
  throw new TypeError(label+" must be a bounded exact natural number string");
 return BigInt(value);
}
function micro(value,label){
 if(typeof value!=="string"||!/^(?:0|[1-9][0-9]*)(?:\.[0-9]{1,6})?$/u.test(value))
  throw new TypeError(label+" must be a decimal string with <=6 fractional digits");
 const [whole,fraction='']=value.split('.');
 if(whole.length>24)throw new TypeError(label+" is unbounded");
 return BigInt(whole)*1000000n+BigInt(fraction.padEnd(6,'0')||'0');
}
export function projectPublishedMiningIndex(input={}){
 if(typeof input.sourceRef!=="string"||!input.sourceRef.trim())
  throw new TypeError("sourceRef identifies the user's published or synthetic scenario");
 if(typeof input.observedAt!=="string"||!/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ/u.test(input.observedAt)||
    !Number.isFinite(Date.parse(input.observedAt)))
  throw new TypeError("source observation must have an explicit UTC timestamp");
 const userMicroGh=micro(input.displayHashrateGh,"displayHashrateGh");
 const networkMicroEh=micro(input.networkHashrateEh,"networkHashrateEh");
 if(!userMicroGh||!networkMicroEh)throw new TypeError("display and network hashrate must be positive");
 const blocksPerHourNum=amount(input.blocksPerHourNum,"blocksPerHourNum");
 const blocksPerHourDen=amount(input.blocksPerHourDen,"blocksPerHourDen");
 if(!blocksPerHourNum||!blocksPerHourDen)throw new TypeError("block frequency must be positive");
 const blockRewardSats=amount(input.blockRewardSats,"blockRewardSats");
 const durationSeconds=amount(input.durationSeconds,"durationSeconds",10);
 const multiplierBps=amount(input.illustrativeMultiplierBps,"illustrativeMultiplierBps",6);
 if(!durationSeconds||!multiplierBps)throw new TypeError("window and multiplier must be positive");
 const numerator=userMicroGh*blocksPerHourNum*blockRewardSats*1000n*durationSeconds*multiplierBps;
 const denominator=networkMicroEh*1000000000n*blocksPerHourDen*3600n*10000n;
 return Object.freeze({
  kind:"PublishedMiningIndexScenario.v1",sourceRef:input.sourceRef,observedAt:input.observedAt,
  expectedWholeMilliSats:(numerator/denominator).toString(),
  expectedWholeSats:(numerator/(denominator*1000n)).toString(),
  subMillisatRational:{numerator:(numerator%denominator).toString(),denominator:denominator.toString()},
  payable:false,ownedHashpower:false,networkMiningPerformed:false,
  warning:"Published proportional-hashrate model only, not the competitor's full private reward engine or a financially backed payout."
 });
}
