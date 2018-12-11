widgetRegistry = {};

let widgetCount = 0;

$('#addWidget').click(() => {
    $('#addWidgetModal').modal();
});

$('#addFirstWidget').click(e => {
    $('#addWidgetModal').modal();
});

function createWidget(widgetSettings) {
    let grid = $('.grid-stack').data('gridstack');
    let widget = $(`
    <div>
        <div class="grid-stack-item-content">
            <div class="widget-header">    
                <h2>${widgetSettings.title}</h2>
                <a class="rm-widget-btn" title="Delete Widget" href="#"><img src="static/img/close.svg"></a>
            </div>
            <div class="widget-content"></div>
        </div>
    </div>`);
    widget.find('.rm-widget-btn').click(() => {
        grid.removeWidget(widget);
        widgetCount--;
        if (!widgetCount) {
            $('#addFirstWidget').fadeIn();
        }
    });
    $('#addFirstWidget').hide();
    grid.addWidget(widget, null, null, 3, 3, true);
    widgetCount++;
    let widgetContent = widget.find('.widget-content')[0];
    $.post('data', JSON.stringify(widgetSettings))
        .done(d => {
            limitData(d,
                widgetSettings.top ? +widgetSettings.top.value : 0,
                widgetSettings.bottom ? +widgetSettings.bottom.value : 0);
            $(widgetContent).data('widgetData', d);
            $(widgetContent).data('widgetSettings', widgetSettings);
            widgetRegistry[widgetSettings.chartType.value].render(widgetContent, d);
            $(widgetContent).css('background-image', 'none');
        })
}

$('.grid-stack').on('gsresizestop', function(event, elem) {
    let settings = $(elem).find('.widget-content').data('widgetSettings');
    let data = $(elem).find('.widget-content').data('widgetData');
    widgetRegistry[settings.chartType.value].render($(elem).find('.widget-content')[0], data);
});

function limitData(data, top, bottom) {
    top = top || 0;
    bottom = bottom || 0;
    // 1. Calculate the cumulative value on every level of the hierarchy (e.g. CA-2014 - 100 and CA-2015 - 200 gives CA-300)
    let stack = [];
    stack.push(data.data);
    while (stack.length > 0) {
        let item = stack.pop();
        //Item is at the bottom of the hierarchy - stops everything
        if (item.hasOwnProperty('y_axis')) {
            item._cumulative = item.y_axis;
            item._parent._cumulative = (item._parent._cumulative || 0) + item._cumulative;
        }
        //Item still has children - loop through them
        else {
            
            for (let name in item) {
                if (name.startsWith('_')) {
                    continue;
                }
                let subItem = item[name];
                subItem._parent = item;
                stack.push(subItem);                
            }
        }
    }
    // 2. On every level of hierarchy sort items by cumulative value
    let queue = [];
    queue.push(data.data);
    while (queue.length > 0) {
        let item = queue.shift();
        let subItems = Object.entries(item).filter(i => !i[0].startsWith('_')).sort((x, y) => x[1]._cumulative - y[1]._cumulative);
        let localTop = top || bottom ? top : subItems.length;
        let localBot = top || bottom ? bottom : subItems.length;
        for (let i = 0, l = subItems.length; i < l; i++) {
            if (i < localBot || i >= l - localTop) {
                //Uncommenct to do it on all levels of the hierarchy
                //queue.push(subItems[i][1]);
                continue;
            }
            delete item[subItems[i][0]];
        }
    }
    // 3. Cleanup custom fields
    stack.push(data.data);
    while (stack.length > 0) {
        let item = stack.pop();
        //Item is at the bottom of the hierarchy - stops everything
        if (item.hasOwnProperty('_parent')) {
            delete item['_parent']
        }
        if (item.hasOwnProperty('_cumulative')) {
            delete item['_cumulative']
        }            
        for (let name in item) {
            if (name.startsWith('_')) {
                continue;
            }
            let subItem = item[name];
            subItem._parent = item;
            stack.push(subItem);                
        }
    }
}