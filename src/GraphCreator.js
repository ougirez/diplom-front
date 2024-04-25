// GraphCreator.js
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import ChartComponent from './ChartComponent';
import Select from 'react-dropdown-select';
import './App.css';

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
                    const firstProvider = Object.keys(providersData)[0]; // Берем первого провайдера из списка
                    setProviders(Object.keys(providersData));
                    setCategories(providersData);
                    setSelectedProvider(firstProvider); // Устанавливаем первого провайдера как выбранного
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
        setSelectedCategories({}); // Сброс выбранных категорий при смене провайдера
        setSelectedUnit(null)
    };

    const handleCategorySelection = (group, categories) => {
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
        }

        setSelectedCategories(updatedCategories);

        if (len === 0) {
            setSelectedUnit(null);
        }
    };

    const handleAdditionalRegionSelection = (id, selected) => {
        const updated = {
            ...selectedAdditionalRegions, [id]: selected
        }

        console.log(updated)

        setSelectedAdditionalRegions(updated)
    }

    const handleAdditionalRegionProviderSelection = (event) => {
        selectedAdditionalRegions[event.id].selectedProvider = event.selectedProvider

        console.log(selectedAdditionalRegions)
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

                {(graphType === 'region' || (graphType === 'category' && selectedLen(selectedCategories) === 0)) && selectedProvider && Object.entries(categories[selectedProvider] || {}).map(([group, cats]) => (
                    <RegionCategorySelector
                        key={group}
                        group={group}
                        categories={cats}
                        selectedCategories={selectedCategories[group] || []}
                        onCategorySelection={handleCategorySelection}
                        selectedUnit={selectedUnit}
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
                    />
                }
            </div>
            <div className="chart-area">
                <ChartComponent id={id} selectedCategories={selectedCategories}
                                regionName={selectedRegion ? regions.find(region => region.ID === selectedRegion).RegionName : null}/>
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
                                  handleAdditionalRegionProviderSelection
                              }) => {

    console.log(selectedCategories)
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
                onClick={() => handleAdditionalRegionSelection(Object.keys(selectedAdditionalRegions).length, {})}>Добавить регион
            </button>
            {/*<Select*/}
            {/*    options={regions.map(region => ({label: region.RegionName, value: region.ID}))}*/}
            {/*    onChange={values => handleRegionChange({target: {value: values[0].value}})}*/}
            {/*    values={selectedRegion ? [{*/}
            {/*        label: regions.find(r => r.ID === selectedRegion).RegionName,*/}
            {/*        value: selectedRegion*/}
            {/*    }] : []}*/}
            {/*    placeholder="Выберите регион"*/}
            {/*/>*/}
        </div>
    )
}

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
        console.log(event)
        const url = `http://localhost:8080/api/v1/regions/${event.selectedRegionId}/categories?category_name=${event.categoryName}&group_category_name=${event.groupCategoryName}`
        axios.get(url)
            .then(response => {
                const providersData = response.data;
                if (Object.keys(providersData).length > 0) {
                    event.selectedProvider = Object.keys(providersData)[0] // Устанавливаем первого провайдера как выбранного
                    event.categoryData = providersData;
                }

                console.log(url)
                console.log(response)

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

                console.log(updated)
            })
            .catch(error => console.error('Ошибка при загрузке категорий:', error));
    }

    console.log(selectedAdditionalRegions)
    console.log(Object.values(selectedAdditionalRegions))

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

                    console.log(selectedAdditionalRegions[id])
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
                        })}
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

const RegionCategorySelector = ({group, categories, selectedCategories, onCategorySelection, selectedUnit}) => {
    categories = selectedUnit ? categories.filter(cat => cat.Unit === selectedUnit) : categories

    // Формируем опции для react-dropdown-select, включая единицу измерения в label
    const options = categories.map(cat => ({
        label: `${cat.Name} (${cat.Unit})`,
        value: cat.Name
    }));

    // Преобразуем выбранные категории в формат, который ожидает react-dropdown-select
    const values = selectedCategories.map(category => {
        return {
            label: `${category.Name} (${category.Unit})`,
            value: category.Name
        };
    });

    const handleSelection = (values) => {
        // Получаем массив имен выбранных категорий из значений
        const selectedNames = values.map(item => item.value);

        const selectedCategories = categories.filter(category => selectedNames.includes(category.Name))
        // Вызываем функцию обработки выбора категории
        onCategorySelection(group, selectedCategories);
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
