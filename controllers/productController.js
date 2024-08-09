const cloudinary = require("cloudinary");
const Products = require("../model/productModel");
// const Orders = require("../model/orderModel");

const createProduct = async (req, res) => {
    // step 1 : check incomming data
    console.log(req.body);
    console.log(req.files);

    // step 2 : Destructuring data
    const { productName, productPrice, productDescription, productCategory } =
        req.body;
    const { productImage } = req.files;

    // step 3 : Validate data
    if (
        !productName ||
        !productPrice ||
        !productDescription ||
        !productCategory ||
        !productImage
    ) {
        return res.json({
            success: false,
            message: "Please fill all the fields",
        });
    }

    try {
        // upload image to cloudinary
        const uploadedImage = await cloudinary.v2.uploader.upload(
            productImage.path,
            {
                folder: "products",
                crop: "scale",
            }
        );

        // Save to database
        const newProduct = new Products({
            productName: productName,
            productPrice: productPrice,
            productDescription: productDescription,
            productCategory: productCategory,
            productImageUrl: uploadedImage.secure_url,
        });
        await newProduct.save();
        res.json({
            success: true,
            message: "Product created successfully",
            product: newProduct,
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// get all products
const getProducts = async (req, res) => {
    try {
        const allProducts = await Products.find({});
        res.json({
            success: true,
            message: "All products fetched successfully!",
            products: allProducts,
        });
    } catch (error) {
        console.log(error);
        res.send("Internal server error");
    }
};
//fetch single product
const getSingleProduct = async (req, res) => {
    const productId = req.params.id;
    try {
        const singleProduct = await Products.findById(productId);
        res.json({
            success: true,
            message: true,
            product: singleProduct,
        });
    } catch (error) {
        console.log(error);
        res.send("Internal Server Error");
    }
};

//update product
const updateProduct = async (req, res) => {
    console.log(req.body);
    console.log(req.files);

    //destructuring data
    const { productName, productPrice, productDescription, productCategory } =
        req.body;
    const { productImage } = req.files;

    //validate data
    if (
        !productName ||
        !productPrice ||
        !productDescription ||
        !productCategory
    ) {
        return res.json({
            success: false,
            message: "Required fields are missing.",
        });
    }

    try {
        // case 1: if there is image
        if (productImage) {
            //Upload image to cloudinary
            const uploadedImage = await cloudinary.v2.uploader.upload(
                productImage.path,
                {
                    folder: "Products",
                    crop: "scale",
                }
            );
            //Make updated json data
            const updatedData = {
                productName: productName,
                productPrice: productPrice,
                productCategory: productCategory,
                productDescription: productDescription,
                productImageUrl: uploadedImage.secure_url,
            };
            //find product and update
            const productId = req.params.id;
            await Products.findByIdAndUpdate(productId, updatedData);
            res.json({
                success: true,
                message: "Product Updated successfully with image.",
                updateProduct: updatedData,
            });
        } else {
            //update wthout image.
            const updatedData = {
                productName: productName,
                productPrice: productPrice,
                productCategory: productCategory,
                productDescription: productDescription,
            };
            //find product and update
            const productId = req.params.id;
            await Products.findByIdAndUpdate(productId, updatedData);
            res.json({
                success: true,
                message: "Product Updated successfully without image.",
                updateProduct: updatedData,
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error ",
        });
    }
};
//delete product
const deleteProduct = async (req, res) => {
    const productId = req.params.id;

    try {
        await Products.findByIdAndDelete(productId);
        res.json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        res.json({
            success: false,
            message: "Invalid",
        });
    }
};


const createOrder = async (req, res) => {
    console.log(req.body);
    const { userId, productId, quantity } = req.body;

    //validate data
    if (!userId || !productId || !quantity) {
        return res.json({
            success: false,
            message: "Please fill all the fields"
        })
    } try {
        const newOrder = new Orders({
            userId: userId,
            productId: productId,
            quantity: quantity,
        })
        await newOrder.save();
        res.json({
            success: true,
            message: "Order created successfully",
            product: newOrder
        })
    } catch (error) {
        res.send(error)
    }
}

const getOrders = async (req, res) => {
    try {
        const orders = await Orders.find({
            $and: [
                { "status": "pending" },
                {
                    "quantity": {
                        $gt: 2      //gt = greater than....here, getting orders with quantity over 2
                    }
                }
            ]
        }).populate("userId")
        res.json({
            success: true,
            message: "All orders fetched successfully",
            product: orders
        })
    } catch (error) {
        console.log(error);
    }
}

const filterProduct = async (req, res) => {
    try {
        const { checked, circle } = req.body;
        let args = {};
        if (checked.length > 0) args.category = checked;
        if (circle.length === 2) {
            args.productPrice = { $gte: Number(circle[0]), $lte: Number(circle[1]) };
        }

        const products = await Products.find(args).populate("category", "name");
        res.status(200).send({
            success: true,
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "error while filtering product",
            error,
        });
    }
};

const getPagination = async (req, res) => {
    // Step 1: Get the page user requested, default to 1 if not provided
    const requestedPage = parseInt(req.query.page, 10) || 1;
    // Step 2: Result per page
    const resultPerPage = 2;

    try {
        // Step 3: Count total number of products
        const totalProducts = await Products.countDocuments();
        // Step 4: Fetch paginated products
        const products = await Products.find({})
            .skip((requestedPage - 1) * resultPerPage)
            .limit(resultPerPage)
            .sort({ createdAt: -1 })
            .populate("category", "name");
        if (products.length === 0) {
            return res.json({
                success: false,
                message: "No products found!",
            });
        }

        res.json({
            success: true,
            products: products,
            currentPage: requestedPage,
            totalPages: Math.ceil(totalProducts / resultPerPage),
            totalProducts: totalProducts,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error occurred in pagination");
    }
};

module.exports = {
    createProduct,
    getProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    createOrder,
    getOrders,
    filterProduct,
    getPagination

};
