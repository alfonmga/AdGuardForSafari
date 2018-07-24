/* global CheckboxUtils, ace, i18n, EventNotifierTypes */

const {ipcRenderer} = require('electron');
const moment = require('moment');

/**
 * Common utils
 *
 * @type {{debounce: Utils.debounce, htmlToElement: Utils.htmlToElement}}
 */
const Utils = {

    /**
     * Debounces function with specified timeout
     *
     * @param func
     * @param wait
     * @returns {Function}
     */
    debounce: function (func, wait) {
        let timeout;
        return function () {
            let context = this, args = arguments;
            let later = function () {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Creates HTMLElement from string
     *
     * @param {String} html HTML representing a single element
     * @return {Element}
     */
    htmlToElement: function (html) {
        const template = document.createElement('template');
        html = html.trim(); // Never return a text node of whitespace as the result
        template.innerHTML = html;
        return template.content.firstChild;
    }
};

/**
 * UI checkboxes utils
 *
 * @type {{toggleCheckbox, updateCheckbox}}
 */
const CheckboxUtils = (() => {
    'use strict';

    /**
     * Toggles wrapped elements with checkbox UI
     *
     * @param {Array.<Object>} elements
     */
    const toggleCheckbox = elements => {

        Array.prototype.forEach.call(elements, checkbox => {

            if (checkbox.getAttribute("toggleCheckbox")) {
                //already applied
                return;
            }

            const el = document.createElement('div');
            el.classList.add('toggler');
            checkbox.parentNode.insertBefore(el, checkbox.nextSibling);

            el.addEventListener('click', () => {
                checkbox.checked = !checkbox.checked;

                const event = document.createEvent('HTMLEvents');
                event.initEvent('change', true, false);
                checkbox.dispatchEvent(event);
            });

            checkbox.addEventListener('change', () => {
                onClicked(checkbox.checked);
            });

            function onClicked(checked) {
                if (checked) {
                    el.classList.add("active");
                    el.closest("li").classList.add("active");
                } else {
                    el.classList.remove("active");
                    el.closest("li").classList.remove("active");
                }
            }

            checkbox.style.display = 'none';
            onClicked(checkbox.checked);

            checkbox.setAttribute('toggleCheckbox', 'true');
        });
    };

    /**
     * Updates checkbox elements according to checked parameter
     *
     * @param {Array.<Object>} elements
     * @param {boolean} checked
     */
    const updateCheckbox = (elements, checked) => {

        Array.prototype.forEach.call(elements, el => {
            if (checked) {
                el.setAttribute('checked', 'checked');
                el.closest('li').classList.add('active');
            } else {
                el.removeAttribute('checked');
                el.closest('li').classList.remove('active');
            }
        });
    };

    return {
        toggleCheckbox: toggleCheckbox,
        updateCheckbox: updateCheckbox
    };
})();

/**
 * Top menu
 *
 * @type {{init, toggleTab}}
 */
const TopMenu = (function () {
    'use strict';

    const GENERAL_SETTINGS = '#general-settings';
    const ANTIBANNER = '#antibanner';
    const WHITELIST = '#whitelist';

    let prevTabId;
    let onHashUpdatedCallback;

    const toggleTab = function () {

        let tabId = document.location.hash || GENERAL_SETTINGS;
        let tab = document.querySelector(tabId);

        if (tabId.indexOf(ANTIBANNER) === 0 && !tab) {
            // AntiBanner groups and filters are loaded and rendered async
            return;
        }

        if (!tab) {
            tabId = GENERAL_SETTINGS;
            tab = document.querySelector(tabId);
        }

        const antibannerTabs = document.querySelectorAll('[data-tab="' + ANTIBANNER + '"]');

        if (prevTabId) {
            if (prevTabId.indexOf(ANTIBANNER) === 0) {
                antibannerTabs.forEach(function (el) {
                    el.classList.remove('active');
                });
            } else {
                document.querySelector('[data-tab="' + prevTabId + '"]').classList.remove('active');
            }

            document.querySelector(prevTabId).style.display = 'none';
        }

        if (tabId.indexOf(ANTIBANNER) === 0) {
            antibannerTabs.forEach(function (el) {
                el.classList.add('active');
            });
        } else {
            document.querySelector('[data-tab="' + tabId + '"]').classList.add('active');
        }

        tab.style.display = 'block';

        if (tabId === WHITELIST) {
            if (typeof onHashUpdatedCallback === 'function') {
                onHashUpdatedCallback(tabId);
            }
        }

        prevTabId = tabId;
    };

    const init = function (options) {
        onHashUpdatedCallback = options.onHashUpdated;

        window.addEventListener('hashchange', toggleTab);
        document.querySelectorAll('[data-tab]').forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                document.location.hash = el.getAttribute('data-tab');
            });
        });

        toggleTab();
    };

    return {
        init: init,
        toggleTab: toggleTab
    };

})();

/**
 * Whitelist block
 *
 * @param options
 * @returns {{updateWhiteListDomains: updateWhiteListDomains}}
 * @constructor
 */
const WhiteListFilter = function (options) {
    'use strict';

    let omitRenderEventsCount = 0;

    const editor = ace.edit('whiteListRules');
    editor.setShowPrintMargin(false);

    // Ace TextHighlightRules mode is edited in ace.js library file
    editor.session.setMode("ace/mode/text_highlight_rules");

    const applyChangesBtn = document.querySelector('#whiteListFilterApplyChanges');
    const changeDefaultWhiteListModeCheckbox = document.querySelector('#changeDefaultWhiteListMode');

    function loadWhiteListDomains() {
        //TODO: Fix implement
        // contentPage.sendMessage({
        //     type: 'getWhiteListDomains'
        // }, function (response) {
        //     editor.setValue(response.content || '');
        //     applyChangesBtn.style.display = 'none';
        // });
    }

    function saveWhiteListDomains(e) {
        e.preventDefault();

        omitRenderEventsCount = 1;

        editor.setReadOnly(true);
        const text = editor.getValue();

        //TODO: Fix implement
        // contentPage.sendMessage({
        //     type: 'saveWhiteListDomains',
        //     content: text
        // }, function () {
        //     editor.setReadOnly(false);
        //     applyChangesBtn.style.display = 'none';
        // });
    }

    function updateWhiteListDomains() {
        if (omitRenderEventsCount > 0) {
            omitRenderEventsCount--;
            return;
        }

        loadWhiteListDomains();
    }

    function changeDefaultWhiteListMode(e) {
        e.preventDefault();

        //TODO: Fix implement
        // contentPage.sendMessage({type: 'changeDefaultWhiteListMode', enabled: !e.currentTarget.checked}, function () {
        //     updateWhiteListDomains();
        // });
    }

    applyChangesBtn.addEventListener('click', saveWhiteListDomains);
    changeDefaultWhiteListModeCheckbox.addEventListener('change', changeDefaultWhiteListMode);

    CheckboxUtils.updateCheckbox([changeDefaultWhiteListModeCheckbox], !options.defaultWhiteListMode);

    editor.getSession().addEventListener('change', function () {
        applyChangesBtn.style.display = 'block';
    });

    return {
        updateWhiteListDomains: updateWhiteListDomains
    };
};

/**
 * User filter block
 *
 * @returns {{updateUserFilterRules: updateUserFilterRules}}
 * @constructor
 */
const UserFilter = function () {
    'use strict';

    let omitRenderEventsCount = 0;

    const editor = ace.edit('userRules');
    editor.setShowPrintMargin(false);

    // Ace TextHighlightRules mode is edited in ace.js library file
    editor.session.setMode("ace/mode/text_highlight_rules");

    const applyChangesBtn = document.querySelector('#userFilterApplyChanges');

    function loadUserRules() {
        //TODO: Fix implement
        // contentPage.sendMessage({
        //     type: 'getUserRules'
        // }, function (response) {
        //     editor.setValue(response.content || '');
        //     applyChangesBtn.style.display = 'none';
        // });
    }

    function saveUserRules(e) {
        e.preventDefault();

        omitRenderEventsCount = 1;

        editor.setReadOnly(true);
        const text = editor.getValue();

        //TODO: Fix implement
        // contentPage.sendMessage({
        //     type: 'saveUserRules',
        //     content: text
        // }, function () {
        //     editor.setReadOnly(false);
        //     applyChangesBtn.style.display = 'none';
        // });
    }

    function updateUserFilterRules() {
        if (omitRenderEventsCount > 0) {
            omitRenderEventsCount--;
            return;
        }

        loadUserRules();
    }

    applyChangesBtn.addEventListener('click', saveUserRules);

    editor.getSession().addEventListener('change', function () {
        applyChangesBtn.style.display = 'block';
    });

    return {
        updateUserFilterRules: updateUserFilterRules
    };
};

/**
 * Filters block
 *
 * @param options
 * @returns {{render: renderCategoriesAndFilters, updateRulesCountInfo: updateRulesCountInfo, onFilterStateChanged: onFilterStateChanged, onFilterDownloadStarted: onFilterDownloadStarted, onFilterDownloadFinished: onFilterDownloadFinished}}
 * @constructor
 */
const AntiBannerFilters = function (options) {
    'use strict';

    const loadedFiltersInfo = {
        filters: [],
        categories: [],
        filtersById: {},
        lastUpdateTime: 0,

        initLoadedFilters: function (filters, categories) {
            this.filters = filters;
            this.categories = categories;

            let lastUpdateTime = 0;
            const filtersById = Object.create(null);
            for (let i = 0; i < this.filters.length; i++) {
                const filter = this.filters[i];
                filtersById[filter.filterId] = filter;
                if (filter.lastUpdateTime && filter.lastUpdateTime > lastUpdateTime) {
                    lastUpdateTime = filter.lastUpdateTime;
                }
            }

            this.filtersById = filtersById;
            this.lastUpdateTime = lastUpdateTime;
        },

        isEnabled: function (filterId) {
            const info = this.filtersById[filterId];
            return info && info.enabled;
        },

        updateEnabled: function (filter, enabled) {
            const info = this.filtersById[filter.filterId];
            if (info) {
                info.enabled = enabled;
            } else {
                this.filters.push(filter);
                this.filtersById[filter.filterId] = filter;
            }
        }
    };

    // Bind events
    document.addEventListener('change', function (e) {
        if (e.target.getAttribute('name') === 'filterId') {
            toggleFilterState.bind(e.target)();
        } else if (e.target.getAttribute('name') === 'groupId') {
            toggleGroupState.bind(e.target)();
        }
    });
    document.querySelector('#updateAntiBannerFilters').addEventListener('click', updateAntiBannerFilters);

    updateRulesCountInfo(options.rulesInfo);

    function getFiltersByGroupId(groupId, filters) {
        return filters.filter(function (f) {
            return f.groupId === groupId;
        });
    }

    function countEnabledFilters(filters) {
        let count = 0;
        for (let i = 0; i < filters.length; i++) {
            const filterId = filters[i].filterId;
            if (loadedFiltersInfo.isEnabled(filterId)) {
                count++;
            }
        }
        return count;
    }

    function getCategoryElement(groupId) {
        return document.querySelector('#category' + groupId);
    }

    function getCategoryCheckbox(groupId) {
        let categoryElement = getCategoryElement(groupId);
        if (!categoryElement) {
            return null;
        }

        return categoryElement.querySelector('input');
    }

    function getFilterElement(filterId) {
        return document.querySelector('#filter' + filterId);
    }

    function getFilterCheckbox(filterId) {
        let filterElement = getFilterElement(filterId);
        if (!filterElement) {
            return null;
        }

        return filterElement.querySelector('input');
    }

    function updateCategoryFiltersInfo(groupId) {
        const groupFilters = getFiltersByGroupId(groupId, loadedFiltersInfo.filters);
        const enabledFiltersCount = countEnabledFilters(groupFilters);

        const element = getCategoryElement(groupId);
        const checkbox = getCategoryCheckbox(groupId);

        element.querySelector('.desc').textContent = 'Enabled filters: ' + enabledFiltersCount;
        CheckboxUtils.updateCheckbox([checkbox], enabledFiltersCount > 0);
    }

    function getFilterCategoryElement(category) {
        return Utils.htmlToElement(`
                <li id="category${category.groupId}" class="active">
                    <div class="block-type">
                        <div class="block-type__ico block-type__ico--${category.groupId}"></div>
                        <a href="#antibanner${category.groupId}">${category.groupName}</a>
                    </div>
                    <div class="opt-state">
                        <div class="preloader"></div>
                        <div class="desc"></div>
                        <input type="checkbox" name="groupId" value="${category.groupId}">
                    </div>
                </li>`);
    }

    function getFilterTemplate(filter, enabled, showDeleteButton) {
        const timeUpdated = moment(filter.timeUpdated);
        timeUpdated.locale(environmentOptions.Prefs.locale);
        const timeUpdatedText = timeUpdated.format("D/MM/YYYY HH:mm").toLowerCase();

        let tagDetails = '';
        filter.tagsDetails.forEach(function (tag) {
            tagDetails += `<div class="opt-name__tag" data-tooltip="${tag.description}">#${tag.keyword}</div>`;
        });

        let deleteButton = '';
        if (showDeleteButton) {
            deleteButton = `<a href="#" filterid="${filter.filterId}" class="remove-custom-filter-button">remove</a>`;
        }

        return `
            <li id="filter${filter.filterId}">
                <div class="opt-name">
                    <div class="title">${filter.name}</div>
                    <div class="desc">${filter.description}</div>
                    <div class="opt-name__info">
                        <div class="opt-name__info-labels">
                            <div class="opt-name__info-item">version ${filter.version}</div>
                            <div class="opt-name__info-item">updated: ${timeUpdatedText}</div>
                        </div>
                        <div class="opt-name__info-labels opt-name__info-labels--tags">
                            ${tagDetails}
                        </div>
                    </div>
                </div>
                <div class="opt-state">
                    <div class="preloader"></div>
                    ${deleteButton}
                    <a class="icon-home" target="_blank" href="${filter.homepage}"></a>
                    <input type="checkbox" name="filterId" value="${filter.filterId}" ${enabled ? 'checked="checked"' : ''}>
                </div>
            </li>`;
    }

    function getPageTitleTemplate(name) {
        return `
            <div class="page-title">
                <a href="#antibanner">
                    <img src="images/icon-back.png" class="back">
                </a>
                ${name}
            </div>`;
    }

    function getTabsBarTemplate(showRecommended) {
        if (showRecommended) {
            return `
                <div class="tabs-bar">
                    <a href="" class="tab active" data-tab="recommended">Recommended</a>
                    <a href="" class="tab" data-tab="other">Other</a>
                </div>`;
        }

        return `
            <div class="tabs-bar">
                <a href="" class="tab active" data-tab="other">Other</a>
            </div>`;
    }

    function getEmptyCustomFiltersTemplate(category) {
        return `
            <div id="antibanner${category.groupId}" class="settings-content tab-pane filters-list">
                ${getPageTitleTemplate(category.groupName)}
                <div class="settings-body">
                    <div class="empty-filters">
                        <div class="empty-filters__logo"></div>
                        <div class="empty-filters__desc">
                            Sorry, but you don't have any custom filters yet
                        </div>
                        <button class="button button--green empty-filters__btn">
                            Add custom filter
                        </button>
                    </div>
                </div>
            </div>`;
    }

    function getFiltersContentElement(category) {
        const filters = category.filters.otherFilters;
        const recommendedFilters = category.filters.recommendedFilters;
        let isCustomFilters = category.groupId === 0;
        let showRecommended = recommendedFilters.length > 0;

        if (isCustomFilters &&
            filters.length === 0 &&
            recommendedFilters.length === 0) {

            return Utils.htmlToElement(getEmptyCustomFiltersTemplate(category));
        }

        const pageTitleEl = getPageTitleTemplate(category.groupName);

        let tabs = '';
        if (!isCustomFilters) {
            tabs = getTabsBarTemplate(showRecommended);
        }

        let recommendedFiltersList = '';
        let otherFiltersList = '';

        for (let i = 0; i < filters.length; i++) {
            otherFiltersList += getFilterTemplate(filters[i], loadedFiltersInfo.isEnabled(filters[i].filterId), isCustomFilters);
        }

        for (let j = 0; j < recommendedFilters.length; j++) {
            recommendedFiltersList += getFilterTemplate(recommendedFilters[j], loadedFiltersInfo.isEnabled(recommendedFilters[j].filterId), isCustomFilters);
        }

        return Utils.htmlToElement(`
            <div id="antibanner${category.groupId}" class="settings-content tab-pane filters-list">
                ${pageTitleEl}
                <div class="settings-body">
                    ${tabs}
                    <ul class="opts-list" data-tab="other" ${showRecommended ? 'style="display: none;"' : ''}>
                        ${otherFiltersList}
                    </ul>
                    <ul class="opts-list" data-tab="recommended" ${!showRecommended ? 'style="display: none;"' : ''}>
                        ${recommendedFiltersList}
                    </ul>
                </div>
            </div>
        `);
    }

    function renderFilterCategory(category) {
        let categoryContentElement = document.querySelector('#antibanner' + category.groupId);
        if (categoryContentElement) {
            categoryContentElement.parentNode.removeChild(categoryContentElement);
        }
        let categoryElement = document.querySelector('#category' + category.groupId);
        if (categoryElement) {
            categoryElement.parentNode.removeChild(categoryElement);
        }

        categoryElement = getFilterCategoryElement(category);
        document.querySelector('#groupsList').appendChild(categoryElement);
        updateCategoryFiltersInfo(category.groupId);

        categoryContentElement = getFiltersContentElement(category);
        document.querySelector('#antibanner').parentNode.appendChild(categoryContentElement);
    }

    function bindControls() {
        const emptyFiltersAddCustomButton = document.querySelector('.empty-filters__btn');
        if (emptyFiltersAddCustomButton) {
            emptyFiltersAddCustomButton.addEventListener('click', addCustomFilter);
        }

        document.querySelector('#addCustomFilter').addEventListener('click', addCustomFilter);
        document.querySelectorAll('.remove-custom-filter-button').forEach(function (el) {
            el.addEventListener('click', removeCustomFilter);
        });

        document.querySelectorAll('.tabs-bar .tab').forEach(function (tab) {
            tab.addEventListener('click', function (e) {
                e.preventDefault();

                const current = e.currentTarget;
                current.parentNode.querySelectorAll('.tabs-bar .tab').forEach(function (el) {
                    el.classList.remove('active');
                });
                current.classList.add('active');

                const parentNode = current.parentNode.parentNode;
                parentNode.querySelector('.opts-list[data-tab="recommended"]').style.display = 'none';
                parentNode.querySelector('.opts-list[data-tab="other"]').style.display = 'none';

                const attr = current.getAttribute('data-tab');
                parentNode.querySelector('.opts-list[data-tab="' + attr + '"]').style.display = 'block';
            });
        });
    }

    function renderCategoriesAndFilters() {
        ipcRenderer.on('getFiltersMetadataResponse', (e, response) => {
            loadedFiltersInfo.initLoadedFilters(response.filters, response.categories);
            setLastUpdatedTimeText(loadedFiltersInfo.lastUpdateTime);

            const categories = loadedFiltersInfo.categories;
            for (let j = 0; j < categories.length; j++) {
                renderFilterCategory(categories[j]);
            }

            bindControls();
            CheckboxUtils.toggleCheckbox(document.querySelectorAll(".opt-state input[type=checkbox]"));

            // check document hash
            const hash = document.location.hash;
            if (hash && hash.indexOf('#antibanner') === 0) {
                TopMenu.toggleTab();
            }
        });

        ipcRenderer.send('message', JSON.stringify({
            'type': 'getFiltersMetadata'
        }));
    }

    function toggleFilterState() {
        const filterId = this.value - 0;
        //TODO: Fix implement
        // if (this.checked) {
        //     contentPage.sendMessage({type: 'addAndEnableFilter', filterId: filterId});
        // } else {
        //     contentPage.sendMessage({type: 'disableAntiBannerFilter', filterId: filterId});
        // }
    }

    function toggleGroupState() {
        const groupId = this.value - 0;
        //TODO: Fix implement
        // if (this.checked) {
        //     contentPage.sendMessage({type: 'addAndEnableFiltersByGroupId', groupId: groupId});
        // } else {
        //     contentPage.sendMessage({type: 'disableAntiBannerFiltersByGroupId', groupId: groupId});
        // }
    }

    function updateAntiBannerFilters(e) {
        e.preventDefault();
        //TODO: Fix implement
        // contentPage.sendMessage({type: 'checkAntiBannerFiltersUpdate'}, function () {
        //     //Empty
        // });
    }

    function addCustomFilter(e) {
        e.preventDefault();

        document.location.hash = 'antibanner';
        renderCustomFilterPopup();
    }

    function removeCustomFilter(e) {
        e.preventDefault();

        const filterId = e.currentTarget.getAttribute('filterId');

        //TODO: Fix implement
        // contentPage.sendMessage({
        //     type: 'removeAntiBannerFilter',
        //     filterId: filterId
        // });

        const filterElement = getFilterElement(filterId);
        filterElement.parentNode.removeChild(filterElement);
    }

    function renderCustomFilterPopup() {
        const POPUP_ACTIVE_CLASS = 'option-popup__step--active';

        function closePopup() {
            document.querySelector('#add-custom-filter-popup').classList.remove('option-popup--active');
        }

        function clearActiveStep() {
            document.querySelector('#add-custom-filter-step-1').classList.remove(POPUP_ACTIVE_CLASS);
            document.querySelector('#add-custom-filter-step-2').classList.remove(POPUP_ACTIVE_CLASS);
            document.querySelector('#add-custom-filter-step-3').classList.remove(POPUP_ACTIVE_CLASS);
            document.querySelector('#add-custom-filter-step-4').classList.remove(POPUP_ACTIVE_CLASS);
        }

        function renderStepOne() {
            clearActiveStep();
            document.querySelector('#add-custom-filter-step-1').classList.add(POPUP_ACTIVE_CLASS);

            document.querySelector('#custom-filter-popup-url').focus();
        }

        function renderStepTwo() {
            clearActiveStep();
            document.querySelector('#add-custom-filter-step-2').classList.add(POPUP_ACTIVE_CLASS);
        }

        function renderStepThree() {
            clearActiveStep();
            document.querySelector('#add-custom-filter-step-3').classList.add(POPUP_ACTIVE_CLASS);
        }

        function renderStepFour(filter) {
            clearActiveStep();
            document.querySelector('#add-custom-filter-step-4').classList.add(POPUP_ACTIVE_CLASS);

            document.querySelector('#custom-filter-popup-added-title').textContent = filter.name;
            document.querySelector('#custom-filter-popup-added-desc').textContent = filter.description;
            document.querySelector('#custom-filter-popup-added-version').textContent = filter.version;
            document.querySelector('#custom-filter-popup-added-rules-count').textContent = filter.rulesCount;
            document.querySelector('#custom-filter-popup-added-homepage').textContent = filter.homepage;
            document.querySelector('#custom-filter-popup-added-homepage').setAttribute("href", filter.homepage);
            document.querySelector('#custom-filter-popup-added-url').textContent = filter.customUrl;
            document.querySelector('#custom-filter-popup-added-url').setAttribute("href", filter.customUrl);

            document.querySelector('#custom-filter-popup-added-back').addEventListener('click', renderStepOne);
            document.querySelector('#custom-filter-popup-added-subscribe').removeEventListener('click', onSubscribeClicked);
            document.querySelector('#custom-filter-popup-added-subscribe').addEventListener('click', onSubscribeClicked);

            document.querySelector('#custom-filter-popup-remove').addEventListener('click', function () {
                //TODO: Fix implement
                // contentPage.sendMessage({
                //     type: 'removeAntiBannerFilter',
                //     filterId: filter.filterId
                // });
                closePopup();
            });
        }

        function onSubscribeClicked() {
            //TODO: Fix implement
            //contentPage.sendMessage({type: 'addAndEnableFilter', filterId: filter.filterId});
            closePopup();
        }

        document.querySelector('#add-custom-filter-popup').classList.add('option-popup--active');
        document.querySelector('.option-popup__cross').addEventListener('click', closePopup);
        document.querySelector('.custom-filter-popup-cancel').addEventListener('click', closePopup);

        document.querySelector('.custom-filter-popup-next').addEventListener('click', function (e) {
            e.preventDefault();

            const url = document.querySelector('#custom-filter-popup-url').value;
            //TODO: Fix implement
            // contentPage.sendMessage({type: 'loadCustomFilterInfo', url: url}, function (filter) {
            //     if (filter) {
            //         renderStepFour(filter);
            //     } else {
            //         renderStepThree();
            //     }
            // });

            renderStepTwo();
        });

        document.querySelector('.custom-filter-popup-try-again').addEventListener('click', renderStepOne);

        renderStepOne();
    }

    function setLastUpdatedTimeText(lastUpdateTime) {
        if (lastUpdateTime && lastUpdateTime > loadedFiltersInfo.lastUpdateTime) {
            loadedFiltersInfo.lastUpdateTime = lastUpdateTime;
        }

        let updateText = "";
        lastUpdateTime = loadedFiltersInfo.lastUpdateTime;
        if (lastUpdateTime) {
            lastUpdateTime = moment(lastUpdateTime);
            lastUpdateTime.locale(environmentOptions.Prefs.locale);
            updateText = lastUpdateTime.format("D MMMM YYYY HH:mm").toLowerCase();
            //TODO: localization (options_filter_version)
        }

        document.querySelector('#lastUpdateTime').textContent = updateText;
    }

    function updateRulesCountInfo(info) {
        const message = i18n.__("options_antibanner_info.message", [String(info.rulesCount || 0)]);
        document.querySelector('#filtersRulesInfo').textContent = message;
    }

    function onFilterStateChanged(filter) {
        const filterId = filter.filterId;
        const enabled = filter.enabled;
        loadedFiltersInfo.updateEnabled(filter, enabled);
        updateCategoryFiltersInfo(filter.groupId);

        CheckboxUtils.updateCheckbox([getFilterCheckbox(filterId)], enabled);
    }

    function onFilterDownloadStarted(filter) {
        getCategoryElement(filter.groupId).querySelector('.preloader').classList.add('active');
        getFilterElement(filter.filterId).querySelector('.preloader').classList.add('active');
    }

    function onFilterDownloadFinished(filter) {
        getCategoryElement(filter.groupId).querySelector('.preloader').classList.remove('active');
        getFilterElement(filter.filterId).querySelector('.preloader').classList.remove('active');
        setLastUpdatedTimeText(filter.lastUpdateTime);
    }

    return {
        render: renderCategoriesAndFilters,
        updateRulesCountInfo: updateRulesCountInfo,
        onFilterStateChanged: onFilterStateChanged,
        onFilterDownloadStarted: onFilterDownloadStarted,
        onFilterDownloadFinished: onFilterDownloadFinished
    };
};

// const SyncSettings = function (options) {
//     'use strict';
//
//     let syncStatus = options.syncStatusInfo;
//     let currentProvider = options.syncStatusInfo.currentProvider;
//
//     const unauthorizedBlock = document.querySelector('#unauthorizedBlock');
//     const authorizedBlock = document.querySelector('#authorizedBlock');
//     const signInButton = document.querySelector('#signInButton');
//     const signOutButton = document.querySelector('#signOutButton');
//     const startSyncButton = document.querySelector('#startSyncButton');
//     const syncNowButton = document.querySelector('#syncNowButton');
//     const lastSyncTimeInfo = document.querySelector('#lastSyncTimeInfo');
//     const selectProviderButton = document.querySelector('#selectProviderButton');
//
//     const providersDropdown = document.querySelector('#selectProviderDropdown');
//
//     bindControls();
//
//     function bindControls() {
//
//         selectProviderButton.addEventListener('click', function () {
//             providersDropdown.style.display = 'block';
//         });
//
//         signInButton.addEventListener('click', function (e) {
//             e.preventDefault();
//             if (currentProvider) {
//                 contentPage.sendMessage({
//                     type: 'authSync',
//                     provider: currentProvider.name
//                 });
//             }
//         });
//
//         signOutButton.addEventListener('click', function (e) {
//             e.preventDefault();
//             if (currentProvider && currentProvider.isOAuthSupported) {
//                 contentPage.sendMessage({
//                     type: 'dropAuthSync',
//                     provider: currentProvider.name
//                 });
//             } else {
//                 contentPage.sendMessage({type: 'toggleSync'});
//             }
//         });
//
//         startSyncButton.addEventListener('click', function (e) {
//             e.preventDefault();
//             contentPage.sendMessage({type: 'toggleSync'});
//         });
//
//         syncNowButton.addEventListener('click', function (e) {
//             e.preventDefault();
//             updateSyncState();
//             contentPage.sendMessage({type: 'syncNow'});
//         });
//
//         document.querySelector('#changeDeviceNameButton').addEventListener('click', function (e) {
//             e.preventDefault();
//             const deviceName = document.querySelector('#deviceNameInput').value;
//             contentPage.sendMessage({
//                 type: 'syncChangeDeviceName',
//                 deviceName: deviceName
//             });
//         });
//
//         document.querySelector('#adguardSelectProvider').addEventListener('click', onProviderSelected('ADGUARD_SYNC'));
//         document.querySelector('#dropboxSelectProvider').addEventListener('click', onProviderSelected('DROPBOX'));
//         document.querySelector('#browserStorageSelectProvider').addEventListener('click', onProviderSelected('BROWSER_SYNC'));
//
//         document.querySelector('#sync-general-settings-checkbox').addEventListener('change', onSyncOptionsChanged);
//         document.querySelector('#sync-filters-checkbox').addEventListener('change', onSyncOptionsChanged);
//         document.querySelector('#sync-extension-specific-checkbox').addEventListener('change', onSyncOptionsChanged);
//     }
//
//     function onSyncOptionsChanged() {
//         contentPage.sendMessage({
//             type: 'setSyncOptions', options: {
//                 syncGeneral: document.querySelector('#sync-general-settings-checkbox').hasAttribute('checked'),
//                 syncFilters: document.querySelector('#sync-filters-checkbox').hasAttribute('checked'),
//                 syncExtensionSpecific: document.querySelector('#sync-extension-specific-checkbox').hasAttribute('checked')
//             }
//         });
//     }
//
//     function onProviderSelected(providerName) {
//         return function (e) {
//             e.preventDefault();
//             providersDropdown.style.display = 'none';
//             contentPage.sendMessage({type: 'setSyncProvider', provider: providerName}, function () {
//                 document.location.reload();
//             });
//         };
//     }
//
//     function renderSelectProviderBlock() {
//         unauthorizedBlock.style.display = 'block';
//         authorizedBlock.style.display = 'none';
//         signInButton.style.display = 'none';
//         startSyncButton.style.display = 'none';
//     }
//
//     function renderUnauthorizedBlock() {
//
//         unauthorizedBlock.style.display = 'block';
//         authorizedBlock.style.display = 'none';
//
//         if (currentProvider.isOAuthSupported && !currentProvider.isAuthorized) {
//             signInButton.style.display = 'block';
//         } else {
//             signInButton.style.display = 'none';
//         }
//
//         if (!syncStatus.enabled && currentProvider.isAuthorized) {
//             startSyncButton.style.display = 'block';
//         } else {
//             startSyncButton.style.display = 'none';
//         }
//
//         selectProviderButton.textContent = currentProvider.title;
//     }
//
//     function renderAuthorizedBlock() {
//
//         unauthorizedBlock.style.display = 'none';
//         authorizedBlock.style.display = 'block';
//
//         document.querySelector('#providerNameInfo').textContent = currentProvider.title;
//
//         const manageAccountButton = document.querySelector('#manageAccountButton');
//         const deviceNameBlock = document.querySelector('#deviceNameBlock');
//
//         updateSyncState();
//
//         if (currentProvider.isOAuthSupported && currentProvider.name === 'ADGUARD_SYNC') {
//             manageAccountButton.style.display = 'block';
//             deviceNameBlock.style.display = 'block';
//             document.querySelector('#deviceNameInput').value = currentProvider.deviceName;
//         } else {
//             manageAccountButton.style.display = 'none';
//             deviceNameBlock.style.display = 'none';
//         }
//
//         document.querySelector('#sync-general-settings-checkbox').setAttribute('checked', syncStatus.syncOptions.syncGeneral);
//         document.querySelector('#sync-filters-checkbox').setAttribute('checked', syncStatus.syncOptions.syncFilters);
//         document.querySelector('#sync-extension-specific-checkbox').setAttribute('checked', syncStatus.syncOptions.syncExtensionSpecific);
//     }
//
//     function renderSyncSettings() {
//
//         if (!currentProvider) {
//             renderSelectProviderBlock();
//             return;
//         }
//
//         if (!currentProvider.isAuthorized || !syncStatus.enabled) {
//             renderUnauthorizedBlock();
//         } else {
//             renderAuthorizedBlock();
//         }
//
//         let browserStorageSupported = syncStatus.providers.filter(function (p) {
//                 return p.name === 'BROWSER_SYNC';
//             }).length > 0;
//
//         if (!browserStorageSupported) {
//             document.querySelector('#browserStorageSelectProvider').style.display = 'none';
//         }
//
//         if (currentProvider) {
//             const activeClass = 'dropdown__item--active';
//
//             switch (currentProvider.name) {
//                 case 'ADGUARD_SYNC':
//                     document.querySelector('#adguardSelectProvider').classList.add(activeClass);
//                     break;
//                 case 'DROPBOX':
//                     document.querySelector('#dropboxSelectProvider').classList.add(activeClass);
//                     break;
//                 case 'BROWSER_SYNC':
//                     document.querySelector('#browserStorageSelectProvider').classList.add(activeClass);
//                     break;
//             }
//         }
//     }
//
//     function updateSyncSettings(options) {
//         syncStatus = options.status;
//         currentProvider = options.status.currentProvider;
//         renderSyncSettings();
//     }
//
//     function updateSyncState() {
//         if (syncStatus.syncInProgress) {
//             syncNowButton.setAttribute('disabled', 'disabled');
//             syncNowButton.textContent = i18n.__('sync_in_progress_button_text.message');
//         } else {
//             syncNowButton.removeAttribute('disabled');
//             syncNowButton.textContent = i18n.__('sync_now_button_text.message');
//         }
//
//         if (currentProvider) {
//             const lastSyncTime = currentProvider.lastSyncTime;
//             if (lastSyncTime) {
//                 lastSyncTimeInfo.textContent = new Date(parseInt(lastSyncTime)).toLocaleString();
//             } else {
//                 lastSyncTimeInfo.textContent = i18n.__('sync_last_sync_time_never_sync_text.message');
//             }
//         }
//     }
//
//     return {
//         renderSyncSettings: renderSyncSettings,
//         updateSyncSettings: updateSyncSettings
//     };
// };

/**
 * Settings block
 *
 * @returns {{render: render, showPopup: showPopup}}
 * @constructor
 */
const Settings = function () {
    'use strict';

    const Checkbox = function (id, property, options) {

        options = options || {};
        const negate = options.negate;
        let hidden = options.hidden;

        const element = document.querySelector(id);
        if (!hidden) {
            element.addEventListener('change', function () {
                ipcRenderer.send('message', JSON.stringify({
                    'type': 'changeUserSetting',
                    'key': property,
                    'value': negate ? !this.checked : this.checked
                }));
            });
        }

        const render = function () {
            if (hidden) {
                element.closest('li').style.display = 'none';
                return;
            }
            let checked = userSettings.values[property];
            if (negate) {
                checked = !checked;
            }

            CheckboxUtils.updateCheckbox([element], checked);
        };

        return {
            render: render
        };
    };

    const checkboxes = [];
    checkboxes.push(new Checkbox('#safebrowsingEnabledCheckbox', userSettings.names.DISABLE_SAFEBROWSING, {negate: true}));
    checkboxes.push(new Checkbox('#sendSafebrowsingStatsCheckbox', userSettings.names.DISABLE_SEND_SAFEBROWSING_STATS, {negate: true}));
    checkboxes.push(new Checkbox('#autodetectFiltersCheckbox', userSettings.names.DISABLE_DETECT_FILTERS, {negate: true}));
    checkboxes.push(new Checkbox('#enableHitsCount', userSettings.names.DISABLE_COLLECT_HITS, {negate: true}));
    checkboxes.push(new Checkbox('#useOptimizedFilters', userSettings.names.USE_OPTIMIZED_FILTERS));
    checkboxes.push(new Checkbox('#showPageStatisticCheckbox', userSettings.names.DISABLE_SHOW_PAGE_STATS, {
        negate: true,
        hidden: environmentOptions.Prefs.mobile
    }));
    checkboxes.push(new Checkbox('#enableShowContextMenu', userSettings.names.DISABLE_SHOW_CONTEXT_MENU, {
        negate: true,
        hidden: false
    }));
    checkboxes.push(new Checkbox('#showInfoAboutAdguardFullVersion', userSettings.names.DISABLE_SHOW_ADGUARD_PROMO_INFO, {
        negate: true
    }));
    checkboxes.push(new Checkbox('#showAppUpdatedNotification', userSettings.names.DISABLE_SHOW_APP_UPDATED_NOTIFICATION, {
        negate: true
    }));

    const allowAcceptableAdsCheckbox = document.querySelector("#allowAcceptableAds");
    allowAcceptableAdsCheckbox.addEventListener('change', function () {
        //TODO: Fix implement
        // if (this.checked) {
        //     contentPage.sendMessage({
        //         type: 'addAndEnableFilter',
        //         filterId: AntiBannerFiltersId.SEARCH_AND_SELF_PROMO_FILTER_ID
        //     });
        // } else {
        //     contentPage.sendMessage({
        //         type: 'disableAntiBannerFilter',
        //         filterId: AntiBannerFiltersId.SEARCH_AND_SELF_PROMO_FILTER_ID
        //     });
        // }
    });

    var render = function () {
        for (let i = 0; i < checkboxes.length; i++) {
            checkboxes[i].render();
        }

        CheckboxUtils.updateCheckbox([allowAcceptableAdsCheckbox], AntiBannerFiltersId.SEARCH_AND_SELF_PROMO_FILTER_ID in enabledFilters);
    };

    const showPopup = function (title, text) {
        //TODO: Fix implement
        //contentPage.sendMessage({type: 'showAlertMessagePopup', title: title, text: text});
    };

    const importSettingsFile = function () {
        const input = document.createElement('input');
        input.type = 'file';
        const event = document.createEvent('HTMLEvents');
        event.initEvent('click', true, false);
        input.dispatchEvent(event);

        const onFileLoaded = function (content) {
            //TODO: Fix implement
            //contentPage.sendMessage({type: 'applySettingsJson', json: content});
        };

        input.addEventListener('change', function () {
            const file = e.currentTarget.files[0];
            if (file) {
                const reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = function (evt) {
                    onFileLoaded(evt.target.result);
                };
                reader.onerror = function (evt) {
                    showPopup(i18n.__('options_popup_import_error_file_title.message'), i18n.__('options_popup_import_error_file_description.message'));
                };
            }
        });
    };

    document.querySelector('#importSettingsFile').addEventListener('click', function (e) {
        e.preventDefault();
        importSettingsFile();
    }.bind(this));

    return {
        render: render,
        showPopup: showPopup
    };
};

/**
 * Page controller
 *
 * @constructor
 */
const PageController = function () {
};

PageController.prototype = {

    SUBSCRIPTIONS_LIMIT: 9,

    init: function () {

        this._customizeText();
        this._bindEvents();
        this._render();

        CheckboxUtils.toggleCheckbox(document.querySelectorAll(".opt-state input[type=checkbox]"));

        // Initialize top menu
        TopMenu.init({
            onHashUpdated: function (tabId) {
                // Doing nothing
            }.bind(this)
        });

        //updateDisplayAdguardPromo(!userSettings.values[userSettings.names.DISABLE_SHOW_ADGUARD_PROMO_INFO]);
        //customizePopupFooter(environmentOptions.isMacOs);
    },

    onSettingsImported: function (success) {
        if (success) {
            this.settings.showPopup(i18n.__('options_popup_import_success_title.message'), i18n.__('options_popup_import_success_description.message'));
            //TODO: Fix implement
            // const self = this;
            // contentPage.sendMessage({type: 'initializeFrameScript'}, function (response) {
            //     userSettings = response.userSettings;
            //     enabledFilters = response.enabledFilters;
            //     requestFilterInfo = response.requestFilterInfo;
            //
            //     self._render();
            // });
        } else {
            this.settings.showPopup(i18n.__('options_popup_import_error_title.message'), i18n.__('options_popup_import_error_description.message'));
        }
    },

    _customizeText: function () {
        document.querySelectorAll('a.sp-table-row-info').forEach(function (a) {
            a.classList.add('question');
            a.textContent = '';
        });

        document.querySelectorAll('span.sp-table-row-info').forEach(function (element) {
            const li = element.closest('li');
            element.parentNode.removeChild(element);

            const state = li.querySelector('.opt-state');
            element.classList.add('desc');
            state.insertBefore(element, state.firstChild);
        });
    },

    _bindEvents: function () {

        this.resetStatsPopup = document.querySelector("#resetStatsPopup");
        this.tooManySubscriptionsEl = document.querySelector('#tooManySubscriptions');

        document.querySelector("#resetStats").addEventListener('click', this.onResetStatsClicked.bind(this));

        document.querySelector(".openExtensionStore").addEventListener('click', function (e) {
            e.preventDefault();
            //TODO: Fix implement
            //contentPage.sendMessage({type: 'openExtensionStore'});
        });

        document.querySelector("#openLog").addEventListener('click', function (e) {
            e.preventDefault();
            ////TODO: Fix implement
            //contentPage.sendMessage({type: 'openFilteringLog'});
        });
    },

    _render: function () {

        const defaultWhitelistMode = userSettings.values[userSettings.names.DEFAULT_WHITE_LIST_MODE];

        if (environmentOptions.Prefs.mobile) {
            document.querySelector('#resetStats').style.display = 'none';
        }

        this.checkSubscriptionsCount();

        this.settings = new Settings();
        this.settings.render();

        // Initialize whitelist filter
        this.whiteListFilter = new WhiteListFilter({defaultWhiteListMode: defaultWhitelistMode});
        this.whiteListFilter.updateWhiteListDomains();

        // Initialize User filter
        this.userFilter = new UserFilter();
        this.userFilter.updateUserFilterRules();

        // Initialize AntiBanner filters
        this.antiBannerFilters = new AntiBannerFilters({rulesInfo: requestFilterInfo});
        this.antiBannerFilters.render();

        // Initialize sync tab
        //TODO: Fix implement
        // this.syncSettings = new SyncSettings({syncStatusInfo: syncStatusInfo});
        // this.syncSettings.renderSyncSettings();
    },

    allowAcceptableAdsChange: function () {
        //TODO: Fix implement
        // if (this.checked) {
        //     contentPage.sendMessage({
        //         type: 'addAndEnableFilter',
        //         filterId: AntiBannerFiltersId.SEARCH_AND_SELF_PROMO_FILTER_ID
        //     });
        // } else {
        //     contentPage.sendMessage({
        //         type: 'disableAntiBannerFilter',
        //         filterId: AntiBannerFiltersId.SEARCH_AND_SELF_PROMO_FILTER_ID
        //     });
        // }
    },

    onResetStatsClicked: function (e) {
        e.preventDefault();
        //TODO: Fix implement
        //contentPage.sendMessage({type: 'resetBlockedAdsCount'});
        this._onStatsReset();
    },

    _onStatsReset: function () {
        this.resetStatsPopup.style.display = 'block';
        if (this.closePopupTimeoutId) {
            clearTimeout(this.closePopupTimeoutId);
        }
        this.closePopupTimeoutId = setTimeout(function () {
            this.resetStatsPopup.style.display = 'none';
        }.bind(this), 4000);
    },

    checkSubscriptionsCount: function () {
        //TODO: Fix too many subscriptions warning
        //var enabledCount = this.subscriptionModalEl.querySelectorAll('input[name="modalFilterId"][checked="checked"]').length;

        // if (enabledCount >= this.SUBSCRIPTIONS_LIMIT) {
        //     this.tooManySubscriptionsEl.show();
        // } else {
        //     this.tooManySubscriptionsEl.hide();
        // }
    }
};

let userSettings;
let enabledFilters;
let environmentOptions;
let AntiBannerFiltersId;
let requestFilterInfo;
//let syncStatusInfo;

/**
 * Initializes page
 */
const initPage = function (response) {

    userSettings = response.userSettings;
    enabledFilters = response.enabledFilters;
    environmentOptions = response.environmentOptions;
    requestFilterInfo = response.requestFilterInfo;
    //syncStatusInfo = response.syncStatusInfo;

    AntiBannerFiltersId = response.constants.AntiBannerFiltersId;

    const onDocumentReady = function () {

        const controller = new PageController();
        controller.init();

        ipcRenderer.on(EventNotifierTypes.FILTER_ENABLE_DISABLE, (e, arg) => {
            controller.checkSubscriptionsCount();
            controller.antiBannerFilters.onFilterStateChanged(arg);
        });

        ipcRenderer.on(EventNotifierTypes.FILTER_ADD_REMOVE, (e, arg) => {
            controller.antiBannerFilters.render();
        });

        // createEventListener(events, function (event, options) {
        //     switch (event) {
        //         case EventNotifierTypes.FILTER_ENABLE_DISABLE:
        //             controller.checkSubscriptionsCount();
        //             controller.antiBannerFilters.onFilterStateChanged(options);
        //             break;
        //         case EventNotifierTypes.FILTER_ADD_REMOVE:
        //             controller.antiBannerFilters.render();
        //             break;
        //         case EventNotifierTypes.START_DOWNLOAD_FILTER:
        //             controller.antiBannerFilters.onFilterDownloadStarted(options);
        //             break;
        //         case EventNotifierTypes.SUCCESS_DOWNLOAD_FILTER:
        //         case EventNotifierTypes.ERROR_DOWNLOAD_FILTER:
        //             controller.antiBannerFilters.onFilterDownloadFinished(options);
        //             break;
        //         case EventNotifierTypes.UPDATE_USER_FILTER_RULES:
        //             controller.userFilter.updateUserFilterRules();
        //             controller.antiBannerFilters.updateRulesCountInfo(options);
        //             break;
        //         case EventNotifierTypes.UPDATE_WHITELIST_FILTER_RULES:
        //             controller.whiteListFilter.updateWhiteListDomains();
        //             break;
        //         case EventNotifierTypes.REQUEST_FILTER_UPDATED:
        //             controller.antiBannerFilters.updateRulesCountInfo(options);
        //             break;
        //         case EventNotifierTypes.SYNC_STATUS_UPDATED:
        //             controller.syncSettings.updateSyncSettings(options);
        //             break;
        //         case EventNotifierTypes.SETTINGS_UPDATED:
        //             controller.onSettingsImported(options);
        //             break;
        //     }
        // });
    };

    if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
        onDocumentReady();
    } else {
        document.addEventListener('DOMContentLoaded', onDocumentReady);
    }
};

ipcRenderer.on('initializeOptionsPageResponse', (e, arg) => {
    initPage(arg);
});

ipcRenderer.send('message', JSON.stringify({
    'type': 'initializeOptionsPage'
}));