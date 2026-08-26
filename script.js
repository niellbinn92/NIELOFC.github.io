const SHEET_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRkatuDzhZWvyAoFvfWU3w4S7KmlbKJjGOkUy0-vcE3Xt-0D7V-6mMZAw99BVsF7qcGZdhodRAvhcLz/pub?output=csv";
const SITE_PASSWORD = "220230";

const PRODUCT_IMAGES = {
  "DRIP CLIENT": "https://i.ibb.co/fdSbRZws/D59-B08-CC-71-D9-4-CAC-9-A24-68-F271078-F7-B.png",
  "DRIP PROXY": "https://i.ibb.co/fdSbRZws/D59-B08-CC-71-D9-4-CAC-9-A24-68-F271078-F7-B.png",
  "HG CHEAT": "https://i.ibb.co/Gv20LMPL/IMG-7800.png",
  "HG PROXY": "https://i.ibb.co/Gv20LMPL/IMG-7800.png"
};

const LOGO_FALLBACK = {
  "DRIP CLIENT": { logo: "DRIP", color: "#e879f9" },
  "DRIP PROXY": { logo: "DRIP", color: "#c084fc" },
  "HG CHEAT": { logo: "HG", color: "#ec4899" },
  "HG PROXY": { logo: "HG", color: "#f472b6" }
};

let products = [];
let currentProduct = null;
let selectedVoucher = null;
let currentFilter = "all";

function showLoading() {
  var el = document.getElementById("loadingScreen");
  if (el) el.classList.remove("hidden");
}

function hideLoading() {
  var el = document.getElementById("loadingScreen");
  if (el) el.classList.add("hidden");
}

function unlockApp() {
  document.getElementById("lockScreen").classList.add("hidden");
  document.getElementById("mainApp").classList.remove("hidden");
  showLoading();
  loadProducts().finally(function () {
    hideLoading();
  });
}

function checkPassword() {
  var input = document.getElementById("passInput");
  var err = document.getElementById("lockError");
  if (input.value === SITE_PASSWORD) {
    sessionStorage.setItem("niel_auth", "1");
    unlockApp();
  } else {
    err.classList.remove("hidden");
    input.value = "";
    input.focus();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var input = document.getElementById("passInput");
  if (input) {
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") checkPassword();
    });
    input.focus();
  }
  if (sessionStorage.getItem("niel_auth") === "1") {
    unlockApp();
  }
});

function formatRupiah(num) {
  return "Rp " + Number(num).toLocaleString("id-ID");
}

function parseCSV(text) {
  var lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  var headers = lines[0].split(",").map(function (h) {
    return h.trim().replace(/^"|"$/g, "");
  });
  return lines.slice(1).filter(function (l) {
    return l.trim();
  }).map(function (line) {
    var cols = line.split(",").map(function (c) {
      return c.trim().replace(/^"|"$/g, "");
    });
    var obj = {};
    headers.forEach(function (h, i) {
      obj[h] = cols[i] || "";
    });
    return obj;
  });
}

async function loadProducts() {
  try {
    var res = await fetch(SHEET_CSV + "&t=" + Date.now());
    var text = await res.text();
    var rows = parseCSV(text);

    products = rows.map(function (row, idx) {
      var name = (row.name || "").trim().toUpperCase();
      var platform = (row.platform || "android").toLowerCase().trim();
      var rating = parseFloat(row.rating) || 0;
      var sold = row.sold || "";
      var descRaw = row.desc || "";
      var desc = descRaw
        ? descRaw.split("|").map(function (d) {
            return { icon: "✓", text: d.trim() };
          }).filter(function (d) {
            return d.text;
          })
        : [{ icon: "✓", text: "Premium cheat Free Fire" }];

      var fixedCols = ["name", "platform", "logo", "rating", "sold", "desc"];
      var vouchers = [];
      Object.keys(row).forEach(function (key) {
        if (fixedCols.indexOf(key.toLowerCase()) !== -1 || fixedCols.indexOf(key) !== -1) return;
        var price = parseInt(String(row[key]).replace(/\D/g, ""), 10);
        if (price && price > 0) {
          vouchers.push({ duration: key.trim(), price: price, stock: true });
        }
      });

      vouchers.sort(function (a, b) {
        return (parseInt(a.duration) || 99) - (parseInt(b.duration) || 99);
      });
      var priceFrom = vouchers.length ? Math.min.apply(null, vouchers.map(function (v) { return v.price; })) : 0;
      var img = PRODUCT_IMAGES[name] || "";
      var fallback = LOGO_FALLBACK[name] || { logo: name.slice(0, 4), color: "#a855f7" };

      return {
        id: idx + 1,
        name: row.name.trim(),
        platform: platform,
        logo: row.logo || fallback.logo,
        logoColor: fallback.color,
        image: img,
        rating: rating,
        reviews: 0,
        sold: sold,
        priceFrom: priceFrom,
        desc: desc,
        vouchers: vouchers
      };
    });

    renderProducts();
  } catch (err) {
    console.error("Gagal load sheet:", err);
    var grid = document.getElementById("productGrid");
    if (grid) {
      grid.innerHTML =
        '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:3rem;">Gagal memuat data produk. Coba refresh.</p>';
    }
  }
}

function renderProducts() {
  var grid = document.getElementById("productGrid");
  if (!grid) return;
  var filtered = currentFilter === "all"
    ? products
    : products.filter(function (p) { return p.platform === currentFilter; });

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:3rem;">Tidak ada produk untuk filter ini.</p>';
    return;
  }

  grid.innerHTML = filtered.map(function (p) {
    return (
      '<div class="product-card" onclick="openDetail(' + p.id + ')">' +
        '<div class="card-image ' + (p.image ? "has-img" : "") + '" style="' + (p.image ? "" : "background:linear-gradient(135deg,#1a0a2e,#2d0a3a)") + '">' +
          '<span class="platform">' + p.platform.toUpperCase() + "</span>" +
          (p.image
            ? '<img src="' + p.image + '" alt="' + p.name + '" class="card-img">'
            : '<div class="logo-text" style="color:' + p.logoColor + '">' + p.logo + "</div>") +
        "</div>" +
        '<div class="card-body">' +
          '<div class="card-name">' + p.name + "</div>" +
          '<div class="card-stats"><span class="star">★</span> ' + (p.rating || "—") + (p.sold ? " · " + p.sold + " Terjual" : "") + "</div>" +
          '<div class="card-price">Mulai dari <strong>' + (p.priceFrom ? formatRupiah(p.priceFrom) : "—") + "</strong></div>" +
          '<button class="btn-beli" onclick="event.stopPropagation(); openDetail(' + p.id + ')">Beli Sekarang</button>' +
        "</div>" +
      "</div>"
    );
  }).join("");
}

function filterProducts(filter) {
  currentFilter = filter;
  document.querySelectorAll(".tab").forEach(function (t) {
    t.classList.toggle("active", t.dataset.filter === filter);
  });
  renderProducts();
}

function openDetail(id) {
  currentProduct = products.find(function (p) { return p.id === id; });
  if (!currentProduct) return;
  selectedVoucher = null;

  var imgEl = document.getElementById("detailImage");
  if (currentProduct.image) {
    imgEl.style.background = "transparent";
    imgEl.innerHTML = '<img src="' + currentProduct.image + '" alt="' + currentProduct.name + '" class="detail-img">';
  } else {
    imgEl.style.background = "linear-gradient(135deg,#1a0a2e,#2d0a3a)";
    imgEl.innerHTML = '<div class="logo-text" style="color:' + currentProduct.logoColor + '">' + currentProduct.logo + "</div>";
  }

  document.getElementById("detailName").textContent = currentProduct.name;
  document.getElementById("detailPlatform").textContent = currentProduct.platform.toUpperCase();
  document.getElementById("detailRating").innerHTML =
    '<span class="star">★</span> ' + (currentProduct.rating || "—") +
    (currentProduct.sold ? " · " + currentProduct.sold + " Terjual" : "");

  document.getElementById("detailDesc").innerHTML = currentProduct.desc
    .map(function (d) {
      return '<li><span style="color:var(--green)">' + d.icon + "</span> " + d.text + "</li>";
    })
    .join("");

  var voucherGrid = document.getElementById("voucherGrid");
  if (!currentProduct.vouchers.length) {
    voucherGrid.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;">Belum ada harga.</p>';
  } else {
    voucherGrid.innerHTML = currentProduct.vouchers.map(function (v, i) {
      return (
        '<div class="voucher-item ' + (!v.stock ? "out-of-stock" : "") + '" data-index="' + i + '" ' +
        (v.stock ? 'onclick="selectVoucher(' + i + ')"' : "") + ">" +
          '<div class="duration">' + v.duration + "</div>" +
          '<div class="price">' + (v.stock ? formatRupiah(v.price) : "—") + "</div>" +
          (!v.stock
            ? '<div class="stock-label">STOK HABIS</div>'
            : '<div class="reseller">HARGA RESELLER</div>') +
        "</div>"
      );
    }).join("");
    var firstAvailable = currentProduct.vouchers.findIndex(function (v) { return v.stock; });
    if (firstAvailable >= 0) selectVoucher(firstAvailable);
  }

  document.getElementById("catalogView").classList.add("hidden");
  document.getElementById("detailView").classList.remove("hidden");
  window.scrollTo(0, 0);
}

function selectVoucher(index) {
  selectedVoucher = currentProduct.vouchers[index];
  document.querySelectorAll(".voucher-item").forEach(function (el, i) {
    el.classList.toggle("selected", i === index);
  });
}

function processOrder() {
  if (!selectedVoucher) {
    alert("Pilih nominal voucher dulu!");
    return;
  }
  document.getElementById("generatedKey").textContent = generateKey();
  document.getElementById("successModal").classList.add("active");
}

function generateKey() {
  var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var key = "NIEL-";
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) key += chars[Math.floor(Math.random() * chars.length)];
    if (i < 3) key += "-";
  }
  return key;
}

function copyKey() {
  navigator.clipboard.writeText(document.getElementById("generatedKey").textContent).then(function () {
    var btn = document.querySelector(".key-box button");
    btn.textContent = "Tersalin!";
    setTimeout(function () {
      btn.textContent = "Salin";
    }, 2000);
  });
}

function closeSuccess() {
  document.getElementById("successModal").classList.remove("active");
  showCatalog();
}

function showCatalog() {
  document.getElementById("detailView").classList.add("hidden");
  document.getElementById("catalogView").classList.remove("hidden");
  window.scrollTo(0, 0);
}

