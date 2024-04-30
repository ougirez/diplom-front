/* global CanvasJS */

import React, {useEffect, useState} from 'react';

const CategoryChartComponent = ({selectedCategories, id, regionName, selectedAdditionalRegions}) => {
    const [selectedUnit, setSelectedUnit] = useState({});

    const groupCategoryName = Object.keys(selectedCategories).length > 0 ? Object.keys(selectedCategories)[0] : ''
    const categoryName = groupCategoryName !== '' ? selectedCategories[groupCategoryName][0].Name : ''

    useEffect(() => {

        let data = Object.values(selectedAdditionalRegions).filter(r => r.region!==undefined).map(r => {
            console.log(r.regionName)
            const selectedProvider = r!==undefined ? r.selectedProvider : ''
            return {
                regionName: r.region,
                yearData: r.categoryData!==undefined ? r.categoryData[selectedProvider][groupCategoryName][0].YearData: {}
            }
        })
        if (categoryName !== '') {
            data = [...data, {
                regionName: regionName,
                yearData: selectedCategories[groupCategoryName][0].YearData
            }]
            setSelectedUnit(selectedCategories[groupCategoryName][0].Unit)
        }
        console.log(data)

        const dataSeries = data.map(item => {
            return {
                type: "spline",
                name: item.regionName, // Добавляем единицу измерения к имени категории
                showInLegend: true,
                dataPoints: Object.keys(item.yearData).map(year => ({
                    x: new Date(year, 0),
                    y: item.yearData[year]
                }))
            };
        })

        const chart = new CanvasJS.Chart(`chartContainer-${id}`, {
            theme: "light2",
            title: {
                text: `${groupCategoryName ? groupCategoryName + `: ` + categoryName : ''}`,
                fontSize: 30,
                margin: 20,
            },
            axisX: {
                title: "Год",
                valueFormatString: "YYYY"
            },
            axisY: {
                title: `Значение (${selectedUnit})`, // Добавляем единицу измерения к заголовку оси Y
            },
            legend: {
                fontSize: 15,
            },
            data: dataSeries
        });

        chart.render();
        return () => chart.destroy();
    }, [selectedCategories, id, selectedUnit, regionName, categoryName, groupCategoryName, selectedAdditionalRegions]);

    return <div id={`chartContainer-${id}`} className="chart-container"></div>;
};

export default CategoryChartComponent;
