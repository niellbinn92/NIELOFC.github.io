export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const {
      order_id,
      product,
      duration,
      amount,
      transaction_id,
      status,
      key
    } = req.body || {};

    if (
      !order_id ||
      !product ||
      !duration ||
      !amount ||
      !transaction_id ||
      !status ||
      !key
    ) {
      return res.status(400).json({
        success: false,
        message: "Data order belum lengkap"
      });
    }

    const googleScriptUrl =
      process.env.GOOGLE_SCRIPT_URL;

    if (!googleScriptUrl) {
      return res.status(500).json({
        success: false,
        message: "GOOGLE_SCRIPT_URL belum tersedia"
      });
    }

    const response = await fetch(
      googleScriptUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          order_id,
          product,
          duration,
          amount: Number(amount),
          transaction_id,
          status,
          key
        })
      }
    );

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = {
        success: false,
        message: text || "Respons Google Script tidak valid"
      };
    }

    if (!response.ok || !data.success) {
      return res.status(500).json({
        success: false,
        message:
          data.message ||
          "Gagal menyimpan order"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order berhasil disimpan"
    });

  } catch (error) {
    console.error("SAVE ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}
