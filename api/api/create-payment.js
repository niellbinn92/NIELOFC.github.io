export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Hanya POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const { amount } = req.body || {};
    const numericAmount = Number(amount);

    if (
      !Number.isInteger(numericAmount) ||
      numericAmount < 1 ||
      numericAmount > 10000000
    ) {
      return res.status(400).json({
        success: false,
        message: "Nominal pembayaran tidak valid"
      });
    }

    const response = await fetch(
      "https://v1-gateway.autogopay.site/qris/generate",
      {
        method: "POST",
        headers: {
          "Authorization":
            `Bearer ${process.env.AUTOGOPAY_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: numericAmount
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      return res.status(400).json({
        success: false,
        message:
          data.message ||
          "Gagal membuat pembayaran"
      });
    }

    return res.status(200).json({
      success: true,
      data: data.data
    });

  } catch (error) {
    console.error(
      "CREATE PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}
