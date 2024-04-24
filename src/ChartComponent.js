/* global CanvasJS */

import React, {useEffect, useState} from 'react';

const ChartComponent = ({ selectedCategories, id, regionName }) => {
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
    
        // Определяем единицу измерения для первой выбранной категории
        // Это предполагает, что все категории имеют одинаковую единицу измерения
        // Если они разные, вы можете отображать их по-другому или не отображать вообще

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
    }, [selectedCategories, id, selectedUnit]);

    return <div id={`chartContainer-${id}`} className="chart-container"></div>;
};

export default ChartComponent;
