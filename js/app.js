// 1. DOM Elemanlarını Seçme
const itemForm = document.getElementById('item-form');
const titleInput = document.getElementById('title');
const categoryInput = document.getElementById('category');
const ratingInput = document.getElementById('rating');
const noteInput = document.getElementById('note');
const searchInput = document.getElementById('search-input');
const filterButtons = document.getElementById('filter-buttons');
const catalogGrid = document.getElementById('catalog-grid');
const sortSelect = document.getElementById('sort-select');
const submitBtn = itemForm.querySelector('button[type="submit"]');

// 2. Uygulama Durumu (State)
// Tarayıcı hafızasında kayıtlı veri varsa al, yoksa boş dizi başlat
let items = JSON.parse(localStorage.getItem('kisiselKatalog')) || [];
let activeCategory = 'Tümü';
let searchQuery = '';
let sortBy = 'newest';
let editingId = null; // null ise yeni kayıt, sayı ise düzenleme modundayız

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
      <div class="card-actions">
        <button class="btn-edit" data-id="${item.id}">Düzenle</button>
        <button class="btn-delete" data-id="${item.id}">Sil</button>
      </div>
    `;

    catalogGrid.appendChild(card);
  });
}

// 5. Yeni Kayıt Ekleme veya Mevcut Kaydı Güncelleme
itemForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (editingId !== null) {
    // Düzenleme modu: İlgili ID'ye sahip kaydı bul ve güncelle
    items = items.map((item) =>
      item.id === editingId
        ? {
            ...item,
            title: titleInput.value.trim(),
            category: categoryInput.value,
            rating: Number(ratingInput.value),
            note: noteInput.value.trim(),
          }
        : item
    );
    editingId = null;
    submitBtn.textContent = 'Kataloğa Ekle';
  } else {
    // Yeni kayıt modu
    const newItem = {
      id: Date.now(),
      title: titleInput.value.trim(),
      category: categoryInput.value,
      rating: Number(ratingInput.value),
      note: noteInput.value.trim(),
    };
    items.unshift(newItem);
  }

  saveItems();
  renderItems();
  itemForm.reset();
});

// 6. Kayıt Silme ve Düzenleme (Event Delegation)
catalogGrid.addEventListener('click', (e) => {
  const targetId = Number(e.target.dataset.id);

  // Silme işlemi
  if (e.target.classList.contains('btn-delete')) {
    items = items.filter((item) => item.id !== targetId);
    // Eğer o an düzenlenen kayıt silindiyse formu sıfırla
    if (editingId === targetId) {
      editingId = null;
      submitBtn.textContent = 'Kataloğa Ekle';
      itemForm.reset();
    }
    saveItems();
    renderItems();
  }

  // Düzenleme işlemi
  if (e.target.classList.contains('btn-edit')) {
    const itemToEdit = items.find((item) => item.id === targetId);
    if (!itemToEdit) return;

    // Form alanlarını seçilen kaydın bilgileriyle doldur
    titleInput.value = itemToEdit.title;
    categoryInput.value = itemToEdit.category;
    ratingInput.value = itemToEdit.rating;
    noteInput.value = itemToEdit.note;

    editingId = targetId;
    submitBtn.textContent = 'Değişiklikleri Kaydet';
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Ekranı yukarı, forma kaydır
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

// 9. Sıralama Değişikliği
sortSelect.addEventListener('change', (e) => {
  sortBy = e.target.value;
  renderItems();
});

// Sayfa ilk açıldığında kayıtlı verileri ekrana bas
renderItems(filteredItems);
{ 
// Sıralama işlemi (Orijinal diziyi bozmamak için filtrelenmiş diziyi sıralıyoruz)
if (sortBy === 'rating-desc') {
  filteredItems.sort((a, b) => b.rating - a.rating);
} else if (sortBy === 'rating-asc') {
  filteredItems.sort((a, b) => a.rating - b.rating);
} else {
  // En yeni eklenen en üstte (id olarak Date.now() kullandığımız için büyük olan yenidir)
  filteredItems.sort((a, b) => b.id - a.id);
}
}



