import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductForm = ({ onProductAdd, onProductEdit, editProduct }) => {
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    img: '',
    price: '',
  });

  useEffect(() => {
    setFormData(editProduct || { _id: '', name: '', img: '', price: '' });
  }, [editProduct]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editProduct) {
      // If editProduct exists, update the product
      axios.put(`http://127.0.0.1:5000/notebook/${editProduct._id}`, formData)
        .then((response) => {
          onProductEdit(response.data);
        })
        .catch((error) => {
          console.error('Error updating product:', error);
        });
    } else {
      // If editProduct does not exist, add a new product
      axios.post('http://127.0.0.1:5000/notebook', formData)
        .then((response) => {
          onProductAdd(response.data.notebook);
        })
        .catch((error) => {
          console.error('Error creating product:', error);
        });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>ID:</label>
      <input type="text" name="_id" value={formData._id} onChange={handleChange} />

      <label>Name:</label>
      <input type="text" name="name" value={formData.name} onChange={handleChange} />

      <label>Image URL:</label>
      <input type="text" name="img" value={formData.img} onChange={handleChange} />

      <label>Price:</label>
      <input type="number" name="price" value={formData.price} onChange={handleChange} />

      <button type="submit">{editProduct ? 'Update Product' : 'Add Product'}</button>
    </form>
  );
};

const ProductList = ({ products, onProductDelete, onProductEdit }) => {
  const handleDelete = (productId) => {
    axios.delete(`http://127.0.0.1:5000/notebook/${productId}`)
      .then(() => {
        onProductDelete(productId);
        // Set editProduct to the product being deleted to trigger the update form
        onProductEdit(products.find((product) => product._id === productId));
      })
      .catch((error) => {
        console.error('Error deleting product:', error);
      });
  };

  const handleEdit = (product) => {
    onProductEdit(product);
  };

  return (
    <ul>
      {products.map((product) => (
        <li key={product._id}>
          {product._id} {product.name} <img src={product.img} alt={product.name} /> ${product.price.toFixed(2)}
          <button onClick={() => handleDelete(product._id)}>Delete</button>
          <button onClick={() => handleEdit(product)}>Edit</button>
        </li>
      ))}
    </ul>
  );
};

const ProductApp = () => {
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    _id: '',
    name: '',
    img: '',
    price: '',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/notebook');
        setProducts(response.data.notebook);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleProductAdd = (newProduct) => {
    setProducts([...products, newProduct]);
  };

  const handleProductDelete = async (productId) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/notebook/${productId}`);
      const deletedProduct = products.find((product) => product._id === productId);
  
      if (editProduct && deletedProduct._id === editProduct._id) {
        setEditProduct(null);
      }
  
      setProducts((prevProducts) => prevProducts.filter((product) => product._id !== productId));
  
      // Fetch the latest data after updating the state
      const response = await axios.get('http://127.0.0.1:5000/notebook');
      setProducts(response.data.notebook);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };
  

  const handleProductEdit = (editedProduct) => {
    setProducts(products.map((product) =>
      product._id === editedProduct._id ? editedProduct : product
    ));
    setEditProduct(null);
  };

  const handleAddProduct = () => {
    const parsedId = parseInt(newProduct._id, 10);
    const parsedPrice = parseInt(newProduct.price, 10);

    const productToAdd = {
      ...newProduct,
      _id: parsedId,
      price: parsedPrice,
    };

    axios
      .post("http://127.0.0.1:5000/notebook", productToAdd)
      .then((response) => {
        console.log("Product added successfully:", response.data);

        axios
          .get("http://127.0.0.1:5000/notebook")
          .then((response) => setProducts(response.data.notebook))
          .catch((error) => {
            console.error("Error fetching data:", error);
          });

        setNewProduct({
          _id: "",
          name: "",
          price: "",
          img: "",
        });
      })
      .catch((error) => {
        console.error("Error adding product:", error);
      });
  };

  const handleDeleteProduct = (productId) => {
    axios.delete(`http://127.0.0.1:5000/notebook/${productId}`)
      .then(() => {
        handleProductDelete(productId);
      })
      .catch((error) => {
        console.error('Error deleting product:', error);
      });
  };

  return (
    <div>
      <h1>Product Management</h1>
      <ProductForm
        onProductAdd={handleProductAdd}
        onProductEdit={handleProductEdit}
        editProduct={editProduct}
      />
      <ProductList
        products={products}
        onProductDelete={handleProductDelete}
        onProductEdit={handleProductEdit}
      />
      <div>
        <h2>Add New Product</h2>
        <label>ID:</label>
        <input type="text" name="_id" value={newProduct._id} onChange={(e) => setNewProduct({ ...newProduct, _id: e.target.value })} />

        <label>Name:</label>
        <input type="text" name="name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />

        <label>Image URL:</label>
        <input type="text" name="img" value={newProduct.img} onChange={(e) => setNewProduct({ ...newProduct, img: e.target.value })} />

        <label>Price:</label>
        <input type="number" name="price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />

        <button onClick={handleAddProduct}>Add Product</button>
      </div>
      <div>
        <h2>Delete Product</h2>
        <label>ID:</label>
        <input type="text" value={newProduct._id} onChange={(e) => setNewProduct({ ...newProduct, _id: e.target.value })} />
        <button onClick={() => handleDeleteProduct(newProduct._id)}>Delete Product</button>
      </div>
    </div>
  );
};

export default ProductApp;
