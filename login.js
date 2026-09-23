// Login Page Logic - Connected to Backend

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    const _isValidEmail = (value) => {
        const v = (value || '').trim();
        return v.includes('@') && v.includes('.') && v.indexOf('@') > 0 && v.lastIndexOf('.') > v.indexOf('@') + 1;
    };

    const _ensureErrorEl = (inputEl) => {
        if (!inputEl) return null;
        const existing = inputEl.__validationErrorEl;
        if (existing && existing.isConnected) return existing;

        const err = document.createElement('div');
        err.className = 'form-text text-danger';
        err.style.display = 'none';

        const group = inputEl.closest('.input-group');
        if (group && group.parentNode) {
            group.insertAdjacentElement('afterend', err);
        } else {
            inputEl.insertAdjacentElement('afterend', err);
        }
        inputEl.__validationErrorEl = err;
        return err;
    };

    const _setInvalid = (inputEl, message) => {
        if (!inputEl) return;
        inputEl.classList.add('is-invalid');
        const err = _ensureErrorEl(inputEl);
        if (err) {
            err.textContent = message || '';
            err.style.display = message ? 'block' : 'none';
        }
    };

    const _setValid = (inputEl) => {
        if (!inputEl) return;
        inputEl.classList.remove('is-invalid');
        const err = _ensureErrorEl(inputEl);
        if (err) {
            err.textContent = '';
            err.style.display = 'none';
        }
    };

    const _addPasswordToggle = (inputEl) => {
        if (!inputEl) return;
        const group = inputEl.closest('.input-group');
        if (!group) return;
        if (group.querySelector('[data-toggle="password-visibility"]')) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-outline-secondary border-start-0';
        btn.setAttribute('data-toggle', 'password-visibility');
        btn.setAttribute('aria-label', 'Toggle password visibility');
        btn.innerHTML = '<i class="fa-solid fa-eye"></i>';

        btn.addEventListener('click', () => {
            const isHidden = inputEl.getAttribute('type') === 'password';
            inputEl.setAttribute('type', isHidden ? 'text' : 'password');
            btn.innerHTML = isHidden
                ? '<i class="fa-solid fa-eye-slash"></i>'
                : '<i class="fa-solid fa-eye"></i>';
        });

        group.appendChild(btn);
    };

    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const forgotPasswordPanel = document.getElementById('forgotPasswordPanel');
    const requestOtpBtn = document.getElementById('requestOtpBtn');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    const cancelForgotBtn = document.getElementById('cancelForgotBtn');

    const fpEmail = document.getElementById('fpEmail');
    const fpOtp = document.getElementById('fpOtp');
    const fpNewPassword = document.getElementById('fpNewPassword');

    if (forgotPasswordLink && forgotPasswordPanel) {
        forgotPasswordLink.addEventListener('click', (e) => {
            // Prefer dedicated forgot password page
            // (keep panel code intact as fallback)
            const href = forgotPasswordLink.getAttribute('href') || '';
            if (href && href !== '#') {
                return;
            }
            e.preventDefault();
            window.location.href = '/forgot_password';
        });
    }

    if (cancelForgotBtn && forgotPasswordPanel) {
        cancelForgotBtn.addEventListener('click', () => {
            forgotPasswordPanel.classList.add('d-none');
        });
    }

    if (requestOtpBtn && fpEmail) {
        requestOtpBtn.addEventListener('click', async () => {
            const email = fpEmail.value.trim();
            if (!email) {
                alert('Please enter your email.');
                return;
            }

            try {
                const response = await fetch('/forgot-password/request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await response.json();
                alert(data.message || 'If the email exists, an OTP has been sent.');
            } catch (error) {  
                         console.error('OTP Request Error:', error);
                alert('Failed to send OTP. Please try again.');
            }
        });
    }

    if (resetPasswordBtn && fpEmail && fpOtp && fpNewPassword) {
        resetPasswordBtn.addEventListener('click', async () => {
            const email = fpEmail.value.trim();
            const otp = fpOtp.value.trim();
            const new_password = fpNewPassword.value.trim();

            if (!email || !otp || !new_password) {
                alert('Please fill email, OTP, and new password.');
                return;
            }

            try {
                const response = await fetch('/forgot-password/reset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp, new_password })
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    alert('Password updated successfully. You can now login.');
                    forgotPasswordPanel.classList.add('d-none');
                } else {
                    alert(data.message || 'Reset failed');
                }
            } catch (error) {
                console.error('Reset Error:', error);
                alert('Reset failed. Please try again.');
            }
        });
    }

    if (!loginForm) return;

    const emailEl = document.getElementById('email');
    const passwordEl = document.getElementById('password');
    _addPasswordToggle(passwordEl);

    if (emailEl) {
        emailEl.addEventListener('input', () => {
            const v = emailEl.value.trim();
            if (!v) {
                _setInvalid(emailEl, 'This field is required');
            } else if (!_isValidEmail(v)) {
                _setInvalid(emailEl, 'Please enter a valid email address.');
            } else {
                _setValid(emailEl);
            }
        });
    }

    if (passwordEl) {
        passwordEl.addEventListener('input', () => {
            const v = passwordEl.value.trim();
            if (!v) {
                _setInvalid(passwordEl, 'This field is required');
            } else {
                _setValid(passwordEl);
            }
        });
    }

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = (emailEl?.value || '').trim();
        const password = (passwordEl?.value || '').trim();

        let ok = true;

        if (!email) {
            _setInvalid(emailEl, 'This field is required');
            ok = false;
        } else if (!_isValidEmail(email)) {
            _setInvalid(emailEl, 'Please enter a valid email address.');
            ok = false;
        } else {
            _setValid(emailEl);
        }

        if (!password) {
            _setInvalid(passwordEl, 'This field is required');
            ok = false;
        } else {
            _setValid(passwordEl);
        }

        if (!ok) return;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            let data;
            try {
                data = await response.json();
            } catch {
                throw new Error('Invalid server response (Non-JSON)');
            }

            if (response.ok && data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                alert(`Login Successful! Welcome ${data.user.name}`);

                if (data.redirect) {
                    window.location.href = data.redirect;
                } else {
                    if (data.user.role === 'admin') {
                        window.location.href = '/admin_dashboard.html';
                    } else {
                        window.location.href = '/student_dashboard.html';
                    }
                }
            } else {
                alert(data.message || 'Invalid email or password');
            }
        } catch (error) {
            console.error('Login Error:', error);
            alert('Login failed. Please check backend connection.');
        }
    });
});