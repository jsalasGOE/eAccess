// Configuración inicial
let usuarioInfo = {}; // Variable global para almacenar la información del usuario (feedback)

const CONFIG = {
  INACTIVITY_TIMEOUT: 60 * 1000, // 60 segundos
  TOAST_DURATION: 3000,
  ANIMATION_DELAY: 300
};

// Base de datos simulada
const usuarios = [
  { user: "profe", pass: "1234", rol: "docente", nombre: "Profesor" },
  { user: "alumno", pass: "5678", rol: "alumno", nombre: "Estudiante" },
  { user: "admin", pass: "admin", rol: "docente", nombre: "Administrador" }
];

const islas = Array.from({length: 6}, (_, i) => ({ 
  id: i + 1, 
  nombre: `Isla ${i + 1}`, 
  img: `images/isla${i+1}.jpg`,
  color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][i]
}));

// Generar aulas con estados aleatorios
let aulas = [];
islas.forEach(isla => {
  ['A', 'B', 'C', 'D', 'E'].forEach((letra) => {
    aulas.push({
      letra: letra,
      estado: Math.random() > 0.5 ? "abierta" : "cerrada",
      islaId: isla.id
    });
  });
});

// Variables globales
let usuarioActivo = null;
let islaSeleccionada = null;
let inactivityTimer = null;

// Utilidades
const Utils = {
  // Limpiar campos de login
  clearLoginFields() {
    document.getElementById("usuario").value = "";
    document.getElementById("clave").value = "";
    document.getElementById("error").innerText = "";
  },

  // Mostrar notificación toast
  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    // Mostrar toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Ocultar toast
    setTimeout(() => {
      toast.classList.remove('show');
    }, CONFIG.TOAST_DURATION);
  },

  // Actualizar información del usuario
  updateUserInfo() {
    if (usuarioActivo) {
      const welcome = document.getElementById('userWelcome');
      const emoji = usuarioActivo.rol === 'docente' ? '👨‍🏫' : '👨‍🎓';
      welcome.textContent = `${emoji} Bienvenido, ${usuarioActivo.nombre}`;
    }
  },

  // Formatear nombre de isla con emojis
  formatIslandName(nombre, index) {
    const emojis = ['🏝️', '🌴', '🏖️', '⛱️', '🌺', '🦜'];
    return `${emojis[index % emojis.length]} ${nombre}`;
  },

  // Generar color de fondo para islas sin imagen
  getIslandBackground(isla, index) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    //return `linear-gradient(135deg, ${colors[index % colors.length]}, ${colors[(index + 1) % colors.length]})`;
  }
};

// Gestión de sesiones (adaptada para integrarse con el nuevo flujo)
const SessionManager = {
  // Iniciar sesión (mantenemos la lógica original)
  login() {
    const user = document.getElementById("usuario").value.trim();
    const pass = document.getElementById("clave").value.trim();
    
    if (!user || !pass) {
      document.getElementById("error").innerText = "Por favor, completa todos los campos";
      return;
    }

    const u = usuarios.find(u => u.user === user && u.pass === pass);
    
    if (u) {
      usuarioActivo = u;
      Utils.showToast(`¡Bienvenido ${u.nombre}!`, 'success');
      Utils.clearLoginFields();
      
      setTimeout(() => {
        mostrarPantalla("islasContainer");
        cargarIslas();
        this.resetInactivityTimer();
      }, CONFIG.ANIMATION_DELAY);
    } else {
      document.getElementById("error").innerText = "Usuario o contraseña incorrecta";
      Utils.showToast("Credenciales inválidas", 'warning');
    }
  },

  // Cerrar sesión (mantenemos la lógica original)
  logout() {
    if (usuarioActivo) {
      Utils.showToast(`Hasta luego, ${usuarioActivo.nombre}`, 'info');
    }
    
    usuarioActivo = null;
    islaSeleccionada = null;
    Utils.clearLoginFields();
    this.clearInactivityTimer();
    
    setTimeout(() => {
      mostrarPantalla("loginContainer");
    }, CONFIG.ANIMATION_DELAY);
  },

  // Manejar inactividad (mantenemos la lógica original)
  resetInactivityTimer() {
    this.clearInactivityTimer();
    inactivityTimer = setTimeout(() => {
      Utils.showToast('Sesión cerrada por inactividad', 'warning');
      setTimeout(() => this.logout(), 2000);
    }, CONFIG.INACTIVITY_TIMEOUT);
  },

  clearInactivityTimer() {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }
  }
};

// Gestión de interfaces (mantenemos la lógica original)
const UIManager = {
  // Mostrar pantalla específica
  mostrarPantalla(id) {
    document.querySelectorAll(".container").forEach(c => {
      c.classList.remove("visible");
    });
    
    setTimeout(() => {
      document.getElementById(id).classList.add("visible");
    }, 100);
  },

  // Cargar grid de islas (mantenemos la lógica original)
  cargarIslas() {
    const contenedor = document.getElementById("islas");
    contenedor.innerHTML = "";
    Utils.updateUserInfo();
    
    islas.forEach((isla, index) => {
      const div = document.createElement("div");
      div.className = "card";
      
      // Usar imagen si existe, sino color de fondo
      if (isla.img && isla.img == `images/isla${isla.id}.jpg`) {
        div.style.backgroundImage = `url('${isla.img}')`;
      } else {
        div.style.background = Utils.getIslandBackground(isla, index);
      }
      
      const span = document.createElement("span");
      span.textContent = Utils.formatIslandName(isla.nombre, index);
      div.appendChild(span);
      
      div.onclick = () => {
        islaSeleccionada = isla;
        Utils.showToast(`Accediendo a ${isla.nombre}`, 'info');
        
        setTimeout(() => {
          this.mostrarPantalla("mapaContainer");
          this.cargarAulas();
        }, CONFIG.ANIMATION_DELAY);
      };
      
      contenedor.appendChild(div);
    });
  },

  // Cargar aulas de la isla seleccionada (mantenemos la lógica original)
  cargarAulas() {
    if (!islaSeleccionada) return;
    
    document.getElementById("islaNombre").textContent = 
      Utils.formatIslandName(islaSeleccionada.nombre, islaSeleccionada.id - 1);
    
    const contenedor = document.getElementById("aulas");
    contenedor.innerHTML = "";
    
    // Mostrar controles de profesor
    const teacherControls = document.getElementById("teacherControls");
    teacherControls.style.display = usuarioActivo?.rol === "docente" ? "flex" : "none";
    
    // Determinar posición de tutoría (izquierda o derecha)
    const tutorLeft = [1, 4, 6].includes(islaSeleccionada.id);
    
    if (tutorLeft) contenedor.appendChild(this.crearTutoria());
    
    // Crear aulas
    aulas.filter(a => a.islaId === islaSeleccionada.id).forEach(aula => {
      contenedor.appendChild(this.crearAulaElemento(aula));
    });
    
    if (!tutorLeft) contenedor.appendChild(this.crearTutoria());
  },

  // Crear elemento tutoría (mantenemos la lógica original)
  crearTutoria() {
    const div = document.createElement("div");
    div.className = "tutoria";
    div.innerHTML = `<span>📚 Tutoría</span>`;
    
    div.onclick = () => {
      Utils.showToast("Acceso a tutoría", 'info');
    };
    
    return div;
  },

  // Crear elemento aula (mantenemos la lógica original)
  crearAulaElemento(aula) {
    const div = document.createElement("div");
    div.className = `aula ${aula.estado}`;
    
    const statusIcon = aula.estado === "abierta" ? "🟢" : "🔴";
    const statusText = aula.estado === "abierta" ? "Abierta" : "Cerrada";
    
    div.innerHTML = `
      <div>
        <div style="font-size: 20px;">${statusIcon}</div>
        <div>Aula ${aula.letra}</div>
        <div style="font-size: 12px; opacity: 0.8;">${statusText}</div>
      </div>
    `;
    
    div.onclick = () => {
      if (usuarioActivo.rol === "docente") {
        aula.estado = aula.estado === "abierta" ? "cerrada" : "abierta";
        const newStatus = aula.estado === "abierta" ? "abrió" : "cerró";
        Utils.showToast(`Se ${newStatus} el Aula ${aula.letra}`, 'success');
        this.cargarAulas();
      } else {
        Utils.showToast(`Aula ${aula.letra}: ${aula.estado}`, 'info');
      }
    };
    
    return div;
  }
};

// Funciones de control masivo (mantenemos la lógica original)
const ClassroomController = {
  // Abrir/cerrar todas las aulas
  toggleAllAulas(nuevoEstado) {
    if (usuarioActivo?.rol !== "docente" || !islaSeleccionada) return;
    
    const aulasIsla = aulas.filter(a => a.islaId === islaSeleccionada.id);
    let cambios = 0;
    
    aulasIsla.forEach(aula => {
      if (aula.estado !== nuevoEstado) {
        aula.estado = nuevoEstado;
        cambios++;
      }
    });
    
    if (cambios > 0) {
      const accion = nuevoEstado === "abierta" ? "abrieron" : "cerraron";
      Utils.showToast(`Se ${accion} ${cambios} aula${cambios > 1 ? 's' : ''}`, 'success');
      UIManager.cargarAulas();
    } else {
      const estado = nuevoEstado === "abierta" ? "abiertas" : "cerradas";
      Utils.showToast(`Todas las aulas ya están ${estado}`, 'info');
    }
  }
};

// Funciones globales para mantener compatibilidad (mantenemos las originales)
function login() {
  SessionManager.login();
}

function logout() {
  SessionManager.logout();
}

function mostrarPantalla(id) {
  UIManager.mostrarPantalla(id);
}

function cargarIslas() {
  UIManager.cargarIslas();
}

function cargarAulas() {
  UIManager.cargarAulas();
}

function volverIslas() {
  Utils.showToast(`Saliendo de ${islaSeleccionada?.nombre || 'la isla'}`, 'info');
  setTimeout(() => {
    mostrarPantalla("islasContainer");
  }, CONFIG.ANIMATION_DELAY);
}

function toggleAllAulas(estado) {
  ClassroomController.toggleAllAulas(estado);
}

// --- NUEVO: Funciones para manejar los popups y feedback ---
function guardarUsuario() {
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const email = document.getElementById('email').value.trim();

    if (!nombre || !apellido || !email) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    // Guarda la información en la variable global
    usuarioInfo = { nombre, apellido, email };

    // Guarda la información y el estado de completado en localStorage
    localStorage.setItem('usuarioInfo', JSON.stringify(usuarioInfo));
    localStorage.setItem('identificacionCompletada', 'true');

    // Oculta el popup de identificación
    document.getElementById('popupIdentificacion').style.display = 'none'; // Oculta el popup

    // MUESTRA el contenedor principal del sistema de aulas
    document.getElementById('contenidoPrincipalSistema').style.display = 'block'; // Muestra el contenido principal

    // Opcional: Actualiza la UI con la info del usuario si aplica
    document.getElementById('userWelcome').textContent = `Hola ${nombre} ${apellido}`;
    // document.getElementById('userInfo').style.display = 'block'; // Si usas este ID en lugar de userWelcome
}

function abrirFeedback() {
    document.getElementById('popupFeedback').style.display = 'flex'; // Mostrar popup feedback
}

function cerrarFeedback() {
    document.getElementById('popupFeedback').style.display = 'none'; // Ocultar popup feedback
}

function guardarFeedback() {
    const experiencia = document.getElementById('experienciaGeneral').value;
    const facilidad = document.getElementById('facilidadUso').value;

    // Verifica que la info del usuario esté disponible (debería estar si pasó el primer popup)
    if (!usuarioInfo.nombre || !usuarioInfo.apellido || !usuarioInfo.email) {
        alert("No se puede enviar feedback: Información de usuario no disponible.");
        console.error("Información de usuario no encontrada:", usuarioInfo);
        return;
    }

    // Datos a enviar, incluyendo la info del usuario
    const datos = {
        nombre: usuarioInfo.nombre,
        apellido: usuarioInfo.apellido,
        email: usuarioInfo.email,
        experiencia_general: experiencia,
        facilidad_uso: facilidad
    };

    // URL de tu Google Apps Script DESPLEGADO (la que me mostraste)
    const scriptURL = 'https://script.google.com/a/macros/goethemail.net/s/AKfycbzNuqOQ1wgtftT3r1FsAclsYIHJYqhjG5ZYv4NWRxjWdESvSJva6-tGr9PKXRQTjPyjwQ/exec  ';

    // Importante: Usar 'application/x-www-form-urlencoded' para enviar datos al script
    // y 'no-cors' para evitar errores en GitHub Pages (aunque limita respuesta).
    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors', // Crucial para GitHub Pages -> Apps Script
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(datos) // Convierte el objeto JS en el formato adecuado
    })
    .then(response => {
        // Con 'no-cors', no puedes leer la respuesta real del script.
        // Pero si llega aquí, la solicitud se envió.
        console.log('Solicitud de feedback enviada.');
        alert('Feedback enviado. ¡Gracias por tu opinión!'); // Mensaje genérico
        cerrarFeedback(); // Cierra el popup de feedback
    })
    .catch(error => {
        console.error('Error al enviar feedback:', error);
        alert('Hubo un error al enviar tu feedback. Inténtalo de nuevo más tarde.');
    });
}
// --- Fin de las nuevas funciones ---


// Inicialización y eventos
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si ya se completó la identificación al cargar la página
    const identificacionCompletada = localStorage.getItem('identificacionCompletada');

    if (identificacionCompletada) {
        // Si 'identificacionCompletada' es 'true', significa que ya se completó
        console.log("Identificación ya completada previamente.");

        // Recuperar la info del usuario si también la guardaste
        const storedInfo = localStorage.getItem('usuarioInfo');
        if (storedInfo) {
            usuarioInfo = JSON.parse(storedInfo);
        }

        // Ocultar el popup de identificación
        document.getElementById('popupIdentificacion').style.display = 'none';
        // MOSTRAR el contenedor principal del sistema de aulas
        document.getElementById('contenidoPrincipalSistema').style.display = 'block'; // Asegúrate de que este ID coincida con tu HTML

        // Opcional: Actualizar UI del usuario (ej: mostrar nombre en userWelcome)
        if (storedInfo) { // Si recuperamos info, actualizamos el nombre
             const parsedInfo = JSON.parse(storedInfo);
             document.getElementById('userWelcome').textContent = `Hola ${parsedInfo.nombre} ${parsedInfo.apellido}`;
        }

    } else {
        // Si 'identificacionCompletada' NO existe, mostrar el popup de identificación
        console.log("Mostrando popup de identificación.");
        document.getElementById('popupIdentificacion').style.display = 'flex'; // O 'block', dependiendo de tu CSS
        // Asegurar que el contenedor principal del sistema esté oculto mientras se responde el popup
        document.getElementById('contenidoPrincipalSistema').style.display = 'none'; // Asegúrate de que este ID coincida con tu HTML
    }

    // Conecta el botón flotante de feedback
    document.getElementById('openFeedbackBtn').addEventListener('click', abrirFeedback);

    // --- Código original que se ejecutaba en DOMContentLoaded ---
    // Eventos de teclado
    document.getElementById('usuario').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
        document.getElementById('clave').focus();
        }
    });

    document.getElementById('clave').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
        login();
        }
    });

    // Limpiar campos al enfocar
    document.getElementById('usuario').addEventListener('focus', function() {
        document.getElementById('error').innerText = '';
    });

    // Eventos que reinician el temporizador de inactividad
    const resetEvents = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    resetEvents.forEach(evento => {
        document.addEventListener(evento, () => {
        if (usuarioActivo) {
            SessionManager.resetInactivityTimer();
        }
        }, { passive: true });
    });

    // Inicialización general (mensaje de consola y toast)
    console.log('🏫 Sistema de Gestión de Aulas - Goethe Schule iniciado');
    Utils.showToast('Sistema iniciado correctamente', 'success');

    // Mostrar la pantalla de login ORIGINAL solo si NO se completó la identificación
    // y si tu sistema original requiere un login después de la identificación.
    // Si el flujo es directo al sistema de aulas después de la identificación,
    // esta línea no sería necesaria aquí dentro del 'else'.
    // if (!identificacionCompletada) {
    //     mostrarPantalla("loginContainer"); // Descomentar si es necesario mostrar login después de identificación
    // }
    // --- Fin del código original ---
});