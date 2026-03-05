// 1. REGISTRO DEL SERVICE WORKER
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW Error:', err));
    });
}

// 2. VARIABLES GLOBALES
let carrito = [];
let total = 0;
const numeroWhatsApp = "5733205578471";

// 3. ELEMENTOS DEL DOM
const botonesAgregar = document.querySelectorAll('.btn-add');
const btnCarrito = document.getElementById('btn-abrir-carrito');
const contadorCarrito = document.getElementById('contador-carrito');
const modal = document.getElementById('modal-pedido');
const btnCerrarModal = document.getElementById('btn-cerrar-modal');
const listaPedido = document.getElementById('lista-pedido');
const totalPrecioTxt = document.getElementById('total-precio');
const formWhatsapp = document.getElementById('form-whatsapp');

// Elementos de Accesibilidad y Navegación (Nuevos IDs)
const btnArriba = document.getElementById('btn-arriba');
const btnAcc = document.getElementById('btn-accesibilidad');
const accOptions = document.getElementById('acc-options');
const btnTema = document.getElementById('btn-tema');
const btnZoom = document.getElementById('btn-zoom');
const btnLectura = document.getElementById('btn-lectura');

// 4. LÓGICA DEL CARRITO (Tu código original)
botonesAgregar.forEach(boton => {
    boton.addEventListener('click', (e) => {
        const nombre = e.target.getAttribute('data-nombre');
        const precio = parseInt(e.target.getAttribute('data-precio'));

        carrito.push({ nombre, precio });
        total += precio;
        contadorCarrito.textContent = carrito.length;

        // Animación de rebote en el carrito
        btnCarrito.classList.remove('cart-bounce');
        void btnCarrito.offsetWidth;
        btnCarrito.classList.add('cart-bounce');

        const textoOriginal = boton.textContent;
        boton.textContent = "¡Agregado! 🤤";
        boton.style.backgroundColor = "#4caf50";
        setTimeout(() => {
            boton.textContent = textoOriginal;
            boton.style.backgroundColor = "var(--primary)";
        }, 1000);
    });
});

// 5. MODAL Y ENVÍO A WHATSAPP
btnCarrito.addEventListener('click', () => {
    if (carrito.length === 0) {
        alert("¡Tu carrito está vacío!");
        return;
    }
    listaPedido.innerHTML = "";
    carrito.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${item.nombre}</span> <span>$${item.precio.toLocaleString()}</span>`;
        listaPedido.appendChild(li);
    });
    totalPrecioTxt.textContent = total.toLocaleString();
    modal.classList.add('active');
});

btnCerrarModal.addEventListener('click', () => modal.classList.remove('active'));
window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

formWhatsapp.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('cliente-nombre').value;
    const direccion = document.getElementById('cliente-direccion').value;
    const notas = document.getElementById('cliente-notas').value;

    let mensaje = `🔥 *NUEVO PEDIDO* 🔥\n\n*Cliente:* ${nombre}\n*Dirección:* ${direccion}\n\n*Orden:*\n`;
    carrito.forEach(item => mensaje += `- ${item.nombre} ($${item.precio.toLocaleString()})\n`);
    mensaje += `\n💰 *Total: $${total.toLocaleString()}*`;
    if (notas) mensaje += `\n\n📝 *Notas:* ${notas}`;

    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`, '_blank');
    carrito = []; total = 0; contadorCarrito.textContent = 0;
    modal.classList.remove('active');
});

// 6. EFECTOS DE REVEAL Y ACORDEÓN (Tu código original recuperado)
const revealElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card-producto, .info-card, .foto, .menu h2').forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
};

const itemsAcordeon = document.querySelectorAll('.acordeon-item');
itemsAcordeon.forEach(item => {
    item.addEventListener('click', () => {
        itemsAcordeon.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    });
});

// 7. NAVEGACIÓN Y ACCESIBILIDAD (Integración con iconos)
// Botón Ir Arriba
window.addEventListener('scroll', () => {
    btnArriba.classList.toggle('show', window.scrollY > 300);
});
btnArriba.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Panel de Accesibilidad
btnAcc.addEventListener('click', () => accOptions.classList.toggle('active'));

btnTema.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode-active');
    localStorage.setItem('dark-mode', document.body.classList.contains('dark-mode-active'));
});

btnZoom.addEventListener('click', () => {
    document.body.style.fontSize = document.body.style.fontSize === '1.2rem' ? '1rem' : '1.2rem';
});

let synth = window.speechSynthesis;
btnLectura.addEventListener('click', () => {
    const icon = btnLectura.querySelector('.icon-img');
    if (synth.speaking) {
        synth.cancel();
        if (icon) icon.src = "assets/speaker.png";
    } else {
        const mensaje = new SpeechSynthesisUtterance(document.body.innerText);
        mensaje.lang = 'es-CO';
        mensaje.onstart = () => { if (icon) icon.src = "assets/stop.png"; };
        mensaje.onend = () => { if (icon) icon.src = "assets/speaker.png"; };
        synth.speak(mensaje);
    }
});

// 8. ESTADO DEL LOCAL Y MENÚ MÓVIL (Tu código original)
function verificarEstadoLocal() {
    const ahora = new Date();
    const dia = ahora.getDay();
    const hora = ahora.getHours();
    const esDiaAbierto = (dia >= 1 || dia === 0);
    const esHoraAbierta = (hora >= 8 && hora < 22);
    const badgeContainer = document.getElementById('badge-estado');
    if (badgeContainer) {
        badgeContainer.innerHTML = (esDiaAbierto && esHoraAbierta)
            ? '<span class="badge-abierto">🟢 ABIERTO AHORA</span>'
            : '<span class="badge-cerrado">🔴 CERRADO</span>';
    }
}

const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');
menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('open');
    navLinks.classList.toggle('mobile-active');
});

// 9. INICIALIZACIÓN (Swiper, Videos, Splash)
document.addEventListener('DOMContentLoaded', () => {
    verificarEstadoLocal();
    revealElements();

    new Swiper(".mySwiper", {
        effect: "coverflow", grabCursor: true, centeredSlides: true,
        slidesPerView: "auto", loop: true, autoplay: { delay: 2500 },
        coverflowEffect: { rotate: 30, depth: 200, slideShadows: true },
        pagination: { el: ".swiper-pagination", clickable: true },
    });

    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.play().catch(() => { });
            else entry.target.pause();
        });
    }, { threshold: 0.6 });
    document.querySelectorAll('.video-promo').forEach(v => videoObserver.observe(v));

    if (localStorage.getItem('dark-mode') === 'true') document.body.classList.add('dark-mode-active');
});

window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) splash.classList.add('splash-hidden');
    }, 1500);
});

// Función para Play / Pause con Iconos
function togglePlay(videoId, btn) {
    const video = document.getElementById(videoId);
    const card = video.closest('.video-card');
    const icon = btn.querySelector('img'); // Buscamos la imagen dentro del botón

    if (video.paused) {
        video.play();
        if (icon) icon.src = "assets/pause-button.png"; // Asegúrate de tener este icono o usa uno similar
        card.classList.add('playing');
    } else {
        video.pause();
        if (icon) icon.src = "assets/play-button.png";
        card.classList.remove('playing');
    }
}

// Función para Silencio / Sonido con Iconos
function toggleMute(videoId, btn) {
    const video = document.getElementById(videoId);
    const icon = btn.querySelector('img');

    video.muted = !video.muted;

    if (icon) {
        // no-sound.png para silenciado, speaker.png para sonido
        icon.src = video.muted ? "assets/no-sound.png" : "assets/speaker.png";
    }
}

// Función para Silencio / Sonido
function toggleMute(videoId, btn) {
    const video = document.getElementById(videoId);
    video.muted = !video.muted;
    btn.innerText = video.muted ? "🔇" : "🔊";
}