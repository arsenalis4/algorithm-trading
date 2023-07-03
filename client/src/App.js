// React.js code for cryptocurrency algorithm trading with custom input values

import React, { useState, useEffect } from "react";
import axios from "axios";

// Define the trading parameters
const TRADE_AMOUNT = 100; // The amount of USD to trade
const TRADE_FEE = 0.01; // The percentage of fee for each trade
const TRADE_THRESHOLD = 0.05; // The percentage of price change to trigger a trade

// Define the initial state of the app
const initialState = {
  balance: 1000, // The initial balance of USD
  coins: {}, // The initial holdings of each coin
  prices: {}, // The current prices of each coin
  history: [], // The history of trades
};

// Define the main component of the app
function App() {
  // Use state hooks to manage the app state
  const [state, setState] = useState(initialState);
  const [input, setInput] = useState(""); // The custom input value

  // Use effect hook to fetch the prices periodically
  useEffect(() => {
    // Define a function to fetch the prices
    const fetchPrices = async () => {
      try {
        // Get the response from the API
        const response = await axios.get("http://localhost:3000/v1/price");
        console.log(response);

        // Update the state with the new prices
        setState((prevState) => ({
          ...prevState,
          prices: response.data,
        }));
      } catch (error) {
        // Handle the error
        console.error(error);
      }
    };

    // Call the function once at the beginning
    fetchPrices();

    // Set an interval to call the function every minute
    const interval = setInterval(fetchPrices, 60000);

    // Return a cleanup function to clear the interval
    return () => clearInterval(interval);
  }, []);

  // Define a function to handle the input change
  const handleInputChange = (event) => {
    // Get the value from the event target
    const value = event.target.value;

    // Update the input state
    setInput(value);
  };

  // Define a function to handle the input submit
  const handleInputSubmit = (event) => {
    // Prevent the default behavior of the form
    event.preventDefault();

    // Parse the input value as JSON
    try {
      const data = JSON.parse(input);

      // Validate the data format
      if (
        typeof data === "object" &&
        data !== null &&
        Object.keys(data).length > 0 &&
        Object.values(data).every((value) => typeof value === "number")
      ) {
        // Update the state with the new coins holdings
        setState((prevState) => ({
          ...prevState,
          coins: data,
        }));
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      // Handle the error
      alert(error.message);
    }
  };

  // Define a function to execute a trade
  const executeTrade = (coin, action, price, amount) => {
    // Calculate the fee for the trade
    const fee = amount * TRADE_FEE;

    // Update the state with the new balance and coins holdings
    setState((prevState) => ({
      ...prevState,
      balance: prevState.balance + (action === "buy" ? -1 : 1) * (amount + fee),
      coins: {
        ...prevState.coins,
        [coin]: prevState.coins[coin] + (action === "buy" ? 1 : -1) * amount / price,
      },
      history: [
        ...prevState.history,
        {
          coin,
          action,
          price,
          amount,
          fee,
          time: new Date().toLocaleString(),
        },
      ],
    }));
  };

  // Define a function to check if a trade is possible and profitable
  const checkTrade = (coin, action, price) => {
    // Get the current balance and coins holdings from the state
    const { balance, coins } = state;

    // Check if there is enough balance or coins to execute the trade
    if (action === "buy" && balance < TRADE_AMOUNT) {
      return false;
    }

    if (action === "sell" && coins[coin] * price < TRADE_AMOUNT) {
      return false;
    }

    // Check if the price change is above the threshold to execute the trade
    const lastTrade = state.history.find((trade) => trade.coin === coin);

    if (lastTrade) {
      const priceChange = Math.abs(price - lastTrade.price) / lastTrade.price;

      if (priceChange < TRADE_THRESHOLD) {
        return false;
      }
    }

    // Return true if all checks pass
    return true;
  };

  // Define a function to handle the trade button click
  const handleTradeClick = (coin, action) => {
    // Get the current price of the coin from the state
    const price = state.prices[coin].usd;

    // Check if the trade is possible and profitable
    if (checkTrade(coin, action, price)) {
      // Execute the trade with the given parameters
      executeTrade(coin, action, price, TRADE_AMOUNT);
    } else {
      // Alert the user that the trade is not possible or profitable
      alert("Trade not possible or profitable");
    }
  };

  // Render the app UI
  return (
    <div className="App">
      <h1>Cryptocurrency Algorithm Trading</h1>
      <h2>Current Prices</h2>
      <table>
        <thead>
          <tr>
            <th>Coin</th>
            <th>Price (USD)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(state.prices).map((coin) => (
            <tr key={coin}>
              <td>{coin.toUpperCase()}</td>
              <td>{state.prices[coin].usd.toFixed(2)}</td>
              <td>
                <button onClick={() => handleTradeClick(coin, "buy")}>Buy</button>
                <button onClick={() => handleTradeClick(coin, "sell")}>Sell</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Current Balance</h2>
      <p>{state.balance.toFixed(2)} USD</p>
      <h2>Current Holdings</h2>
      <table>
        <thead>
          <tr>
            <th>Coin</th>
            <th>Amount</th>
            <th>Value (USD)</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(state.coins).map((coin) => (
            <tr key={coin}>
              <td>{coin.toUpperCase()}</td>
              <td>{state.coins[coin].toFixed(4)}</td>
              <td>{(state.coins[coin] * state.prices[coin].usd).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add a form for custom input values */}
      <h2>Custom Input Values</h2>
      <form onSubmit={handleInputSubmit}>
        <label htmlFor="input">Enter your coins holdings as a JSON object:</label><br />
        <input id="input" type="text" value={input} onChange={handleInputChange} /><br />
        <button type="submit">Submit</button><br />
        {/* Example: {"bitcoin":0.1,"ethereum":0.5,"litecoin":1} */}
      </form>

      {/* Add a table for trade history */}
      <h2>Trade History</h2>
      {state.history.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Coin</th>
              <th>Action</th>
              <th>Price (USD)</th>
              <th>Amount (USD)</th>
              <th>Fee (USD)</th>
              <th>Time</th>
            </tr>
          </thead>

          {/* Reverse the history array to show the latest trades first */}
          {state.history.slice().reverse().map((trade, index) => (
            <tbody key={index}>
              {/* Use different colors for buy and sell actions */}
              {trade.action === "buy" ? (
                // Use green color for buy action
                <tr style={{ color: "green" }}>
                  {Object.values(trade).map((value, index) => (
                    // Format the numbers to two decimal places
                    typeof value === "number" ? (
                      // Use bold font for the amount and fee columns
                      index === 3 || index === 4 ? (
                        // Use parentheses for fee column
                        index === 4 ? (
                          // Use fixed-width font for numbers
                          <td key={index} style={{ fontFamily: "monospace" }}>
                            <b>({value.toFixed(2)})</b>
                          </td>
                        ) : (
                          <td key={index} style={{ fontFamily: "monospace" }}>
                            <b>{value.toFixed(2)}</b>
                          </td>
                        )
                      ) : (
                        <td key={index} style={{ fontFamily: "monospace" }}>
                          {value.toFixed(2)}
                        </td>
                      )
                    ) : (
                      // Use normal font for other columns
                      <td key={index}>{value}</td>
                    )
                  ))}
                </tr>
              ) : (
                // Use red color for sell action
                <tr style={{ color: "red" }}>
                  {Object.values(trade).map((value, index) => (
                    // Format the numbers to two decimal places
                    typeof value === "number" ? (
                      // Use bold font for the amount and fee columns
                      index === 3 || index === 4 ? (
                        // Use parentheses for fee column
                        index === 4 ? (
                          // Use fixed-width font for numbers
                          <td key={index} style={{ fontFamily: "monospace" }}>
                            <b>({value.toFixed(2)})</b>
                          </td>
                        ) : (
                          <td key={index} style={{ fontFamily: "monospace" }}>
                            <b>{value.toFixed(2)}</b>
                          </td>
                        )
                      ) : (
                        <td key={index} style={{ fontFamily: "monospace" }}>
                          {value.toFixed(2)}
                        </td>
                      )
                    ) : (
                      // Use normal font for other columns
                      <td key={index}>{value}</td>
                    )
                  ))}
                </tr>
              )}
            </tbody>
          ))}
        </table>
      ) : (
        // Show a message if there is no trade history
        <p>No trades yet</p>
      )}
    </div>
  );
}

export default App;