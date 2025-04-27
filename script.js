document.getElementById('fetchBtn').addEventListener('click', () => {
    fetch('/api/hello')
      .then(response => response.json())
      .then(data => {
        document.getElementById('backendData').textContent = data.message;
      })
      .catch(error => {
        console.error('Error fetching backend:', error);
      });
  });
  