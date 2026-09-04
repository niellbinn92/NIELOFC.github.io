const SHEET_CSV =
const SHEET_CSV =
"https://docs.google.com/spreadsheets/d/1pjhTWEDAev2SkOyvkBkysL45X55GQUKGaBbEDe36P4g/export?format=csv";

/* =========================
PRODUCT IMAGES
========================= */

const PRODUCT_IMAGES = {
"DRIP CLIENT":
"https://i.ibb.co/fdSbRZws/D59-B08-CC-71-D9-4-CAC-9-A24-68-F271078-F7-B.png",

"DRIP PROXY":
"https://i.ibb.co/fdSbRZws/D59-B08-CC-71-D9-4-CAC-9-A24-68-F271078-F7-B.png",

"HG CHEAT":
"https://i.ibb.co/Gv20LMPL/IMG-7800.png",

"HG PROXY":
"https://i.ibb.co/Gv20LMPL/IMG-7800.png"
};

/* =========================
FALLBACK LOGO
========================= */

const LOGO_FALLBACK = {
"DRIP CLIENT": {
logo: "DRIP",
color: "#e879f9"
},

"DRIP PROXY": {
logo: "DRIP",
color: "#c084fc"
},

"HG CHEAT": {
logo: "HG",
color: "#ec4899"
},

"HG PROXY": {
logo: "HG",
color: "#f472b6"
}
};

/* =========================
FALLBACK PRODUCTS
Dipakai jika Google Sheet gagal
========================= */

const FALLBACK_PRODUCTS = [
{
id: 1,
name: "DRIP CLIENT",
platform: "android",
logo: "DRIP",
logoColor: "#e879f9",
image: PRODUCT_IMAGES["DRIP CLIENT"],
rating: 5,
reviews: 0,
sold: "",
priceFrom: 0,
desc: [
{
icon: "✓",
text: "Produk DRIP CLIENT"
},
{
icon: "✓",
text: "Silakan cek harga pada pilihan voucher"
}
],
vouchers: []
},

{
id: 2,
name: "DRIP PROXY",
platform: "android",
logo: "DRIP",
logoColor: "#c084fc",
image: PRODUCT_IMAGES["DRIP PROXY"],
rating: 5,
reviews: 0,
sold: "",
priceFrom: 0,
desc: [
{
icon: "✓",
text: "Produk DRIP PROXY"
},
{
icon: "✓",
text: "Silakan cek harga pada pilihan voucher"
}
],
vouchers: []
},

{
id: 3,
name: "HG CHEAT",
platform: "android",
logo: "HG",
logoColor: "#ec4899",
image: PRODUCT_IMAGES["HG CHEAT"],
rating: 5,
reviews: 0,
sold: "",
priceFrom: 0,
desc: [
{
icon: "✓",
text: "Produk HG CHEAT"
},
{
icon: "✓",
text: "Silakan cek harga pada pilihan voucher"
}
],
vouchers: []
},

{
id: 4,
name: "HG PROXY",
platform: "android",
logo: "HG",
logoColor: "#f472b6",
image: PRODUCT_IMAGES["HG PROXY"],
rating: 5,
reviews: 0,
sold: "",
priceFrom: 0,
desc: [
{
icon: "✓",
text: "Produk HG PROXY"
},
{
icon: "✓",
text: "Silakan cek harga pada pilihan voucher"
}
],
vouchers: []
}
];

/* =========================
GLOBAL
========================= */

let products = [];
let currentProduct = null;
let selectedVoucher = null;
let currentFilter = "all";

let currentTransactionId = null;
let paymentCheckTimer = null;
let orderProcessing = false;

/* =========================
LOADING
========================= */

function showLoading() {
const el = document.getElementById("loadingScreen");

if (el) {
el.classList.remove("hidden");
}
}

function hideLoading() {
const el = document.getElementById("loadingScreen");

if (el) {
el.classList.add("hidden");
}
}

/* =========================
START APP
========================= */

function startApp() {
const app = document.getElementById("mainApp");

if (app) {
app.classList.remove("hidden");
}

showLoading();

/*

* Loading TIDAK BOLEH menggantung.
* Maksimal 3 detik akan hilang walaupun
* Google Sheet bermasalah.
  */

const loadingTimeout = setTimeout(function () {
hideLoading();
}, 3000);

loadProducts()
.catch(function (error) {
console.error("Google Sheet error:", error);

```
  /*
   * Jangan biarkan website mati.
   * Gunakan fallback product.
   */

  if (!products.length) {
    products = FALLBACK_PRODUCTS.slice();
  }

  renderProducts();
})
.finally(function () {
  clearTimeout(loadingTimeout);
  hideLoading();
});
```

}

/* =========================
DOM READY
========================= */

document.addEventListener("DOMContentLoaded", function () {
startApp();
});

/* =========================
RUPIAH
========================= */

function formatRupiah(num) {
return "Rp " + Number(num).toLocaleString("id-ID");
}

/* =========================
ESCAPE HTML
========================= */

function escapeHtml(value) {
return String(value || "")
.replace(/&/g, "&")
.replace(/</g, "<")
.replace(/>/g, ">")
.replace(/"/g, """)
.replace(/'/g, "'");
}

/* =========================
CSV PARSER
========================= */

function parseCSV(text) {
const lines = text.trim().split(/\r?\n/);

if (lines.length < 2) {
return [];
}

const headers = lines[0]
.split(",")
.map(function (h) {
return h.trim().replace(/^"|"$/g, "");
});

return lines
.slice(1)
.filter(function (line) {
return line.trim();
})
.map(function (line) {
const cols = line.split(",").map(function (c) {
return c.trim().replace(/^"|"$/g, "");
});

```
  const obj = {};

  headers.forEach(function (h, i) {
    obj[h] = cols[i] || "";
  });

  return obj;
});
```

}

/* =========================
LOAD PRODUCTS
========================= */

async function loadProducts() {
try {

```
/*
 * Timeout request 5 detik.
 * Jadi Google Sheet tidak bisa bikin
 * website loading terus.
 */

const controller = new AbortController();

const timeout = setTimeout(function () {
  controller.abort();
}, 5000);


let res;

try {

  res = await fetch(
    SHEET_CSV + "&t=" + Date.now(),
    {
      method: "GET",
      cache: "no-store",
      signal: controller.signal
    }
  );

} finally {

  clearTimeout(timeout);

}


if (!res.ok) {
  throw new Error(
    "Google Sheet HTTP " + res.status
  );
}


const text = await res.text();


if (!text || !text.trim()) {
  throw new Error(
    "Google Sheet kosong"
  );
}


const rows = parseCSV(text);


if (!rows.length) {
  throw new Error(
    "Data produk tidak ditemukan"
  );
}


const loadedProducts = rows
  .map(function (row, idx) {

    const name =
      (row.name || "")
        .trim()
        .toUpperCase();


    if (!name) {
      return null;
    }


    const platform =
      (row.platform || "android")
        .toLowerCase()
        .trim();


    const rating =
      parseFloat(row.rating) || 0;


    const sold =
      row.sold || "";


    const descRaw =
      row.desc || "";


    const desc = descRaw

      ? descRaw
          .split("|")
          .map(function (d) {

            return {
              icon: "✓",
              text: d.trim()
            };

          })
          .filter(function (d) {
            return d.text;
          })

      : [
          {
            icon: "✓",
            text:
              "Produk premium NIELSTORE"
          }
        ];


    const fixedCols = [
      "name",
      "platform",
      "logo",
      "rating",
      "sold",
      "desc"
    ];


    const vouchers = [];


    Object.keys(row).forEach(
      function (key) {

        if (
          fixedCols.indexOf(
            key.toLowerCase()
          ) !== -1
        ) {
          return;
        }


        const rawPrice =
          String(row[key] || "");


        const price =
          parseInt(
            rawPrice.replace(/\D/g, ""),
            10
          );


        if (
          Number.isFinite(price) &&
          price > 0
        ) {

          vouchers.push({

            duration:
              key.trim(),

            price:
              price,

            stock:
              true

          });

        }

      }
    );


    vouchers.sort(
      function (a, b) {

        return (
          (parseInt(a.duration) || 999) -
          (parseInt(b.duration) || 999)
        );

      }
    );


    const priceFrom =
      vouchers.length
        ? Math.min.apply(
            null,
            vouchers.map(function (v) {
              return v.price;
            })
          )
        : 0;


    const img =
      PRODUCT_IMAGES[name] || "";


    const fallback =
      LOGO_FALLBACK[name] || {
        logo: name.slice(0, 4),
        color: "#a855f7"
      };


    return {

      id:
        idx + 1,

      name:
        row.name.trim(),

      platform:
        platform,

      logo:
        row.logo ||
        fallback.logo,

      logoColor:
        fallback.color,

      image:
        img,

      rating:
        rating,

      reviews:
        0,

      sold:
        sold,

      priceFrom:
        priceFrom,

      desc:
        desc,

      vouchers:
        vouchers

    };

  })
  .filter(function (product) {
    return product !== null;
  });


if (!loadedProducts.length) {
  throw new Error(
    "Tidak ada produk valid dari Sheet"
  );
}


products =
  loadedProducts;


renderProducts();
```

} catch (error) {

```
console.error(
  "Gagal memuat Google Sheet:",
  error
);


/*
 * FALLBACK
 *
 * Produk tetap ditampilkan supaya
 * NIELSTORE tidak blank.
 */

products =
  FALLBACK_PRODUCTS.slice();


renderProducts();


/*
 * Lempar error supaya startApp()
 * tetap tahu bahwa Sheet gagal,
 * tetapi website tidak ikut gagal.
 */

throw error;
```

}

}

/* =========================
RENDER PRODUCTS
========================= */

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

```
  ? products

  : products.filter(
      function (p) {
        return (
          p.platform ===
          currentFilter
        );
      }
    );
```

if (!filtered.length) {

```
grid.innerHTML =

  '<p style="' +
  'color:var(--text-muted);' +
  'grid-column:1/-1;' +
  'text-align:center;' +
  'padding:3rem;">' +

  "Tidak ada produk untuk filter ini." +

  "</p>";

return;
```

}

grid.innerHTML =
filtered
.map(function (p) {

```
    return (

      '<div class="product-card" ' +
      'onclick="openDetail(' +
      p.id +
      ')">' +


        '<div class="card-image ' +
        (p.image
          ? "has-img"
          : "") +
        '" style="' +

          (
            p.image
              ? ""
              : "background:linear-gradient(135deg,#1a0a2e,#2d0a3a)"
          ) +

        '">' +


          '<span class="platform">' +

          escapeHtml(
            p.platform.toUpperCase()
          ) +

          "</span>" +


          (
            p.image

              ? '<img src="' +
                escapeHtml(p.image) +
                '" alt="' +
                escapeHtml(p.name) +
                '" class="card-img">'

              : '<div class="logo-text" ' +
                'style="color:' +
                p.logoColor +
                '">' +
                escapeHtml(p.logo) +
                "</div>"
          ) +


        "</div>" +


        '<div class="card-body">' +


          '<div class="card-name">' +

          escapeHtml(
            p.name
          ) +

          "</div>" +


          '<div class="card-stats">' +

          '<span class="star">★</span> ' +

          (
            p.rating
              ? p.rating
              : "—"
          ) +

          (
            p.sold
              ? " · " +
                escapeHtml(p.sold) +
                " Terjual"
              : ""
          ) +

          "</div>" +


          '<div class="card-price">' +

          "Mulai dari " +

          "<strong>" +

          (
            p.priceFrom
              ? formatRupiah(
                  p.priceFrom
                )
              : "—"
          ) +

          "</strong>" +

          "</div>" +


          '<button class="btn-beli" ' +
          'onclick="event.stopPropagation();' +
          'openDetail(' +
          p.id +
          ')">' +

          "Beli Sekarang" +

          "</button>" +


        "</div>" +

      "</div>"

    );

  })
  .join("");
```

}

/* =========================
FILTER
========================= */

function filterProducts(filter) {

currentFilter =
filter;

document
.querySelectorAll(".tab")
.forEach(function (tab) {

```
  tab.classList.toggle(
    "active",
    tab.dataset.filter === filter
  );

});
```

renderProducts();

}

/* =========================
OPEN DETAIL
========================= */

function openDetail(id) {

currentProduct =
products.find(function (p) {
return p.id === id;
});

if (!currentProduct) {
return;
}

selectedVoucher = null;

const imgEl =
document.getElementById(
"detailImage"
);

if (currentProduct.image) {

```
imgEl.style.background =
  "transparent";


imgEl.innerHTML =

  '<img src="' +
  escapeHtml(
    currentProduct.image
  ) +
  '" alt="' +
  escapeHtml(
    currentProduct.name
  ) +
  '" class="detail-img">';
```

} else {

```
imgEl.style.background =
  "linear-gradient(135deg,#1a0a2e,#2d0a3a)";


imgEl.innerHTML =

  '<div class="logo-text" ' +
  'style="color:' +
  currentProduct.logoColor +
  '">' +

  escapeHtml(
    currentProduct.logo
  ) +

  "</div>";
```

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

```
'<span class="star">★</span> ' +

(
  currentProduct.rating ||
  "—"
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
```

document.getElementById(
"detailDesc"
).innerHTML =

```
currentProduct.desc

  .map(function (d) {

    return (

      "<li>" +

      '<span style="color:var(--green)">' +

      escapeHtml(d.icon) +

      "</span> " +

      escapeHtml(d.text) +

      "</li>"

    );

  })
  .join("");
```

const voucherGrid =
document.getElementById(
"voucherGrid"
);

if (!currentProduct.vouchers.length) {

```
voucherGrid.innerHTML =

  '<p style="color:var(--text-muted);' +
  'font-size:.9rem;">' +

  "Harga sedang tidak tersedia." +

  "</p>";
```

} else {

```
voucherGrid.innerHTML =

  currentProduct.vouchers
    .map(function (v, i) {

      return (

        '<div class="voucher-item ' +

        (!v.stock
          ? "out-of-stock"
          : "") +

        '" data-index="' +
        i +
        '" ' +

        (
          v.stock
            ? 'onclick="selectVoucher(' +
              i +
              ')"'
            : ""
        ) +

        ">" +


          '<div class="duration">' +

          escapeHtml(
            v.duration
          ) +

          "</div>" +


          '<div class="price">' +

          (
            v.stock
              ? formatRupiah(v.price)
              : "—"
          ) +

          "</div>" +


          (
            !v.stock

              ? '<div class="stock-label">' +
                "STOK HABIS" +
                "</div>"

              : '<div class="reseller">' +
                "HARGA RESELLER" +
                "</div>"
          ) +


        "</div>"

      );

    })
    .join("");


const firstAvailable =
  currentProduct.vouchers.findIndex(
    function (v) {
      return v.stock;
    }
  );


if (firstAvailable >= 0) {
  selectVoucher(
    firstAvailable
  );
}
```

}

document
.getElementById(
"catalogView"
)
.classList.add("hidden");

document
.getElementById(
"detailView"
)
.classList.remove("hidden");

window.scrollTo(
0,
0
);

}

/* =========================
SELECT VOUCHER
========================= */

function selectVoucher(index) {

if (!currentProduct) {
return;
}

selectedVoucher =
currentProduct.vouchers[index];

document
.querySelectorAll(
".voucher-item"
)
.forEach(function (el, i) {

```
  el.classList.toggle(
    "selected",
    i === index
  );

});
```

}

/* =========================
PROCESS ORDER
========================= */

async function processOrder() {

if (orderProcessing) {
return;
}

if (!selectedVoucher) {

```
alert(
  "Pilih nominal voucher dulu!"
);

return;
```

}

if (!currentProduct) {

```
alert(
  "Produk tidak ditemukan."
);

return;
```

}

orderProcessing =
true;

const button =
document.getElementById(
"btnOrder"
);

if (button) {

```
button.disabled =
  true;

button.textContent =
  "Membuat Pembayaran...";
```

}

try {

```
const response =
  await fetch(
    "/api/create-payment",
    {

      method:
        "POST",

      headers: {
        "Content-Type":
          "application/json"
      },

      body:
        JSON.stringify({

          amount:
            selectedVoucher.price,

          product:
            currentProduct.name,

          duration:
            selectedVoucher.duration

        })

    }
  );


const data =
  await response.json();


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
```

} catch (error) {

```
console.error(
  "Order error:",
  error
);


alert(
  error.message ||
  "Gagal membuat pembayaran."
);
```

} finally {

```
orderProcessing =
  false;


if (button) {

  button.disabled =
    false;

  button.textContent =
    "Beli Sekarang";

}
```

}

}

/* =========================
PAYMENT MODAL
========================= */

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
(
selectedVoucher
? selectedVoucher.price
: 0
);

const checkoutUrl =
payment.checkout_url || "";

const qrUrl =
payment.qr_url || "";

const qrString =
payment.qr_string || "";

let qrContent = "";

if (qrUrl) {

```
qrContent =

  '<img src="' +
  escapeHtml(qrUrl) +
  '" alt="QRIS" ' +
  'style="width:260px;' +
  'max-width:100%;' +
  'border-radius:12px;">';
```

} else if (qrString) {

```
qrContent =

  '<div style="' +
  'padding:15px;' +
  'background:#fff;' +
  'color:#111;' +
  'border-radius:10px;' +
  'word-break:break-all;' +
  'font-size:12px;">' +

  escapeHtml(qrString) +

  "</div>";
```

} else {

```
qrContent =

  '<div style="' +
  'padding:25px;' +
  'color:var(--text-muted);">' +

  "QRIS sedang diproses..." +

  "</div>";
```

}

modal.innerHTML =

```
'<div class="modal">' +

  '<div class="success-icon" ' +
  'style="font-size:30px;">' +
  "⌛" +
  "</div>" +

  "<h2>Menunggu Pembayaran</h2>" +

  "<p>Silakan selesaikan pembayaran QRIS.</p>" +

  '<div style="' +
  'margin:15px 0;' +
  'font-size:1.25rem;' +
  'font-weight:800;">' +

  formatRupiah(amount) +

  "</div>" +

  '<div style="' +
  'display:flex;' +
  'justify-content:center;' +
  'margin:15px 0;">' +

  qrContent +

  "</div>" +

  (
    checkoutUrl

      ? '<a href="' +
        escapeHtml(checkoutUrl) +
        '" target="_blank" ' +
        'rel="noopener noreferrer" ' +
        'class="btn-primary" ' +
        'style="display:block;' +
        'text-align:center;' +
        'text-decoration:none;' +
        'margin-bottom:10px;">' +

        "Buka Halaman Pembayaran" +

        "</a>"

      : ""
  ) +

  '<p id="paymentStatusText" ' +
  'style="color:var(--text-muted);' +
  'font-size:.85rem;">' +

  "Menunggu konfirmasi pembayaran..." +

  "</p>" +

  '<button class="btn-primary" ' +
  'onclick="cancelPaymentModal()">' +

  "Tutup" +

  "</button>" +

"</div>";
```

modal.classList.add(
"active"
);

}

/* =========================
PAYMENT POLLING
========================= */

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

```
clearInterval(
  paymentCheckTimer
);

paymentCheckTimer =
  null;
```

}

}

/* =========================
CHECK PAYMENT
========================= */

async function checkPaymentStatus() {

if (!currentTransactionId) {
return;
}

try {

```
const response =
  await fetch(
    "/api/check-payment",
    {

      method:
        "POST",

      headers: {
        "Content-Type":
          "application/json"
      },

      body:
        JSON.stringify({

          transaction_id:
            currentTransactionId

        })

    }
  );


const data =
  await response.json();


if (
  !response.ok ||
  !data.success
) {

  console.warn(
    "Payment check:",
    data.message
  );

  return;

}


const payment =
  data.data || {};


const status =
  String(
    payment.transaction_status ||
    payment.status ||
    ""
  ).toLowerCase();


console.log(
  "Payment status:",
  status
);


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
```

} catch (error) {

```
console.error(
  "Gagal cek pembayaran:",
  error
);
```

}

}

/* =========================
PAYMENT SUCCESS
========================= */

function paymentSuccess() {

const modal =
document.getElementById(
"successModal"
);

const key =
generateKey();

modal.innerHTML =

```
'<div class="modal">' +

  '<div class="success-icon">' +
  "✓" +
  "</div>" +

  "<h2>Pembayaran Berhasil!</h2>" +

  "<p>Pembayaran kamu telah dikonfirmasi.</p>" +

  '<p style="margin-top:15px;">' +
  "Key kamu:" +
  "</p>" +

  '<div class="key-box">' +

    '<code id="generatedKey">' +
    escapeHtml(key) +
    "</code>" +

    '<button onclick="copyKey()">' +
    "Salin" +
    "</button>" +

  "</div>" +

  '<p class="key-note">' +
  "Simpan key ini. Jangan bagikan ke orang lain." +
  "</p>" +

  '<button class="btn-primary" ' +
  'onclick="closeSuccess()">' +

  "Selesai" +

  "</button>" +

"</div>";
```

modal.classList.add(
"active"
);

}

/* =========================
PAYMENT EXPIRED
========================= */

function paymentExpired() {

const modal =
document.getElementById(
"successModal"
);

modal.innerHTML =

```
'<div class="modal">' +

  '<div class="success-icon" ' +
  'style="color:#ef4444;">' +

  "×" +

  "</div>" +

  "<h2>Pembayaran Kedaluwarsa</h2>" +

  "<p>Pembayaran tidak berhasil diselesaikan.</p>" +

  '<button class="btn-primary" ' +
  'onclick="cancelPaymentModal()">' +

  "Tutup" +

  "</button>" +

"</div>";
```

modal.classList.add(
"active"
);

}

/* =========================
CANCEL MODAL
========================= */

function cancelPaymentModal() {

stopPaymentPolling();

currentTransactionId =
null;

const modal =
document.getElementById(
"successModal"
);

if (modal) {

```
modal.classList.remove(
  "active"
);

modal.innerHTML =
  "";
```

}

}

/* =========================
GENERATE KEY
========================= */

function generateKey() {

const chars =
"ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

let key =
"NIEL-";

for (
let i = 0;
i < 4;
i++
) {

```
for (
  let j = 0;
  j < 4;
  j++
) {

  key +=
    chars[
      Math.floor(
        Math.random() *
        chars.length
      )
    ];

}


if (i < 3) {
  key += "-";
}
```

}

return key;

}

/* =========================
COPY KEY
========================= */

function copyKey() {

const keyEl =
document.getElementById(
"generatedKey"
);

if (!keyEl) {
return;
}

navigator.clipboard
.writeText(
keyEl.textContent
)
.then(function () {

```
  const btn =
    document.querySelector(
      ".key-box button"
    );


  if (!btn) {
    return;
  }


  btn.textContent =
    "Tersalin!";


  setTimeout(
    function () {

      btn.textContent =
        "Salin";

    },
    2000
  );

})
.catch(function () {

  alert(
    "Gagal menyalin key."
  );

});
```

}

/* =========================
CLOSE SUCCESS
========================= */

function closeSuccess() {

stopPaymentPolling();

currentTransactionId =
null;

const modal =
document.getElementById(
"successModal"
);

if (modal) {

```
modal.classList.remove(
  "active"
);

modal.innerHTML =
  "";
```

}

showCatalog();

}

/* =========================
SHOW CATALOG
========================= */

function showCatalog() {

stopPaymentPolling();

currentTransactionId =
null;

const detail =
document.getElementById(
"detailView"
);

const catalog =
document.getElementById(
"catalogView"
);

if (detail) {

```
detail.classList.add(
  "hidden"
);
```

}

if (catalog) {

```
catalog.classList.remove(
  "hidden"
);
```

}

window.scrollTo(
0,
0
);

}
