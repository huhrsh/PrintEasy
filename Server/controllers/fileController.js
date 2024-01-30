const File=require('../models/file')
const archiver=require('archiver')
const fs=require('fs')
const User=require('../models/user');
const { PassThrough } = require('stream');

module.exports.send = (req, res) => {
    console.log(req.body);
        File.create({
            files: req.files,
            user: req.body.user?req.body.user:undefined
        })
        .then((file) => {
            console.log("Files are",file.user);
            if(file.user!=undefined){
                User.findByIdAndUpdate(file.user.toString(),{ $push : {fileSent: file}})
                .then((updatedUser)=>{
                    console.log("New user is: ",updatedUser)
                })
                .catch((err)=>{
                    console.log("Error in updating user",err);
                })
            }
            return res.json({
                text: "Files uploaded",
                file: file
            });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({
                error: "Error in uploading"
            });
        });
};

module.exports.receive=(req,res)=>{
    try{
        const base64Token = req.body.token;
        if (!base64Token || typeof base64Token !== 'string') {
            throw new Error('Invalid or missing token');
        }
        const binaryData = Buffer.from(base64Token, 'base64');
        const token = binaryData.toString('hex');
        console.log(req.body);
    
        File.findById(token)
        .then((filesFound)=>{
            if(filesFound){
                // console.log("Yeh kaha aagaya")
                if(req.body.user){
                    let userId=req.body.user.toString();
                    User.findById(userId)
                        .then((user) => {
                            if (user && !user.fileReceived.includes(token)) {
                                // If fileId not already in the array, push it
                                User.findByIdAndUpdate(userId, { $push: { fileReceived: token } })
                                    .then((updatedUser) => {
                                        // console.log("Updated User Is: ", updatedUser);rsrs
                                    })
                                    .catch((err) => {
                                        console.log("Error in updating user: ", err);
                                    });
                            }
                            else{
                                console.log("File Already exists");
                            }
                        })
                        .catch((err) => {
                            console.log("Error in finding user: ", err);
                        });
                }
                return res.json({
                    files:filesFound,
                    text:"Files fetched"
                })
            }
            else{   
                return res.json({text:"Incorrect token"});
            }
        })
        .catch((err)=>{
            console.log(err);
            return res.json({text:"Incorrect token"});
        })
    }
    catch(err){
        return res.json({text:err.message})
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
            // Append each file to the archive using its path on the server
            archive.append(fs.createReadStream(file.path), { name: file.originalname });
        }

        archive.finalize();

        archive.on('error', (err) => {
            console.error(err);
            res.status(500).json({ text: 'Error processing files', error: err.message });
        });

        archive.on('finish', () => {
            // Ensure that only binary data is sent, not JSON
            res.end();
        });
    } catch (err) {
        console.error(err);
        return res.json({ text: 'Error processing request', error: err.message });
    }
};

// module.exports.download = async (req, res) => {
//     try {
//         const archive = archiver('zip', {
//             zlib: { level: 9 }
//         });
//         res.setHeader('Content-Disposition', `attachment; filename="download.zip"`);
//         res.setHeader('Content-Type', 'application/zip');
//         archive.pipe(res);

//         for (const file of req.body.files) {
//             // Directly append the file buffer to the archive
//             archive.append(file.buffer, { name: file.originalname });
//         }

//         archive.finalize();
//         archive.on('error', (err) => {
//             console.error(err);
//             res.status(500).json({ text: "Error processing files", error: err.message });
//         });
//         archive.on('close', () => {
//             // Ensure that only binary data is sent, not JSON
//             res.end();
//         });
//     } catch (err) {
//         console.error(err);
//         return res.json({ text: "Error processing request", error: err.message });
//     }
// };
