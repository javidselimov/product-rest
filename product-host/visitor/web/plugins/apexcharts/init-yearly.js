// Options applied to all charts
window.Apex = {
    chart: {
        redrawOnParentResize: false, redrawOnWindowResize: false,

        height: 400, fontFamily: "inherit", toolbar: {
            show: true, offsetX: 0, offsetY: 0, tools: {
                download: true, selection: false, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false, customIcons: []
            },
        },
    }, plotOptions: {
        bar: {
            dataLabels: {
                hideOverflowingLabels: false,
            },
        },
    }, theme: {
        monochrome: {
            enabled: true, color: "#97C1FE",
        }
    }, fill: {
        opacity: 1, colors: ["#347AE2", "#97C1FE", "#E2E8FD"]
    }, legend: {
        fontSize: "14px", markers: {
            width: 16, height: 16, radius: 0, fillColors: ["#347AE2", "#97C1FE", "#E2E8FD"],
        },
    }, dataLabels: {
        style: {
            colors: ["#FFFFFF"], fontSize: "16px",
        }
    }, animations: {
        enabled: true, easing: 'easeinout', speed: 800, animateGradually: {
            enabled: true, delay: 150
        }, dynamicAnimation: {
            enabled: true, speed: 350
        }
    }, // responsive: [{
    // 	breakpoint: 1171,
    // 	options: {
    // 		legend: {
    // 			position: "bottom",
    // 			offsetX: -10,
    // 			offsetY: 0
    // 		},
    // 		dataLabels: {
    // 			style: {
    // 				fontSize: "14px",
    // 			}
    // 		},
    // 	}
    // }],
    grid: {
        show: false,
    }, states: {
        active: {
            filter: {
                value: 1
            }
        }, hover: {
            filter: {
                type: "darken", value: 0.9,
            }
        },
    },
}

function renderChart(chartID, options) {
    var counterStatus = false;

    if (counterStatus === false) {
        counterStatus = true;
        const updateCounter = () => {
            let apexChart = new ApexCharts(document.querySelector(chartID), options);
            apexChart.render();
        };
        updateCounter();
    }
}

$('.chart-list-item:first-of-type').addClass('active-tab').nextUntil('.chart-list-item').slideDown('slow').delay(300);

$('.chart-list-item').on('click', function (e) {
    e.preventDefault();
    $(this).parent('.chart-list').children('.chart-wrapper:visible').slideUp().delay(500);
    $(this).nextUntil('.chart-list-item').slideDown().delay(300);
    if (!$(this).hasClass('active-tab')) {
        $(this).parent('.chart-list').children('.chart-list-item').removeClass('active-tab');
        $(this).addClass('active-tab');
    } else {
        $(this).parent('.chart-list').children('.chart-list-item').removeClass('active-tab');
    }
    return false;
});


$.getJSON("/stats/first/1", function (data) {
    chartOptions = {
        series: [{"name": '', "data": data.series},], chart: {
            height: 350, type: 'line', dropShadow: {
                enabled: false, color: '#000', top: 18, left: 7, blur: 10, opacity: 0.2
            },
        }, stroke: {
            curve: 'straight'
        }, grid: {
            borderColor: '#e7e7e7', row: {
                colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        }, markers: {
            size: 5, hover: {
                size: 7,
            }
        }, theme: {
            monochrome: {
                enabled: true, color: "#347AE2",
            }
        }, yaxis: [{
            labels: {
                formatter: function (val) {
                    return val.toString()
                }
            }
        }], xaxis: {
            type: "year", labels: {
                show: true, rotate: -60, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 10,
            }, categories: data.categories, tooltip: {
                enabled: false
            }
        },
    }
    renderChart("#chart1", chartOptions);
});
$.getJSON("/stats/first/2", function (data) {
    chartOptions = {
        series: [{"name": '', "data": data.series},], chart: {
            height: 350, type: 'line', dropShadow: {
                enabled: false, color: '#000', top: 18, left: 7, blur: 10, opacity: 0.2
            },
        }, dataLabels: {
            enabled: false
        }, stroke: {
            curve: 'straight'
        }, grid: {
            borderColor: '#e7e7e7', row: {
                colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        }, markers: {
            size: 5, hover: {
                size: 7,
            }
        }, theme: {
            monochrome: {
                enabled: true, color: "#347AE2",
            }
        }, yaxis: [{
            labels: {
                formatter: function (val) {
                    return val.toString()
                }
            }
        }], xaxis: {
            type: "year", labels: {
                show: true, rotate: -60, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 10,
            }, categories: data.categories, tooltip: {
                enabled: false
            }
        },
    }
    renderChart("#chart2", chartOptions);
});
$.getJSON("/stats/second/42-18", function (data) {
    chartOptions = {
        series: [{"name": data.name, "data": data.series}, {"name": data.name2, "data": data.series2}], chart: {
            type: "bar", stacked: true, zoom: {
                enabled: true
            }
        }, fill: {
            colors: ["#97C1FE", "#347AE2"]
        }, plotOptions: {
            bar: {
                horizontal: false, dataLabels: {
                    position: "top",
                }
            },
        }, dataLabels: {
            enabled: true, offsetY: -30, style: {
                colors: ["#222"],
            }
        }, yaxis: {
            show: false,
        }, xaxis: {
            type: "year", categories: data.categories, labels: {
                show: true, rotate: -90, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 2,
            },
        }, legend: {
            fontSize: "14px", markers: {
                width: 16, height: 16, radius: 0, fillColors: ["#97C1FE", "#347AE2"],
            }, onItemClick: {
                toggleDataSeries: false,
            }, onItemHover: {
                highlightDataSeries: false,
            },
        }, tooltip: {
            enabledOnSeries: [0, 2], y: {
                formatter: function (value, {series, seriesIndex, dataPointIndex}) {
                    return series[0][dataPointIndex] + " mln. ədəd"
                }, title: {
                    formatter: function (seriesName) {
                        return ""
                    }
                }
            }
        }, animations: {
            easing: "easeout", speed: 100, animateGradually: {
                delay: 0
            }, dynamicAnimation: {
                speed: 100
            }
        },
    }
    renderChart("#chart3", chartOptions);
});
$.getJSON("/stats/second/44-18", function (data) {
    chartOptions = {
        series: [{"name": data.name, "data": data.series}, {"name": data.name2, "data": data.series2}], chart: {
            type: "bar", stacked: true, zoom: {
                enabled: true
            }
        }, fill: {
            colors: ["#97C1FE", "#347AE2"]
        }, plotOptions: {
            bar: {
                horizontal: false, dataLabels: {
                    position: "top",
                }
            },
        }, dataLabels: {
            enabled: true, offsetY: -30, style: {
                colors: ["#222"],
            }
        }, yaxis: {
            show: false,
        }, xaxis: {
            type: "year", categories: data.categories, labels: {
                show: true, rotate: -90, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 2,
            },
        }, legend: {
            fontSize: "14px", markers: {
                width: 16, height: 16, radius: 0, fillColors: ["#97C1FE", "#347AE2"],
            }, onItemClick: {
                toggleDataSeries: false,
            }, onItemHover: {
                highlightDataSeries: false,
            },
        }, tooltip: {
            enabledOnSeries: [0, 2], y: {
                formatter: function (value, {series, seriesIndex, dataPointIndex}) {
                    return series[0][dataPointIndex] + " mln. manat"
                }, title: {
                    formatter: function (seriesName) {
                        return ""
                    }
                }
            }
        }, animations: {
            easing: "easeout", speed: 100, animateGradually: {
                delay: 0
            }, dynamicAnimation: {
                speed: 100
            }
        },
    }
    renderChart("#chart4", chartOptions);
});
$.getJSON("/stats/first/36-4", function (data) {
    chartOptions = {
        series: [{"name": '', "data": data.series},], chart: {
            height: 350, type: 'line', dropShadow: {
                enabled: false, color: '#000', top: 18, left: 7, blur: 10, opacity: 0.2
            },
        }, dataLabels: {
            enabled: false
        }, stroke: {
            curve: 'straight'
        }, grid: {
            borderColor: '#e7e7e7', row: {
                colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        }, markers: {
            size: 5, hover: {
                size: 7,
            }
        }, theme: {
            monochrome: {
                enabled: true, color: "#347AE2",
            }
        }, yaxis: [{
            labels: {
                formatter: function (val) {
                    return val.toString()
                }
            }
        }], xaxis: {
            type: "year", labels: {
                show: true, rotate: -60, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 10,
            }, categories: data.categories, tooltip: {
                enabled: false
            }
        },
    }
    renderChart("#chart5", chartOptions);
});
$.getJSON("/stats/first/37-4", function (data) {
    chartOptions = {
        series: [{"name": '', "data": data.series},], chart: {
            height: 350, type: 'line', dropShadow: {
                enabled: false, color: '#000', top: 18, left: 7, blur: 10, opacity: 0.2
            },
        }, dataLabels: {
            enabled: false
        }, stroke: {
            curve: 'straight'
        }, grid: {
            borderColor: '#e7e7e7', row: {
                colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        }, markers: {
            size: 5, hover: {
                size: 7,
            }
        }, theme: {
            monochrome: {
                enabled: true, color: "#347AE2",
            }
        }, yaxis: [{
            labels: {
                formatter: function (val) {
                    return val.toString()
                }
            }
        }], xaxis: {
            type: "year", labels: {
                show: true, rotate: -60, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 10,
            }, categories: data.categories, tooltip: {
                enabled: false
            }
        },
    }
    renderChart("#chart6", chartOptions);
});

$.getJSON("/stats/first/46", function (data) {
    chartOptions = {
        series: [{"name": '', "data": data.series},], chart: {
            height: 350, type: 'line', dropShadow: {
                enabled: false, color: '#000', top: 18, left: 7, blur: 10, opacity: 0.2
            },
        }, dataLabels: {
            enabled: false
        }, stroke: {
            curve: 'straight'
        }, grid: {
            borderColor: '#e7e7e7', row: {
                colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        }, markers: {
            size: 5, hover: {
                size: 7,
            }
        }, theme: {
            monochrome: {
                enabled: true, color: "#347AE2",
            }
        }, yaxis: [{
            labels: {
                formatter: function (val) {
                    return val.toString()
                }
            }
        }], xaxis: {
            type: "year", labels: {
                show: true, rotate: -60, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 10,
            }, categories: data.categories, tooltip: {
                enabled: false
            }
        },
    }
    renderChart("#chart90", chartOptions);
});
$.getJSON("/stats/first/47", function (data) {
    chartOptions = {
        series: [{"name": '', "data": data.series},], chart: {
            height: 350, type: 'line', dropShadow: {
                enabled: false, color: '#000', top: 18, left: 7, blur: 10, opacity: 0.2
            },
        }, dataLabels: {
            enabled: false
        }, stroke: {
            curve: 'straight'
        }, grid: {
            borderColor: '#e7e7e7', row: {
                colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        }, markers: {
            size: 5, hover: {
                size: 7,
            }
        }, theme: {
            monochrome: {
                enabled: true, color: "#347AE2",
            }
        }, yaxis: [{
            labels: {
                formatter: function (val) {
                    return val.toString()
                }
            }
        }], xaxis: {
            type: "year", labels: {
                show: true, rotate: -60, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 10,
            }, categories: data.categories, tooltip: {
                enabled: false
            }
        },
    }
    renderChart("#chart91", chartOptions);
});
$.getJSON("/stats/first/48", function (data) {
    chartOptions = {
        series: [{"name": '', "data": data.series},], chart: {
            height: 350, type: 'line', dropShadow: {
                enabled: false, color: '#000', top: 18, left: 7, blur: 10, opacity: 0.2
            },
        }, dataLabels: {
            enabled: false
        }, stroke: {
            curve: 'straight'
        }, grid: {
            borderColor: '#e7e7e7', row: {
                colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        }, markers: {
            size: 5, hover: {
                size: 7,
            }
        }, theme: {
            monochrome: {
                enabled: true, color: "#347AE2",
            }
        }, yaxis: [{
            labels: {
                formatter: function (val) {
                    return val.toString()
                }
            }
        }], xaxis: {
            type: "year", labels: {
                show: true, rotate: -60, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 10,
            }, categories: data.categories, tooltip: {
                enabled: false
            }
        },
    }
    renderChart("#chart92", chartOptions);
});
$.getJSON("/stats/first/49", function (data) {
    chartOptions = {
        series: [{"name": '', "data": data.series},], chart: {
            height: 350, type: 'line', dropShadow: {
                enabled: false, color: '#000', top: 18, left: 7, blur: 10, opacity: 0.2
            },
        }, dataLabels: {
            enabled: false
        }, stroke: {
            curve: 'straight'
        }, grid: {
            borderColor: '#e7e7e7', row: {
                colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        }, markers: {
            size: 5, hover: {
                size: 7,
            }
        }, theme: {
            monochrome: {
                enabled: true, color: "#347AE2",
            }
        }, yaxis: [{
            labels: {
                formatter: function (val) {
                    return val.toString()
                }
            }
        }], xaxis: {
            type: "year", labels: {
                show: true, rotate: -60, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 10,
            }, categories: data.categories, tooltip: {
                enabled: false
            }
        },
    }
    renderChart("#chart93", chartOptions);
});

$.getJSON("/stats/third/17-2", function (data) {
    chartOptions = {
        series: data.series, labels: data.labels, chart: {
            // width: 450,
            height: 430, type: "pie",
        }, plotOptions: {
            bar: {
                dataLabels: {
                    position: "top",
                },
            }, pie: {
                expandOnClick: false, dataLabels: {
                    offset: -36,
                },
            },
        }, dataLabels: {
            formatter: function (val, opts) {
                const labels = opts.w.globals.labels[opts.seriesIndex]
                return [opts.w.config.series[opts.seriesIndex] + $("#chart7").data("title") + " \u20BC"];
            }, style: {
                fontSize: "20px",
            },
        }, legend: {
            position: "bottom",
        }, yaxis: {
            show: false,
        }, tooltip: {
            y: {
                formatter: function (val) {
                    return val + $("#chart7").data("title") + " \u20BC"
                }, title: {
                    formatter: function (seriesName) {
                        return ""
                    }
                }
            }
        }, stroke: {
            width: 1,
        }, responsive: [{
            breakpoint: 420, options: {
                dataLabels: {
                    style: {
                        fontSize: "16px",
                    },
                }, plotOptions: {
                    pie: {
                        dataLabels: {
                            offset: -35,
                        },
                    },
                },
            },
        }]
    }
    renderChart("#chart7", chartOptions);
});
$.getJSON("/stats/second/34-18", function (data) {
    chartOptions = {
        series: [{"name": data.name, "data": data.series}, {"name": data.name2, "data": data.series2}], dataLabels: {
            enabled: true, offsetY: 10,
        }, fill: {
            colors: ["#97C1FE", "#347AE2"]
        },
        chart: {
            type: "bar", stacked: true, stackType: "100%", zoom: {
                enabled: true
            }
        }, plotOptions: {
            bar: {
                horizontal: false,
            }, circle: {
                dataLabels: {
                    showOn: "hover"
                },
            },
        }, tooltip: {
            y: {
                formatter: function (value, opts) {
                    return value.toFixed(0) + "%"
                },
            },
        }, yaxis: {
            show: false,
        }, xaxis: {
            type: "year", categories: data.categories, labels: {
                show: true, rotate: -90, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 2,
            },
        }, legend: {
            onItemClick: {
                toggleDataSeries: false,
            }, onItemHover: {
                highlightDataSeries: false,
            },
            markers: {
                fillColors: ["#97C1FE", "#347AE2"]
            },
        }
    }
    renderChart("#chart8", chartOptions);
});
$.getJSON("/stats/second/13-18", function (data) {
    chartOptions = {
        series: [{"name": data.name, "data": data.series}, {"name": data.name2, "data": data.series2}], chart: {
            type: "bar", stacked: true, zoom: {
                enabled: true
            }
        }, fill: {
            colors: ["#97C1FE", "#347AE2"]
        }, plotOptions: {
            bar: {
                horizontal: false, dataLabels: {
                    position: "top",
                }
            },
        }, dataLabels: {
            enabled: true, offsetY: -30, style: {
                colors: ["#222"],
            }, formatter: function (value, {seriesIndex, dataPointIndex, w}) {
                if (seriesIndex === ((w.config.series.length) - parseInt(1))) {
                    return parseFloat(w.globals.stackedSeriesTotals[dataPointIndex].toFixed(1));
                } else if (seriesIndex === ((w.config.series.length) - parseInt(2))) {
                    return value.toFixed(1);
                }
            },
        }, yaxis: {
            show: false,
        }, xaxis: {
            type: "year", categories: data.categories, labels: {
                show: true, rotate: -90, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 10,
            },
        }, legend: {
            fontSize: "14px", markers: {
                width: 16, height: 16, radius: 0, fillColors: ["#97C1FE", "#347AE2"],
            }, onItemClick: {
                toggleDataSeries: false,
            }, onItemHover: {
                highlightDataSeries: false,
            },
        }, tooltip: {
            enabledOnSeries: [0, 2], y: {
                formatter: function (value, {series, seriesIndex, dataPointIndex}) {
                    return series[0][dataPointIndex].toFixed(1) + " mln. ədəd"
                }, title: {
                    formatter: function (seriesName) {
                        return ""
                    }
                }
            }
        }, animations: {
            easing: "easeout", speed: 100, animateGradually: {
                delay: 0
            }, dynamicAnimation: {
                speed: 100
            }
        },
    }
    renderChart("#chart9", chartOptions);
});
$.getJSON("/stats/second/14-18", function (data) {
    chartOptions = {
        series: [{"name": data.name, "data": data.series}, {"name": data.name2, "data": data.series2}], chart: {
            type: "bar", stacked: true, zoom: {
                enabled: true
            }
        }, fill: {
            colors: ["#97C1FE", "#347AE2"]
        }, plotOptions: {
            bar: {
                horizontal: false, dataLabels: {
                    position: "top",
                }
            },
        }, dataLabels: {
            enabled: true, offsetY: -30, style: {
                colors: ["#222"],
            }, formatter: function (value, {seriesIndex, dataPointIndex, w}) {
                if (seriesIndex === ((w.config.series.length) - parseInt(1))) {
                    return parseFloat(w.globals.stackedSeriesTotals[dataPointIndex].toFixed(1));
                } else if (seriesIndex === ((w.config.series.length) - parseInt(2))) {
                    return value.toFixed(1);
                }
            },
        }, yaxis: {
            show: false,
        }, xaxis: {
            type: "year", categories: data.categories, labels: {
                show: true, rotate: -90, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 10,
            },
        }, legend: {
            fontSize: "14px", markers: {
                width: 16, height: 16, radius: 0, fillColors: ["#97C1FE", "#347AE2"],
            }, onItemClick: {
                toggleDataSeries: false,
            }, onItemHover: {
                highlightDataSeries: false,
            },
        }, tooltip: {
            enabledOnSeries: [0, 2], y: {
                formatter: function (value, {series, seriesIndex, dataPointIndex}) {
                    return series[0][dataPointIndex].toFixed(1) + " mlrd. manat"
                }, title: {
                    formatter: function (seriesName) {
                        return ""
                    }
                }
            }
        }, animations: {
            easing: "easeout", speed: 100, animateGradually: {
                delay: 0
            }, dynamicAnimation: {
                speed: 100
            }
        },
    }
    renderChart("#chart10", chartOptions);
});

$.getJSON("/stats/second/3-18", function (data) {
    chartOptions = {
        series: [{"name": data.name, "data": data.series}, {"name": data.name2, "data": data.series2}], chart: {
            type: "bar", stacked: true, zoom: {
                enabled: true
            }
        }, fill: {
            colors: ["#97C1FE", "#347AE2"]
        }, plotOptions: {
            bar: {
                horizontal: false, dataLabels: {
                    position: "top",
                }
            },
        }, dataLabels: {
            enabled: true, offsetY: -30, style: {
                colors: ["#222"],
            }, formatter: function (value, {seriesIndex, dataPointIndex, w}) {
                if (seriesIndex === ((w.config.series.length) - parseInt(1))) {
                    return parseFloat(w.globals.stackedSeriesTotals[dataPointIndex].toFixed(1));
                } else if (seriesIndex === ((w.config.series.length) - parseInt(2))) {
                    return value;
                }
            },
        }, yaxis: {
            show: false,
        }, xaxis: {
            type: "year", categories: data.categories, labels: {
                show: true, rotate: -90, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 2,
            },
        }, legend: {
            fontSize: "14px", markers: {
                width: 16, height: 16, radius: 0, fillColors: ["#97C1FE", "#347AE2"],
            }, onItemClick: {
                toggleDataSeries: false,
            }, onItemHover: {
                highlightDataSeries: false,
            },
        }, tooltip: {
            enabledOnSeries: [0, 2], y: {
                formatter: function (value, {series, seriesIndex, dataPointIndex}) {
                    return series[0][dataPointIndex] + " mln. ədəd"
                }, title: {
                    formatter: function (seriesName) {
                        return ""
                    }
                }
            }
        }, animations: {
            easing: "easeout", speed: 100, animateGradually: {
                delay: 0
            }, dynamicAnimation: {
                speed: 100
            }
        },
    }
    renderChart("#chart11", chartOptions);
});
$.getJSON("/stats/third/4-2", function (data) {
    chartOptions = {
        series: data.series, labels: data.labels, chart: {
            type: "pie", height: 430,
        }, plotOptions: {
            bar: {
                dataLabels: {
                    position: "top",
                }
            }, pie: {
                expandOnClick: false, dataLabels: {
                    offset: -50,
                },
            },
        }, dataLabels: {
            style: {
                fontSize: "20px",
            }, formatter: function (value) {
                return parseFloat(value.toFixed(1)) + "%"
            },
        }, legend: {
            position: "bottom", itemMargin: {
                vertical: 0
            },
        }, tooltip: {
            y: {
                formatter: function (value, opts) {
                    return value + "%"
                },
            },
        }, yaxis: {
            show: false,
        }, stroke: {
            width: 1,
        },
    }
    renderChart("#chart12", chartOptions);
});
$.getJSON("/stats/second/5-18", function (data) {
    chartOptions = {
        series: [{"name": data.name2, "data": data.series2}, {"name": data.name, "data": data.series}], chart: {
            type: "bar", stacked: true, stackType: "100%", zoom: {
                enabled: true
            }
        }, fill: {
            colors: ["#97C1FE", "#347AE2"]
        }, plotOptions: {
            bar: {
                horizontal: false,
            }, circle: {
                dataLabels: {
                    showOn: "hover"
                },
            },
        }, tooltip: {
            y: {
                formatter: function (value, opts) {
                    const percent = value;
                    return percent.toFixed(0) + "%"
                },
            },
        }, yaxis: {
            show: false,
        }, xaxis: {
            type: "year", categories: data.categories, labels: {
                show: true, rotate: -90, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 2,
            },
        }, legend: {
            onItemClick: {
                toggleDataSeries: false,
            }, onItemHover: {
                highlightDataSeries: false,
            },
            markers: {
                fillColors: ["#97C1FE", "#347AE2"]
            },
        }
    }
    renderChart("#chart13", chartOptions);
});
$.getJSON("/stats/second/6-18", function (data) {
    chartOptions = {
        series: [{"name": data.name2, "data": data.series2}, {"name": data.name, "data": data.series}], chart: {
            type: "bar", stacked: true, stackType: "100%", zoom: {
                enabled: true
            }
        }, fill: {
            colors: ["#97C1FE", "#347AE2"]
        }, plotOptions: {
            bar: {
                horizontal: false,
            }, circle: {
                dataLabels: {
                    showOn: "hover"
                },
            },
        }, tooltip: {
            y: {
                formatter: function (value, opts) {
                    const percent = value;
                    return percent.toFixed(0) + "%"
                },
            },
        }, yaxis: {
            show: false,
        }, xaxis: {
            type: "year", categories: data.categories, labels: {
                show: true, rotate: -90, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 2,
            },
        }, legend: {
            onItemClick: {
                toggleDataSeries: false,
            }, onItemHover: {
                highlightDataSeries: false,
            },
            markers: {
                fillColors: ["#97C1FE", "#347AE2"]
            },
        }
    }
    renderChart("#chart14", chartOptions);
});
$.getJSON("/stats/first/7", function (data) {
    chartOptions = {
        series: [{"name": '', "data": data.series},], chart: {
            height: 350, type: 'line', dropShadow: {
                enabled: false, color: '#000', top: 18, left: 7, blur: 10, opacity: 0.2
            },
        }, dataLabels: {
            enabled: false
        }, stroke: {
            curve: 'straight'
        }, grid: {
            borderColor: '#e7e7e7', row: {
                colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        }, markers: {
            size: 5, hover: {
                size: 7,
            }
        }, theme: {
            monochrome: {
                enabled: true, color: "#347AE2",
            }
        }, yaxis: [{
            labels: {
                formatter: function (val) {
                    return val.toString()
                }
            }
        }], xaxis: {
            type: "year", labels: {
                show: true, rotate: -60, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 10,
            }, categories: data.categories, tooltip: {
                enabled: false
            }
        },
    }
    renderChart("#chart15", chartOptions);
});
$.getJSON("/stats/first/8", function (data) {
    chartOptions = {
        series: [{"name": '', "data": data.series},], chart: {
            height: 350, type: 'line', dropShadow: {
                enabled: false, color: '#000', top: 18, left: 7, blur: 10, opacity: 0.2
            },
        }, dataLabels: {
            enabled: false
        }, stroke: {
            curve: 'straight'
        }, grid: {
            borderColor: '#e7e7e7', row: {
                colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        }, markers: {
            size: 5, hover: {
                size: 7,
            }
        }, theme: {
            monochrome: {
                enabled: true, color: "#347AE2",
            }
        }, yaxis: [{
            labels: {
                formatter: function (val) {
                    return val.toString()
                }
            }
        }], xaxis: {
            type: "year", labels: {
                show: true, rotate: -60, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 10,
            }, categories: data.categories, tooltip: {
                enabled: false
            }
        },
    }
    renderChart("#chart16", chartOptions);
});
$.getJSON("/stats/second/9-18", function (data) {
    chartOptions = {
        series: [{"name": data.name, "data": data.series}, {"name": data.name2, "data": data.series2}], chart: {
            type: "bar", stacked: true, zoom: {
                enabled: true
            }
        }, fill: {
            colors: ["#97C1FE", "#347AE2"]
        }, plotOptions: {
            bar: {
                horizontal: false, dataLabels: {
                    position: "top",
                }
            },
        }, dataLabels: {
            enabled: true, offsetY: -30, style: {
                colors: ["#222"],
            }, formatter: function (value, {seriesIndex, dataPointIndex, w}) {
                if (seriesIndex === ((w.config.series.length) - parseInt(1))) {
                    return parseFloat(w.globals.stackedSeriesTotals[dataPointIndex].toFixed(1));
                } else if (seriesIndex === ((w.config.series.length) - parseInt(2))) {
                    return value;
                }
            },
        }, yaxis: {
            show: false,
        }, xaxis: {
            type: "year", categories: data.categories, labels: {
                show: true, rotate: -90, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 2,
            },
        }, legend: {
            fontSize: "14px", markers: {
                width: 16, height: 16, radius: 0, fillColors: ["#97C1FE", "#347AE2"],
            }, onItemClick: {
                toggleDataSeries: false,
            }, onItemHover: {
                highlightDataSeries: false,
            },
        }, tooltip: {
            enabledOnSeries: [0, 2], y: {
                formatter: function (value, {series, seriesIndex, dataPointIndex}) {
                    return series[0][dataPointIndex] + " mln. ədəd"
                }, title: {
                    formatter: function (seriesName) {
                        return ""
                    }
                }
            }
        }, animations: {
            easing: "easeout", speed: 100, animateGradually: {
                delay: 0
            }, dynamicAnimation: {
                speed: 100
            }
        },
    }
    renderChart("#chart17", chartOptions);
});
$.getJSON("/stats/second/10-18", function (data) {
    chartOptions = {
        series: [{"name": data.name, "data": data.series}, {"name": data.name2, "data": data.series2}], chart: {
            type: "bar", stacked: true, zoom: {
                enabled: true
            }
        }, fill: {
            colors: ["#97C1FE", "#347AE2"]
        }, plotOptions: {
            bar: {
                horizontal: false, dataLabels: {
                    position: "top",
                }
            },
        }, dataLabels: {
            enabled: true, offsetY: -30, style: {
                colors: ["#222"],
            }, formatter: function (value, {seriesIndex, dataPointIndex, w}) {
                if (seriesIndex === ((w.config.series.length) - parseInt(1))) {
                    return parseFloat(w.globals.stackedSeriesTotals[dataPointIndex].toFixed(1));
                } else if (seriesIndex === ((w.config.series.length) - parseInt(2))) {
                    return value;
                }
            },
        }, yaxis: {
            show: false,
        }, xaxis: {
            type: "year", categories: data.categories, labels: {
                show: true, rotate: -90, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 2,
            },
        }, legend: {
            fontSize: "14px", markers: {
                width: 16, height: 16, radius: 0, fillColors: ["#97C1FE", "#347AE2"],
            }, onItemClick: {
                toggleDataSeries: false,
            }, onItemHover: {
                highlightDataSeries: false,
            },
        }, tooltip: {
            enabledOnSeries: [0, 2], y: {
                formatter: function (value, {series, seriesIndex, dataPointIndex}) {
                    return series[0][dataPointIndex] + " mln. manat"
                }, title: {
                    formatter: function (seriesName) {
                        return ""
                    }
                }
            }
        }, animations: {
            easing: "easeout", speed: 100, animateGradually: {
                delay: 0
            }, dynamicAnimation: {
                speed: 100
            }
        },
    }
    renderChart("#chart18", chartOptions);
});
$.getJSON("/stats/first/11", function (data) {
    chartOptions = {
        series: [{"name": '', "data": data.series},], chart: {
            height: 350, type: 'line', dropShadow: {
                enabled: false, color: '#000', top: 18, left: 7, blur: 10, opacity: 0.2
            },
        }, dataLabels: {
            enabled: false
        }, stroke: {
            curve: 'straight'
        }, grid: {
            borderColor: '#e7e7e7', row: {
                colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        }, markers: {
            size: 5, hover: {
                size: 7,
            }
        }, theme: {
            monochrome: {
                enabled: true, color: "#347AE2",
            }
        }, yaxis: [{
            labels: {
                formatter: function (val) {
                    return val.toString()
                }
            }
        }], xaxis: {
            type: "year", labels: {
                show: true, rotate: -60, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 10,
            }, categories: data.categories, tooltip: {
                enabled: false
            }
        },
    }
    renderChart("#chart19", chartOptions);
});
$.getJSON("/stats/first/12", function (data) {
    chartOptions = {
        series: [{"name": '', "data": data.series},], chart: {
            height: 350, type: 'line', dropShadow: {
                enabled: false, color: '#000', top: 18, left: 7, blur: 10, opacity: 0.2
            },
        }, dataLabels: {
            enabled: false
        }, stroke: {
            curve: 'straight'
        }, grid: {
            borderColor: '#e7e7e7', row: {
                colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        }, markers: {
            size: 5, hover: {
                size: 7,
            }
        }, theme: {
            monochrome: {
                enabled: true, color: "#347AE2",
            }
        }, yaxis: [{
            labels: {
                formatter: function (val) {
                    return val.toString()
                }
            }
        }], xaxis: {
            type: "year", labels: {
                show: true, rotate: -60, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 10,
            }, categories: data.categories, tooltip: {
                enabled: false
            }
        },
    }
    renderChart("#chart20", chartOptions);
});
$.getJSON("/stats/second/32-18", function (data) {
    chartOptions = {
        series: [{"name": data.name, "data": data.series}, {"name": data.name2, "data": data.series2}], chart: {
            type: "bar", stacked: true, stackType: "100%", zoom: {
                enabled: true
            },
        }, fill: {
            colors: ["#97C1FE", "#347AE2"]
        }, plotOptions: {
            bar: {
                horizontal: false,
            }, circle: {
                dataLabels: {
                    showOn: "hover"
                },
            },
        }, tooltip: {
            y: {
                formatter: function (value, opts) {
                    const percent = value;
                    return percent.toFixed(0) + "%"
                },
            },
        }, yaxis: {
            show: false,
        }, xaxis: {
            type: "year", categories: data.categories, labels: {
                show: true, rotate: -90, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 2,
            },
        }, legend: {
            onItemClick: {
                toggleDataSeries: false,
            }, onItemHover: {
                highlightDataSeries: false,
            },
            markers: {
                fillColors: ["#97C1FE", "#347AE2"]
            },
        }
    }
    renderChart("#chart21", chartOptions);
});
$.getJSON("/stats/first/38", function (data) {
    chartOptions = {
        series: [{"name": '', "data": data.series},], chart: {
            height: 350, type: 'line', dropShadow: {
                enabled: false, color: '#000', top: 18, left: 7, blur: 10, opacity: 0.2
            },
        }, dataLabels: {
            enabled: false
        }, stroke: {
            curve: 'straight'
        }, grid: {
            borderColor: '#e7e7e7', row: {
                colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        }, markers: {
            size: 5, hover: {
                size: 7,
            }
        }, theme: {
            monochrome: {
                enabled: true, color: "#347AE2",
            }
        }, yaxis: [{
            labels: {
                formatter: function (val) {
                    return val.toString()
                }
            }
        }], xaxis: {
            type: "year", labels: {
                show: true, rotate: -60, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 10,
            }, categories: data.categories, tooltip: {
                enabled: false
            }
        },
    }
    renderChart("#chart22", chartOptions);
});
$.getJSON("/stats/first/39", function (data) {
    chartOptions = {
        series: [{"name": '', "data": data.series},], chart: {
            height: 350, type: 'line', dropShadow: {
                enabled: false, color: '#000', top: 18, left: 7, blur: 10, opacity: 0.2
            },
        }, dataLabels: {
            enabled: false
        }, stroke: {
            curve: 'straight'
        }, grid: {
            borderColor: '#e7e7e7', row: {
                colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        }, markers: {
            size: 5, hover: {
                size: 7,
            }
        }, theme: {
            monochrome: {
                enabled: true, color: "#347AE2",
            }
        }, yaxis: [{
            labels: {
                formatter: function (val) {
                    return val.toString()
                }
            }
        }], xaxis: {
            type: "year", labels: {
                show: true, rotate: -60, rotateAlways: true, minHeight: 100, maxHeight: 180, offsetY: 10,
            }, categories: data.categories, tooltip: {
                enabled: false
            }
        },
    }
    renderChart("#chart23", chartOptions);
});