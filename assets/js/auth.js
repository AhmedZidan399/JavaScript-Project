// // Auth & cookie helpers
const USERS_KEY = 'ec_users';
const CURRENT_KEY = 'ec_current_email';

function getUsers() {
	return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}
function saveUsers(arr) {
	localStorage.setItem(USERS_KEY, JSON.stringify(arr));
}

function setCookie(name, value, days = 7) {
	const date = new Date();
	date.setTime(date.getTime() + days * 864e5);
	document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
	return null;
}
function eraseCookie(name) {
	document.cookie = `${name}=; Max-Age=-1; path=/`;
}

function currentEmail() {
	return getCookie(CURRENT_KEY) || null;
}
function setCurrentEmail(email) {
	setCookie(CURRENT_KEY, email || '', 7);
}

// // Validation
function validEmail(email) { // /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/
	return /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/.test(email);
}
function validPassword(pass) {
	return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/.test(pass);
}

// // Attach open modal actions
document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('btnSignIn')?.addEventListener('click',
		() => openAuth('signin')
	);
	document.getElementById('btnSignUp')?.addEventListener('click',
		() => openAuth('signup')
	);
});

function openAuth(mode) {
	const title = document.getElementById('authTitle');
	const nameGroup = document.getElementById('nameGroup');
	const confirmGroup = document.getElementById('confirmGroup');
	const form = document.getElementById('authForm');
	form.reset();
	Array.from(form.querySelectorAll('.is-valid,.is-invalid')).forEach(el => {
		el.classList.remove('is-valid', 'is-invalid');
	});

	if (mode === 'signup') {
		title.textContent = 'Sign Up';
		nameGroup.style.display = 'block';
		confirmGroup.style.display = 'block';
		form.dataset.mode = 'signup';
		document.getElementById('authSubmit').textContent = 'Create Account';
	} else {
		title.textContent = 'Sign In';
		nameGroup.style.display = 'none';
		confirmGroup.style.display = 'none';
		form.dataset.mode = 'signin';
		document.getElementById('authSubmit').textContent = 'Sign In';
	}
	new bootstrap.Modal('#authModal').show();
}

document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('authForm');
	if (!form) return;
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const mode = form.dataset.mode || 'signin';
		const name = document.getElementById('nameInput');
		const email = document.getElementById('emailInput');
		const pass = document.getElementById('passInput');
		const confirm = document.getElementById('confirmInput');

		// client-side validation
		if (mode === 'signup') {
			name.classList.toggle('is-invalid', !(name.value && name.value.trim().length >= 3));
		}
		email.classList.toggle('is-invalid', !validEmail(email.value));
		pass.classList.toggle('is-invalid', !validPassword(pass.value));
		if (mode === 'signup') {
			confirm.classList.toggle('is-invalid', confirm.value !== pass.value);
		}
		const invalid = form.querySelector('.is-invalid');
		if (invalid) return;

		const users = getUsers();

		if (mode === 'signup') {
			if (users.some(u => u.email.toLowerCase() === email.value.toLowerCase())) {
				email.classList.add('is-invalid');
				email.nextElementSibling.textContent = 'Email already registered.';
				return;
			}
			users.push({
				name: name.value.trim(),
				email: email.value.trim(),
				pass: pass.value,
			});
			saveUsers(users);
			setCurrentEmail(email.value.trim());
			bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
		} else {
			const u = users.find(u => u.email.toLowerCase() === email.value.toLowerCase() && u.pass === pass.value);
			if (!u) {
				pass.classList.add('is-invalid');
				pass.nextElementSibling.textContent = 'Wrong email or password.';
				return;
			}
			setCurrentEmail(u.email);
			bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
		}
		renderAuthState();
		// Update cart count after login switch (separate carts per user)
		updateCartCount();
	});
});


function logout() {
	const email = currentEmail();
	if (email) {
		let logs = JSON.parse(localStorage.getItem('ec_logout_history') || '[]');
		logs.push({ email, when: Date.now() });
		localStorage.setItem('ec_logout_history', JSON.stringify(logs));
	}
	eraseCookie(CURRENT_KEY);
	location.reload();
	renderAuthState();
}

function renderAuthState() {
	const authArea = document.getElementById('authArea');
	if (!authArea) return;
	const email = currentEmail();

	if (email) {
		const users = getUsers();
		const u = users.find(x => x.email === email);

		authArea.innerHTML = `
			<span class="text-white fw-bold">👤 ${u ? u.name : email}</span>
			<button class="btn btn-danger btn-sm fw-bold" id="logoutBtn">Logout</button>
			<a class="btn btn-outline-light position-relative" href="cart.html">
			🛒
			<span
				id="cartCount"
				class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
				>0</span
			>
		</a>
		`;
		document.getElementById('logoutBtn').addEventListener('click', logout);
	} else {
		authArea.innerHTML = `
			<button class="btn btn-outline-light btn-sm fw-bold" id="btnSignIn">
				Sign In
			</button>
			<button class="btn btn-warning btn-sm fw-bold" id="btnSignUp">
				Sign Up
			</button>
			<a class="btn btn-outline-light position-relative" href="cart.html">
			🛒
			<span
				id="cartCount"
				class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
				>0</span
			>
		</a>
		`;
		document.getElementById('btnSignIn')?.addEventListener('click',
			() => openAuth('signin')
		);
		document.getElementById('btnSignUp')?.addEventListener('click',
			() => openAuth('signup')
		);
	}
}

window.addEventListener('DOMContentLoaded', renderAuthState);
