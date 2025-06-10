import React from "react";
import type { Currency } from "../interfaces";

export const CurrencyDropdown = React.memo(
  ({
    currencies,
    selectedCurrency,
    onSelect,
    show,
    onClose,
    search,
    onSearchChange,
  }: {
    currencies: Currency[];
    selectedCurrency: string;
    onSelect: (currency: string) => void;
    show: boolean;
    onClose: () => void;
    search: string;
    onSearchChange: (value: string) => void;
  }) => {
    const [highlightedIndex, setHighlightedIndex] = React.useState(0);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Reset highlighted index when currencies change (after search)
    React.useEffect(() => {
      if (currencies.length > 0) {
        setHighlightedIndex(0);
      }
    }, [currencies]);

    // Handle keyboard navigation
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!show) return;

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setHighlightedIndex((prev) => 
              prev < currencies.length - 1 ? prev + 1 : prev
            );
            break;
          case 'ArrowUp':
            e.preventDefault();
            setHighlightedIndex((prev) => prev > 0 ? prev - 1 : prev);
            break;
          case 'Enter':
            e.preventDefault();
            if (currencies[highlightedIndex]) {
              onSelect(currencies[highlightedIndex].symbol);
              onClose();
            }
            break;
          case 'Escape':
            e.preventDefault();
            onClose();
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [show, currencies, highlightedIndex, onSelect, onClose]);

    // Scroll highlighted item into view
    React.useEffect(() => {
      if (show && dropdownRef.current) {
        const highlightedElement = dropdownRef.current.querySelector(
          `.dropdown-item:nth-child(${highlightedIndex + 1})`
        ) as HTMLElement;
        
        if (highlightedElement) {
          highlightedElement.scrollIntoView({
            block: 'nearest',
            behavior: 'smooth'
          });
        }
      }
    }, [highlightedIndex, show]);

    if (!show) return null;

    return (
      <div className="dropdown-overlay" onClick={onClose}>
        <div className="dropdown-content" onClick={(e) => e.stopPropagation()}>
          <div className="dropdown-search">
            <input
              type="text"
              placeholder="Search currencies..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
            />
          </div>
          <div className="dropdown-list" ref={dropdownRef}>
            {currencies.map((currency, index) => (
              <CurrencyItem
                key={currency.symbol}
                currency={currency}
                isSelected={currency.symbol === selectedCurrency}
                isHighlighted={index === highlightedIndex}
                onSelect={onSelect}
                onClose={onClose}
                onHover={() => setHighlightedIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

const CurrencyItem = React.memo(
  ({
    currency,
    isSelected,
    isHighlighted,
    onSelect,
    onClose,
    onHover,
  }: {
    currency: Currency;
    isSelected: boolean;
    isHighlighted: boolean;
    onSelect: (currency: string) => void;
    onClose: () => void;
    onHover: () => void;
  }) => (
    <div
      className={`dropdown-item ${isSelected ? "selected" : ""} ${isHighlighted ? "highlighted" : ""}`}
      onClick={() => {
        onSelect(currency.symbol);
        onClose();
      }}
      onMouseEnter={onHover}
    >
      <img
        src={currency.icon}
        alt={currency.symbol}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <div className="currency-info">
        <span className="currency-symbol">{currency.symbol}</span>
        <span className="currency-name">{currency.name}</span>
      </div>
      <span className="currency-price">${currency.price.toFixed(4)}</span>
    </div>
  )
);
