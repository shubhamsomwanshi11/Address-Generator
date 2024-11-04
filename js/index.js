let addressData = {};
document.addEventListener("DOMContentLoaded", async () => {
    const generator = document.getElementById('generator').innerHTML;
    try {
        const response = await fetch(`data/${generator}.json`);
        addressData = await response.json();
    } catch (error) {
        console.error("Failed to load address data:", error);
    }
});


// Function to generate random addresses
function generateAddresses(count) {
    const input = document.getElementById('inputRN');
    if (!count) {
        count = input.value;
    }
    if (count === "random") {
        count = Math.floor(Math.random() * 100) + 1;
    } else if (count === "all") {
        count = 100;
    } else if (count < 0) {
        count = 10;
    }

    const addresses = [];

    for (let i = 0; i < count; i++) {
        const streetNumber = getRandomItem(addressData.streetNumbers);
        const streetName = getRandomItem(addressData.streetNames);
        const city = getRandomItem(addressData.cities);
        const state = getRandomItem(addressData.states);
        const zipCode = getRandomItem(addressData.zipCodes);

        const address = `${streetNumber} ${streetName}, ${city}, ${state} ${zipCode}`;
        addresses.push(address);
    }

    input.value = addresses.length || 0;
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
            <div class="card">
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
