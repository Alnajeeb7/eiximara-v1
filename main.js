/* ═══════════════════════════════════════════════════
   EIXIMARA - Main JavaScript
   Vanilla JS with Full Error Handling
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // ─── Navigation ───
  initNavigation();
  
  // ─── Hero Section ───
  initHeroAnimations();
  initAnimatedSphere();
  
  // ─── Services Section ───
  initScrollAnimations();
  
  // ─── Process Section ───
  initProcessSection();
  
  // ─── Infrastructure Section ───
  initInfrastructureSection();
  
  // ─── Metrics Counter ───
  initMetricsCounter();
  
  // ─── Testimonials ───
  initTestimonials();
  
  // ─── Integrations Marquee ───
  initIntegrationsMarquee();
  
  // ─── Pricing Section ───
  initPricingSection();
  
  // ─── FAQ Accordion ───
  initFAQAccordion();
  
  // ─── CTA Section ───
  initCtaSection();
  initAnimatedTetrahedron();
  
  // ─── Footer Wave ───
  initFooterWave();
});

/* ─── Navigation ─── */
function initNavigation() {
  const nav = document.querySelector('.nav');
  const navWrapper = document.querySelector('.nav__wrapper');
  const navToggle = document.querySelector('.nav__toggle');
  const navMobile = document.querySelector('.nav__mobile');
  const navMobileLinks = document.querySelectorAll('.nav__mobile-link');
  
  if (!nav) return;
  
  let isMobileOpen = false;
  let lastScrollY = 0;
  let scrollDirection = 'up';
  let ticking = false;
  
  // Scroll-based dynamic island effect
  function handleScroll() {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY;
    
    // Determine scroll direction
    if (scrollDelta > 0) {
      scrollDirection = 'down';
    } else if (scrollDelta < 0) {
      scrollDirection = 'up';
    }
    
    // Apply states based on scroll position and direction
    if (currentScrollY < 50) {
      // At top - fully expanded
      nav.classList.remove('nav--contracted', 'nav--hidden', 'nav--expanded');
    } else if (currentScrollY > 300 && scrollDirection === 'down') {
      // Scrolling down far - hide
      nav.classList.add('nav--hidden');
      nav.classList.remove('nav--contracted', 'nav--expanded');
    } else if (scrollDirection === 'up') {
      // Scrolling up - show expanded
      nav.classList.remove('nav--hidden');
      nav.classList.add('nav--expanded');
      nav.classList.remove('nav--contracted');
    } else if (currentScrollY > 50) {
      // Scrolled but not far - contracted
      nav.classList.add('nav--contracted');
      nav.classList.remove('nav--hidden', 'nav--expanded');
    }
    
    lastScrollY = currentScrollY;
    ticking = false;
  }
  
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }, { passive: true });
  
  // Initial state
  handleScroll();
  
  // Mobile menu toggle
  if (navToggle && navMobile) {
    navToggle.addEventListener('click', function() {
      isMobileOpen = !isMobileOpen;
      navMobile.classList.toggle('nav__mobile--open', isMobileOpen);
      nav.classList.toggle('nav--mobile-open', isMobileOpen);
      document.body.style.overflow = isMobileOpen ? 'hidden' : '';
      
      // Update toggle icon
      const icon = navToggle.querySelector('.nav__toggle-icon');
      if (icon) {
        icon.innerHTML = isMobileOpen ? 
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>' :
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>';
      }
    });
    
    // Close mobile menu on link click
    navMobileLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        isMobileOpen = false;
        navMobile.classList.remove('nav__mobile--open');
        nav.classList.remove('nav--mobile-open');
        document.body.style.overflow = '';
      });
    });
  }
}

/* ─── Hero Animations ─── */
function initHeroAnimations() {
  const heroContent = document.querySelector('.hero__content');
  const cuboidRotator = document.getElementById('cuboid-rotator');
  const wordSpan = document.getElementById('hero-word');
  
  if (!heroContent) return;
  
  // Fade in hero content
  setTimeout(function() {
    heroContent.classList.add('animate-fade-in');
  }, 100);
  
  // Rotating adjectives - cuboid rotation
  let adjectiveIndex = 0;
  
  if (cuboidRotator) {
    // Set initial state - front face visible
    cuboidRotator.style.transform = 'rotateX(0deg)';
    
    setInterval(function() {
      adjectiveIndex = (adjectiveIndex + 1) % 4;
      // Rotate negative direction to reveal next face
      cuboidRotator.style.transform = 'rotateX(' + (adjectiveIndex * -90) + 'deg)';
    }, 2500);
  }
  
  // Rotating words with character animation
  const words = ['portfolios', 'websites', 'software', 'brands'];
  let wordIndex = 0;
  
  if (wordSpan) {
    // Initialize first word with animation
    animateWord(wordSpan, words[0]);
    
    setInterval(function() {
      wordIndex = (wordIndex + 1) % words.length;
      animateWord(wordSpan, words[wordIndex]);
    }, 2500);
  }
}

function animateWord(container, word) {
  // Clear previous content
  container.innerHTML = '';
  
  // Create animated characters
  word.split('').forEach(function(char, i) {
    const span = document.createElement('span');
    span.className = 'animate-char-in';
    span.style.animationDelay = (i * 50) + 'ms';
    span.style.display = 'inline-block';
    span.textContent = char;
    container.appendChild(span);
  });
}

/* ─── Animated Sphere (Hero Background) ─── */
function initAnimatedSphere() {
  const canvas = document.getElementById('sphere-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Characters for sphere rendering (matching original)
  const chars = '░▒▓█▀▄▌▐│─┤├┴┬╭╮╰╯';
  let time = 0;
  
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }
  
  // Color gradient from purple to teal (matching original)
  function getColor(depth) {
    const r = Math.floor(127 + (44 - 127) * depth);
    const g = Math.floor(90 + (182 - 90) * depth);
    const b = Math.floor(240 + (125 - 240) * depth);
    return { r: r, g: g, b: b };
  }
  
  function render() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Center sphere in canvas (matching original exactly)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(rect.width, rect.height) * 0.525;
    
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const points = [];
    
    // Generate sphere points (matching original algorithm exactly)
    for (var phi = 0; phi < Math.PI * 2; phi += 0.15) {
      for (var theta = 0; theta < Math.PI; theta += 0.15) {
        var x = Math.sin(theta) * Math.cos(phi + time * 0.5);
        var y = Math.sin(theta) * Math.sin(phi + time * 0.5);
        var z = Math.cos(theta);
        
        // Rotate around Y axis
        var rotY = time * 0.3;
        var newX = x * Math.cos(rotY) - z * Math.sin(rotY);
        var newZ = x * Math.sin(rotY) + z * Math.cos(rotY);
        
        // Rotate around X axis
        var rotX = time * 0.2;
        var newY = y * Math.cos(rotX) - newZ * Math.sin(rotX);
        var finalZ = y * Math.sin(rotX) + newZ * Math.cos(rotX);
        
        var depth = (finalZ + 1) / 2;
        var charIndex = Math.floor(depth * (chars.length - 1));
        
        points.push({
          x: centerX + newX * radius,
          y: centerY + newY * radius,
          z: finalZ,
          char: chars[charIndex]
        });
      }
    }
    
    // Sort by z for depth ordering
    points.sort(function(a, b) { return a.z - b.z; });
    
    // Draw points with gradient colors
    points.forEach(function(point) {
      var depth = (point.z + 1) / 2;
      var alpha = 0.2 + depth * 0.6;
      var color = getColor(depth);
      ctx.fillStyle = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + alpha + ')';
      ctx.fillText(point.char, point.x, point.y);
    });
    
    time += 0.02;
    requestAnimationFrame(render);
  }
  
  resize();
  window.addEventListener('resize', resize);
  render();
}

/* ─── Scroll Animations ─── */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-animate]');
  
  if (!animatedElements.length) return;
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  
  animatedElements.forEach(function(el) {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

/* ─── Process Section ─── */
function initProcessSection() {
  const steps = document.querySelectorAll('.process__step');
  const windowBody = document.querySelector('.process__window-body');
  const windowTitle = document.querySelector('.process__window-title');
  const windowList = document.querySelector('.process__window-list');
  const windowStatus = document.querySelector('.process__window-status-text');
  const windowStep = document.querySelector('.process__window-step');
  const processWindow = document.querySelector('.process__window');
  const windowControls = document.querySelector('.process__window-controls');
  const restoreBtn = document.querySelector('.process__restore');
  
  if (!steps.length) return;
  
  const stepsData = [
    {
      title: 'Share your vision',
      details: [
        'Fill out our booking form',
        'Select your delivery timeline',
        'Upload any references or assets',
        'We\'ll confirm within 24 hours'
      ],
      status: 'Start your journey'
    },
    {
      title: 'We build it',
      details: [
        'Design mockups shared for approval',
        'Development with modern tech stack',
        'Regular progress updates',
        'Testing across all devices'
      ],
      status: 'We handle everything'
    },
    {
      title: 'You receive it',
      details: [
        'Final review and approval',
        'Payment after completion',
        'Live website + GitHub access',
        'Support via email or phone'
      ],
      status: 'Receive your project'
    }
  ];
  
  let activeStep = 0;
  let windowState = 'normal';
  let autoInterval;
  
  function updateStep(index) {
    // Update active step styling
    steps.forEach(function(step, i) {
      step.classList.toggle('process__step--active', i === index);
      
      // Reset and restart progress bar animation
      const progressBar = step.querySelector('.process__step-progress-bar');
      if (progressBar) {
        if (i === index) {
          progressBar.style.animation = 'none';
          progressBar.offsetHeight; // Trigger reflow
          progressBar.style.animation = 'progress 6s linear forwards';
        } else {
          progressBar.style.animation = 'none';
          progressBar.style.width = '0';
        }
      }
    });
    
    // Update window content
    if (windowTitle) {
      windowTitle.textContent = stepsData[index].title;
    }
    
    if (windowList) {
      windowList.innerHTML = '';
      stepsData[index].details.forEach(function(detail, i) {
        const li = document.createElement('li');
        li.className = 'process__window-item detail-line-reveal';
        li.style.animationDelay = (i * 100) + 'ms';
        li.innerHTML = 
          '<span class="process__window-dot"><span class="process__window-dot-inner"></span></span>' +
          '<span class="process__window-item-text">' + detail + '</span>';
        windowList.appendChild(li);
      });
    }
    
    if (windowStatus) {
      windowStatus.textContent = stepsData[index].status;
    }
    
    if (windowStep) {
      windowStep.textContent = 'step ' + (index + 1) + ' of 3';
    }
    
    activeStep = index;
  }
  
  // Click handlers for steps
  steps.forEach(function(step, index) {
    step.addEventListener('click', function() {
      clearInterval(autoInterval);
      updateStep(index);
      startAutoRotate();
    });
  });
  
  // Window controls
  if (windowControls && processWindow) {
    const closeBtn = windowControls.querySelector('.process__window-control--close');
    const minimizeBtn = windowControls.querySelector('.process__window-control--minimize');
    const maximizeBtn = windowControls.querySelector('.process__window-control--maximize');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        windowState = 'minimized';
        processWindow.classList.add('process__window--minimized');
        processWindow.classList.remove('process__window--maximized');
        if (restoreBtn) restoreBtn.style.display = 'flex';
      });
    }
    
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        windowState = windowState === 'minimized' ? 'normal' : 'minimized';
        processWindow.classList.toggle('process__window--minimized', windowState === 'minimized');
        processWindow.classList.remove('process__window--maximized');
        if (restoreBtn) restoreBtn.style.display = windowState === 'minimized' ? 'flex' : 'none';
      });
    }
    
    if (maximizeBtn) {
      maximizeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        windowState = windowState === 'maximized' ? 'normal' : 'maximized';
        processWindow.classList.toggle('process__window--maximized', windowState === 'maximized');
        processWindow.classList.remove('process__window--minimized');
        if (restoreBtn) restoreBtn.style.display = 'none';
      });
    }
  }
  
  // Restore button
  if (restoreBtn) {
    restoreBtn.style.display = 'none';
    restoreBtn.addEventListener('click', function() {
      windowState = 'normal';
      processWindow.classList.remove('process__window--minimized');
      processWindow.classList.remove('process__window--maximized');
      restoreBtn.style.display = 'none';
    });
  }
  
  function startAutoRotate() {
    autoInterval = setInterval(function() {
      const nextStep = (activeStep + 1) % steps.length;
      updateStep(nextStep);
    }, 6000);
  }
  
  // Initialize
  updateStep(0);
  startAutoRotate();
}

/* ─── Infrastructure Section ─── */
function initInfrastructureSection() {
  const projects = document.querySelectorAll('.infrastructure__project');
  if (!projects.length) return;
  
  let activeProject = 0;
  
  setInterval(function() {
    projects.forEach(function(project, i) {
      project.classList.toggle('infrastructure__project--active', i === activeProject);
    });
    activeProject = (activeProject + 1) % projects.length;
  }, 2000);
}

/* ─── Metrics Counter ─── */
function initMetricsCounter() {
  const counters = document.querySelectorAll('.metrics__value[data-count]');
  
  if (!counters.length) return;
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const el = entry.target;
        const end = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        let start = 0;
        const duration = 2000;
        const startTime = performance.now();
        
        function animate(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * end);
          
          el.innerHTML = '<span class="text-gradient">' + prefix + current.toLocaleString() + suffix + '</span>';
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        }
        
        requestAnimationFrame(animate);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(function(counter) {
    observer.observe(counter);
  });
}

/* ─── Testimonials ─── */
function initTestimonials() {
  const quoteEl = document.querySelector('.testimonials__quote');
  const authorEl = document.querySelector('.testimonials__author');
  const metricCard = document.querySelector('.testimonials__metric-card');
  const metricValue = document.querySelector('.testimonials__metric-value');
  const dots = document.querySelectorAll('.testimonials__dot');
  const counterEl = document.querySelector('.testimonials__counter');
  
  if (!quoteEl) return;
  
  const testimonials = [
    {
      quote: 'EIXIMARA delivered my portfolio in just 3 days. It helped me land my dream internship within a month.',
      author: 'Priya Sharma',
      role: 'Computer Science Student',
      company: 'IIT Delhi',
      metric: 'Landed internship in 30 days'
    },
    {
      quote: 'The attention to detail was incredible. My portfolio finally represents the quality of work I do.',
      author: 'Alex Chen',
      role: 'UX Designer',
      company: 'Freelance',
      metric: '3x more client inquiries'
    },
    {
      quote: 'Fast, professional, and the support after delivery was exceptional. Highly recommend for any professional.',
      author: 'Marcus Webb',
      role: 'Software Engineer',
      company: 'Tech Startup',
      metric: 'Portfolio built in 5 days'
    },
    {
      quote: 'They understood exactly what I needed for my personal brand. The result exceeded all expectations.',
      author: 'Riya Patel',
      role: 'MBA Student',
      company: 'ISB Hyderabad',
      metric: '100% satisfaction'
    }
  ];
  
  let activeIndex = 0;
  
  function updateTestimonial(index, animate) {
    if (animate) {
      quoteEl.classList.add('testimonials__quote--animating');
      if (authorEl) authorEl.style.opacity = '0';
      if (metricCard) metricCard.classList.add('testimonials__metric-card--animating');
    }
    
    setTimeout(function() {
      const testimonial = testimonials[index];
      
      quoteEl.innerHTML = '&ldquo;' + testimonial.quote + '&rdquo;';
      
      if (authorEl) {
        const avatarEl = authorEl.querySelector('.testimonials__avatar-initial');
        const nameEl = authorEl.querySelector('.testimonials__author-name');
        const roleEl = authorEl.querySelector('.testimonials__author-role');
        
        if (avatarEl) avatarEl.textContent = testimonial.author.charAt(0);
        if (nameEl) nameEl.textContent = testimonial.author;
        if (roleEl) roleEl.textContent = testimonial.role + ', ' + testimonial.company;
        authorEl.style.opacity = '1';
      }
      
      if (metricValue) {
        metricValue.innerHTML = '<span class="text-gradient">' + testimonial.metric + '</span>';
      }
      
      if (counterEl) {
        counterEl.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(testimonials.length).padStart(2, '0');
      }
      
      // Update dots
      dots.forEach(function(dot, i) {
        dot.classList.toggle('testimonials__dot--active', i === index);
      });
      
      if (animate) {
        quoteEl.classList.remove('testimonials__quote--animating');
        if (metricCard) metricCard.classList.remove('testimonials__metric-card--animating');
      }
      
      activeIndex = index;
    }, animate ? 300 : 0);
  }
  
  // Dot click handlers
  dots.forEach(function(dot, index) {
    dot.addEventListener('click', function() {
      updateTestimonial(index, true);
    });
  });
  
  // Auto rotate
  setInterval(function() {
    const nextIndex = (activeIndex + 1) % testimonials.length;
    updateTestimonial(nextIndex, true);
  }, 5000);
  
  // Initialize
  updateTestimonial(0, false);
}

/* ─── Integrations Marquee ─── */
function initIntegrationsMarquee() {
  // Marquee animation is handled via CSS
  // This function can be extended for pause-on-hover functionality
  
  const tracks = document.querySelectorAll('.integrations__track');
  
  tracks.forEach(function(track) {
    track.addEventListener('mouseenter', function() {
      track.style.animationPlayState = 'paused';
    });
    
    track.addEventListener('mouseleave', function() {
      track.style.animationPlayState = 'running';
    });
  });
}

/* ─── Pricing Section ─── */
function initPricingSection() {
  const projectBtns = document.querySelectorAll('.pricing__project-btn');
  const tierBtns = document.querySelectorAll('.pricing__tier');
  const summarySelection = document.querySelector('.pricing__summary-selection');
  const summaryDelivery = document.querySelector('.pricing__summary-delivery');
  const summaryTotal = document.querySelector('.pricing__summary-total-value');
  
  if (!projectBtns.length || !tierBtns.length) return;
  
  const projectTypes = [
    { name: 'Portfolio Website', basePrice: 299 },
    { name: 'Landing Page', basePrice: 199 },
    { name: 'Custom Web App', basePrice: 999 },
    { name: 'E-commerce Site', basePrice: 799 }
  ];
  
  const deliveryTiers = [
    { name: 'Express', timeline: '1-3 Days', multiplier: 1.6 },
    { name: 'Priority', timeline: '4-7 Days', multiplier: 1.3 },
    { name: 'Standard', timeline: '1-2 Weeks', multiplier: 1.0 },
    { name: 'Flexible', timeline: '2-3 Weeks', multiplier: 0.9 }
  ];
  
  let selectedProject = 0;
  let selectedTier = 2; // Default to Standard
  
  function updatePricing() {
    const basePrice = projectTypes[selectedProject].basePrice;
    const multiplier = deliveryTiers[selectedTier].multiplier;
    const finalPrice = Math.round(basePrice * multiplier);
    
    // Update project buttons
    projectBtns.forEach(function(btn, i) {
      btn.classList.toggle('pricing__project-btn--active', i === selectedProject);
    });
    
    // Update tier cards
    tierBtns.forEach(function(tier, i) {
      tier.classList.toggle('pricing__tier--selected', i === selectedTier);
      
      // Update price display
      const priceEl = tier.querySelector('.pricing__tier-amount');
      if (priceEl) {
        const price = Math.round(basePrice * deliveryTiers[i].multiplier);
        priceEl.textContent = '$' + price;
      }
    });
    
    // Update summary
    if (summarySelection) {
      summarySelection.textContent = projectTypes[selectedProject].name + ' with ' + deliveryTiers[selectedTier].name + ' delivery';
    }
    
    if (summaryDelivery) {
      summaryDelivery.textContent = 'Estimated delivery: ' + deliveryTiers[selectedTier].timeline;
    }
    
    if (summaryTotal) {
      summaryTotal.innerHTML = '<span class="text-gradient">$' + finalPrice + '</span>';
    }
  }
  
  // Project button clicks
  projectBtns.forEach(function(btn, index) {
    btn.addEventListener('click', function() {
      selectedProject = index;
      updatePricing();
    });
  });
  
  // Tier card clicks
  tierBtns.forEach(function(tier, index) {
    tier.addEventListener('click', function() {
      selectedTier = index;
      updatePricing();
    });
  });
  
  // Initialize
  updatePricing();
}

/* ─── FAQ Accordion ─── */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq__item');
  
  if (!faqItems.length) return;
  
  faqItems.forEach(function(item, index) {
    const question = item.querySelector('.faq__question');
    
    if (question) {
      question.addEventListener('click', function() {
        const isOpen = item.classList.contains('faq__item--open');
        
        // Close all items
        faqItems.forEach(function(otherItem) {
          otherItem.classList.remove('faq__item--open');
        });
        
        // Open clicked item if it wasn't already open
        if (!isOpen) {
          item.classList.add('faq__item--open');
        }
      });
    }
    
    // Open first item by default
    if (index === 0) {
      item.classList.add('faq__item--open');
    }
  });
}

/* ─── CTA Section ─── */
function initCtaSection() {
  const ctaCard = document.querySelector('.cta__card');
  const spotlight = document.querySelector('.cta__spotlight');
  
  if (!ctaCard || !spotlight) return;
  
  ctaCard.addEventListener('mousemove', function(e) {
    const rect = ctaCard.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    spotlight.style.background = 'radial-gradient(600px circle at ' + x + '% ' + y + '%, rgba(124, 58, 237, 0.3), transparent 40%)';
  });
}

/* ─── Animated Tetrahedron (CTA Background) ─── */
function initAnimatedTetrahedron() {
  const canvas = document.getElementById('tetrahedron-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const chars = '░▒▓█▀▄▌▐│─┤├┴┬╭╮╰╯';
  let time = 0;
  
  const vertices = [
    { x: 0, y: 1, z: 0 },
    { x: -0.943, y: -0.333, z: -0.5 },
    { x: 0.943, y: -0.333, z: -0.5 },
    { x: 0, y: -0.333, z: 1 }
  ];
  
  const edges = [
    [0, 1], [0, 2], [0, 3],
    [1, 2], [2, 3], [3, 1]
  ];
  
  const faces = [
    [0, 1, 2],
    [0, 2, 3],
    [0, 3, 1],
    [1, 3, 2]
  ];
  
  const colors = [
    { r: 127, g: 90, b: 240 },
    { r: 255, g: 78, b: 205 },
    { r: 44, g: 182, b: 125 }
  ];
  
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }
  
  function rotateY(point, angle) {
    return {
      x: point.x * Math.cos(angle) - point.z * Math.sin(angle),
      y: point.y,
      z: point.x * Math.sin(angle) + point.z * Math.cos(angle)
    };
  }
  
  function rotateX(point, angle) {
    return {
      x: point.x,
      y: point.y * Math.cos(angle) - point.z * Math.sin(angle),
      z: point.y * Math.sin(angle) + point.z * Math.cos(angle)
    };
  }
  
  function rotateZ(point, angle) {
    return {
      x: point.x * Math.cos(angle) - point.y * Math.sin(angle),
      y: point.x * Math.sin(angle) + point.y * Math.cos(angle),
      z: point.z
    };
  }
  
  function render() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const scale = Math.min(rect.width, rect.height) * 0.7;
    
    ctx.font = '18px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const points = [];
    
    // Generate points along edges
    edges.forEach(function(edge, edgeIndex) {
      const v1 = vertices[edge[0]];
      const v2 = vertices[edge[1]];
      
      for (let t = 0; t <= 1; t += 0.05) {
        let point = {
          x: v1.x + (v2.x - v1.x) * t,
          y: v1.y + (v2.y - v1.y) * t,
          z: v1.z + (v2.z - v1.z) * t
        };
        
        point = rotateY(point, time * 0.4);
        point = rotateX(point, time * 0.3);
        point = rotateZ(point, time * 0.2);
        
        const depth = (point.z + 1.5) / 3;
        const charIndex = Math.floor(depth * (chars.length - 1));
        
        points.push({
          x: centerX + point.x * scale,
          y: centerY - point.y * scale,
          z: point.z,
          char: chars[Math.min(charIndex, chars.length - 1)],
          colorIndex: edgeIndex % 3
        });
      }
    });
    
    // Generate points on faces
    faces.forEach(function(face, faceIndex) {
      const v1 = vertices[face[0]];
      const v2 = vertices[face[1]];
      const v3 = vertices[face[2]];
      
      for (let u = 0; u <= 1; u += 0.12) {
        for (let v = 0; v <= 1 - u; v += 0.12) {
          const w = 1 - u - v;
          let point = {
            x: v1.x * u + v2.x * v + v3.x * w,
            y: v1.y * u + v2.y * v + v3.y * w,
            z: v1.z * u + v2.z * v + v3.z * w
          };
          
          point = rotateY(point, time * 0.4);
          point = rotateX(point, time * 0.3);
          point = rotateZ(point, time * 0.2);
          
          const depth = (point.z + 1.5) / 3;
          const charIndex = Math.floor(depth * (chars.length - 1));
          
          points.push({
            x: centerX + point.x * scale,
            y: centerY - point.y * scale,
            z: point.z,
            char: chars[Math.min(charIndex, chars.length - 1)],
            colorIndex: faceIndex % 3
          });
        }
      }
    });
    
    // Sort by z
    points.sort(function(a, b) { return a.z - b.z; });
    
    // Draw points
    points.forEach(function(point) {
      const depth = (point.z + 1.5) / 3;
      const alpha = 0.15 + depth * 0.6;
      const color = colors[point.colorIndex];
      ctx.fillStyle = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + Math.min(alpha, 0.9) + ')';
      ctx.fillText(point.char, point.x, point.y);
    });
    
    time += 0.015;
    requestAnimationFrame(render);
  }
  
  resize();
  window.addEventListener('resize', resize);
  render();
}

/* ─── Footer Wave ─── */
function initFooterWave() {
  const canvas = document.getElementById('wave-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const chars = '·∘○◯◌●◉';
  let time = 0;
  
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }
  
  function getColor(value) {
    const r = Math.floor(127 + (44 - 127) * value);
    const g = Math.floor(90 + (182 - 90) * value);
    const b = Math.floor(240 + (125 - 240) * value);
    return { r: r, g: g, b: b };
  }
  
  function render() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const cols = Math.floor(rect.width / 20);
    const rows = Math.floor(rect.height / 20);
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const px = (x + 0.5) * (rect.width / cols);
        const py = (y + 0.5) * (rect.height / rows);
        
        const wave1 = Math.sin(x * 0.2 + time * 2) * Math.cos(y * 0.15 + time);
        const wave2 = Math.sin((x + y) * 0.1 + time * 1.5);
        const wave3 = Math.cos(x * 0.1 - y * 0.1 + time * 0.8);
        
        const combined = (wave1 + wave2 + wave3) / 3;
        const normalized = (combined + 1) / 2;
        
        const charIndex = Math.floor(normalized * (chars.length - 1));
        const alpha = 0.15 + normalized * 0.5;
        const color = getColor(normalized);
        
        ctx.fillStyle = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + alpha + ')';
        ctx.fillText(chars[charIndex], px, py);
      }
    }
    
    time += 0.03;
    requestAnimationFrame(render);
  }
  
  resize();
  window.addEventListener('resize', resize);
  render();
}
