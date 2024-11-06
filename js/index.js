let addressData = {};
const checkBoxes = {
    streetNumber: "",
    streetName: "",
    city: "",
    state: "",
    zipCode: ""
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

    selectState = document.getElementById('selectState');
    selectState.addEventListener("change", generateAddresses);

    Object.values(checkBoxes).forEach(checkBox => {
        checkBox.addEventListener("input", generateAddresses);
    })

    setTimeout(() => {
        console.clear();
    }, 1000);
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
        const address = [];

        // Read rows in the table to determine address structure
        const rows = document.querySelectorAll("#reorderTable tr");

        rows.forEach(row => {
            const fieldName = row.cells[0].innerText.trim();

            // Match field names and generate address parts
            switch (fieldName) {
                case "Street Number":
                    if (checkBoxes.streetNumber.checked)
                        address.push(getRandomItem(addressData.streetNumbers));
                    break;
                case "Street Name":
                    if (checkBoxes.streetName.checked)
                        address.push(getRandomItem(addressData.streetNames));
                    break;
                case "City":
                    if (checkBoxes.city.checked)
                        address.push(getRandomItem(addressData.cities));
                    break;
                case "State":
                    if (checkBoxes.state.checked)
                        if (selectState.value == 'all')
                            address.push(getRandomItem(addressData.states));
                        else address.push(selectState.value);
                    break;
                case "Zip Code":
                    if (checkBoxes.zipCode.checked)
                        address.push(getRandomItem(addressData.zipCodes));
                    break;
            }
        });

        addresses.push(address.join(', '));
    }

    // Update the input value and render the addresses
    document.getElementById('inputRN').value = addresses.length || 0;
    renderAddresses(addresses);
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
                    <p class="mt-1" id="address-${index}">${address}</p>
                </div>
                </div>
            </div>`;
    });
    document.getElementById('addressArea').innerHTML = generatedHTML;
    document.getElementById('generatedCount').innerHTML = addresses.length || 0;
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
