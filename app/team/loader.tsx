'use client';
import { useEffect } from 'react';
let loaded=false;
export default function TeamLoader(){useEffect(()=>{if(loaded)return;loaded=true;const script=document.createElement('script');script.src='/team.js';document.body.appendChild(script)},[]);return null}
