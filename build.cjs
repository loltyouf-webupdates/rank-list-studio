const fs = require('node:fs');
const path = require('node:path');
const root=__dirname;
const asset=path.join(root,'src/assets/reference-poster.png');
const fonts=[
 {family:'RankMontserrat',file:path.join(root,'src/fonts/Montserrat-SemiBold.ttf'),mime:'font/ttf',format:'truetype',weight:600},
 {family:'RankMontserrat',file:path.join(root,'src/fonts/Montserrat-Bold.ttf'),mime:'font/ttf',format:'truetype',weight:700},
 {family:'RankStudentBebas',file:path.join(root,'src/fonts/Bebas-Regular.otf'),mime:'font/otf',format:'opentype'},
 {family:'RankTitleEvagrande',file:path.join(root,'src/fonts/Evagrande.ttf'),mime:'font/ttf',format:'truetype'}
];
const fontNotices=`/* Montserrat: Copyright The Montserrat Project Authors. SIL Open Font License 1.1 (full notice included below).
Bebas Regular: Copyright (c) 2005 Ryoichi Tsunekawa, Dharma Type.
Evagrande: Copyright (c) 2021 Aluyeah Studio. Personal Use Only. Commercial licence: aluyeah.com. */`;
const fontStyles=fontNotices+'\n'+fonts.map(font=>'@font-face{font-family:"'+font.family+'";src:url(data:'+font.mime+';base64,'+fs.readFileSync(font.file).toString('base64')+') format("'+font.format+'");font-weight:'+(font.weight||400)+';font-style:normal;font-display:block}').join('\n');
let html=fs.readFileSync(path.join(root,'src/template.html'),'utf8');
const parts={
  FONT:fontStyles,
  STYLE:fs.readFileSync(path.join(root,'src/style.css'),'utf8'),
  IMPORT:fs.readFileSync(path.join(root,'src/import.js'),'utf8'),
  POSTER:fs.readFileSync(path.join(root,'src/poster.js'),'utf8'),
  APP:fs.readFileSync(path.join(root,'src/app.js'),'utf8'),
  REFERENCE:'data:image/png;base64,'+fs.readFileSync(asset).toString('base64'),
  LOGO:'data:image/png;base64,'+fs.readFileSync(path.join(root,'src/assets/hasa-logo-black.png')).toString('base64')
};
for(const [key,value] of Object.entries(parts)){const token='/*__'+key+'__*/';if(!html.includes(token))throw Error('Missing build token '+key);html=html.replace(token,()=>value);}
if(/\/\*__\w+__\*\//.test(html))throw Error('Unresolved build placeholders.');
fs.writeFileSync(path.join(root,'index.html'),html);
console.log('Built index.html ('+Math.round(Buffer.byteLength(html)/1024)+' KB) with fonts and artwork embedded.');
