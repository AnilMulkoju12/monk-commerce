import React, { useState, useEffect } from "react";
import { LuGripVertical } from "react-icons/lu";
import { MdEdit } from "react-icons/md";
import { IoClose, IoSearchOutline } from "react-icons/io5";
import { FaChevronDown } from "react-icons/fa6";
import Modal from "@mui/material/Modal";
import { Box } from "@mui/material";
import "./styles.scss";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [productList, setProductList] = useState([
    {
      id: 1,
      variants: [],
      inputValue: "",
      discountValue: "",
      discountType: "% Off",
    },
    {
      id: 2,
      variants: [],
      inputValue: "",
      discountValue: "",
      discountType: "% Off",
    },
  ]);
  const [openVariants, setOpenVariants] = useState(false);
  const [activeProductId, setActiveProductId] = useState(null);
  const [modalSelectedVariants, setModalSelectedVariants] = useState([]);
  const [variantVisibility, setVariantVisibility] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const style = {
    position: "absolute",
    top: "5%",
    right: "0%",
    width:{xs:360,sm:500,md:600},
    bgcolor: "background.paper",
    borderRadius: 1,
  };

  const apiKey = "72njgfa948d9aS7gs5";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "/api/task/products/search?search=Hat&page=2&limit=1",
          {
            method: "GET",
            headers: {
              "x-api-key": apiKey,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setProducts(data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  const handleAddEmptyProduct = () => {
    const newProduct = {
      id: productList.length + 1,
      variants: [],
      inputValue: "",
      discountValue: "",
      discountType: "% Off",
    };
    setProductList([...productList, newProduct]);
  };
  const handleDiscountChange = (productId, field, value) => {
    setProductList((prevList) =>
      prevList.map((product) =>
        product.id === productId ? { ...product, [field]: value } : product
      )
    );
  };

  const toggleVariantsVisibility = (productId) => {
    setVariantVisibility((prevState) => ({
      ...prevState,
      [productId]: !prevState[productId],
    }));
  };

  const handleVariantSelection = (product, variant) => {
    const selectedVariant = {
      id: product.id,
      title: product.title,
      color: variant.color,
    };

    setModalSelectedVariants((prevState) => {
      const exists = prevState.some(
        (v) => v.id === selectedVariant.id && v.color === selectedVariant.color
      );
      if (exists) {
        return prevState.filter(
          (v) =>
            !(v.id === selectedVariant.id && v.color === selectedVariant.color)
        );
      } else {
        return [...prevState, selectedVariant];
      }
    });
  };

  const handleAddVariantsToProduct = () => {
    setProductList((prevList) =>
      prevList.map((product) => {
        if (product.id === activeProductId) {
          const newVariants = modalSelectedVariants.filter(
            (newVariant) =>
              !product.variants.some(
                (existingVariant) =>
                  existingVariant.id === newVariant.id &&
                  existingVariant.color === newVariant.color
              )
          );

          const updatedVariants = [...product.variants, ...newVariants];
          const combinedTitle = updatedVariants.map((v) => v.title).join(", ");

          return {
            ...product,
            variants: updatedVariants,
            inputValue: combinedTitle,
          };
        }
        return product;
      })
    );
    handleClose();
  };

  const handleOpenModal = (productId) => {
    setActiveProductId(productId);
    setOpenVariants(true);
  };

  const handleClose = () => {
    setModalSelectedVariants([]);
    setOpenVariants(false);
    setActiveProductId(null);
  };

  const handleRemoveVariant = (productId, variantColor) => {
    setProductList((prevList) =>
      prevList.map((product) => {
        if (product.id === productId) {
          const updatedVariants = product.variants.filter(
            (variant) => variant.color !== variantColor
          );

          return {
            ...product,
            variants: updatedVariants,
            inputValue: updatedVariants.map((v) => v.title).join(", "),
          };
        }
        return product;
      })
    );
  };
  const handleCloseProduct = (productId) => {
    setProductList((prevList) =>
      prevList.filter((product) => product.id !== productId)
    );
  };
  const filteredProducts = products.filter((product) =>
    product.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const calculateDiscountedPrice = (price, discountValue, discountType) => {
    // Validate price and discountValue
    if (
      isNaN(price) ||
      isNaN(discountValue) ||
      price < 0 ||
      discountValue < 0
    ) {
      return 0; // Return 0 if any value is invalid
    }

    if (discountType === "% Off") {
      return price - (price * discountValue) / 100;
    } else if (discountType === "flat Off") {
      return price - discountValue;
    }

    return price; // Return the original price if no valid discount type
  };
  const handleVariantDiscountChange = (productId, variantId, value) => {
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) {
      return;
    }
    setProductList((prevProductList) =>
      prevProductList.map((product) =>
        product.id === productId
          ? {
              ...product,
              variants: product.variants.map((variant) =>
                variant.id === variantId
                  ? { ...variant, discountedPrice: parsedValue }
                  : variant
              ),
            }
          : product
      )
    );
  };
  
  return (
    <div className="add-product-main">
      <Modal
        open={openVariants}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div className="variant-model-container">
            <div className="heading">
              <h3>Add Products</h3>
              <IoClose className="close-icon" onClick={handleClose} />
            </div>
            <div className="search-products">
              <div className="search-input-container">
                <IoSearchOutline className="search-icon" />
                <input
                  type="text"
                  placeholder="Search products"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            {filteredProducts?.map((product) => (
              <div key={product.id}>
                <div className="model-variant-container">
                  {/* Checkbox for toggling visibility */}
                  <input
                    type="checkbox"
                    onChange={() => toggleVariantsVisibility(product.id)}
                    checked={variantVisibility[product.id] || false}
                  />
                  <div className="img-container">
                    <div className="img">
                      <img src={product.image?.src} alt={product.title} />
                    </div>
                    <p>{product.title}</p>
                  </div>
                </div>
                {/* Show variants if visible */}
                {variantVisibility[product.id] &&
                  product.variants?.map((variant) => (
                    <div className="variant-options" key={variant.id}>
                      <div className="option">
                        <input
                          type="checkbox"
                          checked={modalSelectedVariants.some(
                            (v) =>
                              v.id === product.id && v.color === variant.color
                          )}
                          onChange={() =>
                            handleVariantSelection(product, {
                              color: variant.color,
                            })
                          }
                        />
                        <p>{variant.option1}</p>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
            <div className="model-footer-container">
              <p>{modalSelectedVariants.length} variants selected</p>
              <div>
                <button onClick={handleClose}>Cancel</button>
                <button onClick={handleAddVariantsToProduct}>Add</button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>

      <h3>Add Products</h3>
      <div className="product-headings">
        <div className="product-heading">
          <p>Product</p>
        </div>
        <div className="discount-heading">
          <p>Discount</p>
        </div>
      </div>
      {productList.map((product) => (
        <div key={product.id}>
          <div className="main">
            <div className="main__product-container">
              <div className="product-input-container">
                <LuGripVertical className="grip-icon" />
                <div className="product-content">
                  <p>{product.id}.</p>
                  <input
                    type="text"
                    value={product.inputValue || ""}
                    readOnly
                  />
                  <MdEdit
                    className="edit-icon"
                    onClick={() => handleOpenModal(product.id)}
                  />
                </div>
              </div>
            </div>
            <div className="main__discount-container">
              <div className="discount-input-container">
                <input
                  type="text"
                  value={product.discountValue}
                  onChange={(e) =>
                    handleDiscountChange(
                      product.id,
                      "discountValue",
                      e.target.value
                    )
                  }
                />
                <select
                  value={product.discountType}
                  onChange={(e) =>
                    handleDiscountChange(
                      product.id,
                      "discountType",
                      e.target.value
                    )
                  }
                >
                  <option>% Off</option>
                  <option>flat Off</option>
                </select>
                <IoClose
                  className="close-icon"
                  onClick={() => handleCloseProduct(product.id)}
                />
              </div>
              <div
                className="varient-container"
                onClick={() => toggleVariantsVisibility(product.id)}
              >
                <p className="varient-heading">Show Variants</p>
                <FaChevronDown className="chevron" />
              </div>
            </div>
          </div>
          {variantVisibility[product.id] && (
            <div className="product-list">
              {product.variants.map((variant) => {
                const discountedPrice = calculateDiscountedPrice(
                  variant.price,
                  product.discountValue,
                  product.discountType
                );

                return (
                  <div
                    key={`${variant.id}-${variant.color}`}
                    className="variant-item"
                  >
                    <div className="left-variant">
                      <div className="content">
                        <p>
                          {variant.title}{" "}
                          {variant.color && `- ${variant.color}`}
                        </p>
                        <p className="price">
                          Original Price: ${variant.price} - Discounted Price: $
                          {discountedPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="right-variant">
                      <input
                        type="text"
                        value={
                          discountedPrice ? discountedPrice.toFixed(2) : "0.00"
                        }
                        onChange={(e) =>
                          handleVariantDiscountChange(
                            product.id,
                            variant.id,
                            e.target.value
                          )
                        }
                      />
                      <select value={product.discountType} disabled>
                        <option>{product.discountType}</option>
                      </select>
                      <IoClose
                        className="close-icon"
                        onClick={() =>
                          handleRemoveVariant(product.id, variant.color)
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <div className="add-product-btn-container">
        <div className="left-container"></div>
        <div className="right-container">
          <button onClick={handleAddEmptyProduct}>+ Add New Product</button>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
