// Options applied to all charts
window.Apex = {
    chart: {
        redrawOnParentResize: false,
        redrawOnWindowResize: false,

        height: 400,
        fontFamily: "inherit",
        toolbar: {
            show: true,
            offsetX: 0,
            offsetY: 0,
            tools: {
                download: true,
                selection: false,
                zoom: false,
                zoomin: false,
                zoomout: false,
                pan: false,
                reset: false,
                customIcons: []
            },
        },
    },
    plotOptions: {
        bar: {
            dataLabels: {
                hideOverflowingLabels: false,
            },
        },
    },
    theme: {
        monochrome: {
            enabled: true,
            color: "#97C1FE",
        }
    },
    fill: {
        opacity: 1,
        colors: ["#347AE2", "#97C1FE", "#E2E8FD"]
    },
    legend: {
        fontSize: "14px",
        markers: {
            width: 16,
            height: 16,
            radius: 0,
            fillColors: ["#347AE2", "#97C1FE", "#E2E8FD"],
        },
    },
    dataLabels: {
        style: {
            colors: ["#FFFFFF"],
            fontSize: "16px",
        }
    },
    animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
            enabled: true,
            delay: 150
        },
        dynamicAnimation: {
            enabled: true,
            speed: 350
        }
    },
    // responsive: [{
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
    },
    states: {
        active: {
            filter: {
                value: 1
            }
        },
        hover: {
            filter: {
                type: "darken",
                value: 0.9,
            }
        },
    },
}

// Getting coordinates
function getCoords(elem) {
    // (1)
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    // (2)
    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    // (3)
    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    // (4)
    var top = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return {
        top: top,
        left: left
    };
}

function renderChart(chartID, options) {
    var counterStatus = false;
    var countersBox = document.querySelector(chartID);
    var counterTop = getCoords(countersBox).top;
    var countersHeight = countersBox.clientHeight;
    var screenHeight = document.documentElement.clientHeight;

    window.addEventListener("scroll", function () {
        if (window.scrollY > (counterTop - screenHeight + (countersHeight / 2)) && counterStatus === false) {
            counterStatus = true;
            const updateCounter = () => {
                let apexChart = new ApexCharts(document.querySelector(chartID), options);
                apexChart.render();
            };
            setTimeout(updateCounter, 450);
        }
    });
    if (window.scrollY > (counterTop - screenHeight + (countersHeight / 2)) && counterStatus === false) {
        counterStatus = true;
        const updateCounter = () => {
            let apexChart = new ApexCharts(document.querySelector(chartID), options);
            apexChart.render();
        };
        updateCounter();
    }
}

$.getJSON("/stats/first/1", function (data) {
    one = {
        series: [
            {
                "name": data.name,
                "data": data.series
            }
        ],
        chart: {
            type: "bar",
            zoom: {
                enabled: true
            },
            height: 400,
            fontFamily: "inherit",
        },
        plotOptions: {
            bar: {
                horizontal: false,
                barHeight: "10%",
                dataLabels: {
                    position: "top",
                    hideOverflowingLabels: false,
                }
            },
        },
        dataLabels: {
            enabled: true,
            offsetY: -30,
            style: {
                colors: ["#222"],
                fontSize: "16px",
            },
        },
        yaxis: {
            show: false,
        },
        xaxis: {
            // categories: ["I yarımil 2018", "II yarımil 2018", "I yarımil 2019", "II yarımil 2019", "I yarımil 2020", "II yarımil 2020", "I yarımil 2021"],
            categories: data.categories,
            offsetX: 0,
            labels: {
                hideOverlappingLabels: false,
                rotate: -90
            },
            axisTicks: {
                height: 85,
            },
        },
        legend: {
            show: false
        },
        tooltip: {
            enabled: false,
        },
        fill: {
            opacity: 1,
            colors: ["#347AE2", "#97C1FE", "#E2E8FD"]
        },
        theme: {
            monochrome: {
                enabled: true,
                color: "#97C1FE",
            }
        },
        legend: {
            fontSize: "14px",
            markers: {
                width: 16,
                height: 16,
                radius: 0,
                fillColors: ["#347AE2", "#97C1FE", "#E2E8FD"],
            },
        },
        animations: {
            easing: "easeout",
            speed: 100,
            animateGradually: {
                delay: 0
            },
            dynamicAnimation: {
                speed: 100
            }
        },
        // responsive: [{
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
        },
        states: {
            active: {
                filter: {
                    value: 1
                }
            },
            hover: {
                filter: {
                    type: "darken",
                    value: 0.9,
                }
            },
        },
        noData: {
            text: 'Loading...'
        }
    }
    renderChart("#chart1", one);
});
$.getJSON("/stats/first/2", function (data) {
    two = {
        series: [
            {
                "name": data.name,
                "data": data.series
            }
        ],
        chart: {
            type: "bar",
            zoom: {
                enabled: true
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                dataLabels: {
                    position: "top",
                }
            },
        },
        dataLabels: {
            enabled: true,
            offsetY: -30,
            style: {
                colors: ["#222"],
            },
        },
        yaxis: {
            show: false,
        },
        xaxis: {
            categories: data.categories,
            offsetX: 0,
            labels: {
                hideOverlappingLabels: false,
                rotate: -90
            },
            axisTicks: {
                height: 85,
            },
        },
        legend: {
            show: false
        },
        tooltip: {
            enabled: false,
        }
    }
    renderChart("#chart2", two);
});
$.getJSON("/stats/second/3", function (data) {
    three = {
        series: [
            {"name": data.name, "data": data.series},
            {"name": data.name2, "data": data.series2}
        ],
        chart: {
            type: "bar",
            stacked: true,
            zoom: {
                enabled: true
            }
        },
        fill: {
            colors: ["#97C1FE", "#347AE2"]
        },
        plotOptions: {
            bar: {
                horizontal: false,
                dataLabels: {
                    position: "top",
                }
            },
        },
        dataLabels: {
            enabled: true,
            offsetY: -30,
            style: {
                colors: ["#222"],
            },
            formatter: function (value, {seriesIndex, dataPointIndex, w}) {
                if (seriesIndex === ((w.config.series.length) - parseInt(1))) {
                    return parseFloat(w.globals.stackedSeriesTotals[dataPointIndex].toFixed(1));
                } else if (seriesIndex === ((w.config.series.length) - parseInt(2))) {
                    return value;
                }
            },
        },
        yaxis: {
            show: false,
        },
        xaxis: {
            type: "year",
            categories: data.categories
        },
        legend: {
            fontSize: "14px",
            markers: {
                width: 16,
                height: 16,
                radius: 0,
                fillColors: ["#97C1FE", "#347AE2"],
            },
            onItemClick: {
                toggleDataSeries: false,
            },
            onItemHover: {
                highlightDataSeries: false,
            },
        },
        tooltip: {
            marker: {
                fillColors: ["#97C1FE"],
            },
            y: {
                formatter: function (value, {series, seriesIndex, dataPointIndex}) {
                    return series[0][dataPointIndex] + " mln. ədəd"
                },
            },
        },
        animations: {
            easing: "easeout",
            speed: 100,
            animateGradually: {
                delay: 0
            },
            dynamicAnimation: {
                speed: 100
            }
        },
    }
    renderChart("#chart3", three);
});
$.getJSON("/stats/third/4-2", function (data) {
    four = {
        series: data.series,
        labels: data.labels,
        chart: {
            type: "pie",
            height: 430,
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    position: "top",
                }
            },
            pie: {
                expandOnClick: false,
                dataLabels: {
                    offset: -50,
                },
            },
        },
        dataLabels: {
            style: {
                fontSize: "20px",
            },
            formatter: function (value) {
                return parseFloat(value.toFixed(1)) + "%"
            },
        },
        legend: {
            position: "bottom",
            itemMargin: {
                vertical: 0
            },
        },
        tooltip: {
            y: {
                formatter: function (value, opts) {
                    return value + "%"
                },
            },
        },
        yaxis: {
            show: false,
        },
        stroke: {
            width: 1,
        },
    }
    renderChart("#chart4", four);
});
$.getJSON("/stats/second/5", function (data) {
    five = {
        series: [
            {"name": data.name, "data": data.series},
            {"name": data.name2, "data": data.series2}
        ],
        chart: {
            type: "bar",
            stacked: true,
            stackType: "100%",
            zoom: {
                enabled: true
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
            },
            circle: {
                dataLabels: {
                    showOn: "hover"
                },
            },
        },
        tooltip: {
            y: {
                formatter: function (value, opts) {
                    const percent = value;
                    return percent.toFixed(0) + "%"
                },
            },
        },
        yaxis: {
            show: false,
        },
        xaxis: {
            type: "year",
            categories: data.categories,
        },
        legend: {
            onItemClick: {
                toggleDataSeries: false,
            },
            onItemHover: {
                highlightDataSeries: false,
            },
        }
    }
    renderChart("#chart5", five);
});
$.getJSON("/stats/second/6", function (data) {
    six = {
        series: [
            {"name": data.name, "data": data.series},
            {"name": data.name2, "data": data.series2}
        ],
        chart: {
            type: "bar",
            stacked: true,
            stackType: "100%",
            zoom: {
                enabled: true
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
            },
        },
        tooltip: {
            y: {
                formatter: function (value, opts) {
                    const percent = value;
                    return percent.toFixed(0) + "%"
                },
            },
        },
        yaxis: {
            show: false,
        },
        xaxis: {
            type: "year",
            categories: data.categories,
        },
        legend: {
            onItemClick: {
                toggleDataSeries: false,
            },
            onItemHover: {
                highlightDataSeries: false,
            },
        },
    }
    renderChart("#chart6", six);
});
$.getJSON("/stats/first/7", function (data) {
    seven = {
        series: [
            {
                "name": data.name,
                "data": data.series
            }
        ],
        chart: {
            type: "bar",
            zoom: {
                enabled: true
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                dataLabels: {
                    position: "top",
                }
            },
        },
        dataLabels: {
            enabled: true,
            offsetY: -30,
            style: {
                colors: ["#222"],
            },
        },
        yaxis: {
            show: false,
        },
        xaxis: {
            categories: data.categories,
            offsetX: 0,
            labels: {
                hideOverlappingLabels: false,
                rotate: -90
            },
            axisTicks: {
                height: 85,
            },
        },
        legend: {
            show: false
        },
        tooltip: {
            enabled: false,
        }
    }
    renderChart("#chart7", seven);
});
$.getJSON("/stats/first/8", function (data) {
    eight = {
        series: [
            {
                "name": data.name,
                "data": data.series
            }
        ],
        chart: {
            type: "bar",
            zoom: {
                enabled: true
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                dataLabels: {
                    position: "top",
                }
            },
        },
        dataLabels: {
            enabled: true,
            offsetY: -30,
            style: {
                colors: ["#222"],
            },
        },
        yaxis: {
            show: false,
        },
        xaxis: {
            categories: data.categories,
            offsetX: 0,
            labels: {
                hideOverlappingLabels: false,
                rotate: -90
            },
            axisTicks: {
                height: 85,
            },
        },
        legend: {
            show: false
        },
        tooltip: {
            enabled: false,
        }
    }
    renderChart("#chart8", eight);
});
$.getJSON("/stats/second/9-20", function (data) {
    nine = {
        series: [
            {"name": data.name, "data": data.series},
            {"name": data.name2, "data": data.series2}
        ],
        fill: {
            colors: ["#97C1FE", "#347AE2"]
        },
        chart: {
            type: "bar",
            stacked: true,
            zoom: {
                enabled: true
            },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                dataLabels: {
                    position: 'top',
                }
            },
        },
        dataLabels: {
            enabled: true,
            offsetY: -30,
            style: {
                colors: ["#222"],
            },
            formatter: function (value, {seriesIndex, dataPointIndex, w}) {
                if (seriesIndex === ((w.config.series.length) - parseInt(1))) {
                    return parseFloat(w.globals.stackedSeriesTotals[dataPointIndex].toFixed(1));
                } else if (seriesIndex === ((w.config.series.length) - parseInt(2))) {
                    return value;
                }

            },
        },
        yaxis: {
            show: false,
        },
        xaxis: {
            categories: data.categories,
            offsetX: 0,
            labels: {
                rotate: -90
            },
            axisTicks: {
                height: 85,
            },
        },
        legend: {
            markers: {
                fillColors: ["#97C1FE"],
            },
            onItemClick: {
                toggleDataSeries: false,
            },
            onItemHover: {
                highlightDataSeries: false,
            },
        },
        tooltip: {
            marker: {
                fillColors: ["#97C1FE"],
            },
            y: {
                formatter: function (value, {series, seriesIndex, dataPointIndex}) {
                    return series[0][dataPointIndex] + " mln. ədəd"
                },
            },
        },
        grid: {
            column: {
                colors: ["#FFFFFF"],
                opacity: 1
            },
        },
        responsive: [{
            breakpoint: 1171,
            options: {
                xaxis: {
                    axisTicks: {
                        height: 35,
                    },
                },
            },
        }, {
            breakpoint: 1081,
            options: {
                xaxis: {
                    axisTicks: {
                        height: 85,
                    },
                },
            },
        }
        ]
    }
    renderChart("#chart9", nine);
});
$.getJSON("/stats/second/10-20", function (data) {
    ten = {
        series: [
            {"name": data.name, "data": data.series},
            {"name": data.name2, "data": data.series2}
        ],
        fill: {
            colors: ["#97C1FE", "#347AE2"]
        },
        chart: {
            type: "bar",
            stacked: true,
            zoom: {
                enabled: true
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                dataLabels: {
                    position: 'top',
                }
            },
        },
        dataLabels: {
            enabled: true,
            offsetY: -30,
            style: {
                colors: ["#222"],
            },
            formatter: function (value, {seriesIndex, dataPointIndex, w}) {
                if (seriesIndex === ((w.config.series.length) - parseInt(1))) {
                    return parseFloat(w.globals.stackedSeriesTotals[dataPointIndex].toFixed(1));
                } else if (seriesIndex === ((w.config.series.length) - parseInt(2))) {
                    return value;
                }
            },
        },
        yaxis: {
            show: false,

        },
        xaxis: {
            categories: data.categories,
            offsetX: 0,
            labels: {
                rotate: -90
            },
            axisTicks: {
                height: 85,
            },
        },
        legend: {
            markers: {
                fillColors: ["#97C1FE"],
            },
            onItemClick: {
                toggleDataSeries: false,
            },
            onItemHover: {
                highlightDataSeries: false,
            },
        },
        tooltip: {
            marker: {
                fillColors: ["#97C1FE"],
            },
            y: {
                formatter: function (value, {series, seriesIndex, dataPointIndex}) {
                    var manat = '\u20BC';
                    return series[0][dataPointIndex] + " mln. " + manat
                },
            },
        },
        grid: {
            column: {
                colors: ["#FFFFFF"],
                opacity: 1
            },
        },
        responsive: [{
            breakpoint: 1171,
            options: {
                xaxis: {
                    axisTicks: {
                        height: 35,
                    },
                },
            },
        }, {
            breakpoint: 1081,
            options: {
                xaxis: {
                    axisTicks: {
                        height: 85,
                    },
                },
            },
        }
        ]
    }
    renderChart("#chart10", ten);
});
$.getJSON("/stats/first/11", function (data) {
    eleven = {
        series: [
            {
                "name": data.name,
                "data": data.series
            }
        ],
        chart: {
            type: "bar",
            zoom: {
                enabled: true
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                dataLabels: {
                    position: "top",
                }
            },
        },
        dataLabels: {
            enabled: true,
            offsetY: -30,

            style: {
                colors: ["#222"],
            }
        },
        yaxis: {
            show: false,
        },
        xaxis: {
            categories: data.categories,
            labels: {
                rotate: -90
            },
            axisTicks: {
                height: 85,
            },
        },
        legend: {
            show: false
        },
        tooltip: {
            enabled: false,
        }
    }
    renderChart("#chart11", eleven);
});
$.getJSON("/stats/first/12", function (data) {
    twelve = {
        series: [
            {
                "name": data.name,
                "data": data.series
            }
        ],
        chart: {
            type: "bar",
            zoom: {
                enabled: true
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                dataLabels: {
                    position: "top",
                }
            },
        },
        dataLabels: {
            enabled: true,
            offsetY: -30,
            style: {
                colors: ["#222"],
            },
            formatter: function (val, opts) {
                if (val > 1000) {
                    return Math.floor(val)
                } else {
                    return val
                }
            },
        },
        yaxis: {
            show: false,

        },
        xaxis: {
            categories: data.categories,
            offsetX: 0,
            labels: {
                rotate: -90
            },
            axisTicks: {
                height: 85,
            },
        },
        legend: {
            show: false
        },
        tooltip: {
            enabled: false,
        }
    }
    renderChart("#chart12", twelve);
});
$.getJSON("/stats/second/13-18", function (data) {
    thirteen = {
        series: [
            {"name": data.name, "data": data.series},
            {"name": data.name2, "data": data.series2}
        ],
        fill: {
            colors: ["#97C1FE", "#347AE2"]
        },
        chart: {
            type: "bar",
            stacked: true,
            zoom: {
                enabled: true
            },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                dataLabels: {
                    position: "top",
                }
            },
        },
        dataLabels: {
            enabled: true,
            offsetY: -30,
            style: {
                colors: ["#222"],
            },
            formatter: function (value, {seriesIndex, dataPointIndex, w}) {
                if (seriesIndex === ((w.config.series.length) - parseInt(1))) {
                    return parseFloat(w.globals.stackedSeriesTotals[dataPointIndex].toFixed(1));
                } else if (seriesIndex === ((w.config.series.length) - parseInt(2))) {
                    return value;
                }
            },
        },
        yaxis: {
            show: false,
        },
        xaxis: {
            categories: data.categories,
            offsetX: 0,
            labels: {
                rotate: -90
            },
            axisTicks: {
                height: 85,
            },
        },
        legend: {
            markers: {
                fillColors: ["#97C1FE", "#347AE2"],
            },
            onItemClick: {
                toggleDataSeries: false,
            },
            onItemHover: {
                highlightDataSeries: false,
            },
        },
        tooltip: {
            enabledOnSeries: [0, 2],
            y: {
                formatter: function (val) {
                    return val + " mln. ədəd"
                },
                title: {
                    formatter: function (seriesName) {
                        return ""
                    }
                }
            }
        },
        grid: {
            column: {
                colors: ["#FFFFFF"],
                opacity: 1
            },
        },
        responsive: [{
            breakpoint: 1171,
            options: {
                xaxis: {
                    axisTicks: {
                        height: 35,
                    },
                },
            },
        }, {
            breakpoint: 1081,
            options: {
                xaxis: {
                    axisTicks: {
                        height: 85,
                    },
                },
            },
        }
        ]
    }
    renderChart("#chart13", thirteen);
});
$.getJSON("/stats/second/14-18", function (data) {
    fourteen = {
        series: [
            {"name": data.name, "data": data.series},
            {"name": data.name2, "data": data.series2}
        ],
        fill: {
            colors: ["#97C1FE", "#347AE2"]
        },
        chart: {
            type: "bar",
            stacked: true,
            zoom: {
                enabled: true
            },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                dataLabels: {
                    position: "top",
                }
            },
        },
        dataLabels: {
            enabled: true,
            offsetY: -30,
            style: {
                colors: ["#222"],
            },
            formatter: function (value, {seriesIndex, dataPointIndex, w}) {
                if (seriesIndex === ((w.config.series.length) - parseInt(1))) {
                    return parseFloat(w.globals.stackedSeriesTotals[dataPointIndex].toFixed(1));
                } else if (seriesIndex === ((w.config.series.length) - parseInt(2))) {
                    return value;
                }
            },
        },
        yaxis: {
            show: false,
        },
        xaxis: {
            categories: data.categories,
            offsetX: 0,
            labels: {
                rotate: -90
            },
            axisTicks: {
                height: 85,
            },
        },
        legend: {
            markers: {
                fillColors: ["#97C1FE"],
            },
            onItemClick: {
                toggleDataSeries: false,
            },
            onItemHover: {
                highlightDataSeries: false,
            },
        },
        tooltip: {
            enabledOnSeries: [0, 2],
            y: {
                formatter: function (val) {
                    var manat = '\u20BC';
                    return val + " mlrd. " + manat
                },
                title: {
                    formatter: function (seriesName) {
                        return ""
                    }
                }
            }
        },
        grid: {
            column: {
                colors: ["#FFFFFF"],
                opacity: 1
            },
        },
        responsive: [{
            breakpoint: 1171,
            options: {
                xaxis: {
                    axisTicks: {
                        height: 35,
                    },
                },
            },
        }, {
            breakpoint: 1081,
            options: {
                xaxis: {
                    axisTicks: {
                        height: 85,
                    },
                },
            },
        }
        ]
    }
    renderChart("#chart14", fourteen);
});
$.getJSON("/stats/third/17-2", function (data) {
    fifteen = {
        series: data.series,
        labels: data.labels,
        chart: {
            // width: 450,
            height: 430,
            type: "pie",
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    position: "top",
                },
            },
            pie: {
                expandOnClick: false,
                dataLabels: {
                    offset: -36,
                },
            },
        },
        dataLabels: {
            formatter: function (val, opts) {
                const labels = opts.w.globals.labels[opts.seriesIndex]
                return [opts.w.config.series[opts.seriesIndex] + $("#chart15").data("title") + " \u20BC"];
            },
            style: {
                fontSize: "20px",
            },
        },
        legend: {
            position: "bottom",
        },
        yaxis: {
            show: false,
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return val + $("#chart15").data("title") + " \u20BC"
                },
                title: {
                    formatter: function (seriesName) {
                        return ""
                    }
                }
            }
        },
        stroke: {
            width: 1,
        },
        responsive: [
            {
                breakpoint: 420,
                options: {
                    dataLabels: {
                        style: {
                            fontSize: "16px",
                        },
                    },
                    plotOptions: {
                        pie: {
                            dataLabels: {
                                offset: -35,
                            },
                        },
                    },
                },
            }
        ]
    }
    renderChart("#chart15", fifteen);
});

// click on chart open inner chart
$("#chart4").on("click", ".apexcharts-slices g[rel='1']", function () {
    $(".two-column .flip-card-inner").addClass("rotate-card");
    setTimeout(
        function () {
            $.getJSON("/stats/third/15-3", function (data) {
                fourteen1 = {
                    series: data.series,
                    labels: data.labels,
                    chart: {
                        type: "pie",
                        height: 430,
                    },
                    plotOptions: {
                        bar: {
                            dataLabels: {
                                position: "top",
                            }
                        },
                        pie: {
                            expandOnClick: false,
                            dataLabels: {
                                offset: -50,
                            },
                        },
                    },
                    dataLabels: {
                        style: {
                            fontSize: "20px",
                        },
                        formatter: function (value) {
                            return parseFloat(value.toFixed(1)) + "%"
                        },
                    },
                    legend: {
                        position: "bottom",
                    },
                    tooltip: {
                        y: {
                            formatter: function (value, opts) {
                                return value + "%"
                            },
                        },
                    },
                    yaxis: {
                        show: false,
                    },
                    stroke: {
                        width: 1,
                    }
                }
                var chart4_1 = new ApexCharts(document.querySelector("#chart4-1"), fourteen1);
                chart4_1.render();
            })
        }, 400);
});
$("#chart4-1").on("click", function () {
    $(".two-column .flip-card-inner").removeClass("rotate-card");
    $("#chart4-1").html("");
});


$("#chart15").on("click", ".apexcharts-slices g[rel='1']", function () {
    $(".pie-chart .flip-card-inner").addClass("rotate-card");
    setTimeout(
        function () {
            $.getJSON("/stats/third/16-3", function (data) {
                fifteen1 = {
                    series: data.series,
                    labels: data.labels,
                    chart: {
                        type: "pie",
                        height: 430,
                    },
                    fill: {
                        colors: ["#347AE2", "#97C1FE", "#E2E8FD"]
                    },
                    dataLabels: {
                        enabled: true,
                        style: {
                            fontSize: "20px",
                        },
                        formatter: function (value) {
                            return value.toFixed().replace(/(\.0+|0+)$/, '') + "%";
                        },
                    },
                    plotOptions: {
                        pie: {
                            dataLabels: {
                                minAngleToShowLabel: 5,
                            }
                        }
                    },
                    legend: {
                        position: "bottom",
                        markers: {
                            fillColors: ["#347AE2", "#97C1FE", "#E2E8FD"]
                        },
                    },
                    tooltip: {
                        y: {
                            formatter: function (value, opts) {
                                return value + "%"
                            },
                        },
                    },
                    stroke: {
                        width: 1,
                    },
                }
                var chart15_1 = new ApexCharts(document.querySelector("#chart15-1"), fifteen1);
                chart15_1.render();
            });
        }, 400);
});
$("#chart15-1").on("click", function () {
    $(".pie-chart .flip-card-inner").removeClass("rotate-card");
    $("#chart15-1").html("");
});