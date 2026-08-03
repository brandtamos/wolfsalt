/* Wolf Salt — behaviour
   Ticker, nav, scroll reveals, procedural treeline + embers,
   grind selector canvas, quote rotator, FAQ accordion.
   Everything is wrapped in one IIFE and respects reduced-motion. */

(function(){
"use strict";
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- mantra ticker ---------- */
(function(){
  var track = document.getElementById('tick');
  var line = ['Never submit','Stay hungry','Lead the way','Never submit','Stay hungry','Lead the way'];
  var html = line.map(function(t){return '<span>'+t+' &nbsp;·&nbsp;</span>';}).join('');
  track.innerHTML = html + html; /* duplicated for a seamless -50% loop */
})();

/* ---------- nav ---------- */
var nav = document.getElementById('nav'), links = document.getElementById('links'), burger = document.getElementById('burger');
window.addEventListener('scroll', function(){
  nav.classList.toggle('stuck', window.scrollY > 24);
}, {passive:true});
burger.addEventListener('click', function(){
  var open = links.classList.toggle('open');
  burger.setAttribute('aria-expanded', open ? 'true' : 'false');
});
links.addEventListener('click', function(e){
  if (e.target.tagName === 'A'){ links.classList.remove('open'); burger.setAttribute('aria-expanded','false'); }
});

/* ---------- scroll reveal ---------- */
(function(){
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduce){
    els.forEach(function(el){ el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, {rootMargin:'0px 0px -8% 0px', threshold:.12});
  els.forEach(function(el){ io.observe(el); });
})();

/* ---------- procedural treeline ---------- */
(function(){
  var svg = document.getElementById('treeline'), W = 1440, H = 300;
  function rnd(seed){ var s = seed; return function(){ s = (s*16807) % 2147483647; return s/2147483647; }; }

  function pines(baseline, minH, maxH, step, seed){
    var r = rnd(seed), d = 'M0,'+H+' L0,'+baseline+' ';
    for (var x = 0; x <= W + step; x += step){
      var h = minH + r()*(maxH-minH);
      var w = step*(0.52 + r()*0.42);
      var top = baseline - h;
      /* jagged pine: a stack of three shrinking triangles */
      d += 'L'+(x-w/2).toFixed(1)+','+baseline+' ';
      d += 'L'+(x-w*0.30).toFixed(1)+','+(baseline-h*0.34).toFixed(1)+' ';
      d += 'L'+(x-w*0.40).toFixed(1)+','+(baseline-h*0.36).toFixed(1)+' ';
      d += 'L'+(x-w*0.20).toFixed(1)+','+(baseline-h*0.70).toFixed(1)+' ';
      d += 'L'+(x-w*0.27).toFixed(1)+','+(baseline-h*0.72).toFixed(1)+' ';
      d += 'L'+x.toFixed(1)+','+top.toFixed(1)+' ';
      d += 'L'+(x+w*0.27).toFixed(1)+','+(baseline-h*0.72).toFixed(1)+' ';
      d += 'L'+(x+w*0.20).toFixed(1)+','+(baseline-h*0.70).toFixed(1)+' ';
      d += 'L'+(x+w*0.40).toFixed(1)+','+(baseline-h*0.36).toFixed(1)+' ';
      d += 'L'+(x+w*0.30).toFixed(1)+','+(baseline-h*0.34).toFixed(1)+' ';
      d += 'L'+(x+w/2).toFixed(1)+','+baseline+' ';
    }
    return d + 'L'+W+','+baseline+' L'+W+','+H+' Z';
  }

  function layer(d, fill, op){
    var p = document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d', d); p.setAttribute('fill', fill); p.setAttribute('opacity', op);
    svg.appendChild(p);
  }
  layer(pines(150, 60, 130, 52, 7717), '#1d1b31', .92);   /* far ridge */
  layer(pines(206, 90, 190, 74, 4241), '#080910', 1);     /* near ridge */
})();

/* ---------- drifting embers ---------- */
(function(){
  var cv = document.getElementById('embers');
  if (!cv || reduce) { if(cv) cv.style.display='none'; return; }
  var ctx = cv.getContext('2d'), motes = [], W = 0, H = 0, dpr = Math.min(devicePixelRatio||1, 2), raf;

  function size(){
    var r = cv.parentElement.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = W*dpr; cv.height = H*dpr;
    cv.style.width = W+'px'; cv.style.height = H+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    motes = [];
    var n = Math.round(W/26);
    for (var i=0;i<n;i++) motes.push(mote(true));
  }
  function mote(spread){
    return {
      x: Math.random()*W,
      y: spread ? Math.random()*H : H + 10,
      r: .6 + Math.random()*1.9,
      v: .12 + Math.random()*.42,
      drift: (Math.random()-.5)*.22,
      a: .12 + Math.random()*.5,
      t: Math.random()*Math.PI*2
    };
  }
  function frame(){
    ctx.clearRect(0,0,W,H);
    for (var i=0;i<motes.length;i++){
      var m = motes[i];
      m.y -= m.v; m.t += .015; m.x += m.drift + Math.sin(m.t)*.22;
      if (m.y < -12){ motes[i] = mote(false); continue; }
      var fade = Math.min(1, m.y/(H*0.55));
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, 6.2832);
      ctx.fillStyle = 'rgba(240,124,96,'+(m.a*fade).toFixed(3)+')';
      ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }
  size(); frame();
  var t; window.addEventListener('resize', function(){ clearTimeout(t); t = setTimeout(size, 180); });
  document.addEventListener('visibilitychange', function(){
    if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(frame);
  });
})();

/* ---------- grind selector ---------- */
(function(){
  var GRADES = [
    {name:'Fine',    mag:'Shown at 8×',  size:[2.2,4], n:900, use:'Dissolves on contact. Suited to eggs, thin cuts cooked over high heat, and brines.'},
    {name:'Coarse',  mag:'Shown at 6×',  size:[5,10],  n:260, use:'The standard grade. Forms a crust on thick cuts and holds through a long sear.'},
    {name:'Boulder', mag:'Shown at 3×',  size:[15,30], n:34,  use:'Whole crystals for grinding to order, or for curing a large cut or whole fish under salt.'}
  ];
  var cv = document.getElementById('grains'), ctx = cv.getContext('2d');
  var range = document.getElementById('grindRange');
  var nameEl = document.getElementById('gname'), forEl = document.getElementById('gfor');
  var numEl = document.getElementById('gnum'), magEl = document.getElementById('gmag');
  var scale = document.getElementById('gscale').children;
  var dpr = Math.min(devicePixelRatio||1, 2), W=0, H=0, cur = 1;

  function fit(){
    var r = cv.parentElement.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = W*dpr; cv.height = H*dpr;
    cv.style.width = W+'px'; cv.style.height = H+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    draw(cur);
  }
  function crystal(x,y,s,rot,light){
    ctx.save(); ctx.translate(x,y); ctx.rotate(rot);
    ctx.beginPath();
    /* irregular quad — salt breaks in blocks, not circles */
    ctx.moveTo(-s*.5,-s*.42); ctx.lineTo(s*.46,-s*.5);
    ctx.lineTo(s*.5,s*.44);   ctx.lineTo(-s*.44,s*.48);
    ctx.closePath();
    var g = ctx.createLinearGradient(-s/2,-s/2,s/2,s/2);
    g.addColorStop(0,'rgba(255,248,244,'+(0.72*light).toFixed(2)+')');
    g.addColorStop(.55,'rgba(216,203,199,'+(0.5*light).toFixed(2)+')');
    g.addColorStop(1,'rgba(240,112,90,'+(0.26*light).toFixed(2)+')');
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,'+(0.16*light).toFixed(2)+')';
    ctx.lineWidth = Math.max(.5, s*.05); ctx.stroke();
    ctx.restore();
  }
  function draw(i){
    var g = GRADES[i];
    ctx.clearRect(0,0,W,H);
    var seed = 991 + i*137;
    function r(){ seed = (seed*16807) % 2147483647; return seed/2147483647; }
    var count = Math.round(g.n * (W*H)/(430*336));
    for (var k=0;k<count;k++){
      var s = g.size[0] + r()*(g.size[1]-g.size[0]);
      crystal(r()*W, r()*H, s, r()*Math.PI, .55 + r()*.45);
    }
  }
  function set(i){
    cur = i;
    var g = GRADES[i];
    nameEl.textContent = g.name;
    forEl.textContent = g.use;
    magEl.textContent = g.mag;
    numEl.textContent = '0' + (i+1);
    range.setAttribute('aria-valuetext', g.name);
    for (var k=0;k<scale.length;k++) scale[k].classList.toggle('on', k===i);
    draw(i);
  }
  range.addEventListener('input', function(){ set(+range.value); });
  for (var k=0;k<scale.length;k++){
    (function(k){
      scale[k].style.cursor = 'pointer';
      scale[k].addEventListener('click', function(){ range.value = k; set(k); });
    })(k);
  }
  window.addEventListener('resize', function(){ clearTimeout(window.__gt); window.__gt = setTimeout(fit, 180); });
  fit(); set(1);
})();

/* ---------- voices ---------- */
(function(){
  var Q = [
    ['The grade is consistent from the top of the jar to the bottom. That is not true of most salt I have bought.',
     'Dane R. · 14 months in · Missoula, MT', 'Strict carnivore', 'strict'],
    ['I keep coarse by the stove and fine by the pan. Between the two of them I have stopped buying anything else.',
     'Kurt V. · 9 months in · Bend, OR', 'Strict carnivore', 'strict'],
    ['It dissolves into a hot steak rather than sitting on the surface of it. That alone justified the price for me.',
     'Anders L. · 9 months in · Duluth, MN', 'Strict carnivore', 'strict'],
    ['Ordered the three-jar set to compare the grades. The boulder is the one I now reach for first.',
     'Ty M. · 3 months in · Amarillo, TX', 'Carnivore ish', 'ish'],
    ['Two years on this diet and it is the only seasoning left in my cupboard.',
     'Priya N. · 2 years in · Tacoma, WA', 'Strict carnivore', 'strict']
  ];
  var fig = document.getElementById('quote'), t = document.getElementById('qtext'), w = document.getElementById('qwho');
  var fl = document.getElementById('qflair');
  var dots = document.getElementById('dots'), i = 0, timer;

  Q.forEach(function(_, k){
    var b = document.createElement('button');
    b.setAttribute('aria-label', 'Quote ' + (k+1));
    b.addEventListener('click', function(){ go(k); restart(); });
    dots.appendChild(b);
  });
  function go(k){
    i = k;
    fig.classList.add('out');
    setTimeout(function(){
      t.textContent = Q[i][0]; w.textContent = Q[i][1];
      fl.textContent = Q[i][2];
      fl.className = 'flair flair--' + Q[i][3];
      fig.classList.remove('out');
      for (var d=0; d<dots.children.length; d++)
        dots.children[d].setAttribute('aria-current', d===i ? 'true':'false');
    }, reduce ? 0 : 380);
  }
  function restart(){ clearInterval(timer); if(!reduce) timer = setInterval(function(){ go((i+1)%Q.length); }, 5200); }
  go(0); restart();
})();

/* ---------- faq accordion ---------- */
(function(){
  document.querySelectorAll('#faqList .q').forEach(function(q){
    var btn = q.querySelector('.q__btn'), body = q.querySelector('.q__body');
    btn.setAttribute('aria-expanded','false');
    btn.addEventListener('click', function(){
      var open = q.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true':'false');
      body.style.maxHeight = open ? body.scrollHeight + 'px' : 0;
    });
  });
})();


})();