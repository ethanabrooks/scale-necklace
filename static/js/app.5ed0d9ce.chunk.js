(this.webpackJsonp=this.webpackJsonp||[]).push([[0],{64:function(t,e,n){"use strict";n.d(e,"a",(function(){return D}));var a=n(21),r=n.n(a),c=n(42),l=n.n(c),o=n(11),u=n.n(o),i=n(0),s=n.n(i),f=n(31),h=n(20),p=n(29),g=n(4),b=n(63),d=n(15),m=[{sharp:"c",flat:"c"},{sharp:"c#",flat:"db"},{sharp:"d",flat:"d"},{sharp:"d#",flat:"eb"},{sharp:"e",flat:"e"},{sharp:"f",flat:"f"},{sharp:"f#",flat:"gb"},{sharp:"g",flat:"g"},{sharp:"g#",flat:"ab"},{sharp:"a",flat:"a"},{sharp:"a#",flat:"bb"},{sharp:"b",flat:"b"}];function y(t){return t<=1?[]:Object(d.flatten)([O(t-1).map((function(t){return{head:[1],tail:t}})),O(t-2).map((function(t){return{head:[1,1],tail:t}}))]).map((function(t){return{tag:"A",scale:t}}))}function O(t){return t<=0?[]:Object(d.flatten)([y(t-3).map((function(t){return{head:[3],tail:t}})),P(t-2).map((function(t){return{head:[2],tail:t}})),P(t-5).map((function(t){return{head:[2,3],tail:t}}))]).map((function(t){return{tag:"B",scale:t}}))}function P(t){return t<0?[]:0==t?[{tag:"C",scale:null}]:Object(d.flatten)([y(t),O(t)]).map((function(t){return{tag:"C",scale:t}}))}function v(t){var e=t.scale.head;return null===t.scale.tail?e:e.concat(j(t.scale.tail))}function j(t){var e=t.scale.head;switch(t.scale.tail.tag){case"A":return e.concat(v(t.scale.tail));case"C":return e.concat(w(t.scale.tail))}}function w(t){if(null===t.scale)return[];switch(t.scale.tag){case"A":return v(t.scale);case"B":return j(t.scale)}}var E=P(m.length).map(w),M=n(2).a.create({container:{flex:1,height:"100%"},button:{flex:1,width:"100%"},necklace:{flex:3,width:"100%",alignItems:"center"}}),k=n(62),I=n(59);function S(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(t);e&&(a=a.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,a)}return n}function x(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?S(Object(n),!0).forEach((function(e){r()(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):S(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function R(t){return Math.floor(Math.random()*t)}function C(t,e){return t.slice(e).concat(t.slice(0,e))}function D(){var t=s.a.useState(E[0]),e=u()(t,2),n=e[0],a=e[1],r=s.a.useState(0),c=u()(r,2),o=c[0],d=c[1],y=Object(i.useState)({loaded:!1}),O=u()(y,2),P=O[0],v=O[1],j=function(t,e){var n=s.a.useRef(null);if(null==n.current)return n.current=t,t;var a=Math.round((n.current-t)/e)*e+t;return n.current=a,a}(o,m.length),w=P.loaded&&P.notesToPlay.length>0;Object(i.useEffect)((function(){var t=(new k.a).toDestination();v({loaded:!0,synth:t,notesToPlay:[]})}),[v]),Object(i.useEffect)((function(){if(P.loaded){var t=l()(P.notesToPlay),e=t[0],n=t.slice(1);if(w){var a,r=m[e%m.length];return P.synth.triggerAttack(""+r.sharp+(e<m.length?3:4)),a=setInterval((function(){v(x(x({},P),{},{notesToPlay:n}))}),300),function(){P.synth.triggerRelease(),a&&clearInterval(a)}}}}),[P]);var S=n.reduce((function(t,e){return t.concat(t[t.length-1]+e)}),[o]),D=P.loaded?s.a.createElement(f.a,{title:w?"Pause":"Play",onPress:function(){v(x(x({},P),{},{notesToPlay:w?[]:S}))}}):s.a.createElement(h.a,null,"loading..."),T=s.a.createElement(f.a,{title:"Randomize Root",onPress:function(){return d(R(m.length))}}),A=s.a.createElement(f.a,{title:"Randomize Scale",onPress:function(){var t=E[R(E.length)];a(C(t,R(t.length)))}}),z=C(m,o),B={r:128,g:128,b:128},J={r:211,g:211,b:211},K=z.map((function(t,e){return S.includes(e+o)?B:J})),q=s.a.createElement(g.a,{style:{flex:1,width:500}},z.map((function(t,e){return s.a.createElement(I.Spring,{to:{root:j},config:{tension:40},key:e},(function(r){var c,l=2*Math.PI*(e+(o-r.root))/m.length-Math.PI/2,i=(500*(1+Math.cos(l))-500/6)/2,f=500*(1+Math.sin(l))/2,g=((l/(2*Math.PI)+1/4)%(c=1)+c)%c*m.length,y=Math.floor(g),O=Math.ceil(g),P=g-y,v=K[y%K.length],j=K[O%K.length],w=function(t){return[t.r,t.g,t.b]},E=function(t){var e=u()(t,3);return{r:e[0],g:e[1],b:e[2]}}(Object(b.a)(w(v),w(j),(function(t,e){return(1-P)*t+P*e}))),M=e+o;return s.a.createElement(p.a,{style:{width:500/6,height:500/6,position:"absolute",left:i,top:f,backgroundColor:"rgb("+E.r+","+E.g+","+E.b+")",borderRadius:50,alignItems:"center",justifyContent:"center"},onPress:function(t){if(t.shiftKey){var e=S.map((function(t){return t%m.length}));e.includes(M)&&(a(C(n,e.indexOf(M))),d(M%m.length))}else d(M%m.length)},key:e},s.a.createElement(h.a,{style:{color:"white"}},t.sharp==t.flat?t.sharp:t.sharp+"/"+t.flat))}))})));return s.a.createElement(g.a,{style:M.container},s.a.createElement(g.a,{style:M.button},T,A,D),s.a.createElement(g.a,{style:M.necklace},q))}},65:function(t,e,n){t.exports=n(87)}},[[65,1,2]]]);
//# sourceMappingURL=app.5ed0d9ce.chunk.js.map