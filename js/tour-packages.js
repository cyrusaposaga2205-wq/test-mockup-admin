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

        requestAnimationFrame(() => toast.classList.add("show"));

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }


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
       STATE
    ========================== */

    let currentFilter = "all";
    let currentSort   = "newest";
    let currentView   = "grid";
    let pendingDelete = null;    // element being deleted
    let selectedCards = new Set();


    /* =========================
       ELEMENTS
    ========================== */

    const grid           = document.getElementById("packagesGrid");
    const tableCard      = document.getElementById("packagesTableCard");
    const tableBody      = document.getElementById("packagesTableBody");
    const emptyState     = document.getElementById("emptyState");
    const searchInput    = document.getElementById("globalSearch");
    const sortSelect     = document.getElementById("sortSelect");
    const filterTabs     = document.querySelectorAll(".filter-tab");
    const viewToggles    = document.querySelectorAll(".view-toggle-btn");
    const bulkBar        = document.getElementById("bulkBar");
    const bulkCount      = document.getElementById("bulkCount");

    // Modal
    const packageModal      = document.getElementById("packageModal");
    const packageForm       = document.getElementById("packageForm");
    const packageModalTitle = document.getElementById("packageModalTitle");
    const packageModalSub   = document.getElementById("packageModalSubtitle");
    const modalSaveLabel    = document.getElementById("modalSaveLabel");
    const packageIdInput    = document.getElementById("packageId");

    // Delete modal
    const deleteModal        = document.getElementById("deleteModal");
    const deletePackageName  = document.getElementById("deletePackageName");

    // Stats
    const statTotal    = document.getElementById("statTotal");
    const statActive   = document.getElementById("statActive");
    const statDraft    = document.getElementById("statDraft");
    const statArchived = document.getElementById("statArchived");

    // Counts in tabs
    const countAll      = document.getElementById("countAll");
    const countActive   = document.getElementById("countActive");
    const countDraft    = document.getElementById("countDraft");
    const countArchived = document.getElementById("countArchived");


    /* =========================
       HELPERS
    ========================== */

    const getCards = () =>
        Array.from(document.querySelectorAll(".package-card"));


    const updateStats = () => {

        const cards = getCards();

        let active = 0, draft = 0, archived = 0;

        cards.forEach(card => {
            const s = card.dataset.status;
            if (s === "active")   active++;
            if (s === "draft")    draft++;
            if (s === "archived") archived++;
        });

        statTotal.textContent    = cards.length;
        statActive.textContent   = active;
        statDraft.textContent    = draft;
        statArchived.textContent = archived;

        countAll.textContent      = cards.length;
        countActive.textContent   = active;
        countDraft.textContent    = draft;
        countArchived.textContent = archived;
    };


    /* =========================
       FILTER + SEARCH + SORT
    ========================== */

    const applyFilters = () => {

        const keyword = (searchInput?.value || "").toLowerCase().trim();

        let visibleCount = 0;

        getCards().forEach(card => {

            const status = card.dataset.status;
            const text   = card.innerText.toLowerCase();

            const matchesFilter =
                currentFilter === "all" || status === currentFilter;

            const matchesSearch = !keyword || text.includes(keyword);

            const show = matchesFilter && matchesSearch;

            card.style.display = show ? "" : "none";
            if (show) visibleCount++;
        });

        // Table rows
        document.querySelectorAll("#packagesTableBody tr").forEach(row => {
            const status = row.dataset.status;
            const text   = row.innerText.toLowerCase();
            const match  =
                (currentFilter === "all" || status === currentFilter) &&
                (!keyword || text.includes(keyword));

            row.style.display = match ? "" : "none";
        });

        emptyState.hidden = visibleCount !== 0;

    };


    const applySort = () => {

        const sorted = getCards().sort((a, b) => {

            const priceA = Number(a.dataset.price)   || 0;
            const priceB = Number(b.dataset.price)   || 0;
            const rateA  = Number(a.dataset.rating)  || 0;
            const rateB  = Number(b.dataset.rating)  || 0;
            const dateA  = new Date(a.dataset.created);
            const dateB  = new Date(b.dataset.created);
            const nameA  = (a.dataset.name || "").toLowerCase();
            const nameB  = (b.dataset.name || "").toLowerCase();

            switch (currentSort) {

                case "oldest":      return dateA - dateB;
                case "price-low":   return priceA - priceB;
                case "price-high":  return priceB - priceA;
                case "rating-high": return rateB - rateA;
                case "name-asc":    return nameA.localeCompare(nameB);
                case "name-desc":   return nameB.localeCompare(nameA);
                default:            return dateB - dateA;   // newest
            }
        });

        sorted.forEach(card => grid.appendChild(card));

        applyFilters();
    };


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
       VIEW TOGGLE
    ========================== */

    viewToggles.forEach(btn => {

        btn.addEventListener("click", () => {

            viewToggles.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            currentView = btn.dataset.view;

            if (currentView === "table") {
                grid.hidden = true;
                tableCard.hidden = false;
                renderTable();
            } else {
                grid.hidden = false;
                tableCard.hidden = true;
            }

        });

    });


    /* =========================
       TABLE RENDER
    ========================== */

    function renderTable() {

        tableBody.innerHTML = "";

        getCards().forEach(card => {

            const status    = card.dataset.status;
            const name      = card.dataset.name;
            const price     = card.dataset.price;
            const rating    = card.dataset.rating;
            const location  = card.querySelector(".package-meta span:last-child")?.innerText.trim() || "";
            const duration  = card.querySelector(".package-meta span:first-child")?.innerText.trim() || "";

            const statusLabel =
                status.charAt(0).toUpperCase() + status.slice(1);

            const tr = document.createElement("tr");
            tr.dataset.status = status;

            tr.innerHTML = `
                <td>
                    <input type="checkbox" class="table-select" aria-label="Select ${name}">
                </td>
                <td><strong>${name}</strong></td>
                <td>${location}</td>
                <td>${duration}</td>
                <td>₱${Number(price).toLocaleString()}</td>
                <td>
                    <span class="package-rating" style="display:inline-flex;">
                        <i data-lucide="star" aria-hidden="true"></i>
                        ${rating && rating !== "0" ? rating : "—"}
                    </span>
                </td>
                <td><span class="package-badge ${status}">${statusLabel}</span></td>
                <td class="td-actions">
                    <button class="icon-button view-button" title="View">
                        <i data-lucide="eye"></i>
                    </button>
                    <button class="icon-button edit-button" title="Edit">
                        <i data-lucide="pencil"></i>
                    </button>
                    <button class="icon-button delete-button" title="Delete">
                        <i data-lucide="trash-2"></i>
                    </button>
                </td>
            `;

            tableBody.appendChild(tr);

        });

        refreshIcons();
        attachTableActions();
        applyFilters();
    }


    function attachTableActions() {

        tableBody.querySelectorAll(".view-button").forEach(btn => {
            btn.addEventListener("click", () => {
                const row  = btn.closest("tr");
                const name = row.querySelector("strong").textContent;
                showToast("Viewing: " + name, "info");
            });
        });

        tableBody.querySelectorAll(".edit-button").forEach(btn => {
            btn.addEventListener("click", () => {
                const row  = btn.closest("tr");
                const name = row.querySelector("strong").textContent;
                openEditModalByName(name);
            });
        });

        tableBody.querySelectorAll(".delete-button").forEach(btn => {
            btn.addEventListener("click", () => {
                const row  = btn.closest("tr");
                const name = row.querySelector("strong").textContent;
                openDeleteModalByName(name);
            });
        });

    }


    /* =========================
       MODALS
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


    function resetForm() {
        packageForm.reset();
        packageIdInput.value = "";
        document.querySelectorAll(".form-group.error").forEach(g =>
            g.classList.remove("error"));
        document.querySelectorAll(".field-error").forEach(e =>
            e.textContent = "");
    }


    function openAddModal() {

        resetForm();

        packageModalTitle.textContent = "Add Tour Package";
        packageModalSub.textContent   = "Create a new tour package for your customers.";
        modalSaveLabel.textContent    = "Save Package";

        openModal(packageModal);

    }


    function openEditModalByName(name) {

        const card = getCards().find(c =>
            c.dataset.name === name);

        if (!card) return;

        resetForm();

        packageModalTitle.textContent = "Edit Tour Package";
        packageModalSub.textContent   = "Update the details of this package.";
        modalSaveLabel.textContent    = "Update Package";

        packageIdInput.value            = card.dataset.id || "";
        packageName.value               = card.dataset.name || "";
        packageDescription.value        = card.querySelector(".package-desc")?.textContent.trim() || "";
        packageLocation.value           = card.querySelector(".package-meta span:last-child")?.textContent.trim() || "";
        packageDuration.value           = card.querySelector(".package-meta span:first-child")?.textContent.trim() || "";
        packagePrice.value              = card.dataset.price || "";
        packageStatus.value             = card.dataset.status || "active";

        openModal(packageModal);

    }


    // Buttons
    document.getElementById("addPackageButton")
        ?.addEventListener("click", openAddModal);

    document.getElementById("emptyAddButton")
        ?.addEventListener("click", openAddModal);

    document.getElementById("modalCloseButton")
        ?.addEventListener("click", () => closeModal(packageModal));

    document.getElementById("modalCancelButton")
        ?.addEventListener("click", () => closeModal(packageModal));


    // Close on backdrop click
    packageModal?.addEventListener("click", (e) => {
        if (e.target === packageModal) closeModal(packageModal);
    });

    deleteModal?.addEventListener("click", (e) => {
        if (e.target === deleteModal) closeModal(deleteModal);
    });


    /* =========================
       SAVE PACKAGE
    ========================== */

    document.getElementById("modalSaveButton")
        ?.addEventListener("click", () => {

            const name     = document.getElementById("packageName").value.trim();
            const location = document.getElementById("packageLocation").value.trim();
            const duration = document.getElementById("packageDuration").value;
            const price    = document.getElementById("packagePrice").value.trim();
            const id       = packageIdInput.value;

            // Validate
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

            setError("packageName",     !name     ? "Name is required." : "");
            setError("packageLocation", !location ? "Location is required." : "");
            setError("packageDuration", !duration ? "Duration is required." : "");
            setError("packagePrice",    !price    ? "Price is required." : "");

            if (!valid) return;


            if (id) {
                // Update existing card
                const card = getCards().find(c => c.dataset.id === id);

                if (card) {
                    card.dataset.name     = name;
                    card.dataset.price    = price;
                    card.dataset.status   = packageStatus.value;

                    card.querySelector("h3").textContent = name;
                    card.querySelector(".package-desc").textContent =
                        packageDescription.value || "";

                    // Update meta
                    const metas = card.querySelectorAll(".package-meta span");
                    if (metas[0]) metas[0].innerHTML =
                        `<i data-lucide="clock-3"></i> ${duration}`;
                    if (metas[1]) metas[1].innerHTML =
                        `<i data-lucide="map-pin"></i> ${location}`;

                    // Update price
                    card.querySelector(".package-price-tag strong").textContent =
                        "₱" + Number(price).toLocaleString();

                    // Update status badge
                    const badge = card.querySelector(".package-badge");
                    badge.className = "package-badge " + packageStatus.value;
                    badge.textContent = packageStatus.value.charAt(0).toUpperCase()
                                      + packageStatus.value.slice(1);

                    // Update thumb class
                    const thumb = card.querySelector(".package-thumb");
                    thumb.className = "package-thumb " + (packageStatus.value === "active" ? "" : packageStatus.value);

                    refreshIcons();
                    showToast("Package updated successfully.", "success");
                }

            } else {
                // Add new card
                const newCard = document.createElement("article");
                newCard.className = "package-card";
                newCard.tabIndex = 0;
                newCard.dataset.id       = Date.now().toString();
                newCard.dataset.name     = name;
                newCard.dataset.status   = packageStatus.value;
                newCard.dataset.price    = price;
                newCard.dataset.rating   = "0";
                newCard.dataset.duration = duration;
                newCard.dataset.created  = new Date().toISOString().slice(0,10);

                newCard.innerHTML = `
                    <label class="package-checkbox">
                        <input type="checkbox" class="package-select">
                        <span></span>
                    </label>
                    <div class="package-thumb ${packageStatus.value === "active" ? "" : packageStatus.value}">
                        <span class="package-badge ${packageStatus.value}">
                            ${packageStatus.value.charAt(0).toUpperCase() + packageStatus.value.slice(1)}
                        </span>
                        <i data-lucide="map-pin"></i>
                    </div>
                    <div class="package-body">
                        <div class="package-head">
                            <h3>${name}</h3>
                            <span class="package-rating muted">
                                <i data-lucide="star"></i> —
                            </span>
                        </div>
                        <p class="package-desc">${packageDescription.value || ""}</p>
                        <div class="package-meta">
                            <span><i data-lucide="clock-3"></i> ${duration}</span>
                            <span><i data-lucide="map-pin"></i> ${location}</span>
                        </div>
                        <div class="package-footer">
                            <div class="package-price-tag">
                                <strong>₱${Number(price).toLocaleString()}</strong>
                                <small>/head</small>
                            </div>
                            <div class="package-actions">
                                <button class="icon-button view-button" title="View"><i data-lucide="eye"></i></button>
                                <button class="icon-button edit-button" title="Edit"><i data-lucide="pencil"></i></button>
                                <button class="icon-button delete-button" title="Delete"><i data-lucide="trash-2"></i></button>
                            </div>
                        </div>
                    </div>
                `;

                grid.appendChild(newCard);
                attachCardActions(newCard);
                refreshIcons();

                showToast("Package added successfully.", "success");
            }

            closeModal(packageModal);
            updateStats();
            applySort();

        });


    /* =========================
       DELETE MODAL
    ========================== */

    function openDeleteModal(card) {

        pendingDelete = card;

        const name = card.dataset.name || "Package";
        deletePackageName.textContent = name;

        openModal(deleteModal);

    }


    function openDeleteModalByName(name) {

        const card = getCards().find(c => c.dataset.name === name);
        if (card) openDeleteModal(card);

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

            showToast("Package deleted.", "success");

        });


    /* =========================
       CARD ACTIONS
    ========================== */

    function attachCardActions(card) {

        // Select checkbox
        const checkbox = card.querySelector(".package-select");

        checkbox?.addEventListener("change", () => {

            if (checkbox.checked) {
                card.classList.add("selected");
                selectedCards.add(card);
            } else {
                card.classList.remove("selected");
                selectedCards.delete(card);
            }

            updateBulkBar();

        });


        // View
        card.querySelector(".view-button")?.addEventListener("click", () => {
            showToast("Viewing: " + card.dataset.name, "info");
        });


        // Edit
        card.querySelector(".edit-button")?.addEventListener("click", () => {
            openEditModalByName(card.dataset.name);
        });


        // Delete
        card.querySelector(".delete-button")?.addEventListener("click", () => {
            openDeleteModal(card);
        });

    }


    // Attach to existing cards
    getCards().forEach(card => attachCardActions(card));


    /* =========================
       BULK ACTIONS
    ========================== */

    function updateBulkBar() {

        const count = selectedCards.size;

        bulkCount.textContent = count;
        bulkBar.hidden = count === 0;

    }


    document.querySelectorAll("[data-bulk-action]").forEach(btn => {

        btn.addEventListener("click", () => {

            const action = btn.dataset.bulkAction;

            if (action === "clear") {
                selectedCards.forEach(card => {
                    card.classList.remove("selected");
                    const cb = card.querySelector(".package-select");
                    if (cb) cb.checked = false;
                });
                selectedCards.clear();
                updateBulkBar();
                return;
            }

            if (action === "delete") {

                if (!confirm(`Delete ${selectedCards.size} package(s)?`)) return;

                selectedCards.forEach(card => card.remove());
                selectedCards.clear();
                updateBulkBar();
                updateStats();
                applyFilters();
                showToast("Packages deleted.", "success");
                return;

            }

            selectedCards.forEach(card => {

                if (action === "activate") {
                    card.dataset.status = "active";
                    const badge = card.querySelector(".package-badge");
                    badge.className = "package-badge active";
                    badge.textContent = "Active";
                }

                if (action === "archive") {
                    card.dataset.status = "archived";
                    const badge = card.querySelector(".package-badge");
                    badge.className = "package-badge archived";
                    badge.textContent = "Archived";
                }

            });

            updateStats();
            applyFilters();

            showToast(
                `${selectedCards.size} package(s) ${action}d.`,
                "success"
            );

        });

    });


    /* =========================
       SELECT ALL (table view)
    ========================== */

    document.getElementById("selectAllTable")
        ?.addEventListener("change", (e) => {

            tableBody.querySelectorAll(".table-select")
                .forEach(cb => cb.checked = e.target.checked);

        });


    /* =========================
       EXPORT
    ========================== */

    document.getElementById("exportPackagesButton")
        ?.addEventListener("click", () => {
            showToast("Exporting packages as CSV...", "info");
        });


    /* =========================
       NOTIFICATIONS
    ========================== */

    document.getElementById("notificationButton")
        ?.addEventListener("click", () => {
            showToast("You have 3 new notifications.", "info");
        });


    /* =========================
       LOGOUT
    ========================== */

    document.getElementById("logoutButton")
        ?.addEventListener("click", () => {
            if (confirm("Are you sure you want to logout?")) {
                showToast("Logging out...", "success");
            }
        });


    /* =========================
       ADMIN PROFILE
    ========================== */

    document.getElementById("adminProfileButton")
        ?.addEventListener("click", () => {
            showToast("Admin profile menu", "info");
        });


    /* =========================
       KEYBOARD SHORTCUT: "/"
    ========================== */

    document.addEventListener("keydown", (e) => {

        if (e.key === "/" &&
            document.activeElement.tagName !== "INPUT" &&
            document.activeElement.tagName !== "TEXTAREA") {
            e.preventDefault();
            searchInput?.focus();
        }

        if (e.key === "Escape") {
            if (!packageModal.hidden) closeModal(packageModal);
            if (!deleteModal.hidden)  closeModal(deleteModal);
        }

    });


    /* =========================
       INIT
    ========================== */

    updateStats();
    applySort();

});