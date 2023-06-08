document.getElementById('myButton').addEventListener('click', function() {
    document.getElementById('textDisplay').innerText = 'Hello';
    this.classList.add('red');
});
