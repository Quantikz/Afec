import {searchMadeInChina} from "./madeInChina.js";

export const suppliers={
  madeInChina:{search:searchMadeInChina,enabled:true},
  alibaba:{enabled:false,reason:"Requires approved/API access or partner integration; no fake scraping."},
  1688:{enabled:false,reason:"Requires approved/API access or partner integration; no fake scraping."}
};

export async function scoutSuppliers(query,options={}){
  const sources=[];
  const mic=await searchMadeInChina(query,options);
  sources.push(...mic);
  return sources;
}
