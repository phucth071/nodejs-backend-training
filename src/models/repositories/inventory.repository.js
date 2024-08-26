'use strict'

const { inventory } = require('../inventory.model')

const { Types } = require('mongoose');

class InventoryRepository {
    static insertToInventory = async ({
        productId, shopId, stock, location = 'Main Warehouse'
    }) => {
        return await inventory.create({
            inven_productId: productId,
            inven_shopId: shopId,
            inven_stock: stock,
            inven_location: location
        })
    }
}

module.exports = InventoryRepository;