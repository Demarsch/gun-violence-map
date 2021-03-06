let categories = fetch('categories').then(r => r.json());

let statistics = fetch('statistics').then(r => r.json());

const years = [2013, 2014, 2015, 2016, 2017, 2018]

const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL',
    'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
    'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
    'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
    'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI',
    'WY'
];

//Populate categories menus
function fillCategories(childModal) {
    categories.then(d => {
        let ddMenus = childModal.find('.dropdown-menu[data-type="categories"]');
        ddMenus.each((_, el) => {
            let ddMenu = $(el);
            ddMenu.empty();
            ddMenu.prev('button').text('- Select Categories -');
            d.sort();
            $.each(d, (_, category) => {
                ddMenu.append($(`<button class="btn-check dropdown-item" data-value="${category}">${category}</button>`)
                    .click(e => {
                        $(e.target).toggleClass('active');
                        let activeCategories = ddMenu.find('.dropdown-item.active').map((_, e) => $(e).text()).get();
                        let ddButton = ddMenu.prev('button');
                        if (activeCategories.length == 0) {
                            ddButton.text('- Select Categories -');
                        } else if (activeCategories.length == 1) {
                            ddButton.text(activeCategories[0]);
                        } else {
                            ddButton.text(`${activeCategories.length} Categories Selected`);
                        }
                    }));
            })
        });
    });
}
//Populate statistics menus
function fillStatistics(childModal) {
    statistics.then(d => {
        let ddMenus = childModal.find('.dropdown-menu[data-type="statistics"]');
        ddMenus.each((_, el) => {
            let ddMenu = $(el);
            ddMenu.empty();
            ddMenu.prev('button').text('- Select Statistics -')
            let keepSingleSelected = ddMenu.is('[data-keepchecked]');
            d.sort((x, y) => x.name - y.name);
            $.each(d, (_, statistics) => {
                ddMenu.append($(`<button class="btn-check dropdown-item ${_ === 0 && ddMenu.is('[data-keepchecked]') ? 'active' : ''}" data-value="${statistics.id}">${statistics.name}</button>`)
                    .click(e => {
                        let button = $(e.target);
                        let wasActive = button.is('.active');
                        let isActive = keepSingleSelected ? true : !wasActive;
                        button.parents('.dropdown-menu').find('.dropdown-item').toggleClass('active', false);
                        button.toggleClass('active', isActive);
                        let ddButton = ddMenu.prev('button');
                        ddButton.text(isActive ? button.text() : '- Select Statistics -');
                    }));
            })
            if (ddMenu.is('[data-keepchecked]')) {
                ddMenu.prev('button').text(d[0].name);
            }
        });
    });
}
//Populate years menus
function fillYears(childModal) {
    let ddMenus = childModal.find('.dropdown-menu[data-type="years"]');
    ddMenus.each((_, el) => {
        let ddMenu = $(el);
        ddMenu.empty();
        ddMenu.prev('button').text('All');
        $.each(years, (_, year) => {
            ddMenu.append($(`<button class="btn-check dropdown-item" data-value="${year}">${year}</button>`)
                .click(e => {
                    $(e.target).toggleClass('active');
                    let activeYears = ddMenu.find('.dropdown-item.active').map((_, e) => $(e).text()).get();
                    let ddButton = ddMenu.prev('button');
                    if (activeYears.length == 0 || activeYears.length == years.length) {
                        ddButton.text('All');
                    } else {
                        ddButton.text(activeYears.join(', '));
                    }
                }));
        })
    });
}
//Populate state menus
function fillStates(childModal) {
    let ddMenus = childModal.find('.dropdown-menu[data-type="states"]');
    ddMenus.each((_, el) => {
        let ddMenu = $(el);
        ddMenu.empty();
        ddMenu.prev('button').text('All');
        $.each(states, (_, state) => {
            ddMenu.append($(`<button class="btn-check dropdown-item" data-value="${state}">${state}</button>`)
                .click(e => {
                    $(e.target).toggleClass('active');
                    let activeStates = ddMenu.find('.dropdown-item.active').map((_, e) => $(e).text()).get();
                    let ddButton = ddMenu.prev('button');
                    if (activeStates.length == 0 || activeStates.length == states.length) {
                        ddButton.text('All');
                    } else if (activeStates.length < 10) {
                        ddButton.text(activeStates.join(', '));
                    } else {
                        ddButton.text(`${activeStates.length} States Selected`)
                    }
                }));
        })
    });
}

//Allow only one option per group to be selected
$('.modal div[data-group] button:not(.inactive)')
    .click(e => {
        let self = $(e.target);
        let wasActive = self.hasClass('active');
        let parent = self.parents('div[data-group]');
        let dataGroup = parent.attr('data-group');
        let keepChecked = parent.is('[data-keepchecked]');
        let multiselect = parent.is('[data-multiselect]');
        if (!multiselect) {
            self.parents(`.modal-body`).find(`div[data-group="${dataGroup}"] button`).toggleClass('active', false);
        }
        self.toggleClass('active', !wasActive);
        if (parent.find('.active[data-value]').length == 0 && keepChecked) {
            self.toggleClass('active', true);
        }
    });

//Deselect those options that shouldn't be active at the same time
$('.modal [data-deselect]').click(e => {
    let self = $(e.target);
    let isActive = self.hasClass('active');
    if (isActive) {
        let deselectValues = self.attr('data-deselect').split(',');
        let parent = self.parents('[data-group]');
        for (let deselectValue of deselectValues) {
            parent.find(`[data-value="${deselectValue}"]`).toggleClass('active', false);
        }
    }
})

//Do not close categories drop-down menus when category is selected
$('.modal .dropdown-menu[data-keepopen]').click(e => e.stopPropagation());

//This window allows user to pick the type of investigation he wants to perform: incidents breakdown or incidents correlation
let addWidgetModal = $('#addWidgetModal');
addWidgetModal.find('button.btn[data-value]').click(e => {
    let button = $(e.target);
    let group = button.attr('data-value');
    let childModal = $(`.modal[data-value="${group}"]`);
    addWidgetModal.modal('hide');
    fillCategories(childModal);
    fillStatistics(childModal);
    fillYears(childModal);
    fillStates(childModal);
    childModal.find('.widget-name').val('');
    childModal.modal();
});

//Create widget after user clicked 'Add' button
$('.modal-confirm').click(e => {
    let button = $(e.target);
    let modal = button.parents('.modal');
    let widgetSettings = {};
    //Get values from the options that have been activated
    modal.find('[data-group]').each((_, el) => {
        let group = $(el);
        let groupName = group.attr('data-group');
        let multiSelect = group.is('[data-multiselect]');
        let activeValues = group.find('[data-value].active').map((_, e) => ({ value: $(e).attr('data-value'), display: $(e).text() })).get();
        widgetSettings[groupName] = activeValues;
        widgetSettings[groupName] = multiSelect ? activeValues : activeValues[0];
    });    
    widgetSettings.title = modal.find('.widget-name').val().trim() || 'New Widget';
    modal.modal('hide');
    createWidget(widgetSettings);
})

$('#addWidgetBtn').click(() => {
    addWidgetModal.modal();
});