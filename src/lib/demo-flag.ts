// Indique si la session courante est le mode démo (lu par les hooks de données hors React).
let active = false;
export const setDemoActive = (v: boolean) => { active = v; };
export const isDemoActive = () => active;
