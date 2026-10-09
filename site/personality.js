'use strict';
globalThis.PersonalityUI = (() => {
  const model=PersonalityModel,byId=id=>document.getElementById(id);
  const number=n=>Number(n).toLocaleString('ar-SA');
  const STORAGE_KEY='maxman-personality-v1';
  let saved=null;
  try{saved=JSON.parse(localStorage.getItem(STORAGE_KEY))}catch{}
  let test=model.restore(saved),view='test',latestResult=null;
  const motifs={
    structure:'<path d="M15 42V23l17-10 17 10v19M15 23l17 10 17-10M32 33v19M15 42l17 10 17-10"/>',
    nodes:'<circle cx="20" cy="20" r="6"/><circle cx="46" cy="28" r="6"/><circle cx="25" cy="48" r="6"/><path d="m26 22 14 4M23 26l1 16m6 2 12-11"/>',
    flag:'<path d="M20 53V13h29l-7 10 7 10H20M13 53h24"/>',
    dialogue:'<path d="M13 17h31v22H27l-9 8v-8h-5zM44 25h9v24h-6l-7 5v-8H29M22 26h13M22 32h9"/>',
    compass:'<circle cx="32" cy="32" r="22"/><path d="m42 22-6 14-14 6 6-14zM32 6v5M32 53v5M6 32h5M53 32h5"/>',
    leaf:'<path d="M15 48c-7-20 2-34 35-34 0 34-14 43-35 34zm0 0 27-26M26 37V26m0 11h13"/>',
    sun:'<circle cx="32" cy="32" r="12"/><path d="M32 6v9M32 49v9M6 32h9M49 32h9M13 13l7 7M44 44l7 7M13 51l7-7M44 20l7-7"/>',
    spark:'<path d="m32 9 5 15 15 8-15 7-5 16-6-16-15-7 15-8zM49 8v10M44 13h10"/>',
    grid:'<rect x="12" y="12" width="40" height="40" rx="5"/><path d="M12 25h40M25 12v40M25 39h27M39 25v27"/>',
    shield:'<path d="m32 9 20 8v14c0 12-10 20-20 25-10-5-20-13-20-25V17zM23 31l7 7 12-15"/>',
    steps:'<path d="M12 51h40M15 49V35h10v14m0 0V25h11v24m0 0V14h12v35M15 22l11-8"/>',
    circle:'<circle cx="32" cy="24" r="7"/><circle cx="14" cy="32" r="5"/><circle cx="50" cy="32" r="5"/><path d="M20 51v-6c0-8 24-8 24 0v6M6 49v-5c0-4 8-7 13-5M58 49v-5c0-4-8-7-13-5"/>',
    tools:'<path d="m16 50 25-26c-4-5-1-13 6-14l-3 8 5 5 8-3c-1 8-10 10-14 6L20 54zM13 12l8 4 20 22m-4 4 13 13"/>',
    petal:'<path d="M32 47c-18 0-22-12-15-19 9-8 15 2 15 2s6-10 15-2c7 7 3 19-15 19zm0-17c-9-7-10-17 0-21 10 4 9 14 0 21zM32 47v10"/>',
    arrow:'<path d="m12 48 37-37M26 11h23v23M14 18h7M14 27h13M14 36h4M36 48v-9M45 48V37"/>',
    music:'<path d="M26 42V17l24-5v25M26 24l24-5"/><ellipse cx="19" cy="46" rx="7" ry="5"/><ellipse cx="43" cy="41" rx="7" ry="5"/><path d="M12 13v10M7 18h10"/>'
  };
  function icon(type){
    return '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+motifs[type.symbol]+'</svg>';
  }
  function save(){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(test));byId('personality-storage').hidden=true;return true}
    catch{byId('personality-storage').hidden=false;byId('personality-storage').textContent='تعذّر حفظ إجاباتك في هذا المتصفح. يمكنك إكمال الاختبار خلال هذه الجلسة.';return false}
  }
  function card(type){
    const button=document.createElement('button'),group=model.groupFor(type.code);
    button.type='button';button.className='personality-type-card';button.style.setProperty('--group-color',group.color);
    button.setAttribute('aria-label','استكشف شخصية '+type.name+' '+type.code);
    button.innerHTML='<span class="personality-type-icon">'+icon(type)+'</span><span class="personality-type-name">'+type.name+'</span><span class="personality-type-code" dir="ltr">'+type.code+'</span><span class="personality-type-tagline">'+type.tagline+'</span><span class="personality-card-link">استكشف الشخصية <span aria-hidden="true">←</span></span>';
    button.onclick=()=>openType(type);
    return button;
  }
  function listSection(title,items){
    const section=document.createElement('section'),heading=document.createElement('h4'),list=document.createElement('ul');
    heading.textContent=title;
    for(const text of items){const li=document.createElement('li');li.textContent=text;list.append(li)}
    section.append(heading,list);return section;
  }
  function insights(type){
    const fragment=document.createDocumentFragment();
    const paragraph=document.createElement('p');paragraph.textContent=type.description;fragment.append(paragraph);
    const columns=document.createElement('div');columns.className='personality-insight-columns';
    columns.append(listSection('نقاط قوة محتملة',type.strengths),listSection('مساحات للنمو',type.growth));fragment.append(columns);
    const tip=document.createElement('p');tip.className='personality-tip';tip.textContent='خطوة للتجربة: '+type.tip;fragment.append(tip);
    return fragment;
  }
  function openType(type){
    const dialog=byId('personality-type-dialog'),content=byId('personality-type-content'),group=model.groupFor(type.code);
    dialog.style.setProperty('--group-color',group.color);content.replaceChildren();
    const art=document.createElement('div');art.className='personality-type-detail-art';art.innerHTML=icon(type);art.setAttribute('aria-hidden','true');
    const groupLabel=document.createElement('span');groupLabel.className='eyebrow';groupLabel.textContent=group.name;
    const title=document.createElement('h2');title.id='personality-type-title';title.textContent=type.name;
    const code=document.createElement('p');code.className='personality-result-code';code.dir='ltr';code.textContent=type.code;
    const tagline=document.createElement('p');tagline.className='personality-type-detail-tagline';tagline.textContent=type.tagline;
    content.append(art,groupLabel,title,code,tagline,insights(type));
    const note=document.createElement('p');note.className='hint';note.textContent='هذا وصف عام للتأمل. تصف الأنماط ميولًا محتملة ولا تحدد قدراتك أو مستقبلك.';content.append(note);
    if(!dialog.open)dialog.showModal();
  }
  function renderCatalog(){
    const catalog=byId('personality-catalog');catalog.replaceChildren();
    for(const group of model.groups){
      const section=document.createElement('section');section.className='personality-group panel';section.style.setProperty('--group-color',group.color);
      const heading=document.createElement('div');heading.className='personality-group-heading';
      const tag=document.createElement('span');tag.className='personality-group-tag';tag.dir='ltr';tag.textContent=group.tag;
      const title=document.createElement('h4');title.textContent=group.name;
      const description=document.createElement('p');description.textContent=group.description;heading.append(tag,title,description);
      const grid=document.createElement('div');grid.className='personality-type-grid';model.types.filter(t=>t.group===group.id).forEach(t=>grid.append(card(t)));
      section.append(heading,grid);catalog.append(section);
    }
  }
  function updateProgress(){
    const count=model.answeredCount(test.answers);
    byId('personality-progress').value=count;
    byId('personality-progress-label').textContent=number(count)+' من '+number(model.questions.length)+' إجابة';
  }
  function focusPage(){
    const heading=byId('personality-page-label');heading.tabIndex=-1;heading.focus({preventScroll:true});
    byId('personality-form').scrollIntoView({block:'start',behavior:'instant'});
  }
  function renderQuestions(){
    const questions=model.pageQuestions(test.page),container=byId('personality-questions');container.replaceChildren();
    byId('personality-page-label').textContent='الجزء '+number(test.page+1)+' من '+number(model.pageCount);
    byId('personality-page-count').textContent=number(test.page+1)+' / '+number(model.pageCount);
    byId('personality-previous').disabled=test.page===0;
    byId('personality-next').textContent=test.page===model.pageCount-1?'اكتشف نتيجتك ←':'التالي ←';
    byId('personality-error').textContent='';
    for(let i=0;i<questions.length;i++){
      const q=questions[i],field=document.createElement('fieldset');field.className='personality-question';field.id='personality-question-'+q.id;
      const legend=document.createElement('legend'),index=document.createElement('span'),text=document.createElement('span');
      index.className='personality-question-number';index.textContent=number(test.page*model.PAGE_SIZE+i+1);text.textContent=q.text;legend.append(index,text);
      const captions=document.createElement('div');captions.className='personality-scale-captions';captions.setAttribute('aria-hidden','true');captions.innerHTML='<span>أوافق</span><span>محايد</span><span>لا أوافق</span>';
      const scale=document.createElement('div');scale.className='personality-scale';
      for(const choice of model.choices){
        const label=document.createElement('label'),input=document.createElement('input'),circle=document.createElement('span');
        label.className='personality-scale-choice '+(choice.value>0?'agree':choice.value<0?'disagree':'neutral')+' magnitude-'+Math.abs(choice.value);label.title=choice.label;
        input.type='radio';input.name='personality-'+q.id;input.value=String(choice.value);input.id='personality-'+q.id+'-'+(choice.value+3);input.required=true;
        input.setAttribute('aria-label',choice.label);input.checked=model.hasAnswer(test.answers,q.id)&&test.answers[q.id]===choice.value;
        circle.className='personality-choice-circle';circle.setAttribute('aria-hidden','true');circle.textContent='✓';
        input.onchange=()=>{
          if(!input.checked)return;
          test.answers[q.id]=choice.value;test.completed=false;field.classList.remove('unanswered');field.removeAttribute('aria-invalid');
          save();updateProgress();byId('personality-error').textContent='';
        };
        label.append(input,circle);scale.append(label);
      }
      field.append(legend,captions,scale);container.append(field);
    }
    updateProgress();
  }
  function renderResult(){
    const result=model.score(test.answers);latestResult=result;
    if(!result)return;
    const type=result.type,group=type?model.groupFor(type.code):null;
    const art=byId('personality-result-art');art.innerHTML=type?icon(type):'<span class="personality-balance-symbol">⇄</span>';art.style.setProperty('--group-color',group?.color||'#91694e');
    byId('personality-result-group').textContent=group?'نمطك الأقرب · '+group.name:'نتيجة متوازنة في بعض الأبعاد';
    byId('personality-result-title').textContent=type?type.name:'أكثر من جانب، وأكثر من احتمال';
    byId('personality-result-code').textContent=result.fullCode;
    byId('personality-result-summary').textContent=type?type.tagline:'تساوت درجاتك في بُعد أو أكثر. الحرف X يعبّر عن التعادل، ولا نختار حرفًا بصورة اعتباطية.';
    byId('personality-result-identity').textContent=result.identity==='A'?'الهوية A: تميل إجاباتك إلى الثقة والثبات عند الضغط.':result.identity==='T'?'الهوية T: تميل إجاباتك إلى التأثر بالضغط ومراجعة الأداء.':'بُعد الهوية متعادل بين A وT؛ لذلك لا تظهر لاحقة مرجّحة.';
    const traits=byId('personality-traits');traits.replaceChildren();
    for(const axis of result.dimensions){
      const row=document.createElement('div');row.className='personality-trait';row.style.setProperty('--trait-color',axis.color);
      const heading=document.createElement('div');heading.className='personality-trait-heading';
      const title=document.createElement('h4');title.textContent=axis.title;
      const tendency=document.createElement('span');tendency.textContent=axis.letter?(axis.sum>0?axis.positiveName:axis.negativeName):'متوازن';heading.append(title,tendency);
      const labels=document.createElement('div');labels.className='personality-trait-labels';
      const positive=document.createElement('span'),negative=document.createElement('span');
      positive.textContent=number(axis.positivePercent)+'٪ '+axis.positiveName+' ('+axis.positive+')';
      negative.textContent=number(axis.negativePercent)+'٪ '+axis.negativeName+' ('+axis.negative+')';labels.append(positive,negative);
      const bar=document.createElement('div');bar.className='personality-trait-bar';bar.setAttribute('role','img');bar.setAttribute('aria-label',axis.title+': '+positive.textContent+'، '+negative.textContent);
      const segment=document.createElement('span');segment.style.width=axis.positivePercent+'%';bar.append(segment);
      const explanation=document.createElement('p');explanation.className='hint';explanation.textContent=axis.description;
      row.append(heading,labels,bar,explanation);traits.append(row);
    }
    const details=byId('personality-insights');details.replaceChildren();
    const heading=document.createElement('h3');heading.textContent=type?'قراءة في نمطك':'كيف تقرأ هذه النتيجة؟';details.append(heading);
    if(type)details.append(insights(type));
    else{
      const p=document.createElement('p');p.textContent='قد تختلف تفضيلاتك باختلاف الموقف. التعادل هنا يعني أن إجاباتك لم ترجّح أحد الجانبين على هذا المقياس. راجع العبارات المتعادلة أو اقرأ الأنماط الممكنة دون التعامل معها كحكم نهائي.';details.append(p);
      details.append(listSection('للاستفادة من النتيجة',['فكّر في تصرفاتك المعتادة، لا في الصورة التي تتمناها لنفسك.','وازن النتيجة بما تلاحظه في حياتك اليومية.','اختلاف النمط لا يعني اختلافًا في قيمة الأشخاص أو قدراتهم.']));
    }
    byId('personality-candidates').hidden=!result.balanced;
    const candidates=byId('personality-candidate-list');candidates.replaceChildren();if(result.balanced)result.candidates.forEach(t=>candidates.append(card(t)));
  }
  function render(){
    const catalog=view==='catalog';
    byId('personality-test-view').hidden=catalog;byId('personality-catalog-view').hidden=!catalog;
    for(const [id,active] of [['personality-test-tab',!catalog],['personality-types-tab',catalog]]){byId(id).classList.toggle('active',active);byId(id).setAttribute('aria-pressed',String(active))}
    byId('personality-welcome').hidden=test.started;
    byId('personality-form').hidden=!test.started||test.completed;
    byId('personality-result').hidden=!test.completed;
    if(!catalog&&test.started){if(test.completed)renderResult();else renderQuestions()}
  }
  function restart(){
    askConfirm('بدء اختبار شخصية جديد','ستُمسح إجابات اختبار الشخصية الحالي من هذا المتصفح. هل تريد البدء من جديد؟',()=>{
      test=model.restore(null);latestResult=null;view='test';byId('personality-copy-status').textContent='';save();render();byId('personality-start').focus({preventScroll:true});
    });
  }
  byId('personality-start').onclick=()=>{test.started=true;save();render();focusPage()};
  byId('personality-test-tab').onclick=()=>{view='test';render()};
  byId('personality-types-tab').onclick=()=>{view='catalog';render()};
  byId('personality-previous').onclick=()=>{if(test.page===0)return;test.page--;save();renderQuestions();focusPage()};
  byId('personality-form').onsubmit=event=>{
    event.preventDefault();
    const missing=model.pageQuestions(test.page).filter(q=>!model.hasAnswer(test.answers,q.id));
    if(missing.length){
      byId('personality-error').textContent='اختر إجابة للعبارات المتبقية قبل المتابعة ('+number(missing.length)+').';
      for(const q of missing){const field=byId('personality-question-'+q.id);field.classList.add('unanswered');field.setAttribute('aria-invalid','true')}
      const first=byId('personality-question-'+missing[0].id);first.scrollIntoView({block:'center',behavior:'instant'});first.querySelector('input').focus({preventScroll:true});return;
    }
    if(test.page<model.pageCount-1){test.page++;save();renderQuestions();focusPage();return}
    const unanswered=model.questions.findIndex(q=>!model.hasAnswer(test.answers,q.id));
    if(unanswered!==-1){test.page=Math.floor(unanswered/model.PAGE_SIZE);save();renderQuestions();focusPage();byId('personality-error').textContent='بقيت عبارات دون إجابة. أكملها لتظهر النتيجة.';return}
    test.completed=true;save();render();byId('personality-result-title').focus({preventScroll:true});byId('personality-result').scrollIntoView({block:'start',behavior:'instant'});
  };
  byId('personality-reset').onclick=restart;byId('personality-retake').onclick=restart;
  byId('personality-review').onclick=()=>{test.completed=false;test.page=0;save();render();focusPage()};
  byId('personality-copy').onclick=async()=>{
    if(!latestResult)return;
    const r=latestResult;
    const lines=['اختيار الشخصية — Maxman Wheel',r.type?r.type.name+' — '+r.fullCode:'نتيجة متوازنة — '+r.fullCode,...r.dimensions.map(d=>d.title+': '+d.positiveName+' '+d.positivePercent+'٪ / '+d.negativeName+' '+d.negativePercent+'٪'),'نتيجة اختبار مستقل للتأمل وفهم الذات.'];
    try{await navigator.clipboard.writeText(lines.join('\n'));byId('personality-copy-status').textContent='تم نسخ النتيجة.'}
    catch{byId('personality-copy-status').textContent='لم يسمح المتصفح بالنسخ التلقائي. يمكنك تحديد النتيجة ونسخها يدويًا.'}
  };
  renderCatalog();render();
  return {activate:render};
})();
