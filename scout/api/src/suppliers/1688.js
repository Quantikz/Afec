const API_URL="https://api.parse.bot/scraper/87cc17b9-a363-4c5e-9ddf-61e6e9787e8a/search_products";

const value=(o,keys)=>keys.map(k=>o?.[k]).find(v=>v!==undefined&&v!==null&&v!=="")??null;
const number=v=>{const m=String(v??"").replace(/,/g,"").match(/\d+(?:\.\d+)?/);return m?Number(m[0]):null};

function normalize(p,i){
  const id=value(p,["offer_id","offerId","offerID"]);
  const name=value(p,["title","subject","name","product_name"])||"1688 product";
  const url=value(p,["product_url","productUrl","url"])||(id?`https://detail.1688.com/offer/${id}.html`:null);
  return {
    id:"1688-"+(id||i), source:"1688", name:String(name).trim(), url,
    supplier:String(value(p,["seller_name","sellerName","companyName","company"])||"1688 supplier").trim(),
    supplierUrl:null, rating:null, verified:false, audited:false, supplierScore:null,
    price:number(value(p,["price","min_price","minPrice"])),
    priceMax:number(value(p,["price_max","max_price","maxPrice"])),
    currency:"CNY",
    moq:number(value(p,["moq","quantity_begin","quantityBegin"])),
    landed:null,
    image:value(p,["image_url","imageUrl","pic_url","picUrl"]),
    soldCount:number(value(p,["sold_count","soldCount","sales_volume","salesQuantity","salesOrderCount"])),
    relevance:1, rawSource:"structured-1688"
  };
}

export function has1688(){ return Boolean(process.env.SCOUT_1688_API_KEY); }

export async function search1688(query,{limit=20}={}){
  const key=process.env.SCOUT_1688_API_KEY;
  if(!key) return [];
  const url=new URL(API_URL);
  url.searchParams.set("page","1");
  url.searchParams.set("query",query);
  url.searchParams.set("page_size",String(Math.min(limit,20)));
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8000);
  try{
    const response=await fetch(url,{headers:{"X-API-Key":key,accept:"application/json"},signal:controller.signal});
    if(!response.ok) throw new Error(`1688 provider HTTP ${response.status}`);
    const payload=await response.json();
    const rows=Array.isArray(payload)?payload:(payload.products||payload.results||payload.data?.products||payload.data?.results||[]);
    return Array.isArray(rows)?rows.map(normalize).filter(p=>p.name&&p.url).slice(0,limit):[];
  }finally{ clearTimeout(timer); }
}
