export function renderProductCatalogSection(root) {
  if (!root) {
    throw new Error('Product catalog root element is missing.');
  }

  root.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
            </span>
            Ürünler
          </h2>
          <p class="card-subtitle">Listeden bir ürüne tıklayarak ekleyin</p>
        </div>
        <div class="search-wrapper">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input id="product-search" type="search" placeholder="Ürün ara..." class="search-input" />
        </div>
      </div>
      <div class="card-body" style="padding-top: 0;">
        <div id="product-list"></div>
      </div>
    </div>
  `;

  return root;
}
