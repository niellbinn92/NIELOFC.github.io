/* =========================================================
NIELSTORE
GitHub Pages + Vercel Backend
========================================================= */

/* =========================================================
URL BACKEND VERCEL
========================================================= */

const API_BASE =
"https://nielofc-github-io.vercel.app";

/* =========================================================
GOOGLE SHEETS
========================================================= */

const SHEET_CSV =
"https://docs.google.com/spreadsheets/d/1pjhTWEDAev2SkOyvkBkysL45X55GQUKGaBbEDe36P4g/export?format=csv";

/* =========================================================
PRODUCT IMAGES
========================================================= */

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

/* =========================================================
LOGO FALLBACK
========================================================= */

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

/* =========================================================
FALLBACK PRODUCTS
========================================================= */

const FALLBACK_PRODUCTS = [

{
id: 1,
name: "DRIP CLIENT",
platform: "android",
logo: "DRIP",
logoColor: "#e879f9",
image: PRODUCT_IMAGES["DRIP CLIENT"],
rating: 0,
sold: "",
priceFrom: 0,
desc: [
{
icon: "✓",
text: "Produk DRIP CLIENT"
},
{
icon: "✓",
text: "Harga akan dimuat dari katalog"
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
rating: 0,
sold: "",
priceFrom: 0,
desc: [
{
icon: "✓",
text: "Produk DRIP PROXY"
},
{
icon: "✓",
text: "Harga akan dimuat dari katalog"
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
rating: 0,
sold: "",
priceFrom: 0,
desc: [
{
icon: "✓",
text: "Produk HG CHEAT"
},
{
icon: "✓",
text: "Harga akan dimuat dari katalog"
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
rating: 0,
sold: "",
priceFrom: 0,
desc: [
{
icon: "✓",
text: "Produk HG PROXY"
},
{
icon: "✓",
text: "Harga akan dimuat dari katalog"
}
],
vouchers: []
}

];

/* =========================================================
GLOBAL
========================================================= */

let products =
FALLBACK_PRODUCTS.slice();

let currentProduct =
null;

let selectedVoucher =
null;

let currentFilter =
"all";

let currentTransactionId =
null;

let paymentCheckTimer =
null;

let orderProcessing =
false;

/* =========================================================
START
========================================================= */

document.addEventListener(
"DOMContentLoaded",
function () {

```
/*
 * LANGSUNG TAMPIL
 */

hideLoading();

renderProducts();

/*
 * Sheet diproses di background.
 * Tidak menghambat website.
 */

loadProductsBackground();
```

}
);

/* =========================================================
LOADING
========================================================= */

function hideLoading() {

const el =
document.getElementById(
"loadingScreen"
);

if (!el) {
return;
}

el.classList.add(
"hidden"
);

el.style.display =
"none";

}

/* =========================================================
SHEET BACKGROUND
========================================================= */

async function loadProductsBackground() {

const controller =
new AbortController();

const timeout =
setTimeout(
function () {

```
    controller.abort();

  },
  4000
);
```

try {

```
const response =
  await fetch(
    SHEET_CSV +
    "&t=" +
    Date.now(),
    {
      cache:
        "no-store",

      signal:
        controller.signal
    }
  );


if (!response.ok) {
  throw new Error(
    "HTTP " +
    response.status
  );
}


const text =
  await response.text();


if (!text.trim()) {
  throw new Error(
    "Sheet kosong"
  );
}


const rows =
  parseCSV(text);


const loaded =
  convertRowsToProducts(
    rows
  );


if (!loaded.length) {
  throw new Error(
    "Produk tidak ditemukan"
  );
}


/*
 * Data asli berhasil.
 */

products =
  loaded;


renderProducts();


console.log(
  "Google Sheet berhasil dimuat."
);
```

} catch (error) {

```
/*
 * Sheet error tidak masalah.
 * NIELSTORE tetap tampil.
 */

console.warn(
  "Google Sheet gagal:",
  error
);
```

} finally {

```
clearTimeout(
  timeout
);

hideLoading();
```

}

}

/* =========================================================
CSV PARSER
========================================================= */

function parseCSV(text) {

const rows = [];

let row = [];

let value = "";

let inQuotes =
false;

for (
let i = 0;
i < text.length;
i++
) {

```
const char =
  text[i];

const next =
  text[i + 1];


if (
  char === '"' &&
  inQuotes &&
  next === '"'
) {

  value += '"';

  i++;

  continue;

}


if (
  char === '"'
) {

  inQuotes =
    !inQuotes;

  continue;

}


if (
  char === "," &&
  !inQuotes
) {

  row.push(
    value.trim()
  );

  value = "";

  continue;

}


if (
  (
    char === "\n" ||
    char === "\r"
  ) &&
  !inQuotes
) {

  if (
    char === "\r" &&
    next === "\n"
  ) {

    i++;

  }


  row.push(
    value.trim()
  );


  if (
    row.some(
      function (cell) {
        return cell !== "";
      }
    )
  ) {

    rows.push(
      row
    );

  }


  row = [];

  value = "";

  continue;

}


value += char;
```

}

if (
value !== "" ||
row.length
) {

```
row.push(
  value.trim()
);
```

}

if (row.length) {
rows.push(row);
}

if (rows.length < 2) {
return [];
}

const headers =
rows[0].map(
function (header) {

```
    return String(header)
      .trim()
      .toLowerCase();

  }
);
```

return rows
.slice(1)
.map(
function (cells) {

```
    const obj = {};


    headers.forEach(
      function (
        header,
        index
      ) {

        obj[header] =
          cells[index] || "";

      }
    );


    return obj;

  }
);
```

}

/* =========================================================
CONVERT SHEET ROWS
========================================================= */

function convertRowsToProducts(
rows
) {

const result = [];

rows.forEach(
function (
row,
index
) {

```
  const name =
    String(
      row.name || ""
    )
    .trim()
    .toUpperCase();


  if (!name) {
    return;
  }


  const platform =
    String(
      row.platform ||
      "android"
    )
    .trim()
    .toLowerCase();


  const rating =
    parseFloat(
      row.rating
    ) || 0;


  const sold =
    String(
      row.sold || ""
    ).trim();


  const descRaw =
    String(
      row.desc || ""
    ).trim();


  const desc =
    descRaw

      ? descRaw
          .split("|")
          .map(
            function (text) {

              return {
                icon: "✓",
                text:
                  text.trim()
              };

            }
          )
          .filter(
            function (item) {
              return item.text;
            }
          )

      : [
          {
            icon: "✓",
            text:
              "Produk NIELSTORE"
          }
        ];


  const fixed =
    [
      "name",
      "platform",
      "logo",
      "rating",
      "sold",
      "desc"
    ];


  const vouchers = [];


  Object.keys(row)
    .forEach(
      function (key) {

        if (
          fixed.includes(
            key.toLowerCase()
          )
        ) {

          return;

        }


        const raw =
          String(
            row[key] || ""
          ).trim();


        const price =
          parseInt(
            raw.replace(
              /\D/g,
              ""
            ),
            10
          );


        if (
          Number.isFinite(
            price
          ) &&
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
    function (
      a,
      b
    ) {

      return (
        (
          parseInt(
            a.duration
          ) || 9999
        ) -
        (
          parseInt(
            b.duration
          ) || 9999
        )
      );

    }
  );


  const priceFrom =
    vouchers.length
      ? Math.min(
          ...vouchers.map(
            function (v) {
              return v.price;
            }
          )
        )
      : 0;


  const fallback =
    LOGO_FALLBACK[name] ||
    {
      logo:
        name.slice(
          0,
          4
        ),

      color:
        "#a855f7"
    };


  result.push({

    id:
      index + 1,

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
      PRODUCT_IMAGES[name] ||
      "",

    rating:
      rating,

    sold:
      sold,

    priceFrom:
      priceFrom,

    desc:
      desc,

    vouchers:
      vouchers

  });

}
```

);

return result;

}

/* =========================================================
RUPIAH
========================================================= */

function formatRupiah(
number
) {

return (
"Rp " +
Number(
number
).toLocaleString(
"id-ID"
)
);

}

/* =========================================================
ESCAPE
========================================================= */

function escapeHtml(
value
) {

return String(
value || ""
)
.replace(
/&/g,
"&"
)
.replace(
/</g,
"<"
)
.replace(
/>/g,
">"
)
.replace(
/"/g,
"""
)
.replace(
/'/g,
"'"
);

}

/* =========================================================
RENDER
========================================================= */

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
      function (product) {

        return (
          product.platform ===
          currentFilter
        );

      }
    );
```

if (!filtered.length) {

```
grid.innerHTML =
  `
    <p
      style="
        color:var(--text-muted);
        grid-column:1/-1;
        text-align:center;
        padding:3rem;
      ">

      Tidak ada produk.

    </p>
  `;

return;
```

}

grid.innerHTML =
filtered
.map(
function (product) {

```
      return `

        <div
          class="product-card"
          onclick="openDetail(${product.id})">

          <div
            class="card-image ${
              product.image
                ? "has-img"
                : ""
            }"
            style="${
              product.image
                ? ""
                : "background:linear-gradient(135deg,#1a0a2e,#2d0a3a)"
            }">

            <span class="platform">

              ${escapeHtml(
                product.platform
                  .toUpperCase()
              )}

            </span>

            ${
              product.image

                ? `
                  <img
                    src="${escapeHtml(
                      product.image
                    )}"
                    alt="${escapeHtml(
                      product.name
                    )}"
                    class="card-img"
                    loading="lazy">
                `

                : `
                  <div
                    class="logo-text"
                    style="color:${product.logoColor}">

                    ${escapeHtml(
                      product.logo
                    )}

                  </div>
                `
            }

          </div>


          <div class="card-body">

            <div class="card-name">

              ${escapeHtml(
                product.name
              )}

            </div>


            <div class="card-stats">

              <span class="star">
                ★
              </span>

              ${
                product.rating
                  ? product.rating
                  : "—"
              }

              ${
                product.sold
                  ? " · " +
                    escapeHtml(
                      product.sold
                    ) +
                    " Terjual"
                  : ""
              }

            </div>


            <div class="card-price">

              ${
                product.priceFrom
                  ? "Mulai dari "
                  : ""
              }

              <strong>

                ${
                  product.priceFrom
                    ? formatRupiah(
                        product.priceFrom
                      )
                    : "Cek Produk"
                }

              </strong>

            </div>


            <button
              class="btn-beli"
              onclick="
                event.stopPropagation();
                openDetail(${product.id});
              ">

              Beli Sekarang

            </button>

          </div>

        </div>

      `;

    }
  )
  .join("");
```

}

/* =========================================================
FILTER
========================================================= */

function filterProducts(
filter
) {

currentFilter =
filter;

document
.querySelectorAll(".tab")
.forEach(
function (tab) {

```
    tab.classList.toggle(
      "active",
      tab.dataset.filter ===
      filter
    );

  }
);
```

renderProducts();

}

/* =========================================================
DETAIL
========================================================= */

function openDetail(
id
) {

currentProduct =
products.find(
function (product) {

```
    return product.id === id;

  }
);
```

if (!currentProduct) {

```
alert(
  "Produk tidak ditemukan."
);

return;
```

}

selectedVoucher =
null;

const image =
document.getElementById(
"detailImage"
);

if (currentProduct.image) {

```
image.style.background =
  "transparent";


image.innerHTML =
  `
    <img
      src="${escapeHtml(
        currentProduct.image
      )}"
      alt="${escapeHtml(
        currentProduct.name
      )}"
      class="detail-img">
  `;
```

} else {

```
image.innerHTML =
  `
    <div
      class="logo-text"
      style="color:${currentProduct.logoColor}">

      ${escapeHtml(
        currentProduct.logo
      )}

    </div>
  `;
```

}

document.getElementById(
"detailName"
).textContent =
currentProduct.name;

document.getElementById(
"detailPlatform"
).textContent =
currentProduct.platform
.toUpperCase();

document.getElementById(
"detailRating"
).innerHTML =
` <span class="star">★</span>
${
currentProduct.rating
? currentProduct.rating
: "—"
}

```
  ${
    currentProduct.sold
      ? " · " +
        escapeHtml(
          currentProduct.sold
        ) +
        " Terjual"
      : ""
  }
`;
```

document.getElementById(
"detailDesc"
).innerHTML =
currentProduct.desc
.map(
function (item) {

```
      return `
        <li>

          <span
            style="color:var(--green)">

            ✓

          </span>

          ${escapeHtml(
            item.text
          )}

        </li>
      `;

    }
  )
  .join("");
```

renderVouchers();

document
.getElementById(
"catalogView"
)
.classList.add(
"hidden"
);

document
.getElementById(
"detailView"
)
.classList.remove(
"hidden"
);

window.scrollTo(
0,
0
);

}

/* =========================================================
VOUCHER
========================================================= */

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
!currentProduct.vouchers.length
) {

```
grid.innerHTML =
  `
    <p
      style="
        color:var(--text-muted);
        font-size:.9rem;
      ">

      Harga belum tersedia.

    </p>
  `;

return;
```

}

grid.innerHTML =
currentProduct.vouchers
.map(
function (
voucher,
index
) {

```
      return `

        <div
          class="voucher-item"
          data-index="${index}"
          onclick="selectVoucher(${index})">

          <div class="duration">

            ${escapeHtml(
              voucher.duration
            )}

          </div>

          <div class="price">

            ${formatRupiah(
              voucher.price
            )}

          </div>

          <div class="reseller">

            HARGA RESELLER

          </div>

        </div>

      `;

    }
  )
  .join("");
```

selectVoucher(0);

}

/* =========================================================
SELECT VOUCHER
========================================================= */

function selectVoucher(
index
) {

if (
!currentProduct ||
!currentProduct.vouchers[index]
) {

```
return;
```

}

selectedVoucher =
currentProduct.vouchers[
index
];

document
.querySelectorAll(
".voucher-item"
)
.forEach(
function (
item,
itemIndex
) {

```
    item.classList.toggle(
      "selected",
      itemIndex === index
    );

  }
);
```

}

/* =========================================================
CREATE PAYMENT
========================================================= */

async function processOrder() {

if (orderProcessing) {
return;
}

if (!currentProduct) {

```
alert(
  "Produk tidak ditemukan."
);

return;
```

}

if (!selectedVoucher) {

```
alert(
  "Pilih nominal voucher dulu!"
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
    API_BASE +
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


const contentType =
  response.headers.get(
    "content-type"
  ) || "";


if (
  !contentType.includes(
    "application/json"
  )
) {

  throw new Error(
    "Backend pembayaran tidak memberikan response JSON."
  );

}


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
  "Create payment error:",
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

/* =========================================================
PAYMENT MODAL
========================================================= */

function showPaymentModal(
payment
) {

const modal =
document.getElementById(
"successModal"
);

const amount =
payment.amount ||
selectedVoucher.price;

const qrUrl =
payment.qr_url ||
"";

const checkoutUrl =
payment.checkout_url ||
"";

const qrString =
payment.qr_string ||
"";

let content =
"";

if (qrUrl) {

```
content =
  `
    <img
      src="${escapeHtml(
        qrUrl
      )}"
      alt="QRIS"
      style="
        width:260px;
        max-width:100%;
        border-radius:12px;
      ">
  `;
```

} else if (qrString) {

```
content =
  `
    <div
      style="
        background:#fff;
        color:#111;
        padding:15px;
        border-radius:10px;
        font-size:12px;
        word-break:break-all;
      ">

      ${escapeHtml(
        qrString
      )}

    </div>
  `;
```

} else {

```
content =
  `
    <p>
      QRIS sedang diproses...
    </p>
  `;
```

}

modal.innerHTML =
` <div class="modal">

```
    <div
      class="success-icon"
      style="font-size:30px;">

      ⌛

    </div>

    <h2>
      Menunggu Pembayaran
    </h2>

    <p>
      Silakan selesaikan pembayaran QRIS.
    </p>

    <div
      style="
        margin:15px 0;
        font-size:1.25rem;
        font-weight:800;
      ">

      ${formatRupiah(
        amount
      )}

    </div>

    <div
      style="
        display:flex;
        justify-content:center;
        margin:15px 0;
      ">

      ${content}

    </div>

    ${
      checkoutUrl

        ? `
          <a
            href="${escapeHtml(
              checkoutUrl
            )}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-primary"
            style="
              display:block;
              text-align:center;
              text-decoration:none;
              margin-bottom:10px;
            ">

            Buka Pembayaran

          </a>
        `

        : ""
    }

    <p
      id="paymentStatusText"
      style="
        color:var(--text-muted);
        font-size:.85rem;
      ">

      Menunggu konfirmasi pembayaran...

    </p>

    <button
      class="btn-primary"
      onclick="cancelPaymentModal()">

      Tutup

    </button>

  </div>
`;
```

modal.classList.add(
"active"
);

}

/* =========================================================
POLLING
========================================================= */

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

/* =========================================================
CHECK PAYMENT
========================================================= */

async function checkPaymentStatus() {

if (!currentTransactionId) {
return;
}

try {

```
const response =
  await fetch(
    API_BASE +
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


const contentType =
  response.headers.get(
    "content-type"
  ) || "";


if (
  !contentType.includes(
    "application/json"
  )
) {

  return;

}


const data =
  await response.json();


if (
  !response.ok ||
  !data.success
) {

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


if (
  [
    "settlement",
    "paid",
    "success",
    "completed"
  ].includes(
    status
  )
) {

  stopPaymentPolling();

  paymentSuccess();

  return;

}


if (
  [
    "expire",
    "expired",
    "cancel",
    "cancelled"
  ].includes(
    status
  )
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
console.warn(
  "Check payment error:",
  error
);
```

}

}

/* =========================================================
PAYMENT SUCCESS
========================================================= */

function paymentSuccess() {

const modal =
document.getElementById(
"successModal"
);

const key =
generateKey();

modal.innerHTML =
` <div class="modal">

```
    <div class="success-icon">
      ✓
    </div>

    <h2>
      Pembayaran Berhasil!
    </h2>

    <p>
      Pembayaran kamu telah dikonfirmasi.
    </p>

    <p style="margin-top:15px;">
      Key kamu:
    </p>

    <div class="key-box">

      <code id="generatedKey">
        ${escapeHtml(key)}
      </code>

      <button
        onclick="copyKey()">

        Salin

      </button>

    </div>

    <p class="key-note">
      Simpan key ini. Jangan bagikan ke orang lain.
    </p>

    <button
      class="btn-primary"
      onclick="closeSuccess()">

      Selesai

    </button>

  </div>
`;
```

modal.classList.add(
"active"
);

}

/* =========================================================
EXPIRED
========================================================= */

function paymentExpired() {

const modal =
document.getElementById(
"successModal"
);

modal.innerHTML =
` <div class="modal">

```
    <div
      class="success-icon"
      style="color:#ef4444;">

      ×

    </div>

    <h2>
      Pembayaran Kedaluwarsa
    </h2>

    <p>
      Pembayaran tidak berhasil diselesaikan.
    </p>

    <button
      class="btn-primary"
      onclick="cancelPaymentModal()">

      Tutup

    </button>

  </div>
`;
```

modal.classList.add(
"active"
);

}

/* =========================================================
CANCEL MODAL
========================================================= */

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

/* =========================================================
GENERATE KEY
========================================================= */

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

/* =========================================================
COPY KEY
========================================================= */

function copyKey() {

const element =
document.getElementById(
"generatedKey"
);

if (!element) {
return;
}

navigator.clipboard
.writeText(
element.textContent.trim()
)
.then(
function () {

```
    const button =
      document.querySelector(
        ".key-box button"
      );


    if (!button) {
      return;
    }


    button.textContent =
      "Tersalin!";


    setTimeout(
      function () {

        button.textContent =
          "Salin";

      },
      2000
    );

  }
)
.catch(
  function () {

    alert(
      "Gagal menyalin key."
    );

  }
);
```

}

/* =========================================================
CLOSE SUCCESS
========================================================= */

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

/* =========================================================
SHOW CATALOG
========================================================= */

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

/* =========================================================
CHECK ORDERS
========================================================= */

function showOrders() {

alert(
"Fitur cek pesanan belum tersedia."
);

}
