(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{111:function(e,t,n){},123:function(e,t,n){"use strict";n.r(t);var s=n(0),a=n.n(s),r=n(72),c=n.n(r),l=(n(111),n(17),n(112),n(68),n(69),n(13)),o=n.n(l),i=(n(120),n(63),n(121),n(24)),u=n.n(i),m=n(73),d=n.n(m),f=n(74);function h(e,t){return e===t?0!==e||0!==t||1/e===1/t:e!==e&&t!==t}n.n(f).a;function p(e){e.__$isProvider||d()(!1)}function E(e){const t=()=>"function"===typeof e?e():e,n=a.a.createContext({state:t()}),s=a.a.createContext({}),r=class extends a.a.Component{constructor(...e){super(...e),u()(this,"_listeners",[]),u()(this,"__$isProvider",!0),u()(this,"state",this.props.initialValue||t())}getSubscribeCount(){return this._listeners.length}getState(){return this.state}setState(e,t){const n=this.state;super.setState(e,()=>{this._listeners.forEach(e=>{e(n,this.state)}),t&&t()})}subscribe(e){return this._listeners.push(e),()=>{const t=this._listeners.indexOf(e);t>-1&&this._listeners.splice(t,1)}}componentWillUnmount(){this._listeners.length=0}render(){return a.a.createElement(s.Provider,{value:this.state},a.a.createElement(n.Provider,{value:this},this.props.children))}},c=function(){const e=a.a.useContext(n);return p(e),e};return{Context:s,Provider:r,Consumer:function(e){const t=a.a.useContext(n);p(t);const s=a.a.useState(t.state),r=o()(s,2),c=r[0],l=r[1];return p(t),a.a.useEffect(()=>t.subscribe((e,t)=>{l(t)})),e.children(c)},useProvider:c,useStore:c,useState:function(){const e=a.a.useContext(n);p(e);const t=a.a.useState(e.state),s=o()(t,2),r=s[0],c=s[1];return a.a.useEffect(()=>e.subscribe((e,t)=>{c(t)})),r},useSelector:function(e){const t=a.a.useContext(n);p(t);const s=a.a.useState(e(t.state)),r=o()(s,2),c=r[0],l=r[1];return a.a.useEffect(()=>t.subscribe((t,n)=>{const s=e(n);(function(e,t){if(h(e,t))return!0;if("object"!==typeof e||null===e||"object"!==typeof t||null===t)return!1;const n=Object.keys(e),s=Object.keys(t);if(n.length!==s.length)return!1;for(let a=0;a<n.length;a++)if(!Object.prototype.hasOwnProperty.call(t,n[a])||!h(e[n[a]],t[n[a]]))return!1;return!0})(c,s)||l(s)})),c},useUpdate:function(){const e=a.a.useContext(n);return p(e),a.a.useCallback(t=>{e.setState(t)},[e])}}}var v=E(()=>({items:[{title:"demo1",desc:"test"}]}));function b(){const e=v.useUpdate(),t=[...v.useSelector(e=>e.items)];return a.a.createElement(a.a.Fragment,null,t.length?null:a.a.createElement("div",{className:"item"},"no data."),t.map((n,s)=>a.a.createElement("div",{key:s,className:"item"},a.a.createElement("div",{className:"title"},n.title),a.a.createElement("div",{className:"desc"},n.desc),a.a.createElement("div",{className:"remove",onClick:()=>{t.splice(s,1),e({items:t})}},"Remove"))))}function C(){const e=v.useUpdate();return a.a.createElement(a.a.Fragment,null,a.a.createElement("button",{onClick:()=>e(e=>({items:[...e.items,{title:"demo_"+Date.now(),desc:"test"}]}))},"Add"))}function S(){const e=v.useState();return a.a.createElement("div",{className:"total"},e.items.length," total")}function g(e){let t=a.a.useState(0),n=o()(t,2),s=n[0],r=n[1];return a.a.useEffect(()=>{r(s+1)},[e]),a.a.createElement(a.a.Fragment,null,s)}class x extends a.a.Component{render(){return a.a.createElement("div",{className:"todo-list"},a.a.createElement(v.Provider,null,a.a.createElement(C,null),a.a.createElement("button",{onClick:()=>this.forceUpdate()},"Refresh")," ",a.a.createElement(g,null),a.a.createElement(S,null),a.a.createElement(b,null)))}}var _=x;function k(){return a.a.createElement("div",{className:"main"},a.a.createElement(_,null),a.a.createElement(_,null))}c.a.render(a.a.createElement(k,null),document.getElementById("root"))},75:function(e,t,n){n(76),e.exports=n(123)}},[[75,1,2]]]);