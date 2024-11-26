const apiUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false';
let selectedCryptos = JSON.parse(localStorage.getItem('selectedCryptos')) || [];
let cryptoDataCache = []; // Cache for fetched crypto data

document.addEventListener('DOMContentLoaded', () => {
    fetchCryptoData();
    loadSelectedCryptos(); // Ensure this function is called
    document.getElementById('compare-button').addEventListener('click', displayComparison);
});

function fetchCryptoData() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            cryptoDataCache = data; // Cache the fetched data
            displayCryptos(data);
            // Fetch data every minute
            setTimeout(fetchCryptoData, 60000); 
        });
}

function displayCryptos(data) {
    const cryptoDataContainer = document.getElementById('crypto-data');
    cryptoDataContainer.innerHTML = '';
    data.forEach(crypto => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <input type="checkbox" id="${crypto.id}" ${selectedCryptos.includes(crypto.id) ? 'checked' : ''}>
            <label for="${crypto.id}">${crypto.name} (${crypto.symbol.toUpperCase()})</label>
            <div>Current Price: $${crypto.current_price}</div>
        `;
        cryptoDataContainer.appendChild(card);
    });
}

function displayComparison() {
    const comparisonList = document.getElementById('comparison-list');
    comparisonList.innerHTML = '';
    selectedCryptos = [];
    
    const checkboxes = document.querySelectorAll('#crypto-data input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        selectedCryptos.push(checkbox.id);
        
        const cryptoData = getCryptoDataById(checkbox.id); // Retrieve data by ID

        const comparisonItem = document.createElement('div');
        comparisonItem.innerHTML = `
            <div class="comparison-header">${cryptoData.name} (${cryptoData.symbol.toUpperCase()})</div>
            <div>Current Price: $${cryptoData.current_price}</div>
            <div>Market Cap: $${cryptoData.market_cap.toLocaleString()}</div>
            <div>Price Change (24h): ${cryptoData.price_change_percentage_24h.toFixed(2)}%</div>
            <div>Circulating Supply: ${cryptoData.circulating_supply.toLocaleString()}</div>
            <div>Total Supply: ${cryptoData.total_supply ? cryptoData.total_supply.toLocaleString() : 'N/A'}</div>
        `;
        comparisonList.appendChild(comparisonItem);
    });

    localStorage.setItem('selectedCryptos', JSON.stringify(selectedCryptos));
}

// Helper function to get crypto data by ID
function getCryptoDataById(id) {
    return cryptoDataCache.find(crypto => crypto.id === id);
}

// Load selected cryptocurrencies from local storage
function loadSelectedCryptos() {
    selectedCryptos.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
}