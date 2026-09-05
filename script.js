const API_BASE = "https://nielofc-github-io.vercel.app";

const SHEET_CSV =
  "https://docs.google.com/spreadsheets/d/1dTfloE3c-TbWMqTk6U42pnbil4hsTzpnvjNVEdA0oyA/export?format=csv";

const PRODUCT_IMAGES = {
  "DRIP APK MOD":
    "https://i.ibb.co.com/zWBMST9S/9659b485-a457-42af-a695-5ea681df4c6c.jpg",

  "DRIP PROXY":
    "https://i.ibb.co.com/zWBMST9S/9659b485-a457-42af-a695-5ea681df4c6c.jpg",

  "HG APKMOD":
    "https://i.ibb.co.com/s9QWt5KK/IMG-8975.png",

  "HG PROXY":
    "https://i.ibb.co.com/s9QWt5KK/IMG-8975.png",

  "MIGUL LITE":
    "https://i.ibb.co.com/wNhJG1H5/IMG-8976.png",

  "MIGUL PRO":
    "https://i.ibb.co.com/wNhJG1H5/IMG-8976.png"
};

const LOGO_FALLBACK = {
  "DRIP APK MOD": {
    logo: "DRIP",
    color: "#e879f9"
  },

  "DRIP PROXY": {
    logo: "DRIP",
    color: "#c084fc"
  },

  "HG APKMOD": {
    logo: "HG",
    color: "#ec4899"
  },

  "HG PROXY": {
    logo: "HG",
    color: "#f472b6"
  },

  "MIGUL LITE": {
    logo: "MIGUL",
    color: "#a855f7"
  },

  "MIGUL PRO": {
    logo: "MIGUL",
    color: "#c084fc"
  }
};

let products = [];
let currentProduct = null;
let selectedVoucher = null;
let currentFilter = "all";

let currentTransactionId = null;
let paymentCheckTimer = null;
let orderProcessing = false;


/* ========================================
   START
======================================== */

document.addEventListener("DOMContentLoaded", function () {
  loadProducts();
});


/* ========================================
   LOAD PRODUCTS
======================================== */

async function loadProducts() {
  try {
    const url = SHEET_CSV + "&t=" + Date.now();

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        "Google Sheet HTTP " + response.status
      );
    }

    const text = await response.text();

    if (!text || !text.trim()) {
      throw new Error("Google Sheet kosong");
    }

    const rows = parseCSV(text);

    const loaded = convertRowsToProducts(rows);

    if (!loaded.length) {
      throw new Error("Produk tidak ditemukan");
    }

    products = loaded;

  } catch (error) {
    console.error("Load product error:", error);

    products = createFallbackProducts();
  }

  renderProducts();
}


/* ========================================
   CSV PARSER
======================================== */

function parseCSV(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      i++;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      row.push(value.trim());
      value = "";
      continue;
    }

    if (
      (char === "\n" || char === "\r") &&
      !quoted
    ) {
      if (char === "\r" && next === "\n") {
        i++;
      }

      row.push(value.trim());

      if (
        row.some(function (cell) {
          return cell !== "";
        })
      ) {
        rows.push(row);
      }

      row = [];
      value = "";

      continue;
    }

    value += char;
  }

  if (value !== "" || row.length > 0) {
    row.push(value.trim());
  }

  if (row.length > 0) {
    rows.push(row);
  }

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map(function (header) {
    return String(header)
      .replace(/^\uFEFF/, "")
      .trim()
      .toLowerCase();
  });

  return rows.slice(1).map(function (cells) {
    const obj = {};

    headers.forEach(function (header, index) {
      obj[header] =
        cells[index] !== undefined
          ? String(cells[index]).trim()
          : "";
    });

    return obj;
  });
}


/* ========================================
   NORMALIZE NAME
======================================== */

function normalizeProductName(name) {
  return String(name || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}


/* ========================================
   CONVERT SHEET DATA
======================================== */

function convertRowsToProducts(rows) {
  const result = [];

  rows.forEach(function (row, index) {
    const name = normalizeProductName(
      row.name ||
      row.product ||
      row.nama ||
      ""
    );

    if (!name) {
      return;
    }

    const platform = String(
      row.platform ||
      row.device ||
      row.os ||
      "android"
    )
      .trim()
      .toLowerCase();

    const fallback =
      LOGO_FALLBACK[name] || {
        logo: name.substring(0, 4),
        color: "#a855f7"
      };

    const rating =
      parseFloat(row.rating) || 0;

    const sold = String(
      row.sold ||
      row.terjual ||
      ""
    ).trim();

    const description = String(
      row.desc ||
      row.description ||
      row.deskripsi ||
      ""
    ).trim();

    const desc = description
      ? description
          .split("|")
          .map(function (item) {
            return {
              icon: "✓",
              text: item.trim()
            };
          })
          .filter(function (item) {
            return item.text !== "";
          })
      : [
          {
            icon: "✓",
            text: "Produk NIELSTORE"
          }
        ];

    const fixedColumns = [
      "name",
      "product",
      "nama",
      "platform",
      "device",
      "os",
      "logo",
      "rating",
      "sold",
      "terjual",
      "desc",
      "description",
      "deskripsi"
    ];

    const vouchers = [];

    Object.keys(row).forEach(function (key) {
      const cleanKey = key.toLowerCase();

      if (
        fixedColumns.indexOf(cleanKey) !== -1
      ) {
        return;
      }

      const raw = String(
        row[key] || ""
      ).trim();

      if (!raw) {
        return;
      }

      const numeric = raw.replace(
        /[^\d]/g,
        ""
      );

      if (!numeric) {
        return;
      }

      const price = parseInt(
        numeric,
        10
      );

      if (
        Number.isFinite(price) &&
        price > 0
      ) {
        vouchers.push({
          duration: key.trim(),
          price: price,
          stock: true
        });
      }
    });

    vouchers.sort(function (a, b) {
      return (
        durationNumber(a.duration) -
        durationNumber(b.duration)
      );
    });

    let priceFrom = 0;

    if (vouchers.length > 0) {
      priceFrom = Math.min.apply(
        null,
        vouchers.map(function (item) {
          return item.price;
        })
      );
    }

    result.push({
      id: index + 1,
      name: String(
        row.name ||
        row.product ||
        row.nama ||
        name
      ).trim(),

      platform: platform,

      logo:
        row.logo ||
        fallback.logo,

      logoColor:
        fallback.color,

      image:
        PRODUCT_IMAGES[name] || "",

      rating: rating,

      sold: sold,

      priceFrom: priceFrom,

      desc: desc,

      vouchers: vouchers
    });
  });

  return result;
}


/* ========================================
   DURATION SORT
======================================== */

function durationNumber(value) {
  const match =
    String(value).match(/\d+/);

  if (!match) {
    return 999999;
  }

  return parseInt(
    match[0],
    10
  );
}


/* ========================================
   FALLBACK PRODUCTS
======================================== */

function createFallbackProducts() {
  return [
    {
      id: 1,
      name: "DRIP APK MOD",
      platform: "android",
      logo: "DRIP",
      logoColor: "#e879f9",
      image:
        PRODUCT_IMAGES["DRIP APK MOD"],
      rating: 0,
      sold: "",
      priceFrom: 38000,

      desc: [
        {
          icon: "✓",
          text: "Produk DRIP APK MOD"
        }
      ],

      vouchers: [
        {
          duration: "1 Day",
          price: 38000,
          stock: true
        }
      ]
    },

    {
      id: 2,
      name: "DRIP PROXY",
      platform: "android",
      logo: "DRIP",
      logoColor: "#c084fc",
      image:
        PRODUCT_IMAGES["DRIP PROXY"],
      rating: 0,
      sold: "",
      priceFrom: 38000,

      desc: [
        {
          icon: "✓",
          text: "Produk DRIP PROXY"
        }
      ],

      vouchers: [
        {
          duration: "1 Day",
          price: 38000,
          stock: true
        }
      ]
    },

    {
      id: 3,
      name: "HG APKMOD",
      platform: "android",
      logo: "HG",
      logoColor: "#ec4899",
      image:
        PRODUCT_IMAGES["HG APKMOD"],
      rating: 0,
      sold: "",
      priceFrom: 38000,

      desc: [
        {
          icon: "✓",
          text: "Produk HG APKMOD"
        }
      ],

      vouchers: [
        {
          duration: "1 Day",
          price: 38000,
          stock: true
        }
      ]
    },

    {
      id: 4,
      name: "HG PROXY",
      platform: "android",
      logo: "HG",
      logoColor: "#f472b6",
      image:
        PRODUCT_IMAGES["HG PROXY"],
      rating: 0,
      sold: "",
      priceFrom: 38000,

      desc: [
        {
          icon: "✓",
          text: "Produk HG PROXY"
        }
      ],

      vouchers: [
        {
          duration: "1 Day",
          price: 38000,
          stock: true
        }
      ]
    },

    {
      id: 5,
      name: "MIGUL LITE",
      platform: "android",
      logo: "MIGUL",
      logoColor: "#a855f7",
      image:
        PRODUCT_IMAGES["MIGUL LITE"],
      rating: 0,
      sold: "",
      priceFrom: 38000,

      desc: [
        {
          icon: "✓",
          text: "Produk MIGUL LITE"
        }
      ],

      vouchers: [
        {
          duration: "1 Day",
          price: 38000,
          stock: true
        }
      ]
    },

    {
      id: 6,
      name: "MIGUL PRO",
      platform: "android",
      logo: "MIGUL",
      logoColor: "#c084fc",
      image:
        PRODUCT_IMAGES["MIGUL PRO"],
      rating: 0,
      sold: "",
      priceFrom: 38000,

      desc: [
        {
          icon: "✓",
          text: "Produk MIGUL PRO"
        }
      ],

      vouchers: [
        {
          duration: "1 Day",
          price: 38000,
          stock: true
        }
      ]
    }
  ];
}


/* ========================================
   RUPIAH
======================================== */

function formatRupiah(number) {
  return (
    "Rp " +
    Number(number).toLocaleString("id-ID")
  );
}


/* ========================================
   ESCAPE HTML
======================================== */

function escapeHtml(value) {
  return String(
    value === null ||
    value === undefined
      ? ""
      : value
  )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* ========================================
   RENDER PRODUCTS
======================================== */

function renderProducts() {
  const grid =
    document.getElementById(
      "productGrid"
    );

  if (!grid) {
    return;
  }

  const filtered =
    currentFilter === "all"
      ? products
      : products.filter(function (product) {
          return (
            product.platform ===
            currentFilter
          );
        });

  if (!filtered.length) {
    grid.innerHTML =
      "<p style=\"" +
      "grid-column:1/-1;" +
      "text-align:center;" +
      "padding:3rem;" +
      "color:var(--text-muted);" +
      "\">" +
      "Tidak ada produk." +
      "</p>";

    return;
  }

  grid.innerHTML =
    filtered.map(function (product) {

      const imageHTML =
        product.image
          ? (
              "<img " +
              "src=\"" +
              escapeHtml(product.image) +
              "\" " +
              "alt=\"" +
              escapeHtml(product.name) +
              "\" " +
              "class=\"card-img\" " +
              "loading=\"lazy\">"
            )
          : (
              "<div class=\"logo-text\" " +
              "style=\"color:" +
              product.logoColor +
              ";\">" +
              escapeHtml(product.logo) +
              "</div>"
            );

      const soldHTML =
        product.sold
          ? " · " +
            escapeHtml(product.sold) +
            " Terjual"
          : "";

      const priceHTML =
        product.priceFrom
          ? "Mulai dari <strong>" +
            formatRupiah(product.priceFrom) +
            "</strong>"
          : "<strong>Cek Produk</strong>";

      return (
        "<div " +
        "class=\"product-card\" " +
        "onclick=\"openDetail(" +
        product.id +
        ")\">" +

          "<div class=\"card-image " +
          (product.image ? "has-img" : "") +
          "\">" +

            "<span class=\"platform\">" +
            escapeHtml(
              product.platform.toUpperCase()
            ) +
            "</span>" +

            imageHTML +

          "</div>" +

          "<div class=\"card-body\">" +

            "<div class=\"card-name\">" +
            escapeHtml(product.name) +
            "</div>" +

            "<div class=\"card-stats\">" +
              "<span class=\"star\">★</span>" +
              (
                product.rating
                  ? product.rating
                  : "—"
              ) +
              soldHTML +
            "</div>" +

            "<div class=\"card-price\">" +
              priceHTML +
            "</div>" +

            "<button " +
            "class=\"btn-beli\" " +
            "onclick=\"event.stopPropagation();openDetail(" +
            product.id +
            ")\">" +
            "Beli Sekarang" +
            "</button>" +

          "</div>" +

        "</div>"
      );
    }).join("");
}


/* ========================================
   FILTER
======================================== */

function filterProducts(filter) {
  currentFilter = filter;

  document
    .querySelectorAll(".tab")
    .forEach(function (tab) {
      tab.classList.toggle(
        "active",
        tab.dataset.filter === filter
      );
    });

  renderProducts();
}


/* ========================================
   OPEN DETAIL
======================================== */

function openDetail(id) {
  currentProduct =
    products.find(function (product) {
      return product.id === id;
    });

  if (!currentProduct) {
    return;
  }

  selectedVoucher = null;

  const image =
    document.getElementById(
      "detailImage"
    );

  if (currentProduct.image) {

    image.style.background =
      "transparent";

    image.innerHTML =
      "<img " +
      "src=\"" +
      escapeHtml(
        currentProduct.image
      ) +
      "\" " +
      "alt=\"" +
      escapeHtml(
        currentProduct.name
      ) +
      "\" " +
      "class=\"detail-img\">";

  } else {

    image.style.background =
      "linear-gradient(135deg,#1a0a2e,#2d0a3a)";

    image.innerHTML =
      "<div class=\"logo-text\" " +
      "style=\"color:" +
      currentProduct.logoColor +
      ";\">" +
      escapeHtml(
        currentProduct.logo
      ) +
      "</div>";
  }

  document.getElementById(
    "detailName"
  ).textContent =
    currentProduct.name;

  document.getElementById(
    "detailPlatform"
  ).textContent =
    currentProduct.platform.toUpperCase();

  document.getElementById(
    "detailRating"
  ).innerHTML =
    "<span class=\"star\">★</span>" +
    (
      currentProduct.rating
        ? currentProduct.rating
        : "—"
    ) +
    (
      currentProduct.sold
        ? " · " +
          escapeHtml(
            currentProduct.sold
          ) +
          " Terjual"
        : ""
    );

  document.getElementById(
    "detailDesc"
  ).innerHTML =
    currentProduct.desc.map(
      function (item) {
        return (
          "<li>" +
          "<span style=\"color:var(--green)\">✓</span>" +
          escapeHtml(item.text) +
          "</li>"
        );
      }
    ).join("");

  renderVouchers();

  document
    .getElementById("catalogView")
    .classList.add("hidden");

  document
    .getElementById("detailView")
    .classList.remove("hidden");

  window.scrollTo(0, 0);
}


/* ========================================
   VOUCHERS
======================================== */

function renderVouchers() {
  const grid =
    document.getElementById(
      "voucherGrid"
    );

  if (!grid) {
    return;
  }

  if (
    !currentProduct ||
    !currentProduct.vouchers ||
    !currentProduct.vouchers.length
  ) {

    grid.innerHTML =
      "<p style=\"" +
      "color:var(--text-muted);" +
      "font-size:.9rem;" +
      "\">" +
      "Harga belum tersedia." +
      "</p>";

    selectedVoucher = null;

    return;
  }

  grid.innerHTML =
    currentProduct.vouchers
      .map(function (voucher, index) {

        return (
          "<div " +
          "class=\"voucher-item\" " +
          "data-index=\"" +
          index +
          "\" " +
          "onclick=\"selectVoucher(" +
          index +
          ")\">" +

            "<div class=\"duration\">" +
            escapeHtml(
              voucher.duration
            ) +
            "</div>" +

            "<div class=\"price\">" +
            formatRupiah(
              voucher.price
            ) +
            "</div>" +

          "</div>"
        );
      })
      .join("");

  selectVoucher(0);
}


/* ========================================
   SELECT VOUCHER
======================================== */

function selectVoucher(index) {
  if (
    !currentProduct ||
    !currentProduct.vouchers ||
    !currentProduct.vouchers[index]
  ) {
    return;
  }

  selectedVoucher =
    currentProduct.vouchers[index];

  document
    .querySelectorAll(".voucher-item")
    .forEach(function (item, itemIndex) {
      item.classList.toggle(
        "selected",
        itemIndex === index
      );
    });
}


/* ========================================
   PROCESS ORDER
======================================== */

async function processOrder() {
  if (orderProcessing) {
    return;
  }

  if (!currentProduct) {
    alert("Produk tidak ditemukan.");
    return;
  }

  if (!selectedVoucher) {
    alert("Pilih nominal voucher dulu!");
    return;
  }

  if (
    !selectedVoucher.price ||
    selectedVoucher.price < 1
  ) {
    alert("Harga produk belum tersedia.");
    return;
  }

  orderProcessing = true;

  const button =
    document.getElementById(
      "btnOrder"
    );

  if (button) {
    button.disabled = true;
    button.textContent =
      "Membuat Pembayaran...";
  }

  try {

    const response =
      await fetch(
        API_BASE +
        "/api/create-payment",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            amount:
              selectedVoucher.price,

            product:
              currentProduct.name,

            duration:
              selectedVoucher.duration
          })
        }
      );

    let data = null;

    try {
      data =
        await response.json();
    } catch (error) {
      throw new Error(
        "Backend pembayaran tidak mengirim JSON."
      );
    }

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.message ||
        "Gagal membuat pembayaran."
      );
    }

    const payment =
      data.data || {};

    currentTransactionId =
      payment.transaction_id;

    if (!currentTransactionId) {
      throw new Error(
        "Transaction ID tidak ditemukan."
      );
    }

    showPaymentModal(
      payment
    );

    startPaymentPolling();

  } catch (error) {

    console.error(
      "Payment error:",
      error
    );

    alert(
      error.message ||
      "Gagal membuat pembayaran."
    );

  } finally {

    orderProcessing = false;

    if (button) {
      button.disabled = false;
      button.textContent =
        "Beli Sekarang";
    }
  }
}


/* ========================================
   PAYMENT MODAL
======================================== */

function showPaymentModal(payment) {
  const modal =
    document.getElementById(
      "successModal"
    );

  if (!modal) {
    return;
  }

  const amount =
    payment.amount ||
    selectedVoucher.price;

  const qrUrl =
    payment.qr_url || "";

  const checkoutUrl =
    payment.checkout_url || "";

  let qrContent = "";

  if (qrUrl) {

    qrContent =
      "<img " +
      "src=\"" +
      escapeHtml(qrUrl) +
      "\" " +
      "alt=\"QRIS\" " +
      "style=\"width:260px;max-width:100%;border-radius:12px;display:block;\">";

  } else {

    qrContent =
      "<div style=\"" +
      "padding:25px;" +
      "color:var(--text-muted);" +
      "\">" +
      "QRIS sedang diproses..." +
      "</div>";
  }

  const checkoutContent =
    checkoutUrl
      ? (
          "<a " +
          "href=\"" +
          escapeHtml(checkoutUrl) +
          "\" " +
          "target=\"_blank\" " +
          "rel=\"noopener noreferrer\" " +
          "class=\"btn-primary\" " +
          "style=\"display:block;text-align:center;text-decoration:none;margin-bottom:10px;\">" +
          "Buka Pembayaran" +
          "</a>"
        )
      : "";

  modal.innerHTML =
    "<div class=\"modal\">" +

      "<div class=\"success-icon\" " +
      "style=\"font-size:30px;\">" +
      "⌛" +
      "</div>" +

      "<h2>" +
      "Menunggu Pembayaran" +
      "</h2>" +

      "<p>" +
      "Silakan selesaikan pembayaran QRIS." +
      "</p>" +

      "<div style=\"" +
      "margin:15px 0;" +
      "font-size:1.25rem;" +
      "font-weight:800;" +
      "\">" +
      formatRupiah(amount) +
      "</div>" +

      "<div style=\"" +
      "display:flex;" +
      "justify-content:center;" +
      "margin:15px 0;" +
      "\">" +
      qrContent +
      "</div>" +

      checkoutContent +

      "<p id=\"paymentStatusText\" " +
      "style=\"color:var(--text-muted);font-size:.85rem;\">" +
      "Menunggu konfirmasi pembayaran..." +
      "</p>" +

      "<button " +
      "class=\"btn-primary\" " +
      "onclick=\"cancelPaymentModal()\">" +
      "Tutup" +
      "</button>" +

    "</div>";

  modal.classList.add(
    "active"
  );
}


/* ========================================
   PAYMENT POLLING
======================================== */

function startPaymentPolling() {
  stopPaymentPolling();

  checkPaymentStatus();

  paymentCheckTimer =
    setInterval(
      checkPaymentStatus,
      5000
    );
}


function stopPaymentPolling() {
  if (paymentCheckTimer) {
    clearInterval(
      paymentCheckTimer
    );

    paymentCheckTimer = null;
  }
}


/* ========================================
   CHECK PAYMENT
======================================== */

async function checkPaymentStatus() {
  if (!currentTransactionId) {
    return;
  }

  try {

    const response =
      await fetch(
        API_BASE +
        "/api/check-payment",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            transaction_id:
              currentTransactionId
          })
        }
      );

    if (!response.ok) {
      return;
    }

    const data =
      await response.json();

    if (!data.success) {
      return;
    }

    const payment =
      data.data || {};

    const status =
      String(
        payment.transaction_status ||
        payment.status ||
        ""
      )
        .toLowerCase()
        .trim();

    if (
      status === "settlement" ||
      status === "paid" ||
      status === "success" ||
      status === "completed"
    ) {

      stopPaymentPolling();

      paymentSuccess();

      return;
    }

    if (
      status === "expire" ||
      status === "expired" ||
      status === "cancel" ||
      status === "cancelled"
    ) {

      stopPaymentPolling();

      paymentExpired();

      return;
    }

    const statusText =
      document.getElementById(
        "paymentStatusText"
      );

    if (statusText) {
      statusText.textContent =
        "Menunggu pembayaran...";
    }

  } catch (error) {
    console.warn(
      "Payment status error:",
      error
    );
  }
}


/* ========================================
   PAYMENT SUCCESS
======================================== */

function paymentSuccess() {
  const modal =
    document.getElementById(
      "successModal"
    );

  if (!modal) {
    return;
  }

  const key =
    generateKey();

  modal.innerHTML =
    "<div class=\"modal\">" +

      "<div class=\"success-icon\">" +
      "✓" +
      "</div>" +

      "<h2>" +
      "Pembayaran Berhasil!" +
      "</h2>" +

      "<p>" +
      "Pembayaran kamu telah dikonfirmasi." +
      "</p>" +

      "<p style=\"margin-top:15px;\">" +
      "Key kamu:" +
      "</p>" +

      "<div class=\"key-box\">" +

        "<code id=\"generatedKey\">" +
        escapeHtml(key) +
        "</code>" +

        "<button onclick=\"copyKey()\">" +
        "Salin" +
        "</button>" +

      "</div>" +

      "<p class=\"key-note\">" +
      "Simpan key ini. Jangan bagikan ke orang lain." +
      "</p>" +

      "<button " +
      "class=\"btn-primary\" " +
      "onclick=\"closeSuccess()\">" +
      "Selesai" +
      "</button>" +

    "</div>";

  modal.classList.add(
    "active"
  );
}


/* ========================================
   PAYMENT EXPIRED
======================================== */

function paymentExpired() {
  const modal =
    document.getElementById(
      "successModal"
    );

  if (!modal) {
    return;
  }

  modal.innerHTML =
    "<div class=\"modal\">" +

      "<div class=\"success-icon\" " +
      "style=\"color:#ef4444;\">" +
      "×" +
      "</div>" +

      "<h2>" +
      "Pembayaran Kedaluwarsa" +
      "</h2>" +

      "<p>" +
      "Pembayaran tidak berhasil diselesaikan." +
      "</p>" +

      "<button " +
      "class=\"btn-primary\" " +
      "onclick=\"cancelPaymentModal()\">" +
      "Tutup" +
      "</button>" +

    "</div>";

  modal.classList.add(
    "active"
  );
}


/* ========================================
   CANCEL MODAL
======================================== */

function cancelPaymentModal() {
  stopPaymentPolling();

  currentTransactionId = null;

  const modal =
    document.getElementById(
      "successModal"
    );

  if (!modal) {
    return;
  }

  modal.classList.remove(
    "active"
  );

  modal.innerHTML = "";
}


/* ========================================
   GENERATE KEY
======================================== */

function generateKey() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let key =
    "NIEL-";

  for (
    let group = 0;
    group < 4;
    group++
  ) {

    for (
      let i = 0;
      i < 4;
      i++
    ) {

      key +=
        chars[
          Math.floor(
            Math.random() *
            chars.length
          )
        ];
    }

    if (group < 3) {
      key += "-";
    }
  }

  return key;
}


/* ========================================
   COPY KEY
======================================== */

function copyKey() {
  const element =
    document.getElementById(
      "generatedKey"
    );

  if (!element) {
    return;
  }

  const text =
    element.textContent.trim();

  if (
    navigator.clipboard &&
    navigator.clipboard.writeText
  ) {

    navigator.clipboard
      .writeText(text)
      .then(function () {
        showCopied();
      })
      .catch(function () {
        fallbackCopy(text);
      });

  } else {

    fallbackCopy(text);

  }
}


/* ========================================
   FALLBACK COPY
======================================== */

function fallbackCopy(text) {
  const textarea =
    document.createElement(
      "textarea"
    );

  textarea.value =
    text;

  textarea.style.position =
    "fixed";

  textarea.style.opacity =
    "0";

  document.body.appendChild(
    textarea
  );

  textarea.select();

  try {

    document.execCommand(
      "copy"
    );

    showCopied();

  } catch (error) {

    alert(
      "Gagal menyalin key."
    );
  }

  document.body.removeChild(
    textarea
  );
}


/* ========================================
   COPIED
======================================== */

function showCopied() {
  const button =
    document.querySelector(
      ".key-box button"
    );

  if (!button) {
    return;
  }

  const original =
    button.textContent;

  button.textContent =
    "Tersalin!";

  setTimeout(function () {
    button.textContent =
      original || "Salin";
  }, 2000);
}


/* ========================================
   CLOSE SUCCESS
======================================== */

function closeSuccess() {
  stopPaymentPolling();

  currentTransactionId = null;

  const modal =
    document.getElementById(
      "successModal"
    );

  if (modal) {
    modal.classList.remove(
      "active"
    );

    modal.innerHTML = "";
  }

  showCatalog();
}


/* ========================================
   SHOW CATALOG
======================================== */

function showCatalog() {
  stopPaymentPolling();

  currentTransactionId = null;

  const detail =
    document.getElementById(
      "detailView"
    );

  const catalog =
    document.getElementById(
      "catalogView"
    );

  if (detail) {
    detail.classList.add(
      "hidden"
    );
  }

  if (catalog) {
    catalog.classList.remove(
      "hidden"
    );
  }

  window.scrollTo(
    0,
    0
  );
}


/* ========================================
   CHECK ORDERS
======================================== */

function showOrders() {
  alert(
    "Fitur cek pesanan belum tersedia."
  );
}
