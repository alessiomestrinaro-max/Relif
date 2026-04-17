const AIRTABLE_API_URL = "https://api.airtable.com/v0";

const requiredEnvVars = [
  "AIRTABLE_PAT",
  "AIRTABLE_BASE_ID",
  "AIRTABLE_TABLE_NAME",
];

const buildResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return buildResponse(405, { error: "Method not allowed." });
  }

  const missingEnvVar = requiredEnvVars.find((name) => !process.env[name]);

  if (missingEnvVar) {
    return buildResponse(500, {
      error: `Missing environment variable: ${missingEnvVar}`,
    });
  }

  let payload;

  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return buildResponse(400, { error: "Invalid JSON payload." });
  }

  const {
    lenderName,
    borrowerName,
    amount,
    dueDate,
    email,
    note = "",
  } = payload;

  if (!lenderName || !borrowerName || !amount || !dueDate || !email) {
    return buildResponse(400, {
      error: "Missing required fields.",
    });
  }

  const airtableRecord = {
    fields: {
      "Prenom preteur": lenderName,
      "Prenom emprunteur": borrowerName,
      "Montant prete": Number(amount),
      "Date prevue remboursement": dueDate,
      Email: email,
      Note: note,
      Source: "Landing page Relif",
      "Date soumission": new Date().toISOString(),
    },
  };

  try {
    const response = await fetch(
      `${AIRTABLE_API_URL}/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_TABLE_NAME)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_PAT}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [airtableRecord],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return buildResponse(502, {
        error: "Airtable request failed.",
        details: errorText,
      });
    }

    return buildResponse(200, {
      ok: true,
      message: "Loan request stored successfully.",
    });
  } catch (error) {
    return buildResponse(500, {
      error: "Unexpected server error.",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
