// ==========================================
// KONFIGURASI UTAMA
// ==========================================
const API_BASE = "https://nielofc-github-io.vercel.app";
const SHEET_CSV = "https://docs.google.com/spreadsheets/d/1dTfloE3c-TbWMqTk6U42pnbil4hsTzpnvjNVEdA0oyA/export?format=csv";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyic58FgbGb-IER0FWLVGXvZegVZ67TLaRbWoL9I4aPHTUMVrcS6W91Bbj4gR4rrx_6/exec";

const PRODUCT_IMAGES = {
  "DRIP APKMOD": "https://i.ibb.co.com/zWBMST9S/9659b485-a457-42af-a695-5ea681df4c6c.jpg",
  "DRIP PROXY": "https://i.ibb.co.com/zWBMST9S/9659b485-a457-42af-a695-5ea681df4c6c.jpg",
  "HG APKMOD": "https://i.ibb.co.com/s9QWt5KK/IMG-8975.png",
  "HG PROXY": "https://i.ibb.co.com/s9QWt5KK/IMG-8975.png",
  "MIGUL LITE": "https://i.ibb.co.com/wNhJG1H5/IMG-8976.png",
  "MIGUL PRO": "https://i.ibb.co.com/wNhJG1H5/IMG-8976.png"
};

// ==========================================
// FUNGSI CEK STATUS PESANAN
// ==========================================
async function checkOrderStatus() {
  const queryInput = document.getElementById("searchQuery") || document.getElementById("orderQuery") || document.querySelector("input");
  const resultContainer = document.getElementById("orderResult") || document.getElementById("searchResult");

  const query = queryInput ? queryInput.value.trim() : "";

  if (!query) {
    if (resultContainer) {
      resultContainer.innerHTML = `<p style="color: #ef4444; text-align: center; margin-top: 10px;">Masukkan No. WhatsApp atau Order ID!</p>`;
    }
    return;
  }

  // Tampilkan status loading
  if (resultContainer) {
    resultContainer.innerHTML = `<p style="color: #a855f7; text-align: center; margin-top: 10px;">Mengecek pesanan...</p>`;
  }

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=checkorder&query=${encodeURIComponent(query)}`);
    const result = await response.json();

    if (result.success && result.data) {
      const order = result.data;
      
      // Tampilkan hasil pencarian di HTML
      if (resultContainer) {
        resultContainer.innerHTML = `
          <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; text-align: left; color: #fff; border: 1px solid rgba(255,255,255,0.1); margin-top: 15px;">
            <p style="margin-bottom: 6px;"><strong>Order ID:</strong> ${order.orderId}</p>
            <p style="margin-bottom: 6px;"><strong>Produk:</strong> ${order.product} (${order.duration})</p>
            <p style="margin-bottom: 8px;"><strong>Status:</strong> <span style="color: #22c55e; font-weight: bold;">${order.status}</span></p>
            <p style="margin-bottom: 4px;"><strong>Key Lisensi:</strong></p>
            <div style="background: #111; padding: 10px; border-radius: 6px; color: #00ff88; font-family: monospace; font-size: 1.1em; word-break: break-all; text-align: center; border: 1px dashed #00ff88;">
              ${order.key}
            </div>
          </div>
        `;
      }
    } else {
      if (resultContainer) {
        resultContainer.innerHTML = `<p style="color: #ef4444; text-align: center; margin-top: 10px;">${result.message || "Pesanan tidak ditemukan."}</p>`;
      }
    }
  } catch (error) {
    console.error("Error fetching order:", error);
    if (resultContainer) {
      resultContainer.innerHTML = `<p style="color: #ef4444; text-align: center; margin-top: 10px;">Gagal mengecek pesanan ke server.</p>`;
    }
  }
}

// Cadangan jika button di HTML memanggil checkOrder()
async function checkOrder() {
  return checkOrderStatus();
}
