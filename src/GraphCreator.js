// GraphCreator.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChartComponent from './ChartComponent';
import Select from 'react-dropdown-select';
import './App.css';


const GraphCreator = ({ onRemove, id }) => {
  const [regions, setRegions] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
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
        })
        .catch(error => console.error('Ошибка при загрузке категорий:', error));
    }
  }, [selectedRegion]);

  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
    setSelectedUnit(null)
  };

  const handleProviderChange = (values) => {
    const selectedValue = values.length > 0 ? values[0].value : null;
    setSelectedProvider(selectedValue);
    setSelectedCategories({}); // Сброс выбранных категорий при смене провайдера
    setSelectedUnit(null)
  };

  const handleCategorySelection = (group, categories) => {
    var len = Object.values(selectedCategories).reduce((sum, currentArray) => {
      return sum + currentArray.length;
    }, 0);
    if (len === 0) {
      setSelectedUnit(categories[0].Unit)
    }

    setSelectedCategories({
      ...selectedCategories,
      [group]: categories
    });

    len = Object.values(selectedCategories).reduce((sum, currentArray) => {
      return sum + currentArray.length;
    }, 0);
    if (len === 1) {
      setSelectedUnit(null)
    }
  };

  return (
    <div className="graph-creator">
      <div className="sidebar">
        <Select
          options={regions.map(region => ({ label: region.RegionName, value: region.ID }))}
          onChange={values => handleRegionChange({ target: { value: values[0].value } })}
          values={selectedRegion ? [{ label: regions.find(r => r.ID === selectedRegion).RegionName, value: selectedRegion }] : []}
          placeholder="Выберите регион"
        />

        {selectedRegion && (
          <Select
            options={providers.map(provider => ({ label: provider, value: provider }))}
            onChange={handleProviderChange}
            values={selectedProvider ? [{ label: selectedProvider, value: selectedProvider }] : []}
            placeholder="Выберите провайдера"
          />
        )}

        {selectedProvider && Object.entries(categories[selectedProvider] || {}).map(([group, cats]) => (
          <CategorySelector
            key={group}
            group={group}
            categories={cats}
            selectedCategories={selectedCategories[group] || []}
            onCategorySelection={handleCategorySelection}
            selectedUnit={selectedUnit}
          />
        ))}
      </div>
      <div className="chart-area">
        <ChartComponent id={id} selectedCategories={selectedCategories} selectedUnit={selectedUnit} />
      </div>
      <button onClick={() => onRemove(id)}>Удалить график</button>
    </div>
  );
};

const CategorySelector = ({ group, categories, selectedCategories, onCategorySelection, selectedUnit }) => {
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
      value: category.Name,
      unit: category.Unit
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
