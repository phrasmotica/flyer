var Z=Object.defineProperty;var q=(o,t,e)=>t in o?Z(o,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):o[t]=e;var P=(o,t,e)=>(q(o,typeof t!="symbol"?t+"":t,e),e);import{d as U,o as p,c as h,n as j,t as k,a as m,b as y,r as T,w as z,e as I,f as B,g as F,h as C,i as N,F as V,j as M,k as ee,l as W,u as L,p as G,m as J}from"./index-CJZYXL8I.js";let E;const te=new Uint8Array(16);function se(){if(!E&&(E=typeof crypto<"u"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!E))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return E(te)}const $=[];for(let o=0;o<256;++o)$.push((o+256).toString(16).slice(1));function ne(o,t=0){return $[o[t+0]]+$[o[t+1]]+$[o[t+2]]+$[o[t+3]]+"-"+$[o[t+4]]+$[o[t+5]]+"-"+$[o[t+6]]+$[o[t+7]]+"-"+$[o[t+8]]+$[o[t+9]]+"-"+$[o[t+10]]+$[o[t+11]]+$[o[t+12]]+$[o[t+13]]+$[o[t+14]]+$[o[t+15]]}const le=typeof crypto<"u"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto),A={randomUUID:le};function K(o,t,e){if(A.randomUUID&&!t&&!o)return A.randomUUID();o=o||{};const r=o.random||(o.rng||se)();if(r[6]=r[6]&15|64,r[8]=r[8]&63|128,t){e=e||0;for(let a=0;a<16;++a)t[e+a]=r[a];return t}return ne(r)}const oe={key:1},ae=U({__name:"ScoreCell",props:{result:{}},emits:["showResultModal"],setup(o,{emit:t}){const e=o,r=t,a=u=>u.finishTime?"bg-primary":u.startTime?"in-progress":"bg-cyan-100";return(u,d)=>(p(),h("div",{class:j(["p-2 text-center cursor-pointer border-round-md",a(e.result)]),onClick:d[0]||(d[0]=()=>r("showResultModal"))},[e.result.startTime?(p(),h("span",{key:0,class:j([e.result.finishTime&&"font-bold"])},k(e.result.scores.map(v=>v.score).join("-")),3)):(p(),h("span",oe," ?-? "))],2))}}),O=(o,t)=>{const e=o.__vccOpts||o;for(const[r,a]of t)e[r]=a;return e},Q=O(ae,[["__scopeId","data-v-a0880355"]]),re={class:"grid m-0"},ie={class:"col-5"},ue={class:"col-2 p-0"},ce={class:"col-5 text-right"},de=U({__name:"FixtureCard",props:{players:{},result:{}},emits:["showResultModal"],setup(o,{emit:t}){const e=o,r=t,a=u=>{var d;return((d=e.players.find(v=>v.id===u))==null?void 0:d.name)??u};return(u,d)=>(p(),h("div",re,[m("div",ie,k(a(e.result.scores[0].playerId)),1),m("div",ue,[y(Q,{result:e.result,onShowResultModal:d[0]||(d[0]=()=>r("showResultModal",e.result))},null,8,["result"])]),m("div",ce,k(a(e.result.scores[1].playerId)),1)]))}}),me={class:"flex flex-column md:flex-row md:align-items-center justify-content-between mb-2"},pe={class:"font-bold"},ve={class:"flex flex-column md:flex-row md:align-items-center justify-content-between mb-2"},he={class:"font-bold"},_e={class:"md:ml-3"},fe=m("span",{class:"pi pi-plus"},null,-1),ye=m("span",{class:"pi pi-minus"},null,-1),be={class:"p-fluid"},X=U({__name:"RecordResultModal",props:{visible:{type:Boolean},players:{},round:{},result:{},raceTo:{}},emits:["cancel","start","confirm"],setup(o,{emit:t}){const e=o,r=t,a=T(e.visible),u=T(e.result.scores.map(l=>l.playerId)),d=T(e.result.scores.map(l=>l.score));z([d],()=>{var l;(l=document.activeElement)==null||l.blur()}),z(e,()=>{a.value=e.visible,u.value=e.result.scores.map(l=>l.playerId),d.value=e.result.scores.map(l=>l.score)}),I(()=>e.players);const v=(l,n)=>{d.value=d.value.map((i,c)=>c===l?n:i)},_=()=>r("start"),g=l=>{const n={id:e.result.id,scores:u.value.map((i,c)=>({playerId:i,score:d.value[c]})),startTime:e.result.startTime};r("confirm",n,l)},w=I(()=>!1),R=I(()=>!!([...new Set(u.value)].length!==u.value.length||d.value.every(n=>n<e.raceTo))),f=l=>{var n;return(n=e.players.find(i=>i.id===l))==null?void 0:n.name},b=I(()=>e.result.scores.map(l=>f(l.playerId)).join(" v ")),s=I(()=>`${e.round.name} - ${b.value}`);return(l,n)=>{const i=C("InputNumber"),c=C("Button"),S=C("Dialog");return p(),B(S,{visible:a.value,"onUpdate:visible":n[3]||(n[3]=x=>a.value=x),modal:"",header:s.value},{default:F(()=>[e.result.finishTime?(p(!0),h(V,{key:0},N(u.value,(x,D)=>(p(),h("div",me,[m("div",pe,k(f(x))+": "+k(d.value[D]),1)]))),256)):e.result.startTime?(p(!0),h(V,{key:1},N(u.value,(x,D)=>(p(),h("div",ve,[m("div",he,k(f(x)),1),m("div",_e,[y(i,{showButtons:"",buttonLayout:"horizontal",modelValue:d.value[D],min:0,max:e.raceTo,"onUpdate:modelValue":Y=>v(D,Y)},{incrementbuttonicon:F(()=>[fe]),decrementbuttonicon:F(()=>[ye]),_:2},1032,["modelValue","max","onUpdate:modelValue"])])]))),256)):M("",!0),m("div",be,[e.result.startTime?M("",!0):(p(),B(c,{key:0,class:"mb-2",type:"button",label:"Start",disabled:w.value,onClick:_},null,8,["disabled"])),e.result.startTime&&!e.result.finishTime?(p(),B(c,{key:1,class:"mb-2",type:"button",label:"Update",severity:"info",onClick:n[0]||(n[0]=()=>g(!1))})):M("",!0),e.result.startTime&&!e.result.finishTime?(p(),B(c,{key:2,class:"mb-2",type:"button",label:"Finish",disabled:R.value,onClick:n[1]||(n[1]=()=>g(!0))},null,8,["disabled"])):M("",!0),y(c,{type:"button",label:"Close",severity:"secondary",onClick:n[2]||(n[2]=x=>r("cancel"))})])]),_:1},8,["visible","header"])}}}),xe={class:"flex flex-column md:flex-row justify-content-between md:align-items-end border-bottom-1 pb-1"},ge=m("h1",null,"Fixtures",-1),we={class:"text-center"},Re=U({__name:"FixtureList",props:{players:{},raceTo:{},rounds:{}},emits:["start","updateResult"],setup(o,{emit:t}){const e=o,r=t,a=T(),u=T(!1),d=I(()=>e.rounds.flatMap(f=>f.fixtures).filter(f=>!f.finishTime).length),v=I(()=>e.rounds.find(f=>f.fixtures.some(b=>{var s;return b.id===((s=a.value)==null?void 0:s.id)}))),_=f=>{a.value=f,u.value=!0},g=()=>{a.value&&(r("start",a.value.id),R())},w=(f,b)=>{r("updateResult",f,b),R()},R=()=>{u.value=!1};return(f,b)=>(p(),h(V,null,[m("div",xe,[ge,m("h4",null,"Results remaining: "+k(d.value),1)]),(p(!0),h(V,null,N(e.rounds,(s,l)=>(p(),h("div",{class:j([l>0&&"border border-top-1"])},[m("h3",we,k(s.name),1),(p(!0),h(V,null,N(s.fixtures,(n,i)=>(p(),h("div",{class:j(["mt-1 pt-1 mb-1",[i>0&&"border-gray-200 border-top-1"]])},[y(de,{players:e.players,result:n,onShowResultModal:()=>_(n)},null,8,["players","result","onShowResultModal"])],2))),256))],2))),256)),v.value&&a.value?(p(),B(X,{key:0,visible:u.value,players:e.players,round:v.value,result:a.value,raceTo:e.raceTo,onStart:g,onConfirm:w,onCancel:R},null,8,["visible","players","round","result","raceTo"])):M("",!0)],64))}}),Te={class:"player-name-input p-fluid"},Se=U({__name:"PlayerNameInput",props:{name:{},placeholder:{},disabled:{type:Boolean}},emits:["setName"],setup(o,{emit:t}){const e=o,r=t;return(a,u)=>{const d=C("InputText");return p(),h("div",Te,[y(d,{placeholder:e.placeholder,disabled:e.disabled,modelValue:e.name,"onUpdate:modelValue":u[0]||(u[0]=v=>r("setName",v||""))},null,8,["placeholder","disabled","modelValue"])])}}});class H{constructor(t){P(this,"frameTimeEstimateMins",7);this.players=t}estimateDuration(t,e,r){const a=t*(t-1)/2,u=2*e-1,d=(e+u)/2,v=a*d;return Math.ceil(this.frameTimeEstimateMins*v/r)}generateFixtures(){let t=0;const e=this.players.length%2!==0,r=e?this.players.length:this.players.length-1,a=[],u=this.shuffle(this.players.map((v,_)=>_));let d=0;for(;d<r&&t<10;){const v=new $e("Round "+(d+1));console.log(v.name);let _=!1,g=[...this.players];for(e&&(console.log("Omitting: "+g[u[d]].name),g.splice(u[d],1));g.length>1;){const w=this.getRandom(g),R=a.flatMap(s=>s.getExistingOpponents(w)),f=g.filter(s=>!R.includes(s.id)&&w.id!==s.id);if(f.length<=0){console.log("Retrying round..."),_=!0;break}const b=this.getRandom(f);v.addFixture([w,b]),g=g.filter(s=>![w.id,b.id].includes(s.id))}if(_){t++;continue}a.push(v),d++}return t>=10&&console.log("Failed to generate rounds after 10 attempts!"),a}getRandom(t){return t[Math.floor(Math.random()*t.length)]}shuffle(t){let e=t.length,r=0;for(;e>0;){r=Math.floor(Math.random()*e),e--;const a=t[e];t[e]=t[r],t[r]=a}return t}}class $e{constructor(t){P(this,"name");P(this,"fixtures");this.name=t,this.fixtures=[]}addFixture(t){console.log(t.map(e=>e.name).join(" v ")),this.fixtures.push({id:K(),scores:t.map(e=>({playerId:e.id,score:0})),startTime:null,finishTime:null})}startFixture(t){const e=this.fixtures.findIndex(r=>r.id===t);return e>=0&&(this.fixtures[e].startTime=Date.now()),this}updateResult(t,e){const r=this.fixtures.findIndex(a=>a.id===t.id);return r>=0&&(e&&(t.finishTime=Date.now()),this.fixtures[r]=t),this}getExistingFixtures(t){return this.fixtures.filter(e=>e.scores.some(r=>r.playerId===t.id))}getExistingOpponents(t){const e=this.getExistingFixtures(t);return[...new Set(e.map(r=>r.scores.map(a=>a.playerId).filter(a=>a!==t.id)).flatMap(r=>r))]}}const Ie=m("h1",{class:"border-bottom-1 mb-2"},"Format",-1),Fe={class:"p-fluid mb-2"},ke=m("span",{class:"pi pi-plus"},null,-1),Ce=m("span",{class:"pi pi-minus"},null,-1),Ve={class:"p-fluid mb-2"},Me=m("span",{class:"pi pi-plus"},null,-1),Be=m("span",{class:"pi pi-minus"},null,-1),Ue={class:"p-fluid mb-2"},De={class:"p-fluid mb-2"},Ne=m("h1",{class:"border-bottom-1 mb-2"},"Players",-1),Pe={class:"p-fluid mb-2"},Ee=m("span",{class:"pi pi-plus"},null,-1),je=m("span",{class:"pi pi-minus"},null,-1),Le={class:"p-fluid"},He=U({__name:"FlyerForm",props:{players:{}},emits:["start","setName","reset"],setup(o,{emit:t}){const e=o,r=t,a=T(e.players.filter(b=>b).length),u=T("Round Robin"),d=T(["Round Robin"]),v=T(1),_=T(1),g=I(()=>new H([]).estimateDuration(a.value,v.value,_.value)),w=new H([]).frameTimeEstimateMins;ee(()=>{const b=document.getElementsByClassName("p-inputnumber-button");for(const s of b)s.addEventListener("mouseup",()=>{var l;(l=document.activeElement)==null||l.blur()})});const R=I(()=>e.players.slice(0,a.value)),f=()=>r("start",R.value,v.value,_.value);return(b,s)=>{const l=C("InputNumber"),n=C("SelectButton"),i=C("Button");return p(),h(V,null,[Ie,m("div",Fe,[y(l,{modelValue:v.value,"onUpdate:modelValue":s[0]||(s[0]=c=>v.value=c),showButtons:"",buttonLayout:"horizontal",min:1,max:5,prefix:"Races to ",inputStyle:{"text-align":"center","font-weight":"bold"}},{incrementbuttonicon:F(()=>[ke]),decrementbuttonicon:F(()=>[Ce]),_:1},8,["modelValue"])]),m("div",Ve,[y(l,{modelValue:_.value,"onUpdate:modelValue":s[1]||(s[1]=c=>_.value=c),showButtons:"",buttonLayout:"horizontal",min:1,max:Math.floor(a.value/2),suffix:" table(s)",inputStyle:{"text-align":"center","font-weight":"bold"}},{incrementbuttonicon:F(()=>[Me]),decrementbuttonicon:F(()=>[Be]),_:1},8,["modelValue","max"])]),m("div",Ue,[y(n,{modelValue:u.value,"onUpdate:modelValue":s[2]||(s[2]=c=>u.value=c),options:d.value,allowEmpty:!1,"aria-labelledby":"basic"},null,8,["modelValue","options"])]),m("div",De,[m("p",null,[W("Estimated duration: "+k(g.value)+" min(s) ",1),m("em",null,"("+k(L(w))+" min(s) per frame)",1)])]),Ne,m("div",Pe,[y(l,{modelValue:a.value,"onUpdate:modelValue":s[3]||(s[3]=c=>a.value=c),showButtons:"",buttonLayout:"horizontal",min:2,max:10,suffix:" players",inputStyle:{"text-align":"center","font-weight":"bold"}},{incrementbuttonicon:F(()=>[Ee]),decrementbuttonicon:F(()=>[je]),_:1},8,["modelValue"])]),(p(!0),h(V,null,N(b.players,(c,S)=>(p(),h("div",null,[y(Se,{class:"mb-2",placeholder:"Player "+(S+1),disabled:S>=a.value,name:c,onSetName:x=>r("setName",S,x)},null,8,["placeholder","disabled","name","onSetName"])]))),256)),m("div",Le,[y(i,{label:"Start",disabled:R.value.some(c=>!c),onClick:f},null,8,["disabled"])])],64)}}}),Oe=o=>(G("data-v-93c0b17a"),o=o(),J(),o),ze=Oe(()=>m("h1",{class:"border-bottom-1"},"Results",-1)),Ae={key:0},We=U({__name:"ResultsTable",props:{players:{},results:{}},setup(o){const t=o,e=s=>!s.finishTime||r(s)?null:s.scores.reduce((n,i)=>n.score>i.score?n:i).playerId,r=s=>{if(!s.finishTime)return!1;const l=s.scores.map(n=>n.score).reduce((n,i)=>Math.max(n,i));return s.scores.every(n=>n.score===l)},a=s=>!s.finishTime||r(s)?null:s.scores.reduce((n,i)=>n.score<i.score?n:i).playerId,u=(s,l)=>l.filter(n=>e(n)===s).length,d=(s,l)=>l.filter(n=>r(n)&&n.scores.some(i=>i.playerId===s)).length,v=(s,l)=>l.filter(n=>a(n)===s).length,_=(s,l)=>l.some(n=>n.scores.some(i=>i.playerId===s)&&!n.finishTime),g=(s,l,n)=>{const i=u(s,n),c=u(l,n);if(i!==c)return c-i;const S=v(s,n),x=v(l,n);return S!==x?x-S:0},w=I(()=>t.players.sort((s,l)=>g(s.id,l.id,t.results))),R=I(()=>w.value.map((s,l)=>({rank:l+1,name:s.name,wins:u(s.id,t.results),draws:d(s.id,t.results),losses:v(s.id,t.results),incomplete:_(s.id,t.results)}))),f=s=>[{"bg-primary":!s.incomplete&&s.rank===1,"bg-gray-400":s.incomplete}],b=R.value.filter(s=>s.incomplete).length;return(s,l)=>{const n=C("Column"),i=C("DataTable");return p(),h(V,null,[ze,y(i,{value:R.value,rowClass:f},{default:F(()=>[y(n,{field:"rank",header:"#"}),y(n,{field:"name",header:"Name"}),y(n,{field:"wins",header:"Won"}),y(n,{field:"draws",header:"Drew"}),y(n,{field:"losses",header:"Lost"})]),_:1},8,["value"]),L(b)>0?(p(),h("h4",Ae,[m("em",null,k(L(b))+" player(s) have incomplete results!",1)])):M("",!0)],64)}}}),Ge=O(We,[["__scopeId","data-v-93c0b17a"]]),Je={class:"flex flex-column md:flex-row justify-content-between md:align-items-end border-bottom-1 pb-1"},Ke=m("h1",null,"Head-to-Head",-1),Qe={key:0,class:"flex justify-content-center"},Xe={key:1},Ye={key:2,class:"flex justify-content-center"},Ze=U({__name:"RoundRobinTable",props:{players:{},raceTo:{},rounds:{},results:{}},emits:["start","updateResult"],setup(o,{emit:t}){const e=o,r=t,a=T(),u=T(!1),d=I(()=>e.results.filter(s=>!s.finishTime).length),v=I(()=>e.rounds.find(s=>s.fixtures.some(l=>{var n;return l.id===((n=a.value)==null?void 0:n.id)}))),_=(s,l)=>e.results.some(n=>n.scores.some(i=>i.playerId===s)&&n.scores.some(i=>i.playerId===l)),g=(s,l)=>e.results.find(n=>n.scores.some(i=>i.playerId===s)&&n.scores.some(i=>i.playerId===l)),w=(s,l)=>{a.value=g(s.id,l.id),u.value=!0},R=()=>{a.value&&(r("start",a.value.id),b())},f=(s,l)=>{r("updateResult",s,l),b()},b=()=>{u.value=!1};return(s,l)=>{const n=C("Column"),i=C("DataTable");return p(),h(V,null,[m("div",Je,[Ke,m("h4",null,"Results remaining: "+k(d.value),1)]),y(i,{value:e.players},{default:F(()=>[y(n,null,{body:F(c=>[W(k(c.data.name),1)]),_:1}),(p(!0),h(V,null,N(e.players,(c,S)=>(p(),B(n,{header:c.name},{body:F(x=>[x.index===S?(p(),h("div",Qe," - ")):_(x.data.id,c.id)?(p(),h("div",Xe,[y(Q,{result:g(x.data.id,c.id),onShowResultModal:()=>w(x.data,c)},null,8,["result","onShowResultModal"])])):(p(),h("div",Ye," ? "))]),_:2},1032,["header"]))),256))]),_:1},8,["value"]),v.value&&a.value?(p(),B(X,{key:0,visible:u.value,players:e.players,round:v.value,result:a.value,raceTo:e.raceTo,onStart:R,onConfirm:f,onCancel:b},null,8,["visible","players","round","result","raceTo"])):M("",!0)],64)}}}),qe=o=>(G("data-v-644be73f"),o=o(),J(),o),et={key:0},tt={key:1},st={class:"p-fluid"},nt={class:"p-fluid mt-2"},lt={key:2},ot={class:"p-fluid mt-2"},at=qe(()=>m("footer",null,[m("a",{href:"https://www.flaticon.com/free-icons/ball-eight",title:"ball eight icons"},"Ball eight icons created by Boris farias - Flaticon")],-1)),rt=U({__name:"HomeView",setup(o){const t="Player 1;Player 2;Player 3;Player 4";let e=[];e=String(t).split(";"),e.length<10&&(e=[...e,...new Array(10-e.length).fill("")]);const r=T(0),a=T(e),u=T([]),d=T(0),v=T(0),_=T([]),g=I(()=>_.value.flatMap(i=>i.fixtures)),w=T("Fixtures"),R=i=>r.value=i,f=(i,c)=>{a.value=a.value.map((S,x)=>x===i?c:S)},b=(i,c,S)=>{u.value=i.map(x=>({id:K(),name:x})),d.value=c,v.value=S,_.value=new H(u.value).generateFixtures(),R(1)},s=i=>{_.value=_.value.map(c=>c.startFixture(i))},l=(i,c)=>{_.value=_.value.map(S=>S.updateResult(i,c))},n=()=>{R(0),u.value=[],d.value=0,_.value=[]};return(i,c)=>{const S=C("SelectButton"),x=C("Button");return p(),h(V,null,[m("main",null,[r.value===0?(p(),h("div",et,[y(He,{players:a.value,onSetName:f,onStart:b},null,8,["players"])])):r.value===1?(p(),h("div",tt,[m("div",st,[y(S,{modelValue:w.value,"onUpdate:modelValue":c[0]||(c[0]=D=>w.value=D),options:["Fixtures","Head-to-Head"],allowEmpty:!1,"aria-labelledby":"basic"},null,8,["modelValue","options"])]),w.value==="Fixtures"?(p(),B(Re,{key:0,players:u.value,raceTo:d.value,rounds:_.value,onStart:s,onUpdateResult:l},null,8,["players","raceTo","rounds"])):M("",!0),w.value==="Head-to-Head"?(p(),B(Ze,{key:1,players:u.value,raceTo:d.value,rounds:_.value,results:g.value,onStart:s,onUpdateResult:l},null,8,["players","raceTo","rounds","results"])):M("",!0),m("div",nt,[y(x,{label:"Finish",onClick:c[1]||(c[1]=()=>R(2))})])])):r.value===2?(p(),h("div",lt,[y(Ge,{players:u.value,results:g.value},null,8,["players","results"]),m("div",ot,[y(x,{label:"Restart",onClick:n})])])):M("",!0)]),at],64)}}}),ct=O(rt,[["__scopeId","data-v-644be73f"]]);export{ct as default};
