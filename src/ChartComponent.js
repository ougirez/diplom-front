/* global CanvasJS */

import React, { useEffect } from 'react';

const ChartComponent = ({ selectedCategories, categories, id }) => {
    useEffect(() => {
        const dataSeries = Object.entries(selectedCategories).flatMap(([group, categoryNames]) => {
            return categoryNames.map(catName => {
                const category = categories[group].find(cat => cat.Name === catName);
                return {
                    type: "line",
                    name: catName + (category ? ` (${category?.Unit})`: ''), // Добавляем единицу измерения к имени категории
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
        const unit = firstSelectedCategory ? categories[Object.keys(selectedCategories)[0]].find(cat => cat.Name === firstSelectedCategory).Unit : '';
    
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
    }, [selectedCategories, categories, id]);

    return <div id={`chartContainer-${id}`} className="chart-container"></div>;
};

export default ChartComponent;
