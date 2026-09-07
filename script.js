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

let globalStock = {};

// Load produk otomatis saat halaman dibuka
document.addEventListener("DOMContentLoaded", () => {
  loadProductsAndStock();
});

// ==========================================
// FUNGSI MEMUAT KATALOG PRODUK & STOK
// ==========================================
async function loadProductsAndStock() {
  try {
    // 1. Ambil Data Stok dari Apps Script
    try {
      const stockRes = await fetch(`${APPS_SCRIPT_URL}?action=getstock`);
      const stockData = await stockRes.json();
      if (stockData.success && stockData.stock) {
        globalStock = stockData.stock;
      }
    } catch (e) {
      console.warn("Gagal mengambil data stok real-time:", e);
    }

    // 2. Ambil Katalog Produk dari Google Sheet CSV
    const csvRes = await fetch(SHEET_CSV);
    const csvText = await csvRes.text();
    parseAndRenderProducts(csvText);
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

function parseAndRenderProducts(csvText) {
  const lines = csvText.split("\n").map(l => l.trim()).filter(l => l);
  if (lines.length <= 1) return;

  const productsMap = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map(c => c.replace(/^"|"$/g, '').trim());
    if (cols.length < 3) continue;

    const name = cols[0];
    const duration = cols[1];
    const price = cols[2];
    const image = PRODUCT_IMAGES[name] || "https://via.placeholder.com/300";

    if (!productsMap[name]) {
      productsMap[name] = {
        name: name,
        image: image,
        variants: []
      };
    }

    productsMap[name].variants.push({
      duration: duration,
      price: price
    });
  }

  renderCatalog(Object.values(productsMap));
}

function renderCatalog(products) {
  const grid = document.getElementById("productGrid") || document.getElementById("productList") || document.querySelector(".product-grid") || document.getElementById("productsContainer");
  if (!grid) return;

  grid.innerHTML = "";

  products.forEach(prod => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.style = "background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; margin: 10px; text-align: center; color: #fff;";

    let variantOptions = prod.variants.map(v => `<option value="${v.duration}">${v.duration} - Rp ${Number(v.price).toLocaleString("id-ID")}</option>`).join("");

    card.innerHTML = `
      <img src="${prod.image}" alt="${prod.name}" style="width: 100%; max-height: 180px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
      <h3 style="margin-bottom: 10px; font-size: 1.2rem;">${prod.name}</h3>
      <select class="variant-select" style="width: 100%; padding: 8px; margin-bottom: 10px; border-radius: 6px; background: #222; color: #fff; border: 1px solid #444;">
        ${variantOptions}
      </select>
      <button onclick="buyProduct('${prod.name}')" class="btn-buy-now" style="width: 100%; padding: 10px; background: #a855f7; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
        Beli Sekarang
      </button>
    `;

    grid.appendChild(card);
  });
}

function buyProduct(productName) {
  alert(`Memilih produk: ${productName}`);
}

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

  if (resultContainer) {
    resultContainer.innerHTML = `<p style="color: #a855f7; text-align: center; margin-top: 10px;">Mengecek pesanan...</p>`;
  }

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=checkorder&query=${encodeURIComponent(query)}`);
    const result = await response.json();

    if (result.success && result.data) {
      const order = result.data;
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

async function checkOrder() {
  return checkOrderStatus();
}
