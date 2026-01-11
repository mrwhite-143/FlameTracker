(function() {
    'use strict';

    const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

    function checkAuth() {
        const session = getSession();
        
        if (!session || isSessionExpired(session)) {
            clearSession();
            window.location.href = 'login.html';
            return false;
        }
        
        return true;
    }

    function getSession() {
        try {
            const sessionData = localStorage.getItem('admin_session');
            return sessionData ? JSON.parse(sessionData) : null;
        } catch (e) {
            return null;
        }
    }

    function isSessionExpired(session) {
        const currentTime = Date.now();
        const sessionAge = currentTime - session.loginTime;
        return sessionAge > SESSION_TIMEOUT;
    }

    function clearSession() {
        localStorage.removeItem('admin_session');
    }

    window.adminLogout = function() {
        if (confirm('Are you sure you want to logout?')) {
            clearSession();
            window.location.href = 'login.html';
        }
    };

    window.getAdminUsername = function() {
        const session = getSession();
        return session ? session.username : null;
    };

    checkAuth();

    window.addEventListener('pageshow', function(event) {
        if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
            checkAuth();
        }
    });

    window.addEventListener('DOMContentLoaded', function() {
        const logoutPlaceholder = document.getElementById('admin-logout-btn');
        if (logoutPlaceholder) {
            logoutPlaceholder.innerHTML = '🚪 Logout';
            logoutPlaceholder.onclick = window.adminLogout;
        }

        const usernamePlaceholder = document.getElementById('admin-username');
        if (usernamePlaceholder) {
            usernamePlaceholder.textContent = getAdminUsername() || 'Admin';
        }
    });

    function refreshSession() {
        const session = getSession();
        if (session) {
            session.loginTime = Date.now();
            localStorage.setItem('admin_session', JSON.stringify(session));
        }
    }

    setInterval(refreshSession, 5 * 60 * 60 * 1000);

    ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
        let lastActivity = Date.now();
        window.addEventListener(event, function() {
            const now = Date.now();
            if (now - lastActivity > 60000) {
                refreshSession();
                lastActivity = now;
            }
        });
    });

})();
