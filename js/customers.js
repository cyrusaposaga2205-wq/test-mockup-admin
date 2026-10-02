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

    const tbody         = document.getElementById("customersBody");
    const emptyState    = document.getElementById("emptyState");
    const searchInput   = document.getElementById("globalSearch");
    const sortSelect    = document.getElementById("sortSelect");
    const filterTabs    = document.querySelectorAll(".filter-tab");
    const bulkBar       = document.getElementById("bulkBar");
    const bulkCount     = document.getElementById("bulkCount");
    const selectAllBox  = document.getElementById("selectAllCustomers");

    // Stats
    const statTotal     = document.getElementById("statTotal");
    const statReturning = document.getElementById("statReturning");
    const statNew       = document.getElementById("statNew");
    const statVip       = document.getElementById("statVip");

    // Tab counts
    const countAll       = document.getElementById("countAll");
    const countNew       = document.getElementById("countNew");
    const countReturning = document.getElementById("countReturning");
    const countVip       = document.getElementById("countVip");
    const countInactive  = document.getElementById("countInactive");

    // Customer modal
    const customerModal       = document.getElementById("customerModal");
    const customerModalClose  = document.getElementById("customerModalClose");
    const customerModalSub    = document.getElementById("customerModalSubtitle");
    const heroAvatar          = document.getElementById("heroAvatar");
    const heroName            = document.getElementById("heroName");
    const heroStatusBadge     = document.getElementById("heroStatusBadge");
    const heroCustomerId      = document.getElementById("heroCustomerId");
    const heroSpent           = document.getElementById("heroSpent");
    const heroBookings        = document.getElementById("heroBookings");
    const heroJoined          = document.getElementById("heroJoined");
    const detailEmail         = document.getElementById("detailEmail");
    const detailPhone         = document.getElementById("detailPhone");
    const detailLocation      = document.getElementById("detailLocation");
    const detailSince         = document.getElementById("detailSince");
    const detailAvgBooking    = document.getElementById("detailAvgBooking");
    const detailLtv           = document.getElementById("detailLtv");
    const detailPrefPackage   = document.getElementById("detailPrefPackage");
    const loyaltyBarFill      = document.getElementById("loyaltyBarFill");
    const loyaltyHint         = document.getElementById("loyaltyHint");
    const customerBookings    = document.getElementById("customerBookings");
    const customerActivity    = document.getElementById("customerActivity");

    // Form modal
    const formModal         = document.getElementById("formModal");
    const formModalTitle    = document.getElementById("formModalTitle");
    const formModalSub      = document.getElementById("formModalSubtitle");
    const customerForm      = document.getElementById("customerForm");
    const customerIdInput   = document.getElementById("customerId");
    const formSaveLabel     = document.getElementById("formSaveLabel");

    // Delete modal
    const deleteModal       = document.getElementById("deleteModal");
    const deleteCustomerName = document.getElementById("deleteCustomerName");


    /* =========================
       STATE
    ========================== */

    let currentFilter = "all";
    let currentSort   = "newest";
    let activeRow     = null;
    let pendingDelete = null;
    let selectedRows  = new Set();


    /* =========================
       HELPERS
    ========================== */

    const rows = () => Array.from(tbody.querySelectorAll("tr"));

    const formatMoney = (n) =>
        "₱" + Number(n).toLocaleString("en-PH");

    const formatDate = (iso) => {
        if (!iso) return "—";
        const d = new Date(iso);
        return d.toLocaleDateString("en-PH", {
            year: "numeric", month: "short", day: "numeric"
        });
    };

    const getInitial = (name) =>
        (name || "?").trim().charAt(0).toUpperCase();


    /* =========================
       STATS
    ========================== */

    function updateStats() {

        const list = rows();
        const c = { total: list.length, new: 0, returning: 0, vip: 0, inactive: 0 };

        list.forEach(r => {
            const s = r.dataset.status;
            if (s in c) c[s]++;
        });

        statTotal.textContent     = c.total;
        statReturning.textContent = c.returning;
        statNew.textContent       = c.new;
        statVip.textContent       = c.vip;

        countAll.textContent       = c.total;
        countNew.textContent       = c.new;
        countReturning.textContent = c.returning;
        countVip.textContent       = c.vip;
        countInactive.textContent  = c.inactive;
    }


    /* =========================
       FILTER / SEARCH / SORT
    ========================== */

    function applyFilters() {

        const keyword = (searchInput?.value || "").toLowerCase().trim();
        let visible = 0;

        rows().forEach(row => {
            const status = row.dataset.status;
            const text   = row.innerText.toLowerCase();

            const matchesFilter =
                currentFilter === "all" || status === currentFilter;

            const matchesSearch = !keyword || text.includes(keyword);

            const show = matchesFilter && matchesSearch;
            row.style.display = show ? "" : "none";
            if (show) visible++;
        });

        emptyState.hidden = visible !== 0;
    }


    function applySort() {

        const sorted = rows().sort((a, b) => {

            const spendA = Number(a.dataset.spent) || 0;
            const spendB = Number(b.dataset.spent) || 0;

            const bookA = Number(a.dataset.bookings) || 0;
            const bookB = Number(b.dataset.bookings) || 0;

            const dateA = new Date(a.dataset.created);
            const dateB = new Date(b.dataset.created);

            const nameA = (a.dataset.name || "").toLowerCase();
            const nameB = (b.dataset.name || "").toLowerCase();

            switch (currentSort) {
                case "oldest":         return dateA - dateB;
                case "name-asc":       return nameA.localeCompare(nameB);
                case "name-desc":      return nameB.localeCompare(nameA);
                case "spend-high":     return spendB - spendA;
                case "bookings-high":  return bookB - bookA;
                default:               return dateB - dateA;   // newest
            }
        });

        sorted.forEach(r => tbody.appendChild(r));
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
       CUSTOMER DETAIL MODAL
    ========================== */

    function openCustomerDetail(row) {

        activeRow = row;
        const d = row.dataset;

        const statusLabel = d.status.charAt(0).toUpperCase() + d.status.slice(1);

        // Hero
        heroAvatar.textContent  = getInitial(d.name);
        heroName.textContent    = d.name;
        heroStatusBadge.textContent = statusLabel;
        heroStatusBadge.className = "status " + d.status;
        heroCustomerId.textContent = d.id;

        heroSpent.textContent    = formatMoney(d.spent);
        heroBookings.textContent = d.bookings;
        heroJoined.textContent   = formatDate(d.created);

        customerModalSub.textContent = `${d.location} · Joined ${formatDate(d.created)}`;

        // Overview
        detailEmail.textContent    = d.email;
        detailPhone.textContent    = d.phone;
        detailLocation.textContent = d.location;
        detailSince.textContent    = formatDate(d.created);

        const avg = d.bookings > 0
            ? Math.round(Number(d.spent) / Number(d.bookings))
            : 0;

        detailAvgBooking.textContent = formatMoney(avg);
        detailLtv.textContent        = formatMoney(d.spent);

        // Preferred package (mock)
        detailPrefPackage.textContent =
            d.bookings >= 5 ? "3D2N Cebu Tour" :
            d.bookings >= 3 ? "Moalboal-Badian" :
            "Oslob-Simala";

        // Loyalty bar (0-12 bookings = 100%)
        const loyaltyPct = Math.min(100, (Number(d.bookings) / 12) * 100);
        loyaltyBarFill.style.width = loyaltyPct + "%";
        loyaltyHint.textContent    = loyaltyPct >= 100
            ? "★ Top-tier loyalty"
            : Math.round(loyaltyPct) + "% of top-tier loyalty";

        // Bookings list (mock)
        buildBookings(d);

        // Activity timeline (mock)
        buildActivity(d);

        // Reset tabs to first
        switchTab("overview");

        openModal(customerModal);
    }


    function buildBookings(d) {

        customerBookings.innerHTML = "";

        const packages = [
            { name: "3D2N Cebu Tour", icon: "map-pin", amount: 20392, date: "Oct 05, 2026", status: "confirmed" },
            { name: "Moalboal-Badian", icon: "waves", amount: 17500, date: "Sep 12, 2026", status: "completed" },
            { name: "Oslob-Simala", icon: "fish", amount: 25490, date: "Aug 03, 2026", status: "completed" }
        ];

        const count = Math.min(Number(d.bookings), packages.length);

        for (let i = 0; i < count; i++) {

            const p = packages[i];

            const row = document.createElement("div");
            row.className = "customer-booking-row";

            row.innerHTML = `
                <div class="customer-booking-icon">
                    <i data-lucide="${p.icon}" aria-hidden="true"></i>
                </div>
                <div class="customer-booking-info">
                    <strong>${p.name}</strong>
                    <small>${p.date} · Booking #${d.id}-${i + 1}</small>
                </div>
                <div class="customer-booking-amount">${formatMoney(p.amount)}</div>
                <span class="status ${p.status}">${p.status.charAt(0).toUpperCase() + p.status.slice(1)}</span>
            `;

            customerBookings.appendChild(row);

        }

        refreshIcons();
    }


    function buildActivity(d) {

        customerActivity.innerHTML = "";

        const events = [
            { label: "Booking confirmed", date: "Oct 05, 2026", state: "current" },
            { label: "Payment received", date: "Sep 28, 2026", state: "done" },
            { label: "Left a 5-star review", date: "Sep 15, 2026", state: "done" },
            { label: "Account created", date: formatDate(d.created), state: "done" }
        ];

        events.forEach(ev => {

            const li = document.createElement("li");
            li.className = ev.state;

            li.innerHTML = `
                <strong>${ev.label}</strong>
                <small>${ev.date}</small>
            `;

            customerActivity.appendChild(li);

        });
    }


    function switchTab(tabName) {

        document.querySelectorAll(".modal-tab").forEach(t => {
            t.classList.toggle("active", t.dataset.tab === tabName);
        });

        document.querySelectorAll(".modal-tab-panel").forEach(p => {
            p.classList.toggle("active", p.dataset.panel === tabName);
        });
    }


    // Tab listeners
    document.querySelectorAll(".modal-tab").forEach(tab => {
        tab.addEventListener("click", () => switchTab(tab.dataset.tab));
    });


    // Modal close
    customerModalClose?.addEventListener("click", () => closeModal(customerModal));
    document.getElementById("modalCancelButton")
        ?.addEventListener("click", () => closeModal(customerModal));

    document.getElementById("modalSaveButton")
        ?.addEventListener("click", () => {
            showToast("Customer changes saved.", "success");
            closeModal(customerModal);
        });

    document.getElementById("modalArchiveButton")
        ?.addEventListener("click", () => {

            if (!activeRow) return;

            activeRow.dataset.status = "inactive";
            const badge = activeRow.querySelector(".status");
            badge.className = "status inactive";
            badge.textContent = "Inactive";

            updateStats();
            applyFilters();

            showToast("Customer archived.", "success");
            closeModal(customerModal);
        });

    document.getElementById("heroEmailButton")
        ?.addEventListener("click", () => showToast("Opening email draft...", "info"));

    document.getElementById("heroPhoneButton")
        ?.addEventListener("click", () => showToast("Calling customer...", "info"));

    document.getElementById("heroEditButton")
        ?.addEventListener("click", () => {

            closeModal(customerModal);
            openFormModal(activeRow);
        });

    customerModal?.addEventListener("click", (e) => {
        if (e.target === customerModal) closeModal(customerModal);
    });


    /* =========================
       ROW ACTIONS
    ========================== */

    function attachRowActions(row) {

        const cb = row.querySelector(".row-select");

        cb?.addEventListener("change", () => {
            if (cb.checked) selectedRows.add(row);
            else selectedRows.delete(row);

            updateBulkBar();
        });


        row.querySelector(".view-button")?.addEventListener("click", () => {
            openCustomerDetail(row);
        });


        row.querySelector(".edit-button")?.addEventListener("click", () => {
            openFormModal(row);
        });


        row.querySelector(".delete-button")?.addEventListener("click", () => {
            pendingDelete = row;
            deleteCustomerName.textContent = row.dataset.name;
            openModal(deleteModal);
        });
    }


    rows().forEach(attachRowActions);


    /* =========================
       FORM MODAL
    ========================== */

    function openFormModal(row) {

        customerForm.reset();
        customerIdInput.value = "";

        document.querySelectorAll(".form-group.error")
            .forEach(g => g.classList.remove("error"));
        document.querySelectorAll(".field-error")
            .forEach(e => e.textContent = "");

        if (row) {

            // Edit mode
            formModalTitle.textContent = "Edit Customer";
            formModalSub.textContent   = "Update the customer's details below.";
            formSaveLabel.textContent  = "Update Customer";

            const d = row.dataset;

            customerIdInput.value       = d.id;
            customerName.value          = d.name;
            customerEmail.value         = d.email;
            customerPhone.value         = d.phone;
            customerLocation.value      = d.location;
            customerStatus.value        = d.status;

        } else {

            // Add mode
            formModalTitle.textContent = "Add Customer";
            formModalSub.textContent   = "Enter the customer's details below.";
            formSaveLabel.textContent  = "Save Customer";

        }

        openModal(formModal);
    }


    document.getElementById("addCustomerButton")
        ?.addEventListener("click", () => openFormModal(null));

    document.getElementById("formModalClose")
        ?.addEventListener("click", () => closeModal(formModal));

    document.getElementById("formCancelButton")
        ?.addEventListener("click", () => closeModal(formModal));

    formModal?.addEventListener("click", (e) => {
        if (e.target === formModal) closeModal(formModal);
    });


    /* =========================
       SAVE CUSTOMER
    ========================== */

    document.getElementById("formSaveButton")
        ?.addEventListener("click", () => {

            const id       = customerIdInput.value;
            const name     = document.getElementById("customerName").value.trim();
            const email    = document.getElementById("customerEmail").value.trim();
            const phone    = document.getElementById("customerPhone").value.trim();
            const location = document.getElementById("customerLocation").value.trim();
            const status   = document.getElementById("customerStatus").value;

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

            setError("customerName",  !name  ? "Name is required." : "");
            setError("customerEmail", !email ? "Email is required." :
                                       !/\S+@\S+\.\S+/.test(email) ? "Enter a valid email." : "");

            if (!valid) return;


            if (id) {

                // Update
                const row = rows().find(r => r.dataset.id === id);
                if (!row) return;

                row.dataset.name     = name;
                row.dataset.email    = email;
                row.dataset.phone    = phone;
                row.dataset.location = location;
                row.dataset.status   = status;

                const cell = row.querySelector(".customer-cell");
                cell.querySelector(".customer-avatar").textContent = getInitial(name);
                cell.querySelector("strong").textContent = name;
                cell.querySelector("small").textContent  = email;

                const cells = row.querySelectorAll("td");
                cells[2].textContent = phone || "—";
                cells[3].textContent = location || "—";

                const badge = row.querySelector(".status");
                badge.className = "status " + status;
                badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);

                showToast("Customer updated.", "success");

            } else {

                // Add
                const newRow = document.createElement("tr");
                newRow.dataset.id       = "C-" + Date.now();
                newRow.dataset.name     = name;
                newRow.dataset.email    = email;
                newRow.dataset.phone    = phone;
                newRow.dataset.location = location;
                newRow.dataset.status   = status;
                newRow.dataset.bookings = "0";
                newRow.dataset.spent    = "0";
                newRow.dataset.created  = new Date().toISOString().slice(0, 10);

                const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

                newRow.innerHTML = `
                    <td><input type="checkbox" class="row-select" aria-label="Select ${name}"></td>
                    <td>
                        <div class="customer-cell">
                            <div class="customer-avatar">${getInitial(name)}</div>
                            <div>
                                <strong>${name}</strong>
                                <small>${email}</small>
                            </div>
                        </div>
                    </td>
                    <td>${phone || "—"}</td>
                    <td>${location || "—"}</td>
                    <td>0</td>
                    <td>₱0</td>
                    <td><span class="status ${status}">${statusLabel}</span></td>
                    <td class="td-actions">
                        <button class="icon-button view-button" title="View details"><i data-lucide="eye"></i></button>
                        <button class="icon-button edit-button" title="Edit"><i data-lucide="pencil"></i></button>
                        <button class="icon-button delete-button" title="Delete"><i data-lucide="trash-2"></i></button>
                    </td>
                `;

                tbody.appendChild(newRow);
                attachRowActions(newRow);
                refreshIcons();

                showToast("Customer added.", "success");

            }

            closeModal(formModal);
            updateStats();
            applySort();

        });


    /* =========================
       DELETE MODAL
    ========================== */

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

            showToast("Customer deleted.", "success");
        });

    deleteModal?.addEventListener("click", (e) => {
        if (e.target === deleteModal) closeModal(deleteModal);
    });


    /* =========================
       BULK ACTIONS
    ========================== */

    function updateBulkBar() {
        bulkCount.textContent = selectedRows.size;
        bulkBar.hidden = selectedRows.size === 0;
    }


    document.querySelectorAll("[data-bulk-action]").forEach(btn => {

        btn.addEventListener("click", () => {

            const action = btn.dataset.bulkAction;

            if (action === "clear") {
                selectedRows.forEach(row => {
                    const cb = row.querySelector(".row-select");
                    if (cb) cb.checked = false;
                });
                selectedRows.clear();
                updateBulkBar();
                return;
            }

            if (action === "delete") {
                if (!confirm(`Delete ${selectedRows.size} customer(s)?`)) return;

                selectedRows.forEach(row => row.remove());
                selectedRows.clear();
                updateBulkBar();
                updateStats();
                applyFilters();
                showToast("Customers deleted.", "success");
                return;
            }

            if (action === "vip") {
                selectedRows.forEach(row => {
                    row.dataset.status = "vip";
                    const badge = row.querySelector(".status");
                    badge.className = "status vip";
                    badge.textContent = "VIP";
                });
                updateStats();
                applyFilters();
                showToast(`${selectedRows.size} customer(s) marked VIP.`, "success");
                return;
            }

            if (action === "email") {
                showToast(`Opening email draft for ${selectedRows.size} customer(s)...`, "info");
            }

        });

    });


    /* =========================
       SELECT ALL
    ========================== */

    selectAllBox?.addEventListener("change", (e) => {

        rows().forEach(row => {
            const cb = row.querySelector(".row-select");
            if (!cb) return;
            cb.checked = e.target.checked;

            if (e.target.checked) selectedRows.add(row);
            else selectedRows.delete(row);
        });

        updateBulkBar();
    });


    /* =========================
       EXPORT / NOTIF / LOGOUT
    ========================== */

    document.getElementById("exportCustomersButton")
        ?.addEventListener("click", () => showToast("Exporting customers as CSV...", "info"));

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
            if (!customerModal.hidden) closeModal(customerModal);
            if (!formModal.hidden)     closeModal(formModal);
            if (!deleteModal.hidden)   closeModal(deleteModal);
        }

    });


    /* =========================
       INIT
    ========================== */

    updateStats();
    applySort();

});