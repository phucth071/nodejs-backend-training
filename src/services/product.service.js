'use strict'

const { product, electronic, clothing, book, furniture} = require('../models/product.model')
const { BadRequestError, ForbiddenError } = require('../core/error.response')
const { default: mongoose } = require('mongoose')

const ProductRepository = require('../models/repositories/product.repository')
const InventoryRepository = require('../models/repositories/inventory.repository')

const { removeUndefinedObj, nestedObjectParser } = require('../utils/index')

class ProductFactory {

    static productRegistry = {}

    static registryProductType = (type, classRef) => {
        ProductFactory.productRegistry[type] = classRef
    }

    static createProduct = async (type, payload) => {

        const productClass = ProductFactory.productRegistry[type]
        if (!productClass) throw new BadRequestError(`Product type invalid: ${type}`)

        return new productClass( payload ).createProduct()  
    }

    static updateProduct = async (type, product_id, payload) => {
        const productClass = ProductFactory.productRegistry[type];
        if (!productClass) throw new BadRequestError(`Product type invalid: ${type}`);

        const updatedProduct = await new productClass(payload).updateProduct(product_id);
        return updatedProduct;
    }       

    static async publishProductById( {product_shop, product_id} ) {
        return await ProductRepository.publishProductById( {product_shop, product_id} )
    }

    static async unpublishProductById( {product_shop, product_id} ) {
        return await ProductRepository.unpublishProductById( {product_shop, product_id} )
    }

    /// Query
    static async findAllProducts( {limit = 50, sort = 'ctime', filter = {isPublished: true}, page = 1} ) {
        return await ProductRepository.findAllProducts( {limit, sort, filter, page, 
            select: ['product_name', 'product_description', 'product_price', 'product_quantity', 'product_type', 'product_shop', 'product_attributes', 'product_thumb']
        } )
    }

    static async findProduct( {product_id}) {
        return await ProductRepository.findProduct( {product_id, unSelect: ['isDraft', 'isPublished', '__v']} )
    }

    static async findAllDraftProductsOfShop( {product_shop, limit = 50, skip = 0 } ) {
        const query = { product_shop, isDraft: true }
        return await ProductRepository.findAllDraftProductsOfShop( {query, limit, skip} )
    }

    static async findAllPublishProductsOfShop( {product_shop, limit = 50, skip = 0 } ) {
        const query = { product_shop, isPublished: true }
        return await ProductRepository.findAllPublishProductsOfShop( {query, limit, skip} )
    }

    static async searchProduct( {keyword, limit = 50, skip = 0 } ) {
        return await ProductRepository.searchProduct( {keyword, limit, skip} )
    }
}

class Product {
    constructor({
        product_name, product_thumb, product_price, product_description, product_quantity, product_type, product_shop, product_attributes
    }) {
        this.product_name = product_name;
        this.product_thumb = product_thumb;
        this.product_price = product_price;
        this.product_description = product_description;
        this.product_quantity = product_quantity;
        this.product_type = product_type;
        this.product_shop = product_shop;
        this.product_attributes = product_attributes;
    }

    async createProduct( product_id ) {
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            const newProduct = await product.create({...this, _id: product_id})
            if (!newProduct) throw new BadRequestError('Product not created')
            
            await InventoryRepository.insertToInventory({
                productId: product_id,
                shopId: this.product_shop,
                stock: this.product_quantity
            })
            session.commitTransaction()
            return newProduct
        } catch (error) {
            session.abortTransaction()
            throw error
        } finally {
            session.endSession()
        }

        
    }

    async updateProduct( product_id, payload ) {
        return await ProductRepository.updateProductById( {product_id, bodyUpdate: payload, model: product} )
    }
}

// Electronic extends Product type
class Electronic extends Product {
    
    async createProduct() {
    
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            const newElectronic = await electronic.create({
                ...this.product_attributes,
                product_shop: this.product_shop
            
            })
            if (!newElectronic) throw new BadRequestError('Product not created')
            
            const newProduct = await super.createProduct(newElectronic._id)
            if (!newProduct) throw new BadRequestError('Product not created')
            
            return newProduct
        } catch (error) {
            await session.abortTransaction()
            throw error
        } finally {
            session.endSession()
        }
    }

    async updateProduct(product_id) {
        const session = await mongoose.startSession();
        session.startTransaction();
    
        const objParams = removeUndefinedObj(this);
    
        try {
            let updateProduct;
    
            if (objParams.product_attributes) {
                updateProduct = await ProductRepository.updateProductById({ 
                    product_id, 
                    bodyUpdate: nestedObjectParser(objParams.product_attributes),
                    model: electronic 
                });
            }
    
            updateProduct = await super.updateProduct(product_id, nestedObjectParser(objParams));
    
            await session.commitTransaction();
    
            return updateProduct;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}

// Clothing extends Product type
class Clothing extends Product {
    
    async createProduct() {
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            const newClothing = await clothing.create({
                ...this.product_attributes,
                product_shop: this.product_shop
            
            })
            if (!newClothing) throw new BadRequestError('Product not created')
            
            const newProduct = await super.createProduct(newClothing._id)
            if (!newProduct) throw new BadRequestError('Product not created')
            
            return newProduct
        } catch (error) {
            await session.abortTransaction()
            throw error
        } finally {
            session.endSession()
        }
    }

    async updateProduct(product_id) {
        const session = await mongoose.startSession();
        session.startTransaction();
    
        const objParams = removeUndefinedObj(this);
    
        try {
            let updateProduct;
    
            if (objParams.product_attributes) {
                updateProduct = await ProductRepository.updateProductById({ product_id, bodyUpdate: objParams.product_attributes, model: clothing });
            }
    
            updateProduct = await super.updateProduct(product_id, objParams);
    
            await session.commitTransaction();
    
            return updateProduct;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}

// Book extends Product type
class Book extends Product {
    
    async createProduct() {
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            const newBook = await book.create({
                ...this.product_attributes,
                product_shop: this.product_shop
            
            })
            if (!newBook) throw new BadRequestError('Product not created')
            
            const newProduct = await super.createProduct(newBook._id)
            if (!newProduct) throw new BadRequestError('Product not created')
            
            return newProduct
        } catch (error) {
            await session.abortTransaction()
            throw error
        } finally {
            session.endSession()
        }
    }

    async updateProduct(product_id) {
        const session = await mongoose.startSession();
        session.startTransaction();
    
        const objParams = removeUndefinedObj(this);
    
        try {
            let updateProduct;
    
            if (objParams.product_attributes) {
                updateProduct = await ProductRepository.updateProductById({ product_id, bodyUpdate: objParams.product_attributes, model: book });
            }
    
            updateProduct = await super.updateProduct(product_id, objParams);
    
            await session.commitTransaction();
    
            return updateProduct;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}

// Furniture extends Product type
class Furniture extends Product {
    
    async createProduct() {
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            const newFurniture = await furniture.create({
                ...this.product_attributes,
                product_shop: this.product_shop
            
            })
            if (!newFurniture) throw new BadRequestError('Product not created')
            
            const newProduct = await super.createProduct(newFurniture._id)
            if (!newProduct) throw new BadRequestError('Product not created')
            
            return newProduct
        } catch (error) {
            await session.abortTransaction()
            throw error
        } finally {
            session.endSession()
        }
    }

    async updateProduct(product_id) {
        const session = await mongoose.startSession();
        session.startTransaction();
    
        const objParams = this;
    
        try {
            let updateProduct;
    
            if (objParams.product_attributes) {
                updateProduct = await ProductRepository.updateProductById({ 
                    product_id, 
                    bodyUpdate: nestedObjectParser(objParams.product_attributes),
                    model: furniture 
                });
            }
    
            updateProduct = await super.updateProduct(product_id, nestedObjectParser(objParams));
    
            await session.commitTransaction();
    
            return updateProduct;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}

ProductFactory.registryProductType('Electronics', Electronic)
ProductFactory.registryProductType('Clothing', Clothing)
ProductFactory.registryProductType('Book', Book)
ProductFactory.registryProductType('Furniture', Furniture)

module.exports = {ProductService: ProductFactory};