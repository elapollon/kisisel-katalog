// 1. DOM Elemanlarını Seçme
const itemForm = document.getElementById('item-form');
const titleInput = document.getElementById('title');
const categoryInput = document.getElementById('category');
const ratingInput = document.getElementById('rating');
const noteInput = document.getElementById('note');
const searchInput = document.getElementById('search-input');
const filterButtons = document.getElementById('filter-buttons');
const catalogGrid = document.getElementById('catalog-grid');

// 2. Uygulama Durumu (State)
// Tarayıcı hafızasında kayıtlı veri varsa al, yoksa boş dizi başlat
let items = JSON.parse(localStorage.getItem('kisiselKatalog')) || [];
let activeCategory = 'Tümü';
let searchQuery = '';

// 3. Veriyi localStorage'a Kaydetme
function saveItems() {
  localStorage.setItem('kisiselKatalog', JSON.stringify(items));
}

// 4. Ekranı Çizme (Render) Fonksiyonu
function renderItems() {
  // Önce mevcut kategori ve arama metnine göre diziyi süz
  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === 'Tümü' || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery) ||
      item.note.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  // Ekranı temizle
  catalogGrid.innerHTML = '';

  // Eşleşen kayıt yoksa kullanıcıya bilgi ver
  if (filteredItems.length === 0) {
    catalogGrid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1 / -1; text-align: center;">Henüz gösterilecek bir kayıt yok.</p>';
    return;
  }

  // Her bir kayıt için HTML kartı oluştur
  filteredItems.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'card';

    card.innerHTML = `
      <div class="card-header">
        <span class="card-badge">${item.category}</span>
        <span class="card-rating">★ ${item.rating}/5</span>
      </div>
      <h3 class="card-title">${item.title}</h3>
      <p class="card-note">${item.note || 'Not eklenmemiş.'}</p>
      <button class="btn-delete" data-id="${item.id}">Sil</button>
    `;

    catalogGrid.appendChild(card);
  });
}

// 5. Yeni Kayıt Ekleme (Form Submit)
itemForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Sayfanın yenilenmesini engelle

  const newItem = {
    id: Date.now(), // Her kayıt için benzersiz bir kimlik numarası
    title: titleInput.value.trim(),
    category: categoryInput.value,
    rating: Number(ratingInput.value),
    note: noteInput.value.trim(),
  };

  items.unshift(newItem); // Yeni kaydı listenin en başına ekle
  saveItems();
  renderItems();
  itemForm.reset(); // Form alanlarını temizle
});

// 6. Kayıt Silme (Event Delegation)
catalogGrid.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-delete')) {
    const idToDelete = Number(e.target.dataset.id);
    // Silinecek ID dışındaki tüm kayıtları tut
    items = items.filter((item) => item.id !== idToDelete);
    saveItems();
    renderItems();
  }
});

// 7. Kategori Filtreleme
filterButtons.addEventListener('click', (e) => {
  if (e.target.classList.contains('filter-btn')) {
    // Önceki aktif butonun rengini kaldır, tıklananı aktif yap
    document.querySelector('.filter-btn.active').classList.remove('active');
    e.target.classList.add('active');

    activeCategory = e.target.dataset.category;
    renderItems();
  }
});

// 8. Anlık Arama
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderItems();
});

// Sayfa ilk açıldığında kayıtlı verileri ekrana bas
renderItems();