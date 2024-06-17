import mysql from "mysql2/promise"
import { defineEventHandler, readBody, getQuery } from "h3"
import { fetch } from "ofetch"

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
    return {
      status: 500,
      body: { error: "Connexion à la base de données non disponible" },
    }
  }

  const query = getQuery(event)
  const { type } = query

  if (event.node.req.method === "DELETE") {
    const body = await readBody(event)

    try {
      switch (type) {
        case "admin":
          return await deleteAdmin(body)
        case "compte":
          return await deleteCompte(body)
        case "grimpeur":
          return await deleteGrimpeur(body)
        case "grimpeurSeance":
          return await deleteGrimpeurSeance(body)
        case "seance":
          return await deleteSeance(body)
        default:
          return {
            status: 400,
            body: { error: "Type de suppression non pris en charge" },
          }
      }
    } catch (err) {
      return {
        status: 500,
        body: { error: "Erreur durant la suppression", message: err.message },
      }
    }
  } else {
    return {
      status: 405,
      body: { error: "Méthode non autorisée" },
    }
  }
})

async function deleteAdmin(body) {
  const { idAdmin } = body

  try {
    await connection.beginTransaction()
    const [ rows ] = await connection.execute("DELETE FROM Admin WHERE idAdmin = ?", [ idAdmin ])

    await connection.commit()

    return {
      status: 200,
      body: rows,
    }
  } catch (err) {
    await connection.rollback()

    throw err
  }
}

async function deleteCompte(body) {
  const { idCompte } = body

  try {
    await connection.beginTransaction()
    const [ rows ] = await connection.execute("DELETE FROM Compte WHERE idCompte = ?", [ idCompte ])

    await connection.commit()

    return {
      status: 200,
      body: rows,
    }
  } catch (err) {
    await connection.rollback()

    throw err
  }
}

async function deleteGrimpeur(body) {
  const { idGrimpeur } = body

  try {
    await connection.beginTransaction()
    const result = await fetch("/api/fetch?type=grimpeurSeance", {
      method: "POST",
      body: JSON.stringify({
        idGrimpeur: idGrimpeur
      })
    })

    if (result.status === 200) {
      const response = await fetch("/api/fetch?type=seance")

      if (response.status === 200) {
        const seance = response.body[result.body.idSeance]

        if (seance.nbPlacesRestantes === 0) {
          const grimpeurSeanceResponse = await fetch("/api/fetch?type=grimpeurSeance")

          if (grimpeurSeanceResponse.status === 200) {
            const grimpeurSeances = await grimpeurSeanceResponse.json()

            for (const grimpeurSeance of grimpeurSeances) {
              if (grimpeurSeance.isFileDAttente) {
                const grimpeurResponse = await fetch("/api/fetch?type=grimpeur", {
                  method: "POST",
                  body: JSON.stringify({
                    idGrimpeur: grimpeurSeance.idGrimpeur
                  })
                })

                if (grimpeurResponse.status === 200) {
                  const compteResponse = await fetch("/api/fetch?type=compte", {
                    method: "POST",
                    body: JSON.stringify({
                      idCompte: grimpeurResponse.body.fkCompte
                    })
                  })

                  if (compteResponse.status === 200) {
                    await fetch("/api/notifySeance", {
                      method: "POST",
                      body: JSON.stringify({
                        email: compteResponse.body.mail
                      })
                    })
                  }
                }
              }
            }
          }

          await connection.execute("UPDATE Seance SET nbPlacesRestantes = 1 WHERE idSeance = ?", [ seance.idSeance ])
        }
      }
    }

    const [ rows ] = await connection.execute("DELETE FROM Grimpeur WHERE idGrimpeur = ?", [ idGrimpeur ])

    await connection.commit()

    return {
      status: 200,
      body: rows,
    }
  } catch (err) {
    await connection.rollback()

    throw err
  }
}

async function deleteGrimpeurSeance(body) {
  const { idGrimpeur } = body

  try {
    await connection.beginTransaction()

    const result = await fetch("/api/fetch?type=grimpeurSeance", {
      method: "POST",
      body: JSON.stringify({
        idGrimpeur: idGrimpeur
      })
    })

    if (result.status === 200) {
      const seanceId = result.body.idSeance

      const response = await fetch("/api/fetch?type=seance")

      if (response.status === 200) {
        const seance = response.body[seanceId]

        if (seance.nbPlacesRestantes === 0) {
          const grimpeurSeanceResponse = await fetch("/api/fetch?type=grimpeurSeance")

          if (grimpeurSeanceResponse.status === 200) {
            const grimpeurSeances = await grimpeurSeanceResponse.json()

            for (const grimpeurSeance of grimpeurSeances) {
              if (grimpeurSeance.isFileDAttente) {
                const grimpeurResponse = await fetch("/api/fetch?type=grimpeur", {
                  method: "POST",
                  body: JSON.stringify({
                    idGrimpeur: grimpeurSeance.idGrimpeur
                  })
                })

                if (grimpeurResponse.status === 200) {
                  const compteResponse = await fetch("/api/fetch?type=compte", {
                    method: "POST",
                    body: JSON.stringify({
                      idCompte: grimpeurResponse.body.fkCompte
                    })
                  })

                  if (compteResponse.status === 200) {
                    await fetch("/api/notifySeance", {
                      method: "POST",
                      body: JSON.stringify({
                        email: compteResponse.body.mail
                      })
                    })
                  }
                }
              }
            }
          }

          await connection.execute("UPDATE Seance SET nbPlacesRestantes = 1 WHERE idSeance = ?", [ seance.idSeance ])
        }
      }
    }

    const [ rows ] = await connection.execute(
      "DELETE FROM GrimpeurSeance WHERE idGrimpeur = ?",
      [ idGrimpeur ]
    )

    await connection.commit()

    return {
      status: 200,
      body: rows,
    }
  } catch (err) {
    await connection.rollback()

    throw err
  }
}

async function deleteSeance(body) {
  const { idSeance } = body

  try {
    await connection.beginTransaction()
    await connection.execute("DELETE FROM InscriptionSeance WHERE idSeance = ?", [ idSeance ])
    const [ rows ] = await connection.execute("DELETE FROM Seance WHERE idSeance = ?", [ idSeance ])

    await connection.commit()

    return {
      status: 200,
      body: rows,
    }
  } catch (err) {
    await connection.rollback()

    throw err
  }
}