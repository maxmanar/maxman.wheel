'use strict';
'use strict';
const Game = (() => {
  const statusNames = {pending:'بانتظار الإجابة',answered:'أجاب عن السؤال',incorrect:'إجابة غير صحيحة',unknown:'لم يعرف الإجابة',timed_out:'انتهى الوقت',skipped:'تخطّى السؤال',answer_shown:'أُظهرت الإجابة'};
  const digits = value => String(value ?? '').replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).trim();
  function count(value,max){const s=digits(value);if(!/^\d+$/.test(s))return null;const n=Number(s);return Number.isSafeInteger(n)&&n>=1&&n<=max?n:null}
  function validOptions(q){return Array.isArray(q.options)&&q.options.length===4&&q.options.every(x=>typeof x==='string'&&x.trim())&&new Set(q.options).size===4&&q.options.includes(q.answer)}
  function shuffledOptions(q){
    if(!validOptions(q))return [];
    const options=q.options.slice();
    for(let i=options.length-1;i>0;i--){const j=randomIndex(i+1);[options[i],options[j]]=[options[j],options[i]]}
    return options;
  }
  function fresh(bank){return {national:true,normal:[],numbers:[],questions:bank.slice(0,50),roundNumbers:[],roundQuestionIds:bank.slice(0,50).map(q=>q.id),history:[],config:{duration:5,time:30,sound:true,confetti:true},questionCount:50,usedQuestionIds:[],participants:[],activeParticipantId:null,attempts:[],currentAttemptId:null}}
  function restore(saved,bank){
    const s=fresh(bank);if(!saved||typeof saved!=='object')return s;
    const hasId=x=>x&&typeof x==='object'&&(typeof x.id==='string'||typeof x.id==='number')&&String(x.id).length>0;
    const unique=rows=>{const seen=new Set();return rows.filter(x=>{if(seen.has(x.id))return false;seen.add(x.id);return true})};
    for(const key of ['normal','numbers'])if(Array.isArray(saved[key]))s[key]=unique(saved[key].filter(x=>hasId(x)&&typeof x.text==='string'&&x.text.trim()).map(x=>({...x,id:String(x.id)})));
    // Upgrade unasked built-in questions; keep historical wording and results intact.
    if(Array.isArray(saved.questions))s.questions=unique(saved.questions.filter(x=>hasId(x)&&typeof x.question==='string'&&typeof x.answer==='string').map(x=>({...x,...bank.find(q=>q.id===String(x.id)),id:String(x.id)})));
    if(Array.isArray(saved.participants))s.participants=unique(saved.participants.filter(p=>hasId(p)&&typeof p.label==='string').map(p=>({...p,id:String(p.id),key:participantKey(p.label)})));
    if(Array.isArray(saved.attempts))s.attempts=unique(saved.attempts.filter(a=>hasId(a)&&s.participants.some(p=>p.id===String(a.participantId))&&typeof a.question==='string'&&typeof a.answer==='string'&&Object.hasOwn(statusNames,a.outcome)&&Number.isFinite(a.startedAt)&&Number.isFinite(a.deadline)&&a.deadline>a.startedAt).map(a=>({...a,id:String(a.id),participantId:String(a.participantId),questionId:String(a.questionId),answerRevealed:a.answerRevealed===true})));
    s.attempts.forEach(a=>{
      if(!validOptions(a)){
        const q=bank.find(q=>q.id===a.questionId&&q.answer===a.answer);
        a.options=q?shuffledOptions(q):[];
      }
      a.selectedAnswer=validOptions(a)&&a.options.includes(a.selectedAnswer)?a.selectedAnswer:null;
    });
    if(Array.isArray(saved.history))s.history=saved.history.filter(h=>h&&typeof h==='object'&&typeof h.text==='string').map(h=>({...h,time:typeof h.time==='string'?h.time:'',type:typeof h.type==='string'?h.type:'اختيار',participantId:h.participantId==null?null:String(h.participantId),attemptId:h.attemptId==null?null:String(h.attemptId)}));
    s.national=typeof saved.national==='boolean'?saved.national:true;
    s.config={...s.config,...saved.config};s.config.time=Math.max(5,count(s.config.time,120)||30);s.config.duration=[3,5,8,10].includes(Number(s.config.duration))?Number(s.config.duration):5;
    s.config.sound=typeof s.config.sound==='boolean'?s.config.sound:true;s.config.confetti=typeof s.config.confetti==='boolean'?s.config.confetti:true;
    s.questionCount=count(saved.questionCount,bank.length)||50;
    if(Array.isArray(saved.usedQuestionIds))s.usedQuestionIds=[...new Set(saved.usedQuestionIds.filter(id=>typeof id==='string'||typeof id==='number').map(String))];
    else{const old=new Set(s.history.filter(h=>h.type==='سؤال').map(h=>h.text));s.usedQuestionIds=bank.filter(q=>old.has(q.question)&&!s.questions.some(x=>x.id===q.id)).map(q=>q.id)}
    s.activeParticipantId=s.participants.some(p=>p.id===String(saved.activeParticipantId))?String(saved.activeParticipantId):null;
    s.currentAttemptId=s.attempts.some(a=>a.id===String(saved.currentAttemptId))?String(saved.currentAttemptId):null;
    // Preserve the full round independently of the selection history.
    const priorNumbers=Array.isArray(saved.roundNumbers)?saved.roundNumbers.filter(x=>hasId(x)&&typeof x.text==='string'&&x.text.trim()).map(x=>({...x,id:String(x.id)})):s.participants.map(p=>({id:'restored-'+p.id,text:p.label}));
    s.roundNumbers=mergeNumbers(priorNumbers,s.numbers);
    if(!Array.isArray(saved.roundNumbers))s.roundNumbers.sort((a,b)=>a.text.localeCompare(b.text,'ar',{numeric:true}));
    const priorQuestions=Array.isArray(saved.roundQuestionIds)?saved.roundQuestionIds: [...s.questions.map(q=>q.id),...s.usedQuestionIds];
    const knownIds=new Set(bank.map(q=>q.id));
    s.roundQuestionIds=[...new Set([...priorQuestions,...s.questions.map(q=>q.id)].map(String).filter(id=>knownIds.has(id)))];
    if(!s.roundQuestionIds.length)s.roundQuestionIds=bank.slice(0,s.questionCount).map(q=>q.id);
    return s;
  }
  function participantKey(value){return digits(value).replace(/^رقم\s*/, '').replace(/\s+/g,' ').toLowerCase()}
  function mergeNumbers(...lists){const seen=new Set();return lists.flat().filter(x=>{const k=participantKey(x.text);if(seen.has(k))return false;seen.add(k);return true}).map(x=>({...x}))}
  function resetParticipant(s,participantId){
    if(!s.participants.some(p=>p.id===participantId))return false;
    const removed=new Set(s.attempts.filter(a=>a.participantId===participantId).map(a=>a.id));
    s.attempts=s.attempts.filter(a=>a.participantId!==participantId);
    s.history=s.history.filter(h=>!removed.has(h.attemptId)&&!(h.participantId===participantId&&h.type==='سؤال'));
    if(removed.has(s.currentAttemptId))s.currentAttemptId=null;
    return true;
  }
  function clearCompetition(s,bank){
    s.normal=[];s.numbers=[];s.roundNumbers=[];s.participants=[];
    s.attempts=[];s.history=[];s.activeParticipantId=null;s.currentAttemptId=null;
    s.usedQuestionIds=[];s.questions=bank.slice(0,s.questionCount);
    s.roundQuestionIds=s.questions.map(q=>q.id);
  }
  const active=s=>s.participants.find(p=>p.id===s.activeParticipantId)||null;
  const current=s=>s.attempts.find(a=>a.id===s.currentAttemptId)||null;
  function select(s,item,uid){const key=participantKey(item.text);let p=s.participants.find(p=>p.key===key);if(!p){p={id:uid(),key,label:item.text};s.participants.push(p)}s.activeParticipantId=p.id;return p}
  function additions(bank,s,value){const n=count(value,bank.length);if(n===null)return null;const blocked=new Set([...s.questions.map(q=>q.id),...s.usedQuestionIds]);return bank.filter(q=>!blocked.has(q.id)).slice(0,n)}
  function expire(a,now){if(a&&a.outcome==='pending'&&now>=a.deadline){a.outcome='timed_out';a.finishedAt=a.deadline;return true}return false}
  function start(s,q,now,uid){const p=active(s);if(!p)throw Error('Choose a participant first');const previous=current(s);if(previous&&previous.outcome==='pending')throw Error('Finish the current question first');const a={id:uid(),participantId:p.id,questionId:q.id,question:q.question,answer:q.answer,category:q.category||'',options:shuffledOptions(q),selectedAnswer:null,startedAt:now,deadline:now+s.config.time*1000,finishedAt:null,outcome:'pending',answerRevealed:false};s.attempts.push(a);s.currentAttemptId=a.id;if(!s.usedQuestionIds.includes(q.id))s.usedQuestionIds.push(q.id);return a}
  function choose(a,answer,now){
    expire(a,now);
    if(!a||a.outcome!=='pending'||a.answerRevealed||!validOptions(a)||!a.options.includes(answer))return false;
    a.selectedAnswer=answer;a.answerRevealed=true;
    a.outcome=answer===a.answer?'answered':'incorrect';a.finishedAt=now;
    return true;
  }
  function finish(a,outcome,now){if(!a||!['answered','unknown','skipped'].includes(outcome))return false;expire(a,now);if(a.outcome!=='pending'&&!(a.outcome==='answer_shown'&&outcome==='answered'))return false;a.outcome=outcome;a.finishedAt=now;return true}
  function reveal(a,now){if(!a)return;expire(a,now);a.answerRevealed=true;if(a.outcome==='pending'){a.outcome='answer_shown';a.finishedAt=now}}
  function stats(s,id){const result={total:0,pending:0,answered:0,incorrect:0,unknown:0,timed_out:0,skipped:0,answer_shown:0};s.attempts.filter(a=>a.participantId===id).forEach(a=>{result.total++;if(a.outcome in result)result[a.outcome]++});return result}
  return {statusNames,digits,count,validOptions,fresh,restore,participantKey,mergeNumbers,resetParticipant,clearCompetition,active,current,select,additions,expire,start,choose,finish,reveal,stats};
})();

'use strict';
const $=id=>document.getElementById(id),ar=n=>Number(n).toLocaleString('ar-SA');
function readStored(name){try{return JSON.parse(localStorage.getItem(name))}catch{return null}}
function loadSavedState(){
 const current=readStored('izzna-wheel-v1');if(current&&typeof current==='object'&&!Array.isArray(current))return current;
 // Import the original GitHub app's data when upgrading on the same domain.
 const names=readStored('national_wheel_numbers'),normal=readStored('maxman_wheel_items'),questions=readStored('national_wheel_questions'),history=readStored('national_wheel_history'),config=readStored('national_wheel_config');
 if(![names,normal,questions,history].some(Array.isArray)&&!config)return null;
 const legacy={national:readStored('maxman_wheel_mode')!==false,questionCount:readStored('national_wheel_question_count')||50};
 if(Array.isArray(names))legacy.numbers=names;if(Array.isArray(normal))legacy.normal=normal;if(Array.isArray(questions))legacy.questions=questions;
 if(Array.isArray(history))legacy.history=history.filter(h=>h&&typeof h.itemText==='string').map(h=>({text:h.itemText,time:h.timestamp||'',type:h.wheelType==='questions'?'سؤال':'اختيار',participantId:null,attemptId:null}));
 if(config&&typeof config==='object')legacy.config={duration:config.spinDuration,time:config.questionTimer,sound:config.soundEnabled,confetti:config.confettiEnabled};
 return legacy;
}
let saved=loadSavedState();
let state=Game.restore(saved,DEFAULT_QUESTIONS),tab='numbers',spinning=false,rotation=0,timer=null,audio=null,resultKind=null;
let spinRun=null,frameId=null,confirmAction=null;
const uid=()=>globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random()}`;
const key=()=>!state.national?'normal':tab,items=()=>state[key()],textOf=x=>x.text??x.question;
const current=()=>Game.current(state),active=()=>Game.active(state);
const participantLabel=p=>/^\d+$/.test(p.key)?'الرقم '+ar(p.key):p.label;
const personSummary=p=>{const n=Game.stats(state,p.id);return 'أجاب عن '+ar(n.answered)+' من '+ar(n.total)+' سؤالًا · أخطأ '+ar(n.incorrect)+' · لم يعرف '+ar(n.unknown)+' · انتهى الوقت '+ar(n.timed_out)+' · تخطّى '+ar(n.skipped)};
function save(){
 try{localStorage.setItem('izzna-wheel-v1',JSON.stringify(state));$('storage-status').hidden=true;return true}
 catch{$('storage-status').hidden=false;$('storage-status').textContent='تعذّر حفظ التغييرات في هذا المتصفح. تسري في الجلسة الحالية فقط.';return false}
}
function notice(message){$('status').textContent=message}
// Use an in-page dialog: native confirm() can be blocked inside file previews.
function askConfirm(title,message,action){
 if(spinning||$('confirm-dialog').open)return;
 $('confirm-title').textContent=title;$('confirm-message').textContent=message;
 confirmAction=action;showDialog('confirm-dialog');$('confirm-cancel').focus();
}
function dismissConfirm(){confirmAction=null;$('confirm-dialog').close()}
$('confirm-cancel').onclick=dismissConfirm;
$('confirm-dialog').addEventListener('cancel',e=>{e.preventDefault();dismissConfirm()});
$('confirm-accept').onclick=()=>{const action=confirmAction;dismissConfirm();if(!spinning)action?.()};
function availableQuestions(){return Game.additions(DEFAULT_QUESTIONS,state,150).length}
function render(){
 const national=state.national,isQ=key()==='questions',p=active();
 document.body.classList.toggle('normal',!national);$('national').classList.toggle('active',national);$('normal').classList.toggle('active',!national);
 $('slogan').innerHTML=national?'عزّنا <em>بطبعنا.</em>':'اختيار واحد، <em>حماس للجميع.</em>';
 document.querySelector('.banner .eyebrow').textContent=national?'اليوم الوطني السعودي السادس والتسعون · ٢٣ سبتمبر':'عجلة المسابقات';
 $('intro').textContent=national?'شاهد عرض الوطن، ثم انطلق إلى المسابقة.':'شاهد العرض، ثم أضف الأسماء وأطلق لحظة الاختيار.';
 $('questions-tab').hidden=!national;$('names-tab').classList.toggle('active',!isQ);$('questions-tab').classList.toggle('active',isQ);
 $('entries-title').textContent=isQ?'أسئلة الوطن':'المشاركون';$('list-label').textContent=isQ?'الأسئلة المتبقية':'قائمة المشاركين';
 $('names-controls').hidden=isQ;$('questions-controls').hidden=!isQ;$('remaining').textContent=ar(items().length)+(isQ?' سؤالًا متبقيًا':' مشاركًا');$('count').textContent=ar(items().length);
 $('sound').textContent='الصوت: '+(state.config.sound?'مفعّل':'مغلق');$('spin').disabled=!spinning&&(!items().length||(isQ&&!p));
 $('spin-label').textContent=spinning?'إيقاف واختيار':'أَدِر العجلة';$('spin-icon').textContent=spinning?'■':'↻';
 $('spin').classList.toggle('is-spinning',spinning);$('cancel-spin').hidden=!spinning;
 $('wheel').setAttribute('aria-label',isQ?'عجلة اختيار الأسئلة':'عجلة اختيار المشاركين');
 $('spin-hint').textContent=spinning?'يمكنك إيقاف العجلة للاختيار الآن، أو إلغاء الدوران دون تسجيل اختيار.':isQ?(p?'السؤال القادم لـ'+participantLabel(p)+'. اضغط «أَدِر العجلة» عندما تكون مستعدًا.':'اختر صاحب الرقم من عجلة الأرقام أولًا، ثم اختر سؤاله.'):national?'يُزال الرقم المختار من العجلة، ويمكنك متابعة أسئلته.':'يُزال الاسم المختار تلقائيًا لمنع التكرار.';
 ['national','normal','names-tab','questions-tab'].forEach(id=>$(id).setAttribute('aria-pressed',String($(id).classList.contains('active'))));
 $('owner-name').textContent=p?participantLabel(p):'اختر رقمًا أولًا';$('owner-stats').textContent=p?personSummary(p):'ثم انتقل إلى أسئلة الوطن.';$('owner-info').disabled=spinning||!p;
 const stats=p?Game.stats(state,p.id):{answered:0,total:0,unknown:0,incorrect:0,timed_out:0};
 stats.unknown+=stats.incorrect;
 [['owner-answered','answered'],['owner-total','total'],['owner-unknown','unknown'],['owner-timeout','timed_out']].forEach(([id,k])=>$(id).textContent=ar(stats[k]));
 $('session-participants').textContent=ar(state.participants.length);$('session-questions').textContent=ar(state.attempts.length);
 $('play-title').textContent=isQ?'عجلة أسئلة الوطن':'عجلة المشاركين';
 $('go-to-entries').hidden=spinning||isQ||items().length>0;
 $('entries').replaceChildren();
 if(!items().length){const li=document.createElement('li');li.className='empty';li.textContent=isQ?'القائمة فارغة. أضف أسئلة من البنك أو استعدها لجولة جديدة.':'أضف أسماء أو أرقامًا لبدء المسابقة.';$('entries').append(li)}
 items().forEach((item,i)=>{const li=document.createElement('li'),num=document.createElement('span'),label=document.createElement('span'),del=document.createElement('button');num.className='entry-index';num.textContent=ar(i+1);label.textContent=textOf(item);del.textContent='×';del.setAttribute('aria-label','حذف '+textOf(item));del.disabled=spinning;del.onclick=()=>{if(spinning)return;state[key()]=items().filter(x=>x.id!==item.id);save();render()};li.append(num,label,del);$('entries').append(li)});
 ['national','normal','names-tab','questions-tab','entry','number','restore','clear','question-count','question-number','add-questions','participants','history','settings','clear-participants','clear-competition'].forEach(id=>$(id).disabled=spinning);
 $('reset-owner').disabled=spinning||!p;
 $('reset-owner').title=p?'إعادة ضبط معلومات '+participantLabel(p):'اختر صاحب الدور من عجلة الأرقام أولًا';
 document.querySelectorAll('#names-controls button').forEach(b=>b.disabled=spinning);
 const available=availableQuestions();$('question-number-help').textContent='في العجلة '+ar(state.questions.length)+' سؤالًا · متاح للإضافة '+ar(available)+' من البنك الأصلي (١٥٠ سؤالًا).';
 draw();
}
function draw(){
 const ctx=$('wheel').getContext('2d'),n=items().length,cx=480,r=473,font=getComputedStyle(document.body).fontFamily;ctx.clearRect(0,0,960,960);
 const colors=state.national?['#075940','#e8efda','#9fc79d','#d5b565','#29765a','#bfdcae']:['#926747','#f3e1c8','#bd9472','#ddbc8c','#6a4934','#ceb69d'];
 if(!n){ctx.fillStyle=colors[1];ctx.beginPath();ctx.arc(cx,cx,r,0,Math.PI*2);ctx.fill();ctx.fillStyle=colors[0];ctx.textAlign='center';ctx.font='bold 36px '+font;ctx.fillText(key()==='questions'?'أضف الأسئلة':'أضف المشاركين',480,360);ctx.font='28px '+font;ctx.fillText('تبدأ الحكاية باختيار',480,640);return}
 const arc=2*Math.PI/n;for(let i=0;i<n;i++){const a=rotation+i*arc;ctx.beginPath();ctx.moveTo(cx,cx);ctx.arc(cx,cx,r,a,a+arc);ctx.closePath();ctx.fillStyle=colors[i%colors.length];ctx.fill();if(n<151){ctx.strokeStyle='#ffffff60';ctx.lineWidth=2;ctx.stroke()}if(n<=50){ctx.save();ctx.translate(cx,cx);ctx.rotate(a+arc/2);ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillStyle=i%6===0||i%6===4?'#ffffff':'#173c2a';ctx.font=`bold ${n>25?23:n>15?28:34}px ${font}`;const value=key()==='questions'?'سؤال '+ar(i+1):textOf(items()[i]);ctx.fillText(value.length>17?value.slice(0,15)+'…':value,r-36,0,290);ctx.restore()}}
}
function addNames(values){if(spinning||key()==='questions')return;if(items().length+values.length>2000){notice('الحد الأقصى ٢٠٠٠ مشارك.');return}const existing=new Set(items().map(x=>Game.participantKey(x.text)));const additions=values.filter(text=>{const k=Game.participantKey(text);if(existing.has(k))return false;existing.add(k);return true}).map(text=>({id:uid(),text}));state[key()]=[...items(),...additions];if(key()==='numbers')state.roundNumbers=Game.mergeNumbers(state.roundNumbers,state.numbers);save();render();notice('تمت إضافة '+ar(additions.length)+' مشاركًا.');}
$('add-form').onsubmit=e=>{e.preventDefault();const value=$('entry').value.trim();if(value){addNames([value]);$('entry').value='';$('entry').focus()}};
$('number-form').onsubmit=e=>{e.preventDefault();const n=Game.count($('number').value,2000);if(n===null){notice('أدخل عددًا صحيحًا من ١ إلى ٢٠٠٠.');return}addNames(Array.from({length:n},(_,i)=>String(i+1)))};
document.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>addNames(Array.from({length:Number(b.dataset.quick)},(_,i)=>String(i+1))));
$('question-number-form').onsubmit=e=>{e.preventDefault();if(spinning)return;const value=$('question-number').value,addition=Game.additions(DEFAULT_QUESTIONS,state,value);if(addition===null){$('question-add-status').textContent='أدخل عددًا صحيحًا من ١ إلى ١٥٠. مثلًا: ١٠';return}if(!addition.length){$('question-add-status').textContent=state.questions.length===150?'جميع الأسئلة الـ١٥٠ موجودة في العجلة بالفعل.':'لا توجد أسئلة جديدة متاحة في هذه الجولة. اضغط «استعادة» لبدء جولة جديدة.';return}state.questions.push(...addition);state.roundQuestionIds=[...new Set([...state.roundQuestionIds,...addition.map(q=>q.id)])];save();render();$('question-add-status').textContent='تمت إضافة '+ar(addition.length)+' سؤالًا. أصبح العدد في العجلة '+ar(state.questions.length)+'.'+(addition.length<Game.count(value,150)?' تمت إضافة جميع الأسئلة المتاحة.':'')};
$('question-count').value=state.questionCount;$('question-count').onchange=()=>{state.questionCount=Game.count($('question-count').value,150)||50;save()};
$('restore').onclick=()=>askConfirm('استعادة الأسئلة','استعادة الأسئلة لجولة جديدة؟ تبقى معلومات المشاركين ونتائجهم محفوظة.',()=>{state.questions=DEFAULT_QUESTIONS.slice(0,state.questionCount);state.roundQuestionIds=state.questions.map(q=>q.id);state.usedQuestionIds=[];rotation=0;save();render();$('question-add-status').textContent='تمت استعادة '+ar(state.questionCount)+' سؤالًا.'});
$('reset-owner').onclick=()=>{
 const p=active();if(spinning||!state.national||!p)return;
 askConfirm('إعادة ضبط معلومات صاحب الدور','سيتم تصفير إحصاءات '+participantLabel(p)+' وحذف أسئلته ونتائجها المسجّلة. تبقى قوائم العجلة ومعلومات بقية المشاركين كما هي.',()=>{
  const hasCurrentQuestion=current()?.participantId===p.id;
  if(!Game.resetParticipant(state,p.id))return;
  if(hasCurrentQuestion){clearInterval(timer);timer=null;resultKind=null;$('result-dialog').close()}
  save();render();renderHistory();
  if($('participants-dialog').open)renderParticipant();
  notice('تمت إعادة ضبط معلومات '+participantLabel(p)+'. يمكنك متابعة أسئلته من الصفر.');
 });
};
function clearAllParticipantData(){
 askConfirm('مسح جميع معلومات المشاركين والأرقام',
  'سيتم حذف جميع الأسماء والأرقام في الوضعين، ومعلومات كل المشاركين وأسئلتهم ونتائجهم وسجل الاختيارات. تُعاد الأسئلة لجولة جديدة وتبقى إعدادات الصوت والوقت. لا يمكن التراجع عن المسح بعد التأكيد.',()=>{
   clearInterval(timer);timer=null;cancelAnimationFrame(frameId);frameId=null;
   spinRun=null;spinning=false;resultKind=null;confirmAction=null;
   $('result-dialog').close();
   Game.clearCompetition(state,DEFAULT_QUESTIONS);
   saved=null;tab='numbers';rotation=0;
   $('answer-choices').replaceChildren();delete $('answer-choices').dataset.attempt;
   $('answer').textContent='';$('answer').hidden=true;$('choice-feedback').textContent='';
   $('result-text').textContent='';$('result-owner-name').textContent='';$('result-owner-stats').textContent='';
   $('entry').value='';$('question-add-status').textContent='';$('history-feedback').textContent='';
   // Erase the old app's lists too, so deleted data cannot be imported again.
   let legacyCleared=true;
   for(const name of ['national_wheel_numbers','maxman_wheel_items','national_wheel_questions','national_wheel_history']){
    try{localStorage.removeItem(name)}catch{legacyCleared=false}
   }
   const persisted=save();
   if(!legacyCleared){$('storage-status').hidden=false;$('storage-status').textContent='تم المسح في الجلسة الحالية. تعذّر حذف بعض البيانات القديمة المحفوظة في المتصفح.'}
   render();renderHistory();refreshParticipantSelect();
   const message=persisted&&legacyCleared?'تم مسح جميع معلومات المشاركين والأرقام والنتائج والسجل. الأسئلة جاهزة لجولة جديدة.':'تم المسح لهذه الجلسة؛ تعذّر إتمام حفظ المسح في المتصفح.';
   $('clear-data-feedback').textContent=message;notice(message);
  });
}
$('clear-participants').onclick=clearAllParticipantData;$('clear-competition').onclick=clearAllParticipantData;
$('clear').onclick=()=>{if(spinning||!items().length)return;const target=key();askConfirm('مسح القائمة','هل تريد مسح القائمة الحالية؟ يمكنك إضافتها من جديد.',()=>{state[target]=[];rotation=0;save();render();notice('تم مسح القائمة.')})};
function changeMode(n){if(spinning)return;state.national=n;rotation=0;notice('');save();render()}
$('national').onclick=()=>changeMode(true);$('normal').onclick=()=>changeMode(false);
function changeTab(t){if(spinning)return;tab=t;rotation=0;notice('');render()}
$('names-tab').onclick=()=>changeTab('numbers');$('questions-tab').onclick=()=>changeTab('questions');
$('go-to-entries').onclick=()=>{$('entry').scrollIntoView({block:'center'});$('entry').focus({preventScroll:true})};
function tone(hz=550,length=.035){if(!state.config.sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});const osc=audio.createOscillator(),g=audio.createGain();osc.connect(g);g.connect(audio.destination);osc.frequency.value=hz;g.gain.setValueAtTime(.05,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+length);osc.onended=()=>{osc.disconnect();g.disconnect()};osc.start();osc.stop(audio.currentTime+length)}catch{}}
$('sound').onclick=()=>{state.config.sound=!state.config.sound;save();$('sound').textContent='الصوت: '+(state.config.sound?'مفعّل':'مغلق')};
function randomIndex(n){if(globalThis.crypto?.getRandomValues){const a=new Uint32Array(1),max=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=max);return a[0]%n}return Math.floor(Math.random()*n)}
function spin(){
 if(spinning||!items().length||document.querySelector('dialog[open]'))return;const activeKey=key();if(activeKey==='questions'&&!active()){notice('اختر صاحب الرقم أولًا.');changeTab('numbers');return}
 const unfinished=current();if(unfinished?.outcome==='pending'){openQuestion(unfinished);return}
 const pool=items().slice(),i=randomIndex(pool.length),arc=2*Math.PI/pool.length,start=rotation,tau=2*Math.PI,desired=-Math.PI/2-(i+.5)*arc,delta=((desired-start)%tau+tau)%tau+6*tau;
 const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?150:state.config.duration*1000;
 const run={pool,i,activeKey,start,delta,duration,startedAt:performance.now(),lastTick:-1};
 spinRun=run;spinning=true;render();notice('العجلة تدور…');tone();
 function frame(t){
  if(spinRun!==run)return;
  const progress=Math.max(0,Math.min((t-run.startedAt)/run.duration,1));
  rotation=start+delta*(1-Math.pow(1-progress,4));draw();
  const tick=Math.floor(rotation/arc);if(tick!==run.lastTick&&progress<.99){tone();run.lastTick=tick}
  if(progress<1)frameId=requestAnimationFrame(frame);else finishSpin(run);
 }
 frameId=requestAnimationFrame(frame);
}
// Both automatic completion and early stop commit the same random choice once.
function finishSpin(run){
 if(!run||spinRun!==run)return;
 cancelAnimationFrame(frameId);frameId=null;spinRun=null;spinning=false;
 const {pool,i,activeKey}=run,selected=pool[i];let attempt=null,p=null;
 rotation=(run.start+run.delta)%(Math.PI*2);
 if(activeKey==='questions'){attempt=Game.start(state,selected,Date.now(),uid);p=active()}
 else if(activeKey==='numbers')p=Game.select(state,selected,uid);
 state[activeKey]=pool.filter((_,j)=>j!==i);
 state.history.unshift({text:textOf(selected),time:new Date().toLocaleString('ar-SA'),type:activeKey==='questions'?'سؤال':'اختيار',participantId:p?.id??null,attemptId:attempt?.id??null});
 save();render();notice('تم اختيار: '+textOf(selected));
 if(attempt)openQuestion(attempt);else openWinner(selected,activeKey==='numbers');
 tone(880,.35);celebrate();
}
function cancelSpin(){
 if(!spinRun)return;
 const start=spinRun.start;spinRun=null;spinning=false;cancelAnimationFrame(frameId);frameId=null;rotation=start;
 render();notice('تم إلغاء الدوران. لم يُحذف أي اسم أو سؤال، ولم يُسجّل اختيار.');$('spin').focus({preventScroll:true});
}
$('spin').onclick=()=>spinning?finishSpin(spinRun):spin();
$('cancel-spin').onclick=cancelSpin;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&spinning){e.preventDefault();cancelSpin()}});
function celebrate(){if(!state.config.confetti||matchMedia('(prefers-reduced-motion: reduce)').matches)return;for(let i=0;i<45;i++){const c=document.createElement('i');c.className='confetti';c.style.left=Math.random()*100+'vw';c.style.background=['#d4ef8c','#debc69','#278c66'][i%3];c.style.animationDelay=Math.random()*.5+'s';document.body.append(c);setTimeout(()=>c.remove(),3200)}}
function renderResultOwner(p){$('result-owner').hidden=!p;if(p){$('result-owner-name').textContent=participantLabel(p);$('result-owner-stats').textContent=personSummary(p)}}
function showDialog(id){if(!$(id).open)$(id).showModal()}
function openWinner(item,isNational){$('result-dialog').classList.remove('question-result');clearInterval(timer);resultKind=isNational?'number':'normal';$('result-label').textContent='وقع الاختيار على';$('result-text').textContent=textOf(item);$('question-area').hidden=true;renderResultOwner(isNational?active():null);$('next-question').hidden=!isNational;$('next-question').textContent='الانتقال إلى عجلة الأسئلة';$('next-question').disabled=false;$('next-number').hidden=!isNational;showDialog('result-dialog')}
function renderChoices(a){
 const list=$('answer-choices'),hasChoices=Game.validOptions(a);
 // Preserve button nodes and keyboard focus while the timer updates.
 if(list.dataset.attempt!==a.id){
  list.replaceChildren();list.dataset.attempt=a.id;
  if(hasChoices)a.options.forEach((option,i)=>{
   const button=document.createElement('button'),letter=document.createElement('span'),label=document.createElement('span'),result=document.createElement('small');
   button.type='button';button.className='answer-choice';button.dataset.answer=option;
   letter.className='choice-letter';letter.textContent=['أ','ب','ج','د'][i];letter.setAttribute('aria-hidden','true');
   label.className='choice-label';label.textContent=option;result.className='choice-result';
   button.append(letter,label,result);button.onclick=()=>{
    if(current()?.id!==a.id)return;
    Game.choose(a,option,Date.now());save();updateQuestion();render();
   };
   list.append(button);
  });
 }
 list.hidden=!hasChoices;
 $('choices-help').textContent=hasChoices?'اختر إجابة واحدة؛ يُسجّل اختيارك فور الضغط عليها.':'سؤال محفوظ من إصدار قديم؛ استخدم أزرار التقييم اليدوي.';
 for(const button of list.children){
  const selected=button.dataset.answer===a.selectedAnswer,correct=a.answerRevealed&&button.dataset.answer===a.answer;
  button.disabled=a.outcome!=='pending'||a.answerRevealed;
  button.setAttribute('aria-pressed',String(selected));
  button.classList.toggle('is-correct',correct);button.classList.toggle('is-incorrect',selected&&!correct);button.classList.toggle('is-selected',selected);
  button.querySelector('.choice-result').textContent=correct?(selected?'✓ اختيارك صحيح':'✓ الإجابة الصحيحة'):selected?'× اختيارك غير صحيح':'';
 }
 $('choice-feedback').classList.toggle('incorrect',a.outcome==='incorrect');
 $('choice-feedback').textContent=a.selectedAnswer?(a.outcome==='answered'?'إجابة صحيحة! سُجّلت لصاحب الرقم.':'إجابة غير صحيحة. سُجّل اختيارك وظهرت الإجابة الصحيحة.') : '';
}
function updateQuestion(){
 const a=current();if(!a)return;const now=Date.now();if(Game.expire(a,now)){save();render()}
 const p=state.participants.find(p=>p.id===a.participantId);renderResultOwner(p);
 const left=Math.max(0,Math.ceil((a.deadline-now)/1000));$('timer').textContent=a.outcome==='pending'?ar(left)+' ثانية':Game.statusNames[a.outcome];$('time-progress').value=a.outcome==='pending'?100*Math.max(0,a.deadline-now)/(a.deadline-a.startedAt):0;
 $('attempt-status').textContent=a.outcome==='pending'?'':Game.statusNames[a.outcome]+' — محفوظة مع معلومات '+(p?participantLabel(p):'المشارك');
 $('answer').hidden=!a.answerRevealed;$('answer').textContent=a.answerRevealed?'الإجابة: '+a.answer:'';
 renderChoices(a);
 $('reveal').hidden=a.answerRevealed;$('unknown').disabled=a.outcome!=='pending';$('skip-question').disabled=a.outcome!=='pending';$('mark-answered').disabled=!['pending','answer_shown'].includes(a.outcome);
 $('mark-answered').textContent=a.outcome==='answer_shown'?'أجاب قبل إظهار الإجابة':'أجاب عن السؤال';
 $('next-question').disabled=false;
 if(a.outcome!=='pending')clearInterval(timer);
}
function openQuestion(a){resultKind='question';state.currentAttemptId=a.id;state.activeParticipantId=a.participantId;$('result-dialog').classList.add('question-result');$('result-label').textContent='سؤال المسابقة';$('result-text').textContent=a.question;$('question-area').hidden=false;$('next-question').hidden=false;$('next-number').hidden=false;$('next-question').textContent='تجهيز السؤال التالي لهذا الرقم';updateQuestion();showDialog('result-dialog');$('result-dialog').scrollTop=0;clearInterval(timer);if(a.outcome==='pending')timer=setInterval(updateQuestion,250);save()}
function setOutcome(outcome){const a=current();if(!a)return;Game.finish(a,outcome,Date.now());save();updateQuestion();render()}
$('mark-answered').onclick=()=>setOutcome('answered');$('unknown').onclick=()=>setOutcome('unknown');$('skip-question').onclick=()=>setOutcome('skipped');
$('reveal').onclick=()=>{const a=current();if(!a)return;Game.reveal(a,Date.now());save();updateQuestion();render()};
function settleResult(){if(resultKind==='question'){const a=current();if(a){Game.finish(a,'skipped',Date.now());state.currentAttemptId=null;save()}}clearInterval(timer);timer=null;resultKind=null}
function closeResult(){settleResult();$('result-dialog').close();render()}
$('result-close').onclick=closeResult;$('continue-result').onclick=closeResult;
$('result-dialog').addEventListener('cancel',e=>{e.preventDefault();closeResult()});
$('next-question').onclick=()=>{closeResult();changeTab('questions');notice(state.questions.length?'العجلة جاهزة. اضغط «أَدِر العجلة» لبدء اختيار السؤال.':'أضف أسئلة أو استعدها لبدء جولة جديدة.');$('spin').scrollIntoView({block:'center'});if(!$('spin').disabled)$('spin').focus({preventScroll:true})};
$('next-number').onclick=()=>{closeResult();changeTab('numbers');notice('أدر عجلة الأرقام لاختيار صاحب الدور التالي.')};
$('result-dialog').addEventListener('close',()=>{if(!$('result-dialog').open&&resultKind){settleResult();render()}});
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('settings').onclick=()=>{$('duration').value=state.config.duration;$('question-time').value=state.config.time;$('confetti').checked=state.config.confetti;showDialog('settings-dialog')};
$('duration').onchange=()=>{state.config.duration=[3,5,8,10].includes(Number($('duration').value))?Number($('duration').value):5;save()};$('question-time').onchange=()=>{state.config.time=Math.min(120,Math.max(5,Math.round(Number($('question-time').value)||30)));$('question-time').value=state.config.time;save()};$('confetti').onchange=()=>{state.config.confetti=$('confetti').checked;save()};
function renderHistory(){
 $('history-list').replaceChildren();$('history-empty').hidden=!!state.history.length;$('clear-history').disabled=!state.history.length;
 state.history.forEach(h=>{const li=document.createElement('li'),s=document.createElement('small'),p=state.participants.find(p=>p.id===h.participantId),a=state.attempts.find(a=>a.id===h.attemptId);li.textContent=h.text;s.textContent=[p?participantLabel(p):h.type,a?Game.statusNames[a.outcome]:'',h.time].filter(Boolean).join(' · ');li.append(s);$('history-list').append(li)})
}
$('history').onclick=()=>{if(spinning)return;$('history-feedback').textContent='';renderHistory();showDialog('history-dialog')};
$('clear-history').onclick=()=>{
 if(spinning||!state.history.length)return;
 askConfirm('مسح سجل الاختيارات','سيُحذف سجل الاختيارات فقط. تبقى نتائج المشاركين والأسئلة المتبقية وصاحب الدور كما هي.',()=>{
  state.history=[];const persisted=save();renderHistory();
  $('history-feedback').textContent=persisted?'تم مسح السجل بنجاح.':'تم مسح السجل لهذه الجلسة. تعذّر حفظ التغيير في المتصفح.';
  notice('تم مسح سجل الاختيارات. يمكنك متابعة المسابقة.');
 });
};
function refreshParticipantSelect(){const select=$('participant-select');select.replaceChildren();state.participants.forEach(p=>{const option=document.createElement('option');option.value=p.id;option.textContent=participantLabel(p);select.append(option)});if(active())select.value=active().id;renderParticipant()}
function openParticipants(){$('clear-data-feedback').textContent='';refreshParticipantSelect();showDialog('participants-dialog')}
function renderParticipant(){const id=$('participant-select').value,p=state.participants.find(p=>p.id===id);$('participants-empty').hidden=!!p;$('participant-details').hidden=!p;$('participant-select').disabled=!p;if(!p){$('participant-stats').replaceChildren();$('participant-questions').replaceChildren();return}
 const stats=Game.stats(state,id);$('participant-stats').replaceChildren();[['answered','أجاب'],['incorrect','إجابة خاطئة'],['unknown','لم يعرف'],['timed_out','انتهى الوقت'],['skipped','تخطّى'],['answer_shown','كُشفت الإجابة'],['total','كل الأسئلة']].forEach(([key,label])=>{const box=document.createElement('div'),value=document.createElement('strong'),text=document.createElement('span');box.className='stat';value.textContent=ar(stats[key]);text.textContent=label;box.append(value,text);$('participant-stats').append(box)});
 const list=$('participant-questions');list.replaceChildren();const attempts=state.attempts.filter(a=>a.participantId===id).slice().reverse();if(!attempts.length){const li=document.createElement('li');li.textContent='لم يُطرح سؤال لهذا الرقم بعد.';list.append(li)}
 attempts.forEach(a=>{const li=document.createElement('li'),q=document.createElement('p'),status=document.createElement('span'),time=document.createElement('small');q.textContent=a.question;status.className='outcome '+a.outcome;status.textContent=Game.statusNames[a.outcome];time.textContent=' · '+new Date(a.startedAt).toLocaleString('ar-SA');li.append(status,time,q);if(a.selectedAnswer){const selected=document.createElement('p');selected.className='saved-choice';selected.textContent='اختيار المشارك: '+a.selectedAnswer;li.append(selected)}if(a.answerRevealed){const details=document.createElement('details'),summary=document.createElement('summary'),answer=document.createElement('p');summary.textContent='الإجابة الصحيحة';answer.textContent=a.answer;details.append(summary,answer);li.append(details)}list.append(li)})
}
$('participants').onclick=openParticipants;$('owner-info').onclick=openParticipants;$('participant-select').onchange=renderParticipant;
$('resume-participant').onclick=()=>{if(spinning)return;state.activeParticipantId=$('participant-select').value;save();$('participants-dialog').close();changeTab('questions')};
render();if(document.fonts)document.fonts.ready.then(()=>{if(!spinning)draw()});
if(current()){state.national=true;tab='questions';render();openQuestion(current())}
