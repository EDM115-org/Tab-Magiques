import mysql from "mysql2/promise"
import { createError, defineEventHandler, readBody, getQuery } from "h3"

let connection = null

try {
  connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })
} catch (err) {
  console.error("Failed to connect to the database:", err)
  connection = null
}

export default defineEventHandler(async (event) => {
  if (!connection) {
    throw createError({
      status: 500,
      message: "Connexion à la base de données non disponible"
    })
  }

  const body = await readBody(event)
  const query = getQuery(event)
  const { type } = query

  if (event.node.req.method === "POST") {
    try {
      switch (type) {
        case "update":
          return await updateReinscription(body)
        case "open":
          return await openReinscription(body)
        case "clear":
          return await clearReinscription()
        default:
          return {
            status: 400,
            body: { error: "Type de comptage non pris en charge" },
          }
      }
    } catch (err) {
      return {
        status: 500,
        body: { error: "Erreur durant le comptage", message: err.message },
      }
    }
  } else {
    throw createError({
      status: 405,
      message: "Méthode non autorisée"
    })
  }

  async function updateReinscription(body) {
    const { dateReinscriptionIsInscrit, dateReinscriptionEveryone, dateFinReinscription } = body
    const query = "UPDATE Reinscription SET dateReinscriptionIsInscrit = ?, dateReinscriptionEveryone = ?, dateFinReinscription = ?"
    const [ results ] = await connection.execute(query, [ dateReinscriptionIsInscrit, dateReinscriptionEveryone, dateFinReinscription ])

    if (results.affectedRows === 0) {
      return {
        status: 404,
        body: { error: "Aucun enregistrement trouvé" },
      }
    }

    return { status: 200, body: { message: "Enregistrement mis à jour" } }
  }

  async function openReinscription(body) {
    const { inscritionOpen } = body
    const query = "UPDATE Reinscription SET inscritionOpen = ?"
    const [ results ] = await connection.execute(query, [ inscritionOpen ])

    if (results.affectedRows === 0) {
      return {
        status: 404,
        body: { error: "Aucun enregistrement trouvé" },
      }
    }

    return { status: 200, body: { message: "Enregistrement mis à jour" } }
  }

  async function clearReinscription() {
    const query = "DELETE FROM GrimpeurSeance"

    await connection.execute(query)

    return { status: 200, body: { message: "Table vidée" } }
  }
})
