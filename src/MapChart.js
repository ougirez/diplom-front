// MapChart.js
import React, {useState} from "react";
import {ComposableMap, Geographies, Geography} from "react-simple-maps";
import './App.css';
import {Tooltip} from "react-tooltip";
import { scaleLinear } from "d3-scale";

const geoUrl = "Russia_regions.geojson"; // Замените на путь к вашему GeoJSON файлу

const MapChart = ({id, regionsData, selectedYear}) => {
    const [tooltipRegionName, setTooltipRegionName] = useState('');
    const [tooltipSquare, setTooltipSquare] = useState(0);
    const [tooltipCategoryValue, setTooltipCategoryValue] = useState(0);
    const [tooltipCategoryValuePercent, setTooltipCategoryValuePercent] = useState(0);

    const colorScale = scaleLinear()
        .domain([0, 0.01])
        .range(["#ededff", "#00aaff"]);

    return (
        <div>
            <ComposableMap data-tip="sdf"
                           projection='geoMercator'
                           projectionConfig={{
                               center: [100, 70],
                               scale: 300,
                           }}
                           fill='white'
                           stroke='black'
                           className="map"
            >
                <Geographies geography={geoUrl}>
                    {({geographies}) =>
                        geographies.map((geo) => {
                            const square = geo.properties.square / 10

                            let categoryValue = 0
                            let percent = 0
                            if (regionsData[geo.properties.full_name] !== undefined && !isNaN(regionsData[geo.properties.full_name][selectedYear])) {
                                categoryValue = regionsData[geo.properties.full_name][selectedYear]
                                percent = (regionsData[geo.properties.full_name][selectedYear] / square).toFixed(5);
                            }
                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    onMouseEnter={() => {
                                        setTooltipRegionName(`${geo.properties.full_name}`);

                                        setTooltipSquare(`${square}`);

                                        if (regionsData[geo.properties.full_name] !== undefined && !isNaN(regionsData[geo.properties.full_name][selectedYear])) {
                                            setTooltipCategoryValue(categoryValue)
                                            setTooltipCategoryValuePercent(percent)
                                        }
                                    }}
                                    fill={percent!==0 ? colorScale(percent) : "#F5F4F6"}
                                    onMouseLeave={() => {
                                        setTooltipRegionName("");
                                        setTooltipSquare(0);
                                        setTooltipCategoryValue(0);
                                        setTooltipCategoryValuePercent(0)
                                    }}
                                    id="tooltip"
                                    style={{
                                        default: {
                                            // fill: "#D6D6DA",
                                            outline: "none"
                                        },
                                        hover: {
                                            fill: "#71d7e5",
                                            outline: "none"
                                        },
                                        pressed: {
                                            fill: "#E42",
                                            outline: "none"
                                        }
                                    }}
                                />
                            )
                        })
                    }
                </Geographies>
            </ComposableMap>
            <Tooltip anchorSelect="#tooltip">
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <span>{tooltipRegionName}</span>
                    <span>Общая площадь {tooltipSquare} тыс. га</span>

                    {regionsData[tooltipRegionName] !== undefined && tooltipCategoryValue !== 0 &&
                        <span>Значение: {tooltipCategoryValue} тыс. га</span>
                    }
                    {regionsData[tooltipRegionName] !== undefined && tooltipCategoryValue !== 0 &&
                        <span>Процент: {tooltipCategoryValuePercent * 100}%</span>
                    }
                </div>
            </Tooltip>
        </div>

    );
};

export default MapChart;
