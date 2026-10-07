import React,{useRef,useState} from "react";
import {createRoot} from "react-dom/client";
import {Search,Camera,Link2,SlidersHorizontal,ChevronRight,Check,ShieldCheck,Truck,PackageCheck,Sparkles,X,Star} from "lucide-react";
import "./styles.css";

const API="/api";

const FX=225;
const COSTS={intl:8500,customs:3500,handling:1800,lastMile:3000};

const products=[
 {id:1,name:"Minimal Leather Sneakers",supplier:"Guangdong Select Factory",rating:4.9,verified:true,orders:18400,response:99,disputes:.4,quality:95,price:38,ship:16,image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85"},
 {id:2,name:"Premium Court Sneakers",supplier:"Fujian Premium Factory",rating:4.9,verified:true,orders:12100,response:98,disputes:.5,quality:97,price:51,ship:19,image:"https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=85"},
 {id:3,name:"Classic Runner",supplier:"Zhejiang Value Factory",rating:4.8,verified:true,orders:25300,response:97,disputes:.8,quality:91,price:29,ship:15,image:"https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=85"},
 {id:4,name:"Street Low Top",supplier:"Shenzhen Select Factory",rating:4.8,verified:true,orders:9600,response:96,disputes:.7,quality:92,price:42,ship:17,image:"https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=85"},
 {id:5,name:"Clean Retro Trainer",supplier:"Dongguan Verified Factory",rating:4.7,verified:true,orders:8700,response:95,disputes:.9,quality:89,price:46,ship:18,image:"https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=85"}];

const modes=[
 {id:"top",label:"Top",desc:"Best overall balance"},
 {id:"cheap",label:"Cheap",desc:"Low price + high quality"},
 {id:"cheaper",label:"Cheaper",desc:"Push the price lower"},
 {id:"cheapest",label:"Cheapest",desc:"Lowest legitimate cost"}];

function supplierScore(p){
 const rating=(p.rating/5)*100;
 const orders=Math.min(100,Math.log10(p.orders+1)/5*100);
 const dispute=Math.max(0,100-p.disputes*35);
 return Math.round(rating*.30+orders*.20+p.quality*.20+p.response*.10+dispute*.10+(p.verified?100:0)*.10);
}
function landed(p){
 return Math.round((p.price*FX)+(p.ship*FX)+COSTS.intl+COSTS.customs+COSTS.handling+COSTS.lastMile);
}
function rankProducts(mode){
 const rows=products.map(p=>({...p,supplierScore:supplierScore(p),landed:landed(p)}));
 if(mode==="cheapest") return rows.filter(p=>p.supplierScore>=75).sort((a,b)=>a.landed-b.landed);
 if(mode==="cheaper") return rows.filter(p=>p.supplierScore>=80).sort((a,b)=>(a.landed*.72+a.supplierScore*45)-(b.landed*.72+b.supplierScore*45));
 if(mode==="cheap") return rows.filter(p=>p.supplierScore>=85).sort((a,b)=>(a.landed*.55+(100-a.supplierScore)*900)-(b.landed*.55+(100-b.supplierScore)*900));
 return rows.sort((a,b)=>(a.landed*.45+(100-a.supplierScore)*1150+a.ship*300)-(b.landed*.45+(100-b.supplierScore)*1150+b.ship*300));
}

function App(){
 const [query,setQuery]=useState("");
 const [searched,setSearched]=useState(false);
 const [selected,setSelected]=useState(null);
 const [photo,setPhoto]=useState(null);
 const [mode,setMode]=useState("top");
 const [remoteResults,setRemoteResults]=useState([]);
 const [webgpu,setWebgpu]=useState("checking");
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 const [live,setLive]=useState(false);
 const fileRef=useRef();
 React.useEffect(()=>setWebgpu("gpu"in navigator?"ready":"fallback"),[]);
 const doSearch=async()=>{
  if(!query.trim()&&!photo)return;
  setSearched(true); setLoading(true); setError(""); setSelected(null);
  try{
   const res=await fetch(API+"/search",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({query:query.trim(),mode})});
   const data=await res.json();
   if(!res.ok)throw new Error(data.error||"Search failed");
   setLive(data.sourceStatus?.madeInChina==="live");
   setRemoteResults(data.results||[]);
  }catch(e){setLive(false);setError(e.message+" — start the Scout API in Termux.");}
  finally{setLoading(false);}
 };
 const results=(remoteResults.length?remoteResults:rankProducts(mode)).slice(0,5);
 return <main>
  <header className="nav"><div className="brand"><span className="mark">S</span>Scout</div><div className="gpu"><span className={webgpu==="ready"?"dot live":"dot"}></span>{webgpu==="ready"?"WebGPU ready":"Compatibility mode"}</div></header>
  <section className="hero">
   <div className="eyebrow"><Sparkles size={14}/> Personal sourcing agent for Nigeria</div>
   <h1>Find it.<br/><em>We get it.</em></h1>
   <p>Tell Scout what you want. Scout prioritizes highly rated suppliers, then finds the best legitimate landed price for you.</p>
   <div className="searchbox">
    <div className="inputrow"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()} placeholder="What are you looking for?"/></div>
    <div className="actions">
      <button className="iconbtn" onClick={()=>fileRef.current?.click()} title="Search by photo"><Camera size={18}/></button>
      <button className="iconbtn" title="Paste product link"><Link2 size={18}/></button>
      <button className="find" onClick={doSearch}>Find options <ChevronRight size={17}/></button>
    </div>
    <input ref={fileRef} hidden type="file" accept="image/*" onChange={e=>setPhoto(e.target.files?.[0]||null)}/>
   </div>
   {photo&&<div className="uploadpill">{photo.name}<button onClick={()=>setPhoto(null)}><X size={14}/></button></div>}
  </section>

  {!searched?<section className="trust"><div><ShieldCheck/><strong>High-rated suppliers first</strong><span>Scout scores supplier reliability before ranking price.</span></div><div><Truck/><strong>Delivered pricing</strong><span>Compare the estimated total landed cost in Nigeria.</span></div><div><PackageCheck/><strong>QC before shipping</strong><span>Items are checked in China before international shipping.</span></div></section>:
  <section className="results">
   <div className="resulthead"><div><span className="eyebrow">{live?"Live supplier results":"Scout results"}</span><h2>{loading?"Searching suppliers…":results.length+" options found"}</h2><p>Ranking: {modes.find(m=>m.id===mode)?.label} · {live?"Made-in-China live data":"demo fallback"}.</p></div><button className="filter"><SlidersHorizontal size={16}/> Refine</button></div>
   {error&&<div className="errorbox">{error}</div>}<div className="modes">{modes.map(m=><button key={m.id} className={mode===m.id?"mode active":"mode"} onClick={()=>{setMode(m.id);setSelected(null);if(searched)doSearch()}}><b>{m.label}</b><span>{m.desc}</span></button>)}</div>
   <div className="grid">{results.map((p,i)=><article className={"card "+(selected?.id===p.id?"chosen":"")} key={p.id} onClick={()=>setSelected(p)}>
    <div className="photo"><img src={p.image}/><span>{i===0?(mode==="cheapest"?"Lowest cost":"Scout pick"):(p.supplierScore>=94?"Highly rated":"Verified")}</span></div>
    <div className="cardbody"><h3>{p.name}</h3><small>{p.supplier}</small><div className="rating"><Star size={12} fill="currentColor"/> {p.rating??"—"} · {p.supplierScore}/100 supplier score</div><div className="price"><span>{p.price!=null?`${p.currency==="USD"?"$":"¥"}${p.price}`:"Price on request"}</span><b>{p.landed!=null?`≈ ₦${p.landed.toLocaleString()}`:"Quote needed"}</b></div><div className="selectline">{selected?.id===p.id?<><Check size={15}/> Selected</>:<>View landed price <ChevronRight size={14}/></>}</div></div>
   </article>)}</div>
  </section>}

  {selected&&<aside className="estimate"><div><span className="eyebrow">Estimated delivered price</span><h2>{selected.landed!=null?`₦${selected.landed.toLocaleString()}`:"Price on request"}</h2><p>{selected.rating??"Unrated"}★ supplier · {selected.supplierScore}/100 supplier score · Source: {selected.source||"Scout"}.</p></div><div className="breakdown"><span>Supplier price <b>{selected.price!=null?`${selected.currency==="USD"?"$":"¥"}${selected.price}`:"Quote required"}</b></span><span>China + international freight <b>Included</b></span><span>Customs & handling <b>Included</b></span><span>Scout sourcing & service <b>Included</b></span></div><button className="continue">Continue with this option <ChevronRight size={17}/></button></aside>}
  <footer>Scout is an AI-assisted sourcing service. Supplier availability, freight, customs and FX are confirmed before payment. Live supplier records are shown only when the Scout API is connected; otherwise the interface uses clearly labelled demo fallback data.</footer>
 </main>
}
createRoot(document.getElementById("root")).render(<App/>);