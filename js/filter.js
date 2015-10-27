var Filter = function () {
    // This is dummy filter class, which will do following:
    // - working with service
    // - returns filtered data 
    // - apply filters to data (through service or not)

    this.getData = function (pageIndex, pageSize, orderBy, reverse, callback) {

        fakeData.sort(function (a, b) {
            if (a[orderBy] < b[orderBy])
                return -1;
            if (a[orderBy] > b[orderBy])
                return 1;
            return 0;
        });

        if (reverse) {
            fakeData.reverse();
        }

        var data = fakeData.subarray(pageIndex * pageSize, pageIndex * pageSize + pageSize);

        // return data with delay
        setTimeout(function () {
            callback.call(null, { pageIndex: pageIndex, pageSize: pageSize, data: data });
        }, 100);
    }
}

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

Array.prototype.subarray = function (start, end) {
    if (!end) {
        end = this.length;
    }
    var newArray = clone(this);
    return newArray.slice(start, end);
};
