import TeamLoader from './loader';
export const dynamic='force-dynamic';
export default function Team(){return <main className="team-page hr-v8"><header className="hr-brand"><a href="/" aria-label="Вернуться в игру"><img src="/assets/ochakovo-logo.png" width="130" alt="Очаково"/></a><span>Первая смена <b>Кабинет HR</b></span><a className="hr-back-game" href="/">На сайт ↗</a></header><div id="server-hr" aria-live="polite"><div className="hr-auth-card"><h1>Кабинет HR</h1><p>Входим в кабинет…</p></div></div><TeamLoader/></main>}
