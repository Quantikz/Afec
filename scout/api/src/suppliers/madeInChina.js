import * as cheerio from "cheerio";

const BASE="https://www.made-in-china.com";
const SEARCH="/products-search/hot-china-products/Search.html";

function moneyToNumber(value){
  if(!value) return null;
  const n=String(value).replace(/,/g,"").match(/\\d+(?:\\.\\d+)?/);
  return n?Number(n[0]):null;
}

export async function searchMadeInChina(query,{limit=10}={}){
  const url=BASE+SEARCH+"?word="+encodeURIComponent(query);
  const response=await fetch(url,{headers:{
    "user-agent":"Mozilla/5.0 (compatible; ScoutSourcingBot/1.0)",
    "accept":"text/html,application/xhtml+xml"
  }});
  if(!response.ok) throw new Error(`Made-in-China returned HTTP ${response.status}`);
  const html=await response.text();
  const $=cheerio.load(html);
  const results=[];

  $("a").each((_,a)=>{
    if(results.length>=limit) return;
    const el=$(a);
    const href=el.attr("href");
    const title=el.text().replace(/\\s+/g," ").trim();
    if(!href || !title || title.length<8) return;
    const lower=title.toLowerCase();
    if(!lower.includes(query.toLowerCase().split(/\\s+/)[0])) return;
    if(!href.includes("made-in-china.com")) return;
    if(results.some(x=>x.url===new URL(href,BASE).href)) return;
    results.push({
      id:"mic-"+results.length,
      source:"Made-in-China",
      name:title.slice(0,180),
      url:new URL(href,BASE).href,
      supplier:"Supplier details on listing",
      rating:null,
      verified:false,
      supplierScore:null,
      price:moneyToNumber(el.closest("li,div").text()) ,
      currency:"USD",
      landed:null,
      image:el.find("img").attr("src") || el.closest("li,div").find("img").first().attr("src") || null,
      rawSource:"public-search"
    });
  });

  return results;
}
