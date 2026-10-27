const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'../dist');
const translations=fs.readFileSync(path.join(root,'translations.js'),'utf8');
const script=fs.readFileSync(path.join(root,'i18n.js'),'utf8');
function setup({stored,preferred=['en-US'],search='',blocked=false}={}) {
 const listeners={},events=[];
 const heading={dataset:{i18n:'Find walking route'},textContent:''};
 const option={dataset:{i18n:'Home / stay'},value:'Home / stay',textContent:''};
 const placeholder={getAttribute:()=> 'Where would you like to go?',setAttribute:(k,v)=>placeholder[k]=v};
 const select={value:'',addEventListener:(name,fn)=>listeners[name]=fn};
 const values=new Map(stored?[['km-language',stored]]:[]);
 const document={documentElement:{lang:'en'},getElementById:()=>select,querySelectorAll:q=>q==='[data-i18n]'?[heading,option]:q==='[data-i18n-placeholder]'?[placeholder]:[],dispatchEvent:e=>events.push(e.type)};
 const context={window:{},document,navigator:{languages:preferred},location:{search,href:'https://example.test/'+search},localStorage:{getItem:k=>{if(blocked)throw Error();return values.get(k)},setItem:(k,v)=>{if(blocked)throw Error();values.set(k,v)}},URL,URLSearchParams,CustomEvent:class{constructor(type){this.type=type}},history:{replaceState:(a,b,url)=>context.newURL=String(url)}};
 vm.createContext(context);vm.runInContext(translations,context);vm.runInContext(script,context);
 return {context,heading,option,placeholder,values,events,change:lang=>listeners.change({target:{value:lang}})};
}
test('all eight dictionaries have matching, nonempty keys and interpolation tokens',()=>{
 const {context}=setup();const d=context.window.KM_TRANSLATIONS,keys=Object.keys(d.en).sort();assert.equal(Object.keys(d).length,8);
 for(const [lang,entries] of Object.entries(d)){
  assert.deepEqual(Object.keys(entries).sort(),keys,lang);
  for(const key of keys){assert.ok(entries[key].trim(),lang+': '+key);assert.deepEqual((entries[key].match(/\{\w+\}/g)||[]).sort(),(key.match(/\{\w+\}/g)||[]).sort());}
 }
});
test('browser preference, saved choice and shared-link language have correct precedence',()=>{
 assert.equal(setup({preferred:['fr','ta-IN']}).context.window.KM.language,'ta');
 assert.equal(setup({stored:'mr',preferred:['hi']}).context.window.KM.language,'mr');
 assert.equal(setup({stored:'mr',search:'?lang=bn'}).context.window.KM.language,'bn');
 assert.equal(setup({stored:'unsupported',preferred:['fr']}).context.window.KM.language,'en');
});
test('switching every language updates text, placeholders and document language, preserving tag IDs',()=>{
 const s=setup();
 for(const lang of Object.keys(s.context.window.KM_TRANSLATIONS)){
  s.change(lang);const d=s.context.window.KM_TRANSLATIONS[lang];
  assert.equal(s.context.document.documentElement.lang,lang);
  assert.equal(s.heading.textContent,d['Find walking route']);
  assert.equal(s.placeholder.placeholder,d['Where would you like to go?']);
  assert.equal(s.option.value,'Home / stay');
  assert.equal(s.option.textContent,d['Home / stay']);
  assert.equal(s.values.get('km-language'),lang);
  assert.equal(s.events.at(-1),'km:languagechange');
 }
});
test('shared-link language changes survive reload without losing coordinates',()=>{
 const s=setup({search:'?lat=20&lon=73&lang=hi'});s.change('kn');const u=new URL(s.context.newURL);assert.equal(u.searchParams.get('lat'),'20');assert.equal(u.searchParams.get('lon'),'73');assert.equal(u.searchParams.get('lang'),'kn');
});
test('blocked local storage does not stop switching or translation',()=>{
 const s=setup({blocked:true});s.change('gu');assert.equal(s.context.window.KM.language,'gu');assert.equal(s.heading.textContent,s.context.window.KM_TRANSLATIONS.gu['Find walking route']);
});
test('all static and explicit dynamic translation keys exist, including accessible attributes',()=>{
 const {context}=setup();const keys=context.window.KM_TRANSLATIONS.en;
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 for(const match of html.matchAll(/data-i18n(?:-placeholder|-title|-aria-label)?="([^"]+)"/g))assert.ok(keys[match[1].replaceAll('&amp;','&')],match[1]);
 const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
 for(const match of app.matchAll(/\bt\('([^']+)'/g))assert.ok(keys[match[1]],match[1]);
 assert.ok(!context.window.KM.t('Mapped essentials: {count}. Check availability locally.',{count:7}).includes('{count}'));
});
