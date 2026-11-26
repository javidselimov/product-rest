// Options applied to all charts
window.Apex = {
    chart: {
        redrawOnParentResize: false,
        redrawOnWindowResize: false,

        height: 400,
        fontFamily: "inherit",
        toolbar: {
            show: false
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
        easing: "easeout",
        speed: 100,
        animateGradually: {
            delay: 0
        },
        dynamicAnimation: {
            speed: 100
        }
    },
    responsive: [{
        breakpoint: 1171,
        options: {
            legend: {
                position: "bottom",
                offsetX: -10,
                offsetY: 0
            },
            dataLabels: {
                style: {
                    fontSize: "14px",
                }
            },
        }
    }],
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

var apexCharts = $(".apexCharts");
var options = {
    eighteen: {
        series: [{
            name: "mln. ədəd",
            data: [18, 22, 25.4, 31.2, 27.7, 32.2, 35.5,],
        }],
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
            categories: ["I yarımil 2018", "II yarımil 2018", "I yarımil 2019", "II yarımil 2019", "I yarımil 2020", "II yarımil 2020", "I yarımil 2021"],
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
    },
    nineteen: {
        series: [{
            name: "mlrd. manat",
            data: [124.9, 149.5, 131.3, 127.4, 106.5, 116.9, 98.5]
        }],
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
            categories: ["I yarımil 2018", "II yarımil 2018", "I yarımil 2019", "II yarımil 2019", "I yarımil 2020", "II yarımil 2020", "I yarımil 2021"],
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
    },
    five: {
        series: [{
            name: "ondan təmassız",
            data: [0.7, 1.5, 3.7, 5.4]
        }, {
            name: "kart sayi",
            // data: [5.9, 7.5, 9.6, 10.4]
            data: [6, 6, 5.9, 5],
        }],
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
            },
        },
        dataLabels: {
            textAnchor: "middle",
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
            categories: ["2018", "2019", "2020", "I yarımil 2021"],
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
            },
        },
    },
    sixteen: {
        series: [88, 12],
        labels: ["debet kartlar", "kredit kartlar"],
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
    },
    one: {
        series: [{
            name: "Nağd",
            data: [61, 52, 42, 35]
        }, {
            name: "Nağdsız",
            data: [39, 48, 58, 65]
        }],
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
            categories: ["2018", "2019", "2020", "I yarımil 2021"],
        },
        legend: {
            onItemClick: {
                toggleDataSeries: false,
            },
            onItemHover: {
                highlightDataSeries: false,
            },
        },
    },
    two: {
        series: [{
            name: "Nağd",
            data: [82, 79, 77, 72]
        }, {
            name: "Nağdsız",
            data: [18, 21, 23, 28],
        }],
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
            categories: ["2018", "2019", "2020", "I yarımil 2021"],
        },
        legend: {
            onItemClick: {
                toggleDataSeries: false,
            },
            onItemHover: {
                highlightDataSeries: false,
            },
        },
    },
    three: {
        series: [{
            name: "mln. ədəd",
            data: [19.4, 23.3, 30.1, 40.8, 52.3, 66.3, 88.2],
        }],
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
            categories: ["I yarımil 2018", "II yarımil 2018", "I yarımil 2019", "II yarımil 2019", "I yarımil 2020", "II yarımil 2020", "I yarımil 2021"],
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
    },
    four: {
        series: [{
            name: "mlrd. manat",
            data: [1.3, 1.7, 2.1, 2.7, 2.9, 3.5, 4.5]
        }],
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
            categories: ["I yarımil 2018", "II yarımil 2018", "I yarımil 2019", "II yarımil 2019", "I yarımil 2020", "II yarımil 2020", "I yarımil 2021"],
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
    },
    eight: {
        series: [{
            name: "ondan təmassız",
            data: [0.3, 0.6, 1.2, 3.1, 6.3, 12.4, 26.2]
        }, {
            name: "ondan təmassız",
            // data: [6.2, 8.5, 10.7, 14.7, 20.9, 27.5, 42.7]
            data: [5.9, 7.9, 9.5, 11.6, 14.6, 15.1, 16.5]
        }],
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
            },
        },
        dataLabels: {
            enabled: true,
            textAnchor: "middle",
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
            categories: ["I yarımil 2018", "II yarımil 2018", "I yarımil 2019", "II yarımil 2019", "I yarımil 2020", "II yarımil 2020", "I yarımil 2021"],
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
    },
    nine: {
        series: [{
            name: "ondan təmassız",
            data: [9, 15, 27, 65, 143, 350, 937]
        }, {
            name: "ondan təmassız",
            // data: [500, 619, 614, 722, 954, 1224, 1767]
            data: [491, 604, 587, 657, 811, 874, 830]
        }],
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
            },
        },
        dataLabels: {
            enabled: true,
            textAnchor: 'middle',
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
            categories: ["I yarımil 2018", "II yarımil 2018", "I yarımil 2019", "II yarımil 2019", "I yarımil 2020", "II yarımil 2020", "I yarımil 2021"],
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
    },
    eleven: {
        series: [{
            name: "mln. ədəd",
            data: [12.6, 14, 18.8, 25.5, 30.8, 37.9, 43.2]
        }],
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
            categories: ["I yarımil 2018", "II yarımil 2018", "I yarımil 2019", "II yarımil 2019", "I yarımil 2020", "II yarımil 2020", "I yarımil 2021"],
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
    },
    twelve: {
        series: [{
            name: "mln. manat",
            data: [677, 994, 1355, 1859, 1804, 2131, 2446]
        }],
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
            categories: ["I yarımil 2018", "II yarımil 2018", "I yarımil 2019", "II yarımil 2019", "I yarımil 2020", "II yarımil 2020", "I yarımil 2021"],
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
    },
    six: {
        series: [{
            name: "ondan elektron bankçılıq",
            data: [4.2, 6.2, 9, 14.7, 21.2, 21.2, 19.3]
        }, {
            name: "cari hesablardan aparılan köçürmələrin sayı",
            // data: [6.8, 9.6, 15, 21.8, 27.9, 28.5, 25.5]
            data: [2.6, 3.4, 6, 7.1, 6.7, 7.3, 6.2]
        }],
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
            },
        },
        dataLabels: {
            enabled: true,
            textAnchor: "middle",
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
            categories: ["I yarımil 2018", "II yarımil 2018", "I yarımil 2019", "II yarımil 2019", "I yarımil 2020", "II yarımil 2020", "I yarımil 2021"],
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
    },
    seven: {
        series: [{
            name: "ondan elektron bankçılıq",
            data: [15.4, 21, 22.7, 39, 41, 54.7, 64.9],
        }, {
            name: "cari hesablardan aparılan köçürmələrin həcmi",
            // data: [64.4, 74.2, 66.3, 89.8, 71.8, 83.6, 93.3],
            data: [49, 53.2, 43.6, 50.8, 30.8, 28.9, 28.4],
        }],
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
            },
        },
        dataLabels: {
            enabled: true,
            textAnchor: "middle",
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
            categories: ["I yarımil 2018", "II yarımil 2018", "I yarımil 2019", "II yarımil 2019", "I yarımil 2020", "II yarımil 2020", "I yarımil 2021"],
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
    },
    ten: {
        series: [64.9, 28.4],
        labels: ["mlrd. manat", "mlrd. manat"],
        chart: {
            width: 450,
            height: 420,
            type: "pie",
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    position: "top",
                },
            },
            pie: {
                dataLabels: {
                    offset: -50,
                },
            },
        },
        dataLabels: {
            formatter: function (value, opts) {
                return [opts.w.config.series[opts.seriesIndex] + " mlrd. " + "\u20BC"];
            },
            // formatter: function(val, opts) {
            // 	const name = opts.w.globals.labels[opts.seriesIndex]
            // 	return[opts.w.config.series[opts.seriesIndex] + " mlrd. " + "\u20BC", name];
            // },
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
                    return val + " mlrd. " + "\u20BC"
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
        responsive: [{
            breakpoint: 1171,
            options: {
                chart: {
                    width: 350,
                    height: 320,
                },
                dataLabels: {
                    style: {
                        fontSize: "15px",
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
        }, {
            breakpoint: 881,
            options: {
                chart: {
                    width: 280,
                    height: 270,
                },
                dataLabels: {
                    style: {
                        fontSize: "12px",
                    },
                },
                plotOptions: {
                    pie: {
                        dataLabels: {
                            offset: -30,
                        },
                    },
                },
            },
        }, {
            breakpoint: 415,
            options: {
                chart: {
                    width: 210,
                    height: 220,
                },
                dataLabels: {
                    style: {
                        fontSize: "10px",
                    },
                },
                plotOptions: {
                    pie: {
                        dataLabels: {
                            offset: -25,
                        },
                    },
                },
            },
        },
        ],
    },
};

var options17 = {
    series: [38, 28, 34],
    labels: ["sosial kartlar", "əmək haqqı kartları", "digər debet kartlar"],
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
    },
    responsive: [{
        breakpoint: 1171,
        options: {
            dataLabels: {
                style: {
                    fontSize: "14px",
                }
            },
        },
    }, {
        breakpoint: 427,
        options: {
            chart: {
                height: 350,
            },
        },
    }, {
        breakpoint: 371,
        options: {
            chart: {
                height: 320,
            },
        },
    }, {
        breakpoint: 330,
        options: {
            chart: {
                height: 300,
            },
        },
    },
    ],
}
var options13 = {
    series: [91.0, 2.4, 6.6],
    labels: ["internet bankçılıq", "mobil bankçılıq", "PC bankçılıq"],
    chart: {
        width: 250,
        type: "pie",
    },
    fill: {
        colors: ["#347AE2", "#97C1FE", "#E2E8FD"]
    },
    dataLabels: {
        enabled: true,
        style: {
            fontSize: "16px",
        },
    },
    plotOptions: {
        pie: {
            dataLabels: {
                minAngleToShowLabel: 5
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
    responsive: [{
        breakpoint: 1171,
        options: {
            chart: {
                width: 180,
            },
            dataLabels: {
                style: {
                    fontSize: "14px",
                }
            },
        },
    }, {
        breakpoint: 881,
        options: {
            chart: {
                width: 150,
            },
            dataLabels: {
                style: {
                    fontSize: "12px",
                },
            },
            legend: {
                fontSize: "12px"
            },
        },
    }, {
        breakpoint: 415,
        options: {
            chart: {
                width: 135,
            },
            dataLabels: {
                style: {
                    fontSize: "11px",
                },
            },
            legend: {
                fontSize: "12px"
            },
        },
    }, {
        breakpoint: 375,
        options: {
            chart: {
                width: 105,
            },
            dataLabels: {
                style: {
                    fontSize: "10px",
                },
            },
        },
    },
    ],
}

chartStatus = [];
for (i = 0; i < apexCharts.length; i++) {
    chartStatus[i] = false;
}

$.fn.isOnScreen = function () {
    var win = $(window);
    var viewport = {
        top: win.scrollTop(),
        left: win.scrollLeft()
    };
    viewport.right = viewport.left + win.width();
    viewport.bottom = viewport.top + win.height();

    var bounds = this.offset();
    bounds.right = bounds.left + this.outerWidth();
    bounds.bottom = bounds.top + this.outerHeight();

    return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
};

function chartInit() {
    for (i = 0; i < apexCharts.length; i++) {
        var currentChart = apexCharts[i];
        var option = $(currentChart).data("options");
        // var position = $(apexCharts[i]).offset().top;
        // var chartHeight = currentChart.clientHeight;
        var pageWidth = $(window).width();

        if ($(currentChart).isOnScreen() && chartStatus[i] == false) {
            chartStatus[i] = true;
            new ApexCharts(currentChart, options[option]).render();
        } else if ($(currentChart).isOnScreen() == false && chartStatus[i] == true && pageWidth > 480) {
            chartStatus[i] = false;
            $(currentChart).html("");
        } else if ($("#chart17").isOnScreen() == false) {
            $(".flip-card-inner").removeClass("rotate-card");
            $("#chart17").html("");
        }
    }
}

chartInit();


var debounceTimer;
$(window).scroll(function () {
    if (debounceTimer) {
        window.clearTimeout(debounceTimer);
    }
    debounceTimer = window.setTimeout(function () {
        chartInit();
    }, 100);
});

// click on chart open inner chart
$("#chart16").on("click", ".apexcharts-slices g[rel='1']", function () {
    $(".flip-card-inner").addClass("rotate-card");
    setTimeout(
        function () {
            var chart17 = new ApexCharts(document.querySelector("#chart17"), options17).render();
        }, 400);
    $("#chart16").html("");
});
$("#chart17").on("click", function () {
    $(".flip-card-inner").removeClass("rotate-card");
    setTimeout(
        function () {
            var chartOption = $("#chart16").data("options");
            var chart16 = new ApexCharts(document.querySelector("#chart16"), options[chartOption]).render();
        }, 400);
    $("#chart17").html("");
});

$("#chart10").on("click", ".apexcharts-slices g[rel='1']", function () {
    var innerChart = $("#chart13");
    var bigChart = $(".pie-chart .chart");
    var inactiveData = $(".apexcharts-series.apexcharts-pie-series[rel='2']");
    var inactiveText = $(".apexcharts-slices g:nth-child(4)");

    if (bigChart.hasClass("show-chart")) {
        setTimeout(
            function () {
                bigChart.removeClass("show-chart");
                innerChart.html("");
            }, 500);
        innerChart.removeClass("animated").addClass("animated-out");
        inactiveData.css({"opacity": "1"});
        inactiveText.css({"opacity": "1"});
    } else {
        bigChart.addClass("show-chart");
        innerChart.removeClass("animated-out").addClass("animated");
        var chart13 = new ApexCharts(document.querySelector("#chart13"), options13).render();
        inactiveData.css({"opacity": "0.2"});
        inactiveText.css({"opacity": "0.2"});
    }
});