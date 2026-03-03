// script.js

document.addEventListener('DOMContentLoaded', () => {

    // ─── AOS Animations ───────────────────────────────────────────────
    AOS.init({ duration: 800, easing: 'ease-in-out', once: true, anchorPlacement: 'top-bottom' });

    // ─── Mobile Menu ──────────────────────────────────────────────────
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
            mobileMenuButton.classList.toggle('open');
            mobileMenuButton.setAttribute('aria-expanded', mobileMenu.classList.contains('open'));
        });
        document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                if (link.getAttribute('href').startsWith('#')) {
                    mobileMenu.classList.remove('open');
                    mobileMenuButton.classList.remove('open');
                    mobileMenuButton.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // ─── Asset Page Sub-navigation ────────────────────────────────────
    const subNavButtons = document.querySelectorAll('.sub-nav-assets .sub-nav-btn');
    const assetContentPanels = document.querySelectorAll('.asset-content-panel');
    if (subNavButtons.length > 0) {
        subNavButtons.forEach(button => {
            button.addEventListener('click', () => {
                subNavButtons.forEach(btn => btn.classList.remove('active'));
                assetContentPanels.forEach(panel => panel.classList.remove('active'));
                button.classList.add('active');
                const target = document.getElementById(button.getAttribute('data-target'));
                if (target) target.classList.add('active');
            });
        });
    }

    // ─── Language Switcher ────────────────────────────────────────────
    //
    // Architecture:
    //   • Spanish (ES): HTML is the single source of truth.
    //                   Text is written directly in the HTML files.
    //   • English (EN): translations.en is the single source of truth.
    //                   Applied via data-lang-key attributes.
    //
    // To edit Spanish text  → edit the HTML file directly.
    // To edit English text  → edit the translations.en object below.
    //
    const translations = {
        en: {
            // Navigation
            navAbout:           "About Us",
            navProducts:        "Products",
            navCherries:        "Cherries",
            navPotential:       "Business",
            navContact:         "Contact Us",
            navAssets:          "Assets",
            navLote6566:        "Lot 65 & 66",
            navLote6869:        "Lot 68 & 69",
            // Hero
            heroTitle:          "Premium Cherries for the World",
            heroSubtitle:       "Cultivating excellence in Rengo, Chile since 1988.",
            heroCta:            "Discover Our Products",
            // About
            aboutTitle:         "Our Story",
            aboutIntro:         "Agricura, an agribusiness rooted in Rengo, Chile, was founded in 1988 by Joaquin Edgardo Cura, driven by his profound passion for farming.",
            aboutHistory:       "Over nearly four decades, Agricura has cultivated a diverse range of products including grapes, pears, watermelons, and prunes. In recent years, our focus has sharpened towards producing high-quality apples and, most significantly, premium cherries destined for export markets.",
            aboutLegacy:        "We are committed to continuing our legacy of agricultural excellence and sustainable practices.",
            // Products
            productsTitle:      "Our Products",
            productsIntro:      "While cherries are our specialty, we also cultivate apples and corn with the same dedication to quality.",
            cherriesTitle:      "Export Quality Cherries",
            cherriesDesc:       "Our core product. We grow premium cherry varieties, meticulously cared for and harvested for international markets. Our cherries are known for their size, sweetness, and shelf life.",
            applesTitle:        "Fresh Apples",
            applesDesc:         "We also produce a selection of high-quality apples, perfect for export. Apples were the very first crop we dedicated ourselves to.",
            cornTitle:          "Quality Corn",
            cornDesc:           "Our corn production complements our fruit cultivation, contributing to our diverse agricultural portfolio and sustainable farming practices.",
            // Business Potential
            potentialTitle:     "Unlock Business Opportunities with Agricura",
            potentialIntro:     "Agricura presents a compelling opportunity for cherry buyers, investors, and financial partners. Our strategic location in Rengo, Chile, a prime agricultural zone, combined with decades of experience, positions us for significant growth in the lucrative cherry export market.",
            potentialPoint1:    "High-demand premium cherry varieties.",
            potentialPoint2:    "Established export channels and expertise.",
            potentialPoint3:    "Commitment to sustainable and modern farming practices.",
            potentialPoint4:    "Scalable operations with room for expansion.",
            potentialPoint5:    "Strong relationships with local suppliers and community.",
            potentialCta:       "Partner With Us",
            statYears:          "Years of Experience",
            statMarkets:        "Export Markets",
            statSustainable:    "Sustainable Commitment",
            // Contact
            contactTitle:       "Contact Us",
            contactIntro:       "We welcome inquiries from potential clients, investors, partners, and suppliers. Reach out to us to explore how we can work together.",
            contactGetInTouch:  "Get in Touch",
            contactEmailLabel:  "Email:",
            contactPhoneLabel:  "Phone:",
            contactAddressTitle:"Our Location",
            contactAddressDetail:"Rengo, Cachapoal Province, O'Higgins Region, Chile",
            contactFormTitle:   "Send us a Message",
            formName:           "Name",
            formEmail:          "Email",
            formSubject:        "Subject",
            formMessage:        "Message",
            formSubmit:         "Send Message",
            formStatusSuccess:  "Thank you! Your message has been sent.",
            formStatusError:    "Oops! There was a problem submitting your form. Please try again.",
            // Footer
            companyNameFooter:  "Agricura",
            footerTagline:      "Growing the Future since 1988",
            footerRights:       "All rights reserved.",
            footerAddress:      "Rengo, Chile",
            // Assets page
            assetsForSaleTitle: "Assets for Sale",
            lote6566Title:      "Lot 65 & 66",
            lote6566Desc:       "Agricura is offering for sale an agricultural plot in Rengo, close to the city and with excellent access to Route 5 South, measuring 10,311 m² (two property IDs). Residential-agricultural surroundings. The sale includes water usage rights proportional to the subdivision from which the property originated.\nOffers are accepted only for one lot (5,000 or 5,311 m²), above 50% of the listed price.",
            lote6869Title:      "Lot 68 & 69",
            lote6869Desc:       "Agricura is offering for sale an agricultural plot in Rengo, close to the city and with excellent access to Route 5 South, measuring 21,445 m² (two lots). Residential-agricultural surroundings. The sale includes the water usage rights corresponding proportionally to the subdivision from which they originated.\nOffers are accepted for only one lot (8,945 or 12,500 m²), provided they exceed the proportional value corresponding to each one separately.\nPrice per m²: UF 0.4.",
            // Cherries page
            pageTitleCerezas:   "Quality Cherries - Agricura",
            galleryTitleCerezas:"Our Cherries",
            galleryDescCerezas: "Explore the quality and beauty of our export-grade cherries.",
        }
    };

    // Save original Spanish text from HTML before any language swap
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        el.dataset.defaultText = el.tagName === 'TITLE' ? el.textContent : el.innerText;
    });

    let currentLang = localStorage.getItem('preferredLang') || document.documentElement.lang || 'es';

    const langEnBtnDesktop = document.getElementById('lang-en-desktop');
    const langEsBtnDesktop = document.getElementById('lang-es-desktop');
    const langEnBtnMobile  = document.getElementById('lang-en-mobile');
    const langEsBtnMobile  = document.getElementById('lang-es-mobile');

    function updateButtonStyles(lang) {
        [langEnBtnDesktop, langEnBtnMobile].forEach(btn => btn?.classList.toggle('active-lang', lang === 'en'));
        [langEsBtnDesktop, langEsBtnMobile].forEach(btn => btn?.classList.toggle('active-lang', lang === 'es'));
    }

    function setLanguage(lang) {
        currentLang = lang;
        document.documentElement.lang = lang;
        localStorage.setItem('preferredLang', lang);
        updateButtonStyles(lang);

        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.getAttribute('data-lang-key');
            const text = lang === 'es' ? el.dataset.defaultText : translations.en[key];
            if (text !== undefined) {
                el.tagName === 'TITLE' ? (el.textContent = text) : (el.innerText = text);
            }
        });

        // Re-apply active form status message if visible
        const formStatusEl = document.getElementById('form-status-message');
        if (formStatusEl?.dataset.statusKey) {
            const text = lang === 'es'
                ? formStatusEl.dataset.defaultText
                : translations.en[formStatusEl.dataset.statusKey];
            if (text) formStatusEl.innerText = text;
        }

        updateActiveNavLinks();
    }

    function updateActiveNavLinks() {
        const currentPage = window.location.pathname.split('/').pop();
        document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(link => {
            link.classList.remove('active');
            const linkPage = link.getAttribute('href').split('/').pop();
            if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html#home')) {
                link.classList.add('active');
            }
        });
    }

    if (langEnBtnDesktop) langEnBtnDesktop.addEventListener('click', () => setLanguage('en'));
    if (langEsBtnDesktop) langEsBtnDesktop.addEventListener('click', () => setLanguage('es'));
    if (langEnBtnMobile)  langEnBtnMobile.addEventListener('click',  () => setLanguage('en'));
    if (langEsBtnMobile)  langEsBtnMobile.addEventListener('click',  () => setLanguage('es'));

    setLanguage(currentLang);
    updateActiveNavLinks();

    // ─── Footer Year ──────────────────────────────────────────────────
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();

    // ─── Smooth Scroll ────────────────────────────────────────────────
    document.querySelectorAll('a[href^="#"], a[href^="index.html#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href.includes('#')) return;

            const targetId = '#' + href.split('#')[1];
            const currentPath = window.location.pathname.split('/').pop();
            const linkPath = href.split('#')[0];
            if (linkPath && linkPath !== currentPath && linkPath !== '') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerOffset = document.querySelector('.main-header')?.offsetHeight || 70;
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.scrollY - headerOffset,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ─── Match About Image & Map Height ───────────────────────────────
    function matchImageMapHeight() {
        const img    = document.getElementById('about-image');
        const iframe = document.getElementById('about-map-iframe');
        if (!img || !iframe) return;

        if (window.innerWidth >= 768) {
            if (img.complete && img.naturalHeight !== 0) {
                const h = img.offsetHeight;
                if (h > 0) { iframe.style.height = h + 'px'; }
                else        { setTimeout(matchImageMapHeight, 250); }
            } else {
                img.onload = matchImageMapHeight;
                setTimeout(matchImageMapHeight, 500);
            }
        } else {
            iframe.style.height = '';
        }
    }
    if (document.getElementById('about-image')) {
        window.addEventListener('load', matchImageMapHeight);
        window.addEventListener('resize', matchImageMapHeight);
        matchImageMapHeight();
    }

    // ─── Contact Form ─────────────────────────────────────────────────
    const contactForm      = document.getElementById('contactForm');
    const formStatusMessage = document.getElementById('form-status-message');
    if (contactForm && formStatusMessage) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const data = new FormData(this);
            data.set('_subject', `[WEBPAGE-CONTACT] ${this.querySelector('#form-subject').value}`);

            formStatusMessage.style.color = 'var(--text-muted)';
            formStatusMessage.innerText = currentLang === 'es' ? 'Enviando...' : 'Sending...';
            formStatusMessage.dataset.statusKey = '';

            try {
                const response = await fetch(this.action, {
                    method: this.method,
                    body: data,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    formStatusMessage.style.color = 'green';
                    formStatusMessage.dataset.statusKey = 'formStatusSuccess';
                    formStatusMessage.innerText = currentLang === 'es'
                        ? '¡Gracias! Tu mensaje ha sido enviado.'
                        : translations.en.formStatusSuccess;
                    formStatusMessage.dataset.defaultText = '¡Gracias! Tu mensaje ha sido enviado.';
                    this.reset();
                } else {
                    const err = await response.json();
                    formStatusMessage.style.color = 'red';
                    formStatusMessage.dataset.statusKey = 'formStatusError';
                    formStatusMessage.innerText = err?.errors?.length
                        ? err.errors.map(e => e.message || e.code).join(', ')
                        : (currentLang === 'es' ? '¡Ups! Hubo un problema. Inténtalo de nuevo.' : translations.en.formStatusError);
                    formStatusMessage.dataset.defaultText = '¡Ups! Hubo un problema. Inténtalo de nuevo.';
                }
            } catch (error) {
                formStatusMessage.style.color = 'red';
                formStatusMessage.dataset.statusKey = 'formStatusError';
                formStatusMessage.innerText = currentLang === 'es'
                    ? '¡Ups! Error de red. Inténtalo de nuevo.'
                    : translations.en.formStatusError;
                formStatusMessage.dataset.defaultText = '¡Ups! Error de red. Inténtalo de nuevo.';
            }
        });
    }

    // ─── Hero Scroll Button ───────────────────────────────────────────
    const heroScrollBtn = document.getElementById('hero-scroll-btn');
    if (heroScrollBtn) {
        heroScrollBtn.addEventListener('click', () => {
            const about = document.getElementById('about');
            const hdr   = document.querySelector('.main-header');
            if (about) window.scrollTo({
                top: about.getBoundingClientRect().top + window.scrollY - (hdr?.offsetHeight || 70),
                behavior: 'smooth'
            });
        });
    }

    // ─── Active Nav on Scroll ─────────────────────────────────────────
    const navSections = document.querySelectorAll('main > section[id]');
    if (navSections.length > 0) {
        const navObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(link => {
                        link.classList.toggle('scroll-active', link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });
        navSections.forEach(s => navObserver.observe(s));
    }

});
