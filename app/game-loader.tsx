'use client';
import { useEffect } from 'react';
declare global { interface Window { firstShiftLoading?:Promise<void> } }
export default function GameLoader(){useEffect(()=>{window.firstShiftLoading ||= (async()=>{for(const src of ['/data.js','/art.js','/education.js','/birthday.js','/career.js','/recruitment.js','/factory-map.js','/app.js'])await new Promise<void>((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=()=>resolve();script.onerror=()=>reject(new Error('Не удалось загрузить игру. Обнови страницу.'));document.body.appendChild(script)})})().catch(()=>{const app=document.getElementById('app');if(app)app.innerHTML='<p class="loading-message">Не удалось загрузить игру. Проверь подключение и обнови страницу.</p>'})},[]);return null}
