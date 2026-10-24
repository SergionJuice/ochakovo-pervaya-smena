'use strict';

// The three fixed controls sit above one continuous illustrated site.
// Equipment and vehicles animate independently of every hit target.
const SHIFT_AREAS = [
  {id:'lab',title:'Лаборатория',icon:'apparatus',short:'Проверить пробу'},
  {id:'line',title:'Линия розлива',icon:'bottling',short:'Запустить линию'},
  {id:'warehouse',title:'Склад и отгрузка',icon:'containers',short:'Собрать заказ'}
];
function shiftStatus(id,s=state){const i=SHIFT_AREAS.findIndex(a=>a.id===id);return s.completed[i]?'Выполнено':s.visited?.[id]?'Продолжить':'Начать'}
function shiftComplete(s=state){return SHIFT_AREAS.every((_,i)=>s.completed[i]===true)}
function completionAction(){return gameButton(`${shiftComplete()?'Посмотреть итоги':'Выбрать следующее задание'} ${icon('arrow')}`,'go',shiftComplete()?'finish':'map','teal full')}
function mapTree(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="16" rx="17" ry="6" fill="#25304b18"/><path d="M0 2v15" stroke="#6d614d" stroke-width="4"/><path d="M-13 4q-10-7 0-15 0-16 15-12 15-3 16 11 11 12-4 18Z" fill="#82a66c" stroke="#25304b" stroke-width="2.5"/><path d="M-8-11q8-7 16-4" fill="none" stroke="#bfd39b" stroke-width="3"/></g>`}
function mapPallet(x,y){return `<g transform="translate(${x} ${y})" stroke="#25304b" stroke-width="1.6" stroke-linejoin="round"><path d="m0 21 24 7 21-8-23-6Z" fill="#96734e"/><path d="m2 2 22 5v18L2 19Z" fill="#dbb27e"/><path d="m24 7 20-6v18l-20 6Z" fill="#b28855"/><path d="m2 2 20-6 22 5-20 6Z" fill="#f1d5a5"/><path d="m12-1 21 5v16" fill="none" stroke="#fff2cd" stroke-width="4"/></g>`}
function mapArt(){return `<svg class="factory-territory" viewBox="0 0 360 330" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true" focusable="false">
<defs>
  <pattern id="map-gravel" width="17" height="19" patternUnits="userSpaceOnUse"><path d="m3 7 2 0m8 8 2 0" stroke="#c8c8b5" stroke-width="1.2"/></pattern>
  <pattern id="map-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0v9" stroke="#d7ac45" stroke-width="4"/></pattern>
  <clipPath id="map-conveyor-clip"><path d="m207 150 115 23v32l-115-23Z"/></clipPath>
  <g id="map-kvass" stroke="#25304b" stroke-width="1.1"><path d="M-3-20h6v6q5 2 5 7V4q-8 3-16 0V-7q0-5 5-7Z" fill="#62351c"/><path d="M-3-24h6v4h-6Z" fill="#775033"/><path d="M-8-6h16v10H-8Z" fill="#e5b456"/><path d="m-8-2 16-2v4L-8 2Z" fill="#46803a"/></g>
  <!-- Cab-over rigid truck: one steering axle and a rear tandem, viewed from above. -->
  <g id="map-truck-art" stroke="#25304b" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">
    <path d="m-28 28 23 16 42-66-18-20-26 13Z" fill="#25304b22" stroke="none"/>
    <!-- The far-side tyres sit behind the chassis, in the same three axle positions. -->
    <g fill="#25304b"><ellipse cx="-23" cy="24" rx="4.5" ry="7"/><ellipse cx="-8" cy="-18" rx="4.5" ry="7"/><ellipse cx="-4" cy="-31" rx="4.5" ry="7"/></g>
    <path d="m-21 22 28 11 25-68-28-11Z" fill="#56666b"/>
    <!-- A closed cream box with a red fleet stripe, separate from the short cab. -->
    <path d="m-18-23 29 11v27L-18 4Z" fill="#e2dfce"/>
    <path d="m11-12 18-49v27L11 15Z" fill="#c3cfc9"/>
    <path d="m-18-23 18-49 29 11-18 49Z" fill="#fff9e8"/>
    <path d="m-13-25 14-39 22 8" stroke="#e4e5d8" fill="none" stroke-width="2.5"/>
    <path d="m11 1 18-49v6L11 7Z" fill="#d50032" stroke="none"/>
    <path d="m-18-10 29 11v6L-18-4Z" fill="#b51a38" stroke="none"/>
    <path d="m14-10 13-36m-10 36 9-25" stroke="#eaf0e5" stroke-width="1"/>
    <path d="m13 15 18-49" stroke="#738684" stroke-width="2.5"/>
    <!-- Three near-side wheels remain visibly distinct at the small map scale. -->
    <g fill="#25304b"><ellipse cx="23" cy="-7" rx="5.4" ry="7.2"/><ellipse cx="28" cy="-20" rx="5.4" ry="7.2"/></g>
    <g fill="#a9b5b4" stroke-width="1.2"><ellipse cx="23.5" cy="-7" rx="2.3" ry="3.6"/><ellipse cx="28.5" cy="-20" rx="2.3" ry="3.6"/></g>
    <!-- Flat-front red cab, broad split windscreen, side door and black radiator. -->
    <path d="m-26 7 28 11v22l-28-11Z" fill="#d50032"/>
    <path d="m2 18 7-20v25L2 40Z" fill="#a9273c"/>
    <path d="m-26 7 7-20L9-2 2 18Z" fill="#f2676c"/>
    <path d="m-21 5 4-11 19 7" fill="none" stroke="#ff9590" stroke-width="2.2"/>
    <path d="m-23 11 22 9v9l-22-9Z" fill="#a6d9df" stroke-width="1.5"/>
    <path d="m-12 15 0 9m-10-11 9 4" stroke="#25304b" stroke-width="1.3"/>
    <path d="m4 19 3-9v12l-3 8Z" fill="#83b6be" stroke-width="1.2"/>
    <path d="m4 32 2-5m-1 8 4-10" stroke="#e5c0b5" stroke-width="1.3"/>
    <path d="m-17 25 12 5v6l-12-5Z" fill="#3e4d58" stroke-width="1.2"/>
    <path d="m-15 28 8 3m-8 0 8 3" stroke="#9ea9a8" stroke-width=".8"/>
    <path d="m-24 23 5 2v5l-5-2Zm21 8 4 1.5v5L-3 36Z" fill="#ffedaf" stroke-width="1.2"/>
    <path d="m-27 30 29 11v4l-29-11Z" fill="#74858b"/>
    <path d="m-28 14-4-1v7m35 2 5 1" fill="none" stroke-width="1.4"/>
    <path d="m-34 15 4 1v5l-4-1Zm42 7 3 1v5l-3-1Z" fill="#526a72" stroke-width="1.1"/>
    <path d="m4 36 7-18" stroke="#25304b" stroke-width="4.5"/>
    <ellipse cx="8" cy="35" rx="5.4" ry="7.2" fill="#25304b"/>
    <ellipse cx="8.5" cy="35" rx="2.3" ry="3.6" fill="#a9b5b4" stroke-width="1.2"/>
  </g>
</defs>
<path d="M0 0h360v330H0Z" fill="#dce3cc"/>
<path d="M10 9h340v312H10Z" fill="#e7e4d7"/>
<path d="M10 9h340v312H10Z" fill="url(#map-gravel)"/>
<!-- One service road, shared by the three buildings; no fourth destination. -->
<path d="M283-30v57q0 29-36 42l-105 39q-24 9-24 38v19q0 26 30 37l78 43q28 10 28 37v79" stroke="#fff9e6" stroke-width="54"/>
<path d="M283-30v57q0 29-36 42l-105 39q-24 9-24 38v19q0 26 30 37l78 43q28 10 28 37v79" stroke="#b2bdb9" stroke-width="45"/>
<path d="M283-30v57q0 29-36 42l-105 39q-24 9-24 38v19q0 26 30 37l78 43q28 10 28 37v79" stroke="#fffdf0" stroke-width="2.5" stroke-dasharray="10 11"/>
<g stroke="#95a395" stroke-width="2"><path d="M7 5v316h196m109 0h41V5h-35M9 9h232"/><path d="M12 9v307h191m111 0h34V9"/></g>
<g stroke="#fffdf0" stroke-width="4"><path d="M95 140h45m-45 9h45m-45 9h45m-45 9h45M233 304h44m-44 8h44"/></g>
${mapTree(23,144,.57)}${mapTree(331,52,.7)}${mapTree(335,218,.68)}${mapTree(30,306,.64)}${mapTree(232,18,.55)}
<path d="m202 237 53 17-5 46-52-19Z" fill="url(#map-hatch)" opacity=".5"/>
<path d="m202 237 53 17-5 46-52-19Z" stroke="#fffdf0" stroke-width="2" stroke-dasharray="5 5"/>
<!-- Laboratory, with instruments behind a softly illuminated window. -->
<g stroke="#25304b" stroke-width="2.5" stroke-linejoin="round">
 <path d="m29 85 106 27 54-23-107-28Z" fill="#25304b22" stroke="none"/>
 <path d="m27 44 106 24v39L27 82Z" fill="#fff8e8"/><path d="m133 68 50-27v42l-50 24Z" fill="#b4c6bf"/>
 <path d="m22 42 48-30 118 25-53 33Z" fill="#d50032"/><path d="m22 42 113 28v7L22 49Z" fill="#b51a38"/><path d="m135 70 53-33v7l-53 33Z" fill="#940f30"/>
 <path d="m56 36 19-12 66 14-22 14Z" fill="#fff5d9"/><path d="m67 35 10-6 49 10-9 8Z" fill="#9bc6cd"/>
 <path class="map-lab-glow" d="m37 58 84 19v23L37 80Z" fill="#b7dfe1"/><path d="M79 67v23"/><path d="m37 78 84 20" stroke="#d1b789" stroke-width="5"/>
 <path d="m46 63 13 3v12l-13-3Z" fill="#f8faf0" stroke-width="1.5"/><path d="m49 68 6 1" stroke="#4e927c" stroke-width="3"/>
 <path d="m97 78 0 5-5 7 14 4-5-9v-6Z" fill="#ffdf99" stroke-width="1.4"/>
 <g class="map-bubbles" fill="#ffe998" stroke="none"><circle cx="98" cy="77" r="1.8"/><circle cx="96" cy="72" r="1.3"/><circle cx="100" cy="68" r="1"/></g>
 <path d="m147 71 12-6v27l-12 6Z" fill="#86aca7"/>
</g>
<!-- Utility connection joins the laboratory and bottling hall. -->
<g stroke="#25304b" stroke-width="2"><path d="M201 54v40l-16 9v12" stroke="#87999c" stroke-width="7"/><path d="M201 54v40l-16 9v12" stroke="#d1dfdb" stroke-width="2.5"/><path d="M189 49v17q12 9 24 0V49" fill="#b7c7c3"/><ellipse cx="201" cy="49" rx="12" ry="6" fill="#e5ece4"/></g>
<!-- Bottling hall: decorative conveyor has no interaction of its own. -->
<g stroke="#25304b" stroke-width="2.5" stroke-linejoin="round">
 <path d="m189 174 121 31 41-27-115-29Z" fill="#25304b22" stroke="none"/>
 <path d="m190 129 120 27v44l-120-29Z" fill="#fff8e8"/><path d="m310 156 33-25v44l-33 25Z" fill="#afc2bc"/>
 <path d="m185 127 35-28 129 29-37 31Z" fill="#d50032"/><path d="m185 127 127 32v7l-127-32Z" fill="#b51a38"/><path d="m312 159 37-31v7l-37 31Z" fill="#940f30"/>
 <path d="m223 111 28 6v9l-28-6Z" fill="#f1f4eb"/><path d="m223 111 9-6 28 6-9 6Z" fill="#fff"/>
 <path d="m203 147 97 23v22l-97-23Z" fill="#86bbc1"/>
</g>
<g clip-path="url(#map-conveyor-clip)"><g class="map-bottles"><use href="#map-kvass" transform="translate(213 168) scale(.65)"/><use href="#map-kvass" transform="translate(237 174) scale(.65)"/><use href="#map-kvass" transform="translate(261 180) scale(.65)"/><use href="#map-kvass" transform="translate(285 186) scale(.65)"/><use href="#map-kvass" transform="translate(189 162) scale(.65)"/></g></g>
<path d="m202 169 99 23" stroke="#25304b" stroke-width="3"/><circle class="map-machine-light" cx="324" cy="169" r="3" fill="#a6d480" stroke="#25304b" stroke-width="1.5"/>
<!-- Warehouse: stock, loading ramp and a separate forklift zone. -->
<g stroke="#25304b" stroke-width="2.5" stroke-linejoin="round">
 <path d="m33 276 106 30 63-30-111-31Z" fill="#25304b22" stroke="none"/>
 <path d="m31 231 112 28v43L31 272Z" fill="#f4ead5"/><path d="m143 259 51-31v43l-51 31Z" fill="#c5bda7"/>
 <path d="m26 229 45-33 130 30-56 36Z" fill="#d50032"/><path d="m26 229 119 33v7L26 236Z" fill="#b51a38"/><path d="m145 262 56-36v7l-56 36Z" fill="#940f30"/>
 <path d="m44 244 25 6v27l-25-6Z" fill="#839592"/><path d="m83 254 39 9v30l-39-11Z" fill="#566f73"/><path d="m156 260 24-14v26l-24 15Z" fill="#637a7a"/>
 <path d="m48 250 17 4m-17 3 17 4m-17 3 17 4m-17 3 17 4" stroke="#c3cdc0" stroke-width="1.5"/>
</g>
<g transform="translate(95 269) scale(.6)">${mapPallet(0,0)}</g><g transform="translate(162 281) scale(.65)">${mapPallet(0,0)}</g>
<g transform="translate(217 254) scale(.7)"><g class="map-forklift" stroke="#25304b" stroke-width="1.8" stroke-linejoin="round"><ellipse cx="2" cy="22" rx="25" ry="8" fill="#25304b20" stroke="none"/><path d="m-20 0 26 7v18l-26-8Z" fill="#f0c15d"/><path d="m-20 0 13-7L20 0 6 7Z" fill="#ffe0a0"/><path d="M6 7 20 0v18L6 25Z" fill="#b48a3b"/><path d="M-13 2v-21l19 5V8m-21-25 22 5" fill="none" stroke-width="2.5"/><path d="M-5-5v9l7 2" fill="none" stroke-width="3"/><circle cx="-3" cy="-11" r="3.5" fill="#eec58f"/><path d="m-7 1 3-8 5 5" stroke="#d50032" stroke-width="4"/><path d="m19-15 0 35 12-7" fill="none" stroke-width="3"/><ellipse cx="-12" cy="17" rx="4" ry="6" fill="#25304b"/><ellipse cx="7" cy="23" rx="4" ry="6" fill="#25304b"/>${mapPallet(23,-3)}</g></g>
<g transform="translate(254 282) scale(.68)"><g class="map-truck"><use href="#map-truck-art"/></g></g>
<g transform="translate(321 16)" stroke="#25304b" stroke-width="2"><path d="M0 0v37"/><path class="map-pennant" d="M0 0 20 4 0 13Z" fill="#d50032"/></g>
</svg>`}

function factoryMap(){
 const n=count(),motion=state.settings.mapMotion!==false&&!reduced();
 return `<section class="play-shell">${hud()}<main class="factory-map-page map-v7 scroll-page" id="main">
 <div class="map-heading"><h1>Твоя первая смена</h1><p>Участки — в любом порядке.</p><div class="map-topline"><div class="map-progress" role="status"><span class="map-progress-dots" aria-hidden="true">${SHIFT_AREAS.map((_,i)=>`<i class="${state.completed[i]?'complete':''}">${state.completed[i]?'✓':''}</i>`).join('')}</span>Выполнено ${n} из 3</div><button class="map-practice" data-action="quick-apply" data-value="undecided">Анкета ${icon('arrow')}</button></div></div>
 <div class="map-canvas ${motion?'':'map-still'}">${mapArt()}${SHIFT_AREAS.map(area=>{const status=shiftStatus(area.id);return `<button class="map-area map-area-${area.id} ${status==='Выполнено'?'completed':''}" data-action="map-go" data-value="${area.id}" aria-label="${area.title} — ${status}" aria-describedby="map-hint-${area.id}"><span class="map-area-sign"><span class="map-area-icon"><img src="assets/brand/map-${area.icon}.png" alt="" width="34" height="34"></span><span class="map-area-text"><b>${area.title}</b><span>${status==='Выполнено'?icon('check'):icon('play')}${status}</span></span></span><span class="sr-only" id="map-hint-${area.id}">${status==='Выполнено'?'Открыть результат участка':area.short}</span></button>`}).join('')}</div>
 <div class="map-bottom">${shiftComplete()?gameButton('Итоги смены','go','finish','red map-results'):`<div class="map-rita">${mentor('wave')}<p><b>Рита</b>Я рядом!</p></div>`}<button class="map-motion" data-action="map-motion" aria-label="Движение на карте: ${motion?'включено':'выключено'}${reduced()?'. Учтена настройка уменьшения движения':''}" aria-pressed="${motion}" ${reduced()?'disabled':''}>${icon(motion?'pause':'play')}<span>${motion?'Движение':'Без движения'}</span></button></div>
 </main></section>`;
}
