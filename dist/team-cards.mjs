const escape=e=>String(e??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
function mediaPath(p){if(!p)return"";try{const u=new URL(p,"https://thebrand.invalid/");return["http:","https:"].includes(u.protocol)?escape(p):""}catch{return""}}
function videoType(p){const e=(p||"").split(".").pop().toLowerCase();return e==="mov"?"video/quicktime":e==="webm"?"video/webm":"video/mp4"}
function thumbUrl(poster){if(!poster||!poster.includes("res.cloudinary.com"))return"";return poster.replace(/so_0,[^/]+/,"so_0,w_60,h_75,c_fill,q_30,f_jpg,e_blur:400")}
export function renderTeam(members){
  if(!members.length)return'<p class="team-empty">Our team profiles are on their way. Meet the studio\'s approach on the <a href="studio.html">Studio page ↗</a>.</p>';
  return members.map((m,i)=>{
    const thumb=thumbUrl(m.poster);
    const bg=thumb?` style="background-image:url('${escape(thumb)}');background-size:cover;background-position:center"`:"";
    const src=mediaPath(m.video);
    const poster=m.poster?mediaPath(m.poster):"";
    const video=src?`<video muted loop playsinline preload="none" width="600" height="750" aria-label="${escape(m.name)}"${poster?` poster="${poster}"`:""}><source src="${src}" type="${videoType(m.video)}">Your browser cannot play this video.</video>`:'<p class="video-unavailable">Team video coming soon.</p>';
    const playBtn=src?`<button class="team-play-btn" aria-label="Watch ${escape(m.name)}'s video" data-src="${src}" data-poster="${poster}"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></button>`:"";
    return`<article class="team-card"><div class="team-photo video-panel"${bg}>${video}<span class="team-number" aria-hidden="true">${String(i+1).padStart(2,"0")}</span>${playBtn}</div><div class="team-card-heading"><h3>${escape(m.name)}</h3><span class="team-dot" aria-hidden="true"></span></div><p class="team-role">${escape(m.role)}</p>${m.bio?`<p class="team-bio">${escape(m.bio)}</p>`:""}</article>`;
  }).join("");
}
