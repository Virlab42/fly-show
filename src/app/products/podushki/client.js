'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import '../style.scss';
import ProductGrid from '../components/productgrid';
import useDebounce from '../../hooks/useDebounce';
import CollectionsFilter from '../components/iqos/iqoscategory';
import FilterAccordion from '../components/devices/devicefiltr';

export default function ClientFilters({ initialItems }) {
  const [allItems, setAllItems] = useState(initialItems || []);
  const [items, setItems] = useState(initialItems || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState([]); // ✅ одно состояние категорий
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 300000 },
    categorys: []
  });
  const [categories, setCategories] = useState([]); // список названий категорий

  const debouncedQuery = useDebounce(searchQuery, 500);
  const searchParams = useSearchParams();

  // 🗂 Загружаем категории
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(
          'https://xn----7sbghg8bdic8bg2d.xn--p1ai/wp-json/wc/v3/products/categories?per_page=100',
          {
            headers: {
              Authorization: `Basic ${btoa(
                'ck_5d2dc332117170fc2f1b3ba437c9fa84291b0a23:cs_d5421f693ce776c4f371f3afad2ed3c783b5b50f'
              )}`,
            },
          }
        );
        if (!res.ok) throw new Error('Ошибка при получении категорий');
        const data = await res.json();

        const names = data.map(cat => cat.name);
        setCategories(names);

        // если в query есть ?category=...
        const categoryName = searchParams.get('category');
        if (categoryName && names.includes(categoryName)) {
          setSelectedCategory([categoryName]);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchCategories();
  }, [searchParams]);

  // 📦 Загружаем товары
  useEffect(() => {
    async function fetchItems() {
      try {
        setLoading(true);
        const res = await fetch('/api/products/getProducts');
        if (!res.ok) throw new Error('Ошибка загрузки товаров');
        const data = await res.json();
        setAllItems(data);
        setItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (allItems.length === 0) fetchItems();
  }, []);

  // 🔎 Фильтрация
  useEffect(() => {
    let filtered = [...allItems];

    if (debouncedQuery) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory.length > 0) {
      filtered = filtered.filter(item =>
        item.categories?.some(cat => selectedCategory.includes(cat.name))
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter(item => {
        const price = parseFloat(item.price) || 0;
        return (
          price >= filters.priceRange.min && price <= filters.priceRange.max
        );
      });
    }

    if (sortOrder === 'ascending') {
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortOrder === 'descending') {
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }

    setItems(filtered);
  }, [
    debouncedQuery,
    selectedCategory,
    sortOrder,
    filters,
    allItems,
  ]);

  const resetFilters = () => {
    setFilters({
      priceRange: { min: 0, max: 300000 },
      categorys: [],
    });
    setSelectedCategory([]);
    setSearchQuery('');
    setSortOrder('default');
  };

  if (error) return <p>{error}</p>;

  return (
    <>
      {/* ✅ теперь CollectionsFilter тоже работает с категориями */}
      <CollectionsFilter
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        setSearchQuery={setSearchQuery}
        searchQuery={searchQuery}
        setSortOrder={setSortOrder}
        sortOrder={sortOrder}
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
        categoriesList={categories}
      />
      <div className="products-body">
        <FilterAccordion
          categoriesList={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
        />
        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <ProductGrid items={items} loading={loading} />
        )}
      </div>
    </>
  );
}
