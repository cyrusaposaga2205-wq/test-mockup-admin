document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       INIT ICONS
    ========================== */

    const refreshIcons = () => {
        if (window.lucide) window.lucide.createIcons();
    };

    refreshIcons();


    /* =========================
       TOAST HELPER
    ========================== */

    const toastContainer =
        document.getElementById("toastContainer");

    /**
     * Show a floating toast notification.
     * @param {string} message
     * @param {"info"|"success"|"error"|"warning"} type
     * @param {number} duration in ms
     */
    function showToast(message, type = "info", duration = 3000) {

        if (!toastContainer) return;

        const toast = document.createElement("div");
        toast.className = `toast ${type}`;

        const icons = {
            info: "info",
            success: "check-circle-2",
            error: "alert-circle",
            warning: "alert-triangle"
        };

        toast.innerHTML = `
            <i data-lucide="${icons[type] || icons.info}"></i>
            <span></span>
        `;

        toast.querySelector("span").textContent = message;

        toastContainer.appendChild(toast);
        refreshIcons();

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add("show");
        });

        // Auto dismiss
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, duration);

    }


    /* =========================
       CURRENT DATE
    ========================== */

    const currentDate = document.getElementById("currentDate");

    if (currentDate) {
        currentDate.textContent = new Date().toLocaleDateString("en-PH", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    const todayDate = document.getElementById("todayDate");

    if (todayDate) {
        todayDate.textContent = new Date().toLocaleDateString("en-PH", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }


    /* =========================
       ANIMATED STAT COUNTERS
    ========================== */

    const statNumbers = document.querySelectorAll("[data-count]");

    statNumbers.forEach(el => {

        const target = Number(el.dataset.count);
        if (isNaN(target)) return;

        const duration = 900;
        const start = performance.now();

        function update(now) {
            const progress = Math.min((now - start) / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased).toLocaleString();

            if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);

    });


    /* =========================
       SIDEBAR TOGGLE
    ========================== */

    const sidebarToggle = document.getElementById("mobileMenu");

    if (sidebarToggle) {

        sidebarToggle.addEventListener("click", () => {
            const isExpanded = sidebarToggle.getAttribute("aria-expanded") === "true";
            const nextExpanded = !isExpanded;

            sidebarToggle.setAttribute("aria-expanded", String(nextExpanded));
            sidebarToggle.setAttribute("aria-label", nextExpanded ? "Hide sidebar" : "Show sidebar");
            sidebarToggle.title = nextExpanded ? "Hide sidebar" : "Show sidebar";
        });

    }


    /* =========================
       NAV LINKS
    ========================== */

    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach(link => {

        link.addEventListener("click", event => {

            const href = link.getAttribute("href");

            if (!href || href === "#") {
                event.preventDefault();
                showToast("This page is not available yet.", "info");
            }

            navLinks.forEach(item => item.classList.remove("active"));
            link.classList.add("active");

        });

    });


    /* =========================
       GLOBAL SEARCH (multi-table)
    ========================== */

    const searchInput = document.getElementById("globalSearch");

    // Add more selectors here as you build more tables
    const SEARCH_TARGETS = [
        "#bookingsTable tbody tr",
        ".package-row"
    ];

    if (searchInput) {

        searchInput.addEventListener("input", () => {

            const value =
                searchInput.value.toLowerCase().trim();

            SEARCH_TARGETS.forEach(selector => {

                document.querySelectorAll(selector).forEach(el => {

                    const match =
                        el.innerText.toLowerCase().includes(value);

                    el.style.display = match ? "" : "none";

                });

            });

        });

        // Keyboard shortcut: "/" focuses search
        document.addEventListener("keydown", (e) => {

            if (e.key === "/" &&
                document.activeElement.tagName !== "INPUT" &&
                document.activeElement.tagName !== "TEXTAREA") {

                e.preventDefault();
                searchInput.focus();

            }

            // Esc clears search
            if (e.key === "Escape" &&
                document.activeElement === searchInput) {

                searchInput.value = "";
                searchInput.dispatchEvent(new Event("input"));
                searchInput.blur();

            }

        });

    }


    /* =========================
       NOTIFICATIONS
    ========================== */

    document.getElementById("notificationButton")
        ?.addEventListener("click", () => {
            showToast("You have 3 new notifications.", "info");
        });


    /* =========================
       ADD PACKAGE
    ========================== */

    document.getElementById("addPackageButton")
        ?.addEventListener("click", () => {
            showToast("Opening Add Tour Package form...", "info");
            // Later: window.location.href = "tour-packages.html?action=add";
        });


    /* =========================
       QUICK ACTIONS
    ========================== */

    document.querySelectorAll(".quick-action").forEach(button => {

        button.addEventListener("click", () => {

            const action = button.dataset.action;
            const href   = button.dataset.href;

            showToast("Opening: " + action, "info");

            if (href) {
                setTimeout(() => {
                    window.location.href = href;
                }, 400);
            }

        });

    });


    /* =========================
       EDIT PACKAGE
    ========================== */

    document.querySelectorAll(".edit-button").forEach(button => {

        button.addEventListener("click", () => {

            const row =
                button.closest(".package-row");

            const name =
                row?.dataset.package ||
                row?.querySelector(".package-info strong")
                    ?.textContent.trim() ||
                "package";

            showToast("Editing: " + name, "info");

        });

    });


    /* =========================
       LOGOUT
    ========================== */

    document.getElementById("logoutButton")
        ?.addEventListener("click", () => {

            const confirmed =
                confirm("Are you sure you want to logout?");

            if (confirmed) {
                showToast("Logging out...", "success");
                setTimeout(() => {
                    // window.location.href = "login.html";
                }, 800);
            }

        });


    /* =========================
       ADMIN PROFILE
    ========================== */

    const adminProfileButton =
        document.getElementById("adminProfileButton");

    if (adminProfileButton) {

        adminProfileButton.addEventListener("click", () => {

            const isOpen =
                adminProfileButton.getAttribute("aria-expanded") === "true";

            adminProfileButton.setAttribute("aria-expanded", String(!isOpen));

            showToast("Admin profile menu", "info");

        });

    }


    /* =========================
       STAT CARD CLICKS
    ========================== */

    document.querySelectorAll(".stat-card").forEach(card => {

        card.addEventListener("click", () => {
            // Navigation is handled by the <a href="..."> wrapper
        });

    });

});