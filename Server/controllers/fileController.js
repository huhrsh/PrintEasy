const File = require('../models/file');
const archiver = require('archiver');
const fs = require('fs');
const User = require('../models/user');
const cloudinary = require('../config/cloudinary');
const axios=require('axios')

module.exports.send = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const fileUploads = req.files.map(file => {
            return cloudinary.uploader.upload(file.path, {
                folder: 'uploads/files',
                resource_type: 'auto'
            }).then(result => ({
                url: result.secure_url,
                public_id: result.public_id,
                format: result.format,
                original_filename: file.originalname  
            }));
        });

        const uploadedFiles = await Promise.all(fileUploads);
        // Clean up the files from the server
        req.files.forEach(file => fs.unlinkSync(file.path));

        const deletionTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
        // Create file document in database
        const file = await File.create({
            files: uploadedFiles,
            user: req.body.user ? req.body.user : undefined,
            deletionTime
        });

        return res.json({
            text: "Files uploaded",
            file: file
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Error in uploading"
        });
    }
};

module.exports.receive = async (req, res) => {
    try {
        const base64Token = req.body.token;
        if (!base64Token || typeof base64Token !== 'string') {
            throw new Error('Invalid or missing token');
        }
        const binaryData = Buffer.from(base64Token, 'base64');
        const token = binaryData.toString('hex');
        const filesFound = await File.findById(token);

        if (filesFound) {
            if (req.body.user) {
                let userId = req.body.user.toString();
                const user = await User.findById(userId);

                if (user && !user.fileReceived.includes(token)) {
                    await User.findByIdAndUpdate(userId, { $push: { fileReceived: token } });
                }
            }
            return res.json({
                files: filesFound,
                text: "Files fetched"
            });
        } else {
            return res.json({ text: "Incorrect token" });
        }
    } catch (err) {
        console.log(err);
        return res.json({ text: "Incorrect token" });
    }
}
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
            archive.append(response.data, { name: file.original_filename });
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
        return res.status(500).json({ text: 'Error processing request', error: err.message });
    }
};