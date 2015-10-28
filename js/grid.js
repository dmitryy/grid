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
    }

    this.progressiveLoadCallback = function (data) {
        if (data && data.data && data.data.length) {
            $(this.getRowsHtml(data)).insertAfter(placeholder + ' table.grid tbody:last');
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
            rows += this.renderGridRow({ row: data.data[i], page: data.pageIndex });
        }
        rows += '</tbody>';
        return rows;
    }

    this.sort();
}

// TODO:
// 1. sorting CSS classes
// 2. row selection (optional) and hover styles
// 3. get selected rows as object
// 4. scroll by dragging scroll bar