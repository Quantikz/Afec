import React,{useRef,useState} from "react";
import {createRoot} from "react-dom/client";
import {Search,Camera,Link2,SlidersHorizontal,ChevronRight,Check,ShieldCheck,Truck,PackageCheck,Sparkles,X} from "lucide-react";
import "./styles.css";

const products=[
 {id:1,name:"Minimal Leather Sneakers",supplier:"Verified factory · Guangdong",price:38,ship:16,image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",tag:"Best value"},
 {id:2,name:"Premium Court Sneakers",supplier:"Verified factory · Fujian",price:51,ship:19,image:"https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=85",tag:"Premium"},
 {id:3,name:"Classic Runner",supplier:"Verified supplier · Zhejiang",price:29,ship:15,image:"https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=85",tag:"Lower cost"},
 {id:4,name:"Street Low Top",supplier:"Verified factory · Shenzhen",price:42,ship:17,image:"https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=85",tag:"Popular"},
 {id:5,name:"Clean Retro Trainer",supplier:"Verified factory · Dongguan",price:46,ship:18,image:"https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=85",tag:"New"}];

function App(){
 const [query,setQuery]=useState("");
 const [searched,setSearched]=useState(false);
 const [selected,setSelected]=useState(null);
 const [photo,setPhoto]=useState(null);
 const [webgpu,setWebgpu]=useState("checking");
 const fileRef=useRef();
 React.useEffect(()=>setWebgpu("gpu"in navigator?"ready":"fallback"),[]);
 const doSearch=()=>{if(query.trim()||photo)setSearched(true)};
 const delivered=p=>Math.round((p.price*225)+p.ship*225+8500+3500+1800+3000);
 return <main>
  <header className="nav"><div className="brand"><span className="mark">S</span>Scout</div><div className="gpu"><span className={webgpu==="ready"?"dot live":"dot"}></span>{webgpu==="ready"?"WebGPU ready":"Compatibility mode"}</div></header>
  <section className="hero">
   <div className="eyebrow"><Sparkles size={14}/> Personal sourcing agent for Nigeria</div>
   <h1>Find it.<br/><em>We get it.</em></h1>
   <p>Tell Scout what you want. We search suppliers, compare options and show you the estimated price delivered to Nigeria.</p>
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

  {!searched?<section className="trust"><div><ShieldCheck/><strong>Verified sourcing</strong><span>We score suppliers before purchase.</span></div><div><Truck/><strong>Delivered pricing</strong><span>See the full landed-cost estimate.</span></div><div><PackageCheck/><strong>QC before shipping</strong><span>Items are checked in China.</span></div></section>:
  <section className="results">
   <div className="resulthead"><div><span className="eyebrow">Scout results</span><h2>5 options found</h2><p>Choose one, then Scout calculates the landed price.</p></div><button className="filter"><SlidersHorizontal size={16}/> Refine</button></div>
   <div className="grid">{products.map(p=><article className={"card "+(selected?.id===p.id?"chosen":"")} key={p.id} onClick={()=>setSelected(p)}>
    <div className="photo"><img src={p.image}/><span>{p.tag}</span></div>
    <div className="cardbody"><h3>{p.name}</h3><small>{p.supplier}</small><div className="price"><span>¥{p.price}</span><b>≈ ₦{delivered(p).toLocaleString()}</b></div><div className="selectline">{selected?.id===p.id?<><Check size={15}/> Selected</>:<>View landed price <ChevronRight size={14}/></>}</div></div>
   </article>)}</div>
  </section>}

  {selected&&<aside className="estimate"><div><span className="eyebrow">Estimated delivered price</span><h2>₦{delivered(selected).toLocaleString()}</h2><p>For 1 item · Nigeria delivery included in this estimate.</p></div><div className="breakdown"><span>Product <b>¥{selected.price}</b></span><span>China + international freight <b>Included</b></span><span>Customs & handling <b>Included</b></span><span>Scout sourcing & service <b>Included</b></span></div><button className="continue">Continue with this option <ChevronRight size={17}/></button></aside>}
  <footer>Scout is an AI-assisted sourcing service. Supplier availability, freight, customs and FX are confirmed before payment.</footer>
 </main>
}
createRoot(document.getElementById("root")).render(<App/>);