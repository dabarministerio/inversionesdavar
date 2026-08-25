VITALIS TOWER - LANDING DAVAR
=============================

Proyecto listo para publicar en:
https://inversionesdavar.com/vitalis-tower-project/

Estructura:
- index.html: landing principal.
- assets/: CSS, JavaScript, iconos y renders responsive WebP.
- api/lead.php: captura de leads compatible con PHP 7+, sin Composer.
- storage/: respaldo CSV de leads si el servidor permite escritura.

IMPORTANTE PARA CAPTURA DE LEADS
1. El formulario abre WhatsApp inmediatamente para no perder la conversión.
2. En paralelo intenta registrar el lead en api/lead.php.
3. api/lead.php intenta:
   - guardar storage/leads.csv;
   - enviar una notificación a realestate.davar@gmail.com mediante mail().
4. Para guardar CSV, la carpeta storage debe tener permiso de escritura para PHP.
5. El envío por mail() depende de que el hosting tenga correo saliente configurado. Si no lo tiene, el lead igualmente continúa por WhatsApp y puede guardarse en CSV.

CONTACTO ACTUAL CONFIGURADO
WhatsApp / teléfono: +1 (305) 930-4423
Email: realestate.davar@gmail.com

VIDEO
YouTube ID: qr8pB24sDF8
El iframe NO carga hasta que el usuario pulsa "Ver presentación".

ANALÍTICA
Se conserva GA4: G-TYR5W4T4VP
Se incluyen eventos de CTA, video, galería y generate_lead.
Se capturan UTM, GCLID y FBCLID en el formulario para atribución.

PERFORMANCE
- Hero con preload y versión vertical móvil.
- Renders en 640/960/1440/1920 px.
- Lazy loading debajo del primer viewport.
- Galería dinámica: carga solo el render activo y precarga el siguiente en idle.
- YouTube bajo interacción.
- Sin frameworks, sin jQuery, sin fuentes externas, sin Composer.

NOTA COMERCIAL
La landing no publica dirección exacta, dimensiones, metrajes totales, tipo de propiedad, precios ni cronograma de inversión. El objetivo es presentar visualmente el proyecto y provocar el contacto comercial.
