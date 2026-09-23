document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgotPasswordForm');
    const emailEl = document.getElementById('fpEmail');
    const otpEl = document.getElementById('fpOtp');
    const newPwEl = document.getElementById('fpNewPassword');
    const confirmPwEl = document.getElementById('fpConfirmPassword');

    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const resetBtn = document.getElementById('resetPasswordBtn');

    function _setResetEnabled(enabled) {
        if (otpEl) otpEl.disabled = !enabled;
        if (newPwEl) newPwEl.disabled = !enabled;
        if (confirmPwEl) confirmPwEl.disabled = !enabled;
        if (resetBtn) resetBtn.disabled = !enabled;
    }

    _setResetEnabled(false);

    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', async () => {
            const email = (emailEl?.value || '').trim();
            if (!email) {
                alert('Please enter your email.');
                return;
            }

            sendOtpBtn.disabled = true;
            try {
                const res = await fetch('/forgot-password/request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    alert(data.message || 'If the email exists, an OTP has been sent.');
                    _setResetEnabled(true);
                    otpEl?.focus();
                } else {
                    alert(data.message || 'Failed to send OTP. Please try again.');
                    _setResetEnabled(false);
                }
            } catch (err) {
                console.error(err);
                alert('Failed to send OTP. Please try again.');
                _setResetEnabled(false);
            } finally {
                sendOtpBtn.disabled = false;
            }
        });
    }

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = (emailEl?.value || '').trim();
        const otp = (otpEl?.value || '').trim();
        const new_password = (newPwEl?.value || '').trim();
        const confirm = (confirmPwEl?.value || '').trim();

        if (!email || !otp || !new_password || !confirm) {
            alert('Please fill all fields.');
            return;
        }
        if (new_password !== confirm) {
            alert('Passwords do not match.');
            return;
        }
        if (!/^\d{6}$/.test(otp)) {
            alert('OTP must be a 6-digit number.');
            return;
        }

        resetBtn.disabled = true;
        try {
            const res = await fetch('/forgot-password/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, new_password }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                alert('Password updated successfully. You can now login.');
                window.location.href = '/login';
                return;
            }

            alert(data.message || 'Reset failed');
        } catch (err) {
            console.error(err);
            alert('Reset failed. Please try again.');
        } finally {
            resetBtn.disabled = false;
        }
    });
});
