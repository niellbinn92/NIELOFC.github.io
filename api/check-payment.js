export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Preflight
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
    const {
      transaction_id,
      order_id,
      product,
      duration,
      amount,
      key
    } = req.body || {};

    if (!transaction_id) {
      return res.status(400).json({
        success: false,
        message: "transaction_id wajib diisi"
      });
    }

    // Cek status pembayaran ke AutoGoPay
    const response = await fetch(
      "https://v1-gateway.autogopay.site/qris/status",
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${process.env.AUTOGOPAY_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transaction_id
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      return res.status(400).json({
        success: false,
        message:
          data.message ||
          "Gagal mengecek pembayaran"
      });
    }

    const payment = data.data || {};

    const status = String(
      payment.transaction_status ||
      payment.status ||
      payment.payment_status ||
      ""
    )
      .toLowerCase()
      .trim();

    const isPaid =
      status === "settlement" ||
      status === "paid" ||
      status === "success" ||
      status === "completed" ||
      status === "lunas";

    // Belum dibayar
    if (!isPaid) {
      return res.status(200).json({
        success: true,
        paid: false,
        data: payment
      });
    }

    // Sudah dibayar tetapi data order tidak lengkap
    if (
      !order_id ||
      !product ||
      !duration ||
      !amount ||
      !key
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Pembayaran berhasil, tetapi data order belum lengkap",
        data: payment
      });
    }

    // URL Google Apps Script
    const googleScriptUrl =
      process.env.GOOGLE_SCRIPT_URL;

    if (!googleScriptUrl) {
      return res.status(500).json({
        success: false,
        message:
          "GOOGLE_SCRIPT_URL belum tersedia"
      });
    }

    // Simpan order ke Google Sheet
    const saveResponse = await fetch(
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
          status: "PAID",
          key
        })
      }
    );

    const saveText = await saveResponse.text();

    let saveData;

    try {
      saveData = JSON.parse(saveText);
    } catch {
      saveData = {
        success: false,
        message:
          saveText ||
          "Respons Google Script tidak valid"
      };
    }

    if (!saveResponse.ok || !saveData.success) {
      console.error(
        "SAVE ORDER FAILED:",
        saveData
      );

      return res.status(500).json({
        success: false,
        message:
          "Pembayaran berhasil, tetapi order gagal disimpan",
        data: payment
      });
    }

    // Berhasil bayar + berhasil simpan
    return res.status(200).json({
      success: true,
      paid: true,
      saved: true,
      data: payment,
      order: {
        order_id,
        product,
        duration,
        amount: Number(amount),
        transaction_id,
        status: "PAID",
        key
      }
    });

  } catch (error) {
    console.error(
      "CHECK PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}
