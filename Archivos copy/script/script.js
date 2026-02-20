// ── Barra de navegación (se carga en todas las páginas) ────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Cargar Font Awesome si no está
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
        document.head.appendChild(link);
    }

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    const navHTML = `
    <nav class="barra">
       <div class="logo">
    <img src="Archivos/Imagenes/icono.ico" alt="TuMarca" class="logo-img">
</div>
        
        <div class="nav-right">
            <button class="menu-toggle" aria-label="Abrir menú">
                <i class="fas fa-bars"></i>
            </button>
        </div>

        <ul class="nav-menu">
            <li><a href="index.html" class="${currentPage === 'index.html' ? 'activo' : ''} letra">Inicio</a></li>
            <li><a href="tratamientos.html" class="${currentPage === 'tratamientos.html' ? 'activo' : ''} letra">Tratamientos</a></li>
            <li><a href="aparatologia.html" class="${currentPage === 'aparatologia.html' ? 'activo' : ''} letra">Aparatologia manos libres</a></li>
            <li><a href="Tienda.html" class="${currentPage === 'Tienda.html' ? 'activo' : ''} letra">Tienda</a></li>
            <li><a href="contacto.html" class="${currentPage === 'contacto.html' ? 'activo' : ''} letra">Contacto</a></li>
             <a href="carrito.html" class="cart-icon ${currentPage === 'carrito.html' ? 'activo' : ''}">
                <i class="fas fa-shopping-cart"></i>
                <span class="cart-count" id="cart-count">0</span>
            </a>
        </ul>
    </nav>
`;

    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // Toggle menú móvil
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
            // Cerrar menú al clic fuera
            document.addEventListener('click', function (e) {
                if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                    const icon = menuToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });

        // Cerrar al clic en enlace (buena práctica en móvil)
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }

    actualizarContadorCarrito();
});

// ── Función compartida: contador del carrito (todas las páginas) ───────
function actualizarContadorCarrito() {
    const countElement = document.getElementById('cart-count');
    if (!countElement) return;

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let total = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
    countElement.textContent = total;
}

// ── Función compartida: añadir al carrito ──────────────────────────────
window.añadirAlCarrito = function (id, nombre, precio, imagen) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    const existe = carrito.find(item => item.id === id);
    if (existe) {
        existe.cantidad = (existe.cantidad || 1) + 1;
    } else {
        carrito.push({ id, nombre, precio, imagen, cantidad: 1 });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    alert('¡Producto añadido al carrito!');
};

// ── Código ESPECÍFICO de la página carrito.html ────────────────────────
const carritoContenido = document.getElementById('carrito-contenido');

if (carritoContenido) {
    const totalSection = document.getElementById('total-section');
    const totalFinalEl = document.getElementById('total-final');
    const subtotalEl = document.getElementById('subtotal');
    const articulosEl = document.getElementById('articulos-total');
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    function renderCarrito() {
        if (carrito.length === 0) {
            carritoContenido.innerHTML = `
                <div class="carrito-vacio">
                    <i class="far fa-shopping-cart"></i>
                    <h2 class="letra">Tu carrito está vacío</h2>
                    <p class="letra">Parece que aún no has añadido ningún producto.</p>
                    <a href="Tienda.html" class="btn btn-primario letra">Ir a la tienda</a>
                </div>
            `;
            if (totalSection) totalSection.style.display = 'none';
            if (articulosEl) articulosEl.textContent = '0 artículos';
            actualizarContadorCarrito();
            return;
        }

        let html = '<table class="cart-table letra">';
        html += '<thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th></th></tr></thead>';
        html += '<tbody>';

        let total = 0;

        carrito.forEach((item, index) => {
            const cantidad = item.cantidad || 1;
            const subtotal = item.precio * cantidad;
            total += subtotal;

            html += `
                <tr>
                    <td data-label="Producto">
                        <div class="producto-info">
                            ${item.imagen ? `<img src="${item.imagen}" alt="${item.nombre}" class="producto-img">` : ''}
                            <div>
                                <strong>${item.nombre}</strong><br>
                                <small>Ref: ${item.referencia || '—'}</small>
                            </div>
                        </div>
                    </td>
                    <td data-label="Precio">${item.precio.toFixed(2)} €</td>
                    <td data-label="Cantidad">
                        <div class="cantidad-control">
                            <button class="cantidad-btn" onclick="cambiarCantidad(${index}, -1)">−</button>
                            <span class="cantidad-display">${cantidad}</span>
                            <button class="cantidad-btn" onclick="cambiarCantidad(${index}, 1)">+</button>
                        </div>
                    </td>
                    <td data-label="Subtotal">${subtotal.toFixed(2)} €</td>
                    <td data-label="Acción">
                        <button class="btn btn-danger" onclick="eliminarProducto(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
        });

        html += '</tbody></table>';

        carritoContenido.innerHTML = html;

        // Actualizar precios y totales
        if (totalFinalEl) totalFinalEl.textContent = total.toFixed(2);
        if (subtotalEl) subtotalEl.textContent = total.toFixed(2) + ' €';
        if (totalSection) totalSection.style.display = 'block';

        // Actualizar contador de artículos
        if (articulosEl) {
            const numArticulos = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
            articulosEl.textContent = numArticulos === 1
                ? `1 artículo`
                : `${numArticulos} artículos`;
        }

        actualizarContadorCarrito();
    }

    window.cambiarCantidad = function (index, delta) {
        let nuevaCant = (carrito[index].cantidad || 1) + delta;
        if (nuevaCant < 1) nuevaCant = 1;
        carrito[index].cantidad = nuevaCant;
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderCarrito();
    };

    window.eliminarProducto = function (index) {
        if (confirm('¿Eliminar este producto del carrito?')) {
            carrito.splice(index, 1);
            localStorage.setItem('carrito', JSON.stringify(carrito));
            renderCarrito();
        }
    };

    // Botón Finalizar compra – Opción B (redirige de verdad a checkout.html)
    const btnFinalizar = document.getElementById('finalizar-compra');
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', () => {
            // Obtenemos el carrito actual desde localStorage
            let carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];

            if (carritoActual.length === 0) {
                alert('Tu carrito está vacío.\nAñade al menos un producto antes de continuar.');
                return;
            }

            // Opcional: podrías hacer alguna validación extra aquí en el futuro
            // Ejemplo: comprobar stock, edad mínima, etc.

            // Redirección real a la página de checkout
            window.location.href = 'checkout.html';
        });
    }

    // Inicializar carrito
    renderCarrito();
}

// ── Código ESPECÍFICO de Tienda.html ───────────────────────────────────
const productosGrid = document.getElementById('productos-grid');
const busquedaInput = document.getElementById('busqueda-input');
const categoriaSelect = document.getElementById('categoria-select');
const resultadosContador = document.getElementById('resultados-contador');
const paginacionContainer = document.getElementById('paginacion');

let currentPage = 1;
const productosPorPagina = 12;
let filteredProductos = [];

function getCategoriasUnicas() {
    const cats = productos.map(p => p.categoria).filter(Boolean);
    return [...new Set(cats)].sort();
}

function renderProductos() {
    if (!productosGrid) return;
    productosGrid.innerHTML = '';

    const texto = (busquedaInput?.value || '').toLowerCase().trim();
    const categoria = (categoriaSelect?.value || '').trim();

    filteredProductos = productos.filter(prod => {
        const matchTexto = !texto ||
            prod.nombre.toLowerCase().includes(texto) ||
            (prod.descripcion || '').toLowerCase().includes(texto);

        const matchCategoria = categoria === "" ||
            (prod.categoria && prod.categoria === categoria);

        return matchTexto && matchCategoria;
    });

    // ====================== NUEVO CONTADOR (solo cantidad de esta página) ======================
    if (resultadosContador) {
        const total = filteredProductos.length;

        if (total === 0) {
            resultadosContador.textContent = "No se encontraron productos";
        } else {
            const totalPaginas = Math.ceil(total / productosPorPagina);
            if (currentPage > totalPaginas) currentPage = totalPaginas || 1;

            const start = (currentPage - 1) * productosPorPagina;
            const end = start + productosPorPagina;
            const cantidadMostrada = filteredProductos.slice(start, end).length;

            resultadosContador.textContent = `Mostrando ${cantidadMostrada} poductos`;
        }
    }
    // =======================================================================================

    if (filteredProductos.length === 0) {
        productosGrid.innerHTML = `
            <div class="no-resultados letra" style="grid-column: 1 / -1; text-align:center; padding:4rem 1rem;">
                <h2>No encontramos resultados</h2>
                <p>Prueba con otra búsqueda o categoría • <a href="Tienda.html">Ver todos los productos</a></p>
            </div>
        `;
        renderPaginacion(0);
        return;
    }

    const totalPaginas = Math.ceil(filteredProductos.length / productosPorPagina);
    if (currentPage > totalPaginas) currentPage = totalPaginas || 1;

    const start = (currentPage - 1) * productosPorPagina;
    const end = start + productosPorPagina;
    const paginaActual = filteredProductos.slice(start, end);

    paginaActual.forEach(prod => {
        const precioSeguro = typeof prod.precio === 'number' ? prod.precio : 0;
        const card = document.createElement('div');
        card.className = 'card producto';
        card.innerHTML = `
            <a href="detalle.html?id=${prod.id}" class="imagen-link">
              <div class="imagen-contenedor">
                <img src="${prod.imagen}" alt="${prod.nombre}" loading="lazy">
              </div>
            </a>
            <div class="info">
              <h3><a href="detalle.html?id=${prod.id}">${prod.nombre}</a></h3>
              <p class="referencia">Ref: ${prod.referencia || '—'}</p>
              <p class="categoria-small">Categoría: ${prod.categoria || 'Sin categoría'}</p>
              <div class="precio-block">
                <strong class="precio">${precioSeguro.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</strong>
                <span class="iva">IVA incl.</span>
              </div>
              <button class="btn-add grande letra" 
                      onclick="añadirAlCarrito(${prod.id}, '${prod.nombre.replace(/'/g, "\\'")}', ${precioSeguro}, '${prod.imagen.replace(/'/g, "\\'")}')">
                Añadir al carrito
              </button>
            </div>
        `;
        productosGrid.appendChild(card);
    });

    renderPaginacion(totalPaginas);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderPaginacion(totalPaginas) {
    if (!paginacionContainer) return;
    paginacionContainer.innerHTML = '';

    if (totalPaginas <= 1) return;

    let html = `
        <button id="prev-page" class="pagina-btn" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>
    `;

    for (let i = 1; i <= totalPaginas; i++) {
        html += `<button class="pagina-btn ${i === currentPage ? 'activo' : ''}" data-page="${i}">${i}</button>`;
    }

    html += `
        <button id="next-page" class="pagina-btn" ${currentPage === totalPaginas ? 'disabled' : ''}>Siguiente</button>
    `;

    paginacionContainer.innerHTML = html;

    // Eventos
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) { currentPage--; renderProductos(); }
    });
    document.getElementById('next-page').addEventListener('click', () => {
        if (currentPage < Math.ceil(filteredProductos.length / productosPorPagina)) { currentPage++; renderProductos(); }
    });
    paginacionContainer.querySelectorAll('.pagina-btn[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.dataset.page);
            renderProductos();
        });
    });
}

// ── Inicialización de la tienda ─────────────────────────────────────────
if (productosGrid && typeof productos !== 'undefined' && Array.isArray(productos)) {
    const categorias = getCategoriasUnicas();
    categorias.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        categoriaSelect.appendChild(opt);
    });

    if (categoriaSelect) categoriaSelect.value = "";

    currentPage = 1;
    renderProductos();

    busquedaInput?.addEventListener('input', () => { currentPage = 1; renderProductos(); });
    categoriaSelect?.addEventListener('change', () => { currentPage = 1; renderProductos(); });
}

// ── Código ESPECÍFICO de detalle.html ───────────────────────────────────
const detalleContenedor = document.getElementById('detalle-producto');

if (detalleContenedor) {
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));
    const producto = productos.find(p => p.id === id);

    if (!producto || isNaN(id)) {
        detalleContenedor.innerHTML = `
            <div class="error-centrado letra">
                <h1>Producto no encontrado</h1>
                <p>No pudimos encontrar el producto que buscas.</p>
                <a href="Tienda.html" class="btn">Volver a la tienda</a>
            </div>
        `;
        document.title = "Producto no encontrado";
    } else {
        document.title = `${producto.nombre} – Centro de Estética M. Jose Vera`;

        const galeriaHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="img-principal">
        `;

        // SECCIÓN DESCRIPCIÓN SIEMPRE VISIBLE (todos los productos la tienen)
        let infoAdicionalHTML = `
            <div class="descripcion-completa letra">
                <h3>Descripción</h3>
                <p>${producto.descripcion}</p>
            </div>
        `;

        // SECCIÓN "INDICADO PARA" + "BENEFICIOS" SOLO si existen (parches)
        if (producto.indicado && Array.isArray(producto.indicado) && producto.beneficios && Array.isArray(producto.beneficios)) {
            infoAdicionalHTML += `
               <div class="caracteristicas letra">
                   <h3>Indicado para:</h3>
                      <ul>
                         ${producto.indicado.map(c => `<li>${c}</li>`).join('')}
                      </ul>

                      <h3>Beneficios:</h3>
                      <ul>
                      ${producto.beneficios.map(c => `<li>${c}</li>`).join('')}
                      </ul>
              </div>
            `;
        }

        detalleContenedor.innerHTML = `
            <div class="detalle-layout">
                <div class="galeria-detalle">
                    ${galeriaHTML}
                </div>

                <div class="info-compra letra">
                    <h1>${producto.nombre}</h1>
                    <p class="referencia">Ref: ${producto.referencia || '—'}</p>

                    <div class="precio-block grande letra">
                        <strong class="precio">${(typeof producto.precio === 'number' ? producto.precio : 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</strong>
                        <span class="iva">IVA incluido</span>
                    </div>

                    <p class="stock ${Number(producto.stock) > 0 ? 'disponible' : 'agotado'}">
                        ${Number(producto.stock) > 0 ? `En stock (${producto.stock} uds.)` : 'Agotado temporalmente'}
                    </p>

                    <p class="envio-info">${producto.envio} · ${producto.plazo}</p>

                    <button class="btn-add grande letra" 
                            onclick="añadirAlCarrito(${producto.id}, '${producto.nombre.replace(/'/g, "\\'")}', ${producto.precio}, '${producto.imagen.replace(/'/g, "\\'")}')">
                        Añadir al carrito
                    </button>
                </div>
            </div>

            <div class="info-adicional">
                ${infoAdicionalHTML}
            </div>
        `;
    }
}