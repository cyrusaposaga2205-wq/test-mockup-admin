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
   SIDEBAR VISIBILITY
========================== */

const sidebarToggle = document.getElementById("mobileMenu");

if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
        const isMobile = window.innerWidth <= 900;

        if (isMobile) {
            // On mobile: toggle .sidebar-open class on body
            const isOpen = document.body.classList.toggle("sidebar-open");

            sidebarToggle.setAttribute("aria-expanded", String(isOpen));
            sidebarToggle.setAttribute("aria-label", isOpen ? "Hide sidebar" : "Show sidebar");
            sidebarToggle.title = isOpen ? "Hide sidebar" : "Show sidebar";
        } else {
            // On desktop: toggle .sidebar-hidden class on body
            const isHidden = document.body.classList.toggle("sidebar-hidden");

            sidebarToggle.setAttribute("aria-expanded", String(!isHidden));
            sidebarToggle.setAttribute("aria-label", isHidden ? "Show sidebar" : "Hide sidebar");
            sidebarToggle.title = isHidden ? "Show sidebar" : "Hide sidebar";
        }
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

document.addEventListener("DOMContentLoaded", () => {
    if (window.lucide) {
        window.lucide.createIcons();
    }

    const viewModal = {
        backdrop: document.getElementById("viewModalBackdrop"),
        close: document.getElementById("viewModalClose"),
        closeBtn: document.getElementById("viewModalCloseBtn"),
        editSwitchBtn: document.getElementById("viewModalEditSwitchBtn")
    };

    const editModal = {
        backdrop: document.getElementById("editModalBackdrop"),
        close: document.getElementById("editModalClose"),
        discardBtn: document.getElementById("editModalDiscardBtn"),
        form: document.getElementById("editBookingForm")
    };

    function showToast(message, type = "info") {
        const container = document.getElementById("toastContainer");
        if (!container) return;
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${message}</span>`;
        container.append(toast);
        requestAnimationFrame(() => toast.classList.add("show"));
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /* Modal Toggle Functions */
    function openViewModal(data) {
        if (!viewModal.backdrop) return;
        
        // Populate view fields
        document.getElementById("viewModalBookingId").textContent = `Booking #${data.bookingId || "2026-8671"}`;
        document.getElementById("viewModalPackage").textContent = data.packageName || "Private Oslob Tour";
        document.getElementById("viewModalDeparture").textContent = data.time || "5:00 AM";
        document.getElementById("viewModalGuestName").textContent = data.leadGuest || "Dadas Santos";
        document.getElementById("viewModalGuests").textContent = `${data.guests || "2"} Adults`;
        document.getElementById("viewModalBookingType").textContent = data.type || "Exclusive";
        
        // Hide Tour Status in View Modal for upcoming tours
        const tourStatusGroup = document.getElementById("viewModalTourStatus")?.closest(".detail-group");
        if (tourStatusGroup) {
            tourStatusGroup.style.display = data.isUpcoming ? "none" : "block";
        }

        viewModal.backdrop.hidden = false;
        document.body.classList.add("modal-open");
    }

    function closeViewModal() {
        if (viewModal.backdrop) {
            viewModal.backdrop.hidden = true;
            document.body.classList.remove("modal-open");
        }
    }

    function openEditModal(data) {
        if (!editModal.backdrop) return;

        // Populate edit fields
        document.getElementById("editModalTitle").textContent = "Edit Booking";
        document.getElementById("editModalSubtitle").textContent = data.isUpcoming ? "Upcoming Tours · Staff Dashboard" : "Today's Tours · Staff Dashboard";
        document.getElementById("editModalInfoTag").textContent = `${data.packageName || "Private Oslob Tour"} · ${data.time || "5:00 AM"}`;
        document.getElementById("editModalBookingNumberTag").textContent = `#${data.bookingId || "2026-8671"}`;
        
        document.getElementById("editInfoBookingNum").textContent = `#${data.bookingId || "2026-8671"}`;
        document.getElementById("editInfoBookingType").textContent = data.type || "Exclusive";
        document.getElementById("editInfoPackage").textContent = data.packageName || "Private Oslob Tour";
        document.getElementById("editInfoDeparture").textContent = data.time || "5:00 AM";
        
        document.getElementById("editGuestName").value = data.leadGuest || "Dadas Santos";
        document.getElementById("editGuestCount").value = data.guests || 2;

        // Configure Booking Status options based on whether it is an upcoming tour
        const bookingStatusSelect = document.getElementById("editBookingStatus");
        if (bookingStatusSelect) {
            if (data.isUpcoming) {
                bookingStatusSelect.innerHTML = `
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                `;
            } else {
                bookingStatusSelect.innerHTML = `
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                `;
            }
        }

        // Hide Tour Status in Edit Modal for upcoming tours
        const tourStatusGroup = document.getElementById("editTourStatus")?.closest(".form-group");
        if (tourStatusGroup) {
            tourStatusGroup.style.display = data.isUpcoming ? "none" : "flex";
        }
        
        editModal.backdrop.hidden = false;
        document.body.classList.add("modal-open");
    }

    function closeEditModal() {
        if (editModal.backdrop) {
            editModal.backdrop.hidden = true;
            document.body.classList.remove("modal-open");
        }
    }

    /* Event Listeners for Modals */
    viewModal.close?.addEventListener("click", closeViewModal);
    viewModal.closeBtn?.addEventListener("click", closeViewModal);
    viewModal.editSwitchBtn?.addEventListener("click", () => {
        closeViewModal();
        openEditModal({ isUpcoming: false });
    });

    editModal.close?.addEventListener("click", closeEditModal);
    editModal.discardBtn?.addEventListener("click", closeEditModal);

    editModal.form?.addEventListener("submit", (e) => {
        e.preventDefault();
        closeEditModal();
        showToast("Booking details saved successfully.", "success");
    });

    /* Table Button Handlers */
    document.addEventListener("click", event => {
        const viewBtn = event.target.closest(".view-btn");
        const editBtn = event.target.closest(".edit-btn");

        if (viewBtn) {
            const row = viewBtn.closest("tr");
            const isUpcoming = Boolean(viewBtn.closest("#upcomingToursTable"));
            const data = {
                time: row.querySelectorAll("td")[0]?.textContent?.trim(),
                packageName: row.querySelectorAll("td")[1]?.textContent?.trim(),
                leadGuest: row.querySelectorAll("td")[2]?.textContent?.trim(),
                guests: row.querySelectorAll("td")[3]?.textContent?.trim(),
                type: row.querySelectorAll("td")[4]?.textContent?.trim(),
                bookingId: "2026-8671",
                isUpcoming
            };
            openViewModal(data);
        }

        if (editBtn) {
            const row = editBtn.closest("tr");
            const isUpcoming = Boolean(editBtn.closest("#upcomingToursTable"));
            const data = {
                time: row.querySelectorAll("td")[0]?.textContent?.trim(),
                packageName: row.querySelectorAll("td")[1]?.textContent?.trim(),
                leadGuest: row.querySelectorAll("td")[2]?.textContent?.trim(),
                guests: row.querySelectorAll("td")[3]?.textContent?.trim(),
                type: row.querySelectorAll("td")[4]?.textContent?.trim(),
                bookingId: "2026-8671",
                isUpcoming
            };
            openEditModal(data);
        }
    });

    /* Sidebar Mobile Toggle */
    const sidebarToggle = document.getElementById("mobileMenu");
    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", () => {
            document.body.classList.toggle("sidebar-hidden");
        });
    }
});

const deleteModal = {
        backdrop: document.getElementById("deleteModalBackdrop"),
        close: document.getElementById("deleteModalClose"),
        cancelBtn: document.getElementById("deleteModalCancelBtn"),
        confirmBtn: document.getElementById("deleteModalConfirmBtn")
    };

    let targetRowToDelete = null;

    function openDeleteModal(row) {
        if (!deleteModal.backdrop) return;
        targetRowToDelete = row;
        deleteModal.backdrop.hidden = false;
        document.body.classList.add("modal-open");
    }

    function closeDeleteModal() {
        if (deleteModal.backdrop) {
            deleteModal.backdrop.hidden = true;
            document.body.classList.remove("modal-open");
        }
    }

    deleteModal.close?.addEventListener("click", () => {
        closeDeleteModal();
        targetRowToDelete = null;
    });

    deleteModal.cancelBtn?.addEventListener("click", () => {
        closeDeleteModal();
        targetRowToDelete = null;
    });
    
    deleteModal.confirmBtn?.addEventListener("click", () => {
        if (targetRowToDelete) {
            const rowToRemove = targetRowToDelete;
            closeDeleteModal();
            rowToRemove.remove();
            targetRowToDelete = null;
            showToast("Booking deleted successfully.", "success");
        } else {
            closeDeleteModal();
        }
    });

    /* Table Button Handlers */
    document.addEventListener("click", event => {
        const viewBtn = event.target.closest(".view-btn");
        const editBtn = event.target.closest(".edit-btn");
        const deleteBtn = event.target.closest(".delete-btn");

        if (viewBtn) {
            const row = viewBtn.closest("tr");
            const isUpcoming = Boolean(viewBtn.closest("#upcomingToursTable"));
            const data = {
                time: row.querySelectorAll("td")[0]?.textContent?.trim(),
                packageName: row.querySelectorAll("td")[1]?.textContent?.trim(),
                leadGuest: row.querySelectorAll("td")[2]?.textContent?.trim(),
                guests: row.querySelectorAll("td")[3]?.textContent?.trim(),
                type: row.querySelectorAll("td")[4]?.textContent?.trim(),
                bookingId: "2026-8671",
                isUpcoming
            };
            openViewModal(data);
        }

        if (editBtn) {
            const row = editBtn.closest("tr");
            const isUpcoming = Boolean(editBtn.closest("#upcomingToursTable"));
            const data = {
                time: row.querySelectorAll("td")[0]?.textContent?.trim(),
                packageName: row.querySelectorAll("td")[1]?.textContent?.trim(),
                leadGuest: row.querySelectorAll("td")[2]?.textContent?.trim(),
                guests: row.querySelectorAll("td")[3]?.textContent?.trim(),
                type: row.querySelectorAll("td")[4]?.textContent?.trim(),
                bookingId: "2026-8671",
                isUpcoming
            };
            openEditModal(data);
        }

        if (deleteBtn) {
            const row = deleteBtn.closest("tr");
            openDeleteModal(row);
        }
    });

    //Notification
    const notificationBtn = document.getElementById("notificationButton");
    const notificationDropdown = document.getElementById("notificationDropdown");

    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            notificationDropdown.hidden = !notificationDropdown.hidden;
        });

        document.addEventListener("click", (e) => {
            if (!notificationDropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
                notificationDropdown.hidden = true;
            }
        });
    }

    // Global Search Filter for Dashboard Tables
   // Global Search Filter for Dashboard Tables
    const globalSearch = document.getElementById("globalSearch");

    if (globalSearch) {
        globalSearch.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            const tables = [
                document.getElementById("toursTable"), 
                document.getElementById("upcomingToursTable")
            ];
            
            tables.forEach(table => {
                if (!table) return;
                const dataRows = table.querySelectorAll("tbody tr:not(.empty-row)");
                const emptyRow = table.querySelector("tbody tr.empty-row");
                let visibleCount = 0;

                dataRows.forEach(row => {
                    const rowText = row.textContent.toLowerCase();
                    if (!query || rowText.includes(query)) {
                        row.style.display = "";
                        visibleCount++;
                    } else {
                        row.style.display = "none";
                    }
                });

                if (emptyRow) {
                    emptyRow.hidden = visibleCount > 0;
                }
            });
        });
    }