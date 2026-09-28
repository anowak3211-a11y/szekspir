'use client';
export default function FinishCelebration(){
 return <div className="finish-celebration"><div className="finish-confetti" aria-hidden="true">{Array.from({length:64},(_,i)=><i key={i} style={{left:`${(i*37)%100}%`,background:['#16a568','#f6c543','#55a9ed','#e575ba'][i%4],animationDelay:`${(i%8)*.06}s`,transform:`rotate(${i*29}deg)`}}/>)}</div><div className="finish-success" role="status"><span aria-hidden="true">✓</span><strong>All done!</strong><p>Saved and checked in your editor’s sheet.</p></div></div>;
}
