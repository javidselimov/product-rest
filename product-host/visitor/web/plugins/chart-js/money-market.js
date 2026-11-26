$(document).ready(function () {
    $.ajax({
        url: "/home/money-market-chart",
        method: "GET",
        success: function (data) {
            console.log(data);
            if (document.getElementById('moneyMarket') != null) {
                var ctx = document.getElementById("moneyMarket").getContext('2d');
                var moneyMarket = new Chart(ctx, {
                    type: "line",
                    data: {
                        labels: data.labels,
                        datasets: [
                            {
                                data: data.values,
                                fill: true,
                                borderColor: "rgb(28, 53, 80)",
                                lineTension: 0.1
                            },

                        ]
                    },
                    options: {

                        tooltips: {
                            callbacks: {
                                label: function (tooltipItem, data) {
                                    var allData = data.datasets[tooltipItem.datasetIndex].data;
                                    var tooltipData = allData[tooltipItem.index];
                                    return tooltipData + '%';
                                }
                            }
                        },
                        scales: {
                            yAxes: [{
                                ticks: {
                                    suggestedMax: 8,
                                    beginAtZero: true
                                }
                            }]
                        },
                        legend: {
                            display: false,
                            labels: {
                                fontColor: 'rgb(34, 34, 34)'
                            }
                        }

                    }
                });
            }

        },
        error: function (data) {
            console.log(data);
        }
    });


});
