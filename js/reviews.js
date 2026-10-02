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

    const list          = document.getElementById("reviewsList");
    const emptyState    = document.getElementById("emptyState");
    const searchInput   = document.getElementById("globalSearch");
    const sortSelect    = document.getElementById("sortSelect");
    const filterTabs    = document.querySelectorAll(".filter-tab");
    const bulkBar       = document.getElementById("bulkBar");
    const bulkCount     = document.getElementById("bulkCount");

    // Summary
    const ratingScore = document.getElementById("ratingScore");
    const ratingStars = document.getElementById("ratingStars");
    const ratingCount = document.getElementById("ratingCount");
    const count1 = document.getElementById("count1");
    const count2 = document.getElementById("count2");
    const count3 = document.getElementById("count3");
    const count4 = document.getElementById("count4");
    const count5 = document.getElementById("count5");

    // Tab counts
    const countAll           = document.getElementById("countAll");
    const tabCount5          = document.getElementById("tabCount5");
    const tabCount4          = document.getElementById("tabCount4");
    const tabCount3          = document.getElementById("tabCount3");
    const tabCountUnreplied  = document.getElementById("tabCountUnreplied");
    const tabCountFlagged    = document.getElementById("tabCountFlagged");

    // Reply modal
    const replyModal           = document.getElementById("replyModal");
    const replyCustomerAvatar  = document.getElementById("replyCustomerAvatar");
    const replyCustomerName    = document.getElementById("replyCustomerName");
    const replyCustomerMeta    = document.getElementById("replyCustomerMeta");
    const replyOriginalText    = document.getElementById("replyOriginalText");
    const replyText            = document.getElementById("replyText");
    const replyTextError       = document.getElementById("replyTextError");

    // Delete modal
    const deleteModal        = document.getElementById("deleteModal");
    const deleteReviewName   = document.getElementById("deleteReviewName");


    /* =========================
       STATE
    ========================== */

    let currentFilter = "all";
    let currentSort   = "newest";
    let activeReview  = null;
    let pendingDelete = null;
    let selectedCards = new Set();


    /* =========================
       HELPERS
    ========================== */

    const cards = () => Array.from(document.querySelectorAll(".review-card"));

    const getInitial = (name) =>
        (name || "?").trim().charAt(0).toUpperCase();


    /* =========================
       UPDATE RATING SUMMARY
    ========================== */

    function updateSummary() {

        const list2 = cards();
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        let totalRating = 0;
        let unreplied = 0;
        let flagged = 0;

        list2.forEach(card => {
            const r = Number(card.dataset.rating);
            if (r in counts) counts[r]++;

            totalRating += r;

            if (card.dataset.replied === "false") unreplied++;
            if (card.dataset.flagged === "true") flagged++;
        });

        const total = list2.length;
        const avg = total ? (totalRating / total) : 0;

        ratingScore.textContent = avg.toFixed(1);

        // Stars
        const full = Math.round(avg);
        ratingStars.textContent = "★".repeat(full) + "☆".repeat(5 - full);

        ratingCount.textContent = total;

        // Bars
        count5.textContent = counts[5];
        count4.textContent = counts[4];
        count3.textContent = counts[3];
        count2.textContent = counts[2];
        count1.textContent = counts[1];

        document.querySelectorAll(".rating-bar-row").forEach(row => {
            const stars = row.dataset.stars;
            const pct = total ? (counts[stars] / total) * 100 : 0;
            row.querySelector(".rating-bar-fill").style.width = pct + "%";
        });

        // Tab counts
        countAll.textContent          = total;
        tabCount5.textContent         = counts[5];
        tabCount4.textContent         = counts[4];
        tabCount3.textContent         = counts[3];
        tabCountUnreplied.textContent = unreplied;
        tabCountFlagged.textContent   = flagged;

        // Sidebar badge
        const badge = document.getElementById("reviewsBadge");
        if (badge) badge.textContent = total;
    }


    /* =========================
       FILTER / SEARCH / SORT
    ========================== */

    function applyFilters() {

        const keyword = (searchInput?.value || "").toLowerCase().trim();
        let visible = 0;

        cards().forEach(card => {

            const rating = card.dataset.rating;
            const replied = card.dataset.replied === "true";
            const flagged = card.dataset.flagged === "true";
            const text = card.innerText.toLowerCase();

            let matchesFilter = true;

            if (currentFilter === "unreplied") matchesFilter = !replied;
            else if (currentFilter === "flagged") matchesFilter = flagged;
            else if (currentFilter !== "all") matchesFilter = rating === currentFilter;

            const matchesSearch = !keyword || text.includes(keyword);

            const show = matchesFilter && matchesSearch;
            card.style.display = show ? "" : "none";
            if (show) visible++;
        });

        emptyState.hidden = visible !== 0;
    }


    function applySort() {

        const sorted = cards().sort((a, b) => {

            const rA = Number(a.dataset.rating);
            const rB = Number(b.dataset.rating);

            const dA = new Date(a.dataset.created);
            const dB = new Date(b.dataset.created);

            switch (currentSort) {
                case "oldest":  return dA - dB;
                case "highest": return rB - rA;
                case "lowest":  return rA - rB;
                default:        return dB - dA;
            }
        });

        sorted.forEach(c => list.appendChild(c));
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
       REPLY MODAL
    ========================== */

    const templates = {
        thankyou: "Thank you so much for your kind words! We're thrilled you enjoyed your tour with us. We hope to welcome you back soon!",
        apology: "We sincerely apologize for the inconvenience. Your feedback is very important to us and we'll do our best to improve. We hope to have the chance to serve you better next time.",
        invite: "Thank you for choosing Uncle Ron's! We'd love to welcome you on another tour soon. As a returning customer, you'll enjoy a special discount on your next booking.",
        followup: "Thank you for your feedback. Our team will reach out to you shortly to discuss this further and make things right."
    };


    function openReplyModal(card) {

        activeReview = card;

        const name = card.dataset.customer;
        const rating = card.dataset.rating;
        const packageName = card.dataset.package;

        replyCustomerAvatar.textContent = getInitial(name);
        replyCustomerName.textContent = name;
        replyCustomerMeta.textContent = `${"★".repeat(Number(rating))} · ${packageName}`;
        replyOriginalText.textContent = card.querySelector(".review-card-body p").textContent.trim();

        replyText.value = "";
        replyTextError.textContent = "";

        openModal(replyModal);
        setTimeout(() => replyText.focus(), 100);
    }


    document.querySelectorAll(".template-button").forEach(btn => {
        btn.addEventListener("click", () => {
            const key = btn.dataset.template;
            if (templates[key]) replyText.value = templates[key];
        });
    });


    document.getElementById("replySendButton")
        ?.addEventListener("click", () => {

            const text = replyText.value.trim();

            if (!text) {
                replyTextError.textContent = "Please write a reply before sending.";
                return;
            }

            if (!activeReview) return;

            // Remove existing reply
            const existing = activeReview.querySelector(".review-reply");
            if (existing) existing.remove();

            // Add new reply
            const replyBlock = document.createElement("div");
            replyBlock.className = "review-reply";
            replyBlock.innerHTML = `
                <div class="reply-label">
                    <i data-lucide="corner-down-right"></i>
                    Admin replied
                </div>
                <p></p>
            `;
            replyBlock.querySelector("p").textContent = text;

            activeReview.appendChild(replyBlock);
            activeReview.dataset.replied = "true";

            refreshIcons();
            updateSummary();
            applyFilters();

            closeModal(replyModal);
            showToast("Reply sent successfully.", "success");
        });


    document.getElementById("replyModalClose")
        ?.addEventListener("click", () => closeModal(replyModal));

    document.getElementById("replyCancelButton")
        ?.addEventListener("click", () => closeModal(replyModal));

    replyModal?.addEventListener("click", (e) => {
        if (e.target === replyModal) closeModal(replyModal);
    });


    /* =========================
       FLAG TOGGLE
    ========================== */

    function attachReviewActions(card) {

        // Select
        const cb = card.querySelector(".review-select");

        cb?.addEventListener("change", () => {
            if (cb.checked) {
                card.classList.add("selected");
                selectedCards.add(card);
            } else {
                card.classList.remove("selected");
                selectedCards.delete(card);
            }
            updateBulkBar();
        });


        // Reply
        card.querySelector(".reply-button")
            ?.addEventListener("click", () => openReplyModal(card));


        // Flag
        card.querySelector(".flag-button")
            ?.addEventListener("click", () => {

                const isFlagged = card.dataset.flagged === "true";
                const newFlag = !isFlagged;

                card.dataset.flagged = String(newFlag);

                // Update tag
                const tags = card.querySelector(".review-tags");
                const existingTag = tags.querySelector(".review-tag.flagged");

                if (newFlag && !existingTag) {
                    const tag = document.createElement("span");
                    tag.className = "review-tag flagged";
                    tag.textContent = "Flagged";
                    tags.appendChild(tag);
                } else if (!newFlag && existingTag) {
                    existingTag.remove();
                }

                updateSummary();
                applyFilters();

                showToast(
                    newFlag ? "Review flagged for moderation." : "Flag removed.",
                    newFlag ? "warning" : "info"
                );
            });


        // Delete
        card.querySelector(".delete-button")
            ?.addEventListener("click", () => {
                pendingDelete = card;
                deleteReviewName.textContent = card.dataset.customer;
                openModal(deleteModal);
            });
    }


    cards().forEach(attachReviewActions);


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
            updateSummary();
            applyFilters();

            showToast("Review deleted.", "success");
        });

    deleteModal?.addEventListener("click", (e) => {
        if (e.target === deleteModal) closeModal(deleteModal);
    });


    /* =========================
       BULK ACTIONS
    ========================== */

    function updateBulkBar() {
        bulkCount.textContent = selectedCards.size;
        bulkBar.hidden = selectedCards.size === 0;
    }


    document.querySelectorAll("[data-bulk-action]").forEach(btn => {

        btn.addEventListener("click", () => {

            const action = btn.dataset.bulkAction;

            if (action === "clear") {
                selectedCards.forEach(card => {
                    card.classList.remove("selected");
                    const cb = card.querySelector(".review-select");
                    if (cb) cb.checked = false;
                });
                selectedCards.clear();
                updateBulkBar();
                return;
            }

            if (action === "delete") {
                if (!confirm(`Delete ${selectedCards.size} review(s)?`)) return;

                selectedCards.forEach(card => card.remove());
                selectedCards.clear();
                updateBulkBar();
                updateSummary();
                applyFilters();
                showToast("Reviews deleted.", "success");
                return;
            }

            if (action === "flag") {
                selectedCards.forEach(card => {
                    card.dataset.flagged = "true";
                    if (!card.querySelector(".review-tag.flagged")) {
                        const tag = document.createElement("span");
                        tag.className = "review-tag flagged";
                        tag.textContent = "Flagged";
                        card.querySelector(".review-tags").appendChild(tag);
                    }
                });
                updateSummary();
                applyFilters();
                showToast(`${selectedCards.size} review(s) flagged.`, "warning");
                return;
            }

            if (action === "approve") {
                showToast(`${selectedCards.size} review(s) approved.`, "success");
            }

        });

    });


    /* =========================
       EXPORT / NOTIF / LOGOUT
    ========================== */

    document.getElementById("exportReviewsButton")
        ?.addEventListener("click", () => showToast("Exporting reviews as CSV...", "info"));

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
            if (!replyModal.hidden)  closeModal(replyModal);
            if (!deleteModal.hidden) closeModal(deleteModal);
        }

    });


    /* =========================
       INIT
    ========================== */

    updateSummary();
    applySort();

});