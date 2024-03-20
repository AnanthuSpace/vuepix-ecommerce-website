const Category = require('../../models/categorySchema')
const Product = require("../../models/productSchema")


const renderCategory = async (req, res) => {
    try {
        const cat = await Category.find({})

        let itemsPerPage = 4
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * itemsPerPage
        let endIndex = startIndex + itemsPerPage
        let totalPages = Math.ceil(cat.length / 4)
        const currentCategory = cat.slice(startIndex, endIndex)

        res.render("admin/category", { cat: currentCategory, totalPages, currentPage, categoryActive: true })
    } catch (error) {
        console.log(error.message);
    }
}


const addCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        console.log(req.body.name);
        const categoryName = name.trim().toLowerCase();
        const categoryExists = await Category.findOne({ name: { $regex: new RegExp('^' + categoryName + '$', 'i') } });

        if (!categoryExists) {
            const newCategory = new Category({
                name: name,
                description: description
            });

            await newCategory.save();
            console.log("Category done:", newCategory);
            res.redirect("/admin/category");
        } else {

            const cat = await Category.find({})

            let itemsPerPage = 4
            let currentPage = parseInt(req.query.page) || 1
            let startIndex = (currentPage - 1) * itemsPerPage
            let endIndex = startIndex + itemsPerPage
            let totalPages = Math.ceil(cat.length / 4)
            const currentCategory = cat.slice(startIndex, endIndex)
            console.log("Category Already exists");

            res.render("admin/category", {
                cat: currentCategory,
                totalPages,
                currentPage,
                categoryActive: true,
                errorMsg: `Category ${categoryName} is already exists`
            })

        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};


const listCategory = async (req, res) => {
    try {
        const id = req.query.id;
        await Category.updateOne({ _id: id }, { $set: { isListed: false } });
        res.redirect("/admin/category");
    } catch (error) {
        console.log(error.message);
    }
};

const unListCategory = async (req, res) => {
    try {
        const id = req.query.id;
        await Category.updateOne({ _id: id }, { $set: { isListed: true } });
        res.redirect("/admin/category");
    } catch (error) {
        console.log(error.message);
    }
};


const renderEditCategory = async (req, res) => {

    try {
        const id = req.query.id;
        const category = await Category.findOne({ _id: id });
        res.render("admin/editCategory", { category: category, categoryActive: true });
    } catch (error) {
        console.log(error.message);
    }
}


const editCategory = async (req, res) => {
    try {
        console.log("working");
        const id = req.params.id;
        const { categoryName, description } = req.body;
        const findCategory = await Category.findById(id);
        const updatedCategoryName = categoryName.trim().toLowerCase();

        const categoryExists = await Category.findOne({ _id: { $ne: id }, name: { $regex: new RegExp('^' + updatedCategoryName + '$', 'i') } });

        if (!categoryExists) {
            if (findCategory) {

                await Category.updateOne(
                    { _id: id },
                    {
                        name: categoryName,
                        description: description,
                    }
                );
                res.redirect("/admin/category");
            } else {
                console.log("Category not found");
                res.redirect("/admin/category");
            }
        } else {
            console.log("Existed Category");
            const cat = await Category.find({})

            let itemsPerPage = 4
            let currentPage = parseInt(req.query.page) || 1
            let startIndex = (currentPage - 1) * itemsPerPage
            let endIndex = startIndex + itemsPerPage
            let totalPages = Math.ceil(cat.length / 4)
            const currentCategory = cat.slice(startIndex, endIndex)
            console.log("Category Already exists");

            res.render("admin/category", {
                cat: currentCategory,
                totalPages,
                currentPage,
                categoryActive: true,
                errorMsg: `Category ${categoryName} is already exists`
            })

        }

    } catch (error) {
        console.log(error.message);
    }
};




const addCategoryOffer = async (req, res) => {
    try {
        const percentage = parseInt(req.body.percentage);
        const categoryId = req.body.categoryId;

        // Update categoryOffer for the specified category
        const updatedCategory = await Category.findByIdAndUpdate(categoryId, { categoryOffer: percentage }, { new: true });
        console.log("Category offer updated:", updatedCategory);

        // Calculate the new sales prices for products in the category
        const productsToUpdate = await Product.find({ category: updatedCategory.name });
        for (const product of productsToUpdate) {
            if (product.productOffer == 0) {
                const newSalesPrice = product.salesPrice - Math.floor(product.regularPrice * (percentage / 100));
                product.categoryOffer = percentage;
                product.salesPrice = newSalesPrice;
                await product.save();
            }
        }
        console.log("Sales prices updated for products in category:", updatedCategory.name);

        res.json({ status: true });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ status: false, error: error.message });
    }
};




const removerCategoryOffer = async (req, res) => {
    try {
        // console.log(req.body);
        const categoryId = req.body.categoryId
        const findCategory = await Category.findOne({ _id: categoryId })
        console.log(findCategory);

        const percentage = findCategory.categoryOffer
        // console.log(percentage);

        const productData = await Product.find({ category: findCategory.name })

        if (productData.length > 0) {
            for (const product of productData) {
                if (product.categoryOffer !== 0) {
                    product.salesPrice = product.salesPrice + Math.floor(product.regularPrice * (percentage / 100))
                    product.categoryOffer = 0
                    await product.save()
                    await product.save()
                }
            }
        }

        findCategory.categoryOffer = 0
        await findCategory.save()

        res.json({ status: true })

    } catch (error) {
        console.log(error.message);
    }
}




module.exports = {
    renderCategory,
    addCategory,
    listCategory,
    unListCategory,
    renderEditCategory,
    editCategory,
    addCategoryOffer,
    removerCategoryOffer
}