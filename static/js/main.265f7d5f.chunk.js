(this["webpackJsonpscale-necklace"]=this["webpackJsonpscale-necklace"]||[]).push([[0],{103:function(e,t,n){},117:function(e,t,n){},118:function(e,t,n){"use strict";n.r(t);var a=n(12),c=n(9),r=n.n(c),i=n(42),l=n.n(i),o=(n(103),n(10)),u=n(7),s=n(34),f=n(8),d=n(20),h=[{sharp:"c",flat:"c"},{sharp:"c#",flat:"db"},{sharp:"d",flat:"d"},{sharp:"d#",flat:"eb"},{sharp:"e",flat:"e"},{sharp:"f",flat:"f"},{sharp:"f#",flat:"gb"},{sharp:"g",flat:"g"},{sharp:"g#",flat:"ab"},{sharp:"a",flat:"a"},{sharp:"a#",flat:"bb"},{sharp:"b",flat:"b"}];function b(e){return e<=1?[]:Object(d.flatten)([j(e-1).map((function(e){return{head:[1],tail:e}})),j(e-2).map((function(e){return{head:[1,1],tail:e}}))]).map((function(e){return{tag:"A",scale:e}}))}function j(e){return e<=0?[]:Object(d.flatten)([b(e-3).map((function(e){return{head:[3],tail:e}})),p(e-2).map((function(e){return{head:[2],tail:e}})),p(e-5).map((function(e){return{head:[2,3],tail:e}}))]).map((function(e){return{tag:"B",scale:e}}))}function p(e){return e<0?[]:0===e?[{tag:"C",scale:null}]:Object(d.flatten)([b(e),j(e)]).map((function(e){return{tag:"C",scale:e}}))}function m(e){var t=e.scale.head;return null===e.scale.tail?t:t.concat(g(e.scale.tail))}function g(e){var t=e.scale.head;switch(e.scale.tail.tag){case"A":return t.concat(m(e.scale.tail));case"C":return t.concat(O(e.scale.tail))}}function O(e){if(null===e.scale)return[];switch(e.scale.tag){case"A":return m(e.scale);case"B":return g(e.scale)}}function v(e){return Object(d.zip)(e,e.slice(1)).some((function(e){var t=Object(f.a)(e,2),n=t[0],a=t[1];return 1===n&&1===a}))}function y(e){return e.some((function(e){return 3===e}))}var w=p(h.length).map(O),x=n(35),k=n(43),C=(n(117),n(27)),P=n(26),S=getComputedStyle(document.documentElement).getPropertyValue("--hl"),N=getComputedStyle(document.documentElement).getPropertyValue("--fg"),E=(getComputedStyle(document.documentElement).getPropertyValue("--ll"),getComputedStyle(document.documentElement).getPropertyValue("--pl"));function R(e){return Math.floor(Math.random()*e)}function T(e,t){var n=M(t,e.length);return e.slice(n).concat(e.slice(0,n))}function M(e,t){return(e%t+t)%t}function V(e){return M(e,h.length)}function L(e,t){var n=r.a.useRef(null);if(null==n.current)return n.current=e,e;var a=Math.round((n.current-e)/t)*t+e;return n.current=a,a}var A=function(e,t){var n,a=w.filter(Math.random()<e?y:function(e){return!y(e)}).filter(Math.random()<t?v:function(e){return!v(e)}),c=(n=a)[R(n.length)];return T(c,R(c.length))};function I(e){return 100*w.filter(e).length/w.length}var z=function(e){var t=e.value,n=e.setValue;return Object(a.jsx)("input",{type:"range",className:"slider",min:0,max:100,value:t,onChange:function(e){var t=e.target;n(+t.value)}})},B=function(e){var t=e.value,n=e.setValue;return Object(a.jsxs)("label",{className:"switch",children:[Object(a.jsx)("input",{type:"checkbox",onClick:function(){return n(!t)},defaultChecked:!t}),Object(a.jsx)("span",{className:"slide"})]})};function F(){var e=r.a.useState(0),t=Object(f.a)(e,2),n=t[0],c=t[1],i=r.a.useState(0),l=Object(f.a)(i,2),d=l[0],b=l[1],j=r.a.useState(!0),p=Object(f.a)(j,2),m=p[0],g=p[1],O=r.a.useState(I(v)),w=Object(f.a)(O,2),M=w[0],F=w[1],D=r.a.useState(I(y)),H=Object(f.a)(D,2),J=H[0],W=H[1],$=r.a.useState(A(J,M)),q=Object(f.a)($,2),G=q[0],K=q[1],Q=r.a.useState({loaded:!1}),U=Object(f.a)(Q,2),X=U[0],Y=U[1],Z=r.a.useState({width:window.innerWidth,height:window.innerHeight}),_=Object(f.a)(Z,2),ee=_[0],te=ee.width,ne=ee.height,ae=_[1],ce=r.a.useMemo((function(){return new x.a}),[]),re=L(d,h.length),ie=L(n,h.length),le=Object(C.b)({springRoot:re,springOffset:ie,config:{tension:200,friction:120,mass:10}}),oe=le.springRoot,ue=le.springOffset,se=X.loaded&&X.notesToPlay.length>0;r.a.useEffect((function(){var e=function(){return ae({width:window.innerWidth,height:window.innerHeight})};return window.addEventListener("resize",e),function(){window.removeEventListener("resize",e)}}),[ae]),r.a.useEffect((function(){var e=function(e){var t=e.key;"Shift"===t&&g(!1),"Enter"===t&&g(!m)},t=function(e){"Shift"===e.key&&g(!0)};return window.addEventListener("keydown",e),window.addEventListener("keyup",t),function(){window.removeEventListener("keydown",e),window.removeEventListener("keyup",t)}}),[m,g]),r.a.useEffect((function(){if(X.loaded){var e=Object(s.a)(X.notesToPlay),t=e[0],n=e.slice(1);if(se){var a,c=h[t%h.length];return ce.triggerAttack("".concat(c.sharp).concat(t<h.length?3:4)),a=setInterval((function(){Y(Object(u.a)(Object(u.a)({},X),{},{notesToPlay:n}))}),300),function(){ce.triggerRelease(),a&&clearInterval(a)}}}else ce.toDestination(),Y({loaded:!0,notesToPlay:[]})}),[X,se]);var fe=Math.min(te-30,ne-30),de=2*Math.PI/h.length,he=k.a().padAngle(.1).innerRadius(fe/2.9).outerRadius(fe/2).startAngle((function(e){return(e-.5)*de})).endAngle((function(e){return(e+.5)*de})).cornerRadius(fe),be=h.map((function(e,t){return he(t)})),je=function(e){X.loaded&&(se?Y(Object(u.a)(Object(u.a)({},X),{},{notesToPlay:[]})):Object(x.b)().then((function(){return Y(Object(u.a)(Object(u.a)({},X),{},{notesToPlay:e}))})))},pe=G.reduce((function(e,t){return e.concat(e[e.length-1]+t)}),[d]),me=pe.map((function(e){return e%h.length})),ge=h.map((function(e,t){return me.includes(t)})),Oe=ge.map((function(e,t){return X.loaded&&X.notesToPlay.length>0&&V(X.notesToPlay[0])===t?E:e?S:N})),ve=Object(P.a)(T(Object(P.a)(ge,Oe).map((function(e,t){var n=Object(s.a)(e).slice(0);return[t].concat(Object(o.a)(n))})),d-n),be),ye=h.map((function(e){return e.sharp===e.flat?e.sharp:"".concat(e.sharp,"/").concat(e.flat).replace(/(\w)#/,"$1\u266f").replace(/(\w)b/,"$1\u266d")})),we=T(Object(P.a)(ye,Oe),d),xe=function(){return K(A(J,M))};return Object(a.jsxs)("div",{className:"container",style:{"--s":"".concat(fe,"px"),"--m":h.length},children:[Object(a.jsxs)("div",{className:"buttons",children:[Object(a.jsx)("button",{className:"button",onClick:function(){b(R(h.length)),c(0),je([])},children:"Randomize Root"}),Object(a.jsx)("button",{className:"button",onClick:xe,children:"Randomize Scale"}),Object(a.jsx)("button",{className:"button",onClick:xe,children:"Random adjacent Scale"}),Object(a.jsx)("button",{className:"button",onClick:function(){return je(pe)},"aria-pressed":se,children:se?"Pause":"Play"}),Object(a.jsx)("span",{className:"static",children:"Click on a note or shift-click on a yellow note."}),Object(a.jsx)(B,{value:m,setValue:g}),Object(a.jsx)("span",{className:"static",children:"Probability of consecutive half-steps"}),Object(a.jsx)(z,{value:M,setValue:F}),Object(a.jsx)("span",{className:"static",children:"Probability of augmented 2nd"}),Object(a.jsx)(z,{value:J,setValue:W})]}),Object(a.jsxs)(C.a.div,{className:"necklace",style:{"--r":ue.interpolate((function(e){return-e}))},children:[ve.map((function(e,t){var r=Object(f.a)(e,2),i=Object(f.a)(r[0],3),l=i[0],o=i[1],u=i[2],s=r[1];return Object(a.jsx)("svg",{className:"svg",style:{"--c":u},children:Object(a.jsx)("path",{className:"path",stroke:u,d:s,"aria-labelledby":"note".concat(l),role:"button",tabIndex:0,onClick:function(){var e=V(n+(l-d));m?b(l):o&&(c(e),K(T(G,me.indexOf(l))))}})},t)})),Object(a.jsx)(C.a.div,{className:"note-names",style:{"--a":oe.interpolate((function(e){return d-e}))},children:we.map((function(e,t){var n=Object(f.a)(e,2),c=n[0],r=n[1];return Object(a.jsx)("span",{style:{"--i":t,"--c":r},id:"note".concat(d+t),children:c},t)}))})]})]})}var D=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,119)).then((function(t){var n=t.getCLS,a=t.getFID,c=t.getFCP,r=t.getLCP,i=t.getTTFB;n(e),a(e),c(e),r(e),i(e)}))};l.a.render(Object(a.jsx)(r.a.StrictMode,{children:Object(a.jsx)(F,{})}),document.getElementById("root")),D()}},[[118,1,2]]]);
//# sourceMappingURL=main.265f7d5f.chunk.js.map