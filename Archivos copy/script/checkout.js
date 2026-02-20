// checkout.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('checkout.js cargado correctamente');

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const form = document.getElementById('checkout-form');

    // ────────────────────────────────────────────────
    // CONFIGURACIÓN EMAILJS - CAMBIA ESTOS VALORES
    // ────────────────────────────────────────────────
    const SERVICE_ID = 'service_313cth7';
    const TEMPLATE_VENDEDOR = 'template_1kbpd9s';          // ← este ya funciona
    const TEMPLATE_CONFIRMACION = 'template_alrsimf';   // ← ¡CAMBIAR! Pon aquí el ID real de la plantilla de confirmación al cliente
    // Ejemplo: 'template_k7m9p2q' o 'template_abc123xyz'
    // Ve a: https://dashboard.emailjs.com/admin/templates para copiar el ID correcto

    // Elementos del resumen
    const resumenProductos = document.getElementById('resumen-productos');
    const resumenSubtotal = document.getElementById('resumen-subtotal');
    const resumenEnvio = document.getElementById('resumen-envio');
    const resumenTotal = document.getElementById('resumen-total');

    if (carrito.length === 0) {
        console.log('Carrito vacío – redirigiendo a carrito.html');
        window.location.href = 'carrito.html';
        return;
    }

    console.log(`Carrito tiene ${carrito.length} items – renderizando`);

    // ────────────────────────────────────────────────
    // Renderizar productos en el resumen
    // ────────────────────────────────────────────────
    let subtotal = 0;
    carrito.forEach(item => {
        const cantidad = item.cantidad || 1;
        const precioItem = item.precio * cantidad;
        subtotal += precioItem;

        const fila = document.createElement('div');
        fila.className = 'resumen-item';
        fila.innerHTML = `
            <div class="resumen-item-info letra">
                <strong>${item.nombre}</strong>
                <small>Cant: ${cantidad} × ${item.precio.toFixed(2)} €</small>
            </div>
            <span>${precioItem.toFixed(2)} €</span>
        `;
        resumenProductos.appendChild(fila);
    });

    // ────────────────────────────────────────────────
    // Función para actualizar totales (envío)
    // ────────────────────────────────────────────────
    function actualizarTotales() {
        const envioSeleccionado = document.querySelector('input[name="envio"]:checked')?.value || 'estandar';
        let costoEnvio = 0;

        if (envioSeleccionado === 'express') {
            costoEnvio = 9.90;
        } else if (subtotal < 50) {
            costoEnvio = 5.90;
        }

        const total = subtotal + costoEnvio;

        resumenSubtotal.textContent = subtotal.toFixed(2) + ' €';
        resumenEnvio.textContent = costoEnvio.toFixed(2) + ' €';
        resumenTotal.textContent = total.toFixed(2) + ' €';

        return total;
    }

    document.querySelectorAll('input[name="envio"]').forEach(radio => {
        radio.addEventListener('change', actualizarTotales);
    });

    actualizarTotales();

    // ────────────────────────────────────────────────
    // Validación y envío del formulario
    // ────────────────────────────────────────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Formulario enviado – validando...');

        // Limpiar errores anteriores
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

        let esValido = true;

        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefono = document.getElementById('telefono').value.trim().replace(/\D/g, '');
        const direccion = document.getElementById('direccion').value.trim();
        const ciudad = document.getElementById('ciudad').value.trim();
        const cp = document.getElementById('cp').value.trim();

        if (nombre.length < 3) {
            document.getElementById('error-nombre').textContent = 'El nombre debe tener al menos 3 caracteres';
            esValido = false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            document.getElementById('error-email').textContent = 'Introduce un correo electrónico válido';
            esValido = false;
        }

        if (telefono.length < 9) {
            document.getElementById('error-telefono').textContent = 'El teléfono debe tener al menos 9 dígitos';
            esValido = false;
        }

        if (direccion.length < 5) {
            document.getElementById('error-direccion').textContent = 'La dirección parece demasiado corta';
            esValido = false;
        }

        if (ciudad.length < 2) {
            document.getElementById('error-ciudad').textContent = 'Introduce una ciudad válida';
            esValido = false;
        }

        if (!/^\d{5}$/.test(cp)) {
            document.getElementById('error-cp').textContent = 'El código postal debe tener 5 dígitos';
            esValido = false;
        }

        if (!esValido) {
            const primerError = document.querySelector('.error-message:not(:empty)');
            if (primerError?.previousElementSibling) {
                primerError.previousElementSibling.focus();
            }
            return;
        }

        // ────────────────────────────────────────────────
        // Todo válido → procesar pedido
        // ────────────────────────────────────────────────
        const totalFinal = actualizarTotales();
        const numeroPedido = 'TM-' + Math.floor(100000 + Math.random() * 900000);

        // Preparar lista de productos para emails
        let productosTexto = "";
        carrito.forEach(item => {
            const cant = item.cantidad || 1;
            productosTexto += `• ${item.nombre} × ${cant}  (${(item.precio * cant).toFixed(2)} €)\n`;
        });

        const envioSeleccionado = document.querySelector('input[name="envio"]:checked')?.value || 'estandar';
        const pagoSeleccionado = document.querySelector('input[name="pago"]:checked')?.value || 'tarjeta';

        const datosEmail = {
            nombre,
            email,
            telefono,
            direccion,
            ciudad,
            cp,
            envio: envioSeleccionado === 'express' ? 'Express (24–48h)' : 'Estándar (3–5 días)',
            pago: pagoSeleccionado === 'tarjeta' ? 'Tarjeta' :
                pagoSeleccionado === 'paypal' ? 'PayPal' : 'Transferencia',
            productos: productosTexto,
            total: totalFinal.toFixed(2),
            numero_pedido: numeroPedido
        };

        try {
            // 1. Email al vendedor
            await emailjs.send(SERVICE_ID, TEMPLATE_VENDEDOR, datosEmail);
            console.log('Email al vendedor enviado correctamente');

            // 2. Email de confirmación al cliente
            await emailjs.send(SERVICE_ID, TEMPLATE_CONFIRMACION, datosEmail);
            console.log('Confirmación al cliente enviada correctamente');
        } catch (err) {
            console.error('Error al enviar email(s):', err);
            console.error('Status:', err.status);
            console.error('Texto del error:', err.text);
            // Aquí podrías mostrar un mensaje al usuario si quieres
            // alert('Hubo un problema al enviar la confirmación. Contacta con soporte.');
        }

        // Mostrar mensaje de éxito (aunque el email falle, mostramos éxito para no bloquear al usuario)
        document.getElementById('numero-pedido').textContent = numeroPedido;
        document.getElementById('total-exito').textContent = totalFinal.toFixed(2) + ' €';

        document.querySelector('.checkout-layout').style.display = 'none';
        document.getElementById('mensaje-exito').style.display = 'block';

        // Vaciar carrito
        localStorage.removeItem('carrito');

        // Actualizar contador global si existe
        if (typeof actualizarContadorCarrito === 'function') {
            actualizarContadorCarrito();
        }
    });
});