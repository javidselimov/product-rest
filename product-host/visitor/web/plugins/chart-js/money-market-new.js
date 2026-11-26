
$(document).ready(function () {
    if (document.getElementById('money-market-chart-new') != null) {
        var canvas = document.getElementById('money-market-chart-new');

        if (canvas.getAttribute('data-version') === 'homepage') {
            canvas.height = 290;
        } else {
            // canvas.height = 150;
        }

        var showXLabels = canvas.getAttribute('data-version') !== 'homepage';

        $.ajax({
            url: '/indeks/chart-data',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                updateChart(data.datasets, showXLabels);
            },
            error: function (xhr, status, error) {
                console.error(error);
            }
        });
    }
});

function updateChart(datasets, showXLabels) {
    // Преобразуем данные для всех линий
    var chartDatasets = datasets.map(function (dataset) {
        return {
            label: dataset.label,
            data: dataset.data.map(function (point) {
                return {
                    x: point.x,
                    y: point.y
                    //y: parseFloat(point.y)
                };
            }),
            fill: dataset.fill,
            borderColor: dataset.borderColor,
            lineTension: dataset.lineTension,
            pointRadius: dataset.pointRadius
        };
    });

    // Получаем уникальные метки по оси X
    var labels = datasets[0].data.map(function (point) {
        return point.x;
    });

    var ctx = document.getElementById("money-market-chart-new").getContext('2d');
    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: chartDatasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: false,
                    },
                    ticks: {
                        display: showXLabels,
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                    },
                }]
            },
            legend: {
                display: false, // Включаем отображение легенды для всех линий
                position: 'bottom',
                labels: {
                    boxWidth: 20,
                    fontSize: 9,
                    padding: 10
                }
            },
            tooltips: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    title: function (tooltipItems, data) {
                        return data.labels[tooltipItems[0].index]
                    },
                    label: function (tooltipItem, data) {
                        // var datasetLabel = data.datasets[tooltipItem.datasetIndex].label || '';
                        // return datasetLabel + ": " + tooltipItem.yLabel;
                        const datasetLabel = data.datasets[tooltipItem.datasetIndex].label || '';
                        const originalValue = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].y;
                        return datasetLabel + ": " + originalValue;
                    }
                }
            }
        }
    });
}

