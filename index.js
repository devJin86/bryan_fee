const express = require('express')
const app = express()
const port = 3000

const Shopify = require('shopify-api-node');



app.get('/', (req, res) => {
    const shopify = new Shopify({
        shopName: 'your-shop-name',
        apiKey: 'your-api-key',
        password: 'your-app-password'
    });
    const products = shopify.product
        .list({
            limit: 250
        })
        .then(processProdcuts)
        .catch(error => {
            console.log(`Error ${error}`);
            console.error('===============================', '@ die here')
        });

    function processProdcuts(products) {
        // console.log(data)
        fieldsToDelete = [];

        products.forEach((product, productIndex) => {
            setTimeout(() => {
                shopify.metafield
                    .list({
                        metafield: {
                            owner_resource: "product",
                            owner_id: product.id
                        }
                    })
                    .then(
                        metafields => {
                            console.log(
                                `${productIndex + 1} of ${products.length} : ${product.title} - ${
                metafields.length
              } metafields found`
                            );

                            if (metafields.length > 0) {
                                metafields.forEach(field => {
                                    fieldsToDelete.push(field.id);
                                });
                            }

                            if (productIndex === products.length - 1) {
                                fieldsToDelete.forEach((metafieldID, metafieldIndex) => {
                                    setTimeout(() => {
                                        shopify.metafield
                                            .delete(metafieldID)
                                            .then(result => {
                                                console.log(
                                                    `Deleting metafield ${metafieldIndex + 1} of ${
                          fieldsToDelete.length
                        }: ${metafieldID}`
                                                );
                                            })
                                            .catch(error => {
                                                console.log(error);
                                            });
                                    }, 500 * metafieldIndex);
                                });
                            }
                        },
                        err => console.error(err)
                    );
            }, 500 * productIndex);
        });
    }


    res.end({
        'mesasge': 'Start Deleting'
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))