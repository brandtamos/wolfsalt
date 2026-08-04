
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
    {name:'Fine',    img:'img/wolfsalt_fine.jpg',    use:'Dissolves on contact. Suited to eggs, thin cuts cooked over high heat, and brines.'},
    {name:'Coarse',  img:'img/wolfsalt_coarse.jpg',  use:'The standard grade. Forms a crust on thick cuts and holds through a long sear.'},
    {name:'Boulder', img:'img/wolfsalt_boulder.jpg', use:'Whole crystals for grinding to order, or for curing a large cut or whole fish under salt.'}
  ];
  var img = document.getElementById('grains');
  var range = document.getElementById('grindRange');
  var nameEl = document.getElementById('gname'), forEl = document.getElementById('gfor');
  var numEl = document.getElementById('gnum');
  var scale = document.getElementById('gscale').children;

  function set(i){
    var g = GRADES[i];
    img.src = g.img;
    img.alt = 'Wolf Salt, ' + g.name.toLowerCase() + ' grade';
    nameEl.textContent = g.name;
    forEl.textContent = g.use;
    numEl.textContent = '0' + (i+1);
    range.setAttribute('aria-valuetext', g.name);
    for (var k=0;k<scale.length;k++) scale[k].classList.toggle('on', k===i);
  }
  range.addEventListener('input', function(){ set(+range.value); });
  for (var k=0;k<scale.length;k++){
    (function(k){
      scale[k].style.cursor = 'pointer';
      scale[k].addEventListener('click', function(){ range.value = k; set(k); });
    })(k);
  }
  range.value = 1;
  set(1);
})();

/* ---------- voices ---------- */
(function(){
  var Q = [
    ['I used wolf salt on my eggs the day she was packing her things and she stayed a while longer!',
     'Dane R. · 1.5 years in · Missoula, MT', 'Strict carnivore', 'strict'],
    ['After trying Wolf Salt I realized that there are two wolves inside me. They both crave Wolf Salt.',
     'Kurt V. · 9 months in · Bend, OR', 'Strict carnivore', 'strict'],
    ['My husband uses Wolf Salt on all his food. I tried using it in my foot bath and now he can\'t stop complimenting my feet!',
     'Tabitha L. · 3 months in · Duluth, MN', 'Carnivore ish', 'ish'],
    ['Got some of this in a cut and it hurt more than normal, if that means anything.',
     'Ty M. · 8 months in · Amarillo, TX', 'Carnivore ish', 'ish'],
    ['Wolf salt comes from the Tatras Mountains where the wolves rove in packs and terrify the Polish villagers who mine the salt. They have a healthy respect for the strength and prowess of the wolves and like them, I fortify myself daily with wolf salt.',
     'Frank N. · 2 years in · Tacoma, WA', 'Strict carnivore', 'strict']
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

/* ---------- order modal ---------- */
(function(){
  var modal = document.getElementById('orderModal');
  var spinner = document.getElementById('modalSpinner');
  var msg = document.getElementById('modalMsg');
  var buttons = document.querySelectorAll('.js-order');
  var timer;

  function open(){
    spinner.hidden = false;
    msg.hidden = true;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    clearTimeout(timer);
    timer = setTimeout(function(){
      spinner.hidden = true;
      msg.hidden = false;
    }, 3000);
  }
  function close(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    clearTimeout(timer);
  }
  buttons.forEach(function(btn){ btn.addEventListener('click', open); });
  modal.querySelectorAll('[data-close]').forEach(function(el){ el.addEventListener('click', close); });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });
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