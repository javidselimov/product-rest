$(document).ready(function () {
    if (document.getElementById('myChart') != null) {
        var ctx = document.getElementById("myChart").getContext('2d');
        var myChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: [
                    "Yan",
                    "Fev",
                    "Mar",
                    "Apr",
                    "May",
                    "İyun",
                    "İyul",
                    "Avg",
                    "Sen",
                    "Okt",
                    "Noy",
                    "Dek"
                ],
                datasets: [
                    {
                        label: "2026",
                        data: [5.7, 5.7, 5.6, 5.5, 5.6, 5.8, 5.8, 5.7],
                        fill: false,
                        borderColor: "rgb(28, 53, 80)",
                        lineTension: 0.1
                    },
                    {
                        label: "2025",
                        data: [5.4, 5.5, 5.9, 6.3, 6.3, 6.0, 5.0, 4.9, 5.7, 5.9,5.5,5.2],
                        fill: false,
                        borderColor: "rgb(180, 180, 180)",
                        lineTension: 0.1
                    },
                    //{
                    //    label: "2023",
                    //    data: [13.6, 13.9, 13.8, 13.5, 13.1, 12.7, 12.2, 11.7, 10.9, 10.2, 9.4, 8.8],
                    //    fill: false,
                    //    borderColor: "rgb(180, 180, 180)",
                    //    lineTension: 0.1
                    //},
                    //{
                    //    label: "2022",
                    //    data: [12.5, 12.2, 12.2, 12.4, 12.6, 12.9, 13, 13.2, 13.4, 13.7, 13.8, 13.9],
                    //   fill: false,
                    //    borderColor: "rgb(180, 180, 180)",
                    //    lineTension: 0.1
                    //},
                    // {
                    //     label: "2021",
                    //     data: [3.3, 3.7, 3.9, 4.0, 4.2, 4.3, 4.5, 4.8, 5.2, 5.7, 6.2, 6.7],
                    //     fill: false,
                    //     borderColor: "rgb(180, 180, 180)",
                    //     lineTension: 0.1
                    // },
                    // {
                    //     label: "2020",
                    //     data: [2.7, 2.8, 3.0, 3.0, 2.9, 3.0, 2.9, 2.9, 2.9, 2.8, 2.8, 2.8],
                    //     fill: false,
                    //     borderColor: "rgb(180, 180, 180)",
                    //     lineTension: 0.1
                    // },
                    // {
                    //     label: "2018",
                    //     data: [5.5, 4.7, 4.0, 3.5, 3.2, 3.0, 2.8, 2.7, 2.6, 2.4, 2.3, 2.3],
                    //     fill: false,
                    //     borderColor: "rgb(180, 180, 180)",
                    //     lineTension: 0.1
                    // }
                    // {
                    //     label: "2017",
                    //     data: [11.9, 12.5, 13.2, 13.5, 13.8, 13.9, 14, 14, 13.9, 13.7, 13.4, 12.9],
                    //     fill: false,
                    //     borderColor: "rgb(28, 53, 80)",
                    //     lineTension: 0.1
                    // }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            suggestedMax: 10,
                            beginAtZero: true
                        }
                    }]
                },
                legend: {
                    display: true,
                    labels: {
                        fontColor: 'rgb(34, 34, 34)'
                    }
                }

            }
        });
    }
});
