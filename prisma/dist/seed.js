"use strict";
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// async function main() {
//    await seedUsersAndCarts();
//   // Seed categories
//   const shoesCategory = await prisma.category.upsert({
//     where: { slug: 'shoes' },
//     update: {},
//     create: {
//       name: 'Shoes',
//       slug: 'shoes',
//     },
//   });
//   // Seed products
//   await prisma.product.createMany({
//     data: [
//       {
//         title: 'Nike Air Max',
//         slug: 'nike-air-max',
//         description: 'Comfortable and stylish running shoes.',
//         price: 129.99,
//         status: 'active',
//         stock: 50,
//         categoryId: shoesCategory.id,
//       },
//       {
//         title: 'Adidas Ultraboost',
//         slug: 'adidas-ultraboost',
//         description: 'High-performance sneakers with responsive cushioning.',
//         price: 149.99,
//         status: 'active',
//         stock: 30,
//         categoryId: shoesCategory.id,
//       },
//       {
//         title: 'Puma RS-X',
//         slug: 'puma-rs-x',
//         description: 'Retro-inspired design with modern comfort.',
//         price: 109.99,
//         status: 'active',
//         stock: 40,
//         categoryId: shoesCategory.id,
//       },
//     ],
//   });
//   // Fetch products to link images and variants
//   const allProducts = await prisma.product.findMany();
//   for (const product of allProducts) {
//     // Seed images
//     await prisma.productImage.createMany({
//       data: [
//         {
//           productId: product.id,
//           url: `https://via.placeholder.com/600x400?text=${product.title.replace(/\s+/g, '+')}`,
//           alt: `${product.title} image`,
//         },
//       ],
//     });
//     // Seed variants
//     await prisma.variant.createMany({
//       data: [
//         {
//           productId: product.id,
//           name: 'Size 9',
//           sku: `${product.slug}-sz9`,
//           price: product.price,
//           stock: 10,
//         },
//         {
//           productId: product.id,
//           name: 'Size 10',
//           sku: `${product.slug}-sz10`,
//           price: product.price,
//           stock: 15,
//         },
//       ],
//     });
//   }
// }
// main()
//   .then(() => {
//     console.log('✅ Seeded products, categories, images, and variants successfully');
//   })
//   .catch((e) => {
//     console.error('❌ Error seeding data:', e);
//   })
//   .finally(() => {
//     prisma.$disconnect();
//   });
//   import bcrypt from 'bcrypt';
// async function seedUsersAndCarts() {
//   const passwordHash = await bcrypt.hash('admin1234', 10);
//   const user = await prisma.user.upsert({
//     where: { email: 'admin@marvelmedia.ng' },
//     update: {},
//     create: {
//       name: 'Admin User',
//       email: 'admin@marvelmedia.ng',
//       passwordHash,
//       role: 'admin',
//     },
//   });
//   await prisma.cart.upsert({
//     where: { userId: user.id },
//     update: {},
//     create: {
//       userId: user.id,
//     },
//   });
//   const products = await prisma.product.findMany();
//   for (const product of products) {
//     await prisma.review.create({
//       data: {
//         productId: product.id,
//         userId: user.id,
//         rating: 5,
//         title: `Love the ${product.title}`,
//         body: `This ${product.title} exceeded my expectations. Highly recommended!`,
//       },
//     });
//   }
// }
var client_1 = require("@prisma/client");
var bcrypt_1 = require("bcrypt");
var prisma = new client_1.PrismaClient();
function seedUsersAndCarts() {
    return __awaiter(this, void 0, void 0, function () {
        var passwordHash, user, products, _i, products_1, product;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, bcrypt_1.default.hash('admin1234', 10)];
                case 1:
                    passwordHash = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'admin@marvelmedia.ng' },
                            update: {},
                            create: {
                                name: 'Admin User',
                                email: 'admin@marvelmedia.ng',
                                passwordHash: passwordHash,
                                role: 'admin',
                            },
                        })];
                case 2:
                    user = _a.sent();
                    return [4 /*yield*/, prisma.cart.upsert({
                            where: { userId: user.id },
                            update: {},
                            create: {
                                userId: user.id,
                            },
                        })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, prisma.product.findMany()];
                case 4:
                    products = _a.sent();
                    _i = 0, products_1 = products;
                    _a.label = 5;
                case 5:
                    if (!(_i < products_1.length)) return [3 /*break*/, 8];
                    product = products_1[_i];
                    return [4 /*yield*/, prisma.review.create({
                            data: {
                                productId: product.id,
                                userId: user.id,
                                rating: 5,
                                title: "Love the ".concat(product.title),
                                body: "This ".concat(product.title, " exceeded my expectations. Highly recommended!"),
                            },
                        })];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var shoesCategory, allProducts, _i, allProducts_1, product;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // --- Seed Users ----
                return [4 /*yield*/, seedUsersAndCarts()];
                case 1:
                    // --- Seed Users ----
                    _a.sent();
                    return [4 /*yield*/, prisma.category.upsert({
                            where: { slug: 'shoes' },
                            update: {},
                            create: {
                                name: 'Shoes',
                                slug: 'shoes',
                            },
                        })];
                case 2:
                    shoesCategory = _a.sent();
                    // --- Seed Products ----
                    return [4 /*yield*/, prisma.product.createMany({
                            data: [
                                {
                                    title: 'Nike Air Max',
                                    slug: 'nike-air-max',
                                    description: 'Comfortable and stylish running shoes.',
                                    price: 129.99,
                                    status: 'active',
                                    stock: 50,
                                    categoryId: shoesCategory.id,
                                },
                                {
                                    title: 'Adidas Ultraboost',
                                    slug: 'adidas-ultraboost',
                                    description: 'High-performance sneakers with responsive cushioning.',
                                    price: 149.99,
                                    status: 'active',
                                    stock: 30,
                                    categoryId: shoesCategory.id,
                                },
                                {
                                    title: 'Puma RS-X',
                                    slug: 'puma-rs-x',
                                    description: 'Retro-inspired design with modern comfort.',
                                    price: 109.99,
                                    status: 'active',
                                    stock: 40,
                                    categoryId: shoesCategory.id,
                                },
                            ],
                        })];
                case 3:
                    // --- Seed Products ----
                    _a.sent();
                    return [4 /*yield*/, prisma.product.findMany()];
                case 4:
                    allProducts = _a.sent();
                    _i = 0, allProducts_1 = allProducts;
                    _a.label = 5;
                case 5:
                    if (!(_i < allProducts_1.length)) return [3 /*break*/, 9];
                    product = allProducts_1[_i];
                    return [4 /*yield*/, prisma.productImage.createMany({
                            data: [
                                {
                                    productId: product.id,
                                    url: "https://via.placeholder.com/600x400?text=".concat(product.title.replace(/\s+/g, '+')),
                                    alt: "".concat(product.title, " image"),
                                },
                            ],
                        })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, prisma.variant.createMany({
                            data: [
                                {
                                    productId: product.id,
                                    name: 'Size 9',
                                    sku: "".concat(product.slug, "-sz9"),
                                    price: product.price,
                                    stock: 10,
                                },
                                {
                                    productId: product.id,
                                    name: 'Size 10',
                                    sku: "".concat(product.slug, "-sz10"),
                                    price: product.price,
                                    stock: 15,
                                },
                            ],
                        })];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 5];
                case 9:
                    console.log('✅ Seeded products, categories, images, variants, users, carts and reviews successfully');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
