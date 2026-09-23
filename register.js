// Register Page Logic - Connected to Backend (Fixed Version)

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('regPassword');
    const confirmInput = document.getElementById('regConfirmPassword');
    const errorMsg = document.getElementById('passwordError');

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
        err.style.whiteSpace = 'pre-line';

        const group = inputEl.closest('.input-group');
        if (group && group.parentNode) {
            group.insertAdjacentElement('afterend', err);
        } else {
            const checkWrap = inputEl.closest('.form-check');
            if (checkWrap) {
                checkWrap.insertAdjacentElement('afterend', err);
            } else {
                inputEl.insertAdjacentElement('afterend', err);
            }
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

    const _passwordRuleMessage = (password) => {
        const p = (password || '').trim();
        const hasUpper = /[A-Z]/.test(p);
        const hasLower = /[a-z]/.test(p);
        const hasNumber = /\d/.test(p);
        const hasMinLen = p.length >= 8;

        if (hasUpper && hasLower && hasNumber && hasMinLen) return '';

        return (
            'Password must contain:\n' +
            '• Minimum 8 characters\n' +
            '• One uppercase letter\n' +
            '• One lowercase letter\n' +
            '• One number'
        );
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

    const _registerFields = registerForm
        ? {
            firstName: registerForm.querySelector('input[name="first_name"]'),
            lastName: registerForm.querySelector('input[name="last_name"]'),
            mobile: registerForm.querySelector('input[name="mobile_number"]'),
            dob: registerForm.querySelector('input[name="date_of_birth"]'),
            institution: registerForm.querySelector('input[name="institution"]'),
            idProof: registerForm.querySelector('input[name="id_proof"]'),
            email: registerForm.querySelector('input[name="email"]'),
            password: passwordInput,
            confirm: confirmInput,
            proctoringConsent: registerForm.querySelector('input[name="proctoring_consent"]'),
            termsAccepted: registerForm.querySelector('input[name="terms_accepted"]'),
        }
        : null;

    const _validateFileRequired = (inputEl) => {
        if (!inputEl) return true;
        const file = inputEl.files && inputEl.files[0];
        if (!file) {
            _setInvalid(inputEl, 'This field is required');
            return false;
        }
        _setValid(inputEl);
        return true;
    };

    const _validateCheckboxRequired = (inputEl) => {
        if (!inputEl) return true;
        if (!inputEl.checked) {
            _setInvalid(inputEl, 'This field is required');
            return false;
        }
        _setValid(inputEl);
        return true;
    };

    const _validateMobile = () => {
        const mobileEl = _registerFields?.mobile;
        if (!mobileEl) return true;

        const raw = (mobileEl.value || '').trim();
        if (!raw) {
            _setInvalid(mobileEl, 'This field is required');
            return false;
        }
        if (!/^\d{10}$/.test(raw)) {
            _setInvalid(mobileEl, 'Enter a valid 10-digit mobile number');
            return false;
        }
        _setValid(mobileEl);
        return true;
    };

    const _validateRequiredText = (inputEl) => {
        if (!inputEl) return true;
        const v = (inputEl.value || '').trim();
        if (!v) {
            _setInvalid(inputEl, 'This field is required');
            return false;
        }
        _setValid(inputEl);
        return true;
    };

    const _validateName = (inputEl, fieldLabel) => {
        if (!inputEl) return true;
        const v = (inputEl.value || '').trim();
        if (!v) {
            _setInvalid(inputEl, 'This field is required');
            return false;
        }

        if (!/^[A-Za-z]+$/.test(v)) {
            _setInvalid(
                inputEl,
                `${fieldLabel} must contain only letters (A–Z).\nNumbers and symbols are not allowed.`
            );
            return false;
        }

        _setValid(inputEl);
        return true;
    };

    const _validateEmail = () => {
        const emailEl = _registerFields?.email;
        if (!emailEl) return true;

        const v = (emailEl.value || '').trim();
        if (!v) {
            _setInvalid(emailEl, 'This field is required');
            return false;
        }
        if (!_isValidEmail(v)) {
            _setInvalid(emailEl, 'Please enter a valid email address.');
            return false;
        }
        _setValid(emailEl);
        return true;
    };

    const _validatePassword = () => {
        const passEl = _registerFields?.password;
        if (!passEl) return true;

        const v = (passEl.value || '').trim();
        if (!v) {
            _setInvalid(passEl, 'This field is required');
            return false;
        }
        const msg = _passwordRuleMessage(v);
        if (msg) {
            _setInvalid(passEl, msg);
            return false;
        }
        _setValid(passEl);
        return true;
    };

    const _validateConfirmPassword = () => {
        const passEl = _registerFields?.password;
        const confEl = _registerFields?.confirm;
        if (!passEl || !confEl) return true;

        const p = (passEl.value || '').trim();
        const c = (confEl.value || '').trim();

        if (!c) {
            _setInvalid(confEl, 'This field is required');
            return false;
        }
        if (p !== c) {
            _setInvalid(confEl, 'Passwords do not match');
            return false;
        }
        _setValid(confEl);
        return true;
    };

    const startCameraBtn = document.getElementById('startCameraBtn');
    const captureFaceBtn = document.getElementById('captureFaceBtn');
    const video = document.getElementById('regWebcam');
    const canvas = document.getElementById('regCaptureCanvas');
    const faceImageData = document.getElementById('faceImageData');

    let regStream = null;

    if (startCameraBtn && video) {
        startCameraBtn.addEventListener('click', async () => {
            try {
                regStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                video.srcObject = regStream;
            } catch (e) {
                alert('Camera access denied. Webcam capture is required.');
            }
        });
    }

    if (captureFaceBtn && video && canvas && faceImageData) {
        captureFaceBtn.addEventListener('click', () => {
            if (!video.srcObject || video.videoWidth === 0) {
                alert('Start the camera first.');
                return;
            }
            const ctx = canvas.getContext('2d');
            canvas.width = 320;
            canvas.height = 240;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            faceImageData.value = canvas.toDataURL('image/jpeg', 0.8);
            alert('Photo captured successfully.');
        });
    }

    _addPasswordToggle(passwordInput);
    _addPasswordToggle(confirmInput);

    if (_registerFields) {
        _registerFields.firstName?.addEventListener('input', () => _validateName(_registerFields.firstName, 'First name'));
        _registerFields.lastName?.addEventListener('input', () => _validateName(_registerFields.lastName, 'Last name'));
        _registerFields.dob?.addEventListener('input', () => _validateRequiredText(_registerFields.dob));
        _registerFields.institution?.addEventListener('input', () => _validateRequiredText(_registerFields.institution));
        _registerFields.email?.addEventListener('input', _validateEmail);
        _registerFields.mobile?.addEventListener('input', _validateMobile);
        _registerFields.idProof?.addEventListener('change', () => _validateFileRequired(_registerFields.idProof));
        _registerFields.proctoringConsent?.addEventListener('change', () => _validateCheckboxRequired(_registerFields.proctoringConsent));
        _registerFields.termsAccepted?.addEventListener('change', () => _validateCheckboxRequired(_registerFields.termsAccepted));

        _registerFields.password?.addEventListener('input', () => {
            _validatePassword();
            if ((_registerFields.confirm?.value || '').trim()) {
                _validateConfirmPassword();
            }
        });

        _registerFields.confirm?.addEventListener('input', _validateConfirmPassword);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (errorMsg) errorMsg.classList.add('d-none');

            let ok = true;
            ok = _validateName(_registerFields?.firstName, 'First name') && ok;
            ok = _validateName(_registerFields?.lastName, 'Last name') && ok;
            ok = _validateMobile() && ok;
            ok = _validateRequiredText(_registerFields?.dob) && ok;
            ok = _validateRequiredText(_registerFields?.institution) && ok;
            ok = _validateFileRequired(_registerFields?.idProof) && ok;
            ok = _validateEmail() && ok;
            ok = _validatePassword() && ok;
            ok = _validateConfirmPassword() && ok;
            ok = _validateCheckboxRequired(_registerFields?.proctoringConsent) && ok;
            ok = _validateCheckboxRequired(_registerFields?.termsAccepted) && ok;

            if (!ok) {
                const firstInvalid = registerForm.querySelector('.is-invalid');
                firstInvalid?.focus?.();
                return;
            }

            // API Call to Backend (multipart)
            try {
                const formData = new FormData(registerForm);
                const response = await fetch('/register', {
                    method: 'POST',
                    body: formData
                });

                if (response.redirected) {
                    window.location.href = response.url;
                    return;
                }

                // If backend returns JSON in some cases
                let data = null;
                try { data = await response.json(); } catch {}

                if (response.ok) {
                    alert('Registration Successful! Please Login.');
                    window.location.href = '/login';
                } else {
                    alert((data && data.message) || 'Registration failed');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Server error. Is the backend running?');
            }
        });
    }
});