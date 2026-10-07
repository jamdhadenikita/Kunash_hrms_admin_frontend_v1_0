// Sidebar JS — Dynamic rendering based on module access

let isSidebarCollapsed = false;

// =========================================================================
// MODULE REGISTRY — single source of truth
// Naya module add karna ho to: (1) yahan add karo, (2) settings.html ke MODULES array me add karo
// href paths aapke project ke actual files se match hone chahiye
// =========================================================================
const SIDEBAR_MODULES = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        icon: 'fa-tachometer-alt',
        href: '/dashboard.html'
    },
    {
        key: 'company',
        label: 'Company Management',
        icon: 'fa-building',
        href: '/pages/company-mgmt/company.html'
    },
    {
        key: 'employees',
        label: 'Employee Management',
        icon: 'fa-users',
        href: '/pages/employees.html'
    },
    {
        key: 'onboarding',
        label: 'Onboarding',
        icon: 'fa-user-plus',
        href: '/pages/onboarding.html'
    },
    {
        key: 'asset',
        label: 'Asset Management',
        icon: 'fa-laptop',
        href: '/pages/asset.html'
    },
    {
        key: 'exit',
        label: 'Exit Management',
        icon: 'fa-sign-out-alt',
        href: '/pages/exit.html'
    },
    {
        key: 'attendance',
        label: 'Attendance',
        icon: 'fa-clock',
        href: '/pages/attandance.html'
    },
    {
        key: 'leave',
        label: 'Leave Management',
        icon: 'fa-calendar-alt',
        href: '/pages/leave.html'
    },
    {
        key: 'expense',
        label: 'Expense Management',
        icon: 'fa-wallet',
        href: '/pages/expense.html'
    },
    {
        key: 'payroll',
        label: 'Payroll',
        icon: 'fa-rupee-sign',
        href: 'javascript:void(0);',
        submenu: [
            { label: '1. Employee Pay', href: '/pages/payroll/employee_payroll.html' },
            { label: '2. Employee Pay-Slips', href: '/pages/payroll/payslips.html' }
        ]
    },
    {
        key: 'workflow',
        label: 'Careers',
        icon: 'fa-tasks',
        href: '/pages/career.html'
    },
    {
        key: 'policy',
        label: 'Policy Management',
        icon: 'fa-file-contract',
        href: '/pages/policyManagement.html'
    },
    {
        key: 'calendar',
        label: 'Calendar Management',
        icon: 'fa-calendar',
        href: '/pages/calendar.html'
    },
    {
        key: 'executive-report',
        label: 'Executive Report',
        icon: 'fa-chart-pie',
        href: '/executive-report.html'
    },
    {
        key: 'settings',
        label: 'Settings',
        icon: 'fa-cog',
        href: '/pages/settings.html'
    }
];

// =========================================================================
// DYNAMIC SIDEBAR RENDERER
// =========================================================================
function renderDynamicSidebar() {
    const list = document.getElementById('dynamicNavList');
    if (!list) {
        console.warn('⚠️ dynamicNavList not found in sidebar.html');
        return;
    }

    const role = localStorage.getItem('hrms_role');
    let allowedModules = [];

    if (role === 'SUPER_ADMIN') {
        allowedModules = SIDEBAR_MODULES.map(m => m.key);
        console.log('👑 SUPER_ADMIN — showing all', allowedModules.length, 'modules');
    } else {
        try {
            allowedModules = JSON.parse(localStorage.getItem('hrms_moduleAccess') || '[]');
        } catch (e) {
            console.warn('Could not parse moduleAccess:', e);
            allowedModules = [];
        }
        console.log('🔒 Role:', role, '| Allowed modules:', allowedModules);
    }

    if (allowedModules.length === 0) {
        list.innerHTML = `
            <li style="padding: 20px; text-align: center; color: #5a7c8a; font-size: 12px;">
                <i class="fas fa-lock" style="font-size: 20px; margin-bottom: 8px; display: block;"></i>
                No modules assigned.<br>Contact your super admin.
            </li>
        `;
        return;
    }

    const html = SIDEBAR_MODULES
        .filter(m => allowedModules.includes(m.key))
        .map(m => renderModuleItem(m))
        .join('');

    list.innerHTML = html;
    console.log(`✅ Rendered ${allowedModules.filter(k => SIDEBAR_MODULES.some(m => m.key === k)).length} modules in sidebar`);

    // Re-bind submenu toggle events after rendering
    bindSubmenuToggles();
}

// Render one module (with or without submenu)
function renderModuleItem(m) {
    const hasSubmenu = Array.isArray(m.submenu) && m.submenu.length > 0;

    const submenuArrow = hasSubmenu
        ? `<i class="fas fa-chevron-right submenu-arrow text-[9px] transition-transform duration-300" style="color: #1B738C;"></i>`
        : '';

    const submenuHtml = hasSubmenu
        ? `
            <ul class="submenu mt-1 space-y-0.5" style="display: none;">
                ${m.submenu.map(s => `
                    <li>
                        <a href="${s.href}"
                           class="block px-3 py-1.5 ml-7 rounded-lg text-[13px] transition-all duration-300"
                           style="color: #125f74;">${s.label}</a>
                    </li>
                `).join('')}
            </ul>
        `
        : '';

    // Icon + label wrapper
    const icon = `<i class="fas ${m.icon} w-4 text-xs" style="color: #1B738C;"></i>`;
    const label = `<span class="nav-text text-sm font-medium" style="color: #125f74;">${m.label}</span>`;

    const inner = hasSubmenu
        ? `<div class="flex items-center gap-2">${icon}${label}</div>${submenuArrow}`
        : `${icon}${label}`;

    const toggleClass = hasSubmenu ? 'toggle-submenu justify-between' : '';

    return `
        <li class="nav-item ${hasSubmenu ? 'has-submenu' : ''}">
            <a href="${m.href}"
               class="nav-link ${toggleClass} flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 group"
               data-module="${m.key}">
                ${inner}
            </a>
            ${submenuHtml}
        </li>
    `;
}

// =========================================================================
// SUBMENU TOGGLE (re-bind after dynamic render)
// =========================================================================
function bindSubmenuToggles() {
    const submenuItems = document.querySelectorAll('.has-submenu');

    submenuItems.forEach(item => {
        const navLink = item.querySelector('.toggle-submenu');
        const submenu = item.querySelector('.submenu');

        if (navLink && submenu) {
            // Remove existing listener by cloning
            const newNavLink = navLink.cloneNode(true);
            navLink.parentNode.replaceChild(newNavLink, navLink);

            newNavLink.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                // Close other submenus
                submenuItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        const otherSubmenu = otherItem.querySelector('.submenu');
                        if (otherSubmenu) {
                            otherSubmenu.style.display = 'none';
                            otherItem.classList.remove('submenu-open');
                        }
                    }
                });

                // Toggle current
                if (submenu.style.display === 'none' || submenu.style.display === '') {
                    submenu.style.display = 'block';
                    item.classList.add('submenu-open');
                } else {
                    submenu.style.display = 'none';
                    item.classList.remove('submenu-open');
                }
            });
        }
    });
}

// =========================================================================
// ACTIVE LINK HIGHLIGHTING
// =========================================================================
function highlightActiveMenu() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop();
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');

    // Remove all active
    document.querySelectorAll('.nav-link, .submenu a').forEach(link => {
        link.classList.remove('active');
    });

    // Match by href
    document.querySelectorAll('.nav-link, .submenu a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href === 'javascript:void(0);') return;

        const hrefPage = href.split('?')[0].split('/').pop();

        // Page match
        if (hrefPage && currentPage === hrefPage) {
            // If submenu link, also check tab param
            if (link.closest('.submenu') && tabParam) {
                const hrefTab = new URLSearchParams(href.split('?')[1] || '').get('tab');
                if (hrefTab !== tabParam) return;
            }
            link.classList.add('active');

            // If it's a submenu link, activate parent too
            const parentSubmenu = link.closest('.has-submenu');
            if (parentSubmenu) {
                const parentLink = parentSubmenu.querySelector('.nav-link');
                if (parentLink) parentLink.classList.add('active');
                const submenu = parentSubmenu.querySelector('.submenu');
                if (submenu) submenu.style.display = 'block';
                parentSubmenu.classList.add('submenu-open');
            }
        }
    });
}

// =========================================================================
// MAIN INIT
// =========================================================================
function initSidebar() {
    const sidebar = document.getElementById('mainSidebar');
    const collapseBtn = document.getElementById('collapseBtn');

    // 1) Render dynamic modules
    renderDynamicSidebar();

    // 2) Collapse/Expand
    if (collapseBtn) {
        const newCollapseBtn = collapseBtn.cloneNode(true);
        collapseBtn.parentNode.replaceChild(newCollapseBtn, collapseBtn);

        newCollapseBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            isSidebarCollapsed = !isSidebarCollapsed;
            if (sidebar) sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);

            const event = new CustomEvent('sidebarToggled', { detail: { collapsed: isSidebarCollapsed } });
            window.dispatchEvent(event);

            const icon = this.querySelector('i');
            if (icon) {
                if (isSidebarCollapsed) {
                    icon.classList.remove('fa-chevron-left');
                    icon.classList.add('fa-chevron-right');
                } else {
                    icon.classList.remove('fa-chevron-right');
                    icon.classList.add('fa-chevron-left');
                }
            }
        });
    }

    // 3) Load saved collapsed state
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true' && sidebar) {
        isSidebarCollapsed = true;
        sidebar.classList.add('collapsed');
        const collapseBtnElem = document.getElementById('collapseBtn');
        if (collapseBtnElem) {
            const icon = collapseBtnElem.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-chevron-left');
                icon.classList.add('fa-chevron-right');
            }
        }
        setTimeout(() => {
            const event = new CustomEvent('sidebarToggled', { detail: { collapsed: true } });
            window.dispatchEvent(event);
        }, 100);
    }

    // 4) Highlight active link
    setTimeout(() => {
        highlightActiveMenu();
    }, 200);
}

// Initialize sidebar when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        initSidebar();
    }, 150);
});