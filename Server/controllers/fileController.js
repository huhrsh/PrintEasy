const File=require('../models/file')
const archiver=require('archiver')
const { PassThrough } = require('stream');

module.exports.send = (req, res) => {
        File.create({
            files: req.files,
            user: req.user?req.user.id:undefined
        })
        .then((file) => {
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
    
        File.findById(token)
        .then((filesFound)=>{
            if(filesFound){
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
                zlib: { level: 9 }
            });
            res.setHeader('Content-Disposition', `attachment; filename="download.zip"`);
            res.setHeader('Content-Type', 'application/zip');
            archive.pipe(res);
            for (const file of req.body.files) {
                const stream = new PassThrough();
                stream.end(file.buffer);
                archive.append(stream, { name: file.originalname });
            }
            archive.finalize();
            archive.on('error', (err) => {
                console.error(err);
                res.status(500).json({ text: "Error processing files", error: err.message });
            });
            archive.on('close', () => {
                // Ensure that only binary data is sent, not JSON
                res.end();
            });
    } catch (err) {
        console.error(err);
        return res.json({ text: "Error processing request", error: err.message });
    }
};
