// login.js
const loginForm = document.getElementById('login-form');
const errorBox = document.getElementById('error-box');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    errorBox.style.display = 'flex';
    errorBox.querySelector('#error-text').innerText = 'Please fill all fields';
    return;
  }

  errorBox.style.display = 'none';

  try {
    const res = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      // Save user info in localStorage or session
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'admin') window.location.href = 'dashboard.html';
      else if (data.user.role === 'officer') window.location.href = 'officer.html';
      else window.location.href = 'citizen.html';

    } else {
      errorBox.style.display = 'flex';
      errorBox.querySelector('#error-text').innerText = data.message;
    }

  } catch (err) {
    console.error(err);
    errorBox.style.display = 'flex';
    errorBox.querySelector('#error-text').innerText = 'Server error. Try again later.';
  }
});