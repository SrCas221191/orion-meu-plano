const CACHE="orion-v22";
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key!==CACHE)await caches.delete(key);await self.clients.claim()})()));
self.addEventListener("fetch",event=>{if(event.request.mode==="navigate")event.respondWith(fetch(event.request,{cache:"no-store"}).catch(()=>caches.match("./index.html")))});
self.addEventListener("push",event=>{let d={title:"Órion — Meu Plano",body:"Você tem um lembrete no Órion."};try{d={...d,...event.data.json()}}catch{}event.waitUntil(self.registration.showNotification(d.title,{body:d.body,tag:d.tag||"orion",data:{url:"/"}}))});
self.addEventListener("notificationclick",event=>{event.notification.close();event.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>list[0]?.focus()||clients.openWindow("/"))) });
