export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const { transaction_id } = req.body || {};

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

    return res.status(200).json({
      success: true,
      data: data.data
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}
