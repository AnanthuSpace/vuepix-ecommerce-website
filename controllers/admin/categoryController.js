const Category = require('../../models/categorySchema')


const renderCategory = async (req, res) => {
    try {
        const cat = await Category.find({})

        let itemsPerPage = 4
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * itemsPerPage
        let endIndex = startIndex + itemsPerPage
        let totalPages = Math.ceil(cat.length / 4 )
        const currentCategory = cat.slice(startIndex, endIndex)

        res.render("admin/category", { cat: currentCategory, totalPages, currentPage, categoryActive:true })
    } catch (error) {
        console.log(error.message);
    }
    // await Category.find({})
    //     .then(data => res.render("admin/category", { cat: data }))
    //     .catch(error => console.log(error.message))
}


const addCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        console.log(req.body.name);
        const categoryExists = await Category.findOne({ name });

        if (!categoryExists) {
            const newCategory = new Category({
                name: name,
                description: description
            });

            await newCategory.save();
            console.log("Category done:", newCategory);
            res.redirect("/admin/category");
        } else {
            res.redirect("/admin/category");
            console.log("Category Already exists");
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
        res.render("admin/editCategory", { category: category ,categoryActive:true });
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

        const categoryExists = await Category.findOne({ name:categoryName });

        if (!categoryExists) {
            if (findCategory) {
            
                await Category.updateOne(
                    { _id: id },
                    {
                        name: categoryName,
                        description: description
                    }
                );
                res.redirect("/admin/category");
            } else {
                console.log("Category not found");
                res.redirect("/admin/category");
            } 
        }else{
            console.log("Existed Category");
            res.redirect("/admin/category");
        }
        
    } catch (error) {
        console.log(error.message);
    }
};


module.exports = {
    renderCategory,
    addCategory,
    listCategory,
    unListCategory,
    renderEditCategory,
    editCategory
}