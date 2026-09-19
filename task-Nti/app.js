const root = document.documentElement;
const themeBtn = document.getElementById("themeBtn");
const loading = document.querySelector(".loading");
const closse = document.getElementById("closed");
const popout = document.querySelector(".light-container");
const select = document.getElementById("selectCategory");
const sortCategory = document.getElementById("sortCategory");
const Total = document.getElementById("totalAmount");
const searchInput = document.getElementById("searchInput");

let prodect = [];
let cartQuantities = {};
let carts = [];
let sortedData = [];

let currentPage = 1;
let itemsPerPage = 5;

themeBtn.addEventListener("click", () => {
  const isDark = root.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
});
closse.addEventListener("click", () => {
  closedd();
});

function closedd() {
  popout.classList.add("hidden");
}

async function apiData() {
  loading.classList.remove("hidden");
  let response = await fetch(`https://fakestoreapi.com/products`);
  if (response.ok) {
    let data = await response.json();
    prodect = data;
    displayData(prodect);
    loading.classList.add("hidden");
  }
}

select.addEventListener("change", function () {
  let value = select.value;

  let filteredData = prodect.filter((item) => {
    if (value === "all") {
      return true;
    }

    return item.category === value;
  });

  displayData(filteredData);
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();

  const filtered = prodect.filter(
    (item) =>
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query),
  );
  displayData(filtered);
});

sortCategory.addEventListener("change", function () {
  let value = sortCategory.value;

  sortedData = [...prodect];

  if (value === "name") {
    sortedData.sort((a, b) => {
      return a.title.localeCompare(b.title);
    });
  } else if (value === "price") {
    sortedData.sort((a, b) => a.price - b.price);
  } else if (value === "rating") {
    sortedData.sort((a, b) => b.rating.rate - a.rating.rate);
  }

  displayData(sortedData);
});

function displayData(data) {
  let startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage;

  let productsToShow = data.slice(startIndex, endIndex);

  let container = document.getElementById("productGrid");
  container.innerHTML = "";

  for (let i = 0; i < productsToShow.length; i++) {
    let item = productsToShow[i];

    container.innerHTML += `
      <div class="product-card">
        <div class="product-image">
          <img src="${item.image}" alt="${item.title}">
        </div>
        <div class="product-info">
          <div class="product-heading">
            <h3>${item.title}</h3>
            <span>${item.price} EGP</span>
          </div>
          <div class="card-actions">
            <button class="secondary-button" onclick="showdata(${item.id})">View Details</button>
            <button class="primary-button" onclick="addToCart(${item.id})">Add to Cart</button>
          </div>
        </div>
      </div>
    `;
  }

  showPageButtons(data);
}

function showdata(id) {
  popout.classList.remove("hidden");
  loading.classList.remove("hidden");

  let alldata = prodect.find((item) => item.id === id);

  let cartona = `
        <img 
            class="card-img-top rounded-4 w-100" 
            src="${alldata.image}" 
            alt="${alldata.title}"
        >

        <div class="card-body">
            <h4 class="card-title mb-4 text-white">
                ${alldata.title}
            </h4>

            <p class="mb-3">
                ${alldata.description}
            </p>

            <h5 class="mb-3">
                $${alldata.price.toFixed(2)}
            </h5>

            <p class="mb-3">
                ⭐ ${alldata.rating.rate}
                (${alldata.rating.count} reviews)
            </p>

            <span class="badge bg-secondary">
                ${alldata.category}
            </span>
        </div>
    `;

  show.innerHTML = cartona;

  loading.classList.add("hidden");
}

function addToCart(id) {
  let alldata = prodect.find((item) => item.id === id);

  cartQuantities[id] = (cartQuantities[id] || 0) + 1;
  let quantity = cartQuantities[id];

  let addMore = carts.find((item) => item.id === id);
  if (addMore) {
    addMore.quantity = quantity;
  } else {
    carts.push({ ...alldata, quantity });
  }

  displayCart();
}

function displayCart() {
  let cartona = "";
  for (let i = 0; i < carts.length; i++) {
    const item = carts[i];
    cartona += `
        <div class="cart-item mb-2">

          <img src="${item.image}" alt="${item.title}" class="cart-item-img" />

          <div class="cart-item-details">
            <h3>${item.title}</h3>
            <span class="cart-item-category">${item.category}</span>
          </div>

          <div class="cart-item-qty">
            <span id="quantity-${item.id}">${item.quantity}</span>
          </div>

          <div class="cart-item-price">
            <span id="total-${item.id}">${(item.price * item.quantity).toFixed(2)}</span> EGP
          </div>

          <button class="delete-btn" onclick="removeFromCart(${item.id})" aria-label="Remove item">
            🗑
          </button>

        </div>

      `;
  }
  document.getElementById("addcart").innerHTML = cartona;
  calculateTotalAmount();
}

function calculateTotalAmount() {
  let totalAmount = 0;
  for (let i = 0; i < carts.length; i++) {
    totalAmount += carts[i].price * carts[i].quantity;
  }
  Total.innerHTML = `Total: ${totalAmount} EGP`;
}

function removeFromCart(id) {
  if (cartQuantities[id]) {
    delete cartQuantities[id];
  }
  carts = carts.filter((item) => item.id !== id);
  displayCart();
}

function showPageButtons(data) {
  let numberOfPages = Math.ceil(data.length / itemsPerPage);

  let paginationBox = document.getElementById("pagination");
  paginationBox.innerHTML = "";

  if (numberOfPages <= 1) {
    return;
  }

  let prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  prevButton.className = "page-btn";
  prevButton.onclick = function () {
    if (currentPage > 1) {
      currentPage = currentPage - 1;
      displayData(data);
    }
  };
  paginationBox.appendChild(prevButton);

  for (let pageNumber = 1; pageNumber <= numberOfPages; pageNumber++) {
    let pageButton = document.createElement("button");
    pageButton.textContent = pageNumber;
    pageButton.className = "page-btn";

    if (pageNumber === currentPage) {
      pageButton.className = "page-btn active";
    }

    pageButton.onclick = function () {
      currentPage = pageNumber;
      displayData(data);
    };

    paginationBox.appendChild(pageButton);
  }

  let nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.className = "page-btn";
  nextButton.onclick = function () {
    if (currentPage < numberOfPages) {
      currentPage = currentPage + 1;
      displayData(data);
    }
  };
  paginationBox.appendChild(nextButton);
}

displayData(prodect);

apiData();
