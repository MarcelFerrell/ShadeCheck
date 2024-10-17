function compareColors() {
    let image1File = document.getElementById('image1').files[0];
    let image1Url = document.getElementById('url1').value;
    let image2File = document.getElementById('image2').files[0];
    let image2Url = document.getElementById('url2').value;

    if (image1File || image1Url) {
        handleImage(image1File, image1Url, 'color-bar1', 'result1', () => {
            if (image2File || image2Url) {
                handleImage(image2File, image2Url, 'color-bar2', 'result2', compareAfterLoad);
            } else {
                alert('Please upload an image or provide a URL for Clothing 2.');
            }
        });
    } else {
        alert('Please upload an image or provide a URL for Clothing 1.');
    }
}

function compareAfterLoad() {
    const color1 = document.getElementById('color-bar1').style.backgroundColor;
    const color2 = document.getElementById('color-bar2').style.backgroundColor;

    console.log("Color 1: ", color1);
    console.log("Color 2: ", color2);

    const rgb1 = parseColor(color1);
    const rgb2 = parseColor(color2);

    console.log("Converted RGB Color 1: ", rgb1);
    console.log("Converted RGB Color 2: ", rgb2);

    if (!rgb1 || !rgb2 || Object.keys(rgb1).length === 0 || Object.keys(rgb2).length === 0) {
        console.error("RGB values are undefined or empty.");
        return;
    }

    const distance = colorDistance(rgb1, rgb2);

    console.log("Color Distance: ", distance);
    displayColorDistance(distance);
}

function handleImage(imageFile, imageUrl, barId, resultId, callback) {
    let img = new Image();
    if (imageFile) {
        let reader = new FileReader();
        reader.onload = function(e) {
            img.src = e.target.result;
            processImage(img, barId, resultId, callback);
        };
        reader.readAsDataURL(imageFile);
    } else if (imageUrl) {
        img.crossOrigin = "Anonymous"; // Handle CORS if the image is hosted elsewhere
        img.src = imageUrl;
        img.onload = function() {
            processImage(img, barId, resultId, callback);
        };
        img.onerror = function() {
            alert('Failed to load image from URL. Please ensure the URL is correct and the image is accessible.');
        };
    }
}

function processImage(img, barId, resultId, callback) {
    img.onload = function() {
        let colorThief = new ColorThief();
        let dominantColor = colorThief.getColor(img);
        let hex = rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2]);

        // Display the color bar
        let colorBar = document.getElementById(barId);
        colorBar.style.backgroundColor = hex;

        // Display the hex code
        let resultDiv = document.getElementById(resultId);
        resultDiv.innerHTML = `Dominant Color: <span>${hex}</span>`;

        if (callback) callback();
    };
}

// Function to parse either hex or RGB strings into RGB values
function parseColor(color) {
    if (color.startsWith("rgb")) {
        // Parse RGB format
        const rgb = color.match(/\d+/g);
        return { r: parseInt(rgb[0]), g: parseInt(rgb[1]), b: parseInt(rgb[2]) };
    } else {
        // Parse hex format
        return hexToRgb(color);
    }
}

// Function to convert RGB to Hex
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// Function to convert hex to RGB
function hexToRgb(hex) {
    if (hex.charAt(0) === '#') {
        hex = hex.slice(1);
    }

    const bigint = parseInt(hex, 16);
    if (isNaN(bigint)) {
        console.error("Invalid hex color format.");
        return null;
    }

    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    return { r, g, b };
}

// Function to calculate Euclidean distance between two colors
function colorDistance(rgb1, rgb2) {
    const rDiff = rgb2.r - rgb1.r;
    const gDiff = rgb2.g - rgb1.g;
    const bDiff = rgb2.b - rgb1.b;
    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

// Function to display color distance result
function displayColorDistance(distance) {
    let distanceResult = document.getElementById('deltaE-result');
    let deltaBar = document.getElementById('delta-bar');

    distanceResult.innerText = `Color Distance: ${distance.toFixed(2)}`;

    // Set the width of the bar based on the color distance
    deltaBar.style.width = `${Math.min(distance, 100)}%`;

    let noticeability = '';
    if (distance < 10) {
        noticeability = 'Colors are almost identical (not noticeable).';
    } else if (distance < 50) {
        noticeability = 'Slight difference, noticeable to trained eyes.';
    } else if (distance < 100) {
        noticeability = 'Noticeable difference to the average person.';
    } else {
        noticeability = 'Significant color difference.';
    }

    let deltaDescription = document.getElementById('delta-description');
    deltaDescription.innerText = noticeability;
}
