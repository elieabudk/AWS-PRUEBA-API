const btnMostrar = document.getElementById('btnMostrar');
const btnLimpiar = document.getElementById('btnLimpiar');
const usuariosContainer = document.getElementById('usuarios');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');

// Detectar la URL base del API
// Si estamos en el puerto 3000 (servidor Express), usar ruta relativa
// Si no, usar localhost:3000 directamente
const API_BASE_URL = window.location.port === '8080' 
    ? '' 
    : 'http://13.39.95.222:8080';

// Función para mostrar usuarios
async function mostrarUsuarios() {
    loading.style.display = 'block';
    errorDiv.style.display = 'none';
    usuariosContainer.innerHTML = '';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/users`);
        
        // Verificar si la respuesta es OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Verificar el tipo de contenido
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`Respuesta no es JSON. Tipo recibido: ${contentType}. Contenido: ${text.substring(0, 100)}`);
        }
        
        const result = await response.json();
        
        loading.style.display = 'none';
        
        if (result.success && result.data) {
            mostrarTarjetas(result.data);
        } else {
            mostrarError(result.error || 'Error al obtener usuarios');
        }
    } catch (error) {
        loading.style.display = 'none';
        let mensajeError = 'Error de conexión: ' + error.message;
        
        // Mensajes más específicos según el tipo de error
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            mensajeError = 'No se pudo conectar al servidor. Asegúrate de que el servidor Express esté corriendo en http://13.39.95.222:8080';
        }
        
        mostrarError(mensajeError);
        console.error('Error completo:', error);
        console.error('URL intentada:', `${API_BASE_URL}/api/users`);
    }
}

// Función para mostrar las tarjetas de usuarios
function mostrarTarjetas(usuarios) {
    usuariosContainer.innerHTML = usuarios.map(usuario => `
        <div class="usuario-card">
            <h3>${usuario.name}</h3>
            <p><span class="label">Username:</span> ${usuario.username}</p>
            <p><span class="label">Email:</span> <span class="email">${usuario.email}</span></p>
            <p><span class="label">Teléfono:</span> ${usuario.phone}</p>
            <p><span class="label">Sitio web:</span> ${usuario.website}</p>
            <div class="address">
                <p><span class="label">Dirección:</span></p>
                <p>${usuario.address.street}, ${usuario.address.suite}</p>
                <p>${usuario.address.city}, ${usuario.address.zipcode}</p>
            </div>
            <div class="company">
                <p><span class="label">Empresa:</span> ${usuario.company.name}</p>
                <p>${usuario.company.catchPhrase}</p>
            </div>
        </div>
    `).join('');
}

// Función para mostrar errores
function mostrarError(mensaje) {
    errorDiv.textContent = mensaje;
    errorDiv.style.display = 'block';
}

// Función para limpiar
function limpiar() {
    usuariosContainer.innerHTML = '';
    errorDiv.style.display = 'none';
    loading.style.display = 'none';
}

// Event listeners
btnMostrar.addEventListener('click', mostrarUsuarios);
btnLimpiar.addEventListener('click', limpiar);
