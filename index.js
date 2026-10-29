require('dotenv').config()
const express = require('express')
const cors = require('cors')

const { Especialidad } = require('./models')
const profesionales = require('./crud/profesionales')
const citas = require('./crud/citas')

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// Los errores de negocio del CRUD traen "codigo" (ej: HORARIO_NO_DISPONIBLE)
function manejarError(res, error) {
  if (error.codigo) {
    const estado = error.codigo === 'HORARIO_NO_DISPONIBLE' ? 409 : 400
    return res.status(estado).json({ error: error.message, codigo: error.codigo })
  }
  console.error(error)
  res.status(500).json({ error: 'Error interno del servidor' })
}

// Prueba rápida: ¿el servidor responde?
app.get('/api/salud', (req, res) => res.json({ ok: true }))

// Pantalla 1: especialidades
app.get('/api/especialidades', async (req, res) => {
  try {
    const lista = await Especialidad.findAll({
      where: { activo: true },
      order: [['id', 'ASC']],
    })
    res.json(lista)
  } catch (e) {
    manejarError(res, e)
  }
})

// Pantalla 2: profesionales (opcional ?especialidadId=1)
app.get('/api/profesionales', async (req, res) => {
  try {
    const { especialidadId } = req.query
    res.json(await profesionales.listar({ especialidadId }))
  } catch (e) {
    manejarError(res, e)
  }
})

// Pantalla 2: horas del día de un profesional
app.get('/api/horarios', async (req, res) => {
  try {
    const { profesionalId, fecha } = req.query
    if (!profesionalId || !fecha) {
      return res.status(400).json({ error: 'Faltan profesionalId o fecha' })
    }
    res.json(await citas.horasDelDia(profesionalId, fecha))
  } catch (e) {
    manejarError(res, e)
  }
})

// Pantalla 5: confirmar cita
app.post('/api/citas', async (req, res) => {
  try {
    const cita = await citas.crear(req.body)
    res.status(201).json(cita)
  } catch (e) {
    manejarError(res, e)
  }
})

// "Mi cita": consultar por localizador y correo
app.get('/api/citas/:localizador', async (req, res) => {
  try {
    const cita = await citas.obtenerPorLocalizador(
      req.params.localizador,
      req.query.correo
    )
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada' })
    res.json(cita)
  } catch (e) {
    manejarError(res, e)
  }
})

// Cambiar fecha u hora
app.patch('/api/citas/:localizador/reprogramar', async (req, res) => {
  try {
    const { correo, fecha, hora } = req.body
    res.json(
      await citas.reprogramar(req.params.localizador, correo, { fecha, hora })
    )
  } catch (e) {
    manejarError(res, e)
  }
})

// Cancelar cita
app.patch('/api/citas/:localizador/cancelar', async (req, res) => {
  try {
    res.json(await citas.cancelar(req.params.localizador, req.body.correo))
  } catch (e) {
    manejarError(res, e)
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`))