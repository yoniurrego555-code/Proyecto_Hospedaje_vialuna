import { loginUsuario } from './usuarios.js';

const form = document.getElementById('loginForm');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const email = form.email.value.trim();
            const password = form.password.value;
            const res = await loginUsuario({ email, password });

            if (!res.token) {
                throw new Error(res.mensaje || res.error || 'No fue posible iniciar sesion');
            }

            localStorage.setItem('token', res.token);
            if (res.user) {
                localStorage.setItem('usuario', JSON.stringify(res.user));
            }

            const destino = res.user && res.user.rol === 'admin'
                ? 'usuarios.html'
                : 'reservar.html';

            window.location.href = destino;
        } catch (error) {
            alert(error.message || 'Ocurrio un error al iniciar sesion');
        }
    });
}
