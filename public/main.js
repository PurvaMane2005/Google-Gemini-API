document.getElementById('generate').addEventListener('click', async () => {
    const prompt = document.getElementById('prompt').value;
    const outputDiv = document.getElementById('output');

    outputDiv.textContent = 'Generating...';

    try {
        const response = await fetch(`/generate-content?prompt=${encodeURIComponent(prompt)}`);
        if (response.ok) {
            const text = await response.text();
            outputDiv.textContent = text;
        } else {
            outputDiv.textContent = 'Error: Unable to generate content.';
        }
    } catch (error) {
        outputDiv.textContent = 'Error: Something went wrong.';
    }
});