// task-manager.js
// Aplicación de consola en Node.js para registro de tareas con persistencia en JSON
// Ejecutar con: node task-manager.js

const readline = require('readline');
const fs = require('fs'); // Módulo nativo para persistencia

// Configuración de readline para input/output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Archivo para persistencia
const TASKS_FILE = 'tasks.json';

// Array para almacenar las tareas
let tasks = [];

// Estados y dificultades como constantes
const ESTADOS = {
  PENDIENTE: 'Pendiente',
  EN_CURSO: 'En Curso',
  TERMINADA: 'Terminada',
  CANCELADA: 'Cancelada'
};

const DIFICULTADES = {
  FACIL: 'Fácil',
  MEDIO: 'Medio',
  DIFIL: 'Difícil'
};

// Emojis para dificultad (BONUS)
const EMOJIS_DIFICULTAD = {
  [DIFICULTADES.FACIL]: '⭐',
  [DIFICULTADES.MEDIO]: '⭐⭐',
  [DIFICULTADES.DIFIL]: '⭐⭐⭐'
};

// Función para obtener fecha actual como string (formato: YYYY-MM-DD)
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Función para guardar tareas en JSON
function saveTasks() {
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.log('Error al guardar tareas:', error.message);
  }
}

// Función para cargar tareas desde JSON
function loadTasks() {
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, 'utf8');
      const loadedTasks = JSON.parse(data);
      // Reasignar IDs si es necesario (para mantener secuencialidad)
      loadedTasks.forEach((task, index) => {
        task.id = index + 1;
      });
      tasks = loadedTasks;
      console.log(`Cargadas ${tasks.length} tareas desde ${TASKS_FILE}.`);
    } else {
      console.log('Archivo de tareas no encontrado. Iniciando con lista vacía.');
    }
  } catch (error) {
    console.log('Error al cargar tareas. Iniciando con lista vacía:', error.message);
    tasks = [];
  }
}

// Función para mostrar mensaje y cerrar readline
function closeApp() {
  saveTasks(); // Guardar antes de salir
  console.log('\n¡Hasta luego!');
  rl.close();
}

// Función para pausar y esperar input para continuar
function pressEnterToContinue(message = 'Presiona Enter para continuar...') {
  return new Promise((resolve) => {
    console.log(message);
    rl.question('', () => resolve());
  });
}

// Función para validar input numérico en rango
function getValidNumber(prompt, min, max) {
  return new Promise((resolve) => {
    rl.question(prompt, (input) => {
      const num = parseInt(input);
      if (isNaN(num) || num < min || num > max) {
        console.log('Opción inválida. Intenta de nuevo.');
        resolve(getValidNumber(prompt, min, max));
      } else {
        resolve(num);
      }
    });
  });
}

// Función para validar input string no vacío (con límite de longitud)
function getValidString(prompt, maxLength, allowEmpty = false) {
  return new Promise((resolve) => {
    rl.question(prompt, (input) => {
      const trimmed = input.trim();
      if (!allowEmpty && (!trimmed || trimmed.length === 0)) {
        console.log('Este campo no puede estar vacío. Intenta de nuevo.');
        resolve(getValidString(prompt, maxLength, allowEmpty));
      } else if (trimmed.length > maxLength) {
        console.log(`Máximo ${maxLength} caracteres. Intenta de nuevo.`);
        resolve(getValidString(prompt, maxLength, allowEmpty));
      } else {
        resolve(trimmed || ''); // Vacío si solo espacios
      }
    });
  });
}

// Función para validar fecha (formato YYYY-MM-DD, opcional)
function getValidDate(prompt, allowEmpty = true) {
  return new Promise((resolve) => {
    if (allowEmpty) {
      rl.question(`${prompt} (deja en blanco para omitir): `, (input) => {
        if (!input.trim()) {
          resolve(null);
        } else {
          const date = new Date(input);
          if (isNaN(date.getTime())) {
            console.log('Fecha inválida. Usa formato YYYY-MM-DD. Intenta de nuevo.');
            resolve(getValidDate(prompt, allowEmpty));
          } else {
            resolve(date.toISOString().split('T')[0]); // Formato YYYY-MM-DD
          }
        }
      });
    } else {
      resolve(getValidDate(prompt, true));
    }
  });
}

// Función para seleccionar opción de estado
function getEstadoSelection() {
  return new Promise((resolve) => {
    console.log('\nEstados disponibles:');
    console.log('1. Pendiente');
    console.log('2. En Curso');
    console.log('3. Terminada');
    console.log('4. Cancelada');
    rl.question('Selecciona el estado (1-4): ', (input) => {
      const num = parseInt(input);
      switch (num) {
        case 1: resolve(ESTADOS.PENDIENTE); break;
        case 2: resolve(ESTADOS.EN_CURSO); break;
        case 3: resolve(ESTADOS.TERMINADA); break;
        case 4: resolve(ESTADOS.CANCELADA); break;
        default:
          console.log('Opción inválida.');
          resolve(getEstadoSelection());
      }
    });
  });
}

// Función para seleccionar dificultad
function getDificultadSelection() {
  return new Promise((resolve) => {
    console.log('\nDificultades disponibles:');
    console.log('1. Fácil');
    console.log('2. Medio');
    console.log('3. Difícil');
    rl.question('Selecciona la dificultad (1-3): ', (input) => {
      const num = parseInt(input);
      switch (num) {
        case 1: resolve(DIFICULTADES.FACIL); break;
        case 2: resolve(DIFICULTADES.MEDIO); break;
        case 3: resolve(DIFICULTADES.DIFIL); break;
        default:
          console.log('Opción inválida.');
          resolve(getDificultadSelection());
      }
    });
  });
}

// Función para agregar una nueva tarea (Menú Agregar)
async function addTask() {
  console.log('\n=== AGREGAR NUEVA TAREA ===');
  const titulo = await getValidString('Título: ', 100, false);
  const descripcion = await getValidString('Descripción: ', 500, true);
  const estado = await getEstadoSelection();
  const dificultad = await getDificultadSelection();
  const vencimiento = await getValidDate('Fecha de Vencimiento (YYYY-MM-DD)');
  const creacion = getCurrentDate();
  const ultimaEdicion = creacion;

  const newTask = {
    id: tasks.length + 1, // ID simple secuencial
    titulo,
    descripcion,
    estado,
    dificultad,
    creacion,
    ultimaEdicion,
    vencimiento: vencimiento || null // Null para vacío
  };

  tasks.push(newTask);
  saveTasks(); // Guardar después de agregar
  console.log('\n¡Tarea agregada y guardada exitosamente!');
  await pressEnterToContinue();
}

// Función para mostrar detalles de una tarea (Menú Detalles)
async function showTaskDetails(task) {
  console.log('\n=== DETALLES DE LA TAREA ===');
  console.log(`ID: ${task.id}`);
  console.log(`Título: ${task.titulo}`);
  console.log(`Descripción: ${task.descripcion || 'Sin datos'}`);
  console.log(`Estado: ${task.estado}`);
  console.log(`Dificultad: ${task.dificultad} ${EMOJIS_DIFICULTAD[task.dificultad] || ''}`); // BONUS emoji
  console.log(`Creación: ${task.creacion}`); // BONUS
  console.log(`Última Edición: ${task.ultimaEdicion}`); // BONUS
  console.log(`Vencimiento: ${task.vencimiento || 'Sin datos'}`); // BONUS

  console.log('\nOpciones:');
  console.log('E - Editar tarea');
  console.log('0 - Volver al menú anterior');
  
  const inputPromise = new Promise((resolve) => {
    rl.question('Selecciona una opción: ', resolve);
  });
  const input = await inputPromise;
  
  if (input.toUpperCase() === 'E') {
    await editTask(task.id);
    await showTaskDetails(task); // Volver a mostrar detalles después de editar
  } else if (input === '0') {
    // El caller maneja el regreso al listado
  } else {
    console.log('Opción inválida.');
    await showTaskDetails(task); // Recursivo para reintentar
  }
}

// Función para editar una tarea (Menú Edición)
async function editTask(taskId) {
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    console.log('Tarea no encontrada.');
    await pressEnterToContinue();
    return;
  }

  const task = tasks[taskIndex];
  console.log('\n=== EDITAR TAREA ===');
  console.log('Deja en blanco para no cambiar un campo.');

  const tituloInput = await getValidString(`Título actual: ${task.titulo}\nNuevo título: `, 100, true);
  const newTitulo = tituloInput || task.titulo;

  const descripcionInput = await getValidString(`Descripción actual: ${task.descripcion || 'Sin datos'}\nNueva descripción: `, 500, true);
  const newDescripcion = descripcionInput || task.descripcion;

  console.log('Estado actual: ' + task.estado);
  const estado = await getEstadoSelection(); // Pedir nuevo estado

  console.log('Dificultad actual: ' + task.dificultad);
  const dificultad = await getDificultadSelection(); // Pedir nueva dificultad

  const vencimientoInput = await getValidDate(`Vencimiento actual: ${task.vencimiento || 'Sin datos'}\nNuevo vencimiento: `, true);
  const newVencimiento = vencimientoInput || task.vencimiento;

  // Actualizar
  tasks[taskIndex].titulo = newTitulo;
  tasks[taskIndex].descripcion = newDescripcion;
  tasks[taskIndex].estado = estado;
  tasks[taskIndex].dificultad = dificultad;
  tasks[taskIndex].vencimiento = newVencimiento;
  tasks[taskIndex].ultimaEdicion = getCurrentDate(); // BONUS

  saveTasks(); // Guardar después de editar
  console.log('\n¡Tarea editada y guardada exitosamente!');
  await pressEnterToContinue();
}

// Función para listar tareas (Listado de Tareas)
async function listTasks(filteredTasks, fromSearch = false) {
  if (filteredTasks.length === 0) {
    console.log('\nNo hay tareas que cumplan con los criterios.');
    await pressEnterToContinue();
    if (fromSearch) {
      showMainMenu();
    } else {
      showViewTasksMenu();
    }
    return;
  }

  // Ordenar alfabéticamente por título (BONUS)
  filteredTasks.sort((a, b) => a.titulo.localeCompare(b.titulo));

  console.log('\n=== LISTADO DE TAREAS ===');
  filteredTasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task.titulo} - ${task.estado} (${task.dificultad} ${EMOJIS_DIFICULTAD[task.dificultad]})`);
  });

  console.log('\nOpciones:');
  console.log('Selecciona un número para ver detalles.');
  console.log('0 - Volver al menú anterior');

  const inputPromise = new Promise((resolve) => {
    rl.question('Selecciona una opción: ', resolve);
  });
  const input = await inputPromise;
  
  const num = parseInt(input);
  if (num === 0) {
    if (fromSearch) {
      showMainMenu();
    } else {
      showViewTasksMenu();
    }
  } else if (num > 0 && num <= filteredTasks.length) {
    const selectedTask = filteredTasks[num - 1];
    await showTaskDetails(selectedTask);
    await listTasks(filteredTasks, fromSearch); // Volver al listado después de detalles
  } else {
    console.log('Opción inválida.');
    await listTasks(filteredTasks, fromSearch);
  }
}

// Función para menú Ver Mis Tareas
async function showViewTasksMenu() {
  console.log('\n=== VER MIS TAREAS ===');
  console.log('1. Ver todas las tareas');
  console.log('2. Ver pendientes');
  console.log('3. Ver en curso');
  console.log('4. Ver terminadas');
  console.log('0. Volver al menú principal');

  const option = await getValidNumber('Selecciona una opción: ', 0, 4);

  let filteredTasks = [];
  switch (option) {
    case 1:
      filteredTasks = [...tasks];
      await listTasks(filteredTasks);
      break;
    case 2:
      filteredTasks = tasks.filter(t => t.estado === ESTADOS.PENDIENTE);
      await listTasks(filteredTasks);
      break;
    case 3:
      filteredTasks = tasks.filter(t => t.estado === ESTADOS.EN_CURSO);
      await listTasks(filteredTasks);
      break;
    case 4:
      filteredTasks = tasks.filter(t => t.estado === ESTADOS.TERMINADA);
      await listTasks(filteredTasks);
      break;
    case 0:
      showMainMenu();
      break;
  }
  // No recursión infinita: el flujo regresa al principal o se maneja en listTasks
}

// Función para buscar tareas (Menú Buscar)
async function searchTask() {
  console.log('\n=== BUSCAR TAREA ===');
  const inputPromise = new Promise((resolve) => {
    rl.question('Ingresa una palabra o frase para buscar en títulos: ', resolve);
  });
  const query = await inputPromise;
  
  const searchQuery = query.toLowerCase().trim();
  if (!searchQuery) {
    console.log('Búsqueda vacía. Volviendo al menú principal.');
    await pressEnterToContinue();
    showMainMenu();
    return;
  }

  const filteredTasks = tasks.filter(task => 
    task.titulo.toLowerCase().includes(searchQuery)
  );

  if (filteredTasks.length === 0) {
    console.log('No se encontraron tareas que coincidan con la búsqueda.');
    await pressEnterToContinue();
    showMainMenu();
  } else {
    await listTasks(filteredTasks, true); // fromSearch = true
  }
}

// Función para menú principal (con loop recursivo controlado)
async function showMainMenu() {
  console.log('\n=== MENÚ PRINCIPAL ===');
  console.log('1. Ver mis tareas');
  console.log('2. Buscar una tarea');
  console.log('3. Agregar una tarea');
  console.log('0. Salir');

  const option = await getValidNumber('Selecciona una opción: ', 0, 3);

  switch (option) {
    case 1:
      await showViewTasksMenu();
      showMainMenu(); // Volver al principal después de ver tareas
      break;
    case 2:
      await searchTask();
      showMainMenu(); // Volver al principal después de buscar
      break;
    case 3:
     await addTask();
      showMainMenu(); // Volver al principal después de agregar
      break;
    case 0:
      closeApp(); // Salir y guardar
      break;
  }
}

// Inicializar aplicación
loadTasks();
showMainMenu();
