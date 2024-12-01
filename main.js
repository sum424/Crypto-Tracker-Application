const API_BASE_URL = "https://api.coingecko.com/api/v3";
let cryptoData = [];
let comparedCryptos = JSON.parse(localStorage.getItem("comparedCryptos")) || [];
let sortedCryptoData = [];

// fetch crypto data from API
async function fetchCryptoData() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false`
    );
    if (!response.ok) throw new Error("Failed to fetch data");
    cryptoData = await response.json();
    sortedCryptoData = [...cryptoData];
    renderCryptoList();
    renderComparisonSection();
  } catch (error) {
    document.getElementById(
      "cryptoListContainer"
    ).innerHTML = `<p>Error loading data. <button onclick="fetchCryptoData()" class="btn">Retry</button></p>`;
    console.error(error);
  }
}

// currency format
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "CAD" }).format(
    value
  );

//   rendering crypto list
function renderCryptoList() {
  const container = document.getElementById("cryptoListContainer");
  container.innerHTML = sortedCryptoData
    .map(
      (crypto) => `
                <div class="crypto-item ${
                  comparedCryptos.includes(crypto.id) ? "selected" : ""
                }">
                    <div>
                        <img src="${crypto.image}" alt="${crypto.name}">
                        <strong>${
                          crypto.name
                        }</strong> <small>(${crypto.symbol.toUpperCase()})</small>
                    </div>
                    <div>
                        <div>${formatCurrency(crypto.current_price)}</div>
                        <div class="${
                          crypto.price_change_percentage_24h >= 0
                            ? "price-up"
                            : "price-down"
                        }">
                            ${
                              crypto.price_change_percentage_24h > 0 ? "+" : ""
                            }${crypto.price_change_percentage_24h.toFixed(2)}%
                        </div>
                    </div>
                    <button class="btn" aria-label="Compare ${crypto.name}" 
                        onclick="toggleComparison('${crypto.id}')" 
                        ${
                          comparedCryptos.includes(crypto.id) ? "disabled" : ""
                        }>
                        ${
                          comparedCryptos.includes(crypto.id)
                            ? "Added"
                            : "Compare"
                        }
                    </button>
                </div>
            `
    )
    .join("");
}

function renderComparisonSection() {
  const container = document.getElementById("comparisonContainer");
  container.innerHTML = comparedCryptos
    .map((id) => {
      const crypto = cryptoData.find((c) => c.id === id);
      return `
                    <div class="comparison-card">
                        <h3>${crypto.name} (${crypto.symbol.toUpperCase()})</h3>
                        <img src="${crypto.image}" alt="${
        crypto.name
      }" style="width:50px; margin-bottom:10px;">
                        <p>Price: ${formatCurrency(crypto.current_price)}</p>
                        <p class="${
                          crypto.price_change_percentage_24h >= 0
                            ? "price-up"
                            : "price-down"
                        }">
                            ${
                              crypto.price_change_percentage_24h > 0 ? "+" : ""
                            }${crypto.price_change_percentage_24h.toFixed(2)}%
                        </p>
                        <button class="btn" onclick="toggleComparison('${
                          crypto.id
                        }')">Remove</button>
                    </div>
                `;
    })
    .join("");
}

function toggleComparison(id) {
  const index = comparedCryptos.indexOf(id);
  if (index !== -1) {
    comparedCryptos.splice(index, 1);
  } else {
    if (comparedCryptos.length >= 5) {
      alert("You can only compare up to 5 cryptocurrencies.");
      return;
    }
    comparedCryptos.push(id);
  }
  localStorage.setItem("comparedCryptos", JSON.stringify(comparedCryptos));
  renderCryptoList();
  renderComparisonSection();
}

// sorting function
function sortCryptoList() {
  const criteria = document.getElementById("sortCriteria").value;
  sortedCryptoData.sort((a, b) => {
    if (criteria === "name") return a.name.localeCompare(b.name);
    if (criteria === "price") return b.current_price - a.current_price;
    if (criteria === "change")
      return b.price_change_percentage_24h - a.price_change_percentage_24h;
  });
  renderCryptoList();
}

fetchCryptoData();
