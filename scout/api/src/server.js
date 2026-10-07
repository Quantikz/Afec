import express from "express";
import cors from "cors";
import helmet from "helmet";
import {scoutSuppliers} from "./suppliers/index.js";
import {rankCandidates} from "./ranking.js";

const app=express();
app.use(helmet());
app.use(cors({origin:true}));
app.use(express.json({limit:"2mb"}));

app.get("/api/health",(_,res)=>res.json({ok:true,service:"scout-api",sources:["Made-in-China"]}));

app.post("/api/search",async(req,res)=>{
  try{
    const {query,mode="top"}=req.body||{};
    if(!query || typeof query!=="string" || query.trim().length<2)
      return res.status(400).json({error:"Enter a product request."});
    const candidates=await scoutSuppliers(query.trim(),{limit:20});
    const ranked=rankCandidates(candidates,mode);
    res.json({
      query:query.trim(),
      mode,
      count:ranked.length,
      sourceStatus:{madeInChina:"live",alibaba:"not_connected",1688:"not_connected"},
      results:ranked
    });
  }catch(error){
    res.status(502).json({error:"Supplier search failed",detail:error.message});
  }
});

const port=process.env.PORT||8787;
app.listen(port,()=>console.log(`Scout API listening on :${port}`));
