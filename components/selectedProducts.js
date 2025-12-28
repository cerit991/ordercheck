export function renderSelectedProductsSection(root) {
  if (!root) {
    throw new Error('Selected products root element is missing.');
  }

  root.innerHTML = `
    <div class="card-header">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <h2 class="card-title">
          <span class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </span>
          Seçilen Ürünler
        </h2>
        <span class="badge" id="item-count-badge" style="display: none;">
          <span class="badge-count" id="item-count">0</span>
          ürün
        </span>
      </div>
      <div class="header-actions">
        <button id="print-receipt" type="button" disabled class="btn btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3A2.25 2.25 0 0 0 4.5 5.25V9A2.25 2.25 0 0 0 6.75 11.25h10.5A2.25 2.25 0 0 0 19.5 9V5.25A2.25 2.25 0 0 0 17.25 3h-10.5ZM6 8.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0Zm2.25 13.5A2.25 2.25 0 0 1 6 19.5v-6A2.25 2.25 0 0 1 8.25 11.25h7.5A2.25 2.25 0 0 1 18 13.5v6a2.25 2.25 0 0 1-2.25 2.25h-7.5Z" />
          </svg>
          Yazıcı Fişi
        </button>
        <button id="share-whatsapp" type="button" disabled class="btn btn-whatsapp">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" aria-hidden="true">
            <path d="M16 2.667c-7.364 0-13.333 5.97-13.333 13.333 0 2.351.612 4.633 1.778 6.65L2.667 29.333l6.841-1.744c1.95 1.067 4.154 1.63 6.492 1.631h.003c7.363 0 13.333-5.97 13.333-13.333 0-3.562-1.389-6.91-3.909-9.424C22.912 4.056 19.563 2.667 16 2.667Zm0 24.533h-.002c-2.024 0-4.003-.544-5.728-1.574l-.411-.243-4.064 1.037 1.085-3.965-.267-.41a11.308 11.308 0 0 1-1.696-5.94c0-6.249 5.086-11.333 11.333-11.333 3.026 0 5.868 1.18 8.002 3.316 2.135 2.136 3.314 4.977 3.314 8.004 0 6.248-5.085 11.333-11.333 11.333Zm6.197-8.48c-.339-.169-2.008-.99-2.318-1.103-.311-.113-.538-.169-.764.169-.226.339-.876 1.103-1.075 1.33-.198.226-.395.254-.734.085-.339-.169-1.432-.528-2.727-1.683-1.008-.899-1.688-2.009-1.887-2.348-.198-.339-.021-.522.149-.69.153-.152.339-.395.508-.593.169-.198.226-.339.339-.565.113-.226.057-.424-.028-.593-.085-.169-.764-1.84-1.046-2.521-.276-.664-.558-.574-.764-.584-.198-.01-.424-.012-.65-.012s-.593.085-.904.424c-.311.339-1.187 1.16-1.187 2.828 0 1.668 1.216 3.278 1.386 3.507.169.226 2.396 3.664 5.81 5.132.812.35 1.445.56 1.939.716.815.259 1.556.222 2.144.135.654-.097 2.008-.82 2.292-1.612.282-.79.282-1.468.198-1.612-.084-.141-.311-.226-.65-.395Z" fill="currentColor" />
          </svg>
          WhatsApp
        </button>
        <button id="download-pdf" type="button" disabled class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          PDF Önizle
        </button>
        <button id="clear-items" type="button" class="btn btn-danger">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
          Temizle
        </button>
      </div>
    </div>
    <div class="selected-table-wrapper">
      <table class="selected-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Ürün</th>
            <th>Miktar</th>
            <th>Birim</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody id="selected-items">
        </tbody>
      </table>
    </div>
  `;

  return root;
}
