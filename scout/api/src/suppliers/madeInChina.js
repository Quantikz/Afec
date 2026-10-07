import * as cheerio from "cheerio";

const BASE="https://www.made-in-china.com";
const SEARCH_ROOT="/products-search/hot-china-products/";
const HEADERS={
  "user-agent":"Mozilla/5.0 (compatible; ScoutSourcingBot/1.0)",
  "accept":"text/html,application/xhtml+xml"
};

const STOP=new Set(["get","me","the","a","an","for","with","and","or","of","to","in","on","from","please","find","want"]);

function clean(value=""){
  return String(value).replace(/\\s+/g," ").replace(/\\s+([,.;])/g,"$1").trim();
}

function tokens(value){
  return clean(value).toLowerCase()
    .replace(/type[\\s-]?c/g,"typec")
    .replace(/usb[\\s-]?c/g,"usbc")
    .replace(/[^a-z0-9]+/g," ")
    .split(" ")
    .filter(t=>t.length>1&&!STOP.has(t));
}

function relevance(query,title){
  const wanted=[...new Set(tokens(query))];
  const hay=tokens(title);
  if(!wanted.length)return 0;
  let hits=0;
  for(const token of wanted){
    if(hay.some(x=>x===token||x.includes(token)||token.includes(x)))hits++;
  }
  return hits/wanted.length;
}

function moneyRange(value){
  if(!value)return {min:null,max:null};
  const match=String(value).replace(/,/g,"").match(/(?:US\\$|USD\\$|\\$)\\s*(\\d+(?:\\.\\d+)?)\\s*(?:-\\s*(?:US\\$|USD\\$|\\$)?\\s*(\\d+(?:\\.\\d+)?))?/i);
  if(!match)return {min:null,max:null};
  return {min:Number(match[1]),max:match[2]?Number(match[2]):Number(match[1])};
}

function firstImage(box){
  const imgs=box.find("img").toArray();
  for(const node of imgs){
    const img=cheerio.load(node)("img");
    const src=img.attr("data-src")||img.attr("data-original")||img.attr("src");
    if(src && !/logo|icon|avatar|loading|placeholder/i.test(src)){
      return new URL(src,BASE).href;
    }
  }
  return null;
}

function productLink(href){
  if(!href)return false;
  try{
    const u=new URL(href,BASE);
    if(!u.hostname.endsWith(".made-in-china.com"))return false;
    return /\\/product\\//i.test(u.pathname)||/product-detail/i.test(u.pathname);
  }catch{return false;}
}

function supplierLink(href){
  if(!href)return false;
  try{
    const u=new URL(href,BASE);
    return u.hostname.endsWith(".en.made-in-china.com")&&!/\\/product\\//i.test(u.pathname)&&!/product-detail/i.test(u.pathname);
  }catch{return false;}
}

function findCard(el){
  let node=el;
  for(let i=0;i<7&&node.length;i++,node=node.parent()){
    const text=clean(node.text());
    if(text.length>40 && /US\\$|USD|\\$/.test(text) && /MOQ/i.test(text))return node;
  }
  return el.parent();
}

function parseCandidate(el,query,index){
  const href=el.attr("href");
  const url=new URL(href,BASE).href;
  const title=clean(el.attr("title")||el.text());
  const card=findCard(el);
  const text=clean(card.text());
  const price=moneyRange(text);
  const moqMatch=text.match(/([\\d,]+)\\s*(?:Pieces?|Sets?|Units?|Pairs?|Cartons?|Boxes?|Rolls?|Meters?|Kilograms?|Kilograms?\\s*\\(MOQ\\))/i);
  const ratingMatch=text.match(/(\\d(?:\\.\\d)?)\\s*\\/\\s*5(?:\\.0)?/i);
  const supplierEl=card.find("a").toArray().map(n=>cheerio.load(n)("a")).find(a=>supplierLink(a.attr("href"))&&clean(a.text()).length>2);
  const supplier=supplierEl?clean(supplierEl.text()):null;
  const supplierUrl=supplierEl?new URL(supplierEl.attr("href"),BASE).href:null;
  const verified=/\\bCertified\\b|Audited|Diamond Member|verified business|verified supplier/i.test(text);
  const score=relevance(query,title+" "+text);
  if(score<0.5)return null;
  if(title.length<8||title.length>300)return null;
  return {
    id:"mic-"+index,
    source:"Made-in-China",
    name:title,
    url,
    supplier:supplier||"Supplier details on listing",
    supplierUrl,
    rating:ratingMatch?Number(ratingMatch[1]):null,
    verified,
    audited:/Audited/i.test(text),
    supplierScore:null,
    price:price.min,
    priceMax:price.max,
    currency:"USD",
    moq:moqMatch?Number(moqMatch[1].replace(/,/g,"")):null,
    landed:null,
    image:firstImage(card),
    relevance:Number(score.toFixed(2)),
    rawSource:"public-search"
  };
}

async function fetchText(url){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8000);
  try{
    const response=await fetch(url,{headers:HEADERS,signal:controller.signal});
    if(!response.ok)return null;
    return await response.text();
  }catch{return null}
  finally{clearTimeout(timer);}
}

async function enrichSupplier(candidate){
  const html=await fetchText(candidate.url);
  if(!html)return candidate;
  const $=cheerio.load(html);
  const text=clean($.root().text());
  const ogImage=$('meta[property="og:image"]').attr("content");
  const ogTitle=$('meta[property="og:title"]').attr("content");
  const canonical=$('link[rel="canonical"]').attr("href");
  const supplierEl=$("a").toArray().map(n=>cheerio.load(n)("a")).find(a=>supplierLink(a.attr("href"))&&clean(a.text()).length>2);
  const supplier=supplierEl?clean(supplierEl.text()):candidate.supplier;
  const supplierUrl=supplierEl?new URL(supplierEl.attr("href"),BASE).href:candidate.supplierUrl;
  const price=moneyRange(text);
  const moqMatch=text.match(/Minimum Order Quantity\\s*([\\d,]+)/i)||text.match(/([\\d,]+)\\s*(?:Pieces?|Sets?|Units?)\\s*\\(MOQ\\)/i);
  const ratingMatch=text.match(/(\\d(?:\\.\\d)?)\\s*\\/\\s*5(?:\\.0)?/i);
  return {
    ...candidate,
    name:ogTitle?clean(ogTitle).replace(/\\s*[-|]\\s*Made-in-China.*$/i,""):candidate.name,
    url:canonical?new URL(canonical,BASE).href:candidate.url,
    supplier,
    supplierUrl,
    rating:candidate.rating??(ratingMatch?Number(ratingMatch[1]):null),
    verified:candidate.verified||/verified business|verified supplier|Diamond Member|audited by|audited factory/i.test(text),
    audited:candidate.audited||/audited by|audited factory/i.test(text),
    price:candidate.price??price.min,
    priceMax:candidate.priceMax??price.max,
    moq:candidate.moq??(moqMatch?Number(moqMatch[1].replace(/,/g,"")):null),
    image:candidate.image||(ogImage?new URL(ogImage,BASE).href:null)
  };
}

async function fetchSearch(query){
  const slug=query.trim().replace(/[^a-z0-9]+/gi,"_").replace(/^_|_$/g,"");
  const primary=BASE+SEARCH_ROOT+encodeURIComponent(slug)+".html";
  let response=await fetch(primary,{headers:HEADERS});
  if(response.ok)return {url:primary,html:await response.text()};
  const fallback=BASE+"/products-search/hot-china-products/Search.html?word="+encodeURIComponent(query);
  response=await fetch(fallback,{headers:HEADERS});
  if(!response.ok)throw new Error("Made-in-China returned HTTP "+response.status);
  return {url:fallback,html:await response.text()};
}

export async function searchMadeInChina(query,{limit=20}={}){
  const {html}=await fetchSearch(query);
  const $=cheerio.load(html);
  const seen=new Set();
  const candidates=[];

  $("a[href]").each((_,node)=>{
    if(candidates.length>=Math.max(limit*3,15))return;
    const el=$(node);
    if(!productLink(el.attr("href")))return;
    const candidate=parseCandidate(el,query,candidates.length);
    if(!candidate||seen.has(candidate.url))return;
    seen.add(candidate.url);
    candidates.push(candidate);
  });

  if(!candidates.length){
    throw new Error("No confidently matched Made-in-China product listings were found.");
  }

  const enriched=[];
  for(const candidate of candidates.slice(0,Math.min(candidates.length,12))){
    enriched.push(await enrichSupplier(candidate));
  }

  return enriched
    .filter(p=>p.relevance>=0.5)
    .sort((a,b)=>(b.relevance-a.relevance)||(Number(b.rating??0)-Number(a.rating??0)))
    .slice(0,limit);
}
