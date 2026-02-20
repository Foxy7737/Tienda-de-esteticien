// contacto.js  (sin reCAPTCHA)

document.getElementById('contacto-form').addEventListener('submit', function (event) {
    event.preventDefault();

    // Limpiar errores previos
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

    let esValido = true;

    // Validaciones básicas
    const nombre = document.getElementById('nombre').value.trim();
    if (nombre.length < 3) {
        document.getElementById('error-nombre').textContent = 'El nombre debe tener al menos 3 caracteres';
        esValido = false;
    }

    const email = document.getElementById('email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById('error-email').textContent = 'Introduce un correo válido';
        esValido = false;
    }

    const asunto = document.getElementById('asunto').value.trim();
    if (asunto.length < 5) {
        document.getElementById('error-asunto').textContent = 'El asunto es demasiado corto';
        esValido = false;
    }

    const mensaje = document.getElementById('mensaje').value.trim();
    if (mensaje.length < 10) {
        document.getElementById('error-mensaje').textContent = 'El mensaje debe tener al menos 10 caracteres';
        esValido = false;
    }

    // Honeypot check (se mantiene como protección básica)
    if (document.getElementById('botcheck').checked) {
        alert('Parece que eres un bot. Inténtalo de nuevo.');
        esValido = false;
    }

    if (!esValido) {
        const primerError = document.querySelector('.error-message:not(:empty)');
        if (primerError && primerError.previousElementSibling) {
            primerError.previousElementSibling.focus();
        }
        return;
    }

    // Recoger datos (sin token de reCAPTCHA)
    const formData = {
        nombre: nombre,
        email: email,
        telefono: document.getElementById('telefono').value.trim(),
        asunto: asunto,
        mensaje: mensaje
        // ya no incluimos 'g-recaptcha-response'
    };

    // Enviar con EmailJS
    emailjs.send('service_w1zpbo2', 'template_as1b90t', formData)
        .then(function () {
            // Mostrar mensaje bonito
            document.querySelector('.contacto-contenido').style.display = 'none';
            document.getElementById('mensaje-exito-contacto').style.display = 'block';

            // Limpiar formulario
            document.getElementById('contacto-form').reset();
        }, function (error) {
            alert('Error al enviar: ' + JSON.stringify(error));
        });
});