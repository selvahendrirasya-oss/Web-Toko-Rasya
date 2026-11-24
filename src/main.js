// ====== PENGATURAN TOKO (ubah di sini) ======
const NOMOR_WA = "6281234567890"; // format 62..., tanpa + dan spasi
const NAMA_TOKO = "Aurum Pulsa";

const OPERATOR = [
    ["Telkomsel", ["0811", "0812", "0813", "0821", "0822", "0823", "0851", "0852", "0853"]],
    ["Indosat", ["0814", "0815", "0816", "0855", "0856", "0857", "0858"]],
    ["XL", ["0817", "0818", "0819", "0859", "0877", "0878"]],
    ["Axis", ["0831", "0832", "0833", "0838"]],
    ["Tri", ["0895", "0896", "0897", "0898", "0899"]],
    ["Smartfren", ["0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888", "0889"]],
];
const PULSA = [5, 10, 20, 25, 50, 100].map(k => ({
    id: "p" + k, label: `${k}.000`, sub: "Pulsa", price: k * 1000 + (k < 20 ? 1000 : 1500), pop: k === 20,
}));
const DATA = [
    { id: "d1", label: "3 GB", sub: "7 hari", price: 15000 },
    { id: "d2", label: "8 GB", sub: "30 hari", price: 35000 },
    { id: "d3", label: "15 GB", sub: "30 hari", price: 55000, pop: true },
    { id: "d4", label: "30 GB", sub: "30 hari", price: 85000 },
    { id: "d5", label: "50 GB", sub: "30 hari", price: 120000 },
    { id: "d6", label: "100 GB", sub: "30 hari", price: 189000 },
];
// =============================================

const $ = id => document.getElementById(id);
const rp = n => "Rp" + new Intl.NumberFormat("id-ID").format(n);
const waUrl = teks => `https://wa.me/${NOMOR_WA}?text=${encodeURIComponent(teks)}`;
const spasi = d => d.replace(/(\d{4})(?=\d)/g, "$1 ");
const deteksi = d => OPERATOR.find(([, p]) => p.includes(d.slice(0, 4)))?.[0] ?? null;

function normalisasi(v) {
    let d = v.replace(/\D/g, "");
    if (d.startsWith("62")) d = "0" + d.slice(2);
    else if (d.startsWith("8")) d = "0" + d;
    return d;
}

/* ---------- Beranda ---------- */
if ($("hero-nomor")) {
    $("hero-nomor").addEventListener("input", e => {
        const d = normalisasi(e.target.value);
        $("kartu-no").textContent = d ? spasi(d) : "0812 3456 7890";
        $("kartu-op").textContent = deteksi(d) ?? "Terdeteksi otomatis";
    });
    const kartu = $("kartu");
    kartu.addEventListener("pointermove", e => {
        const r = kartu.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        kartu.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    });
    kartu.addEventListener("pointerleave", () => (kartu.style.transform = ""));
    $("unggulan").innerHTML = DATA.filter(i => ["d2", "d3", "d4"].includes(i.id)).map(i =>
        `<a class="tile" href="produk.html#data"><strong>${i.label}</strong><p>Berlaku ${i.sub}</p><em>${rp(i.price)}</em></a>`
    ).join("");
}

/* ---------- Produk ---------- */
if ($("items")) {
    const state = { tab: "pulsa", item: null, nomor: "" };

    const renderItems = () => {
        const list = state.tab === "pulsa" ? PULSA : DATA;
        $("items").innerHTML = list.map(i =>
            `<button type="button" class="${i.pop ? "pop" : ""}" data-id="${i.id}" aria-pressed="${state.item?.id === i.id}">
         <b>${state.tab === "pulsa" ? "Rp" : ""}${i.label}</b><span>${i.sub}</span><em>${rp(i.price)}</em></button>`).join("");
    };

    const update = () => {
        const d = state.nomor, op = deteksi(d), valid = d.length >= 10 && d.length <= 13;
        $("operator").textContent = op ?? "Operator?";
        $("operator").classList.toggle("on", !!op);
        $("msg").textContent = d.length >= 4 && !op ? "Awalan nomor tidak dikenali. Periksa lagi nomormu."
            : d.length > 13 ? "Nomor terlalu panjang." : "";
        $("s-nomor").textContent = d ? spasi(d) : "-";
        $("s-op").textContent = op ?? "-";
        $("s-item").textContent = state.item ? `${state.tab === "pulsa" ? "Pulsa Rp" : ""}${state.item.label}${state.tab === "data" ? " · " + state.item.sub : ""}` : "-";
        $("total").textContent = state.item ? rp(state.item.price) : "Rp0";

        const btn = $("pesan"), siap = valid && op && state.item;
        btn.setAttribute("aria-disabled", siap ? "false" : "true");
        if (siap) {
            btn.href = waUrl(`Halo ${NAMA_TOKO}, saya mau beli ${$("s-item").textContent} untuk nomor ${d} (${op}). Total ${rp(state.item.price)}.`);
            btn.target = "_blank"; btn.rel = "noopener";
        } else btn.removeAttribute("href");
    };

    const pilihTab = tab => {
        state.tab = tab; state.item = null;
        ["pulsa", "data"].forEach(t => $("tab-" + t).setAttribute("aria-selected", t === tab));
        renderItems(); update();
    };

    document.querySelectorAll("[data-tab]").forEach(b => b.addEventListener("click", () => pilihTab(b.dataset.tab)));
    $("nomor").addEventListener("input", e => { state.nomor = normalisasi(e.target.value); update(); });
    $("items").addEventListener("click", e => {
        const b = e.target.closest("button"); if (!b) return;
        state.item = [...PULSA, ...DATA].find(i => i.id === b.dataset.id);
        renderItems(); update();
    });
    pilihTab(location.hash === "#data" ? "data" : "pulsa");
}

/* ---------- Kontak ---------- */
if ($("k-wa")) $("k-wa").href = waUrl(`Halo ${NAMA_TOKO}, saya mau bertanya.`);