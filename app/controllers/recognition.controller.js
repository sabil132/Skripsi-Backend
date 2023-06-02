const faceapi = require("face-api.js");
const canvas = require("canvas");
const fs = require("fs");
const jimp = require("jimp");

const responseFormatter = require("../helpers/responseFormatter");
const { Employee } = require("../models");

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

class RecognitionController {
  static faceMatcher = async (req, res) => {
    try {
      await faceapi.nets.ssdMobilenetv1.loadFromDisk("public/models");
      await faceapi.nets.faceLandmark68Net.loadFromDisk("public/models");
      await faceapi.nets.faceRecognitionNet.loadFromDisk("public/models");

      const { id } = req.params;
      const employee = await Employee.findByPk(id, {
        attributes: ["photo"],
      });

      if (!employee) {
        return res.status(404).json(responseFormatter.error(null, "Employee not found", res.statusCode));
      }
      
      const image = await canvas.loadImage(employee.photo);
      const singleResult = await faceapi
      .detectSingleFace(image)
      .withFaceLandmarks()
      .withFaceDescriptor();
      
      
      if(!singleResult) {
        return res.status(404).json(responseFormatter.success({score: "1"}, "Your face not match", res.statusCode));
      }
      
      const faceMatcher = new faceapi.FaceMatcher(singleResult);
      
      const image2 = await canvas.loadImage(req.file.path);
      const detections = await faceapi
        .detectAllFaces(image2)
        .withFaceLandmarks()
        .withFaceDescriptors()

        
      if(detections.length < 1) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            return err
          }
        });

        return res.status(404).json(responseFormatter.success({score: "1"}, "Face not detected", res.statusCode));
      }

      const bestMatch = detections.map((d) => faceMatcher.findBestMatch(d.descriptor))[0];
      
      if(bestMatch !== null ) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            return err
          }
        });

        const percentage = ((1 - bestMatch._distance) * 100).toFixed(0);

        if(bestMatch._distance > 0.5) {
          return res.status(404).json(responseFormatter.success({score: percentage}, "Your face not match", res.statusCode));
        }

        return res.status(200).json(responseFormatter.success({score: percentage}, "Yout face match", res.statusCode));
      }

      fs.unlink(req.file.path, (err) => {
        if (err) {
          return err
        }
      });

      return res.status(404).json(responseFormatter.success({score: "1"}, "Face not detected", res.statusCode));
    } catch (error) {
      console.log(error);
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }
}

module.exports = RecognitionController;