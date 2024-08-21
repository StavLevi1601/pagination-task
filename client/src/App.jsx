import "./App.css";
import { useState, useEffect } from "react";

function App() {
  const [data, setData] = useState({ rules: [] });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [serachValue, setSearchValue] = useState("");
  const [filter, setFilter] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/rules?page=${page}&limit=10`
        );
        const result = await response.json();
        setData(result);
        setTotalPages(result.totalPages);
      } catch (e) {
        console.log("error", e);
      }
    };

    fetchData();
  }, [page]);

  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    const filter = data.rules.filter(
      (rule) => rule.ipStart === value || rule.upEnd === value
    );
    console.log(filter);
    setFilter(filter);
  };

  return (
    <>
      <div>
        <input
          value={serachValue}
          placeholder="Search according Ip..."
          onChange={(e) => handleSearch(e.target.value)}
        ></input>
        {filter}
        {data.rules.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>id</th>
                <th>ipStart</th>
                <th>ipEnd</th>
                <th>portStart</th>
                <th>portEnd</th>
                <th>action</th>
              </tr>
            </thead>
            <tbody>
              {data.rules.map((rule, index) => (
                <tr key={index}>
                  <td>{rule.id}</td>
                  <td>{rule.ipStart}</td>
                  <td>{rule.ipEnd}</td>
                  <td>{rule.portStart}</td>
                  <td>{rule.portEnd}</td>
                  <td>{rule.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Loading...</p>
        )}
        <span>
          Page {page} total pages {totalPages}
        </span>
        <button onClick={handleNext}>Next</button>
        <button onClick={handlePrevious}>Previous</button>
      </div>
    </>
  );
}

export default App;
