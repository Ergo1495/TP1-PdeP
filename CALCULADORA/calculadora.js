const readline = require('readline');

// Crear interfaz para leer desde la consola
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para realizar la operación
function calcular(num1, num2, operador) {
  const a = parseFloat(num1);
  const b = parseFloat(num2);

  if (isNaN(a) || isNaN(b)) {
    return 'Error: Ingresa números válidos';
  }

  switch (operador) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      if (b === 0) return 'Error: No se puede dividir por cero';
      return a / b;
    default:
      return 'Error: Operador no válido';
  }
}

// Función para mostrar el menú
function mostrarMenu() {
  console.log('\n' + '='.repeat(40));
  console.log('CALCULADORA');
  console.log('1.Suma (+)');
  console.log('2.Resta (-)');
  console.log('3.Multiplicación (*)');
  console.log('4.División (/)');
  console.log('0.Salir');
  console.log('='.repeat(40));
}

// Función principal para manejar el menú y el bucle
function iniciarCalculadora() {
  mostrarMenu();
  rl.question('Elige una opción (0-4): ', (opcion) => {
    const opcionNum = parseInt(opcion);

    if (opcionNum === 0) {
      console.log('\n¡Hasta luego!');
      rl.close();
      return;
    }

    if (opcionNum < 1 || opcionNum > 4) {
      console.log('\nError: Opción no válida. Por favor, elige entre 0 y 4.');
      // Volver al menú sin cerrar
      iniciarCalculadora();
      return;
    }

    // Determinar el operador basado en la opción
    let operador;
    switch (opcionNum) {
      case 1: operador = '+'; break;
      case 2: operador = '-'; break;
      case 3: operador = '*'; break;
      case 4: operador = '/'; break;
    }

    // Pedir los números
    rl.question('Primer número: ', (num1) => {
      rl.question('Segundo número: ', (num2) => {
        const resultado = calcular(num1, num2, operador);
        console.log(`\nResultado de ${num1} ${operador} ${num2} = ${resultado}`);

        // Volver al menú automáticamente para continuar
        iniciarCalculadora();
      });
    });
  });
}

// Iniciar el programa
console.log('Bienvenido a la calculadora interactiva.\n');
iniciarCalculadora();
