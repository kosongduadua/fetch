# Web Page Fetcher

This project is a Node.js command-line application designed to fetch web pages and their assets, saving them locally for offline browsing. The application takes one or more URLs as input, downloads the HTML content along with all linked assets (images, stylesheets, scripts), and updates the HTML to reference the downloaded assets locally.

## Prerequisites

- **Node.js**
- **Docker**

## Code Design

- **Node.js with axios**: We use Node.js for the runtime environment, and `axios` for making HTTP requests to fetch web page contents.
- **Cheerio for DOM parsing**: `cheerio` is used to parse the HTML content, enabling us to manipulate the DOM easily and extract asset links.
- **File System (fs) Module**: Node.js's `fs` module is employed to write the fetched contents and assets to the disk.
- **Concurrent Downloads**: The application fetches multiple URLs in parallel, enhancing efficiency.
- **Error Handling**: Comprehensive error handling ensures the application can gracefully handle and report issues encountered during fetching or writing operations.

## How to Run

### Directly Using Node.js

1. Clone the repository and navigate to the project directory.
2. Install dependencies with `npm install`.
3. Run the script using Node.js:

    ```bash
    node fetch.js <url1> <url2> ...
    ```

### Using Docker

1. Build the Docker image:

    ```bash
    docker build -t fetch:0.0.1 .
    ```

2. Run the Docker container, mounting the current directory to `/app` in the container:

    ```bash
    docker run -it --rm --name fetch -v "$PWD":/app fetch:0.0.1 node fetch.js <url1> <url2> ...
    ```

   This command will execute the application inside a Docker container, and the fetched web pages along with their assets will be saved to the current directory on the host machine.
