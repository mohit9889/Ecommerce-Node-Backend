const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Order = require('../models/order');
const Product = require('../models/product');

router.get('/', checkAuth, (req, res, next) => {
    Order.find()
    .select('product quantity _id')
    .populate('product','name _id')
    .exec()
    .then(doc => {
        console.log(doc);
        res.status(200).json({
            count: doc.length,
            orders: doc.map(doc => {
                return {
                    _id: doc._id,
                    product: doc.product,
                    quantity: doc.quantity,
                    request: {
                        typr: 'GET',
                        url: 'http://localhost:3000/orders/' + doc._id
                    }
                }
            })
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.post('/', checkAuth, (req, res, next) => {
    Product.findById(req.body.productId)
    .then(product => {
        if (!product){
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId
        });
    
        return order.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Order stored',
                ceatedOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity
                },
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders/' + result._id
                }
            });
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
    
});

router.get('/:orderId', checkAuth, (req, res, next) => {
    Order.findById(req.params.orderId)
    .populate('product','name _id')
    .exec()
    .then(order => {
        if (!order){
            return res.status(404).json({
                message: 'order not found'
            });
        }

        res.status(200).json({
            order: order,
            request: {
                type: "GET",
                url: 'http://localhost:3000/orders/'
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.delete('/:orderId', checkAuth, (req, res, next) => {
    Order.remove({_id: req.params.ObjectId})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Order deleted',
            request: {
                type: "POST",
                url: 'http://localhost:3000/orders/',
                bodt: { productId: 'ID', quantity: 'Number'}
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;