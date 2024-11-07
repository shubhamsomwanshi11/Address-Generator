let addressData = {};
let namesData = {};
const checkBoxes = {
    streetNumber: "",
    streetName: "",
    city: "",
    state: "",
    zipCode: "",
    firstName: "",
    lastName: "",
    phone: "",
}

let selectState;
document.addEventListener("DOMContentLoaded", async () => {
    const generator = document.getElementById('generator').innerHTML;
    try {
        const response = await fetch(`data/${generator}.json`);
        addressData = await response.json();
    } catch (error) {
        console.error("Failed to load address data:", error);
    }

    try {
        const response = await fetch(`data/Name.json`);
        namesData = await response.json();
    } catch (error) {
        console.error("Failed to load names data:", error);
    }


    selectedRow = document.querySelector("#reorderTable tr"); // Select first row by default

    // Highlight the first row on page load
    if (selectedRow) {
        selectedRow.classList.add("selected");
    }

    const modal = document.querySelector('.modal');
    document.getElementById('customize').addEventListener('click', () => {
        modal.classList.add('is-active');
    })

    document.getElementById('delete').addEventListener('click', () => {
        modal.classList.remove('is-active');
        generateAddresses(document.getElementById('inputRN').value);
    })

    checkBoxes.streetNumber = document.getElementById('streetNumber');
    checkBoxes.streetName = document.getElementById('streetName');
    checkBoxes.city = document.getElementById('city');
    checkBoxes.state = document.getElementById('state');
    checkBoxes.zipCode = document.getElementById('zipCode');
    checkBoxes.firstName = document.getElementById('firstName');
    checkBoxes.lastName = document.getElementById('lastName');
    checkBoxes.phone = document.getElementById('phone');

    selectState = document.getElementById('selectState');
    selectState.addEventListener("change", generateAddresses);

    Object.values(checkBoxes).forEach(checkBox => {
        checkBox.addEventListener("input", generateAddresses);
    })
});

let selectedRow;
function selectRow(row) {
    if (selectedRow) {
        selectedRow.classList.remove("selected");
    }
    selectedRow = row;
    selectedRow.classList.add("selected");
}

function moveSelectedRowUp() {
    if (selectedRow) {
        const previousRow = selectedRow.previousElementSibling;
        if (previousRow) {
            selectedRow.parentNode.insertBefore(selectedRow, previousRow);
            updateAddress();
        }
    }
}

function moveSelectedRowDown() {
    if (selectedRow) {
        const nextRow = selectedRow.nextElementSibling;
        if (nextRow) {
            selectedRow.parentNode.insertBefore(nextRow, selectedRow);
            updateAddress();
        }
    }
}

function updateAddress() {
    const rows = document.querySelectorAll("#reorderTable tr");
    let addressParts = [];      // For values
    let fieldNames = [];         // For field names

    rows.forEach(row => {
        const cell = row.querySelector("td");
        const value = cell.getAttribute("value");    // Get the value for address
        const fieldName = cell.textContent.trim();   // Get the field name

        addressParts.push(value);
        fieldNames.push(fieldName);
    });

    // Join and display the field names and values in respective elements
    document.getElementById("addressFormat").innerHTML = fieldNames.join(", ");
    document.getElementById("sampleAddress").innerHTML = addressParts.join(", ");
}


// Function to generate random addresses
function generateAddresses(count) {
    // Check if 'count' is an event object and set to default if so
    if (count instanceof Event) {
        count = document.getElementById('inputRN').value || 10; // default to 10
    }

    // Adjust 'count' based on specific conditions
    if (count === "random") {
        count = Math.floor(Math.random() * 100) + 1;
    } else if (count === "all") {
        count = 100;
    } else if (count < 0) {
        count = 10;
    }

    const addresses = [];

    for (let i = 0; i < count; i++) {
        const address = {}; // Initialize as an object

        // Read rows in the table to determine address structure
        const rows = document.querySelectorAll("#reorderTable tr");

        rows.forEach(row => {
            const fieldName = row.cells[0].innerText.trim();
            // Match field names and generate address parts
            switch (fieldName) {
                case "Name":
                    if (checkBoxes.firstName.checked) {
                        address.firstName = getRandomItem(namesData.firstNames);
                    }
                    break;
                case "Surname":
                    if (checkBoxes.lastName.checked) {
                        address.lastName = getRandomItem(namesData.lastNames);
                    }
                    break;
                case "Phone":
                    if (checkBoxes.phone.checked) {
                        address.phone = addressData.countryCode + " " + getRandomPhone();
                    }
                    break;
                case "Street Number":
                    if (checkBoxes.streetNumber.checked) {
                        address.streetNumber = getRandomItem(addressData.streetNumbers);
                    }
                    break;
                case "Street Name":
                    if (checkBoxes.streetName.checked) {
                        address.streetName = getRandomItem(addressData.streetNames);
                    }
                    break;
                case "City":
                    if (checkBoxes.city.checked) {
                        address.city = getRandomItem(addressData.cities);
                    }
                    break;
                case "State":
                    if (checkBoxes.state.checked) {
                        address.state = (selectState.value === 'all')
                            ? getRandomItem(addressData.states)
                            : selectState.value;
                    }
                    break;
                case "Zip Code":
                    if (checkBoxes.zipCode.checked) {
                        address.zipCode = getRandomItem(addressData.zipCodes);
                    }
                    break;
            }
        });

        addresses.push(address); // Add the object to the addresses array
    }

    // Update the input value and render the addresses
    document.getElementById('inputRN').value = addresses.length || 0;
    renderAddresses(addresses);
}



// Helper function to get a random phone number
function getRandomPhone() {
    return Math.floor(1000000000 + Math.random() * 9000000000);
}

// Helper function to get a random item from an array
function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Render Generated Addresses to document
function renderAddresses(addresses) {
    let generatedHTML = "";

    addresses.forEach((address, index) => {
        generatedHTML += `
            <div class="column is-3">
                <div class="card has-background-info-light">
                    <div class="card-content">
                        <div class="has-text-right">
                            <button class="button is-ghost copyButton" onclick="copyAddress(${index})">
                                <svg class="svgicon">
                                    <use href="#iconButton"></use>
                                </svg>
                            </button>
                        </div>
                        <p class="is-size-5">${address.firstName || ''} ${address.lastName || ''}</p>
                        ${address.phone ? `<p class="mt-1">Phone: ${address.phone}</p>` : ''}
                        <p class="mt-1" id="address-${index}">
                            ${address.streetNumber || ''} ${address.streetName || ''}, 
                            ${address.city || ''}, ${address.state || ''} ${address.zipCode || ''}
                        </p>
                    </div>
                </div>
            </div>
        `;
    });

    document.getElementById('addressArea').innerHTML = generatedHTML;
    document.getElementById('generatedCount').innerHTML = addresses.length || 0;
}

function exportPDF() {
    const columnCount = document.getElementById('columnCount').value;
    const container = document.getElementById('addressArea').cloneNode(true);

    // Determine the new class based on the column count
    let newClass;
    switch (columnCount) {
        case '1':
            newClass = 'is-12';
            break;
        case '2':
            newClass = 'is-6';
            break;
        case '3':
            newClass = 'is-4';
            break;
        default:
            newClass = 'is-3';
            break;
    }

    // Update columns with the new class in the cloned container
    const columns = container.querySelectorAll('.column');
    columns.forEach(column => {
        column.classList.remove('is-3', 'is-4', 'is-6', 'is-12'); // Remove any previous column class
        column.classList.add(newClass); // Add the new class based on column count
    });

    // Create a new window for printing
    const printWindow = window.open('', '_blank', `width=${screen.width},height=${screen.height}`);
    printWindow.document.write(`
        <html>
            <head>
                <title>Print Address</title>
                <style>
                    /* Ensure content fits within a single page */
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0; 
                        padding: 0; 
                        height: 100vh;
                        overflow: hidden;
                    }
                    .card {
                        height: fit-content;
                        page-break-inside: avoid; /* Avoid breaking card content between pages */
                    }
                    .svgicon {
                        display: none;
                        height: 0;
                        width: 0;
                    }
                    /* Ensure Bulma's columns system works for print */
                    .columns {
                        display: flex;
                        flex-wrap: wrap;
                    }
                    .column {
                        display: flex;
                        flex: 1;
                    }
                </style>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css">
            </head>
            <body>${container.outerHTML}</body>
        </html>
    `);

    // Print and close the temporary window
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
}

// Function to copy content of a specific address on button click
function copyAddress(index) {
    const addressText = document.getElementById(`address-${index}`).innerText;
    const message = document.getElementById('message');

    navigator.clipboard.writeText(addressText)
        .then(() => {
            message.style.display = 'block';
            setTimeout(() => {
                message.style.display = 'none';
            }, 1000);
        })
        .catch(error => console.error("Failed to copy address:", error));
}


// Function to download all generated addresses as a text file
function downloadAddresses() {
    const filetype = document.getElementById('filetype').value;
    const addressElements = document.querySelectorAll('#addressArea p');
    const addresses = Array.from(addressElements).map(el => el.innerText);
    let fileContent = '';
    let mimeType = 'text/plain';
    let fileExtension = 'txt';

    // Generate file content based on the selected file type
    switch (filetype.toUpperCase()) {
        case 'JSON':
            fileContent = JSON.stringify(addresses, null, 2);
            mimeType = 'application/json';
            fileExtension = 'json';
            break;
        case 'XML':
            fileContent = '<addresses>\n' +
                addresses.map(addr => `  <address>${addr}</address>`).join('\n') +
                '\n</addresses>';
            mimeType = 'application/xml';
            fileExtension = 'xml';
            break;
        case 'CSV':
            fileContent = addresses.join(',\n');
            mimeType = 'text/csv';
            fileExtension = 'csv';
            break;
        case 'TEXT':
        default:
            fileContent = addresses.join('\n');
            mimeType = 'text/plain';
            fileExtension = 'txt';
            break;
    }

    // Create a Blob and download link
    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `generated_addresses.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
