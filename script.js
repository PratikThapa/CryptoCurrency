const apiUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false';

let selectedCryptos = JSON.parse(localStorage.getItem('selectedCryptos')) || [];
let cryptoDataCache = []; // Cache for fetched crypto data

document.addEventListener('DOMContentLoaded', () => {
    fetchCryptoData();
    loadSelectedCryptos();
    document.getElementById('compare-button').addEventListener('click', displayComparison);
});

function fetchCryptoData() {
    showLoadingIndicator(); // Show loading before fetch
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            cryptoDataCache = data;
            displayCryptos(data);
        })
        .catch(error => {
            console.error('Error fetching crypto data:', error);
            alert('Failed to fetch cryptocurrency data. Please try again later.');
        })
        .finally(() => {
            hideLoadingIndicator();
            // Fetch data every minute
            setTimeout(fetchCryptoData, 60000);
        });
}

function displayCryptos(data) {
    const cryptoDataContainer = document.getElementById('crypto-data');
    cryptoDataContainer.innerHTML = '';

    const fragment = document.createDocumentFragment();

    data.forEach(crypto => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <input type="checkbox" id="${crypto.id}" ${selectedCryptos.includes(crypto.id) ? 'checked' : ''} 
            ${selectedCryptos.length >= 5 && !selectedCryptos.includes(crypto.id) ? 'disabled' : ''} 
            onclick="limitSelection(this)">
            <label for="${crypto.id}">${crypto.name} (${crypto.symbol.toUpperCase()})</label>
            <div>Current Price: $${crypto.current_price.toFixed(2)}</div>
        `;
        fragment.appendChild(card);
    });

    cryptoDataContainer.appendChild(fragment);
}

function limitSelection(checkbox) {
    const checkboxes = document.querySelectorAll('#crypto-data input[type="checkbox"]');
    if (checkbox.checked) {
        const selectedCount = Array.from(checkboxes).filter(chk => chk.checked).length;
        if (selectedCount > 5) {
            checkbox.checked = false; // Uncheck the last selected checkbox
            showDialog(); // Show the dialog box
        }
    }
}

function displayComparison() {
    const comparisonList = document.getElementById('comparison-list');
    comparisonList.innerHTML = '';
    selectedCryptos = [];

    const checkboxes = document.querySelectorAll('#crypto-data input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        selectedCryptos.push(checkbox.id);
        
        const cryptoData = getCryptoDataById(checkbox.id);
        
        const comparisonItem = document.createElement('div');
        comparisonItem.innerHTML = `
            <div class="comparison-header">${cryptoData.name} (${cryptoData.symbol.toUpperCase()})</div>
            <div>Current Price: $${cryptoData.current_price.toFixed(2)}</div>
            <div>Market Cap: $${cryptoData.market_cap.toLocaleString()}</div>
            <div>Price Change (24h): ${cryptoData.price_change_percentage_24h.toFixed(2)}%</div>
            <div>Circulating Supply: ${cryptoData.circulating_supply.toLocaleString()}</div>
            <div>Total Supply: ${cryptoData.total_supply ? cryptoData.total_supply.toLocaleString() : 'N/A'}</div>
        `;
        comparisonList.appendChild(comparisonItem);
    });

    localStorage.setItem('selectedCryptos', JSON.stringify(selectedCryptos));
}

function getCryptoDataById(id) {
    return cryptoDataCache.find(crypto => crypto.id === id);
}

function loadSelectedCryptos() {
    selectedCryptos.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
}

function showLoadingIndicator() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loading-indicator';
    loadingIndicator.textContent = 'Loading...';
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '50%';
    loadingIndicator.style.left = '50%';
    loadingIndicator.style.transform = 'translate(-50%, -50%)';
    loadingIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    loadingIndicator.style.color = 'white';
    loadingIndicator.style.padding = '20px';
    loadingIndicator.style.borderRadius = '5px';
    document.body.appendChild(loadingIndicator);
}

function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        document.body.removeChild(loadingIndicator);
    }
}

// Dialog functions
function showDialog() {
    document.getElementById('dialog').style.display = 'block';
}

function closeDialog() {
    document.getElementById('dialog').style.display = 'none';
}