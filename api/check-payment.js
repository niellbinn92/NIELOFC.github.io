export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
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

    return res.status(200).json({
      success: true,
      paid: isPaid,
      data: payment,
      order: isPaid
        ? {
            order_id: order_id || null,
            product: product || null,
            duration: duration || null,
            amount: amount || null,
            transaction_id,
            status: "PAID",
            key: key || null
          }
        : null
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
