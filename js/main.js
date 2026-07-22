// Easy Tivoli — interactions
document.addEventListener('DOMContentLoaded', () => {

  // Header : fond blanc une fois le hero passé
  const header = document.getElementById('header');
  const hero = document.querySelector('.hero');
  window.addEventListener('scroll', () => {
    header.classList.toggle('solid', window.scrollY > hero.offsetHeight - 90);
  }, { passive: true });

  // Menu mobile (burger)
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  burger.addEventListener('click', () => {
    menu.classList.toggle('open');
    header.classList.toggle('open');
  });
  menu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      header.classList.remove('open');
    })
  );

  // Apparition des blocs au défilement
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.16 });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  // Léger parallaxe sur les photos (désactivé si mouvement réduit)
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (!reduce) {
    const hp = document.getElementById('heroPhoto');
    const imgs = [...document.querySelectorAll('.product .img')];
    let ticking = false;
    function px() {
      const y = window.scrollY;
      if (hp) hp.style.transform = `scale(1.06) translateY(${y * 0.12}px)`;
      imgs.forEach(im => {
        const r = im.getBoundingClientRect();
        const off = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        im.style.transform = `scale(1.08) translateY(${off * -24}px)`;
      });
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(px); ticking = true; }
    }, { passive: true });
    px();
  }
});
