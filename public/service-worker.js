if(!self.define){let e,s={};const a=(a,c)=>(a=new URL(a+".js",c).href,s[a]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=a,e.onload=s,document.head.appendChild(e)}else e=a,importScripts(a),s()})).then((()=>{let e=s[a];if(!e)throw new Error(`Module ${a} didn’t register its module`);return e})));self.define=(c,r)=>{const i=e||("document"in self?document.currentScript.src:"")||location.href;if(s[i])return;let d={};const n=e=>a(e,i),b={module:{uri:i},exports:d,require:n};s[i]=Promise.all(c.map((e=>b[e]||n(e)))).then((e=>(r(...e),d)))}}define(["./workbox-4754cb34"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"29ccda9fa432c77df9dd4b9ea7e21f73"},{url:"/_next/static/chunks/134-a720d837d2090820.js",revision:"ptZCP9Gri5wNF00S9JHEb"},{url:"/_next/static/chunks/254-cafafa94e5313dfb.js",revision:"ptZCP9Gri5wNF00S9JHEb"},{url:"/_next/static/chunks/4bd1b696-e1b3c7bcbfce1e14.js",revision:"ptZCP9Gri5wNF00S9JHEb"},{url:"/_next/static/chunks/684-b934c8c075af4a81.js",revision:"ptZCP9Gri5wNF00S9JHEb"},{url:"/_next/static/chunks/884-c40e6debb3c0cd7e.js",revision:"ptZCP9Gri5wNF00S9JHEb"},{url:"/_next/static/chunks/app/_not-found/page-7b137d85f9de4771.js",revision:"ptZCP9Gri5wNF00S9JHEb"},{url:"/_next/static/chunks/app/game-selection/page-a7d268cb78213e68.js",revision:"ptZCP9Gri5wNF00S9JHEb"},{url:"/_next/static/chunks/app/game/loading-5265a20a9d413439.js",revision:"ptZCP9Gri5wNF00S9JHEb"},{url:"/_next/static/chunks/app/game/page-826a9c0af299e70e.js",revision:"ptZCP9Gri5wNF00S9JHEb"},{url:"/_next/static/chunks/app/info/page-0b90283be2cdaeaa.js",revision:"ptZCP9Gri5wNF00S9JHEb"},{url:"/_next/static/chunks/app/layout-60cb4864b242da38.js",revision:"ptZCP9Gri5wNF00S9JHEb"},{url:"/_next/static/chunks/app/manifest.webmanifest/route-0ad535354360cb24.js",revision:"ptZCP9Gri5wNF00S9JHEb"},{url:"/_next/static/chunks/app/multiplayer/loading-6e8592a0c61bf0da.js",revision:"ptZCP9Gri5wNF00S9JHEb"},{url:"/_next/static/chunks/app/multiplayer/page-88bd3f6ac8b4f2ea.js",revision:"ptZCP9Gri5wNF00S9JHEb"},{url:"/_next/static/chunks/app/page-c49743e26e742660.js",revision:"ptZCP9Gri5wNF00S9JHEb"},{url:"/_next/static/chunks/framework-f593a28cde54158e.js",revision:"ptZCP9Gri5wNF00S9JHEb"},{url:"/_next/static/chunks/main-10c66cfbe4ad1d53.js",revision:"ptZCP9Gri5wNF00S9JHEb"},{url:"/_next/static/chunks/main-app-ee1df03df8583a3b.js",revision:"ptZCP9Gri5wNF00S9JHEb"},{url:"/_next/static/chunks/pages/_app-da15c11dea942c36.js",revision:"ptZCP9Gri5wNF00S9JHEb"},{url:"/_next/static/chunks/pages/_error-cc3f077a18ea1793.js",revision:"ptZCP9Gri5wNF00S9JHEb"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-5417328a50983c10.js",revision:"ptZCP9Gri5wNF00S9JHEb"},{url:"/_next/static/css/115a8729deb62349.css",revision:"115a8729deb62349"},{url:"/_next/static/media/26a46d62cd723877-s.woff2",revision:"befd9c0fdfa3d8a645d5f95717ed6420"},{url:"/_next/static/media/55c55f0601d81cf3-s.woff2",revision:"43828e14271c77b87e3ed582dbff9f74"},{url:"/_next/static/media/581909926a08bbc8-s.woff2",revision:"f0b86e7c24f455280b8df606b89af891"},{url:"/_next/static/media/6d93bde91c0c2823-s.woff2",revision:"621a07228c8ccbfd647918f1021b4868"},{url:"/_next/static/media/97e0cb1ae144a2a9-s.woff2",revision:"e360c61c5bd8d90639fd4503c829c2dc"},{url:"/_next/static/media/a34f9d1faa5f3315-s.p.woff2",revision:"d4fe31e6a2aebc06b8d6e558c9141119"},{url:"/_next/static/media/df0a9ae256c0569c-s.woff2",revision:"d54db44de5ccb18886ece2fda72bdfe0"},{url:"/_next/static/ptZCP9Gri5wNF00S9JHEb/_buildManifest.js",revision:"ac681422cbdcd99fc932e07afd3d3f6d"},{url:"/_next/static/ptZCP9Gri5wNF00S9JHEb/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/cards/clubs/3.jpg",revision:"a7130e33331696f9126e57c3a4fafa99"},{url:"/cards/clubs/3.webp",revision:"f47c5a70a05e089dc6a0ee9c9277b0c3"},{url:"/cards/clubs/4.jpg",revision:"8cfa8f2aefad0a205f42f6b60807f575"},{url:"/cards/clubs/4.webp",revision:"0fc5b2f3b91db1fa017576221986c26e"},{url:"/cards/clubs/5.jpg",revision:"196deb00c2761e9d0d0638e6de14a589"},{url:"/cards/clubs/5.webp",revision:"9b8f361746657f0a2c84a2ecd49cb559"},{url:"/cards/clubs/6.jpg",revision:"964b038b4b7968e9283de9d555d037c8"},{url:"/cards/clubs/6.webp",revision:"6f72078b05fdf6f380726e40a759093d"},{url:"/cards/clubs/7.jpg",revision:"106e5cfe1add0208db8234ce0bff3b2b"},{url:"/cards/clubs/7.webp",revision:"b23bb00f8e7f294b3a8458e924797e0f"},{url:"/cards/clubs/A.jpg",revision:"ca8dfacdc5093e21b27ac1893aa49583"},{url:"/cards/clubs/A.webp",revision:"32b1cee5bc965e0914f900c4354a8532"},{url:"/cards/clubs/J.jpg",revision:"141a6ad99008b1a448b8ce8cee758731"},{url:"/cards/clubs/J.webp",revision:"c212b12b6b8aa0e2a2f286057904c8f2"},{url:"/cards/clubs/K.jpg",revision:"e006ce33758bebe3e62e8b5ce963019e"},{url:"/cards/clubs/K.webp",revision:"2975ff9d7ea9b0f331ce5979802f3543"},{url:"/cards/clubs/Q.jpg",revision:"3aff65bcd59f98bed0a930ff582f15c8"},{url:"/cards/clubs/Q.webp",revision:"8fd47b212441a4a243cbd982a735c4c5"},{url:"/cards/clubs/others/Ishema Cards V2-06.jpg",revision:"a57b789139bb2c8c29f7310ba52e2c03"},{url:"/cards/clubs/others/Ishema Cards V2-30.jpg",revision:"dfd6b33a97338c6215770298a2b06752"},{url:"/cards/clubs/others/Ishema Cards V2-34.jpg",revision:"d955a86bf05d0616abb11f1525c2061e"},{url:"/cards/clubs/others/Ishema Cards V2-38.jpg",revision:"3bab76ed1e76498887eafe50e2d472d1"},{url:"/cards/diamonds/3.jpg",revision:"fe4820fbd05b8ae3a1282d8cd3844643"},{url:"/cards/diamonds/3.webp",revision:"6abf9248598f6da49c044118dbd147c9"},{url:"/cards/diamonds/4.jpg",revision:"565c6eb0eb72f04db3e136cfe26e4e1e"},{url:"/cards/diamonds/4.webp",revision:"9bacd56d2d3a7a92a8b6bf484225e555"},{url:"/cards/diamonds/5.jpg",revision:"13cbd6c91c66709b2f2759e811ff780e"},{url:"/cards/diamonds/5.webp",revision:"bb657ac16ce1975fc5e9ed3e39b70b0b"},{url:"/cards/diamonds/6.jpg",revision:"400a304c1fbab4d34f12e5a46ccb3910"},{url:"/cards/diamonds/6.webp",revision:"e18b75dbe0d049efc44211829ca040da"},{url:"/cards/diamonds/7.jpg",revision:"e9d2a0128d5dce69669aec6ab50978df"},{url:"/cards/diamonds/7.webp",revision:"8db17913c6e4b988515893323f507ba5"},{url:"/cards/diamonds/A.jpg",revision:"226d2c4c4a578da8df0599a86db14b06"},{url:"/cards/diamonds/A.webp",revision:"56d81cbf72510b5b7cd929b4ec7b7de1"},{url:"/cards/diamonds/J.jpg",revision:"cb9502e23edd663a0027d0172d9f3567"},{url:"/cards/diamonds/J.webp",revision:"a8070554100ca30d21dc8c5e10fcb3e9"},{url:"/cards/diamonds/K.jpg",revision:"b2786c5d8ef5d5032ac9153b6f6c3749"},{url:"/cards/diamonds/K.webp",revision:"09d3ac75e09ed5a6efb3ad8b5d65d514"},{url:"/cards/diamonds/Q.jpg",revision:"f6f3f5e281d476e1f31a54eac48c94fb"},{url:"/cards/diamonds/Q.webp",revision:"ec665198f65b37c67331eaa4c03836fc"},{url:"/cards/diamonds/others/Ishema Cards V2-08.jpg",revision:"25074ec92029bf0e79b2f31403c4bb19"},{url:"/cards/diamonds/others/Ishema Cards V2-36.jpg",revision:"83b44bb6d66f8ac2497e2d6e8a091e9f"},{url:"/cards/hearts/3.jpg",revision:"ea890668a34c8667f19291a109ce8b94"},{url:"/cards/hearts/3.webp",revision:"3e0e2fb4bc81dfdf49758e6f22d79ae8"},{url:"/cards/hearts/4.jpg",revision:"f455dfc970783b63ea8ea4b0a3291140"},{url:"/cards/hearts/4.webp",revision:"b6b5c97680b20256738986cdf9ab8157"},{url:"/cards/hearts/5.jpg",revision:"3dc99164ab056df4132c63b17ab6972d"},{url:"/cards/hearts/5.webp",revision:"4e3580270ca9805a5e9986a278b1ce93"},{url:"/cards/hearts/6.jpg",revision:"4b2b2509a05cc1814b4b3286c5d687d1"},{url:"/cards/hearts/6.webp",revision:"ced7ab66531d2525b342257c02636179"},{url:"/cards/hearts/7.jpg",revision:"1b9f7e57d72d7a85e8d3c48b1fe1893b"},{url:"/cards/hearts/7.webp",revision:"6693b374a3dd5abda712929b3f84bf6f"},{url:"/cards/hearts/A.jpg",revision:"c01dfa5f478299230d9220ef8f4221b4"},{url:"/cards/hearts/A.webp",revision:"6a6c7677d350d465567f523b0c055df3"},{url:"/cards/hearts/J.jpg",revision:"371ac740ca4e6283802b5a3a0755cfef"},{url:"/cards/hearts/J.webp",revision:"7317462c8309b1db39985cefbfea78b0"},{url:"/cards/hearts/K.jpg",revision:"e2f33b737f119610bf825aa585905382"},{url:"/cards/hearts/K.webp",revision:"c34ab21de46fd77d10c03dcafc1d2149"},{url:"/cards/hearts/Q.jpg",revision:"fcc83acd82c93b8a7b4848556349fa25"},{url:"/cards/hearts/Q.webp",revision:"7798f22793b0c93b159f2d76f0c9f466"},{url:"/cards/hearts/others/Ishema Cards V2-07.jpg",revision:"148abfeaec9cc4f924d4dd5e481457e9"},{url:"/cards/hearts/others/Ishema Cards V2-31.jpg",revision:"3b0dc29565a289f4b1c3423d8b9ffd1e"},{url:"/cards/hearts/others/Ishema Cards V2-35.jpg",revision:"39873e47b1fa00937bfcc02c4ce1378b"},{url:"/cards/spades/3.jpg",revision:"32b0d84c49727afc6e6afd98854e2239"},{url:"/cards/spades/3.webp",revision:"9728c9cf4cbebe765c7f69e902e2758b"},{url:"/cards/spades/4.jpg",revision:"6396c944b0462ccc10d2ee73ef5e4a7a"},{url:"/cards/spades/4.webp",revision:"40cc0af20f3d63d6addf94c85242578e"},{url:"/cards/spades/5.jpg",revision:"d5f8195b6443d57e06a1ba22e29728ce"},{url:"/cards/spades/5.webp",revision:"f7e7dd24714b4b52a8bfe70642f55cdd"},{url:"/cards/spades/6.jpg",revision:"ad77b55adfc07536aa69eb2ad254d9a0"},{url:"/cards/spades/6.webp",revision:"c6ddc7d0df610cd358695fedb68cc855"},{url:"/cards/spades/7.jpg",revision:"7c52a5265f935bc76195bc810e2374b6"},{url:"/cards/spades/7.webp",revision:"5f74355cab8fc2e376e09dc863415d0a"},{url:"/cards/spades/A.jpg",revision:"d5019553872460f1ccac941803d6323a"},{url:"/cards/spades/A.webp",revision:"6272710c1db8d77f623cc3b06f24adb0"},{url:"/cards/spades/J.jpg",revision:"6e1ff1f896c27cc52749a130fb09580b"},{url:"/cards/spades/J.webp",revision:"b3ad089c098356c827ce04e310636300"},{url:"/cards/spades/K.jpg",revision:"5adc918b3cf1762eedf931c0094cd4b5"},{url:"/cards/spades/K.webp",revision:"73c8376db787fd246ec4afb06d504d02"},{url:"/cards/spades/Q.jpg",revision:"47c3d14d4996d18446efcae9c1b4e046"},{url:"/cards/spades/Q.webp",revision:"217aba42e59dc93f2570ffc1c3a16d75"},{url:"/cards/spades/others/Ishema Cards V2-05.jpg",revision:"c1721b467407bb9d9071ca34e344ec4a"},{url:"/cards/spades/others/Ishema Cards V2-33.jpg",revision:"b898bfeb2d0cfceb73690e8b0c582433"},{url:"/cards/spades/others/Ishema Cards V2-37.jpg",revision:"8af248f3bbb2c5b915f67993be2632e8"},{url:"/file.svg",revision:"d09f95206c3fa0bb9bd9fefabfd0ea71"},{url:"/globe.svg",revision:"2aaafa6a49b6563925fe440891e32717"},{url:"/icons/icon-192x192.png",revision:"976bb615c6ab94619e0e24fdd6ba9a07"},{url:"/manifest.json",revision:"e21407b2c86ca81b3fe224c60235d692"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/vercel.svg",revision:"c0af2f507b369b085b35ef4bbe3bcf1e"},{url:"/web-app-manifest-192x192.png",revision:"976bb615c6ab94619e0e24fdd6ba9a07"},{url:"/web-app-manifest-512x512.png",revision:"9d42ab7c2339d5b35e4d6f49ec4bd113"},{url:"/window.svg",revision:"a2760511c65806022ad20adf74370ff3"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:a,state:c})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
