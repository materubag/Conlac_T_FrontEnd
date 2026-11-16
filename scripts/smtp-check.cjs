/* eslint-disable @typescript-eslint/no-require-imports -- Node diagnostic run inside the production image. */
const nodemailer = require('nodemailer');
const env = process.env;
const port = Number(env.SMTP_PORT || 587);
console.log({
  host: env.SMTP_HOST,
  port,
  usuarioConfigurado: Boolean(env.SMTP_USERNAME),
  claveConfigurada: Boolean(env.SMTP_PASSWORD),
  remitenteConfigurado: Boolean(env.SMTP_FROM),
});
if (!env.SMTP_HOST || !env.SMTP_USERNAME || !env.SMTP_PASSWORD || !Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('SMTP: configuracion incompleta o puerto invalido');
  process.exitCode = 1;
} else {
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST, port, secure: port === 465,
    auth: { user: env.SMTP_USERNAME, pass: env.SMTP_PASSWORD },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
  });
  transport.verify()
    .then(() => console.log('SMTP: conexion y autenticacion correctas; no se envio ningun correo'))
    .catch(error => {
      console.error('SMTP: fallo', {
        codigo: typeof error.code === 'string' && /^[A-Z_]+$/.test(error.code) ? error.code : 'UNKNOWN',
        respuestaSMTP: Number.isInteger(error.responseCode) ? error.responseCode : undefined,
      });
      process.exitCode = 1;
    })
    .finally(() => transport.close());
}
