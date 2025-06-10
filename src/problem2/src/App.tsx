import React, { useState, useEffect, useMemo } from "react";
import "./fonts.css";
import "./App.css";
import pricesData from "./sources/prices.json";
import { CurrencyDropdown } from "./components/CurrencyDropdown";
import type { PriceData } from "./interfaces";

function App() {
  const [fromCurrency, setFromCurrency] = useState<string>("ETH");
  const [toCurrency, setToCurrency] = useState<string>("USDC");
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const [isFromInput, setIsFromInput] = useState<boolean>(true);
  const [showFromDropdown, setShowFromDropdown] = useState<boolean>(false);
  const [showToDropdown, setShowToDropdown] = useState<boolean>(false);
  const [fromSearch, setFromSearch] = useState<string>("");
  const [toSearch, setToSearch] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [debouncedFromSearch, setDebouncedFromSearch] = useState<string>("");
  const [debouncedToSearch, setDebouncedToSearch] = useState<string>("");

  // Mock balance - in a real app this would come from wallet/API
  const fromBalance = 12.5;

  // Process price data to get unique currencies with latest prices
  const currencies = useMemo(() => {
    const currencyMap = new Map<string, PriceData>();

    // Get the latest price for each currency
    pricesData.forEach((item: PriceData) => {
      const existing = currencyMap.get(item.currency);
      if (!existing || new Date(item.date) > new Date(existing.date)) {
        currencyMap.set(item.currency, item);
      }
    });

    // Convert to Currency objects with icon paths, map currency names to match SVG filenames
    return Array.from(currencyMap.values())
      .map((item) => ({
        symbol: item.currency,
        name: getCurrencyName(item.currency),
        price: item.price,
        icon: `/tokens/${getTokenFileName(item.currency)}.svg`,
      }))
      .sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, []);

  function getTokenFileName(currency: string): string {
    // Map price data currency names to SVG filenames
    const mapping: { [key: string]: string } = {
      STEVMOS: "stEVMOS",
      STOSMO: "stOSMO",
      RATOM: "rATOM",
      STATOM: "stATOM",
      STLUNA: "stLUNA",
    };
    return mapping[currency] || currency;
  }

  function formatNumber(num: number): string {
    if (num === 0) return "0";
    if (num < 0.000001) return num.toExponential(2);
    if (num < 1) return num.toFixed(6).replace(/\.?0+$/, "");
    if (num < 1000) return num.toFixed(4).replace(/\.?0+$/, "");
    return num.toFixed(2).replace(/\.?0+$/, "");
  }

  function getCurrencyName(symbol: string): string {
    const names: { [key: string]: string } = {
      ETH: "Ethereum",
      USDC: "USD Coin",
      WBTC: "Wrapped Bitcoin",
      ATOM: "Cosmos",
      OSMO: "Osmosis",
      LUNA: "Terra Luna",
      EVMOS: "Evmos",
      USD: "US Dollar",
      BLUR: "Blur",
      GMX: "GMX",
      KUJI: "Kujira",
    };
    return names[symbol] || symbol;
  }

  // Debounce search terms to prevent excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFromSearch(fromSearch);
    }, 150);
    return () => clearTimeout(timer);
  }, [fromSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedToSearch(toSearch);
    }, 150);
    return () => clearTimeout(timer);
  }, [toSearch]);

  // Calculate conversion
  useEffect(() => {
    if (!fromAmount || fromAmount === "0") {
      setToAmount("");
      setError("");
      return;
    }

    const fromPrice = currencies.find((c) => c.symbol === fromCurrency)?.price;
    const toPrice = currencies.find((c) => c.symbol === toCurrency)?.price;

    if (!fromPrice || !toPrice) {
      setError("Price data not available for selected currencies");
      return;
    }

    const numericAmount = parseFloat(fromAmount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      setError("Please enter a valid amount");
      return;
    }

    // Check if amount exceeds available balance
    if (numericAmount > fromBalance) {
      setError(`Insufficient balance. Maximum available: ${fromBalance} ${fromCurrency}`);
      return;
    }

    if (isFromInput) {
      const converted = (numericAmount * fromPrice) / toPrice;
      setToAmount(formatNumber(converted));
    }
    setError("");
  }, [fromAmount, fromCurrency, toCurrency, currencies, isFromInput, fromBalance]);

  // Handle amount change
  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    setIsFromInput(true);
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    setIsFromInput(false);

    if (!value || value === "0") {
      setFromAmount("");
      return;
    }

    const fromPrice = currencies.find((c) => c.symbol === fromCurrency)?.price;
    const toPrice = currencies.find((c) => c.symbol === toCurrency)?.price;

    if (fromPrice && toPrice) {
      const numericAmount = parseFloat(value);
      if (!isNaN(numericAmount) && numericAmount >= 0) {
        const converted = (numericAmount * toPrice) / fromPrice;
        setFromAmount(formatNumber(converted));
      }
    }
  };

  // Swap currencies
  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  // Filter currencies for dropdown with memoization to prevent blinking
  const filteredFromCurrencies = useMemo(
    () =>
      currencies.filter(
        (c) =>
          c.symbol.toLowerCase().includes(debouncedFromSearch.toLowerCase()) ||
          c.name.toLowerCase().includes(debouncedFromSearch.toLowerCase())
      ),
    [currencies, debouncedFromSearch]
  );

  const filteredToCurrencies = useMemo(
    () =>
      currencies.filter(
        (c) =>
          c.symbol.toLowerCase().includes(debouncedToSearch.toLowerCase()) ||
          c.name.toLowerCase().includes(debouncedToSearch.toLowerCase())
      ),
    [currencies, debouncedToSearch]
  );

  // Get exchange rate
  const exchangeRate = useMemo(() => {
    const fromPrice = currencies.find((c) => c.symbol === fromCurrency)?.price;
    const toPrice = currencies.find((c) => c.symbol === toCurrency)?.price;

    if (fromPrice && toPrice) {
      return formatNumber(fromPrice / toPrice);
    }
    return null;
  }, [fromCurrency, toCurrency, currencies]);

  return (
    <div className="app">
      <div className="swap-container">
        <div className="swap-header">
          <h1>Currency Swap</h1>
          <p>Exchange your crypto assets instantly</p>
        </div>

        <div className="swap-form">
          {/* From Section */}
          <div className="swap-section">
            <div className="section-header">
              <span>From</span>
              <span
                className="balance"
                onClick={() => handleFromAmountChange(fromBalance.toString())}
              >
                Balance: {fromBalance} {fromCurrency}{" "}
                <span className="max-button">MAX</span>
              </span>
            </div>
            <div className="input-group">
              <div className="amount-input">
                <input
                  type="number"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                />
              </div>
              <div
                className="currency-selector"
                onClick={() => setShowFromDropdown(true)}
              >
                <img
                  src={`/tokens/${getTokenFileName(fromCurrency)}.svg`}
                  alt={fromCurrency}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span>{fromCurrency}</span>
                <svg
                  className="chevron"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="swap-button-container">
            <button className="swap-button" onClick={handleSwap}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* To Section */}
          <div className="swap-section">
            <div className="section-header">
              <span>To</span>
              <span className="balance">Balance: 1,234.56 {toCurrency}</span>
            </div>
            <div className="input-group">
              <div className="amount-input">
                <input
                  type="number"
                  placeholder="0.0"
                  value={toAmount}
                  onChange={(e) => handleToAmountChange(e.target.value)}
                />
              </div>
              <div
                className="currency-selector"
                onClick={() => setShowToDropdown(true)}
              >
                <img
                  src={`/tokens/${getTokenFileName(toCurrency)}.svg`}
                  alt={toCurrency}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span>{toCurrency}</span>
                <svg
                  className="chevron"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Exchange Rate Info */}
          {exchangeRate && (
            <div className="exchange-info">
              <span>
                1 {fromCurrency} = {exchangeRate} {toCurrency}
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Swap Action Button */}
          <button
            className={`action-button ${
              error || !fromAmount ? "disabled" : ""
            }`}
            disabled={!!error || !fromAmount}
          >
            {error ? "Invalid Input" : "Swap Tokens"}
          </button>
        </div>

        {/* Dropdowns */}
        <CurrencyDropdown
          currencies={filteredFromCurrencies}
          selectedCurrency={fromCurrency}
          onSelect={setFromCurrency}
          show={showFromDropdown}
          onClose={() => {
            setShowFromDropdown(false);
            setFromSearch("");
          }}
          search={fromSearch}
          onSearchChange={setFromSearch}
        />

        <CurrencyDropdown
          currencies={filteredToCurrencies}
          selectedCurrency={toCurrency}
          onSelect={setToCurrency}
          show={showToDropdown}
          onClose={() => {
            setShowToDropdown(false);
            setToSearch("");
          }}
          search={toSearch}
          onSearchChange={setToSearch}
        />
      </div>
    </div>
  );
}

export default App;
