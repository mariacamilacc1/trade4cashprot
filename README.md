# Trade4Cash

Prototipo navegable de una plataforma para intercambiar divisas entre personas en Bogotá, de forma segura y sin intermediarios.

> Prototipo académico de demostración. Trade4Cash no recibe, custodia ni transfiere dinero.

**Ver el prototipo:** https://mariacamilacc1.github.io/trade4cashprot/

---

## ¿Qué es Trade4Cash?

Una plataforma que conecta a personas que quieren comprar o vender divisas (dólares, euros, libras y más) con otras personas cercanas. Está pensada sobre todo para **viajeros y estudiantes**. Las ofertas se comparan contra la tasa oficial de referencia y el intercambio se cierra en un punto público y vigilado, o con pago digital.

## Mascota y asistente

**Zeta** es el asistente virtual de la plataforma. Responde dudas sobre cómo funciona el intercambio, la seguridad, la TRM y el tratamiento de datos.

## Funciones principales

### Inicio y Trade4Cash Academy
- Tasa de referencia oficial (TRM del dólar) con actualización automática cada 15 minutos y botón para actualizarla.
- Academy con módulos interactivos: qué es una divisa, tasa de referencia por divisa, cómo funciona, intercambio seguro, billetes falsos y señales de alerta.
- Recuadros aparte para el simulador, el tratamiento de datos y los términos y condiciones.

### Comprar
- Ofertas de otras personas con filtros por divisa, zona y distancia.
- Medios de pago y condición de los billetes visibles en cada oferta.
- Chat con la contraparte.

### Mis publicaciones
- Crear, editar la tasa, pausar y seguir el estado de cada oferta.
- Simulador para practicar sin publicar nada.

### Regla del ±5 % frente a la tasa de referencia
- La tasa de cada oferta debe estar dentro de ±5 % de la tasa oficial de referencia.
- La alerta aparece solo cuando se excede el límite, al publicar, editar, aceptar o confirmar un intercambio.

### Chat y cierre del intercambio
- La contraparte responde según lo que se escriba y propone **presencial** o **pago digital**.
- **Presencial:** código de encuentro, verificación mutua de códigos, lista de revisión de billetes y confirmación.
- **Pago digital:** flujo simulado de pago y confirmación.
- Calificación de 1 a 5 estrellas al terminar.
- Comprobante descargable en **PDF**.

### Mi cuenta y Premium
- Perfil con estadísticas, insignias y publicaciones.
- Historial de operaciones y comprobantes.
- Planes Básico, Premium y Premium Plus.

## Cómo ejecutarlo

No necesita instalación. Es una página web de un solo archivo.

1. Descarga `index.html` y `zeta-robot.png` y déjalos en la misma carpeta.
2. Abre `index.html` en tu navegador.

Para verlo en línea, activa **GitHub Pages**: *Settings → Pages → Deploy from a branch → main → / (root)*.

## Estructura del proyecto

| Archivo | Descripción |
|---|---|
| `index.html` | Aplicación completa (HTML, CSS y JavaScript) |
| `trade4cash-zeta-prototype.html` | Copia del prototipo |
| `zeta-robot.png` | Imagen de la mascota Zeta |

## Tecnología

- HTML, CSS y JavaScript (sin frameworks).
- Datos guardados en el navegador (`localStorage`).
- TRM oficial: [datos.gov.co](https://www.datos.gov.co/Econom-a-y-Finanzas/TRM/ceyp-9c7c) (Superintendencia Financiera).
- Tipos de cambio de otras divisas: [open.er-api.com](https://open.er-api.com), derivados de la TRM.

## Limitaciones del prototipo

- No tiene servidor ni base de datos: cada visitante guarda sus datos solo en su navegador.
- La contraparte, los códigos de encuentro y los pagos digitales son simulados.
- La regla del ±5 % se valida en el navegador, por lo que no es a prueba de manipulación.
- Los términos y condiciones son un borrador y requieren revisión legal antes de publicarse.
- Los comprobantes son de demostración y no son recibos bancarios.

## Contacto

trade4cash.atencioncliente@gmail.com

## Aviso

© 2026 Trade4Cash S.A.S. Proyecto académico de demostración. Bogotá D.C., Colombia.
