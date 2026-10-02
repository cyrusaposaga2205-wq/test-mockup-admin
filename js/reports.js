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
       PERIOD DATA
    ========================== */

    const periodData = {

        "7d": {
            subtitle: "Daily earnings this week",
            revenue: 482340,
            revenueCompare: "vs ₱428,720 last period",
            bookings: 248,
            bookingsCompare: "vs 229 last period",
            guests: 892,
            guestsCompare: "vs 771 last period",
            rating: "4.9",
            changeRevenue: "12.5%",
            changeBookings: "8.2%",
            changeGuests: "15.7%",
            changeRating: "0.2",
            bars: [
                { label: "Mon", value: 42 },
                { label: "Tue", value: 68 },
                { label: "Wed", value: 55 },
                { label: "Thu", value: 80 },
                { label: "Fri", value: 92 },
                { label: "Sat", value: 76 },
                { label: "Sun", value: 60 }
            ],
            yAxis: ["₱80k", "₱60k", "₱40k", "₱20k", "₱0"],
            status: { confirmed: 142, pending: 58, completed: 36, cancelled: 12 }
        },

        "30d": {
            subtitle: "Weekly earnings this month",
            revenue: 1924500,
            revenueCompare: "vs ₱1,748,200 last period",
            bookings: 1024,
            bookingsCompare: "vs 942 last period",
            guests: 3580,
            guestsCompare: "vs 3,120 last period",
            rating: "4.8",
            changeRevenue: "10.1%",
            changeBookings: "8.7%",
            changeGuests: "14.7%",
            changeRating: "0.1",
            bars: [
                { label: "W1", value: 65 },
                { label: "W2", value: 72 },
                { label: "W3", value: 60 },
                { label: "W4", value: 78 },
                { label: "W5", value: 85 },
                { label: "W6", value: 90 },
                { label: "W7", value: 70 },
                { label: "W8", value: 82 },
                { label: "W9", value: 74 },
                { label: "W10", value: 88 }
            ],
            yAxis: ["₱300k", "₱225k", "₱150k", "₱75k", "₱0"],
            status: { confirmed: 592, pending: 240, completed: 148, cancelled: 44 }
        },

        "90d": {
            subtitle: "Monthly earnings this quarter",
            revenue: 5782300,
            revenueCompare: "vs ₱5,240,100 last period",
            bookings: 3012,
            bookingsCompare: "vs 2,812 last period",
            guests: 10240,
            guestsCompare: "vs 9,180 last period",
            rating: "4.8",
            changeRevenue: "10.3%",
            changeBookings: "7.1%",
            changeGuests: "11.5%",
            changeRating: "0.1",
            bars: [
                { label: "Jan", value: 58 },
                { label: "Feb", value: 65 },
                { label: "Mar", value: 72 },
                { label: "Apr", value: 80 },
                { label: "May", value: 88 },
                { label: "Jun", value: 75 },
                { label: "Jul", value: 82 },
                { label: "Aug", value: 90 },
                { label: "Sep", value: 85 },
                { label: "Oct", value: 78 },
                { label: "Nov", value: 92 },
                { label: "Dec", value: 88 }
            ],
            yAxis: ["₱800k", "₱600k", "₱400k", "₱200k", "₱0"],
            status: { confirmed: 1732, pending: 690, completed: 452, cancelled: 138 }
        },

        "1y": {
            subtitle: "Full year performance",
            revenue: 22458900,
            revenueCompare: "vs ₱19,840,000 last year",
            bookings: 12480,
            bookingsCompare: "vs 10,920 last year",
            guests: 41320,
            guestsCompare: "vs 36,480 last year",
            rating: "4.9",
            changeRevenue: "13.2%",
            changeBookings: "14.3%",
            changeGuests: "13.3%",
            changeRating: "0.2",
            bars: [
                { label: "Jan", value: 55 },
                { label: "Feb", value: 62 },
                { label: "Mar", value: 70 },
                { label: "Apr", value: 78 },
                { label: "May", value: 84 },
                { label: "Jun", value: 82 },
                { label: "Jul", value: 88 },
                { label: "Aug", value: 92 },
                { label: "Sep", value: 86 },
                { label: "Oct", value: 90 },
                { label: "Nov", value: 94 },
                { label: "Dec", value: 98 }
            ],
            yAxis: ["₱2M", "₱1.5M", "₱1M", "₱500k", "₱0"],
            status: { confirmed: 7182, pending: 2860, completed: 1888, cancelled: 550 }
        }

    };


    /* =========================
       ELEMENTS
    ========================== */

    const periodTabs        = document.querySelectorAll(".period-tab");
    const chartEl           = document.getElementById("revenueChart");
    const yAxisEl           = document.getElementById("revenueYAxis");
    const chartTotal        = document.getElementById("revenueChartTotal");
    const chartSubtitle     = document.getElementById("revenueChartSubtitle");

    const kpiRevenue        = document.getElementById("kpiRevenue");
    const kpiBookings       = document.getElementById("kpiBookings");
    const kpiGuests         = document.getElementById("kpiGuests");
    const kpiRating         = document.getElementById("kpiRating");

    const kpiRevenueCompare = document.getElementById("kpiRevenueCompare");
    const kpiBookingsCompare = document.getElementById("kpiBookingsCompare");
    const kpiGuestsCompare  = document.getElementById("kpiGuestsCompare");

    const changeRevenue     = document.getElementById("changeRevenue");
    const changeBookings    = document.getElementById("changeBookings");
    const changeGuests      = document.getElementById("changeGuests");
    const changeRating      = document.getElementById("changeRating");

    // Donut
    const statusDonut       = document.getElementById("statusDonut");
    const donutTotal        = document.getElementById("donutTotal");
    const legendConfirmed   = document.getElementById("legendConfirmed");
    const legendPending     = document.getElementById("legendPending");
    const legendCompleted   = document.getElementById("legendCompleted");
    const legendCancelled   = document.getElementById("legendCancelled");
    const legendConfirmedPct = document.getElementById("legendConfirmedPct");
    const legendPendingPct   = document.getElementById("legendPendingPct");
    const legendCompletedPct = document.getElementById("legendCompletedPct");
    const legendCancelledPct = document.getElementById("legendCancelledPct");

    // Search / table
    const searchInput       = document.getElementById("globalSearch");
    const transactionsBody  = document.getElementById("transactionsBody");
    const emptyState        = document.getElementById("emptyState");


    /* =========================
       HELPERS
    ========================== */

    const formatMoney = (n) =>
        "₱" + Number(n).toLocaleString("en-PH");

    const formatNumber = (n) =>
        Number(n).toLocaleString("en-PH");


    /* =========================
       ANIMATED COUNTERS
    ========================== */

    function animateValue(el, from, to, duration = 700, formatter = formatNumber) {

        if (!el) return;

        const start = performance.now();

        function update(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = from + (to - from) * eased;
            el.textContent = formatter(Math.round(current));

            if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
    }


    /* =========================
       RENDER CHART
    ========================== */

    function renderChart(period) {

        const data = periodData[period];
        if (!data) return;

        // Clear
        chartEl.innerHTML = "";
        yAxisEl.innerHTML = "";

        // Y-axis
        data.yAxis.forEach(label => {
            const span = document.createElement("span");
            span.textContent = label;
            yAxisEl.appendChild(span);
        });

        // Bars
        data.bars.forEach(item => {
            const col = document.createElement("div");
            col.className = "chart-col";

            const bar = document.createElement("div");
            bar.className = "chart-bar";
            bar.style.height = item.value + "%";
            bar.dataset.value = item.value + "%";
            bar.title = item.label + ": " + item.value + "%";

            const label = document.createElement("span");
            label.textContent = item.label;

            col.appendChild(bar);
            col.appendChild(label);

            chartEl.appendChild(col);
        });

    }


    /* =========================
       RENDER KPIs
    ========================== */

    function renderKPIs(period) {

        const data = periodData[period];
        if (!data) return;

        chartSubtitle.textContent = data.subtitle;
        chartTotal.textContent    = formatMoney(data.revenue);

        // Revenue (with ₱ prefix)
        const currentRev = Number(kpiRevenue.textContent.replace(/[^0-9]/g, "")) || 0;
        animateValue(kpiRevenue, currentRev, data.revenue, 700, formatMoney);

        // Bookings
        const currentBookings = Number(kpiBookings.textContent) || 0;
        animateValue(kpiBookings, currentBookings, data.bookings, 700, formatNumber);

        // Guests
        const currentGuests = Number(kpiGuests.textContent) || 0;
        animateValue(kpiGuests, currentGuests, data.guests, 700, formatNumber);

        // Rating
        kpiRating.textContent = data.rating;

        // Comparisons
        kpiRevenueCompare.textContent  = data.revenueCompare;
        kpiBookingsCompare.textContent = data.bookingsCompare;
        kpiGuestsCompare.textContent   = data.guestsCompare;

        // Change badges
        changeRevenue.querySelector("svg + *")?.remove();
        changeRevenue.childNodes[1].textContent = " " + data.changeRevenue;

        changeBookings.childNodes[1].textContent = " " + data.changeBookings;
        changeGuests.childNodes[1].textContent   = " " + data.changeGuests;
        changeRating.childNodes[1].textContent   = " " + data.changeRating;

    }


    /* =========================
       RENDER DONUT
    ========================== */

    function renderDonut(period) {

        const data = periodData[period];
        if (!data) return;

        const { confirmed, pending, completed, cancelled } = data.status;

        const total = confirmed + pending + completed + cancelled;

        const p1 = (confirmed / total) * 100;
        const p2 = p1 + (pending / total) * 100;
        const p3 = p2 + (completed / total) * 100;

        statusDonut.style.background = `
            conic-gradient(
                var(--green) 0% ${p1}%,
                var(--yellow) ${p1}% ${p2}%,
                var(--blue) ${p2}% ${p3}%,
                var(--red) ${p3}% 100%
            )
        `;

        donutTotal.textContent = formatNumber(total);

        legendConfirmed.textContent = formatNumber(confirmed);
        legendPending.textContent   = formatNumber(pending);
        legendCompleted.textContent = formatNumber(completed);
        legendCancelled.textContent = formatNumber(cancelled);

        legendConfirmedPct.textContent = Math.round(p1) + "%";
        legendPendingPct.textContent   = Math.round(p2 - p1) + "%";
        legendCompletedPct.textContent = Math.round(p3 - p2) + "%";
        legendCancelledPct.textContent = Math.round(100 - p3) + "%";

    }


    /* =========================
       PERIOD SWITCHING
    ========================== */

    periodTabs.forEach(tab => {
        tab.addEventListener("click", () => {

            periodTabs.forEach(t => {
                t.classList.remove("active");
                t.setAttribute("aria-selected", "false");
            });

            tab.classList.add("active");
            tab.setAttribute("aria-selected", "true");

            const period = tab.dataset.period;

            renderChart(period);
            renderKPIs(period);
            renderDonut(period);

            showToast("Showing data for: " + period.toUpperCase(), "info", 1800);

        });
    });


    /* =========================
       SEARCH
    ========================== */

    if (searchInput) {

        searchInput.addEventListener("input", () => {

            const keyword = searchInput.value.toLowerCase().trim();
            const rows = transactionsBody.querySelectorAll("tr");

            let visible = 0;

            rows.forEach(row => {
                const text = row.innerText.toLowerCase();
                const match = !keyword || text.includes(text) || text.includes(keyword);
                row.style.display = match ? "" : "none";
                if (match) visible++;
            });

            emptyState.hidden = visible !== 0;

        });

    }


    /* =========================
       EXPORT / PRINT
    ========================== */

    document.getElementById("exportReportButton")
        ?.addEventListener("click", () => {
            showToast("Exporting report as CSV...", "success");
            // Later: build and download a CSV
        });


    document.getElementById("printReportButton")
        ?.addEventListener("click", () => {
            showToast("Preparing to print...", "info");
            setTimeout(() => window.print(), 400);
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
       CHART BAR HOVER (chart tooltip already handled via CSS)
    ========================== */

    // Bonus: clicking a bar shows its value
    chartEl?.addEventListener("click", (e) => {
        const bar = e.target.closest(".chart-bar");
        if (!bar) return;

        showToast("Revenue: " + bar.dataset.value + " of peak", "info", 1800);
    });


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

        if (e.key === "Escape" && document.activeElement === searchInput) {
            searchInput.value = "";
            searchInput.dispatchEvent(new Event("input"));
            searchInput.blur();
        }

    });


    /* =========================
       INIT
    ========================== */

    renderChart("7d");
    renderKPIs("7d");
    renderDonut("7d");

});