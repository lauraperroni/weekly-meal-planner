const mealPlans = {
    breakfast: [],
    lunch: [],
    snack: [],
    dinner: []
};

const conversionRates = {
    "colher de chá": 4,
    "colher de sopa": 10
};

function addItem(meal) {
    const item = document.getElementById(`${meal}-item`).value.trim();
    const quantity = parseFloat(document.getElementById(`${meal}-quantity`).value);
    const unit = document.getElementById(`${meal}-unit`).value;

    if (item && !isNaN(quantity)) {
        mealPlans[meal].push({ item, quantity, unit });
        document.getElementById(`${meal}-list`).innerHTML = renderList(meal);
        document.getElementById(`${meal}-item`).value = '';
        document.getElementById(`${meal}-quantity`).value = '';
    }
}

function renderList(meal) {
    return mealPlans[meal].map((item, index) => `
        <li>
            ${item.quantity} ${item.unit} de ${item.item}
            <button onclick="deleteItem('${meal}', ${index})">Remover</button>
        </li>
    `).join('');
}

function deleteItem(meal, index) {
    mealPlans[meal].splice(index, 1);
    document.getElementById(`${meal}-list`).innerHTML = renderList(meal);
}

function generateShoppingList() {
    const shoppingList = document.getElementById('shopping-list');
    shoppingList.innerHTML = '';

    const allItems = [];

    // Gather all items
    for (const meal in mealPlans) {
        mealPlans[meal].forEach(item => {
            const totalQuantity = calculateTotalQuantity(item.quantity, item.unit);
            allItems.push({ meal, item: item.item, unit: item.unit, quantity: item.quantity, totalQuantity });
        });
    }

    // Prepare table for PDF and display
    const table = document.createElement('table');
    table.classList.add('table');

    // Create table headers
    const headers = ['Refeição', 'Item', 'Quantidade Total'];
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table rows with data
    const tbody = document.createElement('tbody');
    allItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${capitalizeFirstLetter(item.meal)}</td>
            <td>${item.item}</td>
            <td>${item.unit.includes('colher') ? `${item.quantity} ${item.unit}, ${item.totalQuantity}` : item.totalQuantity}</td>`;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    shoppingList.appendChild(table);

    // Add button to download PDF
    const generatePdfButton = document.createElement('button');
    generatePdfButton.textContent = 'Baixar Lista de Compras em PDF';
    generatePdfButton.classList.add('generate-button-pdf');
    generatePdfButton.addEventListener('click', () => {
        downloadPDF(table);
    });
    shoppingList.appendChild(generatePdfButton);
}

function calculateTotalQuantity(quantity, unit) {
    if (unit === 'gramas' || unit === 'ml') {
        return `${quantity * 7} ${unit}`;
    } else if (conversionRates[unit]) {
        return `${quantity * conversionRates[unit] * 7} gramas`;
    } else {
        return `${quantity * 7} ${unit}`; // Keep the original unit for non-convertible items
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function downloadPDF(table) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.autoTable({ html: table });
    doc.save('lista_compras_semanal.pdf');
}
