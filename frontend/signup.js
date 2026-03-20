// signup.js
const form = document.getElementById('signup-form');
const errorBox = document.getElementById('error-box');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirm').value;
  const role = document.getElementById('role').value;

  // Validation
  if (!name || !email || !password || !confirm || !role) {
    errorBox.style.display = 'flex';
    errorBox.querySelector('#error-text').innerText = 'Please fill all fields';
    return;
  }

  if (password !== confirm) {
    errorBox.style.display = 'flex';
    errorBox.querySelector('#error-text').innerText = 'Passwords do not match';
    return;
  }

  errorBox.style.display = 'none';

  try {
    const res = await fetch('http://localhost:5000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Signup successful! Please login.");
      window.location.href = 'login.html';
    } else {
      errorBox.style.display = 'flex';
      errorBox.querySelector('#error-text').innerText = data.message || data.error;
    }

  } catch (err) {
    console.error(err);
    errorBox.style.display = 'flex';
    errorBox.querySelector('#error-text').innerText = 'Server error. Try again later.';
  }
});