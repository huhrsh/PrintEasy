const Shop=require('../models/shop')
const Print=require('../models/print')
const User=require('../models/user')
const index=require('../WebSocket')
const archiver=require('archiver')
const fs=require('fs')
const path=require('path')

const notifyUser=index.notifyUser
const notifyShop=index.notifyShop

module.exports.newPrint=(req,res)=>{
    // console.log(req.body);
    // console.log("New Print: ",req.body);   
    // console.log("New Shop: ",req.shop);   
    // console.log("Files are: ",req.files);
    // console.log("User is: ",req.body);
    const shopId=req.body.shop;
    const fileInfo = JSON.parse(req.body.fileInfo);
    // console.log(fileInfo);
    Shop.findById(shopId)
    .then((shopFound)=>{
        // console.log(shopFound);
        const token=shopFound.tokenNumber
        Print.create({
            files:req.files,
            user:req.body.user,
            shop:shopFound,
            tokenNumber:req.body.priority==='true'?-1:token+1,
            priority:req.body.priority,
            totalPrice:req.body.totalPrice,
            active:true,
            fileInfo:fileInfo
            // fileInfo:req.body.fileInfo
        })
        .then((newPrint)=>{
            // console.log(req.body.user)
            // console.log("The new print object created is: ",newPrint);
            User.findOneAndUpdate({_id:req.body.user},{ $push: {activePrints: newPrint } },{ new: true })
            .then((userFound)=>{
                // console.log("User found",userFound.fileInfo);
                // console.log("User has been updated: ",userFound.activePrints);
            })
            .catch((err)=>{
                console.log("Error in finding user");
            })
            if(newPrint.priority){
                shopFound.currentPriorityOrders.push(newPrint);
            }
            else{
                shopFound.tokenNumber=token+1;
                shopFound.currentOrders.push(newPrint);
            }
            shopFound.save();
            notifyShop(shopId, newPrint._id, newPrint.priority);
            if(newPrint.priority){
                res.json({tokenNumber:-1,text:"Order placed successfully", print: newPrint._id})
            }
            else{
                res.json({tokenNumber:token+1,text:"Order placed successfully", print: newPrint._id})
            }
        })
        .catch((err)=>{
            console.log(err);
            res.json({message:"Error in sending order"})
        })
    })
    .catch((err)=>{
        console.log("Error in finding shop");
        res.json({message:"Error in finding shop"})
    })
}

module.exports.getPrintInfo=(req,res)=>{
    // console.log(req.body);
    Print.findById(req.body.id)
    .populate('user') 
    .populate('shop')
    .then((print)=>{
        res.json(print);
    })
    .catch((err)=>{
        res.json({message:"Error in fetching printed file"})
    })
}

module.exports.download = async (req, res) => {
    console.log("Inside print download")
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


module.exports.singleDownload=async (req, res) => {
    try {
        const { file } = req.body;
        // console.log(file);
        const filePath=file.path;

        if (fs.existsSync(filePath)) {
            res.download(filePath, file.originalname, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ text: 'Error downloading file', error: err.message });
                }
            });
        } else {
            res.status(404).json({ text: 'File not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ text: 'Error processing request', error: err.message });
    }
}

module.exports.orderCompleted=(req,res)=>{
    Print.findByIdAndUpdate(req.body.print, {active:false})
    .then((print)=>{
        console.log(print);
        // print.save()
        User.findById(print.user.toString())
        .then((userFound)=>{
            let tempArr=userFound.activePrints.filter(item => item._id.toString() !== print._id.toString());
            userFound.activePrints=tempArr;
            userFound.filePrinted.push(print)
            notifyUser(userFound._id.toString(), print)
            userFound.save();
        })
        .catch((err)=>{
            console.log("Error in completing order, finding user",err);
            return res.json({message:"Error occured in completing order"});
        })
        
        Shop.findById(print.shop.toString())
            .then((shopFound)=>{
                shopFound.currentToken=shopFound.currentToken+1;
                if(print.priority){
                    let tempShop=shopFound.currentPriorityOrders.filter(item => item._id.toString() !== print._id.toString())
                    shopFound.currentPriorityOrders=tempShop;
                }
                else{
                    let tempShop=shopFound.currentOrders.filter(item => item._id.toString() !== print._id.toString())
                    shopFound.currentOrders=tempShop;
                }
                shopFound.totalOrders.push(print);
                shopFound.save()
                // notify user about order completion 
                // notify each shop about token updation 
                res.json({success:"Successful"})
            })
            .catch((err)=>{
                console.log("Error in completing order, finding user",err);
                return res.json({message:"Error occured in completing order"});
            })
    })
    .catch((err)=>{
        console.log("Error in completing order, finding user",err);
        return res.json({message:"Error occured in completing order"});
    })
}