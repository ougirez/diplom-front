/* global CanvasJS */

import React, { useEffect } from 'react';

const ChartComponent = ({ selectedCategories, id }) => {
    useEffect(() => {
        const dataSeries = Object.entries(selectedCategories).flatMap(([group, categories]) => {
            return categories.map(category => {
                
                return {
                    type: "line",
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
        const firstSelectedCategory = selectedCategories[Object.keys(selectedCategories)[0]]?.[0];
        const unit = firstSelectedCategory ? firstSelectedCategory.Unit : '';
    
        const chart = new CanvasJS.Chart(`chartContainer-${id}`, {
            title: {
                text: "График по выбранным категориям"
            },
            axisX: {
                title: "Год",
                valueFormatString: "YYYY"
            },
            axisY: {
                title: "Значение " + (unit ? `(${unit})` : ''), // Добавляем единицу измерения к заголовку оси Y
            },
            data: dataSeries
        });
    
        chart.render();
        return () => chart.destroy();
    }, [selectedCategories, id]);

    return <div id={`chartContainer-${id}`} className="chart-container"></div>;
};

export default ChartComponent;
