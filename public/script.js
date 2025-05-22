document.addEventListener('DOMContentLoaded', () => {
    const setupElement = document.getElementById('setup');
    const deliveryElement = document.getElementById('delivery');
    const singleJokeElement = document.getElementById('single-joke');
    const newJokeButton = document.getElementById('new-joke');

    async function fetchJoke() {
        try {
            const response = await fetch('/jokes/random');
            const data = await response.json();

            // Clear previous joke
            setupElement.textContent = '';
            deliveryElement.textContent = '';
            singleJokeElement.textContent = '';

            if (data.type === 'twopart') {
                setupElement.textContent = data.setup;
                deliveryElement.textContent = data.delivery;
            } else {
                singleJokeElement.textContent = data.joke;
            }
        } catch (error) {
            console.error('Error fetching joke:', error);
            singleJokeElement.textContent = 'Error loading joke. Please try again.';
        }
    }

    // Fetch initial joke
    fetchJoke();

    // Add click handler for new joke button
    newJokeButton.addEventListener('click', fetchJoke);
});