document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('a.nav-link');
    const pages = document.querySelectorAll('.page');
    
    // Form Elements
    const orderForm = document.getElementById('order-form');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');

    // Message Elements
    const orderMessageEl = document.getElementById('orderMessage');
    const loginMessageEl = document.getElementById('loginMessage');
    const signupMessageEl = document.getElementById('signupMessage');
    const forgotMessageEl = document.getElementById('forgotMessage');
    const resetMessageEl = document.getElementById('resetMessage');

    // Login/Logout Nav Elements
    const loginNavItem = document.getElementById('login-nav-item');
    const logoutNavItem = document.getElementById('logout-nav-item');
    const logoutLink = document.getElementById('logout-link');
    const loggedInUserSpan = document.getElementById('loggedInUserSpan');

    // ----- Application State -----
    let isUserLoggedIn = false;
    let loggedInUserEmail = null;
    let loginRedirectTarget = null; // To store where user was going before login prompt { page: 'target-id', flavor: 'flavorName' }

    // ----- UI Update based on Login State -----
    function updateLoginSpecificUI() {
        if (isUserLoggedIn) {
            if(loginNavItem) loginNavItem.style.display = 'none';
            if(logoutNavItem) logoutNavItem.style.display = 'list-item'; // Or 'block'
            if(loggedInUserSpan && loggedInUserEmail) {
                loggedInUserSpan.textContent = loggedInUserEmail.split('@')[0]; // Show username part
            }
        } else {
            if(loginNavItem) loginNavItem.style.display = 'list-item';
            if(logoutNavItem) logoutNavItem.style.display = 'none';
            if(loggedInUserSpan) loggedInUserSpan.textContent = 'user'; // Reset
        }
    }

    // ----- Page Navigation -----
    function showPage(targetId, params = {}) {
        const orderFlavourInput = document.getElementById('order-flavour');

        // *** Login Check for Order Page ***
        if (targetId === 'order-page' && !isUserLoggedIn) {
            loginRedirectTarget = { page: 'order-page', flavor: params.flavor || (orderFlavourInput ? orderFlavourInput.value : null) };
            displayMessage(loginMessageEl, 'Please login to place an order.', 'info');
            
            // Manually switch to login page view without calling showPage recursively to avoid loops/stack issues
            pages.forEach(p => p.classList.remove('active-page'));
            document.getElementById('login-page').classList.add('active-page');
            
            document.querySelectorAll('header nav ul li a.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.dataset.target === 'login-page') {
                    link.classList.add('active');
                }
            });
            window.scrollTo(0, 0);
            updateLoginSpecificUI(); // Ensure login nav item is correctly displayed
            return; // Stop further execution for order page this time
        }

        pages.forEach(page => {
            page.classList.remove('active-page');
            if (page.id === targetId) {
                page.classList.add('active-page');
            }
        });
        
        document.querySelectorAll('header nav ul li a.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.target === targetId) {
                // Ensure 'Login' link isn't active if user is logged in (logout is shown instead)
                if (!(isUserLoggedIn && link.dataset.target === 'login-page')) {
                    link.classList.add('active');
                }
            }
        });
        
        window.scrollTo(0, 0);

        // Pre-fill flavor on order page if coming with params
        if (targetId === 'order-page' && params.flavor && orderFlavourInput) {
            orderFlavourInput.value = params.flavor;
        }

        if (targetId !== 'reset-password-page') {
            clearUrlToken();
        }
        updateLoginSpecificUI(); // Call this at the end of showing any page
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.dataset.target;
            if (targetId) {
                showPage(targetId);
            }
        });
    });
    
    // Logout Link Handler
    if(logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            isUserLoggedIn = false;
            loggedInUserEmail = null;
            loginRedirectTarget = null; // Clear any pending redirects
            displayMessage(loginMessageEl, 'You have been successfully logged out.', 'success');
            showPage('login-page'); // Go to login page after logout
            // updateLoginSpecificUI() is called within showPage
        });
    }

    // ----- Initial Page Load Logic (Check for Reset Token & Update UI) -----
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');

    if (tokenFromUrl) {
        showPage('reset-password-page');
        const resetTokenInput = document.getElementById('resetToken');
        if (resetTokenInput) resetTokenInput.value = tokenFromUrl;
    } else {
        showPage('home-page'); // Default page
    }
    updateLoginSpecificUI(); // Initial UI setup
    
    function clearUrlToken() {
        if (window.history.pushState) {
            const newURL = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.pushState({path:newURL},'',newURL);
        }
    }

    // ----- Footer Current Year -----
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // ----- Helper for displaying messages -----
    function displayMessage(element, text, type = 'info') {
        if (!element) return;
        element.textContent = text;
        element.className = 'message'; 
        if (type === 'success') element.classList.add('success');
        else if (type === 'error') element.classList.add('error');
        else element.classList.add('info'); // Default or explicit info
        
        element.style.display = 'block';
        setTimeout(() => {
            if (element.textContent === text) { // Only hide if message hasn't changed
                 element.style.display = 'none';
                 element.textContent = '';
            }
        }, 5000);
    }
    
    // ----- "Order from Flavour Page" buttons -----
    const orderFlavorButtons = document.querySelectorAll('.order-flavor-btn');
    orderFlavorButtons.forEach(button => {
        button.addEventListener('click', function() {
            const flavorName = this.dataset.flavor;
            // showPage will handle login check and redirection if needed
            showPage('order-page', { flavor: flavorName });
        });
    });

    // ----- Form Submissions (Simulated) -----

    // Order Form
    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // No need to check isUserLoggedIn here because showPage would have prevented access
            const name = document.getElementById('order-name').value;
            const flavour = document.getElementById('order-flavour').value;
            const sizePrice = document.getElementById('order-size-price').value;

            if (!name || !flavour || !sizePrice) {
                displayMessage(orderMessageEl, 'Please fill in all required fields.', 'error');
                return;
            }
            displayMessage(orderMessageEl, 'Processing your order...', 'info');
            await new Promise(resolve => setTimeout(resolve, 1500));
            displayMessage(orderMessageEl, `Thank you, ${name}! Your order for ${flavour} (${sizePrice}) has been placed. (Simulated)`, 'success');
            orderForm.reset();
        });
    }

    // Login Form
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value; // Get password for simulation

            displayMessage(loginMessageEl, 'Signing in...', 'info');
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Simulate login success (any non-empty email/password for demo)
            if (email && password && email.includes('@')) {
                isUserLoggedIn = true;
                loggedInUserEmail = email;
                displayMessage(loginMessageEl, `Welcome back, ${loggedInUserEmail.split('@')[0]}!`, 'success');
                loginForm.reset();

                if (loginRedirectTarget) {
                    const targetPage = loginRedirectTarget.page;
                    const targetFlavor = loginRedirectTarget.flavor;
                    loginRedirectTarget = null; // Clear redirect target
                    showPage(targetPage, { flavor: targetFlavor }); // Pass flavor if available
                } else {
                    showPage('home-page'); // Default to home page
                }
                // updateLoginSpecificUI() is called within showPage
            } else {
                displayMessage(loginMessageEl, 'Invalid email or password (simulated).', 'error');
                isUserLoggedIn = false;
                loggedInUserEmail = null;
                updateLoginSpecificUI(); // Reflect failed login attempt
            }
        });
    }

    // Signup Form
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullname = document.getElementById('signup-fullname').value;
            displayMessage(signupMessageEl, 'Creating account...', 'info');
            await new Promise(resolve => setTimeout(resolve, 1500));
            displayMessage(signupMessageEl, `Account created for ${fullname}! Please login. (Simulated)`, 'success');
            signupForm.reset();
            setTimeout(() => showPage('login-page'), 2000);
        });
    }

    // Forgot Password Form
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value;
            displayMessage(forgotMessageEl, 'Sending reset link...', 'info');
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (email.includes('@') && email.length > 5) {
                const simulatedToken = 'simToken-' + Date.now();
                const resetLinkHref = `${window.location.pathname}?token=${simulatedToken}#reset-password-page`; // For full page reload simulation if needed
                
                let messageHTML = `If an account with ${email} exists, a password reset link has been sent. (Simulated)<br/>`;
                messageHTML += `For demo: <a href="#" data-token="${simulatedToken}" class="simulated-reset-nav-link">Click here to reset for ${email}</a>`;
                
                forgotMessageEl.innerHTML = messageHTML;
                forgotMessageEl.className = 'message success';
                forgotMessageEl.style.display = 'block';

                const dynamicLink = forgotMessageEl.querySelector('.simulated-reset-nav-link');
                if(dynamicLink) {
                    dynamicLink.addEventListener('click', function(event) {
                        event.preventDefault();
                        const token = this.dataset.token;
                        if (token) {
                             const resetTokenInput = document.getElementById('resetToken');
                             if (resetTokenInput) resetTokenInput.value = token;
                             showPage('reset-password-page');
                             // Update URL for bookmarking/refresh (optional, for better simulation)
                             if (window.history.pushState) {
                                const newUrl = `${window.location.pathname}?token=${token}#reset-password-page`;
                                window.history.pushState({path:newUrl},'',newUrl);
                             }
                        }
                    });
                }
            } else {
                displayMessage(forgotMessageEl, 'Invalid email format or simulated error.', 'error');
            }
        });
    }

    // Reset Password Form
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const token = document.getElementById('resetToken').value;

            if (newPassword.length < 8) {
                displayMessage(resetMessageEl, 'Password must be at least 8 characters long.', 'error');
                return;
            }
            if (newPassword !== confirmPassword) {
                displayMessage(resetMessageEl, 'Passwords do not match.', 'error');
                return;
            }

            displayMessage(resetMessageEl, 'Resetting password...', 'info');
            await new Promise(resolve => setTimeout(resolve, 1500));
            displayMessage(resetMessageEl, 'Your password has been reset successfully! You can now login.', 'success');
            resetPasswordForm.reset();
            clearUrlToken(); 
            setTimeout(() => showPage('login-page'), 2500);
        });
    }
});
