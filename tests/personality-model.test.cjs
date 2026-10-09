const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../site/personality-data.js'),'utf8'),context);
const model=context.PersonalityModel;
const answersFor=(code,identity='A')=>Object.fromEntries(model.questions.map(q=>{
  const axis=model.axes.find(a=>a.id===q.axis);
  const wanted=q.axis==='AT'?identity:code[model.axes.indexOf(axis)];
  return [q.id,(wanted===axis.positive?3:-3)*q.direction];
}));
test('60 original items, unique IDs, 12 balanced items for each of five axes',()=>{
  assert.equal(model.questions.length,60);
  assert.equal(new Set(model.questions.map(q=>q.id)).size,60);
  assert.equal(new Set(model.questions.map(q=>q.text)).size,60);
  assert.equal(model.pageCount,10);
  for(const axis of model.axes){
    const items=model.questions.filter(q=>q.axis===axis.id);
    assert.equal(items.length,12);
    assert.equal(items.filter(q=>q.direction===1).length,6);
    assert.equal(items.filter(q=>q.direction===-1).length,6);
  }
  for(let page=0;page<model.pageCount;page++)assert.equal(model.pageQuestions(page).length,6);
});
test('all sixteen types and both identity variants can be reached',()=>{
  assert.equal(model.types.length,16);
  assert.equal(new Set(model.types.map(t=>t.code)).size,16);
  for(const type of model.types)for(const identity of ['A','T']){
    const result=model.score(answersFor(type.code,identity));
    assert.equal(result.type.code,type.code);
    assert.equal(result.fullCode,type.code+'-'+identity);
    assert.equal(result.candidates.length,1);
    assert.equal(result.balanced,false);
    for(const dimension of result.dimensions){
      assert.equal(dimension.positivePercent+dimension.negativePercent,100);
      assert.ok([0,100].includes(dimension.positivePercent));
    }
  }
  for(const group of model.groups)assert.equal(model.types.filter(t=>t.group===group.id).length,4);
});
test('reverse-keyed questions and seven answer strengths affect percentages consistently',()=>{
  for(const value of [1,2,3]){
    const positive=Object.fromEntries(model.questions.map(q=>[q.id,value*q.direction]));
    const negative=Object.fromEntries(model.questions.map(q=>[q.id,-value*q.direction]));
    const expected=Math.round(50+(value/3)*50);
    for(const d of model.score(positive).dimensions)assert.equal(d.positivePercent,expected);
    for(const d of model.score(negative).dimensions)assert.equal(d.positivePercent,100-expected);
  }
  const answers=answersFor('INTJ');answers['ei-1']=3;
  const energy=model.score(answers).dimensions[0];
  assert.equal(energy.letter,'I');
  assert.equal(energy.positivePercent,8);
});
test('neutral and tied responses do not invent a personality or identity',()=>{
  const neutral=Object.fromEntries(model.questions.map(q=>[q.id,0]));
  const result=model.score(neutral);
  assert.equal(result.type,null);
  assert.equal(result.fullCode,'XXXX');
  assert.equal(result.identity,null);
  assert.equal(result.candidates.length,16);
  for(const d of result.dimensions)assert.equal(d.positivePercent,50);
  const partial=answersFor('ENFP','T');
  for(const q of model.questions.filter(q=>q.axis==='EI'))partial[q.id]=0;
  const tied=model.score(partial);
  assert.equal(tied.fullCode,'XNFP-T');
  assert.deepEqual(Array.from(tied.candidates,t=>t.code).sort(),['ENFP','INFP']);
  const noSuffix=answersFor('ISTJ');
  for(const q of model.questions.filter(q=>q.axis==='AT'))noSuffix[q.id]=0;
  assert.equal(model.score(noSuffix).fullCode,'ISTJ');
});
test('missing, invalid, inherited, and out-of-range answers never produce a complete result',()=>{
  assert.equal(model.score(null),null);assert.equal(model.score({}),null);
  const answers=answersFor('ESFP');delete answers['ei-1'];
  assert.equal(model.score(answers),null);
  for(const value of ['3',4,-4,1.5,NaN,Infinity,null]){
    const invalid={...answers,'ei-1':value};
    assert.equal(model.answeredCount(invalid),59);
    assert.equal(model.score(invalid),null);
  }
  assert.equal(model.answeredCount(Object.create(answersFor('INTJ'))),0);
});
test('saved progress restores without accepting corrupt data or changing question mapping',()=>{
  const answers=answersFor('ENTP','T');
  const complete=model.restore({version:1,answers,page:9,started:true,completed:true});
  assert.equal(complete.completed,true);assert.equal(model.score(complete.answers).fullCode,'ENTP-T');
  delete answers['ei-1'];answers['unknown']='3';
  const partial=model.restore({version:1,answers,page:99,completed:true});
  assert.equal(partial.page,9);assert.equal(partial.started,true);assert.equal(partial.completed,false);
  assert.equal(Object.hasOwn(partial.answers,'unknown'),false);
  assert.equal(model.restore({version:2,answers}).started,false);
  assert.equal(model.restore({version:1,answers:null}).started,false);
  assert.equal(model.restore({version:1,answers,page:-2}).page,0);
});
