// ==========================================
// 1. URL GOOGLE APPS SCRIPT TERBARU
// ==========================================
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyN2DZuu5rd_RF3BDINu9k0sVhjs2XnZD1AnAboHjZd7ZRetuGon0Z9F9le7wcAWZlK/exec";

// ==========================================
// 2. FUNGSI CEK STATUS PEMBAYARAN
// ==========================================
// Panggil fungsi ini ketika mendapat respon sukses dari API Pembayaran (Tripay/Midtrans)
function checkPaymentStatus(status) {
    if (status === 'paid' || status === 'settlement' || status === 'sukses') {
        // Jika lunas, JANGAN langsung ke paymentSuccess, tapi minta stok dulu ke server
        fetchStockAndCompleteOrder();
    }
}

// ==========================================
// 3. FUNGSI AMBIL STOK DARI GOOGLE SHEET
// ==========================================
function fetchStockAndCompleteOrder() {
    // Tampilkan tulisan loading di layar
    const paymentStatus = document.getElementById("payment-status");
    const paymentKey = document.getElementById("payment-key");
    
    if (paymentStatus) paymentStatus.innerText = "Memproses Key...";
    if (paymentKey) paymentKey.innerText = "Menunggu server mengambil key...";

    // AMBIL DATA DARI HTML WEBSITE BOS
    // Pastikan ID 'product-name' dan 'product-duration' sesuai dengan elemen di HTML bos
    const namaProduk = document.getElementById("product-name") ? document.getElementById("product-name").innerText.trim() : "DRIP APKMOD"; 
    const durasiProduk = document.getElementById("product-duration") ? document.getElementById("product-duration").innerText.trim() : "1 Day";

    // 🚨 POPUP DEBUG 1: Ngecek data apa yang mau dikirim ke Spreadsheet
    alert("🔍 DEBUG (KIRIM DATA):\nProduk yang diminta: " + namaProduk + "\nDurasi yang diminta: " + durasiProduk);

    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
            product: namaProduk,
            duration: durasiProduk
        })
    })
    .then(response => response.json())
    .then(data => {
        // 🚨 POPUP DEBUG 2: Ngecek jawaban dari Spreadsheet
        alert("📥 DEBUG (BALASAN SPREADSHEET):\n" + JSON.stringify(data));

        if (data.success && data.key) {
            // Jika sukses, lempar key aslinya ke layar
            paymentSuccess(data.key);
        } else {
            // Jika gagal (stok habis/nama beda), tampilkan alasan gagalnya
            paymentSuccess(false, data.message || "STOK HABIS");
        }
    })
    .catch(error => {
        // 🚨 POPUP DEBUG 3: Ngecek kalau error jaringan
        alert("❌ DEBUG (ERROR SISTEM):\n" + error);
        console.error('Error fetching stock:', error);
        paymentSuccess(false, "GAGAL KONEK KE SERVER");
    });
}

// ==========================================
// 4. FUNGSI TAMPILAN SUKSES & MUNCULKAN KEY
// ==========================================
function paymentSuccess(realKey = false, errorMessage = "STOK SEDANG HABIS - HUBUNGI ADMIN") {
    // Generate Order ID Random
    const orderIdElement = document.getElementById('order-id');
    if (orderIdElement) {
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        orderIdElement.innerText = "NIEL-" + randomString;
    }

    // Tampilkan Key atau Pesan Error
    const keyElement = document.getElementById('payment-key');
    if (keyElement) {
        if (realKey) {
            keyElement.innerText = realKey;
            keyElement.style.color = "#28a745"; // Warna hijau kalau berhasil
        } else {
            keyElement.innerText = errorMessage;
            keyElement.style.color = "#dc3545"; // Warna merah kalau gagal
        }
    }
}
