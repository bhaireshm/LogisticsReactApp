const express = require("express");
const router = express.Router();
const verify = require("./verifyToken");
const Transportcapacitybooking = require("../models/Transportcapacitybooking");
const Transportcapacitybookingspacerequirement = require("../models/Transportcapacitybookingspacerequirement");
const Transportcapacitybookingtransportmovementtype = require("../models/Transportcapacitybookingtransportmovementtype");
const Incotermscode = require("../models/Incotermscode");
const Transportservicecategorycode = require("../models/Transportservicecategorycode");
const Transportserviceconditiontypecode = require("../models/Transportserviceconditiontypecode");
const Transportservicelevelcode = require("../models/Transportservicelevelcode");
const Transportcargocharacteristicstype = require("../models/Transportcargocharacteristicstype");
const Packagetotaltype = require("../models/Packagetotaltype");
const Logisticlocationtype = require("../models/Logisticlocationtype");
const Logisticeventdatetime = require("../models/Logisticeventdatetime");
const Logisticeventperiod = require("../models/Logisticeventperiod");
const Contacttype = require("../models/Contacttype");

router.get("/", verify, async (req, res) => {
  try {
    const Transportcapacitybookings = await Transportcapacitybooking.find()
      .populate(
        "transportCapacityBookingSpaceRequirements.Transportcargocharacteristicstypes"
      )
      .populate("transportCapacityBookingSpaceRequirements.Packagetotaltypes")
      .populate("plannedPickUp.Logisticlocation")
      .populate("plannedPickUp.LogisticEventDateTime")
      .populate("plannedPickUp.LogisticEventPeriod")
      .populate("plannedDropOff.Logisticlocation")
      .populate("plannedDropOff.LogisticEventDateTime")
      .populate("plannedDropOff.LogisticEventPeriod")
      .exec((e, r) => {
        if (e) return res.status(400).send(e);
        res.send(r);
      });
  } catch (ex) {
    res.status(400).json({
      message: ex.message,
    });
  }
});

router.get("/:id", verify, async (req, res) => {
  try {
    const startDate = req.query.fromdate
      ? new Date(Number(req.query.fromdate))
      : false;
    const endDate = req.query.todate
      ? new Date(Number(req.query.todate))
      : false;
    let transportcapacitybookings;

    console.log(startDate, endDate);

    if (req.params.id != "false" && !startDate && !endDate) {
      transportcapacitybookings = await Transportcapacitybooking.findOne({
        bookingId: req.params.id,
      })
        .populate(
          "transportCapacityBookingSpaceRequirements.Transportcargocharacteristicstypes"
        )
        .populate("transportCapacityBookingSpaceRequirements.Packagetotaltypes")
        .populate("plannedPickUp.Logisticlocation")
        .populate("plannedPickUp.LogisticEventDateTime")
        .populate("plannedPickUp.LogisticEventPeriod")
        .populate("plannedDropOff.Logisticlocation")
        .populate("plannedDropOff.LogisticEventDateTime")
        .populate("plannedDropOff.LogisticEventPeriod")
        .exec(async (e, r) => {
          if (e) return res.status(400).send(e);
          console.log(r);
          const contact = await Contacttype.findById(
            r.plannedPickUp.Logisticlocation.contact
          );
          console.log(contact);
          r.plannedPickUp.Logisticlocation.contact = contact;
          const data = [];
          data.push(r);
          res.send(data);
        });
    }

    if (startDate && endDate) {
      transportcapacitybookings = await Transportcapacitybooking.find()
        .populate(
          "transportCapacityBookingSpaceRequirements.Transportcargocharacteristicstypes"
        )
        .populate("transportCapacityBookingSpaceRequirements.Packagetotaltypes")
        .populate("plannedPickUp.Logisticlocation")
        .populate("plannedPickUp.LogisticEventDateTime")
        .populate("plannedPickUp.LogisticEventPeriod")
        .populate("plannedDropOff.Logisticlocation")
        .populate("plannedDropOff.LogisticEventDateTime")
        .populate("plannedDropOff.LogisticEventPeriod")
        .where({
          "plannedPickUp.LogisticEventDateTime.date": {
            $gte: startDate,
            $lte: endDate,
          },
        })
        .exec(async (e, r) => {
          if (e) return res.status(400).send(e);
          console.log(r);
          const contact = await Contacttype.findById(
            r.plannedPickUp.Logisticlocation.contact
          );
          console.log(contact);
          r.plannedPickUp.Logisticlocation.contact = contact;
          const data = [];
          data.push(r);
          res.send(data);
        });
    }

    if (transportcapacitybookings && transportcapacitybookings.length === 0)
      return res.json({
        message: "No data found",
      });
  } catch (ex) {
    res.status(400).json({
      message: ex.message,
    });
  }
});

router.post("/", verify, async (req, res) => {
  try {
    const ServiceDetailsData = req.body.ServiceDetailsData;
    const PickUpLocationData = req.body.PickUpLocationData;
    const PickUpTime = req.body.PickUpTime;
    const DropOffLocation = req.body.DropOffLocation;
    const DropOffTime = req.body.DropOffTime;
    const SpaceRequirements = req.body.SpaceRequirements;

    const transportservicecategorycodes = new Transportservicecategorycode({
      codeListVersion: ServiceDetailsData.servicecategory,
    });
    const savedTransportservicecategorycode = await transportservicecategorycodes.save();

    const transportserviceconditiontypecodes = new Transportserviceconditiontypecode(
      {
        codeListVersion: ServiceDetailsData.serviceConditionType,
      }
    );
    const savedTransportserviceconditiontypecode = await transportserviceconditiontypecodes.save();

    const transportservicelevelcodes = new Transportservicelevelcode({
      codeListVersion: ServiceDetailsData.serviceLevel,
    });
    const savedTransportservicelevelcode = await transportservicelevelcodes.save();

    // const logisticservicesbuyers = await Logisticservicesbuyer.findById(req.body.logisticServicesBuyerId);
    // const logisticservicessellers = await Logisticservicesseller.findById(req.body.logisticServicesSellerId);
    
    const transportcargocharacteristicstypes = await saveTransportcargocharacteristicstype(SpaceRequirements);
    // Transportcargocharacteristicstype.findById(
    //   SpaceRequirements.cargoType
    // );

    const packagetotaltypes = await savePackagetotaltype(SpaceRequirements);
    // Packagetotaltype.findById(
    //   SpaceRequirements.packageTypeCode
    // );

    const plannedPickUplogisticlocationtypes = await saveLogisticlocationtype(PickUpLocationData);
    // Logisticlocationtype.findById(
    //   PickUpLocationData.AdditionalLocationIdentification
    // );

    // const plannedPickUplogisticeventdatetimes = new Logisticeventdatetime ({
    //     date: req.body.date,
    //     time: req.body.time,
    // });
    // const savedLogisticeventdatetime = await logisticeventdatetime.save();
    // const plannedPickUplogisticeventdatetimes = await Logisticeventdatetime.findById(
    //   PickUpTime.pickupStartTime
    // );

    const plannedPickUplogisticeventperiods = new Logisticeventperiod ({
        beginDate: PickUpTime.pickupStartDate,
        beginTime: PickUpTime.pickupStartTime,
        endDate: PickUpTime.pickupEndDate,
        endTime: PickUpTime.pickupEndTime,
    });
    const savedLogisticeventperiod = await plannedPickUplogisticeventperiods.save();
    // const plannedPickUplogisticeventperiods = await Logisticeventperiod.findById(
    //   PickUpTime.plannedPickUpLogisticEventPeriodId
    // );

    const plannedDropOfflogisticlocationtypes = await saveLogisticlocationtype(DropOffLocation)//send payload
    // const plannedDropOfflogisticlocationtypes = await Logisticlocationtype.findById(
    //   DropOffLocation.plannedDropOffLogisticLocationTypeId
    // );

    // const plannedDropOfflogisticeventdatetimes = new Logisticeventdatetime ({
    //     date: req.body.date,
    //     time: req.body.time,
    // });
    // const savedPlannedDropOffLogisticeventdatetime = await plannedDropOfflogisticeventdatetimes.save();
    // const plannedDropOfflogisticeventdatetimes = await Logisticeventdatetime.findById(
    //   DropOffTime.plannedDropOffLogisticEventDateTimeId
    // );

    const plannedDropOfflogisticeventperiods = new Logisticeventperiod ({
        beginDate: DropOffTime.dropOffStartDate,
        beginTime: DropOffTime.dropOffStartTime,
        endDate: DropOffTime.dropOffEndDate,
        endTime: DropOffTime.dropOffEndTime,
    });
    const savedPlannedDropOffLogisticeventperiod = await plannedDropOfflogisticeventperiods.save();
    // const plannedDropOfflogisticeventperiods = await Logisticeventperiod.findById(
    //   DropOffTime.plannedDropOffLogisticEventPeriodId
    // );

    // Transportcapacitybooking.pre('save', function(next) {
    //     var doc = this;
    //     counter.findByIdAndUpdate({_id: 'entityId'}, {$inc: { seq: 1} }, function(error, counter)   {
    //         if(error)
    //             return next(error);
    //         doc.testvalue = counter.seq;
    //         next();
    //     });
    // });

    const transportcapacitybooking = new Transportcapacitybooking({
      bookingId: getRandomNumber(),

      transportCapacityBookingSpaceRequirements: {
        Transportcargocharacteristicstypes:
          transportcargocharacteristicstypes._id,
        Packagetotaltypes: packagetotaltypes._id,
      },
      plannedPickUp: {
        Logisticlocation: plannedPickUplogisticlocationtypes._id,
        // LogisticEventDateTime: plannedPickUplogisticeventdatetimes._id,
        LogisticEventPeriod: savedLogisticeventperiod._id,
      },
      plannedDropOff: {
        Logisticlocation: plannedDropOfflogisticlocationtypes._id,
        // LogisticEventDateTime: plannedDropOfflogisticeventdatetimes._id,
        LogisticEventPeriod: savedPlannedDropOffLogisticeventperiod._id,
      },
      transportServiceCategoryCode: {
        Id: savedTransportservicecategorycode._id,
        Name: savedTransportservicecategorycode.codeListVersion,
      },
      transportServiceConditionTypeCode: {
        Id: savedTransportserviceconditiontypecode._id,
        Name: savedTransportserviceconditiontypecode.codeListVersion,
      },
      transportServiceLevelCode: {
        Id: savedTransportservicelevelcode._id,
        Name: savedTransportservicelevelcode.codeListVersion,
      },
      logisticServicesBuyer: {
        Id: 78767,
        Name: "First name",
      },
      logisticServicesSeller: {
        Id: 9865,
        Name: "Last name",
      },
    });
    const savedTransportcapacitybooking = await transportcapacitybooking.save();
    res.status(200).json(savedTransportcapacitybooking);
  } catch (ex) {
    console.log(ex);
    res.status(400).json({
      message: ex.message
    });
  }
});

router.delete("/:id", verify, async (req, res) => {
  try {
    const removedTransportcapacitybooking = await Transportcapacitybooking.deleteOne(
      {
        _id: req.params.id,
      }
    );
    res.json(removedTransportcapacitybooking);
  } catch (ex) {
    res.status(400).json({
      message: ex.message,
    });
  }
});

router.put("/:id", verify, async (req, res) => {
  try {
    const transportcapacitybookingspacerequirements = await Transportcapacitybookingspacerequirement.findById(
      req.body.transportCapacityBookingSpaceRequirementsId
    );
    const transportcapacitybookingtransportmovement = await Transportcapacitybookingtransportmovementtype.findById(
      req.body.transportCapacityBookingTransportMovementId
    );
    const avplist = await Ecomstringattributevaluepairlist.findById(
      req.body.avpListId
    );
    const documentstatuscode = await Enumerationlibrary.findById(
      req.body.documentStatusCodeId
    );
    const deliveryterms = await Incotermscode.findById(
      req.body.deliveryTermsId
    );
    const updatedTransportcapacitybooking = await Transportcapacitybooking.updateOne(
      {
        id: req.params.id,
      },
      {
        $set: {
          id: req.body.id,
          creationDateTime: req.body.creationDateTime,
          documentStatusCode: req.body.documentStatusCode,
          documentActionCode: req.body.documentActionCode,
          documentStructureVersion: req.body.documentStructureVersion,
          lastUpdateDateTime: req.body.lastUpdateDateTime,
          revisionNumber: req.body.revisionNumber,
          extension: req.body.extension,
          documentEffectiveDate: req.body.documentEffectiveDate,
          avpList: req.body.avpList,
          transportCapacityBookingIdentification:
            req.body.transportCapacityBookingIdentification,
          transportServiceCategoryCode: req.body.transportServiceCategoryCode,
          transportServiceConditionTypeCode:
            req.body.transportServiceConditionTypeCode,
          transportServiceLevelCode: req.body.transportServiceLevelCode,
          logisticServicesBuyer: req.body.logisticServicesBuyer,
          logisticServicesSeller: req.body.logisticServicesSeller,
          pickUpParty: req.body.pickUpParty,
          dropOffParty: req.body.dropOffParty,
          plannedPickUp: req.body.plannedPickUp,
          plannedDropOff: req.body.plannedDropOff,
          transportReference: req.body.transportReference,
          deliveryTerms: req.body.deliveryTerms,
          handlingInstruction: req.body.handlingInstruction,
          transportCapacityBookingSpaceRequirements:
            req.body.transportCapacityBookingSpaceRequirements,
          transportCapacityBookingTransportMovement:
            req.body.transportCapacityBookingTransportMovement,
          deliveryTerms: {
            Id: req.body.deliveryterms.id,
            Name: req.body.deliveryterms.id,
          },
          deliveryTerms: {
            Id: req.body.deliveryterms.id,
            Name: req.body.deliveryterms.id,
          },
          deliveryTerms: {
            Id: req.body.deliveryterms.id,
            Name: req.body.deliveryterms.qualifierCodeName,
          },
          deliveryTerms: {
            Id: req.body.deliveryterms.id,
            Name: req.body.deliveryterms.id,
          },
          deliveryTerms: {
            Id: req.body.deliveryterms.id,
            Name: req.body.deliveryterms.id,
          },
          deliveryTerms: {
            Id: req.body.deliveryterms.id,
            Name: req.body.deliveryterms.id,
          },
          deliveryTerms: {
            Id: req.body.deliveryterms.id,
            Name: req.body.deliveryterms.id,
          },
          deliveryTerms: {
            Id: req.body.deliveryterms.id,
            Name: req.body.deliveryterms.id,
          },
          deliveryTerms: {
            Id: req.body.deliveryterms.id,
            Name: req.body.deliveryterms.id,
          },
          deliveryTerms: {
            Id: req.body.deliveryterms.id,
            Name: req.body.deliveryterms.id,
          },
          deliveryTerms: {
            Id: req.body.deliveryterms.id,
            Name: req.body.deliveryterms.id,
          },
          deliveryTerms: {
            Id: req.body.deliveryterms.id,
            Name: req.body.deliveryterms.id,
          },
          deliveryTerms: {
            Id: req.body.deliveryterms.id,
            Name: req.body.deliveryterms.id,
          },
          deliveryTerms: {
            Id: req.body.deliveryterms.id,
            Name: req.body.deliveryterms.id,
          },
          deliveryTerms: {
            Id: req.body.deliveryterms.id,
            Name: req.body.deliveryterms.id,
          },
          deliveryTerms: {
            Id: req.body.deliveryterms.id,
            Name: req.body.deliveryterms.id,
          },
          deliveryTerms: {
            Id: req.body.deliveryterms.id,
            Name: req.body.deliveryterms.id,
          },
          deliveryTerms: {
            Id: req.body.deliveryterms.id,
            Name: req.body.deliveryterms.codeListVersion,
          },
        },
      }
    );
    res.json(updatedTransportcapacitybooking);
  } catch (ex) {
    res.status(400).json({
      message: ex.message,
    });
  }
});

function checkError(obj){}

async function saveTransportcargocharacteristicstype(body) {
  const Cargotypecode = require("../models/Cargotypecode");
  const Harmonizedsystemcode = require("../models/Harmonizedsystemcode");
  const Cargotypedescription = require("../models/Cargotypedescription");
  const Countryoforigincode = require("../models/Countryoforigincode");
  const Finaldestinationcountry = require("../models/Finaldestinationcountry");

  const cargotypecodes = await Cargotypecode.findById(body.cargoTypeCode);
  const harmonizedsystemcodes = await Harmonizedsystemcode.findById(
    body.harmonizedSystemCode
  );
  const cargotypedescription = await Cargotypedescription.findById(
    body.cargoTypeDescriptionCode
  );
  const countryoforigincodes = await Countryoforigincode.findById(
    body.countryOfOriginCode
  );
  const finaldestinationcountrys = await Finaldestinationcountry.findById(
    body.finalDestinationCountryCode
  );

  const transportcargocharacteristicstype = new Transportcargocharacteristicstype(
    {
      cargoTypeCode: {
        Id: cargotypecodes._id,
        Name: cargotypecodes.codeListVersion,
      },
      harmonizedSystemCode: {
        Id: harmonizedsystemcodes._id,
        Name: harmonizedsystemcodes.codeListVersion,
      },
      cargoTypeDescription: {
        Id: cargotypedescription._id,
        Name: cargotypedescription.codeListVersion,
      },
      countryOfOriginCode: {
        Id: countryoforigincodes._id,
        Name: countryoforigincodes.codeListVersion,
      },
      finalDestinationCountry: {
        Id: finaldestinationcountrys._id,
        Name: finaldestinationcountrys.codeListVersion,
      },
      totalGrossVolume: {
        Value: body.totalGrossVolume,
        Measurementtype: body.totalGrossVolumeUnits,
      },
      totalGrossWeight: {
        Value: body.totalGrossWeight,
        Measurementtype: body.totalGrossWeightUnits,
      },
      totalTransportNetWeight: {
        Value: body.totalTransportNetWeight,
        Measurementtype: body.totalTransportNetWeightUnits,
      },
      totalChargeableWeight: {
        Value: body.totalChargeableWeight,
        Measurementtype: body.totalChargeableWeightUnits,
      },
      declaredWeightForCustoms: {
        Value: body.declaredWeightForCustoms,
        Measurementtype: body.declaredWeightForCustomsUnits,
      },
      totalLoadingLength: {
        Value: body.totalLoadingLength,
        Measurementtype: body.totalLoadingLengthUnits,
      },
      associatedInvoiceAmount: {
        Value: body.totalGrossWeight,
        Measurementtype: body.totalGrossWeightUnits,
      },
      declaredValueForCustoms: {
        Value: body.associatedInvoiceAmount,
        Measurementtype: body.associatedInvoiceAmountUnits,
      },
      totalPackageQuantity: {
        Value: body.totalPackageQuantity,
        Measurementtype: body.totalPackageQuantityUnits,
      },
      totalItemQuantity: {
        Value: body.totalItemQuantity,
        Measurementtype: body.totalItemQuantityUnits,
      },
    }
  );
  return await transportcargocharacteristicstype.save();
}

async function savePackagetotaltype(body){
  const Packagetotaltype = require("../models/Packagetotaltype");
  const Packagetypecode = require("../models/Packagetypecode");
  
  const packagetypecodes = await Packagetypecode.findById(body.packageTypeCode);

    const packagetotaltype = new Packagetotaltype({
      totalPackageQuantity: body.totalPackageQuantityPT,
      totalGrossVolume: {
        Value: body.totalGrossVolumePT,
        Measurementtype: body.totalGrossVolumePTUnits
      },
      totalGrossWeight: {
        Value: body.totalGrossWeightPT,
        Measurementtype: body.totalGrossWeightPTUnits
      },
      packageTypeCode: {
        Id: packagetypecodes._id,
        Name: packagetypecodes.codeListVersion
      },
    });
    return await packagetotaltype.save();
}

async function saveLogisticlocationtype(body){
    const Logisticlocationtype = require("../models/Logisticlocationtype");
    const Operatinghourstype= require("../models/Operatinghourstype");
    const Specialoperatinghourstype= require("../models/Specialoperatinghourstype");
    const Countrycode = require("../models/Countrycode");
    const Currencyofpartycode = require("../models/Currencyofpartycode");
    const Languageofthepartycode = require("../models/Languageofthepartycode");
    const Contacttype = require("../models/Contacttype");
    const Description200type = require("../models/Description200type");
    const Identifiertype = require("../models/Identifiertype");

    const locationspecificinstructions = await Description200type.findById(body.locationSpecificInstructionsCode);
    const additionallocationidentifications = await Identifiertype.findById(body.additionalLocationIdentificationCode);
    const countrycodes = await Countrycode.findById(body.countryCode);
    const currencyofpartycodes = await Currencyofpartycode.findById(body.currencyOfPartyCode);
    const languageofthepartycodes = await Languageofthepartycode.findById(body.languageOfthePartyCode);
    const contacttypes = await Contacttype.findById(body.contactTypeCode);

    const logisticlocationtype = new Logisticlocationtype ({
        unLocationCode: body.unLocationCode,
        sublocationIdentification: body.sublocationIdentification,
        locationName: body.locationName,
        utcOffset: body.utcOffset,
        locationSpecificInstructions: {
          Id: locationspecificinstructions._id,
          Name: locationspecificinstructions.codeListVersion
        },
        additionalLocationIdentification: {
          Id: additionallocationidentifications._id,
          Name: additionallocationidentifications.identificationSchemeName
        },
        contact: contacttypes._id,
        cityCode: body.cityCode,
        countryCode: {
          Id: countrycodes._id,
          Name: countrycodes.codeListVersion
        },
        currencyOfParty: {
          Id: currencyofpartycodes._id,
          Name: currencyofpartycodes.codeListVersion
        },
        languageOfTheParty: {
          Id: languageofthepartycodes._id,
          Name: languageofthepartycodes.codeListVersion
        },
        countyCode: body.countyCode,
        crossStreet: body.crossStreet,
        name: body.name,
        pOBoxNumber: body.postBoxNumber,
        postalCode: body.postalCode,
        provinceCode: body.province,
        state: body.state,
        streetAddressOne: body.streetAddressOne,
        streetAddressTwo: body.streetAddressTwo,
        streetAddressThree: body.streetAddressThree,
        latitude: body.latitude,
        longitude: body.longitude
    });
    return await logisticlocationtype.save();
}

function getRandomNumber(){
  return Number(Math.floor(10000000000000 + Math.random() * 90000000000000).toString().substr(0,13));
}

module.exports = router;
