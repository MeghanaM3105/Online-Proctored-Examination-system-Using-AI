// home.js - Interaction logic

document.addEventListener('DOMContentLoaded', () => {
    
    // Animation Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Select elements to animate
    const animatedElements = document.querySelectorAll('.feature-card, .col-lg-6, .card');
    animatedElements.forEach(el => {
        el.classList.add('fade-in-up');
        observer.observe(el);
    });

    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const first = (document.getElementById('contactFirstName')?.value || '').trim();
            const last = (document.getElementById('contactLastName')?.value || '').trim();
            const email = (document.getElementById('contactEmail')?.value || '').trim();
            const message = (document.getElementById('contactMessage')?.value || '').trim();
            const name = `${first} ${last}`.trim();

            if (!name || !email || !message) {
                alert('Please fill in your name, email, and message.');
                return;
            }

            try {
                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message }),
                });
                const data = await res.json();
                if (!res.ok || !data.success) throw new Error(data.message || 'Failed to send message');

                alert('Thank you for your message! We will get back to you shortly.');
                contactForm.reset();
            } catch (err) {
                console.error(err);
                alert(err.message || 'Failed to send message');
            }
        });
    }
});