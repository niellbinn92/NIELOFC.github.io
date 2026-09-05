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

    // Cek pembayaran ke AutoGoPay
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
          data?.message ||
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

    const paidStatuses = [
      "settlement",
      "paid",
      "success",
      "completed",
      "lunas"
    ];

    const isPaid =
      paidStatuses.includes(status);

    // Belum bayar
    if (!isPaid) {
      return res.status(200).json({
        success: true,
        paid: false,
        data: payment
      });
    }

    // =========================
    // SUDAH BAYAR
    // =========================

    let saved = false;
    let saveMessage = "";

    // Coba simpan ke Google Sheet
    try {
      const googleScriptUrl =
        process.env.GOOGLE_SCRIPT_URL;

      if (googleScriptUrl) {
        const saveResponse =
          await fetch(
            googleScriptUrl,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json"
              },
              body: JSON.stringify({
                order_id: order_id || "",
                product: product || "",
                duration: duration || "",
                amount: Number(amount) || 0,
                transaction_id,
                status: "PAID",
                key: key || ""
              })
            }
          );

        const saveText =
          await saveResponse.text();

        let saveData = {};

        try {
          saveData =
            JSON.parse(saveText);
        } catch {
          saveData = {
            success: false,
            message: saveText
          };
        }

        saved =
          saveResponse.ok &&
          saveData.success === true;

        if (!saved) {
          saveMessage =
            saveData.message ||
            "Gagal menyimpan order";
        }
      } else {
        saveMessage =
          "GOOGLE_SCRIPT_URL belum tersedia";
      }

    } catch (saveError) {
      console.error(
        "GOOGLE SHEET ERROR:",
        saveError
      );

      saveMessage =
        "Gagal menyimpan ke Google Sheet";
    }

    // PENTING:
    // Pembayaran tetap dianggap sukses
    // dan key tetap dikembalikan.
    return res.status(200).json({
      success: true,
      paid: true,
      saved: saved,
      save_message: saveMessage,

      data: payment,

      order: {
        order_id: order_id || null,
        product: product || null,
        duration: duration || null,
        amount: Number(amount) || 0,
        transaction_id,
        status: "PAID",
        key: key || null
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
