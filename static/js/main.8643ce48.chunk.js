(this["webpackJsonpscale-necklace"]=this["webpackJsonpscale-necklace"]||[]).push([[0],{104:function(e,t,n){},123:function(e,t,n){},124:function(e,t,n){"use strict";n.r(t);var a=n(12),c=n(9),r=n.n(c),u=n(43),i=n.n(u),o=(n(104),n(10)),l=n(18),s=n(7),f=n(8),d=n(19),h=[{sharp:"c",flat:"c"},{sharp:"c#",flat:"db"},{sharp:"d",flat:"d"},{sharp:"d#",flat:"eb"},{sharp:"e",flat:"e"},{sharp:"f",flat:"f"},{sharp:"f#",flat:"gb"},{sharp:"g",flat:"g"},{sharp:"g#",flat:"ab"},{sharp:"a",flat:"a"},{sharp:"a#",flat:"bb"},{sharp:"b",flat:"b"}],b=h.length,j=getComputedStyle(document.documentElement).getPropertyValue("--hl"),p=getComputedStyle(document.documentElement).getPropertyValue("--fg"),g=(getComputedStyle(document.documentElement).getPropertyValue("--ll"),getComputedStyle(document.documentElement).getPropertyValue("--pl"));function m(e){return Math.floor(Math.random()*e)}function v(e,t){var n=O(t,e.length);return e.slice(n).concat(e.slice(0,n))}function O(e,t){return(e%t+t)%t}function y(e){return O(e,h.length)}function w(e,t){var n=r.a.useRef(null);if(null==n.current)return n.current=e,e;var a=Math.round((n.current-e)/t)*t+e;return n.current=a,a}var x=function(e,t,n){var a,c=e.filter(Math.random()<t?L:function(e){return!L(e)}).filter(Math.random()<n?V:function(e){return!V(e)});return c.length>0?(a=c)[m(a.length)]:null};function k(e){return 100*I.filter(e).length/I.length}var N=n(35),P=n.n(N);function C(e){return e<=1?[]:Object(d.flatten)([S(e-1).map((function(e){return{head:[1],tail:e}})),S(e-2).map((function(e){return{head:[1,1],tail:e}}))]).map((function(e){return{tag:"A",scale:e}}))}function S(e){return e<=0?[]:Object(d.flatten)([C(e-3).map((function(e){return{head:[3],tail:e}})),E(e-2).map((function(e){return{head:[2],tail:e}})),E(e-5).map((function(e){return{head:[2,3],tail:e}}))]).map((function(e){return{tag:"B",scale:e}}))}function E(e){return e<0?[]:0===e?[{tag:"C",scale:null}]:Object(d.flatten)([C(e),S(e)]).map((function(e){return{tag:"C",scale:e}}))}function R(e){var t=e.scale.head;return null===e.scale.tail?t:t.concat(T(e.scale.tail))}function T(e){var t=e.scale.head;switch(e.scale.tail.tag){case"A":return t.concat(R(e.scale.tail));case"C":return t.concat(M(e.scale.tail))}}function M(e){if(null===e.scale)return[];switch(e.scale.tag){case"A":return R(e.scale);case"B":return T(e.scale)}}function V(e){return Object(d.zip)(e,v(e,1)).some((function(e){var t=Object(f.a)(e,2),n=t[0],a=t[1];return 1===n&&1===a}))}function L(e){return e.some((function(e){return 3===e}))}function A(e,t){return Object(d.zip)(e,t).every((function(e){var t=Object(f.a)(e,2);return t[0]===t[1]}))}function z(e,t,n,a){if(0===e.length||0===t.length)return!1;var c=Object(l.a)(e),r=c[0],u=c.slice(1),i=Object(l.a)(t),o=i[0],s=i.slice(1);if(P()(r===n[n.length-1]),P()(o===a[a.length-1]),r===o){var f,d=Object(l.a)(n),h=d[0],b=d[1],j=d.slice(2),p=Object(l.a)(a),g=p[0],m=p[1],O=p.slice(2);if(h===m&&b===g&&(f=A(j,O)),h+b===g&&(f=A(j,[m].concat(O))),g+m===h&&(f=A(O,[b].concat(j))),f)return!0}return z(u,s,v(n,1),v(a,1))}var I=Object(d.flatten)(E(b).map(M).map((function(e){return e.map((function(t,n){return v(e,n)}))})));function B(e){return I.filter((function(t){return function(e,t){return z(e,t,v(e,1),v(t,1))}(e,t)}))}var F=n(36),D=n(44),H=(n(123),n(29)),J=n(28),W=function(e){var t=e.value,n=e.setValue;return Object(a.jsx)("input",{type:"range",className:"slider",min:0,max:100,value:t,onChange:function(e){var t=e.target;n(+t.value)}})},$=function(e){var t=e.value,n=e.setValue;return Object(a.jsxs)("label",{className:"switch",children:[Object(a.jsx)("input",{type:"checkbox",onClick:function(){return n(!t)},checked:!t}),Object(a.jsx)("span",{className:"slide"})]})};function q(){var e=r.a.useState(0),t=Object(f.a)(e,2),n=t[0],c=t[1],u=r.a.useState(0),i=Object(f.a)(u,2),d=i[0],b=i[1],O=r.a.useState(!0),N=Object(f.a)(O,2),P=N[0],C=N[1],S=r.a.useState(k(V)),E=Object(f.a)(S,2),R=E[0],T=E[1],M=r.a.useState(k(L)),A=Object(f.a)(M,2),z=A[0],q=A[1],G=r.a.useState(x(I,z,R)),K=Object(f.a)(G,2),Q=K[0],U=K[1],X=r.a.useState({width:window.innerWidth,height:window.innerHeight}),Y=Object(f.a)(X,2),Z=Y[0],_=Z.width,ee=Z.height,te=Y[1],ne=r.a.useMemo((function(){return new F.a}),[]),ae=w(d,h.length),ce=w(n,h.length),re=Object(H.b)({springRoot:ae,springOffset:ce,config:{tension:200,friction:120,mass:10}}),ue=re.springRoot,ie=re.springOffset,oe=r.a.useReducer((function(e,t){if(e.loaded){if("play"==t.type)return Object(s.a)(Object(s.a)({},e),{},{notesToPlay:t.notes});if("nextNote"==t.type){var n=Object(l.a)(e.notesToPlay),a=(n[0],n.slice(1));return Object(s.a)(Object(s.a)({},e),{},{notesToPlay:a})}if("reset"==t.type)return Object(s.a)(Object(s.a)({},e),{},{notesToPlay:[]});throw 1}return{loaded:!0,notesToPlay:[]}}),{loaded:!1}),le=Object(f.a)(oe,2),se=le[0],fe=le[1];r.a.useEffect((function(){if(se.loaded){if(de){var e,t=Object(f.a)(se.notesToPlay,1)[0],n=h[t%h.length];return ne.triggerAttack("".concat(n.sharp).concat(t<h.length?he:he+1)),e=setInterval((function(){fe({type:"nextNote"})}),500),function(){ne.triggerRelease(),e&&clearInterval(e)}}}else ne.toDestination(),fe({type:"reset"})}),[se,ne]);var de=se.loaded&&se.notesToPlay.length>0,he=3;r.a.useEffect((function(){var e=function(){return te({width:window.innerWidth,height:window.innerHeight})};return window.addEventListener("resize",e),function(){window.removeEventListener("resize",e)}}),[]),r.a.useEffect((function(){var e=function(e){var t=e.key;"Shift"===t&&C(!1),"Enter"===t&&C((function(e){return!e}))},t=function(e){"Shift"===e.key&&C(!0)};return window.addEventListener("keydown",e),window.addEventListener("keyup",t),function(){window.removeEventListener("keydown",e),window.removeEventListener("keyup",t)}}),[]);var be=Math.min(_-30,ee-30),je=2*Math.PI/h.length,pe=D.a().padAngle(.1).innerRadius(be/2.9).outerRadius(be/2).startAngle((function(e){return(e-.5)*je})).endAngle((function(e){return(e+.5)*je})).cornerRadius(be),ge=h.map((function(e,t){return pe(t)})),me=function(e){se.loaded&&(de?fe({type:"reset"}):Object(F.b)().then((function(){return fe({type:"play",notes:e})})))},ve=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;return e.reduce((function(e,t){return e.concat(e[e.length-1]+t)}),[t])}(Q,d),Oe=ve.map((function(e){return e%h.length})),ye=h.map((function(e,t){return Oe.includes(t)})),we=ye.map((function(e,t){return se.loaded&&se.notesToPlay.length>0&&y(se.notesToPlay[0])===t?g:e?j:p})),xe=Object(J.a)(v(Object(J.a)(ye,we).map((function(e,t){var n=Object(l.a)(e).slice(0);return[t].concat(Object(o.a)(n))})),d-n),ge),ke=h.map((function(e){return e.sharp===e.flat?e.sharp:"".concat(e.sharp,"/").concat(e.flat).replace(/(\w)#/,"$1\u266f").replace(/(\w)b/,"$1\u266d")})),Ne=v(Object(J.a)(ke,we),d);return Object(a.jsxs)("div",{className:"container",style:{"--s":"".concat(be,"px"),"--m":h.length},children:[Object(a.jsxs)("div",{className:"buttons",children:[Object(a.jsx)("button",{className:"button",onClick:function(){b(m(h.length)),c(0),me([])},children:"Randomize Root"}),Object(a.jsx)("button",{className:"button",onClick:function(){var e=x(I,z,R);null===e?alert("No valid scale"):U(e)},children:"Randomize Scale"}),Object(a.jsx)("button",{className:"button",onClick:function(){var e=B(Q),t=x(e,z,R);if(null!==t)return U(t);alert("No valid adjacent scale"),console.log(Q)},children:"Random adjacent Scale"}),Object(a.jsx)("button",{className:"button",onClick:function(){return me(ve)},"aria-pressed":de,children:de?"Pause":"Play"}),Object(a.jsx)("span",{className:"static",children:"Click on a note or shift-click on a yellow note."}),Object(a.jsx)($,{value:P,setValue:C}),Object(a.jsx)("span",{className:"static",children:"Probability of consecutive half-steps"}),Object(a.jsx)(W,{value:R,setValue:T}),Object(a.jsx)("span",{className:"static",children:"Probability of augmented 2nd"}),Object(a.jsx)(W,{value:z,setValue:q})]}),Object(a.jsxs)(H.a.div,{className:"necklace",style:{"--r":ie.interpolate((function(e){return-e}))},children:[xe.map((function(e,t){var r=Object(f.a)(e,2),u=Object(f.a)(r[0],3),i=u[0],o=u[1],l=u[2],s=r[1];return Object(a.jsx)("svg",{className:"svg",style:{"--c":l},children:Object(a.jsx)("path",{className:"path",stroke:l,d:s,"aria-labelledby":"note".concat(i),role:"button",tabIndex:0,onClick:function(){var e=y(n+(i-d));P?b(i):o&&(c(e),U(v(Q,Oe.indexOf(i))))}})},t)})),Object(a.jsx)(H.a.div,{className:"note-names",style:{"--a":ue.interpolate((function(e){return d-e}))},children:Ne.map((function(e,t){var n=Object(f.a)(e,2),c=n[0],r=n[1];return Object(a.jsx)("span",{style:{"--i":t,"--c":r},id:"note".concat(d+t),children:c},t)}))})]})]})}var G=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,125)).then((function(t){var n=t.getCLS,a=t.getFID,c=t.getFCP,r=t.getLCP,u=t.getTTFB;n(e),a(e),c(e),r(e),u(e)}))};i.a.render(Object(a.jsx)(r.a.StrictMode,{children:Object(a.jsx)(q,{})}),document.getElementById("root")),G()}},[[124,1,2]]]);
//# sourceMappingURL=main.8643ce48.chunk.js.map