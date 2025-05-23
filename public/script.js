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

    async function fetchJoke() {
        debug.log('Fetching new joke');
        try {
            debug.log('Making request to /jokes/random');
            const response = await fetch('/jokes/random');
            const data = await response.json();
            debug.log(`Received joke data: ${JSON.stringify(data)}`);

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