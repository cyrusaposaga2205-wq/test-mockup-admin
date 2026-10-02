document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       INIT
    ========================== */

    const refreshIcons = () => {
        if (window.lucide) window.lucide.createIcons();
    };

    refreshIcons();


    /* =========================
       TOAST
    ========================== */

    const toastContainer = document.getElementById("toastContainer");

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

        toast.innerHTML = `<i data-lucide="${icons[type] || icons.info}"></i><span></span>`;
        toast.querySelector("span").textContent = message;

        toastContainer.appendChild(toast);
        refreshIcons();

        requestAnimationFrame(() => toast.classList.add("show"));

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }


    /* =========================
       SIDEBAR
    ========================== */

    const sidebarToggle = document.getElementById("mobileMenu");
    const sidebar = document.getElementById("sidebar");

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener("click", () => {
            const isExpanded = sidebarToggle.getAttribute("aria-expanded") === "true";
            const nextExpanded = !isExpanded;

            sidebarToggle.setAttribute("aria-expanded", String(nextExpanded));
            sidebarToggle.setAttribute("aria-label", nextExpanded ? "Hide sidebar" : "Show sidebar");
            sidebarToggle.title = nextExpanded ? "Hide sidebar" : "Show sidebar";

            sidebar.setAttribute("aria-hidden", nextExpanded ? "false" : "true");
        });
    }


    /* =========================
       NAV LINKS
    ========================== */

    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", (event) => {
            const href = link.getAttribute("href");
            if (!href || href === "#") {
                event.preventDefault();
                showToast("This page is not available yet.", "info");
            }
        });
    });


    /* =========================
       ELEMENTS
    ========================== */

    const grid           = document.getElementById("staffGrid");
    const emptyState     = document.getElementById("emptyState");
    const searchInput    = document.getElementById("globalSearch");
    const sortSelect     = document.getElementById("sortSelect");
    const filterTabs     = document.querySelectorAll(".filter-tab");
    const bulkBar        = document.getElementById("bulkBar");
    const bulkCount      = document.getElementById("bulkCount");

    // Stats
    const statTotal    = document.getElementById("statTotal");
    const statActive   = document.getElementById("statActive");
    const statAdmins   = document.getElementById("statAdmins");
    const statGuides   = document.getElementById("statGuides");

    // Tab counts
    const countAll      = document.getElementById("countAll");
    const countActive   = document.getElementById("countActive");
    const countInactive = document.getElementById("countInactive");
    const countAdmin    = document.getElementById("countAdmin");
    const countGuide    = document.getElementById("countGuide");

    // Staff modal
    const staffModal     = document.getElementById("staffModal");
    const staffModalTitle = document.getElementById("staffModalTitle");
    const staffModalSub  = document.getElementById("staffModalSubtitle");
    const staffIdInput   = document.getElementById("staffId");
    const staffSaveLabel = document.getElementById("staffSaveLabel");
    const passwordGroup  = document.getElementById("passwordGroup");
    const staffPassword  = document.getElementById("staffPassword");

    // Reset modal
    const resetModal      = document.getElementById("resetModal");
    const resetAvatar     = document.getElementById("resetAvatar");
    const resetName       = document.getElementById("resetName");
    const resetEmail      = document.getElementById("resetEmail");
    const resetResult     = document.getElementById("resetResult");
    const newPasswordValue = document.getElementById("newPasswordValue");
    const resetConfirmLabel = document.getElementById("resetConfirmLabel");

    // Delete modal
    const deleteModal     = document.getElementById("deleteModal");
    const deleteStaffName = document.getElementById("deleteStaffName");

    // View modal
    const viewModal = document.getElementById("viewModal");


    /* =========================
       STATE
    ========================== */

    let currentFilter  = "all";
    let currentSort    = "name-asc";
    let activeStaff    = null;
    let pendingDelete  = null;
    let selectedStaff  = new Set();
    let resetMethod    = "generate";
    let resetTarget    = null;


    /* =========================
       HELPERS
    ========================== */

    const cards = () => Array.from(document.querySelectorAll(".staff-card"));

    const getInitial = (name) =>
        (name || "?").trim().charAt(0).toUpperCase();

    const formatDate = (iso) => {
        if (!iso) return "—";
        return new Date(iso).toLocaleDateString("en-PH", {
            year: "numeric", month: "short", day: "numeric"
        });
    };


    /* =========================
       STATS + COUNTS
    ========================== */

    function updateStats() {

        const list = cards();

        let active = 0, inactive = 0, admins = 0, guides = 0;

        list.forEach(card => {
            const s = card.dataset.status;
            const r = card.dataset.role;

            if (s === "active") active++;
            else inactive++;

            if (r === "admin") admins++;
            else if (r === "guide") guides++;
        });

        statTotal.textContent  = list.length;
        statActive.textContent = active;
        statAdmins.textContent = admins;
        statGuides.textContent = guides;

        countAll.textContent      = list.length;
        countActive.textContent   = active;
        countInactive.textContent = inactive;
        countAdmin.textContent    = admins;
        countGuide.textContent    = guides;
    }


    /* =========================
       FILTER / SEARCH / SORT
    ========================== */

    function applyFilters() {

        const keyword = (searchInput?.value || "").toLowerCase().trim();
        let visible = 0;

        cards().forEach(card => {

            const status = card.dataset.status;
            const role   = card.dataset.role;
            const text   = card.innerText.toLowerCase();

            let matchesFilter = true;

            if (currentFilter === "active")   matchesFilter = status === "active";
            else if (currentFilter === "inactive") matchesFilter = status === "inactive";
            else if (currentFilter === "admin")    matchesFilter = role === "admin";
            else if (currentFilter === "guide")    matchesFilter = role === "guide";

            const matchesSearch = !keyword || text.includes(keyword);

            const show = matchesFilter && matchesSearch;
            card.style.display = show ? "" : "none";
            if (show) visible++;
        });

        emptyState.hidden = visible !== 0;
    }


    function applySort() {

        const sorted = cards().sort((a, b) => {

            const nameA = (a.dataset.name || "").toLowerCase();
            const nameB = (b.dataset.name || "").toLowerCase();

            const dA = new Date(a.dataset.created);
            const dB = new Date(b.dataset.created);

            const toursA = Number(a.dataset.tours) || 0;
            const toursB = Number(b.dataset.tours) || 0;

            const ratingA = Number(a.dataset.rating) || 0;
            const ratingB = Number(b.dataset.rating) || 0;

            switch (currentSort) {
                case "name-desc":    return nameB.localeCompare(nameA);
                case "newest":       return dB - dA;
                case "tours-high":   return toursB - toursA;
                case "rating-high":  return ratingB - ratingA;
                default:             return nameA.localeCompare(nameB);
            }
        });

        sorted.forEach(c => grid.appendChild(c));
        applyFilters();
    }


    filterTabs.forEach(tab => {
        tab.addEventListener("click", () => {

            filterTabs.forEach(t => {
                t.classList.remove("active");
                t.setAttribute("aria-selected", "false");
            });

            tab.classList.add("active");
            tab.setAttribute("aria-selected", "true");

            currentFilter = tab.dataset.filter;
            applyFilters();
        });
    });


    if (searchInput) searchInput.addEventListener("input", applyFilters);

    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            currentSort = sortSelect.value;
            applySort();
        });
    }


    /* =========================
       MODAL HELPERS
    ========================== */

    function openModal(modal) {
        modal.hidden = false;
        document.body.style.overflow = "hidden";
        refreshIcons();
    }

    function closeModal(modal) {
        modal.hidden = true;
        document.body.style.overflow = "";
    }


    /* =========================
       GENERATE PASSWORD
    ========================== */

    function generatePassword() {

        const chars =
            "ABCDEFGHJKMNPQRSTUVWXYZ" +
            "abcdefghjkmnpqrstuvwxyz" +
            "23456789" +
            "!@#$%";

        let pw = "";
        for (let i = 0; i < 12; i++) {
            pw += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return pw;
    }


    /* =========================
       ADD / EDIT STAFF
    ========================== */

    function resetForm() {

        document.getElementById("staffForm").reset();
        staffIdInput.value = "";

        document.querySelectorAll("#staffForm .form-group.error")
            .forEach(g => g.classList.remove("error"));

        document.querySelectorAll("#staffForm .field-error")
            .forEach(e => e.textContent = "");

        staffPassword.value = generatePassword();
    }


    function openAddModal() {

        resetForm();

        staffModalTitle.textContent = "Add Staff Account";
        staffModalSub.textContent   = "Create a login for a new staff member.";
        staffSaveLabel.textContent  = "Create Account";

        passwordGroup.hidden = false;

        openModal(staffModal);
    }


    function openEditModal(card) {

        resetForm();

        staffModalTitle.textContent = "Edit Staff Account";
        staffModalSub.textContent   = "Update the staff member's details.";
        staffSaveLabel.textContent  = "Save Changes";

        // Hide password field in edit mode
        passwordGroup.hidden = true;

        staffIdInput.value = card.dataset.id;

        const fullName = card.dataset.name || "";
        const parts = fullName.split(" ");

        document.getElementById("staffFirstName").value = parts[0] || "";
        document.getElementById("staffLastName").value  = parts.slice(1).join(" ") || "";
        document.getElementById("staffEmail").value     = card.dataset.email || "";
        document.getElementById("staffPhone").value     = card.dataset.phone || "";
        document.getElementById("staffRole").value      = card.dataset.role || "guide";
        document.getElementById("staffStatus").value    = card.dataset.status || "active";
        document.getElementById("staffSpecialty").value = card.dataset.specialty || "";
        document.getElementById("staffLanguages").value = card.dataset.languages || "";

        openModal(staffModal);
    }


    document.getElementById("addStaffButton")
        ?.addEventListener("click", openAddModal);

    document.getElementById("emptyAddButton")
        ?.addEventListener("click", openAddModal);

    document.getElementById("staffModalClose")
        ?.addEventListener("click", () => closeModal(staffModal));

    document.getElementById("staffCancelButton")
        ?.addEventListener("click", () => closeModal(staffModal));

    staffModal?.addEventListener("click", (e) => {
        if (e.target === staffModal) closeModal(staffModal);
    });


    document.getElementById("generatePasswordButton")
        ?.addEventListener("click", () => {
            staffPassword.value = generatePassword();
            showToast("New password generated.", "info");
        });


    /* =========================
       SAVE STAFF
    ========================== */

    document.getElementById("staffSaveButton")
        ?.addEventListener("click", () => {

            const id        = staffIdInput.value;
            const firstName = document.getElementById("staffFirstName").value.trim();
            const lastName  = document.getElementById("staffLastName").value.trim();
            const email     = document.getElementById("staffEmail").value.trim();
            const phone     = document.getElementById("staffPhone").value.trim();
            const role      = document.getElementById("staffRole").value;
            const status    = document.getElementById("staffStatus").value;
            const specialty = document.getElementById("staffSpecialty").value.trim();
            const languages = document.getElementById("staffLanguages").value.trim();

            const fullName = (firstName + " " + lastName).trim();

            let valid = true;

            const setError = (inputId, msg) => {
                const input = document.getElementById(inputId);
                const group = input.closest(".form-group");
                const err   = document.getElementById(inputId + "Error");

                if (msg) {
                    group.classList.add("error");
                    if (err) err.textContent = msg;
                    valid = false;
                } else {
                    group.classList.remove("error");
                    if (err) err.textContent = "";
                }
            };

            setError("staffFirstName", !firstName ? "First name is required." : "");
            setError("staffLastName",  !lastName  ? "Last name is required." : "");
            setError("staffEmail",     !email     ? "Email is required." :
                                       !/\S+@\S+\.\S+/.test(email) ? "Enter a valid email." : "");
            setError("staffRole",      !role      ? "Please select a role." : "");

            if (!valid) return;


            if (id) {

                // UPDATE
                const card = cards().find(c => c.dataset.id === id);
                if (!card) return;

                card.dataset.name      = fullName;
                card.dataset.email     = email;
                card.dataset.phone     = phone;
                card.dataset.role      = role;
                card.dataset.status    = status;
                card.dataset.specialty = specialty;
                card.dataset.languages = languages;

                // Update visible fields
                const avatar = card.querySelector(".staff-avatar");
                avatar.textContent = getInitial(fullName);
                avatar.classList.toggle("admin", role === "admin");

                card.querySelector("h3").textContent = fullName;
                card.querySelector(".staff-email").textContent = email;

                // Role badge
                const roleBadge = card.querySelector(".staff-role-badge");
                roleBadge.className = "staff-role-badge " + role;
                roleBadge.textContent =
                    role === "admin" ? "Admin" :
                    role === "staff" ? "Staff" : "Guide";

                // Status badge
                const statusBadge = card.querySelector(".staff-status-badge");
                statusBadge.className = "staff-status-badge " + status;
                statusBadge.textContent = status === "active" ? "Active" : "Inactive";

                // Meta phone
                const metaPhone = card.querySelector(".staff-meta span:first-child");
                if (metaPhone) {
                    metaPhone.innerHTML = `<i data-lucide="phone"></i> ${phone || "—"}`;
                }

                refreshIcons();
                updateStats();
                applyFilters();
                showToast("Staff updated.", "success");

            } else {

                // CREATE
                const newCard = document.createElement("article");
                newCard.className = "staff-card";
                newCard.tabIndex = 0;

                newCard.dataset.id        = "S-" + Date.now();
                newCard.dataset.status    = status;
                newCard.dataset.role      = role;
                newCard.dataset.name      = fullName;
                newCard.dataset.email     = email;
                newCard.dataset.phone     = phone;
                newCard.dataset.tours     = "0";
                newCard.dataset.rating    = "0";
                newCard.dataset.created   = new Date().toISOString().slice(0, 10);
                newCard.dataset.specialty = specialty;
                newCard.dataset.languages = languages;

                const roleLabel =
                    role === "admin" ? "Admin" :
                    role === "staff" ? "Staff" : "Guide";

                const statusLabel = status === "active" ? "Active" : "Inactive";

                newCard.innerHTML = `
                    <label class="staff-checkbox" aria-label="Select ${fullName}">
                        <input type="checkbox" class="staff-select">
                        <span></span>
                    </label>

                    <div class="staff-header">
                        <div class="staff-avatar ${role === "admin" ? "admin" : ""}">${getInitial(fullName)}</div>
                        <div class="staff-badges">
                            <span class="staff-role-badge ${role}">${roleLabel}</span>
                            <span class="staff-status-badge ${status}">${statusLabel}</span>
                        </div>
                    </div>

                    <div class="staff-body">
                        <h3>${fullName}</h3>
                        <p class="staff-email">${email}</p>

                        <div class="staff-meta">
                            <span><i data-lucide="phone"></i> ${phone || "—"}</span>
                            <span><i data-lucide="compass"></i> ${specialty || "—"}</span>
                        </div>

                        <div class="staff-stats">
                            <div>
                                <span>Specialty</span>
                                <strong>${specialty || "—"}</strong>
                            </div>
                            <div>
                                <span>Last Login</span>
                                <strong>Just now</strong>
                            </div>
                        </div>
                    </div>

                    <div class="staff-footer">
                        <button class="text-button edit-button" type="button">
                            <i data-lucide="pencil"></i>
                            Edit
                        </button>

                        <div class="staff-actions">
                            <button class="icon-button reset-button" title="Reset Password">
                                <i data-lucide="key-round"></i>
                            </button>
                            <button class="icon-button toggle-button" title="Deactivate">
                                <i data-lucide="pause-circle"></i>
                            </button>
                            <button class="icon-button delete-button" title="Delete">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </div>
                `;

                grid.appendChild(newCard);
                attachCardActions(newCard);
                refreshIcons();

                showToast("Staff account created.", "success");

                // Mention the password
                if (staffPassword.value) {
                    setTimeout(() => {
                        showToast(`Temp password: ${staffPassword.value}`, "info", 6000);
                    }, 400);
                }
            }

            closeModal(staffModal);
            updateStats();
            applySort();
        });


    /* =========================
       RESET PASSWORD
    ========================== */

    function openResetModal(card) {

        resetTarget = card;

        resetAvatar.textContent = getInitial(card.dataset.name);
        resetName.textContent   = card.dataset.name;
        resetEmail.textContent  = card.dataset.email;

        resetMethod = "generate";
        resetResult.hidden = true;
        newPasswordValue.textContent = "—";

        document.querySelectorAll(".reset-option").forEach(o => {
            o.classList.toggle("active", o.dataset.method === "generate");
        });

        resetConfirmLabel.textContent = "Generate Password";

        openModal(resetModal);
    }


    document.querySelectorAll(".reset-option").forEach(option => {
        option.addEventListener("click", () => {

            document.querySelectorAll(".reset-option")
                .forEach(o => o.classList.remove("active"));

            option.classList.add("active");
            resetMethod = option.dataset.method;

            resetResult.hidden = true;
            resetConfirmLabel.textContent =
                resetMethod === "generate" ? "Generate Password" : "Send Reset Link";
        });
    });


    document.getElementById("resetModalClose")
        ?.addEventListener("click", () => closeModal(resetModal));

    document.getElementById("resetCancelButton")
        ?.addEventListener("click", () => closeModal(resetModal));

    resetModal?.addEventListener("click", (e) => {
        if (e.target === resetModal) closeModal(resetModal);
    });


    document.getElementById("resetConfirmButton")
        ?.addEventListener("click", () => {

            if (!resetTarget) return;

            if (resetMethod === "generate") {

                const pw = generatePassword();
                newPasswordValue.textContent = pw;
                resetResult.hidden = false;

                showToast("New temporary password generated.", "success");

            } else {

                showToast(`Reset link sent to ${resetTarget.dataset.email}`, "success");
                closeModal(resetModal);

            }
        });


    document.getElementById("copyPasswordButton")
        ?.addEventListener("click", () => {

            const pw = newPasswordValue.textContent;
            if (!pw || pw === "—") return;

            navigator.clipboard.writeText(pw).then(() => {
                showToast("Password copied to clipboard.", "success");
            }).catch(() => {
                showToast("Copy failed. Select and copy manually.", "error");
            });
        });


    /* =========================
       DELETE MODAL
    ========================== */

    function openDeleteModal(card) {
        pendingDelete = card;
        deleteStaffName.textContent = card.dataset.name;
        openModal(deleteModal);
    }


    document.getElementById("deleteModalClose")
        ?.addEventListener("click", () => closeModal(deleteModal));

    document.getElementById("deleteCancelButton")
        ?.addEventListener("click", () => closeModal(deleteModal));

    document.getElementById("deleteConfirmButton")
        ?.addEventListener("click", () => {

            if (!pendingDelete) return;

            pendingDelete.remove();
            pendingDelete = null;

            closeModal(deleteModal);
            updateStats();
            applyFilters();

            showToast("Staff account deleted.", "success");
        });

    deleteModal?.addEventListener("click", (e) => {
        if (e.target === deleteModal) closeModal(deleteModal);
    });


    /* =========================
       VIEW MODAL
    ========================== */

    function openViewModal(card) {

        activeStaff = card;
        const d = card.dataset;

        // Hero
        document.getElementById("viewAvatar").textContent = getInitial(d.name);
        document.getElementById("viewName").textContent   = d.name;
        document.getElementById("viewId").textContent     = d.id;

        const roleBadge = document.getElementById("viewRoleBadge");
        roleBadge.className = "staff-role-badge " + d.role;
        roleBadge.textContent =
            d.role === "admin" ? "Admin" :
            d.role === "staff" ? "Staff" : "Guide";

        const statusBadge = document.getElementById("viewStatusBadge");
        statusBadge.className = "staff-status-badge " + d.status;
        statusBadge.textContent = d.status === "active" ? "Active" : "Inactive";

        // Contact
        document.getElementById("viewEmail").textContent   = d.email;
        document.getElementById("viewPhone").textContent   = d.phone;
        document.getElementById("viewCreated").textContent = formatDate(d.created);

        // Role details
        document.getElementById("viewSpecialty").textContent = d.specialty || "—";
        document.getElementById("viewLanguages").textContent = d.languages || "—";
        document.getElementById("viewPermissions").textContent =
            d.role === "admin" ? "Full Access" :
            d.role === "staff" ? "Bookings & Guests" :
            "Assigned Tours";

        // Performance
        document.getElementById("viewTours").textContent     = d.tours + " tours";
        document.getElementById("viewRating").textContent    = d.rating !== "0" ? "★ " + d.rating : "—";
        document.getElementById("viewLastLogin").textContent = "Recently";

        openModal(viewModal);
    }


    document.getElementById("viewModalClose")
        ?.addEventListener("click", () => closeModal(viewModal));

    document.getElementById("viewCloseButton")
        ?.addEventListener("click", () => closeModal(viewModal));

    viewModal?.addEventListener("click", (e) => {
        if (e.target === viewModal) closeModal(viewModal);
    });

    document.getElementById("viewEditButton")
        ?.addEventListener("click", () => {
            if (!activeStaff) return;
            const card = activeStaff;
            closeModal(viewModal);
            openEditModal(card);
        });

    document.getElementById("viewResetButton")
        ?.addEventListener("click", () => {
            if (!activeStaff) return;
            const card = activeStaff;
            closeModal(viewModal);
            openResetModal(card);
        });


    /* =========================
       CARD ACTIONS
    ========================== */

    function attachCardActions(card) {

        const cb = card.querySelector(".staff-select");

        cb?.addEventListener("change", () => {
            if (cb.checked) {
                card.classList.add("selected");
                selectedStaff.add(card);
            } else {
                card.classList.remove("selected");
                selectedStaff.delete(card);
            }
            updateBulkBar();
        });


        card.querySelector(".edit-button")?.addEventListener("click", () => {
            openEditModal(card);
        });


        card.querySelector(".reset-button")?.addEventListener("click", () => {
            openResetModal(card);
        });


        card.querySelector(".toggle-button")?.addEventListener("click", () => {

            const isActive = card.dataset.status === "active";
            const newStatus = isActive ? "inactive" : "active";

            card.dataset.status = newStatus;

            const badge = card.querySelector(".staff-status-badge");
            badge.className = "staff-status-badge " + newStatus;
            badge.textContent = newStatus === "active" ? "Active" : "Inactive";

            // Update the toggle button icon
            const toggleBtn = card.querySelector(".toggle-button");
            toggleBtn.innerHTML = `<i data-lucide="${newStatus === "active" ? "pause-circle" : "play-circle"}"></i>`;
            toggleBtn.title = newStatus === "active" ? "Deactivate" : "Activate";

            refreshIcons();
            updateStats();
            applyFilters();

            showToast(
                `${card.dataset.name} ${newStatus === "active" ? "activated" : "deactivated"}.`,
                newStatus === "active" ? "success" : "warning"
            );
        });


        card.querySelector(".delete-button")?.addEventListener("click", () => {
            openDeleteModal(card);
        });


        // Double-click to view
        card.addEventListener("dblclick", () => openViewModal(card));


        // Enter key opens view
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter") openViewModal(card);
        });
    }


    cards().forEach(attachCardActions);


    /* =========================
       BULK ACTIONS
    ========================== */

    function updateBulkBar() {
        bulkCount.textContent = selectedStaff.size;
        bulkBar.hidden = selectedStaff.size === 0;
    }


    document.querySelectorAll("[data-bulk-action]").forEach(btn => {

        btn.addEventListener("click", () => {

            const action = btn.dataset.bulkAction;

            if (action === "clear") {
                selectedStaff.forEach(card => {
                    card.classList.remove("selected");
                    const cb = card.querySelector(".staff-select");
                    if (cb) cb.checked = false;
                });
                selectedStaff.clear();
                updateBulkBar();
                return;
            }

            if (action === "delete") {
                if (!confirm(`Delete ${selectedStaff.size} account(s)? This cannot be undone.`)) return;

                selectedStaff.forEach(card => card.remove());
                selectedStaff.clear();
                updateBulkBar();
                updateStats();
                applyFilters();
                showToast("Staff accounts deleted.", "success");
                return;
            }

            if (action === "activate" || action === "deactivate") {

                const newStatus = action === "activate" ? "active" : "inactive";

                selectedStaff.forEach(card => {

                    card.dataset.status = newStatus;

                    const badge = card.querySelector(".staff-status-badge");
                    badge.className = "staff-status-badge " + newStatus;
                    badge.textContent = newStatus === "active" ? "Active" : "Inactive";

                    const toggleBtn = card.querySelector(".toggle-button");
                    toggleBtn.innerHTML = `<i data-lucide="${newStatus === "active" ? "pause-circle" : "play-circle"}"></i>`;
                    toggleBtn.title = newStatus === "active" ? "Deactivate" : "Activate";
                });

                refreshIcons();
                updateStats();
                applyFilters();

                showToast(
                    `${selectedStaff.size} account(s) ${action}d.`,
                    "success"
                );
            }
        });
    });


    /* =========================
       EXPORT / NOTIF / LOGOUT
    ========================== */

    document.getElementById("exportStaffButton")
        ?.addEventListener("click", () => showToast("Exporting staff list as CSV...", "info"));

    document.getElementById("notificationButton")
        ?.addEventListener("click", () => showToast("You have 3 new notifications.", "info"));

    document.getElementById("logoutButton")
        ?.addEventListener("click", () => {
            if (confirm("Are you sure you want to logout?"))
                showToast("Logging out...", "success");
        });

    document.getElementById("adminProfileButton")
        ?.addEventListener("click", () => showToast("Admin profile menu", "info"));


    /* =========================
       KEYBOARD SHORTCUTS
    ========================== */

    document.addEventListener("keydown", (e) => {

        if (e.key === "/" &&
            document.activeElement.tagName !== "INPUT" &&
            document.activeElement.tagName !== "TEXTAREA") {
            e.preventDefault();
            searchInput?.focus();
        }

        if (e.key === "Escape") {
            if (!staffModal.hidden)  closeModal(staffModal);
            if (!resetModal.hidden)  closeModal(resetModal);
            if (!deleteModal.hidden) closeModal(deleteModal);
            if (!viewModal.hidden)   closeModal(viewModal);
        }
    });


    /* =========================
       INIT
    ========================== */

    updateStats();
    applySort();

});