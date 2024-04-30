// MapChart.js
import React, {useState} from "react";
import {ComposableMap, Geographies, Geography} from "react-simple-maps";
import './App.css';
import {Tooltip} from "react-tooltip";

const geoUrl = "russia_geojson_wgs84.geojson"; // Замените на путь к вашему GeoJSON файлу

const MapChart = ({id}) => {
    const [tooltipContent, setTooltipContent] = useState('');

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
                        geographies.map(geo => (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                onMouseEnter={() => {
                                    const {NAME} = geo.properties;
                                    console.log(geo.properties.name)
                                    setTooltipContent(geo.properties.name);
                                }}
                                onMouseLeave={() => {
                                    setTooltipContent("");
                                }}
                                id="tooltip"
                                style={{
                                    default: {
                                        fill: "#D6D6DA",
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
                        ))
                    }
                </Geographies>
            </ComposableMap>
            <Tooltip anchorSelect="#tooltip">
                {tooltipContent}
            </Tooltip>
        </div>

    );
};

export default MapChart;
