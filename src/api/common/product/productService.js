const ProductRepository = require('./productRepository');
const ProductItemRepository = require('../productItem/productItemRepository');
const helper = require('../../../utils/helper');
const ClientTypeEnum = require('../enum/clientType');
const {ObjectID} = require('mongodb');
const crypto = require("crypto");


const CLIENT_ID = "5e33e587531bf029f0a8f539";
const BASE_BUCKET_URL = 'https://ordel-thumbnails.s3.eu-north-1.amazonaws.com/';
const MISSING_IMAGE_NAME = 'Missing_Image';
const AWS = require('aws-sdk');
AWS.config.credentials = {
    "accessKeyId": "AKIASWJWQ2RIRRA3PEG6",
    "secretAccessKey": "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",
    "region": "eu-north-1"
};

class ProductService {
    constructor() {
        this.repository = new ProductRepository();
        this.productItemRepository = new ProductItemRepository();
        this.s3Bucket = new AWS.S3({params: {Bucket: 'ordel-thumbnails'}});
    }

    listForCurrentType(type, user) {
        return this.repository.listForCurrentClient(user)
            .then(array => {
                let products = [];
                if (type === ClientTypeEnum.supplier) {
                    products = array.filter(product => product.clientProducts
                        .some(clientProduct => clientProduct.clientId.toString() === user.clientId));
                } else if (type === ClientTypeEnum.restaurant) {
                    products = array.filter(product => product.clientProducts
                        .every(clientProduct => clientProduct.clientId.toString() !== user.clientId));
                }

                return products.map(product => {
                    const clientProducts = product.clientProducts.filter(clientProduct => {
                        if (type === ClientTypeEnum.supplier) {
                            return clientProduct.clientId.toString() === user.clientId;
                        }
                        return clientProduct.clientId.toString() !== user.clientId;
                    });
                    return {
                        ...product,
                        clientProducts,
                    };
                });
            })
            .then(arr => helper.replaceAll(arr, '_id', 'id'));
    }

    mapProductDtoToProduct(product) {
        return {
            name: product.name,
            details: product.description,
            brand: product.brand,
            uom: product.uom,
            image: product.image,
        }
    }

    async uploadImageToS3(imageBase64) {
        const buf = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ""), 'base64')
        const data = {
            Key: crypto.randomBytes(20).toString('hex'),
            Body: buf,
            ACL: 'public-read',
            ContentEncoding: 'base64',
            ContentType: 'image/jpeg'
        };
        this.s3Bucket.putObject(data, function (err, data) {
            if (err) {
                return true;
            } else {
                return false;
            }
        });

        return data.Key;
    }

    async addProduct(product, user) {
        const preparedProduct = this.mapProductDtoToProduct(product);

        const imageKey = preparedProduct.image ? await this.uploadImageToS3(preparedProduct.image) : MISSING_IMAGE_NAME;
        preparedProduct.image = BASE_BUCKET_URL + imageKey;

        return this.repository
            .add(preparedProduct)
            .then(res => {
                const productItem = {
                    productId: ObjectID(res.insertedId),
                    clientId: ObjectID(CLIENT_ID),
                    price: parseInt(product.price),
                    count: parseInt(product.count),
                };
                return this.productItemRepository.add(productItem);
            });
    }

    async updateProduct(product) {
        const preparedProduct = this.mapProductDtoToProduct(product);
        const oldProduct = await this.repository.findById(preparedProduct.id)

        const imageUrl = preparedProduct.image == oldProduct.image ? preparedProduct.image : BASE_BUCKET_URL + await this.uploadImageToS3(preparedProduct.image);
        preparedProduct.image = imageUrl;
        preparedProduct.id = product.id;
        preparedProduct.productItemId = product.productItemId;
        console.log(preparedProduct)


        return this.repository
            .edit(product.id, preparedProduct)
            .then(res => {
                const productItem = {
                    productId: ObjectID(preparedProduct.id),
                    clientId: ObjectID(CLIENT_ID),
                    price: parseInt(product.price),
                    count: parseInt(product.count),
                };
                return this.productItemRepository.edit(product.productItemId, productItem);
            });
    }
}

module.exports = ProductService;