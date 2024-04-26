/* global CanvasJS */

import React, {useEffect, useState} from 'react';

const RegionChartComponent = ({ selectedCategories, id, regionName }) => {
    const [selectedUnit, setSelectedUnit] = useState({});

    useEffect(() => {
        const dataSeries = Object.entries(selectedCategories).flatMap(([group, categories]) => {
            return categories.map(category => {
                setSelectedUnit(category.Unit)
                return {
                    type: "spline",
                    name: category.Name + (category ? ` (${category?.Unit})`: ''), // Добавляем единицу измерения к имени категории
                    showInLegend: true,
                    dataPoints: Object.keys(category.YearData).map(year => ({
                        x: new Date(year, 0),
                        y: category.YearData[year]
                    }))
                };
            });
        });
    
        const chart = new CanvasJS.Chart(`chartContainer-${id}`, {
            theme: "light2",
            title: {
                text: `Данные по региону ${regionName ? regionName : ''}`,
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
            legend:{
                fontSize: 15,
            },
            data: dataSeries
        });
    
        chart.render();
        return () => chart.destroy();
    }, [selectedCategories, id, selectedUnit, regionName]);

    return <div id={`chartContainer-${id}`} className="chart-container"></div>;
};

export default RegionChartComponent;
