export default async function handler(req, res) {
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
          "Authorization": `Bearer ${process.env.AUTOGOPAY_API_KEY}`,
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
        message: data.message || "Gagal mengecek pembayaran"
      });
    }

    const paymentData = data.data || {};

    const paymentStatus = String(
      paymentData.status ||
      paymentData.payment_status ||
      paymentData.transaction_status ||
      ""
    ).toLowerCase();

    const paidStatuses = [
      "paid",
      "success",
      "settlement",
      "completed",
      "lunas"
    ];

    const isPaid = paidStatuses.includes(paymentStatus);

    if (isPaid) {
      if (!order_id || !product || !duration || !amount || !key) {
        return res.status(400).json({
          success: false,
          message: "Pembayaran berhasil, tetapi data order belum lengkap",
          payment: paymentData
        });
      }

      const saveResponse = await fetch(
        `${getBaseUrl(req)}/api/save-order`,
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
          message: saveText || "Respons save-order tidak valid"
        };
      }

      if (!saveResponse.ok || !saveData.success) {
        console.error("SAVE ORDER FAILED:", saveData);

        return res.status(500).json({
          success: false,
          message: "Pembayaran berhasil, tetapi order gagal disimpan",
          payment: paymentData
        });
      }

      return res.status(200).json({
        success: true,
        paid: true,
        data: paymentData,
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
    }

    return res.status(200).json({
      success: true,
      paid: false,
      data: paymentData
    });

  } catch (error) {
    console.error("CHECK PAYMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}

function getBaseUrl(req) {
  const protocol =
    req.headers["x-forwarded-proto"] ||
    (req.headers.host && req.headers.host.includes("localhost")
      ? "http"
      : "https");

  const host = req.headers.host;

  return `${protocol}://${host}`;
}
