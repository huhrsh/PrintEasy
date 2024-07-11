const Shop = require('../models/shop');
const Print = require('../models/print');
const User = require('../models/user');
const index = require('../WebSocket');
const archiver = require('archiver');
const cloudinary = require('../config/cloudinary');
const path=require('path')
const fs=require('fs')
const axios=require('axios')

const notifyUser = index.notifyUser;
const notifyShop = index.notifyShop;

module.exports.newPrint = async (req, res) => {
    const shopId = req.body.shop;
    const fileInfo = JSON.parse(req.body.fileInfo);

    try {
        const shopFound = await Shop.findById(shopId);

        const token = shopFound.tokenNumber;

        // Upload files to Cloudinary
        const uploadedFiles = [];
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path, { folder: 'uploads/prints', resource_type: 'auto' });
            uploadedFiles.push({ url: result.secure_url, public_id: result.public_id, originalname: file.originalname });
        }

        const newPrint = await Print.create({
            files: uploadedFiles,
            user: req.body.user,
            shop: shopFound,
            tokenNumber: req.body.priority === 'true' ? -1 : token + 1,
            priority: req.body.priority,
            totalPrice: req.body.totalPrice,
            active: true,
            fileInfo: fileInfo
        });

        await User.findOneAndUpdate({ _id: req.body.user }, { $push: { activePrints: newPrint } }, { new: true });

        if (newPrint.priority) {
            shopFound.currentPriorityOrders.push(newPrint);
        } else {
            shopFound.tokenNumber = token + 1;
            shopFound.currentOrders.push(newPrint);
        }

        await shopFound.save();

        notifyShop(shopId, newPrint._id, newPrint.priority);

        if (newPrint.priority) {
            res.json({ tokenNumber: -1, text: "Order placed successfully", print: newPrint._id });
        } else {
            res.json({ tokenNumber: token + 1, text: "Order placed successfully", print: newPrint._id });
        }
    } catch (err) {
        console.error(err);
        res.json({ message: "Error in sending order" });
    }
};

module.exports.getPrintInfo = (req, res) => {
    Print.findById(req.body.id)
        .populate('user')
        .populate('shop')
        .then((print) => {
            res.json(print);
        })
        .catch((err) => {
            res.json({ message: "Error in fetching printed file" });
        });
};

module.exports.download = async (req, res) => {
    try {
        const archive = archiver('zip', {
            zlib: { level: 5 }
        });

        res.setHeader('Content-Disposition', 'attachment; filename="download.zip"');
        res.setHeader('Content-Type', 'application/zip');
        archive.pipe(res);

        for (const file of req.body.files) {
            const options = {
                method: 'get',
                url: file.url,
                headers: {
                    'Authorization': `Bearer ${cloudinary.api_key}`
                },
                responseType: 'stream'
            };

            const response = await axios(options);
            archive.append(response.data, { name: file.originalname });
        }

        archive.finalize();

        archive.on('error', (err) => {
            console.error(err);
            res.status(500).json({ text: 'Error processing files', error: err.message });
        });

        archive.on('finish', () => {
            res.end();
        });
    } catch (err) {
        console.error(err);
        return res.json({ text: 'Error processing request', error: err.message });
    }
};

module.exports.singleDownload = async (req, res) => {
    try {
        const { file } = req.body;

        if (file && file.public_id) {
            const fileUrl = cloudinary.url(file.public_id, { secure: true }); // Generate Cloudinary URL

            // Set headers for file download
            res.setHeader('Content-Disposition', `attachment; filename="${file.originalname}"`);

            // Stream the file directly from Cloudinary URL to response
            const axiosResponse = await axios({
                url: fileUrl,
                method: 'GET',
                responseType: 'stream',
                headers: {
                    Authorization: `Bearer ${cloudinary.api_key}`
                }
            });

            axiosResponse.data.pipe(res);
        } else {
            res.status(404).json({ text: 'File not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ text: 'Error processing request', error: err.message });
    }
};


// module.exports.singleDownload = async (req, res) => {
//     try {
//         const { file } = req.body;

//         if (file && file.public_id) {
//             const fileStream = cloudinary.uploader.download(file.public_id);

//             res.setHeader('Content-Disposition', `attachment; filename="${file.originalname}"`);
//             fileStream.pipe(res);
//         } else {
//             res.status(404).json({ text: 'File not found' });
//         }
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ text: 'Error processing request', error: err.message });
//     }
// };

module.exports.orderCompleted = (req, res) => {
    Print.findByIdAndUpdate(req.body.print, { active: false }, { new: true })
        .then((print) => {
            User.findById(print.user.toString())
                .then((userFound) => {
                    let tempArr = userFound.activePrints.filter(item => item._id.toString() !== print._id.toString());
                    userFound.activePrints = tempArr;
                    userFound.filePrinted.push(print);
                    notifyUser(userFound._id.toString(), print);
                    userFound.save();
                })
                .catch((err) => {
                    console.log("Error in completing order, finding user", err);
                    return res.json({ message: "Error occurred in completing order" });
                });

            Shop.findById(print.shop.toString())
                .then((shopFound) => {
                    shopFound.currentToken = shopFound.currentToken + 1;
                    if (print.priority) {
                        let tempShop = shopFound.currentPriorityOrders.filter(item => item._id.toString() !== print._id.toString());
                        shopFound.currentPriorityOrders = tempShop;
                    } else {
                        let tempShop = shopFound.currentOrders.filter(item => item._id.toString() !== print._id.toString());
                        shopFound.currentOrders = tempShop;
                    }
                    shopFound.totalOrders.push(print);
                    shopFound.save();
                    res.json({ success: "Successful" });
                })
                .catch((err) => {
                    console.log("Error in completing order, finding user", err);
                    return res.json({ message: "Error occurred in completing order" });
                });
        })
        .catch((err) => {
            console.log("Error in completing order, finding user", err);
            return res.json({ message: "Error occurred in completing order" });
        });
};

module.exports.getPdf = async (req, res) => {
    try {
        const { file } = req.body;

        if (file && file.url) {
            res.setHeader('Content-Disposition', `attachment; filename="${file.originalname}"`);

            const axiosResponse = await axios({
                url: file.url,
                method: 'GET',
                responseType: 'stream',
            });

            axiosResponse.data.pipe(res);
        } else {
            res.status(404).json({ text: 'File not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ text: 'Error processing request', error: err.message });
    }
};


// module.exports.getPdf = (req, res) => {
//     const filename = req.body.file.filename;
//     const filePath = path.join(__dirname, `../uploads/prints/${filename}`);

//     if (fs.existsSync(filePath)) {
//         const stream = fs.createReadStream(filePath);

//         stream.on('error', (error) => {
//             console.error('Error streaming file:', error);
//             res.status(500).send('Internal Server Error');
//         });

//         stream.on('end', () => {
//             res.end();
//         });

//         stream.pipe(res);
//     } else {
//         res.status(404).send('File not found');
//     }
// };
