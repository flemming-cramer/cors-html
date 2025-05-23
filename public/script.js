document.addEventListener('DOMContentLoaded', () => {
    const setupElement = document.getElementById('setup');
    const deliveryElement = document.getElementById('delivery');
    const singleJokeElement = document.getElementById('single-joke');
    const newJokeButton = document.getElementById('new-joke');

    // Enable debug logging in the browser
    const debug = {
        log: (msg) => console.log(`[DEBUG] ${msg}`),
        error: (msg) => console.error(`[ERROR] ${msg}`)
    };

    // Fetch implementation
    async function fetchJokeWithFetch() {
        debug.log('Fetching joke using Fetch API');
        try {
            debug.log('Making request to /jokes/random');
            const response = await fetch('/jokes/random');
            const data = await response.json();
            debug.log(`Received joke data: ${JSON.stringify(data)}`);
            return data;
        } catch (error) {
            debug.error(`Fetch error: ${error.message}`);
            throw error;
        }
    }

    // XMLHttpRequest implementation
    function fetchJokeWithXHR() {
        debug.log('Fetching joke using XMLHttpRequest');
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '/jokes/random', true);
            
            xhr.onload = function() {
                debug.log(`XHR status: ${xhr.status}`);
                if (xhr.status === 200) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        debug.log(`XHR received joke data: ${JSON.stringify(data)}`);
                        resolve(data);
                    } catch (error) {
                        debug.error(`XHR parse error: ${error.message}`);
                        reject(error);
                    }
                } else {
                    debug.error(`XHR error status: ${xhr.status}`);
                    reject(new Error(`HTTP error! status: ${xhr.status}`));
                }
            };

            xhr.onerror = function() {
                debug.error('XHR network error occurred');
                reject(new Error('Network error occurred'));
            };

            xhr.ontimeout = function() {
                debug.error('XHR request timed out');
                reject(new Error('Request timed out'));
            };

            xhr.timeout = 5000; // 5 seconds timeout
            debug.log('Sending XHR request');
            xhr.send();
        });
    }

    // Randomly choose between Fetch and XHR
    async function fetchJoke() {
        debug.log('Initiating joke fetch');
        try {
            // Randomly choose between Fetch and XHR
            const useFetch = Math.random() > 0.5;
            debug.log(`Using ${useFetch ? 'Fetch API' : 'XMLHttpRequest'}`);
            
            const data = await (useFetch ? fetchJokeWithFetch() : fetchJokeWithXHR());

            // Clear previous joke
            debug.log('Clearing previous joke content');
            setupElement.textContent = '';
            deliveryElement.textContent = '';
            singleJokeElement.textContent = '';

            if (data.type === 'twopart') {
                debug.log('Displaying two-part joke');
                setupElement.textContent = data.setup;
                deliveryElement.textContent = data.delivery;
            } else {
                debug.log('Displaying single-part joke');
                singleJokeElement.textContent = data.joke;
            }
        } catch (error) {
            debug.error(`Error fetching joke: ${error.message}`);
            singleJokeElement.textContent = 'Error loading joke. Please try again.';
        }
    }

    debug.log('Initializing joke application');
    // Fetch initial joke
    fetchJoke();

    // Add click handler for new joke button
    debug.log('Setting up click handler for new joke button');
    newJokeButton.addEventListener('click', () => {
        debug.log('New joke button clicked');
        fetchJoke();
    });
});