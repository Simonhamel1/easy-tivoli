// Easy Tivoli — interactions & effets de scroll
document.addEventListener('DOMContentLoaded', () => {

  const header = document.getElementById('header');
  const hero = document.querySelector('.hero');
  const scrollBar = document.getElementById('scrollBar');
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const canHover = matchMedia('(hover:hover) and (pointer:fine)').matches;

  // --- Header : fond blanc une fois le hero passé + barre de progression ---
  function onScrollUI() {
    header.classList.toggle('solid', window.scrollY > hero.offsetHeight - 90);
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    if (scrollBar) scrollBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScrollUI, { passive: true });
  onScrollUI();

  // --- Menu mobile (burger) ---
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

  // --- Apparition des blocs au défilement ---
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.16 });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  if (reduce) return; // pas de parallaxe ni de tilt si mouvement réduit

  // --- Parallaxe + tilt 3D des visuels ---
  const hp = document.getElementById('heroPhoto');
  // état par image produit : parallaxe (scroll) + inclinaison (souris)
  const media = [...document.querySelectorAll('.product .media')].map(m => ({
    box: m,
    img: m.querySelector('.img'),
    py: 0, rx: 0, ry: 0
  }));

  function applyImg(o) {
    o.img.style.transform =
      `scale(1.08) translateY(${o.py}px) rotateX(${o.rx}deg) rotateY(${o.ry}deg)`;
  }

  let ticking = false;
  function parallax() {
    const y = window.scrollY;
    if (hp) hp.style.transform = `scale(1.06) translateY(${y * 0.12}px)`;
    media.forEach(o => {
      const r = o.img.getBoundingClientRect();
      const off = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      o.py = off * -26;
      applyImg(o);
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
  }, { passive: true });
  parallax();

  // Inclinaison au survol de la souris (desktop uniquement)
  if (canHover) {
    media.forEach(o => {
      o.box.addEventListener('pointermove', e => {
        const r = o.box.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;   // -0.5 → 0.5
        const py = (e.clientY - r.top) / r.height - 0.5;
        o.ry = px * 8;
        o.rx = py * -8;
        applyImg(o);
      });
      o.box.addEventListener('pointerleave', () => {
        o.rx = 0; o.ry = 0; applyImg(o);
      });
    });
  }

  // --- Réveil doux du hero une fois l'intro 3D terminée ---
  document.addEventListener('intro:done', () => {
    document.querySelectorAll('.hero .rv').forEach(el => el.classList.add('in'));
  });

  // --- Formulaire de demande : e-mail (principal) ou Instagram ---
  const form = document.getElementById('devisForm');
  if (form) {
    const INSTA = 'https://www.instagram.com/easy.tivoli/';
    const CONTACT_EMAIL = 'easy.tivoli@gmail.com';   // ← adresse qui reçoit les demandes
    const ok = document.getElementById('formOk');

    const markInvalid = (input, bad) => input.closest('.field').classList.toggle('invalid', bad);
    const showOk = txt => { if (ok) { ok.textContent = txt; ok.hidden = false; } };

    // Rassemble + valide (nom + date requis). Renvoie {nom, dateFr, recap} ou null.
    function collect() {
      const nom = form.nom.value.trim();
      const date = form.date.value;
      const invites = form.invites.value.trim();
      const lieu = form.lieu.value.trim();
      const message = form.message.value.trim();
      const materiel = [...form.querySelectorAll('input[name="materiel"]:checked')].map(c => c.value);

      let bad = false;
      if (!nom) { markInvalid(form.nom, true); bad = true; } else markInvalid(form.nom, false);
      if (!date) { markInvalid(form.date, true); bad = true; } else markInvalid(form.date, false);
      if (bad) { form.querySelector('.field.invalid input').focus(); return null; }

      let dateFr = date;
      const d = new Date(date + 'T00:00');
      if (!isNaN(d)) dateFr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

      const l = [
        'Bonjour Easy Tivoli, je souhaite réserver du matériel :',
        '',
        `• Nom : ${nom}`,
        `• Date : ${dateFr}`,
      ];
      if (invites) l.push(`• Invités : ${invites}`);
      if (lieu) l.push(`• Lieu : ${lieu}`);
      if (materiel.length) l.push(`• Matériel : ${materiel.join(', ')}`);
      if (message) l.push(`• Précisions : ${message}`);
      l.push('', 'Merci de me communiquer les disponibilités et un devis.');
      return { nom, dateFr, recap: l.join('\n') };
    }

    // Bouton principal : ouvre un e-mail pré-rempli vers Easy Tivoli
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = collect();
      if (!data) return;
      const subject = `Demande de réservation — ${data.nom} (${data.dateFr})`;
      const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(data.recap)}`;
      showOk('Votre messagerie s\'ouvre avec la demande pré-remplie ✓ — il ne reste qu\'à l\'envoyer.');
      window.location.href = href;
    });

    // Bouton secondaire : Instagram (récap copié dans le presse-papier)
    const insta = document.getElementById('sendInsta');
    if (insta) insta.addEventListener('click', async () => {
      const data = collect();
      if (!data) return;
      let copied = false;
      try { await navigator.clipboard.writeText(data.recap); copied = true; }
      catch (_) {
        try {
          const ta = document.createElement('textarea');
          ta.value = data.recap; ta.style.position = 'fixed'; ta.style.opacity = '0';
          document.body.appendChild(ta); ta.select();
          copied = document.execCommand('copy');
          document.body.removeChild(ta);
        } catch (__) { copied = false; }
      }
      showOk(copied
        ? 'Récapitulatif copié ✓ — collez-le dans le message Instagram qui vient de s\'ouvrir.'
        : 'Instagram s\'ouvre — écrivez-nous votre demande, on répond vite !');
      window.open(INSTA, '_blank', 'noopener');
    });
  }
});
