# Trade4Cash

Prototipo navegable de una plataforma para intercambiar divisas entre personas en Bogotá, de forma segura y sin intermediarios.

> Prototipo académico de demostración. Trade4Cash no recibe, custodia ni transfiere dinero.

**Ver el prototipo:** https://mariacamilacc1.github.io/trade4cashprot/
(En GitHub Pages Zeta responde solo sobre Trade4Cash. Para que responda cualquier pregunta hay que publicar el servidor; ver «Servidor con Zeta y Gemini».)

---

## ¿Qué es Trade4Cash?

Una plataforma que conecta a personas que quieren comprar o vender divisas (dólares, euros, libras y más) con otras personas cercanas. Está pensada sobre todo para **viajeros y estudiantes**. Las ofertas se comparan contra la tasa oficial de referencia y el intercambio se cierra en un punto público y vigilado, o con pago digital.

## Zeta, el asistente

**Zeta** es el asistente virtual. Con el servidor publicado y una llave de Gemini, responde cualquier pregunta; sin servidor, usa un modo local que solo sabe de Trade4Cash y lo dice con claridad.

## Funciones principales

### Regla del ±15 % frente a la tasa de referencia
- La tasa de cada oferta debe estar dentro de ±15 % de la tasa oficial de referencia de su divisa.
- Si se pasa, la alerta muestra el rango permitido y un botón para usar el límite más cercano.
- Las respuestas de las contrapartes también respetan el rango (el servidor corrige las que se salgan).

### Inicio y Trade4Cash Academy
- TRM oficial del dólar, con actualización automática cada 15 minutos.
- Módulos interactivos: qué es una divisa, tasa de referencia, cómo funciona, intercambio seguro, billetes falsos y señales de alerta.
- Al registrarse se elige el uso principal (estudio, viaje, negocio o compras en el exterior, dinero con la familia o explorar). Es privado, se cambia en Mi cuenta y solo adapta Academy con módulos de ahorro propios (por ejemplo, **Ahorro estudiantil**).

### Comprar
- Filtros por divisa, zona y distancia; cada combinación de divisa y zona tiene ofertas.
- Perfiles con avatar ilustrado e **índice de confianza** (Nuevo, Confiable, Muy confiable).
- Diferencia de cada oferta frente a la referencia oficial.
- **Cantidad parcial:** ambas personas confirman, el resto de la oferta sigue publicada y se respeta un mínimo.
- **Reserva de 15 minutos** mientras se acuerda el intercambio.

### Chat y cierre del intercambio
- La contraparte responde según lo que se escriba y propone **presencial** o **pago digital**.
- **Presencial:** código de encuentro, verificación mutua, lista de revisión de billetes y confirmación.
- **Encuentro seguro:** cita con día y hora, recordatorio simulado, avisos «ya llegué» y «ya terminé», y consejos de seguridad.
- **Pago digital:** flujo simulado; la contraparte confirma «¡Recibido!» y se califica de 1 a 5 estrellas.
- **Reportar:** motivos, detalle opcional, bloqueo y número de seguimiento.
- Comprobante descargable en **PDF**.

### Trade Points
- Se desbloquean con el primer intercambio confirmado. Se ganan por confianza, no por volumen de dinero.
- Los puntos **no son dinero**: no se compran, no se transfieren y no se cambian por dinero.
- Niveles, vencimiento a un año, retención de 48 h y reglas contra abuso.

### Alianzas
- Propuestas de alianza para viajeros, estudiantes, SIM y datos, transferencias internacionales y hostales. **Son propuestas: no hay acuerdos firmados.**

### Mi cuenta y Premium
- Perfil, historial, comprobantes, uso principal e índice de confianza.
- Planes Básico, Premium y Premium Plus.

## Cómo ejecutarlo

**Solo el prototipo (sin servidor):** descarga `index.html` y `zeta-robot.png` en la misma carpeta y abre `index.html` en tu navegador.

**Con el servidor (Zeta con IA):** requiere Node 18 o superior.
```
cp .env.example .env     # pega tu GEMINI_API_KEY dentro de .env
npm start                # abre http://localhost:3000
```

## Servidor con Zeta y Gemini (Render)

La llave de Gemini va **solo** en Render, nunca en el código ni en GitHub.

1. Crea la llave en https://aistudio.google.com → **Get API key** → **Create API key**.
2. En https://render.com inicia sesión con GitHub → **New +** → **Web Service** → elige este repositorio.
3. Runtime **Node**. Build Command: `npm install`. Start Command: `npm start`.
4. En **Environment** agrega `GEMINI_API_KEY` con tu llave.
5. **Create Web Service**. Render te da una dirección `https://….onrender.com` donde Zeta responde cualquier pregunta.

En el plan gratuito el servicio se «duerme» tras un rato sin uso; la primera respuesta puede tardar unos 30 segundos.

El servidor expone `/api/chat` (Zeta y contrapartes), `/api/rate-check` (valida el ±15 %) y `/api/health`. Limita 30 solicitudes por minuto por IP.

## Estructura del proyecto

| Archivo | Descripción |
|---|---|
| `index.html`, `zeta-robot.png` | Prototipo completo (lo que sirve GitHub Pages) |
| `server.js`, `package.json` | Servidor Node sin dependencias externas |
| `public/` | Copia del prototipo que sirve el servidor |
| `.env.example` | Variables de entorno de ejemplo (sin llaves reales) |

Si cambias `index.html`, copia el mismo archivo a `public/index.html`.

## Tecnología

- HTML, CSS y JavaScript sin frameworks; datos en el navegador (`localStorage`).
- Servidor: Node.js y la API de Gemini.
- TRM oficial: [datos.gov.co](https://www.datos.gov.co/Econom-a-y-Finanzas/TRM/ceyp-9c7c) (Superintendencia Financiera).
- Otras divisas: [open.er-api.com](https://open.er-api.com), derivadas de la TRM.

## Limitaciones del prototipo

- No hay base de datos: cada visitante guarda sus datos solo en su navegador.
- Las contrapartes, los códigos, los pagos digitales, los recordatorios y los reportes son simulados; no hay equipo de seguridad real detrás.
- Los lugares de encuentro son sugerencias de sitios públicos; no están verificados con cada establecimiento.
- La regla del ±15 % se valida en el navegador y, con el servidor, también allí; con solo el prototipo no es a prueba de manipulación.
- Los términos y condiciones son un borrador: antes de publicar la plataforma deben revisarlos un abogado, incluida la regla de tasas, el tratamiento de datos y las alianzas.
- Los comprobantes son de demostración y no son recibos bancarios.

## Contacto

trade4cash.atencioncliente@gmail.com

## Aviso

© 2026 Trade4Cash S.A.S. Proyecto académico de demostración. Bogotá D.C., Colombia.
