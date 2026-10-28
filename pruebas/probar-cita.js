const citas = require('../crud/citas');
const { sequelize } = require('../models');

const paciente = {
  nombre: 'Ana', apellidos: 'García López', documento: '12345678',
  fecha_nacimiento: '1984-05-14', telefono: '999111222', correo: 'ana@example.com',
};

(async () => {
  // próximo día de lunes a viernes
  const d = new Date();
  do { d.setDate(d.getDate() + 1); } while ([0, 6].includes(d.getDay()));
  const fecha = d.toISOString().slice(0, 10);
  const base = { especialidad_id: 1, profesional_id: 1, tipo_consulta: 'primera', fecha, hora: '10:00' };

  console.log('Horas:', (await citas.horasDelDia(1, fecha)).map((h) => h.hora + (h.disponible ? '' : '(x)')).join(' '));

  const cita = await citas.crear({ ...base, paciente });
  console.log('Creada:', cita.localizador, cita.fecha, cita.hora_inicio, cita.profesional.nombre_completo);

  try {
    await citas.crear({ ...base, paciente: { ...paciente, documento: '87654321', correo: 'otro@example.com' } });
  } catch (e) {
    console.log('Doble reserva bloqueada:', e.codigo);
  }

  const c2 = await citas.reprogramar(cita.localizador, paciente.correo, { fecha, hora: '10:30' });
  console.log('Reprogramada a:', c2.hora_inicio);

  console.log('Con correo ajeno:', await citas.obtenerPorLocalizador(cita.localizador, 'otro@example.com'));

  const c3 = await citas.cancelar(cita.localizador, paciente.correo);
  console.log('Estado final:', c3.estado);

  await sequelize.close();
})().catch((e) => { console.error(e); process.exit(1); });