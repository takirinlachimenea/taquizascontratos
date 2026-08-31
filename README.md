# 🌮 Takirin La Chimenea - Sistema de Gestión de Contratos y Calendario de Taquizas

Aplicación web diseñada específicamente para **Takirin La Chimenea** (*"Donde la carne es más suave que la tortilla"*), ubicada en Córdoba, Veracruz.

Permite generar, editar, calcular anticipos, gestionar calendarios de eventos e imprimir contratos en PDF manteniendo **el diseño y formato oficial idéntico (FOP-01)**.

---

## ✨ Características Principales

1. **📄 Formato Oficial FOP-01 Idéntico (1:1)**:
   - Encabezado oficial con logotipo, dirección ("Calle 15 #221, Col. Centro, Córdoba, Ver.") y teléfono ("271 157 1770").
   - Folio automático configurable y casillas de fecha (Día, Mes, Año).
   - Bloque de datos del cliente (Nombre, Dirección, Referencia, Teléfono).
   - Tabla de paquetes, complementos predeterminados con viñetas, adicionales y costo de traslado.
   - Desglose de horarios (Llegada, Inicio, Duración del servicio, Fin del evento) y aviso de hora extra ($300).
   - Tabla de anticipos múltiples con desglose de Saldo Restante en tiempo real, Subtotal, IVA y Total.
   - Cláusulas oficiales de penalización por cancelación (5% >15 días, 10% <=10 días).
   - Líneas de firma para Elaboró y Cliente, personal asignado y redes sociales oficiales al pie.

2. **💵 Control Dinámico de Anticipos**:
   - Registro de múltiples abonos por contrato (Fecha, Método de pago: Efectivo, Transferencia, Tarjeta, Depósito, Monto y Nota).
   - Auto-cálculo instantáneo del saldo pendiente por cobrar.
   - Modal de *Abono Rápido* para registrar pagos sin salir de la lista o calendario.

3. **📅 Calendario Interactivo de Taquizas**:
   - Vistas mensual y de agenda.
   - Indicadores de color por estado de pago (Verde = Liquidado, Amarillo = Saldo pendiente, Rojo = Sin anticipo).
   - Modal de detalles con acceso directo a WhatsApp, impresión y edición.
   - Creación de contratos con 1 clic seleccionando cualquier día del calendario.

4. **🖨️ Impresión y PDF de Alta Fidelidad**:
   - Optimizado para hoja tamaño Carta (Letter) con márgenes exactos.
   - Compatible con impresión directa del navegador (`window.print`) y descarga de archivo `.pdf` con `html2pdf.js`.

5. **💾 Guardado Local y Sincronización en GitHub**:
   - Almacenamiento persistente en el dispositivo (`localStorage` / `IndexedDB`).
   - Exportación e importación de copias de seguridad en archivo `.json`.
   - Listo para ejecutarse localmente o publicarse en **GitHub Pages** para acceder desde cualquier iPhone, Android, tablet o computadora.

---

## 🚀 Cómo Usar Localmente

### Opción 1: Abrir directamente en el navegador
Puedes abrir el archivo `index.html` haciendo doble clic desde tu explorador de archivos en cualquier navegador (Chrome, Safari, Edge, Firefox).

### Opción 2: Iniciar servidor local ligero con Python
En tu terminal:
```bash
cd /Users/alexisliracruz/.gemini/antigravity/scratch/takirin-contratos
python3 -m http.server 8000
```
Luego abre en tu navegador: [http://localhost:8000](http://localhost:8000)

---

## 🌐 Cómo Publicar en GitHub Pages para Acceder desde Cualquier Celular

Para tener tu aplicación en internet sin costo y poder usarla en cualquier dispositivo:

1. **Crear Repositorio en GitHub**:
   - Entra a [github.com](https://github.com) y crea un nuevo repositorio llamado `takirin-contratos`.

2. **Subir los Archivos desde tu Terminal**:
   ```bash
   cd /Users/alexisliracruz/.gemini/antigravity/scratch/takirin-contratos
   git init
   git add .
   git commit -m "Initial commit: App de contratos Takirin La Chimenea"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/takirin-contratos.git
   git push -u origin main
   ```

3. **Activar GitHub Pages**:
   - En tu repositorio de GitHub, ve a **Settings** → **Pages**.
   - En **Branch**, selecciona `main` y la carpeta `/ (root)`.
   - Haz clic en **Save**.
   - En unos segundos, GitHub te dará un enlace (ejemplo: `https://TU_USUARIO.github.io/takirin-contratos/`) que podrás abrir en cualquier celular o computadora.

---

## 📁 Estructura del Proyecto

```
takirin-contratos/
├── index.html                 # Interfaz principal (Dashboard, Editor, Calendario, Sincronización)
├── css/
│   └── styles.css             # Estilos y motor de impresión FOP-01 (Hoja Carta)
├── js/
│   ├── app.js                 # Controlador principal y navegación
│   ├── contract-model.js      # Lógica de negocio, cálculos de anticipos y fechas
│   ├── storage.js             # Persistencia local y exportación/importación JSON
│   ├── calendar.js            # Motor del calendario interactivo
│   └── pdf-generator.js       # Generador de PDF e impresión
├── assets/
│   ├── logo.png               # Logotipo oficial Takirin La Chimenea
│   ├── social_footer.png      # Imagen oficial de redes sociales
│   └── reference_contract.jpg # Plantilla física de referencia
├── data/
│   └── default-contracts.json # Contratos de prueba iniciales
└── README.md                  # Manual de uso y despliegue
```
