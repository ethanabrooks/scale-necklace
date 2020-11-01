(this["webpackJsonpscale-necklace"]=this["webpackJsonpscale-necklace"]||[]).push([[0],{110:function(t,e,n){},124:function(t,e,n){},129:function(t,e,n){"use strict";n.r(e);var a=n(15),c=n(8),r=n.n(c),i=n(24),l=n.n(i),o=(n(110),n(11)),u=n(7),s=n(40),f=n(10),d=n(31),h=[{sharp:"c",flat:"c"},{sharp:"c#",flat:"db"},{sharp:"d",flat:"d"},{sharp:"d#",flat:"eb"},{sharp:"e",flat:"e"},{sharp:"f",flat:"f"},{sharp:"f#",flat:"gb"},{sharp:"g",flat:"g"},{sharp:"g#",flat:"ab"},{sharp:"a",flat:"a"},{sharp:"a#",flat:"bb"},{sharp:"b",flat:"b"}];function b(t){return t<=1?[]:Object(d.flatten)([p(t-1).map((function(t){return{head:[1],tail:t}})),p(t-2).map((function(t){return{head:[1,1],tail:t}}))]).map((function(t){return{tag:"A",scale:t}}))}function p(t){return t<=0?[]:Object(d.flatten)([b(t-3).map((function(t){return{head:[3],tail:t}})),g(t-2).map((function(t){return{head:[2],tail:t}})),g(t-5).map((function(t){return{head:[2,3],tail:t}}))]).map((function(t){return{tag:"B",scale:t}}))}function g(t){return t<0?[]:0===t?[{tag:"C",scale:null}]:Object(d.flatten)([b(t),p(t)]).map((function(t){return{tag:"C",scale:t}}))}function j(t){var e=t.scale.head;return null===t.scale.tail?e:e.concat(m(t.scale.tail))}function m(t){var e=t.scale.head;switch(t.scale.tail.tag){case"A":return e.concat(j(t.scale.tail));case"C":return e.concat(O(t.scale.tail))}}function O(t){if(null===t.scale)return[];switch(t.scale.tag){case"A":return j(t.scale);case"B":return m(t.scale)}}var v=g(h.length).map(O),y=n(41),w=n(49),k=(n(124),n(32)),x=n(33),P=n(144),C=getComputedStyle(document.documentElement).getPropertyValue("--hl"),S=getComputedStyle(document.documentElement).getPropertyValue("--ll"),E=getComputedStyle(document.documentElement).getPropertyValue("--pl");function T(t){return Math.floor(Math.random()*t)}function R(t,e){var n=A(e,t.length);return t.slice(n).concat(t.slice(0,n))}function A(t,e){return(t%e+e)%e}function I(t){return A(t,h.length)}function z(t,e){var n=r.a.useRef(null);if(null==n.current)return n.current=t,t;var a=Math.round((n.current-t)/e)*e+t;return n.current=a,a}function L(){var t=r.a.useState(v[0]),e=Object(f.a)(t,2),n=e[0],i=e[1],l=r.a.useState(0),d=Object(f.a)(l,2),b=d[0],p=d[1],g=r.a.useState(0),j=Object(f.a)(g,2),m=j[0],O=j[1],A=r.a.useState(!0),L=Object(f.a)(A,2),M=L[0],N=L[1],B=Object(c.useState)({loaded:!1}),F=Object(f.a)(B,2),V=F[0],D=F[1],H=r.a.useState({width:window.innerWidth,height:window.innerHeight}),J=Object(f.a)(H,2),W=J[0],$=W.width,q=W.height,G=J[1],K=z(m,h.length),Q=z(b,h.length),U=Object(k.b)({springRoot:K,springOffset:Q,config:{tension:200,friction:120,mass:10}}),X=U.springRoot,Y=U.springOffset,Z=V.loaded&&V.notesToPlay.length>0;r.a.useEffect((function(){var t=function(){return G({width:window.innerWidth,height:window.innerHeight})};return window.addEventListener("resize",t),function(){return window.removeEventListener("resize",t)}}),[G]),Object(c.useEffect)((function(){D({loaded:!0,synth:(new y.a).toDestination(),notesToPlay:[]})}),[D]),Object(c.useEffect)((function(){if(V.loaded){var t=Object(s.a)(V.notesToPlay),e=t[0],n=t.slice(1);if(Z){var a,c=h[e%h.length];return V.synth.triggerAttack("".concat(c.sharp).concat(e<h.length?_:_+1)),a=setInterval((function(){D(Object(u.a)(Object(u.a)({},V),{},{notesToPlay:n}))}),300),function(){V.synth.triggerRelease(),a&&clearInterval(a)}}}}),[V,Z]),window.addEventListener("keydown",(function(t){"Shift"===t.key&&N(!1)})),window.addEventListener("keyup",(function(t){"Shift"===t.key&&N(!0)}));var _=3,tt=Math.min($-30,q-30),et="".concat(tt/50,"pt"),nt=2*Math.PI/h.length,at={"--f":et},ct=function(t){V.loaded&&(Z?D(Object(u.a)(Object(u.a)({},V),{},{notesToPlay:[]})):Object(y.b)().then((function(){return D(Object(u.a)(Object(u.a)({},V),{},{notesToPlay:t}))})))},rt=n.reduce((function(t,e){return t.concat(t[t.length-1]+e)}),[m]),it=rt.map((function(t){return t%h.length})),lt=h.map((function(t,e){return it.includes(e)})),ot=lt.map((function(t,e){return V.loaded&&V.notesToPlay.length>0&&I(V.notesToPlay[0])===e?E:t?C:S})),ut=w.a().padAngle(.1).innerRadius(tt/2.9).outerRadius(tt/2).startAngle((function(t){return(t-.5)*nt})).endAngle((function(t){return(t+.5)*nt})).cornerRadius(tt),st=h.map((function(t,e){return ut(e)})),ft=Object(x.a)(R(Object(x.a)(lt,ot).map((function(t,e){var n=Object(s.a)(t).slice(0);return[e].concat(Object(o.a)(n))})),m-b),st),dt=h.map((function(t){return t.sharp===t.flat?t.sharp:"".concat(t.sharp,"/").concat(t.flat).replace(/(\w)#/,"$1\u266f").replace(/(\w)b/,"$1\u266d")})),ht=R(Object(x.a)(dt,ot),m);return Object(a.jsxs)("div",{className:"container",style:{"--s":"".concat(tt,"px"),"--m":h.length},children:[Object(a.jsxs)("div",{className:"buttons",children:[Object(a.jsx)("button",{style:at,onClick:function(){O(T(h.length)),p(0),ct([])},children:"Randomize Root"}),Object(a.jsx)("button",{style:at,onClick:function(){var t=v[T(v.length)];i(R(t,T(t.length))),ct([])},children:"Randomize Scale"}),Object(a.jsx)("button",{style:at,onClick:function(){return ct(rt)},children:Z?"Pause":"Play"}),Object(a.jsx)("span",{style:Object(u.a)(Object(u.a)({},at),{},{color:"#999999"}),children:"Try clicking on a note or shift-clicking on yellow note."}),Object(a.jsx)("div",{style:{zIndex:1e3},children:Object(a.jsx)(P.a,{checked:M,onChange:function(t){var e=t.target;return N(e.checked)},color:"default",size:"medium",inputProps:{"aria-label":"toggle movement mode",role:"switch"}})})]}),Object(a.jsxs)(k.a.div,{className:"necklace",style:{"--r":Y.interpolate((function(t){return-t}))},children:[ft.map((function(t,e){var c=Object(f.a)(t,2),r=Object(f.a)(c[0],3),l=r[0],o=r[1],u=r[2],s=c[1];return Object(a.jsx)("svg",{className:"svg",tabIndex:l,style:{"--c":u},"aria-label":h[l].sharp,children:Object(a.jsx)("path",{className:"path",stroke:u,d:s,onClick:function(t){var e=I(b+(l-m));ct([]),M?O(l):o&&(p(e),i(R(n,it.indexOf(l))))}})},e)})),Object(a.jsx)(k.a.div,{className:"note-names",style:{"--a":X.interpolate((function(t){return m-t}))},children:ht.map((function(t,e){var n=Object(f.a)(t,2),c=n[0],r=n[1];return Object(a.jsx)("span",{style:Object(u.a)({"--i":e,"--c":r},at),children:c},e)}))})]})]})}var M=function(t){t&&t instanceof Function&&n.e(3).then(n.bind(null,145)).then((function(e){var n=e.getCLS,a=e.getFID,c=e.getFCP,r=e.getLCP,i=e.getTTFB;n(t),a(t),c(t),r(t),i(t)}))};l.a.render(Object(a.jsx)(r.a.StrictMode,{children:Object(a.jsx)(L,{})}),document.getElementById("root")),M()}},[[129,1,2]]]);
//# sourceMappingURL=main.e486647c.chunk.js.map