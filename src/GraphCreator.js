// GraphCreator.js
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import RegionChartComponent from './RegionChartComponent';
import Select from 'react-dropdown-select';
import './App.css';
import CategoryChartComponent from "./CategoryChartComponent";
import MapChart from "./MapChart";

function selectedLen(selectedCategoriesByGroup) {
    return Object.values(selectedCategoriesByGroup).reduce((sum, currentArray) => {
        return sum + currentArray.length;
    }, 0)
}

const GraphCreator = ({onRemove, id, graphType}) => {
    const [regions, setRegions] = useState([]);
    const [providers, setProviders] = useState([]);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedAdditionalRegions, setSelectedAdditionalRegions] = useState({});
    const [categories, setCategories] = useState({});
    const [selectedCategories, setSelectedCategories] = useState({});
    const [selectedUnit, setSelectedUnit] = useState({});

    const [selectedYear, setSelectedYear] = useState(0);
    const [minYear, setMinYear] = useState(0);
    const [maxYear, setMaxYear] = useState(0);
    const [regionsCategoryData, setRegionsCategoryData] = useState({});
    const [selectedCategoryName, setSelectedCategoryName] = useState('')
    const [selectedGroupCategoryName, setSelectedGroupCategoryName] = useState('')

    useEffect(() => {
        axios.get('http://localhost:8080/api/v1/regions/list')
            .then(response => {
                setRegions(response.data)
            })
            .catch(error => console.error('Ошибка при загрузке регионов:', error));
    }, []);

    useEffect(() => {
        if (selectedRegion) {
            axios.get(`http://localhost:8080/api/v1/regions/${selectedRegion}/categories`)
                .then(response => {
                    const providersData = response.data;
                    const firstProvider = Object.keys(providersData)[0];
                    setProviders(Object.keys(providersData));
                    setCategories(providersData);
                    setSelectedProvider(firstProvider);
                    setSelectedCategories({});
                    setSelectedUnit(null)
                    setSelectedAdditionalRegions({})
                })
                .catch(error => console.error('Ошибка при загрузке категорий:', error));
        }
    }, [selectedRegion]);

    const handleRegionChange = (event) => {
        setSelectedRegion(event.target.value);
        setSelectedUnit(null)
        setSelectedCategories({});
        setSelectedAdditionalRegions({})
    };

    const handleProviderChange = (values) => {
        const selectedValue = values.length > 0 ? values[0].value : null;
        setSelectedProvider(selectedValue);
        setSelectedCategories({});
        setSelectedUnit(null)
    };

    const handleCategorySelection = (group, categories, graphType) => {
        const updatedCategories = {
            ...selectedCategories,
            [group]: categories
        };

        if (categories.length === 0) {
            delete updatedCategories[group];
        }

        var len = selectedLen(updatedCategories);
        if (len === 1 && categories.length > 0) {
            setSelectedUnit(categories[0].Unit);

            const url = `http://localhost:8080/api/v1/regions/category?category_name=${categories[0].Name}&group_category_name=${group}`
            if (graphType === 'map') {
                axios.get(url)
                    .then(response => {
                        setRegionsCategoryData(response.data.regions_data)
                        setSelectedYear(response.data.max_year)
                        setMinYear(response.data.min_year)
                        setMaxYear(response.data.max_year)
                        setSelectedUnit(response.data.unit)
                        setSelectedCategoryName(response.data.category_name)
                        setSelectedGroupCategoryName(response.data.group_category_name)
                    })
                    .catch(error => console.error('Ошибка при загрузке данных по категории для регионов:', error));
            }
        }

        setSelectedCategories(updatedCategories);

        if (len === 0) {
            setSelectedUnit(null);
            setRegionsCategoryData({})
            setSelectedYear(0)
            setMinYear(0)
            setMaxYear(0)
            setSelectedCategoryName('')
            setSelectedGroupCategoryName('')
        }
    };

    const handleAdditionalRegionSelection = (id, selected) => {
        const updated = {
            ...selectedAdditionalRegions, [id]: selected
        }

        setSelectedAdditionalRegions(updated)
    }

    const handleAdditionalRegionProviderSelection = (event) => {
        selectedAdditionalRegions[event.id].selectedProvider = event.selectedProvider
    }

    const handleYearSelection = (year) => {
        setSelectedYear(year)
    }

    return (
        <div className="graph-creator">
            <div className="sidebar">
                <h4>График №{id + 1}</h4>
                <Select
                    options={regions.map(region => ({label: region.RegionName, value: region.ID}))}
                    onChange={values => handleRegionChange({target: {value: values[0].value}})}
                    values={selectedRegion ? [{
                        label: regions.find(r => r.ID === selectedRegion).RegionName,
                        value: selectedRegion
                    }] : []}
                    placeholder="Выберите регион"
                />

                {selectedRegion && (
                    <Select
                        options={providers.map(provider => ({label: provider, value: provider}))}
                        onChange={handleProviderChange}
                        values={selectedProvider ? [{label: selectedProvider, value: selectedProvider}] : []}
                        placeholder="Выберите провайдера"
                    />
                )}

                {(graphType === 'region' || (selectedLen(selectedCategories) === 0)) && selectedProvider && Object.entries(categories[selectedProvider] || {}).map(([group, cats]) => (
                    <RegionCategorySelector
                        key={group}
                        group={group}
                        categories={cats}
                        selectedCategories={selectedCategories[group] || []}
                        onCategorySelection={handleCategorySelection}
                        selectedUnit={selectedUnit}
                        graphType={graphType}
                    />
                ))}
                {graphType === 'category' && selectedLen(selectedCategories) === 1 &&
                    <RegionsGraphSelector
                        selectedCategories={selectedCategories}
                        selectedUnit={selectedUnit}
                        handleCategorySelection={handleCategorySelection}
                        regions={regions}
                        selectedRegionID={selectedRegion}
                        selectedAdditionalRegions={selectedAdditionalRegions}
                        handleAdditionalRegionSelection={handleAdditionalRegionSelection}
                        handleAdditionalRegionProviderSelection={handleAdditionalRegionProviderSelection}
                        graphType={graphType}
                    />
                }
                {graphType === 'map' && selectedLen(selectedCategories) === 1 &&
                    <RegionsCategoryGraphSelector
                        selectedCategories={selectedCategories}
                        selectedUnit={selectedUnit}
                        handleCategorySelection={handleCategorySelection}
                        graphType={graphType}
                        handleYearSelection={handleYearSelection}
                        minYear={minYear}
                        maxYear={maxYear}
                        selectedYear={selectedYear}
                    />
                }
            </div>
            <div className="chart-area">
                {graphType === 'region' &&
                    <RegionChartComponent
                        id={id}
                        selectedCategories={selectedCategories}
                        regionName={selectedRegion ? regions.find(region => region.ID === selectedRegion).RegionName : null}
                    />
                }
                {graphType === 'category' &&
                    <CategoryChartComponent
                        id={id}
                        selectedCategories={selectedCategories}
                        regionName={selectedRegion ? regions.find(region => region.ID === selectedRegion).RegionName : null}
                        selectedAdditionalRegions={selectedAdditionalRegions}
                    />
                }
                {graphType === 'map' &&
                    <MapChart
                        id={id}
                        selectedCategories={selectedCategories}
                        selectedCategoryName={selectedCategoryName}
                        selectedGroupCategoryName={selectedGroupCategoryName}
                        selectedUnit={selectedUnit}
                        regionsData={regionsCategoryData}
                        selectedYear={selectedYear}
                    />
                }
            </div>
            <button onClick={() => onRemove(id)}>Удалить график</button>
        </div>
    );
};

const RegionsGraphSelector = ({
                                  selectedCategories,
                                  handleCategorySelection,
                                  selectedUnit,
                                  regions,
                                  selectedRegionID,
                                  selectedAdditionalRegions,
                                  handleAdditionalRegionSelection,
                                  handleAdditionalRegionProviderSelection,
                                  graphType
                              }) => {

    const groupCategoryName = Object.keys(selectedCategories)[0]
    const categoryName = selectedCategories[groupCategoryName][0].Name

    return (
        <div>
            {Object.entries(selectedCategories || {}).map(([group, cats]) => (
                <RegionCategorySelector
                    key={group}
                    group={group}
                    categories={cats}
                    selectedCategories={selectedCategories[group] || []}
                    onCategorySelection={handleCategorySelection}
                    selectedUnit={selectedUnit}
                    graphType={graphType}
                />
            ))}
            <h3>Выберите дополнительные регионы</h3>
            {Object.entries(selectedAdditionalRegions || {}).map(([id, info]) => (
                <RegionProviderSelector
                    id={id}
                    info={info}
                    regions={regions}
                    selectedRegionID={selectedRegionID}
                    categoryName={categoryName}
                    groupCategoryName={groupCategoryName}
                    selectedAdditionalRegions={selectedAdditionalRegions}
                    handleAdditionalRegionSelection={handleAdditionalRegionSelection}
                    handleAdditionalRegionProviderSelection={handleAdditionalRegionProviderSelection}

                />
            ))}
            <button
                onClick={() => handleAdditionalRegionSelection(Object.keys(selectedAdditionalRegions).length + 1, {})}>Добавить
                регион
            </button>
        </div>
    )
}

const RegionsCategoryGraphSelector = ({
                                          selectedCategories,
                                          handleCategorySelection,
                                          handleYearSelection,
                                          selectedUnit,
                                          selectedYear,
                                          minYear,
                                          maxYear,
                                          graphType
                                      }) => {

    const groupCategoryName = Object.keys(selectedCategories)[0]
    const categoryName = selectedCategories[groupCategoryName][0].Name

    return (
        <div>
            {Object.entries(selectedCategories || {}).map(([group, cats]) => (
                <RegionCategorySelector
                    key={group}
                    group={group}
                    categories={cats}
                    selectedCategories={selectedCategories[group] || []}
                    onCategorySelection={handleCategorySelection}
                    selectedUnit={selectedUnit}
                    graphType={graphType}
                />
            ))}

            {Object.entries(selectedCategories || {}).map(([group, cats]) => (
                <YearSelector
                    minYear={minYear}
                    maxYear={maxYear}
                    selectedYear={selectedYear}
                    onYearSelection={handleYearSelection}
                />
            ))}
        </div>
    )
}

const YearSelector = ({minYear, maxYear, selectedYear, onYearSelection}) => {
    const options = []
    for (let year = minYear; year <= maxYear; year++) {
        options.push({
            label: `${year}`,
            value: year
        })
    }

    const values = []
    if (selectedYear !== 0) {
        values[0] = {
            label: `${selectedYear}`,
            value: selectedYear
        }
    }

    const handleSelection = (values) => {
        if (values.length === 0) {
            onYearSelection(0)
        } else {
            onYearSelection(values[0].value);
        }
    };

    return (
        <div>
            <h3>Год</h3>
            <Select
                options={options}
                values={values}
                onChange={handleSelection}
                placeholder={`Выберите год`}
            />
        </div>
    );
};

const RegionProviderSelector = ({
                                    id,
                                    info,
                                    regions,
                                    selectedRegionID,
                                    categoryName,
                                    groupCategoryName,
                                    selectedAdditionalRegions,
                                    handleAdditionalRegionSelection,
                                    handleAdditionalRegionProviderSelection
                                }) => {

    const [selectedRegionName, setSelectedRegionName] = useState(null);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [categoryData, setCategoryData] = useState({});

    const handleRegionSelection = (event) => {
        const url = `http://localhost:8080/api/v1/regions/${event.selectedRegionId}/categories?category_name=${event.categoryName}&group_category_name=${event.groupCategoryName}`
        axios.get(url)
            .then(response => {
                const providersData = response.data;
                if (Object.keys(providersData).length > 0) {
                    event.selectedProvider = Object.keys(providersData)[0]
                    event.categoryData = providersData;
                }

                const updated = {
                    region: event.selectedRegion,
                    regionId: event.selectedRegionId,
                    selectedProvider: event.selectedProvider,
                    categoryData: event.categoryData
                }

                handleAdditionalRegionSelection(event.id, updated)

                setSelectedProvider(event.selectedProvider)
                setCategoryData(event.categoryData)
                setSelectedRegionName(event.selectedRegion)

            })
            .catch(error => console.error('Ошибка при загрузке категорий:', error));
    }

    return (
        <div className="region-selector">
            <Select
                options={regions.filter(r => (r.ID !== selectedRegionID && !Object.values(selectedAdditionalRegions).map(item => item.region).includes(r.RegionName))).map(region => ({
                    label: region.RegionName,
                    value: region.ID
                }))}
                onChange={values => {
                    handleRegionSelection({
                        id: id,
                        groupCategoryName: groupCategoryName,
                        categoryName: categoryName,
                        selectedRegion: values[0].label,
                        selectedRegionId: values[0].value
                    })

                    // setSelectedRegionName(values[0].label)
                }}
                values={selectedAdditionalRegions[id] ? [{
                    label: selectedAdditionalRegions[id].selectedRegion,
                    value: selectedAdditionalRegions[id].selectedRegionId
                }] : []}
                placeholder="Выберите регион"
            />

            {selectedRegionName && (
                <Select
                    options={Object.keys(categoryData).map(provider => ({
                        label: provider,
                        value: provider
                    }))}
                    onChange={values => {
                        setSelectedProvider(values[0].label)
                        handleAdditionalRegionProviderSelection({
                            id: id,
                            selectedProvider: values[0].label
                        })
                    }
                    }

                    values={selectedProvider ? [{
                        label: selectedProvider,
                        value: selectedProvider
                    }] : []}
                    placeholder="Выберите провайдера"
                />
            )}
        </div>
    )
}

const RegionCategorySelector = ({
                                    group,
                                    categories,
                                    selectedCategories,
                                    onCategorySelection,
                                    selectedUnit,
                                    graphType
                                }) => {
    categories = selectedUnit ? categories.filter(cat => cat.Unit === selectedUnit) : categories

    const options = categories.map(cat => ({
        label: `${cat.Name} (${cat.Unit})`,
        value: cat.Name
    }));

    const values = selectedCategories.map(category => {
        return {
            label: `${category.Name} (${category.Unit})`,
            value: category.Name
        };
    });

    const handleSelection = (values) => {
        const selectedNames = values.map(item => item.value);

        const selectedCategories = categories.filter(category => selectedNames.includes(category.Name))
        onCategorySelection(group, selectedCategories, graphType);
    };

    return (
        categories.length > 0 && (
            <div>
                <h3>{group}</h3>
                <Select
                    options={options}
                    values={values}
                    onChange={handleSelection}
                    multi
                    placeholder={`Выберите категории`}
                />
            </div>
        )
    );
};

export default GraphCreator;
