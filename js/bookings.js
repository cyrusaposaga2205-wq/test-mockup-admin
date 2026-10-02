document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       INIT
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
       ELEMENTS
    ========================== */

    const tbody           = document.getElementById("bookingsBody");
    const emptyState      = document.getElementById("emptyState");
    const searchInput     = document.getElementById("globalSearch");
    const sortSelect      = document.getElementById("sortSelect");
    const filterTabs      = document.querySelectorAll(".filter-tab");
    const bulkBar         = document.getElementById("bulkBar");
    const bulkCount       = document.getElementById("bulkCount");
    const selectAllBox    = document.getElementById("selectAllBookings");

    // Stats
    const statTotal     = document.getElementById("statTotal");
    const statPending   = document.getElementById("statPending");
    const statConfirmed = document.getElementById("statConfirmed");
    const statCompleted = document.getElementById("statCompleted");

    // Tab counts
    const countAll       = document.getElementById("countAll");
    const countPending   = document.getElementById("countPending");
    const countConfirmed = document.getElementById("countConfirmed");
    const countCompleted = document.getElementById("countCompleted");
    const countCancelled = document.getElementById("countCancelled");

    // Modal
    const bookingModal        = document.getElementById("bookingModal");
    const modalBookingId      = document.getElementById("modalBookingId");
    const modalBookingSub     = document.getElementById("modalBookingSubtitle");
    const statusStrip         = document.getElementById("statusStrip");
    const deleteModal         = document.getElementById("deleteModal");
    const deleteBookingName   = document.getElementById("deleteBookingName");

    // Detail fields
    const detailCustomer = document.getElementById("detailCustomer");
    const detailEmail    = document.getElementById("detailEmail");
    const detailPhone    = document.getElementById("detailPhone");
    const detailLocation = document.getElementById("detailLocation");
    const detailPackage  = document.getElementById("detailPackage");
    const detailTourDate = document.getElementById("detailTourDate");
    const detailDuration = document.getElementById("detailDuration");
    const detailPax      = document.getElementById("detailPax");
    const detailAmount   = document.getElementById("detailAmount");
    const detailPaid     = document.getElementById("detailPaid");
    const detailBalance  = document.getElementById("detailBalance");
    const detailGuide    = document.getElementById("detailGuide");
    const guideSelect    = document.getElementById("guideSelect");
    const bookingTimeline = document.getElementById("bookingTimeline");
    const bookingNotes   = document.getElementById("bookingNotes");

    const paymentFill = document.getElementById("paymentProgressFill");
    const paymentHint = document.getElementById("paymentHint");


    /* =========================
       STATE
    ========================== */

    let currentFilter    = "all";
    let currentSort      = "newest";
    let activeRow        = null;    // row currently open in detail modal
    let pendingDelete    = null;
    let selectedRows     = new Set();


    /* =========================
       HELPERS
    ========================== */

    const rows = () => Array.from(tbody.querySelectorAll("tr"));

    const formatMoney = (n) => "₱" + Number(n).toLocaleString("en-PH");

    const formatDate = (iso) => {
        if (!iso) return "—";
        const d = new Date(iso);
        return d.toLocaleDateString("en-PH", {
            year: "numeric", month: "short", day: "numeric"
        });
    };


    /* =========================
       STATS + COUNTS
    ========================== */

    function updateStats() {

        const list = rows();
        const c = { total: list.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };

        list.forEach(r => {
            const s = r.dataset.status;
            if (s in c) c[s]++;
        });

        statTotal.textContent     = c.total;
        statPending.textContent   = c.pending;
        statConfirmed.textContent = c.confirmed;
        statCompleted.textContent = c.completed;

        countAll.textContent       = c.total;
        countPending.textContent   = c.pending;
        countConfirmed.textContent = c.confirmed;
        countCompleted.textContent = c.completed;
        countCancelled.textContent = c.cancelled;

        document.getElementById("bookingsBadge").textContent = c.total;
    }


    /* =========================
       FILTER + SEARCH + SORT
    ========================== */

    function applyFilters() {

        const keyword = (searchInput?.value || "").toLowerCase().trim();
        let visible = 0;

        rows().forEach(row => {
            const status = row.dataset.status;
            const text   = row.innerText.toLowerCase();

            const matchesFilter =
                currentFilter === "all" || status === currentFilter;

            const matchesSearch =
                !keyword || text.includes(keyword);

            const show = matchesFilter && matchesSearch;
            row.style.display = show ? "" : "none";
            if (show) visible++;
        });

        emptyState.hidden = visible !== 0;
    }


    function applySort() {

        const sorted = rows().sort((a, b) => {

            const amtA = Number(a.dataset.amount) || 0;
            const amtB = Number(b.dataset.amount) || 0;

            const dateA = new Date(a.dataset.created);
            const dateB = new Date(b.dataset.created);

            const tourA = new Date(a.dataset.tourDate);
            const tourB = new Date(b.dataset.tourDate);

            const custA = (a.dataset.customer || "").toLowerCase();
            const custB = (b.dataset.customer || "").toLowerCase();

            switch (currentSort) {

                case "oldest":      return dateA - dateB;
                case "tour-date":   return tourA - tourB;
                case "amount-high": return amtB - amtA;
                case "amount-low":  return amtA - amtB;
                case "customer":    return custA.localeCompare(custB);
                default:            return dateB - dateA;   // newest
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
       OPEN BOOKING DETAIL
    ========================== */

    function openBookingDetail(row) {

        activeRow = row;

        const d = row.dataset;

        modalBookingId.textContent  = d.id;
        modalBookingSub.textContent = `${d.package} · ${d.customer}`;

        // Customer
        detailCustomer.textContent = d.customer || "—";
        detailEmail.textContent    = (d.customer || "").toLowerCase().replace(/\s+/g, ".") + "@email.com";
        detailPhone.textContent    = "+63 917 555 " + (d.id || "").slice(-4);
        detailLocation.textContent = "Cebu, Philippines";

        // Package
        detailPackage.textContent  = d.package || "—";
        detailTourDate.textContent = formatDate(d.tourDate);
        detailDuration.textContent = "Day Tour";    // placeholder
        detailPax.textContent      = (d.pax || "1") + " pax";

        // Payment
        const amount  = Number(d.amount) || 0;
        const paid    = Number(d.paid) || 0;
        const balance = Math.max(0, amount - paid);

        detailAmount.textContent  = formatMoney(amount);
        detailPaid.textContent    = formatMoney(paid);
        detailBalance.textContent = formatMoney(balance);

        const percent = amount ? Math.min(100, (paid / amount) * 100) : 0;
        paymentFill.style.width = percent + "%";
        paymentHint.textContent = percent.toFixed(0) + "% paid";

        // Guide
        detailGuide.textContent = d.guide || "Unassigned";
        guideSelect.value = d.guide || "";

        // Status pills
        statusStrip.querySelectorAll(".status-pill").forEach(pill => {
            pill.classList.toggle("active", pill.dataset.status === d.status);
        });

        // Timeline
        buildTimeline(d);

        // Notes
        bookingNotes.value = "";

        openModal(bookingModal);
    }


    function buildTimeline(d) {

        bookingTimeline.innerHTML = "";

        const created = new Date(d.created);
        const tour    = new Date(d.tourDate);

        const events = [
            {
                label: "Booking Created",
                date: created,
                state: "done"
            },
            {
                label: "Payment Received",
                date: new Date(created.getTime() + 86400000),
                state: Number(d.paid) > 0 ? "done" : "pending"
            },
            {
                label: "Guide Assigned",
                date: d.guide ? new Date(created.getTime() + 86400000 * 2) : null,
                state: d.guide ? "done" : "pending"
            },
            {
                label: "Tour Date",
                date: tour,
                state: d.status === "completed" ? "done" :
                       d.status === "cancelled" ? "pending" :
                       "current"
            },
            {
                label: "Completed",
                date: d.status === "completed" ? tour : null,
                state: d.status === "completed" ? "done" : "pending"
            }
        ];

        events.forEach(ev => {
            const li = document.createElement("li");
            li.className = ev.state === "done" ? "done" :
                           ev.state === "current" ? "current" : "";

            li.innerHTML = `
                <strong>${ev.label}</strong>
                <small>${ev.date ? ev.date.toLocaleDateString("en-PH", {
                    year: "numeric", month: "long", day: "numeric"
                }) : "Pending"}</small>
            `;

            bookingTimeline.appendChild(li);
        });
    }


    /* =========================
       ROW ACTIONS
    ========================== */

    function attachRowActions(row) {

        // Select checkbox
        const cb = row.querySelector(".row-select");

        cb?.addEventListener("change", () => {
            if (cb.checked) selectedRows.add(row);
            else selectedRows.delete(row);

            updateBulkBar();
        });


        // View
        row.querySelector(".view-button")?.addEventListener("click", () => {
            openBookingDetail(row);
        });


        // Edit
        row.querySelector(".edit-button")?.addEventListener("click", () => {
            openBookingDetail(row);
            showToast("Editing " + row.dataset.id, "info");
        });


        // Delete
        row.querySelector(".delete-button")?.addEventListener("click", () => {
            pendingDelete = row;
            deleteBookingName.textContent = row.dataset.id;
            openModal(deleteModal);
        });
    }


    // Attach to existing rows
    rows().forEach(attachRowActions);


    /* =========================
       STATUS PILL CLICK
    ========================== */

    statusStrip.querySelectorAll(".status-pill").forEach(pill => {

        pill.addEventListener("click", () => {

            if (!activeRow) return;

            const newStatus = pill.dataset.status;
            activeRow.dataset.status = newStatus;

            // Update badge in table
            const badge = activeRow.querySelector(".status");
            badge.className = "status " + newStatus;
            badge.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

            // Update strip
            statusStrip.querySelectorAll(".status-pill").forEach(p => {
                p.classList.toggle("active", p === pill);
            });

            updateStats();
            applyFilters();
            buildTimeline(activeRow.dataset);

            showToast("Status updated to " + newStatus, "success");

        });

    });


    /* =========================
       ASSIGN GUIDE
    ========================== */

    document.getElementById("assignGuideButton")
        ?.addEventListener("click", () => {

            if (!activeRow) return;

            const guide = guideSelect.value;

            activeRow.dataset.guide = guide;

            const tag = activeRow.querySelector(".guide-tag");

            if (guide) {
                tag.className = "guide-tag";
                tag.innerHTML = `<i data-lucide="user-round"></i> ${guide.split(" ")[0]}`;
            } else {
                tag.className = "guide-tag empty";
                tag.textContent = "Unassigned";
            }

            detailGuide.textContent = guide || "Unassigned";

            refreshIcons();
            showToast(guide ? "Assigned to " + guide : "Guide unassigned", "success");

        });


    /* =========================
       MODAL BUTTONS
    ========================== */

    document.getElementById("bookingModalClose")
        ?.addEventListener("click", () => closeModal(bookingModal));

    document.getElementById("modalCancelButton")
        ?.addEventListener("click", () => closeModal(bookingModal));

    document.getElementById("modalSaveButton")
        ?.addEventListener("click", () => {
            showToast("Booking changes saved.", "success");
            closeModal(bookingModal);
        });

    document.getElementById("printInvoiceButton")
        ?.addEventListener("click", () => {
            showToast("Preparing invoice...", "info");
            // Later: window.print();
        });

    document.getElementById("sendEmailButton")
        ?.addEventListener("click", () => {
            showToast("Email draft opened.", "info");
        });


    bookingModal?.addEventListener("click", (e) => {
        if (e.target === bookingModal) closeModal(bookingModal);
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

            showToast("Booking deleted.", "success");

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

            if (action === "cancel") {
                if (!confirm(`Cancel ${selectedRows.size} booking(s)?`)) return;
            }

            selectedRows.forEach(row => {

                row.dataset.status = action === "confirm" ? "confirmed"
                                   : action === "complete" ? "completed"
                                   : action === "cancel" ? "cancelled"
                                   : row.dataset.status;

                const badge = row.querySelector(".status");
                badge.className = "status " + row.dataset.status;
                badge.textContent = row.dataset.status.charAt(0).toUpperCase()
                                  + row.dataset.status.slice(1);

            });

            updateStats();
            applyFilters();

            showToast(`${selectedRows.size} booking(s) ${action}ed.`, "success");

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
       NEW BOOKING
    ========================== */

    document.getElementById("addBookingButton")
        ?.addEventListener("click", () => {
            showToast("Opening New Booking form...", "info");
            // Later: open a booking-creation modal
        });


    /* =========================
       EXPORT
    ========================== */

    document.getElementById("exportBookingsButton")
        ?.addEventListener("click", () => {
            showToast("Exporting bookings as CSV...", "info");
        });


    /* =========================
       NOTIFICATIONS / LOGOUT / PROFILE
    ========================== */

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
            if (!bookingModal.hidden) closeModal(bookingModal);
            if (!deleteModal.hidden)  closeModal(deleteModal);
        }

    });


    /* =========================
       INIT
    ========================== */

    updateStats();
    applySort();

});