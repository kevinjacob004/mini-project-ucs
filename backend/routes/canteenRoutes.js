// const express = require('express');
// const { MenuItem,Order,OrderItems } = require('../models'); // Import the MenuItem model
// const authenticateToken = require("../middleware/authenticateToken");

// const router = express.Router();

// // 🔹 Add a menu item (Only Canteen Staff)
// router.post('/menu', authenticateToken, async (req, res) => {
//     try {
//         // Extract data from the request body
//         const { item_name, item_description, price, quantity, available_from, available_to } = req.body;

//         // Validate required fields
//         if (!item_name || !price || !quantity || !available_from || !available_to) {
//             return res.status(400).json({ error: 'Missing required fields' });
//         }

//         // Create a new menu item in the database
//         const newItem = await MenuItem.create({
//             item_name,
//             item_description,
//             price,
//             quantity,
//             available_from,
//             available_to
//         });

//         // Return the newly created item
//         res.status(201).json(newItem);
//     } catch (error) {
//         console.error("Error adding menu item:", error);
//         res.status(500).json({ error: 'Error adding menu item' });
//     }
// });


// // 🔹 Get all menu items (Accessible to all users)
// router.get('/fmenu', async (req, res) => {
//     try {
//         // Fetch all menu items from the database
//         const menuItems = await MenuItem.findAll();

//         // Check if any items were found
//         if (!menuItems || menuItems.length === 0) {
//             return res.status(404).json({ error: 'No menu items found' });
//         }

//         // Return the menu items
//         res.json(menuItems);
//     } catch (error) {
//         console.error("Error fetching menu items:", error);
//         res.status(500).json({ error: 'Error fetching menu items' });
//     }
// });

// // Add item to cart
// router.post('/cart/add', async (req, res) => {
//     const { user_id, item_id, quantity } = req.body;

//     try {
//         // Find or create an active order (cart) for the user
//         let order = await Order.findOne({
//             where: { user_id, order_status: 'placed' },
//         });

//         if (!order) {
//             order = await Order.create({
//                 user_id,
//                 order_status: 'placed',
//                 total_price: 0,
//             });
//         }

//         // Find the menu item to get its price
//         const menuItem = await MenuItem.findByPk(item_id);
//         if (!menuItem) {
//             return res.status(404).json({ error: 'Menu item not found' });
//         }

//         // Check if the item already exists in the cart
//         let orderItem = await OrderItems.findOne({
//             where: { order_id: order.order_id, item_id },
//         });

//         if (orderItem) {
//             // Update quantity if item already exists in the cart
//             orderItem.quantity += quantity;
//             await orderItem.save();
//         } else {
//             // Add new item to the cart
//             orderItem = await OrderItems.create({
//                 order_id: order.order_id,
//                 item_id,
//                 quantity,
//                 price: menuItem.price,
//             });
//         }

//         // Update the total price of the order
//         order.total_price += menuItem.price * quantity;
//         await order.save();

//         res.status(200).json({ message: 'Item added to cart', orderItem });
//     } catch (error) {
//         console.error('Error adding item to cart:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // Place order
// router.post('/order/place', async (req, res) => {
//     const { user_id } = req.body;

//     try {
//         // Find the active order (cart) for the user
//         const order = await Order.findOne({
//             where: { user_id, order_status: 'placed' },
//             include: [{ model: OrderItems, include: [MenuItem] }],
//         });

//         if (!order || order.OrderItems.length === 0) {
//             return res.status(400).json({ error: 'No items in cart' });
//         }

//         // Update order status to 'ready'
//         order.order_status = 'ready';
//         await order.save();

//         res.status(200).json({ message: 'Order placed successfully', order });
//     } catch (error) {
//         console.error('Error placing order:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });


// module.exports = router;


const express = require('express');
const { MenuItem, Order, OrderItems, User } = require('../models'); // Import the models
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

// 🔹 Add a menu item (Only Canteen Staff)
router.post('/menu', authenticateToken, async (req, res) => {
    try {
        // Extract data from the request body
        const { item_name, item_description, price, quantity, available_from, available_to } = req.body;

        // Validate required fields
        if (!item_name || !price || !quantity || !available_from || !available_to) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create a new menu item in the database
        const newItem = await MenuItem.create({
            item_name,
            item_description,
            price,
            quantity,
            available_from,
            available_to
        });

        // Return the newly created item
        res.status(201).json(newItem);
    } catch (error) {
        console.error("Error adding menu item:", error);
        res.status(500).json({ error: 'Error adding menu item' });
    }
});

// 🔹 Get all menu items (Accessible to all users)
router.get('/fmenu', async (req, res) => {
    try {
        // Fetch all menu items from the database
        const menuItems = await MenuItem.findAll();

        // Check if any items were found
        if (!menuItems || menuItems.length === 0) {
            return res.status(404).json({ error: 'No menu items found' });
        }

        // Return the menu items
        res.json(menuItems);
    } catch (error) {
        console.error("Error fetching menu items:", error);
        res.status(500).json({ error: 'Error fetching menu items' });
    }
});

// Add item to cart
router.post('/cart/add', async (req, res) => {
    const { user_id, item_id, quantity } = req.body;

    try {
        // Find or create an active order (cart) for the user
        let order = await Order.findOne({
            where: { user_id, order_status: 'ordering' },
        });

        if (!order) {
            order = await Order.create({
                user_id,
                order_status: 'ordering',
                total_price: 0,
            });
        }

        // Find the menu item to get its price
        const menuItem = await MenuItem.findByPk(item_id);
        if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        // Check if the item already exists in the cart
        let orderItem = await OrderItems.findOne({
            where: { order_id: order.order_id, item_id },
        });

        if (orderItem) {
            // Update quantity if item already exists in the cart
            orderItem.quantity += quantity;
            orderItem.price = menuItem.price * orderItem.quantity;
            await orderItem.save();
        } else {
            // Add new item to the cart
            orderItem = await OrderItems.create({
                order_id: order.order_id,
                item_id,
                quantity,
                price: menuItem.price,
            });
        }

        // Update the total price of the order
        order.total_price += menuItem.price * quantity;
        await order.save();

        res.status(200).json({ message: 'Item added to cart', orderItem });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch cart items for a user
router.get('/cart/:user_id', authenticateToken, async (req, res) => {
    const { user_id } = req.params;

    try {
        // Find the active order (cart) for the user
        const order = await Order.findOne({
            where: { user_id, order_status: 'ordering' },
            include: [
                {
                    model: OrderItems,
                    include: [MenuItem] // Include MenuItem details
                }
            ]
        });
        // console.log(order);

        if (!order) {
            return res.status(404).json({ error: 'No active cart found for this user' });
        }

        // Return the cart items
        res.status(200).json(order.OrderItems);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Remove item from cart
router.delete('/cart/remove/:orderItemId', authenticateToken, async (req, res) => {
    const { orderItemId } = req.params;

    try {
        // Find the order item
        const orderItem = await OrderItems.findByPk(orderItemId);
        if (!orderItem) {
            return res.status(404).json({ error: 'Order item not found' });
        }

        // Find the associated order
        const order = await Order.findByPk(orderItem.order_id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update the total price of the order
        order.total_price -= orderItem.price;
        await order.save();

        // Delete the order item
        await orderItem.destroy();

        res.status(200).json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Place order
router.post('/order/place', async (req, res) => {
    const { user_id } = req.body;

    try {
        // Find the active order (cart) for the user
        const order = await Order.findOne({
            where: { user_id, order_status: 'ordering' },
            include: [{ model: OrderItems, include: [MenuItem] }],
        });

        if (!order || order.OrderItems.length === 0) {
            return res.status(400).json({ error: 'No items in cart' });
        }

        // Update the quantity of each MenuItem in the order
        for (const orderItem of order.OrderItems) {
            const menuItem = await MenuItem.findByPk(orderItem.item_id);
            if (!menuItem) {
                return res.status(404).json({ error: `Menu item with ID ${orderItem.item_id} not found` });
            }

            // Subtract the ordered quantity from the available quantity
            menuItem.quantity -= orderItem.quantity;

            // Ensure the quantity does not go below zero
            if (menuItem.quantity <= 0) {
                return res.status(400).json({ error: `Insufficient quantity for item: ${menuItem.item_name}` });
            }

            // Save the updated MenuItem
            await menuItem.save();
        }

        // Update order status to 'placed'
        order.order_status = 'placed';
        await order.save();

        res.status(200).json({ message: 'Order placed successfully', order });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update quantity of an item in the cart
// Update quantity of an item in the cart
// Update quantity of an item in the cart
// Update quantity of an item in the cart
router.put('/cart/update/:orderItemId', authenticateToken, async (req, res) => {
    const { orderItemId } = req.params;
    const { action } = req.body; // 'increase' or 'decrease'

    try {
        // Find the order item
        const orderItem = await OrderItems.findByPk(orderItemId, {
            include: [{ model: Order }, { model: MenuItem }] // Include the associated order and menu item
        });

        if (!orderItem) {
            return res.status(404).json({ error: 'Order item not found' });
        }

        // Update the quantity based on the action
        if (action === 'increase') {
            orderItem.quantity += 1;
        } else if (action === 'decrease') {
            orderItem.quantity -= 1;

            // If quantity drops to 0, remove the item from the cart
            if (orderItem.quantity < 1) {
                // Reduce the price of the item from the order's total price
                const order = orderItem.Order;
                order.total_price -= orderItem.price;

                // Save the updated order
                await order.save();

                // Delete the order item
                await orderItem.destroy();

                return res.status(200).json({
                    message: 'Item removed from cart',
                    quantity: 0,
                    total_price: order.total_price
                });
            }
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }

        // Recalculate the price of the order item
        const menuItem = orderItem.MenuItem;
        orderItem.price = menuItem.price * orderItem.quantity;

        // Save the updated order item
        await orderItem.save();

        // Recalculate the total price of the order
        const order = orderItem.Order;
        const orderItems = await OrderItems.findAll({
            where: { order_id: order.order_id }
        });

        let totalPrice = 0;
        orderItems.forEach(item => {
            totalPrice += item.price;
        });

        // Update the order's total price
        order.total_price = totalPrice;
        await order.save();

        res.status(200).json({
            message: 'Quantity updated',
            quantity: orderItem.quantity,
            price: orderItem.price,
            total_price: totalPrice
        });
    } catch (error) {
        console.error('Error updating item quantity:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Fetch orders
router.get('/orders', authenticateToken, async (req, res) => {
    const user_id = req.user.id; // Get the user ID from the token
    const role = req.headers.role; // Get the user role from the token

    try {
        let orders;
        //console.log(role);
        if (role === 'canteen_staff' || role === 'admin') {
            //console.log(role);
            // Fetch all orders with status 'placed' for canteen staff
            orders = await Order.findAll({
                where: { order_status: 'placed' },
                include: [
                    {
                        model: OrderItems,
                        include: [MenuItem]
                    },
                    {
                        model: User, // Include user details
                        attributes: ['id', 'first_name', 'email'] // Include only necessary user details
                    }
                ]
            });
        } else {
            // Fetch only the user's orders with status 'placed'
            orders = await Order.findAll({
                where: { user_id, order_status: 'placed' },
                include: [
                    {
                        model: OrderItems,
                        include: [MenuItem]
                    },
                    {
                        model: User, // Include user details
                        attributes: ['id', 'first_name', 'email'] // Include only necessary user details
                    }
                ]
            });
        }

        if (!orders || orders.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/orders/:orderId/cancel', authenticateToken, async (req, res) => {
    const { orderId } = req.params; // Get the order ID from the URL
    const user_id = req.user.id; // Get the user ID from the token
    const role = req.headers.role;
    // console.log(user_id);
    try {
        // Find the order
        const order = await Order.findOne({
            where: { order_id: orderId, user_id } // Ensure the order belongs to the user
        });

        if (role === 'admin') {
            const ordadmin = await Order.findOne({
                where: { order_id: orderId } // Ensure the order belongs to the user
            });
            console.log(ordadmin);
            if (!ordadmin) {
                console.log(role);
                return res.status(404).json({ error: 'Order not found or you do not have permission to cancel this order' });
            }
            ordadmin.order_status = 'cancelled';
            await ordadmin.save();

            res.status(200).json({ message: 'Order cancelled successfully', ordadmin });
            return;
        }

        if (!order) {
            return res.status(404).json({ error: 'Order not found or you do not have permission to cancel this order' });
        }

        // Update the order status to 'cancelled'
        order.order_status = 'cancelled';
        await order.save();

        res.status(200).json({ message: 'Order cancelled successfully', order });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/orders/:orderId/ready', authenticateToken, async (req, res) => {
    const { orderId } = req.params;
    const role = req.headers.role;
    // console.log(role);
    try {
        // Only canteen_staff can mark orders as ready
        if (role !== 'canteen_staff') {
            return res.status(403).json({ error: 'You do not have permission to perform this action' });
        }

        const order = await Order.findOne({
            where: { order_id: orderId }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update the order status to 'ready'
        order.order_status = 'ready';
        await order.save();

        res.status(200).json({ message: 'Order marked as ready', order });
    } catch (error) {
        console.error('Error marking order as ready:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/orders/ready', authenticateToken, async (req, res) => {
    const user_id = req.user.id; // Get the user ID from the token
    const role = req.headers.role; // Get the user role from the token

    try {
        let readyOrders;

        if (role === 'canteen_staff' || role === 'admin') {
            // Fetch all orders with status 'ready' for canteen staff
            readyOrders = await Order.findAll({
                where: { order_status: 'ready' },
                include: [
                    {
                        model: OrderItems,
                        include: [MenuItem]
                    },
                    {
                        model: User, // Include user details
                        attributes: ['id', 'first_name', 'email'] // Include only necessary user details
                    }
                ]
            });
        } else {
            // Fetch only the user's orders with status 'ready'
            readyOrders = await Order.findAll({
                where: { user_id, order_status: 'ready' },
                include: [
                    {
                        model: OrderItems,
                        include: [MenuItem]
                    },
                    {
                        model: User, // Include user details
                        attributes: ['id', 'first_name', 'email'] // Include only necessary user details
                    }
                ]
            });
        }

        if (!readyOrders || readyOrders.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(readyOrders);
    } catch (error) {
        console.error('Error fetching ready orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.put('/orders/:orderId/delivered', authenticateToken, async (req, res) => {
    const { orderId } = req.params; // Get the order ID from the URL
    const role = req.headers.role; // Get the user role from the token

    try {
        // Only canteen_staff can mark orders as delivered
        if (role !== 'canteen_staff') {
            return res.status(403).json({ error: 'You do not have permission to perform this action' });
        }

        // Find the order
        const order = await Order.findOne({
            where: { order_id: orderId }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update the order status to 'delivered'
        order.order_status = 'delivered';
        await order.save();

        res.status(200).json({ message: 'Order marked as delivered', order });
    } catch (error) {
        console.error('Error marking order as delivered:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/orders/delivered', authenticateToken, async (req, res) => {
    const user_id = req.user.id; // Get the user ID from the token
    const role = req.headers.role; // Get the user role from the token

    try {
        let deliveredOrders;

        if (role === 'canteen_staff' || role === 'admin') {
            // Fetch all orders with status 'delivered' for canteen staff
            deliveredOrders = await Order.findAll({
                where: { order_status: 'delivered' },
                include: [
                    {
                        model: OrderItems,
                        include: [MenuItem]
                    },
                    {
                        model: User, // Include user details
                        attributes: ['id', 'first_name', 'email'] // Include only necessary user details
                    }
                ]
            });
        } else {
            // Fetch only the user's orders with status 'delivered'
            deliveredOrders = await Order.findAll({
                where: { user_id, order_status: 'delivered' },
                include: [
                    {
                        model: OrderItems,
                        include: [MenuItem]
                    },
                    {
                        model: User, // Include user details
                        attributes: ['id', 'first_name', 'email'] // Include only necessary user details
                    }
                ]
            });
        }

        if (!deliveredOrders || deliveredOrders.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(deliveredOrders);
    } catch (error) {
        console.error('Error fetching delivered orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/menu/:menuId', authenticateToken, async (req, res) => {
    const { menuId } = req.params;
    const { price, quantity } = req.body;
    const role = req.headers.role;
    console.log(role);
    try {
        // Only canteen_staff can update menu items
        if (role !== 'canteen_staff') {
            return res.status(403).json({ error: 'You do not have permission to perform this action' });
        }

        const menuItem = await MenuItem.findByPk(menuId);

        if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        // Update the menu item
        menuItem.price = price;
        menuItem.quantity = quantity;
        await menuItem.save();

        res.status(200).json({ message: 'Menu item updated successfully', menuItem });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;