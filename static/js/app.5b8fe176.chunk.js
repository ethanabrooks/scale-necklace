(this.webpackJsonp=this.webpackJsonp||[]).push([[0],{62:function(t,e,a){"use strict";a.d(e,"a",(function(){return C}));var n=a(21),r=a.n(n),c=a(43),l=a.n(c),o=a(14),s=a.n(o),i=a(0),u=a.n(i),f=a(36),h=a(20),p=a(29),d=a(4),b=a(15),g=[{sharp:"c",flat:"c"},{sharp:"c#",flat:"db"},{sharp:"d",flat:"d"},{sharp:"d#",flat:"eb"},{sharp:"e",flat:"e"},{sharp:"f",flat:"f"},{sharp:"f#",flat:"gb"},{sharp:"g",flat:"g"},{sharp:"g#",flat:"ab"},{sharp:"a",flat:"a"},{sharp:"a#",flat:"bb"},{sharp:"b",flat:"b"}],y=g.length;function m(t){return t<=1?[]:Object(b.flatten)([O(t-1).map((function(t){return{head:[1],tail:t}})),O(t-2).map((function(t){return{head:[1,1],tail:t}}))]).map((function(t){return{tag:"A",scale:t}}))}function O(t){return t<=0?[]:Object(b.flatten)([m(t-3).map((function(t){return{head:[3],tail:t}})),P(t-2).map((function(t){return{head:[2],tail:t}})),P(t-5).map((function(t){return{head:[2,3],tail:t}}))]).map((function(t){return{tag:"B",scale:t}}))}function P(t){return t<0?[]:0==t?[{tag:"C",scale:null}]:Object(b.flatten)([m(t),O(t)]).map((function(t){return{tag:"C",scale:t}}))}function j(t){var e=t.scale.head;return null===t.scale.tail?e:e.concat(v(t.scale.tail))}function v(t){var e=t.scale.head;switch(t.scale.tail.tag){case"A":return e.concat(j(t.scale.tail));case"C":return e.concat(w(t.scale.tail))}}function w(t){if(null===t.scale)return[];switch(t.scale.tag){case"A":return j(t.scale);case"B":return v(t.scale)}}var E=P(y).map(w),k=a(2).a.create({container:{flex:1,height:"100%"},button:{flex:1,width:"100%"},necklace:{flex:3,width:"100%",alignItems:"center"}}),I=a(31);function M(t,e){var a=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),a.push.apply(a,n)}return a}function T(t){for(var e=1;e<arguments.length;e++){var a=null!=arguments[e]?arguments[e]:{};e%2?M(Object(a),!0).forEach((function(e){r()(t,e,a[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(a)):M(Object(a)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(a,e))}))}return t}function x(t){return Math.floor(Math.random()*t)}function C(){var t=u.a.useState(E[0]),e=s()(t,2),a=e[0],n=e[1],r=u.a.useState(0),c=s()(r,2),o=c[0],b=c[1],m=Object(i.useState)({loaded:!1}),O=s()(m,2),P=O[0],j=O[1],v=P.loaded&&P.notesToPlay.length>0;Object(i.useEffect)((function(){Object(I.c)().then((function(){var t=(new I.a).toDestination();j({loaded:!0,synth:t,notesToPlay:[]})}))}),[j]),Object(i.useEffect)((function(){if(P.loaded){var t=l()(P.notesToPlay),e=t[0],a=t.slice(1);if(v){I.b.resume().then((function(){var t=g[e%y];return P.synth.triggerAttack(""+t.sharp+(e<y?3:4))}));var n=setInterval((function(){j(T(T({},P),{},{notesToPlay:a}))}),200);return function(){P.synth.triggerRelease(),clearInterval(n)}}}}),[P]);var w=a.reduce((function(t,e){return t.concat(t[t.length-1]+e)}),[o]),M=P.loaded?u.a.createElement(f.a,{title:v?"Pause":"Play",onPress:function(){j(T(T({},P),{},{notesToPlay:v?[]:w}))}}):u.a.createElement(h.a,null,"loading..."),C=u.a.createElement(f.a,{title:"Randomize Root",onPress:function(){return b(x(y))}}),D=u.a.createElement(d.a,{style:{flex:1,width:500}},g.map((function(t,e){var a,r,c=2*Math.PI*e/y-Math.PI/2,l=(500*(1+Math.cos(c))-500/6)/2,s=500*(1+Math.sin(c))/2,i=((e+o)%(a=y)+a)%a,f=g[i],d=w.map((function(t){return t%y}));return r=P.loaded&&P.notesToPlay[0]%y==i?"#2F4F4F":d.includes(i)?"grey":"lightgrey",u.a.createElement(p.a,{style:{width:500/6,height:500/6,position:"absolute",left:l,top:s,backgroundColor:r,borderRadius:50,alignItems:"center",justifyContent:"center"},onPress:function(){b(i),n(E[x(E.length)])},key:e},u.a.createElement(h.a,{style:{color:"white"}},f.sharp==f.flat?f.sharp:f.sharp+"/"+f.flat))})));return u.a.createElement(d.a,{style:k.container},u.a.createElement(d.a,{style:k.button},C,M),u.a.createElement(d.a,{style:k.necklace},D))}},63:function(t,e,a){t.exports=a(83)}},[[63,1,2]]]);
//# sourceMappingURL=app.5b8fe176.chunk.js.map