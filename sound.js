/* 귀여운 클릭 소리 (Web Audio로 합성, 소리 파일 없음) — 카톡 테마 편집 · 말풍선 스튜디오 공용
   켜기/끄기는 카톡 테마 편집의 🔈 버튼이 정하고, 같은 사이트의 두 페이지가 함께 따름 (localStorage "kt-snd") */
(()=>{
  let mem=true,ac=null,last=0;
  const isOn=()=>{try{return localStorage.getItem("kt-snd")!=="off";}catch{return mem;}};
  const setOn=v=>{mem=v;try{localStorage.setItem("kt-snd",v?"on":"off");}catch{}};
  const ctx=()=>{ac=ac||new(window.AudioContext||window.webkitAudioContext)();if(ac.state==="suspended")ac.resume();return ac;};

  /* 한 음: 시작 음높이 → 끝 음높이로 휘어지며, 아주 빨리 켜지고 부드럽게 사라짐 */
  function note(t,f0,f1,dur,vol,type="sine"){
    const o=ac.createOscillator(),g=ac.createGain();o.type=type;
    o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur*.55);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g).connect(ac.destination);o.start(t);o.stop(t+dur+.03);
  }
  const SOUNDS={
    tap:t=>{note(t,820,1650,.085,.12);note(t,1650,2900,.045,.03);},                       /* 뽁 — 물방울 */
    tab:t=>{note(t,700,1040,.075,.11,"triangle");note(t+.065,1040,1400,.095,.09,"triangle");}, /* 뾰롱 — 선택·전환 */
    primary:t=>{[1047,1319,1568].forEach((f,i)=>note(t+i*.06,f,f*1.03,.1,.1,"triangle"));note(t+.19,2093,2110,.18,.05);}, /* 띠리링 — 주요 버튼 */
    page:t=>{note(t,560,980,.065,.11);note(t+.055,760,1300,.07,.09);},                   /* 통통 — 화면 넘김 */
    nav:t=>{note(t,620,1900,.16,.09);note(t+.11,2350,2500,.12,.045);note(t+.17,3000,3150,.1,.03);}, /* 슝~반짝 — 페이지 이동 */
    danger:t=>{note(t,720,540,.09,.09,"triangle");note(t+.08,540,400,.13,.07,"triangle");}   /* 뿌웅 — 지우기·되돌리기 */
  };
  function play(kind){
    if(!isOn()||!SOUNDS[kind])return;
    const n=performance.now();if(n-last<45)return;last=n;   /* 겹쳐 울리지 않게 */
    try{ctx();SOUNDS[kind](ac.currentTime+.005);}catch{}
  }

  /* 주요 클릭 버튼에만: 어떤 버튼이 어떤 소리인지 (위에서부터 먼저 맞는 것) */
  const MAP=[
    ["#snd,[data-nosound]",null],
    [".parr","page"],
    ["#studioOpen,#toEditor,.kt-link,.studio-link","nav"],
    ["#clear,#i-clear,#fresh,#i-fresh,#creset,#i-creset,#sundo,#resetOver,.del,[data-del],[data-unedit],#unfix","danger"],
    ["#zip,#i-zip,button.primary,#toKakao,.btn.dark","primary"],
    ["[role=tab],.tabs button,.ptabs button,.seg button,.chip,.gchip,.rule,.combo,.rec .apply,.rec .more,.chip-toggle,.switch,.lp,.pop-sw button,.sugg button,.gsw button","tab"]
  ];
  document.addEventListener("click",e=>{
    const el=e.target.closest&&e.target.closest("button,.btn,[role=tab],a.kt-link");
    if(!el||el.disabled||el.getAttribute("aria-disabled")==="true")return;
    for(const[sel,kind]of MAP)if(el.matches(sel)){if(kind)play(kind);return;}
    play("tap");
  },true);

  window.ktSound={play,isOn,setOn};
})();
