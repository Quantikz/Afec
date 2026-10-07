const MIN_SCORE={top:85,cheap:85,cheaper:80,cheapest:75};

export function supplierScore(p){
  const rating=p.rating==null?65:(p.rating/5)*100;
  const verified=p.verified?100:70;
  const audited=p.audited?100:70;
  return Math.round(rating*.65+verified*.20+audited*.15);
}

export function rankCandidates(candidates,mode="top"){
  const enriched=candidates
    .map(p=>({...p,supplierScore:p.supplierScore??supplierScore(p)}))
    .filter(p=>p.supplierScore>=MIN_SCORE[mode]);

  const price=p=>p.landed??p.price??Number.MAX_SAFE_INTEGER;

  const score={
    top:p=>price(p)*.45+(100-p.supplierScore)*1200,
    cheap:p=>price(p)*.60+(100-p.supplierScore)*850,
    cheaper:p=>price(p)*.80+(100-p.supplierScore)*500,
    cheapest:p=>price(p)
  }[mode]||((p)=>price(p));

  return enriched
    .sort((a,b)=>score(a)-score(b))
    .slice(0,5);
}
