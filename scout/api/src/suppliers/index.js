import {searchMadeInChina} from "./madeInChina.js";
import {search1688,has1688} from "./1688.js";

export const suppliers={
  madeInChina:{search:searchMadeInChina,enabled:true},
  1688:{search:search1688,enabled:has1688()},
  alibaba:{enabled:false,reason:"Requires approved API/partner access."}
};

export async function scoutSuppliers(query,options={}){
  const jobs=[
    searchMadeInChina(query,options),
    has1688() ? search1688(query,options) : Promise.resolve([])
  ];
  const results=await Promise.allSettled(jobs);
  const candidates=[];
  for(const result of results){
    if(result.status==="fulfilled") candidates.push(...result.value);
  }
  if(!candidates.length){
    const errors=results.filter(r=>r.status==="rejected").map(r=>r.reason?.message).filter(Boolean);
    throw new Error(errors[0]||"No supplier results available.");
  }
  return candidates;
}
