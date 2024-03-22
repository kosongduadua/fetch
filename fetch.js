const axios = require('axios');
const fs = require('fs').promises;
const cheerio = require('cheerio');
const path = require('path');
const urlLib = require('url');

// Helper function to ensure the directory exists
const ensureDirExists = async (filePath) => {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, {recursive: true});
};

// Function to download and save assets
const downloadAssets = async (html, baseUrl, folderName) => {
    const $ = cheerio.load(html);
    const assetUrls = [];

    $('img, link[rel="stylesheet"], script').each((_, element) => {
        const src = $(element).attr('src') || $(element).attr('href');
        if (src) {
            const assetUrl = urlLib.resolve(baseUrl, src);
            const parsedUrl = urlLib.parse(assetUrl);
            const relativeAssetPath = path.join(parsedUrl.host, parsedUrl.pathname).replace(/\\/g, '/');
            assetUrls.push({absolute: assetUrl, relative: relativeAssetPath});

            // Update the HTML to point to the relative path
            if ($(element).attr('src')) {
                $(element).attr('src', relativeAssetPath);
            } else if ($(element).attr('href')) {
                $(element).attr('href', relativeAssetPath);
            }
        }
    });

    // Download all assets
    for (const {absolute, relative} of assetUrls) {
        try {
            const assetResponse = await axios.get(absolute, {responseType: 'arraybuffer'});
            const assetPath = path.join(folderName, relative);
            await ensureDirExists(assetPath);
            await fs.writeFile(assetPath, assetResponse.data);
        } catch (error) {
            console.error(`Error downloading asset ${absolute}: ${error.message}`);
        }
    }

    return $.html();
};

// Function to fetch and save the content of a URL
const fetchAndSave = async (url) => {
    try {
        const response = await axios.get(url);
        const urlObj = new URL(url);
        const folderName = urlObj.hostname;
        await ensureDirExists(folderName);

        // Count links and images
        const numLinks = countElements(response.data, 'a');
        const numImages = countElements(response.data, 'img');

        // Download assets and update HTML
        const updatedHtml = await downloadAssets(response.data, url, folderName);

        const filePath = path.join(folderName, 'index.html');
        await fs.writeFile(filePath, updatedHtml);
        console.log(`Saved ${url} to ${filePath}`);

        // Print metadata
        console.log(`site: ${urlObj.hostname}`);
        console.log(`num_links: ${numLinks}`);
        console.log(`images: ${numImages}`);
        console.log(`last_fetch: ${new Date().toUTCString()}`);

    } catch (error) {
        console.error(`Error fetching ${url}: ${error.message}`);
    }
};

// Function to count elements using Cheerio
const countElements = (html, selector) => {
    const $ = cheerio.load(html);
    return $(selector).length;
};

// Main function to process all URLs
const main = async () => {
    const urls = process.argv.slice(2).filter(arg => !arg.startsWith('--'));

    if (urls.length === 0) {
        console.log('Usage: node fetch.js [--metadata] <url1> <url2> ...');
        return;
    }

    // Fetch all URLs in parallel
    await Promise.all(urls.map(fetchAndSave));
};

// Start the process
main();
