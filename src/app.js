(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const STORAGE = 'syzygy-rank-studio-v1';
  const sample = {
    listRevision:2,
    year:'2026', subject:'CHEMISTRY', exam:'MAIN EXAM 07', topLabel:'TOP 20', institute:'SYZYGY', branch:'NUGEGODA', sideText:'CHEMISTRY', accent:'#e00000', barColorStart:'#ff8a00', barColorEnd:'#ad0000',
    teacher:'චරිත දිසානායක', qualification:'B.Sc. (Engineering) Hons. University of Moratuwa', hotline:'0777 67 47 47', showOriginalFooter:true, customFooter:null, maxRows:50,
    students:[
      {name:'Nipuna Mihisara',school:'Isipathana College',marks:'81.75'},
      {name:'Dinodh Rodrigo',school:"St. Sebastian’s College",marks:'81.25'},
      {name:'Yasith Pramuditha',school:'Ananda College',marks:'80.85'},
      {name:'Kavindu Nimsara',school:'Ananda College',marks:'80.55'},
      {name:'Ameesha Rochani',school:'Sirimavo Bandaranayake Vidyalaya',marks:'78.03'},
      {name:'Dilmi Rashmika',school:'Visakha Vidyalaya',marks:'76.63'},
      {name:'Dineth Anthony',school:"St. Joseph’s College",marks:'75.45'},
      {name:'Pasidu Sadew',school:'Ananda Vidyalaya',marks:'75.30'},
      {name:'Ridmi Thaksala',school:'Ananda Balika',marks:'75.25'},
      {name:'Sanuka Sandeepa',school:'Isipathana College',marks:'74.05'}
    ]
  };
  sample.students.push(...Array.from({length:20-sample.students.length},()=>({name:'',school:'',marks:''})));
  const clone = value => JSON.parse(JSON.stringify(value));
  const iconPaths = {
    print:'<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6zM18 12h.01"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/>',
    sliders:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/>',
    palette:'<path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-3.7 1.5 1.5 0 0 1 1-2.8h2a4 4 0 0 0 4-4C21 6.5 17 3 12 3Z"/><path d="M7.5 10h.01M10 6.5h.01M15 7h.01M17.5 10.5h.01" stroke-width="3"/>',
    sparkles:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4"/>',
    arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    sort:'<path d="M4 3v18m-3-3 3 3 3-3M10 5h11M10 10h8M10 15h5M10 20h2"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Zm-4 9 3 3 5-6"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    medal:'<circle cx="12" cy="8" r="5"/><path d="m8 12-2 9 6-3 6 3-2-9"/>',
    file:'<path d="M14 2H5v20h14V7Zm0 0v6h5M8 12h8M8 16h8"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
    trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>'
  };
  const icon = key => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(iconPaths[key]||'')+'</svg>';
  document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
  let state = clone(sample), renderTimer, toastTimer, renderChain=Promise.resolve(), saveFailed=false;
  const textFields = {year:12,subject:40,exam:45,topLabel:24,institute:35,branch:35,sideText:35,teacher:70,qualification:110,hotline:45};
  function sanitize(data) {
    if (!data || typeof data!=='object' || !Array.isArray(data.students)) throw Error('This file is not a Rank List Studio project.');
    if (data.students.length>50) throw Error('A poster supports up to 50 students.');
    const clean = clone(sample);
    for (const [key,max] of Object.entries(textFields)) if(typeof data[key]==='string') clean[key]=data[key].slice(0,max);
    for (const key of ['accent','barColorStart','barColorEnd']) {
      if (typeof data[key]==='string' && /^#[0-9a-f]{6}$/i.test(data[key])) clean[key]=data[key];
    }
    clean.showOriginalFooter=data.showOriginalFooter!==false;
    clean.customFooter=typeof data.customFooter==='string' && /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(data.customFooter) && data.customFooter.length<7000000 ? data.customFooter : null;
    clean.students=data.students.map((s,i)=>{
      if(!s || typeof s!=='object') throw Error('Invalid student at row '+(i+1)+'.');
      return {name:String(s.name??'').slice(0,120),school:String(s.school??'').slice(0,150),marks:String(s.marks??'').slice(0,12)};
    });
    // Expand earlier 10-row projects once, preserving every saved result.
    if(data.listRevision!==2){
      while(clean.students.length<20) clean.students.push({name:'',school:'',marks:''});
    }
    return clean;
  }
  try {const stored=localStorage.getItem(STORAGE);if(stored) state=sanitize(JSON.parse(stored));} catch(error) {console.info('Starting with example data:',error.message);}
  function notify(message) {clearTimeout(toastTimer);$('toast').textContent=message;$('toast').classList.add('show');toastTimer=setTimeout(()=>$('toast').classList.remove('show'),5200);}
  function persist(){try{localStorage.setItem(STORAGE,JSON.stringify(state));$('saveStatus').innerHTML='<span></span>Saved on this device';saveFailed=false;}catch(error){$('saveStatus').textContent='Use Save data to keep your edits';if(!saveFailed)notify('Browser storage is full or unavailable. Use Save data to download a backup.');saveFailed=true;}}
  function marksValid(m){return String(m).trim()!=='' && Number.isFinite(Number(m)) && Number(m)>=0 && Number(m)<=100 && /^\d+(?:\.\d{0,2})?$/.test(String(m));}
  function stats(){const scores=state.students.filter(s=>marksValid(s.marks)).map(s=>Number(s.marks));$('statCount').textContent=state.students.length;$('tabCount').textContent=state.students.length;$('studentSummary').textContent=state.students.length+' student'+(state.students.length===1?'':'s');$('statHighest').textContent=scores.length?Math.max(...scores).toFixed(2):'—';$('addStudent').disabled=state.students.length>=50;}
  function renderNow(){clearTimeout(renderTimer);const snapshot={...state,students:state.students.map(s=>({...s,marks:marksValid(s.marks)?Number(s.marks).toFixed(2):''})),footerAsset:window.REFERENCE_ASSET,additionalLogo:window.ADDITIONAL_LOGO_ASSET};renderChain=renderChain.catch(()=>{}).then(()=>RankPoster.render($('poster'),snapshot)).then(()=>{$('canvasLoading').hidden=true;});return renderChain;}
  function update(){persist();stats();clearTimeout(renderTimer);renderTimer=setTimeout(()=>renderNow().catch(error=>notify('The preview could not be updated: '+error.message)),90);}
  function switchTab(name){document.querySelectorAll('[data-tab]').forEach(tab=>{const active=tab.dataset.tab===name;tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});document.querySelectorAll('[role=tabpanel]').forEach(panel=>panel.hidden=panel.id!=='panel-'+name);}
  document.querySelectorAll('[data-tab]').forEach((tab,i,tabs)=>{tab.addEventListener('click',()=>switchTab(tab.dataset.tab));tab.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();let n=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length;switchTab(tabs[n].dataset.tab);tabs[n].focus();});});
  function refreshFields(){document.querySelectorAll('[data-field]').forEach(input=>{if(input.type==='checkbox')input.checked=state[input.dataset.field];else input.value=state[input.dataset.field];});refreshBranding();}
  document.querySelectorAll('[data-field]').forEach(input=>input.addEventListener('input',()=>{state[input.dataset.field]=input.type==='checkbox'?input.checked:input.value;refreshBranding();update();}));
  function refreshBranding(){
    $('colorValue').textContent=state.accent.toUpperCase();
    $('barStartValue').textContent=state.barColorStart.toUpperCase();
    $('barEndValue').textContent=state.barColorEnd.toUpperCase();
    $('barGradientPreview').style.background='linear-gradient(180deg,'+state.barColorStart+','+state.barColorEnd+')';
    $('barGradientPreview').setAttribute('aria-label','Left bar fade from '+state.barColorStart+' at the top to '+state.barColorEnd+' at the bottom');
    $('teacherFields').hidden=state.showOriginalFooter||!!state.customFooter;
    $('removeFooter').hidden=!state.customFooter;
  }
  const escape = text => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function renderStudents(){const list=$('studentList');if(!state.students.length){list.innerHTML='<div class="empty-state">Your next top performer starts here.<br>Add a student or paste your results.</div>';stats();return;}
    list.innerHTML=state.students.map((s,i)=>'<div class="student-card" data-index="'+i+'"><div class="student-card-header"><span class="student-rank"><span class="rank-pill">'+(i+1)+'</span> RANK '+String(i+1).padStart(2,'0')+'</span><div class="student-actions"><button class="icon-button delete-student" aria-label="Remove student '+(i+1)+'" title="Remove student">'+icon('trash')+'</button></div></div><label>Name<input autocomplete="off" maxlength="120" data-student="name" placeholder="Student name" aria-label="Student '+(i+1)+' name" value="'+escape(s.name)+'"></label><div class="student-fields"><label>School<input autocomplete="off" maxlength="150" data-student="school" placeholder="School name" aria-label="Student '+(i+1)+' school" value="'+escape(s.school)+'"></label><label>Marks<input type="number" min="0" max="100" step="0.01" inputmode="decimal" data-student="marks" placeholder="00.00" aria-label="Student '+(i+1)+' marks" value="'+escape(s.marks)+'"></label></div></div>').join('');stats();
  }
  $('studentList').addEventListener('input',e=>{const input=e.target.closest('[data-student]');if(!input)return;const i=Number(input.closest('[data-index]').dataset.index);state.students[i][input.dataset.student]=input.value;input.classList.toggle('invalid',input.dataset.student==='marks'&&input.value!==''&&!marksValid(input.value));input.setAttribute('aria-invalid',String(input.classList.contains('invalid')));update();});
  $('studentList').addEventListener('change',e=>{const input=e.target.closest('[data-student="marks"]');if(input&&marksValid(input.value)){input.value=Number(input.value).toFixed(2);state.students[Number(input.closest('[data-index]').dataset.index)].marks=input.value;update();}});
  $('studentList').addEventListener('click',e=>{const btn=e.target.closest('.delete-student');if(!btn)return;const i=Number(btn.closest('[data-index]').dataset.index);state.students.splice(i,1);renderStudents();update();});
  $('addStudent').addEventListener('click',()=>{if(state.students.length>=50)return;state.students.push({name:'',school:'',marks:''});renderStudents();update();const last=$('studentList').lastElementChild;last.scrollIntoView({block:'nearest',behavior:'smooth'});last.querySelector('input').focus({preventScroll:true});});
  $('sortBtn').addEventListener('click',()=>{state.students.sort((a,b)=>(marksValid(b.marks)?Number(b.marks):-1)-(marksValid(a.marks)?Number(a.marks):-1));renderStudents();update();notify('Results sorted from highest to lowest marks.');});
  $('goStudents').addEventListener('click',()=>{switchTab('students');$('panel-students').scrollTop=0;$('tab-students').focus();});
  function confirmAction(title,message,action){$('confirmTitle').textContent=title;$('confirmText').textContent=message;$('confirmAction').textContent=action;$('confirmDialog').returnValue='';$('confirmDialog').showModal();return new Promise(resolve=>$('confirmDialog').addEventListener('close',()=>resolve($('confirmDialog').returnValue==='confirm'),{once:true}));}
  $('clearBtn').addEventListener('click',async()=>{if(await confirmAction('Start an empty rank list?','This removes all student rows from the current list. Your exam details and style stay as they are.','Clear students')){state.students=[];renderStudents();update();notify('Your empty list is ready to fill.');}});
  $('restoreBtn').addEventListener('click',async()=>{if(await confirmAction('Restore the example?','This replaces your current details, students and banner with the original sample. Use Save data first if you want a backup.','Restore example')){state=clone(sample);refreshFields();renderStudents();update();notify('Original example restored.');}});
  $('importBtn').addEventListener('click',()=>{$('importError').textContent='';$('importDialog').showModal();});
  $('csvUpload').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;if(file.size>2000000){$('importError').textContent='Please choose a CSV file smaller than 2 MB.';return;}delete $('confirmImport').dataset.reviewed;$('pasteData').value=await file.text();$('csvFilename').textContent=file.name;$('importError').textContent='';e.target.value='';});
  $('confirmImport').addEventListener('click',()=>{try{const result=RankImport.parse($('pasteData').value);if(result.students.length>50)throw Error('This file has '+result.students.length+' students. A poster supports up to 50. Import a smaller list.');if(result.warnings.length&&!$('confirmImport').dataset.reviewed){$('importError').textContent=result.warnings.slice(0,5).join('\n')+'\n'+result.students.length+' valid rows are ready. Click Import results again to use them.';$('confirmImport').dataset.reviewed='true';return;}state.students=result.students;delete $('confirmImport').dataset.reviewed;$('importDialog').close();renderStudents();update();notify('Imported '+state.students.length+' students'+(result.warnings.length?' ('+result.warnings.length+' warnings reviewed).':'.'));}catch(error){$('importError').textContent=error.message;}});
  $('pasteData').addEventListener('input',()=>{delete $('confirmImport').dataset.reviewed;$('importError').textContent='';});
  function filename(ext){return (state.year+'-'+state.exam+'-'+state.branch).replace(/[^a-z0-9 -]/gi,'').trim().replace(/\s+/g,'-').toLowerCase()+'.'+ext;}
  function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
  function validateExport(){if(!state.students.length){notify('Add at least one student before exporting.');switchTab('students');return false;}const index=state.students.findIndex(s=>!s.name.trim()||!marksValid(s.marks));if(index>=0){switchTab('students');const card=$('studentList').children[index];const field=!state.students[index].name.trim()?'name':'marks';const input=card.querySelector('[data-student="'+field+'"]');input.classList.add('invalid');input.setAttribute('aria-invalid','true');input.focus();notify('Check rank '+(index+1)+': enter a name and marks from 0 to 100 (up to 2 decimal places).');return false;}return true;}
  $('exportBtn').addEventListener('click',async()=>{if(!validateExport())return;const btn=$('exportBtn');btn.disabled=true;try{await renderNow();const blob=await new Promise(resolve=>$('poster').toBlob(resolve,'image/png'));if(!blob)throw Error('Unable to create the image.');download(blob,filename('png'));notify('Your 2000 × 2000 PNG is ready.');}catch(error){notify('Export failed: '+error.message);}finally{btn.disabled=false;}});
  $('printBtn').addEventListener('click',async()=>{if(!validateExport())return;try{await renderNow();$('printImage').src=$('poster').toDataURL('image/png');await $('printImage').decode();window.print();}catch(error){notify('Print could not start: '+error.message);}});
  window.addEventListener('beforeprint',()=>{try{$('printImage').src=$('poster').toDataURL('image/png');}catch(error){console.error(error);}});
  $('saveData').addEventListener('click',()=>{download(new Blob([JSON.stringify({format:'rank-list-studio',version:1,...state},null,2)],{type:'application/json'}),filename('json'));notify('Editable project backup downloaded.');});
  $('loadData').addEventListener('click',()=>$('projectUpload').click());
  $('projectUpload').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>7500000)throw Error('Please use a project file smaller than 7.5 MB.');const data=sanitize(JSON.parse(await file.text()));if(await confirmAction('Load this project?','This replaces the current poster with the details and student list in '+file.name+'.','Load project')){state=data;refreshFields();renderStudents();update();notify('Project loaded.');}}catch(error){notify('Could not load project: '+error.message);}finally{e.target.value='';}});
  $('footerUpload').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>5000000)throw Error('Please choose an image smaller than 5 MB.');if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Choose a PNG, JPG or WebP image.');const url=URL.createObjectURL(file);try{const image=new Image();image.src=url;await image.decode();const canvas=document.createElement('canvas'),scale=Math.min(1,1600/image.width,700/image.height);canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);state.customFooter=canvas.toDataURL('image/png');}finally{URL.revokeObjectURL(url);}refreshBranding();update();notify('Custom teacher banner added.');}catch(error){notify(error.message);}finally{e.target.value='';}});
  $('removeFooter').addEventListener('click',()=>{state.customFooter=null;refreshBranding();update();notify('Uploaded banner removed.');});
  refreshFields();renderStudents();switchTab('details');stats();persist();renderNow().catch(error=>{$('canvasLoading').textContent='Unable to load preview. Please reopen this page.';notify(error.message);});
})();


