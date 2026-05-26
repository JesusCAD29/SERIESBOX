/**
 * public/js/usuario.js
 * Controlador interactivo para las pestañas y formularios de login/registro.
 * Se conecta con los endpoints del backend en /api/usuario/
 */

document.addEventListener('DOMContentLoaded', () => {
  const tabLogin    = document.getElementById('tab-auth-login');
  const tabRegister = document.getElementById('tab-auth-register');
  const formLogin   = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  // ── 1. Alternador de pestañas ─────────────────────────────────────────────
  if (tabLogin && tabRegister && formLogin && formRegister) {
    tabLogin.addEventListener('click', (e) => {
      e.preventDefault();
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      formLogin.classList.remove('hidden-form');
      formLogin.classList.add('active-form');
      formRegister.classList.remove('active-form');
      formRegister.classList.add('hidden-form');
    });

    tabRegister.addEventListener('click', (e) => {
      e.preventDefault();
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      formRegister.classList.remove('hidden-form');
      formRegister.classList.add('active-form');
      formLogin.classList.remove('active-form');
      formLogin.classList.add('hidden-form');
    });
  }

  // ── 2. Formulario de LOGIN ────────────────────────────────────────────────
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();

      const correo   = document.getElementById('login-correo').value.trim();
      const password = document.getElementById('login-password').value;
      const btnSubmit = formLogin.querySelector('button[type="submit"]');

      // Deshabilitar botón mientras carga
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Verificando...';

      try {
        const res = await fetch('/api/usuario/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ correo, password })
        });

        const data = await res.json();

        if (res.ok && data.usuario) {
          App.arrancarAplicación(data.usuario);
        } else {
          alert(`⚠️ ${data.error || 'Credenciales incorrectas. Verifica tus datos.'}`);
        }
      } catch (err) {
        console.error('Error de red en login:', err);
        alert('❌ No se pudo conectar al servidor. Revisa tu conexión.');
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Iniciar Sesión';
      }
    });
  }

  // ── 3. Formulario de REGISTRO ─────────────────────────────────────────────
  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('reg-nombre').value.trim();
      const correo   = document.getElementById('reg-correo').value.trim();
      const password = document.getElementById('reg-password').value;
      const btnSubmit = formRegister.querySelector('button[type="submit"]');

      // Validación básica en el frontend
      if (password.length < 6) {
        alert('⚠️ La contraseña debe tener al menos 6 caracteres.');
        return;
      }

      // Deshabilitar botón mientras carga
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Creando cuenta...';

      try {
        const res = await fetch('/api/usuario/registro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, correo, password })
        });

        const data = await res.json();

        if (res.ok && data.usuario) {
          // Registro exitoso: entramos directo a la app
          App.arrancarAplicación(data.usuario);
        } else {
          alert(`⚠️ ${data.error || 'No se pudo crear la cuenta.'}`);
        }
      } catch (err) {
        console.error('Error de red en registro:', err);
        alert('❌ No se pudo conectar al servidor. Revisa tu conexión.');
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Crear Cuenta';
      }
    });
  }
});
