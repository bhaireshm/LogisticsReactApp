const express = require("express");
const router = express.Router(); 
const verify = require("./verifyToken"); 
const Packagetotaltype = require("../models/Packagetotaltype");

router.get("/", verify, async (req, res) => {
  try {
    const Packagetotaltypes = await Packagetotaltype.find();
    res.json(Packagetotaltypes);
  } catch (ex) {
    res.status(400).json({ message: ex.message });
  }
});

router.get("/:id", verify, async (req, res) => {
  try {
    const packagetotaltype = await Packagetotaltype.findById(req.params.id);
    res.json({
        _id: packagetotaltype._id,
        id: packagetotaltype.id,
        packageTypeCode: packagetotaltype.packageTypeCode,
        totalPackageQuantity: packagetotaltype.totalPackageQuantity,
        totalGrossVolume: packagetotaltype.totalGrossVolume,
        totalGrossWeight: packagetotaltype.totalGrossWeight,
        returnablePackaging: packagetotaltype.returnablePackaging,
        totalGrossVolumeId: packagetotaltype.totalGrossVolume.Id,
        totalGrossWeightId: packagetotaltype.totalGrossWeight.Id,
        returnablePackagingId: packagetotaltype.returnablePackaging.Id,
        packageTypeCodeId: packagetotaltype.packageTypeCode.Id,
        createdAt: packagetotaltype.createdAt
    });
  } catch (ex) {
    res.status(400).json({ message: ex.message });
  }
});

router.post("/", verify, async (req, res) => {
  try {
    const totalgrossvolumes = await Measurementtype.findById(req.body.totalGrossVolumeId);
    const totalgrossweights = await Measurementtype.findById(req.body.totalGrossWeightId);
    const returnablepackagings = await Returnablepackagingtype.findById(req.body.returnablePackagingId);
    const packagetypecodes = await Enumerationlibrary.findById(req.body.packageTypeCodeId);
    const packagetotaltype = new Packagetotaltype ({
        id: req.body.id,
        packageTypeCode: req.body.packageTypeCode,
        totalPackageQuantity: req.body.totalPackageQuantity,
        totalGrossVolume: req.body.totalGrossVolume,
        totalGrossWeight: req.body.totalGrossWeight,
        returnablePackaging: req.body.returnablePackaging,
        totalGrossVolume: [{
          Id: totalgrossvolumes._id,
          Name: totalgrossvolumes.id
        }],
        totalGrossWeight: [{
          Id: totalgrossweights._id,
          Name: totalgrossweights.id
        }],
        returnablePackaging: [{
          Id: returnablepackagings._id,
          Name: returnablepackagings.id
        }],
        packageTypeCode: [{
          Id: packagetypecodes._id,
          Name: packagetypecodes.id
        }],
    });
    const savedPackagetotaltype = await packagetotaltype.save();
    res.status(200).json(savedPackagetotaltype);
  } catch (ex) {
    res.status(400).json({ message: ex.message });
  }
});

router.delete("/:id", verify, async (req, res) => {
  try {
    const removedPackagetotaltype = await Packagetotaltype.remove({ _id: req.params.id });
    res.json(removedPackagetotaltype);
  } catch (ex) {
    res.status(400).json({ message: ex.message });
  }
});

router.put("/:id", verify, async (req, res) => {
  try {
    const totalgrossvolume = await Measurementtype.findById(req.body.totalGrossVolumeId);
    const returnablepackaging = await Returnablepackagingtype.findById(req.body.returnablePackagingId);
    const packagetypecode = await Enumerationlibrary.findById(req.body.packageTypeCodeId);
    const updatedPackagetotaltype = await Packagetotaltype.updateOne(
      { _id: req.params.id },
      {
        $set:{
             id: req.body.id,
             packageTypeCode: req.body.packageTypeCode,
             totalPackageQuantity: req.body.totalPackageQuantity,
             totalGrossVolume: req.body.totalGrossVolume,
             totalGrossWeight: req.body.totalGrossWeight,
             returnablePackaging: req.body.returnablePackaging,
             packageTypeCode: {
              Id: req.body.packagetypecode.id,
              Name: req.body.packagetypecode.id
             },
             packageTypeCode: {
              Id: req.body.packagetypecode.id,
              Name: req.body.packagetypecode.id
             },
             packageTypeCode: {
              Id: req.body.packagetypecode.id,
              Name: req.body.packagetypecode.id
             },
             packageTypeCode: {
              Id: req.body.packagetypecode.id,
              Name: req.body.packagetypecode.id
             },

        }
      }
    );
    res.json(updatedPackagetotaltype);
  } catch (ex) {
    res.status(400).json({ message: ex.message });
  }
});

module.exports = router;