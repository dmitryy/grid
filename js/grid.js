var Grid = function(filter, sortBy, pageSize, placeholder, gridTemplate, gridRowTemplate)
{
    this.filter = filter;
    this.renderGrid = _.template($(gridTemplate).html());
    this.renderGridRow = _.template($(gridRowTemplate).html());
    this.sortBy = sortBy;
    this.sortReverse = false;
    this.pageIndex = 0;
    this.pageSize = pageSize;
    this.pageLoaded = [];

    this.clickCallback = null;
    this.contextCallback = null;

    this.sort = function () {
        this.pageIndex = -1;
        this.pageLoaded = [];
        this.loadPage(0, $.proxy(this, 'pageLoadCallback'));
    }

    this.pageLoadCallback = function (data) {
        $(placeholder).empty().append(this.renderGrid({
            rows: this.getRowsHtml(data)
        }));
        $('thead th', placeholder).removeClass('sort').removeClass('desc');
        $('thead th[column=' + this.sortBy + ']', placeholder).addClass('sort').addClass(this.sortReverse ? 'desc' : '');
        this.setPage(0);
        this.bindEvents();
        this.bindRowEvents();
    }

    this.progressiveLoadCallback = function (data) {
        if (data && data.data && data.data.length) {
            $(this.getRowsHtml(data)).insertAfter(placeholder + ' table.grid tbody:last');
            this.bindRowEvents();
        }
    }

    this.bindEvents = function () {
        var self = this;
        $('table', placeholder).unbind().mousewheel(function () {
            self.setPage(parseInt($(placeholder + ' table tbody:visible:onScreen:last').attr('page')));
        });
        $('table th', placeholder).unbind().click(function () {
            var column = $(this).attr('column');
            self.sortReverse = column == self.sortBy && !self.sortReverse;
            self.sortBy = column;
            self.sort();
        });
    }

    this.bindRowEvents = function () {
        var self = this;
        $('table tr', placeholder).unbind()
            .on('click', 'td', function (event) {
                var tr = $(this).parent();
                var id = tr.attr('key');
                if (id) {
                    self.rowClick(id, tr, event);
                }
                else {
                    console.error('Key attribute is not defined in row template.')
                }
            })
            .on('contextmenu', 'td', function (event) {
                var tr = $(this).parent();
                var id = tr.attr('key');
                if (id) {
                    self.rowRightClick(id, tr, event);
                }
                else {
                    console.error('Key attribute is not defined in row template.')
                }
                return false;
            });
    }

    this.setPage = function (index) {
        if (this.pageIndex != index) {
            this.pageIndex = index;
            if ($.inArray(index + 1, this.pageLoaded) == -1) {
                this.loadPage(index + 1, $.proxy(this, 'progressiveLoadCallback'));   // always load next page 
            }
        }
    }

    this.loadPage = function (index, callback) {
        this.filter.getData(index, this.pageSize, this.sortBy, this.sortReverse, callback);
    }

    this.getRowsHtml = function (data) {
        this.pageLoaded.push(data.pageIndex);
        var rows = '<tbody page="' + data.pageIndex + '">';
        for (var i = 0; i < data.data.length; i++) {
            if (data.data[i]) {
                rows += this.renderGridRow({ row: data.data[i], page: data.pageIndex });
            }
        }
        rows += '</tbody>';
        return rows;
    }

    this.sort();

    this.rowClick = function (id, tr, event) {
        if ($(tr).hasClass('selected')) {
            $(tr).removeClass('selected');
        }
        else {
            $(tr).addClass('selected');
        }
        if (this.clickCallback) {
            this.clickCallback(id, tr, event);
        }
    }

    this.rowRightClick = function (id, tr, event) {
        if (this.contextCallback) {
            this.contextCallback(id, tr, event);
        }
    }

    this.hideRowByKey = function (id) {
        $('tr[key=' + id + ']').fadeOut();
    }

    // adds event handler for row click
    // output params: id, tr, event
    this.click = function (callback) {
        this.clickCallback = callback;
    }

    // adds event handler for contextmenu
    // output params: id, tr, event
    this.context = function (callback) {
        this.contextCallback = callback;
    }

    // public events
    // - rowClick
    // - rowContext
    // - getRows
    // - getSelected
    // - setSelected
}

// TODO:
// 1. row selection (optional)
// 2. get selected rows as object
// 3. click and context handlers
// 4. scroll by dragging scroll bar