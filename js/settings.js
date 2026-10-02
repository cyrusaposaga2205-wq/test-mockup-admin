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
       SETTINGS NAVIGATION
    ========================== */

    const navItems = document.querySelectorAll(".settings-nav-item");
    const sections = document.querySelectorAll(".settings-section");

    navItems.forEach(item => {
        item.addEventListener("click", () => {

            const sectionId = item.dataset.section;

            navItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            sections.forEach(sec => {
                sec.classList.toggle("active", sec.id === sectionId);
            });

            refreshIcons();

            // Scroll to top of panel on mobile
            if (window.innerWidth < 1000) {
                document.querySelector(".settings-panel")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });


    /* =========================
       THEME
    ========================== */

    const themeOptions = document.querySelectorAll(".theme-option");

    themeOptions.forEach(option => {
        option.addEventListener("click", () => {

            themeOptions.forEach(o => o.classList.remove("active"));
            option.classList.add("active");

            const theme = option.dataset.theme;

            document.body.dataset.theme = theme;

            if (theme === "dark") {
                document.body.classList.add("theme-dark");
            } else {
                document.body.classList.remove("theme-dark");
            }

            // Persist
            try {
                localStorage.setItem("adminTheme", theme);
            } catch (e) {}

            showToast(`Theme switched to ${theme}.`, "success");
        });
    });


    // Restore saved theme
    try {
        const savedTheme = localStorage.getItem("adminTheme");
        if (savedTheme) {
            const el = document.querySelector(`.theme-option[data-theme="${savedTheme}"]`);
            el?.click();
        }
    } catch (e) {}


    /* =========================
       ACCENT COLOR
    ========================== */

    const colorOptions = document.querySelectorAll(".color-option");

    colorOptions.forEach(option => {
        option.addEventListener("click", () => {

            colorOptions.forEach(o => o.classList.remove("active"));
            option.classList.add("active");

            const color = option.dataset.color;

            document.documentElement.style.setProperty("--blue", color);

            try {
                localStorage.setItem("adminAccent", color);
            } catch (e) {}

            showToast("Accent color updated.", "success");
        });
    });


    // Restore saved accent
    try {
        const savedAccent = localStorage.getItem("adminAccent");
        if (savedAccent) {
            document.documentElement.style.setProperty("--blue", savedAccent);
            document.querySelectorAll(".color-option").forEach(o => {
                o.classList.toggle("active", o.dataset.color === savedAccent);
            });
        }
    } catch (e) {}


    /* =========================
       SAVE ALL
    ========================== */

    document.getElementById("saveAllButton")
        ?.addEventListener("click", () => {

            const settings = {};

            // Text inputs, selects, textareas
            document.querySelectorAll(
                ".settings-section input:not([type='checkbox']):not([type='radio']), " +
                ".settings-section select, " +
                ".settings-section textarea"
            ).forEach(input => {
                const key = input.id || input.name;
                if (key) settings[key] = input.value;
            });

            // Checkboxes
            document.querySelectorAll(
                ".settings-section input[type='checkbox']"
            ).forEach(input => {
                const key = input.dataset.setting || input.id;
                if (key) settings[key] = input.checked;
            });

            console.log("Saved settings:", settings);

            showToast("All settings saved successfully.", "success");
        });


    /* =========================
       RESET
    ========================== */

    document.getElementById("resetSettingsButton")
        ?.addEventListener("click", () => {

            openConfirm({
                title: "Reset Settings?",
                message: "All unsaved changes will be discarded.",
                confirmLabel: "Reset",
                onConfirm: () => {
                    showToast("Settings reset.", "info");
                    // Optionally: window.location.reload();
                }
            });
        });


    /* =========================
       PROFILE PHOTO
    ========================== */

    const uploadPhotoButton = document.getElementById("uploadPhotoButton");
    const removePhotoButton = document.getElementById("removePhotoButton");
    const avatarInput       = document.getElementById("avatarInput");
    const profileAvatarLarge = document.querySelector(".profile-avatar-large");

    uploadPhotoButton?.addEventListener("click", () => {
        avatarInput?.click();
    });

    avatarInput?.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            showToast("File must be under 2MB.", "error");
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            if (profileAvatarLarge) {
                profileAvatarLarge.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            }
            showToast("Profile photo updated.", "success");
        };
        reader.readAsDataURL(file);
    });

    removePhotoButton?.addEventListener("click", () => {
        if (profileAvatarLarge) {
            profileAvatarLarge.textContent = "A";
        }
        if (avatarInput) avatarInput.value = "";
        showToast("Profile photo removed.", "info");
    });


    /* =========================
       PASSWORD TOGGLE
    ========================== */

    document.querySelectorAll(".toggle-password").forEach(btn => {

        btn.addEventListener("click", () => {

            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            if (!input) return;

            const isPassword = input.type === "password";
            input.type = isPassword ? "text" : "password";

            btn.innerHTML = `<i data-lucide="${isPassword ? "eye-off" : "eye"}"></i>`;
            refreshIcons();
        });
    });


    /* =========================
       PASSWORD STRENGTH
    ========================== */

    const newPasswordInput = document.getElementById("newPassword");
    const passwordStrength = document.getElementById("passwordStrength");

    newPasswordInput?.addEventListener("input", () => {

        const val = newPasswordInput.value;
        let score = 0;

        if (val.length >= 8) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;

        if (!val) {
            passwordStrength.textContent = "At least 8 characters";
            passwordStrength.className = "field-hint";
            return;
        }

        const levels = {
            1: { text: "Weak",       cls: "weak" },
            2: { text: "Fair",       cls: "" },
            3: { text: "Good",       cls: "" },
            4: { text: "Strong",     cls: "strong" }
        };

        const level = levels[score] || levels[1];
        passwordStrength.textContent = `Strength: ${level.text}`;
        passwordStrength.className = "field-hint " + level.cls;
    });


    /* =========================
       UPDATE PASSWORD
    ========================== */

    document.getElementById("updatePasswordButton")
        ?.addEventListener("click", () => {

            const current = document.getElementById("currentPassword").value.trim();
            const next    = document.getElementById("newPassword").value.trim();
            const confirm = document.getElementById("confirmPassword").value.trim();

            if (!current || !next || !confirm) {
                showToast("Please fill in all password fields.", "warning");
                return;
            }

            if (next !== confirm) {
                showToast("New passwords do not match.", "error");
                return;
            }

            if (next.length < 8) {
                showToast("Password must be at least 8 characters.", "error");
                return;
            }

            document.getElementById("currentPassword").value = "";
            document.getElementById("newPassword").value = "";
            document.getElementById("confirmPassword").value = "";

            passwordStrength.textContent = "At least 8 characters";
            passwordStrength.className = "field-hint";

            showToast("Password updated successfully.", "success");
        });


    /* =========================
       CONFIRM MODAL
    ========================== */

    const confirmModal = document.getElementById("confirmModal");
    const confirmModalTitle = document.getElementById("confirmModalTitle");
    const confirmModalSub = document.getElementById("confirmModalSubtitle");
    const confirmTitle = document.getElementById("confirmTitle");
    const confirmMessage = document.getElementById("confirmMessage");
    const confirmOkButton = document.getElementById("confirmOkButton");

    let confirmCallback = null;

    function openConfirm({ title, message, confirmLabel = "Confirm", onConfirm }) {

        confirmTitle.textContent = title;
        confirmMessage.textContent = message;
        confirmModalTitle.textContent = title;
        confirmModalSub.textContent = "This action requires confirmation.";

        confirmOkButton.innerHTML = `<i data-lucide="check"></i> ${confirmLabel}`;
        refreshIcons();

        confirmCallback = onConfirm;

        confirmModal.hidden = false;
        document.body.style.overflow = "hidden";
    }

    function closeConfirm() {
        confirmModal.hidden = true;
        document.body.style.overflow = "";
        confirmCallback = null;
    }

    document.getElementById("confirmModalClose")
        ?.addEventListener("click", closeConfirm);

    document.getElementById("confirmCancelButton")
        ?.addEventListener("click", closeConfirm);

    confirmOkButton?.addEventListener("click", () => {
        if (typeof confirmCallback === "function") confirmCallback();
        closeConfirm();
    });

    confirmModal?.addEventListener("click", (e) => {
        if (e.target === confirmModal) closeConfirm();
    });


    /* =========================
       TEAM — REMOVE MEMBER
    ========================== */

    document.querySelectorAll("#teamList .delete-button").forEach(btn => {

        btn.addEventListener("click", () => {

            const member = btn.closest(".team-member");
            const name = member.querySelector("strong").textContent.trim();

            openConfirm({
                title: "Remove Team Member?",
                message: `${name} will lose access to the admin dashboard.`,
                confirmLabel: "Remove",
                onConfirm: () => {
                    member.remove();
                    showToast(`${name} removed from team.`, "success");
                }
            });
        });
    });


    /* =========================
       INVITE MEMBER
    ========================== */

    document.getElementById("inviteMemberButton")
        ?.addEventListener("click", () => {
            showToast("Invite modal coming soon.", "info");
        });


    /* =========================
       DATA — EXPORT
    ========================== */

    document.getElementById("exportDataButton")
        ?.addEventListener("click", () => {
            showToast("Preparing data export...", "info");
            setTimeout(() => {
                showToast("Export downloaded.", "success");
            }, 1500);
        });


    /* =========================
       DATA — BACKUP
    ========================== */

    document.getElementById("backupNowButton")
        ?.addEventListener("click", () => {
            showToast("Creating backup...", "info");
            setTimeout(() => {
                showToast("Backup complete.", "success");
            }, 1800);
        });


    /* =========================
       DATA — RESET
    ========================== */

    document.getElementById("resetDataButton")
        ?.addEventListener("click", () => {

            openConfirm({
                title: "Reset All Data?",
                message: "This will permanently delete all bookings, customers, and settings. This cannot be undone.",
                confirmLabel: "Delete Everything",
                onConfirm: () => {
                    showToast("All data has been reset.", "warning");
                }
            });
        });


    /* =========================
       NOTIFICATIONS / LOGOUT
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
       SEARCH (filter visible form groups)
    ========================== */

    const searchInput = document.getElementById("globalSearch");

    if (searchInput) {

        searchInput.addEventListener("input", () => {

            const keyword = searchInput.value.toLowerCase().trim();

            const active = document.querySelector(".settings-section.active");

            if (!active) return;

            active.querySelectorAll(".form-group, .toggle-row, .team-member").forEach(el => {
                const text = el.innerText.toLowerCase();
                el.style.display = !keyword || text.includes(keyword) ? "" : "none";
            });
        });
    }


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
            if (!confirmModal.hidden) closeConfirm();
            if (document.activeElement === searchInput) {
                searchInput.value = "";
                searchInput.dispatchEvent(new Event("input"));
                searchInput.blur();
            }
        }
    });

});