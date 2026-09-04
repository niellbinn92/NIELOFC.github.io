/* =========================================================
NIELSTORE
FULL FINAL VERSION

WEBSITE:
GitHub Pages

BACKEND:
Vercel

PAYMENT:
AutoGoPay
========================================================= */

/* =========================================================
BACKEND VERCEL
========================================================= */

const API_BASE =
"https://nielofc-github-io.vercel.app";

/* =========================================================
GOOGLE SHEET
========================================================= */

const SHEET_CSV =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vTAVstHFd3fsdtwy2JxULO--QM2ILEECMZFAUTaBQY5eQ4NQYq3ogkEuqEwPkjDLZuiHbFvrGoyiIlC/pub?output=csv";

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
FALLBACK LOGO
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
DIPAKAI AGAR TOKO TETAP MUNCUL
SAAT GOOGLE SHEET GAGAL
========================================================= */

const FALLBACK_PRODUCTS = [

{
id: 1,

```
name:
  "DRIP CLIENT",

platform:
  "android",

logo:
  "DRIP",

logoColor:
  "#e879f9",

image:
  PRODUCT_IMAGES["DRIP CLIENT"],

rating:
  0,

sold:
  "",

priceFrom:
  0,

desc: [

  {
    icon:
      "✓",

    text:
      "Produk DRIP CLIENT"

  },

  {
    icon:
      "✓",

    text:
      "Harga mengikuti data katalog"

  }

],

vouchers:
  []
```

},

{
id: 2,

```
name:
  "DRIP PROXY",

platform:
  "android",

logo:
  "DRIP",

logoColor:
  "#c084fc",

image:
  PRODUCT_IMAGES["DRIP PROXY"],

rating:
  0,

sold:
  "",

priceFrom:
  0,

desc: [

  {
    icon:
      "✓",

    text:
      "Produk DRIP PROXY"

  },

  {
    icon:
      "✓",

    text:
      "Harga mengikuti data katalog"

  }

],

vouchers:
  []
```

},

{
id: 3,

```
name:
  "HG CHEAT",

platform:
  "android",

logo:
  "HG",

logoColor:
  "#ec4899",

image:
  PRODUCT_IMAGES["HG CHEAT"],

rating:
  0,

sold:
  "",

priceFrom:
  0,

desc: [

  {
    icon:
      "✓",

    text:
      "Produk HG CHEAT"

  },

  {
    icon:
      "✓",

    text:
      "Harga mengikuti data katalog"

  }

],

vouchers:
  []
```

},

{
id: 4,

```
name:
  "HG PROXY",

platform:
  "android",

logo:
  "HG",

logoColor:
  "#f472b6",

image:
  PRODUCT_IMAGES["HG PROXY"],

rating:
  0,

sold:
  "",

priceFrom:
  0,

desc: [

  {
    icon:
      "✓",

    text:
      "Produk HG PROXY"

  },

  {
    icon:
      "✓",

    text:
      "Harga mengikuti data katalog"

  }

],

vouchers:
  []
```

}

];

/* =========================================================
GLOBAL VARIABLES
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
DOCUMENT READY
========================================================= */

document.addEventListener(
"DOMContentLoaded",

function () {

```
/*
 * LANGSUNG RENDER WEBSITE
 */

hideLoading();

renderProducts();


/*
 * GOOGLE SHEET
 * DIPROSES DI BACKGROUND
 */

loadProductsInBackground();
```

}
);

/* =========================================================
HIDE LOADING
========================================================= */

function hideLoading() {

const loading =
document.getElementById(
"loadingScreen"
);

if (!loading) {
return;
}

loading.classList.add(
"hidden"
);

loading.style.display =
"none";

}

/* =========================================================
GOOGLE SHEET BACKGROUND
========================================================= */

async function loadProductsInBackground() {

const controller =
new AbortController();

/*

* Timeout 5 detik.
* Setelah itu dianggap gagal.
  */

const timeout =
setTimeout(
function () {

```
    controller.abort();

  },

  5000

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
      method:
        "GET",

      cache:
        "no-store",

      signal:
        controller.signal

    }

  );


if (!response.ok) {

  throw new Error(

    "Google Sheet HTTP " +
    response.status

  );

}


const text =
  await response.text();


if (!text.trim()) {

  throw new Error(
    "Google Sheet kosong"
  );

}


const rows =
  parseCSV(text);


if (!rows.length) {

  throw new Error(
    "Data Google Sheet tidak ditemukan"
  );

}


const loadedProducts =
  convertRowsToProducts(
    rows
  );


if (!loadedProducts.length) {

  throw new Error(
    "Format produk Google Sheet tidak valid"
  );

}


/*
 * DATA SHEET BERHASIL
 */

products =
  loadedProducts;


renderProducts();


console.log(
  "NIELSTORE: Google Sheet berhasil dimuat."
);
```

} catch (error) {

```
/*
 * JANGAN MATIKAN WEBSITE.
 * Fallback tetap dipakai.
 */

console.warn(
  "NIELSTORE: Google Sheet gagal.",
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
MENDUKUNG KOMMA DI DALAM QUOTE
========================================================= */

function parseCSV(text) {

const rows = [];

let row = [];

let value = "";

let insideQuotes =
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


/*
 * DOUBLE QUOTE
 */

if (
  char === '"' &&
  insideQuotes &&
  next === '"'
) {

  value += '"';

  i++;

  continue;

}


/*
 * QUOTE START / END
 */

if (char === '"') {

  insideQuotes =
    !insideQuotes;

  continue;

}


/*
 * COMMA
 */

if (
  char === "," &&
  !insideQuotes
) {

  row.push(
    value.trim()
  );

  value = "";

  continue;

}


/*
 * NEW LINE
 */

if (
  (
    char === "\n" ||
    char === "\r"
  ) &&
  !insideQuotes
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

        return (
          cell !== ""
        );

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

/*

* LAST ROW
  */

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

```
rows.push(
  row
);
```

}

if (rows.length < 2) {

```
return [];
```

}

/*

* HEADER
  */

const headers =
rows[0].map(
function (header) {

```
    return String(
      header
    )
      .trim()
      .toLowerCase();

  }
);
```

/*

* OBJECT ROW
  */

return rows
.slice(1)
.map(
function (cells) {

```
    const object =
      {};


    headers.forEach(
      function (
        header,
        index
      ) {

        object[header] =
          cells[index] ||
          "";

      }
    );


    return object;

  }
);
```

}

/* =========================================================
CONVERT SHEET TO PRODUCTS
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
  /*
   * NAME
   */

  const name =
    String(
      row.name || ""
    )
      .trim()
      .toUpperCase();


  if (!name) {

    return;

  }


  /*
   * PLATFORM
   */

  const platform =
    String(
      row.platform ||
      "android"
    )
      .trim()
      .toLowerCase();


  /*
   * RATING
   */

  const rating =
    parseFloat(
      row.rating
    ) || 0;


  /*
   * SOLD
   */

  const sold =
    String(
      row.sold || ""
    )
      .trim();


  /*
   * DESCRIPTION
   */

  const descriptionRaw =
    String(
      row.desc || ""
    )
      .trim();


  const description =

    descriptionRaw

      ?

      descriptionRaw
        .split("|")
        .map(
          function (
            item
          ) {

            return {

              icon:
                "✓",

              text:
                item.trim()

            };

          }
        )
        .filter(
          function (
            item
          ) {

            return (
              item.text
            );

          }
        )

      :

      [

        {

          icon:
            "✓",

          text:
            "Produk premium NIELSTORE"

        }

      ];


  /*
   * FIXED COLUMNS
   */

  const fixedColumns = [

    "name",

    "platform",

    "logo",

    "rating",

    "sold",

    "desc"

  ];


  /*
   * VOUCHER
   */

  const vouchers = [];


  Object.keys(row)
    .forEach(
      function (key) {


        /*
         * SKIP FIXED COLUMN
         */

        if (
          fixedColumns.includes(
            key.toLowerCase()
          )
        ) {

          return;

        }


        const rawPrice =
          String(
            row[key] || ""
          )
            .trim();


        /*
         * AMBIL ANGKA
         */

        const cleanPrice =
          rawPrice.replace(
            /\D/g,
            ""
          );


        const price =
          parseInt(
            cleanPrice,
            10
          );


        /*
         * HANYA HARGA VALID
         */

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


  /*
   * SORT VOUCHER
   */

  vouchers.sort(
    function (
      a,
      b
    ) {

      const aNum =
        parseInt(
          a.duration
        ) || 9999;


      const bNum =
        parseInt(
          b.duration
        ) || 9999;


      return (
        aNum -
        bNum
      );

    }
  );


  /*
   * HARGA TERENDAH
   */

  const priceFrom =
    vouchers.length

      ?

      Math.min(
        ...vouchers.map(
          function (
            voucher
          ) {

            return (
              voucher.price
            );

          }
        )
      )

      :

      0;


  /*
   * FALLBACK LOGO
   */

  const fallback =
    LOGO_FALLBACK[name] ||
    {

      logo:
        name.substring(
          0,
          4
        ),

      color:
        "#a855f7"

    };


  /*
   * PUSH PRODUCT
   */

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
      description,

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

```
"Rp " +

Number(
  number
).toLocaleString(
  "id-ID"
)
```

);

}

/* =========================================================
ESCAPE HTML
========================================================= */

function escapeHtml(
value
) {

return String(
value || ""
)

```
.replace(
  /&/g,
  "&amp;"
)

.replace(
  /</g,
  "&lt;"
)

.replace(
  />/g,
  "&gt;"
)

.replace(
  /"/g,
  "&quot;"
)

.replace(
  /'/g,
  "&#039;"
);
```

}

/* =========================================================
RENDER PRODUCTS
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
  ?

  products

  :

  products.filter(
    function (
      product
    ) {

      return (
        product.platform ===
        currentFilter
      );

    }
  );
```

/*

* EMPTY
  */

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

/*

* PRODUCTS
  */

grid.innerHTML =

```
filtered
  .map(
    function (
      product
    ) {


      return `

        <div
          class="product-card"
          onclick="
            openDetail(${product.id});
          ">


          <!-- IMAGE -->

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

                ?

                `

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

                :

                `

                  <div
                    class="logo-text"
                    style="
                      color:${product.logoColor};
                    ">

                    ${escapeHtml(
                      product.logo
                    )}

                  </div>

                `
            }


          </div>



          <!-- BODY -->

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
                  ?

                  " · " +
                  escapeHtml(
                    product.sold
                  ) +
                  " Terjual"

                  :

                  ""
              }

            </div>



            <div class="card-price">

              ${
                product.priceFrom
                  ?
                  "Mulai dari "
                  :
                  ""
              }

              <strong>

                ${
                  product.priceFrom

                    ?

                    formatRupiah(
                      product.priceFrom
                    )

                    :

                    "Cek Produk"
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
.querySelectorAll(
".tab"
)
.forEach(
function (
tab
) {

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
OPEN DETAIL
========================================================= */

function openDetail(
id
) {

currentProduct =
products.find(
function (
product
) {

```
    return (
      product.id ===
      id
    );

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

/*

* IMAGE
  */

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

}

else {

```
image.style.background =
  "linear-gradient(135deg,#1a0a2e,#2d0a3a)";


image.innerHTML =

  `

    <div
      class="logo-text"
      style="
        color:${currentProduct.logoColor};
      ">

      ${escapeHtml(
        currentProduct.logo
      )}

    </div>

  `;
```

}

/*

* NAME
  */

document.getElementById(
"detailName"
).textContent =
currentProduct.name;

/*

* PLATFORM
  */

document.getElementById(
"detailPlatform"
).textContent =
currentProduct.platform
.toUpperCase();

/*

* RATING
  */

document.getElementById(
"detailRating"
).innerHTML =

```
`

  <span class="star">
    ★
  </span>

  ${
    currentProduct.rating
      ?
      currentProduct.rating
      :
      "—"
  }

  ${
    currentProduct.sold
      ?

      " · " +
      escapeHtml(
        currentProduct.sold
      ) +
      " Terjual"

      :

      ""
  }

`;
```

/*

* DESCRIPTION
  */

document.getElementById(
"detailDesc"
).innerHTML =

```
currentProduct.desc
  .map(
    function (
      item
    ) {

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

/*

* VOUCHER
  */

renderVouchers();

/*

* CHANGE VIEW
  */

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
RENDER VOUCHERS
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

```
currentProduct.vouchers
  .map(
    function (
      voucher,
      index
    ) {

      return `

        <div
          class="voucher-item"
          data-index="${index}"
          onclick="
            selectVoucher(${index});
          ">


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

/*

* PILIH VOUCHER PERTAMA
  */

selectVoucher(
0
);

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
      itemIndex ===
      index
    );

  }
);
```

}

/* =========================================================
PROCESS ORDER
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

/*

* CEGAH PRODUK FALLBACK
* TANPA HARGA
  */

if (
!selectedVoucher.price ||
selectedVoucher.price < 1
) {

```
alert(
  "Harga produk belum tersedia. Coba refresh halaman."
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
/*
 * CREATE PAYMENT
 */

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


/*
 * CEK CONTENT TYPE
 */

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

    "Backend Vercel belum memberikan response JSON."

  );

}


/*
 * JSON
 */

const data =
  await response.json();


/*
 * API ERROR
 */

if (
  !response.ok ||
  !data.success
) {

  throw new Error(

    data.message ||
    "Gagal membuat pembayaran."

  );

}


/*
 * PAYMENT DATA
 */

const payment =
  data.data || {};


/*
 * TRANSACTION
 */

currentTransactionId =
  payment.transaction_id;


if (!currentTransactionId) {

  throw new Error(

    "Transaction ID tidak ditemukan."

  );

}


/*
 * SHOW QRIS
 */

showPaymentModal(
  payment
);


/*
 * CHECK STATUS
 */

startPaymentPolling();
```

} catch (error) {

```
console.error(
  "NIELSTORE payment error:",
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
SHOW PAYMENT MODAL
========================================================= */

function showPaymentModal(
payment
) {

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
?
selectedVoucher.price
:
0
);

const qrUrl =
payment.qr_url ||
"";

const qrString =
payment.qr_string ||
"";

const checkoutUrl =
payment.checkout_url ||
"";

let paymentContent =
"";

/*

* QR IMAGE
  */

if (qrUrl) {

```
paymentContent =

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
        display:block;
      ">

  `;
```

}

/*

* QR STRING
  */

else if (qrString) {

```
paymentContent =

  `

    <div
      style="
        padding:15px;
        background:#fff;
        color:#111;
        border-radius:10px;
        font-size:12px;
        word-break:break-all;
        max-width:320px;
      ">

      ${escapeHtml(
        qrString
      )}

    </div>

  `;
```

}

/*

* NO QR
  */

else {

```
paymentContent =

  `

    <div
      style="
        padding:25px;
        color:var(--text-muted);
      ">

      QRIS sedang diproses...

    </div>

  `;
```

}

/*

* MODAL HTML
  */

modal.innerHTML =

```
`

  <div class="modal">


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

      ${paymentContent}

    </div>


    ${
      checkoutUrl

        ?

        `

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

        :

        ""

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
      onclick="
        cancelPaymentModal();
      ">

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
START PAYMENT POLLING
========================================================= */

function startPaymentPolling() {

stopPaymentPolling();

checkPaymentStatus();

paymentCheckTimer =
setInterval(

```
  function () {

    checkPaymentStatus();

  },

  5000

);
```

}

/* =========================================================
STOP POLLING
========================================================= */

function stopPaymentPolling() {

if (
paymentCheckTimer
) {

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


/*
 * CONTENT TYPE
 */

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


/*
 * JSON
 */

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


/*
 * STATUS
 */

const status =
  String(

    payment.transaction_status ||
    payment.status ||
    ""

  )
    .toLowerCase()
    .trim();


console.log(
  "NIELSTORE payment status:",
  status
);


/*
 * SUCCESS
 */

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


/*
 * EXPIRED
 */

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


/*
 * PENDING
 */

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

  "NIELSTORE check payment error:",
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

/*

* KEY
  */

const key =
generateKey();

modal.innerHTML =

```
`

  <div class="modal">


    <div class="success-icon">

      ✓

    </div>


    <h2>

      Pembayaran Berhasil!

    </h2>


    <p>

      Pembayaran kamu telah dikonfirmasi.

    </p>


    <p
      style="margin-top:15px;">

      Key kamu:

    </p>


    <div class="key-box">


      <code
        id="generatedKey">

        ${escapeHtml(
          key
        )}

      </code>


      <button
        onclick="
          copyKey();
        ">

        Salin

      </button>


    </div>


    <p class="key-note">

      Simpan key ini.
      Jangan bagikan ke orang lain.

    </p>


    <button
      class="btn-primary"
      onclick="
        closeSuccess();
      ">

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
PAYMENT EXPIRED
========================================================= */

function paymentExpired() {

const modal =
document.getElementById(
"successModal"
);

modal.innerHTML =

```
`

  <div class="modal">


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
      onclick="
        cancelPaymentModal();
      ">

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
CANCEL PAYMENT MODAL
========================================================= */

function cancelPaymentModal() {

stopPaymentPolling();

currentTransactionId =
null;

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

modal.innerHTML =
"";

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
let group = 0;
group < 4;
group++
) {

```
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


if (
  group < 3
) {

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

const keyElement =
document.getElementById(
"generatedKey"
);

if (!keyElement) {
return;
}

const text =
keyElement.textContent.trim();

/*

* CLIPBOARD MODERN
  */

if (
navigator.clipboard &&
navigator.clipboard.writeText
) {

```
navigator.clipboard
  .writeText(
    text
  )
  .then(
    function () {

      showCopied();

    }
  )
  .catch(
    function () {

      fallbackCopy(
        text
      );

    }
  );


return;
```

}

/*

* FALLBACK
  */

fallbackCopy(
text
);

}

/* =========================================================
FALLBACK COPY
========================================================= */

function fallbackCopy(
text
) {

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

```
document.execCommand(
  "copy"
);


showCopied();
```

} catch (
error
) {

```
alert(
  "Gagal menyalin key."
);
```

}

document.body.removeChild(
textarea
);

}

/* =========================================================
COPIED MESSAGE
========================================================= */

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

setTimeout(
function () {

```
  button.textContent =
    original || "Salin";

},

2000
```

);

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
