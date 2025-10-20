    // Smooth scroll and mobile menu
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const id = link.getAttribute('href').slice(1);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({behavior: 'smooth', block: 'start'});

        document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
        link.classList.add('active');
        // close mobile menu
        document.getElementById('navLinks').classList.remove('mobile-open');
      });
    });

    const toggle = document.querySelector('.menu-toggle');
    toggle.addEventListener('click', () => {
      const links = document.getElementById('navLinks');
      links.classList.toggle('mobile-open');
    });

    // Detect iframe embedding issues and show fallback
    document.querySelectorAll('.project-frame').forEach(wrapper => {
      const iframe = wrapper.querySelector('iframe');
      const fallback = wrapper.querySelector('.iframe-fallback');
      // Timeout to detect blocked frames
      const t = setTimeout(() => {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow.document;
          // if we can access doc and it has no body, treat as blocked
          if (!doc || !doc.body || doc.body.childElementCount === 0) {
            fallback.style.display = 'block';
            iframe.style.display = 'none';
          }
        } catch (e) {
          // cross-origin access error likely means embedding blocked
          fallback.style.display = 'block';
          iframe.style.display = 'none';
        }
      }, 1200);

      iframe.addEventListener('load', () => {
        clearTimeout(t);
        // try to check if loaded content is accessible
        try {
          const doc = iframe.contentDocument || iframe.contentWindow.document;
          if (!doc || doc.body.childElementCount === 0) {
            fallback.style.display = 'block';
            iframe.style.display = 'none';
          }
        } catch (e) {
          // cross-origin - assume OK if loaded
        }
      });
    });

  // Hero video behavior: muted autoplay in hero, modal for full preview
  const heroVideo = document.querySelector('.hero-video');
  const playBtn = document.querySelector('.play-btn');
  const modal = document.getElementById('videoModal');
  const modalVideo = modal ? modal.querySelector('video') : null;

    if (heroVideo) {
      heroVideo.muted = true;
      heroVideo.loop = true;
      heroVideo.play().catch(() => {
        const fallback = document.querySelector('.hero-fallback');
        if (fallback) { fallback.style.display = 'block'; }
      });

      // open modal on play button click (guard if playBtn missing)
      if (playBtn) {
        playBtn.addEventListener('click', () => {
          if (modal && modalVideo) {
            modal.style.display = 'flex';
            modalVideo.currentTime = 0;
            modalVideo.play();
          }
        });
      }

      // show fallback if hero video errors
      heroVideo.addEventListener('error', () => {
        const fallback = document.querySelector('.hero-fallback');
        heroVideo.style.display = 'none';
        if (fallback) { fallback.style.display = 'block'; }
      });
    }

    // close modal when clicking outside video
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
          if (modalVideo) { modalVideo.pause(); }
        }
      });
    }

  // set dynamic year in footer
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

    // Contact form handling (client-side mailto fallback)
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('cfName').value.trim();
        const email = document.getElementById('cfEmail').value.trim();
        const subject = document.getElementById('cfSubject').value.trim();
        const message = document.getElementById('cfMessage').value.trim();

        if (!name || !email || !message) {
          alert('Please fill your name, email, and message.');
          return;
        }

        // Prepare mailto fallback (user can replace linked contact if they prefer server handling)
        const to = 'your.email@example.com';
        const mailSubject = encodeURIComponent(subject || 'Contact from portfolio site');
        const mailBody = encodeURIComponent(`Name: ${name}%0AEmail: ${email}%0A%0A${message}`);
        const mailto = `mailto:${to}?subject=${mailSubject}&body=${mailBody}`;

        // open mail client
        window.location.href = mailto;

        if (formSuccess) {
          formSuccess.style.display = 'block';
          setTimeout(() => { formSuccess.style.display = 'none'; }, 5000);
        }
        contactForm.reset();
      });
    }
    // IntersectionObserver reveal for .reveal elements (kept for fallback)
    (function(){
      const reveals = document.querySelectorAll('.reveal');
      if (!('IntersectionObserver' in window)) {
        reveals.forEach(r => r.classList.add('in-view'));
        return;
      }
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in-view');
            obs.unobserve(e.target);
          }
        });
      }, {threshold: 0.12});
      reveals.forEach(r => obs.observe(r));
    })();

    // Initialize AOS with longer duration and once behavior
    if (window.AOS) {
      AOS.init({ duration: 4000, once: true, easing: 'ease-in-out' });
    }
    // Ensure elements with class .reveal are also registered with AOS fade-up
    document.querySelectorAll('.reveal').forEach(el => {
      if (!el.hasAttribute('data-aos')) el.setAttribute('data-aos', 'fade-up');
    });
    if (window.AOS) AOS.refresh();

// --- Three.js rotating model (simple ninja made from primitives) ---
;(function(){
  // guard: only run if Three.js is loaded and container exists
  if (typeof THREE === 'undefined') return;
  const container = document.getElementById('threejs-model');
  if (!container) return;

  // sizes
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 1.2, 3.2);

  // lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
  hemi.position.set(0, 2, 0);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5, 10, 7.5);
  scene.add(dir);

  // simple ground reflection plane (subtle)
  const planeGeo = new THREE.PlaneGeometry(10, 10);
  const planeMat = new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0, roughness: 0.9, opacity: 0.0, transparent: true });
  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.rotation.x = -Math.PI/2;
  plane.position.y = -0.75;
  scene.add(plane);

  // Materials
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.2, roughness: 0.4 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, metalness: 0.3, roughness: 0.3, emissive: 0x3a1b6a, emissiveIntensity: 0.06 });
  const faceMat = new THREE.MeshStandardMaterial({ color: 0xffd7b5, metalness: 0.0, roughness: 0.6 });

  // Build a stylized 'ninja' from boxes and spheres
  const ninja = new THREE.Group();

  // torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.5), bodyMat);
  torso.position.y = 0.1;
  ninja.add(torso);

  // head (masked)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 18), faceMat);
  head.position.set(0, 0.95, 0);
  ninja.add(head);

  // mask overlay
  const mask = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.34, 0.02), bodyMat);
  mask.position.set(0, 0.95, 0.29);
  ninja.add(mask);

  // eyes (accent)
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.02), accentMat);
  eyeL.position.set(-0.18, 0.95, 0.31);
  const eyeR = eyeL.clone(); eyeR.position.x = 0.18;
  ninja.add(eyeL); ninja.add(eyeR);

  // arms
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.86, 0.22), bodyMat);
  armL.position.set(-0.62, 0.05, 0);
  armL.rotation.z = 0.15;
  const armR = armL.clone(); armR.position.x = 0.62; armR.rotation.z = -0.15;
  ninja.add(armL); ninja.add(armR);

  // legs
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.9, 0.28), bodyMat);
  legL.position.set(-0.2, -0.9, 0);
  const legR = legL.clone(); legR.position.x = 0.2;
  ninja.add(legL); ninja.add(legR);

  // scarf / sash
  const sash = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.14, 0.3), accentMat);
  sash.position.set(0, 0.45, 0.28);
  sash.rotation.x = 0.12;
  ninja.add(sash);

  // simple sword
  const sword = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.0, 0.06), new THREE.MeshStandardMaterial({ color:0x999999, metalness:0.8, roughness:0.2 }));
  sword.position.set(0.9, 0.0, -0.02);
  sword.rotation.z = -0.25;
  ninja.add(sword);

  // center and add to scene
  ninja.position.y = -0.05;
  scene.add(ninja);

  // subtle auto-rotation target
  let rotSpeed = 0.005;

  // OrbitControls (disabled rotate, but useful if you want to enable later)
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enabled = false; // keep user interaction off by default

  // handle resize
  function onResize(){
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);

  // ensure container has a sane initial height
  if (!container.style.height) container.style.height = Math.max(260, Math.floor(container.clientWidth * 0.9)) + 'px';
  onResize();

  // animate
  const clock = new THREE.Clock();
  function animate(){
    const dt = clock.getDelta();
    // gentle bobbing and rotation
    ninja.rotation.y += rotSpeed;
    ninja.rotation.x = Math.sin(clock.elapsedTime * 0.6) * 0.03;
    ninja.position.y = -0.05 + Math.sin(clock.elapsedTime * 0.8) * 0.02;

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  // expose a small API for toggling fallback sketchfab
  window.__localThreeModel = {
    showSketchfab: function(){
      const sf = container.querySelector('.sketchfab-embed');
      if (sf) sf.style.display = '';
      container.querySelector('canvas').style.display = 'none';
    },
    showLocal: function(){
      const sf = container.querySelector('.sketchfab-embed');
      if (sf) sf.style.display = 'none';
      container.querySelector('canvas').style.display = '';
    }
  };
  // prefer local canvas; hide sketchfab fallback
  const sf = container.querySelector('.sketchfab-embed'); if (sf) sf.style.display = 'none';

})();