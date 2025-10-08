import React, { useState, useEffect } from 'react';

function AddTenderCategory() {
  const [category, setCategory] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [message, setMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [categories, setCategories] = useState([]);

  // Fetch tender categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_API}/tender_category_fetch.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        setCategories(data);
      } else {
        setMessage(data.message || 'Failed to fetch categories');
        setShowNotification(true);
      }
    } catch (error) {
      setMessage('Error: Unable to connect to the server');
      setShowNotification(true);
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_API}/add_tender_category.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category }),
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Category added successfully!');
        setCategory('');
        setIsFocused(false);
        fetchCategories(); 
      } else {
        setMessage(data.message || 'Failed to add category');
      }
      setShowNotification(true);
    } catch (error) {
      setMessage('Error: Unable to connect to the server');
      setShowNotification(true);
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        padding: '20px',
        flexDirection: 'column',
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {showNotification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: message.includes('success') ? '#4caf50' : '#f44336',
            color: 'white',
            padding: '10px 15px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            transition: 'opacity 0.5s ease-in-out',
            opacity: showNotification ? 1 : 0,
            zIndex: 9999,
            fontSize: '14px',
            borderRadius: '4px',
            maxWidth: '90%',
          }}
        >
          {message}
        </div>
      )}
      <h2
        style={{
          backgroundColor: '#abd2fc',
          padding: '15px',
          borderRadius: '20px 20px 0 0',
          fontSize: 'clamp(18px, 5vw, 24px)',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#333',
          width: '100%',
          maxWidth: '600px',
          margin: '0 auto 20px auto',
          boxSizing: 'border-box',
        }}
      >
        Tender Category
      </h2>
      <div
        style={{
          backgroundColor: 'white',
          boxShadow: '0 8px 12px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '600px',
          padding: 'clamp(15px, 5vw, 25px)',
          margin: '0 auto',
          borderRadius: '0 0 8px 8px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            position: 'relative',
            marginBottom: '20px',
            width: '100%',
          }}
        >
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setCategory(category.trim())}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: 'clamp(14px, 4vw, 16px)',
              border: '1px solid #ccc',
              borderRadius: '4px',
              outline: 'none',
              transition: 'border-color 0.3s',
              boxSizing: 'border-box',
            }}
            required
          />
          <label
            style={{
              position: 'absolute',
              top: isFocused || category ? '-18px' : '10px',
              left: '10px',
              fontSize: isFocused || category ? 'clamp(10px, 3vw, 12px)' : 'clamp(12px, 4vw, 16px)',
              color: isFocused || category ? '#555' : '#999',
              transition: 'all 0.3s',
              pointerEvents: 'none',
              backgroundColor: isFocused || category ? 'white' : 'transparent',
              padding: '0 4px',
            }}
          >
            Category Name
          </label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            style={{
              width: 'auto',
              minWidth: '100px',
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              fontSize: 'clamp(14px, 4vw, 16px)',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              borderRadius: '4px',
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#0056b3')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#007bff')}
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
      <h2
        style={{
          backgroundColor: '#abd2fc',
          padding: '15px',
          fontSize: 'clamp(18px, 5vw, 24px)',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#333',
          width: '100%',
          maxWidth: '1000px',
          margin: '20px auto 0 auto',
          boxSizing: 'border-box',
        }}
      >
        Tender Category List
      </h2>
      <div
        style={{
          backgroundColor: 'white',
          boxShadow: '0 12px 18px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '1000px',
          padding: '15px',
          margin: '0 auto',
          borderRadius: '0 0 8px 8px',
          boxSizing: 'border-box',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 'clamp(14px, 4vw, 16px)',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#f2f2f2',
                textAlign: 'left',
              }}
            >
              <th
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  width: '20%',
                }}
              >
                S.No
              </th>
              <th
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  width: '80%',
                }}
              >
                Tender Category
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((cat, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: '1px solid #ddd',
                  }}
                >
                  <td
                    style={{
                      padding: '10px',
                      border: '1px solid #ddd',
                    }}
                  >
                    {index + 1}
                  </td>
                  <td
                    style={{
                      padding: '10px',
                      border: '1px solid #ddd',
                    }}
                  >
                    {cat.category}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="2"
                  style={{
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                  }}
                >
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AddTenderCategory;